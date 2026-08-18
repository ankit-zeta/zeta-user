"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { CreditCard, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function EarningsLedgerPage() {
  const { token } = useAuth();
  const stats = useQuery(
    api.affiliates.getUserAffiliateStats,
    token ? { token } : "skip"
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Affiliate Earnings & Commission Ledger
          </h1>
          <p className="text-xs text-textMuted">
            Comprehensive audit log of every commission event and calculation rule used.
          </p>
        </div>
        <Link href="/dashboard/withdrawals" className="btn-primary text-xs py-1.5 px-3">
          Wallet & Withdrawals
        </Link>
      </div>

      <div className="card-surface p-6 space-y-4">
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
