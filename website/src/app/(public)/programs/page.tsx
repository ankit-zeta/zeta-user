"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { CheckCircle2, ArrowRight, BookOpen, Award, Shield, Check, HelpCircle } from "lucide-react";

export default function ProgramsPage() {
  const programs = useQuery(api.programs.getPublicPrograms);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Curriculum Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          Verified Digital Career Programs
        </h1>
        <p className="text-base text-textMuted leading-relaxed">
          Each program is structured to provide actionable competencies, verifiable completion credentials, downloadable commercial asset packages, and work marketplace eligibility.
        </p>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {programs === undefined ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-surface overflow-hidden animate-pulse">
              <div className="h-36 bg-neutral-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-5 bg-neutral-200 rounded w-2/3"></div>
                <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-16 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          programs.map((prog) => (
            <div
              key={prog._id}
              className="card-surface overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative"
            >
              {prog.price === 8000 && (
                <div className="absolute top-3 right-3 z-10 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              {/* Thumbnail */}
              <div className="relative h-36 overflow-hidden bg-brand-50">
                {prog.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={prog.thumbnail}
                    alt={prog.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-brand-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[11px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {prog.duration}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-base font-bold text-textMain leading-snug">
                  {prog.name}
                </h3>

                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="text-2xl font-extrabold text-textMain">
                    ₹{prog.price.toLocaleString("en-IN")}
                  </span>
                  {prog.compareAtPrice && (
                    <span className="text-xs text-textMuted line-through">
                      ₹{prog.compareAtPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <p className="text-xs text-textMuted leading-relaxed mt-2.5 line-clamp-2">
                  {prog.shortDescription}
                </p>

                <div className="mt-4 pt-4 border-t border-borderSubtle space-y-1.5">
                  {prog.whatIncluded.slice(0, 3).map((inc, idx) => (
                    <p
                      key={idx}
                      className="text-[11px] text-textMuted flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{inc}</span>
                    </p>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-borderSubtle">
                  <Link
                    href={`/programs/${prog.slug}`}
                    className="btn-primary w-full text-center justify-center text-xs py-2.5"
                  >
                    <span>Explore Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feature Comparison Table */}
      {programs && programs.length > 0 && (
        <div className="card-surface p-8 space-y-6 overflow-hidden">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-textMain">
              Detailed Program Comparison
            </h2>
            <p className="text-xs text-textMuted">
              Review inclusions across each tier to determine the ideal starting point for your goals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-xs text-textMuted">
                  <th className="py-3 px-4 font-semibold">Feature / Inclusion</th>
                  {programs.map((p) => (
                    <th key={p._id} className="py-3 px-4 font-bold text-textMain">
                      {p.name}
                      <span className="block text-xs font-medium text-brand-600">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-textMain">Access Duration</td>
                  {programs.map((p) => (
                    <td key={p._id} className="py-3.5 px-4 text-textMuted">
                      {p.accessDuration}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-textMain">Verified Certificate</td>
                  {programs.map((p) => (
                    <td key={p._id} className="py-3.5 px-4">
                      {p.certificateEnabled ? (
                        <Check className="w-4 h-4 text-brand-600" />
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-textMain">Work Portal Eligibility</td>
                  {programs.map((p) => (
                    <td key={p._id} className="py-3.5 px-4 text-textMuted">
                      {p.price >= 14000
                        ? "VIP Matchmaking & Priority"
                        : p.price >= 8000
                        ? "Advanced Retainers"
                        : p.price >= 4000
                        ? "Intermediate Projects"
                        : "Entry-level Projects"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-textMain">Asset & Template Kit</td>
                  {programs.map((p) => (
                    <td key={p._id} className="py-3.5 px-4">
                      <Check className="w-4 h-4 text-brand-600" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-textMain">Affiliate Commission Eligibility</td>
                  {programs.map((p) => (
                    <td key={p._id} className="py-3.5 px-4">
                      <Check className="w-4 h-4 text-brand-600" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
