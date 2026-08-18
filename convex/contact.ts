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
  if (!user || !["super_admin", "admin"].includes(user.role)) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return user;
}

export const submitContactInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactInquiries", {
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      subject: args.subject.trim(),
      message: args.message.trim(),
      status: "new",
      createdAt: Date.now(),
    });
  },
});

export const getContactInquiries = query({
  args: { token: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    let inquiries = await ctx.db.query("contactInquiries").collect();
    if (args.status) {
      inquiries = inquiries.filter((i) => i.status === args.status);
    }
    inquiries.sort((a, b) => b.createdAt - a.createdAt);

    return inquiries;
  },
});

export const updateInquiryStatus = mutation({
  args: {
    token: v.string(),
    inquiryId: v.id("contactInquiries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.inquiryId, { status: args.status });
    return { success: true };
  },
});
