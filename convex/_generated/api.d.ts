/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as affiliates from "../affiliates.js";
import type * as analytics from "../analytics.js";
import type * as applications from "../applications.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as businessCurriculum from "../businessCurriculum.js";
import type * as businessCurriculumAction from "../businessCurriculumAction.js";
import type * as businessResources from "../businessResources.js";
import type * as businessSetup from "../businessSetup.js";
import type * as certificates from "../certificates.js";
import type * as contact from "../contact.js";
import type * as growthCurriculum from "../growthCurriculum.js";
import type * as growthCurriculumAction from "../growthCurriculumAction.js";
import type * as growthResources from "../growthResources.js";
import type * as growthSetup from "../growthSetup.js";
import type * as jobs from "../jobs.js";
import type * as learning from "../learning.js";
import type * as notifications from "../notifications.js";
import type * as proCurriculum from "../proCurriculum.js";
import type * as proCurriculumAction from "../proCurriculumAction.js";
import type * as proResources from "../proResources.js";
import type * as proSetup from "../proSetup.js";
import type * as programs from "../programs.js";
import type * as referrals from "../referrals.js";
import type * as resources from "../resources.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as starterCurriculum from "../starterCurriculum.js";
import type * as starterCurriculumAction from "../starterCurriculumAction.js";
import type * as starterSetup from "../starterSetup.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";
import type * as withdrawals from "../withdrawals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  affiliates: typeof affiliates;
  analytics: typeof analytics;
  applications: typeof applications;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  businessCurriculum: typeof businessCurriculum;
  businessCurriculumAction: typeof businessCurriculumAction;
  businessResources: typeof businessResources;
  businessSetup: typeof businessSetup;
  certificates: typeof certificates;
  contact: typeof contact;
  growthCurriculum: typeof growthCurriculum;
  growthCurriculumAction: typeof growthCurriculumAction;
  growthResources: typeof growthResources;
  growthSetup: typeof growthSetup;
  jobs: typeof jobs;
  learning: typeof learning;
  notifications: typeof notifications;
  proCurriculum: typeof proCurriculum;
  proCurriculumAction: typeof proCurriculumAction;
  proResources: typeof proResources;
  proSetup: typeof proSetup;
  programs: typeof programs;
  referrals: typeof referrals;
  resources: typeof resources;
  seed: typeof seed;
  settings: typeof settings;
  starterCurriculum: typeof starterCurriculum;
  starterCurriculumAction: typeof starterCurriculumAction;
  starterSetup: typeof starterSetup;
  users: typeof users;
  wallets: typeof wallets;
  withdrawals: typeof withdrawals;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
