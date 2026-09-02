"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
  const effectiveDate = "August 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Terms of Service</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-textMain">1. Agreement to Terms</h2>
          <p>By creating an account, accessing, or using the Zetagrow Edutech and Solutions (ZetaGrow) platform ("Platform") — including the website, mobile applications, learning courses, verifiable credentialing system, digital wallet, work marketplace, and any related services (collectively, the "Services") — you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, Refund Policy, and all other policies referenced herein (collectively, the "Agreement"). If you do not agree to these Terms, you must not access or use the Platform.</p>
          <p className="text-textMuted">We reserve the right to modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Continued use of the Platform after such changes constitutes acceptance of the revised Terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>"Platform"</strong> — The Zetagrow Edutech and Solutions (ZetaGrow) website, applications, APIs, and all related services.</li>
            <li><strong>"User" / "You"</strong> — Any individual or entity who registers an account or accesses the Platform.</li>
            <li><strong>"Program" / "Curriculum"</strong> — A structured educational module or bundle comprising text lessons, downloadable resources, templates, and assessments.</li>
            <li><strong>"Certificate"</strong> — A verifiable, tamper-evident digital credential issued upon successful completion of a Program.</li>
            <li><strong>"Work Marketplace"</strong> — The curated marketplace within the Platform where Clients post project opportunities and qualified Users may apply.</li>
            <li><strong>"Client" / "Work Provider"</strong> — An individual or entity posting project opportunities on the Work Marketplace.</li>
            <li><strong>"Referral Program"</strong> — The optional program allowing Users to earn referral commissions by referring new Customers who purchase Programs.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Educational Services & Digital Content</h2>
          <p>Zetagrow Edutech and Solutions (ZetaGrow) is an <strong>education-first platform</strong>. Our primary service is the delivery of structured, self-paced educational curricula covering digital skills, business execution, marketing, operations, and professional development. Upon purchasing a Program, you receive immediate, lifetime access to:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Structured, self-paced text-based lessons and modules</li>
            <li>Downloadable resource bundles (templates, checklists, AI prompt packs, guides, resource libraries)</li>
            <li>Self-assessment quizzes and completion tracking</li>
            <li>Verifiable digital Certificate upon successful completion</li>
          </ul>
          <p>All content is provided for <strong>personal, non-commercial professional development</strong> only. You may not reproduce, distribute, sublicense, resell, or create derivative works from proprietary curriculum content without express written permission. Access is granted for your individual use only; sharing login credentials or distributing content to third parties is strictly prohibited and may result in immediate account termination.</p>
          <p><strong>Purchases are entirely voluntary.</strong> You are never required, pressured, or expected to purchase any Program or Plan in order to create an account, remain on the Platform, apply to Work Marketplace listings, or receive payouts for approved deliverables. Education is what we sell; opportunity access is not conditioned on buying it.</p>
        </section>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5 my-6">
          <h2 className="font-bold text-green-800 mb-2">Our Commitment: No Pressure, No Force Selling, No Misleading Guarantees</h2>
          <p className="text-green-700 text-sm leading-relaxed">
            <strong>ZetaGrow does not engage in force selling, high-pressure tactics, or aggressive sales practices.</strong> We are an education platform with a work portal — nothing more. Here is what this means for you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-green-700 text-sm mt-3">
            <li><strong>Complete freedom of choice:</strong> Every purchase decision is entirely yours. You are never required, obligated, or pressured to buy any course, plan, or service.</li>
            <li><strong>No mandatory purchases:</strong> You can create an account, access free content, apply to work opportunities, and use platform features without spending any money.</li>
            <li><strong>No pressure to earn:</strong> The Partner Program is completely optional. You never have to recruit, sell, or promote anything to anyone.</li>
            <li><strong>No hidden obligations:</strong> There are no hidden fees, mandatory upsells, or required purchases to maintain your account or access features.</li>
            <li><strong>Respectful communication:</strong> We will never use fear, urgency, guilt, or misleading claims to encourage purchases. Our marketing is informational, not coercive.</li>
            <li><strong>No calls to sell:</strong> ZetaGrow does not make unsolicited phone calls to sell programs. Our marketing is through digital channels only.</li>
            <li><strong>No income, salary, or internship guarantees:</strong> No ZetaGrow employee, representative, or partner is authorized to guarantee you a fixed salary, stipend, internship, job placement, or any specific income. Any such promise is unauthorized and does not bind ZetaGrow.</li>
            <li><strong>Right to walk away:</strong> You may stop using the Platform at any time. There are no cancellation fees, no lock-in periods, and no penalties for not purchasing.</li>
          </ul>
          <p className="text-green-700 text-sm mt-3">
            If you ever feel pressured or coerced into making a purchase, please contact us immediately at <a href="mailto:hey@zetagrow.in" className="underline font-medium">hey@zetagrow.in</a>. We take such complaints seriously and will investigate promptly.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Work Marketplace — No Employment Guarantee</h2>
          <p>The Work Marketplace is a <strong>curated marketplace</strong> connecting qualified Users with Clients posting project opportunities. Participation is governed by the following principles:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>No Purchase Necessary:</strong> Many listings require no certificate whatsoever — selection for those is based purely on CV, portfolio, and relevant experience. Where a specific listing references a ZetaGrow certificate as a prerequisite, that reflects the end-client's demand for verified skills on their project (we deliver this client work ourselves and must uphold quality), never a tactic to drive course sales.</li>
            <li><strong>No Employment Guarantee:</strong> Completing any Program, earning a Certificate, or applying to a project does <strong>not</strong> guarantee employment, project selection, internship, stipend, salary, or any form of income — before or after certification. The marketplace is competitive, and work is awarded to the candidate whose skills and experience best match each brief. Work selection is determined solely by Client requirements, deliverable quality standards, and competitive evaluation.</li>
            <li><strong>Merit-Based Selection:</strong> Clients evaluate applications based on demonstrated skills, Certificate verification where applicable, portfolio quality, proposed deliverables, and competitive pricing. Zetagrow Edutech and Solutions (ZetaGrow) does not influence or guarantee selection outcomes.</li>
            <li><strong>No Daily Work Guarantee:</strong> The Work Marketplace does not promise daily work, consistent project flow, or minimum income. Project availability fluctuates based on Client demand.</li>
            <li><strong>Independent Contractor Status:</strong> Any work performed through the Marketplace is as an independent contractor. You are responsible for your own taxes, benefits, and compliance with local laws.</li>
            <li><strong>Deliverable Standards:</strong> Accepted work must meet the Client's stated requirements, quality standards, and deadlines. Revisions may be requested. Payment is released upon Client acceptance or automatic approval per the escrow terms.</li>
          </ul>
        </section>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-6">
          <h2 className="font-bold text-amber-800 mb-2">Important: No One From ZetaGrow Will Call You to Sell</h2>
          <p className="text-amber-700 text-sm leading-relaxed">
            <strong>ZetaGrow does not make unsolicited phone calls to sell programs or collect payments.</strong> Our marketing is conducted exclusively through digital advertising (online ads, social media, email campaigns). Here is what this means:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-amber-700 text-sm mt-3">
            <li><strong>No cold calls:</strong> ZetaGrow employees, representatives, or partners will never call you to pressure you into buying a program or making a payment.</li>
            <li><strong>No salary, stipend, or internship guarantees:</strong> No ZetaGrow employee, representative, or partner is authorized to guarantee you a fixed salary, stipend, internship, job placement, or any specific income. Any such promise made by any person is unauthorized and does not bind ZetaGrow.</li>
            <li><strong>No chain or team earnings:</strong> ZetaGrow does not operate any chain commission, team override, multi-level, or group earning structure. The Partner Program is a single-level referral reward for genuine course purchases — nothing more.</li>
            <li><strong>Your decision, your responsibility:</strong> Any decision to purchase a program is entirely yours and yours alone. ZetaGrow is not responsible for any purchase made based on unauthorized promises by third parties.</li>
          </ul>
        </div>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Partner Program — Optional & Product-Centric</h2>
          <p>Our optional Partner Program allows Users to earn partner remuneration by referring new Customers who purchase Programs. The program operates under these strict principles:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>ZetaGrow is not an MLM, pyramid, network-marketing, recruitment, or investment scheme.</strong> We sell one thing: education. There are no positions to buy, no teams to build, no chain commissions, no multi-level earnings, no team overrides, and no returns promised on any payment. Any suggestion otherwise misrepresents the Platform.</li>
            <li><strong>Single-Level Only:</strong> Partner remuneration is paid <strong>only</strong> on purchases made by customers you personally referred. There are no tiers, teams, group structures, chain commissions, or override earnings of any kind.</li>
            <li><strong>Nothing to Sell:</strong> You are never asked, incentivized beyond stated remuneration, or required to sell, recruit, promote, or market anything to anyone. Treating referrals as anything other than a minor courtesy is against these Terms.</li>
            <li><strong>Product-Centric:</strong> Remuneration is generated <strong>only</strong> upon the genuine retail purchase of a legitimate Program by a new Customer who receives full access to the curriculum. No remuneration is paid for recruitment, enrollment, or sign-ups alone.</li>
            <li><strong>Voluntary Participation:</strong> Enrollment is optional and auxiliary to the genuine educational value of the Programs. You may use the Platform fully without participating.</li>
            <li><strong>Prohibited Conduct:</strong> Self-referrals, circular referrals, fraudulent loops, misleading income representations, promising guaranteed earnings, presenting the Partner Program as an investment or passive income opportunity, and any form of spam or deceptive marketing are strictly prohibited and will result in immediate account termination and forfeiture of pending remuneration.</li>
            <li><strong>Remuneration Holding Period:</strong> Remuneration is held for a standard period to account for refund windows and chargebacks before becoming available for withdrawal.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Accounts & Security</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>You must provide accurate, current, and complete registration information and keep it updated.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
            <li>You must notify us immediately of any unauthorized use or suspected security breach.</li>
            <li>We may suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a security risk.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. Intellectual Property</h2>
          <p>All content, curriculum, templates, software, trademarks, logos, and design elements on the Platform are owned by or licensed to Zetagrow Edutech and Solutions (ZetaGrow) and protected by copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the content solely for your personal professional development. No rights are granted to reproduce, modify, distribute, or create derivative works.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Payments, Fees & Taxes</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>All Program prices are in INR and include applicable taxes unless otherwise stated.</li>
            <li>Payment is processed via our integrated payment partners. You are responsible for any transaction fees charged by your payment provider.</li>
            <li>Work Marketplace payouts are subject to platform fees and applicable tax withholding as per Indian law.</li>
            <li>You are solely responsible for reporting and remitting any taxes applicable to your earnings or purchases.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">9. Disclaimers & Limitation of Liability</h2>
          <p className="text-textMuted"><strong>EDUCATIONAL PURPOSE ONLY.</strong> The Platform provides educational content and a marketplace for independent work opportunities. Zetagrow Edutech and Solutions (ZetaGrow) does not guarantee:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Any specific income, earnings, financial returns, or return on investment.</li>
            <li>Job placement, project selection, or consistent work availability.</li>
            <li>Specific career outcomes, salary increases, or business success.</li>
            <li>That the skills taught will be applicable or in demand in any particular market.</li>
          </ul>
          <p className="text-textMuted">Your results depend entirely on your individual effort, aptitude, market conditions, and client demand. Past performance of other Users does not guarantee similar results.</p>
          <p className="text-textMuted">TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZETAGROW AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM OR RELATED TO YOUR USE OF THE PLATFORM. OUR AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO ZETAGROW IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">10. Indemnification & Reverse Action for Frivolous Claims</h2>
          <p className="text-textMuted">You agree to indemnify, defend, and hold harmless Zetagrow Edutech and Solutions (ZetaGrow) and its affiliates, officers, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from or related to: (a) your use of the Platform in violation of these Terms; (b) your violation of any third-party rights; (c) your content, submissions, or deliverables; (d) your negligence or willful misconduct.</p>
          <p className="text-textMuted mt-3"><strong>Reverse Action for False or Frivolous Complaints:</strong> Zetagrow reserves the right to initiate counter-legal proceedings against any individual or entity who files frivolous, malicious, or bad-faith complaints, lawsuits, or regulatory actions against ZetaGrow, its founders, directors, employees, or agents — particularly where such actions are based on: (i) unauthorized promises made by third parties not employed by or authorized by ZetaGrow; (ii) misrepresentation of the Platform's services, policies, or guarantees; (iii) claims contradicted by the express terms of these policies which the user acknowledged and agreed to; or (iv) attempts to coerce settlement through baseless litigation. In such cases, ZetaGrow will seek full recovery of all legal costs, damages, lost business, and reputational harm caused by such frivolous actions, to the maximum extent permitted by applicable law.</p>
          <p className="text-textMuted mt-3"><strong>Acknowledgment:</strong> By creating an account or using the Platform, you acknowledge that you have read, understood, and agreed to all policies linked from the signup page and the Terms of Service. You further acknowledge that no ZetaGrow employee, representative, or partner has made any promise, guarantee, or representation contrary to the express terms of these policies. Any such unauthorized promise is void and does not create liability for ZetaGrow.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">11. Termination</h2>
          <p className="text-textMuted">We may suspend or terminate your account and access to the Platform at any time, with or without cause, including for violation of these Terms, fraudulent activity, extended inactivity (12+ months), or legal compliance requirements. Upon termination, your license to access Programs terminates immediately. Earned but unpaid Work Marketplace payouts will be processed per the standard payout schedule. Referral commissions pending holding period may be forfeited.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">12. Governing Law & Dispute Resolution</h2>
          <p className="text-textMuted">These Terms are governed by the laws of India. Any disputes arising from or related to these Terms shall be resolved exclusively in the courts of competent jurisdiction in [City/State], India. You waive any right to class action or jury trial.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">13. Contact</h2>
          <p className="text-textMuted">Questions about these Terms? Contact our legal team at <a href="mailto:legal@zetagrow.com" className="text-brand-700 underline">legal@zetagrow.com</a> or through our support desk.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link> ·{" "}
            <Link href="/refund-policy" className="text-brand-700 underline hover:text-brand-800">Refund Policy</Link> ·{" "}
            <Link href="/affiliate-guidelines" className="text-brand-700 underline hover:text-brand-800">Affiliate Guidelines</Link> ·{" "}
            <Link href="/disclaimer" className="text-brand-700 underline hover:text-brand-800">Earnings Disclaimer</Link>
          </p>
        </div>
      </div>
    </div>
  );
}