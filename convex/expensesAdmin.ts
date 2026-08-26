import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin-managed operating expenses (server, email, events, tools, …) used by
// the dashboard's profitability analytics. Amounts are entered in rupees and
// stored in paise so profit math stays in one unit.

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

// ── Categories ──────────────────────────────────────────────────────────────

export const addExpenseCategory = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const name = args.name.trim();
    if (!name) throw new Error("Category name is required");
    if (name.length > 60) throw new Error("Category name is too long");

    const existing = await ctx.db
      .query("expenseCategories")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();
    if (existing) {
      // Reactivate if previously archived.
      if (existing.archived) {
        await ctx.db.patch(existing._id, { archived: false });
      }
      return existing._id;
    }

    return await ctx.db.insert("expenseCategories", {
      name,
      description: args.description?.trim() || undefined,
      color: args.color || undefined,
      createdBy: admin._id,
      createdAt: Date.now(),
    });
  },
});

export const deleteExpenseCategory = mutation({
  args: { token: v.string(), categoryId: v.id("expenseCategories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const inUse = await ctx.db
      .query("expenses")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .first();
    if (inUse) {
      // Keep historical totals intact — archive instead of hard delete.
      await ctx.db.patch(args.categoryId, { archived: true });
      return { archived: true };
    }
    await ctx.db.delete(args.categoryId);
    return { deleted: true };
  },
});

// ── Expenses ────────────────────────────────────────────────────────────────

export const addExpense = mutation({
  args: {
    token: v.string(),
    categoryId: v.id("expenseCategories"),
    description: v.string(),
    amountRupees: v.number(),
    date: v.number(),
    vendor: v.optional(v.string()),
    notes: v.optional(v.string()),
    recurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (!Number.isFinite(args.amountRupees) || args.amountRupees <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.archived) throw new Error("Invalid category");

    return await ctx.db.insert("expenses", {
      categoryId: args.categoryId,
      description: args.description.trim(),
      amount: Math.round(args.amountRupees * 100),
      date: args.date,
      vendor: args.vendor?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      recurring: args.recurring || undefined,
      createdBy: admin._id,
      createdAt: Date.now(),
    });
  },
});

export const updateExpense = mutation({
  args: {
    token: v.string(),
    expenseId: v.id("expenses"),
    categoryId: v.optional(v.id("expenseCategories")),
    description: v.optional(v.string()),
    amountRupees: v.optional(v.number()),
    date: v.optional(v.number()),
    vendor: v.optional(v.string()),
    notes: v.optional(v.string()),
    recurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) throw new Error("Expense not found");

    const patch: Record<string, any> = {};
    if (args.categoryId !== undefined) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) throw new Error("Invalid category");
      patch.categoryId = args.categoryId;
    }
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.amountRupees !== undefined) {
      if (!Number.isFinite(args.amountRupees) || args.amountRupees <= 0) {
        throw new Error("Amount must be greater than zero");
      }
      patch.amount = Math.round(args.amountRupees * 100);
    }
    if (args.date !== undefined) patch.date = args.date;
    if (args.vendor !== undefined) patch.vendor = args.vendor.trim() || undefined;
    if (args.notes !== undefined) patch.notes = args.notes.trim() || undefined;
    if (args.recurring !== undefined) patch.recurring = args.recurring || undefined;

    await ctx.db.patch(args.expenseId, patch);
    return { success: true };
  },
});

export const deleteExpense = mutation({
  args: { token: v.string(), expenseId: v.id("expenses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) throw new Error("Expense not found");
    await ctx.db.delete(args.expenseId);
    return { success: true };
  },
});

// ── Read model for the Expenses page ────────────────────────────────────────

export const getExpenseDataAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const categories = await ctx.db.query("expenseCategories").collect();
    const expenses = await ctx.db.query("expenses").collect();
    expenses.sort((a, b) => b.date - a.date);

    const catById = new Map(categories.map((c) => [c._id, c]));

    const rows = expenses.map((e) => {
      const cat = catById.get(e.categoryId);
      return {
        _id: e._id,
        categoryId: e.categoryId,
        categoryName: cat?.name || "Uncategorised",
        categoryColor: cat?.color || "#8A8A8A",
        description: e.description,
        amount: e.amount,
        date: e.date,
        vendor: e.vendor,
        notes: e.notes,
        recurring: e.recurring,
      };
    });

    // Category usage counts (to know which can be hard-deleted).
    const usage: Record<string, number> = {};
    for (const e of expenses) {
      usage[e.categoryId] = (usage[e.categoryId] || 0) + 1;
    }

    // Current-month total (IST day boundaries).
    const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const monthStartIst = Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      1
    ) - 5.5 * 60 * 60 * 1000;
    const thisMonth = rows
      .filter((e) => e.date >= monthStartIst)
      .reduce((sum, e) => sum + e.amount, 0);

    const byCategory = categories
      .filter((c) => !c.archived)
      .map((c) => ({
        _id: c._id,
        name: c.name,
        color: c.color || "#8A8A8A",
        total: rows
          .filter((e) => e.categoryId === c._id)
          .reduce((sum, e) => sum + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

    return {
      categories: categories.map((c) => ({
        _id: c._id,
        name: c.name,
        description: c.description,
        color: c.color,
        archived: c.archived,
        usageCount: usage[c._id] || 0,
      })),
      expenses: rows,
      stats: {
        totalAllTime: rows.reduce((sum, e) => sum + e.amount, 0),
        thisMonth,
        count: rows.length,
      },
      byCategory,
    };
  },
});
