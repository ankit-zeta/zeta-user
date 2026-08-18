"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  Briefcase, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  UploadCloud
} from "lucide-react";

export default function AdminWorkPage() {
  const { token } = useAdminAuth();
  const jobs = useQuery(
    api.jobs.getAllJobsAdmin,
    token ? { token } : "skip"
  );
  const applications = useQuery(
    api.applications.getAllApplicationsAdmin,
    token ? { token } : "skip"
  );

  const updateAppStatusMutation = useMutation(api.applications.updateApplicationStatus);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("under_review");
  const [adminNotes, setAdminNotes] = useState("");
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState("");

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedApp) return;

    setIsProcessing(true);
    setMsg("");

    try {
      await updateAppStatusMutation({
        token,
        applicationId: selectedApp._id,
        status: newStatus,
        adminNotes: adminNotes || undefined,
        payoutAmount: newStatus === "completed" ? (payoutAmount || selectedApp.job?.payment || 0) : undefined,
      });

      setMsg(`Application updated to "${newStatus.toUpperCase()}".`);
      setSelectedApp(null);
      setAdminNotes("");
    } catch (err: any) {
      setMsg(err.message || "Failed to update application status.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Work Opportunities & Applications
          </h1>
          <p className="text-xs text-textMuted">
            Manage contract assignments, review applicant deliverables, approve milestones, and release wallet payouts.
          </p>
        </div>

        <Link href="/work/new" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </Link>
      </div>

      {msg && (
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800">
          {msg}
        </div>
      )}

      {/* Posted Jobs Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-textMain">Active Job Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs === undefined ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card-surface p-6 animate-pulse space-y-3">
                <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div className="col-span-2 card-surface p-8 text-center text-xs text-textMuted">
              No jobs posted yet.
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="card-surface p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {job.category}
                    </span>
                    <span className="text-sm font-bold text-textMain">
                      ₹{job.payment.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-textMain">{job.title}</h3>
                  <p className="text-xs text-textMuted line-clamp-2">{job.shortDescription}</p>

                  <div className="flex items-center gap-4 text-xs text-textMuted pt-2 border-t border-borderSubtle">
                    <span>Applicants: <strong className="text-brand-700">{job.applicantCount}</strong></span>
                    <span>Accepted: <strong className="text-textMain">{job.acceptedCount}</strong></span>
                    <span>Openings: <strong className="text-textMain">{job.openings}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Applications Review Queue Table */}
      <div className="card-surface p-6 space-y-4">
        <h2 className="text-base font-bold text-textMain">Applicant Review Queue</h2>

        {applications === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 text-xs text-textMuted">
            No applications submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted bg-neutral-50">
                  <th className="py-3 px-3 font-semibold">Applicant</th>
                  <th className="py-3 px-3 font-semibold">Opportunity</th>
                  <th className="py-3 px-3 font-semibold">Submitted Deliverable</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-textMain block">{app.user?.name || "Applicant"}</span>
                      <span className="text-[11px] text-textMuted">{app.user?.email}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-textMain">
                      {app.job?.title || "Job"}
                    </td>
                    <td className="py-3 px-3">
                      {app.submissionWorkUrl ? (
                        <a
                          href={app.submissionWorkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Review Work</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-neutral-400">Not Submitted</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        app.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : app.status === "accepted" || app.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : app.status === "revision_required"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-textMuted">
                      {new Date(app.submittedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setNewStatus(app.status);
                          setPayoutAmount(app.job?.payment || 0);
                        }}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        Review & Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-surface p-6 max-w-lg w-full space-y-5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-borderSubtle pb-3">
              <div>
                <h3 className="text-base font-bold text-textMain">Review Application</h3>
                <p className="text-xs text-textMuted">{selectedApp.user?.name} — {selectedApp.job?.title}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-xs text-textMuted hover:text-textMain"
              >
                Close
              </button>
            </div>

            {/* Applicant Answers */}
            <div className="space-y-2 text-xs max-h-48 overflow-y-auto bg-neutral-50 p-3 rounded-lg border border-borderSubtle">
              <span className="font-bold text-textMain block">Applicant Responses:</span>
              {selectedApp.answers?.map((ans: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-semibold text-textMuted">{ans.question}</p>
                  <p className="text-textMain">{ans.answer}</p>
                </div>
              ))}
              <div className="pt-1">
                <span className="font-semibold text-textMuted">Cover Note:</span>
                <p className="text-textMain">{selectedApp.coverNote}</p>
              </div>
              {selectedApp.portfolioUrl && (
                <p className="pt-1">
                  <span className="font-semibold text-textMuted">Portfolio: </span>
                  <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="text-brand-700 underline">
                    {selectedApp.portfolioUrl}
                  </a>
                </p>
              )}
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-textMain">Update Application Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-medium"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="accepted">Accepted (Assign Work)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="revision_required">Revision Required</option>
                  <option value="completed">Completed (Release Payout)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {newStatus === "completed" && (
                <div className="space-y-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <label className="font-semibold text-green-900 block">
                    Release Milestone Payout (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-green-300 bg-white font-bold text-green-900"
                  />
                  <p className="text-[10px] text-green-700">
                    This amount will be directly credited to the contractor&apos;s available wallet balance.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-textMain">Admin Reviewer Feedback / Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Feedback sent to applicant..."
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="btn-secondary py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary py-1.5 px-4"
                >
                  {isProcessing ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
