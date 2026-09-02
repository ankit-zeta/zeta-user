"use client";

import React from "react";
import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Earnings & Results Disclaimer</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
          <h2 className="font-bold text-red-800 mb-2">Important: No Income Guarantees</h2>
          <p className="text-red-700">ZetaGrow is an <strong>education and skills development platform</strong>. We provide structured curricula, verifiable credentials, and access to a curated work marketplace. <strong>We do not guarantee, promise, or imply any specific income, earnings, financial returns, job placement, internship, stipend, salary, or career outcomes.</strong> Any results achieved by other Users are individual cases and do not guarantee, indicate, or imply similar results for you.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <h2 className="font-bold text-amber-800 mb-2">No One From ZetaGrow Will Call You</h2>
          <p className="text-amber-700 text-sm leading-relaxed">
            <strong>ZetaGrow does not make unsolicited phone calls to sell programs, collect payments, or guarantee employment.</strong> Our marketing is conducted exclusively through digital channels (online ads, social media, email). If someone calls you claiming to represent ZetaGrow and guarantees a salary, stipend, internship, job, or specific income:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-amber-700 text-sm mt-3">
            <li>That person is <strong>not authorized</strong> by ZetaGrow.</li>
            <li>Any such guarantee is <strong>void and unenforceable</strong> against ZetaGrow.</li>
            <li>ZetaGrow is <strong>not liable</strong> for any purchase or payment made based on such unauthorized promises.</li>
            <li>You should report such calls to <a href="mailto:hey@zetagrow.in" className="underline font-medium">hey@zetagrow.in</a> immediately.</li>
          </ul>
        </div>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. No Income Guarantees</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>ZetaGrow does not guarantee, promise, or imply that you will earn any specific amount of money, achieve any specific income level, or generate any revenue whatsoever.</li>
            <li>Any earnings figures, testimonials, or case studies shared by ZetaGrow or its Users are <strong>individual examples</strong> and do not represent typical, average, or guaranteed results.</li>
            <li>Your earnings depend entirely on your individual effort, aptitude, pre-existing skills, market conditions, client demand, geographic location, economic conditions, and numerous other factors beyond ZetaGrow's control.</li>
            <li>Past performance of other Users does not guarantee, indicate, or imply similar results for you.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. No Job, Employment, Internship, Stipend, or Salary Guarantee</h2>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Completing any Program, earning a Certificate, or creating a profile does <strong>not</strong> guarantee employment, internship, project selection, stipend, salary, or any form of paid engagement.</li>
            <li>The Work Marketplace is a curated marketplace connecting qualified Users with Clients. Work selection is determined solely by Client requirements, competitive evaluation, and merit-based criteria.</li>
            <li>There is no guarantee of daily work, consistent project flow, minimum income, or any specific volume of work opportunities.</li>
            <li>Project availability fluctuates based on Client demand, market conditions, and seasonal factors outside ZetaGrow's control.</li>
            <li><strong>No ZetaGrow employee, representative, or partner is authorized to guarantee you a fixed salary, stipend, internship, job placement, or any specific income.</strong> Any such promise is unauthorized, void, and does not bind ZetaGrow.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. No "Get Rich Quick" / Passive Income Claims</h2>
          <p>ZetaGrow does not promote, endorse, or imply that its Programs or Referral Program constitute:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>A "get rich quick" scheme</li>
            <li>A "passive income" opportunity</li>
            <li>A "side hustle with guaranteed income"</li>
            <li>A "financial freedom" system</li>
            <li>An "investment" with guaranteed returns</li>
            <li>A "business opportunity" with guaranteed income</li>
            <li>Any form of multi-level marketing (MLM), pyramid scheme, or network marketing program</li>
          </ul>
          <p>Any statements by ZetaGrow, its employees, or affiliates suggesting otherwise are unauthorized and do not reflect the Platform's policies.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Individual Results Vary</h2>
          <p>Your results depend entirely on factors including, but not limited to:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Your individual effort, dedication, and consistency</li>
            <li>Your pre-existing skills, experience, and aptitude</li>
            <li>Your ability to apply learned concepts to real-world scenarios</li>
            <li>Your portfolio quality, communication skills, and professionalism</li>
            <li>Market demand for your specific skill set</li>
            <li>Client budgets, project availability, and competitive landscape</li>
            <li>Your geographic location, time zone, and language proficiency</li>
            <li>Economic conditions, industry trends, and seasonal fluctuations</li>
          </ul>
          <p>ZetaGrow provides the curriculum, credentials, and marketplace access. <strong>Your outcomes are your responsibility.</strong></p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Testimonials & Case Studies</h2>
          <p>Any testimonials, case studies, or earnings figures shared by ZetaGrow or its Users:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Represent individual experiences only</li>
            <li>Are not typical, average, or guaranteed results</li>
            <li>Do not constitute a promise, guarantee, or projection of future earnings</li>
            <li>May not be representative of what you can expect to achieve</li>
          </ul>
          <p>We encourage you to conduct your own due diligence and make decisions based on your own circumstances.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Partner Program — No Income Guarantee</h2>
          <p>The optional Partner Program allows Users to earn partner remuneration by referring new Customers who purchase Programs. However:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Remuneration earnings vary significantly and are not guaranteed.</li>
            <li>No minimum or maximum earnings are promised or implied.</li>
            <li>Remuneration earnings depend entirely on genuine retail purchases by referred Customers.</li>
            <li>The Partner Program is not an investment, passive income stream, or business opportunity with guaranteed returns.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. Forward-Looking Statements</h2>
          <p>Any statements on the Platform, in marketing materials, or by representatives regarding potential earnings, market trends, or future opportunities are forward-looking statements subject to significant risks and uncertainties. Actual results may differ materially.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Professional Advice</h2>
          <p>The content provided through ZetaGrow Programs is for educational and informational purposes only and does not constitute professional financial, legal, tax, career, or business advice. You should consult qualified professionals (financial advisors, tax advisors, attorneys, career counselors) for advice specific to your situation.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">9. Reverse Action for False or Frivolous Claims</h2>
          <p>Zetagrow Edutech and Solutions (ZetaGrow) reserves the right to initiate counter-legal proceedings against any individual or entity who files frivolous, malicious, or bad-faith complaints, lawsuits, or regulatory actions based on:</p>
          <ul className="list-disc pl-6 space-y-2 text-textMuted">
            <li>Unauthorized promises made by third parties not employed by or authorized by ZetaGrow.</li>
            <li>Misrepresentation of ZetaGrow's services, guarantees, or policies.</li>
            <li>Claims contradicted by the express terms of these policies which the user acknowledged and agreed to.</li>
            <li>Attempts to coerce settlement through baseless litigation.</li>
          </ul>
          <p className="mt-2">In such cases, ZetaGrow will seek full recovery of all legal costs, damages, lost business, and reputational harm caused by such frivolous actions, to the maximum extent permitted by applicable law.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">10. Contact</h2>
          <p>Questions about this Disclaimer? Contact <a href="mailto:legal@zetagrow.com" className="text-brand-700 underline">legal@zetagrow.com</a>.</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> ·{" "}
            <Link href="/refund-policy" className="text-brand-700 underline hover:text-brand-800">Refund Policy</Link> ·{" "}
            <Link href="/affiliate-guidelines" className="text-brand-700 underline hover:text-brand-800">Partner Program Guidelines</Link>
          </p>
        </div>
      </div>
    </div>
  );
}