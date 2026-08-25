"use client";

import React from "react";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Wallet, Landmark, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function AffiliateWalletPage() {
  const { token } = useAuth();
  const walletData = useQuery(api.wallets.getUserWallet, token ? { token } : "skip");
  const withdrawals = useQuery(api.withdrawals.getUserWithdrawals, token ? { token } : "skip");

  if (walletData === undefined || withdrawals === undefined) {
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
  const affiliateTxns = (walletData.transactions || []).filter(
    (t) => t.type === "AFFILIATE_COMMISSION" || t.type === "CHAIN_COMMISSION" || t.type === "WITHDRAWAL"
  );

  return (
    <div className="space-y-8 text-neutral-100">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Wallet &amp; Payouts</h1>
        <p className="text-xs text-neutral-400">
          Your affiliate commission balance, payout requests and full transaction history.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-brand-700 bg-gradient-to-br from-brand-900/50 to-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-brand-300">
            <Wallet className="w-3.5 h-3.5" /> Affiliate Earnings
          </span>
          <p className="text-2xl font-extrabold">
            ₹{(wallet?.affiliateEarnings || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-neutral-500 block">Lifetime commission earned</span>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
            <Landmark className="w-3.5 h-3.5" /> Total Withdrawn
          </span>
          <p className="text-2xl font-extrabold">
            ₹{(wallet?.totalWithdrawn || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-neutral-500 block">Completed payouts</span>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
            <ArrowUpRight className="w-3.5 h-3.5" /> Payout Requests
          </span>
          <p className="text-2xl font-extrabold">{withdrawals.length}</p>
          <span className="text-[11px] text-neutral-500 block">
            {withdrawals.filter((w) => ["requested", "under_review", "approved", "processing"].includes(w.status)).length} in progress
          </span>
        </div>
      </div>

      {/* Payout requests */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        <h3 className="text-sm font-bold">Payout Requests</h3>
        {withdrawals.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">
            No payout requests yet. Request a withdrawal once commissions clear the holding period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Method</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td className="py-3 px-3 font-bold">₹{w.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-neutral-400 capitalize">
                      {w.payoutMethod.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          w.status === "completed"
                            ? "bg-green-950 text-green-400"
                            : w.status === "rejected"
                            ? "bg-red-950 text-red-400"
                            : "bg-amber-950 text-amber-400"
                        }`}
                      >
                        {w.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-500">
                      {new Date(w.requestedAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-neutral-600 pt-2 border-t border-neutral-800">
          To request a payout, contact support or use the withdrawal flow — minimum ₹1,000.
        </p>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        <h3 className="text-sm font-bold">Transaction History</h3>
        {affiliateTxns.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {affiliateTxns.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between py-2.5 border-b border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.amount > 0 ? "bg-green-950 text-green-400" : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{tx.description}</p>
                    <p className="text-[10px] text-neutral-500">
                      {tx.type.replace(/_/g, " ")} ·{" "}
                      {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p
                    className={`text-sm font-bold ${
                      tx.amount > 0 ? "text-green-400" : "text-neutral-200"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-neutral-500 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
