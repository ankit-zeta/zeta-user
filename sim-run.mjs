import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");
const A = process.argv[2];
const B = process.argv[3];

async function check(token, label) {
  const s = await convex.query("auth:getSessionUser", { token });
  console.log(label, JSON.stringify({
    eligible: s.affiliateEligible,
    firstPurchaseAt: s.firstPurchaseAt ? new Date(s.firstPurchaseAt).toISOString() : null,
    unlocksAt: s.affiliateUnlocksAt ? new Date(s.affiliateUnlocksAt).toISOString() : null,
  }));
}

async function run() {
  await convex.mutation("maintenance:simPurchase", { userId: A, hoursAgo: 2 });
  await convex.mutation("maintenance:simPurchase", { userId: B, hoursAgo: 0.083 });

  const la = await convex.action("auth:login", { email: process.argv[4], password: "SimPass123!" });
  await check(la.token, "A (2h ago)   →");

  const lb = await convex.action("auth:login", { email: process.argv[5], password: "SimPass123!" });
  await check(lb.token, "B (5m ago)   →");
}

run();