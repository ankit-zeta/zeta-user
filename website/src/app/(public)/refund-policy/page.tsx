import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Refund & Cancellation Policy</h1>
        <p className="text-xs text-textMuted">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs text-textMuted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">1. Digital Programs Are Non-Refundable</h2>
          <p>
            All ZetaGrow programs are digital products. Upon completing payment, you receive immediate,
            lifetime access to the full course content and the complete resource bundle (content libraries,
            AI prompt packs, templates, checklists, and action plans).
          </p>
          <p>
            Because the entire value is delivered instantly and is fully accessible from the moment of
            purchase, <strong className="text-textMain">no refunds or returns are available</strong> for any
            program, bundle, or resource purchase, except as described in Section 3.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">2. No Returns on Digital Goods</h2>
          <p>
            Downloaded or viewed resources cannot be returned or exchanged. This policy applies equally to
            programs purchased at full price, discounted, or through affiliate referrals. Please review the
            program contents, syllabus, and included resources carefully before completing your purchase.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">3. Exception: Erroneous or Duplicate Payments</h2>
          <p>
            The only exception is an erroneous payment — for example, a duplicate charge, an incorrect
            amount, or a payment made by mistake. In such cases, contact our support desk within 7 days of
            the payment with your payment reference, and we will verify and process a correction where
            applicable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">4. Commission Reversal on Refunds</h2>
          <p>
            In the event of an approved erroneous-payment correction, any affiliate commissions associated
            with the affected purchase will be reversed in accordance with our platform commission holding
            period policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">5. Contact</h2>
          <p>
            Questions about this policy? Contact our support desk before purchasing — we're happy to clarify
            what's included in any program.
          </p>
        </section>
      </div>
    </div>
  );
}