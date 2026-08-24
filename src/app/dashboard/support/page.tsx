"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import {
  LifeBuoy,
  Plus,
  Send,
  Paperclip,
  Link2,
  Copy,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

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

export default function SupportCenterPage() {
  const { token } = useAuth();
  const tickets = useQuery(
    api.supportTickets.getMyTickets,
    token ? { token } : "skip"
  ) as Array<{
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
  }> | undefined;

  const createTicket = useMutation(api.supportTickets.createTicket);
  const generateUploadUrl = useAction(api.supportTickets.generateTicketUploadUrl);

  const [category, setCategory] = useState("courses");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ trackingId: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    setError("");
    try {
      const uploadUrl = await generateUploadUrl();
      for (const file of files) {
        const resp = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!resp.ok) throw new Error("Upload failed");
        const parsed = JSON.parse(await resp.text());
        const storageId = parsed.storageId;
        setImages((arr) => [...arr, { url: storageId, name: file.name }]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard?.writeText(result.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setError("");
    setResult(null);
    try {
      const attachments = [
        ...images.map((img) => ({ type: "image", url: img.url, name: img.name })),
        ...links.filter((l) => l.trim()).map((l) => ({ type: "link", url: l.trim(), name: l.trim() })),
      ];
      const res = await createTicket({
        token,
        category,
        title,
        message,
        attachments: attachments.length ? attachments : undefined,
      });
      setResult(res);
      setCategory("courses");
      setTitle("");
      setMessage("");
      setLinks([]);
      setImages([]);
    } catch (err: any) {
      setError(err.message || "Failed to raise ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Support Center
        </h1>
        <p className="text-xs text-textMuted">
          Raise a support ticket for courses, payments, withdrawals, jobs, or any issue — track it with your ticket ID and chat with our support team.
        </p>
      </div>

      {result && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-bold text-green-900">
              Ticket raised successfully!
            </h3>
          </div>
          <p className="text-xs text-green-800">
            Save your tracking ID to follow your ticket anytime. Our support team will respond shortly.
          </p>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 bg-white border border-green-300 rounded-lg text-sm font-bold text-green-900 tracking-wider">
              {result.trackingId}
            </code>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white border border-green-300 rounded-lg text-xs font-semibold text-green-800 hover:bg-green-100 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy"}
            </button>
            <Link
              href="/support/track"
              className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800"
            >
              Track Ticket →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* My Tickets */}
        <div className="lg:col-span-3 card-surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-textMain">My Tickets</h3>
          </div>

          {tickets === undefined ? (
            <div className="p-8 text-center animate-pulse space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <LifeBuoy className="w-10 h-10 text-neutral-300 mx-auto" />
              <h4 className="text-sm font-semibold text-textMain">No tickets yet</h4>
              <p className="text-xs text-textMuted">
                Raise your first ticket and we will get back to you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <Link
                  key={t._id}
                  href={`/dashboard/support/${t._id}`}
                  className="block p-4 bg-neutral-50 hover:bg-brand-50/40 border border-borderSubtle rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">
                      {t.trackingId}
                    </code>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${STATUS_STYLES[t.status] || STATUS_STYLES.open}`}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-textMain mt-2">{t.title}</h4>
                  <p className="text-xs text-textMuted mt-1 line-clamp-2">{t.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wide">
                      {CATEGORY_LABELS[t.category] || t.category}
                    </span>
                    <span className="text-[10px] text-textMuted">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Raise a Ticket */}
        <div className="lg:col-span-2 card-surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-textMain">Raise a Ticket</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Issue Type *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-medium"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textMain">Title *</label>
              <input
                type="text"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Payment failed but plan not activated"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textMain">Describe your issue *</label>
              <textarea
                rows={5}
                required
                minLength={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what happened — program, order, payment reference, etc."
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textMain flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" /> Attach Proof Images (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold file:text-xs"
              />
              {isUploading && (
                <p className="text-[11px] text-brand-700 font-medium">Uploading image...</p>
              )}
              {images.length > 0 && (
                <div className="space-y-1 pt-1">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 bg-neutral-50 border border-borderSubtle rounded-lg"
                    >
                      <span className="text-[11px] text-textMuted truncate">{img.name}</span>
                      <button
                        type="button"
                        onClick={() => setImages((arr) => arr.filter((_, j) => j !== i))}
                        className="text-red-500 text-[11px] font-bold shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textMain flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Proof Links (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://... (screenshot, payment receipt)"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (linkInput.trim()) {
                      setLinks((l) => [...l, linkInput.trim()]);
                      setLinkInput("");
                    }
                  }}
                  className="px-3 py-2 bg-neutral-100 border border-borderSubtle rounded-lg font-semibold text-textMain hover:bg-neutral-200 shrink-0"
                >
                  Add
                </button>
              </div>
              {links.length > 0 && (
                <div className="space-y-1 pt-1">
                  {links.map((l, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 bg-neutral-50 border border-borderSubtle rounded-lg"
                    >
                      <span className="text-[11px] text-textMuted truncate">{l}</span>
                      <button
                        type="button"
                        onClick={() => setLinks((arr) => arr.filter((_, j) => j !== i))}
                        className="text-red-500 text-[11px] font-bold shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Ticket"}</span>
            </button>
            <p className="text-[10px] text-textMuted text-center">
              You will get a tracking ID (e.g. ZT-XXXXXX) to follow your ticket.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}