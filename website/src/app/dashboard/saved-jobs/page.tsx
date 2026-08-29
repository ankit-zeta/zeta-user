"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Bookmark, ArrowRight, Briefcase, Calendar, Users, Clock, Trash2 } from "lucide-react";

export default function SavedJobsPage() {
  const { token } = useAuth();
  const savedJobs = useQuery(
    api.workPortal.getSavedJobs,
    token ? { token } : "skip"
  );
  const toggleSavedJob = useMutation(api.workPortal.toggleSavedJob);

  const handleRemove = async (jobId: string) => {
    if (!token) return;
    await toggleSavedJob({ token, jobId: jobId as any });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">Saved Opportunities</h1>
        <p className="text-xs text-textMuted">Jobs you&apos;ve bookmarked for later review.</p>
      </div>

      {savedJobs === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface p-5 animate-pulse space-y-3">
              <div className="h-5 bg-neutral-200 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="card-surface p-10 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-neutral-300 mx-auto" />
          <h2 className="text-sm font-bold text-textMain">No Saved Jobs</h2>
          <p className="text-xs text-textMuted max-w-sm mx-auto">
            Bookmark opportunities from the work marketplace to review them later.
          </p>
          <Link href="/dashboard/work" className="btn-primary text-xs inline-flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5" />
            Browse Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedJobs.map((saved) => {
            const job = saved.job;
            if (!job) return null;
            return (
              <div key={saved._id} className="card-surface p-5 flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {job.category}
                      </span>
                      <h3 className="text-sm font-bold text-textMain mt-1.5 line-clamp-1">{job.title}</h3>
                      {job.company && (
                        <p className="text-[11px] font-medium text-textMain mt-0.5">{job.company}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-textMain block">
                        ₹{job.payment.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-textMuted uppercase font-medium">{job.paymentType}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-textMuted leading-relaxed line-clamp-2">{job.shortDescription}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-textMuted">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.openings} openings</span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-borderSubtle flex items-center justify-between">
                  <button
                    onClick={() => handleRemove(job._id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                  <Link
                    href={`/dashboard/work/${job._id}`}
                    className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                  >
                    View & Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
