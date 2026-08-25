"use client";

import React, { useState, useEffect } from "react";
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
  ExternalLink
} from "lucide-react";

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

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [isToggling, setIsToggling] = useState(false);

  // Quiz test state (resets per lesson) — declared BEFORE any early returns
  // to respect the Rules of Hooks (hook count must match across renders).
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

  // Set default active lesson if not set
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentLesson = allLessons.find((l) => l._id.toString() === activeLessonId) || allLessons[0];
  const quizData: any[] | null =
    currentLesson?.type === "quiz" && Array.isArray((currentLesson as any).quizData)
      ? (currentLesson as any).quizData
      : null;
  const quizPassed =
    !!quizData && quizData.every((q: any, i: number) => answers[i] !== undefined && answers[i] === q.correctIndex);
  const quizComplete = !!quizData && Object.keys(answers).length === quizData.length;

  const handleToggle = async (lessonId: any) => {
    if (!token) return;
    setIsToggling(true);
    try {
      await toggleComplete({
        token,
        programId,
        lessonId,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Navigation */}
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

        {/* Progress Display */}
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

      {/* Main Course Layout: Sidebar + Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Lesson Viewer */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson ? (
            <div className="card-surface p-6 sm:p-8 space-y-6">
              {/* Lesson Title & Completion Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderSubtle pb-5">
                <div className="space-y-1">
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
                  </span>
                  <h2 className="text-xl font-bold text-textMain">{currentLesson.title}</h2>
                </div>

                <button
                  onClick={() => {
                    if (quizData && !quizPassed) return;
                    handleToggle(currentLesson._id);
                  }}
                  disabled={isToggling || (!!quizData && !quizPassed)}
                  title={quizData && !quizPassed ? "Pass the test to complete this course" : undefined}
                  className={`btn-secondary text-xs py-2 px-4 flex items-center gap-2 ${
                    currentLesson.isCompleted
                      ? "bg-green-50 text-green-700 border-green-300 font-semibold"
                      : quizData && !quizPassed
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  {currentLesson.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Completed</span>
                    </>
                  ) : quizData ? (
                    <>
                      <Award className="w-4 h-4 text-neutral-400" />
                      <span>Pass Test to Complete</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-neutral-400" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>

              {/* Video Player or Text Content */}
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
                      🎉 All correct! Click "Pass Test to Complete" above to finish the course and claim your certificate.
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
            </div>
          ) : (
            <div className="card-surface p-12 text-center text-sm text-textMuted">
              Select a lesson from the module syllabus to begin.
            </div>
          )}
        </div>

        {/* Right 4 Cols: Curriculum Navigation Sidebar */}
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
        </div>
      </div>
    </div>
  );
}
