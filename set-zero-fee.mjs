// One-off: switch payouts to zero-fee (feePercentage 0, fixedFee 0, maxFee 0),
// preserving all other withdrawal limits. Verifies + revokes admin session.
import { ConvexHttpClient } from "convex/browser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const c = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const token = fs.readFileSync(path.join(__dirname, "kyctest-token.txt"), "utf8").trim();

const current = await c.query("settings:getSetting", { key: "withdrawals" });
console.log("BEFORE:", JSON.stringify(current));

await c.mutation("settings:updateSetting", {
  token,
  key: "withdrawals",
  value: {
    ...current,
    feePercentage: 0,
    fixedFee: 0,
    maxFee: 0,
    allowedMethods: current.allowedMethods || ["bank_transfer", "upi"],
  },
  reason: "Zero processing fee policy (admin decision)",
});

const after = await c.query("settings:getSetting", { key: "withdrawals" });
console.log("AFTER:", JSON.stringify(after));

await c.mutation("auth:logout", { token });
fs.rmSync(path.join(__dirname, "kyctest-token.txt"));
console.log("DONE · admin session revoked");
