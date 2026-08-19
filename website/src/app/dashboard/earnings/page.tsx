"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { CreditCard, TrendingUp, Clock, CheckCircle2, AlertCircle, Briefcase, Share2, Wallet, Landmark } from "lucide-react";

export default function EarningsLedgerPage() {
  const { token } = useAuth();
  const stats = useQuery(
    api.affiliates.getUserAffiliateStats,
    token ? { token } : "skip"
  );
  const walletData = useQuery(
    api.wallets.getUserWallet,
    token ? { token } : "skip"
  );

  const wallet = walletData?.wallet;
  const workTxns = (walletData?.transactions || []).filter((t) => t.type === "WORK_PAYOUT");
  const affiliateTxns = (walletData?.transactions || []).filter((t) => t.type === "AFFILIATE_COMMISSION");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Earnings & Wallet
          </h1>
          <p className="text-xs text-textMuted">
            Every rupee you earn — from work projects and affiliate commissions — lands in your wallet, tracked by source.
          </p>
        </div>
        <Link href="/dashboard/withdrawals" className="btn-primary text-xs py-1.5 px-3">
          Wallet & Withdrawals
        </Link>
      </div>

      {/* Source breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-6 space-y-1 bg-white border-2 border-brand-200">
          <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">Available Balance</span>
          <p className="text-2xl font-extrabold text-brand-700">
            ₹{(wallet?.availableBalance || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Ready to withdraw</span>
        </div>
        <div className="card-surface p-6 space-y-1">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Work Earnings
          </span>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{(wallet?.workEarnings || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">
            {workTxns.length} payout{workTxns.length === 1 ? "" : "s"} from completed projects
          </span>
        </div>
        <div className="card-surface p-6 space-y-1">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
            <Share2 className="w-3 h-3" /> Affiliate Earnings
          </span>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{(wallet?.affiliateEarnings || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">
            {affiliateTxns.length} approved commission{affiliateTxns.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="card-surface p-6 space-y-1">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
            <Landmark className="w-3 h-3" /> Total Withdrawn
          </span>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{(wallet?.totalWithdrawn || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Completed payouts</span>
        </div>
      </div>

      {/* Wallet ledger by source */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-textMain">Wallet Ledger by Source</h3>
        {walletData?.transactions && walletData.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted">
                  <th className="py-2.5 px-3 font-semibold">Source</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Balance After</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {walletData.transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        tx.type === "WORK_PAYOUT"
                          ? "bg-blue-100 text-blue-800"
                          : tx.type === "AFFILIATE_COMMISSION"
                          ? "bg-purple-100 text-purple-800"
                          : tx.type === "WITHDRAWAL"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {tx.type === "WORK_PAYOUT" ? "Work" : tx.type === "AFFILIATE_COMMISSION" ? "Affiliate" : tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-textMain">{tx.description}</td>
                    <td className={`py-3 px-3 font-bold ${tx.amount > 0 ? "text-green-700" : "text-textMain"}`}>
                      {tx.amount > 0 ? `+₹${tx.amount.toLocaleString("en-IN")}` : `-₹${Math.abs(tx.amount).toLocaleString("en-IN")}`}
                    </td>
                    <td className="py-3 px-3 font-semibold text-textMuted">₹{tx.balanceAfter.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase font-bold text-neutral-500">{tx.status}</span>
                    </td>
                    <td className="py-3 px-3 text-textMuted">{new Date(tx.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-textMuted">
            No wallet activity yet. Earnings from work payouts and affiliate commissions appear here.
          </div>
        )}
      </div>

      {/* Affiliate commission ledger */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-textMain">
          Affiliate Commission Ledger
        </h3>
        {stats?.sales === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : stats.sales.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CreditCard className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-textMain">No Commission Records Yet</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              Commissions generated from your referral links will appear in this immutable ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted">
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Program</th>
                  <th className="py-2.5 px-3 font-semibold">Order Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Commission</th>
                  <th className="py-2.5 px-3 font-semibold">Calculation Rule Applied</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {stats.sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="py-3 px-3 font-medium text-textMain">{sale.buyerName}</td>
                    <td className="py-3 px-3 text-textMuted">{sale.programName}</td>
                    <td className="py-3 px-3 text-textMain font-semibold">₹{sale.saleAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-brand-700 font-bold">₹{sale.commissionAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-[11px] text-textMuted max-w-xs truncate">{sale.ruleUsed}</td>
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
        )}
      </div>
    </div>
  );
}
