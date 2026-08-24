async function testLogin() {
  try {
    console.log("Testing login with fetch...");
    
    // Try different endpoint formats
    const endpoints = [
      "https://terrific-dove-836.convex.cloud/api/auth:login",
      "https://terrific-dove-836.convex.cloud/api/action/auth:login",
      "https://terrific-dove-836.convex.cloud/api/mutation/auth:login",
      "https://terrific-dove-836.convex.cloud/auth:login",
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\nTrying: ${endpoint}`);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@zeta.in",
            password: "test@Zeta123!",
          }),
        });
        
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response:", text || "(empty)");
      } catch (err) {
        console.error("Error:", err.message);
      }
    }
  } catch (err) {
    console.error("Login error:", err);
  }
}

testLogin();