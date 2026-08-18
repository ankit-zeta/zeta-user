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

export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    return record ? record.value : null;
  },
});

export const getAllSettings = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const records = await ctx.db.query("adminSettings").collect();
    const settingsMap: Record<string, any> = {};
    for (const r of records) {
      settingsMap[r.key] = r.value;
    }
    return settingsMap;
  },
});

export const updateSetting = mutation({
  args: {
    token: v.string(),
    key: v.string(),
    value: v.any(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    const now = Date.now();
    const previousValue = existing ? JSON.stringify(existing.value) : "none";

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: admin._id,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("adminSettings", {
        key: args.key,
        value: args.value,
        updatedBy: admin._id,
        updatedAt: now,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: `UPDATE_SETTING_${args.key.toUpperCase()}`,
      entityType: "adminSettings",
      entityId: args.key,
      previousValue,
      newValue: JSON.stringify(args.value),
      reason: args.reason || "Admin settings update",
      timestamp: now,
    });

    return { success: true };
  },
});
