"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Zap, CheckCircle2, Lock, Award } from "lucide-react";

export default function AchievementsPage() {
  const { token } = useAuth();
  const achievements = useQuery(
    api.achievements.getUserAchievements,
    token ? { token } : "skip"
  );

  const evaluateMutation = useMutation(api.achievements.evaluateUserAchievements);

  // Automatically evaluate on mount
  useEffect(() => {
    if (token) {
      evaluateMutation({ token }).catch(console.error);
    }
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Milestone Achievements & Positions
        </h1>
        <p className="text-xs text-textMuted">
          Configurable platform milestones that unlock priority opportunity matching, titles, and verified badges.
        </p>
      </div>

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
                  ? "bg-white border-2 border-brand-300 shadow-sm"
                  : "bg-neutral-50/70 border-borderSubtle opacity-85"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    ach.isUnlocked ? "bg-brand-50 text-brand-600" : "bg-neutral-200 text-neutral-500"
                  }`}>
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
                      Locked
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-textMain">{ach.name}</h3>
                  <p className="text-xs text-textMuted leading-relaxed mt-1">{ach.description}</p>
                </div>

                <div className="pt-2 space-y-1.5 border-t border-borderSubtle">
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">
                    Criteria ({ach.conditionMode} Conditions Required):
                  </span>
                  <ul className="space-y-1 text-xs text-textMuted">
                    {ach.conditions.map((cond, idx) => (
                      <li key={idx} className="font-mono text-[11px]">
                        • {cond.metric.replace(/_/g, " ")} {cond.operator} {cond.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {ach.unlockBadgeName && (
                <div className="pt-3 border-t border-borderSubtle text-[11px] text-brand-700 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Unlocks: {ach.unlockBadgeName}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
