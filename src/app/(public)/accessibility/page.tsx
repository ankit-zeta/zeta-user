"use client";

import React from "react";
import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Accessibility Statement</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. Commitment</h2>
          <p>ZetaGrow is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying relevant accessibility standards (WCAG 2.1 Level AA).</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Conformance Status</h2>
          <p>The ZetaGrow Platform aims to conform to <strong>WCAG 2.1 Level AA</strong>. Some content may not fully conform; we are actively working to remediate known issues.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Accessibility Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li><strong>Semantic HTML:</strong> Proper heading structure, landmarks, and ARIA labels.</li>
            <li><strong>Keyboard Navigation:</strong> All interactive elements accessible via keyboard (Tab, Enter, Escape, Arrow keys). Focus indicators visible.</li>
            <li><strong>Color Contrast:</strong> Minimum 4.5:1 contrast ratio for text; 3:1 for large text and UI components.</li>
            <li><strong>Text Resizing:</strong> Content reflows up to 200% zoom without loss of function.</li>
            <li><strong>Alt Text:</strong> Meaningful alt text for all informative images; decorative images marked as decorative.</li>
            <li><strong>Form Labels:</strong> All form inputs have associated labels; error messages announced to screen readers.</li>
            <li><strong>Focus Management:</strong> Focus trapped in modals; logical tab order; skip-to-main-content link.</li>
            <li><strong>Reduced Motion:</strong> Respects <code>prefers-reduced-motion</code>; animations disabled for users who prefer reduced motion.</li>
            <li><strong>Screen Reader Support:</strong> Tested with NVDA, JAWS, VoiceOver, TalkBack.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Known Limitations</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Some third-party embedded content (payment modals, PDF viewers) may not fully meet WCAG AA.</li>
            <li>Complex data visualizations may lack full text alternatives.</li>
            <li>User-generated content (portfolios, deliverables) may vary in accessibility.</li>
          </ul>
          <p>We are actively working to remediate these limitations.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Assessment Methods</h2>
          <p>Accessibility is assessed through:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Automated testing (axe-core, Lighthouse) in CI/CD pipeline.</li>
            <li>Manual testing with keyboard-only navigation.</li>
            <li>Screen reader testing (NVDA, JAWS, VoiceOver, TalkBack).</li>
            <li>Color contrast auditing tools.</li>
            <li>Periodic third-party accessibility audits.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Feedback & Support</h2>
          <p>If you encounter an accessibility barrier, please contact us:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Email: <a href="mailto:accessibility@zetagrow.com" className="text-brand-700 underline">accessibility@zetagrow.com</a></li>
            <li>Subject line: "Accessibility Barrier Report"</li>
            <li>Include: URL, assistive technology used, description of barrier, steps to reproduce.</li>
          </ul>
          <p>We aim to acknowledge reports within 2 business days and provide a remediation timeline within 10 business days.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Ongoing Efforts</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Accessibility testing integrated into CI/CD pipeline.</li>
            <li>Design system components built with accessibility as a requirement.</li>
            <li>Developer training on accessible coding practices.</li>
            <li>Regular accessibility regression testing.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Contact</h2>
          <p>Accessibility questions: <a href="mailto:accessibility@zetagrow.com" className="text-brand-700 underline">accessibility@zetagrow.com</a>.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}