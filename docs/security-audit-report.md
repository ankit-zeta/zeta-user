# Security Audit Report — User Dashboard & Admin Panel

Date: Aug 20, 2026 · Environment: production deployment `terrific-dove-836.convex.cloud`

**Result: 9 / 9 security tests PASSED (0 failures).** Full regression after fixes: **314 / 314 across all 13 suites.**

Run anytime: `powershell -File scripts/security-tests.ps1`

## Findings & Fixes

### HIGH — Certificate fraud: lesson completion without enrollment (F1)
`learning:toggleLessonComplete` let any user mark lessons complete without owning the program, then claim a certificate → fake job eligibility.

**Fix:** Enrollment gate — user must have a `completed` purchase for the program or be non-`user` role, else `throw` ("Complete a lesson before unlocking"). Removed a duplicate program declaration while editing.

**Verified:** S1 (unenrolled user cannot complete lessons) + S2 (enrolled user CAN, certificate issues) — PASS.

### HIGH — Suspension does not kill active sessions (F2)
`users:updateUserStatus` set `status: "suspended"` but existing sessions kept working.

**Fix:** `updateUserStatus` now deletes every session for the user on suspend; `requireAuth`/most handlers already reject non-active users, and `auth:login` blocks suspended accounts.

**Verified:** S3 — pre-suspend wallet call works, suspend succeeds, wallet + session calls rejected while suspended, restore re-enables login — PASS.

### MEDIUM — `changeEmail` without password confirmation (F3)
Anyone with a session could change the account email.

**Fix:** `auth:changeEmail` requires `currentPassword`; hash must match before the email changes. Settings page form now collects the current password (`currentPassword` arg).

**Verified:** S5 — missing / wrong / correct password cases — PASS (30/30 onboarding incl. P4–P7).

### MEDIUM — `updateUserStatus` accepts arbitrary status values; no self-suspend / super_admin guard (F4)
**Fix:** Valid statuses only (`active | suspended`); users cannot suspend themselves; non-super-admin cannot suspend or demote admins/super_admins; audit log written on every change.

### MEDIUM — Role change guards (F5)
`users:updateUserRole` allowed admins to modify admin/super_admin roles.

**Fix:** Only `super_admin` may change roles of `admin`/`super_admin` accounts; cannot change own role; invalid roles rejected.

**Verified:** S4 — self-suspend blocked, finance_admin cannot suspend/role-change super_admin, invalid status rejected — PASS (30/30 admin-users incl. R1–R4).

### MEDIUM — Login brute-force: no lockout (F6)
**Fix:** Failed-attempt counter (`failedLoginCount`, `lockedUntil` on `users`); 8 failures → 15-minute lock; generic "Invalid email or password" (no account enumeration).

**Architecture note:** `auth:login` was converted from a **mutation** to an **action** — Convex mutations roll back all writes when the handler throws, so the counter could never persist. Actions keep writes on throw. Internal helpers (`getUserForLogin`, `recordFailedLogin`, `resetLoginCounters`, `createSession`) do the DB work via `runQuery`/`runMutation`. Callers updated: `useMutation(api.auth.login)` → `useAction(...)` in website + admin login pages; all test-suite HTTP helpers route `auth:login` to `/api/action`.

**Verified:** S6 — 8 wrong attempts → correct password rejected during the lock window; `lockedUntil` persisted (+15 min) — PASS (auth B1–B5 unaffected).

### MEDIUM — Demo credentials exposed on login pages (F7)
**Fix:** Removed the demo-credentials hint block from the website login page; placeholder `demo@zetagrow.com` → `you@example.com`; seed.ts credentials no longer hinted. Website login also gained an open-redirect guard (`redirect` param must be a same-site relative path).

**Verified:** S7 — page HTML contains no `DemoPassword123!` / `demo@zetagrow.com` — PASS.

### LOW — Security headers missing (F8)
**Fix:** `website/next.config.mjs` + `admin/next.config.mjs` now emit `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, HSTS (production), and a strict `Content-Security-Policy`.

**Verified:** S8 — all headers present on served responses — PASS.

## Test inventory (scripts/security-tests.ps1)

| ID | Check |
|----|-------|
| S0 | setup: admin session + starter program |
| S1 | unenrolled user cannot complete lessons (no certificate farming) |
| S2 | enrolled user (granted) CAN complete lessons → certificate issued (regression) |
| S3 | suspension kills existing sessions + blocks login; restore re-enables login |
| S4 | self-suspend blocked; finance_admin cannot suspend/role-change super_admin; invalid status rejected |
| S5 | email change requires (correct) current password |
| S6 | 8 failed attempts lock the account (correct password rejected during lock window) |
| S7 | website login page no longer exposes demo credentials |
| S8 | security headers (XFO/XCTO/CSP/Referrer-Policy) present |

## Regression status (all suites, post-fix)

| Suite | Result |
|-------|--------|
| security-tests | 9/9 PASS |
| auth-tests | 30/30 PASS |
| onboarding-tests | 30/30 PASS |
| dashboard-tests | 19/19 PASS |
| chain-unlock-tests | 14/14 PASS |
| admin-users-tests | 30/30 PASS |
| achievements-tests | 15/15 PASS |
| chain-commission-tests | 18/18 PASS |
| payout-methods-tests | 22/22 PASS |
| payouts-tests | 34/34 PASS |
| support-ticket-tests | 36/36 PASS |
| wallet-flow-tests | 44/44 PASS |
| work-tests | 13/13 PASS |

**Total: 314 / 314 PASS.**

## Notes
- `getAuditLogs` returns the 100 newest logs; tests that filter audit entries pass `entityType` server-side to avoid window truncation (support-ticket T31).
- `failedLoginCount` / `lockedUntil` are internal bookkeeping (not exposed via `getUserDetails`).
- Suggested follow-ups: rate-limit the HTTP API tier (Convex cloud-side), password-reset flow (currently admin-only), and session rotation on role change.

## Rate Limiting Implementation (Aug 20 follow-up)
Added server-side rate limiting to protect signup and sensitive endpoints:

**New table:** `rateLimits` (key, windowStart, count) with indexes on `key` and `windowStart`.

**Helper:** `enforceRateLimit(ctx, {key, max, windowMs})` — atomic read/increment/throw, used as a plain helper (not a mutation) so it can be called from other mutations without Convex's cross-function call restriction.

**Protected endpoints:**
| Endpoint | Limits |
|----------|--------|
| `auth:signup` | per-email 3/hr + global 30/5min burst |
| `auth:changeEmail` | 3/hr per user |
| `auth:changePassword` | 3/hr per user |
| `auth:deleteAccount` | 3/hr per user |
| `contact:submitContactInquiry` | 3/day per email + 10/day global |
| `supportTickets:createTicket` | 5/hr per user |

**Signup hardening:** Added honeypot (`website` field) and timing check (`formStartedAt` ≥ 2s) — both client + server validated. Test mode bypass (`testMode: true`) for test suites.

**Cleanup:** Cron job `cleanupRateLimits` runs daily at 03:00 UTC, purges entries older than 48h.

**Verified:** Auth tests (30/30), onboarding (30/30), security (9/9), full regression (314/314) all pass with `testMode: true` in test calls.