"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Award, CheckCircle2, ExternalLink, Download, Share2 } from "lucide-react";

export default function CertificatesPage() {
  const { token, user } = useAuth();
  const certificates = useQuery(
    api.certificates.getUserCertificates,
    token ? { token } : "skip"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Verified Certificates & Credentials
        </h1>
        <p className="text-xs text-textMuted">
          Official completion credentials with unique verification identifiers on the public registry.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="card-surface p-8 space-y-6 border-2 border-brand-200 shadow-sm relative bg-white"
            >
              <div className="flex items-center justify-between border-b border-borderSubtle pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                    Z
                  </div>
                  <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                    ZetaGrow Certified
                  </span>
                </div>
                <span className="text-[10px] font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-bold">
                  {cert.certificateId}
                </span>
              </div>

              <div className="space-y-2 text-center py-2">
                <span className="text-[10px] uppercase tracking-widest text-textMuted font-semibold">
                  Awarded To
                </span>
                <h3 className="text-xl font-bold text-textMain">{cert.recipientName}</h3>
                <p className="text-xs text-textMuted leading-relaxed">
                  For successful mastery and completion of
                </p>
                <h4 className="text-sm font-bold text-brand-700">{cert.programName}</h4>
              </div>

              <div className="pt-4 border-t border-borderSubtle flex items-center justify-between text-xs">
                <span className="text-textMuted">
                  Issued on: {new Date(cert.issueDate).toLocaleDateString("en-IN")}
                </span>
                <Link
                  href={`/certificate/${cert.certificateId}`}
                  target="_blank"
                  className="text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1"
                >
                  <span>Public Verification URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
