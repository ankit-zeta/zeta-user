import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users & Profiles
users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.string(), // "user" | "super_admin" | "content_admin" | "finance_admin" | "work_admin"
    status: v.string(), // "active" | "suspended" | "pending" | "unverified"
    referralCode: v.string(),
    referredBy: v.optional(v.id("users")),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    positionId: v.optional(v.id("positions")),
    cvStatus: v.optional(v.string()), // "pending" | "verified" | "rejected"
    cvRemarks: v.optional(v.string()),
    cvReviewedAt: v.optional(v.number()),
    cvVerifiedBy: v.optional(v.string()),
    kycStatus: v.optional(v.string()), // "not_submitted" | "pending" | "verified" | "rejected"
    kycReviewedAt: v.optional(v.number()),
    partnerTier: v.optional(v.string()), // undefined | "growth_partner" (Growth Partner Program — invite only)
    partnerSince: v.optional(v.number()),
    failedLoginCount: v.optional(v.number()),
    lockedUntil: v.optional(v.number()),
    onboardingEmailSentAt: v.optional(v.number()),
    emailVerified: v.optional(v.boolean()),
    emailVerificationToken: v.optional(v.string()),
    emailVerificationExpiresAt: v.optional(v.number()),
    passwordResetToken: v.optional(v.string()),
    passwordResetExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
.index("by_email", ["email"])
    .index("by_referralCode", ["referralCode"])
    .index("by_role", ["role"])
    .index("by_status", ["status"])
    .index("by_emailVerificationToken", ["emailVerificationToken"])
    .index("by_passwordResetToken", ["passwordResetToken"]),

  // Auth placeholder table — enables api.auth generation for login/signup
  auth: defineTable({
    dummy: v.boolean(),
  }),

  // Auth Sessions
sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    role: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    // Login metadata (captured from client at login time)
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    deviceType: v.optional(v.string()), // "desktop" | "mobile" | "tablet"
    deviceOS: v.optional(v.string()),   // "Windows" | "macOS" | "Linux" | "Android" | "iOS"
    deviceBrowser: v.optional(v.string()), // "Chrome" | "Safari" | "Firefox" | "Edge" | etc.
    location: v.optional(v.string()),   // "City, Country" from IP geolocation
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"])
    .index("by_expiresAt", ["expiresAt"]),

  // Structured CV Profiles (no file uploads — form data only)
  cvProfiles: defineTable({
    userId: v.id("users"),
    overview: v.optional(v.string()),
    experience: v.array(
      v.object({
        role: v.string(),
        company: v.string(),
        startDate: v.string(),
        endDate: v.optional(v.string()),
        current: v.optional(v.boolean()),
        description: v.optional(v.string()),
      })
    ),
    education: v.array(
      v.object({
        institution: v.string(),
        degree: v.string(),
        field: v.optional(v.string()),
        status: v.string(), // "pursuing" | "graduated" | "completed"
        startYear: v.optional(v.string()),
        endYear: v.optional(v.string()),
      })
    ),
    technicalSkills: v.array(v.string()),
    softSkills: v.array(v.string()),
    portfolioUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Programs / Courses
  programs: defineTable({
    slug: v.string(),
    name: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    price: v.number(), // in INR (e.g. 2000, 4000, 8000, 14000)
    compareAtPrice: v.optional(v.number()),
    status: v.string(), // "published" | "draft" | "archived"
    thumbnail: v.string(),
    bannerImage: v.optional(v.string()),
    duration: v.string(),
    accessDuration: v.string(),
    certificateEnabled: v.boolean(),
    affiliateEnabled: v.boolean(),
    format: v.optional(v.string()), // "text" (default) | "video" | "mixed"
    category: v.optional(v.string()), // e.g. "Digital Skills", "Marketing", "Skilled Trades"
    sortOrder: v.number(),
    whatIncluded: v.array(v.string()),
    outcomes: v.array(v.string()),
    faqs: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_sortOrder", ["sortOrder"]),

  // Program Modules
  programModules: defineTable({
    programId: v.id("programs"),
    title: v.string(),
    description: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_programId", ["programId"])
    .index("by_sortOrder", ["sortOrder"]),

  // Lessons inside Modules
  lessons: defineTable({
    programId: v.id("programs"),
    moduleId: v.id("programModules"),
    title: v.string(),
    slug: v.string(),
    type: v.string(), // "video" | "text" | "download" | "quiz"
    content: v.string(), // rich text or markdown instructions
    videoUrl: v.optional(v.string()),
    durationMinutes: v.number(),
    sortOrder: v.number(),
    status: v.string(), // "published" | "draft"
    isPreview: v.boolean(),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
    quizData: v.optional(
      v.array(
        v.object({
          question: v.string(),
          options: v.array(v.string()),
          correctIndex: v.number(),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_programId", ["programId"])
    .index("by_moduleId", ["moduleId"])
    .index("by_sortOrder", ["sortOrder"]),

  // User Lesson Progress
  lessonProgress: defineTable({
    userId: v.id("users"),
    programId: v.id("programs"),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
    completedAt: v.number(),
  })
    .index("by_user_program", ["userId", "programId"])
    .index("by_user_lesson", ["userId", "lessonId"]),

  // Resources
  resources: defineTable({
    title: v.string(),
    description: v.string(),
    fileUrl: v.string(),
    fileType: v.string(), // "pdf" | "zip" | "template" | "doc" | "video" | "link"
    fileSize: v.string(),
    programId: v.optional(v.id("programs")),
    moduleId: v.optional(v.id("programModules")),
    accessType: v.string(), // "public" | "enrolled" | "achievement_locked"
    minAchievementId: v.optional(v.id("achievements")),
    downloadCount: v.number(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_programId", ["programId"])
    .index("by_accessType", ["accessType"]),

  // Plans / Bundles (group multiple course programs into one purchasable plan)
  plans: defineTable({
    name: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    status: v.string(), // "published" | "draft"
    thumbnail: v.string(),
    bannerImage: v.string(),
    programIds: v.array(v.id("programs")),
    highlights: v.array(v.string()),
    resourceList: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
          fileType: v.string(),
        })
      )
    ),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // Purchases / Enrollments
  purchases: defineTable({
    userId: v.id("users"),
    programId: v.id("programs"),
    planId: v.optional(v.id("plans")),
    amount: v.number(),
    status: v.string(), // "completed" | "refunded" | "cancelled"
    paymentId: v.string(),
    paymentMethod: v.string(),
    accessType: v.optional(v.string()), // "purchase" (default) | "admin_grant" (free giveaway — not a sale)
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_programId", ["programId"])
    .index("by_status", ["status"]),

  // Certificates
  certificates: defineTable({
    certificateId: v.string(), // Unique public verification string e.g. ZG-2026-ABC123
    userId: v.id("users"),
    programId: v.id("programs"),
    recipientName: v.string(),
    programName: v.string(),
    issueDate: v.number(),
    verificationUrl: v.string(),
  })
    .index("by_certificateId", ["certificateId"])
    .index("by_userId", ["userId"])
    .index("by_programId", ["programId"]),

  // Work Opportunities / Jobs
  jobs: defineTable({
    title: v.string(),
    slug: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    category: v.string(),
    skills: v.array(v.string()),
    requirements: v.array(v.string()),
    requiredProgramId: v.optional(v.id("programs")),
    requiredAchievementId: v.optional(v.id("achievements")),
    payment: v.number(),
    paymentType: v.string(), // "fixed" | "hourly" | "milestone"
    workType: v.string(), // "remote" | "hybrid" | "on_site"
    difficulty: v.string(), // "beginner" | "intermediate" | "advanced"
    estimatedDuration: v.string(),
    deadline: v.string(),
    openings: v.number(),
    status: v.string(), // "published" | "draft" | "closed" | "archived"
    applicationQuestions: v.array(v.string()),
    attachments: v.optional(v.array(v.string())),
    company: v.optional(v.string()),
    coverImageStorageId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  // Job Applications
  jobApplications: defineTable({
    jobId: v.id("jobs"),
    userId: v.id("users"),
    answers: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      })
    ),
    coverNote: v.string(),
    portfolioUrl: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    status: v.string(), // "submitted" | "under_review" | "shortlisted" | "accepted" | "in_progress" | "revision_required" | "completed" | "rejected" | "cancelled"
    adminNotes: v.optional(v.string()),
    submissionWorkUrl: v.optional(v.string()),
    submissionNotes: v.optional(v.string()),
    paymentStatus: v.optional(v.string()), // "unpaid" | "paid"
    submittedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Referrals
  referrals: defineTable({
    referrerUserId: v.id("users"),
    referredUserId: v.id("users"),
    referralCode: v.string(),
    status: v.string(), // "active" | "qualifying"
    createdAt: v.number(),
  })
    .index("by_referrerUserId", ["referrerUserId"])
    .index("by_referredUserId", ["referredUserId"]),

  // Affiliate Sales & Commissions (kind "direct" = standard referral, "chain" = upline % of downline's commission)
  affiliateSales: defineTable({
    purchaseId: v.id("purchases"),
    buyerUserId: v.id("users"),
    referrerUserId: v.id("users"),
    programId: v.id("programs"),
    saleAmount: v.number(),
    commissionAmount: v.number(),
    status: v.string(), // "pending" | "approved" | "available" | "paid" | "rejected" | "reversed"
    ruleUsed: v.string(),
    holdingPeriodEndsAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    kind: v.optional(v.string()), // "direct" (default) | "chain"
    awaitingConsumption: v.optional(v.boolean()), // true until buyer proves genuine course usage
    parentSaleId: v.optional(v.id("affiliateSales")),
    chainLevel: v.optional(v.number()), // 1 = upline of the direct referrer
    baseCommissionAmount: v.optional(v.number()), // the direct commission the chain % was applied to
  })
    .index("by_referrerUserId", ["referrerUserId"])
    .index("by_buyerUserId", ["buyerUserId"])
    .index("by_status", ["status"])
    .index("by_parentSaleId", ["parentSaleId"]),

  // Wallets
  wallets: defineTable({
    userId: v.id("users"),
    availableBalance: v.number(),
    pendingBalance: v.number(),
    totalEarned: v.number(),
    totalWithdrawn: v.number(),
    workEarnings: v.number(),
    affiliateEarnings: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Wallet Transactions Ledger
  walletTransactions: defineTable({
    userId: v.id("users"),
    type: v.string(), // "PROGRAM_PURCHASE" | "AFFILIATE_COMMISSION" | "CHAIN_COMMISSION" | "WORK_PAYOUT" | "WITHDRAWAL" | "ADMIN_ADJUSTMENT" | "REFUND"
    amount: v.number(),
    balanceAfter: v.number(),
    referenceId: v.optional(v.string()),
    description: v.string(),
    status: v.string(), // "completed" | "pending" | "failed"
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_type", ["type"]),

  // Saved payout methods (bank / UPI / UPI-QR) for fast withdrawals
  payoutMethods: defineTable({
    userId: v.id("users"),
    type: v.string(), // "bank_transfer" | "upi" | "upi_qr"
    name: v.string(), // user label, e.g. "HDFC ••••1234"
    details: v.object({
      accountNumber: v.optional(v.string()),
      ifscCode: v.optional(v.string()),
      bankName: v.optional(v.string()),
      accountHolderName: v.optional(v.string()),
      upiId: v.optional(v.string()),
      qrImageUrl: v.optional(v.string()), // storage id for upi_qr
    }),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Withdrawals
  withdrawals: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    fee: v.number(),
    netAmount: v.number(),
    payoutMethod: v.string(), // "bank_transfer" | "upi" | "paypal" | "upi_qr"
    payoutDetails: v.object({
      accountNumber: v.optional(v.string()),
      ifscCode: v.optional(v.string()),
      bankName: v.optional(v.string()),
      accountHolderName: v.optional(v.string()),
      upiId: v.optional(v.string()),
      paypalEmail: v.optional(v.string()),
      qrImageUrl: v.optional(v.string()),
    }),
    status: v.string(), // "requested" | "under_review" | "approved" | "processing" | "completed" | "rejected" | "cancelled"
    adminNote: v.optional(v.string()),
    // TDS computed at request time (Apr-Mar FY, per-category thresholds)
    tdsAmount: v.optional(v.number()), // total TDS deducted
    tdsBreakdown: v.optional(
      v.object({
        affiliateGross: v.number(),
        affiliateTds: v.number(),
        workGross: v.number(),
        workTds: v.number(),
        financialYear: v.number(), // FY start year, e.g. 2026 for Apr 2026 - Mar 2027
      })
    ),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Achievement Definitions
  achievements: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    status: v.string(), // "active" | "draft" | "archived"
    sortOrder: v.number(),
    conditionMode: v.string(), // "ALL" | "ANY"
    conditions: v.array(
      v.object({
        metric: v.string(), // "affiliate_sales" | "valid_referrals" | "total_sales_amount" | "completed_jobs" | "approved_jobs" | "completed_programs" | "total_earnings"
        operator: v.string(), // ">=" | ">" | "==" | "<=" | "<"
        value: v.number(),
      })
    ),
    unlockPositionId: v.optional(v.id("positions")),
    unlockBadgeName: v.optional(v.string()),
    unlockJobAccessCategory: v.optional(v.string()),
    notificationText: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // User Unlocked Achievements
  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    unlockedAt: v.number(),
  })
    .index("by_user_achievement", ["userId", "achievementId"])
    .index("by_userId", ["userId"]),

  // Positions / Titles
  positions: defineTable({
    name: v.string(),
    description: v.string(),
    badgeColor: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
  }).index("by_sortOrder", ["sortOrder"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  // Announcements
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    targetRole: v.string(), // "all" | "user" | "admin"
    isActive: v.boolean(),
    priority: v.string(), // "normal" | "high" | "urgent"
    createdAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  // Admin Configurable Settings
  adminSettings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedBy: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Audit Logs
  auditLogs: defineTable({
    adminUserId: v.id("users"),
    adminEmail: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    reason: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_entityType", ["entityType"])
    .index("by_adminUserId", ["adminUserId"]),

  // Contact Inquiries
  contactInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.string(), // "new" | "in_progress" | "resolved"
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Support Tickets
  supportTickets: defineTable({
    trackingId: v.string(), // "ZT-XXXXXX"
    userId: v.id("users"),
    userName: v.string(),
    userEmail: v.string(),
    category: v.string(), // "courses" | "duration" | "payments" | "withdrawals" | "jobs" | "affiliate" | "account" | "other"
    title: v.string(),
    message: v.string(),
    status: v.string(), // "open" | "in_progress" | "resolved" | "closed"
    attachments: v.optional(
      v.array(
        v.object({
          type: v.string(), // "image" | "link"
          url: v.string(),
          name: v.optional(v.string()),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_trackingId", ["trackingId"]),

  // Rate Limits (for brute-force / spam protection)
  rateLimits: defineTable({
    key: v.string(), // e.g. "signup:email:foo@bar.com" | "signup:global" | "changeEmail:userId:xyz"
    windowStart: v.number(),
    count: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_windowStart", ["windowStart"]),

  ticketMessages: defineTable({
    ticketId: v.id("supportTickets"),
    sender: v.string(), // "user" | "admin"
    senderName: v.string(),
    message: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.string(), // "image" | "link"
          url: v.string(),
          name: v.optional(v.string()),
        })
      )
    ),
    createdAt: v.number(),
  }).index("by_ticketId", ["ticketId"]),

  // KYC Profiles (TDS compliance) — stores only masked identifiers.
  // Full Aadhaar is NEVER stored (UIDAI data-minimization): last 4 digits only.
  // PAN is stored in full for TDS filing but always masked in client UIs.
  kycProfiles: defineTable({
    userId: v.id("users"),
    fullNameAsPerPan: v.string(),
    panNumber: v.string(), // stored uppercase; masked to ABCDE****F in every client response
    panImageId: v.optional(v.id("_storage")),
    aadhaarLast4: v.string(), // exactly 4 digits
    aadhaarImageId: v.optional(v.id("_storage")),
    // Address is legacy-optional: no longer collected at signup KYC (no physical
    // deliveries). Older verified profiles may still carry it for TDS records.
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
    status: v.string(), // "pending" | "verified" | "rejected"
    rejectionReason: v.optional(v.string()),
    submissionCount: v.number(), // resubmission tracking
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()), // admin email
    verificationMode: v.optional(v.string()), // "manual" (fallback) | "api" (future)
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_panNumber", ["panNumber"]),

  // Razorpay payment orders (checkout bridge). Purely additive — existing
  // tables/logic are untouched. A purchase only unlocks when an order reaches
  // status "paid" (server-verified signature or webhook) and is then marked
  // "consumed" by the enrollment mutation.
  //
  // Funnel tracking: every order records how it reached its final state so the
  // admin dashboard can show initiated vs paid vs dropped checkouts and each
  // row can be cross-verified against the Razorpay dashboard (order id /
  // payment id are stored verbatim).
  paymentOrders: defineTable({
    userId: v.id("users"),
    planId: v.id("plans"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
    amount: v.number(), // in paise
    currency: v.string(), // "INR"
    receipt: v.string(),
    status: v.string(), // "created" | "paid" | "consumed" | "failed" | "cancelled" | "expired"
    createdAt: v.number(),
    updatedAt: v.number(),
    paidAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    // "user" (closed the Razorpay window) | "webhook" | "timeout"
    cancelSource: v.optional(v.string()),
    // Why an order failed / was dropped (webhook error description, user
    // dismissal, signature mismatch, stale timeout, …)
    failureReason: v.optional(v.string()),
    // "client" (browser handler) | "webhook" — how the final state was learned
    statusSource: v.optional(v.string()),
  })
    .index("by_razorpayOrderId", ["razorpayOrderId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // ── Operating expenses (admin-entered) for profitability analytics ────────
  // Admin-defined cost categories (server, email, events, tools, …).
  expenseCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()), // hex, used by dashboard charts
    archived: v.optional(v.boolean()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Individual expense entries. Amount is stored in PAISE (same as revenue)
  // so profit math never mixes units. `recurring` marks repeat costs like
  // monthly server bills (informational — entries are still per-occurrence).
  expenses: defineTable({
    categoryId: v.id("expenseCategories"),
    description: v.string(),
    amount: v.number(), // in paise
    date: v.number(), // when the cost was incurred
    vendor: v.optional(v.string()),
    notes: v.optional(v.string()),
    recurring: v.optional(v.boolean()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_date", ["date"]),
});
