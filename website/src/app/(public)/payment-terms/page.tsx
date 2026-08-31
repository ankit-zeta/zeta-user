"use client";

import React from "react";
import Link from "next/link";

export default function PaymentTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Payment Terms</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

            <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-8">
        <h2 className="font-bold text-textMain mb-2">Secure Payments</h2>
        <p>All payments on ZetaGrow are processed through a PCI-DSS compliant payment gateway. We support UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), and Net Banking from all major Indian banks. Your payment information is encrypted and never stored on our servers.</p>
      </div>
<div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. Program Purchases</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Currency:</strong> All Program prices are in Indian Rupees (INR) and include applicable GST unless otherwise stated.</li>            <li><strong>Payment Methods:</strong> Credit/Debit cards, Net Banking, UPI, and Wallets via our payment partner (Razorpay).</li>
            <li><strong>Immediate Access:</strong> Upon successful payment, you receive immediate, lifetime access to the full Program content and resource bundle.</li>
            <li><strong>Payment Confirmation:</strong> Access is granted upon successful payment confirmation by our payment partner. In case of payment failure, access will not be granted.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Work Marketplace Payments</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Escrow Model:</strong> Client payments for accepted deliverables are held in escrow and released upon Client acceptance or automatic approval (72 hours after submission if no action).</li>
            <li><strong>Platform Fee:</strong> ZetaGrow deducts a platform fee (percentage disclosed on the Work Marketplace) from each completed project payout.</li>
            <li><strong>Payout Schedule:</strong> Approved payouts are processed within 2-3 business days to your verified wallet.</li>
            <li><strong>Minimum Withdrawal:</strong> Minimum withdrawal threshold applies (shown in your dashboard).</li>
            <li><strong>Payment Methods:</strong> Bank transfer (NEFT/IMPS) or UPI to verified Indian bank account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Wallet & Balances</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Available Balance:</strong> Funds available for immediate withdrawal.</li>
            <li><strong>Pending Balance:</strong> Funds from completed projects within the 72-hour approval window or pending client approval.</li>
            <li><strong>Non-Withdrawable:</strong> Bonus credits, promotional credits, and pending commissions cannot be withdrawn until they become available.</li>
            <li><strong>No Interest:</strong> Wallet balances do not earn interest.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Fees & Charges</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Program Purchases:</strong> No additional platform fees. Price shown includes GST.</li>
            <li><strong>Work Marketplace:</strong> Platform fee deducted from each completed project (rate displayed on project listing).</li>
            <li><strong>Withdrawal Fees:</strong> Standard bank transfer/UPI fees may apply (disclosed at withdrawal).</li>
            <li><strong>Chargebacks:</strong> Any chargeback fees incurred due to disputed payments are passed on to the User.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Tax Compliance</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>GST:</strong> Program prices include applicable GST as per Indian tax regulations.</li>
            <li><strong>TDS on Payouts:</strong> TDS deducted as per applicable sections of the Income Tax Act, 1961 on Work Marketplace payouts and affiliate commissions.</li>
            <li><strong>Form 16A:</strong> Provided quarterly for TDS deducted.</li>
            <li><strong>User Responsibility:</strong> You are solely responsible for your own income tax filings, advance tax, and compliance with applicable tax laws.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Withdrawals</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Minimum withdrawal amount applies (shown in your dashboard).</li>
            <li>Withdrawals processed within 2-3 business days.</li>
            <li>KYC (PAN + bank verification) required before first withdrawal.</li>
            <li>Withdrawal to verified Indian bank account (NEFT/IMPS) or UPI only.</li>
            <li>Incorrect bank details resulting in failed transfer may incur re-processing fees.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. Chargebacks & Disputes</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Chargebacks on Program purchases result in immediate account suspension and loss of Program access.</li>
            <li>Chargeback fees incurred are passed on to the User.</li>
            <li>Work Marketplace disputes resolved per escrow terms; chargebacks on released payouts may result in account termination.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Refunds</h2>
          <p>Digital Program purchases are non-refundable per our <a href="/refund-policy" className="text-brand-700 underline">Refund Policy</a>. Work Marketplace payouts for accepted deliverables are final and non-refundable.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">9. Payment Disputes</h2>
          <p>Contact <a href="mailto:payments@zetagrow.com" className="text-brand-700 underline">payments@zetagrow.com</a> for payment inquiries. Disputes resolved per the Terms of Service dispute resolution clause.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/refund-policy" className="text-brand-700 underline hover:text-brand-800">Refund Policy</Link> ·{" "}
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}