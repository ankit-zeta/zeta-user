import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");

async function testSignup() {
  try {
    const result = await convex.action("auth:signup", {
      name: "Test User",
      email: "newtest@zeta.in",
      password: "TestPass123!",
      formStartedAt: Date.now(),
      testMode: true,
    });
    console.log("Signup result:", result);
  } catch (err) {
    console.error("Signup error:", err);
  }
}

async function testLogin() {
  try {
    const result = await convex.action("auth:login", {
      email: "test@zeta.in",
      password: "test@Zeta123!",
    });
    console.log("Login result:", result);
  } catch (err) {
    console.error("Login error:", err);
  }
}

testSignup().then(() => testLogin());