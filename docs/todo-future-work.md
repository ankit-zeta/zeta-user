# Future Work — Post-Launch Security & Auth Enhancements

*Created: Aug 20, 2026*

---

## 1. User-Initiated Password Reset Flow (Requires Resend + Domain)

**Status:** Blocked — needs verified domain for Resend

### Design
- `passwordResetTokens` table:
  ```ts
  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),        // secure random 32-char
    expiresAt: v.number(),    // 1 hour from creation
    used: v.boolean(),
  }).index("by_token", ["token"])
  ```

- Mutations:
  - `auth:requestPasswordReset(email)` — rate-limited 1/15min per email; generates token, stores, sends via Resend
  - `auth:resetPassword(token, newPassword)` — validates token, updates hash/salt, marks token used, kills all sessions

- Rate limit: `passwordReset:email:{email}` → 1/15min

- Email template: Resend + React Email (or plain HTML)

**Dependencies:**
- Verified domain in Resend (or use `onboarding@resend.dev` for testing only)
- `RESEND_API_KEY` in env

**Estimated effort:** ~2-3 hours once domain is verified

---

## 2. Session Rotation on Role Change

**Status:** Ready — 5-line change, no blockers

### Current behavior
`users:updateUserRole` patches the user's `role` but existing sessions retain the old `role` claim until natural expiry (30 days). Admin privilege changes don't take effect until re-login.

### Fix (in `convex/users.ts`, `updateUserRole` handler)
```ts
// After patching user role:
const sessions = await ctx.db
  .query("sessions")
  .withIndex("by_userId", (q) => q.eq("userId", args.userId))
  .collect();
for (const s of sessions) {
  await ctx.db.patch(s._id, { role: args.role });
}
```

**Alternative (stricter):** Delete all sessions → forces immediate re-login:
```ts
for (const s of sessions) {
  await ctx.db.delete(s._id);
}
```

**Decision needed:** Patch (seamless) vs Delete (force re-auth). Patch is friendlier; Delete is more secure.

**Estimated effort:** 15 minutes

---

## 3. Convex-Tier Rate Limiting

**Status:** Config-only, no code needed

### Current state
App-level rate limiting implemented via `rateLimits` table (signup, changeEmail, changePassword, deleteAccount, contact, support tickets). Works at application layer.

### Convex Cloud offerings
| Feature | Plan | Notes |
|---------|------|-------|
| Function concurrency limits | All | Dashboard → Settings → Functions → set max concurrent executions |
| Per-IP rate limiting | Enterprise only | Not available on Pro/Team |
| Request size limits | All | Built-in (default ~1MB) |
| DDoS protection | All | Cloudflare fronting |

### Recommendation
1. **Set concurrency limits** on expensive functions (e.g., `generatePayoutMethodQrUploadUrl`, `auth:login`, `affiliates:processPurchaseWithAffiliate`) to prevent accidental DoS.
2. **Keep app-level limits** — they're portable, testable, and don't require plan upgrades.
3. **Add Vercel middleware** later for edge IP throttling (free, per-region in-memory) if needed:
   ```ts
   // middleware.ts
   import { NextResponse } from "next/server";
   import { Ratelimit } from "@upstash/ratelimit"; // or in-memory Map for free tier
   ```

**Estimated effort:** 10 minutes (dashboard config) + later ~1 hour for middleware if needed

---

## Priority Order (when unblocked)

1. **Session rotation on role change** — quick win, improves security immediately
2. **Convex concurrency limits** — set once in dashboard
3. **Password reset flow** — after domain verified + Resend configured

---

*Add new items below as they arise.*