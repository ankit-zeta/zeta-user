import { query } from "./_generated/server";
import { v } from "convex/values";

// Public Razorpay info for the checkout page. Only the public key id is
// exposed — the key secret never leaves the Convex environment. Lives in the
// default runtime because queries cannot be defined in "use node" files.
export const getRazorpayConfig = query({
  args: {},
  handler: async () => {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    return {
      enabled: Boolean(keyId),
      keyId, // public by design — safe to expose
    };
  },
});

// ── GST configuration (admin-controlled, key "gst" in adminSettings) ────────
// Programs are sold GST-INCLUSIVE: listed price includes GST.
// Defaults apply until an admin saves the "gst" setting.
export const GST_DEFAULTS = {
  enabled: true,
  rate: 18,
  label: "GST",
};

export type GstConfig = typeof GST_DEFAULTS;

export async function getGstSettings(db: any): Promise<GstConfig> {
  const rec = await db
    .query("adminSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "gst"))
    .first();
  const s = rec?.value || {};
  return {
    enabled: s.enabled !== false,
    rate: typeof s.rate === "number" && s.rate >= 0 ? s.rate : GST_DEFAULTS.rate,
    label: s.label || GST_DEFAULTS.label,
  };
}

// Single source of truth for the money math (rupees in, rupees out; paise-
// precise rounding happens once here so UI preview == charged amount).
// Used for GST-exclusive pricing (legacy / fallback).
export function gstSplit(baseRupees: number, cfg: GstConfig) {
  const base = Math.round(baseRupees * 100);
  const tax = cfg.enabled ? Math.round((base * cfg.rate) / 100) : 0;
  return { base, tax, total: base + tax };
}

// Extract base price and tax from a GST-INCLUSIVE price.
// plans.price now stores the GST-inclusive amount in rupees.
// Returns paise-precise values for Razorpay and revenue tracking.
export function gstSplitInclusive(inclusiveRupees: number, cfg: GstConfig) {
  const total = Math.round(inclusiveRupees * 100);
  if (!cfg.enabled || cfg.rate === 0) {
    return { base: total, tax: 0, total };
  }
  const base = Math.round(total / (1 + cfg.rate / 100));
  const tax = total - base;
  return { base, tax, total };
}

// Public: checkout + program cards need the current rate without auth.
export const getGstConfig = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const cfg = await getGstSettings(ctx.db);
    return { enabled: cfg.enabled, rate: cfg.rate, label: cfg.label };
  },
});
