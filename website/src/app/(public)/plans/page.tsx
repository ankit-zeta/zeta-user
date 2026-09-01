"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useGst, gstSuffix, withGst } from "@/lib/gst";
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  Star,
  ShieldCheck,
  Award,
  Clock,
  Users,
  TrendingUp,
  Target,
  GraduationCap,
  Briefcase,
  ChevronDown,
  Zap,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function PlansPage() {
  const plans = useQuery(api.plans.getPublicPlans);
  const [showComparison, setShowComparison] = useState(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ZetaGrow Learning Plans",
    description:
      "Curated bundles of certified courses for digital skills, marketing, e-commerce, coding, AI and sales.",
    itemListElement:
      plans?.map((p: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          description: p.description,
          brand: { "@type": "Brand", name: "ZetaGrow" },
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: `https://zetagrow.in/plans/${p.slug}`,
          },
        },
      })) || [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-0">
        {/* Hero Section */}
        <header className="relative overflow-hidden bg-white border-b border-borderSubtle">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div
              className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(23,107,77,0.25), transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-16 lg:py-24">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50/80 backdrop-blur-sm border border-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-8">
              <Star className="w-4 h-4" />
              <span>Trusted by 10,000+ learners across India</span>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-textMain leading-tight">
                Invest Once,
                <br />
                <span className="text-brand-600">Learn Forever</span>
              </h1>
              <p className="text-lg sm:text-xl text-textMuted leading-relaxed max-w-2xl mx-auto">
                One payment. Lifetime access. Verified certificates. Real work
                opportunities.
              </p>

              {/* Key benefits row */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                {[
                  { icon: ShieldCheck, text: "No subscriptions" },
                  { icon: Award, text: "Verified certificates" },
                  { icon: Zap, text: "Instant access" },
                  { icon: IndianRupee, text: "No hidden fees" },
                ].map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-borderSubtle text-xs font-medium text-textMuted"
                  >
                    <b.icon className="w-3.5 h-3.5 text-brand-600" />
                    {b.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Plans Grid */}
        <section className="py-16 lg:py-24 bg-neutral-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {plans === undefined ? (
              <PlansSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                {plans.map((plan: any, index: number) => {
                  const totalLessons = (plan.courses || []).reduce(
                    (s: number, c: any) => s + (c.lessonCount || 0),
                    0
                  );
                  const totalMinutes = (plan.courses || []).reduce(
                    (s: number, c: any) => s + (c.totalMinutes || 0),
                    0
                  );
                  const courseCount = plan.courses?.length || 0;
                  const isPopular = index === 2;

                  return (
                    <PlanCard
                      key={plan._id}
                      plan={plan}
                      index={index}
                      totalLessons={totalLessons}
                      totalMinutes={totalMinutes}
                      courseCount={courseCount}
                      isPopular={isPopular}
                    />
                  );
                })}
              </div>
            )}

            {/* Quick comparison */}
            {plans && plans.length > 0 && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors"
                >
                  {showComparison ? "Hide comparison" : "Compare all plans side by side"}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showComparison ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            )}

            {/* Comparison Table */}
            {showComparison && plans && (
              <div className="mt-8 overflow-x-auto">
                <ComparisonTable plans={plans} />
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-24 bg-white border-y border-borderSubtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">
                From Enrollment to Earning
              </h2>
              <p className="text-lg text-textMuted">
                Three simple steps to transform your skills and income.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  icon: GraduationCap,
                  title: "Pick a Plan",
                  desc: "Choose the learning path that matches your goals. Pay once, get lifetime access to every course inside.",
                },
                {
                  step: "02",
                  icon: BookOpen,
                  title: "Learn & Certify",
                  desc: "Complete text-based lessons at your own pace. Pass the test, earn a verified certificate with a public ID.",
                },
                {
                  step: "03",
                  icon: Briefcase,
                  title: "Get Work",
                  desc: "Use your certificates to unlock curated freelance projects and client work on the ZetaGrow marketplace.",
                },
              ].map((s, i) => (
                <div key={i} className="relative text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto relative">
                    <s.icon className="w-7 h-7" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-textMain">{s.title}</h3>
                  <p className="text-sm text-textMuted leading-relaxed max-w-xs mx-auto">
                    {s.desc}
                  </p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-brand-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 lg:py-24 bg-brand-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                Learner Outcomes
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">
                Skills That Pay
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  stat: "10,000+",
                  label: "Learners Enrolled",
                  icon: Users,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  stat: "85%",
                  label: "Complete Their Course",
                  icon: TrendingUp,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  stat: "200+",
                  label: "Work Projects Listed",
                  icon: Target,
                  color: "text-amber-600 bg-amber-50",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="card-surface p-6 text-center space-y-3 hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${s.color}`}
                  >
                    <s.icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-extrabold text-textMain">
                    {s.stat}
                  </p>
                  <p className="text-sm text-textMuted font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <header className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">
                Common Questions
              </h2>
            </header>
            <div className="space-y-3">
              {[
                {
                  q: "Can I buy courses individually instead of a plan?",
                  a: "Yes, but plans offer significantly better value. For example, the Digital Marketing plan includes 18 courses for ₹8,000 — buying them individually would cost much more.",
                },
                {
                  q: "Do I get future course updates?",
                  a: "Yes. Any updates to courses already in your plan are included free. New courses added to the platform may require a separate purchase unless they are part of your plan.",
                },
                {
                  q: "How do certificates work?",
                  a: "Each course has a final test. Score 80%+ to unlock a verified certificate with a unique public verification ID that employers and clients can verify on our website.",
                },
                {
                  q: "Is there a time limit?",
                  a: "No. Once enrolled, you have lifetime access. Learn at your own pace — there are no deadlines or expiry dates.",
                },
                {
                  q: "Can I upgrade later?",
                  a: "Yes. Contact support to upgrade by paying the price difference. Your existing progress carries over seamlessly.",
                },
                {
                  q: "What if I am not satisfied?",
                  a: "Since this is a digital product with instant access, refunds are not offered once content is accessed. We recommend reviewing the free preview lessons first.",
                },
              ].map((f, i) => (
                <details
                  key={i}
                  className="card-surface p-5 group"
                >
                  <summary className="flex items-center justify-between cursor-pointer text-base font-semibold text-textMain list-none group-hover:text-brand-700 transition-colors">
                    <span className="flex items-center gap-2 pr-8">
                      {f.q}
                    </span>
                    <ChevronDown className="w-5 h-5 text-textMuted group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <p className="text-sm text-textMuted leading-relaxed mt-4 pt-4 border-t border-borderSubtle">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-brand-600 py-16 lg:py-24">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl bg-white" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl bg-white" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Start Building Skills That Pay
            </h2>
            <p className="text-brand-100 text-lg leading-relaxed">
              Join thousands of learners earning verified certificates and real
              work opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-brand-50 transition-colors text-base shadow-lg"
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors text-base"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ─── Plan Card ──────────────────────────────────────────── */

function PlanCard({
  plan,
  index,
  totalLessons,
  totalMinutes,
  courseCount,
  isPopular,
}: any) {
  const gst = useGst();
  const savings = plan.compareAtPrice
    ? plan.compareAtPrice - plan.price
    : null;

  return (
    <Link
      href={`/plans/${plan.slug}`}
      className={`card-surface overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative ${
        isPopular ? "border-brand-400 ring-2 ring-brand-100" : ""
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider text-center py-1.5 z-10">
          Most Popular
        </div>
      )}

      {/* Top section with gradient */}
      <div
        className={`p-6 ${isPopular ? "pt-10" : ""} bg-gradient-to-br from-brand-50/80 to-white space-y-4`}
      >
        {/* Savings badge */}
        {savings && savings > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
            Save ₹{savings.toLocaleString("en-IN")}
          </span>
        )}

        <h3 className="text-lg font-bold text-textMain leading-tight">
          {plan.name}
        </h3>
        <p className="text-xs text-brand-700 font-medium leading-relaxed">
          {plan.tagline}
        </p>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-textMain">
              ₹{plan.price.toLocaleString("en-IN")}
            </span>
            {plan.compareAtPrice && (
              <span className="text-sm text-textMuted line-through">
                ₹{plan.compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {gst?.enabled && (
            <p className="text-[10px] text-textMuted">
              + {gst.rate}% {gst.label} at checkout
            </p>
          )}
          <p className="text-[11px] text-textMuted">One-time payment</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-3 bg-neutral-50 border-y border-borderSubtle flex items-center justify-between text-[11px] text-textMuted">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" /> {courseCount} courses
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> {totalLessons} lessons
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {totalMinutes >= 60
            ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
            : `${totalMinutes}m`}
        </span>
      </div>

      {/* Highlights */}
      <div className="p-6 flex flex-col flex-1 space-y-3">
        <ul className="space-y-2.5">
          {(plan.highlights || []).slice(0, 5).map((h: string, i: number) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-textMuted"
            >
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[13px]">{h}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-auto pt-4">
          <span
            className={`w-full text-center justify-center py-3 text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
              isPopular
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "bg-brand-50 text-brand-700 group-hover:bg-brand-100 border border-brand-200"
            } rounded-lg`}
          >
            View Plan Details
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Comparison Table ────────────────────────────────────── */

function ComparisonTable({ plans }: { plans: any[] }) {
  const gst = useGst();
  const features = [
    "Lifetime Access",
    "Verified Certificates",
    "Work Marketplace Access",
    "Downloadable Resources",
    "Text-Based Lessons",
    "Learn at Your Pace",
  ];

  return (
    <div className="card-surface overflow-hidden max-w-5xl mx-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-borderSubtle">
              <th className="text-left p-4 font-semibold text-textMain w-1/4">
                Features
              </th>
              {plans.map((p: any) => (
                <th
                  key={p._id}
                  className="text-center p-4 font-semibold text-textMain"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-textMuted font-normal">
                      {p.name.split(" ")[0]}
                    </p>
                    <p className="text-lg font-extrabold">
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-borderSubtle bg-neutral-50">
              <td className="p-4 font-medium text-textMain">Courses</td>
              {plans.map((p: any) => (
                <td
                  key={p._id}
                  className="text-center p-4 font-bold text-brand-700"
                >
                  {p.courses?.length || 0}
                </td>
              ))}
            </tr>
            {features.map((f, i) => (
              <tr
                key={i}
                className={`border-b border-borderSubtle ${i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}`}
              >
                <td className="p-4 text-textMuted">{f}</td>
                {plans.map((p: any) => (
                  <td key={p._id} className="text-center p-4">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 mx-auto" />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-brand-50/50">
              <td className="p-4 font-semibold text-textMain">Price</td>
              {plans.map((p: any) => (
                <td
                  key={p._id}
                  className="text-center p-4 font-extrabold text-textMain"
                >
                  ₹{p.price.toLocaleString("en-IN")}
                  {gst?.enabled && (
                    <p className="text-[10px] text-textMuted font-normal">
                      + {gst.rate}% {gst.label}
                    </p>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4"></td>
              {plans.map((p: any) => (
                <td key={p._id} className="text-center p-4">
                  <Link
                    href={`/plans/${p.slug}`}
                    className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1"
                  >
                    Get Started <ArrowRight className="w-3 h-3" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-surface overflow-hidden animate-pulse">
          <div className="h-32 bg-neutral-200" />
          <div className="p-6 space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-1/4" />
            <div className="h-6 bg-neutral-200 rounded w-3/4" />
            <div className="h-10 bg-neutral-200 rounded" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-3 bg-neutral-200 rounded w-full" />
              ))}
            </div>
            <div className="h-10 bg-neutral-200 rounded w-full mt-6" />
          </div>
        </div>
      ))}
    </div>
  );
}
