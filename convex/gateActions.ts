"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHash, randomBytes } from "node:crypto";

function hashPattern(dots: number[], salt: string): string {
  const payload = dots.join(".") + ":" + salt;
  return createHash("sha256").update(payload).digest("hex");
}

export const verifyPattern = action({
  args: { pattern: v.array(v.number()) },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, {
      key: "gatePattern:verify",
      max: 5,
      windowMs: 60 * 1000,
    });

    const record = await ctx.runQuery(internal.gate.getPatternRecord);
    if (!record) return { valid: true, reason: "no_pattern" };

    const hash = hashPattern(args.pattern, record.salt);
    if (hash === record.hash) return { valid: true };

    return { valid: false };
  },
});

export const setInitialPattern = action({
  args: { pattern: v.array(v.number()) },
  handler: async (ctx, args) => {
    if (args.pattern.length < 3) {
      throw new Error("Pattern must have at least 3 dots");
    }

    const record = await ctx.runQuery(internal.gate.getPatternRecord);
    if (record) {
      throw new Error("Pattern already set. Use setPattern to change it.");
    }

    const salt = randomBytes(16).toString("hex");
    const hash = hashPattern(args.pattern, salt);

    await ctx.runMutation(internal.gateAdmin.saveInitialPattern, { hash, salt });

    return { success: true };
  },
});

export const setPattern = action({
  args: {
    token: v.string(),
    pattern: v.array(v.number()),
    oldPattern: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    if (args.pattern.length < 3) {
      throw new Error("Pattern must have at least 3 dots");
    }

    const record = await ctx.runQuery(internal.gate.getPatternRecord);

    if (record) {
      if (!args.oldPattern || args.oldPattern.length < 3) {
        throw new Error("Current pattern required to change");
      }
      const oldHash = hashPattern(args.oldPattern, record.salt);
      if (oldHash !== record.hash) {
        throw new Error("Current pattern is incorrect");
      }
    }

    const salt = randomBytes(16).toString("hex");
    const hash = hashPattern(args.pattern, salt);

    await ctx.runMutation(internal.gateAdmin.savePattern, {
      token: args.token,
      hash,
      salt,
      isUpdate: !!record,
    });

    return { success: true };
  },
});
