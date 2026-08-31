"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import RichText from "@/components/RichText";
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Download,
  Award,
  ArrowLeft,
  Clock,
  PartyPopper,
  FolderDown,
  Lock,
  ExternalLink,
} from "lucide-react";

function ConfettiPiece({ delay, left, color }: { delay: number; left: string; color: string }) {
  return (
    <div
      className="absolute w-2 h-3 rounded-sm animate-confetti"
      style={{
        left,
        top: "-10px",
        backgroundColor: color,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

export default function CoursePlayerPage() {
  const params = useParams();
  const programId = params?.courseId as any;
  const { user, token } = useAuth();

  const courseState = useQuery(
    api.learning.getCoursePlayerState,
    token && programId ? { token, programId } : "skip"
  ) as {
    program: {
      _id: string;
      _creationTime: number;
      name: string;
      slug: string;
      price: number;
      shortDescription: string;
      duration: string;
      description: string;
      courseCount: number;
      lessonCount: number;
      resourceCount: number;
      thumbnailStorageId: string | undefined;
      status: string;
      createdAt: number;
      updatedAt: number;
    };
    isEnrolled: boolean;
    modules: Array<{
      _id: string;
      _creationTime: number;
      programId: string;
      moduleId: string;
      title: string;
      description: string;
      sortOrder: number;
      lessons: Array<{
        _id: string;
        _creationTime: number;
        moduleId: string;
        title: string;
        type: string;
        content: string;
        videoUrl: string | undefined;
        durationMinutes: number;
        sortOrder: number;
        lessonCount: number;
        duration: string;
        isCompleted: boolean;
        quizData: any[] | undefined;
        attachmentUrl: string | undefined;
        attachmentName: string | undefined;
      }>;
    }>;
    totalLessons: number;
    completedCount: number;
    progressPercentage: number;
    certificate: {
      _id: string;
      _creationTime: number;
      certificateId: string;
      userId: string;
      programId: string;
      recipientName: string;
      programName: string;
      issueDate: number;
      verificationUrl: string;
    } | null;
  } | undefined;

  const toggleComplete = useMutation(api.learning.toggleLessonComplete);

  const programResources = useQuery(
    api.resources.getResourcesForProgram,
    token && programId ? { token, programId } : "skip"
  ) as Array<{
    _id: string;
    title: string;
    description: string;
    fileType: string;
    fileSize: string;
    fileUrl: string | null;
    content: string | null;
    accessType: string;
    hasAccess: boolean;
    lockReason: string;
    downloadCount: number;
  }> | undefined;

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [isToggling, setIsToggling] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [justCompletedCourse, setJustCompletedCourse] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Quiz test state (resets per lesson)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  useEffect(() => {
    setAnswers({});
    setQuizSubmitted(false);
  }, [activeLessonId]);

  if (courseState === undefined) {
    return (
      <div className="card-surface p-12 text-center animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto"></div>
        <div className="h-64 bg-neutral-200 rounded"></div>
      </div>
    );
  }

  const { program, isEnrolled, modules, totalLessons, completedCount, progressPercentage, certificate } = courseState;
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentLesson = allLessons.find((l) => l._id.toString() === activeLessonId) || allLessons[0];
  const isCourseComplete = totalLessons > 0 && completedCount >= totalLessons;
  const quizData: any[] | null =
    currentLesson?.type === "quiz" && Array.isArray((currentLesson as any).quizData)
      ? (currentLesson as any).quizData
      : null;
  const quizPassed =
    !!quizData && quizData.every((q: any, i: number) => answers[i] !== undefined && answers[i] === q.correctIndex);
  const quizComplete = !!quizData && Object.keys(answers).length === quizData.length;

  const handleMarkComplete = async (lessonId: any) => {
    if (!token || isToggling) return;
    setIsToggling(true);
    try {
      const result = await toggleComplete({ token, programId, lessonId });
      // If this was the last lesson and it completed, show the finish screen
      if (result?.isCompleted && completedCount + 1 >= totalLessons) {
        setTimeout(() => {
          setJustCompletedCourse(true);
          setShowCompletion(true);
        }, 800);
      }
    } catch {
      // Progress re-syncs on next load
    } finally {
      setIsToggling(false);
    }
  };

  // Confetti colors
  const confettiColors = ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];
  const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
    delay: Math.random() * 2000,
    left: `${Math.random() * 100}%`,
    color: confettiColors[i % confettiColors.length],
  }));

  // Completion / Certificate celebration screen
  if (showCompletion && (certificate || isCourseComplete)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg text-center space-y-8">
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((piece, i) => (
              <ConfettiPiece key={i} {...piece} />
            ))}
          </div>

          {/* Main card */}
          <div className="card-surface p-10 sm:p-14 space-y-6 relative overflow-hidden border-2 border-green-200">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-200 rounded-full opacity-30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-200 rounded-full opacity-30 blur-3xl" />

            <div className="relative space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-bounce-slow">
                <PartyPopper className="w-10 h-10 text-green-600" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain">
                Congratulations! 🎉
              </h1>

              <p className="text-lg text-textMuted max-w-md mx-auto">
                You have completed <span className="font-bold text-brand-700">{program.name}</span>!
                Your verified certificate is ready.
              </p>

              {certificate && (
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2.5 text-sm font-semibold text-green-800">
                  <Award className="w-5 h-5" />
                  Certificate ID: {certificate.certificateId}
                </div>
              )}
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/certificates"
                className="btn-primary px-6 py-3 flex items-center justify-center gap-2 text-sm"
              >
                <Award className="w-4 h-4" />
                View Certificate
              </Link>
              <button
                onClick={() => setShowCompletion(false)}
                className="btn-secondary px-6 py-3 text-sm"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderSubtle pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/programs"
            className="p-2 rounded-lg border border-borderSubtle hover:bg-neutral-50 text-textMuted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
              Learning Player
            </span>
            <h1 className="text-lg font-bold text-textMain">{program.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-44 space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-textMuted">
              <span>Program Progress</span>
              <span className="font-bold text-brand-700">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-textMuted">
              {completedCount} of {totalLessons} lessons completed
            </div>
          </div>

          {certificate ? (
            <Link
              href="/dashboard/certificates"
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-green-700"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate Earned!</span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Main Course Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Lesson Viewer */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson ? (
            <div className="card-surface p-6 sm:p-8 space-y-6">
              {/* Lesson Title */}
              <div className="border-b border-borderSubtle pb-5">
                <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                  {currentLesson.type === "video" ? (
                    <PlayCircle className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">{currentLesson.type} Lesson</span>
                  <span className="text-neutral-300 mx-0.5">•</span>
                  <Clock className="w-3 h-3" />
                  <span>{currentLesson.durationMinutes} min</span>
                  {currentLesson.isCompleted && (
                    <>
                      <span className="text-neutral-300 mx-0.5">•</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Completed</span>
                    </>
                  )}
                </span>
                <h2 className="text-xl font-bold text-textMain mt-1">{currentLesson.title}</h2>
              </div>

              {/* Video Player */}
              {currentLesson.type === "video" && currentLesson.videoUrl && (
                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentLesson.videoUrl.replace(
                      /^.*(?:youtu\.be\/|v\/|embed\/|watch\?v=)([A-Za-z0-9_-]{6,}).*$/,
                      "$1"
                    )}?autoplay=0`}
                    title={currentLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Quiz Test */}
              {quizData && (
                <div className="space-y-5">
                  {quizData.map((q: any, qi: number) => {
                    const selected = answers[qi];
                    return (
                      <div key={qi} className="p-4 rounded-xl border border-borderSubtle bg-neutral-50/60 space-y-3">
                        <h4 className="text-sm font-bold text-textMain">
                          Q{qi + 1}. {q.question}
                        </h4>
                        <div className="space-y-2">
                          {q.options.map((opt: string, oi: number) => {
                            const isPicked = selected === oi;
                            let cls = "border-borderSubtle hover:border-brand-300 cursor-pointer";
                            if (quizSubmitted) {
                              if (oi === q.correctIndex) cls = "border-green-500 bg-green-50 text-green-800";
                              else if (isPicked) cls = "border-red-400 bg-red-50 text-red-700";
                              else cls = "border-borderSubtle opacity-70";
                            } else if (isPicked) {
                              cls = "border-brand-600 bg-brand-50 text-brand-900";
                            }
                            return (
                              <button
                                key={oi}
                                disabled={quizSubmitted}
                                onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                                className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ${cls}`}
                              >
                                {String.fromCharCode(65 + oi)}. {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {!quizSubmitted ? (
                    <button
                      disabled={!quizComplete}
                      onClick={() => setQuizSubmitted(true)}
                      className={`btn-primary w-full justify-center py-2.5 text-xs ${!quizComplete ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Submit Answers
                    </button>
                  ) : quizPassed ? (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-300 text-sm text-green-800 font-semibold text-center">
                      All correct! Use the button below to complete this lesson.
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-center space-y-2">
                      <p className="text-sm text-red-800 font-semibold">Some answers are incorrect. Review the highlighted questions.</p>
                      <button onClick={() => { setQuizSubmitted(false); }} className="btn-secondary text-xs py-1.5 px-4">
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Rich Lesson Content */}
              {!quizData && <RichText content={currentLesson.content} />}

              {/* Downloadable Lesson Attachment */}
              {currentLesson.attachmentUrl && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-borderSubtle flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-brand-600" />
                    <div>
                      <h4 className="text-xs font-bold text-textMain">Lesson Resource Asset</h4>
                      <p className="text-[11px] text-textMuted">{currentLesson.attachmentName || "Download Attachment"}</p>
                    </div>
                  </div>
                  <a
                    href={currentLesson.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Download File
                  </a>
                </div>
              )}

              {/* Mark Complete Button - Bottom of Lesson */}
              <div className="border-t border-borderSubtle pt-5" ref={bottomRef}>
                {currentLesson.isCompleted ? (
                  <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Lesson Completed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkComplete(currentLesson._id)}
                    disabled={isToggling || (!!quizData && !quizPassed)}
                    title={quizData && !quizPassed ? "Pass the test to complete this lesson" : undefined}
                    className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      isToggling
                        ? "bg-neutral-100 text-neutral-400 cursor-wait"
                        : quizData && !quizPassed
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60"
                        : "bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] shadow-lg shadow-brand-200"
                    }`}
                  >
                    {isToggling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : quizData && !quizPassed ? (
                      <span>Pass Test to Complete</span>
                    ) : (
                      <span>Mark Complete</span>
                    )}
                  </button>
                )}

                {/* Finish Course - Only when all lessons done */}
                {isCourseComplete && !showCompletion && (
                  <button
                    onClick={() => setShowCompletion(true)}
                    className="w-full mt-4 py-4 px-6 rounded-xl text-base font-bold text-white transition-all bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:scale-[0.98] shadow-lg shadow-green-200 animate-pulse-slow"
                  >
                    Finish Course &amp; Get Certificate
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card-surface p-12 text-center text-sm text-textMuted">
              Select a lesson from the module syllabus to begin.
            </div>
          )}
        </div>

        {/* Right 4 Cols: Curriculum Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted px-1">
            Curriculum Syllabus
          </h3>

          <div className="space-y-3">
            {modules.map((mod, mIdx) => {
              const isOpen = openModuleIndex === mIdx;
              return (
                <div key={mod._id} className="card-surface overflow-hidden">
                  <button
                    onClick={() => setOpenModuleIndex(isOpen ? null : mIdx)}
                    className="w-full p-4 flex items-center justify-between text-left bg-neutral-50/70 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="pr-2">
                      <h4 className="text-xs font-bold text-textMain">{mod.title}</h4>
                      <span className="text-[10px] text-textMuted">{mod.lessons.length} Lessons</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-textMuted shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-textMuted shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-borderSubtle bg-white">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = currentLesson?._id.toString() === lesson._id.toString();
                        return (
                          <button
                            key={lesson._id}
                            onClick={() => setActiveLessonId(lesson._id.toString())}
                            className={`w-full px-4 py-3 text-left flex items-start justify-between gap-3 text-xs transition-colors ${
                              isCurrent
                                ? "bg-brand-50/80 font-semibold text-brand-900 border-l-2 border-brand-600"
                                : "hover:bg-neutral-50 text-textMuted"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {lesson.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                              )}
                              <span className="line-clamp-2">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">
                              {lesson.durationMinutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Course Resources Section */}
          {programResources && programResources.length > 0 && (
            <div className="card-surface overflow-hidden">
              <button
                onClick={() => setShowResources(!showResources)}
                className="w-full p-4 flex items-center justify-between text-left bg-neutral-50/70 hover:bg-neutral-50 transition-colors"
              >
                <div className="pr-2 flex items-center gap-2">
                  <FolderDown className="w-4 h-4 text-brand-600" />
                  <div>
                    <h4 className="text-xs font-bold text-textMain">Course Resources</h4>
                    <span className="text-[10px] text-textMuted">{programResources.length} files</span>
                  </div>
                </div>
                {showResources ? (
                  <ChevronUp className="w-4 h-4 text-textMuted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-textMuted shrink-0" />
                )}
              </button>

              {showResources && (
                <div className="divide-y divide-borderSubtle bg-white">
                  {programResources.map((r) => (
                    <div key={r._id} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-textMain truncate">{r.title}</p>
                        <p className="text-[10px] text-textMuted">{r.fileSize}</p>
                      </div>
                      {r.hasAccess && (r.fileUrl || r.content) ? (
                        r.fileType === "html" && r.content ? (
                          <button
                            onClick={() => {
                              const blob = new Blob([r.content!], { type: "text/html" });
                              const url = URL.createObjectURL(blob);
                              window.open(url, "_blank");
                            }}
                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                            title="View resource"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        ) : r.fileType === "link" && r.fileUrl ? (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : r.fileUrl ? (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        ) : null
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
