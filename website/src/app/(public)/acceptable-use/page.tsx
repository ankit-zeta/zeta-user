"use client";

import React from "react";
import Link from "next/link";

export default function AcceptableUsePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Acceptable Use Policy</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. Purpose</h2>
          <p>This Acceptable Use Policy ("AUP") defines the standards of conduct for all Users of the ZetaGrow Platform. By using the Platform, you agree to comply with this AUP. Violations may result in immediate account suspension, termination, or legal action.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Prohibited Activities</h2>
          <p>You agree <strong>not</strong> to:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Violate any applicable law, regulation, or third-party rights.</li>
            <li>Engage in fraud, identity theft, or impersonation.</li>
            <li>Share, distribute, or resell proprietary curriculum content, templates, or resources.</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the Platform.</li>
            <li>Use automated scripts, bots, scrapers, or crawlers to access the Platform.</li>
            <li>Interfere with Platform security, integrity, or availability (DDoS, brute force, SQL injection, etc.).</li>
            <li>Harass, threaten, intimidate, or discriminate against other Users or staff.</li>
            <li>Post or transmit illegal, defamatory, obscene, or harmful content.</li>
            <li>Engage in spam, phishing, or unsolicited commercial communications.</li>
            <li>Misrepresent your identity, credentials, Certificates, or qualifications.</li>
            <li>Share account credentials or allow unauthorized access to your account.</li>
            <li>Use the Platform for any illegal activity, including money laundering, fraud, or tax evasion.</li>
            <li>Attempt to manipulate Work Marketplace ratings, reviews, or selection processes.</li>
            <li>Create multiple accounts to circumvent restrictions or manipulate referral commissions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Content Standards</h2>
          <p>All User-generated content (profile info, portfolio, deliverables, messages, support tickets) must:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Be accurate, truthful, and not misleading.</li>
            <li>Not infringe any intellectual property rights.</li>
            <li>Not contain hate speech, harassment, threats, or illegal content.</li>
            <li>Not contain malware, viruses, or malicious code.</li>
            <li>Respect the privacy and confidentiality of others.</li>
          </ul>
          <p>We reserve the right to remove any content violating these standards without prior notice.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Work Marketplace Conduct</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Submit only original, authentic deliverables created by you.</li>
            <li>Do not outsource accepted work to third parties without Client consent.</li>
            <li>Communicate professionally and respond promptly to Client messages.</li>
            <li>Meet agreed deadlines and quality standards.</li>
            <li>Do not circumvent the Platform by accepting off-platform payments or direct contracts.</li>
            <li>Report suspected fraud or policy violations promptly.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Referral Program Conduct</h2>
          <p>Referral Program participants must comply with the <a href="/affiliate-guidelines" className="text-brand-700 underline">Affiliate Guidelines</a>. Prohibited conduct includes self-referrals, misleading income claims, spam, and deceptive marketing.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Security & Access</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Do not share login credentials or API tokens.</li>
            <li>Enable 2FA where available.</li>
            <li>Report suspected unauthorized access immediately.</li>
            <li>Do not attempt to access other Users' accounts or data.</li>
            <li>Do not attempt to probe, scan, or test Platform vulnerabilities without authorization.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. Enforcement & Consequences</h2>
          <p>Violations of this AUP may result in:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Content removal or account restriction</li>
            <li>Temporary or permanent account suspension</li>
            <li>Forfeiture of pending commissions or payouts</li>
            <li>Permanent account termination and Platform ban</li>
            <li>Legal action for damages and injunctive relief</li>
            <li>Referral to law enforcement where appropriate</li>
          </ul>
          <p>We may take action without prior notice for egregious violations. We are not obligated to provide warnings.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Reporting Violations</h2>
          <p>Report suspected violations to <a href="mailto:abuse@zetagrow.com" className="text-brand-700 underline">abuse@zetagrow.com</a> or through the in-app reporting feature. Include relevant details, screenshots, and timestamps.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">9. Changes</h2>
          <p>We may update this AUP at any time. Material changes will be communicated via email or in-app notification. Continued use constitutes acceptance.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">10. Contact</h2>
          <p>Questions? Contact <a href="mailto:abuse@zetagrow.com" className="text-brand-700 underline">abuse@zetagrow.com</a>.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link> ·{" "}
            <Link href="/affiliate-guidelines" className="text-brand-700 underline hover:text-brand-800">Affiliate Guidelines</Link>
          </p>
        </div>
      </div>
    </div>
  );
}