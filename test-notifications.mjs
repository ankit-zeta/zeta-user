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
    
    // Now test the notifications query with the token
    console.log("\nTesting notifications query...");
    const notifsResult = await convex.query("notifications:getUserNotifications", {
      token: result.token
    });
    console.log("Notifications result:", notifsResult);
  } catch (err) {
    console.error("Error:", err);
    if (err.data) console.error("Error data:", err.data);
  }
}

testLogin();