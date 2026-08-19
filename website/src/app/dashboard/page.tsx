"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  BookOpen, 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Link2,
  Zap
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { user, token } = useAuth();
  const [copied, setCopied] = useState(false);

  const affiliateStats = useQuery(
    api.affiliates.getUserAffiliateStats,
    token ? { token } : "skip"
  );

  const jobsWithEligibility = useQuery(
    api.jobs.getJobsWithEligibility,
    token ? { token } : "skip"
  );

  const achievements = useQuery(
    api.achievements.getUserAchievements,
    token ? { token } : "skip"
  );

  const publicPrograms = useQuery(api.programs.getPublicPrograms);

  const evaluateAchievements = useMutation(api.achievements.evaluateUserAchievements);

  // Auto-evaluate achievements so unlocks + progress stay live without a page visit to the achievements tab
  useEffect(() => {
    if (token) {
      evaluateAchievements({ token }).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const enrolledCount = user?.enrolledProgramIds?.length || 0;
  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/signup?ref=${user?.referralCode}`
    : `https://zetagrow.com/signup?ref=${user?.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const eligibleJobs = jobsWithEligibility?.filter((j) => j.isEligible) || [];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-borderSubtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-textMain">
              Welcome back, {user?.name?.split(" ")[0] || "Member"}!
            </h1>
            {user?.position && (
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                {user.position.name}
              </span>
            )}
          </div>
          <p className="text-xs text-textMuted">
            Track your course progress, client project deliverables, and verified earnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/programs" className="btn-secondary text-xs py-2">
            My Programs
          </Link>
          <Link href="/dashboard/work" className="btn-primary text-xs py-2">
            Browse Work
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Programs</span>
            <BookOpen className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-textMain">{enrolledCount}</p>
          <span className="text-[11px] text-textMuted block">Active learning tracks</span>
        </div>

        <div className="card-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Balance</span>
            <Wallet className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-brand-700">
            ₹{(user?.wallet?.availableBalance || 0).toLocaleString("en-IN")}
          </p>
          <Link href="/dashboard/withdrawals" className="text-[11px] text-brand-600 hover:underline">
            Request withdrawal →
          </Link>
        </div>

        <div className="card-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Earnings</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{(user?.wallet?.totalEarned || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Work & Affiliate combined</span>
        </div>

        <div className="card-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-semibold uppercase tracking-wider">Eligible Work</span>
            <Briefcase className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-textMain">{eligibleJobs.length}</p>
          <span className="text-[11px] text-textMuted block">Open opportunities</span>
        </div>
      </div>

      {/* 3. Continue Learning & Recommended Work Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <div className="card-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textMain flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>Continue Learning</span>
            </h3>
            <Link href="/dashboard/programs" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>

          {enrolledCount === 0 ? (
            <div className="text-center py-8 bg-neutral-50 rounded-lg p-6 space-y-3">
              <p className="text-xs text-textMuted">You are not currently enrolled in any curriculum programs.</p>
              <Link href="/programs" className="btn-primary text-xs inline-flex">
                Explore Programs Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {publicPrograms
                ?.filter((p) => user?.enrolledProgramIds?.includes(p._id))
                .slice(0, 2)
                .map((prog) => (
                  <div
                    key={prog._id}
                    className="p-4 rounded-lg border border-borderSubtle bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                        {prog.duration}
                      </span>
                      <h4 className="text-sm font-bold text-textMain">{prog.name}</h4>
                      <p className="text-[11px] text-textMuted line-clamp-1">{prog.shortDescription}</p>
                    </div>

                    <Link
                      href={`/dashboard/learning/${prog._id}`}
                      className="btn-primary text-xs py-1.5 px-3 shrink-0 text-center"
                    >
                      Open Player
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recommended Work Opportunities */}
        <div className="card-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textMain flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600" />
              <span>Recommended Work Opportunities</span>
            </h3>
            <Link href="/dashboard/work" className="text-xs font-medium text-brand-600 hover:underline">
              Browse all
            </Link>
          </div>

          <div className="space-y-3">
            {eligibleJobs.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg p-6 space-y-2">
                <p className="text-xs text-textMuted">Complete your enrolled programs to unlock matching work opportunities.</p>
              </div>
            ) : (
              eligibleJobs.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  className="p-3.5 rounded-lg border border-borderSubtle hover:border-brand-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {job.category}
                    </span>
                    <h4 className="text-xs font-bold text-textMain mt-1">{job.title}</h4>
                    <span className="text-[11px] text-textMuted">
                      Payout: <strong>₹{job.payment.toLocaleString("en-IN")}</strong>
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/work/${job._id}`}
                    className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                  >
                    View & Apply
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Affiliate Quick Link Banner */}
      <div className="card-surface p-6 bg-gradient-to-r from-brand-900 to-brand-800 text-white rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-200 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3 h-3 text-brand-300" />
              Affiliate Referral Partner Link
            </span>
            <h3 className="text-lg font-bold">Your Unique Partner Link</h3>
            <p className="text-xs text-brand-100 max-w-xl">
              Earn 50% performance commission on qualifying program sales generated through your verified referral link.
            </p>
          </div>

          <Link
            href="/dashboard/affiliate"
            className="px-4 py-2 rounded-lg bg-white text-brand-900 font-semibold text-xs hover:bg-neutral-100 transition-colors shrink-0 text-center"
          >
            Affiliate Center
          </Link>
        </div>

        <div className="flex items-center gap-2 max-w-xl bg-brand-950/60 p-2 rounded-lg border border-brand-700/50">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent text-xs text-brand-100 px-2 focus:outline-none font-mono"
          />
          <button
            onClick={copyReferralLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* 5. Achievements Preview */}
      {achievements && achievements.length > 0 && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textMain flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-600" />
              <span>Milestone Achievements</span>
            </h3>
            <Link href="/dashboard/achievements" className="text-xs font-medium text-brand-600 hover:underline">
              View rules & badges
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {achievements.slice(0, 3).map((ach) => (
              <div
                key={ach._id}
                className={`p-4 rounded-lg border text-xs space-y-2 ${
                  ach.isUnlocked
                    ? "bg-brand-50/50 border-brand-200"
                    : ach.progress >= 70
                    ? "border-brand-300 bg-gradient-to-b from-brand-50/60 to-white"
                    : "bg-neutral-50/50 border-borderSubtle opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-textMain">{ach.name}</span>
                  {ach.isUnlocked ? (
                    <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded font-bold">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">
                      {ach.progress >= 70 ? `${ach.progress}% — almost there!` : `${ach.progress}%`}
                    </span>
                  )}
                </div>
                <p className="text-textMuted text-[11px] leading-relaxed">{ach.description}</p>

                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(4, ach.isUnlocked ? 100 : ach.progress)}%`,
                      background: ach.isUnlocked ? "#16a34a" : "#176B4D",
                    }}
                  ></div>
                </div>

                {!ach.isUnlocked && ach.remaining > 0 && (
                  <p className="text-[10px] font-bold text-brand-700">
                    {ach.remaining} step{ach.remaining > 1 ? "s" : ""} to go
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
