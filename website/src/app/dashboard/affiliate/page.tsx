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
  ShieldCheck, 
  Clock, 
  ArrowRight,
  CreditCard 
} from "lucide-react";

export default function AffiliateCenterPage() {
  const { user, token } = useAuth();
  const [copied, setCopied] = useState(false);

  const stats = useQuery(
    api.affiliates.getUserAffiliateStats,
    token ? { token } : "skip"
  );

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${user?.referralCode}`
    : `https://zetagrow.com/signup?ref=${user?.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Affiliate & Referral Partner Center
        </h1>
        <p className="text-xs text-textMuted">
          Monitor your referral performance, sales commissions, and track the transparent 50% lower-program calculation engine.
        </p>
      </div>

      {/* Referral Link Copy Banner */}
      <div className="card-surface p-6 bg-white border-2 border-brand-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Your Unique Referral Link
            </span>
            <p className="text-xs text-textMuted">
              Share this link with peers. Commissions are credited directly to your wallet upon genuine course purchases.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
            Code: {user?.referralCode}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-lg border border-borderSubtle">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent text-xs text-textMain px-2 font-mono focus:outline-none"
          />
          <button
            onClick={copyLink}
            className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5 space-y-1.5">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Total Referrals</span>
          <p className="text-2xl font-extrabold text-textMain">{stats?.totalReferrals || 0}</p>
          <Link href="/dashboard/referrals" className="text-[11px] text-brand-600 hover:underline">
            View referral network →
          </Link>
        </div>

        <div className="card-surface p-5 space-y-1.5">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Qualifying Sales</span>
          <p className="text-2xl font-extrabold text-textMain">{stats?.totalSalesCount || 0}</p>
          <Link href="/dashboard/earnings" className="text-[11px] text-brand-600 hover:underline">
            View sales log →
          </Link>
        </div>

        <div className="card-surface p-5 space-y-1.5">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Pending Commissions</span>
          <p className="text-2xl font-extrabold text-amber-700">
            ₹{(stats?.pendingCommissions || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Holding period active</span>
        </div>

        <div className="card-surface p-5 space-y-1.5">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Available Balance</span>
          <p className="text-2xl font-extrabold text-brand-700">
            ₹{(stats?.availableCommissions || 0).toLocaleString("en-IN")}
          </p>
          <Link href="/dashboard/withdrawals" className="text-[11px] text-brand-600 hover:underline">
            Withdraw funds →
          </Link>
        </div>
      </div>

      {/* Commission Rule Explanation Card */}
      <div className="card-surface p-6 bg-neutral-50/70 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-textMain">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Configurable Commission Calculation Engine</span>
        </div>
        <p className="text-xs text-textMuted leading-relaxed">
          Commissions are calculated as <strong>50% of the lower-priced program</strong> between your highest enrolled curriculum tier and the referee&apos;s purchase. For example: if you hold the ₹4,000 Growth Program and your referral purchases the ₹8,000 Pro Program, commission is 50% of ₹4,000 = ₹2,000.
        </p>
      </div>

      {/* Recent Sales Table */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-textMain">Recent Commission Activity</h3>
          <Link href="/dashboard/earnings" className="text-xs font-medium text-brand-600 hover:underline">
            View full ledger
          </Link>
        </div>

        {stats?.sales && stats.sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted">
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Program</th>
                  <th className="py-2.5 px-3 font-semibold">Sale Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Commission</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {stats.sales.slice(0, 5).map((sale) => (
                  <tr key={sale._id}>
                    <td className="py-3 px-3 font-medium text-textMain">{sale.buyerName}</td>
                    <td className="py-3 px-3 text-textMuted">{sale.programName}</td>
                    <td className="py-3 px-3 text-textMain font-semibold">₹{sale.saleAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-brand-700 font-bold">₹{sale.commissionAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        sale.status === "available" || sale.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : sale.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-textMuted">{new Date(sale.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-textMuted">
            No referral sales recorded yet. Share your partner link to begin earning commissions.
          </div>
        )}
      </div>
    </div>
  );
}
