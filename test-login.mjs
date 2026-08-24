import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://terrific-dove-836.convex.cloud");

async function testLogin() {
  try {
    console.log("Testing login...");
    const result = await convex.action("auth:login", {
      email: "test@zeta.in",
      password: "test@Zeta123!",
    });
    console.log("Login result:", result);
  } catch (err) {
    console.error("Login error:", err);
    if (err.response) {
      console.error("Response:", err.response);
    }
  }
}

testLogin();