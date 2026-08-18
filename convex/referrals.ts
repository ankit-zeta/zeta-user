import { v } from "convex/values";
import { query } from "./_generated/server";

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

export const getUserReferrals = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", session.userId))
      .collect();

    const referralsWithUsers = await Promise.all(
      referrals.map(async (r) => {
        const referredUser = await ctx.db.get(r.referredUserId);
        const purchases = referredUser
          ? await ctx.db
              .query("purchases")
              .withIndex("by_userId", (q) => q.eq("userId", referredUser._id))
              .filter((q) => q.eq(q.field("status"), "completed"))
              .collect()
          : [];

        return {
          _id: r._id,
          createdAt: r.createdAt,
          status: r.status,
          user: referredUser
            ? {
                name: referredUser.name,
                email: referredUser.email,
                avatarUrl: referredUser.avatarUrl,
                createdAt: referredUser.createdAt,
              }
            : null,
          hasPurchased: purchases.length > 0,
          purchaseCount: purchases.length,
          totalPurchasedAmount: purchases.reduce((sum, p) => sum + p.amount, 0),
        };
      })
    );

    return referralsWithUsers;
  },
});

export const getAllReferralsAdmin = query({
  args: { token: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const referrals = await ctx.db.query("referrals").collect();

    const detailed = await Promise.all(
      referrals.map(async (r) => {
        const referrer = await ctx.db.get(r.referrerUserId);
        const referred = await ctx.db.get(r.referredUserId);
        return {
          _id: r._id,
          referralCode: r.referralCode,
          status: r.status,
          createdAt: r.createdAt,
          referrer: referrer
            ? { _id: referrer._id, name: referrer.name, email: referrer.email, referralCode: referrer.referralCode }
            : null,
          referred: referred
            ? { _id: referred._id, name: referred.name, email: referred.email }
            : null,
        };
      })
    );

    if (args.search && args.search.trim()) {
      const q = args.search.toLowerCase().trim();
      return detailed.filter(
        (item) =>
          item.referrer?.name.toLowerCase().includes(q) ||
          item.referrer?.email.toLowerCase().includes(q) ||
          item.referred?.name.toLowerCase().includes(q) ||
          item.referred?.email.toLowerCase().includes(q) ||
          item.referralCode.toLowerCase().includes(q)
      );
    }

    return detailed;
  },
});
