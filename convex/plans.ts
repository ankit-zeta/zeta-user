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
  if (!user || !["super_admin", "admin", "content_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

async function planWithCourses(ctx: any, plan: any) {
  const courses = await Promise.all(
    (plan.programIds || []).map(async (pid: any) => {
      const p = await ctx.db.get(pid);
      if (!p) return null;
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_programId", (q: any) => q.eq("programId", pid))
        .collect();
      const totalMinutes = lessons.reduce((s: number, l: any) => s + (l.durationMinutes || 0), 0);
      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        thumbnail: p.thumbnail,
        duration: p.duration,
        price: p.price,
        lessonCount: lessons.length,
        totalMinutes,
      };
    })
  );
  return { ...plan, courses: courses.filter(Boolean) };
}

export const getPublicPlans = query({
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    plans.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    return Promise.all(plans.map((p: any) => planWithCourses(ctx, p)));
  },
});

export const getPlanBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!plan || plan.status !== "published") return null;
    return planWithCourses(ctx, plan);
  },
});

export const getAllPlansAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const plans = await ctx.db.query("plans").collect();
    plans.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    return Promise.all(plans.map((p: any) => planWithCourses(ctx, p)));
  },
});

export const createPlan = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    thumbnail: v.string(),
    bannerImage: v.string(),
    programIds: v.array(v.id("programs")),
    highlights: v.array(v.string()),
    status: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const existing = await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("A plan with this slug already exists");
    const now = Date.now();
    return await ctx.db.insert("plans", {
      name: args.name,
      slug: args.slug,
      tagline: args.tagline,
      description: args.description,
      price: args.price,
      compareAtPrice: args.compareAtPrice,
      status: args.status || "published",
      thumbnail: args.thumbnail,
      bannerImage: args.bannerImage,
      programIds: args.programIds,
      highlights: args.highlights,
      sortOrder: args.sortOrder ?? 99,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePlan = mutation({
  args: {
    token: v.string(),
    planId: v.id("plans"),
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    programIds: v.optional(v.array(v.id("programs"))),
    highlights: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Plan not found");
    const patch: any = { updatedAt: Date.now() };
    for (const k of ["name", "tagline", "description", "price", "compareAtPrice", "thumbnail", "bannerImage", "programIds", "highlights", "status", "sortOrder"] as const) {
      if (args[k] !== undefined) patch[k] = args[k];
    }
    await ctx.db.patch(args.planId, patch);
    return { success: true };
  },
});

export const deletePlan = mutation({
  args: { token: v.string(), planId: v.id("plans") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.delete(args.planId);
    return { success: true };
  },
});
