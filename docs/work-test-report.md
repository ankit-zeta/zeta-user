# Work Page Feature Pack — Test Report

Date: 2026-08-19
Suite: `scripts/work-tests.ps1` (13 tests) — HTTP API against `https://terrific-dove-836.convex.cloud`

## Result: 13/13 PASS

### Cover Image Upload + Job Creation
| ID | Test | Result |
|----|------|--------|
| J1 | `jobs:generateJobCoverUploadUrl` action returns signed upload URL, file PUT succeeds and returns a storageId | PASS |
| J2 | Admin creates job with `company` + `coverImageStorageId` | PASS |
| J3 | New job auto-appears in `jobs:getPublicJobs` with resolved `coverImageUrl` (no rebuild/refetch needed — realtime) | PASS |
| J4 | Uploaded cover image is actually downloadable via the resolved URL | PASS |

### Eligibility Gating (Program Completion — not enrollment)
| ID | Test | Result |
|----|------|--------|
| G1 | User without certificate → `isEligible: false` + "must complete" message | PASS |
| G2 | Server blocks application submission for user without certificate (status `error`) | PASS |
| G3 | Completing 100% of lessons (grant → course player → toggle all lessons) auto-issues certificate | PASS |
| G4 | Certificate holder CAN apply — server-enforced gate allows insert | PASS |
| G5 | Duplicate application for same job rejected | PASS |

### Update / Delete / Permissions
| ID | Test | Result |
|----|------|--------|
| J5 | `jobs:updateJob` updates fields and PRESERVES cover image when storageId omitted | PASS |
| J6 | Non-admin cannot delete job | PASS |
| J7 | Admin delete job → removed from public list + `DELETE_JOB` audit log written | PASS |
| J8 | Non-admin cannot create job | PASS |

## Bugs Found & Fixed During Testing
1. **`session.role` never exists** — sessions table has no `role` field, so the eligibility gate condition `session.role === "user"` never fired. The gate was effectively dead code. Fixed in `convex/applications.ts` (and the same latent bug in `convex/learning.ts` `isEnrolled`) to load the user from the DB and check `user.role`.
2. **`updateJob` wiped the cover image** when `coverImageStorageId` was omitted from the update payload. Fixed to preserve existing values when args are `undefined` (`convex/jobs.ts`).
3. **Test-script issues**: Convex documents expose `_id` (not `id`); `getAuditLogs` has no `limit` arg; course player returns lessons nested under `modules`.

## Known Limitation
The Convex raw HTTP API (`/api/mutation`) surfaces thrown handler errors as `[Request ID: …] Server Error` — the underlying message IS thrown server-side (visible in `npx convex logs`) but the HTTP envelope wraps it. G2 therefore asserts the server BLOCK (status `error`), consistent with all other suites in this repo. If clean client-side error messages are required in the UI, they should be mapped from the function response (e.g. returned field) rather than the HTTP error body.
