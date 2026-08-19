import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to hash password with salt using Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 10000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  const hashArray = Array.from(new Uint8Array(exported));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const signup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    referralCode: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      throw new Error("An account with this email already exists");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(args.password, salt);

    // Generate unique referral code for the user
    const baseCode = args.name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "ZETA";
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const userReferralCode = `${baseCode}${randomSuffix}`;

    // Handle referring user if referralCode is supplied
    let referrerUserId = undefined;
    if (args.referralCode && args.referralCode.trim()) {
      const cleanRef = args.referralCode.trim().toUpperCase();
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", cleanRef))
        .first();
      if (referrer) {
        referrerUserId = referrer._id;
      }
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email,
      passwordHash,
      salt,
      role: "user",
      status: "active",
      referralCode: userReferralCode,
      referredBy: referrerUserId,
      phone: args.phone?.trim(),
      createdAt: now,
      updatedAt: now,
    });

    // Initialize user wallet
    await ctx.db.insert("wallets", {
      userId,
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      workEarnings: 0,
      affiliateEarnings: 0,
      updatedAt: now,
    });

    // If referred, insert into referrals table
    if (referrerUserId) {
      await ctx.db.insert("referrals", {
        referrerUserId,
        referredUserId: userId,
        referralCode: args.referralCode!.trim().toUpperCase(),
        status: "active",
        createdAt: now,
      });

      // Notify referrer
      await ctx.db.insert("notifications", {
        userId: referrerUserId,
        type: "affiliate",
        title: "New Referral Registered",
        message: `${args.name.trim()} joined using your referral link.`,
        read: false,
        actionUrl: "/dashboard/referrals",
        createdAt: now,
      });
    }

    // Welcome notification
    await ctx.db.insert("notifications", {
      userId,
      type: "course",
      title: "Welcome to ZetaGrow!",
      message: "Explore our verified programs and digital career opportunities to get started.",
      read: false,
      actionUrl: "/dashboard",
      createdAt: now,
    });

    // Create session token (valid 30 days)
    const token = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    await ctx.db.insert("sessions", {
      userId,
      token,
      role: "user",
      expiresAt,
      createdAt: now,
    });

    return {
      token,
      user: {
        id: userId,
        name: args.name.trim(),
        email,
        role: "user",
        referralCode: userReferralCode,
      },
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status === "suspended") {
      throw new Error("Your account has been suspended. Please contact support.");
    }

    const testHash = await hashPassword(args.password, user.salt);
    if (testHash !== user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const now = Date.now();
    const token = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      role: user.role,
      expiresAt,
      createdAt: now,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        avatarUrl: user.avatarUrl,
      },
    };
  },
});

export const getSessionUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token!))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user || user.status === "suspended") return null;

    // Get position details if any
    let position = null;
    if (user.positionId) {
      position = await ctx.db.get(user.positionId);
    }

    // Get wallet summary
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    // Get user purchases
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const enrolledProgramIds = purchases
      .filter((p) => p.status === "completed")
      .map((p) => p.programId);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      skills: user.skills || [],
      position,
      wallet: wallet || { availableBalance: 0, pendingBalance: 0, totalEarned: 0 },
      enrolledProgramIds,
      createdAt: user.createdAt,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return { success: true };
  },
});
