"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  BookOpen,
  Briefcase,
  Wallet,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import BannerCarousel from "@/components/BannerCarousel";

export default function DashboardOverviewPage() {
  const { user, token } = useAuth();

  const enrolledCount = user?.enrolledProgramIds?.length || 0;

  const jobsWithEligibility = useQuery(
    api.jobs.getJobsWithEligibility,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    _creationTime: number;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    category: string;
    skills: string[];
    requirements: string[];
    requiredProgramId: string | undefined;
    requiredAchievementId: string | undefined;
    payment: number;
    paymentType: string;
    workType: string;
    difficulty: string;
    estimatedDuration: string;
    deadline: string;
    openings: number;
    status: string;
    applicationQuestions: string[];
    attachments: string[] | undefined;
    company: string | undefined;
    coverImageStorageId: string | undefined;
    createdAt: number;
    updatedAt: number;
    coverImageUrl: string | null;
    isEligible: boolean;
    missingRequirements: string[];
    requiredProgramName: string | undefined;
    requiredAchievementName: string | undefined;
    applicationStatus: string | null;
  }> | undefined;

  const publicPrograms = useQuery(api.programs.getPublicPrograms) as Array<{
    _id: string;
    _creationTime: number;
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    compareAtPrice: number | undefined;
    status: string;
    thumbnail: string;
    bannerImage: string | undefined;
    duration: string;
    accessDuration: string;
    certificateEnabled: boolean;
    affiliateEnabled: boolean;
    format: string | undefined;
    category: string | undefined;
    sortOrder: number;
    whatIncluded: string[];
    outcomes: string[];
    faqs: Array<{ question: string; answer: string }>;
    createdAt: number;
    updatedAt: number;
  }> | undefined;

  // Work-only figures — partner money lives in the Partner Center
  const workEarnings = user?.wallet?.workEarnings || 0;
  const totalWithdrawn = user?.wallet?.totalWithdrawn || 0;

  const eligibleJobs = jobsWithEligibility?.filter((j) => j.isEligible) || [];
  const allJobs = jobsWithEligibility || [];
  const displayJobs = eligibleJobs.length > 0 ? eligibleJobs : allJobs;

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
            Track your course progress, client project deliverables, and work payouts.
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

      {/* Banner Carousel */}
      <BannerCarousel targetPage="work" />

      {/* 2. Key Metrics Row — work & learning only */}
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
            <span className="text-xs font-semibold uppercase tracking-wider">Work Earnings</span>
            <Wallet className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-brand-700">
            ₹{workEarnings.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">From completed client projects</span>
        </div>

        <div className="card-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Withdrawn</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{totalWithdrawn.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Completed payouts</span>
        </div>

        <div className="card-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-xs font-semibold uppercase tracking-wider">Eligible Work</span>
            <Briefcase className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-textMain">{allJobs.length}</p>
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
            {displayJobs.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg p-6 space-y-2">
                <p className="text-xs text-textMuted">No work opportunities available yet. Check back soon!</p>
              </div>
            ) : (
              displayJobs.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  className="p-3.5 rounded-lg border border-borderSubtle hover:border-brand-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {job.category}
                      </span>
                      {!job.isEligible && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Requires Program
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-textMain mt-1">{job.title}</h4>
                    <span className="text-[11px] text-textMuted">
                      Payout: <strong>₹{job.payment.toLocaleString("en-IN")}</strong>
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/work/${job.slug || job._id}`}
                    className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                  >
                    View &amp; Apply
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
