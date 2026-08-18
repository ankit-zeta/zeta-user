import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Privacy Policy</h1>
        <p className="text-xs text-textMuted">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs text-textMuted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">1. Information We Collect</h2>
          <p>
            We collect personal information necessary to provide authentication, course access, verifiable certificate generation, and wallet payout processing (name, email address, profile skills, and submitted payout details).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">2. How We Protect Your Data</h2>
          <p>
            We implement industry-standard encryption, server-side session authorization, and strict role-based data isolation. We do not sell or monetize personal user information to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">3. Public Certificate Verification</h2>
          <p>
            When a verified certificate is generated, the recipient name, completion date, program title, and certificate identifier are made publicly verifiable via our credential registry for client authentication.
          </p>
        </section>
      </div>
    </div>
  );
}
