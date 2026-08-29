import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requirePurchasedUser } from "./entitlements";

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

    const allSales = await ctx.db
      .query("affiliateSales")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", session.userId))
      .collect();

    const sales = allSales.filter((s) => !s.kind || s.kind === "direct");
    const chainSales = allSales.filter((s) => s.kind === "chain");

    let totalCommissionGenerated = 0;
    let pendingCommissions = 0;
    let approvedCommissions = 0;
    let availableCommissions = 0;
    let chainEarnings = 0;
    let pendingChainCommissions = 0;

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

    const detailedChain = await Promise.all(
      chainSales.map(async (s) => {
        const buyer = await ctx.db.get(s.buyerUserId);
        const program = await ctx.db.get(s.programId);

        chainEarnings += s.commissionAmount;
        if (s.status === "pending") pendingChainCommissions += s.commissionAmount;

        return {
          ...s,
          buyerName: buyer?.name || "Direct Customer",
          programName: program?.name || "Program",
        };
      })
    );

    detailedSales.sort((a, b) => b.createdAt - a.createdAt);
    detailedChain.sort((a, b) => b.createdAt - a.createdAt);

    return {
      referralCode: user.referralCode,
      totalReferrals: directReferrals.length,
      totalSalesCount: sales.length,
      totalCommissionGenerated,
      pendingCommissions,
      approvedCommissions,
      availableCommissions,
      chainEarnings,
      pendingChainCommissions,
      chainSales: detailedChain,
      sales: detailedSales,
    };
  },
});

async function getPositionMultiplier(
  ctx: any,
  userId: any,
  positionMultipliers: Record<string, number> | undefined
): Promise<number> {
  if (!positionMultipliers) return 1;
  const user = await ctx.db.get(userId);
  if (!user?.positionId) return 1;
  const pos = await ctx.db.get(user.positionId);
  const m =
    positionMultipliers[String(user.positionId)] ??
    (pos ? positionMultipliers[pos.name] : undefined);
  return m && m > 0 ? m : 1;
}

// Process Purchase with Configurable Affiliate Commission Engine
export const processPurchaseWithAffiliate = mutation({
  args: {
    token: v.string(),
    programId: v.optional(v.id("programs")),
    planId: v.optional(v.id("plans")),
    paymentMethod: v.string(),
    orderId: v.optional(v.id("paymentOrders")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    // Rate limit: 5 purchases per hour per user
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, {
      key: `purchase:${session.userId}`,
      max: 5,
      windowMs: 60 * 60 * 1000,
    });

    const buyer = await ctx.db.get(session.userId);
    if (!buyer) throw new Error("Buyer not found");

    // Rate limit: 5 purchases per hour per user
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, {
      key: `purchase:${session.userId}`,
      max: 5,
      windowMs: 60 * 60 * 1000,
    });

    // SECURITY: Only Razorpay-verified payments are accepted here.
    // Admin grants must use grantProgramAccess or grantPlanAccess mutations.
    const validPaymentMethods = ["razorpay"];
    if (!validPaymentMethods.includes(args.paymentMethod)) {
      throw new Error("Invalid payment method. Only razorpay is accepted for purchases.");
    }

    // Razorpay checkouts must point at a server-verified "paid" order.
    let paidOrder: any = null;
    if (args.paymentMethod === "razorpay") {
      if (!args.orderId) {
        throw new Error("Payment verification missing. Please complete the checkout payment.");
      }
      paidOrder = await ctx.db.get(args.orderId);
      if (!paidOrder || paidOrder.userId !== session.userId) {
        throw new Error("Payment order not found for this account");
      }
      if (paidOrder.status === "consumed") {
        throw new Error("This payment has already been applied to your account.");
      }
      if (paidOrder.status !== "paid") {
        throw new Error("Payment not completed. Contact support if you were charged.");
      }
      if (args.planId && paidOrder.planId !== args.planId) {
        throw new Error("Payment does not match this plan");
      }
    }

    const now = Date.now();
    const paymentId = `PAY_${now}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // ---------- PLAN PURCHASE: enroll buyer into every course in the bundle ----------
    if (args.planId) {
      const plan = await ctx.db.get(args.planId);
      if (!plan || plan.status !== "published") throw new Error("Plan not found");

      const owned = new Set(
        (
          await ctx.db
            .query("purchases")
            .withIndex("by_userId", (q) => q.eq("userId", session.userId))
            .filter((q) => q.eq(q.field("status"), "completed"))
            .collect()
        ).map((p: any) => p.programId.toString())
      );

      const newlyEnrolled: any[] = [];
      let firstPurchaseId: any = null;
      for (const pid of plan.programIds) {
        if (!owned.has(pid.toString())) {
          const pidInserted = await ctx.db.insert("purchases", {
            userId: session.userId,
            programId: pid,
            planId: plan._id,
            amount: 0,
            status: "completed",
            paymentId,
            paymentMethod: args.paymentMethod,
            createdAt: now,
          });
          if (!firstPurchaseId) firstPurchaseId = pidInserted;
          const prog = await ctx.db.get(pid);
          if (prog) newlyEnrolled.push(prog.name);
        }
      }

      // Enrollment done — burn the payment order so it can't be reused.
      if (paidOrder) {
        await ctx.db.patch(paidOrder._id, { status: "consumed", updatedAt: Date.now() });
      }

      await ctx.db.insert("notifications", {
        userId: session.userId,
        type: "course",
        title: "Plan Activated!",
        message:
          newlyEnrolled.length > 0
            ? `You now have access to ${newlyEnrolled.length} course${newlyEnrolled.length === 1 ? "" : "s"} in "${plan.name}". Happy learning!`
            : `You already had full access to everything in "${plan.name}".`,
        read: false,
        actionUrl: "/dashboard/programs",
        createdAt: now,
      });

      // Purchase confirmation email to buyer
      try {
        await ctx.scheduler.runAfter(0, internal.email.sendPurchaseConfirmationEmail, {
          email: buyer.email,
          name: buyer.name,
          itemName: plan.name,
          itemType: "plan",
          amount: plan.price,
          coursesIncluded: newlyEnrolled,
        });
      } catch (e) {
        console.error("Failed to schedule purchase confirmation email:", e);
      }

      // Affiliate commission on the PLAN price (once per sale)
      let commissionPaid = 0;
      if (buyer.referredBy && plan.price >= 2000) {
        const referrer = await ctx.db.get(buyer.referredBy);
        if (referrer && referrer._id.toString() !== buyer._id.toString() && referrer.status === "active") {
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
          if (affiliateSettings.enabled && plan.price >= affiliateSettings.minimumPurchaseAmount) {
            const referrerPurchases = await ctx.db
              .query("purchases")
              .withIndex("by_userId", (q) => q.eq("userId", referrer._id))
              .filter((q) => q.eq(q.field("status"), "completed"))
              .collect();
            let referrerMaxProgramPrice = 0;
            for (const rp of referrerPurchases) {
              const rpProg = rp.programId ? await ctx.db.get(rp.programId) : null;
              if (rpProg && rpProg.price > referrerMaxProgramPrice) {
                referrerMaxProgramPrice = rpProg.price;
              }
            }
            let commissionBasis = plan.price;
            if (affiliateSettings.commissionMethod === "lower_program_rule" && referrerPurchases.length > 0) {
              commissionBasis = Math.min(plan.price, referrerMaxProgramPrice);
            }
            let commissionAmount = Math.round((commissionBasis * (affiliateSettings.defaultPercentage || 50)) / 100);
            if (affiliateSettings.perSaleCap && affiliateSettings.perSaleCap > 0) {
              if (commissionAmount > affiliateSettings.perSaleCap) commissionAmount = affiliateSettings.perSaleCap;
            }
            if (commissionAmount > 0) {
              const holdingPeriodEndsAt = now + (affiliateSettings.holdingPeriodDays || 7) * 24 * 60 * 60 * 1000;
              await ctx.db.insert("affiliateSales", {
                purchaseId: firstPurchaseId,
                referrerUserId: referrer._id,
                buyerUserId: session.userId,
                programId: plan.programIds[0],
                saleAmount: plan.price,
                commissionAmount,
                status: "pending",
                awaitingConsumption: true,
                ruleUsed:
                  affiliateSettings.commissionMethod === "lower_program_rule"
                    ? `50% of Lower-Value Program (Min of â‚¹${plan.price} & â‚¹${referrerMaxProgramPrice}) - Plan Sale`
                    : `${affiliateSettings.defaultPercentage}% of Sale Amount (â‚¹${plan.price}) - Plan Sale`,
                holdingPeriodEndsAt,
                createdAt: now,
                updatedAt: now,
                kind: "direct",
              });
              await ctx.db.insert("notifications", {
                userId: referrer._id,
                type: "commission",
                title: "New Referral Sale!",
                message: `Your referral purchased the "${plan.name}" plan. Commission is pending confirmation.`,
                read: false,
                actionUrl: "/dashboard/wallet",
                createdAt: now,
              });
              // Affiliate commission email to referrer
              try {
                await ctx.scheduler.runAfter(0, internal.email.sendAffiliateSaleEmail, {
                  referrerEmail: referrer.email,
                  referrerName: referrer.name,
                  buyerName: buyer.name,
                  itemName: `the "${plan.name}" plan`,
                  saleAmount: plan.price,
                  commissionAmount,
                  holdingPeriodDays: affiliateSettings.holdingPeriodDays || 7,
                });
              } catch (e) {
                console.error("Failed to schedule affiliate sale email:", e);
              }
              commissionPaid = commissionAmount;
            }
          }
        }
      }

      return {
        success: true,
        kind: "plan",
        planId: plan._id,
        enrolledCount: newlyEnrolled.length,
        courses: newlyEnrolled,
        firstProgramId: plan.programIds[0],
        commissionAccrued: commissionPaid,
      };
    }

    // ---------- SINGLE PROGRAM PURCHASE ----------
    if (!args.programId) throw new Error("Provide programId or planId");
    const program = await ctx.db.get(args.programId);
    if (!program) throw new Error("Program not found");

    // Check if already purchased
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.and(q.eq(q.field("programId"), args.programId!), q.eq(q.field("status"), "completed")))
      .first();

    if (existing) {
      throw new Error("You have already purchased this program");
    }

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

    // Purchase confirmation email to buyer
    try {
      await ctx.scheduler.runAfter(0, internal.email.sendPurchaseConfirmationEmail, {
        email: buyer.email,
        name: buyer.name,
        itemName: program.name,
        itemType: "course",
        amount: program.price,
      });
    } catch (e) {
      console.error("Failed to schedule purchase confirmation email:", e);
    }

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
            ruleUsed = `50% of Lower-Value Program (Min of â‚¹${program.price} & â‚¹${referrerMaxProgramPrice})`;
          } else {
            ruleUsed = `${affiliateSettings.defaultPercentage}% of Sale Amount (â‚¹${program.price})`;
          }

          const commissionPercentage = affiliateSettings.defaultPercentage || 50;
          let commissionAmount = Math.round((commissionBasis * commissionPercentage) / 100);

          // Per-sale commission cap from settings, scaled by referrer position/level
          if (commissionAmount > 0 && affiliateSettings.perSaleCap && affiliateSettings.perSaleCap > 0) {
            let posMultiplier = 1;
            if (referrer.positionId) {
              const pos = await ctx.db.get(referrer.positionId);
              const m =
                affiliateSettings.positionMultipliers?.[String(referrer.positionId)] ??
                (pos ? affiliateSettings.positionMultipliers?.[pos.name] : undefined);
              posMultiplier = m && m > 0 ? m : 1;
            }
            const cap = Math.round(affiliateSettings.perSaleCap * posMultiplier);
            if (commissionAmount > cap) {
              commissionAmount = cap;
            }
          }

          if (commissionAmount > 0) {
            const holdingPeriodEndsAt = now + (affiliateSettings.holdingPeriodDays || 7) * 24 * 60 * 60 * 1000;

            const directSaleId = await ctx.db.insert("affiliateSales", {
              purchaseId,
              buyerUserId: buyer._id,
              referrerUserId: referrer._id,
              programId: args.programId,
              saleAmount: program.price,
              commissionAmount,
              status: "pending",
              awaitingConsumption: true,
              ruleUsed,
              holdingPeriodEndsAt,
              createdAt: now,
              updatedAt: now,
              kind: "direct",
            });

            // Update referrer pending balance
            let referrerWallet = await ctx.db
              .query("wallets")
              .withIndex("by_userId", (q) => q.eq("userId", referrer._id))
              .first();

            if (!referrerWallet) {
              // Auto-create wallet if missing (edge case: wallet deleted or never created)
              const walletId = await ctx.runMutation(internal.auth.createWallet, {
                userId: referrer._id,
                availableBalance: 0,
                pendingBalance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                workEarnings: 0,
                affiliateEarnings: 0,
                updatedAt: now,
              });
              referrerWallet = await ctx.db.get(walletId);
            }

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
              message: `You earned â‚¹${commissionAmount} commission on ${buyer.name}'s purchase of "${program.name}". (Pending holding period).`,
              read: false,
              actionUrl: "/dashboard/affiliate",
              createdAt: now,
            });

            // Affiliate commission email to referrer
            try {
              await ctx.scheduler.runAfter(0, internal.email.sendAffiliateSaleEmail, {
                referrerEmail: referrer.email,
                referrerName: referrer.name,
                buyerName: buyer.name,
                itemName: `"${program.name}"`,
                saleAmount: program.price,
                commissionAmount,
                holdingPeriodDays: affiliateSettings.holdingPeriodDays || 7,
              });
            } catch (e) {
              console.error("Failed to schedule affiliate sale email:", e);
            }

            // Chain / upline commission: the referrer's own referrer earns X% of this commission
            if (affiliateSettings.chainEnabled && referrer.referredBy) {
              const upline = await ctx.db.get(referrer.referredBy);
              const chainPct =
                upline?.positionId && affiliateSettings.chainLevels
                  ? affiliateSettings.chainLevels[String(upline.positionId)] || 0
                  : 0;

              if (
                upline &&
                upline._id.toString() !== referrer._id.toString() &&
                upline._id.toString() !== buyer._id.toString() &&
                upline.status === "active" &&
                chainPct > 0
              ) {
                let chainAmount = Math.round((commissionAmount * chainPct) / 100);

                // Per-sale cap for the upline, scaled by their position
                if (affiliateSettings.perSaleCap && affiliateSettings.perSaleCap > 0) {
                  const chainPosMultiplier = await getPositionMultiplier(
                    ctx,
                    upline._id,
                    affiliateSettings.positionMultipliers
                  );
                  const chainCap = Math.round(affiliateSettings.perSaleCap * chainPosMultiplier);
                  if (chainAmount > chainCap) chainAmount = chainCap;
                }

                if (chainAmount > 0) {
                  const chainSaleId = await ctx.db.insert("affiliateSales", {
                    purchaseId,
                    buyerUserId: buyer._id,
                    referrerUserId: upline._id,
                    programId: args.programId,
                    saleAmount: program.price,
                    commissionAmount: chainAmount,
                    status: "pending",
                    awaitingConsumption: true,
                    ruleUsed: `${chainPct}% of downline's ${commissionAmount} commission (Chain level 1)`,
                    holdingPeriodEndsAt,
                    createdAt: now,
                    updatedAt: now,
                    kind: "chain",
                    parentSaleId: directSaleId,
                    chainLevel: 1,
                    baseCommissionAmount: commissionAmount,
                  });

                  let uplineWallet = await ctx.db
                    .query("wallets")
                    .withIndex("by_userId", (q) => q.eq("userId", upline._id))
                    .first();

                  if (!uplineWallet) {
                    const walletId = await ctx.runMutation(internal.auth.createWallet, {
                      userId: upline._id,
                      availableBalance: 0,
                      pendingBalance: 0,
                      totalEarned: 0,
                      totalWithdrawn: 0,
                      workEarnings: 0,
                      affiliateEarnings: 0,
                      updatedAt: now,
                    });
                    uplineWallet = await ctx.db.get(walletId);
                  }

                  if (uplineWallet) {
                    await ctx.db.patch(uplineWallet._id, {
                      pendingBalance: uplineWallet.pendingBalance + chainAmount,
                      updatedAt: now,
                    });
                  }

                  await ctx.db.insert("notifications", {
                    userId: upline._id,
                    type: "affiliate",
                    title: "Chain Commission Earned!",
                    message: `You earned â‚¹${chainAmount} from ${referrer.name}'s affiliate commission on ${buyer.name}'s purchase of "${program.name}". (Pending holding period).`,
                    read: false,
                    actionUrl: "/dashboard/wallet",
                    createdAt: now,
                  });
                }
              }
            }
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

    if (previousStatus !== "pending") {
      throw new Error("This commission has already been processed");
    }
    const now = Date.now();
    if (!["approved", "available", "rejected", "reversed"].includes(args.status)) {
      throw new Error("Invalid commission status");
    }

    await ctx.db.patch(args.saleId, {
      status: args.status,
      updatedAt: now,
    });

    const isCredit = args.status === "available" || args.status === "approved";
    const isReject = args.status === "rejected" || args.status === "reversed";

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", sale.referrerUserId))
      .first();

    if (wallet) {
      if (isCredit) {
        // Enforce daily/monthly commission caps from settings, scaled by referrer position
        const affiliateSettings = (await ctx.db
          .query("adminSettings")
          .withIndex("by_key", (q) => q.eq("key", "affiliate"))
          .first())?.value as any;
        if (affiliateSettings) {
          const posMultiplier = await getPositionMultiplier(
            ctx,
            sale.referrerUserId,
            affiliateSettings.positionMultipliers
          );
          const scale = (cap: number | undefined) =>
            cap && cap > 0 ? Math.round(cap * posMultiplier) : 0;

          const recentComm = await ctx.db
            .query("walletTransactions")
            .withIndex("by_userId", (q) => q.eq("userId", sale.referrerUserId))
            .filter((q) =>
              q.and(
                q.or(
                  q.eq(q.field("type"), "AFFILIATE_COMMISSION"),
                  q.eq(q.field("type"), "CHAIN_COMMISSION")
                ),
                q.eq(q.field("status"), "completed"),
                q.gte(q.field("createdAt"), now - 30 * 24 * 60 * 60 * 1000)
              )
            )
            .collect();

          const dayCap = scale(affiliateSettings.dailyCommissionCap);
          const dayTotal =
            recentComm
              .filter((t) => t.createdAt >= now - 24 * 60 * 60 * 1000)
              .reduce((s, t) => s + t.amount, 0) + sale.commissionAmount;
          if (dayCap > 0 && dayTotal > dayCap) {
            throw new Error(
              `Daily affiliate commission limit of â‚¹${dayCap} exceeded for this user level`
            );
          }

          const monthCap = scale(affiliateSettings.monthlyCommissionCap);
          const monthTotal =
            recentComm.reduce((s, t) => s + t.amount, 0) + sale.commissionAmount;
          if (monthCap > 0 && monthTotal > monthCap) {
            throw new Error(
              `Monthly affiliate commission limit of â‚¹${monthCap} exceeded for this user level`
            );
          }
        }

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
          type: sale.kind === "chain" ? "CHAIN_COMMISSION" : "AFFILIATE_COMMISSION",
          amount: sale.commissionAmount,
          balanceAfter: newAvailable,
          referenceId: args.saleId,
          description:
            sale.kind === "chain"
              ? `Chain commission approved (${sale.chainLevel ? `level ${sale.chainLevel}, ` : ""}${sale.baseCommissionAmount ? `${sale.baseCommissionAmount} base` : ""}): â‚¹${sale.commissionAmount}`
              : `Affiliate commission approved: â‚¹${sale.commissionAmount}`,
          status: "completed",
          createdAt: now,
        });
      } else if (isReject) {
        // Deduct from pending
        const newPending = Math.max(0, wallet.pendingBalance - sale.commissionAmount);
        await ctx.db.patch(wallet._id, {
          pendingBalance: newPending,
          updatedAt: now,
        });
      }
    }

    // Cascade to chain commissions derived from a direct sale
    if (sale.kind !== "chain" && (isCredit || isReject)) {
      const children = await ctx.db
        .query("affiliateSales")
        .withIndex("by_parentSaleId", (q) => q.eq("parentSaleId", sale._id))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
      for (const child of children) {
        await ctx.db.patch(child._id, {
          status: args.status,
          updatedAt: now,
        });
        const childWallet = await ctx.db
          .query("wallets")
          .withIndex("by_userId", (q) => q.eq("userId", child.referrerUserId))
          .first();
        if (!childWallet) continue;
        if (isCredit) {
          const newPending = Math.max(0, childWallet.pendingBalance - child.commissionAmount);
          const newAvailable = childWallet.availableBalance + child.commissionAmount;
          await ctx.db.patch(childWallet._id, {
            pendingBalance: newPending,
            availableBalance: newAvailable,
            totalEarned: childWallet.totalEarned + child.commissionAmount,
            affiliateEarnings: childWallet.affiliateEarnings + child.commissionAmount,
            updatedAt: now,
          });
          await ctx.db.insert("walletTransactions", {
            userId: child.referrerUserId,
            type: "CHAIN_COMMISSION",
            amount: child.commissionAmount,
            balanceAfter: newAvailable,
            referenceId: child._id,
            description: `Chain commission approved (level ${child.chainLevel || 1}): â‚¹${child.commissionAmount}`,
            status: "completed",
            createdAt: now,
          });
        } else {
          await ctx.db.patch(childWallet._id, {
            pendingBalance: Math.max(0, childWallet.pendingBalance - child.commissionAmount),
            updatedAt: now,
          });
        }
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

// ── Auto-release engine ─────────────────────────────────────────────────────
// Moves pending commissions to "available" once their holding period ends.
// Runs hourly via cron. Enforces daily/monthly commission caps — capped sales
// stay pending for manual admin review. Notifies the referrer on release.
export const autoReleaseCommissions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const dueSales = await ctx.db
      .query("affiliateSales")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.lte(q.field("holdingPeriodEndsAt"), now))
      .collect();

    if (dueSales.length === 0) {
      return { released: 0, deferredForCaps: 0, heldForKyc: 0 };
    }

    const settingsRecord = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", "affiliate"))
      .first();
    const affiliateSettings = settingsRecord?.value as any;

    // Per-referrer cap cache: dayCap/monthCap + running totals from ledger
    type CapInfo = {
      dayCap: number;
      monthCap: number;
      dayTotal: number;
      monthTotal: number;
    };
    const capCache = new Map<string, CapInfo>();

    const getCapInfo = async (referrerId: string): Promise<CapInfo> => {
      const cached = capCache.get(referrerId);
      if (cached) return cached;

      let dayCap = 0;
      let monthCap = 0;
      if (affiliateSettings) {
        const posMultiplier = await getPositionMultiplier(
          ctx,
          referrerId as any,
          affiliateSettings.positionMultipliers
        );
        const scale = (cap: number | undefined) =>
          cap && cap > 0 ? Math.round(cap * posMultiplier) : 0;
        dayCap = scale(affiliateSettings.dailyCommissionCap);
        monthCap = scale(affiliateSettings.monthlyCommissionCap);
      }

      const recentComm = await ctx.db
        .query("walletTransactions")
        .withIndex("by_userId", (q) => q.eq("userId", referrerId as any))
        .filter((q) =>
          q.and(
            q.or(
              q.eq(q.field("type"), "AFFILIATE_COMMISSION"),
              q.eq(q.field("type"), "CHAIN_COMMISSION")
            ),
            q.eq(q.field("status"), "completed"),
            q.gte(q.field("createdAt"), now - 30 * 24 * 60 * 60 * 1000)
          )
        )
        .collect();

      const info: CapInfo = {
        dayCap,
        monthCap,
        dayTotal: recentComm
          .filter((t) => t.createdAt >= now - 24 * 60 * 60 * 1000)
          .reduce((s, t) => s + t.amount, 0),
        monthTotal: recentComm.reduce((s, t) => s + t.amount, 0),
      };
      capCache.set(referrerId, info);
      return info;
    };

    let released = 0;
    let deferredForCaps = 0;
    let heldForKyc = 0;

    for (const sale of dueSales) {
      // TDS compliance: commissions stay pending until the referrer's KYC is
      // verified. They auto-release on the next hourly run post-approval.
      const referrer = await ctx.db.get(sale.referrerUserId);
      if (!referrer || (referrer.kycStatus || "not_submitted") !== "verified") {
        heldForKyc++;
        continue;
      }

      // Enforce configured caps; defer capped sales to manual review
      const capInfo = await getCapInfo(sale.referrerUserId);
      if (capInfo.dayCap > 0 && capInfo.dayTotal + sale.commissionAmount > capInfo.dayCap) {
        deferredForCaps++;
        continue;
      }
      if (capInfo.monthCap > 0 && capInfo.monthTotal + sale.commissionAmount > capInfo.monthCap) {
        deferredForCaps++;
        continue;
      }

      const wallet = await ctx.db
        .query("wallets")
        .withIndex("by_userId", (q) => q.eq("userId", sale.referrerUserId))
        .first();
      if (!wallet) continue;

      const newPending = Math.max(0, wallet.pendingBalance - sale.commissionAmount);
      const newAvailable = wallet.availableBalance + sale.commissionAmount;
      await ctx.db.patch(wallet._id, {
        pendingBalance: newPending,
        availableBalance: newAvailable,
        totalEarned: wallet.totalEarned + sale.commissionAmount,
        affiliateEarnings: wallet.affiliateEarnings + sale.commissionAmount,
        updatedAt: now,
      });

      await ctx.db.patch(sale._id, {
        status: "available",
        updatedAt: now,
      });

      await ctx.db.insert("walletTransactions", {
        userId: sale.referrerUserId,
        type: sale.kind === "chain" ? "CHAIN_COMMISSION" : "AFFILIATE_COMMISSION",
        amount: sale.commissionAmount,
        balanceAfter: newAvailable,
        referenceId: sale._id,
        description:
          sale.kind === "chain"
            ? `Chain commission released after holding period: ₹${sale.commissionAmount}`
            : `Affiliate commission released after holding period: ₹${sale.commissionAmount}`,
        status: "completed",
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: sale.referrerUserId,
        type: sale.kind === "chain" ? "affiliate" : "commission",
        title: "Commission Released!",
        message: `₹${sale.commissionAmount} has been added to your available wallet balance and is ready to withdraw.`,
        read: false,
        actionUrl: "/dashboard/wallet",
        createdAt: now,
      });

      // Update running cap totals so subsequent sales in this batch respect caps
      capInfo.dayTotal += sale.commissionAmount;
      capInfo.monthTotal += sale.commissionAmount;
      released++;
    }

    return { released, deferredForCaps, heldForKyc };
  },
});
