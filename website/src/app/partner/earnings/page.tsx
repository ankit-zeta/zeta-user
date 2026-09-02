"use client";

import React from "react";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { CreditCard } from "lucide-react";

export default function PartnerEarningsPage() {
  const { token } = useAuth();
  const stats = useQuery(api.affiliates.getUserAffiliateStats, token ? { token } : "skip");

  return (
    <div className="space-y-8 text-neutral-100">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Earnings Ledger</h1>
        <p className="text-xs text-neutral-400">
          Immutable record of every earning generated from your partner link.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        {stats === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-800 rounded w-1/3 mx-auto"></div>
          </div>
        ) : (stats.sales?.length ?? 0) === 0 && (stats.chainSales?.length ?? 0) === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CreditCard className="w-10 h-10 text-neutral-700 mx-auto" />
            <h3 className="text-sm font-semibold">No Earnings Records Yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Earnings from qualifying purchases via your partner link will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Direct sales */}
            {(stats.sales?.length ?? 0) > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-3">
                  Direct Partner Sales
                </h3>
                <LedgerTable rows={stats.sales} showBuyer />
              </div>
            )}

            {/* Team remuneration */}
            {(stats.chainSales?.length ?? 0) > 0 && (
              <div className="pt-4 border-t border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-3 mt-4">
                  Team Remuneration
                </h3>
                <LedgerTable rows={stats.chainSales} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LedgerTable({
  rows,
  showBuyer = true,
}: {
  rows: Array<{
    _id: string;
    buyerName?: string;
    programName: string;
    saleAmount: number;
    commissionAmount: number;
    ruleUsed?: string;
    status: string;
    createdAt: number;
    chainLevel?: number | undefined;
  }>;
  showBuyer?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-500">
            {showBuyer && <th className="py-2.5 px-3 font-semibold">Customer</th>}
            <th className="py-2.5 px-3 font-semibold">Program</th>
            <th className="py-2.5 px-3 font-semibold">Order</th>
            <th className="py-2.5 px-3 font-semibold">Commission</th>
            <th className="py-2.5 px-3 font-semibold">Rule</th>
            <th className="py-2.5 px-3 font-semibold">Status</th>
            <th className="py-2.5 px-3 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {rows.map((sale) => (
            <tr key={sale._id}>
              {showBuyer && (
                <td className="py-3 px-3 font-medium">{sale.buyerName || "—"}</td>
              )}
              <td className="py-3 px-3 text-neutral-400">{sale.programName}</td>
              <td className="py-3 px-3 font-semibold">
                ₹{sale.saleAmount.toLocaleString("en-IN")}
              </td>
              <td className="py-3 px-3 text-green-400 font-bold">
                ₹{sale.commissionAmount.toLocaleString("en-IN")}
                {sale.chainLevel ? (
                  <span className="text-[9px] text-neutral-500 ml-1">L{sale.chainLevel}</span>
                ) : null}
              </td>
              <td className="py-3 px-3 text-[11px] text-neutral-500 max-w-[180px] truncate">
                {sale.ruleUsed || "—"}
              </td>
              <td className="py-3 px-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    sale.status === "available" || sale.status === "approved"
                      ? "bg-green-950 text-green-400"
                      : sale.status === "pending"
                      ? "bg-amber-950 text-amber-400"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {sale.status}
                </span>
              </td>
              <td className="py-3 px-3 text-neutral-500">
                {new Date(sale.createdAt).toLocaleDateString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
