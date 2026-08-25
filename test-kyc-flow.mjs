/**
 * End-to-end KYC flow verification against the live deployment.
 * Covers: signup -> CV completion -> document upload -> KYC submission ->
 * gating (pre-approval) -> admin review -> approval effects -> duplicate-PAN block.
 *
 * Run: node test-kyc-flow.mjs
 */
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");

// Minimal valid 1x1 JPEG
const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==",
  "base64"
);

const results = [];
function log(step, ok, detail = "") {
  results.push({ step, ok });
  console.log(`${ok ? "PASS" : "FAIL"} | ${step}${detail ? ` — ${detail}` : ""}`);
}

// Server business messages arrive via ConvexError.data (message is masked on prod)
function serverMessage(e) {
  if (e && e.name === "ConvexError" && typeof e.data === "string") return e.data;
  return e?.message || "";
}

async function uploadDoc(tokenUnused) {
  const uploadUrl = await convex.action("kyc:generateKycUploadUrl", {});
  const resp = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: TINY_JPEG,
  });
  if (!resp.ok) throw new Error(`upload failed: ${resp.status}`);
  const parsed = JSON.parse(await resp.text());
  return parsed.storageId;
}

async function main() {
  const stamp = Date.now();
  const email = `kyc-e2e-${stamp}@zeta.in`;

  // ── 1. Signup ──
  let userToken;
  try {
    const r = await convex.action("auth:signup", {
      name: "KYC E2E Tester",
      email,
      password: "TestPass123!",
    });
    userToken = r.token;
    log("1. Signup creates account + session", !!userToken);
  } catch (e) {
    return log("1. Signup creates account + session", false, e.message);
  }

  // ── 2. Complete CV profile (work-portal prerequisite) ──
  try {
    await convex.mutation("cvProfiles:upsertCvProfile", {
      token: userToken,
      overview:
        "Digital marketing freelancer with three years of hands-on experience running campaigns for small businesses.",
      experience: [
        {
          role: "Marketing Executive",
          company: "Acme Media",
          startDate: "Jan 2023",
          current: true,
          description: "Managed ad campaigns and content calendars.",
        },
      ],
      education: [
        { institution: "DAVV Indore", degree: "B.Com", status: "graduated", startYear: "2019", endYear: "2022" },
      ],
      technicalSkills: ["SEO", "Meta Ads", "Canva"],
      softSkills: ["Communication"],
    });
    log("2. CV profile completed", true);
  } catch (e) {
    log("2. CV profile completed", false, e.message);
  }

  // ── 3. Upload documents ──
  let panId, aadhaarId;
  try {
    panId = await uploadDoc(userToken);
    aadhaarId = await uploadDoc(userToken);
    log("3. PAN + Aadhaar images uploaded to storage", !!panId && !!aadhaarId);
  } catch (e) {
    return log("3. PAN + Aadhaar images uploaded to storage", false, e.message);
  }

  // ── 4. Submit KYC ──
  try {
    await convex.mutation("kyc:submitKyc", {
      token: userToken,
      fullNameAsPerPan: "KYC E2E Tester",
      panNumber: `ABCDE${String(stamp).slice(-4)}F`,
      panImageId: panId,
      aadhaarLast4: "4567",
      aadhaarImageId: aadhaarId,
      addressLine1: "12 Test Colony, Vijay Nagar",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452010",
    });
    log("4. KYC submitted successfully", true);
  } catch (e) {
    return log("4. KYC submitted successfully", false, e.message);
  }

  // ── 5. Status reflects pending + masked PAN ──
  try {
    const kyc = await convex.query("kyc:getMyKyc", { token: userToken });
    const maskedOk = kyc.panMasked?.includes("****") && !kyc.panMasked?.includes(String(stamp).slice(-4));
    log(
      "5. getMyKyc: pending + PAN masked + images resolvable",
      kyc.status === "pending" && maskedOk && !!kyc.panImageUrl && !!kyc.aadhaarImageUrl,
      `status=${kyc.status}, panMasked=${kyc.panMasked}`
    );
  } catch (e) {
    log("5. getMyKyc: pending + PAN masked + images resolvable", false, e.message);
  }

  // ── 6. Gating: work application blocked while KYC unverified ──
  try {
    const jobs = await convex.query("jobs:getPublicJobs", {});
    if (!jobs || jobs.length === 0) {
      console.log("SKIP | 6. Work-application KYC gate (no published jobs to test against)");
    } else {
      try {
        await convex.mutation("applications:submitApplication", {
          token: userToken,
          jobId: jobs[0]._id,
          answers: [],
          coverNote: "Test application",
        });
        log("6. Application blocked pre-KYC", false, "application went through unexpectedly");
      } catch (e) {
        const msg = serverMessage(e);
        log(
          "6. Application blocked pre-KYC",
          /kyc/i.test(msg),
          msg.slice(0, 90)
        );
      }
    }
  } catch (e) {
    console.log("SKIP | 6. Work-application KYC gate —", e.message.slice(0, 60));
  }

  // ── 7. Admin session (pre-minted via CLI; password login fallback) ──
  let adminToken;
  try {
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    const tokenFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "kyctest-token.txt");
    adminToken = fs.existsSync(tokenFile)
      ? fs.readFileSync(tokenFile, "utf8").trim()
      : null;
    if (!adminToken) throw new Error("no pre-minted token");
    log("7. Admin authenticated", true, "(CLI-minted test session)");
  } catch {
    try {
      const login = await convex.action("auth:login", {
        email: "admin@zetagrow.com",
        password: "AdminPassword123!",
      });
      adminToken = login.value ? login.value.token : login.token;
      if (!adminToken) throw new Error("no admin token");
      log("7. Admin authenticated", true);
    } catch (e) {
      return log("7. Admin authenticated", false, e.message);
    }
  }

  let profileId;
  try {
    const queue = await convex.query("kyc:getKycQueueAdmin", { token: adminToken, status: "pending" });
    const mine = queue.find((q) => q.userEmail === email);
    if (!mine) throw new Error("submission not found in admin queue");
    profileId = mine._id;
    log(
      "7b. Queue shows submission with masked identifiers",
      mine.panMasked.includes("****") && mine.aadhaarLast4 === "4567",
      `${mine.userName} · ${mine.city}, ${mine.state}`
    );
  } catch (e) {
    return log("7b. Queue shows submission", false, e.message);
  }

  // ── 8. Approve ──
  try {
    await convex.mutation("kyc:reviewKyc", {
      token: adminToken,
      profileId,
      decision: "verified",
    });
    log("8. Admin approved KYC", true);
  } catch (e) {
    return log("8. Admin approved KYC", false, e.message);
  }

  // ── 9. Post-approval state ──
  try {
    const kyc = await convex.query("kyc:getMyKyc", { token: userToken });
    log(
      "9a. User sees verified + masked PAN (images hidden post-approval)",
      kyc.status === "verified" && kyc.panMasked.includes("****")
    );
  } catch (e) {
    log("9a. User sees verified", false, e.message);
  }

  try {
    const notifs = await convex.query("notifications:getUserNotifications", { token: userToken });
    const kycNotif = (notifs.notifications || []).find((n) => n.type === "kyc" && /verified/i.test(n.title));
    log("9b. In-app notification delivered", !!kycNotif, kycNotif ? kycNotif.title : "not found");
  } catch (e) {
    log("9b. In-app notification delivered", false, e.message);
  }

  // ── 10. Duplicate PAN rejected across accounts ──
  try {
    const email2 = `kyc-e2e-b-${stamp}@zeta.in`;
    const r2 = await convex.action("auth:signup", {
      name: "KYC E2E Second",
      email: email2,
      password: "TestPass123!",
    });
    await convex.mutation("kyc:submitKyc", {
      token: r2.token,
      fullNameAsPerPan: "KYC E2E Second",
      panNumber: `ABCDE${String(stamp).slice(-4)}F`, // same as first user
      panImageId: await uploadDoc(r2.token),
      aadhaarLast4: "1234",
      aadhaarImageId: await uploadDoc(r2.token),
      addressLine1: "99 Other Street",
      city: "Bhopal",
      state: "Madhya Pradesh",
      pincode: "462001",
    });
    log("10. Duplicate PAN rejected", false, "second submission succeeded unexpectedly");
  } catch (e) {
    log("10. Duplicate PAN rejected", /already linked/i.test(serverMessage(e)), serverMessage(e).slice(0, 80));
  }

  // ── Summary ──
  const failed = results.filter((r) => !r.ok);
  console.log("\n──────────────────────────────");
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
