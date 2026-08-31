import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

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

// Public & user queries
export const getPublicPrograms = query({
  args: {},
  handler: async (ctx) => {
    const programs = await ctx.db
      .query("programs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    programs.sort((a, b) => a.sortOrder - b.sortOrder);

    return programs.map((p) => ({
      ...p,
      thumbnailUrl: p.thumbnail || null,
    }));
  },
});

export const getProgramBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const program = await ctx.db
      .query("programs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!program) return null;

    // Get modules and lessons for curriculum overview
    const modules = await ctx.db
      .query("programModules")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();

    modules.sort((a, b) => a.sortOrder - b.sortOrder);

    const modulesWithLessons = await Promise.all(
      modules.map(async (m) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_moduleId", (q) => q.eq("moduleId", m._id))
          .collect();
        lessons.sort((a, b) => a.sortOrder - b.sortOrder);
        return {
          ...m,
          lessons: lessons.map((l) => ({
            _id: l._id,
            title: l.title,
            slug: l.slug,
            type: l.type,
            durationMinutes: l.durationMinutes,
            isPreview: l.isPreview,
          })),
        };
      })
    );

    // Public resource preview for this program (no file URLs leaked pre-purchase)
    const programResources = await ctx.db
      .query("resources")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();
    programResources.sort((a, b) => a.sortOrder - b.sortOrder);

    const totalLessons = modulesWithLessons.reduce(
      (sum: number, m: any) => sum + (m.lessons?.length || 0),
      0
    );
    const totalMinutes = modulesWithLessons.reduce(
      (sum: number, m: any) =>
        sum + (m.lessons || []).reduce((s: number, l: any) => s + (l.durationMinutes || 0), 0),
      0
    );

    return {
      ...program,
      modules: modulesWithLessons,
      stats: {
        moduleCount: modules.length,
        lessonCount: totalLessons,
        totalMinutes,
      },
      resources: programResources.map((r) => ({
        title: r.title,
        description: r.description,
        fileType: r.fileType,
        fileSize: r.fileSize,
        accessType: r.accessType,
      })),
    };
  },
});

export const getProgramById = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, args) => {
    const program = await ctx.db.get(args.programId);
    if (!program) return null;

    const modules = await ctx.db
      .query("programModules")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();
    modules.sort((a, b) => a.sortOrder - b.sortOrder);

    const modulesWithLessons = await Promise.all(
      modules.map(async (m) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_moduleId", (q) => q.eq("moduleId", m._id))
          .collect();
        lessons.sort((a, b) => a.sortOrder - b.sortOrder);
        return {
          ...m,
          lessons,
        };
      })
    );

    return {
      ...program,
      modules: modulesWithLessons,
    };
  },
});

// Admin Program CRUD
export const getProgramAdminDetail = query({
  args: { token: v.string(), programId: v.id("programs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const program = await ctx.db.get(args.programId);
    if (!program) throw new Error("Program not found");

    const modules = await ctx.db
      .query("programModules")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();
    modules.sort((a, b) => a.sortOrder - b.sortOrder);

    const modulesWithLessons = await Promise.all(
      modules.map(async (m) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_moduleId", (q) => q.eq("moduleId", m._id))
          .collect();
        lessons.sort((a, b) => a.sortOrder - b.sortOrder);
        return { ...m, lessons };
      })
    );

    const resources = await ctx.db
      .query("resources")
      .withIndex("by_programId", (q) => q.eq("programId", program._id))
      .collect();
    resources.sort((a, b) => a.sortOrder - b.sortOrder);

    return { ...program, modules: modulesWithLessons, resources };
  },
});

export const getAllProgramsAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const programs = await ctx.db.query("programs").collect();
    programs.sort((a, b) => a.sortOrder - b.sortOrder);

    const detailed = await Promise.all(
      programs.map(async (p) => {
        const modules = await ctx.db
          .query("programModules")
          .withIndex("by_programId", (q) => q.eq("programId", p._id))
          .collect();
        const purchases = await ctx.db
          .query("purchases")
          .withIndex("by_programId", (q) => q.eq("programId", p._id))
          .collect();

        return {
          ...p,
          moduleCount: modules.length,
          enrollmentsCount: purchases.filter((item) => item.status === "completed").length,
        };
      })
    );

    return detailed;
  },
});

export const createProgram = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    slug: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    status: v.string(),
    thumbnail: v.string(),
    bannerImage: v.optional(v.string()),
    duration: v.string(),
    accessDuration: v.string(),
    certificateEnabled: v.boolean(),
    affiliateEnabled: v.boolean(),
    format: v.optional(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.number(),
    whatIncluded: v.array(v.string()),
    outcomes: v.array(v.string()),
    faqs: v.array(v.object({ question: v.string(), answer: v.string() })),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const now = Date.now();

    const programId = await ctx.db.insert("programs", {
      name: args.name.trim(),
      slug: args.slug.trim().toLowerCase(),
      shortDescription: args.shortDescription.trim(),
      description: args.description.trim(),
      price: args.price,
      compareAtPrice: args.compareAtPrice,
      status: args.status,
      thumbnail: args.thumbnail,
      bannerImage: args.bannerImage,
      duration: args.duration,
      accessDuration: args.accessDuration,
      certificateEnabled: args.certificateEnabled,
      affiliateEnabled: args.affiliateEnabled,
      format: args.format ?? "text",
      category: args.category ?? "Digital Skills",
      sortOrder: args.sortOrder,
      whatIncluded: args.whatIncluded,
      outcomes: args.outcomes,
      faqs: args.faqs,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "CREATE_PROGRAM",
      entityType: "programs",
      entityId: programId,
      newValue: args.name,
      reason: "Admin program creation",
      timestamp: now,
    });

    return programId;
  },
});

export const updateProgram = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    name: v.string(),
    slug: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    status: v.string(),
    thumbnail: v.string(),
    bannerImage: v.optional(v.string()),
    duration: v.string(),
    accessDuration: v.string(),
    certificateEnabled: v.boolean(),
    affiliateEnabled: v.boolean(),
    format: v.optional(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.number(),
    whatIncluded: v.array(v.string()),
    outcomes: v.array(v.string()),
    faqs: v.array(v.object({ question: v.string(), answer: v.string() })),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const prev = await ctx.db.get(args.programId);
    if (!prev) throw new Error("Program not found");

    const now = Date.now();
    await ctx.db.patch(args.programId, {
      name: args.name.trim(),
      slug: args.slug.trim().toLowerCase(),
      shortDescription: args.shortDescription.trim(),
      description: args.description.trim(),
      price: args.price,
      compareAtPrice: args.compareAtPrice,
      status: args.status,
      thumbnail: args.thumbnail,
      bannerImage: args.bannerImage,
      duration: args.duration,
      accessDuration: args.accessDuration,
      certificateEnabled: args.certificateEnabled,
      affiliateEnabled: args.affiliateEnabled,
      format: args.format ?? "text",
      category: args.category ?? "Digital Skills",
      sortOrder: args.sortOrder,
      whatIncluded: args.whatIncluded,
      outcomes: args.outcomes,
      faqs: args.faqs,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "UPDATE_PROGRAM",
      entityType: "programs",
      entityId: args.programId,
      previousValue: `Price: ${prev.price}, Name: ${prev.name}`,
      newValue: `Price: ${args.price}, Name: ${args.name}`,
      reason: "Admin program modification",
      timestamp: now,
    });

    return { success: true };
  },
});

// Internal mutation for updating program images without admin auth (one-time use)
export const updateProgramImageInternal = mutation({
  args: {
    programId: v.id("programs"),
    thumbnail: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: any = { updatedAt: now };
    if (args.thumbnail !== undefined) updates.thumbnail = args.thumbnail;
    if (args.bannerImage !== undefined) updates.bannerImage = args.bannerImage;
    await ctx.db.patch(args.programId, updates);
    return { success: true };
  },
});

export const deleteProgram = mutation({
  args: {
    token: v.string(),
    programId: v.id("programs"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const prog = await ctx.db.get(args.programId);
    if (!prog) throw new Error("Program not found");

    await ctx.db.patch(args.programId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "ARCHIVE_PROGRAM",
      entityType: "programs",
      entityId: args.programId,
      previousValue: prog.status,
      newValue: "archived",
      reason: args.reason,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getEnrolledProgramsDetail = query({
  args: { programIds: v.array(v.id("programs")) },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.programIds.map(async (pid) => {
        const prog = await ctx.db.get(pid);
        if (!prog || prog.status !== "published") return null;

        const thumbnailUrl = prog.thumbnail || null;

        const modules = await ctx.db
          .query("programModules")
          .withIndex("by_programId", (q) => q.eq("programId", pid))
          .collect();
        modules.sort((a, b) => a.sortOrder - b.sortOrder);

        const modulesWithLessons = await Promise.all(
          modules.map(async (m) => {
            const lessons = await ctx.db
              .query("lessons")
              .withIndex("by_moduleId", (q) => q.eq("moduleId", m._id))
              .collect();
            lessons.sort((a, b) => a.sortOrder - b.sortOrder);
            return {
              _id: m._id,
              title: m.title,
              description: m.description,
              sortOrder: m.sortOrder,
              lessonCount: lessons.length,
              lessons: lessons.map((l) => ({
                _id: l._id,
                title: l.title,
                slug: l.slug,
                type: l.type,
                sortOrder: l.sortOrder,
              })),
            };
          })
        );

        const totalLessons = modulesWithLessons.reduce((s, m) => s + m.lessonCount, 0);

        return {
          _id: prog._id,
          slug: prog.slug,
          name: prog.name,
          shortDescription: prog.shortDescription,
          duration: prog.duration,
          accessDuration: prog.accessDuration,
          category: prog.category,
          thumbnailUrl,
          moduleCount: modules.length,
          totalLessons,
          modules: modulesWithLessons,
        };
      })
    );

    return results.filter(Boolean);
  },
});
