import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");

async function check() {
  const login = await convex.action("auth:login", {
    email: "test@zeta.in",
    password: "test@Zeta123!",
  });
  const session = await convex.query("auth:getSessionUser", { token: login.token });

  console.log(JSON.stringify({
    email: session.email,
    enrolledProgramIds: session.enrolledProgramIds,
    firstPurchaseAt: session.firstPurchaseAt,
    affiliateUnlocksAt: session.affiliateUnlocksAt,
    affiliateEligible: session.affiliateEligible,
  }, null, 2));
}

check();