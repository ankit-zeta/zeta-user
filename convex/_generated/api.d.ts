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
import type * as analyticsAdmin from "../analyticsAdmin.js";
import type * as applications from "../applications.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as certificates from "../certificates.js";
import type * as contact from "../contact.js";
import type * as cookieConsent from "../cookieConsent.js";
import type * as crons from "../crons.js";
import type * as cvProfiles from "../cvProfiles.js";
import type * as email from "../email.js";
import type * as entitlements from "../entitlements.js";
import type * as expensesAdmin from "../expensesAdmin.js";
import type * as gate from "../gate.js";
import type * as gateActions from "../gateActions.js";
import type * as gateAdmin from "../gateAdmin.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as kyc from "../kyc.js";
import type * as learning from "../learning.js";
import type * as maintenance from "../maintenance.js";
import type * as notifications from "../notifications.js";
import type * as partners from "../partners.js";
import type * as payments from "../payments.js";
import type * as paymentsAdmin from "../paymentsAdmin.js";
import type * as paymentsConfig from "../paymentsConfig.js";
import type * as paymentsData from "../paymentsData.js";
import type * as payoutMethods from "../payoutMethods.js";
import type * as plans from "../plans.js";
import type * as positions from "../positions.js";
import type * as programs from "../programs.js";
import type * as rateLimit from "../rateLimit.js";
import type * as referrals from "../referrals.js";
import type * as resources from "../resources.js";
import type * as seedJobs from "../seedJobs.js";
import type * as settings from "../settings.js";
import type * as supportTickets from "../supportTickets.js";
import type * as tds from "../tds.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";
import type * as withdrawals from "../withdrawals.js";
import type * as workPortal from "../workPortal.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  affiliates: typeof affiliates;
  analytics: typeof analytics;
  analyticsAdmin: typeof analyticsAdmin;
  applications: typeof applications;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  certificates: typeof certificates;
  contact: typeof contact;
  cookieConsent: typeof cookieConsent;
  crons: typeof crons;
  cvProfiles: typeof cvProfiles;
  email: typeof email;
  entitlements: typeof entitlements;
  expensesAdmin: typeof expensesAdmin;
  gate: typeof gate;
  gateActions: typeof gateActions;
  gateAdmin: typeof gateAdmin;
  http: typeof http;
  jobs: typeof jobs;
  kyc: typeof kyc;
  learning: typeof learning;
  maintenance: typeof maintenance;
  notifications: typeof notifications;
  partners: typeof partners;
  payments: typeof payments;
  paymentsAdmin: typeof paymentsAdmin;
  paymentsConfig: typeof paymentsConfig;
  paymentsData: typeof paymentsData;
  payoutMethods: typeof payoutMethods;
  plans: typeof plans;
  positions: typeof positions;
  programs: typeof programs;
  rateLimit: typeof rateLimit;
  referrals: typeof referrals;
  resources: typeof resources;
  seedJobs: typeof seedJobs;
  settings: typeof settings;
  supportTickets: typeof supportTickets;
  tds: typeof tds;
  users: typeof users;
  wallets: typeof wallets;
  withdrawals: typeof withdrawals;
  workPortal: typeof workPortal;
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
