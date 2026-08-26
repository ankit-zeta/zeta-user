"use client";

import { friendlyError } from "@/lib/errors";

import React, { useState } from "react";
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
  Send 
} from "lucide-react";

export default function JobApplicationDetailPage() {
  const params = useParams();
  const jobId = params?.jobId as any;
  const router = useRouter();
  const { user, token } = useAuth();

  // Find job from list
  const jobs = useQuery(api.jobs.getJobsWithEligibility, token ? { token } : "skip") as Array<{
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
    requiredAchievementName: string | undefined;
    applicationStatus: string | null;
  }> | undefined;
  const job = jobs?.find((j) => j._id.toString() === jobId?.toString());

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

  if (jobs === undefined) {
    return (
      <div className="card-surface p-12 text-center animate-pulse space-y-4 max-w-3xl mx-auto">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
        <div className="h-20 bg-neutral-200 rounded"></div>
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
      // Keep isSubmitting true so button stays disabled during redirect
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <Link
        href="/dashboard/work"
        className="inline-flex items-center gap-1.5 text-xs text-textMuted hover:text-textMain font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </Link>

      {cvProfile && !cvComplete && (
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Lock className="w-4 h-4" /> Your CV profile is {cvProfile.completeness.percent}% complete
          </p>
          <p className="text-[11px] opacity-80">
            Add your professional overview, experience, education and at least 3 skills to apply for work.
          </p>
          <Link href="/dashboard/profile" className="inline-flex items-center gap-1 mt-1 font-bold text-brand-700 hover:underline">
            Complete my CV profile →
          </Link>
        </div>
      )}

      {/* Job Details Card */}
      <div className="card-surface p-6 sm:p-8 space-y-6">
        {job.coverImageUrl && (
          <img
            src={job.coverImageUrl}
            alt={job.title}
            className="w-full h-48 sm:h-64 object-cover rounded-xl border border-borderSubtle"
          />
        )}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-borderSubtle pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {job.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-textMain mt-1">{job.title}</h1>
            <p className="text-xs text-textMuted">{job.shortDescription}</p>
            {job.company && (
              <p className="text-[11px] font-semibold text-textMain">
                Client: {job.company}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className="text-2xl font-extrabold text-brand-700 block">
              ₹{job.payment.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-textMuted uppercase font-medium">
              {job.paymentType} payout
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-textMain">Project Description</h3>
          <p className="text-xs text-textMuted leading-relaxed">{job.description}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-textMain">Requirements</h3>
          <ul className="space-y-1.5 text-xs text-textMuted">
            {job.requirements.map((req, idx) => (
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
            <h3 className="text-sm font-bold text-green-800">Application Submitted Successfully!</h3>
            <p className="text-xs text-green-700">Redirecting to your applications tracker...</p>
          </div>
        ) : !job.isEligible ? (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Program Requirement Not Met</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              This client assignment requires <strong>completing {job.requiredProgramName}</strong>. Finish all lessons of the program to unlock this opportunity.
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

            {/* Application Questions */}
            {job.applicationQuestions.map((q, idx) => (
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
                placeholder="Explain why you are well suited for this assignment and your estimated turnaround time..."
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
              <span>{isSubmitting ? "Submitting Application..." : "Submit Application"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
