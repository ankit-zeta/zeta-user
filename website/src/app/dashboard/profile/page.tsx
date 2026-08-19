"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/convex";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { User, Mail, Phone, Award, Shield, Save, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const updateProfileMutation = useMutation(api.users.updateProfile);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skillsInput, setSkillsInput] = useState((user?.skills || []).join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setMsg("");

    try {
      const skillsArray = skillsInput
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      await updateProfileMutation({
        token,
        name,
        phone,
        bio,
        skills: skillsArray,
      });

      setMsg("Profile updated successfully!");
    } catch (err: any) {
      setMsg(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          User Profile
        </h1>
        <p className="text-xs text-textMuted">
          Manage your public contractor profile, skills, and personal information.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{msg}</span>
        </div>
      )}

      {(user?.cvStatus || "pending") !== "verified" && (
        <div className={`p-4 rounded-lg border text-xs space-y-1 ${
          user?.cvStatus === "rejected"
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <p className="font-bold flex items-center gap-1.5">
            {user?.cvStatus === "rejected" ? (
              <>
                <XCircle className="w-4 h-4" /> Your CV was not verified
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" /> CV verification pending
              </>
            )}
          </p>
          <p className="text-[11px] opacity-80">
            {user?.cvStatus === "rejected"
              ? `Remark: ${user.cvRemarks || "Please contact support for details."}`
              : "Submit a CV/resume with your work applications. Once an admin verifies it, you become eligible to be selected for work opportunities and paid for completed projects."}
          </p>
        </div>
      )}

      {user?.cvStatus === "verified" && (
        <div className="p-4 rounded-lg border text-xs bg-green-50 border-green-200 text-green-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> CV verified — you are eligible for work selection
          </p>
          {user.cvReviewedAt && (
            <p className="text-[11px] opacity-80">Reviewed on {new Date(user.cvReviewedAt).toLocaleDateString("en-IN")}</p>
          )}
        </div>
      )}

      <div className="card-surface p-6 sm:p-8 space-y-6">
        {/* Avatar & Header */}
        <div className="flex items-center gap-4 border-b border-borderSubtle pb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-2xl">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-textMain">{user?.name}</h2>
            <p className="text-xs text-textMuted">{user?.email}</p>
            <span className="text-[10px] font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 mt-1 inline-block">
              Referral Code: {user?.referralCode}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
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
              <label className="text-xs font-semibold text-textMain">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-textMain">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about your background and core specialties..."
              className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-textMain">Skills & Specializations (Comma-separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Copywriting, Video Editing, SEO, Figma"
              className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
