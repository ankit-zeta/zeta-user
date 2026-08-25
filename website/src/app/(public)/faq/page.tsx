import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Do I have to buy a course or plan to apply for jobs on ZetaGrow?",
      a: "No — absolutely not. Purchasing any programme is completely voluntary. A large share of listings on the Work Portal require no certificate at all: applicants are shortlisted purely on the strength of their CV, portfolio, and relevant experience. Some specialised client projects may list a verified certificate as a quality benchmark because the end-client demands proven skills — but that is a requirement of that particular project, never a condition of using ZetaGrow.",
    },
    {
      q: "Is ZetaGrow an MLM, pyramid, network-marketing, or investment scheme?",
      a: "No. ZetaGrow is an online education platform. We sell courses; we do not sell positions, recruitment rights, or income opportunities. There is nothing to 'downline-build', no earning from merely signing people up, and no promise of returns on money. Our optional referral feature is a standard customer thank-you that pays only when a referred person genuinely enrols in a course — it can never be a primary income and nobody is asked to sell anything.",
    },
    {
      q: "Does completing a course guarantee me freelance work or income?",
      a: "No. Certification demonstrates verified skill — it does not guarantee project allocation. The Work Portal is competitive: clients and our internal team select the candidate whose CV, experience, and deliverable quality best match each brief. Many certified learners receive work; none are guaranteed it.",
    },
    {
      q: "Are video-based courses coming to ZetaGrow?",
      a: "Yes! We are actively producing video-format programmes across coding, sales, business, e-commerce operations, skilled trades such as electrical work, and more — designed so you can learn faster in less time. We will also be introducing free courses in the near future. Watch this space.",
    },
    {
      q: "How does program access work after enrollment?",
      a: "Upon completing enrollment, you receive lifetime access to the curriculum modules, lessons, downloadable templates, and quizzes directly within your personal dashboard.",
    },
    {
      q: "How do I qualify for opportunities in the Work Portal?",
      a: "Each contract listing defines its own prerequisites. Many listings are open to every registered user; some may prefer candidates holding a specific verified certificate or achievement milestone. Once you satisfy a listing's stated requirements, the apply button becomes active.",
    },
    {
      q: "How are certificates verified?",
      a: "Every certificate issued contains a unique identifier (e.g. ZG-2026-ABC123) and a public verification URL. Anyone can verify the validity and recipient on our registry at /certificate/[id].",
    },
    {
      q: "How do withdrawals work?",
      a: "Once your wallet balance reaches the minimum threshold (₹1,000), you can request a withdrawal via direct bank transfer (IMPS/NEFT) or UPI. Withdrawals are reviewed and processed within standard processing windows.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-3">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Answers & Guidance
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-textMuted">
          Find clarity on programs, certificates, the work marketplace, and wallet payouts.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div key={idx} className="card-surface p-6 space-y-2">
            <h3 className="text-base font-bold text-textMain flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <span>{f.q}</span>
            </h3>
            <p className="text-xs text-textMuted leading-relaxed pl-7.5">
              {f.a}
            </p>
          </div>
        ))}
      </div>

      <div className="card-surface p-6 bg-neutral-50 text-center space-y-3">
        <h3 className="text-sm font-semibold text-textMain">Still have questions?</h3>
        <p className="text-xs text-textMuted">Our support team is available to assist you with any inquiries.</p>
        <Link href="/contact" className="btn-primary inline-flex text-xs">
          Contact Support
        </Link>
      </div>
    </div>
  );
}
