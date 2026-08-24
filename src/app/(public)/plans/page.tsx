"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { CheckCircle2, ArrowRight, BookOpen, Layers } from "lucide-react";

export default function PlansPage() {
  const plans = useQuery(api.plans.getPublicPlans);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Learning Plans
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          Choose Your Plan, Get Every Course Inside
        </h1>
        <p className="text-base text-textMuted leading-relaxed">
          Each plan is a bundle of complete courses. One payment unlocks every course in the plan — learn at your own pace with text-based lessons and earn verified certificates after each course test.
        </p>
      </div>

      {/* Plans Grid */}
      {plans === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-surface overflow-hidden animate-pulse">
              <div className="h-40 bg-neutral-200"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-16 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan: any) => {
            const totalLessons = (plan.courses || []).reduce(
              (s: number, c: any) => s + (c.lessonCount || 0),
              0
            );
            return (
              <Link
                key={plan._id}
                href={`/plans/${plan.slug}`}
                className="card-surface overflow-hidden flex flex-col hover:border-brand-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="relative h-44 overflow-hidden bg-brand-50">
                  {plan.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={plan.thumbnail}
                      alt={plan.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      {plan.courses?.length || 0} Courses Included
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-textMain">{plan.name}</h3>
                  <p className="text-xs text-brand-700 font-semibold">{plan.tagline}</p>

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

                  <p className="text-xs text-textMuted leading-relaxed line-clamp-2">
                    {plan.description}
                  </p>

                  <ul className="space-y-1.5 mt-1">
                    {(plan.highlights || []).slice(0, 3).map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-textMuted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-borderSubtle flex items-center justify-between">
                    <span className="text-[11px] text-textMuted flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {totalLessons} lessons total
                    </span>
                    <span className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
                      View Plan <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
