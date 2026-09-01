"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { useGst, fromGstInclusive } from "@/lib/gst";
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
  ChevronRight,
} from "lucide-react";

const RESOURCE_META: Record<string, { icon: typeof FileText; label: string }> = {
  pdf: { icon: FileText, label: "PDF Guide" },
  html: { icon: FileText, label: "HTML Resource" },
  zip: { icon: FolderDown, label: "Asset Pack" },
  doc: { icon: FileText, label: "Document" },
  template: { icon: FileText, label: "Template" },
  link: { icon: ArrowRight, label: "Link Pack" },
};

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://terrific-dove-836.convex.cloud";
const getStorageUrl = (storageId: string) => `${CONVEX_URL}/api/storage/${storageId}`;
const resolveImageUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${CONVEX_URL}/api/storage/${path}`;
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
        <div className="h-10 bg-neutral-200 rounded w-1/3" />
        <div className="h-64 bg-neutral-200 rounded" />
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
  const totalTimeDisplay = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : `${totalMinutes} min`;

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

  const hasImage = plan?.thumbnail || plan?.bannerImage;
  const imageUrl = hasImage ? resolveImageUrl(plan.thumbnail || plan.bannerImage!) : null;

  // Aggregate all resources from courses
  const allResources: Array<{
    _id: string;
    title: string;
    description: string;
    fileType: string;
    fileSize: string;
    accessType: string;
    courseName?: string;
  }> = [];
  if (plan.courses) {
    for (const course of plan.courses) {
      if ((course as any).resources) {
        for (const r of (course as any).resources) {
          allResources.push({ ...r, courseName: course.name });
        }
      }
    }
  }

  return (
    <div className="space-y-16 pb-32 lg:pb-20 pt-16 lg:pt-24">
      {/* Hero - Two column layout on desktop: image left, purchase right */}
      <section className="bg-white border-b border-borderSubtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two column layout: Image left, Purchase right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Cover Image - Sticky on desktop, 16:9 on desktop */}
            <div className="relative aspect-video lg:aspect-video w-full overflow-hidden rounded-2xl lg:rounded-3xl bg-neutral-100 lg:sticky lg:top-24 lg:h-auto max-h-[300px] lg:max-h-none">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={plan.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
                  <span className="text-white/90 text-2xl sm:text-3xl font-bold px-6 text-center">{plan.name}</span>
                </div>
              )}
            </div>

            {/* Right: Purchase Card - Sticky on desktop */}
            <div className="lg:sticky lg:top-24">
              {/* Plan Title & Meta - Above Purchase Card */}
              <div className="space-y-4 max-w-xl mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                    {plan.courses?.length || 0} Courses · {totalLessons} Lessons
                  </span>
                  {plan.tagline && (
                    <span className="text-xs text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                      {plan.tagline}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-textMain leading-tight">
                  {plan.name}
                </h1>
                <p className="text-base sm:text-lg text-textMuted leading-relaxed max-w-3xl">
                  {plan.description}
                </p>

                {/* Highlights */}
                {(plan.highlights || []).length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-textMain">
                      What This Plan Includes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(plan.highlights || []).map((h: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-xs text-textMuted bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase Card - Sticky on desktop */}
              <div className="card-surface p-6 sm:p-8 space-y-6 shadow-sm border-brand-200 bg-brand-50/30">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-textMuted">One-Time Plan Price{gst?.enabled ? " (incl. GST)" : ""}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-textMain">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                    {plan.compareAtPrice && (
                      <span className="text-xl text-textMuted line-through">
                        ₹{plan.compareAtPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  {gst?.enabled && (
                    <p className="text-[11px] text-textMuted">
                      Inclusive of {gst.rate}% {gst.label} — base price{" "}
                      <span className="font-semibold text-textMain">
                        ₹{Math.round(fromGstInclusive(plan.price, gst).base / 100).toLocaleString("en-IN")}
                      </span>{" "}
                      + {gst.label} ₹{Math.round(fromGstInclusive(plan.price, gst).tax / 100).toLocaleString("en-IN")}
                    </p>
                  )}
                  <p className="text-sm text-textMuted">
                    Unlocks all {plan.courses?.length} courses + resources forever.
                  </p>
                </div>

                {/* Purchase / Access Buttons */}
                {hasFullAccess ? (
                  <Link
                    href={firstOwnedCourse ? `/dashboard/learning/${firstOwnedCourse._id}` : "/dashboard/programs"}
                    className="btn-primary w-full text-center justify-center py-3.5 text-sm font-semibold block"
                  >
                    Start Learning
                  </Link>
                ) : hasPartialAccess ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-brand-50 border border-brand-200 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-brand-800">
                          You already own {ownedCount} of {totalCourses} courses in this plan.
                        </p>
                        <p className="text-xs text-brand-700 mt-0.5">
                          Upgrade to unlock the remaining {totalCourses - ownedCount} course{totalCourses - ownedCount === 1 ? "" : "s"}.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={firstOwnedCourse ? `/dashboard/learning/${firstOwnedCourse._id}` : "/dashboard/programs"}
                      className="btn-primary w-full text-center justify-center py-3.5 text-sm font-semibold block"
                    >
                      Start Learning
                    </Link>
                    <button
                      onClick={handlePurchase}
                      className="btn-secondary w-full justify-center py-3.5 text-sm font-semibold"
                    >
                      Unlock the remaining {totalCourses - ownedCount} course{totalCourses - ownedCount === 1 ? "" : "s"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handlePurchase}
                      className="btn-primary w-full justify-center py-3.5 text-sm font-semibold shadow-sm text-base"
                    >
                      Get {plan.name} — ₹{plan.price.toLocaleString("en-IN")}
                      {gst?.enabled && <span className="font-normal text-xs ml-1">(incl. GST)</span>}
                    </button>
                    <p className="text-center text-[11px] text-textMuted">
                      Secure checkout via Razorpay · UPI, cards & NetBanking
                    </p>
                  </div>
                )}

                {/* Trust Signals */}
                <div className="space-y-2.5 pt-2 border-t border-brand-200/50">
                  <div className="flex items-center gap-3 text-sm text-textMuted">
                    <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>Instant access to every course included</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-textMuted">
                    <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>Digital product — non-refundable once accessed</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-textMuted">
                    <Award className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>Certificate per course after passing its test</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-textMuted">
                    <BookOpen className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>100% text-based lessons — learn at your pace</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Buy Bar */}
            {!hasFullAccess && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-borderSubtle px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <button
                  onClick={handlePurchase}
                  className="btn-primary w-full justify-center py-3.5 text-sm font-semibold shadow-lg shadow-brand-600/20"
                >
                  Get {plan.name} — ₹{plan.price.toLocaleString("en-IN")}
                  {gst?.enabled && <span className="font-normal text-xs ml-1">(incl. GST)</span>}
                </button>
              </div>
            )}
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
            const cImageUrl = c.thumbnail ? resolveImageUrl(c.thumbnail) : null;
            return (
              <div key={c._id} className="card-surface overflow-hidden flex flex-col group">
                <Link href={`/programs/${c.slug}`} className="relative h-40 sm:h-44 overflow-hidden bg-neutral-100 block">
                  {cImageUrl ? (
                    <Image
                      src={cImageUrl}
                      alt={c.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
                      <span className="text-white/90 text-sm font-bold px-4 text-center">{c.name}</span>
                    </div>
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
                      {c.totalMinutes >= 60
                        ? `${Math.floor(c.totalMinutes / 60)}h ${c.totalMinutes % 60}m`
                        : `${c.totalMinutes} min`}
                    </span>
                    <Link href={`/programs/${c.slug}`} className="ml-auto text-brand-700 font-semibold hover:underline flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Content Summary */}
        <div className="max-w-4xl card-surface p-5 flex items-center justify-between bg-brand-50/40 border-brand-200">
          <span className="text-sm text-textMuted flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Total content:</span>
            <strong className="text-textMain">
              {totalLessons} lessons · {totalTimeDisplay} of study material
            </strong>
          </span>
        </div>
      </section>

      {/* Resources */}
      {allResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Included Resources
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
              {allResources.length} Resource{allResources.length !== 1 ? "s" : ""} & Templates
            </h2>
            <p className="text-sm text-textMuted">
              Downloadable materials included with this plan — templates, guides, and toolkits.
            </p>
          </div>
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {allResources.map((r) => {
              const meta = RESOURCE_META[r.fileType] || RESOURCE_META.doc;
              const IconComp = meta.icon;
              return (
                <div key={r._id} className="card-surface p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-textMain truncate">{r.title}</h4>
                    <p className="text-[11px] text-textMuted line-clamp-2 mt-0.5">{r.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-brand-700 font-semibold">{meta.label}</span>
                      {r.accessType === "enrolled" && (
                        <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                          Enrolled
                        </span>
                      )}
                      {r.accessType === "public" && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          Free
                        </span>
                      )}
                    </div>
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