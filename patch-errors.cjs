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

let totalReplaced = 0;
for (const rel of files) {
  const p = path.join(base, rel);
  let src = fs.readFileSync(p, "utf8");
  const before = (src.match(/err\??\.message\s*\|\|\s*"/g) || []).length;

  src = src.replace(/(err)\?\.message\s*\|\|\s*"/g, 'friendlyError($1, "');
  src = src.replace(/(err)\.message\s*\|\|\s*"/g, 'friendlyError($1, "');

  if (!src.includes('from "@/lib/errors"')) {
    if (/^"use client";\r?\n/.test(src)) {
      src = src.replace(/^("use client";\r?\n)/, '$1\nimport { friendlyError } from "@/lib/errors";\n');
    } else {
      src = `import { friendlyError } from "@/lib/errors";\n\n` + src;
    }
  }

  fs.writeFileSync(p, src);
  totalReplaced += before;
  console.log(rel.padEnd(45), "replaced:", before);
}
console.log("TOTAL replaced:", totalReplaced);