const fs = require("fs");
const path = require("path");
const base = path.join(__dirname, "website", "src", "app");
const files = [
  "(auth)/login/page.tsx",
  "(auth)/signup/page.tsx",
  "(auth)/forgot-password/page.tsx",
  "(auth)/reset-password/page.tsx",
  "(auth)/verify-email/page.tsx",
  "(public)/contact/page.tsx",
  "(public)/plans/[slug]/page.tsx",
  "(public)/programs/[slug]/page.tsx",
  "dashboard/work/[jobId]/page.tsx",
  "dashboard/profile/page.tsx",
  "dashboard/applications/page.tsx",
  "dashboard/settings/page.tsx",
  "dashboard/support/page.tsx",
  "dashboard/support/[ticketId]/page.tsx",
];
let fixed = 0;
for (const rel of files) {
  const p = path.join(base, rel);
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
  const out = lines.map((l) => {
    if (l.includes("friendlyError(err") && l.trimEnd().endsWith('");') && !l.trimEnd().endsWith('"));')) {
      fixed++;
      return l.trimEnd().slice(0, -2) + '"));';
    }
    return l;
  });
  fs.writeFileSync(p, out.join("\n"));
}
console.log("paren fixes:", fixed);