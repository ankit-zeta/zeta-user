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

// User Affiliate Overview Query
export const getUserAffiliateStats = query({
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
    if (!user) throw new Error("User not found");

    const directReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", session.userId))
      .collect();

    const sales = await ctx.db
      .query("affiliateSales")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", session.userId))
      .collect();

    let totalCommissionGenerated = 0;
    let pendingCommissions = 0;
    let approvedCommissions = 0;
    let availableCommissions = 0;

    const detailedSales = await Promise.all(
      sales.map(async (s) => {
        const buyer = await ctx.db.get(s.buyerUserId);
        const program = await ctx.db.get(s.programId);

        totalCommissionGenerated += s.commissionAmount;
        if (s.status === "pending") pendingCommissions += s.commissionAmount;
        if (s.status === "approved") approvedCommissions += s.commissionAmount;
        if (s.status === "available" || s.status === "paid") availableCommissions += s.commissionAmount;

        return {
          ...s,
          buyerName: buyer?.name || "Direct Customer",
          programName: program?.name || "Program",
        };
      })
    );

    detailedSales.sort((a, b) => b.createdAt - a.createdAt);

    return {
      referralCode: user.referralCode,
      totalReferrals: directReferrals.length,
      totalSalesCount: sales.length,
      totalCommissionGenerated,
      pendingCommissions,
      approvedCommissions,
      availableCommissions,
      sales: detailedSales,
    };
  },
});

// Process Purchase with Configurable Affiliate Commission Engine
export const processPurchaseWithAffiliate = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const buyer = await ctx.db.get(session.userId);
    const program = await ctx.db.get(args.programId);
    if (!buyer || !program) throw new Error("Buyer or Program not found");

    // Check if already purchased
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.and(q.eq(q.field("programId"), args.programId), q.eq(q.field("status"), "completed")))
      .first();

    if (existing) {
      throw new Error("You have already purchased this program");
    }

    const now = Date.now();
    const purchaseId = await ctx.db.insert("purchases", {
      userId: session.userId,
      programId: args.programId,
      amount: program.price,
      status: "completed",
      paymentId: `PAY_${now}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      paymentMethod: args.paymentMethod,
      createdAt: now,
    });

    // Send purchase confirmation notification
    await ctx.db.insert("notifications", {
      userId: session.userId,
      type: "course",
      title: "Enrollment Confirmed!",
      message: `You are now enrolled in "${program.name}". Start learning in your dashboard.`,
      read: false,
      actionUrl: `/dashboard/learning/${args.programId}`,
      createdAt: now,
    });

    // Check if buyer has a referrer
    if (buyer.referredBy && program.affiliateEnabled) {
      const referrer = await ctx.db.get(buyer.referredBy);
      if (referrer && referrer._id.toString() !== buyer._id.toString() && referrer.status === "active") {
        // Fetch admin affiliate settings
        const settingsRecord = await ctx.db
          .query("adminSettings")
          .withIndex("by_key", (q) => q.eq("key", "affiliate"))
          .first();

        const affiliateSettings = settingsRecord?.value || {
          enabled: true,
          commissionMethod: "lower_program_rule",
          defaultPercentage: 50,
          holdingPeriodDays: 7,
          minimumPurchaseAmount: 2000,
        };

        if (affiliateSettings.enabled && program.price >= affiliateSettings.minimumPurchaseAmount) {
          // Check referrer's owned programs to apply the lower-program rule
          const referrerPurchases = await ctx.db
            .query("purchases")
            .withIndex("by_userId", (q) => q.eq("userId", referrer._id))
            .filter((q) => q.eq(q.field("status"), "completed"))
            .collect();

          let referrerMaxProgramPrice = 0;
          for (const rp of referrerPurchases) {
            const rpProg = await ctx.db.get(rp.programId);
            if (rpProg && rpProg.price > referrerMaxProgramPrice) {
              referrerMaxProgramPrice = rpProg.price;
            }
          }

          // If referrer has at least one program (or if admin is referrer), calculate commission
          let commissionBasis = program.price;
          let ruleUsed = "Flat Percentage";

          if (affiliateSettings.commissionMethod === "lower_program_rule" && referrerPurchases.length > 0) {
            commissionBasis = Math.min(program.price, referrerMaxProgramPrice);
            ruleUsed = `50% of Lower-Value Program (Min of ₹${program.price} & ₹${referrerMaxProgramPrice})`;
          } else {
            ruleUsed = `${affiliateSettings.defaultPercentage}% of Sale Amount (₹${program.price})`;
          }

          const commissionPercentage = affiliateSettings.defaultPercentage || 50;
          const commissionAmount = Math.round((commissionBasis * commissionPercentage) / 100);

          if (commissionAmount > 0) {
            const holdingPeriodEndsAt = now + (affiliateSettings.holdingPeriodDays || 7) * 24 * 60 * 60 * 1000;

            await ctx.db.insert("affiliateSales", {
              purchaseId,
              buyerUserId: buyer._id,
              referrerUserId: referrer._id,
              programId: args.programId,
              saleAmount: program.price,
              commissionAmount,
              status: "pending",
              ruleUsed,
              holdingPeriodEndsAt,
              createdAt: now,
              updatedAt: now,
            });

            // Update referrer pending balance
            const referrerWallet = await ctx.db
              .query("wallets")
              .withIndex("by_userId", (q) => q.eq("userId", referrer._id))
              .first();

            if (referrerWallet) {
              await ctx.db.patch(referrerWallet._id, {
                pendingBalance: referrerWallet.pendingBalance + commissionAmount,
                updatedAt: now,
              });
            }

            // Notify referrer
            await ctx.db.insert("notifications", {
              userId: referrer._id,
              type: "affiliate",
              title: "New Affiliate Commission Earned!",
              message: `You earned ₹${commissionAmount} commission on ${buyer.name}'s purchase of "${program.name}". (Pending holding period).`,
              read: false,
              actionUrl: "/dashboard/affiliate",
              createdAt: now,
            });
          }
        }
      }
    }

    return { success: true, purchaseId };
  },
});

// Admin Affiliate Management
export const getAllAffiliateSalesAdmin = query({
  args: { token: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    let sales = await ctx.db.query("affiliateSales").collect();
    if (args.status) {
      sales = sales.filter((s) => s.status === args.status);
    }
    sales.sort((a, b) => b.createdAt - a.createdAt);

    const detailed = await Promise.all(
      sales.map(async (s) => {
        const buyer = await ctx.db.get(s.buyerUserId);
        const referrer = await ctx.db.get(s.referrerUserId);
        const program = await ctx.db.get(s.programId);
        return {
          ...s,
          buyer: buyer ? { _id: buyer._id, name: buyer.name, email: buyer.email } : null,
          referrer: referrer ? { _id: referrer._id, name: referrer.name, email: referrer.email, referralCode: referrer.referralCode } : null,
          program: program ? { _id: program._id, name: program.name, price: program.price } : null,
        };
      })
    );

    return detailed;
  },
});

export const updateCommissionStatus = mutation({
  args: {
    token: v.string(),
    saleId: v.id("affiliateSales"),
    status: v.string(), // "approved" | "available" | "rejected" | "reversed"
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("Sale record not found");

    const previousStatus = sale.status;
    const now = Date.now();

    await ctx.db.patch(args.saleId, {
      status: args.status,
      updatedAt: now,
    });

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", sale.referrerUserId))
      .first();

    if (wallet) {
      // If moving from pending to available:
      if (previousStatus === "pending" && (args.status === "available" || args.status === "approved")) {
        const newPending = Math.max(0, wallet.pendingBalance - sale.commissionAmount);
        const newAvailable = wallet.availableBalance + sale.commissionAmount;
        const newTotal = wallet.totalEarned + sale.commissionAmount;
        const newAff = wallet.affiliateEarnings + sale.commissionAmount;

        await ctx.db.patch(wallet._id, {
          pendingBalance: newPending,
          availableBalance: newAvailable,
          totalEarned: newTotal,
          affiliateEarnings: newAff,
          updatedAt: now,
        });

        await ctx.db.insert("walletTransactions", {
          userId: sale.referrerUserId,
          type: "AFFILIATE_COMMISSION",
          amount: sale.commissionAmount,
          balanceAfter: newAvailable,
          referenceId: args.saleId,
          description: `Affiliate commission approved: ₹${sale.commissionAmount}`,
          status: "completed",
          createdAt: now,
        });
      } else if (previousStatus === "pending" && (args.status === "rejected" || args.status === "reversed")) {
        // Deduct from pending
        const newPending = Math.max(0, wallet.pendingBalance - sale.commissionAmount);
        await ctx.db.patch(wallet._id, {
          pendingBalance: newPending,
          updatedAt: now,
        });
      }
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_COMMISSION_STATUS",
      entityType: "affiliateSales",
      entityId: args.saleId,
      previousValue: previousStatus,
      newValue: args.status,
      reason: args.reason,
      timestamp: now,
    });

    return { success: true };
  },
});
