"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHmac, timingSafeEqual } from "node:crypto";
import { gstSplit } from "./paymentsConfig";

// Razorpay checkout actions. Keys live ONLY in the Convex environment:
//   npx convex env set RAZORPAY_KEY_ID rzp_test_xxxxxxxx
//   npx convex env set RAZORPAY_KEY_SECRET xxxxxxxxxx
// The client receives only the public key id via paymentsConfig.getRazorpayConfig.
// Actions cannot touch ctx.db directly — all reads/writes go through
// internal functions in paymentsData.ts.

function razorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "Payments are not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the Convex environment."
    );
  }
  return { keyId, keySecret };
}

async function requireUserId(ctx: any, token: string) {
  const session = await ctx.runQuery(internal.paymentsData.getSessionByToken, {
    token,
  });
  if (!session) throw new Error("Unauthorized");
  return session.userId;
}

// Creates a Razorpay order for a plan and records it as "created".
export const createRazorpayOrder = action({
  args: {
    token: v.string(),
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx, args.token);

    const plan: any = await ctx.runQuery(internal.plans.getPlanByIdInternal, {
      planId: args.planId,
    });
    if (!plan) throw new Error("Plan not found");
    if (plan.status !== "published")
      throw new Error("This plan is not available for purchase");

    const { keyId, keySecret } = razorpayCredentials();

    // GST is added on top of the listed price. The server-side config is the
    // single source of truth — the checkout preview reads the same value, and
    // this breakdown is what actually gets charged.
    const gst: any = await ctx.runQuery(internal.paymentsData.getGstInternal, {});
    const { base, tax, total } = gstSplit(plan.price, gst);
    const amountInPaise = total;

    const receipt = `ZG_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
          "base64"
        )}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          planId: args.planId,
          userId,
          planName: plan.name,
          baseAmount: String(base),
          taxAmount: String(tax),
          taxLabel: gst.enabled ? `${gst.label} @${gst.rate}%` : "none",
        },
      }),
    });

    if (!resp.ok) {
      await resp.text();
      throw new Error(
        "Payment gateway error. Please try again in a moment."
      );
    }

    const order: any = await resp.json();

    await ctx.runMutation(internal.paymentsData.insertOrder, {
      userId,
      planId: args.planId,
      razorpayOrderId: order.id,
      amount: amountInPaise,
      currency: order.currency || "INR",
      receipt,
    });

    return {
      razorpayOrderId: order.id as string,
      amount: amountInPaise as number,
      currency: (order.currency || "INR") as string,
      planName: plan.name as string,
      baseAmount: base as number,
      taxAmount: tax as number,
      gstRate: gst.enabled ? (gst.rate as number) : 0,
      gstLabel: (gst.enabled ? gst.label : "") as string,
    };
  },
});

// Verifies the checkout handler signature server-side. Only after this does
// an order become "paid" — which is what the enrollment mutation requires.
export const verifyRazorpayPayment = action({
  args: {
    token: v.string(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx, args.token);
    const { keySecret } = razorpayCredentials();

    const record: any = await ctx.runQuery(
      internal.paymentsData.getOrderByRazorpayOrderId,
      { razorpayOrderId: args.razorpayOrderId }
    );

    if (!record) throw new Error("Unknown order");
    if (record.userId !== userId)
      throw new Error("Order does not belong to this account");
    if (record.status === "paid" || record.status === "consumed") {
      return { ok: true, alreadyVerified: true, orderDbId: record._id };
    }
    if (record.status !== "created")
      throw new Error("Order is not in a verifiable state");

    const expected = createHmac("sha256", keySecret)
      .update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
      .digest("hex");

    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(args.razorpaySignature, "utf8");
    const valid = a.length === b.length && timingSafeEqual(a, b);

    if (!valid) {
      await ctx.runMutation(internal.paymentsData.markOrderFailed, {
        orderId: record._id,
      });
      throw new Error(
        "Payment signature verification failed. If you were charged, contact support with your payment id."
      );
    }

    await ctx.runMutation(internal.paymentsData.markOrderPaid, {
      orderId: record._id,
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature,
    });

    return { ok: true, alreadyVerified: false, orderDbId: record._id };
  },
});
