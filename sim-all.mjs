import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");

async function makeUser(name) {
  const email = `${name.toLowerCase()}${Date.now()}@zeta.in`;
  const signup = await convex.action("auth:signup", {
    name, email, password: "SimPass123!",
    formStartedAt: Date.now(), testMode: true,
  });
  const session = await convex.query("auth:getSessionUser", { token: signup.token });
  return { userId: session._id, email, token: signup.token };
}

async function eligibleState(token) {
  const s = await convex.query("auth:getSessionUser", { token });
  return {
    eligible: s.affiliateEligible,
    firstPurchaseAt: s.firstPurchaseAt ? new Date(s.firstPurchaseAt).toISOString() : null,
    unlocksAt: s.affiliateUnlocksAt ? new Date(s.affiliateUnlocksAt).toISOString() : null,
  };
}

async function run() {
  // A: purchased 2h ago → must be ELIGIBLE
  const A = await makeUser("SimA");
  await convex.mutation("maintenance:simPurchase", { userId: A.userId, hoursAgo: 2 });

  // B: purchased 5 minutes ago → must NOT be eligible yet
  const B = await makeUser("SimB");
  await convex.mutation("maintenance:simPurchase", { userId: B.userId, hoursAgo: 5 / 60 });

  console.log("A (first purchase 2h ago):   ", JSON.stringify(await eligibleState(A.token)));
  console.log("B (first purchase 5m ago):   ", JSON.stringify(await eligibleState(B.token)));

  // C: no purchase → false
  console.log("Test user (no purchase):     ", JSON.stringify(
    await eligibleState((await convex.action("auth:login", {
      email: "test@zeta.in", password: "test@Zeta123!",
    })).token)));
}

run();