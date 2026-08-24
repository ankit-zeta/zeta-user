"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Users, CheckCircle2, CircleDashed, ArrowLeft } from "lucide-react";
import AffiliateGate from "@/components/AffiliateGate";

function ReferralsListPageContent() {
  const { token } = useAuth();
const referrals = useQuery(
    api.referrals.getUserReferrals,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    createdAt: number;
    status: string;
    user: {
      name: string;
      email: string;
      avatarUrl: string | undefined;
      createdAt: number;
    } | null;
    hasPurchased: boolean;
    purchaseCount: number;
    totalPurchasedAmount: number;
  }> | undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Direct Referrals & Network
          </h1>
          <p className="text-xs text-textMuted">
            Users registered with your referral link and their qualification status.
          </p>
        </div>
        <Link href="/dashboard/affiliate" className="btn-secondary text-xs py-1.5 px-3">
          Affiliate Center
        </Link>
      </div>

      <div className="card-surface p-6 space-y-4">
        {referrals === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Users className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-textMain">No Referrals Recorded</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              When peers sign up using your referral link, they will appear in this directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Registration Date</th>
                  <th className="py-2.5 px-3 font-semibold">Program Purchases</th>
                  <th className="py-2.5 px-3 font-semibold">Total Value</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {referrals.map((r) => (
                  <tr key={r._id}>
                    <td className="py-3 px-3 font-medium text-textMain">
                      {r.user?.name || "Member"}
                    </td>
                    <td className="py-3 px-3 text-textMuted">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-textMain">
                      {r.purchaseCount} Programs
                    </td>
                    <td className="py-3 px-3 font-semibold text-textMain">
                      ₹{r.totalPurchasedAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3">
                      {r.hasPurchased ? (
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Qualifying
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CircleDashed className="w-3 h-3" />
                          Registered
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

export default function ReferralsListPage() {
  return (
    <AffiliateGate>
      <ReferralsListPageContent />
    </AffiliateGate>
  );
}
