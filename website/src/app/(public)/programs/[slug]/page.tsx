"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api, useAuth } from "@/lib/convex";
import { useGst, gstSuffix } from "@/lib/gst";
import {
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  HelpCircle,
  ArrowRight,
  FolderDown,
  Lock,
  Users,
  Layers,
  Star,
  Zap,
  Tag,
} from "lucide-react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://terrific-dove-836.convex.cloud";
const getStorageUrl = (storageId: string) => `${CONVEX_URL}/api/storage/${storageId}`;

// Helper to resolve image URL - handles local paths (/covers/...), Convex storage IDs, and external URLs
const resolveImageUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith("/")) return path; // local path from public folder
  if (path.startsWith("http://") || path.startsWith("https://")) return path; // external URL
  return getStorageUrl(path); // Convex storage ID
};

export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user, token } = useAuth();

  const program = useQuery(api.programs.getProgramBySlug, slug ? { slug } : "skip");
  const plans = useQuery(api.plans.getPublicPlans);
  const gst = useGst();

  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [imgError, setImgError] = useState(false);

  const parentPlan = useMemo(() => 
    plans?.find((p: any) => (p.courses || []).some((c: any) => c.slug === slug)),
    [plans, slug]
  );

  const isAlreadyEnrolled = user?.enrolledProgramIds?.includes(program._id);
  const totalLessons = program?.stats?.lessonCount ?? 0;
  const moduleCount = program?.stats?.moduleCount ?? program?.modules?.length ?? 0;
  const totalMinutes = program?.stats?.totalMinutes ?? 0;
  const timeDisplay = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : `${totalMinutes} min`;

  const savings = parentPlan?.compareAtPrice
    ? parentPlan.compareAtPrice - parentPlan.price
    : 0;
  const savingsPercent = parentPlan?.compareAtPrice
    ? Math.round(((parentPlan.compareAtPrice - parentPlan.price) / parentPlan.compareAtPrice) * 100)
    : 0;

  const hasImage = !imgError && (program?.thumbnail || program?.bannerImage);
  const imageUrl = hasImage ? resolveImageUrl(program.thumbnail || program.bannerImage!) : null;

  const handleEnrollment = () => {
    if (!token) {
      router.push(`/login?redirect=/checkout/${parentPlan?.slug || slug}`);
      return;
    }
    if (!parentPlan) return;
    router.push(`/checkout/${parentPlan.slug}`);
  };

  if (program === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-10 bg-neutral-200 rounded w-1/3" />
        <div className="h-64 bg-neutral-200 rounded" />
      </div>
    );
  }

  if (program === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-textMain">Program Not Found</h1>
        <p className="text-sm text-textMuted">The requested curriculum does not exist or has been archived.</p>
        <Link href="/programs" className="btn-primary inline-flex">Browse All Programs</Link>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8">
      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-borderSubtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left: Image + Info (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Cover Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-borderSubtle bg-neutral-100 shadow-sm">
                {hasImage && imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={program.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
                    <span className="text-white/90 text-base sm:text-lg font-bold px-6 text-center">{program.name}</span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  {program.duration}
                </span>
                <span className="text-xs text-textMuted bg-neutral-100 px-3 py-1 rounded-full">
                  {program.accessDuration}
                </span>
                {(program.format ?? "text") !== "video" && (
                  <span className="text-xs text-textMain flex items-center gap-1 font-medium bg-neutral-100 px-3 py-1 rounded-full border border-borderSubtle">
                    <BookOpen className="w-3.5 h-3.5" /> Text-Based
                  </span>
                )}
                {program.certificateEnabled && (
                  <span className="text-xs text-brand-700 flex items-center gap-1 font-medium bg-brand-50/60 px-3 py-1 rounded-full">
                    <Award className="w-3.5 h-3.5" /> Certificate
                  </span>
                )}
                {program.affiliateEnabled && (
                  <span className="text-xs text-green-700 flex items-center gap-1 font-medium bg-green-50 px-3 py-1 rounded-full">
                    <Tag className="w-3.5 h-3.5" /> Affiliate
                  </span>
                )}
              </div>

              {/* Title + Description */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-textMain leading-tight">
                  {program.name}
                </h1>
                <p className="text-sm sm:text-base text-textMuted leading-relaxed">
                  {program.description}
                </p>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card-surface p-3 flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-base font-extrabold text-textMain leading-none">{moduleCount}</p>
                    <p className="text-[10px] text-textMuted mt-0.5">Modules</p>
                  </div>
                </div>
                <div className="card-surface p-3 flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-base font-extrabold text-textMain leading-none">{totalLessons}</p>
                    <p className="text-[10px] text-textMuted mt-0.5">Lessons</p>
                  </div>
                </div>
                <div className="card-surface p-3 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-base font-extrabold text-textMain leading-none">{timeDisplay}</p>
                    <p className="text-[10px] text-textMuted mt-0.5">Content</p>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              {program.whatIncluded?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-textMain">What&apos;s Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {program.whatIncluded.map((inc: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-textMuted">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Outcomes */}
              {program.outcomes?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-textMain">What You Will Achieve</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {program.outcomes.map((outcome: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-textMain">
                        <Zap className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Pricing Card (2 cols) — desktop sticky */}
            <div className="lg:col-span-2" id="pricing-card-desktop">
              <div className="lg:sticky lg:top-24">
                <div className="card-surface p-6 space-y-5 shadow-sm border-brand-200">
                  {parentPlan ? (
                    <>
                      {/* Plan badge + savings */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Part of {parentPlan.name}
                        </span>
                        {savings > 0 && (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                            Save {savingsPercent}%
                          </span>
                        )}
                      </div>

                      {/* Price — clean info display */}
                      <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-textMuted">Plan Price</p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-extrabold text-textMain">
                            ₹{parentPlan.price.toLocaleString("en-IN")}
                          </span>
                          {parentPlan.compareAtPrice && (
                            <span className="text-lg text-textMuted line-through">
                              ₹{parentPlan.compareAtPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        {gst?.enabled && (
                          <p className="text-[11px] text-textMuted">
                            + {gst.rate}% {gst.label} added at checkout
                          </p>
                        )}
                        <p className="text-[11px] text-textMuted">
                          All {parentPlan.courses.length} courses · Lifetime access
                        </p>
                      </div>

                      {/* Buy Now — standalone button */}
                      {isAlreadyEnrolled ? (
                        <Link
                          href={`/dashboard/learning/${program._id}`}
                          className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-brand-600/20"
                        >
                          Continue Learning →
                        </Link>
                      ) : (
                        <button
                          onClick={handleEnrollment}
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-brand-600/20"
                        >
                          Buy Now
                        </button>
                      )}

                      {!isAlreadyEnrolled && (
                        <p className="text-center text-[10px] text-textMuted">
                          Secure checkout via Razorpay · UPI, cards & NetBanking
                        </p>
                      )}

                      {/* Course count */}
                      <div className="pt-3 border-t border-borderSubtle">
                        <p className="text-xs text-textMuted text-center">
                          Unlocks <strong className="text-textMain">{parentPlan.courses.length} courses</strong> including this one
                        </p>
                        <Link
                          href={`/plans/${parentPlan.slug}`}
                          className="block text-center text-[11px] font-semibold text-brand-700 hover:underline mt-1.5"
                        >
                          See everything in {parentPlan.name} →
                        </Link>
                      </div>

                      {/* Trust signals */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-xs text-textMuted">
                          <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>One payment, lifetime access</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-textMuted">
                          <Award className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>Verified certificate on completion</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-textMuted">
                          <Users className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>{parentPlan.courses.length} courses included</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3 text-xs text-textMuted text-center py-4">
                      <p className="font-semibold text-textMain">Course catalog updating…</p>
                      <Link href="/plans" className="btn-primary w-full text-center justify-center py-3 text-sm font-semibold block">
                        View Plans
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Curriculum ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Curriculum</span>
          <h2 className="text-2xl font-bold tracking-tight text-textMain">Course Content</h2>
          <p className="text-sm text-textMuted">
            {moduleCount} modules · {totalLessons} lessons · {timeDisplay} of content
          </p>
        </div>

        <div className="max-w-4xl space-y-3">
          {program.modules && program.modules.length > 0 ? (
            program.modules.map((mod: any, idx: number) => {
              const isOpen = openModuleIndex === idx;
              return (
                <div key={mod._id} className="card-surface overflow-hidden border-borderSubtle">
                  <button
                    onClick={() => setOpenModuleIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-textMain">{mod.title}</h4>
                        <p className="text-[11px] text-textMuted mt-0.5">{mod.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[11px] text-textMuted">
                        {mod.lessons?.length || 0} lessons
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-textMuted" /> : <ChevronDown className="w-4 h-4 text-textMuted" />}
                    </div>
                  </button>

                  {isOpen && mod.lessons && mod.lessons.length > 0 && (
                    <div className="divide-y divide-borderSubtle bg-white px-5">
                      {mod.lessons.map((lesson: any) => (
                        <div key={lesson._id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {lesson.type === "video" ? (
                              <PlayCircle className="w-4 h-4 text-brand-600 shrink-0" />
                            ) : lesson.type === "quiz" ? (
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : lesson.type === "download" ? (
                              <FolderDown className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                            )}
                            <span className="font-medium text-textMain">{lesson.title}</span>
                            {lesson.isPreview && (
                              <span className="text-[10px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded font-semibold">
                                Free Preview
                              </span>
                            )}
                          </div>
                          {lesson.durationMinutes > 0 && (
                            <span className="text-textMuted flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {lesson.durationMinutes} min
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card-surface p-8 text-center text-sm text-textMuted">
              Curriculum modules are currently being indexed.
            </div>
          )}
        </div>
      </section>

      {/* ─── Resources ─────────────────────────────────────────────── */}
      {program.resources && program.resources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Included Resources</span>
            <h2 className="text-2xl font-bold tracking-tight text-textMain">Downloadable Materials</h2>
          </div>
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3">
            {program.resources.map((res: any, idx: number) => (
              <div key={idx} className="card-surface p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-textMain truncate">{res.title}</h4>
                    {res.accessType === "enrolled" ? (
                      <span className="text-[9px] font-semibold text-textMuted bg-neutral-100 border border-borderSubtle px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Enrolled
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full shrink-0">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-textMuted leading-relaxed line-clamp-2">{res.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── FAQs ──────────────────────────────────────────────────── */}
      {program.faqs && program.faqs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-6">
          <h2 className="text-2xl font-bold text-textMain">Frequently Asked Questions</h2>
          <div className="max-w-4xl space-y-3">
            {program.faqs.map((faq: any, idx: number) => (
              <FaqItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Mobile Sticky Buy Bar (always visible when not enrolled) ── */}
      {parentPlan && !isAlreadyEnrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-borderSubtle px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="min-w-0">
              <p className="text-[10px] text-textMuted truncate">{parentPlan.name}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-textMain">
                  ₹{parentPlan.price.toLocaleString("en-IN")}
                </span>
                {parentPlan.compareAtPrice && (
                  <span className="text-xs text-textMuted line-through">
                    ₹{parentPlan.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleEnrollment}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors shrink-0 shadow-lg shadow-brand-600/20"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FAQ Accordion Item ────────────────────────────────────────────────── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-surface overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
      >
        <h4 className="text-sm font-bold text-textMain flex items-center gap-2 pr-4">
          <HelpCircle className="w-4 h-4 text-brand-600 shrink-0" />
          {question}
        </h4>
        {open ? <ChevronUp className="w-4 h-4 text-textMuted shrink-0" /> : <ChevronDown className="w-4 h-4 text-textMuted shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 pl-11">
          <p className="text-xs text-textMuted leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}