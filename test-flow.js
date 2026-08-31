const { ConvexHttpClient } = require('convex/browser');
const client = new ConvexHttpClient('https://terrific-dove-836.convex.cloud');

async function main() {
  try {
    // Test signup
    console.log("Testing signup...");
    const testEmail = "testaffiliate" + Date.now() + "@example.com";
const testPassword = "Password123!";
    
    // Test signup
    console.log("Testing signup...");
    const signupResult = await client.mutation('auth:signup', {
      name: "Test Affiliate",
      email: testEmail,
      password: testPassword,
      referralCode: ""
    });
    console.log("Signup result:", signupResult);
    
    // Test login
    console.log("\nTesting login...");
    const loginResult = await client.mutation('auth:login', {
      email: testEmail,
      password: testPassword
    });
    console.log("Login result:", loginResult);
    
    const token = loginResult.token;
    console.log("\nToken:", token);
    
    // Test getting plans
    console.log("\nGetting plans...");
    const plans = await client.query('plans:getPublicPlans');
    console.log("Plans:", JSON.stringify(plans, null, 2).substring(0, 500));
    
    // Test affiliate stats
    console.log("\nGetting affiliate stats...");
    const stats = await client.query('affiliates:getUserAffiliateStats', { token });
    console.log("Affiliate stats:", JSON.stringify(stats, null, 2));
    
    // Test wallet
    console.log("\nGetting wallet...");
    const wallet = await client.query('wallets:getUserWallet', { token });
    console.log("Wallet:", JSON.stringify(wallet, null, 2));
    
    // Test creating a checkout order
    if (plans && plans.length > 0) {
      console.log("\nCreating Razorpay order...");
      const plan = plans[0];
      const order = await client.action('payments:createRazorpayOrder', { 
        token, 
        planId: plan._id 
      });
      console.log("Order:", order);
    }
    
    console.log("\n✅ All tests passed!");
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
}

main();