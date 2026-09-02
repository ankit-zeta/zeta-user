import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Growth Partner Program (invite-only) ────────────────────────────────────
// Members unlock the exclusive Partnership section in the Affiliate Center and
// become eligible for chain-level (upline) affiliate commissions. Access is
// granted per-user from the Admin Panel; existing achievement-holders are
// grandfathered via the backfill function below.

const PARTNER_TIER = "growth_partner";

async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) throw new ConvexError("Unauthorized");
  const u = await ctx.db.get(session.userId);
  if (!u || !["super_admin", "admin"].includes(u.role)) {
    throw new ConvexError("Forbidden: Admin privileges required");
  }
  return u;
}

// Resolve the member's chain commission % exactly like the payout engine does
// (affiliate settings chainLevels keyed by positionId or position name).
async function resolveChainPct(ctx: any, user: any): Promise<number> {
  if (!user?.positionId) return 0;
  const settingsRecord = await ctx.db
    .query("adminSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "affiliate"))
    .first();
  const levels = settingsRecord?.value?.chainLevels || {};
  const pos: any = await ctx.db.get(user.positionId);
  const pct =
    levels[String(user.positionId)] ?? (pos ? levels[pos.name] : undefined);
  return typeof pct === "number" && pct > 0 ? pct : 0;
}

// ── User endpoint ────────────────────────────────────────────────────────────

export const getMyPartnerProfile = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) throw new ConvexError("Unauthorized");
    const user: any = await ctx.db.get(session.userId);
    if (!user || user.status === "suspended") throw new ConvexError("Unauthorized");

    const isPartner = user.partnerTier === PARTNER_TIER;
    if (!isPartner) {
      return { isPartner: false, tierName: null, chainPct: 0, positionName: null, partnerSince: null };
    }

    const pos: any = user.positionId ? await ctx.db.get(user.positionId) : null;
    return {
      isPartner: true,
      tierName: pos?.name || "Growth Partner",
      chainPct: await resolveChainPct(ctx, user),
      positionName: pos?.name || null,
      partnerSince: user.partnerSince || null,
    };
  },
});

// ── Admin endpoints ──────────────────────────────────────────────────────────

export const getPartnerDirectoryAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const users = await ctx.db.query("users").collect();
    const partners = users.filter((u: any) => u.partnerTier === PARTNER_TIER);

    return Promise.all(
      partners.map(async (p: any) => {
        const pos: any = p.positionId ? await ctx.db.get(p.positionId) : null;
        const achievements = (
          await ctx.db
            .query("userAchievements")
            .withIndex("by_userId", (q: any) => q.eq("userId", p._id))
            .collect()
        ).length;
        const wallet = await ctx.db
          .query("wallets")
          .withIndex("by_userId", (q: any) => q.eq("userId", p._id))
          .first();
        return {
          _id: p._id,
          name: p.name,
          email: p.email,
          tierName: pos?.name || "Growth Partner",
          chainPct: await resolveChainPct(ctx, p),
          achievementsUnlocked: achievements,
          totalEarned: wallet?.totalEarned || 0,
          partnerSince: p.partnerSince || null,
        };
      })
    );
  },
});

export const setPartnerAccess = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    grant: v.boolean(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const user: any = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found");

    const isPartner = user.partnerTier === PARTNER_TIER;
    if (args.grant && isPartner) throw new ConvexError("User is already a Growth Partner");
    if (!args.grant && !isPartner) throw new ConvexError("User is not in the program");

    const now = Date.now();

    if (args.grant) {
      await ctx.db.patch(args.userId, {
        partnerTier: PARTNER_TIER,
        partnerSince: now,
        updatedAt: now,
      });
      await ctx.db.insert("notifications", {
        userId: args.userId,
        type: "achievement",
        title: "Welcome to the Growth Partner Program 🎉",
        message:
          "You've been personally selected to join ZetaGrow's invite-only Growth Partner circle — unlocking exclusive partnership tiers, chain commissions and priority recognition inside your Partner Center.",
        read: false,
        actionUrl: "/partner/achievements",
        createdAt: now,
      });
    } else {
      await ctx.db.patch(args.userId, {
        partnerTier: undefined,
        partnerSince: undefined,
        updatedAt: now,
      });
      await ctx.db.insert("notifications", {
        userId: args.userId,
        type: "account",
        title: "Growth Partner access updated",
        message: `Your Growth Partner Program access has been updated by our team. Reason: ${args.reason}`,
        read: false,
        actionUrl: "/dashboard",
        createdAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: args.grant ? "GRANT_PARTNER_ACCESS" : "REVOKE_PARTNER_ACCESS",
      entityType: "users",
      entityId: args.userId,
      previousValue: isPartner ? PARTNER_TIER : "none",
      newValue: args.grant ? PARTNER_TIER : "none",
      reason: args.reason,
      timestamp: now,
    });

    return { success: true };
  },
});

// One-time migration: invite everyone who already unlocked at least one
// achievement BEFORE the program gate existed, so no current earner loses
// income. Idempotent — safe to run more than once.
export const backfillPartnersFromAchievements = mutation({
  args: { token: v.string(), dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);

    const unlocks = await ctx.db.query("userAchievements").collect();
    const userIds = [...new Set(unlocks.map((u: any) => String(u.userId)))];

    let granted = 0;
    let alreadyPartner = 0;
    const skippedSuspended: string[] = [];
    const now = Date.now();

    for (const id of userIds) {
      const u: any = await ctx.db.get(id as any);
      if (!u) continue;
      if (u.status === "suspended") {
        skippedSuspended.push(u.email);
        continue;
      }
      if (u.partnerTier === PARTNER_TIER) {
        alreadyPartner++;
        continue;
      }
      if (!args.dryRun) {
        await ctx.db.patch(id as any, {
          partnerTier: PARTNER_TIER,
          partnerSince: now,
          updatedAt: now,
        });
      }
      granted++;
    }

    if (!args.dryRun && granted > 0) {
      await ctx.db.insert("auditLogs", {
        adminUserId: admin._id,
        adminEmail: admin.email,
        action: "BACKFILL_PARTNER_ACCESS",
        entityType: "users",
        entityId: "bulk",
        previousValue: "none",
        newValue: `${granted} users invited (grandfathering existing achievement holders)`,
        reason: "One-time Growth Partner grandfathering migration",
        timestamp: now,
      });
    }

    return { totalHolders: userIds.length, granted, alreadyPartner, skippedSuspended, dryRun: !!args.dryRun };
  },
});
