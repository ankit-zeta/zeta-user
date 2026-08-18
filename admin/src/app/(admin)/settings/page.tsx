"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Settings, Save, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const { token } = useAdminAuth();
  const allSettings = useQuery(
    api.settings.getAllSettings,
    token ? { token } : "skip"
  );

  const updateSettingMutation = useMutation(api.settings.updateSetting);

  // General & Brand Settings
  const [brandName, setBrandName] = useState("ZetaGrow");
  const [tagline, setTagline] = useState("Learn. Work. Grow.");
  const [supportEmail, setSupportEmail] = useState("support@zetagrow.com");
  const [supportPhone, setSupportPhone] = useState("+91 (080) 4567-8900");

  // Withdrawal Limits Settings
  const [minWithdrawal, setMinWithdrawal] = useState<number>(1000);
  const [maxWithdrawal, setMaxWithdrawal] = useState<number>(100000);
  const [dailyLimit, setDailyLimit] = useState<number>(25000);
  const [feePercentage, setFeePercentage] = useState<number>(2);

  const [msg, setMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (allSettings) {
      if (allSettings.general) {
        setBrandName(allSettings.general.brandName || "ZetaGrow");
        setTagline(allSettings.general.tagline || "Learn. Work. Grow.");
        setSupportEmail(allSettings.general.supportEmail || "support@zetagrow.com");
        setSupportPhone(allSettings.general.supportPhone || "+91 (080) 4567-8900");
      }
      if (allSettings.withdrawals) {
        setMinWithdrawal(allSettings.withdrawals.minimumWithdrawal ?? 1000);
        setMaxWithdrawal(allSettings.withdrawals.maximumWithdrawal ?? 100000);
        setDailyLimit(allSettings.withdrawals.dailyLimit ?? 25000);
        setFeePercentage(allSettings.withdrawals.feePercentage ?? 2);
      }
    }
  }, [allSettings]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setMsg("");

    try {
      await updateSettingMutation({
        token,
        key: "general",
        value: {
          brandName,
          tagline,
          supportEmail,
          supportPhone,
          primaryColor: "#176B4D",
        },
        reason: "Admin general settings update",
      });

      await updateSettingMutation({
        token,
        key: "withdrawals",
        value: {
          minimumWithdrawal: Number(minWithdrawal),
          maximumWithdrawal: Number(maxWithdrawal),
          dailyLimit: Number(dailyLimit),
          feePercentage: Number(feePercentage),
          allowedMethods: ["bank_transfer", "upi"],
        },
        reason: "Admin withdrawal limits & fees update",
      });

      setMsg("Platform settings saved and recorded in audit log.");
    } catch (err: any) {
      setMsg(err.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Platform Configuration & Settings
        </h1>
        <p className="text-xs text-textMuted">
          Centrally configure brand parameters, support contact information, withdrawal limits, and processing fees.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800">
          {msg}
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-8 text-xs">
        {/* Brand & General */}
        <div className="card-surface p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-textMain">Brand & Identity</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Support Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>
          </div>
        </div>

        {/* Withdrawal Thresholds & Fee Configuration */}
        <div className="card-surface p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-textMain">Withdrawal Thresholds & Fees</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Minimum Withdrawal (₹)</label>
              <input
                type="number"
                min={100}
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Maximum Withdrawal (₹)</label>
              <input
                type="number"
                value={maxWithdrawal}
                onChange={(e) => setMaxWithdrawal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Daily Limit (₹)</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-textMain">Fee Percentage (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={feePercentage}
                onChange={(e) => setFeePercentage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-bold text-brand-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary py-2.5 px-6 flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving Settings..." : "Save Platform Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
