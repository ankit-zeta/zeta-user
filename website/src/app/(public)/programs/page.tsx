"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { BookOpen, Clock, ArrowRight, Layers } from "lucide-react";

export default function ProgramsPage() {
  const plans = useQuery(api.plans.getPublicPlans);

  // Flatten courses with their parent plan info
  const courseRows: Array<{ course: any; plan: any }> = [];
  if (plans) {
    for (const plan of plans as any[]) {
      for (const c of plan.courses || []) {
        courseRows.push({ course: c, plan });
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Course Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          All Courses Inside Our Plans
        </h1>
        <p className="text-base text-textMuted leading-relaxed">
          Every course below is included inside one of our bundles. Pick a plan to unlock its full set of courses — individual courses are not sold separately.
        </p>
        <Link href="/plans" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5">
          <Layers className="w-4 h-4" />
          Compare Plans & Pricing
        </Link>
      </div>

      {/* Courses grouped by plan */}
      {plans === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card-surface overflow-hidden">
              <div className="aspect-video bg-neutral-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-5 bg-neutral-200 rounded w-2/3"></div>
                <div className="h-10 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        (plans as any[]).map((plan) => (
          <section key={plan._id} id={plan.slug} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-borderSubtle pb-4">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-textMain">{plan.name}</h2>
                <p className="text-xs text-textMuted">{plan.tagline}</p>
              </div>
              <Link
                href={`/plans/${plan.slug}`}
                className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3.5 py-2 rounded-lg hover:bg-brand-100 transition-colors"
              >
                Get this plan — ₹{plan.price.toLocaleString("en-IN")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(plan.courses || []).map((c: any) => (
                <Link
                  key={c._id}
                  href={`/programs/${c.slug}`}
                  className="card-surface overflow-hidden flex flex-col hover:border-brand-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-brand-50">
                    {c.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.thumbnail}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
                        <span className="text-white/90 text-sm font-bold px-4 text-center">{c.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  <div className="p-5 space-y-2 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-textMain leading-snug">{c.name}</h3>
                    <p className="text-xs text-textMuted leading-relaxed line-clamp-2">
                      {c.shortDescription}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-textMuted pt-2 mt-auto border-t border-borderSubtle">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {c.lessonCount} lessons
                      </span>
                      {(c.format ?? "text") !== "video" && (<span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">Text-Based</span>)}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {c.totalMinutes >= 60
                          ? `${Math.floor(c.totalMinutes / 60)}h ${c.totalMinutes % 60}m`
                          : `${c.totalMinutes} min`}
                      </span>
                      <span className="ml-auto text-brand-700 font-semibold">Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      {/* Bottom funnel */}
      <div className="card-surface p-8 bg-gradient-to-r from-brand-900 to-brand-800 text-white rounded-xl text-center space-y-3">
        <h3 className="text-xl font-bold">Not sure which plan fits you?</h3>
        <p className="text-xs text-white/80 max-w-md mx-auto">
          Compare everything each bundle includes — courses, resources and certificates — side by side.
        </p>
        <Link href="/plans" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-brand-900 font-semibold text-xs hover:bg-neutral-100 transition-colors">
          View Plans & Pricing <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
