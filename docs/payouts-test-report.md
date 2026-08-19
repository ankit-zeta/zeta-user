# Payouts & Payments — Test Report

Date: 19 Aug 2026 · Deployed: `terrific-dove-836.convex.cloud` · Suites: **158/158 PASS**

## Feature scope delivered

**Wallet (source-tracked earnings)**
- All earnings land in one wallet: `WORK_PAYOUT` (job completions) and `AFFILIATE_COMMISSION` (referral sales) — credited atomically with ledger entries (`walletTransactions`), balance-after on every row.
- User dashboard (`/dashboard/earnings`): available balance, work vs affiliate split cards, wallet ledger by source, affiliate commission ledger.
- Admin (`/admin/finance` → Wallet Overview): every member's available / work / affiliate / total earned / withdrawn, transaction count, CV badge, quick manual adjustment (audited).

**Programme payout report**
- Admin `/admin/finance` → Payout Report: totals (active programmes, applications, currently working, completed, paid, total paid out) + per-job rows (payment, applied, working, completed, paid users, total paid).

**CV verification gate**
- Admin reviews applicant CV (`/admin/work`): Verify / Reject with remarks; per-user `cvStatus` (`pending|verified|rejected`), reviewer + timestamp; CV review queue query; notifications on decision.
- **Gate (server-side)**: `updateApplicationStatus → accepted` throws unless the applicant's CV is `verified` — users cannot self-select for work.
- User profile banner shows pending / rejected (+remark) / verified state.

**Withdrawals**
- Methods: UPI ID, Bank Transfer (all fields validated), PayPal, **UPI QR** (client-side canvas compression → ≤100 KB target, 1 MB hard cap; storage upload action; server validates storageId exists and rejects external URLs; admin sees resolved QR image).
- Enforced: minimum/maximum amount (from settings), balance check, one pending request at a time, per-method detail validation, fee + net payout, deduction at request, refund + REFUND ledger on reject, notification + audit log on every admin action.
- Admin queue (`/admin/finance` → Withdrawals): Approve → processing → Mark Paid, or Reject; shows bank/UPI/PayPal/QR details + admin note input.

## Security fixes applied
| Issue | Fix |
|---|---|
| Double work payout (re-completing an application could credit twice) | `paymentStatus === "paid"` guard + final-state check (`completed/rejected/cancelled` immutable) |
| Payout above the job's listed payment | payout capped at `job.payment` |
| Double withdrawal completion (totalWithdrawn counted twice) | transition guards: final states immutable, completed only from processing/approved |
| Withdrawal details not validated per method | UPI needs `@`-ID, bank needs all 4 fields, QR needs real storageId (external URLs rejected), PayPal needs email |
| Accept-for-work without CV check | CV-verified gate on `accepted` |
| QR storage abuse | upload URL action session-less (codebase pattern), but request-time storageId existence check + format whitelist |
| Non-admin access | every new admin function gates on `super_admin/admin/finance_admin/work_admin` roles (tested) |

## Test coverage (payouts-tests.ps1 — 34 tests)
- W1–W2 wallet init + affiliate credit · C1–C6 CV gate incl. non-admin · P1–P7 payout cap, credit, ledger, report, overview, non-admin · D1–D16 withdrawal validations, single-pending, approve/complete once, double-complete blocked, refund · Q1–Q3 real QR upload → request → admin resolved URL.

## Full regression
- work-tests 13/13 · auth-tests 30/30 · support-ticket-tests 36/36 · admin-users-tests 30/30 · achievements-tests 15/15 · payouts-tests 34/34
- `admin` + `website` production builds: Compiled successfully.