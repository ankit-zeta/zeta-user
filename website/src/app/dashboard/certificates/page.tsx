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
import {
  CertificateCard,
  CERT_CANONICAL_WIDTH,
  CERT_CANONICAL_HEIGHT,
  CERT_ASPECT_RATIO,
} from "@/components/CertificateDesign";
import { ScaledCertificate } from "@/components/ScaledCertificate";

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

  // High-resolution canvas capture of the canonical 1000x700 certificate card
  const renderCardToPng = async (certId: string): Promise<string> => {
    const el = document.getElementById(`cert-export-${certId}`);
    if (!el) throw new Error("Certificate element not ready");

    // Wait for web fonts if supported
    if (typeof document !== "undefined" && "fonts" in document) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    return toPng(el, {
      pixelRatio: 2, // 2000 x 1400 px ultra-crisp output
      backgroundColor: "#06231A",
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

      // Target high-resolution landscape PDF matching exact 10:7 aspect ratio
      const pdfWidth = CERT_CANONICAL_WIDTH * 2;
      const pdfHeight = CERT_CANONICAL_HEIGHT * 2;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [pdfWidth, pdfHeight],
        compress: true,
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
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

      {/* Error Banner */}
      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
          {exportError}
        </div>
      )}

      {/* Hidden Export Containers: Rendered at fixed 1000x700 canonical resolution for pixel-perfect export */}
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
          <Link href="/programs" className="btn-primary text-xs inline-flex mt-2">
            Explore Programs
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

      {/* Preview Modal: Always Landscape & Responsive Across Mobile, Tablet, Laptop */}
      {previewCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar with Title & Close button */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50/80">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-neutral-800 tracking-tight">
                  Certificate Preview — {previewCert.programName}
                </span>
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center text-neutral-700 transition-colors"
                aria-label="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Landscape Preview Body */}
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-neutral-100 flex items-center justify-center min-h-[220px]">
              <div className="w-full max-w-[960px] mx-auto">
                <ScaledCertificate>
                  <CertificateCard
                    previewMode
                    recipientName={previewCert.recipientName}
                    programName={previewCert.programName}
                    certificateId={previewCert.certificateId}
                    issueDate={previewCert.issueDate}
                    signatureUrl={previewCert.signatureUrl}
                  />
                </ScaledCertificate>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="border-t border-neutral-200 p-3 sm:p-4 flex flex-wrap items-center justify-center gap-2.5 bg-white shrink-0">
              <button
                onClick={() => downloadPng(previewCert)}
                disabled={exporting !== null}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {exporting === `${previewCert.certificateId}:png` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageDown className="w-3.5 h-3.5" />
                )}
                {exporting === `${previewCert.certificateId}:png` ? "Generating PNG..." : "Download PNG"}
              </button>

              <button
                onClick={() => downloadPdf(previewCert)}
                disabled={exporting !== null}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {exporting === `${previewCert.certificateId}:pdf` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                {exporting === `${previewCert.certificateId}:pdf` ? "Generating PDF..." : "Download PDF"}
              </button>

              <button
                onClick={() => copyShareLink(previewCert)}
                className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                {copiedId === previewCert.certificateId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
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
                className="text-brand-700 hover:text-brand-800 text-xs font-semibold inline-flex items-center gap-1 px-3 py-2"
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
        {/* Mini certificate preview badge */}
        <button
          onClick={onPreview}
          className="w-full sm:w-28 h-28 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#0A3222] to-[#06231A] shrink-0 flex items-center justify-center relative group/preview hover:ring-2 hover:ring-brand-400 transition-all shadow-inner"
        >
          <div className="text-center">
            <span className="text-[#C9A227] text-xs font-extrabold tracking-wider block">ZG</span>
            <span className="text-[9px] text-[#F5E6A8] tracking-widest uppercase block mt-0.5">CERTIFICATE</span>
          </div>
          <span className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/30 transition-colors flex items-center justify-center">
            <Eye className="w-5 h-5 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity drop-shadow" />
          </span>
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-sm font-bold text-textMain truncate">{cert.programName}</h3>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-textMuted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {issued}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3 font-mono" />
              <span className="font-mono font-bold text-neutral-700">{cert.certificateId}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-green-700 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Verified Authentic
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
            <button
              onClick={onPreview}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 px-2.5 py-1 rounded-md bg-brand-50 hover:bg-brand-100 transition-colors inline-flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={onDownloadPng}
              disabled={isExporting}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
            >
              <ImageDown className="w-3.5 h-3.5" /> PNG
            </button>
            <button
              onClick={onDownloadPdf}
              disabled={isExporting}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
            >
              <FileDown className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={onCopyLink}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 transition-colors inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
