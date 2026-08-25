import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

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

    const user = await ctx.db.get(session.userId);
    const isRegularUser = user?.role === "user";

    // CV completeness gate (structured profile — not file uploads)
    if (isRegularUser) {
      const cv = await ctx.db
        .query("cvProfiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
        .first();
      const overviewOk = Boolean(cv?.overview && cv.overview.trim().length >= 50);
      const experienceOk = (cv?.experience || []).length >= 1;
      const educationOk = (cv?.education || []).length >= 1;
      const skillsOk =
        (cv?.technicalSkills || []).length + (cv?.softSkills || []).length >= 3;
      if (!overviewOk || !experienceOk || !educationOk || !skillsOk) {
        throw new Error(
          "Complete your CV profile (overview, experience, education and at least 3 skills) before applying for work"
        );
      }
      // TDS compliance: work earnings require verified KYC before starting
      if (((user as any).kycStatus || "not_submitted") !== "verified") {
        const state =
          ((user as any).kycStatus === "pending")
            ? "is under review — you can apply once it's approved"
            : ((user as any).kycStatus === "rejected")
              ? "was rejected — please resubmit your documents"
              : "is not submitted yet";
        // ConvexError so the message reaches the client (plain Errors are masked on prod)
        throw new ConvexError(
          `Complete your KYC verification before applying for work. Your KYC ${state}`
        );
      }
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

    // Server-side eligibility check: program requirement = PROGRAM COMPLETED (certificate issued)
    if (job.requiredProgramId) {
      const cert = await ctx.db
        .query("certificates")
        .withIndex("by_userId", (q) => q.eq("userId", session.userId))
        .filter((q) => q.eq(q.field("programId"), job.requiredProgramId))
        .first();
      if (!cert && isRegularUser) {
        throw new Error("You must complete the required program before applying for this opportunity");
      }
    }

    if (job.requiredAchievementId) {
      const ach = await ctx.db
        .query("userAchievements")
        .withIndex("by_userId", (q) => q.eq("userId", session.userId))
        .filter((q) => q.eq(q.field("achievementId"), job.requiredAchievementId))
        .first();
      if (!ach && isRegularUser) {
        throw new Error("You do not meet the achievement requirement for this opportunity");
      }
    }

    const now = Date.now();
    // Auto-attach portfolio link from CV profile when not provided
    let portfolioUrl = args.portfolioUrl?.trim() || undefined;
    if (!portfolioUrl) {
      const cv = await ctx.db
        .query("cvProfiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
        .first();
      if (cv?.portfolioUrl) {
        portfolioUrl = cv.portfolioUrl;
      }
    }
    if (portfolioUrl && !/^https?:\/\//i.test(portfolioUrl)) {
      throw new Error("Portfolio must be a valid http(s) link");
    }

    const appId = await ctx.db.insert("jobApplications", {
      jobId: args.jobId,
      userId: session.userId,
      answers: args.answers,
      coverNote: args.coverNote.trim(),
      portfolioUrl,
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
        const cv = user
          ? await ctx.db
              .query("cvProfiles")
              .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
              .first()
          : null;
        const overviewOk = Boolean(cv?.overview && cv.overview.trim().length >= 50);
        const experienceOk = (cv?.experience || []).length >= 1;
        const educationOk = (cv?.education || []).length >= 1;
        const skillsOk =
          (cv?.technicalSkills || []).length + (cv?.softSkills || []).length >= 3;
        const percent = Math.round(
          ([overviewOk, experienceOk, educationOk, skillsOk].filter(Boolean).length / 4) * 100
        );
        return {
          ...a,
          cvProfile: cv
            ? {
                overview: cv.overview || "",
                experience: cv.experience || [],
                education: cv.education || [],
                technicalSkills: cv.technicalSkills || [],
                softSkills: cv.softSkills || [],
                portfolioUrl: cv.portfolioUrl || "",
                completenessPercent: percent,
                complete: percent === 100,
              }
            : null,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                avatarUrl: user.avatarUrl,
                cvStatus: user.cvStatus || "pending",
                cvRemarks: user.cvRemarks,
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

    const validStatuses = [
      "submitted",
      "under_review",
      "shortlisted",
      "accepted",
      "in_progress",
      "revision_required",
      "completed",
      "rejected",
      "cancelled",
    ];
    if (!validStatuses.includes(args.status)) {
      throw new Error("Invalid application status");
    }

    const finalStates = ["completed", "rejected", "cancelled"];
    if (finalStates.includes(app.status)) {
      throw new Error(`Cannot change a ${app.status} application`);
    }

    if (args.status === "accepted") {
      const user = await ctx.db.get(app.userId);
      if (!user) throw new Error("Applicant no longer exists");
      if ((user.cvStatus || "pending") !== "verified") {
        throw new Error(
          "Applicant CV must be verified before they can be selected for work"
        );
      }
    }

    // Payout handling (only on completed, only once, capped at job payment)
    let payoutCredited = false;
    if (args.status === "completed") {
      const payout = args.payoutAmount && args.payoutAmount > 0 ? args.payoutAmount : 0;
      if (payout > 0) {
        if (app.paymentStatus === "paid") {
          throw new Error("Payout already released for this application");
        }
        if (job && payout > job.payment) {
          throw new Error(`Payout cannot exceed the job payment of ₹${job.payment}`);
        }
      }
      if (payout === 0) {
        // Mark completed without payout; stays unpaid
      }
      payoutCredited = payout > 0;

      // Enforce work payout limits from settings (0 = unlimited), scaled by user position/level
      if (payoutCredited) {
        const limitsRecord = await ctx.db
          .query("adminSettings")
          .withIndex("by_key", (q) => q.eq("key", "workLimits"))
          .first();
        const limits = limitsRecord?.value || {};
        const worker = await ctx.db.get(app.userId);
        let positionMultiplier = 1;
        if (worker?.positionId) {
          const pos = await ctx.db.get(worker.positionId);
          const m =
            limits.positionMultipliers?.[String(worker.positionId)] ??
            (pos ? limits.positionMultipliers?.[pos.name] : undefined);
          positionMultiplier = m && m > 0 ? m : 1;
        }
        const scale = (cap: number | undefined) =>
          cap && cap > 0 ? Math.round(cap * positionMultiplier) : 0;

        if (limits.maxPayoutPerJob && limits.maxPayoutPerJob > 0) {
          const cap = scale(limits.maxPayoutPerJob);
          if (cap > 0 && payout > cap) {
            throw new Error(
              `Payout exceeds the per-job cap of ₹${cap} for this user level`
            );
          }
        }

        if (limits.dailyPayoutCap && limits.dailyPayoutCap > 0) {
          const cap = scale(limits.dailyPayoutCap);
          const dayAgo = now - 24 * 60 * 60 * 1000;
          const dayTxns = await ctx.db
            .query("walletTransactions")
            .withIndex("by_userId", (q) => q.eq("userId", app.userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "WORK_PAYOUT"),
                q.gte(q.field("createdAt"), dayAgo)
              )
            )
            .collect();
          const dayTotal = dayTxns.reduce((s, t) => s + t.amount, 0) + payout;
          if (cap > 0 && dayTotal > cap) {
            throw new Error(
              `Daily work payout limit of ₹${cap} exceeded for this user level`
            );
          }
        }

        if (limits.monthlyPayoutCap && limits.monthlyPayoutCap > 0) {
          const cap = scale(limits.monthlyPayoutCap);
          const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
          const monthTxns = await ctx.db
            .query("walletTransactions")
            .withIndex("by_userId", (q) => q.eq("userId", app.userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "WORK_PAYOUT"),
                q.gte(q.field("createdAt"), monthAgo)
              )
            )
            .collect();
          const monthTotal = monthTxns.reduce((s, t) => s + t.amount, 0) + payout;
          if (cap > 0 && monthTotal > cap) {
            throw new Error(
              `Monthly work payout limit of ₹${cap} exceeded for this user level`
            );
          }
        }
      }
    }

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      adminNotes: args.adminNotes,
      paymentStatus: args.status === "completed" ? "unpaid" : app.paymentStatus,
      updatedAt: now,
    });

    // If marked completed and payout is provided
    if (args.status === "completed" && payoutCredited && args.payoutAmount && args.payoutAmount > 0) {
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
          referenceId: String(args.applicationId),
          description: `Work completion payout for: ${job?.title || "Contract Task"}`,
          status: "completed",
          createdAt: now,
        });

        await ctx.db.patch(args.applicationId, {
          paymentStatus: "paid",
        });
      } else {
        throw new Error("Applicant wallet not found; payout not released");
      }
    }

    // Send tailored notification to user
    const statusMessages: Record<string, { title: string; message: string }> = {
      accepted: {
        title: "Congratulations! You've been selected",
        message: `You have been selected for "${job?.title || "the role"}". The admin will guide you on the next steps.`,
      },
      in_progress: {
        title: "Work Started",
        message: `You are now working on "${job?.title || "the project"}". Submit your deliverable when done.${
          args.adminNotes ? ` Instructions: ${args.adminNotes}` : ""
        }`,
      },
      revision_required: {
        title: "Revision Needed",
        message: `Your deliverable for "${job?.title || "the project"}" needs revision. ${
          args.adminNotes ? `Note: ${args.adminNotes}` : ""
        }`,
      },
      completed: {
        title: "Deliverable Approved",
        message: `Your work on "${job?.title || "the project"}" was approved${
          args.payoutAmount && args.payoutAmount > 0
            ? ` and ₹${args.payoutAmount} was added to your wallet`
            : ""
        }. Thank you!`,
      },
      rejected: {
        title: "Application Not Selected",
        message: `Your application for "${job?.title || "the role"}" was not selected. ${
          args.adminNotes ? `Reason: ${args.adminNotes}` : ""
        }`,
      },
      cancelled: {
        title: "Application Cancelled",
        message: `Your application for "${job?.title || "the role"}" was cancelled. ${
          args.adminNotes ? `Reason: ${args.adminNotes}` : ""
        }`,
      },
      shortlisted: {
        title: "You've been shortlisted!",
        message: `Great news — you are shortlisted for "${job?.title || "the role"}"!`,
      },
      under_review: {
        title: "Application Under Review",
        message: `Your application for "${job?.title || "the role"}" is under review.`,
      },
      submitted: {
        title: "Application Reopened",
        message: `Your application for "${job?.title || "the role"}" is back to submitted.`,
      },
    };
    const notification = statusMessages[args.status] || {
      title: `Application Update: ${job?.title || "Job"}`,
      message: `Your application status has been updated to "${args.status.toUpperCase()}". ${
        args.adminNotes ? `Note: ${args.adminNotes}` : ""
      }`,
    };
    await ctx.db.insert("notifications", {
      userId: app.userId,
      type: "application",
      title: notification.title,
      message: notification.message,
      read: false,
      actionUrl: "/dashboard/applications",
      createdAt: now,
    });

    // Email on key status changes (accepted / completed / rejected)
    if (["accepted", "completed", "rejected"].includes(args.status)) {
      const applicant = await ctx.db.get(app.userId);
      if (applicant) {
        try {
          await ctx.scheduler.runAfter(0, internal.email.sendApplicationStatusEmail, {
            email: applicant.email,
            name: applicant.name,
            jobTitle: job?.title || "Contract Task",
            status: args.status,
            payoutAmount: args.status === "completed" ? args.payoutAmount : undefined,
            adminNotes: args.adminNotes,
          });
        } catch (e) {
          console.error("Failed to schedule application status email:", e);
        }
      }
    }

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
