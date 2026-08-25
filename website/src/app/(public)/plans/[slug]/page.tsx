"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { useGst, gstSuffix, withGst } from "@/lib/gst";
import {
  CheckCircle2,
  Award,
  BookOpen,
  ShieldCheck,
  Clock,
  Layers,
  FolderDown,
  FileText,
  ArrowRight,
} from "lucide-react";

const RESOURCE_META: Record<string, { icon: typeof FileText; label: string }> = {
  pdf: { icon: FileText, label: "PDF Guide" },
  zip: { icon: FolderDown, label: "Asset Pack" },
  doc: { icon: FileText, label: "Document" },
  template: { icon: FileText, label: "Template" },
  link: { icon: ArrowRight, label: "Link Pack" },
};

export default function PlanDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user, token } = useAuth();

  const plan = useQuery(api.plans.getPlanBySlug, slug ? { slug } : "skip");
  const gst = useGst();

  if (plan === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-10 bg-neutral-200 rounded w-1/3"></div>
        <div className="h-64 bg-neutral-200 rounded"></div>
      </div>
    );
  }

  if (plan === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-textMain">Plan Not Found</h1>
        <Link href="/plans" className="btn-primary inline-flex">
          Browse All Plans
        </Link>
      </div>
    );
  }

  const totalLessons = (plan.courses || []).reduce(
    (s: number, c: any) => s + (c.lessonCount || 0),
    0
  );
  const totalMinutes = (plan.courses || []).reduce(
    (s: number, c: any) => s + (c.totalMinutes || 0),
    0
  );

  const ownedCount =
    plan.courses?.filter((c: any) => user?.enrolledProgramIds?.includes(c._id)).length || 0;
  const totalCourses = plan.courses?.length || 0;
  const hasFullAccess = totalCourses > 0 && ownedCount === totalCourses;
  const hasPartialAccess = ownedCount > 0 && !hasFullAccess;
  const firstOwnedCourse = (plan.courses || []).find(
    (c: any) => user?.enrolledProgramIds?.includes(c._id)
  );

  const handlePurchase = () => {
    if (!token) {
      router.push(`/login?redirect=/checkout/${slug}`);
      return;
    }
    router.push(`/checkout/${slug}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-white border-b border-borderSubtle py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-56 lg:h-72 rounded-xl overflow-hidden">
              {plan.bannerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={plan.bannerImage} alt={plan.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-100"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit mb-2">
                  <Layers className="w-3 h-3" />
                  {plan.courses?.length || 0} Courses · {totalLessons} Lessons
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{plan.name}</h1>
                <p className="text-sm text-white/90 mt-1">{plan.tagline}</p>
              </div>
            </div>

            <p className="text-base text-textMuted leading-relaxed">{plan.description}</p>

            {/* Highlights */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-textMain">
                What This Plan Includes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(plan.highlights || []).map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-textMuted">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Card */}
          <div className="card-surface p-6 space-y-6 lg:sticky lg:top-24 shadow-sm border-brand-200">
            <div className="space-y-2">
              <p className="text-xs font-medium text-textMuted">One-Time Plan Price{gst?.enabled ? " (excl. GST)" : ""}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-textMain">
                  ₹{plan.price.toLocaleString("en-IN")}
                </span>
                {plan.compareAtPrice && (
                  <span className="text-base text-textMuted line-through">
                    ₹{plan.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {gst?.enabled && (
                <p className="text-[11px] text-textMuted">
                  + {gst.rate}% {gst.label} added at checkout — you pay{" "}
                  <span className="font-semibold text-textMain">
                    ₹{(withGst(plan.price, gst).total / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </p>
              )}
              <p className="text-xs text-textMuted">
                Unlocks all {plan.courses?.length} courses + resources forever.
              </p>
            </div>

            {hasFullAccess ? (
              <Link
                href={firstOwnedCourse ? `/dashboard/learning/${firstOwnedCourse._id}` : "/dashboard/programs"}
                className="btn-primary w-full text-center justify-center py-3 text-sm font-semibold block"
              >
                Start Learning
              </Link>
            ) : hasPartialAccess ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-brand-800 leading-relaxed">
                    You already own {ownedCount} of {totalCourses} courses in this plan.
                  </p>
                </div>
                <Link
                  href={firstOwnedCourse ? `/dashboard/learning/${firstOwnedCourse._id}` : "/dashboard/programs"}
                  className="btn-primary w-full text-center justify-center py-3 text-sm font-semibold block"
                >
                  Start Learning
                </Link>
                <button
                  onClick={handlePurchase}
                  className="btn-secondary w-full justify-center py-2.5 text-xs font-semibold"
                >
                  Unlock the remaining {totalCourses - ownedCount} course{totalCourses - ownedCount === 1 ? "" : "s"}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handlePurchase}
                  className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-sm"
                >
                  Get {plan.name} — ₹{plan.price.toLocaleString("en-IN")}
                  <span className="font-normal">{gstSuffix(gst)}</span>
                </button>
                <p className="text-center text-[10px] text-textMuted">
                  Secure checkout via Razorpay · UPI, cards &amp; NetBanking
                </p>
              </>
            )}

            <div className="space-y-2.5 pt-2 text-xs text-textMuted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Instant access to every course included</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Digital product — non-refundable once accessed</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600" />
                <span>Certificate per course after passing its test</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>100% text-based lessons — learn at your pace</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Included */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Courses Inside
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            Everything You Get in the {plan.name}
          </h2>
          <p className="text-sm text-textMuted">
            Every course below is included with this single one-time payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {(plan.courses || []).map((c: any, idx: number) => {
            const owned = user?.enrolledProgramIds?.includes(c._id);
            return (
              <div key={c._id} className="card-surface overflow-hidden flex flex-col group">
                <Link href={`/programs/${c.slug}`} className="relative h-36 overflow-hidden bg-neutral-100 block">
                  {c.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail} alt={c.name} loading="lazy" className="w-full h-full object-cover transition-colors" />
                  )}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  {owned && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      Owned
                    </span>
                  )}
                </Link>
                <div className="p-5 space-y-2.5 flex-1 flex flex-col">
                  <h4 className="text-sm font-bold text-textMain leading-snug">{c.name}</h4>
                  <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">{c.shortDescription}</p>
                  <div className="flex items-center gap-4 text-[11px] text-textMuted mt-auto pt-3 border-t border-borderSubtle">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {c.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.totalMinutes >= 60 ? `${Math.floor(c.totalMinutes / 60)}h ${c.totalMinutes % 60}m` : `${c.totalMinutes} min`}
                    </span>
                    <Link href={`/programs/${c.slug}`} className="ml-auto text-brand-700 font-semibold hover:underline flex items-center gap-0.5">
                      Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl card-surface p-5 flex items-center justify-between bg-brand-50/40 border-brand-200">
          <span className="text-xs text-textMuted flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            Total content:
            <strong className="text-textMain">
              {totalLessons} lessons ·{" "}
              {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`}
            </strong>{" "}
            of study material
          </span>
        </div>
      </section>

      {/* Resources */}
      {plan.resourceList && plan.resourceList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Included Resources
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
              {plan.resourceList.length} Resource Kits & Templates
            </h2>
            <p className="text-sm text-textMuted">
              Templates, playbooks and guides that come bundled with this plan.
            </p>
          </div>
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.resourceList.map((r: any, i: number) => {
              const meta = RESOURCE_META[r.fileType] || RESOURCE_META.doc;
              const IconComp = meta.icon;
              return (
                <div key={i} className="card-surface p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-textMain truncate">{r.title}</h4>
                    <p className="text-[11px] text-textMuted line-clamp-2 mt-0.5">{r.description}</p>
                    <span className="text-[10px] text-brand-700 font-semibold">{meta.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
