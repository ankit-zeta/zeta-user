"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  TrendingUp,
  Users,
  Wallet,
  Copy,
  Check,
  Link2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Crown
} from "lucide-react";
import BannerCarousel from "@/components/BannerCarousel";

export default function PartnerOverviewPage() {
  const { user, token } = useAuth();
  const [copied, setCopied] = useState(false);

  const stats = useQuery(api.affiliates.getUserAffiliateStats, token ? { token } : "skip");
  const walletData = useQuery(api.wallets.getUserWallet, token ? { token } : "skip");

  // Check if user is a Growth Partner
  const isGrowthPartner = !!(user as any)?.partnerTier;

  const partnerProfile = useQuery(
    api.partners.getMyPartnerProfile,
    token && isGrowthPartner ? { token } : "skip"
  ) as
    | { isPartner: boolean; tierName: string | null; chainPct: number; partnerSince: number | null }
    | undefined;

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${user?.referralCode}`
      : `https://zetagrow.in/signup?ref=${user?.referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available or denied — fail silently
    }
  };

  // KYC gate messaging — commissions accrue but stay on hold until verified
  const kycStatus = (user as any)?.kycStatus || "not_submitted";
  const kycPending = kycStatus === "not_submitted";
  const kycUnderReview = kycStatus === "pending";
  const kycRejected = kycStatus === "rejected";

  if (stats === undefined || walletData === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
        <div className="h-32 bg-neutral-800 rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const wallet = walletData.wallet;

  return (
    <div className="space-y-8 text-neutral-100">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Partner Overview</h1>
        <p className="text-xs text-neutral-400">
          Track your partner performance, earnings and payout status in one place.
        </p>
      </div>

      {/* Banner Carousel */}
      <BannerCarousel targetPage="affiliate" />

      {/* KYC gate banner */}
      {kycStatus !== "verified" && (
        <Link
          href="/dashboard/kyc"
          className={`block rounded-2xl border p-4 flex items-center gap-4 transition-colors ${
            kycUnderReview
              ? "border-blue-800 bg-blue-950/30 hover:bg-blue-950/50"
              : "border-amber-800 bg-amber-950/20 hover:bg-amber-950/40"
          }`}
        >
          {kycUnderReview ? (
            <Clock className="w-6 h-6 text-blue-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-neutral-100">
              {kycUnderReview
                ? "KYC under review — payouts temporarily on hold"
                : kycRejected
                  ? "KYC rejected — resubmit to unlock payouts"
                  : "Complete your KYC to unlock payouts"}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {kycUnderReview
                ? "Your earnings keep accruing and release automatically once verification is approved (24-48 hrs)."
                : "Your partner link keeps working, but earnings stay on hold until your PAN & Aadhaar are verified."}
            </p>
          </div>
          {!kycUnderReview && (
            <span className="btn-primary text-[11px] py-2 px-3 shrink-0 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Verify Now
            </span>
          )}
        </Link>
      )}

      {/* Partner link card */}
      <div className="rounded-2xl border border-brand-800 bg-gradient-to-br from-brand-900/40 to-[#0F1412] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Your Unique Partner Link
            </span>
            <p className="text-xs text-neutral-400">
              Share this link — earn up to 50% remuneration on qualifying program sales.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-300 bg-brand-950 border border-brand-800 px-3 py-1 rounded-lg">
            Code: {user?.referralCode}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-neutral-800">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent text-xs text-neutral-200 px-2 font-mono focus:outline-none"
          />
          <button
            onClick={copyLink}
            className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Total Referrals"
          value={String(stats?.totalReferrals ?? 0)}
          sub="People joined via your link"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total Sales"
          value={String(stats?.totalSalesCount ?? 0)}
          sub="Qualifying program purchases"
        />
        <StatCard
          icon={<Wallet className="w-4 h-4" />}
          label="Available Earnings"
          value={`₹${(wallet?.affiliateEarnings || 0).toLocaleString("en-IN")}`}
          sub={`${stats?.pendingCommissions ? `₹${stats.pendingCommissions.toLocaleString("en-IN")} pending` : "Nothing pending"}`}
          highlight
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Pending Earnings"
          value={`₹${(stats?.pendingCommissions ?? 0).toLocaleString("en-IN")}`}
          sub="In holding period"
        />
      </div>

      {/* Quick summary rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent direct sales */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Recent Sales</h3>
            <Link
              href="/partner/earnings"
              className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              Full ledger <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {(stats?.sales?.length ?? 0) === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">
              No earnings records yet. Share your partner link to start earning.
            </p>
          ) : (
            <div className="space-y-2.5">
              {stats!.sales.slice(0, 5).map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{s.buyerName}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{s.programName}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-bold text-green-400">
                      +₹{s.commissionAmount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-neutral-500 capitalize">{s.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team remuneration + milestones teaser — Growth Partners only */}
        {isGrowthPartner && partnerProfile?.isPartner && (
          <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" /> Team Remuneration
              </h3>
              <Link
                href="/partner/achievements"
                className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                Milestones <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label="Team remuneration"
                value={`₹${(stats?.chainEarnings ?? 0).toLocaleString("en-IN")}`}
              />
              <MiniStat
                label="Pending team"
                value={`₹${(stats?.pendingChainCommissions ?? 0).toLocaleString("en-IN")}`}
              />
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed pt-2 border-t border-neutral-800">
              Earn extra % when your referred partners make their own sales — unlock higher team
              remuneration tiers through milestone achievements. Your team remuneration rate: {partnerProfile.chainPct}%.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 space-y-2 border ${
        highlight
          ? "border-brand-700 bg-gradient-to-br from-brand-900/50 to-[#0F1412]"
          : "border-neutral-800 bg-[#0F1412]"
      }`}
    >
      <span
        className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          highlight ? "text-brand-300" : "text-neutral-400"
        }`}
      >
        {icon} {label}
      </span>
      <p className={`text-2xl font-extrabold ${highlight ? "text-white" : "text-neutral-100"}`}>
        {value}
      </p>
      <span className="text-[11px] text-neutral-500 block">{sub}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/30 border border-neutral-800 p-3 space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-base font-bold text-neutral-100">{value}</p>
    </div>
  );
}
