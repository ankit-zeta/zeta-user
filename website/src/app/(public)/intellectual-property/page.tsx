"use client";

import React from "react";
import Link from "next/link";

export default function IPPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Intellectual Property Policy</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. Ownership</h2>
          <p>All content, curriculum, materials, software, trademarks, logos, designs, and other intellectual property on the ZetaGrow Platform ("Platform") are owned by or licensed to ZetaGrow and protected by copyright, trademark, patent, trade secret, and other intellectual property laws of India and international treaties.</p>
          <p>This includes, but is not limited to: curriculum text, video/audio content, downloadable resources, templates, AI prompt packs, checklists, code snippets, software interfaces, graphics, logos, brand names, and the overall look and feel of the Platform.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Limited License</h2>
          <p>Subject to your compliance with the Terms of Service, ZetaGrow grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Access and view curriculum content for your personal, non-commercial professional development.</li>
            <li>Download and use provided templates, checklists, and resources solely for your individual professional use.</li>
            <li>Display your earned Certificate and share its public verification link.</li>
          </ul>
          <p>This license is personal to you and non-transferable. It does not grant any right to reproduce, distribute, modify, create derivative works, publicly display, or commercially exploit any Platform content.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Prohibited Uses</h2>
          <p>You may <strong>not</strong>:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Reproduce, distribute, or publicly share curriculum content, lessons, or resources.</li>
            <li>Create derivative works from Platform content (translations, adaptations, summaries for distribution).</li>
            <li>Remove or alter copyright, trademark, or proprietary notices.</li>
            <li>Use ZetaGrow trademarks, logos, or branding without express written permission.</li>
            <li>Create competing products or services using Platform content.</li>
            <li>Train AI models using Platform content without express written permission.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. User Content License</h2>
          <p>By submitting content (profile info, portfolio, deliverables, messages, reviews), you grant ZetaGrow a worldwide, non-exclusive, royalty-free, sublicensable license to use, reproduce, display, and distribute your content solely for operating and improving the Platform. You retain ownership of your content and confirm you have the right to grant this license.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Trademarks</h2>
          <p>"ZetaGrow," the ZetaGrow logo, "ZG" mark, and associated branding are trademarks of ZetaGrow. Unauthorized use is prohibited. You may not use ZetaGrow marks in domain names, social media handles, paid advertising, or merchandise without express written permission.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Certificate Verification & Public Data</h2>
          <p>Certificate verification data (holder name, program name, completion date, Certificate ID) is made publicly accessible for verification purposes. This limited public disclosure does not constitute a license to use Certificate holder data for marketing, solicitation, or commercial purposes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. DMCA / Copyright Infringement</h2>
          <p>We respect intellectual property rights and comply with applicable copyright law. To report alleged infringement, contact our Copyright Agent at <a href="mailto:copyright@zetagrow.com" className="text-brand-700 underline">copyright@zetagrow.com</a> with:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Identification of the copyrighted work claimed to be infringed.</li>
            <li>Identification of the infringing material and its location on the Platform.</li>
            <li>Your contact information.</li>
            <li>A statement of good faith belief that use is unauthorized.</li>
            <li>A statement of accuracy under penalty of perjury.</li>
            <li>Your physical or electronic signature.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Enforcement</h2>
          <p>ZetaGrow actively monitors for unauthorized use of its intellectual property. Violations may result in content removal, account termination, legal action for damages and injunctive relief, and referral to law enforcement.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">9. Contact</h2>
          <p>Intellectual property inquiries: <a href="mailto:legal@zetagrow.com" className="text-brand-700 underline">legal@zetagrow.com</a>.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link> ·{" "}
            <Link href="/acceptable-use" className="text-brand-700 underline hover:text-brand-800">Acceptable Use Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}