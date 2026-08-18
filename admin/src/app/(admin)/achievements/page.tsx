"use client";

import React from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Zap, Plus, Award, CheckCircle2, Layers } from "lucide-react";

export default function AdminAchievementsPage() {
  const { token } = useAdminAuth();
  const achievements = useQuery(
    api.achievements.getAllAchievementsAdmin,
    token ? { token } : "skip"
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Achievement Rules & Positions Engine
          </h1>
          <p className="text-xs text-textMuted">
            Design configurable qualification criteria (affiliate sales, jobs completed, course completions) without editing code.
          </p>
        </div>

        <Link href="/achievements/new" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Achievement Rule</span>
        </Link>
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
          <div className="col-span-3 card-surface p-12 text-center text-xs text-textMuted">
            No achievement rules created yet.
          </div>
        ) : (
          achievements.map((ach: any) => (
            <div key={ach._id} className="card-surface p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    Mode: {ach.conditionMode} Conditions
                  </span>
                  <span className="text-xs font-bold text-textMain">
                    {ach.unlockCount} Unlocked Users
                  </span>
                </div>

                <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-600" />
                  <span>{ach.name}</span>
                </h3>

                <p className="text-xs text-textMuted leading-relaxed">{ach.description}</p>

                <div className="space-y-1 pt-2 border-t border-borderSubtle">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Criteria:</span>
                  <ul className="space-y-1 text-xs text-textMuted font-mono">
                    {ach.conditions.map((c: any, idx: number) => (
                      <li key={idx}>
                        • {c.metric.replace(/_/g, " ")} {c.operator} {c.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {ach.positionName && (
                <div className="pt-3 border-t border-borderSubtle text-[11px] text-brand-700 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Unlocks Position: {ach.positionName}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
