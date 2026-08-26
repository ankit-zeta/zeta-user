"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Award, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import { Great_Vibes, Cormorant_Garamond } from "next/font/google";

const scriptFont = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap" });
const serifFont = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// ── Decorative SVG pieces (no image assets needed) ──────────────────────────

const GOLD = "#C9A227";
const GOLD_LIGHT = "#E9CE7A";
const GREEN = "#10382A";

// Laurel wreath (two mirrored branches) used in the ribbon badge and seal.
function LaurelWreath({ size = 64, color = GOLD }: { size?: number; color?: string }) {
  const leaves = [];
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 6; i++) {
      const t = 0.28 + i * 0.115; // position along the arc
      const angle = side === 0 ? 200 - t * 160 : -20 + t * 160;
      const rad = (angle * Math.PI) / 180;
      const cx = 50 + 34 * Math.cos(rad);
      const cy = 40 + 30 * Math.sin(rad);
      leaves.push(
        <ellipse
          key={`${side}-${i}`}
          cx={cx}
          cy={cy}
          rx={5.2}
          ry={2.1}
          fill={color}
          transform={`rotate(${angle + (side === 0 ? -50 : 50)} ${cx} ${cy})`}
        />
      );
    }
  }
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 100 62" aria-hidden>
      {leaves}
      <polygon points="50,52 51.8,56.2 56,57 53,60 53.6,64 50,62 46.4,64 47,60 44,57 48.2,56.2" fill={color} />
    </svg>
  );
}

// Scalloped gold seal with green core, embossed Z and inner laurel.
function GoldSeal({ size = 150 }: { size?: number }) {
  // Smooth scalloped edge: outward arcs between valley points (bottle-cap style).
  const n = 24;
  const cx = 75, cy = 75, rValley = 58;
  const pt = (i: number, r: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  let d = `M ${pt(0, rValley).join(" ")} `;
  for (let i = 0; i < n; i++) {
    const [vx, vy] = pt(i, rValley);
    const [wx, wy] = pt(i + 1, rValley);
    const chord = Math.hypot(wx - vx, wy - vy);
    const r = (chord / 2) * 1.18;
    d += `A ${r} ${r} 0 0 1 ${wx} ${wy} `;
  }
  d += "Z";

  // Inner laurel sprigs flanking the Z.
  const sprigLeaves = [];
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.2;
      const angle = side === 0 ? 150 - t * 120 : 30 + t * 120;
      const rad = (angle * Math.PI) / 180;
      const lx = 75 + 33 * Math.cos(rad);
      const ly = 78 + 26 * Math.sin(rad);
      sprigLeaves.push(
        <ellipse
          key={`${side}-${i}`}
          cx={lx}
          cy={ly}
          rx={4.4}
          ry={1.7}
          fill={GOLD_LIGHT}
          opacity={0.9}
          transform={`rotate(${angle + (side === 0 ? -55 : 55)} ${lx} ${ly})`}
        />
      );
    }
  }

  const star = (x: number, y: number, s: number) => (
    <polygon
      points={`0,${-4.5 * s} ${1.3 * s},${-1.4 * s} ${4.6 * s},${-1.4 * s} ${2 * s},${0.9 * s} ${2.9 * s},${4.2 * s} 0,${2.2 * s} ${-2.9 * s},${4.2 * s} ${-2 * s},${0.9 * s} ${-4.6 * s},${-1.4 * s} ${-1.3 * s},${-1.4 * s}`}
      fill={GOLD_LIGHT}
      transform={`translate(${x} ${y})`}
    />
  );

  return (
    <svg width={size} height={size} viewBox="0 0 150 150" aria-hidden>
      <defs>
        <linearGradient id="sealGoldEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7a5c0e" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="55%" stopColor="#F7EBB4" />
          <stop offset="80%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8a680f" />
        </linearGradient>
        <linearGradient id="sealGoldFace" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F7EBB4" />
          <stop offset="40%" stopColor="#E3C25C" />
          <stop offset="70%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#9c7a15" />
        </linearGradient>
        <radialGradient id="sealGreen" cx="0.38" cy="0.32" r="1">
          <stop offset="0%" stopColor="#1E6144" />
          <stop offset="70%" stopColor="#10382A" />
          <stop offset="100%" stopColor="#0A2A1E" />
        </radialGradient>
        <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#3a2c05" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Scalloped rim */}
      <path d={d} fill="url(#sealGoldEdge)" stroke="#6e520b" strokeWidth={0.8} filter="url(#sealShadow)" />
      {/* Gold face */}
      <circle cx="75" cy="75" r="56" fill="url(#sealGoldFace)" stroke="#8a680f" strokeWidth={0.8} />
      <circle cx="75" cy="75" r="50.5" fill="none" stroke="#FBF3D0" strokeWidth={1.3} strokeDasharray="2.6 2.2" opacity={0.95} />
      {/* Green core */}
      <circle cx="75" cy="75" r="45" fill="url(#sealGreen)" stroke="#E3C25C" strokeWidth={1.6} />
      <circle cx="75" cy="75" r="41.5" fill="none" stroke="#C9A227" strokeWidth={0.7} opacity={0.65} />
      {/* Inner laurel + stars + embossed Z */}
      {sprigLeaves}
      {star(56, 82, 0.85)}
      {star(94, 82, 0.85)}
      <text x="76.5" y="90.5" textAnchor="middle" fontFamily="Georgia, serif" fontSize="44" fontWeight="700" fill="#06231A" opacity={0.85}>
        Z
      </text>
      <text x="75" y="89" textAnchor="middle" fontFamily="Georgia, serif" fontSize="44" fontWeight="700" fill="#F5E6A8">
        Z
      </text>
    </svg>
  );
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = (params?.id as string) || "";

  const verification = useQuery(
    api.certificates.verifyCertificate,
    certificateId ? { certificateId } : "skip"
  );

  const issued = verification
    ? new Date(verification.issueDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      #certificate-card, #certificate-card * { visibility: visible !important; }
      #certificate-card {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        margin: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
      .no-print { display: none !important; }
    }
  `;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Verification status */}
      <div className="text-center space-y-3 no-print">
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
          <Link href="/programs" className="btn-primary text-xs inline-flex">
            Browse Verified Programs
          </Link>
        </div>
      ) : (
        <>
          {/* ── The certificate ── */}
          <div
            id="certificate-card"
            className={`relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl shadow-2xl select-none`}
            style={{ background: `linear-gradient(150deg, #143D2D 0%, #0D2E22 55%, #123527 100%)` }}
          >
            {/* Gold corner ribbons (bottom) */}
            <div
              aria-hidden
              className="absolute -left-24 bottom-[-52px] w-[340px] h-[120px] rotate-[-24deg]"
              style={{
                background: "linear-gradient(100deg, #8f6b12 0%, #D4AF37 30%, #F5E6A8 50%, #D4AF37 70%, #8f6b12 100%)",
                boxShadow: "0 2px 14px rgba(0,0,0,0.35)",
              }}
            />
            <div
              aria-hidden
              className="absolute -right-24 bottom-[-52px] w-[340px] h-[120px] rotate-[24deg]"
              style={{
                background: "linear-gradient(260deg, #8f6b12 0%, #D4AF37 30%, #F5E6A8 50%, #D4AF37 70%, #8f6b12 100%)",
                boxShadow: "0 2px 14px rgba(0,0,0,0.35)",
              }}
            />

            {/* Inner white card with gold double border */}
            <div className="relative m-3 sm:m-4 rounded-lg bg-[#FDFDFB] p-[6px]"
              style={{ boxShadow: "inset 0 0 0 1.5px #D4AF37, 0 0 0 1px rgba(212,175,55,0.4)" }}
            >
              <div className="relative rounded-md bg-white px-6 sm:px-12 pt-10 sm:pt-12 pb-24 sm:pb-20"
                style={{ boxShadow: "inset 0 0 0 1px rgba(201,162,39,0.55)" }}
              >
                {/* Corner accents */}
                {["top-2 left-2", "top-2 right-2 rotate-90", "bottom-2 right-2 rotate-180", "bottom-2 left-2 -rotate-90"].map((pos) => (
                  <svg key={pos} aria-hidden className={`absolute ${pos} w-8 h-8 opacity-70`} viewBox="0 0 32 32">
                    <path d="M2 12 Q2 2 12 2 L2 2 Z" fill="none" stroke={GOLD} strokeWidth="1.6" />
                    <path d="M6 14 Q6 6 14 6" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.7" />
                  </svg>
                ))}

                {/* Ribbon badge (top-left) */}
                <div className="absolute -top-0 left-8 sm:left-12 -translate-y-2 no-print-max">
                  <div
                    className="relative w-[92px] sm:w-[104px] pt-4 pb-7 flex flex-col items-center gap-1"
                    style={{
                      background: `linear-gradient(170deg, #1C5A40, ${GREEN})`,
                      clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)",
                      boxShadow: "inset 0 0 0 1.5px rgba(212,175,55,0.8), 0 4px 10px rgba(0,0,0,0.25)",
                    }}
                  >
                    <LaurelWreath size={54} />
                    <div className="text-center leading-tight mt-0.5" style={{ color: GOLD_LIGHT }}>
                      {["COMMITMENT", "LEARNING", "GROWTH"].map((w) => (
                        <div key={w} className="text-[6px] sm:text-[6.5px] font-bold tracking-[0.18em]">
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Header: logo + wordmark */}
                <div className="flex items-center justify-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/zetagrow logo no bg.png"
                    alt="ZetaGrow logo"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shadow-sm"
                  />
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: GREEN }}>
                    ZetaGrow
                  </span>
                </div>

                {/* Title */}
                <div className="text-center mt-4 sm:mt-5">
                  <h2
                    className={`${serifFont.className} font-semibold tracking-[0.14em] text-[34px] sm:text-[52px] leading-none`}
                    style={{ color: GREEN }}
                  >
                    CERTIFICATE
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span aria-hidden className="h-px w-14 sm:w-24" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
                    <span className="text-[10px] sm:text-xs font-semibold tracking-[0.42em]" style={{ color: GREEN }}>
                      OF COMPLETION
                    </span>
                    <span aria-hidden className="h-px w-14 sm:w-24" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
                  </div>
                </div>

                {/* Recipient */}
                <div className="text-center mt-6 sm:mt-8">
                  <p className="text-xs sm:text-sm text-neutral-600">This is to certify that</p>
                  <p
                    className={`${scriptFont.className} mt-1 text-[40px] sm:text-[58px] leading-[1.15]`}
                    style={{ color: "#14523B" }}
                  >
                    {verification.recipientName}
                  </p>
                  <div aria-hidden className="mx-auto mt-1 h-px w-56 sm:w-80" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

                  <p className="text-xs sm:text-sm text-neutral-600 mt-4 sm:mt-5">
                    has successfully completed the program
                  </p>
                  <p className="text-lg sm:text-2xl font-extrabold mt-1" style={{ color: GREEN }}>
                    {verification.programName}
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
                    including all modules, lessons, and assessments
                    <br className="hidden sm:block" /> as per the program curriculum.
                  </p>
                </div>

                {/* Signature / seal / date row */}
                <div className="mt-8 sm:mt-10 grid grid-cols-3 items-end gap-2 sm:gap-6">
                  <div className="text-center">
                    <p className={`${scriptFont.className} text-2xl sm:text-[34px] leading-none text-neutral-800`}>
                      Ankit Kumar
                    </p>
                    <div className="h-px bg-neutral-400 mt-1.5 mx-2 sm:mx-6" />
                    <p className="text-[9px] sm:text-[11px] font-extrabold tracking-wider mt-1.5" style={{ color: GREEN }}>
                      ANKIT KUMAR
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-neutral-500">CEO, ZetaGrow</p>
                  </div>

                  <div className="flex justify-center -mt-4 sm:-mt-8">
                    <GoldSeal size={110} />
                  </div>

                  <div className="text-center">
                    <p className="text-sm sm:text-lg font-semibold text-neutral-800 leading-none mt-3 sm:mt-4">{issued}</p>
                    <div className="h-px bg-neutral-400 mt-2 mx-2 sm:mx-6" />
                    <p className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] mt-1.5 text-neutral-500">
                      DATE OF COMPLETION
                    </p>
                  </div>
                </div>

                {/* Footer: ID + verify URL */}
                <div className="absolute bottom-3 left-5 sm:left-8 text-[9px] sm:text-[11px] font-semibold tracking-wide text-neutral-700">
                  ID: <span className="font-mono font-bold" style={{ color: GREEN }}>{verification.certificateId}</span>
                </div>
                <div className="absolute bottom-3 right-5 sm:right-8 flex items-center gap-1.5 text-right">
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                  <p className="text-[8px] sm:text-[10px] text-neutral-600 leading-tight">
                    Verify this certificate online at
                    <br />
                    <span className="font-bold" style={{ color: GREEN }}>zetagrow.com/verify</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Download / Print
            </button>
            <Link href="/dashboard/programs" className="btn-primary text-xs py-2 px-4 inline-flex">
              Back to My Programs
            </Link>
          </div>

          <p className="text-center text-[11px] text-textMuted no-print">
            Issued by {verification.issuer} · Recorded on the ZetaGrow Credential Ledger
          </p>
        </>
      )}
    </div>
  );
}
