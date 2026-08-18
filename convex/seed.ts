import { mutation } from "./_generated/server";

// Hash function helper for seed
async function hashPassword(password: string, salt: string): Promise<string> {
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

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if database is already seeded
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@zetagrow.com"))
      .first();

    if (existingAdmin) {
      return { message: "Database already contains seed admin user." };
    }

    // 1. Create Positions
    const pos1 = await ctx.db.insert("positions", {
      name: "Associate Specialist",
      description: "Entry-level qualified digital contributor.",
      badgeColor: "#176B4D",
      sortOrder: 1,
      createdAt: now,
    });

    const pos2 = await ctx.db.insert("positions", {
      name: "Growth Lead",
      description: "Proven track record in client projects and referral operations.",
      badgeColor: "#15803D",
      sortOrder: 2,
      createdAt: now,
    });

    const pos3 = await ctx.db.insert("positions", {
      name: "Senior Project Manager",
      description: "Team leadership and high-ticket project matchmaking priority.",
      badgeColor: "#B45309",
      sortOrder: 3,
      createdAt: now,
    });

    // 2. Create Achievements
    const ach1 = await ctx.db.insert("achievements", {
      name: "Fast Starter",
      slug: "fast-starter",
      description: "Complete your first enrolled program and finish all module lessons.",
      icon: "zap",
      status: "active",
      sortOrder: 1,
      conditionMode: "ALL",
      conditions: [{ metric: "completed_programs", operator: ">=", value: 1 }],
      unlockBadgeName: "Fast Starter Badge",
      notificationText: "Congratulations! You earned the Fast Starter badge for completing your first course.",
      createdAt: now,
      updatedAt: now,
    });

    const ach2 = await ctx.db.insert("achievements", {
      name: "Work Pro",
      slug: "work-pro",
      description: "Successfully complete 3 client assignments in the work marketplace.",
      icon: "briefcase",
      status: "active",
      sortOrder: 2,
      conditionMode: "ALL",
      conditions: [{ metric: "completed_jobs", operator: ">=", value: 3 }],
      unlockPositionId: pos1,
      unlockBadgeName: "Verified Contributor",
      notificationText: "You are now recognized as an Associate Specialist with priority work access.",
      createdAt: now,
      updatedAt: now,
    });

    const ach3 = await ctx.db.insert("achievements", {
      name: "Top Affiliate Partner",
      slug: "top-affiliate-partner",
      description: "Generate 5 qualifying program referral sales.",
      icon: "trending-up",
      status: "active",
      sortOrder: 3,
      conditionMode: "ALL",
      conditions: [{ metric: "affiliate_sales", operator: ">=", value: 5 }],
      unlockPositionId: pos2,
      unlockBadgeName: "Growth Partner",
      notificationText: "Exceptional referral performance! You unlocked Growth Lead status.",
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create Super Admin User
    const adminSalt = "salt_admin_zetagrow_2026";
    const adminHash = await hashPassword("AdminPassword123!", adminSalt);
    const adminId = await ctx.db.insert("users", {
      name: "Admin",
      email: "admin@zetagrow.com",
      passwordHash: adminHash,
      salt: adminSalt,
      role: "super_admin",
      status: "active",
      referralCode: "ADMIN",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("wallets", {
      userId: adminId,
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      workEarnings: 0,
      affiliateEarnings: 0,
      updatedAt: now,
    });

    // 4. Create Demo Regular User
    const demoSalt = "salt_demo_zetagrow_2026";
    const demoHash = await hashPassword("DemoPassword123!", demoSalt);
    const demoId = await ctx.db.insert("users", {
      name: "Rahul Sharma",
      email: "demo@zetagrow.com",
      passwordHash: demoHash,
      salt: demoSalt,
      role: "user",
      status: "active",
      referralCode: "DEMO123",
      bio: "Digital skills enthusiast, freelance content developer, and active platform contributor.",
      phone: "+91 98765 43210",
      skills: ["Copywriting", "Video Editing", "Content Ops", "Social Media"],
      positionId: pos1,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("wallets", {
      userId: demoId,
      availableBalance: 4500,
      pendingBalance: 1000,
      totalEarned: 5500,
      totalWithdrawn: 0,
      workEarnings: 3500,
      affiliateEarnings: 2000,
      updatedAt: now,
    });

    // 5. Create Programs
    const prog1 = await ctx.db.insert("programs", {
      name: "Starter Digital Skills",
      slug: "starter-digital-skills",
      shortDescription: "Essential modern workplace and foundational digital productivity skills.",
      description: "Master modern digital communication, productivity toolchains, remote collaboration standards, and content creation basics to jumpstart your career.",
      price: 2000,
      compareAtPrice: 3500,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      bannerImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
      duration: "4 Weeks",
      accessDuration: "Lifetime Access",
      certificateEnabled: true,
      affiliateEnabled: true,
      sortOrder: 1,
      whatIncluded: [
        "4 Comprehensive Modules with 16 Lessons",
        "Curated Template Library & Resource Kit",
        "Entry-level Work Marketplace Eligibility",
        "Verified Certificate of Completion",
        "50% Affiliate Commission Qualification",
      ],
      outcomes: [
        "Professional remote work readiness",
        "High-efficiency workflow automation",
        "Foundational copy and asset creation",
        "Eligibility for basic freelance assignments",
      ],
      faqs: [
        {
          question: "Who is this program for?",
          answer: "Students, early career professionals, and freelancers seeking structured modern digital skills.",
        },
        {
          question: "How do I receive the certificate?",
          answer: "Upon completing 100% of all lessons and quizzes, your verifiable certificate is automatically generated.",
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    const prog2 = await ctx.db.insert("programs", {
      name: "Growth Professional",
      slug: "growth-professional",
      shortDescription: "Intermediate technical workflows, content operations, and client project management.",
      description: "Accelerate your earning potential with intermediate skills in digital media production, brand strategy, workflow orchestration, and client delivery.",
      price: 4000,
      compareAtPrice: 6500,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      bannerImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
      duration: "8 Weeks",
      accessDuration: "Lifetime Access",
      certificateEnabled: true,
      affiliateEnabled: true,
      sortOrder: 2,
      whatIncluded: [
        "8 Practical Modules with 32 Lessons",
        "Video Editing & Copywriting Swipe Files",
        "Access to Intermediate Work Opportunities",
        "Verified Professional Credential",
        "Affiliate Partner Dashboard",
      ],
      outcomes: [
        "End-to-end video and multimedia production",
        "Client project scoping and milestone delivery",
        "Search and social engagement mechanics",
      ],
      faqs: [
        {
          question: "Can I upgrade from the Starter Program?",
          answer: "Yes, you can upgrade at any time to access higher tier client opportunities and content.",
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    const prog3 = await ctx.db.insert("programs", {
      name: "Advanced Pro Specialist",
      slug: "advanced-pro-specialist",
      shortDescription: "Advanced specialized workflows, high-ticket work delivery, and team leadership.",
      description: "A comprehensive program designed for professionals seeking mastery in digital marketing architecture, conversion systems, full-stack workflow automation, and client retainers.",
      price: 8000,
      compareAtPrice: 12000,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
      bannerImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
      duration: "12 Weeks",
      accessDuration: "Lifetime Access",
      certificateEnabled: true,
      affiliateEnabled: true,
      sortOrder: 3,
      whatIncluded: [
        "12 Advanced Modules with 48 Lessons",
        "Exclusive High-Ticket Work Application Access",
        "Advanced Analytics & Strategy Blueprints",
        "Specialist Certificate & Portfolio Review",
        "Priority Affiliate Multipliers",
      ],
      outcomes: [
        "Management of enterprise digital assets",
        "High-ticket retainer project execution",
        "Team coordination and delivery oversight",
      ],
      faqs: [
        {
          question: "What work opportunities become available?",
          answer: "You unlock specialized retainer assignments, management roles, and high-budget client contracts.",
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    const prog4 = await ctx.db.insert("programs", {
      name: "Premium Master Program",
      slug: "premium-master-program",
      shortDescription: "Complete full-stack mastery, direct job matchmaking priority, and premium resources.",
      description: "Our flagship program offering unrestricted access to all current and future curriculum modules, one-on-one portfolio evaluations, VIP work matchmaking, and director-level certification.",
      price: 14000,
      compareAtPrice: 22000,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
      bannerImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80",
      duration: "24 Weeks",
      accessDuration: "Lifetime Access",
      certificateEnabled: true,
      affiliateEnabled: true,
      sortOrder: 4,
      whatIncluded: [
        "Complete Master Curriculum (All Tiers Included)",
        "Direct Job Matchmaking & Retainer Priority",
        "Master Digital Asset Suite & Commercial Licenses",
        "Director-level Certified Credential",
        "Executive Strategy Sessions",
      ],
      outcomes: [
        "Full digital operations mastery",
        "Top-tier contractor placement readiness",
        "Complete affiliate commission potential across all tiers",
      ],
      faqs: [
        {
          question: "Does this include all lower programs?",
          answer: "Yes, the Master Program includes all curriculum, resources, and perks of every lower tier.",
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    // 6. Create Modules & Lessons for Program 1 (Starter)
    const mod1 = await ctx.db.insert("programModules", {
      programId: prog1,
      title: "Module 1: Foundations of Digital Productivity",
      description: "Setting up modern workspaces, cloud workflows, and time-management systems.",
      sortOrder: 1,
      createdAt: now,
    });

    const mod2 = await ctx.db.insert("programModules", {
      programId: prog1,
      title: "Module 2: Professional Content Creation & Copy",
      description: "Fundamentals of impactful written and visual communication for modern brands.",
      sortOrder: 2,
      createdAt: now,
    });

    await ctx.db.insert("lessons", {
      programId: prog1,
      moduleId: mod1,
      title: "Lesson 1: Welcome & Platform Orientation",
      slug: "welcome-platform-orientation",
      type: "video",
      content: "Welcome to ZetaGrow! In this foundational lesson, you'll learn how to navigate your learning dashboard, track your progress, access downloadable resources, and unlock work opportunities upon completion.\n\n### Core Topics:\n- Navigating your personal dashboard\n- How lesson completion unlocks verified certificates\n- Connecting your verified skills to the Work Portal",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationMinutes: 15,
      sortOrder: 1,
      status: "published",
      isPreview: true,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("lessons", {
      programId: prog1,
      moduleId: mod1,
      title: "Lesson 2: Modern Remote Work Tooling & Setup",
      slug: "remote-work-tooling",
      type: "text",
      content: "### Modern Digital Workspaces\n\nTo succeed in modern remote client work, you need a disciplined digital workspace.\n\n1. **Cloud File Organization**: Keep client assets categorized by date and revision.\n2. **Communication Standards**: Asynchronous clarity prevents revision loops.\n3. **Task Tracking**: Utilizing Kanban and milestone boards to deliver on time.",
      durationMinutes: 20,
      sortOrder: 2,
      status: "published",
      isPreview: false,
      attachmentUrl: "https://example.com/starter-kit.pdf",
      attachmentName: "Remote_Productivity_Template.pdf",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("lessons", {
      programId: prog1,
      moduleId: mod2,
      title: "Lesson 3: High-Converting Copywriting Basics",
      slug: "copywriting-basics",
      type: "text",
      content: "### Principles of Direct & Clear Copy\n\nGood copy is not about ornate words—it is about clarity, empathy, and call-to-action precision.\n\n- **AIDA Framework**: Attention, Interest, Desire, Action.\n- **Benefit over Feature**: Explain the outcome rather than just the mechanism.",
      durationMinutes: 25,
      sortOrder: 1,
      status: "published",
      isPreview: false,
      createdAt: now,
      updatedAt: now,
    });

    // Enroll demo user in Program 1
    await ctx.db.insert("purchases", {
      userId: demoId,
      programId: prog1,
      amount: 2000,
      status: "completed",
      paymentId: "PAY_SEED_DEMO_01",
      paymentMethod: "upi",
      createdAt: now - 10 * 24 * 60 * 60 * 1000,
    });

    // 7. Create Jobs / Opportunities
    await ctx.db.insert("jobs", {
      title: "Digital Content & Copy Specialist",
      slug: "digital-content-copy-specialist",
      shortDescription: "Craft engaging blog posts, newsletter copy, and social summaries for technology brands.",
      description: "We are seeking skilled content specialists to write clear, engaging articles and short-form summaries for our ecosystem partners. You will receive structured briefs and editorial guidance.",
      category: "Content & Writing",
      skills: ["Copywriting", "SEO Basics", "Research", "Editing"],
      requirements: [
        "Completion of Starter Digital Skills program or higher",
        "Strong command of professional English writing",
        "Ability to meet 48-hour turnarounds on initial drafts",
      ],
      requiredProgramId: prog1,
      payment: 3500,
      paymentType: "fixed",
      workType: "remote",
      difficulty: "beginner",
      estimatedDuration: "1 Week",
      deadline: "2026-09-30",
      openings: 5,
      status: "published",
      applicationQuestions: [
        "Briefly describe your writing experience and relevant projects.",
        "Link 1-2 writing samples or your public portfolio.",
        "Confirm your availability for remote communication this month.",
      ],
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("jobs", {
      title: "Video Editor & Reels Creator",
      slug: "video-editor-reels-creator",
      shortDescription: "Edit engaging 30-60 second educational and promotional short-form videos with captions.",
      description: "Looking for a creative video editor with experience in Premiere Pro, Final Cut, or CapCut to format and polish educational clips, add dynamic subtitles, and optimize pacing.",
      category: "Media Production",
      skills: ["Video Editing", "Subtitling", "Audio Polish", "Pacing"],
      requirements: [
        "Enrolled in Growth Professional or higher",
        "Proven experience with short-form vertical video formats",
      ],
      requiredProgramId: prog2,
      payment: 7500,
      paymentType: "milestone",
      workType: "remote",
      difficulty: "intermediate",
      estimatedDuration: "2 Weeks",
      deadline: "2026-10-15",
      openings: 3,
      status: "published",
      applicationQuestions: [
        "What video editing software do you primarily use?",
        "Share a link to your best vertical short-form edit.",
      ],
      createdAt: now,
      updatedAt: now,
    });

    // 8. Create Downloadable Resources
    await ctx.db.insert("resources", {
      title: "Complete Freelance Project Scope & Invoice Kit",
      description: "Standardized contract templates, scope-of-work agreements, and milestone invoice spreadsheets.",
      fileUrl: "https://example.com/freelance-kit.zip",
      fileType: "zip",
      fileSize: "4.8 MB",
      programId: prog1,
      accessType: "enrolled",
      downloadCount: 142,
      sortOrder: 1,
      createdAt: now,
    });

    await ctx.db.insert("resources", {
      title: "Brand Strategy & Visual Guidelines Blueprint",
      description: "Comprehensive PDF guide for client brand audits, typography rules, and color palettes.",
      fileUrl: "https://example.com/brand-blueprint.pdf",
      fileType: "pdf",
      fileSize: "12.4 MB",
      programId: prog2,
      accessType: "enrolled",
      downloadCount: 89,
      sortOrder: 2,
      createdAt: now,
    });

    // 9. Initial Admin Settings
    await ctx.db.insert("adminSettings", {
      key: "general",
      value: {
        brandName: "ZetaGrow",
        tagline: "Learn. Work. Grow.",
        supportEmail: "support@zetagrow.com",
        supportPhone: "+91 (080) 4567-8900",
        primaryColor: "#176B4D",
        maintenanceMode: false,
      },
      updatedAt: now,
    });

    await ctx.db.insert("adminSettings", {
      key: "affiliate",
      value: {
        enabled: true,
        commissionMethod: "lower_program_rule",
        defaultPercentage: 50,
        holdingPeriodDays: 7,
        minimumPurchaseAmount: 2000,
        requireKycForPayout: false,
      },
      updatedAt: now,
    });

    await ctx.db.insert("adminSettings", {
      key: "withdrawals",
      value: {
        minimumWithdrawal: 1000,
        maximumWithdrawal: 100000,
        dailyLimit: 25000,
        monthlyLimit: 200000,
        feePercentage: 2,
        fixedFee: 0,
        allowedMethods: ["bank_transfer", "upi"],
      },
      updatedAt: now,
    });

    // 10. Sample Announcement
    await ctx.db.insert("announcements", {
      title: "New Client Opportunities Added to Work Marketplace",
      content: "Explore new verified contract listings across copywriting, media editing, and web operations now available in your dashboard.",
      targetRole: "all",
      isActive: true,
      priority: "high",
      createdAt: now,
    });

    return {
      message: "Database successfully seeded with Super Admin, Demo User, Programs, Jobs, Achievements, and Settings!",
      adminCredentials: { email: "admin@zetagrow.com", password: "AdminPassword123!" },
      demoCredentials: { email: "demo@zetagrow.com", password: "DemoPassword123!" },
    };
  },
});
