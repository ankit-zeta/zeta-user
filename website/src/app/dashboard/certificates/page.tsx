"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  ImageDown,
  FileDown,
  Link2,
  Check,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { CertificateCard } from "@/components/CertificateDesign";

type Cert = {
  _id: string;
  _creationTime: number;
  certificateId: string;
  userId: string;
  programId: string;
  recipientName: string;
  programName: string;
  issueDate: number;
  verificationUrl: string;
  signatureUrl?: string | null;
};

export default function CertificatesPage() {
  const { token } = useAuth();
  const certificates = useQuery(
    api.certificates.getUserCertificates,
    token ? { token } : "skip"
  ) as Cert[] | undefined;

  const [exporting, setExporting] = useState<string | null>(null); // `${certId}:${ext}`
  const [exportError, setExportError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const renderCardToPng = async (domId: string): Promise<string> => {
    const el = document.getElementById(domId);
    if (!el) throw new Error("not-ready");
    // Two passes: the first render can miss freshly-inlined web fonts.
    await toPng(el, { pixelRatio: 2, backgroundColor: "#0D2E22", cacheBust: true });
    return toPng(el, { pixelRatio: 2, backgroundColor: "#0D2E22", cacheBust: true });
  };

  const downloadPng = async (cert: Cert) => {
    const domId = `certificate-card-${cert.certificateId}`;
    setExporting(`${cert.certificateId}:png`);
    setExportError("");
    try {
      const dataUrl = await renderCardToPng(domId);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ZetaGrow-Certificate-${cert.certificateId}.png`;
      a.click();
    } catch {
      setExportError("Could not generate the image. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const downloadPdf = async (cert: Cert) => {
    const domId = `certificate-card-${cert.certificateId}`;
    setExporting(`${cert.certificateId}:pdf`);
    setExportError("");
    try {
      const dataUrl = await renderCardToPng(domId);
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(null);
        img.onerror = reject;
      });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const scale = Math.min(pw / img.width, ph / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      pdf.addImage(dataUrl, "PNG", (pw - w) / 2, (ph - h) / 2, w, h);
      pdf.save(`ZetaGrow-Certificate-${cert.certificateId}.pdf`);
    } catch {
      setExportError("Could not generate the PDF. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const copyShareLink = async (cert: Cert) => {
    try {
      const url = `${window.location.origin}/certificate/${cert.certificateId}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(cert.certificateId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard unavailable — nothing to do.
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Verified Certificates & Credentials
        </h1>
        <p className="text-xs text-textMuted">
          Your official credentials — download for LinkedIn & resumes, or share
          the public verification link.
        </p>
      </div>

      {/* Certificates Grid */}
      {certificates === undefined ? (
        <div className="card-surface p-12 text-center animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="card-surface p-12 text-center space-y-3">
          <Award className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-semibold text-textMain">No Certificates Earned Yet</h3>
          <p className="text-xs text-textMuted max-w-sm mx-auto">
            Complete 100% of all lessons in an enrolled curriculum to automatically generate your official verified credential.
          </p>
          <Link href="/dashboard/programs" className="btn-primary text-xs inline-flex mt-2">
            View My Programs
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {exportError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
              {exportError}
            </div>
          )}
          {certificates.map((cert) => {
            const busy = exporting !== null;
            return (
              <div key={cert._id} className="space-y-4">
                <CertificateCard
                  domId={`certificate-card-${cert.certificateId}`}
                  recipientName={cert.recipientName}
                  programName={cert.programName}
                  certificateId={cert.certificateId}
                  issueDate={cert.issueDate}
                  signatureUrl={cert.signatureUrl}
                />

                {/* Owner actions: download + share */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => downloadPng(cert)}
                    disabled={busy}
                    className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ImageDown className="w-3.5 h-3.5" />
                    {exporting === `${cert.certificateId}:png`
                      ? "Generating…"
                      : "Download PNG"}
                  </button>
                  <button
                    onClick={() => downloadPdf(cert)}
                    disabled={busy}
                    className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {exporting === `${cert.certificateId}:pdf`
                      ? "Generating…"
                      : "Download PDF"}
                  </button>
                  <button
                    onClick={() => copyShareLink(cert)}
                    className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    {copiedId === cert.certificateId ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        Copy Share Link
                      </>
                    )}
                  </button>
                  <Link
                    href={`/certificate/${cert.certificateId}`}
                    target="_blank"
                    className="text-brand-700 hover:text-brand-800 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <span>Public Verification Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-textMuted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Issued {new Date(cert.issueDate).toLocaleDateString("en-IN")} ·
                  ID <span className="font-mono font-bold">{cert.certificateId}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
