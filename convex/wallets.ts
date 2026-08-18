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
  if (!user || !["super_admin", "admin", "finance_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

export const getUserWallet = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();

    const transactions = await ctx.db
      .query("walletTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    transactions.sort((a, b) => b.createdAt - a.createdAt);

    return {
      wallet: wallet || {
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        workEarnings: 0,
        affiliateEarnings: 0,
      },
      transactions,
    };
  },
});

export const adminAdjustWallet = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    amount: v.number(), // positive to credit, negative to debit
    type: v.string(), // "CREDIT" | "DEBIT"
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) throw new Error("Wallet not found");

    const adjustment = args.type === "DEBIT" ? -Math.abs(args.amount) : Math.abs(args.amount);
    const newAvailable = wallet.availableBalance + adjustment;
    if (newAvailable < 0) {
      throw new Error("Insufficient available balance for debit adjustment");
    }

    const now = Date.now();
    await ctx.db.patch(wallet._id, {
      availableBalance: newAvailable,
      totalEarned: adjustment > 0 ? wallet.totalEarned + adjustment : wallet.totalEarned,
      updatedAt: now,
    });

    // Ledger transaction record
    await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      type: "ADMIN_ADJUSTMENT",
      amount: adjustment,
      balanceAfter: newAvailable,
      description: `Admin adjustment: ${args.reason}`,
      status: "completed",
      createdAt: now,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "security",
      title: "Wallet Adjustment",
      message: `An adjustment of ${adjustment > 0 ? "+" : ""}${adjustment} has been made to your wallet. Reason: ${args.reason}`,
      read: false,
      actionUrl: "/dashboard/withdrawals",
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "ADMIN_WALLET_ADJUSTMENT",
      entityType: "wallets",
      entityId: wallet._id,
      previousValue: `₹${wallet.availableBalance}`,
      newValue: `₹${newAvailable}`,
      reason: args.reason,
      timestamp: now,
    });

    return { success: true, newBalance: newAvailable };
  },
});
