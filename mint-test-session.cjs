// One-off: mint a short-lived admin session for E2E testing via Convex CLI.
const { execSync } = require("child_process");
const fs = require("fs");

const ADMIN_ID = "mn72pzw7xwahq4cdyxk9xbx5g18cyktp"; // Super Admin (from auth:getUserForLogin)
const now = Date.now();
const token = "e2e-kyc-admin-" + now;
const json = JSON.stringify({
  userId: ADMIN_ID,
  token,
  role: "super_admin",
  expiresAt: now + 2 * 60 * 60 * 1000,
  createdAt: now,
});

try {
  const out = execSync(`npx convex run auth:createSession "${json}"`, {
    encoding: "utf8",
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  console.log("SESSION CREATED:", out.trim());
} catch (e) {
  console.log("ERROR:", (e.stderr && e.stderr.toString()) || e.message);
  process.exit(1);
}
fs.writeFileSync(__dirname + "/kyctest-token.txt", token);
console.log("TOKEN_SAVED");
