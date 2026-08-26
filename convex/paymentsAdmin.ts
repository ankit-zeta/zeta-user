import { v } from "convex/values";
import { query } from "./_generated/server";

// Admin view of the Razorpay order funnel: who reached the payment window,
// who paid, who cancelled/failed — each row carries the verbatim Razorpay
// order id / payment id so it can be cross-verified against the Razorpay
// dashboard.

async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin", "finance_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

export const getPaymentOrdersAdmin = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const orders = await ctx.db.query("paymentOrders").collect();
    orders.sort((a, b) => b.createdAt - a.createdAt);

    const filtered = args.status
      ? orders.filter((o) => o.status === args.status)
      : orders;
    const capped = filtered.slice(0, args.limit || 500);

    const rows = await Promise.all(
      capped.map(async (o) => {
        const [user, plan] = await Promise.all([
          ctx.db.get(o.userId),
          ctx.db.get(o.planId),
        ]);
        return {
          _id: o._id,
          status: o.status,
          amount: o.amount,
          currency: o.currency,
          receipt: o.receipt,
          razorpayOrderId: o.razorpayOrderId,
          razorpayPaymentId: o.razorpayPaymentId,
          createdAt: o.createdAt,
          paidAt: o.paidAt,
          cancelledAt: o.cancelledAt,
          cancelSource: o.cancelSource,
          failureReason: o.failureReason,
          statusSource: o.statusSource,
          user: user
            ? { _id: user._id, name: user.name, email: user.email }
            : null,
          plan: plan ? { _id: plan._id, name: plan.name } : null,
        };
      })
    );

    // Funnel stats over ALL orders (not just the capped page).
    const stats = {
      total: orders.length,
      created: 0, // reached payment window, no final state yet
      paid: 0,
      consumed: 0,
      cancelled: 0,
      failed: 0,
      expired: 0,
      revenuePaise: 0, // paid + consumed
    };
    for (const o of orders) {
      switch (o.status) {
        case "created":
          stats.created++;
          break;
        case "paid":
          stats.paid++;
          stats.revenuePaise += o.amount;
          break;
        case "consumed":
          stats.consumed++;
          stats.revenuePaise += o.amount;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "expired":
          stats.expired++;
          break;
      }
    }

    return { rows, stats };
  },
});
