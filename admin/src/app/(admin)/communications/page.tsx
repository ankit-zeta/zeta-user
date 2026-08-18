"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { MessageSquare, Plus, Send, Mail, CheckCircle2, Megaphone } from "lucide-react";

export default function AdminCommunicationsPage() {
  const { token } = useAdminAuth();

  const announcements = useQuery(api.notifications.getActiveAnnouncements);
  const inquiries = useQuery(
    api.contact.getContactInquiries,
    token ? { token } : "skip"
  );

  const createAnnouncementMutation = useMutation(api.notifications.createAnnouncement);
  const updateInquiryStatusMutation = useMutation(api.contact.updateInquiryStatus);

  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState("high");
  const [targetRole, setTargetRole] = useState("all");
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);
  const [msg, setMsg] = useState("");

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !annTitle || !annContent) return;

    setIsSubmittingAnn(true);
    setMsg("");

    try {
      await createAnnouncementMutation({
        token,
        title: annTitle,
        content: annContent,
        priority: annPriority,
        targetRole,
      });

      setMsg("Announcement broadcasted successfully to active users.");
      setAnnTitle("");
      setAnnContent("");
    } catch (err: any) {
      setMsg(err.message || "Failed to publish announcement.");
    } finally {
      setIsSubmittingAnn(false);
    }
  };

  const handleResolveInquiry = async (id: any) => {
    if (!token) return;
    try {
      await updateInquiryStatusMutation({
        token,
        inquiryId: id,
        status: "resolved",
      });
      setMsg("Inquiry marked as resolved.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Communications & Inquiries
        </h1>
        <p className="text-xs text-textMuted">
          Broadcast official platform announcements and review member contact form inquiries.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Create Broadcast Announcement */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-textMain">Broadcast Announcement</h3>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Announcement Title *</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. New High-Ticket Client Contracts Added"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-textMain">Priority Level</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-medium"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-textMain">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                >
                  <option value="all">All Members</option>
                  <option value="user">Students & Contractors</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textMain">Message Body *</label>
              <textarea
                rows={4}
                required
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Detailed broadcast text..."
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingAnn}
              className="btn-primary py-2 px-4 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingAnn ? "Broadcasting..." : "Broadcast Announcement"}</span>
            </button>
          </form>
        </div>

        {/* Active Announcements List */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-textMain">Active Platform Announcements</h3>
          <div className="space-y-3">
            {announcements === undefined ? (
              <div className="p-4 animate-pulse space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-textMuted py-4 text-center">No active announcements.</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="p-4 bg-neutral-50 rounded-lg border border-borderSubtle space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-textMain">{a.title}</span>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded uppercase">
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-textMuted leading-relaxed">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Support Inquiries Table */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-textMain">Contact Form Inquiries</h3>

        {inquiries === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8 text-xs text-textMuted">No contact inquiries received.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted bg-neutral-50">
                  <th className="py-3 px-3 font-semibold">Sender</th>
                  <th className="py-3 px-3 font-semibold">Subject</th>
                  <th className="py-3 px-3 font-semibold">Message</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {inquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-textMain block">{inq.name}</span>
                      <span className="text-[11px] text-textMuted">{inq.email}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-textMain">{inq.subject}</td>
                    <td className="py-3 px-3 text-textMuted max-w-sm">{inq.message}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inq.status === "resolved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-textMuted">{new Date(inq.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 px-3 text-right">
                      {inq.status !== "resolved" && (
                        <button
                          onClick={() => handleResolveInquiry(inq._id)}
                          className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded font-semibold hover:bg-green-100"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
