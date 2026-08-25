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

export default crons;
