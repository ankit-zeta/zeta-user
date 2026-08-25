"use client";

import React, { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Trophy, CheckCircle2, Lock, Zap } from "lucide-react";

const METRIC_LABELS: Record<string, string> = {
  valid_referrals: "Direct referrals",
  affiliate_sales: "Affiliate sales",
  total_sales_amount: "Referral volume (₹)",
  completed_jobs: "Completed jobs",
  approved_jobs: "Approved jobs",
  completed_programs: "Programs completed",
  total_earnings: "Total earned (₹)",
};

export default function AffiliateAchievementsPage() {
  const { token } = useAuth();
  const achievements = useQuery(
    api.achievements.getUserAchievements,
    token ? { token } : "skip"
  );

  const evaluateMutation = useMutation(api.achievements.evaluateUserAchievements);

  useEffect(() => {
    if (token) {
      evaluateMutation({ token }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const unlockedCount = useMemo(
    () => (achievements || []).filter((a) => a.isUnlocked).length,
    [achievements]
  );

  return (
    <div className="space-y-8 text-neutral-100">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Milestone Achievements</h1>
        <p className="text-xs text-neutral-400">
          Unlock badges and positions — each milestone boosts your chain commission level.
        </p>
      </div>

      {/* Progress summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-brand-700 bg-gradient-to-br from-brand-900/50 to-[#0F1412] p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-none">
              {unlockedCount}
              <span className="text-sm font-semibold text-neutral-500"> / {(achievements || []).length}</span>
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Unlocked</p>
          </div>
        </div>
        <StatBox label="Referral Sales" value={String(achievements?.[0]?.metrics?.affiliate_sales ?? 0)} />
        <StatBox
          label="Referral Volume"
          value={`₹${(achievements?.[0]?.metrics?.total_sales_amount ?? 0).toLocaleString("en-IN")}`}
        />
      </div>

      {/* Achievements grid */}
      {achievements === undefined ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-800 rounded-2xl"></div>
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-12 text-center space-y-3">
          <Zap className="w-10 h-10 text-neutral-700 mx-auto" />
          <h3 className="text-sm font-semibold">No Achievements Configured</h3>
          <p className="text-xs text-neutral-500">Check back soon for milestone programs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {achievements.map((ach) => (
            <div
              key={ach._id}
              className={`rounded-2xl border p-6 space-y-4 ${
                ach.isUnlocked
                  ? "border-green-800 bg-gradient-to-br from-green-950/40 to-[#0F1412]"
                  : "border-neutral-800 bg-[#0F1412]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      ach.isUnlocked ? "bg-green-900 text-green-400" : "bg-neutral-800 text-neutral-500"
                    }`}
                  >
                    {ach.isUnlocked ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate">{ach.name}</h3>
                    {ach.positionName && (
                      <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                        Title: {ach.positionName}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-lg font-extrabold shrink-0">{ach.progress}%</span>
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">{ach.description}</p>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${ach.isUnlocked ? "bg-green-500" : "bg-brand-500"}`}
                  style={{ width: `${ach.progress}%` }}
                />
              </div>

              {/* Conditions */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                {ach.conditionProgress.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className={c.satisfied ? "text-green-400" : "text-neutral-500"}>
                      {c.satisfied ? "✓" : "•"} {METRIC_LABELS[c.metric] || c.metric}:{" "}
                      {c.metric.includes("amount") || c.metric.includes("earnings")
                        ? `₹${c.current.toLocaleString("en-IN")} / ₹${c.target.toLocaleString("en-IN")}`
                        : `${c.current} / ${c.target}`}
                    </span>
                  </div>
                ))}
                {!ach.isUnlocked && ach.remaining > 0 && (
                  <p className="text-[10px] text-neutral-600 pt-1">{ach.remaining} step{ach.remaining === 1 ? "" : "s"} to go</p>
                )}
              </div>

              {ach.isUnlocked && ach.unlockedAt && (
                <p className="text-[10px] text-green-500">
                  Unlocked {new Date(ach.unlockedAt).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
        {label}
      </span>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
