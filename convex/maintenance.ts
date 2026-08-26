import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./auth";

// Tables that reference a user directly by userId
const USER_ID_TABLES = [
  "sessions",
  "wallets",
  "purchases",
  "referrals",
  "notifications",
  "jobApplications",
  "supportTickets",
  "cvProfiles",
  "walletTransactions",
  "payoutMethods",
  "withdrawals",
  "lessonProgress",
  "userAchievements",
  "auditLogs",
] as const;

const ADMIN_ROLES = ["super_admin", "admin", "content_admin", "finance_admin", "work_admin"];

/**
 * One-time cleanup: deletes ALL non-admin users and every document linked to them.
 * Keeps: users with admin roles, programs, modules, lessons, plans, jobs, resources,
 * achievements definitions, positions, settings, announcements, contact inquiries.
 *
 * Run once: npx convex run maintenance:wipeAllUsers {}
 */
export const wipeAllUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const stats: Record<string, number> = {};
    let deletedUsers = 0;
    let keptAdmins = 0;

    // Collect all non-admin users first (avoid mutating while iterating)
    const allUsers = await ctx.db.query("users").collect();
    const doomedUserIds = new Set<string>();
    for (const u of allUsers) {
      if (!ADMIN_ROLES.includes(u.role)) {
        doomedUserIds.add(u._id);
      } else {
        keptAdmins++;
      }
    }

    // Delete every row in each linked table that belongs to a doomed user.
    for (const tableName of USER_ID_TABLES) {
      let count = 0;
      const rows = (await ctx.db.query(tableName as never).collect()) as Array<Record<string, unknown> & { _id: string }>;
      for (const row of rows) {
        const anyRow = row as unknown as Record<string, unknown>;
        const owner =
          (anyRow.userId as string | undefined) ??
          (anyRow.adminUserId as string | undefined);
        if (owner && doomedUserIds.has(owner as never)) {
          await ctx.db.delete(row._id as never);
          count++;
        }
      }
      stats[tableName] = count;
    }

    // referrals has referrerUserId/referredUserId instead of userId
    {
      let count = 0;
      const rows = await ctx.db.query("referrals").collect();
      for (const r of rows) {
        if (
          doomedUserIds.has(r.referrerUserId as never) ||
          doomedUserIds.has(r.referredUserId as never)
        ) {
          await ctx.db.delete(r._id);
          count++;
        }
      }
      stats["referrals"] = count;
    }

    // affiliateSales references buyerUserId / referrerUserId
    {
      let count = 0;
      const rows = await ctx.db.query("affiliateSales").collect();
      for (const s of rows) {
        if (
          doomedUserIds.has(s.buyerUserId as never) ||
          doomedUserIds.has(s.referrerUserId as never)
        ) {
          await ctx.db.delete(s._id);
          count++;
        }
      }
      stats["affiliateSales"] = count;
    }

    // ticketMessages belong to tickets already deleted above; sweep orphans anyway
    {
      let count = 0;
      const rows = await ctx.db.query("ticketMessages").collect();
      for (const m of rows) {
        // ticket no longer exists => delete
        const ticket = await ctx.db.get(m.ticketId);
        if (!ticket) {
          await ctx.db.delete(m._id);
          count++;
        }
      }
      stats["ticketMessages"] = count;
    }

    // Finally delete the users themselves
    for (const id of doomedUserIds) {
      const u = await ctx.db.get(id as never);
      if (u) {
        await ctx.db.delete(u._id);
        deletedUsers++;
      }
    }

    return {
      success: true,
      deletedUsers,
      keptAdmins,
      linkedDeleted: stats,
    };
  },
});

/**
 * Clean test account REMOVED for security — hardcoded credentials removed from source.
 * Use adminCreateUser mutation from admin panel instead.
 */

/**
 * TEMP simulation helper � creates a completed purchase for a user at an
 * arbitrary createdAt so the affiliate cooling-window logic can be verified.
 * Remove after testing. Run: npx convex run maintenance:simPurchase
 * '{"userId":"...","hoursAgo":2}'
 */
export const simPurchase = internalMutation({
  args: { userId: v.id("users"), hoursAgo: v.number() },
  handler: async (ctx, args) => {
    const pid = await ctx.db.insert("purchases", {
      userId: args.userId,
      programId: await ctx.db.query("programs").first().then((p) => p!._id),
      amount: 2000,
      status: "completed",
      paymentMethod: "sim",
      paymentId: "sim_" + Date.now(),
      createdAt: Date.now() - args.hoursAgo * 60 * 60 * 1000,
    });
    return { purchaseId: pid };
  },
});
