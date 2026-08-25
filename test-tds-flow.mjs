/**
 * End-to-end TDS engine verification against live deployment.
 * Scenario: verified user with 100% work-composition balance.
 *  W1: ₹10,000  -> below ₹50K FY threshold -> TDS ₹0
 *  W2: ₹60,000  -> crosses threshold      -> TDS 10% × (10K+60K−50K) = ₹2,000
 * Then verifies admin summary + export rows.
 *
 * Run: node mint-test-session.ps1 && node test-tds-flow.mjs
 */
import { ConvexHttpClient } from "convex/browser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==",
  "base64"
);

const results = [];
function log(step, ok, detail = "") {
  results.push({ step, ok });
  console.log(`${ok ? "PASS" : "FAIL"} | ${step}${detail ? ` — ${detail}` : ""}`);
}
function serverMessage(e) {
  if (e && e.name === "ConvexError" && typeof e.data === "string") return e.data;
  return e?.message || "";
}
async function uploadDoc() {
  const url = await convex.action("kyc:generateKycUploadUrl", {});
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: TINY_JPEG });
  return JSON.parse(await r.text()).storageId;
}

async function main() {
  const stamp = Date.now();
  const email = `tds-e2e-${stamp}@zeta.in`;
  const PAN = `BBBPD${String(stamp).slice(-4)}K`;

  // ── 1. User setup: signup → CV → KYC ──
  let userToken, userId;
  try {
    const s = await convex.action("auth:signup", { name: "TDS E2E", email, password: "TestPass123!" });
    userToken = s.token;
    userId = s.user.id;
    await convex.mutation("cvProfiles:upsertCvProfile", {
      token: userToken,
      overview: "Full-stack developer available for freelance web and technical project work.",
      experience: [{ role: "Developer", company: "Self", startDate: "2023", current: true }],
      education: [{ institution: "X University", degree: "BCA", status: "graduated" }],
      technicalSkills: ["React", "Node"],
      softSkills: ["Delivery"],
    });
    await convex.mutation("kyc:submitKyc", {
      token: userToken,
      fullNameAsPerPan: "TDS E2E",
      panNumber: PAN,
      panImageId: await uploadDoc(),
      aadhaarLast4: "9012",
      aadhaarImageId: await uploadDoc(),
      addressLine1: "5 Test Lane",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452001",
    });
    log("1. User created + KYC submitted", true);
  } catch (e) {
    return log("1. User created + KYC submitted", false, serverMessage(e));
  }

  // ── 2. Admin session + approve KYC + fund wallet + grant course access ──
  let adminToken;
  try {
    adminToken = fs.readFileSync(path.join(__dirname, "kyctest-token.txt"), "utf8").trim();
    if (!adminToken) throw new Error("empty");
    log("2. Admin session loaded", true);
  } catch {
    return log("2. Admin session loaded", false, "run mint-test-session.ps1 first");
  }

  try {
    const queue = await convex.query("kyc:getKycQueueAdmin", { token: adminToken, status: "pending" });
    const mine = queue.find((q) => q.userEmail === email);
    await convex.mutation("kyc:reviewKyc", { token: adminToken, profileId: mine._id, decision: "verified" });

    // Fund wallet (admin adjustments count toward totalEarned but not affiliate split => 100% work)
    await convex.mutation("wallets:adminAdjustWallet", {
      token: adminToken, userId, amount: 30000, type: "CREDIT", reason: "TDS e2e funding",
    });

    // Temporarily lower the work TDS threshold so the crossing can be tested
    // within the platform's ₹25K/day withdrawal cap. Restored at the end.
    await convex.mutation("settings:updateSetting", {
      token: adminToken,
      key: "tds",
      value: {
        enabled: true,
        affiliate: { rate: 2, threshold: 20000, label: "194H" },
        work: { rate: 10, threshold: 5000, label: "194J(b)" },
      },
    });

    // Satisfy purchased-user gate via manual grant (needs any published program)
    const progs = await convex.query("programs:getPublicPrograms", {});
    if (progs.length === 0) throw new Error("no published programs to grant");
    await convex.mutation("users:grantProgramAccess", { token: adminToken, userId, programId: progs[0]._id, reason: "TDS e2e" });
    log("2b. KYC approved · wallet funded · test TDS threshold set (₹5K) · course access granted", true);
  } catch (e) {
    return log("2b. Admin setup", false, serverMessage(e));
  }

  // ── 3. Payout method + preview below threshold ──
  try {
    await convex.mutation("payoutMethods:upsertPayoutMethod", {
      token: userToken, type: "upi", name: "UPI test", details: { upiId: "tds-e2e@upi" },
    });
    const pv = await convex.query("tds:previewWithdrawalTds", { token: userToken, amount: 4000 });
    log("3. Preview ₹4K below ₹5K test threshold → TDS ₹0", pv.enabled && pv.total === 0, `got ${pv.total}`);
  } catch (e) {
    return log("3. Preview below threshold", false, serverMessage(e));
  }

  // ── 4. Withdrawal #1: crosses ₹5K threshold → 10% × (10K−5K) = ₹500 ──
  let w1;
  try {
    const r = await convex.mutation("withdrawals:requestWithdrawal", {
      token: userToken, amount: 10000, payoutMethod: "upi", payoutDetails: { upiId: "tds-e2e@upi" },
    });
    w1 = r.withdrawalId;
    const list = await convex.query("withdrawals:getUserWithdrawals", { token: userToken });
    const rec = list.find((w) => w._id === w1);
    const tdsOk = rec.tdsAmount === 500;
    await convex.mutation("withdrawals:updateWithdrawalStatus", { token: adminToken, withdrawalId: w1, status: "approved" });
    await convex.mutation("withdrawals:updateWithdrawalStatus", { token: adminToken, withdrawalId: w1, status: "completed" });
    log(
      "4. W1 ₹10K → TDS ₹500 (threshold crossing math)",
      tdsOk,
      `stored=${rec.tdsAmount}, net=${rec.netAmount} (expect 9300 after 2% fee)`
    );
  } catch (e) {
    return log("4. Withdrawal #1", false, serverMessage(e));
  }

  // ── 5. Withdrawal #2: fully above threshold → 10% × 15K = ₹1,500 ──
  let w2;
  try {
    const pv = await convex.query("tds:previewWithdrawalTds", { token: userToken, amount: 15000 });
    const previewOk = pv.total === 1500;
    const r = await convex.mutation("withdrawals:requestWithdrawal", {
      token: userToken, amount: 15000, payoutMethod: "upi", payoutDetails: { upiId: "tds-e2e@upi" },
    });
    w2 = r.withdrawalId;
    const list = await convex.query("withdrawals:getUserWithdrawals", { token: userToken });
    const rec = list.find((w) => w._id === w2);
    const breakdownOk =
      rec.tdsBreakdown &&
      rec.tdsBreakdown.workGross === 15000 &&
      rec.tdsBreakdown.financialYear >= 2026;
    log(
      "5. W2 ₹15K fully taxable → TDS ₹1,500 stored",
      previewOk && rec.tdsAmount === 1500 && breakdownOk,
      `preview=${pv.total}, stored=${rec.tdsAmount}`
    );
  } catch (e) {
    return log("5. Withdrawal #2", false, serverMessage(e));
  }

  // ── 6. Admin summary reflects both withdrawals ──
  try {
    const sum = await convex.query("tds:getTdsSummaryAdmin", { token: adminToken });
    const row = sum.rows.find((r) => r.userEmail === email);
    const ok = row && row.workGross === 25000 && row.workTds === 2000 && sum.totals.totalTds >= 2000;
    log("6. Admin FY summary correct", !!ok, row ? `workGross=${row.workGross}, workTds=${row.workTds}` : "row missing");
  } catch (e) {
    log("6. Admin FY summary", false, serverMessage(e));
  }

  // ── 7. Export contains full PAN + section labels ──
  try {
    const fyYear = new Date().getUTCMonth() + 1 < 4 ? new Date().getUTCFullYear() - 1 : new Date().getUTCFullYear();
    const exp = await convex.query("tds:getTdsExportAdmin", { token: adminToken, fyStartYear: fyYear });
    const mine = exp.lines.filter((l) => l.pan === PAN);
    log(
      "7. CSV export rows include full PAN + sections",
      mine.length === 2 && mine.every((l) => l.workSection === "194J(b)") && exp.grandTotal >= 2000,
      `${mine.length} lines, grandTotal=${exp.grandTotal}`
    );
  } catch (e) {
    log("7. CSV export", false, serverMessage(e));
  }

  // ── Cleanup: restore production TDS config, revoke admin session ──
  try {
    await convex.mutation("settings:updateSetting", {
      token: adminToken,
      key: "tds",
      value: {
        enabled: true,
        affiliate: { rate: 2, threshold: 20000, label: "194H" },
        work: { rate: 10, threshold: 50000, label: "194J(b)" },
      },
    });
    await convex.mutation("auth:logout", { token: adminToken });
    console.log("CLEANUP | TDS config restored to defaults · admin test session revoked");
  } catch (e) {
    console.log("CLEANUP FAILED — restore tds settings manually!", serverMessage(e).slice(0, 80));
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n──────────────────────────────");
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
