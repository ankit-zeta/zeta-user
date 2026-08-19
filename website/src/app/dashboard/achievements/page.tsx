"use client";

import React, { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Zap, CheckCircle2, Lock, Award, Flame, Trophy, TrendingUp } from "lucide-react";

const METRIC_LABELS: Record<string, string> = {
  valid_referrals: "Direct referrals",
  affiliate_sales: "Affiliate sales",
  total_sales_amount: "Referral volume (₹)",
  completed_jobs: "Completed jobs",
  approved_jobs: "Approved jobs",
  completed_programs: "Programs completed",
  total_earnings: "Total earned (₹)",
};

export default function AchievementsPage() {
  const { token } = useAuth();
  const achievements = useQuery(
    api.achievements.getUserAchievements,
    token ? { token } : "skip"
  );

  const evaluateMutation = useMutation(api.achievements.evaluateUserAchievements);

  // Automatically evaluate on mount — unlocks appear the moment criteria are met
  useEffect(() => {
    if (token) {
      evaluateMutation({ token }).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const unlockedCount = useMemo(
    () => (achievements || []).filter((a) => a.isUnlocked).length,
    [achievements]
  );

  const nextMilestone = useMemo(() => {
    const locked = (achievements || []).filter((a) => !a.isUnlocked);
    if (locked.length === 0) return null;
    return locked.reduce((best, a) => (a.progress > best.progress ? a : best), locked[0]);
  }, [achievements]);

  const formatMetric = (metric: string, val: number) => {
    if (metric === "total_sales_amount" || metric === "total_earnings") {
      return `₹${val.toLocaleString("en-IN")}`;
    }
    return `${val}`;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Milestone Achievements & Positions
        </h1>
        <p className="text-xs text-textMuted">
          Every milestone brings you closer to priority opportunities, verified titles, and badges.
        </p>
      </div>

      {/* Progress summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-textMain leading-none">
              {unlockedCount}
              <span className="text-sm font-semibold text-textMuted"> / {(achievements || []).length}</span>
            </p>
            <p className="text-[11px] text-textMuted font-medium mt-0.5">Achievements unlocked</p>
          </div>
        </div>

        <div className="card-surface p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-textMain leading-none">
              {nextMilestone ? `${nextMilestone.progress}%` : "100%"}
            </p>
            <p className="text-[11px] text-textMuted font-medium mt-0.5">
              {nextMilestone ? `toward "${nextMilestone.name}"` : "all milestones reached!"}
            </p>
          </div>
        </div>

        <div className="card-surface p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-textMain leading-none">
              {nextMilestone && nextMilestone.remaining > 0
                ? `${nextMilestone.remaining} step${nextMilestone.remaining > 1 ? "s" : ""}`
                : "0"}
            </p>
            <p className="text-[11px] text-textMuted font-medium mt-0.5">to unlock next milestone</p>
          </div>
        </div>
      </div>

      {/* Next milestone hero */}
      {nextMilestone && (
        <div
          className="rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"
          style={{
            background: nextMilestone.badgeColor
              ? `linear-gradient(135deg, ${nextMilestone.badgeColor}, ${nextMilestone.badgeColor}cc)`
              : "linear-gradient(135deg, #176B4D, #0f4d37)",
          }}
        >
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/10"></div>
          <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/5"></div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Next milestone in your journey
              </span>
              <h2 className="text-xl font-extrabold">{nextMilestone.name}</h2>
              <p className="text-xs text-white/85 max-w-md leading-relaxed">
                {nextMilestone.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {nextMilestone.conditionProgress.map((c: any, idx: number) => (
                  <span
                    key={idx}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      c.satisfied ? "bg-white/25" : "bg-black/25"
                    }`}
                  >
                    {c.satisfied ? "✓ " : ""}
                    {METRIC_LABELS[c.metric] || c.metric}: {formatMetric(c.metric, c.current)} /{" "}
                    {formatMetric(c.metric, c.target)}
                  </span>
                ))}
              </div>

              {nextMilestone.positionName && (
                <p className="text-[11px] font-semibold text-white/90 flex items-center gap-1.5 pt-1">
                  <Award className="w-3.5 h-3.5" />
                  Unlocks the &quot;{nextMilestone.positionName}&quot; title
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 rounded-full bg-white/15 border-4 border-white/30 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-extrabold leading-none">{nextMilestone.progress}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/80 mt-1">complete</p>
                </div>
              </div>
              {nextMilestone.remaining > 0 && (
                <p className="text-[11px] font-bold bg-black/30 px-3 py-1 rounded-full">
                  {nextMilestone.remaining} step{nextMilestone.remaining > 1 ? "s" : ""} to go — keep going!
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-5 h-2.5 bg-black/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${Math.max(4, nextMilestone.progress)}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements === undefined ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface p-6 animate-pulse space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
            </div>
          ))
        ) : achievements.length === 0 ? (
          <div className="col-span-3 card-surface p-12 text-center text-sm text-textMuted">
            No achievement definitions active at this time.
          </div>
        ) : (
          achievements.map((ach) => (
            <div
              key={ach._id}
              className={`card-surface p-6 flex flex-col justify-between space-y-4 transition-all ${
                ach.isUnlocked
                  ? "border-2 shadow-md"
                  : ach.progress >= 70
                  ? "border border-brand-300 bg-gradient-to-b from-brand-50/60 to-white"
                  : "bg-neutral-50/70 border-borderSubtle opacity-90"
              }`}
              style={
                ach.isUnlocked && ach.badgeColor
                  ? { borderColor: `${ach.badgeColor}66`, background: `linear-gradient(180deg, ${ach.badgeColor}0d, #ffffff)` }
                  : undefined
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      ach.isUnlocked
                        ? "text-white"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                    style={ach.isUnlocked && ach.badgeColor ? { background: ach.badgeColor } : undefined}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  {ach.isUnlocked ? (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {ach.progress >= 70 ? "Almost there" : "In progress"}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-textMain">{ach.name}</h3>
                  <p className="text-xs text-textMuted leading-relaxed mt-1">{ach.description}</p>
                </div>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className="text-textMuted uppercase tracking-wider">Progress</span>
                    <span style={{ color: ach.badgeColor || "#176B4D" }}>
                      {ach.isUnlocked ? "100%" : `${ach.progress}%`}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(4, ach.isUnlocked ? 100 : ach.progress)}%`,
                        background: ach.badgeColor || (ach.isUnlocked ? "#16a34a" : "#176B4D"),
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  {ach.conditionProgress.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                        c.satisfied ? "bg-green-50 text-green-800" : "bg-neutral-100 text-textMuted"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {c.satisfied ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {METRIC_LABELS[c.metric] || c.metric}
                      </span>
                      <span className="font-bold">
                        {c.satisfied
                          ? "Done"
                          : `${formatMetric(c.metric, c.current)} / ${formatMetric(c.metric, c.target)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {ach.isUnlocked && (
                <div className="pt-3 border-t border-borderSubtle text-[11px] text-green-700 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    Unlocked{ach.unlockedAt ? ` ${new Date(ach.unlockedAt).toLocaleDateString("en-IN")}` : ""}
                    {ach.positionName ? ` • Title: ${ach.positionName}` : ach.unlockBadgeName ? ` • ${ach.unlockBadgeName}` : ""}
                  </span>
                </div>
              )}

              {!ach.isUnlocked && (ach.positionName || ach.unlockBadgeName) && (
                <div className="pt-3 border-t border-borderSubtle text-[11px] text-brand-700 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Unlocks: {ach.positionName || ach.unlockBadgeName}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}