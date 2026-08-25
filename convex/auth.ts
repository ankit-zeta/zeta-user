/// <reference types="node" />
import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { RegisteredAction } from "convex/server";

const PBKDF2_ITERATIONS = 600_000;
const LEGACY_PBKDF2_ITERATIONS = 10_000;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function pbkdf2Hash(password: string, salt: string, iterations: number): Promise<string> {
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
      iterations,
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

export async function hashPassword(password: string, salt: string): Promise<string> {
  return pbkdf2Hash(password, salt, PBKDF2_ITERATIONS);
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  const currentHash = await pbkdf2Hash(password, salt, PBKDF2_ITERATIONS);
  if (timingSafeEqual(currentHash, expectedHash)) {
    return { valid: true, needsUpgrade: false };
  }
  const legacyHash = await pbkdf2Hash(password, salt, LEGACY_PBKDF2_ITERATIONS);
  if (timingSafeEqual(legacyHash, expectedHash)) {
    return { valid: true, needsUpgrade: true };
  }
  return { valid: false, needsUpgrade: false };
}

export function sanitizeName(name: string): string {
  return name.replace(/[<>&"']/g, "").trim().slice(0, 80);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateReferralCode(baseName: string): string {
  const base = baseName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "ZETA";
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  const randomSuffix = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase().slice(0, 4);
  return `${base}${randomSuffix}`;
}

async function getUniqueReferralCode(ctx: any, baseName: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode(baseName);
    const existing = await ctx.runQuery(internal.auth.getUserByReferralCode, { referralCode: code });
    if (!existing) return code;
  }
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return "ZETA" + Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Internal mutations for deterministic DB writes (called from signup action)
export const createUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.string(),
    status: v.string(),
    referralCode: v.string(),
    referredBy: v.optional(v.id("users")),
    phone: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    emailVerificationToken: v.optional(v.string()),
    emailVerificationExpiresAt: v.optional(v.number()),
    passwordResetToken: v.optional(v.string()),
    passwordResetExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const createWallet = internalMutation({
  args: {
    userId: v.id("users"),
    availableBalance: v.number(),
    pendingBalance: v.number(),
    totalEarned: v.number(),
    totalWithdrawn: v.number(),
    workEarnings: v.number(),
    affiliateEarnings: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wallets", args);
  },
});

export const createReferral = internalMutation({
  args: {
    referrerUserId: v.id("users"),
    referredUserId: v.id("users"),
    referralCode: v.string(),
    status: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("referrals", args);
  },
});

export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", args);
  },
});

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const updateUserPassword = internalMutation({
  args: {
    userId: v.id("users"),
    passwordHash: v.string(),
    salt: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      passwordHash: args.passwordHash,
      salt: args.salt,
      updatedAt: args.updatedAt,
    });
  },
});

export const signup = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    referralCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    formStartedAt: v.optional(v.number()),
    testMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    token: string;
    user: {
      id: Id<"users">;
      name: string;
      email: string;
      role: string;
      referralCode: string;
      emailVerified: boolean;
    };
  }> => {
    const email = args.email.trim().toLowerCase();
    const name = sanitizeName(args.name);

    if (!isValidEmail(email)) {
      throw new Error("Invalid email address");
    }

    const testModeAllowed = process.env.ALLOW_TEST_MODE === "1";
    const skipRateLimit = testModeAllowed && args.testMode === true;

    if (!skipRateLimit) {
      await ctx.runMutation(internal.rateLimit.enforceRateLimit, { key: `signup:email:${email}`, max: 3, windowMs: 60 * 60 * 1000 });
      await ctx.runMutation(internal.rateLimit.enforceRateLimit, { key: "signup:global", max: 30, windowMs: 5 * 60 * 1000 });
    }

    // Server-side honeypot check
    if (args.website) {
      throw new Error("Invalid submission.");
    }

    // Server-side timing check (reject submissions under 2 seconds)
    if (args.formStartedAt && Date.now() - args.formStartedAt < 2000) {
      throw new Error("Please take a moment to fill out the form.");
    }

    // Server-side password policy (client mirrors this)
    if (!args.password || args.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existing = await ctx.runQuery(internal.auth.getUserForLogin, { email });
    if (existing) {
      throw new Error("Unable to create account with these details. If you already have an account, please sign in or reset your password.");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(args.password, salt);

    // Generate unique referral code for the user
    const userReferralCode = await getUniqueReferralCode(ctx, name);

    // Handle referring user if referralCode is supplied
    let referrerUserId: Id<"users"> | undefined;
    let referrerDoc: { _id: string; name: string; email: string } | null = null;
    if (args.referralCode && args.referralCode.trim()) {
      const cleanRef = args.referralCode.trim().toUpperCase();
      const referrer = await ctx.runQuery(internal.auth.getUserByReferralCode, { referralCode: cleanRef });
      if (referrer) {
        referrerUserId = referrer._id;
        referrerDoc = { _id: referrer._id, name: referrer.name, email: referrer.email };
      }
    }

    const now = Date.now();
    const verificationToken = generateToken();
    const verificationExpiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    // Create user with unverified status
    const userId = await ctx.runMutation(internal.auth.createUser, {
      name: name,
      email,
      passwordHash,
      salt,
      role: "user",
      status: "unverified",
      referralCode: userReferralCode,
      referredBy: referrerUserId,
      phone: args.phone?.trim(),
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpiresAt,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize user wallet
    await ctx.runMutation(internal.auth.createWallet, {
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
      await ctx.runMutation(internal.auth.createReferral, {
        referrerUserId,
        referredUserId: userId,
        referralCode: args.referralCode!.trim().toUpperCase(),
        status: "active",
        createdAt: now,
      });

      // Notify referrer
      await ctx.runMutation(internal.auth.createNotification, {
        userId: referrerUserId,
        type: "affiliate",
        title: "New Referral Registered",
        message: `${name} joined using your referral link.`,
        read: false,
        actionUrl: "/dashboard/referrals",
        createdAt: now,
      });

      // Email the referrer (non-fatal)
      if (referrerDoc) {
        try {
          await ctx.runAction(internal.email.sendReferralNotification, {
            referrerEmail: referrerDoc.email,
            referrerName: referrerDoc.name,
            referredName: name,
          });
        } catch (e) {
          console.error("Failed to send referral notification email:", e);
        }
      }
    }

    // Welcome notification
    await ctx.runMutation(internal.auth.createNotification, {
      userId,
      type: "course",
      title: "Welcome to ZetaGrow!",
      message: "Explore our verified programs and digital career opportunities to get started.",
      read: false,
      actionUrl: "/dashboard",
      createdAt: now,
    });

    // Send verification email (non-fatal: account must be created even if email delivery hiccups)
    try {
      await ctx.runAction(internal.email.sendVerificationEmail, {
        email,
        token: verificationToken,
        name,
      });
    } catch (emailError) {
      console.error("Verification email failed for", email, emailError);
    }

    // Create session token (valid 30 days)
    const token = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    await ctx.runMutation(internal.auth.createSession, {
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
        name,
        email,
        role: "user",
        referralCode: userReferralCode,
        emailVerified: false,
      },
    };
  },
});

export const login: RegisteredAction<
  "public",
  { email: string; password: string },
  Promise<{
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      referralCode?: string;
      avatarUrl?: string;
    };
  }>
> = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    // Rate limiting on login: per-email 10/15min + global 100/5min
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, { key: `login:email:${email}`, max: 10, windowMs: 15 * 60 * 1000 });
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, { key: "login:global", max: 100, windowMs: 5 * 60 * 1000 });

    const user = await ctx.runQuery(internal.auth.getUserForLogin, { email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status === "suspended") {
      throw new Error("Your account has been suspended. Please contact support.");
    }

    if (user.status === "unverified" || user.emailVerified === false) {
      throw new Error("Please verify your email address before signing in. Check your inbox for the verification link.");
    }

    // Brute-force lockout: 8 failed attempts -> locked for 15 minutes
    const now = Date.now();
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new Error("Invalid email or password");
    }

    const { valid, needsUpgrade } = await verifyPassword(args.password, user.salt, user.passwordHash);
    if (!valid) {
      await ctx.runMutation(internal.auth.recordFailedLogin, { userId: user._id });
      throw new Error("Invalid email or password");
    }

    // Upgrade legacy hash to current iteration count
    if (needsUpgrade) {
      const newSalt = generateSalt();
      const newHash = await hashPassword(args.password, newSalt);
      await ctx.runMutation(internal.auth.updateUserPassword, { userId: user._id, passwordHash: newHash, salt: newSalt, updatedAt: now });
    }

    // Successful login resets the failure counter
    if (user.failedLoginCount || user.lockedUntil) {
      await ctx.runMutation(internal.auth.resetLoginCounters, { userId: user._id });
    }

    const token = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    await ctx.runMutation(internal.auth.createSession, { userId: user._id, role: user.role, token, expiresAt });

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

export const getUserForLogin = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserByReferralCode = internalQuery({
  args: { referralCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", args.referralCode))
      .first();
  },
});

export const recordFailedLogin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const LOCK_THRESHOLD = 8;
    const LOCK_WINDOW_MS = 15 * 60 * 1000;
    const now = Date.now();

    const failures = (user.failedLoginCount || 0) + 1;
    const patch: any = { failedLoginCount: failures };
    if (failures >= LOCK_THRESHOLD) {
      patch.lockedUntil = now + LOCK_WINDOW_MS;
      patch.failedLoginCount = 0;
    }
    await ctx.db.patch(user._id, patch);
  },
});

export const resetLoginCounters = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { failedLoginCount: 0, lockedUntil: 0 });
  },
});

export const createSession = internalMutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Single-session policy: logging in on a new device revokes all other sessions
    const previousSessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const s of previousSessions) {
      await ctx.db.delete(s._id);
    }

    await ctx.db.insert("sessions", {
      userId: args.userId,
      token: args.token,
      role: args.role,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const cleanupExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("sessions")
      .withIndex("by_expiresAt", (q) => q.lte("expiresAt", now))
      .collect();
    for (const s of expired) {
      await ctx.db.delete(s._id);
    }
    return { deleted: expired.length };
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

    // ── Affiliate eligibility ──────────────────────────────────────────────
    // Affiliate Center unlocks 1 hour after the user's FIRST completed
    // programme purchase (any plan). Computed from purchase history so it is
    // server-authoritative, spoof-proof, and covers every grant path.
    const AFFILIATE_UNLOCK_DELAY_MS = 60 * 60 * 1000; // 1 hour
    const completedPurchases = purchases.filter((p) => p.status === "completed");
    const firstPurchaseAt =
      completedPurchases.length > 0
        ? Math.min(...completedPurchases.map((p) => p.createdAt))
        : null;
    const affiliateUnlocksAt =
      firstPurchaseAt !== null ? firstPurchaseAt + AFFILIATE_UNLOCK_DELAY_MS : null;
    const affiliateEligible =
      affiliateUnlocksAt !== null && Date.now() >= affiliateUnlocksAt;

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
      firstPurchaseAt,
      affiliateUnlocksAt,
      affiliateEligible,
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

    // Rate limit: 3 password changes per hour per user
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, { key: `changePassword:userId:${user._id}`, max: 3, windowMs: 60 * 60 * 1000 });

    const { valid } = await verifyPassword(args.currentPassword, user.salt, user.passwordHash);
    if (!valid) {
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
    currentPassword: v.string(),
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

    // Rate limit: 3 email changes per hour per user
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, { key: `changeEmail:userId:${user._id}`, max: 3, windowMs: 60 * 60 * 1000 });

    // Require current password confirmation before changing the account email
    const { valid } = await verifyPassword(args.currentPassword, user.salt, user.passwordHash);
    if (!valid) {
      throw new Error("Current password is incorrect");
    }

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

    // Rate limit: 3 deletion attempts per hour per user
    await ctx.runMutation(internal.rateLimit.enforceRateLimit, { key: `deleteAccount:userId:${user._id}`, max: 3, windowMs: 60 * 60 * 1000 });

    const { valid } = await verifyPassword(args.password, user.salt, user.passwordHash);
    if (!valid) {
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

// One-time mutation to create demo Cashfree user
// Run this once from Convex dashboard: npx convex run auth:createDemoCashfreeUser
export const createDemoCashfreeUser = internalMutation({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    message?: string;
    userId?: string;
    email?: string;
    token?: string;
    enrolledPrograms?: string[];
  }> => {
    const email = "test@zeta.in";
    
    // Check if user already exists
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (existing) {
      // Update existing user to have proper email verification
      await ctx.db.patch(existing._id, {
        emailVerified: true,
        status: "active",
        updatedAt: Date.now(),
      });
      return { success: true, message: "Demo user updated with verified email", userId: existing._id };
    }

    // Generate unique referral code
    const referralCode = await getUniqueReferralCode(ctx, "CF");

    // Hash the demo password properly
    const salt = "demosalt123";
    const passwordHash = await hashPassword("test@Zeta123!", salt);

    const now = Date.now();

    // Create user with some enrolled programs
    const userId = await ctx.runMutation(internal.auth.createUser, {
      name: "Cashfree Demo User",
      email,
      passwordHash,
      salt,
      role: "user",
      status: "active",
      referralCode,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize wallet with some balance for demo
    await ctx.runMutation(internal.auth.createWallet, {
      userId,
      availableBalance: 5000,
      pendingBalance: 0,
      totalEarned: 5000,
      totalWithdrawn: 0,
      workEarnings: 3000,
      affiliateEarnings: 2000,
      updatedAt: now,
    });

    // Get some programs to enroll in (first 3 published programs)
    const programs = await ctx.db
      .query("programs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(3);

    // Enroll in first 3 programs
    for (const program of programs) {
      await ctx.db.insert("purchases", {
        userId,
        programId: program._id,
        amount: program.price,
        status: "completed",
        paymentMethod: "demo",
        paymentId: "demo_" + generateToken(),
        createdAt: now,
      });
    }

    // Create session
    const token = "demo_token_" + Date.now().toString(36);
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    await ctx.runMutation(internal.auth.createSession, {
      userId,
      token,
      role: "user",
      expiresAt,
    });

    return {
      success: true,
      message: "Demo Cashfree user created successfully",
      userId,
      email,
      token,
      enrolledPrograms: programs.map(p => p.name),
    };
  },
});

// One-time mutation to fix demo user password hash
// Run once: npx convex run auth:fixDemoUserPassword
export const fixDemoUserPassword = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "test@zeta.in";
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (!existing) {
      return { success: false, message: "Demo user not found" };
    }

    // Hash the correct password
    const salt = "demosalt123";
    const passwordHash = await hashPassword("test@Zeta123!", salt);

    await ctx.db.patch(existing._id, {
      passwordHash,
      salt,
      emailVerified: true,
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true, message: "Demo user password fixed", userId: existing._id };
  },
});

// Test login mutation - tests the password hash directly
export const testDemoUserLogin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "test@zeta.in";
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Test the password hash
    const { valid } = await verifyPassword("test@Zeta123!", user.salt, user.passwordHash);

    return {
      success: true,
      user: {
        email: user.email,
        emailVerified: user.emailVerified,
        status: user.status,
        passwordValid: valid,
      },
    };
  },
});

// ============================================================================
// EMAIL VERIFICATION & PASSWORD RESET
// ============================================================================

// ── Internal helpers (actions cannot use ctx.db) ────────────────────────────

export const getUserByVerificationToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_emailVerificationToken", (q) => q.eq("emailVerificationToken", args.token))
      .first();
  },
});

export const markEmailVerified = internalMutation({
  args: { userId: v.id("users"), updatedAt: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      emailVerified: true,
      status: "active",
      emailVerificationToken: undefined,
      emailVerificationExpiresAt: undefined,
      updatedAt: args.updatedAt,
    });
  },
});

export const updateVerificationToken = internalMutation({
  args: {
    userId: v.id("users"),
    emailVerificationToken: v.string(),
    emailVerificationExpiresAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      emailVerificationToken: args.emailVerificationToken,
      emailVerificationExpiresAt: args.emailVerificationExpiresAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const getUserByPasswordResetToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_passwordResetToken", (q) => q.eq("passwordResetToken", args.token))
      .first();
  },
});

export const updatePasswordResetToken = internalMutation({
  args: {
    userId: v.id("users"),
    passwordResetToken: v.string(),
    passwordResetExpiresAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      passwordResetToken: args.passwordResetToken,
      passwordResetExpiresAt: args.passwordResetExpiresAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const applyPasswordReset = internalMutation({
  args: {
    userId: v.id("users"),
    passwordHash: v.string(),
    salt: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      passwordHash: args.passwordHash,
      salt: args.salt,
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
      updatedAt: args.updatedAt,
    });

    // Revoke all existing sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }
  },
});

// ── Actions ─────────────────────────────────────────────────────────────────

// Verify email with token
export const verifyEmail = action({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<{
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      referralCode?: string;
      emailVerified: boolean;
    };
  }> => {
    const user = await ctx.runQuery(internal.auth.getUserByVerificationToken, { token: args.token });

    if (!user) {
      throw new Error("Invalid or expired verification link");
    }

    if (user.emailVerificationExpiresAt! < Date.now()) {
      throw new Error("Verification link has expired. Please sign up again.");
    }

    if (user.emailVerified) {
      throw new Error("Email already verified. Please sign in.");
    }

    const now = Date.now();
    await ctx.runMutation(internal.auth.markEmailVerified, {
      userId: user._id,
      updatedAt: now,
    });

    // Send welcome email
    await ctx.runAction(internal.email.sendWelcomeEmail, {
      email: user.email,
      name: user.name,
    });

    // Create session for immediate login
    const sessionToken = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    await ctx.runMutation(internal.auth.createSession, {
      userId: user._id,
      token: sessionToken,
      role: user.role,
      expiresAt,
      createdAt: now,
    });

    return {
      token: sessionToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        emailVerified: true,
      },
    };
  },
});

// Resend verification email
export const resendVerificationEmail = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.runQuery(internal.auth.getUserForLogin, { email });

    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    if (user.emailVerified) {
      throw new Error("Email already verified. Please sign in.");
    }

    if (user.status === "suspended") {
      throw new Error("Account suspended. Contact support.");
    }

    const now = Date.now();
    const verificationToken = generateToken();
    const verificationExpiresAt = now + 24 * 60 * 60 * 1000;

    await ctx.runMutation(internal.auth.updateVerificationToken, {
      userId: user._id,
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpiresAt,
      updatedAt: now,
    });

    await ctx.runAction(internal.email.sendVerificationEmail, {
      email,
      token: verificationToken,
      name: user.name,
    });

    return { success: true };
  },
});

// Request password reset
export const requestPasswordReset = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.runQuery(internal.auth.getUserForLogin, { email });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    if (user.status === "suspended") {
      throw new Error("Account suspended. Contact support.");
    }

    const now = Date.now();
    const resetToken = generateToken();
    const resetExpiresAt = now + 60 * 60 * 1000; // 1 hour

    await ctx.runMutation(internal.auth.updatePasswordResetToken, {
      userId: user._id,
      passwordResetToken: resetToken,
      passwordResetExpiresAt: resetExpiresAt,
      updatedAt: now,
    });

    await ctx.runAction(internal.email.sendPasswordResetEmail, {
      email,
      token: resetToken,
      name: user.name,
    });

    return { success: true };
  },
});

// Reset password with token
export const resetPassword = action({
  args: { token: v.string(), newPassword: v.string() },
  handler: async (ctx, args): Promise<{
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      referralCode?: string;
    };
  }> => {
    const user = await ctx.runQuery(internal.auth.getUserByPasswordResetToken, { token: args.token });

    if (!user) {
      throw new Error("Invalid or expired reset link");
    }

    if (user.passwordResetExpiresAt! < Date.now()) {
      throw new Error("Reset link has expired. Please request a new one.");
    }

    if (!args.newPassword || args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(args.newPassword, salt);
    const now = Date.now();

    // Update password and revoke all sessions in one mutation
    await ctx.runMutation(internal.auth.applyPasswordReset, {
      userId: user._id,
      passwordHash,
      salt,
      updatedAt: now,
    });

    // Create new session
    const sessionToken = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    await ctx.runMutation(internal.auth.createSession, {
      userId: user._id,
      token: sessionToken,
      role: user.role,
      expiresAt,
      createdAt: now,
    });

    return {
      token: sessionToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
      },
    };
  },
});
