"use client";

import React from "react";
import { useAuth } from "@/lib/convex";
import { Shield, Lock, Bell, Moon } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Account Settings
        </h1>
        <p className="text-xs text-textMuted">
          Manage your security preferences and communication notifications.
        </p>
      </div>

      <div className="card-surface p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            <span>Security & Authentication</span>
          </h3>

          <div className="p-4 bg-neutral-50 rounded-lg border border-borderSubtle flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-textMain">Account Password</p>
              <p className="text-textMuted">Password is encrypted with PBKDF2 / SHA-256 with user salt.</p>
            </div>
            <button className="btn-secondary text-xs py-1.5 px-3">
              Change Password
            </button>
          </div>
        </div>

        <div className="space-y-4 border-t border-borderSubtle pt-6">
          <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
            <span>Notification Preferences</span>
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 text-textMuted">
              <input type="checkbox" defaultChecked className="rounded border-borderSubtle text-brand-600 focus:ring-brand-600" />
              <span>Email notifications for work application status changes</span>
            </label>
            <label className="flex items-center gap-2 text-textMuted">
              <input type="checkbox" defaultChecked className="rounded border-borderSubtle text-brand-600 focus:ring-brand-600" />
              <span>Email notifications for new affiliate commission credits</span>
            </label>
            <label className="flex items-center gap-2 text-textMuted">
              <input type="checkbox" defaultChecked className="rounded border-borderSubtle text-brand-600 focus:ring-brand-600" />
              <span>Course milestone achievement notifications</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
