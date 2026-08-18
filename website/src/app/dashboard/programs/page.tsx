"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { BookOpen, CheckCircle2, ArrowRight, Award } from "lucide-react";

export default function MyProgramsPage() {
  const { user } = useAuth();
  const allPrograms = useQuery(api.programs.getPublicPrograms);

  const enrolledIds = new Set(user?.enrolledProgramIds || []);
  const myEnrolledPrograms = allPrograms?.filter((p) => enrolledIds.has(p._id)) || [];
  const otherPrograms = allPrograms?.filter((p) => !enrolledIds.has(p._id)) || [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          My Programs & Curriculums
        </h1>
        <p className="text-xs text-textMuted">
          Access your active course modules, review lesson status, and discover higher tier tracks.
        </p>
      </div>

      {/* Enrolled Programs */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-textMain">Active Enrollments</h2>

        {myEnrolledPrograms.length === 0 ? (
          <div className="card-surface p-8 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-sm font-semibold text-textMain">No Active Programs Yet</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              Select a curriculum tier below to start learning and qualify for work assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myEnrolledPrograms.map((prog) => (
              <div
                key={prog._id}
                className="card-surface p-6 flex flex-col justify-between border-brand-200 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                      Enrolled & Active
                    </span>
                    <span className="text-xs text-textMuted">{prog.duration}</span>
                  </div>

                  <h3 className="text-lg font-bold text-textMain">{prog.name}</h3>
                  <p className="text-xs text-textMuted line-clamp-2">{prog.shortDescription}</p>

                  <div className="pt-2 flex items-center gap-2 text-xs text-brand-700 font-medium">
                    <Award className="w-4 h-4" />
                    <span>Verifiable Certificate Included</span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-borderSubtle flex items-center justify-between">
                  <span className="text-xs text-textMuted">{prog.accessDuration}</span>
                  <Link
                    href={`/dashboard/learning/${prog._id}`}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    <span>Launch Course Player</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Upgrades / Catalog */}
      {otherPrograms.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-borderSubtle">
          <h2 className="text-base font-bold text-textMain">Explore Additional Tiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPrograms.map((prog) => (
              <div key={prog._id} className="card-surface p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                    {prog.duration}
                  </span>
                  <h4 className="text-sm font-bold text-textMain">{prog.name}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-textMain">
                      ₹{prog.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-textMuted line-clamp-2">{prog.shortDescription}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-borderSubtle">
                  <Link
                    href={`/programs/${prog.slug}`}
                    className="btn-secondary w-full justify-center text-xs py-1.5"
                  >
                    View Details & Enroll
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
