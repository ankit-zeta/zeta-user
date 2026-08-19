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

    // Server-side password policy (client mirrors this)
    if (!args.password || args.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    
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
  args: { token: v.optional(v.union(v.null(), v.string())) },
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
      cvStatus: user.cvStatus || "pending",
      cvRemarks: user.cvRemarks,
      cvReviewedAt: user.cvReviewedAt,
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

export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("User not found");

    const currentHash = await hashPassword(args.currentPassword, user.salt);
    if (currentHash !== user.passwordHash) {
      throw new Error("Current password is incorrect");
    }
    if (args.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    if (args.newPassword === args.currentPassword) {
      throw new Error("New password must be different from current password");
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(args.newPassword, newSalt);
    await ctx.db.patch(user._id, {
      passwordHash: newHash,
      salt: newSalt,
      updatedAt: Date.now(),
    });

    // Kill all other sessions except the current one
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();
    for (const s of sessions) {
      if (s.token !== args.token) {
        await ctx.db.delete(s._id);
      }
    }

    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "security",
      title: "Password Changed",
      message: "Your account password was changed. Other active sessions have been signed out.",
      read: false,
      actionUrl: "/dashboard/settings",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const changeEmail = mutation({
  args: {
    token: v.string(),
    newEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("User not found");

    const email = args.newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }
    if (email === user.email) {
      throw new Error("New email is the same as your current email");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
    if (existing && existing._id !== user._id) {
      throw new Error("An account with this email already exists");
    }

    const now = Date.now();
    await ctx.db.patch(user._id, {
      email,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "security",
      title: "Email Changed",
      message: `Your account email is now ${email}`,
      read: false,
      actionUrl: "/dashboard/settings",
      createdAt: now,
    });

    return { success: true };
  },
});

export const deleteAccount = mutation({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("User not found");

    const hash = await hashPassword(args.password, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error("Password is incorrect");
    }

    // Prevent deletion while funds are pending (money safety)
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .first();
    if (wallet && wallet.availableBalance > 0) {
      throw new Error("Please withdraw your wallet balance before deleting your account");
    }
    const pendingWithdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .filter((q: any) => q.eq(q.field("status"), "requested"))
      .collect();
    if (pendingWithdrawals.length > 0) {
      throw new Error("Please wait for your pending withdrawal to be processed");
    }

    // Hard delete: sessions, cv profile, user record (wallet/ledger kept for financial integrity)
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }
    const cv = await ctx.db
      .query("cvProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .first();
    if (cv) {
      await ctx.db.delete(cv._id);
    }
    await ctx.db.delete(user._id);

    return { success: true };
  },
});
