import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const SETTING_KEY = "gatePattern";

export const saveInitialPattern = internalMutation({
  args: { hash: v.string(), salt: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", SETTING_KEY))
      .first();
    if (existing) {
      throw new Error("Pattern already set");
    }

    await ctx.db.insert("adminSettings", {
      key: SETTING_KEY,
      value: { hash: args.hash, salt: args.salt },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const savePattern = internalMutation({
  args: {
    token: v.string(),
    hash: v.string(),
    salt: v.string(),
    isUpdate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user || !["super_admin", "admin"].includes(user.role)) {
      throw new Error("Admin privileges required");
    }

    const now = Date.now();

    if (args.isUpdate) {
      const existing = await ctx.db
        .query("adminSettings")
        .withIndex("by_key", (q) => q.eq("key", SETTING_KEY))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          value: { hash: args.hash, salt: args.salt },
          updatedBy: user._id,
          updatedAt: now,
        });
      }
    } else {
      await ctx.db.insert("adminSettings", {
        key: SETTING_KEY,
        value: { hash: args.hash, salt: args.salt },
        updatedBy: user._id,
        updatedAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      adminUserId: user._id,
      adminEmail: user.email,
      action: args.isUpdate ? "ADMIN_GATE_PATTERN_CHANGED" : "ADMIN_GATE_PATTERN_SET",
      entityType: "adminSettings",
      entityId: "gatePattern" as any,
      newValue: "pattern_updated",
      reason: args.isUpdate ? "Pattern changed" : "Initial pattern set",
      timestamp: now,
    });

    return { success: true };
  },
});
