"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Loader2,
  ImageDown,
  FileDown,
  Link2,
  Check,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  CertificateCard,
  CERT_CANONICAL_WIDTH,
  CERT_CANONICAL_HEIGHT,
} from "@/components/CertificateDesign";
import { ScaledCertificate } from "@/components/ScaledCertificate";

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get("code") || "").trim();

  const [input, setInput] = useState(initialCode);
  const [submitted, setSubmitted] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);

  const verification = useQuery(
    api.certificates.verifyCertificate,
    submitted ? { certificateId: submitted } : "skip"
  );

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = input.trim().toUpperCase();
    if (!code) return;
    setSubmitted(code);
    router.replace(`/verify?code=${encodeURIComponent(code)}`);
  };

  const copyShareLink = async () => {
    if (!verification) return;
    try {
      const url = `${window.location.origin}/certificate/${verification.certificateId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const renderCardToPng = async (): Promise<string> => {
    const el = document.getElementById("verify-cert-export");
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
    try {
      const dataUrl = await renderCardToPng();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ZetaGrow-Certificate-${verification.certificateId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
    } finally {
      setExporting(null);
    }
  };

  const downloadPdf = async () => {
    if (!verification) return;
    setExporting("pdf");
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
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Credential Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
          Verify a Certificate
        </h1>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          Enter the certificate ID printed on any ZetaGrow certificate (e.g. ZG-2026-1GG1PW) to confirm authenticity.
        </p>
      </div>

      {/* Code input */}
      <form
        onSubmit={submit}
        className="card-surface p-4 flex flex-col sm:flex-row gap-3 sm:items-center shadow-sm"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ZG-2026-XXXXXX"
            autoFocus
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-borderSubtle text-sm font-mono uppercase tracking-wider bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className="btn-primary text-xs py-2.5 px-6 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          Verify Certificate
        </button>
      </form>

      {/* Result */}
      {submitted ? (
        <div className="space-y-6">
          {verification === undefined ? (
            <div className="card-surface p-8 text-center flex items-center justify-center gap-2 text-xs text-textMuted">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              Checking the registry for <strong className="font-mono">{submitted}</strong>...
            </div>
          ) : verification === null ? (
            <div className="card-surface p-8 text-center space-y-3 border-red-200">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-textMain">
                Not Verified
              </h2>
              <p className="text-xs text-textMuted max-w-sm mx-auto">
                No certificate with ID <strong className="font-mono">{submitted}</strong> exists in the official registry. Check the ID and try again.
              </p>
            </div>
          ) : (
            <div className="card-surface p-6 sm:p-8 space-y-6 border-green-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-800">
                      Verified Authentic Record
                    </h2>
                    <p className="text-[11px] text-textMuted">
                      This certificate exists in the official ZetaGrow registry.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/certificate/${verification.certificateId}`}
                    className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
                  >
                    View Full Certificate <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Verified Details Grid */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-y border-neutral-200/80 py-4 bg-neutral-50/50 rounded-lg px-4">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-textMuted font-bold">
                    Certificate ID
                  </dt>
                  <dd className="font-mono font-bold text-brand-700 mt-0.5">
                    {verification.certificateId}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-textMuted font-bold">
                    Awarded To
                  </dt>
                  <dd className="font-bold text-textMain mt-0.5">
                    {verification.recipientName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-textMuted font-bold">
                    Program
                  </dt>
                  <dd className="font-bold text-textMain mt-0.5">
                    {verification.programName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-textMuted font-bold">
                    Issued On
                  </dt>
                  <dd className="font-bold text-textMain mt-0.5">
                    {new Date(verification.issueDate).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </dd>
                </div>
              </dl>

              {/* Hidden Export Card */}
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
                <div id="verify-cert-export" style={{ width: `${CERT_CANONICAL_WIDTH}px`, height: `${CERT_CANONICAL_HEIGHT}px` }}>
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

              {/* Live Scaled Landscape Preview */}
              <div className="w-full drop-shadow-md rounded-xl overflow-hidden bg-neutral-100 p-2 sm:p-4">
                <ScaledCertificate>
                  <CertificateCard
                    previewMode
                    recipientName={verification.recipientName}
                    programName={verification.programName}
                    certificateId={verification.certificateId}
                    issueDate={verification.issueDate}
                    signatureUrl={verification.signatureUrl}
                  />
                </ScaledCertificate>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={downloadPng}
                  disabled={exporting !== null}
                  className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {exporting === "png" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageDown className="w-3.5 h-3.5" />}
                  Download PNG
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={exporting !== null}
                  className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {exporting === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  Download PDF
                </button>
                <button
                  onClick={copyShareLink}
                  className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
                >
                  {copied ? (
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
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card-surface p-8 text-center space-y-2">
          <Award className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-xs text-textMuted">
            Every ZetaGrow certificate carries a unique ID. Employers and anyone with the link can confirm its authenticity here.
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="card-surface p-12 text-center animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
