import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { query } from "./_generated/server";

// ── TDS engine (Apr–Mar Indian financial year) ──────────────────────────────
// Affiliate commissions -> Sec 194H commission/brokerage @2%, ₹20K/yr threshold
// Work payouts          -> Sec 194J professional fees      @10%, ₹50K/yr threshold
// Rates/thresholds are configurable via adminSettings key "tds".

export const TDS_DEFAULTS = {
  enabled: true,
  affiliate: { rate: 2, threshold: 20000, label: "194H" },
  work: { rate: 10, threshold: 50000, label: "194J(b)" },
};

async function getTdsSettings(ctx: any) {
  const rec = await ctx.db
    .query("adminSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "tds"))
    .first();
  const s = rec?.value || {};
  return {
    enabled: s.enabled !== false,
    affiliate: { ...TDS_DEFAULTS.affiliate, ...(s.affiliate || {}) },
    work: { ...TDS_DEFAULTS.work, ...(s.work || {}) },
  };
}

// Financial year window containing `now`. FY 2026-27 => start Apr 1 2026.
function fyWindow(now: number) {
  const d = new Date(now);
  const y = d.getUTCFullYear();
  // Indian FY runs Apr 1 (UTC+5:30; approximate boundary at Mar 31 18:30 UTC)
  const startMs = Date.UTC(y, 3, 1) - 5.5 * 60 * 60 * 1000;
  const isBeforeApril = now < startMs;
  const startYear = isBeforeApril ? y - 1 : y;
  return {
    startYear,
    start: Date.UTC(startYear, 3, 1) - 5.5 * 60 * 60 * 1000,
    end: Date.UTC(startYear + 1, 3, 1) - 5.5 * 60 * 60 * 1000,
    label: `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`,
  };
}

// Core computation shared by preview and request-time deduction.
// Returns null when TDS disabled or nothing taxable.
export async function computeTds(
  ctx: any,
  userId: any,
  amount: number,
  now: number
): Promise<{
  total: number;
  breakdown: {
    affiliateGross: number;
    affiliateTds: number;
    workGross: number;
    workTds: number;
    financialYear: number;
  };
} | null> {
  const cfg = await getTdsSettings(ctx);
  if (!cfg.enabled) return null;

  const fy = fyWindow(now);

  const wallet = await ctx.db
    .query("wallets")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  // Allocate the withdrawal across earning categories proportionally to
  // lifetime composition of the wallet (available balance isn't split).
  let affiliateGross = 0;
  let workGross = amount;
  if (wallet && wallet.totalEarned > 0) {
    const affShare = (wallet.affiliateEarnings || 0) / wallet.totalEarned;
    affiliateGross = Math.round(amount * affShare);
    workGross = amount - affiliateGross;
  }

  // Per-category cumulative PAID in this FY comes from prior withdrawals'
  // stored breakdowns (rejected withdrawals refund fully and are excluded
  // by status filter below).
  const prior = await ctx.db
    .query("withdrawals")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();
  let affPaidBefore = 0;
  let workPaidBefore = 0;
  for (const w of prior) {
    if (!w.tdsBreakdown) continue;
    if (w.status === "rejected") continue;
    if (w.requestedAt < fy.start || w.requestedAt >= fy.end) continue;
    affPaidBefore += w.tdsBreakdown.affiliateGross;
    workPaidBefore += w.tdsBreakdown.workGross;
  }

  const catTaxable = (
    grossNow: number,
    paidBefore: number,
    threshold: number
  ) => Math.min(grossNow, Math.max(0, paidBefore + grossNow - threshold));

  const affiliateTaxable =
    affiliateGross > 0
      ? catTaxable(affiliateGross, affPaidBefore, cfg.affiliate.threshold)
      : 0;
  const workTaxable =
    workGross > 0 ? catTaxable(workGross, workPaidBefore, cfg.work.threshold) : 0;

  const affiliateTds = Math.round((affiliateTaxable * cfg.affiliate.rate) / 100);
  const workTds = Math.round((workTaxable * cfg.work.rate) / 100);
  const total = affiliateTds + workTds;

  return {
    total,
    breakdown: {
      affiliateGross,
      affiliateTds,
      workGross,
      workTds,
      financialYear: fy.startYear,
    },
  };
}

// ── User endpoints ───────────────────────────────────────────────────────────

async function requireUser(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new ConvexError("Unauthorized");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || user.status === "suspended") throw new ConvexError("Unauthorized");
  return user;
}

// Live estimate shown in the withdrawal form before submit
export const previewWithdrawalTds = query({
  args: { token: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token);
    const cfg = await getTdsSettings(ctx);
    if (!cfg.enabled || !(args.amount > 0)) {
      return { enabled: false, total: 0, breakdown: null, config: null };
    }
    const res = await computeTds(ctx, (await sessionUserId(ctx, args.token))!, args.amount, Date.now());
    return {
      enabled: true,
      total: res?.total || 0,
      breakdown: res?.breakdown || null,
      config: { affiliate: cfg.affiliate, work: cfg.work },
    };
  },
});

async function sessionUserId(ctx: any, token: string) {
  const s = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  return s ? s.userId : null;
}

// User's own current-FY tax summary (wallet page card)
export const getMyTaxSummary = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const cfg = await getTdsSettings(ctx);
    const fy = fyWindow(Date.now());

    const rows = await ctx.db
      .query("withdrawals")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();

    let affiliateGross = 0, affiliateTds = 0, workGross = 0, workTds = 0;
    for (const w of rows) {
      if (!w.tdsBreakdown || w.status === "rejected") continue;
      if (w.tdsBreakdown.financialYear !== fy.startYear) continue;
      affiliateGross += w.tdsBreakdown.affiliateGross;
      affiliateTds += w.tdsBreakdown.affiliateTds;
      workGross += w.tdsBreakdown.workGross;
      workTds += w.tdsBreakdown.workTds;
    }

    return {
      fyLabel: fy.label,
      enabled: cfg.enabled,
      affiliate: {
        label: cfg.affiliate.label, rate: cfg.affiliate.rate,
        gross: affiliateGross, tds: affiliateTds,
        threshold: cfg.affiliate.threshold,
      },
      work: {
        label: cfg.work.label, rate: cfg.work.rate,
        gross: workGross, tds: workTds,
        threshold: cfg.work.threshold,
      },
      totalTds: affiliateTds + workTds,
    };
  },
});

// ── Admin endpoints ──────────────────────────────────────────────────────────

async function requireKycAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) throw new ConvexError("Unauthorized");
  const u = await ctx.db.get(session.userId);
  if (!u || !["super_admin", "admin", "finance_admin"].includes(u.role)) {
    throw new ConvexError("Forbidden: Admin privileges required");
  }
  return u;
}

// Config exposed for the admin settings card
export const getTdsConfigAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireKycAdmin(ctx, args.token);
    return await getTdsSettings(ctx);
  },
});

// Per-user FY summary table
export const getTdsSummaryAdmin = query({
  args: { token: v.string(), fyStartYear: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireKycAdmin(ctx, args.token);
    const cfg = await getTdsSettings(ctx);
    const fy = args.fyStartYear ? { startYear: args.fyStartYear } : fyWindow(Date.now());

    const all = await ctx.db.query("withdrawals").collect();
    const inFy = all.filter(
      (w: any) =>
        w.tdsBreakdown &&
        w.status !== "rejected" &&
        w.tdsBreakdown.financialYear === fy.startYear
    );

    const byUser = new Map<string, any>();
    for (const w of inFy) {
      const b = w.tdsBreakdown;
      if (!b) continue;
      const k = String(w.userId);
      if (!byUser.has(k)) {
        byUser.set(k, {
          userId: w.userId,
          affiliateGross: 0, affiliateTds: 0, workGross: 0, workTds: 0,
          count: 0,
        });
      }
      const r = byUser.get(k);
      r.affiliateGross += b.affiliateGross;
      r.affiliateTds += b.affiliateTds;
      r.workGross += b.workGross;
      r.workTds += b.workTds;
      r.count += 1;
    }

    const rows = await Promise.all(
      [...byUser.values()].map(async (r) => {
        const u: any = await ctx.db.get(r.userId);
        const kyc: any = await ctx.db
          .query("kycProfiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", r.userId))
          .first();
        const pan = kyc?.panNumber || "";
        return {
          ...r,
          userName: u?.name || "Deleted user",
          userEmail: u?.email || "",
          panMasked: pan ? `${pan.slice(0, 3)}****${pan.slice(-1)}` : "—",
          totalGross: r.affiliateGross + r.workGross,
          totalTds: r.affiliateTds + r.workTds,
        };
      })
    );
    rows.sort((a: any, b: any) => b.totalTds - a.totalTds);

    // Distinct FYs available (for the selector)
    const fySet = new Set<number>();
    for (const w of all) {
      if (w.tdsBreakdown) fySet.add(w.tdsBreakdown.financialYear);
    }
    if (fySet.size === 0) fySet.add(fyWindow(Date.now()).startYear);

    const totals = rows.reduce(
      (acc: any, r: any) => ({
        affiliateGross: acc.affiliateGross + r.affiliateGross,
        affiliateTds: acc.affiliateTds + r.affiliateTds,
        workGross: acc.workGross + r.workGross,
        workTds: acc.workTds + r.workTds,
        totalGross: acc.totalGross + r.totalGross,
        totalTds: acc.totalTds + r.totalTds,
      }),
      { affiliateGross: 0, affiliateTds: 0, workGross: 0, workTds: 0, totalGross: 0, totalTds: 0 }
    );

    return {
      fyLabel: `FY ${fy.startYear}-${String((fy.startYear + 1) % 100).padStart(2, "0")}`,
      fyOptions: [...fySet].sort((a: any, b: any) => b - a),
      config: { affiliate: cfg.affiliate, work: cfg.work },
      rows,
      totals,
    };
  },
});

// Flat export rows (includes FULL PAN + legal name for 26Q filing — admin only)
export const getTdsExportAdmin = query({
  args: { token: v.string(), fyStartYear: v.number() },
  handler: async (ctx, args) => {
    await requireKycAdmin(ctx, args.token);
    const cfg = await getTdsSettings(ctx);

    const all = await ctx.db.query("withdrawals").collect();
    const inFy = all.filter(
      (w: any) =>
        w.tdsBreakdown &&
        w.status !== "rejected" &&
        w.tdsBreakdown.financialYear === args.fyStartYear
    );
    inFy.sort((a: any, b: any) => a.requestedAt - b.requestedAt);

    const lines = await Promise.all(
      inFy.map(async (w: any) => {
        const u: any = await ctx.db.get(w.userId);
        const kyc: any = await ctx.db
          .query("kycProfiles")
          .withIndex("by_userId", (q: any) => q.eq("userId", w.userId))
          .first();
        return {
          withdrawalId: w._id,
          requestDate: new Date(w.requestedAt).toISOString().slice(0, 10),
          deducteeName: kyc?.fullNameAsPerPan || u?.name || "",
          pan: kyc?.panNumber || "",
          affiliateGross: w.tdsBreakdown.affiliateGross,
          affiliateTds: w.tdsBreakdown.affiliateTds,
          affiliateSection: cfg.affiliate.label,
          workGross: w.tdsBreakdown.workGross,
          workTds: w.tdsBreakdown.workTds,
          workSection: cfg.work.label,
          totalTds: w.tdsAmount || 0,
          status: w.status,
        };
      })
    );

    const grandTotal = lines.reduce((s: number, l: any) => s + l.totalTds, 0);
    return { lines, grandTotal };
  },
});
