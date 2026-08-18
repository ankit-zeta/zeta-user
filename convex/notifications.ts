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

export const getUserNotifications = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    notifs.sort((a, b) => b.createdAt - a.createdAt);
    const unreadCount = notifs.filter((n) => !n.read).length;

    return {
      notifications: notifs,
      unreadCount,
    };
  },
});

export const markNotificationRead = mutation({
  args: {
    token: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const notif = await ctx.db.get(args.notificationId);
    if (notif && notif.userId.toString() === session.userId.toString()) {
      await ctx.db.patch(args.notificationId, { read: true });
    }
    return { success: true };
  },
});

export const markAllNotificationsRead = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", session.userId).eq("read", false))
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }

    return { success: true };
  },
});

export const getActiveAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    announcements.sort((a, b) => b.createdAt - a.createdAt);
    return announcements;
  },
});

// Admin Announcement Operations
export const createAnnouncement = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    content: v.string(),
    targetRole: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.db.insert("announcements", {
      title: args.title.trim(),
      content: args.content.trim(),
      targetRole: args.targetRole,
      isActive: true,
      priority: args.priority,
      createdAt: Date.now(),
    });
  },
});

export const toggleAnnouncementActive = mutation({
  args: {
    token: v.string(),
    announcementId: v.id("announcements"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.announcementId, { isActive: args.isActive });
    return { success: true };
  },
});
