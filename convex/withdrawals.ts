import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

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

export const generateWithdrawalQrUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const requestWithdrawal = mutation({
  args: {
    token: v.string(),
    amount: v.number(),
    payoutMethod: v.string(), // "bank_transfer" | "upi" | "paypal" | "upi_qr"
    payoutDetails: v.object({
      accountNumber: v.optional(v.string()),
      ifscCode: v.optional(v.string()),
      bankName: v.optional(v.string()),
      accountHolderName: v.optional(v.string()),
      upiId: v.optional(v.string()),
      paypalEmail: v.optional(v.string()),
      qrImageUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const validMethods = ["bank_transfer", "upi", "paypal", "upi_qr"];
    if (!validMethods.includes(args.payoutMethod)) {
      throw new Error("Invalid payout method");
    }

    if (args.payoutMethod === "upi") {
      if (!args.payoutDetails.upiId || !args.payoutDetails.upiId.includes("@")) {
        throw new Error("A valid UPI ID is required for UPI payouts");
      }
    } else if (args.payoutMethod === "bank_transfer") {
      if (
        !args.payoutDetails.accountNumber ||
        !args.payoutDetails.ifscCode ||
        !args.payoutDetails.accountHolderName ||
        !args.payoutDetails.bankName
      ) {
        throw new Error("All bank details are required for bank payouts");
      }
    } else if (args.payoutMethod === "upi_qr") {
      if (
        !args.payoutDetails.qrImageUrl ||
        args.payoutDetails.qrImageUrl.startsWith("http") ||
        !/^[a-zA-Z0-9_-]{10,}$/.test(args.payoutDetails.qrImageUrl)
      ) {
        throw new Error("A valid UPI QR image is required for QR payouts");
      }
      const resolved = await ctx.storage.getUrl(args.payoutDetails.qrImageUrl);
      if (!resolved) {
        throw new Error("Uploaded QR image no longer exists, please upload again");
      }
    } else if (args.payoutMethod === "paypal") {
      if (!args.payoutDetails.paypalEmail || !args.payoutDetails.paypalEmail.includes("@")) {
        throw new Error("A valid PayPal email is required for PayPal payouts");
      }
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();

    if (!wallet) throw new Error("Wallet not found");

    // Fetch withdrawal settings
    const settingsRecord = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", "withdrawals"))
      .first();

    const withdrawalSettings = settingsRecord?.value || {
      minimumWithdrawal: 1000,
      maximumWithdrawal: 100000,
      dailyLimit: 25000,
      feePercentage: 2,
      fixedFee: 0,
    };

    if (args.amount < withdrawalSettings.minimumWithdrawal) {
      throw new Error(`Minimum withdrawal amount is ₹${withdrawalSettings.minimumWithdrawal}`);
    }
    if (args.amount > withdrawalSettings.maximumWithdrawal) {
      throw new Error(`Maximum withdrawal amount per request is ₹${withdrawalSettings.maximumWithdrawal}`);
    }
    if (args.amount > wallet.availableBalance) {
      throw new Error("Requested amount exceeds your available balance");
    }

    // Check pending withdrawals
    const pendingWithdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("status"), "requested"))
      .collect();

    if (pendingWithdrawals.length > 0) {
      throw new Error("You already have a pending withdrawal under review");
    }

    // Calculate fee
    const feePercentage = withdrawalSettings.feePercentage || 0;
    const fee = Math.round((args.amount * feePercentage) / 100) + (withdrawalSettings.fixedFee || 0);
    const netAmount = Math.max(0, args.amount - fee);

    const now = Date.now();

    // Deduct available balance immediately into pending withdrawal
    const newAvailable = wallet.availableBalance - args.amount;
    await ctx.db.patch(wallet._id, {
      availableBalance: newAvailable,
      updatedAt: now,
    });

    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId: session.userId,
      amount: args.amount,
      fee,
      netAmount,
      payoutMethod: args.payoutMethod,
      payoutDetails: args.payoutDetails,
      status: "requested",
      requestedAt: now,
    });

    // Record ledger entry
    await ctx.db.insert("walletTransactions", {
      userId: session.userId,
      type: "WITHDRAWAL",
      amount: -args.amount,
      balanceAfter: newAvailable,
      referenceId: withdrawalId,
      description: `Withdrawal request of ₹${args.amount} (${args.payoutMethod.toUpperCase()})`,
      status: "pending",
      createdAt: now,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId: session.userId,
      type: "withdrawal",
      title: "Withdrawal Request Submitted",
      message: `Your withdrawal request of ₹${args.amount} (Net: ₹${netAmount}) has been submitted for processing.`,
      read: false,
      actionUrl: "/dashboard/withdrawals",
      createdAt: now,
    });

    return { success: true, withdrawalId };
  },
});

export const getUserWithdrawals = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    withdrawals.sort((a, b) => b.requestedAt - a.requestedAt);

    const detailed = await Promise.all(
      withdrawals.map(async (w) => {
        let qrImageUrl: string | null = null;
        if (
          w.payoutMethod === "upi_qr" &&
          w.payoutDetails?.qrImageUrl &&
          !w.payoutDetails.qrImageUrl.startsWith("http")
        ) {
          qrImageUrl = (await ctx.storage.getUrl(w.payoutDetails.qrImageUrl)) || null;
        }
        return {
          ...w,
          qrImageUrl,
        };
      })
    );

    return detailed;
  },
});

// Admin Withdrawals Management
export const getAllWithdrawalsAdmin = query({
  args: { token: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    let withdrawals = await ctx.db.query("withdrawals").collect();
    if (args.status) {
      withdrawals = withdrawals.filter((w) => w.status === args.status);
    }
    withdrawals.sort((a, b) => b.requestedAt - a.requestedAt);

    const detailed = await Promise.all(
      withdrawals.map(async (w) => {
        const user = await ctx.db.get(w.userId);
        let qrImageUrl: string | null = null;
        if (
          w.payoutMethod === "upi_qr" &&
          w.payoutDetails?.qrImageUrl &&
          !w.payoutDetails.qrImageUrl.startsWith("http")
        ) {
          qrImageUrl = (await ctx.storage.getUrl(w.payoutDetails.qrImageUrl)) || null;
        }
        return {
          ...w,
          qrImageUrl,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
              }
            : null,
        };
      })
    );

    return detailed;
  },
});

export const updateWithdrawalStatus = mutation({
  args: {
    token: v.string(),
    withdrawalId: v.id("withdrawals"),
    status: v.string(), // "approved" | "processing" | "completed" | "rejected"
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const withdrawal = await ctx.db.get(args.withdrawalId);
    if (!withdrawal) throw new Error("Withdrawal not found");

    const previousStatus = withdrawal.status;
    const now = Date.now();

    const finalStates = ["completed", "rejected"];
    if (finalStates.includes(previousStatus)) {
      throw new Error(`Cannot change a ${previousStatus} withdrawal`);
    }
    if (args.status === previousStatus) {
      throw new Error(`Withdrawal is already ${args.status}`);
    }
    if (args.status === "completed" && previousStatus === "requested") {
      throw new Error("Withdrawal must be approved/processing before completion");
    }

    await ctx.db.patch(args.withdrawalId, {
      status: args.status,
      adminNote: args.adminNote,
      processedAt: finalStates.includes(args.status) ? now : undefined,
    });

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", withdrawal.userId))
      .first();

    if (wallet) {
      if (args.status === "completed") {
        // Mark ledger entry completed
        const pendingTx = await ctx.db
          .query("walletTransactions")
          .withIndex("by_userId", (q) => q.eq("userId", withdrawal.userId))
          .filter((q) =>
            q.and(
              q.eq(q.field("type"), "WITHDRAWAL"),
              q.eq(q.field("referenceId"), args.withdrawalId)
            )
          )
          .first();
        if (pendingTx) {
          await ctx.db.patch(pendingTx._id, { status: "completed" });
        }
        await ctx.db.patch(wallet._id, {
          totalWithdrawn: wallet.totalWithdrawn + withdrawal.amount,
          updatedAt: now,
        });
      } else if (args.status === "rejected") {
        // Refund amount back to available balance
        const restoredBalance = wallet.availableBalance + withdrawal.amount;
        await ctx.db.patch(wallet._id, {
          availableBalance: restoredBalance,
          updatedAt: now,
        });

        await ctx.db.insert("walletTransactions", {
          userId: withdrawal.userId,
          type: "REFUND",
          amount: withdrawal.amount,
          balanceAfter: restoredBalance,
          referenceId: args.withdrawalId,
          description: `Withdrawal rejected & refunded: ₹${withdrawal.amount}. Note: ${args.adminNote || "N/A"}`,
          status: "completed",
          createdAt: now,
        });
      }
    }

    // Notify user
    await ctx.db.insert("notifications", {
      userId: withdrawal.userId,
      type: "withdrawal",
      title: `Withdrawal ${args.status.toUpperCase()}`,
      message: `Your withdrawal of ₹${withdrawal.amount} has been marked as ${args.status}. ${
        args.adminNote ? `Note: ${args.adminNote}` : ""
      }`,
      read: false,
      actionUrl: "/dashboard/withdrawals",
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_WITHDRAWAL_STATUS",
      entityType: "withdrawals",
      entityId: args.withdrawalId,
      previousValue: previousStatus,
      newValue: args.status,
      reason: args.adminNote || "Admin processing",
      timestamp: now,
    });

    return { success: true };
  },
});
