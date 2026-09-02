"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Trophy, CheckCircle2, Lock, Zap, Crown, ShieldCheck } from "lucide-react";

const METRIC_LABELS: Record<string, string> = {
  valid_referrals: "Direct referrals",
  affiliate_sales: "Partner sales",
  total_sales_amount: "Referral volume (₹)",
  completed_jobs: "Completed jobs",
  approved_jobs: "Approved jobs",
  completed_programs: "Programs completed",
  total_earnings: "Total earned (₹)",
};

export default function PartnerAchievementsPage() {
  const { user, token } = useAuth();

  // ── Growth Partner gate: invite-only section ──
  const isGrowthPartner = !!(user as any)?.partnerTier;

  const partnerProfile = useQuery(
    api.partners.getMyPartnerProfile,
    token && isGrowthPartner ? { token } : "skip"
  ) as
    | { isPartner: boolean; tierName: string | null; chainPct: number; partnerSince: number | null }
    | undefined;

  const achievements = useQuery(
    api.achievements.getUserAchievements,
    token && isGrowthPartner ? { token } : "skip"
  );

  const evaluateMutation = useMutation(api.achievements.evaluateUserAchievements);

  useEffect(() => {
    if (token && isGrowthPartner) {
      evaluateMutation({ token }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isGrowthPartner]);

  // Non-members see an elegant invitation-only screen (server enforces too)
  if (!isGrowthPartner) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-5 py-16 text-neutral-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/70 flex items-center justify-center mx-auto">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Growth Partner Program</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            This is an invite-only circle of ZetaGrow's most trusted partners — unlocking exclusive
            partnership tiers and team remuneration levels.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-3">
          <ShieldCheck className="w-6 h-6 text-brand-400 mx-auto" />
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Membership is extended personally by the ZetaGrow team based on your impact and consistency.
            Keep growing your referrals and work quality — our team is always watching for exceptional partners.
          </p>
        </div>
        <Link href="/partner" className="btn-secondary text-xs py-2 px-4 inline-block">
          Back to Partner Overview
        </Link>
      </div>
    );
  }

  const unlockedCount = useMemo(
    () => (achievements || []).filter((a) => a.isUnlocked).length,
    [achievements]
  );

  return (
    <div className="space-y-8 text-neutral-100">
      {/* Program header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Growth Partner Program
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-800/70 px-2 py-0.5 rounded-full">
            Invite Only
          </span>
        </div>
        <p className="text-xs text-neutral-400">
          Welcome to the circle, {user?.name?.split(" ")[0]}. Your milestones here upgrade your team
          remuneration level — an earning privilege reserved for partners only.
        </p>
      </div>

      {/* Membership status strip */}
      {partnerProfile?.isPartner && (
        <div className="rounded-2xl border border-amber-800/70 bg-gradient-to-br from-amber-950/30 to-[#0F1412] p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-neutral-100">
                Active Growth Partner · {partnerProfile.tierName || "Level I"}
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Member since{" "}
                {partnerProfile.partnerSince
                  ? new Date(partnerProfile.partnerSince).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/50 border border-amber-900 px-3 py-1.5 rounded-full">
            Team remuneration level: {partnerProfile.chainPct}%
          </span>
        </div>
      )}

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
