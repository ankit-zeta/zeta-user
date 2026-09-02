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
} from "lucide-react";

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get("code") || "").trim();

  const [input, setInput] = useState(initialCode);
  const [submitted, setSubmitted] = useState(initialCode);

  const verification = useQuery(
    (api as any).certificates.verifyCertificate,
    submitted ? { certificateId: submitted } : "skip"
  );

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = input.trim().toUpperCase();
    if (!code) return;
    setSubmitted(code);
    router.replace(`/verify?code=${encodeURIComponent(code)}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Credential Registry</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Verify a Certificate
        </h1>
        <p className="text-xs text-textMuted max-w-md mx-auto">
          Enter the certificate ID printed at the bottom of any ZetaGrow
          certificate (e.g. ZG-2026-1GG1PW) to confirm it is genuine.
        </p>
      </div>

      {/* Code input */}
      <form
        onSubmit={submit}
        className="card-surface p-4 flex flex-col sm:flex-row gap-3 sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ZG-2026-XXXXXX"
            autoFocus
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-borderSubtle text-sm font-mono uppercase tracking-wider bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className="btn-primary text-xs py-2.5 px-5 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          Verify Certificate
        </button>
      </form>

      {/* Result */}
      {submitted ? (
        <div className="space-y-4">
          {verification === undefined ? (
            <div className="card-surface p-8 text-center flex items-center justify-center gap-2 text-xs text-textMuted">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking the registry for <strong className="font-mono">{submitted}</strong>…
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
                No certificate with ID{" "}
                <strong className="font-mono">{submitted}</strong> exists in the
                ZetaGrow registry. Check the code and try again — beware of
                altered or fabricated certificates.
              </p>
            </div>
          ) : (
            <div className="card-surface p-8 space-y-6 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-green-800">
                    Verified Authentic
                  </h2>
                  <p className="text-[11px] text-textMuted">
                    This certificate exists in the official ZetaGrow registry.
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs border-t border-borderSubtle pt-4">
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

              <Link
                href={`/certificate/${verification.certificateId}`}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                View Full Certificate
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="card-surface p-8 text-center space-y-2">
          <Award className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-xs text-textMuted">
            Every ZetaGrow certificate carries a unique ID. Employers and
            anyone with the link can confirm its authenticity here — no login
            required.
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
