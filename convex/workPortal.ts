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
  if (!user || !["super_admin", "admin", "work_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

export const getWorkPortalSettings = query({
  args: {},
  handler: async (ctx) => {
    const record = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", "workPortal"))
      .first();
    return record?.value || {
      enabled: true,
      requireKyc: true,
      requireCv: true,
      maxApplicationsPerJob: 0,
      allowFreeApply: true,
    };
  },
});

export const updateWorkPortalSettings = mutation({
  args: {
    token: v.string(),
    settings: v.object({
      enabled: v.boolean(),
      requireKyc: v.boolean(),
      requireCv: v.boolean(),
      maxApplicationsPerJob: v.number(),
      allowFreeApply: v.boolean(),
    }),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", "workPortal"))
      .first();

    const now = Date.now();
    const previousValue = existing ? JSON.stringify(existing.value) : "none";

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.settings,
        updatedBy: admin._id,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("adminSettings", {
        key: "workPortal",
        value: args.settings,
        updatedBy: admin._id,
        updatedAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_SETTING_WORK_PORTAL",
      entityType: "adminSettings",
      entityId: "workPortal",
      previousValue,
      newValue: JSON.stringify(args.settings),
      reason: args.reason || "Work portal settings update",
      timestamp: now,
    });

    return { success: true };
  },
});

// ── Saved Jobs ──────────────────────────────────────────────────────────────

export const toggleSavedJob = mutation({
  args: {
    token: v.string(),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("savedJobs")
      .withIndex("by_user_job", (q) =>
        q.eq("userId", session.userId).eq("jobId", args.jobId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    } else {
      await ctx.db.insert("savedJobs", {
        userId: session.userId,
        jobId: args.jobId,
        savedAt: Date.now(),
      });
      return { saved: true };
    }
  },
});

export const getSavedJobs = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const saved = await ctx.db
      .query("savedJobs")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    const jobs = await Promise.all(
      saved.map(async (s) => {
        const job = await ctx.db.get(s.jobId);
        return { ...s, job };
      })
    );

    return jobs.filter((j) => j.job);
  },
});

// ── Job Ratings ─────────────────────────────────────────────────────────────

export const submitJobRating = mutation({
  args: {
    token: v.string(),
    applicationId: v.id("jobApplications"),
    jobId: v.id("jobs"),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Verify the application belongs to the user and is completed
    const app = await ctx.db.get(args.applicationId);
    if (!app || app.userId.toString() !== session.userId.toString()) {
      throw new Error("Application not found or unauthorized");
    }
    if (app.status !== "completed") {
      throw new Error("Can only rate completed work");
    }

    // Check for existing rating
    const existing = await ctx.db
      .query("jobRatings")
      .withIndex("by_applicationId", (q) =>
        q.eq("applicationId", args.applicationId)
      )
      .first();
    if (existing) {
      throw new Error("You have already rated this work");
    }

    const now = Date.now();
    const ratingId = await ctx.db.insert("jobRatings", {
      jobId: args.jobId,
      applicationId: args.applicationId,
      userId: session.userId,
      rating: args.rating,
      review: args.review?.trim(),
      createdAt: now,
    });

    return ratingId;
  },
});

export const getJobRatings = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("jobRatings")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();

    const detailed = await Promise.all(
      ratings.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return {
          ...r,
          userName: user?.name || "Anonymous",
        };
      })
    );

    const avg =
      ratings.length > 0
        ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
        : 0;

    return { ratings: detailed, averageRating: Math.round(avg * 10) / 10, totalRatings: ratings.length };
  },
});
