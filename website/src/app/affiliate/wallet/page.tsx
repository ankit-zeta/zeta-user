"use client";

import React from "react";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AffiliateWalletPage() {
  const { token, user } = useAuth();
  const walletData = useQuery(api.wallets.getUserWallet, token ? { token } : "skip");
  const stats = useQuery(api.affiliates.getUserAffiliateStats, token ? { token } : "skip");

  if (walletData === undefined || stats === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const wallet = walletData.wallet;
  const affiliateEarnings = wallet?.affiliateEarnings || 0;
  const affiliateTxns = (walletData.transactions || []).filter(
    (t) => t.type === "AFFILIATE_COMMISSION" || t.type === "CHAIN_COMMISSION"
  );

  const pendingCommission = stats.pendingCommissions || 0;
  const chainEarnings = stats.chainEarnings || 0;

  return (
    <div className="space-y-8 text-neutral-100">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Earnings</h1>
        <p className="text-xs text-neutral-400">
          Your referral performance and commission history. Withdrawals are managed from your Work Wallet.
        </p>
      </div>

      {/* Info banner */}
      <a
        href="/dashboard/wallet"
        className="flex items-center gap-3 rounded-xl border border-brand-700 bg-brand-950/40 p-4 hover:bg-brand-950/60 transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Wallet className="w-4 h-4 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-brand-200">
            Withdrawals &amp; payment methods are in your Work Wallet
          </p>
          <p className="text-[11px] text-brand-300/70 mt-0.5">
            Your combined balance (work + affiliate) is available for withdrawal there.
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-brand-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </a>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-brand-700 bg-gradient-to-br from-brand-900/50 to-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-brand-300">
            <Wallet className="w-3.5 h-3.5" /> Total Earned
          </span>
          <p className="text-2xl font-extrabold">
            ₹{affiliateEarnings.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-neutral-500 block">Lifetime affiliate commissions</span>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
          <p className="text-2xl font-extrabold">
            ₹{pendingCommission.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-neutral-500 block">In holding period</span>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
            <Users className="w-3.5 h-3.5" /> Referrals
          </span>
          <p className="text-2xl font-extrabold">{stats.totalReferrals || 0}</p>
          <span className="text-[11px] text-neutral-500 block">
            {stats.totalSalesCount || 0} sale{(stats.totalSalesCount || 0) === 1 ? "" : "s"}
          </span>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
            <TrendingUp className="w-3.5 h-3.5" /> Chain Earnings
          </span>
          <p className="text-2xl font-extrabold">
            ₹{chainEarnings.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-neutral-500 block">Upline commissions</span>
        </div>
      </div>

      {/* Recent affiliate sales */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        <h3 className="text-sm font-bold">Recent Sales</h3>
        {affiliateTxns.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-neutral-600" />
            </div>
            <p className="text-xs text-neutral-500 mb-1">No affiliate sales yet</p>
            <p className="text-[10px] text-neutral-600">
              Share your referral link to start earning commissions.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {affiliateTxns.slice(0, 20).map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between py-2.5 border-b border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-green-950 text-green-400">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{tx.description}</p>
                    <p className="text-[10px] text-neutral-500">
                      {tx.type === "CHAIN_COMMISSION" ? "Chain" : "Direct"} ·{" "}
                      {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-green-400">
                    +₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {tx.status === "completed" ? (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-400" />
                    )}
                    <p className="text-[10px] text-neutral-500 capitalize">{tx.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-3">
        <h3 className="text-sm font-bold">How Affiliate Earnings Work</h3>
        <div className="space-y-2 text-[11px] text-neutral-400 leading-relaxed">
          <p>
            <strong className="text-neutral-200">1. Share your referral link</strong> — friends sign up using your unique link.
          </p>
          <p>
            <strong className="text-neutral-200">2. They purchase a program</strong> — you earn a commission on the sale.
          </p>
          <p>
            <strong className="text-neutral-200">3. Holding period</strong> — commissions are held for 7–30 days for verification.
          </p>
          <p>
            <strong className="text-neutral-200">4. Auto-release</strong> — once cleared, funds move to your available balance automatically.
          </p>
          <p>
            <strong className="text-neutral-200">5. Withdraw</strong> — request a payout from your <a href="/dashboard/wallet" className="text-brand-400 hover:text-brand-300 font-semibold">Work Wallet</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
