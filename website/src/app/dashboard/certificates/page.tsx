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
  Eye,
  X,
  Calendar,
  Hash,
  Loader2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { CertificateCard } from "@/components/CertificateDesign";

// Canonical certificate dimensions — must match the DOM element's intrinsic size.
// The CertificateCard outer wrapper is max-w-4xl (896px) and uses padding/margins
// that result in these approximate render dimensions. We capture the OUTER element
// (domId) not the inner white area, so the green frame + gold border are included.
const CERT_CANONICAL_WIDTH = 896;
const CERT_CANONICAL_HEIGHT = 640;
const CERT_ASPECT_RATIO = CERT_CANONICAL_WIDTH / CERT_CANONICAL_HEIGHT;

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

  const [previewCert, setPreviewCert] = useState<Cert | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Capture the OUTER certificate element (domId) including green frame + gold border
  const renderCardToPng = async (certId: string): Promise<string> => {
    const el = document.getElementById(`cert-export-${certId}`);
    if (!el) throw new Error("Certificate element not ready");
    return toPng(el, {
      pixelRatio: 2,
      backgroundColor: "#0D2E22",
      cacheBust: true,
      width: CERT_CANONICAL_WIDTH,
      height: CERT_CANONICAL_HEIGHT,
      style: {
        transform: "none",
        position: "static",
        left: "auto",
        top: "auto",
      },
    });
  };

  const downloadPng = async (cert: Cert) => {
    setExporting(`${cert.certificateId}:png`);
    setExportError("");
    try {
      const dataUrl = await renderCardToPng(cert.certificateId);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ZetaGrow-Certificate-${cert.certificateId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setExportError("Could not generate the image. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const downloadPdf = async (cert: Cert) => {
    setExporting(`${cert.certificateId}:pdf`);
    setExportError("");
    try {
      const dataUrl = await renderCardToPng(cert.certificateId);
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(null);
        img.onerror = reject;
      });
      // PDF page sized to match certificate aspect ratio
      const pdfWidth = 1280;
      const pdfHeight = pdfWidth / CERT_ASPECT_RATIO;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [pdfWidth, pdfHeight],
        compress: true,
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
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
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            My Certificates
          </h1>
          <p className="text-xs text-textMuted">
            Download for LinkedIn & resumes, or share the public verification link.
          </p>
        </div>
        {certificates && certificates.length > 0 && (
          <span className="text-xs text-textMuted shrink-0">
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
          </span>
        )}
      </div>

      {/* Error */}
      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
          {exportError}
        </div>
      )}

      {/* Hidden export certificates — rendered at canonical size for clean capture */}
      {certificates && certificates.length > 0 && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            width: `${CERT_CANONICAL_WIDTH}px`,
            height: `${CERT_CANONICAL_HEIGHT}px`,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          {certificates.map((cert) => (
            <div
              key={`export-${cert._id}`}
              id={`cert-export-${cert.certificateId}`}
              style={{
                width: `${CERT_CANONICAL_WIDTH}px`,
                height: `${CERT_CANONICAL_HEIGHT}px`,
                overflow: "hidden",
              }}
            >
              <CertificateCard
                exportMode
                recipientName={cert.recipientName}
                programName={cert.programName}
                certificateId={cert.certificateId}
                issueDate={cert.issueDate}
                signatureUrl={cert.signatureUrl}
              />
            </div>
          ))}
        </div>
      )}

      {/* Certificates Grid */}
      {certificates === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-surface p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-16 bg-neutral-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                  <div className="h-3 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="card-surface p-12 text-center space-y-3">
          <Award className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-semibold text-textMain">No Certificates Earned Yet</h3>
          <p className="text-xs text-textMuted max-w-sm mx-auto">
            Complete all lessons in an enrolled program to automatically earn your verified certificate.
          </p>
          <Link href="/dashboard/programs" className="btn-primary text-xs inline-flex mt-2">
            View My Programs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <CertificateThumb
              key={cert._id}
              cert={cert}
              onPreview={() => setPreviewCert(cert)}
              onDownloadPng={() => downloadPng(cert)}
              onDownloadPdf={() => downloadPdf(cert)}
              onCopyLink={() => copyShareLink(cert)}
              isExporting={exporting !== null}
              exportingTarget={exporting}
              copied={copiedId === cert.certificateId}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            style={{ maxWidth: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Certificate preview — scales to fit while preserving landscape ratio */}
            <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-neutral-100">
              <div
                className="w-full"
                style={{
                  maxWidth: `${CERT_CANONICAL_WIDTH}px`,
                  aspectRatio: `${CERT_ASPECT_RATIO}`,
                }}
              >
                <CertificateCard
                  previewMode
                  recipientName={previewCert.recipientName}
                  programName={previewCert.programName}
                  certificateId={previewCert.certificateId}
                  issueDate={previewCert.issueDate}
                  signatureUrl={previewCert.signatureUrl}
                />
              </div>
            </div>

            {/* Actions bar */}
            <div className="border-t border-borderSubtle p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-white shrink-0">
              <button
                onClick={() => downloadPng(previewCert)}
                disabled={exporting !== null}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {exporting === `${previewCert.certificateId}:png` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageDown className="w-3.5 h-3.5" />
                )}
                {exporting === `${previewCert.certificateId}:png` ? "Generating…" : "Download PNG"}
              </button>
              <button
                onClick={() => downloadPdf(previewCert)}
                disabled={exporting !== null}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {exporting === `${previewCert.certificateId}:pdf` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                {exporting === `${previewCert.certificateId}:pdf` ? "Generating…" : "Download PDF"}
              </button>
              <button
                onClick={() => copyShareLink(previewCert)}
                className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                {copiedId === previewCert.certificateId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    Copy Share Link
                  </>
                )}
              </button>
              <Link
                href={`/certificate/${previewCert.certificateId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-700 hover:text-brand-800 text-xs font-semibold inline-flex items-center gap-1"
              >
                Verify Online <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Compact certificate thumbnail card ─────────────────────────────────── */

function CertificateThumb({
  cert,
  onPreview,
  onDownloadPng,
  onDownloadPdf,
  onCopyLink,
  isExporting,
  exportingTarget,
  copied,
}: {
  cert: Cert;
  onPreview: () => void;
  onDownloadPng: () => void;
  onDownloadPdf: () => void;
  onCopyLink: () => void;
  isExporting: boolean;
  exportingTarget: string | null;
  copied: boolean;
}) {
  const issued = new Date(cert.issueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="card-surface p-4 hover:border-brand-200 hover:shadow-sm transition-all group">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Mini certificate preview */}
        <button
          onClick={onPreview}
          className="w-full sm:w-28 h-32 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#143D2D] to-[#0D2E22] shrink-0 flex items-center justify-center relative group/preview hover:ring-2 hover:ring-brand-400 transition-all"
        >
          <span className="text-[#C9A227] text-[10px] font-bold tracking-wider">ZG</span>
          <span className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/20 transition-colors flex items-center justify-center">
            <Eye className="w-4 h-4 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity" />
          </span>
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-sm font-bold text-textMain truncate">{cert.programName}</h3>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-textMuted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {issued}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3 font-mono" />
              <span className="font-mono font-bold">{cert.certificateId}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 mt-auto pt-2 flex-wrap">
            <button
              onClick={onPreview}
              className="text-[10px] font-semibold text-brand-700 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50 transition-colors inline-flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> View
            </button>
            <button
              onClick={onDownloadPng}
              disabled={isExporting}
              className="text-[10px] font-semibold text-textMuted hover:text-textMain px-2 py-1 rounded hover:bg-neutral-50 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
            >
              <ImageDown className="w-3 h-3" /> PNG
            </button>
            <button
              onClick={onDownloadPdf}
              disabled={isExporting}
              className="text-[10px] font-semibold text-textMuted hover:text-textMain px-2 py-1 rounded hover:bg-neutral-50 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
            >
              <FileDown className="w-3 h-3" /> PDF
            </button>
            <button
              onClick={onCopyLink}
              className="text-[10px] font-semibold text-textMuted hover:text-textMain px-2 py-1 rounded hover:bg-neutral-50 transition-colors inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Link2 className="w-3 h-3" />}
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
