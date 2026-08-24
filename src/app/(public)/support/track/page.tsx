"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { LifeBuoy, Search, ShieldCheck, Copy } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  courses: "Courses & Programs",
  duration: "Course Duration / Access",
  payments: "Payments & Refunds",
  withdrawals: "Withdrawal Request",
  jobs: "Jobs & Work Portal",
  affiliate: "Affiliate & Referrals",
  account: "Account & Profile",
  other: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-neutral-200 text-neutral-700",
};

function AttachmentList({ attachments }: { attachments: any }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((a: any, i: number) =>
        a.type === "image" ? (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="block w-24 h-24 rounded-lg border border-borderSubtle overflow-hidden hover:opacity-80 transition-opacity bg-white"
          >
            <img src={a.url} alt={a.name || "Attachment"} className="w-full h-full object-cover" />
          </a>
        ) : (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-borderSubtle rounded-lg text-[11px] font-semibold text-brand-700 hover:bg-brand-50 max-w-full"
          >
            <span className="truncate">{a.name || a.url}</span>
          </a>
        )
      )}
    </div>
  );
}

export default function TrackTicketPage() {
  const [trackingId, setTrackingId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useQuery(
    api.supportTickets.getTicketByTrackingId,
    submitted && trackingId.trim() && email.trim()
      ? { trackingId: trackingId.trim(), email: email.trim() }
      : "skip"
  ) as {
    ticket: {
      _id: string;
      _creationTime: number;
      trackingId: string;
      userId: string;
      userName: string;
      userEmail: string;
      category: string;
      title: string;
      message: string;
      status: string;
      attachments: Array<{ type: string; url: string; name?: string }> | undefined;
      createdAt: number;
      updatedAt: number;
    };
    messages: Array<{
      _id: string;
      _creationTime: number;
      ticketId: string;
      sender: "user" | "admin";
      senderName: string;
      message: string;
      attachments: Array<{ type: string; url: string; name?: string }> | undefined;
      createdAt: number;
    }>;
  } | undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard?.writeText(result.ticket.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-textMain">
          Track Your Support Ticket
        </h1>
        <p className="text-sm text-textMuted">
          Enter your ticket ID and the email you used — see the live status and full conversation with our support team.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-surface p-6 max-w-lg mx-auto space-y-3"
      >
        <div className="space-y-1">
          <label className="font-semibold text-textMain text-xs">Ticket ID *</label>
          <input
            type="text"
            required
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value);
              setSubmitted(false);
            }}
            placeholder="e.g. ZT-XXXXXX"
            className="w-full px-3 py-2.5 rounded-lg border border-borderSubtle bg-white text-sm font-bold tracking-wider uppercase"
          />
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-textMain text-xs">Email used for the ticket *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSubmitted(false);
            }}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-lg border border-borderSubtle bg-white text-sm"
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-1.5 text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          Track Ticket
        </button>
      </form>

      {submitted && result === undefined && (
        <div className="max-w-lg mx-auto p-8 text-center animate-pulse space-y-3">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
        </div>
      )}

      {submitted && result === null && (
        <div className="max-w-lg mx-auto p-5 bg-red-50 border border-red-200 rounded-xl text-center text-xs text-red-700">
          No ticket found. Check the ticket ID and email — or raise a new ticket from your dashboard.
        </div>
      )}

      {result && (
        <div className="card-surface p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <code className="text-sm font-bold text-brand-700 tracking-wider">
                {result.ticket.trackingId}
              </code>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md text-textMuted hover:bg-neutral-100"
                title="Copy tracking ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copied && <span className="text-[10px] font-semibold text-green-600">Copied!</span>}
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_STYLES[result.ticket.status] || STATUS_STYLES.open}`}
            >
              {result.ticket.status.replace(/_/g, " ")}
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold text-textMain">{result.ticket.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase">
                {CATEGORY_LABELS[result.ticket.category] || result.ticket.category}
              </span>
              <span className="text-[10px] text-textMuted">
                Raised {new Date(result.ticket.createdAt).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {result.messages.map((m) => (
              <div
                key={m._id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs ${
                    m.sender === "user"
                      ? "bg-brand-600 text-white rounded-br-md"
                      : "bg-neutral-50 border border-borderSubtle text-textMain rounded-bl-md"
                  }`}
                >
                  <div className={`flex items-center gap-1.5 mb-1.5 ${m.sender === "user" ? "justify-end" : ""}`}>
                    {m.sender === "admin" && <ShieldCheck className="w-3 h-3 text-brand-600" />}
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${m.sender === "user" ? "text-white/80" : "text-brand-700"}`}>
                      {m.sender === "admin" ? "Support Team" : m.senderName}
                    </span>
                    <span className={`text-[10px] ${m.sender === "user" ? "text-white/60" : "text-textMuted"}`}>
                      {new Date(m.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  <AttachmentList attachments={m.attachments} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-textMuted border-t border-borderSubtle pt-3">
            To reply to this ticket, log in and open it from{" "}
            <span className="font-semibold text-brand-700">Dashboard → Support Center</span>. You will be notified when the support team responds.
          </p>
        </div>
      )}
    </div>
  );
}