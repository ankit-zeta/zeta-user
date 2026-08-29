import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";

const SETTING_KEY = "gatePattern";

export const isPatternSet = query({
  handler: async (ctx) => {
    const record = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", SETTING_KEY))
      .first();
    return !!record;
  },
});

export const getPatternRecord = internalQuery({
  handler: async (ctx) => {
    const record = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", SETTING_KEY))
      .first();
    if (!record) return null;
    const val = record.value as any;
    return { hash: val.hash, salt: val.salt };
  },
});
