import { v } from "convex/values";
import { query } from "./_generated/server";

async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin", "finance_admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

export const getAuditLogs = query({
  args: {
    token: v.string(),
    entityType: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    let logs = await ctx.db.query("auditLogs").collect();
    logs.sort((a, b) => b.timestamp - a.timestamp);

    if (args.entityType) {
      logs = logs.filter((l) => l.entityType === args.entityType);
    }
    if (args.search && args.search.trim()) {
      const q = args.search.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          l.adminEmail.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.reason && l.reason.toLowerCase().includes(q)) ||
          l.entityId.toLowerCase().includes(q)
      );
    }

    return logs.slice(0, 100);
  },
});

export const getLoginHistory = query({
  args: {
    token: v.string(),
    userId: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    let sessions = await ctx.db.query("sessions").collect();

    // Enrich with user email
    const enriched = await Promise.all(
      sessions.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        return {
          _id: s._id,
          userId: s.userId,
          userEmail: user?.email || "unknown",
          userName: user?.name || "unknown",
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          ip: s.ip || "",
          userAgent: s.userAgent || "",
          deviceType: s.deviceType || "",
          deviceOS: s.deviceOS || "",
          deviceBrowser: s.deviceBrowser || "",
          location: s.location || "",
        };
      })
    );

    enriched.sort((a, b) => b.createdAt - a.createdAt);

    let filtered = enriched;

    if (args.userId) {
      filtered = filtered.filter((s) => s.userId === args.userId);
    }

    if (args.search && args.search.trim()) {
      const q = args.search.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.userEmail.toLowerCase().includes(q) ||
          s.userName.toLowerCase().includes(q) ||
          s.ip.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.deviceOS.toLowerCase().includes(q) ||
          s.deviceBrowser.toLowerCase().includes(q) ||
          s.deviceType.toLowerCase().includes(q)
      );
    }

    return filtered.slice(0, 200);
  },
});
