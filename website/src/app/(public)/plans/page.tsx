"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useGst, gstSuffix } from "@/lib/gst";
import { CheckCircle2, ArrowRight, BookOpen, Layers, Star, ShieldCheck, Award, Clock, Users, TrendingUp, Target, Sparkles, GraduationCap, Briefcase, BarChart2 } from "lucide-react";

export default function PlansPage() {
  const plans = useQuery(api.plans.getPublicPlans);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ZetaGrow Learning Plans",
    description: "Curated bundles of certified courses for digital skills, marketing, e-commerce, coding, AI and sales.",
    itemListElement: plans?.map((p: any, i: number) => ({
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
          url: `https://zetagrow.in/plans/${p.slug}`
        }
      }
    })) || []
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-0">
        {/* Hero Section */}
        <header className="relative overflow-hidden bg-white border-b border-borderSubtle py-16 lg:py-24">
          {/* Background gradient blobs */}
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, rgba(23,107,77,0.25), transparent 70%)" }} />
            <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, rgba(23,107,77,0.15), transparent 70%)" }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50/80 backdrop-blur-sm border border-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 10,000+ learners across India</span>
            </div>

            {/* Main Headline */}
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-textMain leading-tight">
                Choose Your Plan,
                <br />
                <span className="text-brand-600">Unlock Every Course Inside</span>
              </h1>
              <p className="text-lg sm:text-xl text-textMuted leading-relaxed max-w-3xl mx-auto">
                One payment. Lifetime access. Verified certificates. Real work opportunities.
                <br />
                <span className="font-medium text-brand-700">No subscriptions. No hidden fees. No expiry.</span>
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <MetricCard
                icon={GraduationCap}
                value="50+"
                label="Courses Across Plans"
                color="text-brand-600"
              />
              <MetricCard
                icon={Award}
                value="100%"
                label="Verified Certificates"
                color="text-amber-600"
              />
              <MetricCard
                icon={ShieldCheck}
                value="∞"
                label="Lifetime Access"
                color="text-emerald-600"
              />
              <MetricCard
                icon={Briefcase}
                value="Real"
                label="Work Access"
                color="text-blue-600"
              />
            </div>
          </div>
        </header>

        {/* Why ZetaGrow Plans - Trust Signals */}
        <section className="bg-brand-50/30 py-16 lg:py-24 border-y border-borderSubtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Why ZetaGrow Plans
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">
                One Payment. Complete Learning Path. Verified Results.
              </h2>
              <p className="text-lg text-textMuted">
                No monthly subscriptions, no hidden fees — just structured, outcome-focused education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={ShieldCheck}
                title="Lifetime Access"
                desc="Pay once, keep every course forever. No recurring charges, no access expiry, no surprises."
                color="bg-brand-50 text-brand-600"
              />
              <FeatureCard
                icon={Award}
                title="Verified Certificates"
                desc="Each course ends with a test. Pass it, earn a certificate with a unique public verification ID."
                color="bg-amber-50 text-amber-600"
              />
              <FeatureCard
                icon={Target}
                title="Curriculum Paths"
                desc="Plans bundle complementary courses — no guesswork, just a clear learning sequence."
                color="bg-blue-50 text-blue-600"
              />
              <FeatureCard
                icon={Users}
                title="Work Marketplace"
                desc="Complete a plan, qualify for curated client projects on the platform."
                color="bg-emerald-50 text-emerald-600"
              />
            </div>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                Available Plans
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">
                Pick the Plan That Matches Your Goals
              </h2>
              <p className="text-lg text-textMuted">
                Each plan unlocks a complete curriculum. Compare and choose what fits your journey.
              </p>
            </div>

            {plans === undefined ? (
              <PlansSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                  return (
                    <PlanCard
                      key={plan._id}
                      plan={plan}
                      index={index}
                      totalLessons={totalLessons}
                      totalMinutes={totalMinutes}
                      courseCount={courseCount}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Course Preview Section */}
        {plans && plans.length > 0 && (
          <section className="bg-brand-50/30 py-16 lg:py-24 border-y border-borderSubtle">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  Courses Inside Every Plan
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">
                  See What You'll Learn
                </h2>
                <p className="text-lg text-textMuted">
                  Every course below is included with your single one-time payment.
                </p>
              </div>

              <div className="space-y-12">
                {plans.slice(0, 4).map((plan: any) => (
                  <PlanCoursesPreview key={plan._id} plan={plan} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <header className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain">
                Everything Learners Ask Before Enrolling
              </h2>
            </header>
            <div className="space-y-3">
              {[
                { q: "Are courses inside plans available individually?", a: "Yes, you can buy courses individually, but plans offer significant savings — typically 40-60% off compared to buying each course separately." },
                { q: "Do I get future course updates in my plan?", a: "Yes. Any updates to existing courses in your plan are included. New courses added to the platform are not automatically included unless specified." },
                { q: "How do certificates work?", a: "Each course has a final test. Score 80%+ to unlock a verified certificate with a unique public ID that employers/clients can verify on our website." },
                { q: "Is there a time limit to complete courses?", a: "No. Once enrolled, you have lifetime access to all course materials. Learn at your own pace." },
                { q: "Can I upgrade my plan later?", a: "Yes. Contact support to upgrade by paying the price difference. Your progress carries over seamlessly." },
                { q: "What if I'm not satisfied?", a: "Since this is a digital product with instant access, we don't offer refunds once content is accessed. We recommend reviewing the free preview lessons first." },
              ].map((f, i) => (
                <details key={i} className="card-surface p-5 group open={i === 0} animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                  <summary className="flex items-center justify-between cursor-pointer text-base font-semibold text-textMain list-none group-hover:text-brand-700 transition-colors">
                    <span className="flex items-center gap-2 pr-8">{f.q}</span>
                    <ChevronDown className="w-5 h-5 text-textMuted group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <p className="text-sm text-textMuted leading-relaxed mt-4 pt-4 border-t border-borderSubtle">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-brand-600 py-16 lg:py-24">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl bg-white" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl bg-white" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-brand-100 text-lg leading-relaxed">
              Join thousands of learners building verified skills and earning real opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/plans" className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-brand-50 transition-colors text-base">
                Browse All Plans <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/programs" className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors text-base">
                View All Courses
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function MetricCard({ icon: Icon, value, label, color }: { icon: React.ComponentType<any>; value: string; label: string; color: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-borderSubtle text-center hover:border-brand-200 hover:shadow-lg transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-textMain">{value}</p>
      <p className="text-xs text-textMuted font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: React.ComponentType<any>; title: string; desc: string; color: string }) {
  return (
    <div className="card-surface p-6 rounded-2xl space-y-3 text-center hover:border-brand-200 hover:shadow-xl transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-textMain">{title}</h3>
      <p className="text-sm text-textMuted leading-relaxed">{desc}</p>
    </div>
  );
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-surface overflow-hidden animate-pulse">
          <div className="aspect-video bg-neutral-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-10 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3 mt-8"></div>
            <div className="h-10 bg-neutral-200 rounded w-full mt-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanCard({ plan, index, totalLessons, totalMinutes, courseCount }: any) {
  const gst = useGst();
  return (
    <Link
      href={`/plans/${plan.slug}`}
      className="card-surface overflow-hidden flex flex-col hover:border-brand-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Plan Image - 16:9 Aspect Ratio */}
      <div className="relative aspect-video overflow-hidden bg-brand-50">
        {plan.thumbnail ? (
          <Image
            src={plan.thumbnail}
            alt={plan.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
            <Layers className="w-12 h-12 text-brand-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          <span className="text-[10px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            {courseCount} Courses
          </span>
          <span className="text-[10px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            {totalLessons} Lessons
          </span>
          <span className="text-[10px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`}
          </span>
        </div>
      </div>

      {/* Plan Content */}
      <div className="p-6 flex flex-col flex-1 space-y-4">
        {/* Popular/Best Value Badge */}
        {plan.compareAtPrice && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold w-fit">
            Save ₹{(plan.compareAtPrice - plan.price).toLocaleString("en-IN")}
          </span>
        )}

        <h3 className="text-xl font-bold text-textMain group-hover:text-brand-700 transition-colors">
          {plan.name}
        </h3>
        <p className="text-xs text-brand-700 font-semibold uppercase tracking-wider">
          {plan.tagline}
        </p>

        <div className="flex items-baseline gap-3">
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
          <p className="text-[10px] text-textMuted -mt-1">
            Excluding {gst.rate}% {gst.label} — added at checkout
          </p>
        )}

        <p className="text-sm text-textMuted leading-relaxed line-clamp-3">
          {plan.description}
        </p>

        {/* Key Highlights */}
        <ul className="space-y-2 mt-1">
          {(plan.highlights || []).slice(0, 4).map((h: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-textMuted">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>

        {/* Course Preview - Horizontal Scroll */}
        {plan.courses && plan.courses.length > 0 && (
          <div className="pt-2 border-t border-borderSubtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Courses Included
              </span>
              <span className="text-[11px] text-textMuted">
                {plan.courses.length} courses · {totalLessons} lessons
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
              {plan.courses.slice(0, 6).map((c: any, idx: number) => (
                <Link
                  key={c._id}
                  href={`/programs/${c.slug}`}
                  onClick={(e) => e.preventDefault()}
                  className="flex-none w-40 sm:w-44 md:w-48 shrink-0 group relative bg-white rounded-xl border border-borderSubtle overflow-hidden hover:border-brand-200 hover:shadow-md transition-all"
                >
                  <div className="aspect-video relative overflow-hidden bg-neutral-100">
                    {c.thumbnail ? (
                      <Image
                        src={c.thumbnail}
                        alt={c.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="112px"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-50" />
                    )}
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5 min-w-0">
                    <h5 className="text-[11px] font-semibold text-textMain line-clamp-1 group-hover:text-brand-700 transition-colors">
                      {c.name}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-textMuted">
                      <BookOpen className="w-2.5 h-2.5" />
                      <span>{c.lessonCount} lessons</span>
                    </div>
                  </div>
                </Link>
              ))}
              {plan.courses.length > 6 && (
                <div className="flex-none w-40 shrink-0 relative bg-brand-50 rounded-xl border-2 border-dashed border-brand-200 flex items-center justify-center">
                  <span className="text-xs font-semibold text-brand-700 text-center px-2">
                    +{plan.courses.length - 6} more
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4 border-t border-borderSubtle flex items-center justify-between">
          <span className="text-[11px] text-textMuted flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {totalLessons} lessons · {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`}
          </span>
          <span className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2 group-hover:bg-brand-700 transition-colors">
            View Plan <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PlanCoursesPreview({ plan }: any) {
  if (!plan.courses || plan.courses.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-textMain">{plan.name}</h3>
          <p className="text-sm text-textMuted">{plan.courses.length} courses · {plan.courses.reduce((s: number, c: any) => s + (c.lessonCount || 0), 0)} lessons</p>
        </div>
        <Link href={`/plans/${plan.slug}`} className="btn-secondary text-sm inline-flex items-center gap-1.5">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {plan.courses.slice(0, 5).map((c: any, idx: number) => (
          <Link
            key={c._id}
            href={`/programs/${c.slug}`}
            onClick={(e) => e.preventDefault()}
            className="flex-none w-48 shrink-0 group relative bg-white rounded-xl border border-borderSubtle overflow-hidden hover:border-brand-200 hover:shadow-lg transition-all"
          >
            <div className="aspect-video relative overflow-hidden bg-neutral-100">
              {c.thumbnail ? (
                <Image
                  src={c.thumbnail}
                  alt={c.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="192px"
                />
              ) : (
                <div className="w-full h-full bg-brand-50" />
              )}
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {idx + 1}
              </div>
            </div>
            <div className="p-4 space-y-2 min-w-0">
              <h5 className="text-sm font-semibold text-textMain line-clamp-1 group-hover:text-brand-700 transition-colors">
                {c.name}
              </h5>
              <p className="text-xs text-textMuted line-clamp-2">{c.shortDescription}</p>
              <div className="flex items-center gap-2 text-[11px] text-textMuted pt-2 border-t border-borderSubtle">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {c.lessonCount} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {c.totalMinutes >= 60 ? `${Math.floor(c.totalMinutes / 60)}h ${c.totalMinutes % 60}m` : `${c.totalMinutes} min`}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {plan.courses.length > 5 && (
          <div className="flex-none w-48 shrink-0 relative bg-brand-50 rounded-xl border-2 border-dashed border-brand-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-brand-700 text-center px-3">
              +{plan.courses.length - 5} more courses
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function HelpCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}