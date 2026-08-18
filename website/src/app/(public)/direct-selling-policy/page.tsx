import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function DirectSellingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Direct Selling & Affiliate Guidelines</h1>
        <p className="text-xs text-textMuted">Compliance, ethical marketing standards, and operational guidelines</p>
      </div>

      <div className="space-y-6 text-xs text-textMuted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">1. Product-Centric Philosophy</h2>
          <p>
            ZetaGrow is an educational technology and professional services platform. Participation in our affiliate referral program is strictly voluntary and auxiliary to the genuine value provided by our curriculum and digital tools.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">2. Prohibited Conduct & Claims</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>No member may promise or guarantee financial earnings, returns on investment, or job placement.</li>
            <li>Recruiting individuals cannot be promoted as an investment scheme or guaranteed source of passive income.</li>
            <li>All marketing collateral must truthfully describe the curriculum contents and learning outcomes.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-textMain">3. Commission Basis</h2>
          <p>
            Commissions are only generated upon the genuine retail purchase of a legitimate program by a customer who receives full access to that curriculum. Recruitment itself yields no financial reward.
          </p>
        </section>
      </div>
    </div>
  );
}
