"use client";

import React from "react";
import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Cookie Policy</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help the website function properly, remember your preferences, and provide analytics.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Types of Cookies We Use</h2>
          <table className="w-full text-sm text-left border border-borderSubtle">
            <thead>
              <tr className="border-b border-borderSubtle bg-bgWarm">
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Purpose</th>
                <th className="p-3 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-borderSubtle">
                <td className="p-3 font-medium">Essential / Authentication</td>
                <td className="text-textMuted">Session management, login state, CSRF protection, security</td>
                <td className="text-textMuted">Session / 30 days</td>
              </tr>
              <tr className="border-b border-borderSubtle">
                <td className="p-3 font-medium">Functional / Preferences</td>
                <td className="text-textMuted">Language, theme, dashboard layout preferences</td>
                <td className="text-textMuted">1 year</td>
              </tr>
              <tr className="border-b border-borderSubtle">
                <td className="p-3 font-medium">Analytics (First-Party)</td>
                <td className="text-textMuted">Anonymous usage analytics, feature adoption, performance monitoring</td>
                <td className="text-textMuted">1 year</td>
              </tr>
              <tr className="border-b border-borderSubtle">
                <td className="p-3 font-medium">Security</td>
                <td className="text-textMuted">Fraud prevention, rate limiting, bot detection</td>
                <td className="text-textMuted">Session</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. No Third-Party Advertising Cookies</h2>
          <p>We do <strong>not</strong> use third-party advertising cookies, tracking pixels, cross-site tracking, retargeting pixels, or social media tracking cookies. We do not share your browsing behavior with advertisers or data brokers.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Analytics</h2>
          <p>We use first-party, privacy-respecting analytics to understand feature adoption and improve the Platform. Data is aggregated and anonymized. We do not track you across other websites.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Managing Cookies</h2>
          <p>You can control cookies through your browser settings:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Block all cookies (may break authentication)</li>
            <li>Block third-party cookies only</li>
            <li>Clear cookies on browser close</li>
            <li>View and delete specific cookies</li>
          </ul>
          <p>Note: Blocking essential cookies will break authentication and core Platform functionality.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Third-Party Service Providers</h2>
          <p>We use the following service providers who may set cookies on our behalf:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Convex:</strong> Backend/database, authentication, real-time sync (essential cookies)</li>
            <li><strong>Razorpay:</strong> Payment processing (essential for payment flow)</li>
            <li><strong>AWS/GCP:</strong> Cloud infrastructure (security, performance cookies)</li>
          </ul>
          <p>These providers process data solely on our behalf under strict data processing agreements.</p>
</section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Your Choices</h2>
          <p>You can:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Accept all cookies (recommended for full functionality)</li>
            <li>Reject non-essential cookies via browser settings</li>
            <li>Use browser extensions to block cookies</li>
            <li>Clear cookies periodically</li>
          </ul>
          <p>Opting out of essential cookies will prevent you from logging in or using core Platform features.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Changes</h2>
          <p>We may update this Cookie Policy to reflect changes in technology or legal requirements. Continued use constitutes acceptance.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Contact</h2>
          <p>Cookie questions: <a href="mailto:privacy@zetagrow.com" className="text-brand-700 underline">privacy@zetagrow.com</a>.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link> ·{" "}
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}