import React from "react";
import Link from "next/link";
import { Target, Compass, ShieldCheck, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          About ZetaGrow
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          Bridging Education and Real Digital Work
        </h1>
        <p className="text-base text-textMuted leading-relaxed">
          ZetaGrow was founded to solve a major breakdown in modern online education: millions of learners purchase courses but lack verified opportunities to apply their skills in real-world environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-surface p-8 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-textMain">Our Mission</h3>
          <p className="text-sm text-textMuted leading-relaxed">
            To provide high-quality, practical digital skills training that connects directly to verifiable industry credentials and paid client contract opportunities.
          </p>
        </div>

        <div className="card-surface p-8 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-textMain">Commitment to Integrity</h3>
          <p className="text-sm text-textMuted leading-relaxed">
            We prioritize transparent operations, verifiable curriculum milestones, and clear qualification rules for client work.
          </p>
        </div>
      </div>
    </div>
  );
}
