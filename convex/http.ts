import { httpAction } from "./_generated/server";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";

// Razorpay webhook receiver — the server-side source of truth for payments.
//
// Why: if a user pays but closes the browser tab before the client-side
// verification runs, the webhook still tells us the money was captured and
// the order is marked "paid" in the funnel. The checkout page then offers a
// one-click "complete activation" for paid-but-unenrolled orders.
//
// Security:
//   - The raw request body is HMAC-SHA256 verified against
//     RAZORPAY_WEBHOOK_SECRET (set via `npx convex env set`) using a
//     constant-time compare. Forged or tampered payloads are rejected 401.
//   - The stored order amount must equal the webhook amount before marking
//     paid — catches amount-mismatch edge cases.
//   - All state transitions are idempotent (paid/consumed orders are never
//     overwritten; cancelled orders ARE upgraded if money was captured).
//   - Nothing from the payload is logged — no PII leaves the handler.
//
// Note: http.ts runs in the default Convex runtime (no "use node"), so the
// HMAC uses the Web Crypto API instead of node:crypto.

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time hex comparison (no early exit on mismatch).
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleRazorpayWebhook(ctx: any, request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return jsonResponse({ error: "Webhook not configured" }, 500);
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return jsonResponse({ error: "Missing signature" }, 400);
  }

  // Verify against the RAW body — parsing before verification would break
  // the HMAC and serialisation differences could open tampering gaps.
  const rawBody = await request.text();
  const expected = await hmacSha256Hex(secret, rawBody);
  if (!timingSafeEqualHex(expected, signature)) {
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const eventName = event?.event as string | undefined;
  const payment = event?.payload?.payment?.entity;
  const orderEntity = event?.payload?.order?.entity;
  const razorpayOrderId: string | undefined =
    orderEntity?.id || payment?.order_id;

  if (!razorpayOrderId) {
    // Nothing to reconcile against — acknowledge so Razorpay stops retrying.
    return jsonResponse({ ok: true, ignored: true }, 200);
  }

  const record: any = await ctx.runQuery(
    internal.paymentsData.getOrderByRazorpayOrderId,
    { razorpayOrderId }
  );
  if (!record) {
    // Order not created by this app — acknowledge, do nothing.
    return jsonResponse({ ok: true, unknownOrder: true }, 200);
  }

  if (eventName === "payment.captured" || eventName === "order.paid") {
    // Cross-verify: the captured amount must match what we ordered.
    const amountOk =
      typeof payment?.amount === "number"
        ? payment.amount === record.amount
        : true; // order.paid without payment entity — trust the signed event
    if (!amountOk) {
      await ctx.runMutation(internal.paymentsData.markOrderFailed, {
        orderId: record._id,
        reason: "Webhook amount mismatch — needs manual review in Razorpay",
        source: "webhook",
      });
      return jsonResponse({ ok: true, amountMismatch: true }, 200);
    }
    await ctx.runMutation(internal.paymentsData.markOrderPaid, {
      orderId: record._id,
      razorpayPaymentId: payment?.id || `webhook_${razorpayOrderId}`,
      source: "webhook",
    });
    return jsonResponse({ ok: true }, 200);
  }

  if (eventName === "payment.failed") {
    await ctx.runMutation(internal.paymentsData.markOrderFailed, {
      orderId: record._id,
      reason: payment?.error_description || "Payment failed at gateway",
      source: "webhook",
    });
    return jsonResponse({ ok: true }, 200);
  }

  // Any other event — acknowledged, no state change.
  return jsonResponse({ ok: true, ignored: eventName }, 200);
}

const http = httpRouter();

http.route({
  path: "/razorpay-webhook",
  method: "POST",
  handler: httpAction(handleRazorpayWebhook),
});

export default http;
