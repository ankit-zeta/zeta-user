import { v } from "convex/values";
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
  if (!user || !["super_admin", "admin", "content_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

// User Learning Course Player
export const getCoursePlayerState = query({
  args: {
    token: v.string(),
    programId: v.id("programs"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const program = await ctx.db.get(args.programId);
    if (!program) throw new Error("Program not found");

    // Check enrollment
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .first();

    const sessionUser = await ctx.db.get(session.userId);
    const isEnrolled = purchase?.status === "completed" || (sessionUser && sessionUser.role !== "user");

    // Get modules and lessons
    const modules = await ctx.db
      .query("programModules")
      .withIndex("by_programId", (q) => q.eq("programId", args.programId))
      .collect();
    modules.sort((a, b) => a.sortOrder - b.sortOrder);

    // Get user progress
    const progressList = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_program", (q) =>
        q.eq("userId", session.userId).eq("programId", args.programId)
      )
      .collect();

    const completedLessonIds = new Set(
      progressList.filter((p) => p.completed).map((p) => p.lessonId)
    );

    let totalLessons = 0;
    const modulesWithLessons = await Promise.all(
      modules.map(async (m) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_moduleId", (q) => q.eq("moduleId", m._id))
          .collect();
        lessons.sort((a, b) => a.sortOrder - b.sortOrder);
        totalLessons += lessons.length;

        return {
          ...m,
          lessons: lessons.map((l) => ({
            ...l,
            isCompleted: completedLessonIds.has(l._id),
          })),
        };
      })
    );

    const completedCount = completedLessonIds.size;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Check certificate
    const certificate = await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .first();

    return {
      program,
      isEnrolled,
      modules: modulesWithLessons,
      totalLessons,
      completedCount,
      progressPercentage,
      certificate,
    };
  },
});

export const toggleLessonComplete = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    // Enrollment gate: only enrolled users (completed purchase or staff) may
    // mark lessons complete — prevents minting certificates / unlocking job
    // eligibility without actually owning the program.
    const program = await ctx.db.get(args.programId);
    if (!program) throw new Error("Program not found");
    const sessionUser = await ctx.db.get(session.userId);
    if (!sessionUser) throw new Error("User not found");
    if (sessionUser.role === "user") {
      const purchase = await ctx.db
        .query("purchases")
        .withIndex("by_userId", (q) => q.eq("userId", session.userId))
        .filter((q) => q.eq(q.field("programId"), args.programId))
        .first();
      if (!purchase || purchase.status !== "completed") {
        throw new Error("You must enroll in this program to access its lessons");
      }
    }

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", session.userId).eq("lessonId", args.lessonId)
      )
      .first();

    const now = Date.now();
    let isCompleted = true;

    if (existing) {
      isCompleted = !existing.completed;
      await ctx.db.patch(existing._id, {
        completed: isCompleted,
        completedAt: now,
      });
    } else {
      await ctx.db.insert("lessonProgress", {
        userId: session.userId,
        programId: args.programId,
        lessonId: args.lessonId,
        completed: true,
        completedAt: now,
      });
    }

    // Genuine-consumption gate: the buyer's FIRST completed lesson anywhere
    // activates any referral commissions that were awaiting proof of usage.
    const priorProgress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_program", (q) => q.eq("userId", session.userId).eq("programId", args.programId))
      .collect();
    if (priorProgress.filter((p) => p.completed).length === 1) {
      const pendingSales = await ctx.db
        .query("affiliateSales")
        .withIndex("by_buyerUserId", (q) => q.eq("buyerUserId", session.userId))
        .collect();
      for (const s of pendingSales) {
        if (s.awaitingConsumption) {
          await ctx.db.patch(s._id, { awaitingConsumption: false });
        }
      }
      // Audit trail entry
      await ctx.db.insert("auditLogs", {
        adminUserId: session.userId,
        adminEmail: sessionUser.email,
        action: "consumption_verified",
        entityType: "user",
        entityId: session.userId.toString(),
        previousValue: undefined,
        newValue: undefined,
        reason: "First lesson completed — referral commissions activated.",
        timestamp: now,
      });
    }
    // Recalculate total course completion
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_programId", (q) => q.eq("programId", args.programId))
      .collect();

    const userProgress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_program", (q) =>
        q.eq("userId", session.userId).eq("programId", args.programId)
      )
      .collect();

    const completedSet = new Set(
      userProgress.filter((p) => p.completed).map((p) => p.lessonId)
    );

    const isAllCompleted = allLessons.length > 0 && allLessons.every((l) => completedSet.has(l._id));

    // If 100% completed and program has certificateEnabled, auto-issue certificate if not yet issued
    if (isAllCompleted) {
      if (program?.certificateEnabled) {
        const existingCert = await ctx.db
          .query("certificates")
          .withIndex("by_userId", (q) => q.eq("userId", session.userId))
          .filter((q) => q.eq(q.field("programId"), args.programId))
          .first();

        if (!existingCert) {
          const user = await ctx.db.get(session.userId);
          const year = new Date().getFullYear();
          const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const certId = `ZG-${year}-${randomCode}`;

          await ctx.db.insert("certificates", {
            certificateId: certId,
            userId: session.userId,
            programId: args.programId,
            recipientName: user?.name || "Student",
            programName: program.name,
            issueDate: now,
            verificationUrl: `/certificate/${certId}`,
          });

          await ctx.db.insert("notifications", {
            userId: session.userId,
            type: "certificate",
            title: "Certificate Earned!",
            message: `Congratulations! You have completed "${program.name}" and your verified certificate is ready.`,
            read: false,
            actionUrl: `/dashboard/certificates`,
            createdAt: now,
          });

          // Certificate earned email
          try {
            if (user) {
              await ctx.scheduler.runAfter(0, internal.email.sendCertificateEarnedEmail, {
                email: user.email,
                name: user.name,
                programName: program.name,
                certificateId: certId,
              });
            }
          } catch (e) {
            console.error("Failed to schedule certificate email:", e);
          }
        }
      }
    }

    return { success: true, isCompleted };
  },
});

// Admin Module & Lesson Mutations
export const createModule = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    title: v.string(),
    description: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.db.insert("programModules", {
      programId: args.programId,
      title: args.title.trim(),
      description: args.description.trim(),
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
    });
  },
});

export const updateModule = mutation({
  args: {
    token: v.string(),
    moduleId: v.id("programModules"),
    title: v.string(),
    description: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.moduleId, {
      title: args.title.trim(),
      description: args.description.trim(),
      sortOrder: args.sortOrder,
    });
    return { success: true };
  },
});

export const createLesson = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    moduleId: v.id("programModules"),
    title: v.string(),
    slug: v.string(),
    type: v.string(),
    content: v.string(),
    videoUrl: v.optional(v.string()),
    durationMinutes: v.number(),
    sortOrder: v.number(),
    status: v.string(),
    isPreview: v.boolean(),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
    quizData: v.optional(
      v.array(
        v.object({
          question: v.string(),
          options: v.array(v.string()),
          correctIndex: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const now = Date.now();
    return await ctx.db.insert("lessons", {
      programId: args.programId,
      moduleId: args.moduleId,
      title: args.title.trim(),
      slug: args.slug.trim().toLowerCase(),
      type: args.type,
      content: args.content,
      videoUrl: args.videoUrl,
      durationMinutes: args.durationMinutes,
      sortOrder: args.sortOrder,
      status: args.status,
      isPreview: args.isPreview,
      attachmentUrl: args.attachmentUrl,
      attachmentName: args.attachmentName,
      quizData: args.quizData,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateLesson = mutation({
  args: {
    token: v.string(),
    lessonId: v.id("lessons"),
    title: v.string(),
    slug: v.string(),
    type: v.string(),
    content: v.string(),
    videoUrl: v.optional(v.string()),
    durationMinutes: v.number(),
    sortOrder: v.number(),
    status: v.string(),
    isPreview: v.boolean(),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
    quizData: v.optional(
      v.array(
        v.object({
          question: v.string(),
          options: v.array(v.string()),
          correctIndex: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.lessonId, {
      title: args.title.trim(),
      slug: args.slug.trim().toLowerCase(),
      type: args.type,
      content: args.content,
      videoUrl: args.videoUrl,
      durationMinutes: args.durationMinutes,
      sortOrder: args.sortOrder,
      status: args.status,
      isPreview: args.isPreview,
      attachmentUrl: args.attachmentUrl,
      attachmentName: args.attachmentName,
      quizData: args.quizData,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const deleteLesson = mutation({
  args: {
    token: v.string(),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const progress = await ctx.db
      .query("lessonProgress")
      .filter((q) => q.eq(q.field("lessonId"), args.lessonId))
      .collect();
    for (const p of progress) {
      await ctx.db.delete(p._id);
    }

    await ctx.db.delete(args.lessonId);
    return { success: true };
  },
});

export const deleteModule = mutation({
  args: {
    token: v.string(),
    moduleId: v.id("programModules"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const module = await ctx.db.get(args.moduleId);
    if (!module) throw new Error("Module not found");

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    for (const l of lessons) {
      const progress = await ctx.db
        .query("lessonProgress")
        .filter((q) => q.eq(q.field("lessonId"), l._id))
        .collect();
      for (const p of progress) {
        await ctx.db.delete(p._id);
      }
      await ctx.db.delete(l._id);
    }

    const resources = await ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("moduleId"), args.moduleId))
      .collect();
    for (const r of resources) {
      await ctx.db.patch(r._id, { moduleId: undefined });
    }

    await ctx.db.delete(args.moduleId);
    return { success: true };
  },
});
