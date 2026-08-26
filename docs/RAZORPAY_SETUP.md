# Razorpay Checkout — Setup & Architecture

## 1. Configure Convex environment variables (server-side only)

Run from the project root:

```bash
npx convex env set RAZORPAY_KEY_ID rzp_live_xxxxxxxxxxxx
npx convex env set RAZORPAY_KEY_SECRET your_key_secret_here
npx convex env set RAZORPAY_WEBHOOK_SECRET your_webhook_secret_here
```

- Keys are stored inside Convex's encrypted environment — they never ship to
  the browser bundle or the Next.js server.
- The client only ever receives the *public* `key_id` via the
  `payments.getRazorpayConfig` query (safe — Razorpay key ids are public).
- **Never** put key secrets in `.env.local`, `NEXT_PUBLIC_*` vars, or git.
  The repo's `.env.local` files only ever hold Convex URLs (and are
  gitignored anyway).
- `RAZORPAY_WEBHOOK_SECRET` is the secret YOU generate when creating the
  webhook (step 6) — it is separate from the API key secret.

## 2. Payment flow (how a purchase unlocks)

```
/programs/[slug]  ──Get Plan──▶  /checkout/[plan-slug]
                                     │
                                     │ 1. createRazorpayOrder (action)
                                     │    - auth session check
                                     │    - Razorpay Orders API call (Basic auth)
                                     │    - paymentOrders row: status "created"
                                     ▼
                          Razorpay Checkout modal (custom theme)
                                     │ success handler
                                     ▼
                          2. verifyRazorpayPayment (action)
                             - HMAC-SHA256(order_id|payment_id, secret)
                             - timing-safe compare → status "paid"
                                     ▼
                          3. processPurchaseWithAffiliate
                             (mutation, paymentMethod="razorpay", orderId)
                             - requires paid + unconsumed order
                             - enrolls all plan courses (existing pipeline:
                               notifications, emails, affiliate commissions)
                             - marks order "consumed"
                                     ▼
                          Success screen → /dashboard/programs
```

## 3. Safety properties

| Property | Mechanism |
|---|---|
| Secrets never exposed | Only in Convex env; client gets public key_id |
| No fake unlock | Enrollment mutation rejects `razorpay` calls without a paid order |
| Replay protection | Order is marked `consumed` after first use |
| Amount tampering | Amount comes from the plan document server-side, never the client |
| Cross-account theft | Order is bound to the creating user's session userId |

## 4. Legacy behavior preserved

- `paymentMethod` values other than `"razorpay"` keep legacy behavior
  (admin grants / demo seeding still work).
- Old `purchases` rows, affiliate logic, emails and notifications are untouched.
- The new `paymentOrders` table is purely additive.

## 5. Testing (test mode)

1. Set test keys as above, run `npx convex dev` to push.
2. Start `npm run dev:watch` in `website/`.
3. Go to any program → **Get …Plan** button → checkout page.
4. Pay with Razorpay test cards, e.g.:
   - UPI: `success@razorpay`
   - Card: `4111 1111 1111 1111`, any future expiry, any CVV
5. Verify: courses appear under `/dashboard/programs`, order row in the
   `paymentOrders` table is `consumed`.
6. Close the Razorpay window mid-payment → the button must return to
   "Pay ₹… Securely", the order row becomes `cancelled` (source: user), and
   the admin **Payment Orders** page logs the drop-off.

## 6. Webhook setup (REQUIRED for live mode)

The webhook is the server-side source of truth: if a user pays but the
browser closes before client verification runs, the webhook still records
the payment and the checkout page offers one-click activation on the next
visit.

**Endpoint (already implemented in `convex/http.ts`):**

```
POST https://terrific-dove-836.convex.site/razorpay-webhook
```

**To create it in the Razorpay Dashboard** (Account & Settings → Webhooks →
"+ Add New Webhook"):

1. **URL**: `https://terrific-dove-836.convex.site/razorpay-webhook`
   (use the production `CONVEX_SITE_URL`; for a local dev deployment use that
   deployment's `*.convex.site` URL instead).
2. **Secret**: click *Generate secret*, copy it, then run
   `npx convex env set RAZORPAY_WEBHOOK_SECRET <that secret>`.
3. **Active events**:
   - `payment.captured` — money received (primary)
   - `payment.failed` — gateway-side failure reason
   - `order.paid` — backup for `payment.captured` (idempotent)
4. **Alerts**: enable email alerts so you notice delivery failures.
5. Save, then use the "Send test hook" button — the dashboard should show a
   200 response.

**How it is secured** (`convex/http.ts`):

- Every request's raw body is HMAC-SHA256 verified against
  `RAZORPAY_WEBHOOK_SECRET` with a timing-safe compare; forged requests get
  `401`.
- The webhook amount is cross-checked against the stored order amount before
  marking paid.
- All transitions are idempotent — `payment.captured` and `order.paid` may
  both arrive; paid/consumed orders are never overwritten. A cancelled order
  IS upgraded to paid if money was actually captured (webhook wins).
- Nothing from the payload is logged.

## 7. Funnel tracking & admin dashboard

Every checkout attempt is recorded in the `paymentOrders` table with a
lifecycle the admin dashboard (admin → **Payment Orders**) aggregates:

```
created ──▶ paid ──▶ consumed   (money received → courses unlocked)
   │
   ├──▶ cancelled  (user closed the Razorpay window — cancelSource: "user")
   ├──▶ failed     (signature mismatch, gateway error, amount mismatch)
   └──▶ expired    (cron: still "created" after 24h — cancelSource: "timeout")
```

- Cancels are recorded by `payments.cancelRazorpayOrder` (fired from the
  checkout's `modal.ondismiss`) and can never downgrade a paid order.
- The admin page shows per-row Razorpay order/payment ids (linked to the
  Razorpay dashboard) so every row can be cross-verified against the gateway.
- Stats: total attempts, in-progress, paid, completed, cancelled, failed,
  expired, revenue, and conversion rate.

