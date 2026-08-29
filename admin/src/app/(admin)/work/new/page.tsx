"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { Tooltip } from "@/components/Tooltip";
import { ArrowLeft, Save, Plus, Trash2, ImagePlus, X, Award, Lock, BookOpen, Trophy, CheckCircle2 } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const createJobMutation = useMutation(api.jobs.createJob);
  const generateUploadUrl = useAction(api.jobs.generateJobCoverUploadUrl);

  const programs = useQuery(api.programs.getPublicPrograms);
  const achievements = useQuery(
    api.achievements.getAllAchievementsAdmin,
    token ? { token } : "skip"
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Content & Writing");
  const [payment, setPayment] = useState<number>(3500);
  const [paymentType, setPaymentType] = useState("fixed");
  const [workType, setWorkType] = useState("remote");
  const [difficulty, setDifficulty] = useState("beginner");
  const [estimatedDuration, setEstimatedDuration] = useState("1 Week");
  const [deadline, setDeadline] = useState("2026-10-31");
  const [openings, setOpenings] = useState<number>(3);
  const [requiredProgramId, setRequiredProgramId] = useState<string>("");
  const [requiredProgramIds, setRequiredProgramIds] = useState<string[]>([]);
  const [requiredAchievementId, setRequiredAchievementId] = useState<string>("");
  const [requiredCertificateId, setRequiredCertificateId] = useState<string>("");

  const [skills, setSkills] = useState<string[]>(["Copywriting", "SEO", "Research"]);
  const [requirements, setRequirements] = useState<string[]>([
    "Strong English writing capability",
    "Ability to meet 48-hour turnarounds",
  ]);
  const [questions, setQuestions] = useState<string[]>([
    "Describe your background in this domain.",
    "Share links to 1-2 relevant project samples.",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [company, setCompany] = useState("");
  const [coverImageStorageId, setCoverImageStorageId] = useState<string | undefined>(undefined);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleCoverUpload = async (file: File) => {
    if (!token || !file) return;
    setIsUploading(true);
    setError("");
    try {
      const url = await generateUploadUrl();
      const uploadResp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResp.ok) throw new Error("Upload failed");
      const storageId = JSON.parse(await uploadResp.text()).storageId;
      setCoverImageStorageId(storageId);
      setCoverPreview(URL.createObjectURL(file));
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError("");

    try {
      await createJobMutation({
        token,
        title,
        slug,
        shortDescription,
        description,
        category,
        skills: skills.filter(Boolean),
        requirements: requirements.filter(Boolean),
        requiredProgramId: requiredProgramId ? (requiredProgramId as any) : undefined,
        requiredProgramIds: requiredProgramIds.length > 0 ? (requiredProgramIds as any) : undefined,
        requiredAchievementId: requiredAchievementId ? (requiredAchievementId as any) : undefined,
        payment: Number(payment),
        paymentType,
        workType,
        difficulty,
        estimatedDuration,
        deadline,
        openings: Number(openings),
        status: "published",
        applicationQuestions: questions.filter(Boolean),
        company: company || undefined,
        coverImageStorageId,
      });

      router.push("/work");
    } catch (err: any) {
      setError(err.message || "Failed to create job opportunity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <Link
        href="/work"
        className="inline-flex items-center gap-1.5 text-xs text-textMuted hover:text-textMain font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Work Listings</span>
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Post Work Opportunity
        </h1>
        <p className="text-xs text-textMuted">
          Create client assignments and configure program/achievement/certificate eligibility requirements.
        </p>
      </div>

      <div className="card-surface p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Opportunity Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Senior Copywriter & Asset Creator"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Company / Client (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. ZetaGrow Studios"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-medium"
              >
                <option value="Content & Writing">Content & Writing</option>
                <option value="Media Production">Media Production</option>
                <option value="Web & Technical">Web & Technical</option>
                <option value="Social & Marketing">Social & Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Payout Amount (₹) *</label>
              <input
                type="number"
                required
                value={payment}
                onChange={(e) => setPayment(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle font-bold bg-white"
              />
            </div>
            <div className="space-y-1">
              <Tooltip content="Fixed = one-time payment, Milestone = payment per deliverable, Hourly = pay per hour worked">
                <label className="font-semibold text-textMain cursor-help">Payout Type</label>
              </Tooltip>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              >
                <option value="fixed">Fixed</option>
                <option value="milestone">Milestone</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Openings</label>
              <input
                type="number"
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Tooltip content="Work delivered remotely (no physical presence required)">
                <label className="font-semibold text-textMain cursor-help">Work Mode</label>
              </Tooltip>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-1">
              <Tooltip content="Complexity level shown to applicants">
                <label className="font-semibold text-textMain cursor-help">Difficulty Level</label>
              </Tooltip>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Estimated Duration</label>
              <select
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              >
                <option value="1 Day">1 Day</option>
                <option value="3 Days">3 Days</option>
                <option value="1 Week">1 Week</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="1 Month">1 Month</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
          </div>

          {/* Configurable Eligibility Gating */}
          <div className="p-4 bg-brand-50/50 border border-brand-200 rounded-xl space-y-4">
            <h4 className="font-bold text-brand-900 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Configurable Eligibility Prerequisites
            </h4>
            <p className="text-[11px] text-brand-700">
              Set requirements applicants must meet before applying. Select multiple programs — applicant needs ANY one (OR logic).
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-textMain flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Required Program (Single)
                </label>
                <select
                  value={requiredProgramId}
                  onChange={(e) => setRequiredProgramId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                >
                  <option value="">No Program Requirement</option>
                  {programs?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (₹{p.price.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-textMuted">Single program requirement</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-textMain flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Required Certificate(s) — Multi-select
                </label>
                <div className="max-h-40 overflow-y-auto border border-borderSubtle rounded-lg bg-white p-2 space-y-1">
                  {programs?.map((p) => (
                    <label key={p._id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-neutral-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={requiredProgramIds.includes(p._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRequiredProgramIds([...requiredProgramIds, p._id]);
                          } else {
                            setRequiredProgramIds(requiredProgramIds.filter((id) => id !== p._id));
                          }
                        }}
                        className="rounded border-neutral-300"
                      />
                      <span className="font-medium text-textMain">{p.name}</span>
                      <span className="text-textMuted">(₹{p.price.toLocaleString("en-IN")})</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-textMuted">Applicant needs ANY one of these certificates (OR logic)</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-textMain flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Required Achievement
                </label>
                <select
                  value={requiredAchievementId}
                  onChange={(e) => setRequiredAchievementId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                >
                  <option value="">No Achievement Requirement</option>
                  {achievements?.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-textMuted">Applicant must have earned this achievement</p>
              </div>
            </div>

            {(requiredProgramIds.length > 0 || requiredProgramId || requiredAchievementId) ? (
              <div className="p-3 bg-white/80 rounded-lg border border-brand-200">
                <p className="text-[10px] font-medium text-brand-800">Current Gate: </p>
                <div className="flex flex-wrap gap-1.5 mt-1 text-[10px]">
                  {requiredProgramId && !requiredProgramIds.length && (
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Program: {programs?.find(p => p._id === requiredProgramId)?.name}
                    </span>
                  )}
                  {requiredProgramIds.length > 0 && (
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" /> {requiredProgramIds.length} program(s) — ANY one required
                    </span>
                  )}
                  {requiredAchievementId && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Achievement
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-[11px] text-green-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  No prerequisites — this job is open to all registered users (Free Apply)
                </p>
              </div>
            )}
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-1">
            <label className="font-semibold text-textMain">Cover Image (Optional)</label>
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-40 h-24 object-cover rounded-lg border border-borderSubtle"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreview("");
                      setCoverImageStorageId(undefined);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-40 h-24 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-borderSubtle cursor-pointer hover:border-brand-400 bg-neutral-50">
                  {isUploading ? (
                    <span className="text-[11px] text-textMuted">Uploading...</span>
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5 text-textMuted" />
                      <span className="text-[11px] text-textMuted mt-1">Choose image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCoverUpload(f);
                    }}
                  />
                </label>
              )}
              <p className="text-[11px] text-textMuted">
                Shown on the work listing cards and the detailed opportunity page.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-textMain">Short Description *</label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary for listings..."
              className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-textMain">Full Task Scope & Deliverable Details *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full requirements, editorial guidelines, file formats, and acceptance criteria..."
              className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-borderSubtle">
            <Link href="/work" className="btn-secondary py-2 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2 px-5 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Publishing..." : "Publish Job"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
