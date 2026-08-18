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
  if (!user || !["super_admin", "admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

// Evaluate user's eligibility against all active achievements
export const evaluateUserAchievements = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const userId = session.userId;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Gather user metrics
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", userId))
      .collect();

    const sales = await ctx.db
      .query("affiliateSales")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", userId))
      .collect();

    const completedJobs = await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const approvedJobs = await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "accepted"),
          q.eq(q.field("status"), "in_progress"),
          q.eq(q.field("status"), "completed")
        )
      )
      .collect();

    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const metrics: Record<string, number> = {
      valid_referrals: referrals.length,
      affiliate_sales: sales.length,
      total_sales_amount: sales.reduce((sum, s) => sum + s.saleAmount, 0),
      completed_jobs: completedJobs.length,
      approved_jobs: approvedJobs.length,
      completed_programs: certificates.length,
      total_earnings: wallet?.totalEarned || 0,
    };

    // Get active achievements
    const activeAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Get existing unlocked achievements
    const existingUnlocks = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const unlockedIds = new Set(existingUnlocks.map((u) => u.achievementId.toString()));

    const newlyUnlocked: any[] = [];
    const now = Date.now();

    for (const ach of activeAchievements) {
      if (unlockedIds.has(ach._id.toString())) continue;

      let satisfied = false;
      const conditionResults = ach.conditions.map((cond) => {
        const val = metrics[cond.metric] || 0;
        switch (cond.operator) {
          case ">=":
            return val >= cond.value;
          case ">":
            return val > cond.value;
          case "==":
            return val === cond.value;
          case "<=":
            return val <= cond.value;
          case "<":
            return val < cond.value;
          default:
            return false;
        }
      });

      if (ach.conditionMode === "ANY") {
        satisfied = conditionResults.some(Boolean);
      } else {
        satisfied = conditionResults.every(Boolean);
      }

      if (satisfied && conditionResults.length > 0) {
        await ctx.db.insert("userAchievements", {
          userId,
          achievementId: ach._id,
          unlockedAt: now,
        });

        // If achievement unlocks a position, assign to user
        if (ach.unlockPositionId) {
          await ctx.db.patch(userId, {
            positionId: ach.unlockPositionId,
            updatedAt: now,
          });
        }

        // Notify user
        await ctx.db.insert("notifications", {
          userId,
          type: "achievement",
          title: `Achievement Unlocked: ${ach.name}!`,
          message: ach.notificationText || `You have earned the "${ach.name}" achievement.`,
          read: false,
          actionUrl: "/dashboard/achievements",
          createdAt: now,
        });

        newlyUnlocked.push(ach);
      }
    }

    return { newlyUnlocked, metrics };
  },
});

export const getUserAchievements = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    allAchievements.sort((a, b) => a.sortOrder - b.sortOrder);

    const userUnlocks = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    const unlockedMap = new Map(userUnlocks.map((u) => [u.achievementId.toString(), u.unlockedAt]));

    return allAchievements.map((ach) => ({
      ...ach,
      isUnlocked: unlockedMap.has(ach._id.toString()),
      unlockedAt: unlockedMap.get(ach._id.toString()) || null,
    }));
  },
});

// Admin Achievements CRUD
export const getAllAchievementsAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const list = await ctx.db.query("achievements").collect();
    list.sort((a, b) => a.sortOrder - b.sortOrder);

    const detailed = await Promise.all(
      list.map(async (ach) => {
        const unlocks = await ctx.db
          .query("userAchievements")
          .filter((q) => q.eq(q.field("achievementId"), ach._id))
          .collect();

        let position = null;
        if (ach.unlockPositionId) {
          position = await ctx.db.get(ach.unlockPositionId);
        }

        return {
          ...ach,
          unlockCount: unlocks.length,
          positionName: position?.name,
        };
      })
    );

    return detailed;
  },
});

export const createAchievement = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    status: v.string(),
    sortOrder: v.number(),
    conditionMode: v.string(),
    conditions: v.array(
      v.object({
        metric: v.string(),
        operator: v.string(),
        value: v.number(),
      })
    ),
    unlockPositionId: v.optional(v.id("positions")),
    unlockBadgeName: v.optional(v.string()),
    unlockJobAccessCategory: v.optional(v.string()),
    notificationText: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const now = Date.now();

    const achId = await ctx.db.insert("achievements", {
      name: args.name.trim(),
      slug: args.slug.trim().toLowerCase(),
      description: args.description.trim(),
      icon: args.icon,
      status: args.status,
      sortOrder: args.sortOrder,
      conditionMode: args.conditionMode,
      conditions: args.conditions,
      unlockPositionId: args.unlockPositionId,
      unlockBadgeName: args.unlockBadgeName,
      unlockJobAccessCategory: args.unlockJobAccessCategory,
      notificationText: args.notificationText,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "CREATE_ACHIEVEMENT",
      entityType: "achievements",
      entityId: achId,
      newValue: args.name,
      reason: "Admin achievement creation",
      timestamp: now,
    });

    return achId;
  },
});

export const updateAchievement = mutation({
  args: {
    token: v.string(),
    achievementId: v.id("achievements"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    status: v.string(),
    sortOrder: v.number(),
    conditionMode: v.string(),
    conditions: v.array(
      v.object({
        metric: v.string(),
        operator: v.string(),
        value: v.number(),
      })
    ),
    unlockPositionId: v.optional(v.id("positions")),
    unlockBadgeName: v.optional(v.string()),
    unlockJobAccessCategory: v.optional(v.string()),
    notificationText: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const prev = await ctx.db.get(args.achievementId);
    if (!prev) throw new Error("Achievement not found");

    const now = Date.now();
    await ctx.db.patch(args.achievementId, {
      name: args.name.trim(),
      slug: args.slug.trim().toLowerCase(),
      description: args.description.trim(),
      icon: args.icon,
      status: args.status,
      sortOrder: args.sortOrder,
      conditionMode: args.conditionMode,
      conditions: args.conditions,
      unlockPositionId: args.unlockPositionId,
      unlockBadgeName: args.unlockBadgeName,
      unlockJobAccessCategory: args.unlockJobAccessCategory,
      notificationText: args.notificationText,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_ACHIEVEMENT",
      entityType: "achievements",
      entityId: args.achievementId,
      previousValue: prev.name,
      newValue: args.name,
      reason: "Admin achievement update",
      timestamp: now,
    });

    return { success: true };
  },
});
