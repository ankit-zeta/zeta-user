import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

const DEFAULT_WINDOW_MS = 60 * 60 * 1000;

export async function enforceRateLimit(
  ctx: any,
  args: { key: string; max: number; windowMs?: number }
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = args.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q: any) => q.eq("key", args.key))
    .first();

  if (existing) {
    if (existing.windowStart >= windowStart) {
      const newCount = existing.count + 1;
      if (newCount > args.max) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      await ctx.db.patch(existing._id, { count: newCount });
      return { allowed: true, remaining: args.max - newCount };
    } else {
      await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
      return { allowed: true, remaining: args.max - 1 };
    }
  } else {
    await ctx.db.insert("rateLimits", {
      key: args.key,
      windowStart: now,
      count: 1,
    });
    return { allowed: true, remaining: args.max - 1 };
  }
}

export const cleanupRateLimits = internalMutation({
  args: {
    maxAgeMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxAgeMs = args.maxAgeMs ?? 48 * 60 * 60 * 1000;
    const cutoff = Date.now() - maxAgeMs;
    const old = await ctx.db
      .query("rateLimits")
      .withIndex("by_windowStart", (q: any) => q.lte("windowStart", cutoff))
      .collect();
    for (const r of old) {
      await ctx.db.delete(r._id);
    }
    return { deleted: old.length };
  },
});

export const getRateLimitStatus = query({
  args: {
    key: v.string(),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const windowMs = args.windowMs ?? DEFAULT_WINDOW_MS;
    const windowStart = Date.now() - windowMs;
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .first();
    if (!existing || existing.windowStart < windowStart) {
      return { count: 0, windowStart: null };
    }
    return { count: existing.count, windowStart: existing.windowStart };
  },
});