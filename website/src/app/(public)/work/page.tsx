"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import {
  Briefcase,
  Search,
  Clock,
  Lock,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Building2,
  Flame,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Content & Writing",
  "Media Production",
  "Web & Technical",
  "Social & Marketing",
  "E-Commerce",
  "Operations",
  "Design & Creative",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "payment_high", label: "Highest Payout" },
  { value: "payment_low", label: "Lowest Payout" },
  { value: "applicants", label: "Most Applicants" },
];

const PER_PAGE = 15;

type Job = {
  _id: string;
  _creationTime: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  skills: string[];
  requirements: string[];
  requiredProgramId: string | undefined;
  requiredAchievementId: string | undefined;
  payment: number;
  paymentType: string;
  workType: string;
  difficulty: string;
  estimatedDuration: string;
  deadline: string;
  openings: number;
  status: string;
  company: string | undefined;
  coverImageUrl: string | null;
  isEligible: boolean;
  missingRequirements: string[];
  requiredProgramName: string | undefined;
  requiredProgramNames: string[] | undefined;
  applicationStatus: string | null;
  applicantCount: number | undefined;
};

function formatApplicants(n: number | undefined): string {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function PublicWorkPage() {
  const { token, user } = useAuth();
  const jobsRaw = useQuery(
    api.jobs.getJobsWithEligibility,
    { token: token || undefined }
  ) as Job[] | undefined;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [certFilter, setCertFilter] = useState("all");

  const filteredJobs = useMemo(() => {
    if (!jobsRaw) return [];
    return jobsRaw
      .filter((job) => {
        if (selectedCategory !== "All" && job.category !== selectedCategory) return false;
        if (difficultyFilter !== "all" && job.difficulty !== difficultyFilter) return false;
        if (paymentFilter === "under1k" && job.payment >= 1000) return false;
        if (paymentFilter === "1k-5k" && (job.payment < 1000 || job.payment > 5000)) return false;
        if (paymentFilter === "5k-10k" && (job.payment <= 5000 || job.payment > 10000)) return false;
        if (paymentFilter === "10k+" && job.payment <= 10000) return false;
        if (certFilter === "free" && (job.requiredProgramName || job.requiredProgramNames)) return false;
        if (certFilter === "cert" && !job.requiredProgramName && !job.requiredProgramNames) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            job.title.toLowerCase().includes(q) ||
            job.shortDescription.toLowerCase().includes(q) ||
            job.skills.some((s) => s.toLowerCase().includes(q)) ||
            (job.company || "").toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "payment_high": return b.payment - a.payment;
          case "payment_low": return a.payment - b.payment;
          case "applicants": return (b.applicantCount || 0) - (a.applicantCount || 0);
          default: return b._creationTime - a._creationTime;
        }
      });
  }, [jobsRaw, selectedCategory, searchQuery, sortBy, difficultyFilter, paymentFilter, certFilter]);

  const totalPages = Math.ceil(filteredJobs.length / PER_PAGE);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textMain">
              Work Opportunities
            </h1>
          </div>
        </div>
        <p className="text-sm text-textMuted leading-relaxed">
          Browse {filteredJobs.length}+ client projects and contract work. Apply with your skills and ZetaGrow certificates.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-borderSubtle rounded-xl p-4 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, skill, or company..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-borderSubtle text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-neutral-100 text-textMuted hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Payment Range */}
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs font-medium bg-white"
          >
            <option value="all">Any Payment</option>
            <option value="under1k">Under ₹1,000</option>
            <option value="1k-5k">₹1,000 – ₹5,000</option>
            <option value="5k-10k">₹5,000 – ₹10,000</option>
            <option value="10k+">₹10,000+</option>
          </select>

          {/* Certificate */}
          <select
            value={certFilter}
            onChange={(e) => { setCertFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs font-medium bg-white"
          >
            <option value="all">All Types</option>
            <option value="free">Free (No Certificate)</option>
            <option value="cert">Requires Certificate</option>
          </select>

          {/* Difficulty */}
          <select
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs font-medium bg-white"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs font-medium bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-textMuted">
          Showing {paginatedJobs.length} of {filteredJobs.length} opportunities
        </p>
      </div>

      {/* Job Cards */}
      {jobsRaw === undefined ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-borderSubtle rounded-xl p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/4" />
                  <div className="h-5 bg-neutral-200 rounded w-1/2" />
                  <div className="h-3 bg-neutral-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : paginatedJobs.length === 0 ? (
        <div className="bg-white border border-borderSubtle rounded-xl p-16 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-textMain">No opportunities found</h3>
          <p className="text-sm text-textMuted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedJobs.map((job) => (
            <Link
              key={job._id}
              href={user ? `/dashboard/work/${job.slug}` : `/login?redirect=/work`}
              className="block bg-white border border-borderSubtle rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex gap-4">
                {/* ZetaGrow Logo */}
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white font-extrabold text-sm">Z</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {job.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          job.difficulty === "beginner" ? "bg-green-50 text-green-700 border-green-200" :
                          job.difficulty === "intermediate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {job.difficulty}
                        </span>
                        {job.requiredProgramName && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> Certificate Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-textMain group-hover:text-brand-700 transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-textMuted mt-1 line-clamp-1">
                        {job.shortDescription}
                      </p>
                    </div>

                    {/* Payout */}
                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-brand-700">
                        ₹{job.payment.toLocaleString("en-IN")}
                      </span>
                      <p className="text-[10px] text-textMuted uppercase font-medium">
                        {job.paymentType} payout
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="text-[10px] text-textMuted">+{job.skills.length - 5}</span>
                    )}
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-borderSubtle">
                    <div className="flex items-center gap-4 text-[11px] text-textMuted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.estimatedDuration}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.workType === "remote" ? "Remote" : job.workType === "hybrid" ? "Hybrid" : "On-site"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatApplicants(job.applicantCount)} applicants
                      </span>
                      <span>{job.openings} openings</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.applicationStatus ? (
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                          Applied
                        </span>
                      ) : !job.isEligible ? (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Requires Certificate
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-colors flex items-center gap-1">
                          Apply Now <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-lg border border-borderSubtle flex items-center justify-center text-sm text-textMuted hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-textMuted">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p as number)}
                className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === p
                    ? "bg-brand-600 text-white shadow-sm"
                    : "border border-borderSubtle text-textMuted hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-lg border border-borderSubtle flex items-center justify-center text-sm text-textMuted hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Not logged in CTA */}
      {!user && (
        <div className="mt-12 bg-gradient-to-r from-brand-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-extrabold mb-2">Ready to start earning?</h2>
          <p className="text-sm text-white/80 mb-5 max-w-md mx-auto">
            Create a free account, build your CV profile and apply to opportunities that match your skills.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
