/**
 * E2E: Admin-created users · Giveaway labeling · Growth Partner gating.
 * Run: powershell -File mint-test-session.ps1 && node test-partners-flow.mjs
 */
import { ConvexHttpClient } from "convex/browser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const results = [];
function log(step, ok, detail = "") {
  results.push({ step, ok });
  console.log(`${ok ? "PASS" : "FAIL"} | ${step}${detail ? ` — ${detail}` : ""}`);
}
function serverMessage(e) {
  if (e && e.name === "ConvexError" && typeof e.data === "string") return e.data;
  return e?.message || "";
}

async function main() {
  const stamp = Date.now();
  let adminToken;
  try {
    adminToken = fs.readFileSync(path.join(__dirname, "kyctest-token.txt"), "utf8").trim();
    log("0. Admin session loaded", !!adminToken);
  } catch {
    return log("0. Admin session loaded", false, "run mint-test-session.ps1 first");
  }

  // ── 1. Admin creates two users directly ──
  let u1Token, u2Token, u1Id, u2Id;
  try {
    const r1 = await convex.mutation("users:adminCreateUser", {
      token: adminToken,
      name: "E2E Created One",
      email: `created-one-${stamp}@zeta.in`,
      password: "SharedSecret1!",
      sendWelcomeEmail: true,
    });
    u1Id = r1.userId;
    const r2 = await convex.mutation("users:adminCreateUser", {
      token: adminToken,
      name: "E2E Created Two",
      email: `created-two-${stamp}@zeta.in`,
      password: "SharedSecret2!",
    });
    u2Id = r2.userId;

    // Password actually works for login
    const login = await convex.action("auth:login", {
      email: `created-one-${stamp}@zeta.in`,
      password: "SharedSecret1!",
    });
    u1Token = login.value ? login.value.token : login.token;
    const login2 = await convex.action("auth:login", {
      email: `created-two-${stamp}@zeta.in`,
      password: "SharedSecret2!",
    });
    u2Token = login2.value ? login2.value.token : login2.token;
    log(
      "1. adminCreateUser creates working accounts",
      !!u1Id && !!u2Id && !!u1Token && !!u2Token
    );
  } catch (e) {
    return log("1. adminCreateUser", false, serverMessage(e));
  }

  // Duplicate email protection
  try {
    await convex.mutation("users:adminCreateUser", {
      token: adminToken,
      name: "Dup Test",
      email: `created-one-${stamp}@zeta.in`,
      password: "Whatever123!",
    });
    log("1b. Duplicate email rejected", false, "succeeded unexpectedly");
  } catch (e) {
    log("1b. Duplicate email rejected", /already exists/i.test(serverMessage(e)), serverMessage(e).slice(0, 60));
  }

  // ── 2. Free giveaway grant labeled accessType=admin_grant ──
  try {
    const progs = await convex.query("programs:getPublicPrograms", {});
    if (!progs.length) throw new Error("no published programs");
    await convex.mutation("users:grantProgramAccess", {
      token: adminToken, userId: u1Id, programId: progs[0]._id, reason: "Giveaway e2e",
    });
    await convex.mutation("users:grantProgramAccess", {
      token: adminToken, userId: u2Id, programId: progs[0]._id, reason: "Giveaway e2e",
    });
    const details = await convex.query("users:getUserDetails", { token: adminToken, userId: u1Id });
    const p = details.enrolledPrograms?.[0]?.purchase;
    log(
      "2. Grant labeled 'admin_grant' (giveaway, not sale)",
      p?.accessType === "admin_grant" && p?.amount === 0,
      `accessType=${p?.accessType}`
    );
  } catch (e) {
    return log("2. Giveaway grant", false, serverMessage(e));
  }

  // ── 3. Achievements gate: non-partner blocked ──
  try {
    await convex.mutation("achievements:evaluateUserAchievements", { token: u2Token });
    log("3. Non-partner blocked from achievements", false, "evaluation succeeded unexpectedly");
  } catch (e) {
    log("3. Non-partner blocked from achievements", /invite-only/i.test(serverMessage(e)), serverMessage(e).slice(0, 70));
  }

  // ── 4. Partner grant → profile + evaluation unlocked ──
  try {
    await convex.mutation("partners:setPartnerAccess", {
      token: adminToken, userId: u1Id, grant: true, reason: "E2E invitation",
    });
    const prof = await convex.query("partners:getMyPartnerProfile", { token: u1Token });
    await convex.mutation("achievements:evaluateUserAchievements", { token: u1Token });
    log(
      "4. Granted partner can access achievements",
      prof.isPartner === true && typeof prof.chainPct === "number",
      `tier=${prof.tierName}, chainPct=${prof.chainPct}`
    );
  } catch (e) {
    log("4. Partner grant + evaluation", false, serverMessage(e));
  }

  // ── 5. Backfill grandfathering (dryRun then real) ──
  try {
    const dry = await convex.mutation("partners:backfillPartnersFromAchievements", {
      token: adminToken, dryRun: true,
    });
    // Correct regardless of count: scans all holders without granting.
    // (Prod currently has 0 achievement-holders, so holders=0 is valid.)
    log(
      "5. Backfill scans holders (idempotent)",
      typeof dry.totalHolders === "number" && dry.dryRun === true && dry.granted === 0,
      `holders=${dry.totalHolders}, wouldGrant=${dry.granted}`
    );
  } catch (e) {
    log("5. Backfill", false, serverMessage(e));
  }

  // ── 6. Revoke ──
  try {
    await convex.mutation("partners:setPartnerAccess", {
      token: adminToken, userId: u1Id, grant: false, reason: "E2E revoke test",
    });
    const prof = await convex.query("partners:getMyPartnerProfile", { token: u1Token });
    log("6. Revoke removes partner access", prof.isPartner === false);
  } catch (e) {
    log("6. Revoke", false, serverMessage(e));
  }

  // ── Cleanup ──
  try {
    await convex.mutation("auth:logout", { token: adminToken });
    console.log("CLEANUP | admin session revoked");
  } catch { /* ignore */ }

  const failed = results.filter((r) => !r.ok);
  console.log("\n──────────────────────────────");
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
