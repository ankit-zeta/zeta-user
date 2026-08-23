import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "cleanup-rate-limits",
  "0 3 * * *",
  internal.rateLimit.cleanupRateLimits,
  {}
);

export default crons;
