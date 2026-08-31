import { internalMutation } from "./_generated/server";

// Seed content scaffolding: positions, achievements, sample jobs,
// initial admin settings and an announcement.
// NOTE: Courses/plans are managed via Admin Panel; no user accounts are created here.
// SECURITY: This is an internalMutation — only callable from server-side code,
// never from any client. Prevents unauthenticated database seeding.

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const summary: Record<string, any> = {};

    // 1. Positions
    if ((await ctx.db.query("positions").collect()).length === 0) {
      await ctx.db.insert("positions", { name: "Associate Specialist", description: "Entry-level qualified digital contributor.", badgeColor: "#176B4D", sortOrder: 1, createdAt: now });
      await ctx.db.insert("positions", { name: "Growth Lead", description: "Proven track record in client projects and referral operations.", badgeColor: "#15803D", sortOrder: 2, createdAt: now });
      await ctx.db.insert("positions", { name: "Senior Project Manager", description: "Team leadership and high-ticket project matchmaking priority.", badgeColor: "#B45309", sortOrder: 3, createdAt: now });
      summary.positions = "created";
    } else summary.positions = "already present";

    // 2. Affiliate tier achievements (chain % wired via adminSettings.chainLevels)
    if ((await ctx.db.query("achievements").collect()).length === 0) {
      const posId = async (name: string) => ((await ctx.db.query("positions").collect()) as any[]).find((p) => p.name === name)?._id;
      const tiers = [
        { name: "Referral Partner I", slug: "referral-partner-i", desc: "Generate ₹1,00,000 verified referral sales with 20+ registered referrals. Unlocks Level-1 chain commission (5%).", conds: [{ metric: "valid_referrals", operator: ">=", value: 20 }, { metric: "total_sales_amount", operator: ">=", value: 100000 }], pos: "Associate Specialist", order: 1 },
        { name: "Referral Partner II", slug: "referral-partner-ii", desc: "Generate ₹3,00,000 verified referral sales with 30+ registered referrals. Upgrades chain commission to Level 2 (10%).", conds: [{ metric: "valid_referrals", operator: ">=", value: 30 }, { metric: "total_sales_amount", operator: ">=", value: 300000 }], pos: "Growth Lead", order: 2 },
        { name: "Referral Partner III", slug: "referral-partner-iii", desc: "Generate ₹10,00,000 verified referral sales with 50+ registered referrals. Maximum chain commission Level 3 (20%).", conds: [{ metric: "valid_referrals", operator: ">=", value: 50 }, { metric: "total_sales_amount", operator: ">=", value: 1000000 }], pos: "Senior Project Manager", order: 3 },
      ];
      for (const t of tiers) {
        await ctx.db.insert("achievements", {
          name: t.name, slug: t.slug, description: t.desc,
          icon: "trending-up", status: "active", sortOrder: t.order,
          conditionMode: "ALL", conditions: t.conds,
          unlockPositionId: await posId(t.pos),
          unlockBadgeName: t.name,
          notificationText: `You unlocked ${t.name}!`,
          createdAt: now, updatedAt: now,
        });
      }
      summary.achievements = "created";
    } else summary.achievements = "already present";
    // 3. Sample Jobs (prerequisites mapped to current course slugs)
    if ((await ctx.db.query("jobs").collect()).length === 0) {
      const bySlug = async (slug: string) =>
        (await ctx.db.query("programs").withIndex("by_slug", (q) => q.eq("slug", slug)).first()) as any;

      const contentCourse = await bySlug("content-marketing-basics");
      const smmCourse = await bySlug("social-media-marketing-systems");

      await ctx.db.insert("jobs", {
        title: "Digital Content & Copy Specialist",
        slug: "digital-content-copy-specialist",
        shortDescription: "Craft engaging blog posts, newsletter copy, and social summaries for technology brands.",
        description: "We are seeking skilled content specialists to write clear, engaging articles and short-form summaries for our ecosystem partners. You will receive structured briefs and editorial guidance.",
        category: "Content & Writing",
        skills: ["Copywriting", "SEO Basics", "Research", "Editing"],
        requirements: [
          "Completion of Content Marketing Basics or higher",
          "Strong command of professional English writing",
          "Ability to meet 48-hour turnarounds on initial drafts",
        ],
        requiredProgramId: contentCourse?._id,
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
          "Completed Social Media Marketing Systems course or higher",
          "Proven experience with short-form vertical video formats",
        ],
        requiredProgramId: smmCourse?._id,
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
      summary.jobs = "created";
    } else summary.jobs = "already present";

    // 4. Initial Admin Settings
    if ((await ctx.db.query("adminSettings").collect()).length === 0) {
      await ctx.db.insert("adminSettings", { key: "general", value: {
        brandName: "ZetaGrow", tagline: "Learn. Work. Grow.",
        supportEmail: "hey@zetagrow.in", supportPhone: "+91 72340 51567",
        primaryColor: "#176B4D", maintenanceMode: false,
      }, updatedAt: now });
      await ctx.db.insert("adminSettings", { key: "affiliate", value: {
        enabled: true, commissionMethod: "lower_program_rule", defaultPercentage: 50,
        holdingPeriodDays: 7, minimumPurchaseAmount: 2000, requireKycForPayout: false,
      }, updatedAt: now });
      await ctx.db.insert("adminSettings", { key: "withdrawals", value: {
        minimumWithdrawal: 1000, maximumWithdrawal: 100000, dailyLimit: 25000,
        monthlyLimit: 200000, feePercentage: 2, fixedFee: 0,
        allowedMethods: ["bank_transfer", "upi"],
      }, updatedAt: now });
      summary.settings = "created";
    } else summary.settings = "already present";

    // 5. Sample Announcement
    if ((await ctx.db.query("announcements").collect()).length === 0) {
      await ctx.db.insert("announcements", {
        title: "New Client Opportunities Added to Work Marketplace",
        content: "Explore new verified contract listings across copywriting, media editing, and web operations now available in your dashboard.",
        targetRole: "all", isActive: true, priority: "high", createdAt: now,
      });
      summary.announcement = "created";
    } else summary.announcement = "already present";

    return { message: "Seed complete (content scaffolding only). Courses & plans are managed from the Admin Panel.", summary };
  },
});
