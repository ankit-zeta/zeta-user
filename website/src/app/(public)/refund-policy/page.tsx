"use client";

import React from "react";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Refund & Cancellation Policy</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
          <h2 className="font-bold text-green-800 mb-2">No Pressure, No Force Selling</h2>
          <p className="text-green-700">
            <strong>ZetaGrow does not force, pressure, or coerce anyone into purchasing courses or any other service.</strong> Every purchase is entirely voluntary and made at your own discretion. We are an education platform — we sell courses, and that is all. You are never required to buy anything to use our platform, access free content, or apply to work opportunities. If you ever feel pressured into making a purchase, contact us immediately at <a href="mailto:hey@zetagrow.in" className="underline font-medium">hey@zetagrow.in</a>.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <h2 className="font-bold text-textMain mb-2">Important: Digital Programs Are Non-Refundable</h2>
          <p className="text-textMuted">All ZetaGrow programs are digital products. Upon completing payment, you receive immediate, lifetime access to the full course content and the complete resource bundle (content libraries, AI prompt packs, templates, checklists, action plans, and resource libraries).</p>
          <p className="mt-2"><strong className="text-textMain">Because the entire value is delivered instantly and is fully accessible from the moment of purchase, no refunds or returns are available</strong> for any program, bundle, or resource purchase, except as strictly described in Section 3 below.</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. Digital Programs Are Non-Refundable</h2>
          <p>All ZetaGrow programs are digital products delivered instantly upon payment confirmation. Upon completing payment, you receive immediate, lifetime access to:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>The complete curriculum (all modules, lessons, and assessments)</li>
            <li>The full resource bundle (content libraries, AI prompt packs, templates, checklists, action plans, and resource libraries)</li>
            <li>Progress tracking, assessments, and Certificate eligibility</li>
          </ul>
          <p>Because the entire value is delivered instantly and is fully accessible from the moment of purchase, <strong className="text-textMain">no refunds, returns, exchanges, or credits are available</strong> for any program, bundle, or resource purchase, regardless of whether you have accessed, downloaded, or completed the content.</p>
          <p>This policy applies equally to programs purchased at full price, discounted prices, through affiliate referrals, or as part of any promotion.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. No Returns on Digital Goods</h2>
          <p>Digital goods cannot be "returned" in the traditional sense. Once accessed, the knowledge, templates, prompts, and resources cannot be unlearned or returned. This policy applies equally to:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Programs purchased at full price</li>
            <li>Programs purchased at discounted or promotional prices</li>
            <li>Programs purchased through affiliate referrals</li>
            <li>Bundle purchases (multiple programs purchased together)</li>
          </ul>
          <p>Please review the program contents, syllabus, included resources, duration, and outcomes carefully <strong>before</strong> completing your purchase. We provide detailed syllabi, module lists, and resource previews on each Program page to help you make an informed decision.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Exception: Erroneous or Duplicate Payments Only</h2>
          <p>The <strong>sole exception</strong> to this non-refundable policy is an objectively erroneous payment, defined strictly as:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>A duplicate charge for the same Program (same email, same Program, same amount, within 24 hours)</li>
            <li>An incorrect amount charged (system error resulting in overcharge)</li>
            <li>A payment made by demonstrable mistake (e.g., accidental double-click resulting in two identical orders)</li>
          </ul>
          <p>To request correction for an erroneous payment, you <strong>must</strong> contact our support desk within <strong>7 calendar days</strong> of the payment with:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Your payment reference / order ID</li>
            <li>Clear explanation of the error</li>
            <li>Supporting evidence (screenshots, bank statement showing duplicate charge)</li>
          </ul>
          <p>We will verify and process a correction where applicable. Approved corrections result in a refund to the original payment method within 7-10 business days. No exceptions will be made for change of mind, dissatisfaction with content, financial hardship, lack of time, or unmet expectations.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Commission Reversal on Approved Corrections</h2>
          <p>In the event of an approved erroneous-payment correction, any affiliate referral commissions associated with the affected purchase will be reversed in accordance with our platform commission holding period policy. The referring affiliate will be notified of the reversal.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Subscription Cancellations (If Applicable)</h2>
          <p>ZetaGrow Programs are one-time purchases, not recurring subscriptions. There are no recurring charges to cancel. If we introduce subscription-based offerings in the future, this policy will be updated accordingly with clear cancellation terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Work Marketplace Payments</h2>
          <p>This policy applies only to Program purchases. Work Marketplace payouts, escrow releases, and withdrawal requests are governed by the Payment Terms and Work Marketplace Terms, not this Refund Policy. Client payments for completed and accepted deliverables are final and non-refundable.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Contact Before Purchasing</h2>
          <p>We strongly encourage you to review the program syllabus, duration, included resources, and outcomes carefully before purchasing. Our support team is happy to clarify what is included in any Program to ensure you make an informed decision.</p>
          <p>Contact us at <a href="mailto:hey@zetagrow.in" className="text-brand-700 underline">hey@zetagrow.in</a> with any pre-purchase questions.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link> ·{" "}
            <Link href="/payment-terms" className="text-brand-700 underline hover:text-brand-800">Payment Terms</Link> ·{" "}
            <Link href="/affiliate-guidelines" className="text-brand-700 underline hover:text-brand-800">Affiliate Guidelines</Link>
          </p>
        </div>
      </div>
    </div>
  );
}