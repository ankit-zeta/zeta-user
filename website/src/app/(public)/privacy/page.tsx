"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Privacy Policy</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. Information We Collect</h2>
          <p>We collect only the personal information necessary to provide our educational services, credentialing, and marketplace functionality:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Account Information:</strong> Name, email address, phone number (optional), profile photo, skills, bio, and password hash.</li>
            <li><strong>Verification Data:</strong> Government-issued ID (for KYC on payouts), payment details (bank account, UPI, UPI QR) for wallet payouts.</li>
            <li><strong>Activity Data:</strong> Course progress, lesson completion, quiz scores, Certificate generation, Work Marketplace applications, deliverables, and payout history.</li>
            <li><strong>Communication Data:</strong> Support tickets, chat messages, and correspondence with our team.</li>
            <li><strong>Technical Data:</strong> IP address, device information, browser type, access timestamps, and usage analytics (aggregated, anonymized).</li>
          </ul>
          <p>We do <strong>not</strong> collect sensitive personal data such as racial/ethnic origin, political opinions, religious beliefs, health data, or biometric data.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Service Delivery:</strong> Account authentication, course access, progress tracking, Certificate issuance, Work Marketplace matching, wallet and payout processing.</li>
            <li><strong>Verification & Trust:</strong> Public Certificate registry (name, program, completion date, Certificate ID), KYC compliance for payouts, fraud prevention.</li>
            <li><strong>Communications:</strong> Transactional emails (purchase receipts, Certificate issuance, payout notifications), support responses, important platform updates (opt-out available for non-essential).</li>
            <li><strong>Platform Improvement:</strong> Aggregated, anonymized analytics to improve curriculum, marketplace matching, and user experience.</li>
            <li><strong>Legal Compliance:</strong> KYC/AML for payouts, tax reporting, legal obligations, fraud prevention, and security.</li>
          </ul>
          <p>We do <strong>not</strong> sell, rent, or monetize your personal data to third-party advertisers or data brokers.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Information Sharing & Disclosure</h2>
          <p>We share your information only in the following limited circumstances:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Work Marketplace:</strong> When you apply to a project, your name, verified Certificates, portfolio, and proposed deliverables are shared with the Client for evaluation.</li>
            <li><strong>Certificate Verification:</strong> Certificate holder name, program name, completion date, and Certificate ID are publicly accessible via our verification registry for client authentication.</li>
            <li><strong>Payment Processors:</strong> Payment details shared with our payment partners (Razorpay, bank partners) solely for transaction processing.</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or regulatory authority (KYC/AML, tax reporting, fraud investigation).</li>
            <li><strong>Service Providers:</strong> Trusted subprocessors (cloud hosting, email delivery, analytics) under strict data processing agreements.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, user data transfers as part of the business with continued privacy protections.</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal data to advertisers, data brokers, or for targeted advertising.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Public Certificate Registry</h2>
          <p>When you earn a Certificate, the following information is made publicly accessible via our verification portal for client verification:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Your full name</li>
            <li>Program name and tier</li>
            <li>Completion date</li>
            <li>Unique Certificate ID (e.g., ZG-2026-ABC123)</li>
          </ul>
          <p>No contact details, email, phone, or private profile information are publicly disclosed. You may request Certificate revocation (which removes public verification) by contacting support, subject to verification.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Data Security</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Encryption:</strong> TLS 1.3 for data in transit; AES-256 encryption for data at rest.</li>
            <li><strong>Authentication:</strong> PBKDF2 (10,000 iterations) password hashing, secure session tokens with automatic expiry, optional 2FA.</li>
            <li><strong>Access Control:</strong> Role-based access control (RBAC), principle of least privilege, audit logging for admin actions.</li>
            <li><strong>Infrastructure:</strong> Hosted on SOC 2 Type II certified cloud infrastructure (AWS/GCP); regular penetration testing and vulnerability scanning.</li>
            <li><strong>Incident Response:</strong> Documented breach notification procedures; affected users notified within 72 hours where required by law.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Data Retention & Deletion</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Active Accounts:</strong> Data retained for the life of the account plus 2 years after last activity.</li>
            <li><strong>Financial Records:</strong> Payout records, KYC documents, and tax-related data retained for 8 years per Indian tax law.</li>
            <li><strong>Deleted Accounts:</strong> Personal data deleted within 30 days of account deletion request, except where legal retention obligations apply (financial, tax, legal hold).</li>
            <li><strong>Anonymized Analytics:</strong> Aggregated, anonymized usage data may be retained indefinitely for product improvement.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. Your Rights</h2>
          <p>Under applicable data protection laws (including India's DPDP Act 2023), you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> Request deletion of your data (subject to legal retention obligations).</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Restriction/Objection:</strong> Restrict or object to certain processing (e.g., marketing).</li>
            <li><strong>Withdraw Consent:</strong> Where processing is based on consent, withdraw at any time.</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:privacy@zetagrow.com" className="text-brand-700 underline">privacy@zetagrow.com</a>. We respond within 30 days.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Cookies & Tracking</h2>
          <p>We use essential cookies for authentication, session management, and security. We do <strong>not</strong> use third-party advertising cookies, tracking pixels, or cross-site tracking. Analytics are first-party, anonymized, and aggregated. You may disable cookies via browser settings, but authentication will not function.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">9. Children's Privacy</h2>
          <p>Our Services are not directed to individuals under 18 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a minor, contact us immediately for deletion.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">10. International Data Transfers</h2>
          <p>Our servers are located in India. If you access the Platform from outside India, your data will be transferred to and processed in India under the protections described in this Policy.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">11. Changes to This Policy</h2>
          <p>We may update this Policy to reflect legal, technical, or operational changes. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. The "Last updated" date above reflects the most recent revision.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">12. Contact</h2>
          <p>Questions, concerns, or rights requests? Contact our Data Protection Officer at:</p>
          <p className="text-textMuted">
            <a href="mailto:privacy@zetagrow.com" className="text-brand-700 underline">privacy@zetagrow.com</a><br />
            Zetagrow Edutech and Solutions (ZetaGrow) Legal Team<br />
            [Registered Office Address]
          </p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/refund-policy" className="text-brand-700 underline hover:text-brand-800">Refund Policy</Link> ·{" "}
            <Link href="/cookie-policy" className="text-brand-700 underline hover:text-brand-800">Cookie Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}