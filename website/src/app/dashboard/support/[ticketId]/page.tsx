"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Link2,
  Copy,
  LifeBuoy,
  ShieldCheck,
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
            title={a.name || "Attachment image"}
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
            <Link2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{a.name || a.url}</span>
          </a>
        )
      )}
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const { token } = useAuth();
  const detail = useQuery(
    api.supportTickets.getTicketDetail,
    token && params.ticketId ? { token, ticketId: params.ticketId as any } : "skip"
  );

  const sendReply = useMutation(api.supportTickets.sendTicketReply);
  const generateUploadUrl = useAction(api.supportTickets.generateTicketUploadUrl);

  const [reply, setReply] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (detail) {
      navigator.clipboard?.writeText(detail.ticket.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !params.ticketId || !reply.trim()) return;
    setIsSending(true);
    setError("");
    try {
      const attachments = [
        ...images.map((img) => ({ type: "image", url: img.url, name: img.name })),
        ...links.filter((l) => l.trim()).map((l) => ({ type: "link", url: l.trim(), name: l.trim() })),
      ];
      await sendReply({
        token,
        ticketId: params.ticketId as any,
        message: reply,
        attachments: attachments.length ? attachments : undefined,
      });
      setReply("");
      setLinks([]);
      setImages([]);
    } catch (err: any) {
      setError(err.message || "Failed to send reply.");
    } finally {
      setIsSending(false);
    }
  };

  if (detail === undefined) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center animate-pulse space-y-3">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
      </div>
    );
  }

  const { ticket, messages } = detail;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/support"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Support Center
      </Link>

      <div className="card-surface p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-brand-600" />
            <code className="text-sm font-bold text-brand-700 tracking-wider">
              {ticket.trackingId}
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
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}
          >
            {ticket.status.replace(/_/g, " ")}
          </span>
        </div>

        <div>
          <h1 className="text-lg font-bold text-textMain">{ticket.title}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase">
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </span>
            <span className="text-[10px] text-textMuted">
              Raised {new Date(ticket.createdAt).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs ${
                m.sender === "user"
                  ? "bg-brand-600 text-white rounded-br-md"
                  : "bg-white border border-borderSubtle text-textMain rounded-bl-md"
              }`}
            >
              <div className={`flex items-center gap-1.5 mb-1.5 ${m.sender === "user" ? "justify-end" : ""}`}>
                {m.sender === "admin" && (
                  <ShieldCheck className="w-3 h-3 text-brand-600" />
                )}
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

      {/* Reply Box */}
      <form onSubmit={handleSend} className="card-surface p-5 space-y-3">
        <div className="space-y-1">
          <label className="font-semibold text-textMain text-xs">Add a reply</label>
          <textarea
            rows={3}
            required
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write your reply or additional details..."
            className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-brand-100">
            <Paperclip className="w-3 h-3" />
            Attach Image
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Paste proof link..."
              className="w-full px-3 py-1.5 rounded-lg border border-borderSubtle bg-white text-xs"
            />
            <button
              type="button"
              onClick={() => {
                if (linkInput.trim()) {
                  setLinks((l) => [...l, linkInput.trim()]);
                  setLinkInput("");
                }
              }}
              className="px-3 py-1.5 bg-neutral-100 border border-borderSubtle rounded-lg text-xs font-semibold text-textMain hover:bg-neutral-200 shrink-0"
            >
              <Link2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isUploading && (
          <p className="text-[11px] text-brand-700 font-medium">Uploading image...</p>
        )}

        {(images.length > 0 || links.length > 0) && (
          <div className="space-y-1">
            {images.map((img, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-2 py-1.5 bg-neutral-50 border border-borderSubtle rounded-lg">
                <span className="text-[11px] text-textMuted truncate">{img.name}</span>
                <button type="button" onClick={() => setImages((a) => a.filter((_, j) => j !== i))} className="text-red-500 text-[11px] font-bold">
                  ✕
                </button>
              </div>
            ))}
            {links.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-2 py-1.5 bg-neutral-50 border border-borderSubtle rounded-lg">
                <span className="text-[11px] text-textMuted truncate">{l}</span>
                <button type="button" onClick={() => setLinks((a) => a.filter((_, j) => j !== i))} className="text-red-500 text-[11px] font-bold">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSending || !reply.trim()}
          className="btn-primary px-4 py-2 flex items-center gap-1.5 text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          {isSending ? "Sending..." : "Send Reply"}
        </button>
      </form>
    </div>
  );
}