import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Public: get active banners for a target page
export const getActiveBanners = query({
  args: { targetPage: v.string() },
  handler: async (ctx, args) => {
    const banners = await ctx.db
      .query("banners")
      .withIndex("by_targetPage", (q) =>
        q.eq("targetPage", args.targetPage).eq("isActive", true)
      )
      .collect();

    // Also fetch "both" banners
    const bothBanners = await ctx.db
      .query("banners")
      .withIndex("by_targetPage", (q) =>
        q.eq("targetPage", "both").eq("isActive", true)
      )
      .collect();

    const all = [...banners, ...bothBanners];
    // Deduplicate by _id
    const seen = new Set<string>();
    const unique = all.filter((b) => {
      if (seen.has(b._id.toString())) return false;
      seen.add(b._id.toString());
      return true;
    });

    return unique.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Admin: get all banners
export const getAllBanners = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user || user.role === "user") {
      throw new Error("Admin access required");
    }

    return await ctx.db.query("banners").collect();
  },
});

// Admin: create banner
export const createBanner = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    imageUrl: v.string(),
    linkUrl: v.optional(v.string()),
    targetPage: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user || user.role === "user") {
      throw new Error("Admin access required");
    }

    const now = Date.now();
    const bannerId = await ctx.db.insert("banners", {
      title: args.title,
      imageUrl: args.imageUrl,
      linkUrl: args.linkUrl,
      targetPage: args.targetPage,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: session.userId,
      adminEmail: user.email,
      action: "banner_created",
      entityType: "banner",
      entityId: bannerId.toString(),
      previousValue: undefined,
      newValue: JSON.stringify({ title: args.title, targetPage: args.targetPage }),
      timestamp: now,
    });

    return { success: true, bannerId };
  },
});

// Admin: update banner
export const updateBanner = mutation({
  args: {
    token: v.string(),
    bannerId: v.id("banners"),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    targetPage: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user || user.role === "user") {
      throw new Error("Admin access required");
    }

    const existing = await ctx.db.get(args.bannerId);
    if (!existing) throw new Error("Banner not found");

    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title;
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl;
    if (args.linkUrl !== undefined) patch.linkUrl = args.linkUrl;
    if (args.targetPage !== undefined) patch.targetPage = args.targetPage;
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.sortOrder !== undefined) patch.sortOrder = args.sortOrder;

    await ctx.db.patch(args.bannerId, patch);

    await ctx.db.insert("auditLogs", {
      adminUserId: session.userId,
      adminEmail: user.email,
      action: "banner_updated",
      entityType: "banner",
      entityId: args.bannerId.toString(),
      previousValue: JSON.stringify({ title: existing.title, isActive: existing.isActive }),
      newValue: JSON.stringify(patch),
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Admin: delete banner
export const deleteBanner = mutation({
  args: {
    token: v.string(),
    bannerId: v.id("banners"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user || user.role === "user") {
      throw new Error("Admin access required");
    }

    const existing = await ctx.db.get(args.bannerId);
    if (!existing) throw new Error("Banner not found");

    await ctx.db.delete(args.bannerId);

    await ctx.db.insert("auditLogs", {
      adminUserId: session.userId,
      adminEmail: user.email,
      action: "banner_deleted",
      entityType: "banner",
      entityId: args.bannerId.toString(),
      previousValue: JSON.stringify({ title: existing.title }),
      newValue: undefined,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
