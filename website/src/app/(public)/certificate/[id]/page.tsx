"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Award, CheckCircle2, ShieldCheck, Link2, Check } from "lucide-react";
import { CertificateCard } from "@/components/CertificateDesign";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = (params?.id as string) || "";

  const verification = useQuery(
    (api as any).certificates.verifyCertificate,
    certificateId ? { certificateId } : "skip"
  );

  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context) — nothing to do.
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Verification status */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Credential Registry</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Certificate Verification
        </h1>
        {verification && (
          <div className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Authentic</span>
          </div>
        )}
      </div>

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
            The certificate ID <strong>{certificateId}</strong> could not be located in our registry.
          </p>
          <Link href="/verify" className="btn-primary text-xs inline-flex">
            Verify a Different Certificate
          </Link>
        </div>
      ) : (
        <>
          {/* ── The certificate ── */}
          <CertificateCard
            domId="certificate-card"
            recipientName={verification.recipientName}
            programName={verification.programName}
            certificateId={verification.certificateId}
            issueDate={verification.issueDate}
            signatureUrl={verification.signatureUrl}
          />

          {/* Share-only actions (viewing page — downloads live in the owner's dashboard) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={copyLink}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              {copied ? (
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
              href="/verify"
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify Another Certificate
            </Link>
          </div>

          <p className="text-center text-[11px] text-textMuted">
            Issued by {verification.issuer} · Recorded on the ZetaGrow Credential Ledger
          </p>
        </>
      )}
    </div>
  );
}
