"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Award, CheckCircle2, ShieldCheck, Calendar, Clock, ExternalLink } from "lucide-react";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = (params?.id as string) || "";

  const verification = useQuery(
    api.certificates.verifyCertificate,
    certificateId ? { certificateId } : "skip"
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Credential Registry</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-textMain">
          Certificate Verification
        </h1>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          Cryptographically recorded on the ZetaGrow Credential Ledger for authenticity.
        </p>
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
          <Link href="/programs" className="btn-primary text-xs inline-flex">
            Browse Verified Programs
          </Link>
        </div>
      ) : (
        <div className="card-surface p-8 sm:p-12 max-w-2xl mx-auto border-2 border-brand-600 shadow-md space-y-8 bg-white relative">
          <div className="flex items-center justify-between border-b border-borderSubtle pb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-base">
                Z
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-brand-900 block leading-none">
                  ZetaGrow
                </span>
                <span className="text-[9px] text-textMuted tracking-wider font-semibold uppercase">
                  Verified Credential
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Authentic</span>
            </div>
          </div>

          <div className="text-center space-y-3 py-4">
            <p className="text-xs uppercase tracking-widest text-textMuted font-medium">
              This certifies that
            </p>
            <h2 className="text-3xl font-extrabold text-brand-900">
              {verification.recipientName}
            </h2>
            <p className="text-xs text-textMuted max-w-md mx-auto leading-relaxed">
              has successfully fulfilled all curriculum requirements, modular assignments, and practical milestones for
            </p>
            <h3 className="text-xl font-bold text-textMain text-brand-700">
              {verification.programName}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-borderSubtle pt-6 text-xs text-textMuted">
            <div>
              <span className="block font-semibold text-textMain">Certificate ID</span>
              <span className="font-mono text-brand-700 font-bold">{verification.certificateId}</span>
            </div>
            <div>
              <span className="block font-semibold text-textMain">Issue Date</span>
              <span>{new Date(verification.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-textMuted">
              Issued by {verification.issuer} • ZetaGrow Professional Skills Platform
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
