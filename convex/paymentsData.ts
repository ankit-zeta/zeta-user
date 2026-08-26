import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { getGstSettings } from "./paymentsConfig";

// Database helpers for the Razorpay flow. Lives in the default runtime so it
// can touch ctx.db; convex/payments.ts ("use node") calls these via
// ctx.runQuery / ctx.runMutation because actions cannot access the database
// directly.

export const getSessionByToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    return { userId: session.userId };
  },
});

// GST config for the order action (actions cannot read the db directly).
export const getGstInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await getGstSettings(ctx.db);
  },
});

export const insertOrder = internalMutation({
  args: {
    userId: v.id("users"),
    planId: v.id("plans"),
    razorpayOrderId: v.string(),
    amount: v.number(),
    currency: v.string(),
    receipt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("paymentOrders", {
      ...args,
      status: "created",
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const getOrderByRazorpayOrderId = internalQuery({
  args: { razorpayOrderId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("paymentOrders")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .first();
    if (!record) return null;
    return {
      _id: record._id,
      userId: record.userId,
      planId: record.planId,
      amount: record.amount,
      status: record.status,
    };
  },
});

// Marks an order as cancelled (user closed the Razorpay window). Only
// transitions from "created" — a captured payment is never downgraded, so a
// race between the user dismissing the modal and the webhook confirming the
// money can't lose a real payment.
export const markOrderCancelled = internalMutation({
  args: {
    orderId: v.id("paymentOrders"),
    source: v.string(), // "user" | "timeout"
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return false;
    if (order.status !== "created") return false; // paid/failed/etc. wins
    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      cancelSource: args.source,
      failureReason: args.reason || "Payment window closed before completion",
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const markOrderFailed = internalMutation({
  args: {
    orderId: v.id("paymentOrders"),
    reason: v.optional(v.string()),
    source: v.optional(v.string()), // "client" | "webhook"
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return false;
    if (order.status === "paid" || order.status === "consumed") return false;
    await ctx.db.patch(args.orderId, {
      status: "failed",
      failureReason: args.reason || "Payment failed",
      statusSource: args.source || "client",
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const markOrderPaid = internalMutation({
  args: {
    orderId: v.id("paymentOrders"),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.optional(v.string()),
    source: v.optional(v.string()), // "client" | "webhook"
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return false;
    if (order.status === "paid" || order.status === "consumed") return true; // idempotent
    await ctx.db.patch(args.orderId, {
      status: "paid",
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature,
      statusSource: args.source || "client",
      paidAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});

// Cron: orders left in "created" for over 24h (user never completed and no
// webhook arrived) are marked "expired" so the funnel stats stay honest.
export const expireStaleOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const stale = await ctx.db
      .query("paymentOrders")
      .withIndex("by_status", (q) => q.eq("status", "created"))
      .collect();
    let expired = 0;
    for (const order of stale) {
      if (order.createdAt < cutoff) {
        await ctx.db.patch(order._id, {
          status: "expired",
          cancelSource: "timeout",
          failureReason: "No payment within 24 hours",
          cancelledAt: Date.now(),
          updatedAt: Date.now(),
        });
        expired++;
      }
    }
    return expired;
  },
});

// Public: recovery flow. If the user paid (webhook confirmed) but the browser
// closed before enrollment finished, the checkout page offers one-click
// activation using this unconsumed "paid" order.
export const getMyPendingPaidOrder = query({
  args: { token: v.string(), planId: v.id("plans") },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;

    const orders = await ctx.db
      .query("paymentOrders")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();
    const match = orders
      .filter((o) => o.planId === args.planId && o.status === "paid")
      .sort((a, b) => b.paidAt! - a.paidAt!)[0];
    if (!match) return null;
    return { orderId: match._id, razorpayPaymentId: match.razorpayPaymentId };
  },
});
