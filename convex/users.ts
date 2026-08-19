import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword, generateSalt } from "./auth";

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

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.phone !== undefined) updates.phone = args.phone.trim();
    if (args.bio !== undefined) updates.bio = args.bio.trim();
    if (args.skills !== undefined) updates.skills = args.skills;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

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

export const updateUserRole = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    role: v.string(), // "user" | "content_admin" | "finance_admin" | "work_admin"
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user._id === admin._id) throw new Error("You cannot change your own role");
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
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
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

export const updateUserStatus = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    status: v.string(), // "active" | "suspended"
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const previousStatus = user.status;
    await ctx.db.patch(args.userId, {
      status: args.status,
      updatedAt: Date.now(),
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
    const admin = await requireAdmin(ctx, args.token);
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
      createdAt: now,
    });

    // Notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "course",
      title: "Program Access Granted",
      message: `You have been granted access to "${program.name}".`,
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
  },
});
