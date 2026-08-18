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

export const getAdminOverviewMetrics = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const users = await ctx.db.query("users").collect();
    const purchases = await ctx.db.query("purchases").collect();
    const jobs = await ctx.db.query("jobs").collect();
    const applications = await ctx.db.query("jobApplications").collect();
    const affiliateSales = await ctx.db.query("affiliateSales").collect();
    const withdrawals = await ctx.db.query("withdrawals").collect();

    // Calculations
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const completedPurchases = purchases.filter((p) => p.status === "completed");
    const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0);

    const pendingWithdrawalsList = withdrawals.filter((w) => w.status === "requested" || w.status === "under_review");
    const pendingWithdrawalAmount = pendingWithdrawalsList.reduce((sum, w) => sum + w.amount, 0);
    const completedWithdrawals = withdrawals.filter((w) => w.status === "completed");
    const totalWithdrawnAmount = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const totalCommissions = affiliateSales.reduce((sum, s) => sum + s.commissionAmount, 0);
    const pendingCommissions = affiliateSales
      .filter((s) => s.status === "pending")
      .reduce((sum, s) => sum + s.commissionAmount, 0);

    const activeJobs = jobs.filter((j) => j.status === "published").length;
    const completedWork = applications.filter((a) => a.status === "completed").length;

    // Monthly purchase trends (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const revenueByMonth: { month: string; revenue: number; orders: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const monthStart = new Date(yr, mIdx, 1).getTime();
      const monthEnd = new Date(yr, mIdx + 1, 0, 23, 59, 59).getTime();

      const mPurchases = completedPurchases.filter(
        (p) => p.createdAt >= monthStart && p.createdAt <= monthEnd
      );

      revenueByMonth.push({
        month: `${monthNames[mIdx]} ${yr}`,
        revenue: mPurchases.reduce((sum, p) => sum + p.amount, 0),
        orders: mPurchases.length,
      });
    }

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      totalPurchasesCount: completedPurchases.length,
      pendingWithdrawalsCount: pendingWithdrawalsList.length,
      pendingWithdrawalAmount,
      totalWithdrawnAmount,
      totalCommissions,
      pendingCommissions,
      activeJobs,
      totalApplications: applications.length,
      completedWork,
      revenueByMonth,
    };
  },
});
