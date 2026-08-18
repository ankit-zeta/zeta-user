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
