import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "cleanup-rate-limits",
  "0 3 * * *",
  internal.rateLimit.cleanupRateLimits,
  {}
);

crons.cron(
  "cleanup-expired-sessions",
  "0 4 * * *",
  internal.auth.cleanupExpiredSessions,
  {}
);

crons.cron(
  "auto-release-commissions",
  "0 * * * *",
  internal.affiliates.autoReleaseCommissions,
  {}
);

crons.cron(
  "onboarding-nudge",
  "30 4 * * *",
  internal.users.sendOnboardingNudges,
  {}
);

// Deletes KYC document images (PAN/Aadhaar) 90 days after approval.
// Staggered at 4:15 AM UTC so it never overlaps the other cleanup jobs.
crons.cron(
  "kyc-image-retention",
  "15 4 * * *",
  internal.kyc.cleanupApprovedKycImages,
  {}
);

// Payment orders stuck in "created" for 24h+ (user never completed, no
// webhook) are marked "expired" so the admin funnel stats stay accurate.
crons.cron(
  "expire-stale-payment-orders",
  "45 4 * * *",
  internal.paymentsData.expireStaleOrders,
  {}
);

export default crons;
