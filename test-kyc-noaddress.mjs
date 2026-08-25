/**
 * Verifies submitKyc succeeds WITHOUT any address fields
 * (post schema-change contract) against the live deployment.
 *
 * Run: node test-kyc-noaddress.mjs
 */
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");

const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==",
  "base64"
);

function serverMessage(e) {
  if (e && e.name === "ConvexError" && typeof e.data === "string") return e.data;
  return e?.message || "";
}

async function uploadDoc() {
  const uploadUrl = await convex.action("kyc:generateKycUploadUrl", {});
  const resp = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: TINY_JPEG,
  });
  if (!resp.ok) throw new Error(`upload failed: ${resp.status}`);
  return JSON.parse(await resp.text()).storageId;
}

async function main() {
  const stamp = Date.now();
  const email = `kyc-noaddr-${stamp}@zeta.in`;
  let ok = true;

  // 1. Signup
  const r = await convex.action("auth:signup", {
    name: "KYC NoAddr Test",
    email,
    password: "TestPass123!",
  });
  console.log(`PASS | signup ${email}`);

  // 2. Submit KYC with NO address fields at all
  try {
    await convex.mutation("kyc:submitKyc", {
      token: r.token,
      fullNameAsPerPan: "KYC NoAddr Test",
      panNumber: `ABCDE${String(stamp).slice(-4)}F`,
      panImageId: await uploadDoc(),
      aadhaarLast4: "9876",
      aadhaarImageId: await uploadDoc(),
    });
    console.log("PASS | submitKyc accepted WITHOUT address fields");
  } catch (e) {
    ok = false;
    console.log(`FAIL | submitKyc without address — ${serverMessage(e)}`);
  }

  // 3. Stored profile: pending, no address data
  try {
    const kyc = await convex.query("kyc:getMyKyc", { token: r.token });
    const noAddress =
      !kyc.profile?.city && !kyc.profile?.state && !kyc.profile?.pincode;
    const pass = kyc.status === "pending" && noAddress;
    if (!pass) ok = false;
    console.log(
      `${pass ? "PASS" : "FAIL"} | profile pending + address empty — status=${kyc.status}, city=${kyc.profile?.city}`
    );
  } catch (e) {
    ok = false;
    console.log(`FAIL | getMyKyc — ${serverMessage(e)}`);
  }

  console.log(ok ? "\nALL CHECKS PASSED" : "\nCHECKS FAILED");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error("Fatal:", serverMessage(e));
  process.exit(1);
});
