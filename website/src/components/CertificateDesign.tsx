"use client";

import React, { useId } from "react";
import { Great_Vibes, Cormorant_Garamond } from "next/font/google";
import { ShieldCheck } from "lucide-react";

export const scriptFont = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap" });
export const serifFont = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const CERT_CANONICAL_WIDTH = 1000;
export const CERT_CANONICAL_HEIGHT = 700;
export const CERT_ASPECT_RATIO = CERT_CANONICAL_WIDTH / CERT_CANONICAL_HEIGHT;

const GOLD = "#C9A227";
const GOLD_LIGHT = "#F5E6A8";
const GOLD_DARK = "#8F6B12";
const GREEN = "#0F382A";
const GREEN_DEEP = "#082B1C";

function CornerAccents() {
  return (
    <>
      {/* Top Left */}
      <svg className="absolute top-2.5 left-2.5 w-7 h-7 pointer-events-none opacity-80" viewBox="0 0 28 28" fill="none">
        <path d="M2 14 V4 A2 2 0 0 1 4 2 H14" stroke={GOLD} strokeWidth="1.8" />
        <path d="M6 14 V7 A1 1 0 0 1 7 6 H14" stroke={GOLD} strokeWidth="1" opacity="0.6" />
        <circle cx="4" cy="4" r="1.5" fill={GOLD} />
      </svg>
      {/* Top Right */}
      <svg className="absolute top-2.5 right-2.5 w-7 h-7 pointer-events-none opacity-80" viewBox="0 0 28 28" fill="none">
        <path d="M26 14 V4 A2 2 0 0 0 24 2 H14" stroke={GOLD} strokeWidth="1.8" />
        <path d="M22 14 V7 A1 1 0 0 0 21 6 H14" stroke={GOLD} strokeWidth="1" opacity="0.6" />
        <circle cx="24" cy="4" r="1.5" fill={GOLD} />
      </svg>
      {/* Bottom Left */}
      <svg className="absolute bottom-2.5 left-2.5 w-7 h-7 pointer-events-none opacity-80" viewBox="0 0 28 28" fill="none">
        <path d="M2 14 V24 A2 2 0 0 0 4 26 H14" stroke={GOLD} strokeWidth="1.8" />
        <path d="M6 14 V21 A1 1 0 0 0 7 22 H14" stroke={GOLD} strokeWidth="1" opacity="0.6" />
        <circle cx="4" cy="24" r="1.5" fill={GOLD} />
      </svg>
      {/* Bottom Right */}
      <svg className="absolute bottom-2.5 right-2.5 w-7 h-7 pointer-events-none opacity-80" viewBox="0 0 28 28" fill="none">
        <path d="M26 14 V24 A2 2 0 0 1 24 26 H14" stroke={GOLD} strokeWidth="1.8" />
        <path d="M22 14 V21 A1 1 0 0 1 21 22 H14" stroke={GOLD} strokeWidth="1" opacity="0.6" />
        <circle cx="24" cy="24" r="1.5" fill={GOLD} />
      </svg>
    </>
  );
}

function RibbonBadge() {
  return (
    <div className="absolute top-0 left-10 -translate-y-1 z-10 pointer-events-none">
      <svg
        width="96"
        height="120"
        viewBox="0 0 96 120"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }}
      >
        <defs>
          <linearGradient id="ribbon-bg-grad" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#1C5A40" />
            <stop offset="100%" stopColor="#0B3322" />
          </linearGradient>
          <linearGradient id="ribbon-gold-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8F6B12" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#F5E6A8" />
            <stop offset="100%" stopColor="#8F6B12" />
          </linearGradient>
        </defs>
        {/* Main Ribbon Shield Body */}
        <path
          d="M6 0 L90 0 Q94 0 94 4 L94 76 Q94 90 80 102 L51 118 Q48 120 45 118 L16 102 Q2 90 2 76 L2 4 Q2 0 6 0 Z"
          fill="url(#ribbon-bg-grad)"
          stroke="url(#ribbon-gold-grad)"
          strokeWidth="2"
        />
        {/* Inner Gold Inset Line */}
        <path
          d="M10 4 L86 4 Q89 4 89 7 L89 74 Q89 85 77 96 L50 111 Q48 112 46 111 L19 96 Q7 85 7 74 L7 7 Q7 4 10 4 Z"
          fill="none"
          stroke={GOLD}
          strokeWidth="0.8"
          opacity="0.6"
        />
        {/* Crown / Stars motif at top */}
        <g transform="translate(48, 26)">
          <polygon points="0,-7 2.2,-2.2 7,-2.2 3.2,0.8 4.6,5.6 0,2.8 -4.6,5.6 -3.2,0.8 -7,-2.2 -2.2,-2.2" fill={GOLD_LIGHT} transform="scale(0.8)" />
          <polygon points="-16,-4 -14.5,-0.5 -10.5,-0.5 -13.5,1.8 -12.4,5.5 -16,3.3 -19.6,5.5 -18.5,1.8 -21.5,-0.5 -17.5,-0.5" fill={GOLD} transform="scale(0.6)" opacity="0.85" />
          <polygon points="16,-4 17.5,-0.5 21.5,-0.5 18.5,1.8 19.6,5.5 16,3.3 12.4,5.5 13.5,1.8 10.5,-0.5 14.5,-0.5" fill={GOLD} transform="scale(0.6)" opacity="0.85" />
        </g>
        {/* 3 Text Lines */}
        <text x="48" y="58" textAnchor="middle" fill={GOLD_LIGHT} fontSize="6.5" fontWeight="700" letterSpacing="0.22em" fontFamily="system-ui, sans-serif">
          COMMITMENT
        </text>
        <text x="48" y="70" textAnchor="middle" fill={GOLD_LIGHT} fontSize="6.5" fontWeight="700" letterSpacing="0.22em" fontFamily="system-ui, sans-serif">
          LEARNING
        </text>
        <text x="48" y="82" textAnchor="middle" fill={GOLD_LIGHT} fontSize="6.5" fontWeight="700" letterSpacing="0.22em" fontFamily="system-ui, sans-serif">
          GROWTH
        </text>
      </svg>
    </div>
  );
}

function GoldSeal({ size = 116 }: { size?: number }) {
  const reactId = useId();
  const uid = `seal${reactId.replace(/[:]/g, "")}`;
  const n = 24;
  const cx = 75, cy = 75, rValley = 58;
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const pt = (i: number, r: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))];
  };
  let d = `M ${pt(0, rValley).join(" ")} `;
  for (let i = 0; i < n; i++) {
    const [vx, vy] = pt(i, rValley);
    const [wx, wy] = pt(i + 1, rValley);
    const chord = Math.hypot(wx - vx, wy - vy);
    const r = r2((chord / 2) * 1.18);
    d += `A ${r} ${r} 0 0 1 ${wx} ${wy} `;
  }
  d += "Z";

  const sprigLeaves = [];
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.2;
      const angle = side === 0 ? 150 - t * 120 : 30 + t * 120;
      const rad = (angle * Math.PI) / 180;
      const lx = r2(75 + 33 * Math.cos(rad));
      const ly = r2(78 + 26 * Math.sin(rad));
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
    <svg width={size} height={size} viewBox="0 0 150 150" aria-hidden suppressHydrationWarning className="drop-shadow-md">
      <defs>
        <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7a5c0e" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="55%" stopColor="#F7EBB4" />
          <stop offset="80%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8a680f" />
        </linearGradient>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F7EBB4" />
          <stop offset="40%" stopColor="#E3C25C" />
          <stop offset="70%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#9c7a15" />
        </linearGradient>
        <radialGradient id={`${uid}-green`} cx="0.38" cy="0.32" r="1">
          <stop offset="0%" stopColor="#1E6144" />
          <stop offset="70%" stopColor="#10382A" />
          <stop offset="100%" stopColor="#0A2A1E" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#${uid}-edge)`} stroke="#6e520b" strokeWidth={0.8} suppressHydrationWarning />
      <circle cx="75" cy="75" r="56" fill={`url(#${uid}-face)`} stroke="#8a680f" strokeWidth={0.8} />
      <circle cx="75" cy="75" r="50.5" fill="none" stroke="#FBF3D0" strokeWidth={1.3} strokeDasharray="2.6 2.2" opacity={0.95} />
      <circle cx="75" cy="75" r="45" fill={`url(#${uid}-green)`} stroke="#E3C25C" strokeWidth={1.6} />
      <circle cx="75" cy="75" r="41.5" fill="none" stroke="#C9A227" strokeWidth={0.7} opacity={0.65} />
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

export interface CertificateCardProps {
  domId?: string;
  innerDomId?: string;
  recipientName: string;
  programName: string;
  certificateId: string;
  issueDate: number;
  signatureUrl?: string | null;
  previewMode?: boolean;
  exportMode?: boolean;
}

export function CertificateCard({
  domId,
  innerDomId,
  recipientName,
  programName,
  certificateId,
  issueDate,
  signatureUrl,
  previewMode,
  exportMode,
}: CertificateCardProps) {
  const issued = new Date(issueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      id={domId}
      className="relative select-none rounded-2xl overflow-hidden shadow-2xl"
      style={{
        width: `${CERT_CANONICAL_WIDTH}px`,
        height: `${CERT_CANONICAL_HEIGHT}px`,
        maxWidth: `${CERT_CANONICAL_WIDTH}px`,
        maxHeight: `${CERT_CANONICAL_HEIGHT}px`,
        background: `linear-gradient(145deg, #0A3222 0%, #06231A 50%, #0A3222 100%)`,
        boxShadow: "0 10px 35px -5px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* Bottom Corner Angled Gold Ribbons */}
      <div
        aria-hidden
        className="absolute -left-20 -bottom-16 w-64 h-28 -rotate-[28deg] pointer-events-none opacity-90"
        style={{
          background: "linear-gradient(100deg, #8f6b12 0%, #D4AF37 35%, #F5E6A8 50%, #D4AF37 65%, #8f6b12 100%)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-20 -bottom-16 w-64 h-28 rotate-[28deg] pointer-events-none opacity-90"
        style={{
          background: "linear-gradient(260deg, #8f6b12 0%, #D4AF37 35%, #F5E6A8 50%, #D4AF37 65%, #8f6b12 100%)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
      />

      {/* Ribbon Pennant Badge (top-left) */}
      <RibbonBadge />

      {/* Inner White/Ivory Card with Gold Borders */}
      <div
        id={innerDomId}
        className="absolute inset-[15px] bg-[#FCFBF9] rounded-xl flex flex-col justify-between overflow-hidden"
        style={{
          boxShadow: "inset 0 0 0 1.5px #D4AF37, 0 0 0 1px rgba(212,175,55,0.4), inset 0 0 35px rgba(212,175,55,0.04)",
        }}
      >
        {/* Subtle decorative inner border line */}
        <div
          className="absolute inset-[6px] rounded-lg pointer-events-none"
          style={{
            border: "1px solid rgba(201, 162, 39, 0.45)",
          }}
        />

        {/* 4 Corner Ornaments */}
        <CornerAccents />

        {/* ================= UPPER SECTION: HEADER & TITLES ================= */}
        <div className="pt-7 px-12 text-center relative z-0">
          {/* Logo & Brand Wordmark */}
          <div className="flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zetagrow logo no bg.png"
              alt="ZetaGrow logo"
              className="w-10 h-10 rounded-xl object-contain drop-shadow-sm"
              crossOrigin="anonymous"
            />
            <span
              className="text-[30px] font-extrabold tracking-tight"
              style={{ color: GREEN, letterSpacing: "-0.02em" }}
            >
              ZetaGrow
            </span>
          </div>

          {/* Title: CERTIFICATE OF COMPLETION */}
          <div className="mt-3">
            <h1
              className={`${serifFont.className} font-semibold text-[46px] leading-none tracking-[0.18em]`}
              style={{ color: GREEN }}
            >
              CERTIFICATE
            </h1>
            <div className="flex items-center justify-center gap-3.5 mt-2">
              <span
                aria-hidden
                className="h-[1.5px] w-24"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }}
              />
              <span
                className="text-[11px] font-bold tracking-[0.42em] uppercase"
                style={{ color: GREEN }}
              >
                OF COMPLETION
              </span>
              <span
                aria-hidden
                className="h-[1.5px] w-24"
                style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
              />
            </div>
          </div>
        </div>

        {/* ================= MIDDLE SECTION: RECIPIENT & COURSE ================= */}
        <div className="text-center px-12 -mt-1 relative z-0">
          <p className="text-[13.5px] font-medium text-neutral-600">
            This is to certify that
          </p>

          {/* Recipient Name in Calligraphy Font */}
          <p
            className={`${scriptFont.className} text-[58px] leading-[1.1] my-0.5`}
            style={{ color: "#124E38" }}
          >
            {recipientName}
          </p>

          {/* Gold separator accent */}
          <div
            aria-hidden
            className="mx-auto h-[1.5px] w-72"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />

          <p className="text-[12.5px] font-medium text-neutral-600 mt-3">
            has successfully completed the program
          </p>
          <p
            className="text-[25px] font-extrabold mt-0.5 tracking-tight"
            style={{ color: GREEN }}
          >
            {programName}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1 max-w-md mx-auto leading-relaxed">
            including all modules, lessons, and assessments
            <br />
            as per the program curriculum.
          </p>
        </div>

        {/* ================= FOOTER SECTION: SIGNATURE, SEAL, DATE ================= */}
        <div className="px-16 grid grid-cols-3 items-end gap-6 mb-2 relative z-0">
          {/* Signature Column */}
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signatureUrl || "/kunal-singh-signature.png"}
              alt="CEO signature"
              className="h-14 w-auto object-contain mx-auto"
              crossOrigin="anonymous"
            />
            <div className="h-[1px] bg-neutral-400 w-44 mx-auto mt-1.5" />
            <p
              className="text-[11px] font-extrabold tracking-wider mt-1.5 uppercase"
              style={{ color: GREEN }}
            >
              KUNAL SINGH
            </p>
            <p className="text-[10px] text-neutral-500 font-medium">CEO, ZetaGrow</p>
          </div>

          {/* 3D Gold Seal Column */}
          <div className="flex justify-center -mb-2">
            <GoldSeal size={114} />
          </div>

          {/* Date of Completion Column */}
          <div className="text-center">
            <p className="text-[16px] font-bold text-neutral-800 leading-none">
              {issued}
            </p>
            <div className="h-[1px] bg-neutral-400 w-44 mx-auto mt-2" />
            <p className="text-[9.5px] font-bold tracking-[0.22em] mt-1.5 text-neutral-500 uppercase">
              DATE OF COMPLETION
            </p>
          </div>
        </div>

        {/* ================= BOTTOM MARGIN BAR: ID & VERIFY URL ================= */}
        <div className="h-10 px-8 bg-transparent flex items-center justify-between border-t border-neutral-200/60 relative z-0 text-neutral-700">
          <div className="text-[11px] font-semibold tracking-wide">
            <span className="text-neutral-500 font-normal">ID: </span>
            <span className="font-mono font-bold" style={{ color: GREEN }}>
              {certificateId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
            <p className="text-[10px] text-neutral-600 leading-tight">
              Verify this certificate online at{" "}
              <span className="font-bold" style={{ color: GREEN }}>
                zetagrow.in/verify
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
