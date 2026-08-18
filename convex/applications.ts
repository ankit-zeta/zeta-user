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

export const submitApplication = mutation({
  args: {
    token: v.string(),
    jobId: v.id("jobs"),
    answers: v.array(v.object({ question: v.string(), answer: v.string() })),
    coverNote: v.string(),
    portfolioUrl: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "published") {
      throw new Error("This opportunity is no longer open for applications");
    }

    // Check existing
    const existing = await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .first();

    if (existing) {
      throw new Error("You have already submitted an application for this opportunity");
    }

    // Server-side eligibility check
    if (job.requiredProgramId) {
      const purchase = await ctx.db
        .query("purchases")
        .withIndex("by_userId", (q) => q.eq("userId", session.userId))
        .filter((q) =>
          q.and(
            q.eq(q.field("programId"), job.requiredProgramId),
            q.eq(q.field("status"), "completed")
          )
        )
        .first();
      if (!purchase && session.role === "user") {
        throw new Error("You do not meet the program requirement for this opportunity");
      }
    }

    if (job.requiredAchievementId) {
      const ach = await ctx.db
        .query("userAchievements")
        .withIndex("by_userId", (q) => q.eq("userId", session.userId))
        .filter((q) => q.eq(q.field("achievementId"), job.requiredAchievementId))
        .first();
      if (!ach && session.role === "user") {
        throw new Error("You do not meet the achievement requirement for this opportunity");
      }
    }

    const now = Date.now();
    const appId = await ctx.db.insert("jobApplications", {
      jobId: args.jobId,
      userId: session.userId,
      answers: args.answers,
      coverNote: args.coverNote.trim(),
      portfolioUrl: args.portfolioUrl?.trim(),
      resumeUrl: args.resumeUrl?.trim(),
      status: "submitted",
      paymentStatus: "unpaid",
      submittedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: session.userId,
      type: "application",
      title: "Application Received",
      message: `Your application for "${job.title}" has been submitted and is under review.`,
      read: false,
      actionUrl: "/dashboard/applications",
      createdAt: now,
    });

    return appId;
  },
});

export const submitWorkDeliverable = mutation({
  args: {
    token: v.string(),
    applicationId: v.id("jobApplications"),
    submissionWorkUrl: v.string(),
    submissionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const app = await ctx.db.get(args.applicationId);
    if (!app || app.userId.toString() !== session.userId.toString()) {
      throw new Error("Application not found or unauthorized");
    }

    if (!["accepted", "in_progress", "revision_required"].includes(app.status)) {
      throw new Error("Work can only be submitted for accepted/in-progress tasks");
    }

    const now = Date.now();
    await ctx.db.patch(args.applicationId, {
      submissionWorkUrl: args.submissionWorkUrl.trim(),
      submissionNotes: args.submissionNotes.trim(),
      status: "under_review",
      updatedAt: now,
    });

    return { success: true };
  },
});

export const getUserApplications = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const apps = await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    const appsWithJobs = await Promise.all(
      apps.map(async (a) => {
        const job = await ctx.db.get(a.jobId);
        return {
          ...a,
          job,
        };
      })
    );

    return appsWithJobs;
  },
});

// Admin Applications Management
export const getAllApplicationsAdmin = query({
  args: {
    token: v.string(),
    jobId: v.optional(v.id("jobs")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    let apps = await ctx.db.query("jobApplications").collect();

    if (args.jobId) {
      apps = apps.filter((a) => a.jobId === args.jobId);
    }
    if (args.status) {
      apps = apps.filter((a) => a.status === args.status);
    }

    const detailed = await Promise.all(
      apps.map(async (a) => {
        const user = await ctx.db.get(a.userId);
        const job = await ctx.db.get(a.jobId);
        return {
          ...a,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                avatarUrl: user.avatarUrl,
              }
            : null,
          job,
        };
      })
    );

    return detailed;
  },
});

export const updateApplicationStatus = mutation({
  args: {
    token: v.string(),
    applicationId: v.id("jobApplications"),
    status: v.string(),
    adminNotes: v.optional(v.string()),
    payoutAmount: v.optional(v.number()), // if marking complete and releasing work payout
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    const job = await ctx.db.get(app.jobId);
    const now = Date.now();

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // If marked completed and payout is provided
    if (args.status === "completed" && args.payoutAmount && args.payoutAmount > 0) {
      // Credit user's wallet
      const wallet = await ctx.db
        .query("wallets")
        .withIndex("by_userId", (q) => q.eq("userId", app.userId))
        .first();

      if (wallet) {
        const newBal = wallet.availableBalance + args.payoutAmount;
        await ctx.db.patch(wallet._id, {
          availableBalance: newBal,
          totalEarned: wallet.totalEarned + args.payoutAmount,
          workEarnings: wallet.workEarnings + args.payoutAmount,
          updatedAt: now,
        });

        // Insert wallet ledger transaction
        await ctx.db.insert("walletTransactions", {
          userId: app.userId,
          type: "WORK_PAYOUT",
          amount: args.payoutAmount,
          balanceAfter: newBal,
          referenceId: args.applicationId,
          description: `Work completion payout for: ${job?.title || "Contract Task"}`,
          status: "completed",
          createdAt: now,
        });

        await ctx.db.patch(args.applicationId, {
          paymentStatus: "paid",
        });
      }
    }

    // Send notification to user
    await ctx.db.insert("notifications", {
      userId: app.userId,
      type: "application",
      title: `Application Update: ${job?.title || "Job"}`,
      message: `Your application status has been updated to "${args.status.toUpperCase()}". ${
        args.adminNotes ? `Note: ${args.adminNotes}` : ""
      }`,
      read: false,
      actionUrl: "/dashboard/applications",
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_APPLICATION_STATUS",
      entityType: "jobApplications",
      entityId: args.applicationId,
      previousValue: app.status,
      newValue: args.status,
      reason: args.adminNotes || "Status transition",
      timestamp: now,
    });

    return { success: true };
  },
});
