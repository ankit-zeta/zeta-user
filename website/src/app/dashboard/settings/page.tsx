"use client";

import { friendlyError } from "@/lib/errors";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/convex";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Shield, Lock, Mail, Bell, AlertTriangle, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const changePasswordMutation = useMutation(api.auth.changePassword);
  const changeEmailMutation = useMutation(api.auth.changeEmail);
  const deleteAccountMutation = useMutation(api.auth.deleteAccount);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const [dangerOpen, setDangerOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteErr, setDeleteErr] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPwMsg("");
    setPwErr("");
    if (pw.next.length < 8) {
      setPwErr("New password must be at least 8 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwErr("New passwords do not match.");
      return;
    }
    try {
      await changePasswordMutation({ token, currentPassword: pw.current, newPassword: pw.next });
      setPwMsg("Password changed. Other sessions were signed out.");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      setPwErr(friendlyError(err, "Failed to change password."));
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setEmailMsg("");
    setEmailErr("");
    if (!emailPassword) {
      setEmailErr("Enter your current password to confirm the email change.");
      return;
    }
    try {
      await changeEmailMutation({ token, currentPassword: emailPassword, newEmail });
      setEmailMsg(`Email updated to ${newEmail.trim().toLowerCase()}.`);
      setNewEmail("");
      setEmailPassword("");
    } catch (err: any) {
      setEmailErr(friendlyError(err, "Failed to change email."));
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setDeleteErr("");
    if (confirmText !== "DELETE") {
      setDeleteErr("Type DELETE to confirm account deletion.");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccountMutation({ token, password: deletePassword });
      logout();
      router.push("/");
    } catch (err: any) {
      setDeleteErr(friendlyError(err, "Failed to delete account."));
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Account Settings
        </h1>
        <p className="text-xs text-textMuted">
          Manage your security, email, and account preferences.
        </p>
      </div>

      {/* Change Password */}
      <div className="card-surface p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" />
          <span>Change Password</span>
        </h3>
        {pwMsg && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> {pwMsg}
          </div>
        )}
        {pwErr && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{pwErr}</div>}
        <form onSubmit={handlePassword} className="space-y-3 text-xs">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              placeholder="Current password"
              className="w-full px-3 py-2 pr-9 rounded-lg border border-borderSubtle bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
              aria-label="Toggle password visibility"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type={showPw ? "text" : "password"}
              required
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              placeholder="New password (min 8 chars)"
              className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
            <input
              type={showPw ? "text" : "password"}
              required
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <button type="submit" className="btn-primary text-xs py-2 px-4">
            Update Password
          </button>
        </form>
      </div>

      {/* Change Email */}
      <div className="card-surface p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-600" />
          <span>Change Email</span>
        </h3>
        <p className="text-xs text-textMuted">
          Current email: <strong className="text-textMain">{user?.email}</strong>
        </p>
        {emailMsg && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> {emailMsg}
          </div>
        )}
        {emailErr && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{emailErr}</div>}
        <form onSubmit={handleEmail} className="space-y-3 text-xs">
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
          <input
            type="password"
            required
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            placeholder="Current password (required to confirm)"
            className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
          <button type="submit" className="btn-primary text-xs py-2 px-4">
            Update Email
          </button>
        </form>
      </div>

      {/* Notification preferences */}
      <div className="card-surface p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-600" />
          <span>Notification Preferences</span>
        </h3>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 text-textMuted">
            <input type="checkbox" defaultChecked className="rounded border-borderSubtle text-brand-600 focus:ring-brand-600" />
            <span>Job acceptance, revision and payout notifications</span>
          </label>
          <label className="flex items-center gap-2 text-textMuted">
            <input type="checkbox" defaultChecked className="rounded border-borderSubtle text-brand-600 focus:ring-brand-600" />
            <span>New affiliate commission credits</span>
          </label>
          <label className="flex items-center gap-2 text-textMuted">
            <input type="checkbox" defaultChecked className="rounded border-borderSubtle text-brand-600 focus:ring-brand-600" />
            <span>Course milestone and achievement notifications</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card-surface p-6 sm:p-8 space-y-4 border-2 border-red-200">
        <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-textMuted">
          Deleting your account permanently removes your profile, sessions, and CV. Wallet and financial records are
          retained for ledger integrity. A wallet balance must be withdrawn before deletion.
        </p>
        {!dangerOpen ? (
          <button onClick={() => setDangerOpen(true)} className="py-1.5 px-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100">
            Delete My Account
          </button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-3 text-xs">
            {deleteErr && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{deleteErr}</div>}
            <div>
              <label className="font-semibold text-textMain block mb-1">Type DELETE to confirm</label>
              <input
                required
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="font-semibold text-textMain block mb-1">Enter your password</label>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={deleting}
                className="py-1.5 px-4 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
              <button type="button" onClick={() => setDangerOpen(false)} className="btn-secondary py-1.5 px-4 text-xs">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}