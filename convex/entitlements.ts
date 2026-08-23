import { v } from "convex/values";

// Affiliate/wallet surfaces unlock only after the user owns
// at least one program with a completed purchase.
export async function requirePurchasedUser(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }

  const user = await ctx.db.get(session.userId);
  if (!user || user.status === "suspended") {
    throw new Error("Unauthorized: User not found or suspended");
  }

  const purchases = await ctx.db
    .query("purchases")
    .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
    .filter((q: any) => q.eq(q.field("status"), "completed"))
    .collect();

  if (purchases.length === 0) {
    throw new Error("Forbidden: Enroll in a program to access partner features");
  }

  return user;
}

export const requirePurchasedUserArgs = { token: v.string() };
