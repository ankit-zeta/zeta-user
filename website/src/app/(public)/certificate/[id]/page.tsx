"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Link2,
  Check,
  ImageDown,
  FileDown,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  CertificateCard,
  CERT_CANONICAL_WIDTH,
  CERT_CANONICAL_HEIGHT,
} from "@/components/CertificateDesign";
import { ScaledCertificate } from "@/components/ScaledCertificate";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = (params?.id as string) || "";

  const verification = useQuery(
    api.certificates.verifyCertificate,
    certificateId ? { certificateId } : "skip"
  );

  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const [exportError, setExportError] = useState("");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const renderCardToPng = async (): Promise<string> => {
    const el = document.getElementById("public-cert-export");
    if (!el) throw new Error("Certificate element not ready");

    if (typeof document !== "undefined" && "fonts" in document) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    return toPng(el, {
      pixelRatio: 2,
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

  const downloadPng = async () => {
    if (!verification) return;
    setExporting("png");
    setExportError("");
    try {
      const dataUrl = await renderCardToPng();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ZetaGrow-Certificate-${verification.certificateId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setExportError("Could not generate image. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const downloadPdf = async () => {
    if (!verification) return;
    setExporting("pdf");
    setExportError("");
    try {
      const dataUrl = await renderCardToPng();
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(null);
        img.onerror = reject;
      });

      const pdfWidth = CERT_CANONICAL_WIDTH * 2;
      const pdfHeight = CERT_CANONICAL_HEIGHT * 2;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [pdfWidth, pdfHeight],
        compress: true,
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`ZetaGrow-Certificate-${verification.certificateId}.pdf`);
    } catch {
      setExportError("Could not generate PDF. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Verification Status Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Credential Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
          Certificate Verification
        </h1>
        {verification && (
          <div className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3.5 py-1 rounded-full font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Authentic Record</span>
          </div>
        )}
      </div>

      {exportError && (
        <div className="max-w-md mx-auto p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
          {exportError}
        </div>
      )}

      {verification === undefined ? (
        <div className="card-surface p-12 text-center animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-neutral-200 mx-auto"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/2 mx-auto"></div>
        </div>
      ) : verification === null ? (
        <div className="card-surface p-12 text-center max-w-2xl mx-auto space-y-4 border-red-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-textMain">Invalid or Unrecognized Certificate</h2>
          <p className="text-xs text-textMuted max-w-sm mx-auto">
            The certificate ID <strong className="font-mono">{certificateId}</strong> could not be located in the ZetaGrow verified registry.
          </p>
          <Link href="/verify" className="btn-primary text-xs inline-flex">
            Verify a Different Certificate
          </Link>
        </div>
      ) : (
        <>
          {/* Hidden Export Card for high-resolution rendering */}
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
            <div id="public-cert-export" style={{ width: `${CERT_CANONICAL_WIDTH}px`, height: `${CERT_CANONICAL_HEIGHT}px` }}>
              <CertificateCard
                exportMode
                recipientName={verification.recipientName}
                programName={verification.programName}
                certificateId={verification.certificateId}
                issueDate={verification.issueDate}
                signatureUrl={verification.signatureUrl}
              />
            </div>
          </div>

          {/* Certificate Container: Always in Landscape across all devices */}
          <div className="w-full max-w-5xl mx-auto drop-shadow-xl">
            <ScaledCertificate>
              <CertificateCard
                domId="public-cert-display"
                recipientName={verification.recipientName}
                programName={verification.programName}
                certificateId={verification.certificateId}
                issueDate={verification.issueDate}
                signatureUrl={verification.signatureUrl}
              />
            </ScaledCertificate>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={downloadPng}
              disabled={exporting !== null}
              className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {exporting === "png" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageDown className="w-3.5 h-3.5" />}
              {exporting === "png" ? "Generating..." : "Download PNG"}
            </button>

            <button
              onClick={downloadPdf}
              disabled={exporting !== null}
              className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {exporting === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              {exporting === "pdf" ? "Generating..." : "Download PDF"}
            </button>

            <button
              onClick={copyLink}
              className="btn-secondary text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
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
              href="/verify"
              className="text-neutral-700 hover:text-neutral-900 border border-neutral-300 bg-white hover:bg-neutral-50 rounded-lg text-xs py-2.5 px-4 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
              Verify Another
            </Link>
          </div>

          <p className="text-center text-[11px] text-textMuted pt-2">
            Issued by {verification.issuer || "ZetaGrow"} • Recorded permanently on the ZetaGrow Credential Ledger
          </p>
        </>
      )}
    </div>
  );
}
