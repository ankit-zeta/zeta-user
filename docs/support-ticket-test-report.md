# Support Ticket System — Test Report

Date: Aug 19, 2026 · Environment: production deployment `terrific-dove-836.convex.cloud`

**Result: 36 / 36 tests PASSED (0 failures).**

Run the suite anytime: `powershell -File scripts/support-ticket-tests.ps1`

## Coverage

### User flow — raise ticket (T1–T5)
- T1 createTicket valid → tracking ID `ZT-XXXXXX` format ✓
- T2 invalid category rejected ✓
- T3 title < 5 chars rejected ✓
- T4 message < 10 chars rejected ✓
- T5 invalid token rejected ✓

### User flow — list & detail (T6–T9)
- T6 getMyTickets returns all my tickets ✓
- T7 getTicketDetail own ticket ✓
- T8 other user's ticket forbidden ✓
- T9 invalid ticket id rejected ✓

### User flow — replies (T10–T12)
- T10 reply to own ticket ✓
- T11 empty reply rejected ✓
- T12 replying to another user's ticket forbidden ✓

### Attachments (T13)
- Image upload via `generateTicketUploadUrl` → storageId stored → resolved to signed URL on read ✓
- Link attachments stored and returned verbatim ✓

### Public tracking (T14–T16)
- Lookup by tracking ID (case-insensitive) + email ✓
- Wrong email rejected ✓
- Nonexistent ID rejected ✓

### Security — user vs admin (T17–T19)
- User calling `getSupportTickets`, `adminReplyTicket`, `updateTicketStatus` → all forbidden ✓

### Admin flow (T20–T25)
- List all, filter by status, filter by category, search by tracking ID, search by user ✓
- Full thread detail ✓

### Admin reply / notification / status / audit (T26–T31)
- Admin reply auto-sets `in_progress` ✓
- Empty admin reply rejected ✓
- User receives notification with ticket link (`/dashboard/support/...`) ✓
- Status update to `resolved` ✓
- Invalid status value rejected ✓
- Admin actions written to `auditLogs` (entityType `supportTickets`) ✓

### Data integrity (T32–T36)
- Tracking IDs unique across all tickets ✓
- Every ticket complete (user, category, status, timestamps; updatedAt ≥ createdAt) ✓
- 8 categories exposed ✓
- Legacy `contactInquiries` unaffected ✓
- Every thread message valid (sender user|admin, non-empty content) ✓

## Bugs found & fixed during testing

1. **Website image upload bug** — storage upload response is `{"storageId":"..."}`, not a plain ID. The site code stored the raw JSON string as the attachment URL. Fixed in both `website/src/app/dashboard/support/page.tsx` and `[ticketId]/page.tsx` (`JSON.parse(await resp.text()).storageId`).
2. **Test-data pollution** — one ticket created during debugging carried a corrupted attachment URL (which makes `storage.getUrl` throw on read). Purged via one-off cleanup mutation (removed afterward).

## Test accounts used

- demo@zetagrow.com (Rahul Sharma) — user flows
- priya.test@zetagrow.com — second user (ownership/forbidden tests) — left in DB as a test account
- admin@zetagrow.com — admin flows