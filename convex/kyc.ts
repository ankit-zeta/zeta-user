import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getSessionUserDoc(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new ConvexError("Unauthorized");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || user.status === "suspended") {
    throw new ConvexError("Unauthorized");
  }
  return { session, user };
}

async function requireKycAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new ConvexError("Unauthorized: Invalid session");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !["super_admin", "admin", "finance_admin"].includes(user.role)) {
    throw new ConvexError("Forbidden: Admin privileges required");
  }
  return user;
}

function maskPan(pan: string): string {
  // ABCDE1234F -> ABCDE****F
  return pan.length === 10 ? `${pan.slice(0, 5)}****${pan.slice(-1)}` : "****";
}

// Inline fixed-window rate limiter (same transaction, zero extra function calls)
async function enforceInlineRateLimit(
  ctx: any,
  key: string,
  max: number,
  windowMs: number
) {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();
  if (existing && existing.windowStart >= now - windowMs) {
    if (existing.count + 1 > max) {
      throw new ConvexError(
        "Too many submissions. Please try again later."
      );
    }
    await ctx.db.patch(existing._id, { count: existing.count + 1 });
  } else if (existing) {
    await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
  } else {
    await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1 });
  }
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// ── User endpoints ───────────────────────────────────────────────────────────

// Short-lived upload URL. Client compresses the image BEFORE calling this so
// we never pay bandwidth for multi-MB originals.
export const generateKycUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getMyKyc = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const { user } = await getSessionUserDoc(ctx, args.token);

    const profile = await ctx.db
      .query("kycProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .first();

    if (!profile) {
      return {
        status: "not_submitted" as const,
        profile: null,
        panMasked: null,
        panImageUrl: null,
        aadhaarImageUrl: null,
      };
    }

    // Resolve image URLs only while they still matter (pending review).
    // After verification we stop reading storage — saves read bandwidth forever.
    const needImages =
      profile.status === "pending" || profile.status === "rejected";
    const panImageUrl =
      needImages && profile.panImageId
        ? await ctx.storage.getUrl(profile.panImageId)
        : null;
    const aadhaarImageUrl =
      needImages && profile.aadhaarImageId
        ? await ctx.storage.getUrl(profile.aadhaarImageId)
        : null;

    return {
      status: profile.status,
      profile: {
        fullNameAsPerPan: profile.fullNameAsPerPan,
        aadhaarLast4: profile.aadhaarLast4,
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        rejectionReason: profile.rejectionReason,
        submittedAt: profile.submittedAt,
        reviewedAt: profile.reviewedAt,
        submissionCount: profile.submissionCount,
      },
      panMasked: maskPan(profile.panNumber),
      panImageUrl,
      aadhaarImageUrl,
    };
  },
});

export const submitKyc = mutation({
  args: {
    token: v.string(),
    fullNameAsPerPan: v.string(),
    panNumber: v.string(),
    panImageId: v.optional(v.string()),
    aadhaarLast4: v.string(),
    aadhaarImageId: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { session, user } = await getSessionUserDoc(ctx, args.token);

    // Rate limit: 5 submissions per day per user (anti-spam / anti-probe)
    await enforceInlineRateLimit(ctx, `kycSubmit:${session.userId}`, 5, 24 * 60 * 60 * 1000);

    // Already verified — lock the record
    if (user.kycStatus === "verified") {
      throw new ConvexError("Your KYC is already verified. Contact support for corrections.");
    }

    // Already under review — one application at a time. Resubmission opens
    // only after the current application is rejected (or verified, above).
    // Defense-in-depth alongside the UI hiding the form for pending users.
    const pendingProfile = await ctx.db
      .query("kycProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
      .first();
    if (pendingProfile && pendingProfile.status === "pending") {
      throw new ConvexError(
        "Your KYC is already under review. You can resubmit only after it is verified or rejected."
      );
    }

    // ── Validation ──
    const fullName = args.fullNameAsPerPan.trim();
    if (fullName.length < 3 || fullName.length > 80) {
      throw new ConvexError("Enter your full name as printed on your PAN card");
    }
    const pan = args.panNumber.trim().toUpperCase();
    if (!PAN_REGEX.test(pan)) {
      throw new ConvexError("Invalid PAN format. Expected format: ABCDE1234F");
    }
    const last4 = args.aadhaarLast4.trim();
    if (!/^\d{4}$/.test(last4)) {
      throw new ConvexError("Enter exactly the last 4 digits of your Aadhaar number");
    }
    if (!args.panImageId || !args.aadhaarImageId) {
      throw new ConvexError("Upload both your PAN card image and Aadhaar card image");
    }

    // Validate storage objects exist (catches stale/expired client IDs early)
    const panDoc = await ctx.db.system.get(args.panImageId as any);
    const aadhaarDoc = await ctx.db.system.get(args.aadhaarImageId as any);
    if (!panDoc || !aadhaarDoc) {
      throw new ConvexError("Uploaded documents not found — please re-upload and submit again");
    }

    // Duplicate-PAN protection across accounts
    const dupe = await ctx.db
      .query("kycProfiles")
      .withIndex("by_panNumber", (q: any) => q.eq("panNumber", pan))
      .first();
    if (dupe && dupe.userId.toString() !== session.userId.toString()) {
      throw new ConvexError(
        "This PAN number is already linked to a different account. Contact support if you believe this is a mistake."
      );
    }

    const now = Date.now();

    // Upsert single KYC profile per user.
    // On resubmission, delete the PREVIOUS document images from storage —
    // otherwise orphaned files would sit in storage costing us forever.
    const existing = await ctx.db
      .query("kycProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", session.userId))
      .first();

    if (existing) {
      for (const oldId of [existing.panImageId, existing.aadhaarImageId]) {
        if (oldId) {
          try {
            await ctx.storage.delete(oldId);
          } catch (e) {
            console.error("Failed to delete replaced KYC image:", e);
          }
        }
      }
    }

    let profileId: any;
    if (existing) {
      await ctx.db.patch(existing._id, {
        fullNameAsPerPan: fullName,
        panNumber: pan,
        panImageId: args.panImageId as any,
        aadhaarLast4: last4,
        aadhaarImageId: args.aadhaarImageId as any,
        status: "pending",
        rejectionReason: undefined,
        submissionCount: (existing.submissionCount || 1) + 1,
        submittedAt: now,
        reviewedAt: undefined,
        reviewedBy: undefined,
        verificationMode: "manual",
      });
      profileId = existing._id;
    } else {
      profileId = await ctx.db.insert("kycProfiles", {
        userId: session.userId,
        fullNameAsPerPan: fullName,
        panNumber: pan,
        panImageId: args.panImageId as any,
        aadhaarLast4: last4,
        aadhaarImageId: args.aadhaarImageId as any,
        status: "pending",
        submissionCount: 1,
        submittedAt: now,
        verificationMode: "manual",
      });
    }

    // Mirror on users for cheap gating checks everywhere else
    await ctx.db.patch(session.userId, {
      kycStatus: "pending",
      updatedAt: now,
    });

    // Confirmation email: "we will notify you once we confirm your KYC"
    try {
      await ctx.scheduler.runAfter(0, internal.email.sendKycReceivedEmail, {
        email: user.email,
        name: user.name,
      });
    } catch (e) {
      console.error("Failed to schedule KYC received email:", e);
    }

    return { success: true, profileId };
  },
});

// ── Admin endpoints ──────────────────────────────────────────────────────────

const KYC_STATUSES = ["pending", "verified", "rejected"];

export const getKycQueueAdmin = query({
  args: { token: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireKycAdmin(ctx, args.token);

    let profiles;
    if (args.status && KYC_STATUSES.includes(args.status)) {
      profiles = await ctx.db
        .query("kycProfiles")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .collect();
    } else {
      profiles = await ctx.db.query("kycProfiles").collect();
    }

    profiles.sort((a, b) => b.submittedAt - a.submittedAt);

    // List view: masked identifiers only. Images resolve in the detail view.
    return Promise.all(
      profiles.map(async (p) => {
        const u = await ctx.db.get(p.userId) as { name?: string; email?: string; phone?: string; referralCode?: string; cvStatus?: string } | null;
        return {
          _id: p._id,
          userId: p.userId,
          userName: u?.name || "Deleted user",
          userEmail: u?.email || "",
          userPhone: u?.phone || "",
          referralCode: u?.referralCode || "",
          cvStatus: u?.cvStatus || "pending",
          fullNameAsPerPan: p.fullNameAsPerPan,
          panMasked: maskPan(p.panNumber),
          panFull: p.panNumber,
          aadhaarLast4: p.aadhaarLast4,
          city: p.city,
          state: p.state,
          pincode: p.pincode,
          status: p.status,
          rejectionReason: p.rejectionReason,
          submissionCount: p.submissionCount,
          submittedAt: p.submittedAt,
          reviewedAt: p.reviewedAt,
          reviewedBy: p.reviewedBy,
        };
      })
    );
  },
});

export const getKycDetailAdmin = query({
  args: { token: v.string(), profileId: v.id("kycProfiles") },
  handler: async (ctx, args) => {
    await requireKycAdmin(ctx, args.token);

    const p = await ctx.db.get(args.profileId);
    if (!p) throw new ConvexError("KYC profile not found");

    const u = await ctx.db.get(p.userId);
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q: any) => q.eq("userId", p.userId))
      .first();

    return {
      _id: p._id,
      userId: p.userId,
      userName: u?.name || "Deleted user",
      userEmail: u?.email || "",
      userPhone: u?.phone || "",
      referralCode: u?.referralCode || "",
      joinedAt: u?.createdAt,
      cvStatus: u?.cvStatus || "pending",
      fullNameAsPerPan: p.fullNameAsPerPan,
      panMasked: maskPan(p.panNumber),
      panFull: p.panNumber,
      aadhaarLast4: p.aadhaarLast4,
      addressLine1: p.addressLine1,
      addressLine2: p.addressLine2,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      status: p.status,
      rejectionReason: p.rejectionReason,
      submissionCount: p.submissionCount,
      submittedAt: p.submittedAt,
      reviewedAt: p.reviewedAt,
      reviewedBy: p.reviewedBy,
      verificationMode: p.verificationMode,
      walletBalance: wallet?.availableBalance || 0,
      totalEarned: wallet?.totalEarned || 0,
      panImageUrl: p.panImageId ? await ctx.storage.getUrl(p.panImageId) : null,
      aadhaarImageUrl: p.aadhaarImageId
        ? await ctx.storage.getUrl(p.aadhaarImageId)
        : null,
    };
  },
});

export const reviewKyc = mutation({
  args: {
    token: v.string(),
    profileId: v.id("kycProfiles"),
    decision: v.string(), // "verified" | "rejected"
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireKycAdmin(ctx, args.token);
    if (!["verified", "rejected"].includes(args.decision)) {
      throw new ConvexError("Invalid decision");
    }
    if (args.decision === "rejected" && !args.reason?.trim()) {
      throw new ConvexError("A rejection reason is required");
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new ConvexError("KYC profile not found");
    if (profile.status === args.decision) {
      throw new ConvexError(`KYC is already ${args.decision}`);
    }

    const user = await ctx.db.get(profile.userId);
    if (!user) throw new ConvexError("User no longer exists");

    const previous = profile.status;
    const now = Date.now();

    await ctx.db.patch(args.profileId, {
      status: args.decision,
      rejectionReason:
        args.decision === "rejected" ? args.reason!.trim() : undefined,
      reviewedAt: now,
      reviewedBy: admin.email,
      verificationMode: "manual",
    });

    await ctx.db.patch(profile.userId, {
      kycStatus: args.decision,
      kycReviewedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: profile.userId,
      type: "kyc",
      title:
        args.decision === "verified" ? "KYC Verified" : "KYC Verification Failed",
      message:
        args.decision === "verified"
          ? "Your KYC has been verified. Affiliate earnings and withdrawals are now unlocked."
          : `Your KYC could not be verified. Reason: ${args.reason}. You can correct your details and resubmit.`,
      read: false,
      actionUrl: "/dashboard/kyc",
      createdAt: now,
    });

    // Outcome email
    try {
      if (args.decision === "verified") {
        await ctx.scheduler.runAfter(0, internal.email.sendKycApprovedEmail, {
          email: user.email,
          name: user.name,
        });
      } else {
        await ctx.scheduler.runAfter(0, internal.email.sendKycRejectedEmail, {
          email: user.email,
          name: user.name,
          reason: args.reason!.trim(),
        });
      }
    } catch (e) {
      console.error("Failed to schedule KYC outcome email:", e);
    }

    await ctx.db.insert("auditLogs", {
      adminUserId: admin._id,
      adminEmail: admin.email,
      action: "REVIEW_KYC",
      entityType: "kycProfiles",
      entityId: args.profileId,
      previousValue: previous,
      newValue: args.decision,
      reason: args.reason || "Manual KYC review",
      timestamp: now,
    });

    return { success: true };
  },
});

// ── Image retention (privacy / data minimization) ───────────────────────────
// Deletes PAN & Aadhaar document images 90 days after approval. Masked
// identifiers, name and address are retained for TDS/compliance records.
// Runs daily via cron; processes a small batch per run to keep function
// duration, bandwidth and storage costs predictable.
export const cleanupApprovedKycImages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days post-approval
    const BATCH = 50; // max profiles processed per daily run
    const cutoff = Date.now() - RETENTION_MS;

    const approved = await ctx.db
      .query("kycProfiles")
      .withIndex("by_status", (q) => q.eq("status", "verified"))
      .collect();

    let cleaned = 0;
    for (const p of approved) {
      if ((p.reviewedAt || p.submittedAt) > cutoff) continue;
      if (!p.panImageId && !p.aadhaarImageId) continue;

      let failed = false;
      for (const imageId of [p.panImageId, p.aadhaarImageId]) {
        if (!imageId) continue;
        try {
          await ctx.storage.delete(imageId);
        } catch (e) {
          // Storage object may already be gone — safe to clear the reference.
          console.error("KYC retention: failed to delete storage object:", e);
          failed = true;
        }
      }
      if (failed) continue; // retry on a future run

      await ctx.db.patch(p._id, {
        panImageId: undefined,
        aadhaarImageId: undefined,
      });
      cleaned++;
      if (cleaned >= BATCH) break;
    }

    return { cleaned, scanned: approved.length };
  },
});
