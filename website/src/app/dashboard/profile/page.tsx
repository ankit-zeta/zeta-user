"use client";

import { friendlyError } from "@/lib/errors";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import {
  User,
  Mail,
  Phone,
  Award,
  Shield,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  Link2,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const updateProfileMutation = useMutation(api.users.updateProfile);
  const upsertCvMutation = useMutation(api.cvProfiles.upsertCvProfile);
  const cvData = useQuery(
    api.cvProfiles.getMyCvProfile,
    token ? { token } : "skip"
  );

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [overview, setOverview] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");

  useEffect(() => {
    if (cvData) {
      setOverview(cvData.overview || "");
      setPortfolioUrl(cvData.portfolioUrl || "");
      setExperience(cvData.experience || []);
      setEducation(cvData.education || []);
      setTechSkills(cvData.technicalSkills || []);
      setSoftSkills(cvData.softSkills || []);
    }
  }, [cvData]);

  const completeness = cvData?.completeness;
  const progress = completeness?.percent || 0;

  const addSkill = (type: "tech" | "soft") => {
    const input = type === "tech" ? techInput : softInput;
    const set = type === "tech" ? setTechSkills : setSoftSkills;
    const value = input.trim();
    if (!value) return;
    if (type === "tech") setTechSkills((prev) => (prev.includes(value) ? prev : [...prev, value]));
    else setSoftSkills((prev) => (prev.includes(value) ? prev : [...prev, value]));
    if (type === "tech") setTechInput("");
    else setSoftInput("");
  };

  const addExperience = () =>
    setExperience((prev) => [
      ...prev,
      { role: "", company: "", startDate: "", endDate: "", current: false, description: "" },
    ]);

  const addEducation = () =>
    setEducation((prev) => [
      ...prev,
      { institution: "", degree: "", field: "", status: "graduated", startYear: "", endYear: "" },
    ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setMsg("");

    try {
      await updateProfileMutation({ token, name, phone, bio, skills: [...techSkills, ...softSkills] });
      await upsertCvMutation({
        token,
        overview: overview.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        experience,
        education,
        technicalSkills: techSkills,
        softSkills,
      });
      setMsg("Profile and CV saved successfully!");
    } catch (err: any) {
      setMsg(friendlyError(err, "Failed to save profile."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          My Profile & CV
        </h1>
        <p className="text-xs text-textMuted">
          Fill in your structured CV — no file uploads needed. Complete it to apply for work opportunities.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Completeness meter */}
      <div className={`p-4 rounded-lg border text-xs space-y-2 ${
        progress >= 100 ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"
      }`}>
        <div className="flex items-center justify-between">
          <p className="font-bold flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {progress >= 100 ? "CV complete — you can apply for work!" : `CV completeness: ${progress}%`}
          </p>
          <span className="font-extrabold">{progress}%</span>
        </div>
        <div className="h-2 bg-white/70 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-green-600" : "bg-amber-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress < 100 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
            {(completeness?.required || []).map((key: string) => {
              const ok = completeness?.sections?.[key];
              const label =
                key === "overview"
                  ? "Overview (50+ characters)"
                  : key === "experience"
                  ? "At least 1 experience"
                  : key === "education"
                  ? "At least 1 education"
                  : "At least 3 skills";
              return (
                <li key={key} className="flex items-center gap-1.5">
                  {ok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span className={ok ? "line-through opacity-70" : ""}>{label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(user?.cvStatus || "pending") !== "verified" && (
        <div className={`p-4 rounded-lg border text-xs space-y-1 ${
          user?.cvStatus === "rejected"
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-neutral-50 border-borderSubtle text-textMuted"
        }`}>
          <p className="font-bold flex items-center gap-1.5">
            {user?.cvStatus === "rejected" ? (
              <>
                <XCircle className="w-4 h-4" /> Your CV was not verified
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" /> CV verification pending
              </>
            )}
          </p>
          <p className="text-[11px] opacity-80">
            {user?.cvStatus === "rejected"
              ? `Remark: ${user.cvRemarks || "Please contact support for details."}`
              : "After completing your CV, our team verifies it. You become eligible to be selected for work only after verification."}
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <div className="card-surface p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMain">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMain">Email (can be changed in Settings)</label>
              <input
                type="text"
                readOnly
                value={user?.email || ""}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-neutral-100 text-textMuted"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMain">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMain">Portfolio Link (Google Drive / Behance / etc.)</label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="card-surface p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> Professional Overview
          </h2>
          <p className="text-[11px] text-textMuted">
            A short introduction about yourself — required to apply for work (min 50 characters).
          </p>
          <textarea
            rows={5}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="e.g. I'm a digital marketing specialist with 3 years of experience helping brands grow..."
            className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>

        {/* Experience */}
        <div className="card-surface p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600" /> Work Experience
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Experience
            </button>
          </div>
          {experience.length === 0 && (
            <p className="text-[11px] text-textMuted">Add at least one experience entry to complete your CV.</p>
          )}
          {experience.map((exp, i) => (
            <div key={i} className="p-4 rounded-lg border border-borderSubtle bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-textMuted uppercase">Experience {i + 1}</span>
                <button
                  type="button"
                  onClick={() => setExperience((prev) => prev.filter((_, x) => x !== i))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={exp.role}
                  onChange={(e) =>
                    setExperience((prev) => prev.map((x, xi) => (xi === i ? { ...x, role: e.target.value } : x)))
                  }
                  placeholder="Job title *"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
                <input
                  value={exp.company}
                  onChange={(e) =>
                    setExperience((prev) => prev.map((x, xi) => (xi === i ? { ...x, company: e.target.value } : x)))
                  }
                  placeholder="Company *"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
                <input
                  value={exp.startDate}
                  onChange={(e) =>
                    setExperience((prev) => prev.map((x, xi) => (xi === i ? { ...x, startDate: e.target.value } : x)))
                  }
                  placeholder="Start (e.g. Jan 2023) *"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    disabled={exp.current}
                    value={exp.current ? "" : exp.endDate}
                    onChange={(e) =>
                      setExperience((prev) => prev.map((x, xi) => (xi === i ? { ...x, endDate: e.target.value } : x)))
                    }
                    placeholder="End (e.g. Dec 2024)"
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white disabled:bg-neutral-100"
                  />
                  <label className="text-[10px] text-textMuted whitespace-nowrap flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        setExperience((prev) =>
                          prev.map((x, xi) => (xi === i ? { ...x, current: e.target.checked } : x))
                        )
                      }
                      className="rounded border-borderSubtle"
                    />
                    Current
                  </label>
                </div>
              </div>
              <textarea
                rows={2}
                value={exp.description}
                onChange={(e) =>
                  setExperience((prev) => prev.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)))
                }
                placeholder="What did you do there?"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
              />
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="card-surface p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-600" /> Education
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Education
            </button>
          </div>
          {education.length === 0 && (
            <p className="text-[11px] text-textMuted">Add at least one education entry to complete your CV.</p>
          )}
          {education.map((edu, i) => (
            <div key={i} className="p-4 rounded-lg border border-borderSubtle bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-textMuted uppercase">Education {i + 1}</span>
                <button
                  type="button"
                  onClick={() => setEducation((prev) => prev.filter((_, x) => x !== i))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={edu.institution}
                  onChange={(e) =>
                    setEducation((prev) => prev.map((x, xi) => (xi === i ? { ...x, institution: e.target.value } : x)))
                  }
                  placeholder="School / College / University *"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
                <input
                  value={edu.degree}
                  onChange={(e) =>
                    setEducation((prev) => prev.map((x, xi) => (xi === i ? { ...x, degree: e.target.value } : x)))
                  }
                  placeholder="Degree / Course *"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
                <input
                  value={edu.field}
                  onChange={(e) =>
                    setEducation((prev) => prev.map((x, xi) => (xi === i ? { ...x, field: e.target.value } : x)))
                  }
                  placeholder="Field of study"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
                <select
                  value={edu.status}
                  onChange={(e) =>
                    setEducation((prev) => prev.map((x, xi) => (xi === i ? { ...x, status: e.target.value } : x)))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                >
                  <option value="pursuing">Pursuing</option>
                  <option value="graduated">Graduated</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  value={edu.startYear}
                  onChange={(e) =>
                    setEducation((prev) => prev.map((x, xi) => (xi === i ? { ...x, startYear: e.target.value } : x)))
                  }
                  placeholder="Start year (e.g. 2020)"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
                <input
                  value={edu.endYear}
                  onChange={(e) =>
                    setEducation((prev) => prev.map((x, xi) => (xi === i ? { ...x, endYear: e.target.value } : x)))
                  }
                  placeholder="End year (e.g. 2024)"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="card-surface p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" /> Skills
          </h2>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-textMain">Technical / Hard Skills</label>
            <div className="flex flex-wrap gap-1.5">
              {techSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-50 text-brand-800 border border-brand-200 px-2 py-0.5 rounded-full">
                  {s}
                  <button type="button" onClick={() => setTechSkills((prev) => prev.filter((x) => x !== s))} className="text-brand-500 hover:text-brand-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill("tech");
                  }
                }}
                placeholder="e.g. Copywriting, Video Editing, SEO"
                className="flex-1 px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
              <button type="button" onClick={() => addSkill("tech")} className="btn-secondary text-[11px] px-3">
                Add
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-textMain">Soft Skills</label>
            <div className="flex flex-wrap gap-1.5">
              {softSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                  {s}
                  <button type="button" onClick={() => setSoftSkills((prev) => prev.filter((x) => x !== s))} className="text-purple-500 hover:text-purple-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={softInput}
                onChange={(e) => setSoftInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill("soft");
                  }
                }}
                placeholder="e.g. Communication, Leadership"
                className="flex-1 px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
              <button type="button" onClick={() => addSkill("soft")} className="btn-secondary text-[11px] px-3">
                Add
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary text-xs py-2.5 px-6 flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : "Save Profile & CV"}</span>
        </button>
      </form>
    </div>
  );
}