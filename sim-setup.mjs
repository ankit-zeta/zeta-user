import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");

async function check(token, label) {
  const s = await convex.query("auth:getSessionUser", { token });
  console.log(label, JSON.stringify({
    eligible: s.affiliateEligible,
    firstPurchaseAt: s.firstPurchaseAt ? new Date(s.firstPurchaseAt).toISOString() : null,
    unlocksAt: s.affiliateUnlocksAt ? new Date(s.affiliateUnlocksAt).toISOString() : null,
  }));
}

async function run() {
  // Throwaway A — bought 2 hours ago → should be ELIGIBLE
  const a = await convex.action("auth:signup", {
    name: "Sim A", email: `simA${Date.now()}@zeta.in`,
    password: "SimPass123!", formStartedAt: Date.now(), testMode: true,
  });
  const pidA = (await convex.query("users:getAllUsers", { token: a.token }).catch(() => null));
  // Get A's userId from session
  const sa = await convex.query("auth:getSessionUser", { token: a.token });

  // Throwaway B — bought 5 minutes ago → should be NOT eligible
  const b = await convex.action("auth:signup", {
    name: "Sim B", email: `simB${Date.now()}@zeta.in`,
    password: "SimPass123!", formStartedAt: Date.now(), testMode: true,
  });
  const sb = await convex.query("auth:getSessionUser", { token: b.token });

  console.log("A id:", sa._id, "| B id:", sb._id);
}

run();
console.log('EMAILS', sa.email, sb.email);
