# ZetaGrow — Complete Test Case Registry

Every automated test suite for the ZetaGrow platform, run against the production Convex backend
(`https://terrific-dove-836.convex.cloud`) via the public HTTP API. All suites are PowerShell 5.1 scripts
in `scripts/` and can be run with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/<suite>.ps1
```

---

## Suite Summary

| # | Suite | File | Checks | Covers |
|---|-------|------|--------|--------|
| 1 | Auth | `scripts/auth-tests.ps1` | 30 | Signup, login, sessions, admin auth, guards |
| 2 | Onboarding | `scripts/onboarding-tests.ps1` | 30 | CV flow, apply gating, password/email change, account deletion |
| 3 | Achievements | `scripts/achievements-tests.ps1` | 15 | Rules CRUD, live metric progress, unlock + position, grants/revoke |
| 4 | Work & Jobs | `scripts/work-tests.ps1` | 13 | Job CRUD, cover images, eligibility gating, certificates, applications |
| 5 | Wallet Flow | `scripts/wallet-flow-tests.ps1` | 44 | Full work-payout + affiliate + withdrawal lifecycle, caps & limits |
| 6 | Support Tickets | `scripts/support-ticket-tests.ps1` | 36 | Tickets, replies, attachments, tracking, admin ops, audit |
| 7 | Payouts | `scripts/payouts-tests.ps1` | 34 | CV-verified acceptance, work payouts, withdrawal validation, admin flow |
| 8 | Payout Methods | `scripts/payout-methods-tests.ps1` | 22 | Saved bank/UPI/QR methods, defaults, withdrawal binding, security |
| 9 | Chain Commission | `scripts/chain-commission-tests.ps1` | 18 | Upline % engine: creation, cascade, ledger, notifications, depth |
| 10 | Chain Unlock | `scripts/chain-unlock-tests.ps1` | 14 | Chain only after achievement unlock; caps, multipliers, depth limit |
| 11 | Dashboard | `scripts/dashboard-tests.ps1` | 19 | Every dashboard route + every page's API end-to-end |
| 12 | Admin Users | `scripts/admin-users-tests.ps1` | 30 | User list/search, reports, suspend, wallet adjust, roles, password reset |

**Total: 305 test cases.**

---

## 1. Auth (`auth-tests.ps1`)

**Purpose:** Verify every authentication path: signup validation, login, sessions, admin roles, and that
invalid/suspended tokens are rejected everywhere.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| A1 | Signup valid → token + user + referral code | success, user object with referral code |
| A2 | Signup duplicate email rejected | error |
| A3 | Signup with valid referral → referredBy set | success, referredBy populated |
| A4 | Signup with unknown referral code still works | success (graceful) |
| A5 | Signup email normalized to lowercase | stored lowercase |
| A6 | Signup with phone stored | success, phone saved |
| A7 | Signup initializes wallet + zero enrollments | wallet created, 0 enrollments |
| A8 | Welcome notification created | notification row |
| A9 | Referrer notified when user joins with code | referrer notification |
| A10 | Signup missing password rejected | error |
| B1 | Login valid credentials | success + token |
| B2 | Login wrong password rejected | error |
| B3 | Login unknown email rejected | error |
| B4 | Login email case-insensitive | success |
| B5 | Login email whitespace trimmed | success |
| B6 | Session token works with getSessionUser | user resolved |
| B7 | Logout invalidates token | token dead |
| C1 | Suspended user blocked from login + session | error + null session |
| D1 | Admin login → super_admin role | success, role super_admin |
| D2 | Admin wrong password rejected | error |
| D3 | Admin token works on admin functions | success |
| D4 | Admin getSessionUser → super_admin | role super_admin |
| D5 | Admin logout invalidates token | token dead |
| D6 | User token cannot access admin area | error |
| E1 | getSessionUser without token → null | success + null |
| E2 | getSessionUser garbage token → null | success + null |
| E3 | Demo login shows real enrollments | enrollments returned |
| E4 | Explicit null token → success + null (regression) | no crash, null user |
| E5 | Fresh admin login resolves session user | login flow path works |
| E6 | Stale token resolves null → clean login redirect | null user |

## 2. Onboarding (`onboarding-tests.ps1`)

**Purpose:** The complete new-user journey: signup rules, CV builder, application gating, account settings.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| S1 | Password shorter than 8 rejected server-side | error |
| S2 | Valid signup succeeds | success + token |
| S3 | Duplicate email rejected | error |
| S4 | Session resolves user | user id returned |
| CV1 | Fresh user has empty CV at 0% | completion 0 |
| CV2 | Partial save → 25% incomplete | completion 25 |
| A1 | Apply blocked without any CV profile | error |
| A2 | Apply blocked with incomplete CV | error |
| A3 | Program purchase works without CV | success |
| CV3 | Invalid portfolio URL rejected | error |
| CV4 | Complete CV → 100% complete | completion 100 |
| CV5 | Re-save (update) keeps 100% | completion 100 |
| CV6 | Non-admin cannot read another user's CV | error |
| A4 | Apply succeeds with complete CV | success + application id |
| A5 | Portfolio auto-attached from CV | application carries portfolioUrl |
| V1 | Admin application shows full structured CV | full CV sections |
| N0 | Admin verifies applicant CV | success |
| N1 | Admin accepts applicant | success |
| N2 | Acceptance notification delivered with congrats title | notification |
| P1 | Wrong current password rejected | error |
| P2 | Password change succeeds | success |
| P3 | Old password dead + new password works | old → error, new → success |
| P4 | Invalid email format rejected | error |
| P5 | Email taken by another account rejected | error |
| P6 | Email change succeeds | success |
| P7 | Login works with new email | success |
| E1 | Delete with wrong password rejected | error |
| E2 | Delete blocked with wallet balance | error |
| E3 | Delete succeeds once balance zero | success |
| E4 | Deleted account can no longer log in | error |

## 3. Achievements (`achievements-tests.ps1`)

**Purpose:** Achievement rules, live condition progress, automatic unlock that assigns positions, and admin
grant/revoke/visibility control.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| A1 | Admin creates achievement rule with position unlock | success |
| A2 | Duplicate slug rejected | error |
| A3 | Non-admin cannot create achievement | error |
| B1 | User sees achievement with live condition progress | progress % correct |
| B2 | Admin list shows rule with status + position | full rule |
| C1 | Conditions met → server-side unlock + position + notification | unlocked + position + notification |
| C2 | User view + position + notification all updated | consistent |
| C3 | No duplicate unlocks on re-evaluation | single unlock |
| D1 | Admin grant works / duplicate grant blocked | success then error |
| D2 | Non-admin cannot grant achievements | error |
| D3 | Admin revoke removes from user view | removed |
| D4 | Revoke without existing unlock rejected | error |
| D5 | Toggle draft hides from users / active restores | visibility toggles |
| D6 | Delete removes rule + user unlocks | gone everywhere |
| D7 | All admin actions written to audit log | audit entries |

## 4. Work & Jobs (`work-tests.ps1`)

**Purpose:** Job opportunity lifecycle (admin) and the user side: cover images, program-completion gating,
certificate issuance, and applications.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| J1 | Cover upload action + PUT returns storageId | storageId |
| J2 | Create job with company + cover storageId | success |
| J3 | New job auto-appears in public list + cover URL resolved | listed + URL |
| J4 | Cover image actually downloadable | HTTP 200 bytes |
| G1 | User without completion → locked + message | not eligible + missing message |
| G2 | Server blocks apply without program completion | error |
| G3 | Complete all lessons → certificate issued | certificate row |
| G4 | Completed user CAN apply (server enforced) | success |
| G5 | Duplicate application rejected | error |
| J5 | Update job fields + image preserved | success, image kept |
| J6 | Non-admin cannot delete job | error |
| J7 | Delete job + audit + removed from public list | gone + audited |
| J8 | Non-admin cannot create job | error |

## 5. Wallet Flow (`wallet-flow-tests.ps1`)

**Purpose:** The full money lifecycle: work submission → acceptance → payout; affiliate commission
creation/holding/approval; withdrawal request → approve → complete → reject; all caps and limits.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| L0 | Admin posts job opportunity | success |
| L1 | Multiple users apply to the job | all succeed |
| L2 | Work submission blocked before acceptance | error |
| L3 | Admin accepts selected applicants | success |
| L4 | Admin provides work instructions | success |
| L5 | Instructions delivered via notification | notification |
| L6 | Worker submits deliverable | success |
| L7 | Application moved to under_review with submission link | status + link |
| L8 | Resubmit blocked while under review | error |
| L9 | Admin requests revision with feedback | success |
| L10 | Worker resubmits after revision | success |
| L11 | Admin approves work + releases payout | success |
| L12 | Wallet credited +4000 with WORK_PAYOUT ledger | balance + ledger type |
| L13 | Payout above job payment rejected | error |
| L14 | Full job payment payout for worker 2 | success |
| L15 | Worker 2 wallet +5000 | balance + workEarnings |
| L16 | Double payout blocked on completed application | error |
| L17 | Worker cannot change application status | error |
| C1 | Referrer starts with empty wallet | 0/0 |
| C2 | Purchase with referral code succeeds | success |
| C3 | Commission sale created for referrer (pending) | sale row |
| C4 | Commission held in pendingBalance (not available) | pending only |
| C5 | Admin approves commission | success |
| C6 | Commission moved to available + affiliateEarnings + ledger | all updated |
| C7 | Double-approve commission blocked | error |
| W1 | Withdrawal requested at exact minimum | success |
| W2 | Fee + net math correct on record | math exact |
| W3 | Available balance deducted at request | deducted |
| W4 | Second pending withdrawal blocked | error |
| W5 | Daily withdrawal limit enforced | error |
| W6 | Admin approves withdrawal | success |
| W7 | Admin completes withdrawal | success |
| W8 | totalWithdrawn incremented + ledger completed | exact |
| W9 | Ledger reconciliation exact (work+affiliate−withdrawn) | balance matches |
| W10 | Referrer withdraws full commission (bank) | success |
| W11 | Admin rejects withdrawal | success |
| W12 | Rejection refunds full amount + REFUND ledger | refunded |
| W13 | Referrer ledger reconciliation exact | matches |
| M1 | Work daily payout cap blocks excess payout | error |
| M2 | Payout within cap released to wallet | success |
| M3 | Affiliate per-sale cap applied at creation | commission = cap |
| M4 | Affiliate daily commission cap blocks approval | error |
| M5 | Monthly withdrawal limit enforced | error |
| M6 | Limits restored to original values after tests | restored |

## 6. Support Tickets (`support-ticket-tests.ps1`)

**Purpose:** User ticket creation/reply/attachment, tracking-ID lookup, and the full admin queue with
status transitions, notifications, and audit.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| T1 | createTicket valid → tracking ID | success + ID |
| T5 | createTicket invalid token rejected | error |
| T6 | getMyTickets returns all my tickets | full list |
| T7 | getTicketDetail own ticket | success |
| T8 | getTicketDetail other user forbidden | error |
| T9 | getTicketDetail invalid ticket id rejected | error |
| T10 | sendTicketReply own ticket | success |
| T11 | sendTicketReply empty message rejected | error |
| T12 | sendTicketReply other user forbidden | error |
| T13 | Image upload + link attachment stored + resolved | attachment URL |
| T14 | Tracking lookup (case-insensitive ID) | success |
| T15 | Tracking lookup wrong email rejected | error |
| T16 | Tracking lookup nonexistent rejected | error |
| T20 | getSupportTickets returns all | full list |
| T21 | Filter status=open | filtered |
| T22 | Filter category=withdrawals | filtered |
| T23 | Search by tracking ID | match |
| T24 | Search by user | match |
| T25 | getSupportTicketDetail full thread | thread |
| T26 | Admin reply + auto in_progress | reply + status |
| T27 | Admin reply empty rejected | error |
| T28 | User got notification with ticket link | notification |
| T29 | updateTicketStatus resolved | success |
| T30 | updateTicketStatus invalid value rejected | error |
| T31 | Admin actions written to audit log | audit entries |
| T32 | Tracking IDs unique across all tickets | unique |
| T33 | Every ticket complete + timestamps valid | data integrity |
| T34 | getTicketCategories returns 8 | 8 categories |
| T35 | Legacy contactInquiries unaffected | intact |
| T36 | Every ticket thread valid (sender + content) | integrity |

## 7. Payouts (`payouts-tests.ps1`)

**Purpose:** CV-verified acceptance pipeline, work payouts with reports, and exhaustive withdrawal
validation including QR-method rules.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| W1 | Fresh user wallet created with zero balance | 0/0 |
| W2 | Affiliate commission credited to wallet + ledger | credited |
| C1 | Accept blocked until CV verified | error |
| C2 | CV review queue lists pending applicant with resume | listed |
| C3 | Non-admin cannot verify CVs | error |
| C4 | Admin verifies CV | success |
| C5 | User session reflects cvStatus verified | verified |
| C6 | Accept allowed after CV verified | success |
| P1 | Payout above job payment rejected | error |
| P2 | Completion credits wallet WORK_PAYOUT | success |
| P3 | Wallet balance + workEarnings + ledger updated | all three |
| P4 | Double payout blocked on completed application | error |
| P5 | Payout report totals for job correct | exact |
| P6 | Wallet overview shows user + source split | sections |
| P7 | Non-admin blocked from wallet overview + report | error |
| D1 | Below minimum withdrawal rejected | error |
| D2 | Above balance withdrawal rejected | error |
| D3 | UPI missing UPI ID rejected | error |
| D4 | QR method missing image rejected | error |
| D5 | External URL for QR rejected | error |
| D6 | Valid UPI withdrawal submitted | success |
| D7 | Balance deducted + pending ledger entry | deducted + ledger |
| D8 | Second pending withdrawal blocked | error |
| D9 | Incomplete bank details rejected | error |
| D10 | Non-admin cannot update withdrawal status | error |
| D11 | Admin approves withdrawal (processing) | success |
| D12 | processing → completed | success |
| D13 | totalWithdrawn incremented once + ledger completed | exact |
| D14 | Double-complete blocked | error |
| D15 | Reject after request works | success |
| D16 | Reject refunds balance + REFUND ledger | refunded |

## 8. Payout Methods (`payout-methods-tests.ps1`)

**Purpose:** Saved payout methods (bank / UPI / UPI-QR): validation, defaults, withdrawals bound to saved
methods, and ownership security.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| P1 | No saved methods initially | empty list |
| P2 | UPI method saved + auto default | method + default |
| P3 | Bank name mismatch rejected | error |
| P4 | Bank method saved with matching name | success |
| P5 | QR with invalid storage id rejected | error |
| P6 | QR uploaded to storage | storageId |
| P7 | QR method saved with valid upload | success |
| P8 | List shows all 3 methods + resolved QR URL | 3 methods + URL |
| P9 | Exactly one default method | 1 default |
| P10 | Set default switches default to bank | switched |
| P11 | Users only see their own methods | empty for others |
| W1 | Withdrawal via saved bank method | success |
| W2 | Withdrawal record carries saved bank details | details copied |
| W3 | Another user cannot use someone else's saved method | error |
| W4 | QR withdrawal via saved QR method | success |
| W5 | Admin sees resolved QR for withdrawal | URL resolved |
| W6 | UPI withdrawal via saved UPI method | success |
| D1 | Delete bank method (was default) | success |
| D2 | Default auto-promoted after deletion | new default |
| D3 | Cannot delete another user's method | error |
| D4 | Deleted method cannot be used for withdrawal | error |
| D5 | Admin can view user's saved methods | success |

## 9. Chain Commission (`chain-commission-tests.ps1`)

**Purpose:** The upline/upline-only commission engine: A earns X% of the commission their referral (B)
earns, with cascade approval/rejection, ledger entries, and depth rules.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| C1 | Chain settings persisted (enabled + 20% on Growth Lead) | settings stored |
| C2 | Achievement unlocked position for A | position Growth Lead |
| C3 | A buys ₹2000 program | success |
| C3b | A has no commission from own purchase | pending 0 |
| C4 | B buys ₹2000 (referred by A) → A gets ₹1000 direct | pending 1000 |
| C5 | C buys ₹2000 (referred by B) → B ₹1000, A ₹200 chain | pending 200 |
| C6 | A stats: 1 direct sale + ₹200 chain | stats exact |
| C7 | Chain row well-formed (kind/parent/amount/base) | all fields |
| C8 | A direct approved → available 1000, pending 200 | exact |
| C9 | B approved → cascade credits A chain ₹200 | available 1200 |
| C10 | A got CHAIN_COMMISSION ledger entry of ₹200 | ledger row |
| C11 | D buys (ref B) → B +1000, A +200 chain | pending math |
| C12 | Rejecting B's sale auto-rejects A's chain | pending 0 |
| C13 | Chain row cannot be processed twice | error |
| C14 | E buys (ref B) → chain still active: A +200 | pending 200 |
| C15 | Chain disabled → F buys, A gets NO new chain | pending unchanged |
| C16 | Upline without position gets no chain | 0 for upline |
| C17 | A received Chain Commission notification | notification |

## 10. Chain Unlock (`chain-unlock-tests.ps1`)

**Purpose:** Proves chain earnings start ONLY after the achievement unlock, and that caps, multipliers,
and the single-upline depth limit all apply to chain commissions.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| U0 | Setup: admin, ₹2000 program, Growth Lead position | ready |
| U1 | Chain enabled with 20% on Growth Lead | persisted |
| U2 | B's sale BEFORE unlock: B ₹1000, A ₹0 | no chain pre-unlock |
| U3 | A meets 2-referral metric → achievement auto-unlocks → position | unlocked |
| U4 | AFTER unlock: B ₹1000, A ₹200 chain (20% of B) | chain created |
| U5 | Approving B's direct cascades A's chain to available ₹200 | cascade |
| U6 | Depth: A earns only from B's sales, NOT from C's (2 up) | no chain from C |
| U7 | Per-sale cap applies to chain: 20% capped to ₹150 | 150 |
| U8 | Position multiplier 2× raises cap: chain ₹200 uncapped | 200 |
| U9 | Daily cap blocks manual chain approval; row stays pending | error + pending |
| U10 | Rejecting B's direct auto-rejects A's chain | pending drops |
| U11 | Approving C4 parent cascades ₹150 + ledger entries | 2+ CHAIN_COMMISSION |
| U12 | A received Chain Commission notification per earning | notifications |
| U13 | All commission status changes recorded in audit log | audit |

## 11. Dashboard (`dashboard-tests.ps1`)

**Purpose:** Every user dashboard page serves (HTTP 200) and every API powering each page/section works
end-to-end, plus security guards.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| S1 | Setup: admin + demo sessions + starter program | ready |
| R1 | All 16 dashboard routes return HTTP 200 | 16/16 |
| P1 | Programs page: public catalog + program detail | loads |
| H1 | Home: achievements, affiliate stats, job eligibility, evaluate | all load |
| E1 | Earnings: wallet + transaction ledger with valid balances | valid |
| R2 | Referrals: network list with purchase status per referral | list |
| A1 | Affiliate: stats + chain earnings fields present | fields |
| AC1 | Achievements: all rules with progress % + unlock state | valid |
| N1 | Notifications: list + mark-all-read resets unread counter | 0 unread |
| PR1 | Profile: update profile + CV upsert/read roundtrip | saved + read |
| RS1 | Resources: library loads for user | loads |
| SP1 | Support: categories, ticket create, list, tracking lookup | full flow |
| ST1 | Settings: session info + password change validation | guards hold |
| CE1 | Certificates: 100% course → cert issued → verifies; bogus rejected | cert + null |
| W1 | Work: job listings + eligibility flags + job detail page | loads |
| W2 | Work: my applications list loads | loads |
| WD1 | Withdrawals: wallet, saved payout methods, history load | loads |
| SEC1 | Invalid token rejected + user cannot access admin endpoints | errors |

## 12. Admin Users (`admin-users-tests.ps1`)

**Purpose:** The admin user-management console: search/filter, full user reports, status control, wallet
adjustments, role management, and password resets.

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| U1 | Admin can list all users | list |
| U2 | Non-admin blocked from list | error |
| U3 | Search by name works | match |
| U4 | Search by email works | match |
| U5 | Search by referral code works | match |
| U6 | Role filter user only | filtered |
| U7 | Status filter suspended only | filtered |
| U8 | No-match search returns empty list | empty |
| U9 | Invalid token rejected | error |
| D1 | Non-admin blocked from report | error |
| D2 | Nonexistent user → error | error |
| D3 | Full report has all sections (wallet/programs/affiliate/earnings/activity/audit) | all sections |
| D4 | Affiliate sales have buyer/program/commission detail | detail |
| D5 | Tickets carry trackingId + certificates carry certId | IDs present |
| S1 | Suspend/restore writes full audit trail with before/after | audit |
| S2 | Non-admin cannot change status | error |
| G1 | Admin grant adds enrollment + audit log | success + audit |
| G2 | Duplicate grant rejected | error |
| G3 | Non-admin cannot grant | error |
| W1 | Wallet credit → balance + ledger entry | credited |
| W2 | Debit beyond balance rejected | error |
| W3 | Wallet debit works | success |
| W4 | Non-admin cannot adjust wallet | error |
| R1 | Role change applied + audit logged | success + audit |
| R2 | Cannot promote to super_admin | error |
| R3 | Admin cannot change own role | error |
| R4 | Non-admin cannot change roles | error |
| P1 | Reset → sessions killed, old pw dead, new pw works, audit | full |
| P2 | Password shorter than 8 chars rejected | error |
| P3 | Non-admin cannot reset password | error |

---

## How to Run the Full Campaign

```powershell
# From repo root
powershell -ExecutionPolicy Bypass -File scripts/auth-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/onboarding-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/achievements-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/work-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/wallet-flow-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/support-ticket-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/payouts-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/payout-methods-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/chain-commission-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/chain-unlock-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/dashboard-tests.ps1
powershell -ExecutionPolicy Bypass -File scripts/admin-users-tests.ps1
```

Prerequisites: `scripts/init-data.ps1` (or an equivalent seeded database) so the ₹2000 Starter program,
Growth Lead position, and demo account exist.