import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

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

async function resolveCover(ctx: any, storageId?: string): Promise<string | null> {
  if (!storageId) return null;
  try {
    return await ctx.storage.getUrl(storageId);
  } catch {
    return null;
  }
}

async function hasCompletedProgram(ctx: any, userId: any, programId: any): Promise<boolean> {
  const cert = await ctx.db
    .query("certificates")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("programId"), programId))
    .first();
  return !!cert;
}

export const generateJobCoverUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getPublicJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    return Promise.all(
      jobs.map(async (job) => ({
        ...job,
        coverImageUrl: await resolveCover(ctx, job.coverImageStorageId),
      }))
    );
  },
});

export const getJobsWithEligibility = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let user = null;
    let enrolledProgramIds = new Set<string>();
    let unlockedAchievementIds = new Set<string>();
    let userApplications = new Map<string, string>(); // jobId -> applicationStatus

    if (args.token) {
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token!))
        .first();

      if (session && session.expiresAt >= Date.now()) {
        user = await ctx.db.get(session.userId);
        const purchases = await ctx.db
          .query("purchases")
          .withIndex("by_userId", (q) => q.eq("userId", session.userId))
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect();
        enrolledProgramIds = new Set(purchases.map((p) => p.programId.toString()));

        const userAch = await ctx.db
          .query("userAchievements")
          .withIndex("by_userId", (q) => q.eq("userId", session.userId))
          .collect();
        unlockedAchievementIds = new Set(userAch.map((a) => a.achievementId.toString()));

        const apps = await ctx.db
          .query("jobApplications")
          .withIndex("by_userId", (q) => q.eq("userId", session.userId))
          .collect();
        apps.forEach((a) => userApplications.set(a.jobId.toString(), a.status));
      }
    }

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const jobsWithStatus = await Promise.all(
      jobs.map(async (job) => {
        let isEligible = true;
        const missingRequirements: string[] = [];

        let requiredProgramName = undefined;
        if (job.requiredProgramId) {
          const reqProg = await ctx.db.get(job.requiredProgramId);
          requiredProgramName = reqProg?.name;
          if (user && !(await hasCompletedProgram(ctx, user._id, job.requiredProgramId))) {
            isEligible = false;
            missingRequirements.push(`Requires completing ${reqProg?.name || "Required Program"}`);
          }
        }

        let requiredAchievementName = undefined;
        if (job.requiredAchievementId) {
          const reqAch = await ctx.db.get(job.requiredAchievementId);
          requiredAchievementName = reqAch?.name;
          if (user && !unlockedAchievementIds.has(job.requiredAchievementId.toString())) {
            isEligible = false;
            missingRequirements.push(`Requires unlocking ${reqAch?.name || "Required Achievement"}`);
          }
        }

        const applicationStatus = userApplications.get(job._id.toString()) || null;

        return {
          ...job,
          coverImageUrl: await resolveCover(ctx, job.coverImageStorageId),
          isEligible: user ? isEligible : true, // guests see jobs
          missingRequirements,
          requiredProgramName,
          requiredAchievementName,
          applicationStatus,
        };
      })
    );

    return jobsWithStatus;
  },
});

export const getJobBySlug = query({
  args: { slug: v.string(), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!job) return null;

    let requiredProgram = null;
    if (job.requiredProgramId) {
      requiredProgram = await ctx.db.get(job.requiredProgramId);
    }

    let requiredAchievement = null;
    if (job.requiredAchievementId) {
      requiredAchievement = await ctx.db.get(job.requiredAchievementId);
    }

    let isEligible = true;
    let missingRequirements: string[] = [];
    let existingApplication = null;

    if (args.token) {
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token!))
        .first();

      if (session && session.expiresAt >= Date.now()) {
        const purchases = await ctx.db
          .query("purchases")
          .withIndex("by_userId", (q) => q.eq("userId", session.userId))
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect();
        const enrolledProgramIds = new Set(purchases.map((p) => p.programId.toString()));

        const userAch = await ctx.db
          .query("userAchievements")
          .withIndex("by_userId", (q) => q.eq("userId", session.userId))
          .collect();
        const unlockedAchievementIds = new Set(userAch.map((a) => a.achievementId.toString()));

        if (job.requiredProgramId && !(await hasCompletedProgram(ctx, session.userId, job.requiredProgramId))) {
          isEligible = false;
          missingRequirements.push(`Requires completing ${requiredProgram?.name || "Program"}`);
        }

        if (job.requiredAchievementId && !unlockedAchievementIds.has(job.requiredAchievementId.toString())) {
          isEligible = false;
          missingRequirements.push(`Requires unlocking ${requiredAchievement?.name || "Achievement"}`);
        }

        existingApplication = await ctx.db
          .query("jobApplications")
          .withIndex("by_userId", (q) => q.eq("userId", session.userId))
          .filter((q) => q.eq(q.field("jobId"), job._id))
          .first();
      }
    }

    return {
      ...job,
      coverImageUrl: await resolveCover(ctx, job.coverImageStorageId),
      requiredProgram,
      requiredAchievement,
      isEligible,
      missingRequirements,
      existingApplication,
    };
  },
});

// Admin Job CRUD
export const getAllJobsAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const jobs = await ctx.db.query("jobs").collect();

    const jobsWithCounts = await Promise.all(
      jobs.map(async (j) => {
        const applications = await ctx.db
          .query("jobApplications")
          .withIndex("by_jobId", (q) => q.eq("jobId", j._id))
          .collect();

        return {
          ...j,
          coverImageUrl: await resolveCover(ctx, j.coverImageStorageId),
          applicantCount: applications.length,
          acceptedCount: applications.filter((a) => ["accepted", "in_progress", "completed"].includes(a.status)).length,
        };
      })
    );

    return jobsWithCounts;
  },
});

export const createJob = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    slug: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    category: v.string(),
    skills: v.array(v.string()),
    requirements: v.array(v.string()),
    requiredProgramId: v.optional(v.id("programs")),
    requiredAchievementId: v.optional(v.id("achievements")),
    payment: v.number(),
    paymentType: v.string(),
    workType: v.string(),
    difficulty: v.string(),
    estimatedDuration: v.string(),
    deadline: v.string(),
    openings: v.number(),
    status: v.string(),
    applicationQuestions: v.array(v.string()),
    attachments: v.optional(v.array(v.string())),
    company: v.optional(v.string()),
    coverImageStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const now = Date.now();

    const jobId = await ctx.db.insert("jobs", {
      title: args.title.trim(),
      slug: args.slug.trim().toLowerCase(),
      shortDescription: args.shortDescription.trim(),
      description: args.description.trim(),
      category: args.category.trim(),
      skills: args.skills,
      requirements: args.requirements,
      requiredProgramId: args.requiredProgramId,
      requiredAchievementId: args.requiredAchievementId,
      payment: args.payment,
      paymentType: args.paymentType,
      workType: args.workType,
      difficulty: args.difficulty,
      estimatedDuration: args.estimatedDuration,
      deadline: args.deadline,
      openings: args.openings,
      status: args.status,
      applicationQuestions: args.applicationQuestions,
      attachments: args.attachments,
      company: args.company,
      coverImageStorageId: args.coverImageStorageId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "CREATE_JOB",
      entityType: "jobs",
      entityId: jobId,
      newValue: args.title,
      reason: "Admin job creation",
      timestamp: now,
    });

    return jobId;
  },
});

export const updateJob = mutation({
  args: {
    token: v.string(),
    jobId: v.id("jobs"),
    title: v.string(),
    slug: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    category: v.string(),
    skills: v.array(v.string()),
    requirements: v.array(v.string()),
    requiredProgramId: v.optional(v.id("programs")),
    requiredAchievementId: v.optional(v.id("achievements")),
    payment: v.number(),
    paymentType: v.string(),
    workType: v.string(),
    difficulty: v.string(),
    estimatedDuration: v.string(),
    deadline: v.string(),
    openings: v.number(),
    status: v.string(),
    applicationQuestions: v.array(v.string()),
    company: v.optional(v.string()),
    coverImageStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const prev = await ctx.db.get(args.jobId);
    if (!prev) throw new Error("Job not found");

    const now = Date.now();
    await ctx.db.patch(args.jobId, {
      title: args.title.trim(),
      slug: args.slug.trim().toLowerCase(),
      shortDescription: args.shortDescription.trim(),
      description: args.description.trim(),
      category: args.category.trim(),
      skills: args.skills,
      requirements: args.requirements,
      requiredProgramId: args.requiredProgramId,
      requiredAchievementId: args.requiredAchievementId,
      payment: args.payment,
      paymentType: args.paymentType,
      workType: args.workType,
      difficulty: args.difficulty,
      estimatedDuration: args.estimatedDuration,
      deadline: args.deadline,
      openings: args.openings,
      status: args.status,
      applicationQuestions: args.applicationQuestions,
      company: args.company !== undefined ? args.company : prev.company,
      coverImageStorageId:
        args.coverImageStorageId !== undefined
          ? args.coverImageStorageId
          : prev.coverImageStorageId,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_JOB",
      entityType: "jobs",
      entityId: args.jobId,
      previousValue: prev.title,
      newValue: args.title,
      reason: "Admin job modification",
      timestamp: now,
    });

    return { success: true };
  },
});

export const deleteJob = mutation({
  args: {
    token: v.string(),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const now = Date.now();

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "DELETE_JOB",
      entityType: "jobs",
      entityId: args.jobId,
      previousValue: job.title,
      reason: "Admin job deletion",
      timestamp: now,
    });

    await ctx.db.delete(args.jobId);

    return { success: true };
  },
});
