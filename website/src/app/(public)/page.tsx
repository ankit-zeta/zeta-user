"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Target,
  Users,
  Zap,
  Star,
  ArrowUpRight,
  Shield,
  Globe,
  BarChart2,
  Layers,
  HelpCircle,
  ChevronDown,
  Video,
} from "lucide-react";

function formatINR(value: number) {
  return "₹" + value.toLocaleString("en-IN");
}

export default function HomePage() {
  const plans = useQuery(api.plans.getPublicPlans);
  const jobs = useQuery(api.jobs.getPublicJobs) as Array<{
    _id: string;
    _creationTime: number;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    category: string;
    skills: string[];
    requirements: string[];
    requiredProgramId: string | undefined;
    requiredAchievementId: string | undefined;
    payment: number;
    paymentType: string;
    workType: string;
    difficulty: string;
    estimatedDuration: string;
    deadline: string;
    openings: number;
    status: string;
    applicationQuestions: string[];
    attachments: string[] | undefined;
    company: string | undefined;
    coverImageStorageId: string | undefined;
    createdAt: number;
    updatedAt: number;
    coverImageUrl: string | null;
  }> | undefined;

  // Live stats derived from database
  const courseCount =
    plans?.reduce((s: number, p: any) => s + (p.courses?.length || 0), 0) ?? 0;
  const lessonCount =
    plans?.reduce(
      (s: number, p: any) =>
        s + (p.courses || []).reduce((cs: number, c: any) => cs + (c.lessonCount || 0), 0),
      0
    ) ?? 0;
  const resourceCount =
    plans?.reduce((s: number, p: any) => s + (p.resourceList?.length || 0), 0) ?? 0;

  const featuredJob = jobs && jobs.length > 0 ? jobs[0] : null;
  const outcomes =
    plans && plans.length > 0
      ? [
          `${courseCount} complete courses across ${plans.length} learning plans`,
          `${lessonCount} text-based lessons with practical exercises`,
          `${resourceCount} resource kits: templates, playbooks & guides`,
          "A verified, publicly-checkable certificate per course",
        ]
      : [];

  return (
    <div className="pb-20">
      {/* ============================================================
         1. HERO SECTION — Simple, Clean, Conversion-Focused
         ============================================================ */}
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="relative overflow-hidden border-b border-borderSubtle bg-bgWarm"
      >
        {/* Smooth gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-bgWarm"
          aria-hidden="true"
        />
        {/* Soft glowing brand blobs */}
        <div
          className="absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(23,107,77,0.28), transparent 65%)" }}
          aria-hidden="true"
        />
        <div
          className="absolute top-10 right-[8%] w-[380px] h-[380px] rounded-full opacity-35 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.22), transparent 65%)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 left-[5%] w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(23,107,77,0.20), transparent 70%)" }}
          aria-hidden="true"
        />

        {/* Subtle background texture */}
        <div
          className="absolute inset-0 bg-dots opacity-10 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28">
            {/* Hero Content — Centered, Simple */}
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* 🎥 Video courses coming soon — announcement */}
              <div className="inline-flex flex-col sm:flex-row items-center gap-2.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Video className="w-4 h-4" />
                  New: Video Courses
                </span>
                <span className="hidden sm:block w-px h-4 bg-white/30" aria-hidden="true" />
                <span className="text-xs text-brand-50">
                  Video-format programmes + free courses launching soon — coding, sales, business, e-commerce &amp; skilled professions
                </span>
              </div>

              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-borderSubtle shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-600" aria-hidden="true" />
                <span className="text-xs font-semibold text-textMain tracking-wide">
                  Professional Digital Career Platform
                </span>
              </div>

              {/* H1 — Clear, compelling */}
              <h1
                id="hero-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-textMain leading-[1.02]"
              >
                <span className="block">Learn practical skills.</span>
                <span className="block text-brand-700">Work on real projects.</span>
                <span className="block">Build a career that pays.</span>
              </h1>

              {/* Supporting copy */}
              <p className="text-lg md:text-xl text-textMuted leading-relaxed max-w-xl mx-auto">
                ZetaGrow combines structured digital education, verifiable
                credentials, and a real contract marketplace — so the skills
                you build actually lead somewhere.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="group btn-primary w-full sm:w-auto text-base px-8 py-4 flex items-center justify-center gap-2 shadow-md shadow-brand-600/15 transition-colors hover:shadow-lg"
                  aria-label="Create your free account and start learning"
                >
                  <span>Start Free — No Card Required</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/programs"
                  className="group btn-secondary w-full sm:w-auto text-base px-8 py-4 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-50"
                  aria-label="Browse all learning programs"
                >
                  <BookOpen className="w-4 h-4 text-brand-700" aria-hidden="true" />
                  <span>Browse Programs</span>
                </Link>
              </div>

              {/* Simple trust line — live numbers */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-borderSubtle">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  <span className="text-sm font-semibold text-textMain">
                    {courseCount}{" "}
                  </span>
                  <span className="text-textMuted font-normal">
                    Courses Across {plans?.length ?? 0} Plans
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-700" aria-hidden="true" />
                  <span className="text-sm font-medium text-textMain">
                    {jobs ? jobs.length : "—"}
                  </span>
                  <span className="text-textMuted font-normal">
                    Open Work Opportunities
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-brand-700" aria-hidden="true" />
                  <span className="text-sm font-medium text-textMain">
                    Verified{" "}
                  </span>
                  <span className="text-textMuted font-normal">Certificates with Public IDs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         2. STATS BAND — Quick scan (matches hero stats)
         ============================================================ */}
      <section className="bg-white border-b border-borderSubtle" aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Platform Statistics</h2>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            <StatCard icon={<BookOpen className="w-5 h-5" />} value={courseCount} label="Courses Across Learning Plans" ariaLabel={`${courseCount} courses available across learning plans`} />
            <StatCard icon={<Briefcase className="w-5 h-5" />} value={jobs ? jobs.length : "—"} label="Open Work Opportunities" ariaLabel={`${jobs?.length ?? 0} open work opportunities`} />
            <StatCard icon={<BadgeCheck className="w-5 h-5" />} value="Verified" label="Certificates with Public IDs" isText={true} ariaLabel="All certificates are publicly verifiable" />
          </div>
        </div>
      </section>

      {/* ============================================================
         3. HOW IT WORKS
         ============================================================ */}
      <section id="journey" aria-labelledby="journey-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <header className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            How It Works
          </span>
          <h2 id="journey-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">One platform. A clear path forward.</h2>
          <p className="text-base sm:text-lg text-textMuted max-w-xl mx-auto">From your first lesson to your first paid project — every step is structured, tracked, and verifiable.</p>
        </header>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="hidden lg:block absolute top-[60px] left-[16%] right-[16%] border-t-2 border-dashed border-borderSubtle" aria-hidden="true" />
          {[
            { number: "01", icon: BookOpen, title: "Learn", desc: "Enroll in structured programs and work through practical modules — copywriting, media editing, workflows, and client operations." },
            { number: "02", icon: BadgeCheck, title: "Earn Credentials", desc: "Complete your lessons and unlock verifiable certificates with unique IDs that prove your capability to clients." },
            { number: "03", icon: Briefcase, title: "Work & Earn", desc: "Apply for client work that matches your completed programs, submit deliverables, and receive milestone payouts." },
          ].map((step, idx) => <StepCard key={idx} step={step} index={idx} />)}
        </div>

        <div className="mt-14 mb-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-textMuted">
          {[{ icon: CheckCircle2, text: "Live progress tracking" }, { icon: BadgeCheck, text: "Public certificate verification" }, { icon: Wallet, text: "Transparent wallet & payouts" }, { icon: Headset, text: "Support when you need it" }].map((v, i) => (
            <div key={i} className="flex items-center gap-2"><v.icon className="w-4 h-4 text-brand-600" aria-hidden="true" /><span>{v.text}</span></div>
          ))}
        </div>
      </section>

      {/* ============================================================
         2b. WHO IT'S FOR — audience segments (SEO internal content)
         ============================================================ */}
      <section aria-labelledby="who-title" className="bg-white border-y border-borderSubtle py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center max-w-2xl mx-auto space-y-3 mb-14"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><Users className="w-3.5 h-3.5" aria-hidden="true" /> Who Is ZetaGrow For</span><h2 id="who-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">Built for learners at every starting point</h2><p className="text-base text-textMuted">Whether you are starting from zero or adding new skills, there is a structured path here for you.</p></header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Students & Freshers", desc: "Add practical digital skills and verified certificates to your resume alongside your degree — marketing, e-commerce, coding basics and more." },
              { icon: Briefcase, title: "Working Professionals", desc: "Upskill in Meta ads, Google ads, analytics or AI tools without quitting your job. Self-paced text lessons fit around your schedule." },
              { icon: BadgeCheck, title: "Freelancers", desc: "Strengthen your service stack — copywriting, store setup, campaign management — and earn client-facing certificates that build trust." },
              { icon: MonitorSmartphone, title: "Small Business Owners", desc: "Learn to set up your own online store, run your own ad campaigns and understand your analytics instead of outsourcing blindly." },
              { icon: Trophy, title: "Career Restarters", desc: "Re-enter the workforce confidently with structured, beginner-friendly courses and proof of completion that employers can verify." },
              { icon: Star, title: "Content Creators", desc: "Turn posting into a profession — learn short-form strategy, analytics and brand deals with structured lessons instead of guesswork." },
            ].map((a, i) => (
              <article key={i} className="card-surface p-7">
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4"><a.icon className="w-5 h-5" aria-hidden="true" /></div>
                <h3 className="text-base font-bold text-textMain">{a.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed mt-2">{a.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* ============================================================
         4b. EXPLORE COURSES — categories with horizontal swipe
         ============================================================ */}
      {plans && plans.length > 0 && (
        <section id="courses" aria-labelledby="courses-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Explore Courses</span>
              <h2 id="courses-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain mt-2">Browse every course by category</h2>
              <p className="text-base text-textMuted mt-3 max-w-xl">Swipe through the full catalog — each course lives inside one of our plans.</p>
            </div>
            {/* Category chips — horizontally scrollable on mobile */}
            <nav aria-label="Course categories" className="flex md:hidden gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
              {(plans as any[]).map((p: any) => (
                <a
                  key={p._id}
                  href={`#cat-${p.slug}`}
                  className="shrink-0 snap-start text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-3 py-1.5"
                >
                  {p.name}
                </a>
              ))}
            </nav>
          </header>

          {(plans as any[]).map((plan: any) => (
            <div key={plan._id} id={`cat-${plan.slug}`} className="mt-10 scroll-mt-24">
              {/* Category label row */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
                  <span className="w-2 h-6 rounded-full bg-brand-600 inline-block" aria-hidden="true"></span>
                  {plan.name}
                  <span className="text-[11px] font-semibold text-textMuted">({plan.courses?.length || 0} courses)</span>
                </h3>
                <Link href={`/plans/${plan.slug}`} className="text-xs font-semibold text-brand-700 hover:text-brand-800 shrink-0 flex items-center gap-0.5">
                  View plan <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {/* Horizontal swipe rail */}
              <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(plan.courses || []).map((c: any) => (
                  <article key={c._id} itemScope itemType="https://schema.org/Course" className="card-surface overflow-hidden flex flex-col shrink-0 w-[260px] sm:w-[280px] snap-start hover:border-brand-200 hover:shadow-md transition-all duration-200 group">
                    <Link href={`/programs/${c.slug}`} className="relative h-32 overflow-hidden bg-brand-50 block">
                      {c.thumbnail ? (
                        <Image src={c.thumbnail} alt={c.name} fill sizes="280px" className="object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-brand-300" aria-hidden="true" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    </Link>
                    <div className="p-4 space-y-1.5 flex flex-col flex-1">
                      <h4 itemProp="name" className="text-sm font-bold text-textMain leading-snug line-clamp-2">{c.name}</h4>
                      <p className="text-[11px] text-textMuted leading-relaxed line-clamp-2">{c.shortDescription}</p>
                      <div className="flex items-center justify-between pt-2 mt-auto border-t border-borderSubtle">
                        <span className="text-[11px] text-textMuted flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.lessonCount} lessons</span>
                        {(c.format ?? "text") !== "video" && <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">Text-Based</span>}
                        <span className="text-[11px] text-textMuted flex items-center gap-1"><Clock className="w-3 h-3" />{c.totalMinutes >= 60 ? `${Math.floor(c.totalMinutes / 60)}h ${c.totalMinutes % 60}m` : `${c.totalMinutes}m`}</span>
                        <Link href={`/programs/${c.slug}`} className="text-[11px] font-semibold text-brand-700 hover:underline">View →</Link>
                      </div>
                    </div>
                  </article>
                ))}
                {/* End-cap card linking to plan */}
                <Link href={`/plans/${plan.slug}`} className="shrink-0 w-[180px] snap-start card-surface flex flex-col items-center justify-center text-center p-6 space-y-2 hover:border-brand-300 hover:shadow-lg transition-all group">
                  <Layers className="w-8 h-8 text-brand-600" aria-hidden="true" />
                  <p className="text-xs font-bold text-textMain">Unlock all {plan.courses?.length} courses</p>
                  <p className="text-[11px] text-textMuted">in {plan.name}</p>
                  <span className="text-xs font-bold text-brand-700 mt-2">₹{plan.price.toLocaleString("en-IN")} →</span>
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ============================================================
         4. LEARNING PLANS — live from database
         ============================================================ */}
      <section id="programs" aria-labelledby="programs-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><GraduationCap className="w-3.5 h-3.5" aria-hidden="true" /> Learning Plans</span>
            <h2 id="programs-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain mt-2">One plan. Every course inside it.</h2>
            <p className="text-base text-textMuted mt-3 max-w-xl">Each plan bundles complete courses with resources and certificates — one payment unlocks the full set, exactly like ordering your favourite combo.</p>
          </div>
          <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 shrink-0"><span>Compare all plans</span> <ChevronRight className="w-4 h-4" aria-hidden="true" /></Link>
        </header>

        {plans === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => <ProgramCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(plans as any[]).map((plan) => {
              const totalLessons = (plan.courses || []).reduce((s: number, c: any) => s + (c.lessonCount || 0), 0);
              const totalMinutes = (plan.courses || []).reduce((s: number, c: any) => s + (c.totalMinutes || 0), 0);
              const hours = totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`;
              return (
                <article key={plan._id} itemScope itemType="https://schema.org/Product" className="card-surface overflow-hidden flex flex-col hover:border-brand-200 hover:shadow-md transition-all duration-300 group">
                  <Link href={`/plans/${plan.slug}`} className="relative h-40 overflow-hidden bg-brand-50 block">
                    {plan.thumbnail ? (<Image src={plan.thumbnail} alt={plan.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" loading="lazy" /> ) : ( <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-brand-300" aria-hidden="true" /></div> )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1"><Layers className="w-3 h-3" aria-hidden="true" />{plan.courses?.length || 0} Courses</span>
                      {plan.price === 8000 && (<span className="text-[10px] font-bold uppercase tracking-wider text-white bg-brand-600 px-2.5 py-1 rounded-full">Most Popular</span>)}
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 itemProp="name" className="text-base font-bold text-textMain leading-snug">{plan.name}</h3>
                    <p className="text-[11px] text-brand-700 font-semibold mt-0.5">{plan.tagline}</p>
                    <div className="flex items-baseline gap-2 mt-2.5"><span itemProp="offers" itemType="https://schema.org/Offer" itemScope className="text-2xl font-extrabold text-textMain"><meta itemProp="priceCurrency" content="INR" /><meta itemProp="price" content={String(plan.price)} />{formatINR(plan.price)}</span>{plan.compareAtPrice && (<span itemProp="offers" itemType="https://schema.org/Offer" itemScope className="text-xs text-textMuted line-through"><meta itemProp="priceCurrency" content="INR" /><meta itemProp="price" content={String(plan.compareAtPrice)} />{formatINR(plan.compareAtPrice)}</span>)}</div>
                    <p className="text-xs text-textMuted leading-relaxed mt-2 line-clamp-2">{plan.description}</p>
                    <ul className="mt-3 space-y-1.5" role="list">
                      <li className="flex items-center gap-2 text-[11px] text-textMuted"><BookOpen className="w-3.5 h-3.5 text-brand-700 shrink-0" aria-hidden="true" />{totalLessons} lessons · {hours} of study material</li>
                      <li className="flex items-center gap-2 text-[11px] text-textMuted"><Layers className="w-3.5 h-3.5 text-brand-700 shrink-0" aria-hidden="true" />{(plan.resourceList || []).length} resource kits included</li>
                      <li className="flex items-center gap-2 text-[11px] text-textMuted"><BadgeCheck className="w-3.5 h-3.5 text-brand-700 shrink-0" aria-hidden="true" />Certificate after each course test</li>
                    </ul>
                    <div className="mt-auto pt-4 border-t border-borderSubtle mt-4">
                      <Link href={`/plans/${plan.slug}`} className="btn-primary w-full text-center justify-center text-xs py-2.5"><span>View Plan Details</span><ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================
         5. LEARNING → EARNING — Certificate + Outcomes
         ============================================================ */}
      <section className="bg-white border-y border-borderSubtle py-24 mt-24" aria-labelledby="outcomes-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="bg-bgWarm rounded-2xl border border-borderSubtle p-8 sm:p-10">
                <div className="bg-white rounded-2xl border border-borderSubtle shadow-xl p-8 sm:p-10 text-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-brand-600" aria-hidden="true" />
                  <div className="flex items-center justify-center gap-2 mb-6"><div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">Z</div><span className="text-lg font-bold tracking-tight text-textMain">ZetaGrow</span></div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-textMuted">Certificate of Completion</p>
                  <p className="text-xl font-bold text-brand-700 mt-3">Your Completed Course</p>
                  <p className="text-sm text-textMuted mt-2 leading-relaxed max-w-xs mx-auto">Awarded for completing all modules, lessons, and assessments.</p>
                  <div className="mt-6 pt-6 border-t border-borderSubtle flex items-center justify-between text-[11px] text-textMuted"><span>ID: ZG-XXXX-XXXX</span><span>Verify online</span></div>
                </div>
                <p className="text-center text-[11px] text-textMuted mt-5">Every certificate carries a unique public verification ID — clients can confirm it instantly.</p>
              </div>
            </div>

            <div>
              <header className="mb-8"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><Star className="w-3.5 h-3.5" aria-hidden="true" /> What You'll Gain</span><h2 id="outcomes-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain mt-2">Skills that translate into paid work</h2><p className="text-base text-textMuted leading-relaxed mt-3 max-w-lg">Every program is built around practical outcomes, not passive video watching.</p></header>
              <ul className="space-y-4" role="list">{(outcomes.length > 0 ? outcomes : ["Hands-on modules with real deliverables", "Downloadable templates & resource kits", "A verifiable credential for your portfolio", "Access to curated client work opportunities"]).map((o, idx) => (<li key={idx} className="flex items-start gap-4"><div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" aria-hidden="true" /></div><span className="text-base text-textMain font-medium leading-relaxed pt-1">{o}</span></li>))}</ul>
              <div className="mt-10 pt-6 border-t border-borderSubtle flex flex-col sm:flex-row items-start sm:items-center gap-4"><Link href="/programs" className="btn-primary text-sm px-6 py-3">Browse Programs</Link><Link href="/how-it-works" className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1"><span>See how it works</span><ChevronRight className="w-4 h-4" aria-hidden="true" /></Link></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         6. WORK OPPORTUNITIES PREVIEW
         ============================================================ */}
      <section id="work" aria-labelledby="work-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"><div><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><Briefcase className="w-3.5 h-3.5" aria-hidden="true" /> Work Opportunities</span><h2 id="work-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain mt-2">Real client work, real payouts</h2><p className="text-base text-textMuted mt-3 max-w-xl">Curated contract listings posted by the platform. Apply once you complete the matching program requirements.</p></div><Link href="/work" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 shrink-0"><span>Browse all openings</span><ChevronRight className="w-4 h-4" aria-hidden="true" /></Link></header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{jobs === undefined ? Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />) : jobs.length === 0 ? <div className="col-span-3 text-center py-16 card-surface"><p className="text-textMuted text-base">New contract opportunities are added regularly.</p></div> : jobs.slice(0, 3).map((job) => <JobCard key={job._id} job={job} formatINR={formatINR} />)}</div>
      </section>

      {/* ============================================================
         7. WHY ZETAGROW
         ============================================================ */}
      <section className="bg-white border-y border-borderSubtle py-24 mt-24" aria-labelledby="why-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center max-w-2xl mx-auto space-y-3 mb-16"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Why ZetaGrow</span><h2 id="why-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">Everything you need to grow, in one place</h2><p className="text-base text-textMuted">No scattered courses, no disconnected job boards — a single platform for your entire professional journey.</p></header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard feature={{ icon: MonitorSmartphone, title: "Learning Dashboard", desc: "Track your progress across programs and modules with live completion states." }} />
            <FeatureCard feature={{ icon: BadgeCheck, title: "Verified Credentials", desc: "Earn certificates with unique public IDs that anyone can verify online." }} />
            <FeatureCard feature={{ icon: Briefcase, title: "Curated Work Marketplace", desc: "Apply to contract opportunities matched to your completed programs." }} />
            <FeatureCard feature={{ icon: Wallet, title: "Transparent Earnings", desc: "A wallet with clear transaction history — work payouts and affiliate earnings." }} />
            <FeatureCard feature={{ icon: Trophy, title: "Achievements & Progress", desc: "Unlock badges and positions as you complete courses and deliver work." }} />
            <FeatureCard feature={{ icon: Headset, title: "Real Human Support", desc: "A support team behind the platform — questions get answered, not ignored." }} />
          </div>
        </div>
      </section>

      {/* ============================================================
         7b. FAQ — SEO (FAQPage structured data)
         ============================================================ */}
      <section aria-labelledby="faq-title" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <header className="text-center space-y-3 mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><HelpCircle className="w-3.5 h-3.5" aria-hidden="true" /> Frequently Asked Questions</span>
          <h2 id="faq-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">Everything learners ask before enrolling</h2>
        </header>
        <div className="space-y-3">
          {[
            { q: "Are ZetaGrow certificates verified and shareable?", a: "Yes. Every course ends with a short test, and passing it generates a certificate with a unique public ID. Anyone — employers or clients — can verify it instantly on our website." },
            { q: "Do I need prior experience to start a course?", a: "No. Courses like Coding Foundations and Basics of Sales are written for complete beginners. Each plan shows exactly what is covered so you can pick the right starting point." },
            { q: "How are the courses delivered?", a: "All courses are text-based study material inside your dashboard — read at your own pace on any device, with practical exercises after key concepts and downloadable resource kits included in your plan." },
            { q: "What topics do the plans cover?", a: "Plans span sales and communication, e-commerce store setup (Shopify & WooCommerce), Meta and Google ads, social media marketing, coding from basics to advanced, AI tools and prompting, analytics, automation and freelancing systems." },
            { q: "How long do I get access to a course?", a: "Every course includes lifetime access to its lessons and future curriculum updates within your plan." },
            { q: "Can working professionals study part-time?", a: "Absolutely. Lessons average 15–30 minutes of focused reading. Most learners complete a full course in 1–3 weeks studying under an hour a day." },
            { q: "Is ZetaGrow a job placement or investment scheme?", a: "No. ZetaGrow is an education platform. We provide structured learning, verifiable certificates and access to a curated work marketplace where qualified learners can apply for client projects. We never promise income or employment outcomes." },
            { q: "How do work opportunities on the platform function?", a: "Verified client projects list specific prerequisites — such as completing a relevant course tier. Once you meet the requirement, you can apply, submit deliverables and receive milestone payments through the platform wallet." },
          ].map((f, i) => (
            <details key={i} className="card-surface p-5 group" open={i === 0}>
              <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-textMain list-none">
                {f.q}
                <ChevronDown className="w-4 h-4 text-textMuted shrink-0 ml-3 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="text-xs text-textMuted leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                { q: "Are ZetaGrow certificates verified and shareable?", a: "Yes. Every course ends with a short test, and passing it generates a certificate with a unique public ID that anyone can verify instantly." },
                { q: "Do I need prior experience to start a course?", a: "No. Beginner courses like Coding Foundations and Basics of Sales assume zero background knowledge." },
                { q: "How are the courses delivered?", a: "All courses are text-based study material in your dashboard with exercises and downloadable kits, self-paced on any device." },
                { q: "What topics do the plans cover?", a: "Sales and communication, Shopify and WooCommerce stores, Meta and Google ads, social media marketing, coding, AI tools and prompting, analytics, automation, freelancing systems." },
                { q: "How long do I get access to a course?", a: "Lifetime access to lessons and future updates within your plan." },
                { q: "Is ZetaGrow a job placement or investment scheme?", a: "No. ZetaGrow is an education platform offering courses, certificates and a curated work marketplace. No income or employment outcomes are promised." },
              ].map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </section>
      {/* ============================================================
         8. CTA — Final conversion
         ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="relative overflow-hidden bg-brand-700 rounded-3xl p-10 sm:p-12 lg:p-16 text-white text-center shadow-2xl shadow-brand-700/25">
          <div className="absolute inset-0 bg-dots-light pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-transparent to-brand-800/20" aria-hidden="true" />
          <div className="relative space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Ready to build your digital career?</h2>
            <p className="text-brand-100 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">Start with one program. Learn, earn your credentials, and qualify for real client work. Your journey begins with a single step.</p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"><Link href="/signup" className="px-8 py-4 rounded-xl bg-white text-brand-900 font-semibold text-base hover:bg-neutral-100 transition-colors shadow-lg shadow-black/10 w-full sm:w-auto">Create Your Free Account</Link><Link href="/programs" className="px-8 py-4 rounded-xl border-2 border-brand-400 text-white font-medium text-base hover:bg-brand-600 hover:border-brand-600 transition-colors w-full sm:w-auto">Browse All Programs</Link></div>
            <p className="text-[12px] text-brand-200 pt-2">No income promises — just real skills, real work, and real growth.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  ariaLabel: string;
  isText?: boolean;
  suffix?: string;
  accent?: string;
}

function StatCard({ icon, value, label, ariaLabel, isText = false, suffix = "", accent = "bg-brand-50 text-brand-700" }: StatCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-borderSubtle bg-white hover:border-brand-300 hover:shadow-lg transition-all" role="img" aria-label={ariaLabel}>
      <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center shrink-0 mb-3`}>{icon}</div>
      <p className="text-2xl sm:text-3xl font-extrabold text-textMain leading-none">{isText ? value : typeof value === "number" ? value.toLocaleString() : value}{suffix}</p>
      <p className="text-xs text-textMuted mt-1">{label}</p>
    </div>
  );
}

interface StepCardProps {
  step: { number: string; icon: React.ElementType; title: string; desc: string };
  index: number;
}

function StepCard({ step, index }: StepCardProps) {
  return (
    <article className="card-surface p-7 relative hover:border-brand-300 hover:border-brand-200 hover:shadow-md transition-all duration-300" itemScope itemType="https://schema.org/HowToStep">
      <div className="flex items-center justify-between mb-5">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center relative z-10 border border-brand-100"><step.icon className="w-6 h-6" aria-hidden="true" /></div>
        <span className="text-xs font-bold text-neutral-300 tracking-[0.2em]">{step.number}</span>
      </div>
      <h3 itemProp="name" className="text-lg font-bold text-textMain mb-2">{step.title}</h3>
      <p itemProp="description" className="text-sm text-textMuted leading-relaxed">{step.desc}</p>
    </article>
  );
}

function ProgramCardSkeleton() { return <article className="card-surface overflow-hidden animate-pulse"><div className="h-36 bg-neutral-200"></div><div className="p-6 space-y-4"><div className="h-5 bg-neutral-200 rounded w-2/3"></div><div className="h-8 bg-neutral-200 rounded w-1/2"></div><div className="h-16 bg-neutral-200 rounded"></div></div></article>; }

function JobCard({ job, formatINR }: { job: { _id: string; category: string; title: string; payment: number; paymentType: string; shortDescription: string; skills: string[]; estimatedDuration: string }; formatINR: (value: number) => string }) {
  return <article key={job._id} className="card-surface p-6 hover:border-brand-300 hover:border-brand-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between"><div className="space-y-3"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-brand-600" aria-hidden="true" />{job.category}</span><h3 className="text-lg font-bold text-textMain mt-2">{job.title}</h3></div><div className="text-right shrink-0"><span className="text-lg font-bold text-textMain">{formatINR(job.payment)}</span><span className="text-[11px] text-textMuted block capitalize">{job.paymentType} payout</span></div></div><p className="text-xs text-textMuted line-clamp-2">{job.shortDescription}</p><div className="flex flex-wrap gap-1.5 pt-2">{job.skills.map((s, idx) => <span key={idx} className="text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">{s}</span>)}</div></div><div className="pt-5 mt-4 border-t border-borderSubtle flex items-center justify-between"><span className="text-xs text-textMuted flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{job.estimatedDuration}</span><Link href="/work" className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"><span>Check Eligibility</span><ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /></Link></div></article>; }

function JobCardSkeleton() { return <article className="card-surface p-6 animate-pulse space-y-3"><div className="h-6 bg-neutral-200 rounded w-1/3"></div><div className="h-4 bg-neutral-200 rounded w-full"></div></article>; }

function FeatureCard({ feature }: { feature: { icon: React.ElementType; title: string; desc: string } }) {
  return <article className="card-surface p-7 hover:border-brand-300 hover:border-brand-200 hover:shadow-md transition-all duration-300"><div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-5"><feature.icon className="w-5 h-5" aria-hidden="true" /></div><h3 className="text-base font-bold text-textMain">{feature.title}</h3><p className="text-sm text-textMuted leading-relaxed mt-2">{feature.desc}</p></article>; }
