"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";

export type GstConfig = {
  enabled: boolean;
  rate: number;
  label: string;
};

// Live GST configuration (admin-controlled). `undefined` while loading —
// callers should treat that as "unknown" and avoid showing tax math yet.
export function useGst(): GstConfig | undefined {
  const cfg: any = useQuery(api.paymentsConfig.getGstConfig, {});
  if (!cfg) return undefined;
  return {
    enabled: cfg.enabled !== false,
    rate: typeof cfg.rate === "number" ? cfg.rate : 18,
    label: cfg.label || "GST",
  };
}

// Paise-precise split matching the server-side formula in
// convex/paymentsConfig.ts (gstSplit) so preview == charged amount.
export function withGst(
  baseRupees: number,
  gst: GstConfig | undefined | null
): { base: number; tax: number; total: number } {
  const basePaise = Math.round(baseRupees * 100);
  const enabled = !!gst?.enabled;
  const rate = enabled ? gst!.rate : 0;
  const tax = Math.round((basePaise * rate) / 100);
  return { base: basePaise, tax, total: basePaise + tax };
}

// Extract base price and GST tax from a GST-INCLUSIVE price (in rupees).
// prices stored in plans.price are now GST-inclusive. This returns paise.
export function fromGstInclusive(
  inclusiveRupees: number,
  gst: GstConfig | undefined | null
): { base: number; tax: number; total: number } {
  const totalPaise = Math.round(inclusiveRupees * 100);
  const enabled = !!gst?.enabled;
  const rate = enabled ? gst!.rate : 0;
  if (!enabled || rate === 0) {
    return { base: totalPaise, tax: 0, total: totalPaise };
  }
  // base = total / (1 + rate/100), rounded to nearest paise
  const base = Math.round(totalPaise / (1 + rate / 100));
  const tax = totalPaise - base;
  return { base, tax, total: totalPaise };
}

// "₹4,999 + 18% GST" suffix used across pricing surfaces.
export function gstSuffix(gst: GstConfig | undefined | null): string {
  return gst?.enabled ? ` + ${gst.rate}% ${gst.label}` : "";
}
