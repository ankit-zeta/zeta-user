"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useGst } from "@/lib/gst";
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
import JourneyScrollSection from "@/components/JourneyScrollSection";
import AudienceCarousel from "@/components/AudienceCarousel";

interface Testimonial {
  id: number;
  name: string;
  age: number;
  location: string;
  role: string;
  program: string;
  rating: number;
  text: string;
  avatar: string;
  outcome: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    age: 24,
    location: "Mumbai, Maharashtra",
    role: "Marketing Executive",
    program: "Sales & Communication Essentials",
    rating: 5,
    text: "The practical exercises changed how I approach client calls. Within 3 weeks of completing the course, I closed my first freelance deal worth ₹15,000. The templates alone are worth the price.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=priya-sharma&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "Landed ₹15K freelance project in 3 weeks"
  },
  {
    id: 2,
    name: "Arjun Patel",
    age: 22,
    location: "Ahmedabad, Gujarat",
    role: "College Student (B.Com)",
    program: "E-commerce Store Setup (Shopify)",
    rating: 5,
    text: "Built my first Shopify store for a local jewellery business during the course. They paid me ₹25,000 for the setup + 3 months maintenance. Now I have 3 recurring clients.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=arjun-patel&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "3 recurring clients at ₹25K each"
  },
  {
    id: 3,
    name: "Sneha Reddy",
    age: 26,
    location: "Bangalore, Karnataka",
    role: "Content Writer",
    program: "Copywriting Foundations",
    rating: 5,
    text: "Switched from ₹18K/month content mill work to ₹45K/month direct clients. The portfolio templates and cold email scripts were game-changers. Certificate helped me negotiate better rates on Upwork.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=sneha-reddy&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "2.5x income increase in 2 months"
  },
  {
    id: 4,
    name: "Rohit Kumar",
    age: 21,
    location: "Patna, Bihar",
    role: "Final Year B.Tech Student",
    program: "Meta & Google Ads Fundamentals",
    rating: 5,
    text: "Started managing ads for a local coaching centre while still in college. First month ₹8,000, now ₹22,000/month part-time. The campaign templates save me hours every week.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=rohit-kumar&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "₹22K/month part-time while studying"
  },
  {
    id: 5,
    name: "Kavya Nair",
    age: 28,
    location: "Kochi, Kerala",
    role: "HR Professional → Freelancer",
    program: "Social Media Marketing Mastery",
    rating: 5,
    text: "Quit my 9-5 after 4 months. Now managing social media for 5 brands — restaurants, a clinic, and 2 D2C brands. Monthly retainer income crossed ₹60K last month. The content calendar template is my daily driver.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=kavya-nair&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "Full-time freelancer at ₹60K+/month"
  },
  {
    id: 6,
    name: "Amit Singh",
    age: 35,
    location: "Delhi NCR",
    role: "Sales Manager (10 yrs exp)",
    program: "Advanced Sales & Negotiation",
    rating: 5,
    text: "After 10 years in corporate sales, I wanted to consult independently. This course gave me the framework to package my expertise. Signed 2 retainer clients at ₹40K/month each within 6 weeks of finishing.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=amit-singh&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "2 consulting retainers at ₹40K/month"
  },
  {
    id: 7,
    name: "Deepika Joshi",
    age: 23,
    location: "Pune, Maharashtra",
    role: "Graphic Designer",
    program: "Canva & Visual Content Creation",
    rating: 4,
    text: "Added social media design packages to my services. Charging ₹12,000/month per client for 15 posts + stories. Got 4 clients in 2 months. The brand kit templates cut my design time in half.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=deepika-joshi&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "4 design clients at ₹12K/month each"
  },
  {
    id: 8,
    name: "Vikram Mehta",
    age: 19,
    location: "Jaipur, Rajasthan",
    role: "12th Pass, Self-taught",
    program: "Coding Foundations (Python)",
    rating: 5,
    text: "No degree, no experience — just this course. Built a lead scraper tool for a real estate agent who paid ₹18,000. Now building automation scripts for 3 local businesses. The certificate got me taken seriously.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=vikram-mehta&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "₹18K first project without degree"
  },
  {
    id: 9,
    name: "Riya Agarwal",
    age: 25,
    location: "Lucknow, Uttar Pradesh",
    role: "Homemaker → Home-based Entrepreneur",
    program: "Instagram & Reels Growth",
    rating: 5,
    text: "Started a home bakery Instagram from zero. Hit 10K followers in 4 months using the Reels framework. Orders went from 5/week to 50+/week. The hashtag strategy and posting schedule templates were perfect.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=riya-agarwal&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "10K followers, 10x orders in 4 months"
  },
  {
    id: 10,
    name: "Siddharth Rao",
    age: 42,
    location: "Hyderabad, Telangana",
    role: "Small Business Owner",
    program: "Google Ads for Local Business",
    rating: 4,
    text: "Running a hardware store for 15 years. Learned to run my own Google Ads instead of paying agencies ₹15K/month. Now spend ₹8K/month on ads getting 3x better leads. Saved ₹1.8L/year + better results.",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=siddharth-rao&backgroundColor=17745e,10b981,059669&radius=50",
    outcome: "Saved ₹1.8L/year on agency fees"
  },
];

// Helper to format INR currency
function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

// Helper to get new courses for a plan (not in previous plans)
function getNewCoursesForPlan(plan: any, allPlans: any[]): any[] {
  const planIndex = allPlans.findIndex(p => p._id === plan._id);
  if (planIndex <= 0) return plan.courses || [];
  
  // Collect all course IDs from previous plans
  const previousCourseIds = new Set<string>();
  for (let i = 0; i < planIndex; i++) {
    (allPlans[i].courses || []).forEach((c: any) => previousCourseIds.add(c._id));
  }
  
  // Return only courses not in previous plans
  return (plan.courses || []).filter((c: any) => !previousCourseIds.has(c._id));
}

export default function HomePage() {
  const plans = useQuery(api.plans.getPublicPlans);
  const gst = useGst();
  const jobsResult = useQuery(api.jobs.getPublicJobs, { limit: 200 }) as {
    jobs: Array<{
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
    }>;
    total: number;
    hasMore: boolean;
  } | undefined;
  const jobs = jobsResult?.jobs;

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
  const outcomes = (plans && plans.length > 0)
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
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         2. STATS BAND — Beautiful inline stats
         ============================================================ */}
      <section className="relative overflow-hidden" aria-labelledby="stats-title">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-700 to-emerald-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <h2 id="stats-title" className="sr-only">Platform Statistics</h2>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
            {/* Courses */}
            <div className="flex items-center gap-4 sm:px-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <BookOpen className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{courseCount || "—"}</p>
                <p className="text-[11px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider leading-tight">Courses Across {plans?.length ?? 0} Plans</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-14 bg-white/20" />

            {/* Work */}
            <div className="flex items-center gap-4 sm:px-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <Briefcase className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{jobsResult?.total ?? jobs?.length ?? "—"}</p>
                <p className="text-[11px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider leading-tight">Open Work Opportunities</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-14 bg-white/20" />

            {/* Certificates */}
            <div className="flex items-center gap-4 sm:px-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <BadgeCheck className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Verified</p>
                <p className="text-[11px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider leading-tight">Certificates with Public IDs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         4. LEARNING PLANS — live from database
         ============================================================ */}
      <section id="programs" aria-labelledby="programs-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <header className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><GraduationCap className="w-3.5 h-3.5" aria-hidden="true" /> Learning Plans</span>
          <h2 id="programs-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain mt-3">One plan. Every course inside it.</h2>
          <p className="text-sm text-textMuted mt-2 max-w-lg mx-auto">Each plan bundles complete courses with resources and certificates — one payment unlocks the full set.</p>
          <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mt-4"><span>Compare all plans</span> <ChevronRight className="w-4 h-4" aria-hidden="true" /></Link>
        </header>

        {plans === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => <ProgramCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(plans as any[]).map((plan) => {
              const totalLessons = (plan.courses || []).reduce((s: number, c: any) => s + (c.lessonCount || 0), 0);
              const totalMinutes = (plan.courses || []).reduce((s: number, c: any) => s + (c.totalMinutes || 0), 0);
              const hours = totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`;
              return (
                <article key={plan._id} itemScope itemType="https://schema.org/Product" className="card-surface overflow-hidden flex flex-col hover:border-brand-200 hover:shadow-md transition-all duration-200 group">
                  <Link href={`/plans/${plan.slug}`} className="relative h-36 overflow-hidden bg-brand-50 block">
                    {plan.thumbnail ? (<Image src={plan.thumbnail} alt={`${plan.name} learning plan cover`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" /> ) : ( <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-brand-300" aria-hidden="true" /></div> )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1"><Layers className="w-2.5 h-2.5" aria-hidden="true" />{plan.courses?.length || 0} Courses</span>
                      {plan.price === 8000 && (<span className="text-[9px] font-bold uppercase tracking-wider text-white bg-brand-600 px-2 py-0.5 rounded-full">Popular</span>)}
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 itemProp="name" className="text-sm font-bold text-textMain leading-snug line-clamp-1">{plan.name}</h3>
                    <p className="text-[11px] text-textMuted mt-0.5 line-clamp-1">{plan.tagline}</p>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span itemProp="offers" itemType="https://schema.org/Offer" itemScope className="text-xl font-extrabold text-textMain"><meta itemProp="priceCurrency" content="INR" /><meta itemProp="price" content={String(plan.price)} />{formatINR(plan.price)}</span>
                      {plan.compareAtPrice && (<span className="text-xs text-textMuted line-through">{formatINR(plan.compareAtPrice)}</span>)}
                      <span className="text-[10px] text-textMuted">{gst?.enabled ? `incl. ${gst.rate}% ${gst.label}` : ""}</span>
                    </div>
                    <ul className="mt-3 space-y-1" role="list">
                      <li className="flex items-center gap-1.5 text-[11px] text-textMuted"><BookOpen className="w-3 h-3 text-brand-600 shrink-0" aria-hidden="true" />{totalLessons} lessons · {hours}</li>
                      <li className="flex items-center gap-1.5 text-[11px] text-textMuted"><Layers className="w-3 h-3 text-brand-600 shrink-0" aria-hidden="true" />{(plan.resourceList || []).length} resource kits</li>
                      <li className="flex items-center gap-1.5 text-[11px] text-textMuted"><BadgeCheck className="w-3 h-3 text-brand-600 shrink-0" aria-hidden="true" />Verified certificate</li>
                    </ul>
                    <div className="mt-auto pt-3 border-t border-borderSubtle">
                      <Link href={`/plans/${plan.slug}`} className="btn-primary w-full text-center justify-center text-xs py-2"><span>View Plan</span><ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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
         3b. JOURNEY SCROLL — Immersive storytelling cards
         ============================================================ */}
      <JourneyScrollSection />

      {/* ============================================================
         2b. WHO IT'S FOR — Audience carousel
         ============================================================ */}
      <AudienceCarousel />
      {/* ============================================================
         4b. EXPLORE COURSES — categories with horizontal swipe
         ============================================================ */}
      {plans && plans.length > 0 && (
        <section id="courses" aria-labelledby="courses-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <header className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider"><BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Explore Courses</span>
            <h2 id="courses-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain mt-3">Browse every course by category</h2>
            <p className="text-sm text-textMuted mt-2 max-w-lg mx-auto">Swipe through the full catalog — each course lives inside one of our plans.</p>
          </header>

          {/* Sticky category tabs */}
          <nav aria-label="Course categories" className="sticky top-16 z-30 bg-bgWarm/80 backdrop-blur-lg border-b border-borderSubtle -mx-4 px-4 py-3 mb-8">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
              {(plans as any[]).map((p: any, i: number) => (
                <a
                  key={p._id}
                  href={`#cat-${p.slug}`}
                  className={`shrink-0 text-xs font-semibold rounded-full px-4 py-2 transition-all ${i === 0 ? "bg-brand-600 text-white shadow-sm" : "bg-white text-textMuted border border-borderSubtle hover:border-brand-300 hover:text-brand-700"}`}
                >
                  {p.name} <span className="ml-1 opacity-60">({p.courses?.length || 0})</span>
                </a>
              ))}
            </div>
          </nav>

          {(plans as any[]).map((plan: any) => {
            const newCourses = getNewCoursesForPlan(plan, plans as any[]).slice(0, 3);
            if (newCourses.length === 0) return null;
            return (
              <div key={plan._id} id={`cat-${plan.slug}`} className="mb-14 scroll-mt-32">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <h3 className="text-lg font-bold text-textMain">{plan.name}</h3>
                  <Link href={`/plans/${plan.slug}`} className="text-xs font-semibold text-brand-700 hover:text-brand-800 shrink-0 flex items-center gap-0.5">
                    View plan <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {newCourses.map((c: any) => (
                    <article key={c._id} itemScope itemType="https://schema.org/Course" className="card-surface overflow-hidden flex flex-col hover:border-brand-200 hover:shadow-md transition-all duration-200 group">
                      <Link href={`/programs/${c.slug}`} className="relative aspect-video overflow-hidden bg-brand-50 block">
                        {c.thumbnail ? (
                          <Image src={c.thumbnail} alt={`${c.name} — course thumbnail`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-brand-300" aria-hidden="true" /></div>
                        )}
                      </Link>
                      <div className="p-3.5 flex flex-col flex-1">
                        <h4 itemProp="name" className="text-sm font-bold text-textMain leading-snug line-clamp-2 mb-1">{c.name}</h4>
                        <p className="text-[11px] text-textMuted leading-relaxed line-clamp-2 mb-3">{c.shortDescription}</p>
                        <div className="mt-auto flex items-center gap-2 text-[11px] text-textMuted">
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.lessonCount}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.totalMinutes >= 60 ? `${Math.floor(c.totalMinutes / 60)}h ${c.totalMinutes % 60}m` : `${c.totalMinutes}m`}</span>
                          {(c.format ?? "text") !== "video" && <><span aria-hidden="true">·</span><span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">Text</span></>}
                        </div>
                      </div>
                    </article>
                  ))}
                  {newCourses.length > 0 && (
                    <Link href={`/plans/${plan.slug}`} className="card-surface flex flex-col items-center justify-center text-center p-6 space-y-2 hover:border-brand-300 hover:shadow-lg transition-all group min-h-[180px]">
                      <Layers className="w-7 h-7 text-brand-600" aria-hidden="true" />
                      <p className="text-xs font-bold text-textMain">Unlock all {plan.courses?.length} courses</p>
                      <span className="text-xs font-bold text-brand-700">₹{plan.price.toLocaleString("en-IN")}{gst?.enabled ? " incl. GST" : ""} →</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

{/* ============================================================
          5. WHAT YOU'LL GAIN — Sleek Glassmorphism Card
          ============================================================ */}
      <section id="outcomes" aria-labelledby="outcomes-title" className="relative py-16 sm:py-20 lg:py-24">
        {/* Glassmorphism section background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-white to-brand-600/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" aria-hidden="true" />
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/30" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Glassmorphism Card */}
          <div className="relative rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/30 shadow-xl shadow-black/5 overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* LEFT — Content */}
                <div>
                  <header className="mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                      <Star className="w-3.5 h-3.5" aria-hidden="true" />
                      What You'll Gain
                    </span>
                    <h2 id="outcomes-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textMain mt-2 leading-snug">
                      Skills that translate into <span className="text-brand-700">real opportunities</span>
                    </h2>
                  </header>

                  <ul className="space-y-3" role="list">
                    {[
                      { icon: CheckCircle2, text: "Hands-on learning with practical deliverables" },
                      { icon: CheckCircle2, text: "Downloadable templates, tools & resource kits" },
                      { icon: BadgeCheck, text: "Verifiable certificate for your portfolio" },
                      { icon: Briefcase, text: "Access to real freelance & contract work" },
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-textMain font-medium leading-relaxed group">
                        <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                          <item.icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span>{item.text}</span>
                      </li>
))}
                  </ul>

                  <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-borderSubtle">
                    <Link href="/programs" className="btn-primary text-sm px-5 py-2.5">
                      Browse Programs
                    </Link>
                    <Link href="/how-it-works" className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors">
                      <span>See how it works</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* RIGHT — Certificate Image */}
                <div className="relative order-2 lg:order-1">
                  <div className="relative aspect-[1.5/1] max-w-full">
                    <Image
                      src="/certificate-demo.jpg"
                      alt="ZetaGrow verified certificate — Sales & Communication Essentials"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <p className="text-center text-xs text-textMuted mt-3 max-w-xs">
                    Verifiable certificate with unique ID
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
</section>

      {/* ============================================================
          5b. TESTIMONIALS — Real Learners, Real Results (Auto-scroll Marquee)
          ============================================================ */}
      <section id="testimonials" aria-labelledby="testimonials-title" className="relative py-16 sm:py-20 lg:py-24 overflow-hidden group">
        {/* Glassmorphism section background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-white to-brand-600/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5" aria-hidden="true" />
              Trusted by Learners Across India
            </span>
            <h2 id="testimonials-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain mt-4 leading-snug">
              Real stories from <span className="text-brand-700">real learners</span>
            </h2>
            <p className="text-lg text-textMuted leading-relaxed mt-4 max-w-2xl mx-auto">
              Thousands of Indians have upskilled with ZetaGrow and landed freelance gigs, better jobs, and new career paths.
            </p>
          </header>
        </div>

        {/* ── Auto-scrolling Marquee Row 1 (left to right) ── */}
        <div className="relative mb-6">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-white/80 via-white/40 to-transparent z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 pointer-events-none" aria-hidden="true" />

          <div className="flex w-max animate-marquee-left group-hover:[animation-play-state:paused]">
            {[...testimonials.slice(0, 5), ...testimonials.slice(0, 5)].map((t, idx) => (
              <TestimonialCardCompact key={`row1-${t.id}-${idx}`} testimonial={t} />
            ))}
          </div>
        </div>

        {/* ── Auto-scrolling Marquee Row 2 (right to left) ── */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-white/80 via-white/40 to-transparent z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 pointer-events-none" aria-hidden="true" />

          <div className="flex w-max animate-marquee-right group-hover:[animation-play-state:paused]">
            {[...testimonials.slice(5, 10), ...testimonials.slice(5, 10)].map((t, idx) => (
              <TestimonialCardCompact key={`row2-${t.id}-${idx}`} testimonial={t} />
            ))}
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
                { q: "Are ZetaGrow certificates verified and shareable?", a: "Yes. Every course ends with a short test, and passing it generates a certificate with a unique public ID. Anyone — employers or clients — can verify it instantly on our website." },
                { q: "Do I need prior experience to start a course?", a: "No. Courses like Coding Foundations and Basics of Sales are written for complete beginners. Each plan shows exactly what is covered so you can pick the right starting point." },
                { q: "How are the courses delivered?", a: "All courses are text-based study material inside your dashboard — read at your own pace on any device, with practical exercises after key concepts and downloadable resource kits included in your plan." },
                { q: "What topics do the plans cover?", a: "Plans span sales and communication, e-commerce store setup (Shopify & WooCommerce), Meta and Google ads, social media marketing, coding from basics to advanced, AI tools and prompting, analytics, automation and freelancing systems." },
                { q: "How long do I get access to a course?", a: "Every course includes lifetime access to its lessons and future curriculum updates within your plan." },
                { q: "Can working professionals study part-time?", a: "Absolutely. Lessons average 15–30 minutes of focused reading. Most learners complete a full course in 1–3 weeks studying under an hour a day." },
                { q: "Is ZetaGrow a job placement or investment scheme?", a: "No. ZetaGrow is an education platform. We provide structured learning, verifiable certificates and access to a curated work marketplace where qualified learners can apply for client projects. We never promise income or employment outcomes." },
                { q: "How do work opportunities on the platform function?", a: "Verified client projects list specific prerequisites — such as completing a relevant course tier. Once you meet the requirement, you can apply, submit deliverables and receive milestone payments through the platform wallet." },
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
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-50 p-6 sm:p-10 lg:p-16 text-center">
          {/* Subtle green radial accents */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(23,107,77,0.08),transparent_50%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(23,107,77,0.06),transparent_50%)]" aria-hidden="true" />
          {/* Glass card */}
          <div className="relative bg-white/70 backdrop-blur-lg border border-white/80 rounded-xl sm:rounded-2xl p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(23,107,77,0.08)]">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-brand-800 leading-tight">Ready to build your digital career?</h2>
            <p className="text-brand-600/70 max-w-xl mx-auto text-sm sm:text-lg leading-relaxed mt-4 sm:mt-5">Start with one program. Learn, earn your credentials, and qualify for real client work. Your journey begins with a single step.</p>
            <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/signup" className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 w-full sm:w-auto">Create Your Free Account</Link>
              <Link href="/programs" className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border border-brand-200 text-brand-700 font-medium text-sm hover:bg-brand-50 transition-all w-full sm:w-auto">Browse All Programs</Link>
            </div>
            <p className="text-[11px] text-brand-400 pt-4 sm:pt-6">No income promises — just real skills, real work, and real growth.</p>
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
  return <article className="card-surface p-7 hover:border-brand-300 hover:border-brand-200 hover:shadow-md transition-all duration-300"><div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-5"><feature.icon className="w-5 h-5" aria-hidden="true" /></div><h3 className="text-base font-bold text-textMain">{feature.title}</h3><p className="text-sm text-textMuted leading-relaxed mt-2">{feature.desc}</p></article>;
}

function TestimonialCardCompact({ testimonial }: { testimonial: Testimonial }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
    <Star key={n} className={`w-3 h-3 ${n <= testimonial.rating ? "text-amber-400 fill-current" : "text-neutral-300"}`} aria-hidden="true" />
  ));

  return (
    <article className="flex-shrink-0 w-[350px] sm:w-[400px] mx-3">
      <div className="relative h-full card-surface p-5 rounded-2xl border border-borderSubtle hover:border-brand-200 hover:shadow-xl transition-all duration-300 bg-white">
        {/* Quote mark */}
        <div className="absolute top-3 right-3 text-brand-100" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 9.011-9.57 2.441 0 4.612.844 6.242 2.195v6.353h-7.698v2.022h5.445v2.391h-13v-3.391c0-1.879-.63-3.47-1.871-4.683v-6.856h2.557v2.23c1.57-.906 3.497-1.468 5.659-1.468 5.454 0 9.277 3.939 9.277 9.44v3.754h-7.321zm-14.017 0v-7.391c0-5.704 3.713-9.57 8.993-9.57 2.424 0 4.595.844 6.224 2.195v6.353h-7.68v2.022h5.428v2.391h-13v-3.391c0-1.879-.613-3.47-1.853-4.683v-6.856h2.54v2.23c1.553-.906 3.48-1.468 5.641-1.468 5.436 0 9.26 3.939 9.26 9.44v3.754h-7.303z"/></svg>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-3" aria-label={`${testimonial.rating} out of 5 stars`}>
          {stars}
        </div>

        {/* Testimonial text */}
        <blockquote className="text-textMain leading-relaxed mb-4">
          <p className="text-sm font-medium line-clamp-4">&ldquo;{testimonial.text}&rdquo;</p>
        </blockquote>

        {/* Outcome badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-200">
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
            {testimonial.outcome}
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pt-3 border-t border-borderSubtle">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-brand-100 flex-shrink-0 bg-brand-50">
            <img
              src={testimonial.avatar}
              alt={`${testimonial.name}, ${testimonial.age}, ${testimonial.location}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-textMain text-sm truncate">{testimonial.name}</p>
            <p className="text-[11px] text-textMuted">{testimonial.age} yrs · {testimonial.location}</p>
            <p className="text-[11px] text-brand-700 font-medium">{testimonial.program}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
