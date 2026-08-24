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
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Work Marketplace — No Employment Guarantee</h2>
          <p>The Work Marketplace is a <strong>curated marketplace</strong> connecting qualified Users with Clients posting project opportunities. Participation is governed by the following principles:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>No Employment Guarantee:</strong> Completing any Program, earning a Certificate, or applying to a project does <strong>not</strong> guarantee employment, project selection, or any form of income. Work selection is determined solely by Client requirements, deliverable quality standards, and competitive evaluation.</li>
            <li><strong>Merit-Based Selection:</strong> Clients evaluate applications based on demonstrated skills, Certificate verification, portfolio quality, proposed deliverables, and competitive pricing. Zetagrow Edutech and Solutions (ZetaGrow) does not influence or guarantee selection outcomes.</li>
            <li><strong>No Daily Work Guarantee:</strong> The Work Marketplace does not promise daily work, consistent project flow, or minimum income. Project availability fluctuates based on Client demand.</li>
            <li><strong>Independent Contractor Status:</strong> Any work performed through the Marketplace is as an independent contractor. You are responsible for your own taxes, benefits, and compliance with local laws.</li>
            <li><strong>Deliverable Standards:</strong> Accepted work must meet the Client's stated requirements, quality standards, and deadlines. Revisions may be requested. Payment is released upon Client acceptance or automatic approval per the escrow terms.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Referral Program — Optional & Product-Centric</h2>
          <p>Our optional Referral Program allows Users to earn referral commissions by referring new Customers who purchase Programs. The program operates under these strict principles:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Product-Centric:</strong> Commissions are generated <strong>only</strong> upon the genuine retail purchase of a legitimate Program by a new Customer who receives full access to the curriculum. No commission is paid for recruitment, enrollment, or sign-ups alone.</li>
            <li><strong>Voluntary Participation:</strong> Enrollment is optional and auxiliary to the genuine educational value of the Programs. You may use the Platform fully without participating.</li>
            <li><strong>Prohibited Conduct:</strong> Self-referrals, circular referrals, fraudulent loops, misleading income representations, promising guaranteed earnings, presenting the Referral Program as an investment or passive income opportunity, and any form of spam or deceptive marketing are strictly prohibited and will result in immediate account termination and forfeiture of pending commissions.</li>
            <li><strong>Commission Holding Period:</strong> Commissions are held for a defined holding period (typically 30 days) to account for refund windows and chargebacks before becoming available for withdrawal.</li>
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
          <h2 className="font-bold text-textMain">10. Indemnification</h2>
          <p className="text-textMuted">You agree to indemnify, defend, and hold harmless Zetagrow Edutech and Solutions (ZetaGrow) and its affiliates, officers, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from or related to: (a) your use of the Platform in violation of these Terms; (b) your violation of any third-party rights; (c) your content, submissions, or deliverables; (d) your negligence or willful misconduct.</p>
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