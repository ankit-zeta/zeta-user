import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Public: get active banners for a target page
export const getActiveBanners = query({
  args: { targetPage: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
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

    // Filter by date range if set
    return unique
      .filter((b) => {
        if (b.startDate && b.startDate > now) return false;
        if (b.endDate && b.endDate < now) return false;
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
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
    subtitle: v.optional(v.string()),
    imageUrl: v.string(),
    linkUrl: v.optional(v.string()),
    targetPage: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
    ctaText: v.optional(v.string()),
    ctaColor: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    openInNewTab: v.optional(v.boolean()),
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
      subtitle: args.subtitle,
      imageUrl: args.imageUrl,
      linkUrl: args.linkUrl,
      targetPage: args.targetPage,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
      ctaText: args.ctaText,
      ctaColor: args.ctaColor,
      startDate: args.startDate,
      endDate: args.endDate,
      openInNewTab: args.openInNewTab,
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
    subtitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    targetPage: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    ctaText: v.optional(v.string()),
    ctaColor: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    openInNewTab: v.optional(v.boolean()),
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
    if (args.subtitle !== undefined) patch.subtitle = args.subtitle;
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl;
    if (args.linkUrl !== undefined) patch.linkUrl = args.linkUrl;
    if (args.targetPage !== undefined) patch.targetPage = args.targetPage;
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.sortOrder !== undefined) patch.sortOrder = args.sortOrder;
    if (args.ctaText !== undefined) patch.ctaText = args.ctaText;
    if (args.ctaColor !== undefined) patch.ctaColor = args.ctaColor;
    if (args.startDate !== undefined) patch.startDate = args.startDate;
    if (args.endDate !== undefined) patch.endDate = args.endDate;
    if (args.openInNewTab !== undefined) patch.openInNewTab = args.openInNewTab;

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

// Admin: reorder banners
export const reorderBanners = mutation({
  args: {
    token: v.string(),
    orderedIds: v.array(v.id("banners")),
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
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], {
        sortOrder: i,
        updatedAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      adminUserId: session.userId,
      adminEmail: user.email,
      action: "banners_reordered",
      entityType: "banner",
      entityId: "bulk",
      previousValue: undefined,
      newValue: JSON.stringify({ order: args.orderedIds }),
      timestamp: now,
    });

    return { success: true };
  },
});

// Admin: duplicate banner
export const duplicateBanner = mutation({
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

    const now = Date.now();
    const bannerId = await ctx.db.insert("banners", {
      title: `${existing.title} (Copy)`,
      subtitle: existing.subtitle,
      imageUrl: existing.imageUrl,
      linkUrl: existing.linkUrl,
      targetPage: existing.targetPage,
      isActive: false,
      sortOrder: existing.sortOrder + 1,
      ctaText: existing.ctaText,
      ctaColor: existing.ctaColor,
      startDate: existing.startDate,
      endDate: existing.endDate,
      openInNewTab: existing.openInNewTab,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      adminUserId: session.userId,
      adminEmail: user.email,
      action: "banner_duplicated",
      entityType: "banner",
      entityId: bannerId.toString(),
      previousValue: undefined,
      newValue: JSON.stringify({ title: existing.title }),
      timestamp: now,
    });

    return { success: true, bannerId };
  },
});

// Admin: bulk toggle active
export const bulkToggleActive = mutation({
  args: {
    token: v.string(),
    bannerIds: v.array(v.id("banners")),
    isActive: v.boolean(),
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
    for (const id of args.bannerIds) {
      await ctx.db.patch(id, {
        isActive: args.isActive,
        updatedAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      adminUserId: session.userId,
      adminEmail: user.email,
      action: args.isActive ? "banners_bulk_activated" : "banners_bulk_deactivated",
      entityType: "banner",
      entityId: "bulk",
      previousValue: undefined,
      newValue: JSON.stringify({ count: args.bannerIds.length }),
      timestamp: now,
    });

    return { success: true };
  },
});
