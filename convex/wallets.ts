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

    const user = await ctx.db.get(session.userId);
    const isDemo = user?.accountType === "demo";
    const demoConfig = user?.demoConfig || {};

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();

    // For demo accounts, use demo balances from demoConfig
    const demoWallet = isDemo && demoConfig ? {
      availableBalance: demoConfig.workBalance || 0,
      pendingBalance: 0,
      totalEarned: (demoConfig.workBalance || 0) + (demoConfig.partnerEarnings || 0),
      totalWithdrawn: demoConfig.totalWithdrawn || 0,
      workEarnings: demoConfig.workBalance || 0,
      affiliateEarnings: demoConfig.partnerEarnings || 0,
    } : null;

    const realTransactions = await ctx.db
      .query("walletTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    // For demo accounts, include fake transactions
    let transactions = realTransactions;
    if (isDemo && demoConfig.fakeTransactions) {
      const fakeTransactions = demoConfig.fakeTransactions.map((tx, idx) => ({
        _id: `demo-tx-${idx}` as any,
        _creationTime: tx.createdAt,
        userId: session.userId,
        type: tx.type === "credit" ? "WORK_PAYOUT" : tx.type === "partner_earning" ? "AFFILIATE_COMMISSION" : "ADMIN_ADJUSTMENT",
        amount: tx.amount * (tx.type === "debit" ? -1 : 1),
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
        referenceId: `demo-ref-${idx}`,
        balanceAfter: 0,
      }));
      transactions = [...fakeTransactions, ...realTransactions];
    }

    transactions.sort((a, b) => b.createdAt - a.createdAt);

    return {
      wallet: demoWallet || wallet || {
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

export const getAllWalletsAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const wallets = await ctx.db.query("wallets").collect();
    const detailed = await Promise.all(
      wallets.map(async (w) => {
        const user = await ctx.db.get(w.userId);
        const txs = await ctx.db
          .query("walletTransactions")
          .withIndex("by_userId", (q: any) => q.eq("userId", w.userId))
          .collect();
        return {
          ...w,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                referralCode: user.referralCode,
                cvStatus: user.cvStatus || "pending",
              }
            : null,
          transactionCount: txs.length,
          pendingWithdrawal: txs.some(
            (t) => t.type === "WITHDRAWAL" && t.status === "pending"
          ),
        };
      })
    );

    detailed.sort((a, b) => b.totalEarned - a.totalEarned);
    return detailed;
  },
});

export const getPayoutReport = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const jobs = await ctx.db.query("jobs").collect();
    const apps = await ctx.db.query("jobApplications").collect();
    const txs = await ctx.db.query("walletTransactions").collect();

    const report = await Promise.all(
      jobs.map(async (job) => {
        const jobApps = apps.filter((a) => a.jobId === job._id);

        const applicationIds = new Set(jobApps.map((a) => String(a._id)));
        const jobPayoutTxs = txs.filter(
          (t) => t.type === "WORK_PAYOUT" && applicationIds.has(String(t.referenceId))
        );

        const uniquePaidUsers = new Set(
          jobPayoutTxs.filter((t) => t.status === "completed").map((t) => String(t.userId))
        );

        return {
          jobId: job._id,
          title: job.title,
          category: job.category,
          payment: job.payment,
          applicationCount: jobApps.length,
          doingWorkCount: jobApps.filter((a) =>
            ["accepted", "in_progress", "under_review", "revision_required"].includes(a.status)
          ).length,
          completedCount: jobApps.filter((a) => a.status === "completed").length,
          paidCount: jobApps.filter((a) => a.paymentStatus === "paid").length,
          paidUsers: uniquePaidUsers.size,
          totalPaid: jobPayoutTxs
            .filter((t) => t.status === "completed")
            .reduce((s: number, t: any) => s + t.amount, 0),
        };
      })
    );

    report.sort((a, b) => b.totalPaid - a.totalPaid);

    const totals = {
      jobs: report.length,
      applications: report.reduce((s, r) => s + r.applicationCount, 0),
      doingWork: report.reduce((s, r) => s + r.doingWorkCount, 0),
      completed: report.reduce((s, r) => s + r.completedCount, 0),
      paid: report.reduce((s, r) => s + r.paidCount, 0),
      totalPaid: report.reduce((s, r) => s + r.totalPaid, 0),
    };

    return { report, totals };
  },
});

export const adminAdjustWallet = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    amount: v.number(), // positive to credit, negative to debit
    type: v.string(), // "CREDIT" | "DEBIT"
    reason: v.string(),
    earningsSource: v.optional(v.string()), // "work" | "affiliate" — which earnings counter to increment on credit
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
    if (!Number.isFinite(adjustment) || adjustment === 0) {
      throw new Error("Invalid adjustment amount");
    }
    const newAvailable = wallet.availableBalance + adjustment;
    if (newAvailable < 0) {
      throw new Error("Insufficient available balance for debit adjustment");
    }

    const now = Date.now();

    // Build patch: always update availableBalance + totalEarned (on credit)
    // If earningsSource is specified on credit, also increment the matching counter
    const patch: Record<string, any> = {
      availableBalance: newAvailable,
      updatedAt: now,
    };
    if (adjustment > 0) {
      patch.totalEarned = wallet.totalEarned + adjustment;
      if (args.earningsSource === "work") {
        patch.workEarnings = (wallet.workEarnings || 0) + adjustment;
      } else if (args.earningsSource === "affiliate") {
        patch.affiliateEarnings = (wallet.affiliateEarnings || 0) + adjustment;
      }
    }

    await ctx.db.patch(wallet._id, patch);

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
      actionUrl: "/dashboard/wallet",
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
