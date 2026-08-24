"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  UploadCloud, 
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function MyApplicationsPage() {
  const { token } = useAuth();
  const applications = useQuery(
    api.applications.getUserApplications,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    _creationTime: number;
    jobId: string;
    userId: string;
    answers: Array<{ question: string; answer: string }>;
    coverNote: string;
    portfolioUrl: string | undefined;
    resumeUrl: string | undefined;
    status: string;
    adminNotes: string | undefined;
    submissionWorkUrl: string | undefined;
    submissionNotes: string | undefined;
    paymentStatus: string | undefined;
    submittedAt: number;
    updatedAt: number;
    job: {
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
    } | null;
  }> | undefined;

  const submitDeliverable = useMutation(api.applications.submitWorkDeliverable);

  const [activeDeliverableAppId, setActiveDeliverableAppId] = useState<string | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNotes, setDeliverableNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeDeliverableAppId || !deliverableUrl) return;

    setIsSubmitting(true);
    setMsg("");

    try {
      await submitDeliverable({
        token,
        applicationId: activeDeliverableAppId as any,
        submissionWorkUrl: deliverableUrl,
        submissionNotes: deliverableNotes,
      });
      setMsg("Deliverable submitted successfully for client review!");
      setActiveDeliverableAppId(null);
      setDeliverableUrl("");
      setDeliverableNotes("");
    } catch (err: any) {
      setMsg(err.message || "Failed to submit deliverable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
      case "in_progress":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">In Progress</span>;
      case "completed":
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Completed & Paid</span>;
      case "revision_required":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Revision Requested</span>;
      case "rejected":
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Declined</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-700 border border-borderSubtle text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Under Review</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          My Applications & Work Deliverables
        </h1>
        <p className="text-xs text-textMuted">
          Track the status of your submitted applications and upload completed assignment deliverables.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
          {msg}
        </div>
      )}

      {/* Deliverable submission modal */}
      {activeDeliverableAppId && (
        <div className="card-surface p-6 border-brand-300 bg-brand-50/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-brand-600" />
              <span>Submit Completed Assignment Deliverable</span>
            </h3>
            <button
              onClick={() => setActiveDeliverableAppId(null)}
              className="text-xs text-textMuted hover:text-textMain"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleDeliverableSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMain">Deliverable Link (Google Drive, Figma, GitHub, etc.) *</label>
              <input
                type="url"
                required
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMain">Submission Notes</label>
              <textarea
                rows={3}
                value={deliverableNotes}
                onChange={(e) => setDeliverableNotes(e.target.value)}
                placeholder="Summary of completed tasks or instructions for the reviewer..."
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Uploading..." : "Submit Deliverable"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {applications === undefined ? (
          <div className="card-surface p-12 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="card-surface p-12 text-center space-y-3">
            <FileCheck className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-textMain">No Applications Submitted</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              Browse the Work Marketplace to find client assignments matching your skills and programs.
            </p>
            <Link href="/dashboard/work" className="btn-primary text-xs inline-flex mt-2">
              Browse Opportunities
            </Link>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app._id} className="card-surface p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderSubtle pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-textMain">{app.job?.title || "Contract Opportunity"}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs text-textMuted">
                    Submitted on: {new Date(app.submittedAt).toLocaleDateString("en-IN")} • Category: {app.job?.category}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-textMain">
                    ₹{(app.job?.payment || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-textMuted block capitalize">
                    {app.job?.paymentType} Payout
                  </span>
                </div>
              </div>

              {/* Admin Notes / Feedback if present */}
              {app.adminNotes && (
                <div className="p-3 bg-neutral-50 border border-borderSubtle rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-textMain block">Reviewer Feedback:</span>
                  <p className="text-textMuted">{app.adminNotes}</p>
                </div>
              )}

              {/* Submission Status */}
              {app.submissionWorkUrl && (
                <div className="flex items-center gap-2 text-xs text-textMuted">
                  <span>Deliverable Submitted:</span>
                  <a
                    href={app.submissionWorkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>View Deliverable Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Action buttons */}
              {["accepted", "in_progress", "revision_required"].includes(app.status) && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveDeliverableAppId(app._id.toString())}
                    className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{app.submissionWorkUrl ? "Update Deliverable" : "Submit Deliverable"}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
