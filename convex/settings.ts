import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Keys that are safe for public (unauthenticated) reads
const PUBLIC_SETTING_KEYS = new Set(["withdrawals"]);

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

// Public query — only exposes whitelisted keys (e.g. withdrawal minimum)
export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    if (!PUBLIC_SETTING_KEYS.has(args.key)) {
      throw new Error("This setting is not publicly accessible");
    }
    const record = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    return record ? record.value : null;
  },
});

// Admin-only — returns all settings
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

// Admin-only setting value — for admin pages that need a specific key
export const getSettingAdmin = query({
  args: { token: v.string(), key: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const record = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return record ? record.value : null;
  },
});

// Only allow known setting shapes to prevent arbitrary data injection
const SETTING_SCHEMS: Record<string, any> = {
  withdrawals: v.object({
    minimumWithdrawal: v.optional(v.number()),
    maximumWithdrawal: v.optional(v.number()),
    dailyLimit: v.optional(v.number()),
    monthlyLimit: v.optional(v.number()),
    feePercentage: v.optional(v.number()),
    fixedFee: v.optional(v.number()),
    maxFee: v.optional(v.number()),
    allowedMethods: v.optional(v.array(v.string())),
  }),
  general: v.object({
    brandName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
  }),
  gst: v.object({
    enabled: v.optional(v.boolean()),
    rate: v.optional(v.number()),
    label: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }),
  workLimits: v.object({
    dailyPayoutCap: v.optional(v.number()),
    monthlyPayoutCap: v.optional(v.number()),
    maxPayoutPerJob: v.optional(v.number()),
    positionMultipliers: v.optional(v.any()),
  }),
  workPortal: v.object({
    enabled: v.optional(v.boolean()),
    requireKyc: v.optional(v.boolean()),
    requireCv: v.optional(v.boolean()),
    maxApplicationsPerJob: v.optional(v.number()),
    allowFreeApply: v.optional(v.boolean()),
  }),
  affiliate: v.object({
    enabled: v.optional(v.boolean()),
    commissionMethod: v.optional(v.string()),
    defaultPercentage: v.optional(v.number()),
    holdingPeriodDays: v.optional(v.number()),
    minimumPurchaseAmount: v.optional(v.number()),
    perSaleCap: v.optional(v.number()),
    dailyCommissionCap: v.optional(v.number()),
    monthlyCommissionCap: v.optional(v.number()),
    positionMultipliers: v.optional(v.any()),
    chainEnabled: v.optional(v.boolean()),
    chainLevels: v.optional(v.any()),
  }),
  dividends: v.object({
    enabled: v.optional(v.boolean()),
    rate: v.optional(v.number()),
    period: v.optional(v.string()),
    minBalance: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),
  tds: v.object({
    enabled: v.optional(v.boolean()),
    affiliateThreshold: v.optional(v.number()),
    affiliateRate: v.optional(v.number()),
    workThreshold: v.optional(v.number()),
    workRate: v.optional(v.number()),
  }),
};

export const updateSetting = mutation({
  args: {
    token: v.string(),
    key: v.string(),
    value: v.any(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);

    // Validate against known schemas if one exists for this key
    const schema = SETTING_SCHEMS[args.key];
    if (schema) {
      try {
        // Convex validators expose .validate() on the validator instance
        schema.validate(args.value);
      } catch (e: any) {
        throw new Error(`Invalid value for setting "${args.key}": ${e.message}`);
      }
    } else {
      // Unknown keys — reject to prevent arbitrary data injection
      throw new Error(`Unknown setting key "${args.key}". Only pre-configured settings can be updated.`);
    }

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
