import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { requirePurchasedUser, requireKycVerified } from "./entitlements";
import { computeTds } from "./tds";
import { isValidImageUrl } from "../shared/src/utils";

async function requireUserId(ctx: any, token: string): Promise<string> {
  const session = await ctx.runQuery(internal.paymentsData.getSessionByToken, {
    token,
  });
  if (!session) throw new Error("Unauthorized");
  return session.userId;
}

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
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx, args.token);
    if (!userId) throw new Error("Unauthorized");
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
    payoutMethodId: v.optional(v.id("payoutMethods")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    // Resolve from a saved payout method if provided (details copied into the withdrawal record)
    const sessionUser = await requirePurchasedUser(ctx, args.token);
    // TDS compliance: money out requires a verified KYC (PAN on file)
    await requireKycVerified(ctx, sessionUser);
    if (args.payoutMethodId) {
      const saved = await ctx.db.get(args.payoutMethodId);
      if (!saved || saved.userId.toString() !== session.userId.toString()) {
        throw new Error("Payout method not found or unauthorized");
      }
      if (!["bank_transfer", "upi", "upi_qr"].includes(saved.type)) {
        throw new Error("Invalid saved payout method type");
      }
      (args as any).payoutMethod = saved.type;
      (args as any).payoutDetails = { ...saved.details } as any;
    }

    const validMethods = ["bank_transfer", "upi", "paypal", "upi_qr"];
    if (!validMethods.includes(args.payoutMethod)) {
      throw new Error("Invalid payout method");
    }

    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    if (args.payoutMethod === "upi") {
      if (!args.payoutDetails.upiId || !args.payoutDetails.upiId.includes("@")) {
        throw new Error("A valid UPI ID is required for UPI payouts");
      }
      if (args.payoutDetails.upiId.length < 5 || args.payoutDetails.upiId.length > 50) {
        throw new Error("UPI ID must be between 5 and 50 characters");
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
      if (!/^\d{9,18}$/.test(args.payoutDetails.accountNumber)) {
        throw new Error("Account number must be 9-18 digits");
      }
      if (!/^[A-Za-z0-9]{11}$/.test(args.payoutDetails.ifscCode)) {
        throw new Error("IFSC code must be exactly 11 alphanumeric characters");
      }
    } else if (args.payoutMethod === "upi_qr") {
      if (
        !args.payoutDetails.qrImageUrl ||
        args.payoutDetails.qrImageUrl.startsWith("http") ||
        !/^[a-zA-Z0-9_-]{10,}$/.test(args.payoutDetails.qrImageUrl)
      ) {
        throw new Error("A valid UPI QR image is required for QR payouts");
      }
      // Validate the QR image is from Convex storage (trusted source)
      if (!isValidImageUrl(args.payoutDetails.qrImageUrl)) {
        throw new Error("Invalid QR image: only uploaded images from Convex storage are allowed");
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

    const now = Date.now();

    // Fetch withdrawal settings
    const settingsRecord = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", "withdrawals"))
      .first();

    const withdrawalSettings = settingsRecord?.value || {
      minimumWithdrawal: 1000,
      maximumWithdrawal: 100000,
      dailyLimit: 25000,
      monthlyLimit: 200000,
      feePercentage: 2,
      fixedFee: 0,
      maxFee: 0, // 0 = no cap
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

    // Enforce configured allowed payout methods
    const allowedMethods =
      withdrawalSettings.allowedMethods && withdrawalSettings.allowedMethods.length > 0
        ? withdrawalSettings.allowedMethods
        : ["upi", "bank_transfer", "upi_qr", "paypal"];
    if (!allowedMethods.includes(args.payoutMethod)) {
      throw new Error("This payout method is not currently supported");
    }

    // Validate payout details based on method
    const pd = args.payoutDetails;
    if (args.payoutMethod === "bank_transfer") {
      if (!pd.accountNumber || !/^\d{9,18}$/.test(pd.accountNumber)) {
        throw new Error("Invalid bank account number (9-18 digits required)");
      }
      if (!pd.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(pd.ifscCode)) {
        throw new Error("Invalid IFSC code (e.g., ABCD0123456)");
      }
      if (!pd.accountHolderName || pd.accountHolderName.trim().length < 2) {
        throw new Error("Account holder name is required");
      }
    } else if (args.payoutMethod === "upi" || args.payoutMethod === "upi_qr") {
      if (!pd.upiId || !pd.upiId.includes("@") || pd.upiId.length > 50) {
        throw new Error("Invalid UPI ID (must contain @ and be under 50 chars)");
      }
    } else if (args.payoutMethod === "paypal") {
      if (!pd.paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pd.paypalEmail)) {
        throw new Error("Invalid PayPal email address");
      }
    }

    // Enforce daily and monthly withdrawal limits from settings
    const windowStart = (windowMs: number) => now - windowMs;
    const recentWithdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.and(q.gte(q.field("requestedAt"), windowStart(30 * 24 * 60 * 60 * 1000)), q.neq(q.field("status"), "rejected")))
      .collect();

    const dailyWindowMs = 24 * 60 * 60 * 1000;
    const dayTotal =
      recentWithdrawals
        .filter((w) => w.requestedAt >= windowStart(dailyWindowMs))
        .reduce((sum, w) => sum + w.amount, 0) + args.amount;
    if (withdrawalSettings.dailyLimit && dayTotal > withdrawalSettings.dailyLimit) {
      throw new Error(`Daily withdrawal limit of ₹${withdrawalSettings.dailyLimit} exceeded`);
    }

    const monthTotal =
      recentWithdrawals.reduce((sum, w) => sum + w.amount, 0) + args.amount;
    if (withdrawalSettings.monthlyLimit && monthTotal > withdrawalSettings.monthlyLimit) {
      throw new Error(`Monthly withdrawal limit of ₹${withdrawalSettings.monthlyLimit} exceeded`);
    }

    // Check pending withdrawals (requested OR processing — both are in-flight)
    const pendingWithdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.or(q.eq(q.field("status"), "requested"), q.eq(q.field("status"), "processing")))
      .collect();

    if (pendingWithdrawals.length > 0) {
      throw new Error("You already have a pending withdrawal under review");
    }

    // Calculate fee: percentage + flat, optionally capped at maxFee (0 = no cap)
    const feePercentage = withdrawalSettings.feePercentage || 0;
    const rawFee =
      Math.round((args.amount * feePercentage) / 100) + (withdrawalSettings.fixedFee || 0);
    const maxFee = withdrawalSettings.maxFee || 0;
    const fee = maxFee > 0 ? Math.min(rawFee, maxFee) : rawFee;

    // ── TDS computation (Apr-Mar FY, per earning category) ──
    const tds = await computeTds(ctx, session.userId, args.amount, now);
    const tdsAmount = tds?.total || 0;

    const netAmount = Math.max(0, args.amount - fee - tdsAmount);

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
      tdsAmount: tdsAmount > 0 ? tdsAmount : undefined,
      tdsBreakdown: tds?.breakdown || undefined,
      requestedAt: now,
    });

    // Record ledger entry
    await ctx.db.insert("walletTransactions", {
      userId: session.userId,
      type: "WITHDRAWAL",
      amount: -args.amount,
      balanceAfter: newAvailable,
      referenceId: withdrawalId,
      description: `Withdrawal request of ₹${args.amount} (${args.payoutMethod.toUpperCase()})${
        tdsAmount > 0 ? ` · TDS ₹${tdsAmount}` : ""
      }`,
      status: "pending",
      createdAt: now,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId: session.userId,
      type: "withdrawal",
      title: "Withdrawal Request Submitted",
      message: `Your withdrawal request of ₹${args.amount} (Net: ₹${netAmount}${
        tdsAmount > 0 ? `, TDS deducted: ₹${tdsAmount}` : ""
      }) has been submitted for processing.`,
      read: false,
      actionUrl: "/dashboard/wallet",
      createdAt: now,
    });

    // Instant acknowledgment email
    try {
      const user = await ctx.db.get(session.userId);
      if (user) {
        await ctx.scheduler.runAfter(0, internal.email.sendWithdrawalRequestEmail, {
          email: user.email,
          name: user.name,
          amount: args.amount,
          netAmount,
          fee,
          payoutMethod: args.payoutMethod,
          tdsAmount: tdsAmount > 0 ? tdsAmount : undefined,
        });
      }
    } catch (e) {
      console.error("Failed to schedule withdrawal request email:", e);
    }

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

    await requirePurchasedUser(ctx, args.token);

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

    if (!wallet) {
      throw new Error("User wallet not found — cannot process withdrawal. Contact support.");
    }

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

      // Mark original WITHDRAWAL ledger entry as rejected (not orphaned pending)
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
        await ctx.db.patch(pendingTx._id, { status: "rejected" });
      }

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

    // Notify user
    await ctx.db.insert("notifications", {
      userId: withdrawal.userId,
      type: "withdrawal",
      title: `Withdrawal ${args.status.toUpperCase()}`,
      message: `Your withdrawal of ₹${withdrawal.amount} has been marked as ${args.status}. ${
        args.adminNote ? `Note: ${args.adminNote}` : ""
      }`,
      read: false,
      actionUrl: "/dashboard/wallet",
      createdAt: now,
    });

    // Email on final outcome (completed / rejected)
    if (args.status === "completed" || args.status === "rejected") {
      const user = await ctx.db.get(withdrawal.userId);
      if (user) {
        try {
          await ctx.scheduler.runAfter(0, internal.email.sendWithdrawalStatusEmail, {
            email: user.email,
            name: user.name,
            amount: withdrawal.amount,
            status: args.status,
            adminNote: args.adminNote,
          });
        } catch (e) {
          console.error("Failed to schedule withdrawal status email:", e);
        }
      }
    }

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

// ── Live cost preview (withdrawal form) ─────────────────────────────────────
// Mirrors the exact request-time math: platform fee (% + flat, capped) and
// TDS (per earning category, Apr-Mar FY thresholds). Shows ₹0 lines too so
// users always see what charges apply.
export const previewWithdrawalCosts = query({
  args: { token: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError("Unauthorized");
    }

    const settingsRecord = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q: any) => q.eq("key", "withdrawals"))
      .first();
    const s = settingsRecord?.value || {};
    const feePercentage = s.feePercentage || 0;
    const fixedFee = s.fixedFee || 0;
    const maxFee = s.maxFee || 0;

    const rawFee =
      Math.round(((args.amount || 0) * feePercentage) / 100) + fixedFee;
    const fee = maxFee > 0 ? Math.min(rawFee, maxFee) : rawFee;

    const tds = await computeTds(ctx, session.userId, args.amount || 0, Date.now());
    const tdsTotal = tds?.total || 0;

    return {
      feeSettings: { feePercentage, fixedFee, maxFee },
      fee,
      tdsEnabled: !!tds,
      tdsTotal,
      net: Math.max(0, (args.amount || 0) - fee - tdsTotal),
    };
  },
});
