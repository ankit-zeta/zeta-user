"use client";

import { friendlyError } from "@/lib/errors";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Award,
  CheckCircle2,
  Lock,
  Send,
  Calendar,
  Users,
  Bookmark,
  BookmarkCheck,
  Star,
  MapPin,
  Zap,
  Target,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function JobApplicationDetailPage() {
  const params = useParams();
  const jobSlug = params?.jobId as string;
  const router = useRouter();
  const { user, token } = useAuth();

  const job = useQuery(
    api.jobs.getJobBySlug,
    jobSlug ? { slug: jobSlug, token } : "skip"
  ) as any;

  const submitApp = useMutation(api.applications.submitApplication);
  const cvProfile = useQuery(
    api.cvProfiles.getMyCvProfile,
    token ? { token } : "skip"
  );
  const cvComplete = cvProfile?.completeness?.complete === true;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [coverNote, setCoverNote] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [imgError, setImgError] = useState(false);

  const savedJobs = useQuery(
    api.workPortal.getSavedJobs,
    token ? { token } : "skip"
  ) as Array<{ jobId: string }> | undefined;
  const toggleSavedJob = useMutation(api.workPortal.toggleSavedJob);

  const savedJobIds = new Set(savedJobs?.map((s) => s.jobId) || []);
  const isSaved = job ? savedJobIds.has(job._id) : false;

  const jobRatings = useQuery(
    api.workPortal.getJobRatings,
    job ? { jobId: job._id } : "skip"
  );

  const similarJobs = useQuery(
    api.jobs.getJobsWithEligibility,
    token ? { token } : "skip"
  );

  const filteredSimilar = similarJobs?.filter((j: any) => j.slug !== job?.slug && j.category === job?.category).slice(0, 3);

  useEffect(() => {
    if (!job) return;
    const update = () => {
      const diff = new Date(job.deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      else setTimeLeft(`${minutes}m ${seconds}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [job]);

  const handleToggleSave = async () => {
    if (!token || !job) return;
    try {
      await toggleSavedJob({ token, jobId: job._id });
    } catch {}
  };

  if (job === undefined) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <div className="h-5 bg-neutral-200 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-surface p-8 animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-8 bg-neutral-200 rounded w-2/3"></div>
            <div className="h-20 bg-neutral-200 rounded"></div>
          </div>
          <div className="card-surface p-6 animate-pulse space-y-4">
            <div className="h-10 bg-neutral-200 rounded"></div>
            <div className="h-10 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card-surface p-12 text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-base font-bold text-textMain">Opportunity Not Found</h2>
        <p className="text-xs text-textMuted">This assignment may have been closed or archived.</p>
        <Link href="/dashboard/work" className="btn-primary text-xs inline-flex">
          Back to Opportunities
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!cvComplete) {
      setError("Please complete your CV profile before applying. Go to Profile & CV to add your overview, experience, education and skills.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formattedAnswers = job.applicationQuestions.map((q, idx) => ({
        question: q,
        answer: answers[idx] || "N/A",
      }));

      await submitApp({
        token,
        jobId: job._id,
        answers: formattedAnswers,
        coverNote,
        portfolioUrl: portfolioUrl || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/applications");
      }, 1500);
      return;
    } catch (err: any) {
      setError(friendlyError(err, "Failed to submit application."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyColor = {
    beginner: "bg-green-100 text-green-700 border-green-200",
    intermediate: "bg-amber-100 text-amber-700 border-amber-200",
    advanced: "bg-red-100 text-red-700 border-red-200",
  }[job.difficulty] || "bg-neutral-100 text-neutral-700 border-neutral-200";

  const workTypeIcon = {
    remote: "🌍 Remote",
    hybrid: "🏠 Hybrid",
    on_site: "🏢 On-site",
  }[job.workType] || job.workType;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-textMuted">
        <Link href="/dashboard/work" className="hover:text-brand-600 transition-colors">
          Work
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-textMain font-medium truncate">{job.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          {job.coverImageUrl && !imgError && (
            <div className="card-surface p-2 overflow-hidden">
              <img
                src={job.coverImageUrl}
                alt={`${job.title} — project cover`}
                className="w-full h-48 sm:h-56 object-cover rounded-xl"
                onError={() => setImgError(true)}
              />
            </div>
          )}

          {/* CV Warning */}
          {cvProfile && !cvComplete && (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Your CV profile is {cvProfile.completeness.percent}% complete
              </p>
              <p className="text-[11px] opacity-80">
                Complete your profile to apply for work opportunities.
              </p>
              <Link href="/dashboard/profile" className="inline-flex items-center gap-1 mt-1 font-bold text-brand-700 hover:underline">
                Complete my CV profile →
              </Link>
            </div>
          )}

          {/* Title & Meta */}
          <div className="card-surface p-6 sm:p-8 space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {job.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${difficultyColor}`}>
                  {job.difficulty}
                </span>
                <span className="text-[10px] font-medium text-textMuted bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  {workTypeIcon}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-textMain leading-tight">
                {job.title}
              </h1>

              <p className="text-sm text-textMuted leading-relaxed">
                {job.shortDescription}
              </p>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-textMuted border border-neutral-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-brand-50 border border-brand-100 text-center">
                <p className="text-lg font-extrabold text-brand-700">
                  ₹{job.payment.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-brand-600 font-medium uppercase">
                  {job.paymentType} payout
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
                <p className="text-lg font-extrabold text-textMain">
                  {job.openings}
                </p>
                <p className="text-[10px] text-textMuted font-medium uppercase">
                  Openings
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
                <p className="text-lg font-extrabold text-textMain">
                  {job.estimatedDuration}
                </p>
                <p className="text-[10px] text-textMuted font-medium uppercase">
                  Duration
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
                <p className="text-lg font-extrabold text-textMain">
                  {job.applicantCount || 0}
                </p>
                <p className="text-[10px] text-textMuted font-medium uppercase">
                  Applicants
                </p>
              </div>
            </div>

            {/* Certificate Requirement */}
            {job.requiredPrograms && job.requiredPrograms.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 border border-brand-200">
                <p className="text-xs font-bold text-brand-800 flex items-center gap-1.5 mb-2">
                  <Award className="w-4 h-4" />
                  {job.requiredPrograms.length > 1 ? "Certificate Required (any one)" : "Certificate Required"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredPrograms.map((p: any) => (
                    <span key={p._id} className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-brand-700 text-[11px] font-semibold">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-textMain flex items-center gap-1.5">
                <Target className="w-4 h-4 text-brand-600" />
                Project Description
              </h3>
              <p className="text-xs text-textMuted leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-textMain flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Requirements
              </h3>
              <ul className="space-y-2 text-xs text-textMuted">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Application Form */}
          <div className="card-surface p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-textMain">Submit Your Application</h2>

            {success ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <h3 className="text-sm font-bold text-green-800">Application Submitted!</h3>
                <p className="text-xs text-green-700">Redirecting to your applications tracker...</p>
              </div>
            ) : !job.isEligible ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Program Requirement Not Met</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This assignment requires completing <strong>{job.requiredPrograms?.map((p: any) => p.name).join(" or ")}</strong>. Finish all lessons to unlock.
                </p>
                <Link href="/dashboard/programs" className="btn-primary text-xs inline-flex">
                  View Required Program
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {error}
                  </div>
                )}

                {job.applicationQuestions.map((q: string, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-xs font-semibold text-textMain block">
                      {idx + 1}. {q} *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={answers[idx] || ""}
                      onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                      placeholder="Your answer..."
                      className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMain">Cover Note / Approach</label>
                  <textarea
                    rows={4}
                    required
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Why are you suited for this? Your estimated turnaround time..."
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMain">Portfolio / Sample URL (Optional)</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com or Google Drive link"
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-2.5 text-xs font-semibold flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="space-y-4">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Apply Card */}
            <div className="card-surface p-5 space-y-4 border-t-4 border-brand-600">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-brand-700">
                  ₹{job.payment.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-textMuted uppercase font-medium">
                  {job.paymentType} payout
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-borderSubtle">
                  <span className="text-textMuted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline
                  </span>
                  <span className="font-semibold text-textMain">
                    {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {timeLeft && timeLeft !== "Expired" && (
                  <div className="flex items-center justify-between py-2 border-b border-borderSubtle">
                    <span className="text-textMuted flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Time Left
                    </span>
                    <span className="font-semibold text-amber-600">{timeLeft}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-borderSubtle">
                  <span className="text-textMuted flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Openings
                  </span>
                  <span className="font-semibold text-textMain">{job.openings}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-borderSubtle">
                  <span className="text-textMuted flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Applicants
                  </span>
                  <span className="font-semibold text-textMain">{job.applicantCount || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-textMuted flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Work Type
                  </span>
                  <span className="font-semibold text-textMain">{workTypeIcon}</span>
                </div>
                {jobRatings && jobRatings.totalRatings > 0 && (
                  <div className="flex items-center justify-between py-2 border-t border-borderSubtle">
                    <span className="text-textMuted flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Rating
                    </span>
                    <span className="font-semibold text-textMain">
                      {jobRatings.averageRating} ({jobRatings.totalRatings})
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !job.isEligible || timeLeft === "Expired"}
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{!job.isEligible ? "Requirements Not Met" : timeLeft === "Expired" ? "Deadline Passed" : "Apply Now"}</span>
              </button>

              <button
                onClick={handleToggleSave}
                className={`w-full py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                  isSaved
                    ? "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100"
                    : "bg-white border-borderSubtle text-textMuted hover:bg-neutral-50"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save for Later
                  </>
                )}
              </button>
            </div>

            {/* Quick Info */}
            <div className="card-surface p-4 space-y-2">
              <h4 className="text-xs font-bold text-textMain">Quick Info</h4>
              <div className="space-y-1.5 text-[11px] text-textMuted">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-brand-600" />
                  {job.requirements.length} requirements listed
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-brand-600" />
                  {job.applicationQuestions.length} application questions
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-brand-600" />
                  Duration: {job.estimatedDuration}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Jobs */}
      {filteredSimilar && filteredSimilar.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-base font-bold text-textMain">Similar Opportunities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredSimilar.map((sj: any) => (
              <Link
                key={sj._id}
                href={`/dashboard/work/${sj.slug}`}
                className="card-surface p-4 space-y-2 hover:shadow-md transition-shadow group"
              >
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {sj.category}
                </span>
                <h4 className="text-sm font-bold text-textMain group-hover:text-brand-700 transition-colors line-clamp-2">
                  {sj.title}
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-700">₹{sj.payment.toLocaleString("en-IN")}</span>
                  <span className="text-textMuted">{sj.openings} openings</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
