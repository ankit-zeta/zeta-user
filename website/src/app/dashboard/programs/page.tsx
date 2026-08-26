"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  BookOpen,
  ArrowRight,
  Award,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Download,
  HelpCircle,
  Layers,
} from "lucide-react";

type Module = {
  _id: string;
  title: string;
  description: string;
  sortOrder: number;
  lessonCount: number;
  lessons: Array<{
    _id: string;
    title: string;
    slug: string;
    type: string;
    sortOrder: number;
  }>;
};

type EnrolledProgram = {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  duration: string;
  accessDuration: string;
  category: string | undefined;
  thumbnailUrl: string | null;
  moduleCount: number;
  totalLessons: number;
  modules: Module[];
};

export default function MyProgramsPage() {
  const { user } = useAuth();
  const enrolledIds = (user?.enrolledProgramIds || []) as string[];

  const enrolledPrograms = useQuery(
    api.programs.getEnrolledProgramsDetail,
    enrolledIds.length > 0 ? { programIds: enrolledIds } : "skip"
  ) as EnrolledProgram[] | undefined;

  const allPrograms = useQuery(api.programs.getPublicPrograms) as Array<{
    _id: string;
    slug: string;
    name: string;
    shortDescription: string;
    price: number;
    duration: string;
    category: string | undefined;
    thumbnailUrl: string | null;
  }> | undefined;

  const otherPrograms = allPrograms?.filter(
    (p) => !enrolledIds.includes(p._id)
  ) || [];

  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="w-3 h-3" />;
      case "download": return <Download className="w-3 h-3" />;
      case "quiz": return <HelpCircle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            My Programs &amp; Curriculums
          </h1>
          <p className="text-xs text-textMuted">
            Access your active course modules, review lesson status, and discover more tracks.
          </p>
        </div>
        <Link
          href="/programs"
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Browse All Courses
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Enrolled Programs */}
      {enrolledPrograms === undefined ? (
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-48 animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2].map((i) => (
              <div key={i} className="min-w-[340px] h-64 bg-neutral-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : enrolledPrograms.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-textMain flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Active Enrollments
            </h2>
            <span className="text-xs text-textMuted">{enrolledPrograms.length} program{enrolledPrograms.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Horizontal scroll container */}
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {enrolledPrograms.map((prog) => (
              <div
                key={prog._id}
                className="min-w-[360px] max-w-[400px] snap-start shrink-0"
              >
                <div className="card-surface overflow-hidden border-brand-200 h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-brand-50">
                    {prog.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={prog.thumbnailUrl}
                        alt={prog.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
                        <span className="text-white/90 text-sm font-bold px-4 text-center">{prog.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-base font-bold text-white drop-shadow-md leading-tight">{prog.name}</h3>
                    </div>
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-white bg-brand-700/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      Enrolled
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-textMuted line-clamp-2 mb-3">{prog.shortDescription}</p>

                    <div className="flex items-center gap-3 text-[11px] text-textMuted mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {prog.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {prog.moduleCount} modules · {prog.totalLessons} lessons
                      </span>
                    </div>

                    {/* Expand/collapse courses */}
                    <button
                      onClick={() => setExpandedProgram(expandedProgram === prog._id ? null : prog._id)}
                      className="flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors mb-3"
                    >
                      {expandedProgram === prog._id ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      {expandedProgram === prog._id ? "Hide" : "View"} Courses ({prog.totalLessons} lessons)
                    </button>

                    {/* Courses list (expandable) */}
                    {expandedProgram === prog._id && (
                      <div className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-1">
                        {prog.modules.map((mod, mi) => (
                          <div key={mod._id} className="rounded-lg bg-neutral-50 border border-borderSubtle p-2.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-5 h-5 rounded bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {mi + 1}
                              </span>
                              <span className="text-[11px] font-bold text-textMain truncate">{mod.title}</span>
                              <span className="text-[10px] text-textMuted ml-auto shrink-0">{mod.lessonCount} lessons</span>
                            </div>
                            <div className="space-y-0.5 pl-7">
                              {mod.lessons.map((lesson) => (
                                <div key={lesson._id} className="flex items-center gap-1.5 text-[10px] text-textMuted">
                                  <span className="text-brand-500">{lessonIcon(lesson.type)}</span>
                                  <span className="truncate">{lesson.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-3 border-t border-borderSubtle flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-700 font-medium">
                        <Award className="w-3.5 h-3.5" />
                        Certificate Included
                      </div>
                      <Link
                        href={`/dashboard/learning/${prog._id}`}
                        className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5"
                      >
                        Launch Player
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* No enrollments */
        <div className="card-surface p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7 text-brand-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-textMain">No Active Programs Yet</h3>
            <p className="text-xs text-textMuted max-w-md mx-auto">
              Select a curriculum program to start learning and qualify for work assignments and certificates.
            </p>
          </div>
          <Link
            href="/programs"
            className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Explore Programs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Available Programs — horizontal scroll */}
      {otherPrograms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-textMain">Available Programs</h2>
            <Link href="/programs" className="text-xs font-semibold text-brand-600 hover:underline">
              View all →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {otherPrograms.map((prog) => (
              <Link
                key={prog._id}
                href={`/programs/${prog.slug}`}
                className="min-w-[280px] max-w-[300px] snap-start shrink-0 card-surface overflow-hidden hover:border-brand-200 hover:shadow-md transition-all group"
              >
                <div className="relative h-36 overflow-hidden bg-brand-50">
                  {prog.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prog.thumbnailUrl}
                      alt={prog.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
                      <span className="text-white/90 text-sm font-bold px-4 text-center">{prog.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {prog.category && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-brand-700/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {prog.category}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-bold text-textMain leading-snug">{prog.name}</h4>
                  <p className="text-[11px] text-textMuted line-clamp-2">{prog.shortDescription}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-borderSubtle">
                    <span className="text-xs font-bold text-textMain">
                      {prog.price === 0 ? "Free" : `₹${prog.price.toLocaleString("en-IN")}`}
                    </span>
                    <span className="text-[11px] text-textMuted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {prog.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
