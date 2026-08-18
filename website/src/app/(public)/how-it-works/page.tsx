import React from "react";
import Link from "next/link";
import { BookOpen, Award, Briefcase, TrendingUp, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Enroll & Learn",
      description: "Choose a structured curriculum tailored to your level. Work through modular lessons, practical assignments, and downloadable productivity toolchains.",
      icon: BookOpen,
    },
    {
      num: "02",
      title: "Earn Verifiable Credential",
      description: "Complete all required course modules and quizzes to automatically generate your official ZetaGrow verifiable certificate with a public verification URL.",
      icon: Award,
    },
    {
      num: "03",
      title: "Apply for Verified Work",
      description: "Unlock access to client assignments on the Work Portal. Submit project deliverables, review feedback, and receive direct milestone payouts to your platform wallet.",
      icon: Briefcase,
    },
    {
      num: "04",
      title: "Optional Affiliate Growth",
      description: "Eligible members can voluntarily refer peers using their unique partner link, qualifying for transparent, performance-based commissions on verified program sales.",
      icon: TrendingUp,
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
          ZetaGrow is built on a clear, ethical foundation: practical digital education prepares you with verified skills, which unlocks access to real contract opportunities and optional performance rewards.
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
      <div className="card-surface p-8 bg-brand-50/40 border-brand-200 space-y-4">
        <div className="flex items-center gap-2 text-brand-800 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <span>Ethical & Transparent Standards</span>
        </div>
        <p className="text-xs text-textMuted leading-relaxed max-w-3xl">
          ZetaGrow does not make exaggerated income claims or promise effortless earnings. Earning through the Work Portal requires meeting qualification standards and completing actual deliverables. Affiliate commissions are strictly generated upon genuine retail purchases of our curriculum programs.
        </p>
      </div>

      <div className="text-center pt-6">
        <Link href="/programs" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          <span>Start by Exploring Programs</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
