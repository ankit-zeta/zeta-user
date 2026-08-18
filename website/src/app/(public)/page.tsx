"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  ArrowRight,
  CheckCircle2,
  Briefcase,
  BookOpen,
  Award,
  BadgeCheck,
  GraduationCap,
  ChevronRight,
  Wallet,
  Trophy,
  MonitorSmartphone,
  Headset,
  TrendingUp,
  ShieldCheck,
  Clock,
} from "lucide-react";

function formatINR(value: number) {
  return "₹" + value.toLocaleString("en-IN");
}

export default function HomePage() {
  const programs = useQuery(api.programs.getPublicPrograms);
  const jobs = useQuery(api.jobs.getPublicJobs);

  const featuredProgram = programs && programs.length > 0 ? programs[0] : null;
  const featuredJob = jobs && jobs.length > 0 ? jobs[0] : null;
  const outcomes =
    programs && programs.length > 0 ? programs[0].outcomes.slice(0, 4) : [];

  return (
    <div className="pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-borderSubtle bg-bgWarm">
        <div
          className="absolute inset-0 bg-dots opacity-70 pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(70%_60%_at_85%_-10%,rgba(23,107,77,0.07),transparent)] pointer-events-none"
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-center pt-16 pb-20 md:pt-24 md:pb-28">
            {/* Left — copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-borderSubtle shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                <span className="text-xs font-semibold text-textMain tracking-wide">
                  Professional Digital Career Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-[3.4rem] font-bold tracking-tight text-textMain leading-[1.08]">
                Learn practical skills.
                <br />
                <span className="text-brand-700">Work on real projects.</span>
                <br />
                Grow your career.
              </h1>

              <p className="text-base md:text-lg text-textMuted leading-relaxed max-w-xl">
                ZetaGrow combines structured digital education, verifiable
                credentials, and a real contract marketplace — so the skills
                you build actually lead somewhere.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/programs"
                  className="btn-primary w-full sm:w-auto text-base px-7 py-3 flex items-center justify-center gap-2 shadow-md shadow-brand-600/15"
                >
                  <span>Explore Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/work"
                  className="btn-secondary w-full sm:w-auto text-base px-7 py-3 flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-brand-700" />
                  <span>Explore Work</span>
                </Link>
              </div>

              {/* Real-data proof row */}
              <div className="pt-2 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-borderSubtle">
                {programs === undefined ? (
                  <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
                ) : (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-700" />
                    <span className="text-sm font-medium text-textMain">
                      {programs.length}{" "}
                      <span className="text-textMuted font-normal">
                        {programs.length === 1 ? "Program" : "Programs"}
                      </span>
                    </span>
                  </div>
                )}
                {jobs === undefined ? (
                  <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-700" />
                    <span className="text-sm font-medium text-textMain">
                      {jobs.length}{" "}
                      <span className="text-textMuted font-normal">
                        {jobs.length === 1 ? "Opening" : "Open Opportunities"}
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-brand-700" />
                  <span className="text-sm font-medium text-textMain">
                    Verifiable{" "}
                    <span className="text-textMuted font-normal">
                      Certificates
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right — composed product visual */}
            <div className="relative">
              {/* Floating accent chips */}
              <div className="hidden sm:flex absolute -top-5 -right-3 z-10 animate-float-slow items-center gap-2 bg-white rounded-xl border border-borderSubtle shadow-md px-3.5 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-textMain leading-none">
                    Verified Certificate
                  </p>
                  <p className="text-[10px] text-textMuted mt-1">
                    Publicly checkable online
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex absolute -bottom-6 -left-4 z-10 animate-float-slower items-center gap-2 bg-white rounded-xl border border-borderSubtle shadow-md px-3.5 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-bgWarm border border-borderSubtle text-textMain flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-textMain leading-none">
                    {jobs ? `${jobs.length} Open Opportunities` : "Live Updates"}
                  </p>
                  <p className="text-[10px] text-textMuted mt-1">
                    Posted & managed by admins
                  </p>
                </div>
              </div>

              {/* Main snapshot card */}
              <div className="bg-white rounded-2xl border border-borderSubtle shadow-[0_12px_40px_rgba(32,37,34,0.08)] overflow-hidden">
                <div className="px-6 py-4 border-b border-borderSubtle bg-bgWarm/70 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-textMain">
                      Platform at a glance
                    </p>
                    <p className="text-[11px] text-textMuted mt-0.5">
                      Live data from the ZetaGrow marketplace
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-600" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                      Live
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-borderSubtle">
                  {/* Featured program */}
                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {featuredProgram ? (
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                          Featured Program
                        </p>
                        <p className="text-sm font-semibold text-textMain truncate mt-0.5">
                          {featuredProgram.name}
                        </p>
                        <p className="text-xs text-textMuted mt-0.5">
                          {featuredProgram.duration} ·{" "}
                          {featuredProgram.certificateEnabled
                            ? "Certificate included"
                            : "No certificate"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-neutral-200 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse" />
                      </div>
                    )}
                    <div className="shrink-0 text-right">
                      {featuredProgram ? (
                        <>
                          <p className="text-sm font-bold text-brand-700">
                            {formatINR(featuredProgram.price)}
                          </p>
                          {featuredProgram.compareAtPrice && (
                            <p className="text-[11px] text-textMuted line-through">
                              {formatINR(featuredProgram.compareAtPrice)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="h-4 bg-neutral-200 rounded w-14 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Open opportunity */}
                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bgWarm border border-borderSubtle text-textMain flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    {featuredJob ? (
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                          Open Opportunity
                        </p>
                        <p className="text-sm font-semibold text-textMain truncate mt-0.5">
                          {featuredJob.title}
                        </p>
                        <p className="text-xs text-textMuted mt-0.5">
                          {featuredJob.category} · {featuredJob.workType}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-neutral-200 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                      </div>
                    )}
                    <div className="shrink-0 text-right">
                      {featuredJob ? (
                        <>
                          <p className="text-sm font-bold text-textMain">
                            {formatINR(featuredJob.payment)}
                          </p>
                          <p className="text-[11px] text-textMuted capitalize">
                            {featuredJob.paymentType} payout
                          </p>
                        </>
                      ) : (
                        <div className="h-4 bg-neutral-200 rounded w-14 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bgWarm border border-borderSubtle text-textMain flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                        Verified Credentials
                      </p>
                      <p className="text-sm font-semibold text-textMain mt-0.5">
                        Publicly verifiable certificates
                      </p>
                      <p className="text-xs text-textMuted mt-0.5">
                        Every completed program issues a certificate with a
                        unique public verification ID.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3.5 bg-bgWarm/70 border-t border-borderSubtle flex items-center justify-between">
                  <span className="text-[11px] text-textMuted">
                    {programs ? (
                      <>
                        {programs.length} learning{" "}
                        {programs.length === 1 ? "program" : "programs"}
                      </>
                    ) : (
                      "Loading programs…"
                    )}
                  </span>
                  <span className="w-px h-3.5 bg-borderSubtle" />
                  <span className="text-[11px] text-textMuted">
                    {jobs ? (
                      <>
                        {jobs.length} open{" "}
                        {jobs.length === 1 ? "opportunity" : "opportunities"}
                      </>
                    ) : (
                      "Loading opportunities…"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAND */}
      <section className="bg-white border-b border-borderSubtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-textMain leading-none">
                  {programs === undefined ? "—" : programs.length}
                </p>
                <p className="text-xs text-textMuted mt-1.5">
                  Structured Learning Programs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-textMain leading-none">
                  {jobs === undefined ? "—" : jobs.length}
                </p>
                <p className="text-xs text-textMuted mt-1.5">
                  Open Work Opportunities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center sm:justify-end">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-textMain leading-none">
                  Verifiable
                </p>
                <p className="text-xs text-textMuted mt-1.5">
                  Certificates with Public IDs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            One platform. A clear path forward.
          </h2>
          <p className="text-sm sm:text-base text-textMuted">
            From your first lesson to your first paid project — every step is
            structured, tracked, and verifiable.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* connector line (desktop) */}
          <div
            className="hidden md:block absolute top-[52px] left-[16%] right-[16%] border-t-2 border-dashed border-borderSubtle"
            aria-hidden
          />
          {/* Step 1 */}
          <div className="card-surface p-8 relative hover:border-brand-300 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center relative z-10 border border-brand-100">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-neutral-300 tracking-[0.2em]">
                01
              </span>
            </div>
            <h3 className="text-lg font-bold text-textMain mb-2">Learn</h3>
            <p className="text-sm text-textMuted leading-relaxed">
              Enroll in a structured program and work through practical modules
              — copywriting, media editing, workflows, and client operations.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card-surface p-8 relative hover:border-brand-300 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center relative z-10 border border-brand-100">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-neutral-300 tracking-[0.2em]">
                02
              </span>
            </div>
            <h3 className="text-lg font-bold text-textMain mb-2">
              Earn Credentials
            </h3>
            <p className="text-sm text-textMuted leading-relaxed">
              Complete your lessons and unlock verifiable certificates with
              unique IDs that prove your capability to clients.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card-surface p-8 relative hover:border-brand-300 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center relative z-10 border border-brand-100">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-neutral-300 tracking-[0.2em]">
                03
              </span>
            </div>
            <h3 className="text-lg font-bold text-textMain mb-2">
              Work & Earn
            </h3>
            <p className="text-sm text-textMuted leading-relaxed">
              Apply for client work that matches your completed programs, submit
              deliverables, and receive milestone payouts.
            </p>
          </div>
        </div>

        {/* value-prop checkmarks */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-textMuted">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
            Live progress tracking
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
            Public certificate verification
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
            Transparent wallet & payouts
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
            Support when you need it
          </div>
        </div>
      </section>

      {/* 4. PROGRAMS OVERVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              Curriculum Tiers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain mt-1">
              Choose the path that fits your goals
            </h2>
            <p className="text-sm text-textMuted mt-2 max-w-xl">
              Four progressive tiers — each one unlocks deeper skills, richer
              resources, and higher-level work opportunities.
            </p>
          </div>
          <Link
            href="/programs"
            className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1 shrink-0"
          >
            <span>Compare all programs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs === undefined ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-surface overflow-hidden animate-pulse">
                <div className="h-36 bg-neutral-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-neutral-200 rounded w-2/3"></div>
                  <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-16 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            programs.map((prog) => (
              <div
                key={prog._id}
                className="card-surface overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* Thumbnail */}
                <div className="relative h-36 overflow-hidden bg-brand-50">
                  {prog.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prog.thumbnail}
                      alt={prog.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-brand-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      {prog.duration}
                    </span>
                    {prog.price === 8000 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-brand-600 px-2.5 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-textMain leading-snug">
                    {prog.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-2.5">
                    <span className="text-2xl font-extrabold text-textMain">
                      {formatINR(prog.price)}
                    </span>
                    {prog.compareAtPrice && (
                      <span className="text-xs text-textMuted line-through">
                        {formatINR(prog.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-textMuted leading-relaxed mt-2.5 line-clamp-2">
                    {prog.shortDescription}
                  </p>

                  <div className="mt-4 pt-4 border-t border-borderSubtle space-y-1.5">
                    {prog.whatIncluded.slice(0, 2).map((item, idx) => (
                      <p
                        key={idx}
                        className="text-[11px] text-textMuted flex items-start gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item}</span>
                      </p>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-borderSubtle">
                    <Link
                      href={`/programs/${prog.slug}`}
                      className="btn-primary w-full text-center justify-center text-xs py-2.5"
                    >
                      <span>View Program</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. LEARNING → EARNING SPLIT */}
      <section className="bg-white border-y border-borderSubtle py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left — certificate preview */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-bgWarm rounded-2xl border border-borderSubtle p-8 sm:p-10">
                <div className="bg-white rounded-xl border border-borderSubtle shadow-md p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-brand-600" aria-hidden />
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                      Z
                    </div>
                    <span className="text-lg font-bold tracking-tight text-textMain">
                      ZetaGrow
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-textMuted">
                    Certificate of Completion
                  </p>
                  <p className="text-xl font-bold text-brand-700 mt-3">
                    {featuredProgram ? featuredProgram.name : "Your Program"}
                  </p>
                  <p className="text-xs text-textMuted mt-2 leading-relaxed max-w-xs mx-auto">
                    Awarded for completing all modules, lessons, and
                    assessments of the program curriculum.
                  </p>
                  <div className="mt-6 pt-6 border-t border-borderSubtle flex items-center justify-between text-[10px] text-textMuted">
                    <span>ID: ZG-XXXX-XXXX</span>
                    <span>Verify online</span>
                  </div>
                </div>
                <p className="text-center text-[11px] text-textMuted mt-5">
                  Every certificate carries a unique public verification ID —
                  clients can confirm it instantly.
                </p>
              </div>
            </div>

            {/* Right — outcomes */}
            <div className="order-1 lg:order-2">
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                What You&apos;ll Gain
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain mt-2">
                Skills that translate into paid work
              </h2>
              <p className="text-sm sm:text-base text-textMuted leading-relaxed mt-3 max-w-lg">
                Every program is built around practical outcomes, not passive
                video watching. Here&apos;s what completing one looks like:
              </p>

              <ul className="mt-7 space-y-3.5">
                {outcomes.length > 0 ? (
                  outcomes.map((o, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-textMain font-medium leading-relaxed">
                        {o}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-textMain font-medium leading-relaxed">
                        Hands-on modules with real deliverables
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-textMain font-medium leading-relaxed">
                        Downloadable templates & resource kits
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-textMain font-medium leading-relaxed">
                        A verifiable credential for your portfolio
                      </span>
                    </li>
                  </>
                )}
              </ul>

              <div className="mt-8 pt-6 border-t border-borderSubtle flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/programs" className="btn-primary text-sm px-6 py-2.5">
                  Browse Programs
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1"
                >
                  See how it works
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WORK OPPORTUNITIES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              Work Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain mt-1">
              Real client work, real payouts
            </h2>
            <p className="text-sm text-textMuted mt-2 max-w-xl">
              Curated contract listings posted by the platform. Apply once you
              complete the matching program requirements.
            </p>
          </div>
          <Link
            href="/work"
            className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1 shrink-0"
          >
            <span>Browse all openings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs === undefined ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card-surface p-6 animate-pulse space-y-3">
                <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div className="col-span-2 text-center py-10 card-surface">
              <p className="text-textMuted text-sm">
                New contract opportunities are added regularly.
              </p>
            </div>
          ) : (
            jobs.slice(0, 4).map((job) => (
              <div
                key={job._id}
                className="card-surface p-6 hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                        {job.category}
                      </span>
                      <h3 className="text-lg font-bold text-textMain mt-2">
                        {job.title}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-textMain">
                        {formatINR(job.payment)}
                      </span>
                      <span className="text-[11px] text-textMuted block capitalize">
                        {job.paymentType} payout
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-textMuted line-clamp-2">
                    {job.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {job.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-borderSubtle flex items-center justify-between">
                  <span className="text-xs text-textMuted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {job.estimatedDuration}
                  </span>
                  <Link
                    href="/work"
                    className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                  >
                    <span>Check Eligibility</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 7. WHY ZETAGROW */}
      <section className="bg-white border-y border-borderSubtle py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              Why ZetaGrow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
              Everything you need to grow, in one place
            </h2>
            <p className="text-sm sm:text-base text-textMuted">
              No scattered courses, no disconnected job boards — a single
              platform for your entire professional journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MonitorSmartphone,
                title: "Learning Dashboard",
                desc: "Track your progress across programs and modules with live completion states.",
              },
              {
                icon: BadgeCheck,
                title: "Verified Credentials",
                desc: "Earn certificates with unique public IDs that anyone can verify online.",
              },
              {
                icon: Briefcase,
                title: "Curated Work Marketplace",
                desc: "Apply to contract opportunities matched to your completed programs.",
              },
              {
                icon: Wallet,
                title: "Transparent Earnings",
                desc: "A wallet with clear transaction history — work payouts and affiliate earnings.",
              },
              {
                icon: Trophy,
                title: "Achievements & Progress",
                desc: "Unlock badges and positions as you complete courses and deliver work.",
              },
              {
                icon: Headset,
                title: "Real Human Support",
                desc: "A support team behind the platform — questions get answered, not ignored.",
              },
            ].map((f, idx) => (
              <div
                key={idx}
                className="card-surface p-7 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-textMain">{f.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed mt-2">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative overflow-hidden bg-brand-700 rounded-2xl p-10 sm:p-14 text-white text-center shadow-lg shadow-brand-700/20">
          <div
            className="absolute inset-0 bg-dots-light pointer-events-none"
            aria-hidden
          />
          <div className="relative space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to build your digital career?
            </h2>
            <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Start with one program. Learn, earn your credentials, and qualify
              for real client work. Your journey begins with a single step.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="px-7 py-3 rounded-lg bg-white text-brand-900 font-semibold text-sm hover:bg-neutral-100 transition-colors shadow-sm w-full sm:w-auto"
              >
                Create Your Free Account
              </Link>
              <Link
                href="/programs"
                className="px-7 py-3 rounded-lg border border-brand-400 text-white font-medium text-sm hover:bg-brand-800 transition-colors w-full sm:w-auto"
              >
                Browse All Programs
              </Link>
            </div>
            <p className="text-[11px] text-brand-200 pt-2">
              No income promises — just real skills, real work, and real
              growth.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}