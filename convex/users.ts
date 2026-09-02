import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { hashPassword, generateSalt, isValidEmail, isStrongPassword, sanitizeName, getUniqueReferralCode } from "./auth";

// Daily onboarding nudge: email verified users who signed up 2-10 days ago
// and have never purchased anything. Sends at most once per user (flag-gated).
export const sendOnboardingNudges = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const MIN_AGE_MS = 2 * 24 * 60 * 60 * 1000; // at least 2 days since signup
    const MAX_AGE_MS = 10 * 24 * 60 * 60 * 1000; // stop nudging after 10 days

    const activeUsers = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    let sent = 0;
    let skippedBuyers = 0;

    for (const u of activeUsers) {
      if (u.onboardingEmailSentAt) continue;
      const age = now - u.createdAt;
      if (age < MIN_AGE_MS || age > MAX_AGE_MS) continue;

      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_userId", (q) => q.eq("userId", u._id))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .first();
      if (purchases) {
        // Buyer — mark so they are never nudged in future runs
        await ctx.db.patch(u._id, { onboardingEmailSentAt: now });
        skippedBuyers++;
        continue;
      }

      try {
        await ctx.scheduler.runAfter(0, internal.email.sendOnboardingNudgeEmail, {
          email: u.email,
          name: u.name,
        });
        await ctx.db.patch(u._id, { onboardingEmailSentAt: now });
        sent++;
      } catch (e) {
        console.error(`Failed to schedule onboarding nudge for ${u.email}:`, e);
      }
    }

    return { sent, skippedBuyers, scanned: activeUsers.length };
  },
});

// Helper to authenticate admin
async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin", "content_admin", "finance_admin", "work_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

// Restrict admin helper: only super_admin and admin for sensitive operations
async function requireSuperAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin"].includes(user.role)) {
    throw new Error("Forbidden: Only super_admin or admin can perform this action");
  }
  return user;
}

// Validate avatar URL is from a trusted source (Convex storage or whitelisted domains)
function isValidAvatarUrl(url: string): boolean {
  if (!url || url.length > 500) return false;
  // Convex storage URLs are safe (they are internal storage IDs or resolved URLs)
  if (url.startsWith("https://") && url.includes(".convex.cloud")) return true;
  // Allow data URIs for inline base64 images (small, validated format)
  if (url.startsWith("data:image/")) return true;
  // Block everything else
  return false;
}

// ── Admin: create a user account directly ───────────────────────────────────
// Account is created active + email-verified (admin vouches for the person),
// with wallet + referral code initialized like normal signup. Audit-logged.
// Supports "demo" accounts with fake balances/transactions for showcase.
export const adminCreateUser = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    sendWelcomeEmail: v.optional(v.boolean()),
    // Demo account fields
    accountType: v.optional(v.union(v.literal("real"), v.literal("demo"))),
    demoConfig: v.optional(v.object({
      workBalance: v.optional(v.number()),
      partnerEarnings: v.optional(v.number()),
      totalWithdrawn: v.optional(v.number()),
      transactionCount: v.optional(v.number()), // number of fake transactions to generate
      withdrawalCount: v.optional(v.number()), // number of fake withdrawals to generate
      kycStatus: v.optional(v.union(v.literal("not_submitted"), v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
    })),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    // SECURITY: Only super_admin and admin can create user accounts
    if (!["super_admin", "admin"].includes(admin.role)) {
      throw new Error("Forbidden: Only super_admin or admin can create user accounts");
    }

    const name = sanitizeName(args.name);
    if (!name || name.length < 2) {
      throw new ConvexError("Enter the person's full name (min 2 characters)");
    }
    const email = args.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      throw new ConvexError("Enter a valid email address");
    }
    if (!args.password || args.password.length < 8) {
      throw new ConvexError("Password must be at least 8 characters");
    }
    const passwordCheck = isStrongPassword(args.password);
    if (!passwordCheck.valid) {
      throw new ConvexError(passwordCheck.error || "Password does not meet strength requirements");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      throw new ConvexError("An account with this email already exists");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(args.password, salt);
    const referralCode = await getUniqueReferralCode(ctx, name);
    const now = Date.now();

    const isDemo = args.accountType === "demo";
    const demoConfig = args.demoConfig || {};

    // Generate fake transactions for demo accounts
    const fakeTransactions = [];
    const fakeWithdrawals = [];
    const transactionCount = demoConfig.transactionCount || (isDemo ? 8 : 0);
    const withdrawalCount = demoConfig.withdrawalCount || (isDemo ? 3 : 0);

    if (isDemo) {
      // Generate fake transaction history
      const transactionTypes = [
        { type: "credit", descriptions: ["Work payout - Content Writing", "Work payout - Social Media Campaign", "Work payout - Web Development", "Work payout - Design Project", "Milestone release - E-commerce task"] },
        { type: "partner_earning", descriptions: ["Partner referral commission", "Partner bonus", "Team commission"] },
        { type: "debit", descriptions: ["Platform fee", "Service charge"] },
      ];
      
      const workEarnings = demoConfig.workBalance || Math.floor(Math.random() * 50000) + 10000;
      const partnerEarnings = demoConfig.partnerEarnings || Math.floor(Math.random() * 20000) + 5000;
      const totalWithdrawn = demoConfig.totalWithdrawn || Math.floor(Math.random() * 15000) + 2000;
      let runningBalance = 0;

      for (let i = 0; i < transactionCount; i++) {
        const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const description = txType.descriptions[Math.floor(Math.random() * txType.descriptions.length)];
        let amount = 0;
        
        if (txType.type === "credit") {
          amount = Math.floor(Math.random() * 8000) + 2000;
          runningBalance += amount;
        } else if (txType.type === "partner_earning") {
          amount = Math.floor(Math.random() * 3000) + 500;
          runningBalance += amount;
        } else {
          amount = Math.floor(Math.random() * 500) + 100;
          runningBalance -= amount;
        }

        const daysAgo = Math.floor(Math.random() * 60) + 1;
        const txTime = now - (daysAgo * 86400000) - (Math.floor(Math.random() * 86400000));
        
        fakeTransactions.push({
          type: txType.type,
          amount,
          description,
          status: "completed",
          createdAt: txTime,
        });
      }

      // Sort by date (newest first)
      fakeTransactions.sort((a, b) => b.createdAt - a.createdAt);

      // Generate fake withdrawals
      const withdrawalMethods = ["Bank Transfer (NEFT)", "UPI", "Bank Transfer (IMPS)"];
      const withdrawalStatuses = ["completed", "completed", "completed", "pending", "rejected"];
      
      for (let i = 0; i < withdrawalCount; i++) {
        const amount = Math.floor(Math.random() * 10000) + 2000;
        const daysAgo = Math.floor(Math.random() * 45) + 1;
        const createdAt = now - (daysAgo * 86400000) - (Math.floor(Math.random() * 86400000));
        const status = withdrawalStatuses[Math.floor(Math.random() * withdrawalStatuses.length)];
        let processedAt: number | undefined;
        if (status === "completed" || status === "rejected") {
          processedAt = createdAt + Math.floor(Math.random() * 86400000) + 3600000; // 1-24 hours later
        }
        
        fakeWithdrawals.push({
          amount,
          status,
          method: withdrawalMethods[Math.floor(Math.random() * withdrawalMethods.length)],
          createdAt,
          processedAt,
        });
      }
    }

    const userId = await ctx.db.insert("users", {
      name,
      email,
      passwordHash,
      salt,
      role: "user",
      status: "active",
      referralCode,
      phone: args.phone?.trim() || undefined,
      emailVerified: true,
      accountType: isDemo ? "demo" : "real",
      demoConfig: isDemo ? {
        workBalance: demoConfig.workBalance || Math.floor(Math.random() * 50000) + 10000,
        partnerEarnings: demoConfig.partnerEarnings || Math.floor(Math.random() * 20000) + 5000,
        totalWithdrawn: demoConfig.totalWithdrawn || Math.floor(Math.random() * 15000) + 2000,
        fakeTransactions,
        fakeWithdrawals,
        kycStatus: demoConfig.kycStatus || "verified",
      } : undefined,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize wallet with demo balances if demo account
    const walletData = {
      userId,
      availableBalance: isDemo ? (demoConfig.workBalance || Math.floor(Math.random() * 50000) + 10000) : 0,
      pendingBalance: 0,
      totalEarned: isDemo ? (demoConfig.workBalance || Math.floor(Math.random() * 50000) + 10000) + (demoConfig.partnerEarnings || Math.floor(Math.random() * 20000) + 5000) : 0,
      totalWithdrawn: isDemo ? (demoConfig.totalWithdrawn || Math.floor(Math.random() * 15000) + 2000) : 0,
      workEarnings: isDemo ? (demoConfig.workBalance || Math.floor(Math.random() * 50000) + 10000) : 0,
      affiliateEarnings: isDemo ? (demoConfig.partnerEarnings || Math.floor(Math.random() * 20000) + 5000) : 0,
      updatedAt: now,
    };

    await ctx.db.insert("wallets", walletData);

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: isDemo ? "ADMIN_CREATE_DEMO_USER" : "ADMIN_CREATE_USER",
      entityType: "users",
      entityId: userId,
      previousValue: "none",
      newValue: `${name} <${email}> (${isDemo ? "Demo" : "Real"})`,
      reason: `Account created from Admin Panel ${isDemo ? "- Demo Account" : ""}`,
      timestamp: now,
    });

    // Optional branded welcome email (credentials are NEVER emailed)
    if (args.sendWelcomeEmail) {
      try {
        await ctx.scheduler.runAfter(0, internal.email.sendAdminCreatedAccountEmail, {
          email,
          name,
        });
      } catch (e) {
        console.error("Failed to schedule admin-created welcome email:", e);
      }
    }

    return { success: true, userId, referralCode, accountType: isDemo ? "demo" : "real" };
  },
});

export const demoRequestWithdrawal = mutation({
  args: {
    token: v.string(),
    amount: v.number(),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(session.userId);
    if (!user || user.accountType !== "demo") {
      throw new Error("Demo withdrawal only available for demo accounts");
    }

    if (args.amount <= 0) {
      throw new ConvexError("Amount must be greater than 0");
    }

    const demoConfig = user.demoConfig || {};
    const availableBalance = demoConfig.workBalance || 0;
    
    if (args.amount > availableBalance) {
      throw new ConvexError("Insufficient demo balance");
    }

    const now = Date.now();
    const newFakeWithdrawal = {
      amount: args.amount,
      status: "pending",
      method: args.method,
      createdAt: now,
      processedAt: undefined,
    };

    const updatedFakeWithdrawals = [...(demoConfig.fakeWithdrawals || []), newFakeWithdrawal];
    const newWorkBalance = availableBalance - args.amount;

    await ctx.db.patch(user._id, {
      demoConfig: {
        ...demoConfig,
        workBalance: newWorkBalance,
        totalWithdrawn: (demoConfig.totalWithdrawn || 0) + args.amount,
        fakeWithdrawals: updatedFakeWithdrawals,
      },
      updatedAt: now,
    });

    // Also update wallet for display purposes
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (wallet) {
      await ctx.db.patch(wallet._id, {
        availableBalance: newWorkBalance,
        totalWithdrawn: (demoConfig.totalWithdrawn || 0) + args.amount,
        updatedAt: now,
      });
    }

    // Add a fake transaction record
    const newFakeTransaction = {
      type: "debit",
      amount: args.amount,
      description: `Withdrawal requested - ${args.method}`,
      status: "pending",
      createdAt: now,
    };

    const updatedFakeTransactions = [newFakeTransaction, ...(demoConfig.fakeTransactions || [])];
    await ctx.db.patch(user._id, {
      demoConfig: {
        ...demoConfig,
        fakeTransactions: updatedFakeTransactions,
      },
      updatedAt: now,
    });

    return { 
      success: true, 
      message: "Demo withdrawal request submitted. It will show as pending in your history.",
      newBalance: newWorkBalance,
    };
  },
});

export const updateProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    // Rate limit: 10 profile updates per hour per user
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, {
      key: `updateProfile:userId:${session.userId}`,
      max: 10,
      windowMs: 60 * 60 * 1000,
    });

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = sanitizeName(args.name);
    if (args.phone !== undefined) updates.phone = args.phone.trim();
    if (args.bio !== undefined) updates.bio = args.bio.trim();
    if (args.skills !== undefined) updates.skills = args.skills;
    if (args.avatarUrl !== undefined) {
      if (args.avatarUrl && !isValidAvatarUrl(args.avatarUrl)) {
        throw new Error("Invalid avatar URL: only Convex storage images are allowed");
      }
      updates.avatarUrl = args.avatarUrl;
    }

    await ctx.db.patch(session.userId, updates);
    return { success: true };
  },
});

export const getAllUsers = query({
  args: {
    token: v.string(),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    let users = await ctx.db.query("users").collect();

    if (args.role) {
      users = users.filter((u) => u.role === args.role);
    }
    if (args.status) {
      users = users.filter((u) => u.status === args.status);
    }
    if (args.search && args.search.trim()) {
      const q = args.search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.referralCode.toLowerCase().includes(q)
      );
    }

    // Enhance users with wallet & enrollment summary
    const enhanced = await Promise.all(
      users.map(async (u) => {
        const wallet = await ctx.db
          .query("wallets")
          .withIndex("by_userId", (q) => q.eq("userId", u._id))
          .first();
        const purchases = await ctx.db
          .query("purchases")
          .withIndex("by_userId", (q) => q.eq("userId", u._id))
          .collect();

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          referralCode: u.referralCode,
          phone: u.phone,
          avatarUrl: u.avatarUrl,
          createdAt: u.createdAt,
          cvStatus: u.cvStatus || "pending",
          cvRemarks: u.cvRemarks,
          totalEarned: wallet?.totalEarned || 0,
          availableBalance: wallet?.availableBalance || 0,
          enrolledCount: purchases.filter((p) => p.status === "completed").length,
        };
      })
    );

    return enhanced;
  },
});

export const getUserDetails = query({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const enrolledPrograms = await Promise.all(
      purchases.map(async (p) => {
        const prog = await ctx.db.get(p.programId);
        return {
          purchase: p,
          program: prog,
        };
      })
    );

    const referralsCount = (
      await ctx.db
        .query("referrals")
        .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", user._id))
        .collect()
    ).length;

    const applications = await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const userAch = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const achievements = await Promise.all(
      userAch.map(async (ua) => {
        const def = ua.achievementId
          ? await ctx.db.get(ua.achievementId)
          : null;
        return {
          unlockedAt: ua.unlockedAt,
          achievement: def
            ? { name: def.name, description: def.description, icon: def.icon }
            : null,
        };
      })
    );

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", user._id))
      .order("desc")
      .take(100);

    const referralDetails = await Promise.all(
      referrals.map(async (r) => {
        const referredUser = await ctx.db.get(r.referredUserId);
        const buyerPurchase = await ctx.db
          .query("purchases")
          .withIndex("by_userId", (q) => q.eq("userId", r.referredUserId))
          .filter((q) => q.eq(q.field("status"), "completed"))
          .first();
        let purchasedProgram: string | null = null;
        if (buyerPurchase) {
          const prog = await ctx.db.get(buyerPurchase.programId);
          purchasedProgram = prog?.name || null;
        }
        return {
          referredUserId: r.referredUserId,
          name: referredUser?.name || "Deleted user",
          email: referredUser?.email || "",
          status: r.status,
          createdAt: r.createdAt,
          hasPurchase: !!buyerPurchase,
          purchasedProgram,
        };
      })
    );

    const affiliateSales = await ctx.db
      .query("affiliateSales")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", user._id))
      .order("desc")
      .take(100);

    const salesWithNames = await Promise.all(
      affiliateSales.map(async (s) => {
        const buyer = await ctx.db.get(s.buyerUserId);
        const prog = await ctx.db.get(s.programId);
        return {
          saleAmount: s.saleAmount,
          commissionAmount: s.commissionAmount,
          status: s.status,
          ruleUsed: s.ruleUsed,
          createdAt: s.createdAt,
          buyerName: buyer?.name || "Deleted user",
          programName: prog?.name || "Deleted program",
        };
      })
    );

    const earnedStatuses = ["approved", "available", "paid"];
    const commissionEarned = affiliateSales
      .filter((s) => earnedStatuses.includes(s.status))
      .reduce((sum, s) => sum + s.commissionAmount, 0);
    const pendingCommission = affiliateSales
      .filter((s) => s.status === "pending")
      .reduce((sum, s) => sum + s.commissionAmount, 0);

    const convertedCount = referralDetails.filter((r) => r.hasPurchase).length;
    const conversionRate = referralDetails.length
      ? Math.round((convertedCount / referralDetails.length) * 100)
      : 0;

    const walletTxns = await ctx.db
      .query("walletTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(25);

    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    const jobApps = await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    const applicationsWithJobs = await Promise.all(
      jobApps.map(async (a) => {
        const job = await ctx.db.get(a.jobId);
        return {
          jobId: a.jobId,
          jobTitle: job?.title || "Deleted job",
          status: a.status,
          submittedAt: a.submittedAt,
        };
      })
    );

    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10);

    const auditLogs = await ctx.db
      .query("auditLogs")
      .filter((q) => q.eq(q.field("entityId"), args.userId))
      .order("desc")
      .take(20);

    const notificationsCount = (
      await ctx.db
        .query("notifications")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
    ).length;

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        phone: user.phone,
        skills: user.skills || [],
        positionId: user.positionId,
        cvStatus: user.cvStatus || "pending",
        cvRemarks: user.cvRemarks,
        cvReviewedAt: user.cvReviewedAt,
        createdAt: user.createdAt,
      },
      wallet,
      enrolledPrograms,
      referralsCount: referralDetails.length,
      referralDetails,
      affiliateStats: {
        totalReferrals: referralDetails.length,
        convertedReferrals: convertedCount,
        conversionRate,
        commissionEarned,
        pendingCommission,
      },
      affiliateSales: salesWithNames,
      walletTransactions: walletTxns,
      withdrawals,
      applications: applicationsWithJobs,
      certificates,
      achievements,
      achievementsCount: userAch.length,
      supportTickets: tickets.map((t) => ({
        ticketId: t.trackingId,
        subject: t.title,
        status: t.status,
        createdAt: t.createdAt,
      })),
      auditLogs: auditLogs.map((l) => ({
        adminEmail: l.adminEmail,
        action: l.action,
        reason: l.reason,
        previousValue: l.previousValue,
        newValue: l.newValue,
        timestamp: l.timestamp,
      })),
      notificationsCount,
    };
  },
});

export const getDemoUserData = query({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    if (user.accountType !== "demo") {
      return { isDemo: false };
    }

    const demoConfig = user.demoConfig || {};
    
    return {
      isDemo: true,
      accountType: "demo",
      demoConfig: {
        workBalance: demoConfig.workBalance || 0,
        partnerEarnings: demoConfig.partnerEarnings || 0,
        totalWithdrawn: demoConfig.totalWithdrawn || 0,
        fakeTransactions: demoConfig.fakeTransactions || [],
        fakeWithdrawals: demoConfig.fakeWithdrawals || [],
        kycStatus: demoConfig.kycStatus || "verified",
      },
    };
  },
});

export const getMyDemoData = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return { isDemo: false };
    }

    const user = await ctx.db.get(session.userId);
    if (!user || user.accountType !== "demo") {
      return { isDemo: false };
    }

    const demoConfig = user.demoConfig || {};
    
    return {
      isDemo: true,
      accountType: "demo",
      demoConfig: {
        workBalance: demoConfig.workBalance || 0,
        partnerEarnings: demoConfig.partnerEarnings || 0,
        totalWithdrawn: demoConfig.totalWithdrawn || 0,
        fakeTransactions: demoConfig.fakeTransactions || [],
        fakeWithdrawals: demoConfig.fakeWithdrawals || [],
        kycStatus: demoConfig.kycStatus || "verified",
      },
    };
  },
});

export const updateUserRole = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    role: v.string(), // "user" | "content_admin" | "finance_admin" | "work_admin"
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    // SECURITY: Only super_admin and admin can change user roles
    if (!["super_admin", "admin"].includes(admin.role)) {
      throw new Error("Forbidden: Only super_admin or admin can change user roles");
    }
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user._id === admin._id) throw new Error("You cannot change your own role");
    if (["super_admin", "admin"].includes(user.role) && admin.role !== "super_admin") {
      throw new Error("Only a super admin can change this account's role");
    }
    if (!["user", "content_admin", "finance_admin", "work_admin"].includes(args.role)) {
      throw new Error("Invalid role");
    }
    if (user.role === args.role) throw new Error("User already has this role");

    const now = Date.now();
    await ctx.db.patch(args.userId, { role: args.role, updatedAt: now });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "account",
      title: "Account Role Updated",
      message: `Your account role has been changed to ${args.role.replace(/_/g, " ")}. Reason: ${args.reason}`,
      read: false,
      actionUrl: "/dashboard",
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_USER_ROLE",
      entityType: "users",
      entityId: args.userId,
      previousValue: user.role,
      newValue: args.role,
      reason: args.reason,
      timestamp: now,
    });

    return { success: true };
  },
});

export const adminResetPassword = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    newPassword: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    // SECURITY: Only super_admin and admin can reset passwords
    if (!["super_admin", "admin"].includes(admin.role)) {
      throw new Error("Forbidden: Only super_admin or admin can reset passwords");
    }
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const passwordCheck = isStrongPassword(args.newPassword);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.error);
    }

    const salt = generateSalt();
    const hash = await hashPassword(args.newPassword, salt);
    const now = Date.now();

    await ctx.db.patch(args.userId, {
      passwordHash: hash,
      salt,
      updatedAt: now,
    });

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "security",
      title: "Password Reset by Admin",
      message: `Your password was reset by an administrator. Reason: ${args.reason}. Please log in again.`,
      read: false,
      actionUrl: "/login",
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "ADMIN_PASSWORD_RESET",
      entityType: "users",
      entityId: args.userId,
      previousValue: "password_hash",
      newValue: "rotated",
      reason: args.reason,
      timestamp: now,
    });

    return { success: true };
  },
});

export const adminUnlockAccount = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (!["super_admin", "admin"].includes(admin.role)) {
      throw new Error("Forbidden: Only super_admin or admin can unlock accounts");
    }
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const wasLocked = (user as any).lockedUntil && (user as any).lockedUntil > Date.now();
    const failures = (user as any).failedLoginCount || 0;

    await ctx.db.patch(args.userId, {
      failedLoginCount: 0,
      lockedUntil: 0,
    } as any);

    const now = Date.now();
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "ADMIN_UNLOCK_ACCOUNT",
      entityType: "users",
      entityId: args.userId,
      previousValue: wasLocked ? `locked, ${failures} failures` : "not locked",
      newValue: "unlocked",
      reason: args.reason,
      timestamp: now,
    });

    return { success: true, wasLocked };
  },
});

export const updateUserStatus = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    status: v.string(), // "active" | "suspended"
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    if (!["active", "suspended"].includes(args.status)) {
      throw new Error("Invalid status");
    }
    if (user._id === admin._id) {
      throw new Error("You cannot change your own account status");
    }
    if (user.role === "super_admin" && admin.role !== "super_admin") {
      throw new Error("Only a super admin can change this account's status");
    }

    const previousStatus = user.status;
    await ctx.db.patch(args.userId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Suspension must terminate all active sessions immediately
    if (args.status === "suspended") {
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
        .collect();
      for (const s of sessions) {
        await ctx.db.delete(s._id);
      }
    }

    // Notify the user about the status change
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "kyc",
      title: args.status === "suspended" ? "Account Suspended" : "Account Activated",
      message:
        args.status === "suspended"
          ? `Your account has been suspended. Reason: ${args.reason}. If you believe this is a mistake, please contact support.`
          : `Your account has been reactivated. You can now log in and access your dashboard.`,
      read: false,
      actionUrl: "/dashboard",
      createdAt: Date.now(),
    });

    // Log in audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_USER_STATUS",
      entityType: "users",
      entityId: args.userId,
      previousValue: previousStatus,
      newValue: args.status,
      reason: args.reason,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const grantProgramAccess = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    programId: v.id("programs"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    const program = await ctx.db.get(args.programId);
    if (!user || !program) throw new Error("User or Program not found");

    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .first();

    if (existing && existing.status === "completed") {
      throw new Error("User is already enrolled in this program");
    }

    const now = Date.now();
    await ctx.db.insert("purchases", {
      userId: args.userId,
      programId: args.programId,
      amount: 0,
      status: "completed",
      paymentId: `ADMIN_GRANT_${now}`,
      paymentMethod: "manual_grant",
      // Free giveaway — full learning access, but labeled so records/reports
      // can distinguish it from an actual sale (₹0 revenue either way).
      accessType: "admin_grant",
      createdAt: now,
    });

    // Notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "course",
      title: "Free Course Unlocked 🎁",
      message: `"${program.name}" has been added to your account as a free giveaway from the ZetaGrow team. Happy learning!`,
      read: false,
      actionUrl: `/dashboard/learning/${args.programId}`,
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "MANUAL_PROGRAM_GRANT",
      entityType: "purchases",
      entityId: args.userId,
      previousValue: "none",
      newValue: program.name,
      reason: args.reason,
      timestamp: now,
    });

    return { success: true };
  }
});

export const revokeProgramAccess = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    programId: v.id("programs"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    const program = await ctx.db.get(args.programId);
    if (!user || !program) throw new Error("User or Program not found");

    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();

    if (!purchase) throw new Error("No active enrollment found for this program");

    const now = Date.now();
    await ctx.db.patch(purchase._id, { status: "revoked" });

    // Revoke any certificates for this program
    const certs = await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .collect();
    for (const cert of certs) {
      await ctx.db.delete(cert._id);
    }

    // Notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "course",
      title: "Course Access Removed",
      message: `Your access to "${program.name}" has been revoked by an administrator.${args.reason ? ` Reason: ${args.reason}` : ""}`,
      read: false,
      actionUrl: `/dashboard/programs`,
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "MANUAL_PROGRAM_REVOKE",
      entityType: "purchases",
      entityId: args.userId,
      previousValue: purchase.accessType || "purchase",
      newValue: "revoked",
      reason: args.reason,
      timestamp: now,
    });

    return { success: true, revoked: true };
  },
});

export const getCvReviewQueue = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const users = await ctx.db.query("users").collect();
    const cvUsers = users.filter(
      (u) => (u.cvStatus || "pending") === "pending" || (u.cvStatus || "pending") === "rejected"
    );

    const detailed = await Promise.all(
      cvUsers.map(async (u) => {
        const apps = await ctx.db
          .query("jobApplications")
          .withIndex("by_userId", (q) => q.eq("userId", u._id))
          .collect();
        const wallet = await ctx.db
          .query("wallets")
          .withIndex("by_userId", (q) => q.eq("userId", u._id))
          .first();
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          skills: u.skills || [],
          positionId: u.positionId,
          cvStatus: u.cvStatus || "pending",
          cvRemarks: u.cvRemarks,
          cvReviewedAt: u.cvReviewedAt,
          applicationCount: apps.length,
          applicationResumes: apps
            .filter((a) => a.resumeUrl)
            .map((a) => a.resumeUrl),
          latestApplication: apps.length
            ? apps
                .slice()
                .sort((a, b) => b.submittedAt - a.submittedAt)[0]
            : null,
          walletBalance: wallet?.availableBalance || 0,
          totalEarned: wallet?.totalEarned || 0,
          createdAt: u.createdAt,
        };
      })
    );

    detailed.sort((a, b) => b.createdAt - a.createdAt);
    return detailed;
  },
});

export const updateUserCvStatus = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    cvStatus: v.string(), // "verified" | "rejected"
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (!["verified", "rejected"].includes(args.cvStatus)) {
      throw new Error("Invalid CV status");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const previous = user.cvStatus || "pending";
    const now = Date.now();

    await ctx.db.patch(args.userId, {
      cvStatus: args.cvStatus,
      cvRemarks: args.remarks?.trim() || undefined,
      cvReviewedAt: now,
      cvVerifiedBy: admin.email,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "cv",
      title: args.cvStatus === "verified" ? "CV Verified" : "CV Not Verified",
      message:
        args.cvStatus === "verified"
          ? "Your profile CV has been verified. You are now eligible to be selected for work opportunities."
          : `Your CV could not be verified. Remark: ${args.remarks || "Please contact support"}`,
      read: false,
      actionUrl: "/dashboard/profile",
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_CV_STATUS",
      entityType: "users",
      entityId: args.userId,
      previousValue: previous,
      newValue: args.cvStatus,
      reason: args.remarks || "CV review",
      timestamp: now,
    });

    return { success: true };
  },
});

// ── Grant an entire plan (all its courses) to a user for free ──────────────
// Creates a purchase record for each course in the plan, mirroring the
// enrollment flow in processPurchaseWithAffiliate but without payment.
export const grantPlanAccess = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    planId: v.id("plans"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    const plan = await ctx.db.get(args.planId);
    if (!user) throw new Error("User not found");
    if (!plan || plan.status !== "published") throw new Error("Plan not found or not published");

    const now = Date.now();
    const paymentId = `ADMIN_PLAN_GRANT_${now}`;
    const granted: string[] = [];

    for (const pid of plan.programIds) {
      const existing = await ctx.db
        .query("purchases")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .filter((q) =>
          q.and(
            q.eq(q.field("programId"), pid),
            q.eq(q.field("status"), "completed")
          )
        )
        .first();

      if (!existing) {
        await ctx.db.insert("purchases", {
          userId: args.userId,
          programId: pid,
          planId: plan._id,
          amount: 0,
          status: "completed",
          paymentId,
          paymentMethod: "admin_grant",
          accessType: "admin_grant",
          createdAt: now,
        });
        const prog = await ctx.db.get(pid);
        if (prog) granted.push(prog.name);
      }
    }

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "course",
      title: "Plan Assigned",
      message:
        granted.length > 0
          ? `You have been granted access to ${granted.length} course${granted.length === 1 ? "" : "s"} in "${plan.name}" by the ZetaGrow team. Happy learning!`
          : `You already had full access to "${plan.name}".`,
      read: false,
      actionUrl: "/dashboard/programs",
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "MANUAL_PLAN_GRANT",
      entityType: "purchases",
      entityId: args.userId,
      previousValue: "none",
      newValue: `${plan.name} (${granted.length} courses)`,
      reason: args.reason,
      timestamp: now,
    });

    return { success: true, grantedCount: granted.length, granted };
  },
});

// ── Send a notification from admin to a user ────────────────────────────────
export const sendAdminNotification = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Rate limit: 10 notifications per hour per admin
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, {
      key: `sendAdminNotification:userId:${admin._id}`,
      max: 10,
      windowMs: 60 * 60 * 1000,
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "admin",
      title: args.title,
      message: args.message,
      read: false,
      actionUrl: args.actionUrl || "/dashboard",
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "ADMIN_NOTIFICATION",
      entityType: "notifications",
      entityId: args.userId,
      previousValue: "none",
      newValue: args.title,
      reason: args.message,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
