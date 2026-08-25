"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
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
  Layers
} from "lucide-react";

const RESOURCE_META: Record<string, { icon: typeof FileText; label: string }> = {
  pdf: { icon: FileText, label: "PDF Guide" },
  zip: { icon: FolderDown, label: "Asset Pack" },
  template: { icon: FileText, label: "Template" },
  doc: { icon: FileText, label: "Document" },
  video: { icon: PlayCircle, label: "Video" },
  link: { icon: ArrowRight, label: "External Link" },
};

export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user, token } = useAuth();

  const program = useQuery(api.programs.getProgramBySlug, slug ? { slug } : "skip");
  const plans = useQuery(api.plans.getPublicPlans);
  const gst = useGst();

  // The plan that contains this course
  const parentPlan = plans?.find((p: any) =>
    (p.courses || []).some((c: any) => c.slug === slug)
  );

  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);

  if (program === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-10 bg-neutral-200 rounded w-1/3"></div>
        <div className="h-64 bg-neutral-200 rounded"></div>
      </div>
    );
  }

  if (program === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-textMain">Program Not Found</h1>
        <p className="text-sm text-textMuted">The requested curriculum does not exist or has been archived.</p>
        <Link href="/programs" className="btn-primary inline-flex">
          Browse All Programs
        </Link>
      </div>
    );
  }

  const isAlreadyEnrolled = user?.enrolledProgramIds?.includes(program._id);

  const handleEnrollment = () => {
    if (!token) {
      router.push(`/login?redirect=/checkout/${parentPlan?.slug || slug}`);
      return;
    }
    if (!parentPlan) return;
    router.push(`/checkout/${parentPlan.slug}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Program Header Banner */}
      <section className="bg-white border-b border-borderSubtle py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left 2 Cols: Title & Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* 16:9 Cover Image — same source as the /programs catalog cards */}
              {program.thumbnail || program.bannerImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-borderSubtle bg-neutral-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={program.thumbnail || program.bannerImage}
                    alt={program.name}
                    loading="eager"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-borderSubtle bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center shadow-sm">
                  <span className="text-white/90 text-base sm:text-lg font-bold px-6 text-center">
                    {program.name}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                  {program.duration}
                </span>
                <span className="text-xs text-textMuted bg-neutral-100 px-2.5 py-1 rounded-full">
                  {program.accessDuration}
                </span>
                {/* Format badge */}
                {(program.format ?? "text") !== "video" && (
                  <span className="text-xs text-textMain flex items-center gap-1 font-medium bg-neutral-100 px-2.5 py-1 rounded-full border border-borderSubtle">
                    <BookOpen className="w-3.5 h-3.5" />
                    Text-Based Course
                  </span>
                )}
                {program.certificateEnabled && (
                  <span className="text-xs text-brand-700 flex items-center gap-1 font-medium bg-brand-50/60 px-2.5 py-1 rounded-full">
                    <Award className="w-3.5 h-3.5" />
                    Verified Certificate
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
                {program.name}
              </h1>

              <p className="text-base text-textMuted leading-relaxed">
                {program.description}
              </p>

              {/* Inclusions checklist */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-textMain">
                  Key Inclusions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {program.whatIncluded.map((inc: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-textMuted">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Plan Checkout Card */}
            <div className="card-surface p-6 space-y-6 lg:sticky lg:top-24 shadow-sm border-brand-200">
              {parentPlan ? (
                <>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Included in {parentPlan.name}
                    </span>
                    <p className="text-xs font-medium text-textMuted">Plan Price (all courses included)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-textMain">
                        ₹{parentPlan.price.toLocaleString("en-IN")}
                      </span>
                      {parentPlan.compareAtPrice && (
                        <span className="text-base text-textMuted line-through">
                          ₹{parentPlan.compareAtPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {gst?.enabled && (
                      <p className="text-[11px] text-textMuted">
                        Excluding {gst.rate}% {gst.label} — added at checkout
                      </p>
                    )}
                    <p className="text-xs text-textMuted">
                      Unlocks this course plus {parentPlan.courses.length - 1} more courses and all plan resources.
                    </p>
                  </div>

                  {isAlreadyEnrolled ? (
                    <Link
                      href={`/dashboard/learning/${program._id}`}
                      className="btn-primary w-full text-center justify-center py-3 text-sm font-semibold"
                    >
                      Continue Learning
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnrollment}
                      className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-sm"
                    >
                      Get {parentPlan.name} — ₹{parentPlan.price.toLocaleString("en-IN")}
                      <span className="font-normal">{gstSuffix(gst)}</span>
                    </button>
                  )}
                  {!isAlreadyEnrolled && (
                    <p className="text-center text-[10px] text-textMuted">
                      Secure checkout via Razorpay · UPI, cards &amp; NetBanking
                    </p>
                  )}

                  <Link
                    href={`/plans/${parentPlan.slug}`}
                    className="block w-full text-center text-xs font-semibold text-brand-700 hover:underline"
                  >
                    See everything in the {parentPlan.name} →
                  </Link>

                  <div className="space-y-2.5 pt-2 text-xs text-textMuted">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      <span>One payment unlocks every course in the plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-600" />
                      <span>Certificate after passing each course test</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3 text-xs text-textMuted">
                  <p className="font-semibold text-textMain">Course catalog updating…</p>
                  <Link href="/plans" className="btn-primary w-full text-center justify-center py-3 text-sm font-semibold block">
                    View Plans
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Syllabus & Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Curriculum Structure
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            What Content You Will Get
          </h2>
          <p className="text-sm text-textMuted">
            Reading-based modules with study materials, worked examples, and practical exercises — review the full breakdown before enrolling.
          </p>
        </div>

        {/* Curriculum stats strip */}
        <div className="max-w-4xl grid grid-cols-3 gap-4">
          <div className="card-surface p-4 flex items-center gap-3">
            <Layers className="w-5 h-5 text-brand-600 shrink-0" />
            <div>
              <p className="text-lg font-extrabold text-textMain leading-none">{program.stats?.moduleCount ?? program.modules?.length ?? 0}</p>
              <p className="text-[11px] text-textMuted mt-1">Modules</p>
            </div>
          </div>
          <div className="card-surface p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-brand-600 shrink-0" />
            <div>
              <p className="text-lg font-extrabold text-textMain leading-none">{program.stats?.lessonCount ?? 0}</p>
              <p className="text-[11px] text-textMuted mt-1">Lessons</p>
            </div>
          </div>
          <div className="card-surface p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-600 shrink-0" />
            <div>
              <p className="text-lg font-extrabold text-textMain leading-none">
                {program.stats?.totalMinutes >= 60
                  ? `${Math.floor(program.stats.totalMinutes / 60)}h ${program.stats.totalMinutes % 60}m`
                  : `${program.stats?.totalMinutes ?? 0} min`}
              </p>
              <p className="text-[11px] text-textMuted mt-1">Content Length</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-4">
          {program.modules && program.modules.length > 0 ? (
            program.modules.map((mod: any, idx: number) => {
              const isOpen = openModuleIndex === idx;
              return (
                <div key={mod._id} className="card-surface overflow-hidden border-borderSubtle">
                  <button
                    onClick={() => setOpenModuleIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-textMain">{mod.title}</h4>
                      <p className="text-xs text-textMuted mt-0.5">{mod.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-textMuted">
                        {mod.lessons?.length || 0} Lessons
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-textMuted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-textMuted" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-borderSubtle bg-white px-6">
                      {mod.lessons && mod.lessons.length > 0 ? (
                        mod.lessons.map((lesson: any) => (
                          <div
                            key={lesson._id}
                            className="py-3 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.type === "video" ? (
                                <PlayCircle className="w-4 h-4 text-brand-600 shrink-0" />
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
                            <span className="text-textMuted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.durationMinutes} min
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-xs text-textMuted">
                          Lessons being finalized for this module.
                        </div>
                      )}
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

      {/* 3. Resources Included */}
      {program.resources && program.resources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Included Resources
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
              Downloadable Kits & Materials
            </h2>
            <p className="text-sm text-textMuted">
              Templates, guides, and asset packs that come with this program — ready to use from day one.
            </p>
          </div>

          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.resources.map((res: any, idx: number) => {
              const meta = RESOURCE_META[res.fileType] || RESOURCE_META.doc;
              const IconComp = meta.icon;
              return (
                <div key={idx} className="card-surface p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-textMain truncate">{res.title}</h4>
                      {res.accessType === "enrolled" ? (
                        <span className="text-[10px] font-semibold text-textMuted bg-neutral-100 border border-borderSubtle px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          With Enrollment
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full shrink-0">
                          Free Sample
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-textMuted leading-relaxed line-clamp-2">{res.description}</p>
                    <p className="text-[11px] text-textMuted flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      {meta.label}
                      {res.fileSize ? ` · ${res.fileSize}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Learning Outcomes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-bold text-textMain">What You Will Achieve</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {program.outcomes.map((outcome: string, idx: number) => (
            <div key={idx} className="card-surface p-5 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs text-textMain leading-relaxed font-medium">{outcome}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQs */}
      {program.faqs && program.faqs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl font-bold text-textMain">Frequently Asked Questions</h2>
          <div className="max-w-4xl space-y-3">
            {program.faqs.map((faq: any, idx: number) => (
              <div key={idx} className="card-surface p-5 space-y-2">
                <h4 className="text-sm font-bold text-textMain flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  {faq.question}
                </h4>
                <p className="text-xs text-textMuted leading-relaxed pl-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
