"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { 
  Briefcase, 
  Search, 
  Clock, 
  CheckCircle2, 
  Lock, 
  ArrowRight 
} from "lucide-react";

export default function DashboardWorkPage() {
  const { token } = useAuth();
  const jobs = useQuery(
    api.jobs.getJobsWithEligibility,
    token ? { token } : "skip"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "Content & Writing",
    "Media Production",
    "Web & Technical",
    "Social & Marketing",
    "Operations",
  ];

  const filteredJobs = jobs?.filter((job) => {
    const matchesCat = selectedCategory === "all" || job.category === selectedCategory;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Work Opportunities Marketplace
        </h1>
        <p className="text-xs text-textMuted">
          Verified client assignments. Requirements are validated in real-time against your enrolled programs and completed milestones.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="card-surface p-4 flex flex-col md:flex-row items-center justify-between gap-4">
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

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments..."
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
            </div>
          ))
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-2 card-surface p-12 text-center text-sm text-textMuted">
            No opportunities match your filter selection.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className={`card-surface p-6 flex flex-col justify-between transition-all ${
                !job.isEligible ? "bg-neutral-50/70" : "bg-white hover:border-brand-300"
              }`}
            >
              <div className="space-y-4">
                {job.coverImageUrl && (
                  <img
                    src={job.coverImageUrl}
                    alt={job.title}
                    className="w-full h-32 object-cover rounded-lg border border-borderSubtle"
                  />
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {job.category}
                    </span>
                    <h3 className="text-base font-bold text-textMain mt-1.5">
                      {job.title}
                    </h3>
                    {job.company && (
                      <p className="text-[11px] font-semibold text-textMain mt-0.5">
                        {job.company}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-textMain block">
                      ₹{job.payment.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-textMuted uppercase font-medium">
                      {job.paymentType} payout
                    </span>
                  </div>
                </div>

                <p className="text-xs text-textMuted leading-relaxed line-clamp-2">
                  {job.shortDescription}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {job.requiredProgramName && (
                  <div className="flex items-center gap-1.5 text-xs text-textMuted bg-white border border-borderSubtle p-2 rounded-lg">
                    {job.isEligible ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">
                      Requires: <strong className="text-textMain">{job.requiredProgramName}</strong>
                      {job.isEligible ? " ✓ Completed" : " — must complete first"}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-borderSubtle flex items-center justify-between">
                <span className="text-xs text-textMuted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.estimatedDuration}
                </span>

                {job.applicationStatus ? (
                  <Link
                    href="/dashboard/applications"
                    className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
                  >
                    Applied ({job.applicationStatus.toUpperCase()})
                  </Link>
                ) : job.isEligible ? (
                  <Link
                    href={`/dashboard/work/${job._id}`}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    Apply Now
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/programs"
                    className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100"
                  >
                    Unlock Program Access
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
