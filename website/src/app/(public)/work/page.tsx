"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { 
  Briefcase, 
  Search, 
  Filter, 
  Clock, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function PublicWorkPage() {
  const { token, user } = useAuth();
  const jobsWithEligibility = useQuery(api.jobs.getJobsWithEligibility, { token: token || undefined });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    "all",
    "Content & Writing",
    "Media Production",
    "Web & Technical",
    "Social & Marketing",
    "Operations",
  ];

  const filteredJobs = jobsWithEligibility?.filter((job) => {
    const matchesCat = selectedCategory === "all" || job.category === selectedCategory;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Contract Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          Verified Work Opportunities
        </h1>
        <p className="text-base text-textMuted leading-relaxed">
          Explore client contracts and internal deliverables. Eligibility is determined by your completed curriculum programs and earned achievement milestones.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="card-surface p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white font-semibold"
                  : "bg-neutral-100 text-textMuted hover:bg-neutral-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs === undefined ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-surface p-6 animate-pulse space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
            </div>
          ))
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-2 text-center py-16 card-surface space-y-3">
            <Briefcase className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-textMain">No opportunities match your filter</h3>
            <p className="text-xs text-textMuted">Try searching for other keywords or reset your category selection.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className={`card-surface p-6 flex flex-col justify-between transition-all hover:border-brand-300 ${
                !job.isEligible ? "bg-neutral-50/70" : "bg-white"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                      {job.category}
                    </span>
                    <h3 className="text-lg font-bold text-textMain mt-2">
                      {job.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-extrabold text-textMain block">
                      ₹{job.payment.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-textMuted uppercase font-medium">
                      {job.paymentType} payout
                    </span>
                  </div>
                </div>

                <p className="text-xs text-textMuted leading-relaxed">
                  {job.shortDescription}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Eligibility requirements box */}
                <div className="pt-2">
                  {job.requiredProgramName && (
                    <div className="flex items-center gap-1.5 text-xs text-textMuted bg-white border border-borderSubtle p-2 rounded-lg">
                      {job.isEligible ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="truncate">
                        Requirement: <strong className="text-textMain">{job.requiredProgramName}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="pt-5 mt-5 border-t border-borderSubtle flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-textMuted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {job.estimatedDuration}
                  </span>
                  <span>{job.openings} Openings</span>
                </div>

                {user ? (
                  job.applicationStatus ? (
                    <Link
                      href="/dashboard/applications"
                      className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-100"
                    >
                      Status: {job.applicationStatus.toUpperCase()}
                    </Link>
                  ) : job.isEligible ? (
                    <Link
                      href={`/dashboard/work/${job._id}`}
                      className="btn-primary text-xs py-1.5 px-3.5"
                    >
                      Apply Now
                    </Link>
                  ) : (
                    <Link
                      href={`/programs`}
                      className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100"
                    >
                      Unlock Program
                    </Link>
                  )
                ) : (
                  <Link
                    href={`/login?redirect=/work`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Log In to Apply
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
