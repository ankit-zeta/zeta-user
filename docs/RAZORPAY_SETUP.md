# Razorpay Checkout — Setup & Architecture

## 1. Configure Convex environment variables (server-side only)

Run from the project root:

```bash
npx convex env set RAZORPAY_KEY_ID rzp_test_xxxxxxxxxxxx
npx convex env set RAZORPAY_KEY_SECRET your_key_secret_here
```

- Use **test** keys (`rzp_test_…`) while developing, **live** keys (`rzp_live_…`) for production.
- Keys are stored inside Convex's encrypted environment — they never ship to the
  browser bundle or the Next.js server.
- The client only ever receives the *public* `key_id` via the
  `payments.getRazorpayConfig` query.

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

## 6. Optional next steps

- **Webhook** (`payment.captured`) for reconciliation if the user closes the tab
  mid-payment; currently un-captured orders simply stay `created`.
- GST-inclusive invoice emails via Razorpay Invoices API.
