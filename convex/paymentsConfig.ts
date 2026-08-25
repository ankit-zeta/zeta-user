import { query } from "./_generated/server";

// Public Razorpay info for the checkout page. Only the public key id is
// exposed — the key secret never leaves the Convex environment. Lives in the
// default runtime because queries cannot be defined in "use node" files.
export const getRazorpayConfig = query({
  args: {},
  handler: async () => {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    return {
      enabled: Boolean(keyId),
      keyId, // public by design — safe to expose
    };
  },
});
