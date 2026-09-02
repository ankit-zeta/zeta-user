import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Variable Remuneration Policy",
  description:
    "How ZetaGrow calculates, verifies and pays partner remuneration — genuine-purchase requirement, single-level structure, holding periods and tax compliance.",
};

const sections = [
  {
    h: "1. Purpose",
    p: "This policy explains how ZetaGrow may pay variable remuneration (referred to as “remuneration” or “partner reward”) to eligible users who voluntarily share our courses. It exists so that every participant — and any observer — can see exactly when, why and how much is paid. ZetaGrow is an education platform: remuneration is a marketing cost we choose to share for real sales of real courses, nothing more.",
  },
  {
    h: "2. Core Principles",
    list: [
      "Product-only basis — remuneration exists only after a completed, paid course purchase by another person. No payment is made for sign-ups, clicks, traffic or recruitment.",
      "Single level — remuneration is paid only on purchases made by learners you personally referred. There are no team, group, or override structures of any kind.",
      "Genuine consumption required — every sale must pass a consumption check before the associated remuneration becomes active (see Section 4).",
      "No guarantees — participation does not guarantee any referral activity, income or outcome. Remuneration is variable and depends entirely on third-party purchase decisions.",
    ],
  },
  {
    h: "3. Qualifying Sale",
    p: "A “Qualifying Sale” means: (a) a person who did not previously hold a ZetaGrow account completes payment for a published course plan through your partner link; (b) the purchase is not self-referred or connected to you (same person, household, device cluster or payment instrument); and (c) the buyer demonstrates genuine course usage by completing at least one lesson inside their dashboard.",
  },
  {
    h: "4. Consumption Verification",
    p: "For every referred purchase, the platform records whether the buyer has begun actually using the course. The remuneration is flagged as awaiting consumption until this first verified usage event occurs. Only then does it enter the standard approval workflow. This protects the integrity of the program: rewards follow delivered education, not transactions alone. Usage records (lesson completion timestamps) form part of ZetaGrow’s audit trail.",
  },
  {
    h: "5. Calculation & Limits",
    list: [
      "Remuneration percentage and calculation method are configured by ZetaGrow administration and shown in your partner dashboard.",
      "Where enabled, a per-sale cap may limit the maximum remuneration payable on any single sale; current values are visible in admin-configured settings.",
    ],
  },
  {
    h: "6. Holding Period & Payouts",
    list: [
      "Activated remuneration enters a 30-day holding period from the sale date to cover chargebacks and payment disputes.",
      "After the holding period and administrative approval, remuneration moves to your wallet and becomes withdrawable per the platform’s withdrawal rules (minimum thresholds, KYC via PAN and bank verification).",
      "TDS is deducted as applicable under the Income Tax Act, 1961; Form 16A is issued quarterly. Each participant is responsible for their own tax filings.",
    ],
  },
  {
    h: "7. Prohibited Conduct",
    list: [
      "Self-referrals, purchases through your own accounts, or coordinated circular purchasing.",
      "Promising income, returns, employment or any financial outcome to induce participation.",
      "Describing the partner program as an investment, ROI scheme, business opportunity or membership in a network.",
      "Spam, unsolicited bulk messaging, impersonation or fabricated claims about ZetaGrow.",
    ],
  },
  {
    h: "8. Reversals & Adjustments",
    p: "If a referred purchase is cancelled, disputed or determined fraudulent, the associated remuneration — at any stage (awaiting, held, approved or paid) — may be reversed or clawed back, including by adjustment against future remuneration. ZetaGrow may update remuneration rates or this policy prospectively; material changes will be communicated where practical.",
  },
  {
    h: "9. Relationship to ZetaGrow",
    p: "Participants in the partner program act as independent promoters of our courses. Nothing in this policy creates employment, agency, partnership or joint venture. Participation is optional and separate from learning; you may use all purchased courses fully without ever referring anyone.",
  },
];

export default function VariableRemunerationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Variable Remuneration Policy</h1>
        <p className="text-xs text-textMuted">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} · Applies to the optional ZetaGrow Referral Program
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        {sections.map((s) => (
          <section key={s.h} className="space-y-3">
            <h2 className="font-bold text-textMain">{s.h}</h2>
            {s.p && <p>{s.p}</p>}
            {s.list && (
              <ul className="list-disc pl-6 space-y-2">
                {s.list.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">10. Contact</h2>
          <p>
            Questions about this policy? Contact{" "}
            <a href="mailto:hey@zetagrow.in" className="text-brand-700 underline">hey@zetagrow.in</a>.
          </p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/affiliate-guidelines" className="text-brand-700 underline hover:text-brand-800">Partner Program Guidelines</Link> ·{" "}
            <Link href="/disclaimer" className="text-brand-700 underline hover:text-brand-800">Earnings Disclaimer</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
