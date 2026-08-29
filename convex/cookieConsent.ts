import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

export const saveConsent = mutation({
  args: {
    fingerprint: v.string(),
    essential: v.boolean(),
    analytics: v.boolean(),
    marketing: v.boolean(),
    userId: v.optional(v.id("users")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Rate limit: max 10 consent saves per fingerprint per hour
    const recentRecords = await ctx.db
      .query("cookieConsent")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprint", args.fingerprint))
      .collect();
    const recentUpdates = recentRecords.filter(
      (r) => r.updatedAt && now - r.updatedAt < 60 * 60 * 1000
    );
    if (recentUpdates.length >= 10) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // Validate input lengths
    if (args.fingerprint.length > 128) throw new Error("Fingerprint too long");
    if (args.ipAddress && args.ipAddress.length > 45) throw new Error("IP address too long");
    if (args.userAgent && args.userAgent.length > 512) throw new Error("User agent too long");

    const existing = await ctx.db
      .query("cookieConsent")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprint", args.fingerprint))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        essential: args.essential,
        analytics: args.analytics,
        marketing: args.marketing,
        userId: args.userId ?? existing.userId,
        updatedAt: now,
        ipAddress: args.ipAddress ?? existing.ipAddress,
        userAgent: args.userAgent ?? existing.userAgent,
      });
      return existing._id;
    }

    return await ctx.db.insert("cookieConsent", {
      userId: args.userId,
      fingerprint: args.fingerprint,
      essential: args.essential,
      analytics: args.analytics,
      marketing: args.marketing,
      consentedAt: now,
      updatedAt: now,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });
  },
});

export const getConsent = query({
  args: { fingerprint: v.string() },
  handler: async (ctx, args) => {
    if (args.fingerprint.length > 128) throw new Error("Fingerprint too long");
    return await ctx.db
      .query("cookieConsent")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprint", args.fingerprint))
      .first();
  },
});

export const getAllConsentAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const records = await ctx.db.query("cookieConsent").collect();
    return Promise.all(
      records.map(async (r) => {
        const user = r.userId ? await ctx.db.get(r.userId) : null;
        return {
          ...r,
          userName: user?.name ?? "Anonymous",
          userEmail: user?.email ?? null,
        };
      })
    );
  },
});
