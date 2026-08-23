import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
  if (!user || !["super_admin", "admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

async function gatherUserMetrics(ctx: any, userId: string) {
  const referrals = await ctx.db
    .query("referrals")
    .withIndex("by_referrerUserId", (q: any) => q.eq("referrerUserId", userId))
    .collect();

  const sales = await ctx.db
    .query("affiliateSales")
    .withIndex("by_referrerUserId", (q: any) => q.eq("referrerUserId", userId))
    .collect();

  const completedJobs = await ctx.db
    .query("jobApplications")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("status"), "completed"))
    .collect();

  const approvedJobs = await ctx.db
    .query("jobApplications")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .filter((q: any) =>
      q.or(
        q.eq(q.field("status"), "accepted"),
        q.eq(q.field("status"), "in_progress"),
        q.eq(q.field("status"), "completed")
      )
    )
    .collect();

  const certificates = await ctx.db
    .query("certificates")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();

  const wallet = await ctx.db
    .query("wallets")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  return {
    valid_referrals: referrals.length,
    affiliate_sales: sales.length,
    total_sales_amount: sales.reduce((sum: number, s: any) => sum + s.saleAmount, 0),
    completed_jobs: completedJobs.length,
    approved_jobs: approvedJobs.length,
    completed_programs: certificates.length,
    total_earnings: wallet?.totalEarned || 0,
  } as Record<string, number>;
}

// Evaluate user's eligibility against all active achievements
export const evaluateUserAchievements = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const userId = session.userId;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    await requirePurchasedUser(ctx, args.token);

    const metrics = await gatherUserMetrics(ctx, userId);

    // Get active achievements
    const activeAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .collect();

    // Get existing unlocked achievements
    const existingUnlocks = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
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
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    await requirePurchasedUser(ctx, args.token);

    const userId = session.userId;
    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .collect();

    allAchievements.sort((a, b) => a.sortOrder - b.sortOrder);

    const userUnlocks = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();

    const unlockedMap = new Map(userUnlocks.map((u) => [u.achievementId.toString(), u.unlockedAt]));

    const metrics = await gatherUserMetrics(ctx, userId);

    const enriched = await Promise.all(
      allAchievements.map(async (ach) => {
        const conditionProgress = ach.conditions.map((cond) => {
          const current = metrics[cond.metric] || 0;
          const target = cond.value;
          let ratio = 0;
          switch (cond.operator) {
            case ">=":
            case ">":
              ratio = current >= target ? 1 : current / target;
              break;
            case "<=":
            case "<":
              ratio = current <= target ? 1 : target > 0 ? target / current : 1;
              break;
            case "==":
              ratio = current === target ? 1 : target > 0 ? Math.min(1, current / target) : 0;
              break;
          }
          return {
            metric: cond.metric,
            operator: cond.operator,
            target,
            current,
            satisfied: ratio >= 1,
            progress: Math.round(Math.min(1, ratio) * 100),
          };
        });

        const isUnlocked = unlockedMap.has(ach._id.toString());
        let progress = 0;
        if (conditionProgress.length > 0) {
          if (ach.conditionMode === "ANY") {
            progress = Math.max(...conditionProgress.map((c) => c.progress));
          } else {
            progress = Math.round(
              conditionProgress.reduce((sum: number, c: any) => sum + c.progress, 0) / conditionProgress.length
            );
          }
        }

        let position = null;
        if (ach.unlockPositionId) {
          position = await ctx.db.get(ach.unlockPositionId);
        }

        return {
          ...ach,
          isUnlocked,
          unlockedAt: unlockedMap.get(ach._id.toString()) || null,
          positionName: position?.name || null,
          badgeColor: position?.badgeColor || null,
          metrics,
          conditionProgress,
          progress: isUnlocked ? 100 : progress,
          remaining: conditionProgress.filter((c) => !c.satisfied).length,
        };
      })
    );

    return enriched;
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
          .filter((q: any) => q.eq(q.field("achievementId"), ach._id))
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

    const slug = args.slug.trim().toLowerCase();
    const all = await ctx.db.query("achievements").collect();
    if (all.some((a) => a.slug === slug)) {
      throw new Error("An achievement with this slug already exists");
    }

    const achId = await ctx.db.insert("achievements", {
      name: args.name.trim(),
      slug,
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

export const deleteAchievement = mutation({
  args: {
    token: v.string(),
    achievementId: v.id("achievements"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const ach = await ctx.db.get(args.achievementId);
    if (!ach) throw new Error("Achievement not found");

    const now = Date.now();
    await ctx.db.delete(args.achievementId);

    const userUnlocks = await ctx.db
      .query("userAchievements")
      .filter((q: any) => q.eq(q.field("achievementId"), args.achievementId))
      .collect();
    for (const u of userUnlocks) {
      await ctx.db.delete(u._id);
    }

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "DELETE_ACHIEVEMENT",
      entityType: "achievements",
      entityId: args.achievementId,
      previousValue: ach.name,
      reason: "Admin achievement deletion",
      timestamp: now,
    });

    return { success: true };
  },
});

export const toggleAchievementStatus = mutation({
  args: {
    token: v.string(),
    achievementId: v.id("achievements"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const ach = await ctx.db.get(args.achievementId);
    if (!ach) throw new Error("Achievement not found");
    if (!["active", "draft", "archived"].includes(args.status)) {
      throw new Error("Invalid status");
    }

    const now = Date.now();
    await ctx.db.patch(args.achievementId, { status: args.status, updatedAt: now });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "TOGGLE_ACHIEVEMENT_STATUS",
      entityType: "achievements",
      entityId: args.achievementId,
      previousValue: ach.status,
      newValue: args.status,
      reason: `Admin set achievement status to ${args.status}`,
      timestamp: now,
    });

    return { success: true };
  },
});

export const adminGrantAchievement = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    const ach = await ctx.db.get(args.achievementId);
    if (!user) throw new Error("User not found");
    if (!ach) throw new Error("Achievement not found");

    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_achievement", (q: any) =>
        q.eq("userId", args.userId).eq("achievementId", args.achievementId)
      )
      .first();
    if (existing) throw new Error("User already has this achievement");

    const now = Date.now();
    await ctx.db.insert("userAchievements", {
      userId: args.userId,
      achievementId: args.achievementId,
      unlockedAt: now,
    });

    if (ach.unlockPositionId) {
      await ctx.db.patch(args.userId, { positionId: ach.unlockPositionId, updatedAt: now });
    }

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "achievement",
      title: `Achievement Unlocked: ${ach.name}!`,
      message: ach.notificationText || `You have earned the "${ach.name}" achievement.`,
      read: false,
      actionUrl: "/dashboard/achievements",
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "GRANT_ACHIEVEMENT",
      entityType: "userAchievements",
      entityId: `${args.userId}:${args.achievementId}`,
      newValue: `${user.email} <- ${ach.name}`,
      reason: args.reason || "Admin manually granted achievement",
      timestamp: now,
    });

    return { success: true };
  },
});

export const adminRevokeAchievement = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const user = await ctx.db.get(args.userId);
    const ach = await ctx.db.get(args.achievementId);
    if (!user) throw new Error("User not found");
    if (!ach) throw new Error("Achievement not found");

    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_achievement", (q: any) =>
        q.eq("userId", args.userId).eq("achievementId", args.achievementId)
      )
      .first();
    if (!existing) throw new Error("User does not have this achievement");

    await ctx.db.delete(existing._id);

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "REVOKE_ACHIEVEMENT",
      entityType: "userAchievements",
      entityId: `${args.userId}:${args.achievementId}`,
      previousValue: `${user.email} <- ${ach.name}`,
      reason: args.reason || "Admin revoked achievement",
      timestamp: Date.now(),
    });

    return { success: true };
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
    const slug = args.slug.trim().toLowerCase();
    const all = await ctx.db.query("achievements").collect();
    if (all.some((a) => a.slug === slug && a._id.toString() !== args.achievementId.toString())) {
      throw new Error("An achievement with this slug already exists");
    }

    await ctx.db.patch(args.achievementId, {
      name: args.name.trim(),
      slug,
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