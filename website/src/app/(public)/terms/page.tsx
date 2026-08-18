import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Terms of Service</h1>
        <p className="text-xs text-textMuted">Last updated: August 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">1. Agreement to Terms</h2>
          <p>
            By accessing or using the ZetaGrow website, user dashboard, learning courses, or work marketplace, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">2. Educational Services & Digital Content</h2>
          <p>
            ZetaGrow provides structured educational modules, downloadable templates, and verifiable credentialing. Access to courses is granted solely for personal professional development. You may not distribute, duplicate, or resell proprietary curriculum content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">3. Work Marketplace & Deliverables</h2>
          <p>
            The Work Portal is a curated marketplace connecting qualified users with project assignments. Applying for or completing a program does not guarantee employment or project selection. Work selection is determined by meeting listed requirements and deliverable quality standards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">4. Affiliate & Referral Terms</h2>
          <p>
            Affiliate participation is optional. Commissions are generated strictly upon genuine retail purchases of curriculum programs made through unique tracking links. Self-referrals, fraudulent loops, and misleading income representations are strictly prohibited.
          </p>
        </section>
      </div>
    </div>
  );
}
