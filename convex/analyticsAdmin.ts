import { v } from "convex/values";
import { query } from "./_generated/server";
import { getGstSettings } from "./paymentsConfig";

// Dashboard analytics: daily signups, revenue, expenses and profit — all
// computed server-side from the database, bucketed by IST calendar day so the
// charts match the business's timezone.

async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin", "finance_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// UTC timestamp → "YYYY-MM-DD" in IST.
function istDayKey(ts: number): string {
  return new Date(ts + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// Start (UTC ms) of `daysAgo` days ago, aligned to the IST day boundary.
function istRangeStart(now: number, days: number): number {
  const istNow = new Date(now + IST_OFFSET_MS);
  const startIst = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate() - (days - 1)
  );
  return startIst - IST_OFFSET_MS;
}

export const getDashboardAnalytics = query({
  args: {
    token: v.string(),
    days: v.optional(v.number()), // 7 | 30 | 90 | 365 (default 30)
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const days = [7, 30, 90, 365].includes(args.days || 30) ? args.days! : 30;

    const now = Date.now();
    const rangeStart = istRangeStart(now, days);
    const prevRangeStart = istRangeStart(now, days * 2);

    // ── Load data ─────────────────────────────────────────────────────────
    const [users, orders, expenses, categories, withdrawals, jobs, gst, financeSetting] =
      await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db.query("paymentOrders").collect(),
        ctx.db.query("expenses").collect(),
        ctx.db.query("expenseCategories").collect(),
        ctx.db.query("withdrawals").collect(),
        ctx.db.query("jobs").collect(),
        getGstSettings(ctx.db),
        ctx.db
          .query("adminSettings")
          .withIndex("by_key", (q: any) => q.eq("key", "finance"))
          .first(),
      ]);

    const effectiveTaxRatePct =
      typeof financeSetting?.value?.effectiveTaxRatePct === "number"
        ? financeSetting.value.effectiveTaxRatePct
        : 25; // estimated effective corporate rate — editable in Expenses page

    const catById = new Map(categories.map((c) => [c._id, c]));

    // ── Day buckets ───────────────────────────────────────────────────────
    const dayKeys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      dayKeys.push(istDayKey(istRangeStart(now, i + 1)));
    }
    const blank = () =>
      Object.fromEntries(dayKeys.map((k) => [k, 0])) as Record<string, number>;

    const signups = blank();
    const revenueDay = blank();
    const ordersDay = blank();
    const expensesDay = blank();

    let signupsPrevRange = 0;
    let revenuePrevRange = 0;

    for (const u of users) {
      if (!u.createdAt) continue;
      const key = istDayKey(u.createdAt);
      if (key in signups) signups[key]++;
      if (u.createdAt >= rangeStart) continue; // counted in current range
      if (u.createdAt >= prevRangeStart) signupsPrevRange++;
    }

    const paidOrders = orders.filter(
      (o) => o.status === "paid" || o.status === "consumed"
    );
    const revenueTs = (o: any) => o.paidAt || o.updatedAt || o.createdAt;

    for (const o of paidOrders) {
      const key = istDayKey(revenueTs(o));
      if (key in revenueDay) {
        revenueDay[key] += o.amount;
        ordersDay[key] += 1;
      }
      if (revenueTs(o) < rangeStart && revenueTs(o) >= prevRangeStart) {
        revenuePrevRange += o.amount;
      }
    }

    for (const e of expenses) {
      const key = istDayKey(e.date);
      if (key in expensesDay) expensesDay[key] += e.amount;
    }

    // ── Series ────────────────────────────────────────────────────────────
    let cumSignups = users.filter((u) => u.createdAt && u.createdAt < rangeStart).length;
    let cumRevenue = paidOrders
      .filter((o) => revenueTs(o) < rangeStart)
      .reduce((s, o) => s + o.amount, 0);

    const signupSeries = dayKeys.map((k) => {
      cumSignups += signups[k];
      return { date: k, signups: signups[k], cumulative: cumSignups };
    });

    const revenueSeries = dayKeys.map((k) => {
      cumRevenue += revenueDay[k];
      return {
        date: k,
        revenue: revenueDay[k] / 100,
        orders: ordersDay[k],
        cumulative: cumRevenue / 100,
      };
    });

    const profitSeries = dayKeys.map((k) => {
      const rev = revenueDay[k];
      const net = gst.enabled ? rev / (1 + gst.rate / 100) : rev;
      const exp = expensesDay[k];
      return {
        date: k,
        revenue: rev / 100,
        expenses: exp / 100,
        profit: (net - exp) / 100,
      };
    });

    // ── Range totals & growth ─────────────────────────────────────────────
    const sumVals = (rec: Record<string, number>) =>
      dayKeys.reduce((s, k) => s + rec[k], 0);

    const signupsInRange = sumVals(signups);
    const revenueInRangePaise = sumVals(revenueDay);
    const expensesInRangePaise = sumVals(expensesDay);
    const ordersInRange = sumVals(ordersDay);

    const grossRevenue = revenueInRangePaise;
    const gstCollected = gst.enabled
      ? grossRevenue - grossRevenue / (1 + gst.rate / 100)
      : 0;
    const netRevenue = grossRevenue - gstCollected;
    const profitBeforeTax = netRevenue - expensesInRangePaise;
    const tax = profitBeforeTax > 0 ? (profitBeforeTax * effectiveTaxRatePct) / 100 : 0;
    const profitAfterTax = profitBeforeTax - tax;

    const prevSignupsGrowth =
      signupsPrevRange > 0
        ? ((signupsInRange - signupsPrevRange) / signupsPrevRange) * 100
        : null;
    const prevRevenueGrowth =
      revenuePrevRange > 0
        ? ((revenueInRangePaise - revenuePrevRange) / revenuePrevRange) * 100
        : null;

    // ── Breakdowns ────────────────────────────────────────────────────────
    const planTotals = new Map<string, { name: string; total: number; orders: number }>();
    for (const o of paidOrders) {
      if (revenueTs(o) < rangeStart) continue;
      const entry = planTotals.get(o.planId) || { name: "", total: 0, orders: 0 };
      entry.total += o.amount;
      entry.orders += 1;
      planTotals.set(o.planId, entry);
    }
    const planIds = Array.from(planTotals.keys());
    const planDocs = await Promise.all(planIds.map((id) => ctx.db.get(id as any)));
    const revenueByPlan = planIds
      .map((id, i) => ({
        name: (planDocs[i] as any)?.name || "Deleted plan",
        total: (planTotals.get(id)!.total || 0) / 100,
        orders: planTotals.get(id)!.orders,
      }))
      .sort((a, b) => b.total - a.total);

    const expensesByCategory = [...new Set(expenses.map((e) => e.categoryId))]
      .map((cid) => {
        const cat = catById.get(cid);
        return {
          name: cat?.name || "Uncategorised",
          color: cat?.color || "#8A8A8A",
          total:
            expenses
              .filter((e) => e.categoryId === cid && e.date >= rangeStart)
              .reduce((s, e) => s + e.amount, 0) / 100,
        };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    // ── Funnel (payment attempts) ─────────────────────────────────────────
    const ordersInRangeAll = orders.filter((o) => o.createdAt >= rangeStart);
    const funnel = {
      attempts: ordersInRangeAll.length,
      paid: ordersInRangeAll.filter((o) => o.status === "paid" || o.status === "consumed").length,
      cancelled: ordersInRangeAll.filter((o) => o.status === "cancelled").length,
      failed: ordersInRangeAll.filter(
        (o) => o.status === "failed" || o.status === "expired"
      ).length,
      pending: ordersInRangeAll.filter((o) => o.status === "created").length,
    };

    // ── Platform KPIs (always all-time / current) ─────────────────────────
    const pendingWithdrawals = withdrawals.filter(
      (w) => w.status === "requested" || w.status === "under_review"
    );

    return {
      rangeDays: days,
      taxRatePct: effectiveTaxRatePct,
      gst: { enabled: gst.enabled, rate: gst.rate, label: gst.label },
      series: {
        signups: signupSeries,
        revenue: revenueSeries,
        profit: profitSeries,
      },
      kpis: {
        totalUsers: users.length,
        signupsInRange,
        signupsGrowthPct: prevSignupsGrowth,
        newToday: signups[istDayKey(now)] || 0,
        grossRevenue: grossRevenue / 100,
        // All-time money actually collected from users (incl. GST) — matches
        // the Payment Orders page revenue stat.
        allTimeGrossRevenue:
          paidOrders.reduce((s, o) => s + o.amount, 0) / 100,
        allTimeOrders: paidOrders.length,
        revenueGrowthPct: prevRevenueGrowth,
        gstCollected: gstCollected / 100,
        netRevenue: netRevenue / 100,
        expenses: expensesInRangePaise / 100,
        profitBeforeTax: profitBeforeTax / 100,
        tax: tax / 100,
        profitAfterTax: profitAfterTax / 100,
        orders: ordersInRange,
        avgOrderValue: ordersInRange > 0 ? grossRevenue / ordersInRange / 100 : 0,
        conversionPct:
          funnel.attempts > 0 ? (funnel.paid / funnel.attempts) * 100 : 0,
        arpu:
          users.length > 0
            ? paidOrders.reduce((s, o) => s + o.amount, 0) / users.length / 100
            : 0,
      },
      funnel,
      revenueByPlan,
      expensesByCategory,
      platform: {
        pendingWithdrawalsCount: pendingWithdrawals.length,
        pendingWithdrawalAmount:
          pendingWithdrawals.reduce((s, w) => s + w.amount, 0),
        activeJobs: jobs.filter((j) => j.status === "published").length,
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === "active").length,
      },
    };
  },
});
