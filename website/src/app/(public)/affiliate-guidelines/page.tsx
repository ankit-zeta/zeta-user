"use client";

import React from "react";
import Link from "next/link";

export default function PartnerGuidelinesPage() {
return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Partner Program Guidelines</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      {/* Prominent de-emphasis disclaimer */}
      <div className="rounded-xl border border-borderSubtle bg-white p-5 space-y-3">
        <p className="text-sm text-textMain leading-relaxed">
          <strong>First, the important part:</strong> ZetaGrow is an online learning platform.
          Courses are what we make; work opportunities, certificates, and this small partner
          courtesy are extras — never the point, never required, and never a reason to spend
          money you weren&apos;t already planning to spend on your education.
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-xs text-textMuted">
          <li>You never have to buy anything to join, learn freely where content is free, or apply for any opportunity.</li>
          <li>You never have to sell, recruit, or promote anything to anyone.</li>
          <li>ZetaGrow is <strong>not</strong> an MLM, pyramid, network-marketing, or investment scheme — we sell education, nothing else.</li>
          <li>There are <strong>no chain commissions, team overrides, multi-level earnings, or group structures</strong> — remuneration is single-level only.</li>
          <li>No earnings are guaranteed from partner remuneration or from work. Both are competitive and merit-based.</li>
          <li>No ZetaGrow employee or representative will call you to sell programs or guarantee salary, stipend, internship, or income.</li>
        </ul>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-8">
          <h2 className="font-bold text-textMain mb-2">Overview</h2>
          <p className="text-textMuted">ZetaGrow is an education-first platform. Our Partner Program is a simple courtesy: enrolled members can share programs they have personally found valuable, and receive a thank-you remuneration when someone purchases a program through their partner link and receives full access to the curriculum. Remuneration is additionally subject to genuine-consumption verification, a standard holding period and applicable taxes — see the <Link href="/variable-remuneration-policy" className="text-brand-700 underline">Variable Remuneration Policy</Link>.</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. How It Works</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Purchase-based:</strong> A remuneration is credited when a new customer completes a genuine purchase of a program through your unique partner link and receives full curriculum access.</li>
            <li><strong>Optional:</strong> Participation is entirely voluntary. All learning and work features of the platform are fully available whether or not you take part.</li>
            <li><strong>Direct and single-level:</strong> You earn on customers you personally refer. The program has no tiers, teams, group structures, chain commissions, multi-level earnings, or override remuneration.</li>
            <li><strong>No rewards for sign-ups alone:</strong> Only completed program purchases generate remuneration.</li>
            <li><strong>No one will call you:</strong> ZetaGrow does not make unsolicited phone calls to sell programs. Our marketing is through digital channels only.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Eligibility</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>An active ZetaGrow account in good standing.</li>
            <li>Age 18 or older, legally able to enter contracts.</li>
            <li>Acceptance of these guidelines and valid tax information (PAN) on file before payouts.</li>
            <li>ZetaGrow may approve or decline participation at its discretion.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Fair Use</h2>
          <p>To keep the program fair for everyone, the following are not permitted:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Earning remuneration through your own purchases, accounts connected to you, or circular referral arrangements.</li>
            <li>Promising, implying, or guaranteeing any earnings, financial outcome, or employment result.</li>
            <li>Describing the program as an investment, ROI opportunity, or guaranteed-return scheme.</li>
            <li>Spam, unsolicited bulk messages, misleading advertising, fabricated reviews, or impersonation.</li>
            <li>Cashback or rebate offers tied to your partner link.</li>
            <li>Bidding on &ldquo;ZetaGrow&rdquo; or related brand terms in paid search advertising without written permission.</li>
          </ul>
          <p>Accounts that do not follow these guidelines may lose partner privileges, and pending remuneration may be withheld where misuse is involved.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Transparent Sharing</h2>
          <p>We ask participants to share openly and honestly, in line with applicable advertising standards (including ASCI guidelines in India):</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Let people know you earn remuneration when they purchase through your link — a simple note such as &ldquo;partner link&rdquo; works well.</li>
            <li>Place disclosures where they are easy to see, not hidden behind links or fine print.</li>
            <li>Share your own genuine experience with the program content.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Remuneration & Payouts</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Trigger:</strong> Remuneration is earned when a new customer (someone without a prior ZetaGrow account) completes a program purchase via your partner link and receives full curriculum access.</li>
            <li><strong>Holding period:</strong> Remuneration is held for a standard period to cover the refund window before becoming available for withdrawal.</li>
            <li><strong>Payout threshold:</strong> Minimum withdrawal amount applies (shown in your dashboard).</li>
            <li><strong>Payment methods:</strong> Bank transfer (NEFT/IMPS) or UPI to a verified Indian bank account, with standard KYC (PAN and bank verification).</li>
            <li><strong>Tax compliance:</strong> TDS is deducted as required under the Indian Income Tax Act; Form 16A is provided. Each participant is responsible for their own tax filings.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Program Changes</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>ZetaGrow may review partner activity and promotional content from time to time.</li>
            <li>Remuneration rates, terms, or the program itself may change; material changes will be communicated in advance where practical.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. Tax & Compliance</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Valid PAN and bank details are required for KYC before the first payout.</li>
            <li>TDS is deducted as per Sections 194H/194O of the Income Tax Act, 1961 (as applicable).</li>
            <li>Form 16A (TDS certificate) is provided quarterly.</li>
            <li>Participants are responsible for their own income tax filings and compliance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Contact</h2>
          <p>Questions about the Partner Program? Contact <a href="mailto:hey@zetagrow.in" className="text-brand-700 underline">hey@zetagrow.in</a>.</p>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-amber-800">Reverse Action for False or Frivolous Claims</h2>
          <p className="text-amber-700 text-sm">ZetaGrow reserves the right to initiate counter-legal proceedings against any individual or entity who files frivolous, malicious, or bad-faith complaints, lawsuits, or regulatory actions based on: (i) unauthorized promises made by third parties not employed by ZetaGrow; (ii) misrepresentation of the Partner Program or these guidelines; (iii) claims contradicted by the express terms of these policies which the user acknowledged and agreed to.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/refund-policy" className="text-brand-700 underline hover:text-brand-800">Refund Policy</Link> ·{" "}
            <Link href="/disclaimer" className="text-brand-700 underline hover:text-brand-800">Earnings Disclaimer</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
