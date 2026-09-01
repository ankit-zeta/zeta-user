"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  Briefcase, 
  Search, 
  Clock, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  ShieldAlert,
  Wallet,
  AlertCircle,
  FileText,
  Award,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Construction,
} from "lucide-react";

export default function DashboardWorkPage() {
  const { token, user } = useAuth();
  const jobs = useQuery(
    api.jobs.getJobsWithEligibility,
    token ? { token } : "skip"
  ) as Array<{
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
    requiredProgramIds: string[] | undefined;
    requiredAchievementId: string | undefined;
    payment: number;
    paymentType: string;
    workType: string;
    difficulty: string;
    estimatedDuration: string;
    deadline: string;
    openings: number;
    status: string;
    applicationQuestions: string[];
    attachments: string[] | undefined;
    company: string | undefined;
    coverImageStorageId: string | undefined;
    createdAt: number;
    updatedAt: number;
    coverImageUrl: string | null;
    isEligible: boolean;
    missingRequirements: string[];
    requiredProgramName: string | undefined;
    requiredProgramNames: string[] | undefined;
    requiredAchievementName: string | undefined;
    applicationStatus: string | null;
    applicantCount: number;
  }> | undefined;

  const wallet = useQuery(
    api.wallets.getUserWallet,
    token ? { token } : "skip"
  ) as {
    availableBalance: number;
    workEarnings: number;
    affiliateEarnings: number;
    totalWithdrawn: number;
  } | undefined;

  const cvProfile = useQuery(
    api.cvProfiles.getMyCvProfile,
    token ? { token } : "skip"
  ) as {
    completeness: { complete: boolean; percent: number };
  } | undefined;

  const workPortalSettings = useQuery(api.workPortal.getWorkPortalSettings);

  const savedJobs = useQuery(
    api.workPortal.getSavedJobs,
    token ? { token } : "skip"
  ) as Array<{ jobId: string }> | undefined;

  const toggleSavedJob = useMutation(api.workPortal.toggleSavedJob);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [certFilter, setCertFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [dismissedKycBar, setDismissedKycBar] = useState(false);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 15;

  const categories = [
    "all",
    "Content & Writing",
    "Media Production",
    "Web & Technical",
    "Social & Marketing",
    "E-Commerce",
    "Design & Creative",
    "Operations",
  ];

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      const matchesCat = selectedCategory === "all" || job.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || (() => {
        const q = searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(q) ||
          job.shortDescription.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q)) ||
          (job.company || "").toLowerCase().includes(q)
        );
      })();
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "under1k" && job.payment < 1000) ||
        (paymentFilter === "1k-5k" && job.payment >= 1000 && job.payment <= 5000) ||
        (paymentFilter === "5k-10k" && job.payment > 5000 && job.payment <= 10000) ||
        (paymentFilter === "10k+" && job.payment > 10000);
      const matchesCert =
        certFilter === "all" ||
        (certFilter === "free" && !job.requiredProgramName && !job.requiredProgramNames) ||
        (certFilter === "cert" && (job.requiredProgramName || job.requiredProgramNames));
      const matchesDifficulty =
        difficultyFilter === "all" || job.difficulty === difficultyFilter;
      return matchesCat && matchesSearch && matchesPayment && matchesCert && matchesDifficulty;
    });
  }, [jobs, selectedCategory, searchQuery, paymentFilter, certFilter, difficultyFilter]);

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs].sort((a, b) => {
      if (sortBy === "newest") return b._creationTime - a._creationTime;
      if (sortBy === "highest") return b.payment - a.payment;
      if (sortBy === "lowest") return a.payment - b.payment;
      if (sortBy === "applicants") return (b.applicantCount || 0) - (a.applicantCount || 0);
      if (sortBy === "openings") return b.openings - a.openings;
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return 0;
    });
    return list;
  }, [filteredJobs, sortBy]);

  const totalPages = Math.ceil(sortedJobs.length / PER_PAGE);
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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

  const activeFilterCount = [paymentFilter, certFilter, difficultyFilter].filter((f) => f !== "all").length;

  const kycStatus = user ? (user as any).kycStatus : "unverified";
  const cvComplete = cvProfile?.completeness?.complete === true;
  const cvPercent = cvProfile?.completeness?.percent || 0;

  const showKycBar = user && (kycStatus !== "verified" || !cvComplete) && !dismissedKycBar;

  const getKycBarMessage = () => {
    if (kycStatus === "pending") {
      return { 
        icon: <ShieldAlert className="w-4 h-4 text-blue-500" />,
        title: "KYC Under Review",
        desc: "Your PAN & Aadhaar verification is pending. You'll be able to apply once approved.",
        action: "View Status",
        variant: "blue"
      };
    }
    if (kycStatus === "rejected") {
      return { 
        icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
        title: "KYC Rejected",
        desc: "Please resubmit your documents to unlock work applications.",
        action: "Resubmit KYC",
        variant: "red"
      };
    }
    if (kycStatus !== "verified") {
      return { 
        icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
        title: "KYC Required",
        desc: "Complete PAN & Aadhaar verification for TDS-compliant payouts before applying.",
        action: "Start KYC",
        variant: "amber"
      };
    }
    if (!cvComplete) {
      return { 
        icon: <FileText className="w-4 h-4 text-amber-500" />,
        title: "Complete Your CV Profile",
        desc: `Your CV is ${cvPercent}% complete. Add overview, experience, education & skills to apply for work.`,
        action: "Complete CV",
        variant: "amber"
      };
    }
    return null;
  };

  const kycBarData = getKycBarMessage();

  const savedJobIds = new Set(savedJobs?.map((s) => s.jobId) || []);
  const isJobSaved = (jobId: string) => savedJobIds.has(jobId);

  const handleToggleSave = async (jobId: string) => {
    if (!token) return;
    setSavingJobId(jobId);
    try {
      await toggleSavedJob({ token, jobId: jobId as any });
    } catch {}
    setSavingJobId(null);
  };

  const workPortalEnabled = workPortalSettings?.enabled !== false;
  const timeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="space-y-6">
      {/* Work Portal Disabled */}
      {!workPortalEnabled && (
        <div className="card-surface p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
            <Construction className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="text-lg font-bold text-textMain">Work Portal Temporarily Unavailable</h2>
          <p className="text-xs text-textMuted max-w-md mx-auto">
            The work portal is currently disabled by the administrator. Please check back later or contact support for more information.
          </p>
          <Link href="/dashboard" className="btn-primary text-xs inline-flex">
            Back to Dashboard
          </Link>
        </div>
      )}

      {workPortalEnabled && (
        <>
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Work Opportunities Marketplace
        </h1>
        <p className="text-xs text-textMuted">
          Verified client assignments. Requirements validated in real-time against your certificates, CV & KYC.
        </p>
      </div>

      {/* Slim Sticky KYC/CV Bar */}
      {showKycBar && kycBarData && (
        <div className={`relative sticky top-4 z-20 mb-4 ${kycBarData.variant === "blue" ? "bg-blue-50 border-blue-200" : kycBarData.variant === "red" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"} border rounded-xl p-3 sm:p-4 animate-slide-down`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                {kycBarData.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-textMain">{kycBarData.title}</p>
                <p className="text-[11px] text-textMuted mt-0.5">{kycBarData.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={kycStatus !== "verified" ? "/dashboard/kyc" : "/dashboard/profile"}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  kycBarData.variant === "blue" ? "bg-blue-600 text-white hover:bg-blue-700" :
                  kycBarData.variant === "red" ? "bg-red-600 text-white hover:bg-red-700" :
                  "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {kycBarData.action}
              </Link>
              <button
                onClick={() => setDismissedKycBar(true)}
                className="p-1.5 rounded-lg text-textMuted hover:bg-white/50 hover:text-textMain transition-colors"
                aria-label="Dismiss this notice"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet summary */}
      {wallet && (
        <Link
          href="/dashboard/wallet"
          className="card-surface p-4 flex items-center gap-4 hover:border-brand-400 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">
              Work Wallet
            </p>
            <p className="text-lg font-extrabold text-textMain">
              ₹{(wallet.availableBalance || 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-textMuted">
              {wallet.workEarnings > 0
                ? `₹${wallet.workEarnings.toLocaleString("en-IN")} earned from work`
                : "Earnings from completed jobs appear here"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-brand-600 transition-colors shrink-0" />
        </Link>
      )}

      {/* Filter toolbar */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white font-semibold"
                    : "bg-neutral-100 text-textMuted hover:bg-neutral-200"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search jobs, skills, company..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
          </div>
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">Any Payment</option>
            <option value="under1k">Under ₹1,000</option>
            <option value="1k-5k">₹1,000 – ₹5,000</option>
            <option value="5k-10k">₹5,000 – ₹10,000</option>
            <option value="10k+">₹10,000+</option>
          </select>

          <select
            value={certFilter}
            onChange={(e) => { setCertFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Types</option>
            <option value="free">Free (No Certificate)</option>
            <option value="cert">Requires Certificate</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">Any Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Paying</option>
            <option value="lowest">Lowest Paying</option>
            <option value="applicants">Most Applicants</option>
            <option value="openings">Most Openings</option>
            <option value="deadline">Deadline Soonest</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setPaymentFilter("all"); setCertFilter("all"); setDifficultyFilter("all"); setCurrentPage(1); }}
              className="text-[11px] text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
            >
              Clear filters ({activeFilterCount})
            </button>
          )}

          <span className="text-[11px] text-textMuted ml-auto">
            Showing {paginatedJobs.length} of {sortedJobs.length} jobs
          </span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs === undefined ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-surface p-5 animate-pulse space-y-3">
              <div className="h-5 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-3 bg-neutral-200 rounded w-full"></div>
            </div>
          ))
        ) : paginatedJobs.length === 0 ? (
          <div className="col-span-2 card-surface p-10 text-center text-sm text-textMuted">
            {sortedJobs.length === 0
              ? "No opportunities match your filter selection."
              : "No opportunities on this page. Try adjusting filters."}
          </div>
        ) : (
          paginatedJobs.map((job) => {
            const hasRequirements = job.requiredProgramName || job.requiredProgramNames || job.requiredAchievementName;
            const isFreeApply = !hasRequirements;
            const missingReqs = job.missingRequirements || [];

            return (
              <div
                key={job._id}
                className={`card-surface p-5 flex flex-col justify-between transition-all hover:border-brand-300 hover:shadow-md ${
                  !job.isEligible ? "bg-neutral-50/50 border-neutral-200" : "bg-white"
                }`}
              >
                {job.coverImageUrl && (
                  <img
                    src={job.coverImageUrl}
                    alt={job.title}
                    className="w-full h-28 object-cover rounded-lg border border-borderSubtle mb-3"
                  />
                )}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 shrink-0">
                          {job.category}
                        </span>
                        {isFreeApply && (
                          <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Free Apply
                          </span>
                        )}
                        {!isFreeApply && (job.requiredProgramName || job.requiredProgramNames) && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {job.requiredProgramName || job.requiredProgramNames?.[0]}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-textMain mt-1.5 line-clamp-1">
                        {job.title}
                      </h3>
                      {job.company && (
                        <p className="text-[11px] font-medium text-textMain mt-0.5 truncate">
                          {job.company}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-textMain block">
                        ₹{job.payment.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-textMuted uppercase font-medium">
                        {job.paymentType} payout
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-textMuted leading-relaxed line-clamp-2">
                    {job.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-[10px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>

                {/* Requirements badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {job.requiredProgramName && !job.requiredProgramNames && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${
                        job.isEligible || !missingReqs.includes("program")
                          ? "bg-brand-50 text-brand-700 border border-brand-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {job.isEligible || !missingReqs.includes("program") ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        <span className="truncate max-w-[160px]">
                          {job.requiredProgramName}
                        </span>
                      </span>
                    )}
                    {job.requiredProgramNames && job.requiredProgramNames.length > 0 && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${
                        job.isEligible || !missingReqs.includes("program")
                          ? "bg-brand-50 text-brand-700 border border-brand-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {job.isEligible ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        <span className="truncate max-w-[200px]">
                          One of: {job.requiredProgramNames.join(" / ")}
                        </span>
                      </span>
                    )}
                    {job.requiredAchievementName && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${
                        job.isEligible || !missingReqs.includes("achievement")
                          ? "bg-brand-50 text-brand-700 border border-brand-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        <Award className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{job.requiredAchievementName}</span>
                      </span>
                    )}
                  </div>

                  {/* Quick meta info */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-borderSubtle text-[10px] text-textMuted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {timeRemaining(job.deadline)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {job.applicantCount || 0} applied
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.openings} openings
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-borderSubtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-textMuted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.estimatedDuration}
                    </span>
                    <button
                      onClick={() => handleToggleSave(job._id)}
                      disabled={savingJobId === job._id}
                      className="p-1.5 rounded-lg text-textMuted hover:bg-neutral-100 hover:text-brand-600 transition-colors"
                      title={isJobSaved(job._id) ? "Unsave" : "Save for later"}
                    >
                      {isJobSaved(job._id) ? (
                        <BookmarkCheck className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {job.applicationStatus ? (
                    <Link
                      href="/dashboard/applications"
                      className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
                    >
                      Applied ({job.applicationStatus.toUpperCase()})
                    </Link>
                  ) : job.isEligible ? (
                    <Link
                      href={`/dashboard/work/${job.slug}`}
                      className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Apply Now
                    </Link>
                  ) : (
                    <Link
                      href={kycStatus !== "verified" ? "/dashboard/kyc" : !cvComplete ? "/dashboard/profile" : `/dashboard/work/${job.slug}`}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                        kycBarData?.variant === "red" ? "text-red-700 bg-red-50 border-red-200" :
                        kycBarData?.variant === "blue" ? "text-blue-700 bg-blue-50 border-blue-200" :
                        "text-amber-700 bg-amber-50 border-amber-200"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {kycStatus !== "verified" ? "Complete KYC First" : !cvComplete ? "Complete CV" : "View Requirements"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
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
        </>
      )}
    </div>
  );
}
