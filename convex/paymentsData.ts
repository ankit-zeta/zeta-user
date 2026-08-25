import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
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

export const markOrderFailed = internalMutation({
  args: { orderId: v.id("paymentOrders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: "failed", updatedAt: Date.now() });
    return true;
  },
});

export const markOrderPaid = internalMutation({
  args: {
    orderId: v.id("paymentOrders"),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: "paid",
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature,
      updatedAt: Date.now(),
    });
    return true;
  },
});
