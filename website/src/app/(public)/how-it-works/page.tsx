import React from "react";
import Link from "next/link";
import { BookOpen, Award, Briefcase, CheckCircle, ShieldCheck, ArrowRight, Video } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Join Free — Your Choice",
      description: "Creating an account is free and no purchase is ever required to stay, learn what's freely available, or apply for work. Buying a programme is entirely your decision.",
      icon: BookOpen,
    },
    {
      num: "02",
      title: "Learn (Optional Programmes)",
      description: "If you want structured training, choose a curriculum with modular lessons and practical assignments. If you already have skills, you can skip straight to applying for work that matches them.",
      icon: Award,
    },
    {
      num: "03",
      title: "Get Verified (Optional)",
      description: "Passing all modules and quizzes automatically generates your verifiable ZetaGrow certificate — useful for listings that ask for proven skills. Many listings never require one.",
      icon: ShieldCheck,
    },
    {
      num: "04",
      title: "Apply & Get Paid for Deliverables",
      description: "Apply for client assignments matched to your profile. Selection is merit-based on CV, experience, and deliverable quality. Approved milestones are paid directly to your platform wallet.",
      icon: Briefcase,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Platform Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          How ZetaGrow Works
        </h1>
        <p className="text-base text-textMuted leading-relaxed">
          ZetaGrow is first and foremost an online learning platform. Around that core we offer
          optional extras: verified certificates for your skills, a curated work portal where
          selection is purely merit-based, and small perks for active learners. Nothing here is
          compulsory except honesty in the work you deliver.
        </p>
      </div>

      {/* Coming soon strip */}
      <div className="card-surface p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-brand-200 bg-brand-50/40">
        <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
          <Video className="w-4 h-4" />
        </div>
        <p className="text-xs text-textMuted leading-relaxed">
          <strong className="text-textMain">Coming soon:</strong> video-format programmes across
          coding, sales, business, e-commerce operations, skilled professions (including electrician
          and other vocational paths) — plus{" "}
          <strong className="text-brand-700">free courses</strong> launching shortly, so anyone
          can start learning at zero cost.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s, idx) => (
          <div key={idx} className="card-surface p-6 space-y-4 relative">
            <div className="text-3xl font-extrabold text-brand-200">
              {s.num}
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-textMain">{s.title}</h3>
            <p className="text-xs text-textMuted leading-relaxed">{s.description}</p>
          </div>
        ))}
      </div>

      {/* Important distinctions callout */}
      <div className="card-surface p-8 bg-brand-50/40 border-brand-200 space-y-5">
        <div className="flex items-center gap-2 text-brand-800 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <span>Ethical &amp; Transparent Standards</span>
        </div>
        <ul className="space-y-3 max-w-3xl">
          {[
            "No purchase is necessary to join, stay, or apply for any opportunity on this platform.",
            "Many work listings require no certificate at all — candidates are shortlisted on CV, experience, and portfolio quality. Where a listing does reference a certificate, it reflects the end-client's demand for proven skills, not a sales tactic.",
            "We do not guarantee work placements, project allocation, or income — before or after certification. Opportunities are competitive and awarded to the best-matched candidate.",
            "ZetaGrow is not a multi-level-marketing, pyramid, network-marketing, recruitment, or investment scheme. We sell education; we do not sell positions or earnings potential.",
            "Any referral feature is an optional courtesy for genuine enrolments. You are never asked, pressured, or required to sell, recruit, or promote anything.",
          ].map((line, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-textMuted leading-relaxed">
              <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center pt-6">
        <Link href="/programs" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          <span>Explore Programs (Optional)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
