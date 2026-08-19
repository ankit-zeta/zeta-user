# Auth (Signup / Login / Admin) — Test Report

Date: Aug 19, 2026 · Environment: production deployment `terrific-dove-836.convex.cloud`

**Result: 27 / 27 tests PASSED (0 failures).**

Run anytime: `powershell -File scripts/auth-tests.ps1`

## Coverage

### User signup (A1–A10)
- Valid signup → token + user (role `user`) + generated referral code ✓
- Duplicate email rejected ✓
- Valid referral code → `referredBy` set + referrer notified ✓
- Unknown referral code → signup still succeeds, no referrer ✓
- Email normalized to lowercase (mixed-case input) ✓
- Phone number stored ✓
- Wallet initialized (₹0) + zero enrollments ✓
- Welcome notification created ✓
- Referrer gets "New Referral Registered" notification ✓
- Missing password rejected ✓

### User login (B1–B7)
- Valid credentials ✓
- Wrong password rejected ✓
- Unknown email rejected ✓
- Case-insensitive email login ✓
- Whitespace-trimmed email login ✓
- Token works with `getSessionUser` ✓
- Logout invalidates the token (subsequent session check → null) ✓

### Suspended account (C1)
- Admin suspends user → login blocked with suspension error + existing session killed ✓
- (Account restored to active afterward)

### Admin login (D1–D6)
- Admin login → role `super_admin` ✓
- Wrong admin password rejected ✓
- Admin token works on admin functions (e.g. support tickets) ✓
- `getSessionUser` returns `super_admin` ✓
- Admin logout invalidates token ✓
- User token cannot access admin functions ✓

### Session edge cases (E1–E3)
- No token → null (no error) ✓
- Garbage token → null ✓
- Demo user login shows real enrollments ✓

## Notes
- Test users created (alice/bob/carol/dave/eve/frank `*.timestamp@zetagrow.com`) — left in DB as test accounts; can be cleaned from the admin Users page.
- Session expiry (30 days) is not directly testable via public API; covered by code inspection.