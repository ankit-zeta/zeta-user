"use client";

import React from "react";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Users, CheckCircle2, CircleDashed } from "lucide-react";

export default function PartnerReferralsPage() {
  const { token } = useAuth();
  const referrals = useQuery(api.referrals.getUserReferrals, token ? { token } : "skip");

  return (
    <div className="space-y-8 text-neutral-100">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">My Referrals</h1>
        <p className="text-xs text-neutral-400">
          Everyone who registered with your partner link and their qualification status.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        {referrals === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-800 rounded w-1/3 mx-auto"></div>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Users className="w-10 h-10 text-neutral-700 mx-auto" />
            <h3 className="text-sm font-semibold">No Referrals Recorded</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              When peers sign up using your partner link they will appear in this directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Registered</th>
                  <th className="py-2.5 px-3 font-semibold">Purchases</th>
                  <th className="py-2.5 px-3 font-semibold">Total Value</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {referrals.map((r) => (
                  <tr key={r._id}>
                    <td className="py-3 px-3 font-medium">{r.user?.name || "Member"}</td>
                    <td className="py-3 px-3 text-neutral-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-3">{r.purchaseCount} program{r.purchaseCount === 1 ? "" : "s"}</td>
                    <td className="py-3 px-3 font-semibold">
                      ₹{r.totalPurchasedAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3">
                      {r.hasPurchased ? (
                        <span className="text-[10px] font-bold bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Purchased · Earnings Pending
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-900 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CircleDashed className="w-3 h-3" /> Joined via your link
                        </span>
                      )}
                    </td>
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
