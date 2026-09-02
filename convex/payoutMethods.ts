import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

async function requireAuth(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Invalid session");
  }
  return session;
}

function validateDetails(type: string, details: any, holderName: string) {
  if (type === "upi") {
    if (!details.upiId || !details.upiId.includes("@")) {
      throw new Error("A valid UPI ID is required for UPI payouts");
    }
  } else if (type === "bank_transfer") {
    if (
      !details.accountNumber ||
      !details.ifscCode ||
      !details.bankName ||
      !details.accountHolderName
    ) {
      throw new Error("All bank details are required for bank payouts");
    }
    const userToken = holderName.trim().toLowerCase().split(/\s+/)[0];
    if (details.accountHolderName.trim().toLowerCase() !== holderName.trim().toLowerCase() &&
        !details.accountHolderName.trim().toLowerCase().startsWith(userToken)) {
      throw new Error("Account holder name must match the name on your profile");
    }
  } else if (type === "upi_qr") {
    if (
      !details.qrImageUrl ||
      details.qrImageUrl.startsWith("http") ||
      !/^[a-zA-Z0-9_-]{10,}$/.test(details.qrImageUrl)
    ) {
      throw new Error("A valid UPI QR image is required for QR payouts");
    }
    if (!details.accountHolderName) {
      throw new Error("Account holder name is required for QR payouts");
    }
    const userToken = holderName.trim().toLowerCase().split(/\s+/)[0];
    if (details.accountHolderName.trim().toLowerCase() !== holderName.trim().toLowerCase() &&
        !details.accountHolderName.trim().toLowerCase().startsWith(userToken)) {
      throw new Error("QR account holder name must match the name on your profile");
    }
  } else {
    throw new Error("Invalid payout method type");
  }
}

// Session-less upload action (established pattern — actions have no ctx.db)
import { requirePurchasedUser } from "./entitlements";

export const generatePayoutMethodQrUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getMyPayoutMethods = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await requireAuth(ctx, args.token);
    const methods = await ctx.db
      .query("payoutMethods")
      .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
      .collect();
    methods.sort((a: any, b: any) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0) || a.createdAt - b.createdAt);

    const detailed = await Promise.all(
      methods.map(async (m: any) => {
        let qrImageUrl: string | null = null;
        if (m.type === "upi_qr" && m.details?.qrImageUrl && !m.details.qrImageUrl.startsWith("http")) {
          qrImageUrl = await ctx.storage.getUrl(m.details.qrImageUrl);
        } else if (m.details?.qrImageUrl?.startsWith("http")) {
          qrImageUrl = m.details.qrImageUrl;
        }
        return { ...m, qrImageUrl };
      })
    );
    return detailed;
  },
});

export const upsertPayoutMethod = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("payoutMethods")),
    type: v.string(), // "bank_transfer" | "upi" | "upi_qr"
    name: v.string(),
    details: v.object({
      accountNumber: v.optional(v.string()),
      ifscCode: v.optional(v.string()),
      bankName: v.optional(v.string()),
      accountHolderName: v.optional(v.string()),
      upiId: v.optional(v.string()),
      qrImageUrl: v.optional(v.string()),
    }),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await requireAuth(ctx, args.token);
    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("User not found");
    await requirePurchasedUser(ctx, args.token);

    const now = Date.now();
    validateDetails(args.type, args.details, (user as any).name || "");

    // QR storage existence check (action pattern: storage.getUrl)
    if (args.type === "upi_qr" && args.details.qrImageUrl) {
      const resolved = await ctx.storage.getUrl(args.details.qrImageUrl);
      if (!resolved) {
        throw new Error("Uploaded QR image no longer exists, please upload again");
      }
    }

    const existing = await ctx.db
      .query("payoutMethods")
      .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
      .collect();

    if (args.id) {
      const method = await ctx.db.get(args.id);
      if (!method || method.userId.toString() !== session.userId.toString()) {
        throw new Error("Payout method not found or unauthorized");
      }
      await ctx.db.patch(args.id, {
        type: args.type,
        name: args.name.trim() || args.type,
        details: args.details,
        isDefault: args.isDefault ?? method.isDefault,
        updatedAt: now,
      });
      if (args.isDefault) {
        for (const m of existing) {
          if (m._id.toString() !== args.id.toString()) {
            await ctx.db.patch(m._id, { isDefault: false });
          }
        }
      }
      return { success: true, methodId: args.id };
    }

    const isFirst = existing.length === 0;
    const methodId = await ctx.db.insert("payoutMethods", {
      userId: session.userId,
      type: args.type,
      name: args.name.trim() || args.type,
      details: args.details,
      isDefault: args.isDefault ?? isFirst,
      createdAt: now,
      updatedAt: now,
    });

    if (args.isDefault || isFirst) {
      for (const m of existing) {
        await ctx.db.patch(m._id, { isDefault: false });
      }
    }
    return { success: true, methodId, isFirst };
  },
});

export const deletePayoutMethod = mutation({
  args: { token: v.string(), id: v.id("payoutMethods") },
  handler: async (ctx, args) => {
    const session = await requireAuth(ctx, args.token);
    await requirePurchasedUser(ctx, args.token);
    const method = await ctx.db.get(args.id);
    if (!method || method.userId.toString() !== session.userId.toString()) {
      throw new Error("Payout method not found or unauthorized");
    }
    const wasDefault = method.isDefault;
    await ctx.db.delete(args.id);

    if (wasDefault) {
      const remaining = await ctx.db
        .query("payoutMethods")
        .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
        .collect();
      if (remaining.length > 0) {
        remaining.sort((a: any, b: any) => a.createdAt - b.createdAt);
        await ctx.db.patch(remaining[0]._id, { isDefault: true });
      }
    }
    return { success: true };
  },
});

export const setDefaultPayoutMethod = mutation({
  args: { token: v.string(), id: v.id("payoutMethods") },
  handler: async (ctx, args) => {
    const session = await requireAuth(ctx, args.token);
    await requirePurchasedUser(ctx, args.token);
    const method = await ctx.db.get(args.id);
    if (!method || method.userId.toString() !== session.userId.toString()) {
      throw new Error("Payout method not found or unauthorized");
    }
    const all = await ctx.db
      .query("payoutMethods")
      .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
      .collect();
    for (const m of all) {
      await ctx.db.patch(m._id, { isDefault: m._id.toString() === args.id.toString() });
    }
    return { success: true };
  },
});

export const getPayoutMethodsAdmin = query({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const session = await requireAuth(ctx, args.token);
    const admin = await ctx.db.get(session.userId);
    if (!admin || !["super_admin", "admin", "finance_admin"].includes((admin as any).role)) {
      throw new Error("Forbidden: Admin privileges required");
    }
    const methods = await ctx.db
      .query("payoutMethods")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .collect();
    const detailed = await Promise.all(
      methods.map(async (m: any) => {
        let qrImageUrl: string | null = null;
        if (m.type === "upi_qr" && m.details?.qrImageUrl && !m.details.qrImageUrl.startsWith("http")) {
          qrImageUrl = await ctx.storage.getUrl(m.details.qrImageUrl);
        }
        return { ...m, qrImageUrl };
      })
    );
    return detailed;
  },
});