import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { BUSINESS_MODULES, BUSINESS_PROGRAM_PATCH } from "./businessCurriculum";
import { BUSINESS_RESOURCES } from "./businessResources";

/**
 * Rebuilds the Digital Business Execution (₹8,000) program with the complete
 * text-based masterclass (16 modules / 16 lessons) and the 24-file Business
 * Execution Toolkit. Idempotent: it replaces the program's existing modules,
 * lessons, resources, and demo progress. Storage IDs for the bundle PDFs
 * are prepared by the public action businessCurriculumAction:upsertBusinessCurriculum.
 */
export const upsertBusinessCurriculumDb = internalMutation({
  args: {
    token: v.string(),
    resetUserProgress: v.optional(v.boolean()),
    resourceStorageIds: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized: Invalid session");
    }
    const admin = await ctx.db.get(session.userId);
    if (!admin || !["super_admin", "admin", "content_admin"].includes(admin.role)) {
      throw new Error("Forbidden: Admin privileges required");
    }

    const program = await ctx.db
      .query("programs")
      .withIndex("by_slug", (q) => q.eq("slug", "advanced-pro-specialist"))
      .first();
    if (!program) {
      throw new Error("Business program not found. Run seedDatabase first.");
    }

    // 1. Remove existing curriculum for this program
    const oldLessons = await ctx.db
      .query("lessons")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();
    for (const l of oldLessons) {
      await ctx.db.delete(l._id);
    }
    const oldModules = await ctx.db
      .query("programModules")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();
    for (const m of oldModules) {
      await ctx.db.delete(m._id);
    }
    const oldResources = await ctx.db
      .query("resources")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();
    for (const r of oldResources) {
      await ctx.db.delete(r._id);
    }
    const oldProgress = await ctx.db
      .query("lessonProgress")
      .filter((q) => q.eq(q.field("programId"), program._id))
      .collect();
    for (const p of oldProgress) {
      await ctx.db.delete(p._id);
    }

    // 2. Patch program metadata
    await ctx.db.patch(program._id, {
      ...BUSINESS_PROGRAM_PATCH,
      updatedAt: Date.now(),
    });

    // 3. Create modules + lessons
    const now = Date.now();
    const lessonIds = [];
    let totalMinutes = 0;
    for (const moduleDef of BUSINESS_MODULES) {
      const moduleId = await ctx.db.insert("programModules", {
        programId: program._id,
        title: moduleDef.title,
        description: moduleDef.description,
        sortOrder: moduleDef.sortOrder,
        createdAt: now,
      });
      for (const lessonDef of moduleDef.lessons) {
        totalMinutes += lessonDef.durationMinutes;
        const lessonId = await ctx.db.insert("lessons", {
          programId: program._id,
          moduleId,
          title: lessonDef.title,
          slug: lessonDef.slug,
          type: "text",
          content: lessonDef.content,
          durationMinutes: lessonDef.durationMinutes,
          sortOrder: lessonDef.sortOrder,
          status: "published",
          isPreview: lessonDef.isPreview,
          createdAt: now,
          updatedAt: now,
        });
        lessonIds.push(lessonId);
      }
    }

    // 4. Insert bundle resources (storageIds were created by the action)
    const resourceIds = [];
    for (const resDef of BUSINESS_RESOURCES) {
      const storageId = args.resourceStorageIds[resDef.slug];
      if (!storageId) throw new Error(`Missing storage id for ${resDef.slug}`);
      const estimatedBytes = resDef.pdfLines.reduce(
        (sum, line) => sum + line.length + 2,
        512
      );
      const resourceId = await ctx.db.insert("resources", {
        title: resDef.title,
        description: resDef.description,
        fileUrl: storageId,
        fileType: "pdf",
        fileSize: `${Math.max(1, Math.round(estimatedBytes / (1024 * 1024) * 10) / 10)} MB`,
        programId: program._id,
        accessType: "enrolled",
        downloadCount: 0,
        sortOrder: resDef.sortOrder,
        createdAt: now,
      });
      resourceIds.push(resourceId);
    }

    // 5. Ensure demo user is enrolled and mark first 3 lessons complete
    const demoUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@zetagrow.com"))
      .first();
    if (demoUser) {
      const existingPurchase = await ctx.db
        .query("purchases")
        .withIndex("by_userId", (q) => q.eq("userId", demoUser._id))
        .filter((q) => q.eq(q.field("programId"), program._id))
        .first();
      if (!existingPurchase) {
        await ctx.db.insert("purchases", {
          userId: demoUser._id,
          programId: program._id,
          amount: program.price,
          status: "completed",
          paymentId: "SEED-ENROLLMENT",
          paymentMethod: "manual",
          createdAt: now,
        });
      } else if (existingPurchase.status !== "completed") {
        await ctx.db.patch(existingPurchase._id, { status: "completed" });
      }
      const freshProgress = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user_program", (q) =>
          q.eq("userId", demoUser._id).eq("programId", program._id)
        )
        .collect();
      for (const p of freshProgress) {
        await ctx.db.delete(p._id);
      }
      if (args.resetUserProgress !== false) {
        for (const lessonId of lessonIds.slice(0, 3)) {
          await ctx.db.insert("lessonProgress", {
            userId: demoUser._id,
            programId: program._id,
            lessonId,
            completed: true,
            completedAt: now,
          });
        }
      }
    }

    return {
      message: "Business curriculum rebuilt successfully.",
      modules: BUSINESS_MODULES.length,
      lessons: lessonIds.length,
      resources: resourceIds.length,
      totalMinutes,
      demoEnrolled: !!demoUser,
    };
  },
});