"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  TrendingUp, 
  Users, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ShieldCheck,
  Save,
  UserPlus,
  UserMinus,
  Crown
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPartnerPage() {
  const { token } = useAdminAuth();

  const partnerSettings = useQuery(
    api.settings.getSettingAdmin,
    token ? { token, key: "partner" } : "skip"
  );

  const sales = useQuery(
    api.affiliates.getAllAffiliateSalesAdmin,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    _creationTime: number;
    purchaseId: string;
    buyerUserId: string;
    referrerUserId: string;
    programId: string;
    saleAmount: number;
    commissionAmount: number;
    status: string;
    ruleUsed: string;
    holdingPeriodEndsAt: number;
    createdAt: number;
    updatedAt: number;
    kind: string | undefined;
    awaitingConsumption: boolean | undefined;
    parentSaleId: string | undefined;
    chainLevel: number | undefined;
    baseCommissionAmount: number | undefined;
    buyer: { _id: string; name: string; email: string } | null;
    referrer: { _id: string; name: string; email: string; referralCode: string } | null;
    program: { _id: string; name: string; price: number } | null;
  }> | undefined;

  const referrals = useQuery(
    api.referrals.getAllReferralsAdmin,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    referralCode: string;
    status: string;
    createdAt: number;
    referrer: { _id: string; name: string; email: string; referralCode: string } | null;
    referred: { _id: string; name: string; email: string } | null;
  }> | undefined;

  const partners = useQuery(
    api.partners.getPartnerDirectoryAdmin,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    name: string;
    email: string;
    referralCode: string;
    positionName: string | null;
    chainPct: number;
    partnerSince: number | null;
  }> | undefined;

  const positions = useQuery(
    api.positions.getAllPositions,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    name: string;
    badgeColor: string;
    sortOrder: number;
  }> | undefined;

  const allUsers = useQuery(
    api.users.getAllUsers,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    name: string;
    email: string;
    referralCode: string;
    partnerTier: string | undefined;
    positionId: string | undefined;
    status: string;
  }> | undefined;

  const updateSettingMutation = useMutation(api.settings.updateSetting);
  const updateCommissionStatusMutation = useMutation(api.affiliates.updateCommissionStatus);
  const addPartnerMutation = useMutation(api.partners.addPartner);
  const removePartnerMutation = useMutation(api.partners.removePartner);

  const [activeTab, setActiveTab] = useState<"sales" | "referrals" | "partners" | "settings">("sales");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerMsg, setPartnerMsg] = useState("");

  // Settings form state
  const [enabled, setEnabled] = useState(true);
  const [commissionMethod, setCommissionMethod] = useState("lower_program_rule");
  const [defaultPercentage, setDefaultPercentage] = useState<number>(50);
  const [holdingPeriodDays, setHoldingPeriodDays] = useState<number>(7);
  const [minimumPurchaseAmount, setMinimumPurchaseAmount] = useState<number>(2000);
  const [teamEnabled, setTeamEnabled] = useState(false);
  const [teamLevels, setTeamLevels] = useState<Record<string, number>>({});
  const [settingsMsg, setSettingsMsg] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sync settings when loaded
  React.useEffect(() => {
    if (partnerSettings) {
      setEnabled(partnerSettings.enabled ?? true);
      setCommissionMethod(partnerSettings.commissionMethod || "lower_program_rule");
      setDefaultPercentage(partnerSettings.defaultPercentage ?? 50);
      setHoldingPeriodDays(partnerSettings.holdingPeriodDays ?? 7);
      setMinimumPurchaseAmount(partnerSettings.minimumPurchaseAmount ?? 2000);
      setTeamEnabled(!!partnerSettings.chainEnabled);
      setTeamLevels(partnerSettings.chainLevels || {});
    }
  }, [partnerSettings]);

const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingSettings(true);
    setSettingsMsg("");

    try {
      await updateSettingMutation({
        token,
        key: "partner",
        value: {
          enabled,
          commissionMethod,
          defaultPercentage: Number(defaultPercentage),
          holdingPeriodDays: Number(holdingPeriodDays),
          minimumPurchaseAmount: Number(minimumPurchaseAmount),
          chainEnabled: teamEnabled,
          chainLevels: teamLevels,
        },
        reason: "Admin partner settings modification",
      });
      setSettingsMsg("Partner engine settings saved successfully!");
    } catch (err: any) {
      setSettingsMsg(err.message || "Failed to update settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddPartner = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (!token) return;
    setPartnerMsg("");
    try {
      await addPartnerMutation({ token, userId });
      setPartnerMsg("Growth Partner added successfully!");
    } catch (err: any) {
      setPartnerMsg(err.message || "Failed to add partner.");
    }
  };

  const handleRemovePartner = async (userId: string) => {
    if (!token) return;
    setPartnerMsg("");
    try {
      await removePartnerMutation({ token, userId });
      setPartnerMsg("Growth Partner removed.");
    } catch (err: any) {
      setPartnerMsg(err.message || "Failed to remove partner.");
    }
  };

  const handleStatusChange = async (saleId: any, status: string, reason: string) => {
    if (!token) return;
    try {
      await updateCommissionStatusMutation({
        token,
        saleId,
        status,
        reason,
      });
      toast.success(`Commission ${status}`, { description: `Sale record updated to "${status}".` });
    } catch {
      toast.error("Action failed", { description: "Could not update commission status. Please try again." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Partner & Remuneration Engine
        </h1>
        <p className="text-xs text-textMuted">
          Configure dynamic remuneration calculation rules, monitor direct downline attribution, and approve earnings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-borderSubtle pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "sales"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-textMuted hover:bg-neutral-100 hover:text-textMain"
          }`}
        >
          Earnings Log ({sales?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("referrals")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "referrals"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-textMuted hover:bg-neutral-100 hover:text-textMain"
          }`}
        >
          Partner Network ({referrals?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("partners")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "partners"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-textMuted hover:bg-neutral-100 hover:text-textMain"
          }`}
        >
          Growth Partners ({partners?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "settings"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-textMuted hover:bg-neutral-100 hover:text-textMain"
          }`}
        >
          Configurable Remuneration Rules
        </button>
      </div>

      {/* TAB 1: Sales */}
      {activeTab === "sales" && (
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-textMain">Earnings Log</h3>

          {sales === undefined ? (
            <div className="p-8 text-center animate-pulse space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-10 text-xs text-textMuted">
              No partner earnings recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-borderSubtle text-textMuted bg-neutral-50">
                    <th className="py-3 px-3 font-semibold">Referrer</th>
                    <th className="py-3 px-3 font-semibold">Buyer</th>
                    <th className="py-3 px-3 font-semibold">Program</th>
                    <th className="py-3 px-3 font-semibold">Sale</th>
                    <th className="py-3 px-3 font-semibold">Earnings</th>
                    <th className="py-3 px-3 font-semibold">Applied Rule</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderSubtle">
                  {sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-textMain block">{sale.referrer?.name}</span>
                        <span className="text-[10px] text-brand-700 font-mono">{sale.referrer?.referralCode}</span>
                      </td>
                      <td className="py-3 px-3 text-textMain">
                        {sale.buyer?.name}
                      </td>
                      <td className="py-3 px-3 text-textMuted">
                        {sale.program?.name}
                      </td>
                      <td className="py-3 px-3 font-semibold text-textMain">
                        ₹{sale.saleAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-brand-700">
                        ₹{sale.commissionAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-textMuted max-w-xs truncate">
                        {sale.ruleUsed}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          sale.status === "available" || sale.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : sale.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {sale.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(sale._id, "available", "Admin approved commission")}
                                className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded font-semibold hover:bg-green-100"
                                title="Approve & Release to Available Wallet"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(sale._id, "rejected", "Admin rejected commission")}
                                className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold hover:bg-red-100"
                                title="Reject"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(sale.status === "available" || sale.status === "approved") && (
                            <button
                              onClick={() => handleStatusChange(sale._id, "reversed", "Admin refunded/reversed commission")}
                              className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 flex items-center gap-1"
                              title="Reverse Commission"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reverse</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Referrals */}
      {activeTab === "referrals" && (
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-textMain">Partner Downline Relationships</h3>
          {referrals && referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-borderSubtle text-textMuted bg-neutral-50">
                    <th className="py-3 px-3 font-semibold">Partner (Sponsor)</th>
                    <th className="py-3 px-3 font-semibold">Referred User (Customer)</th>
                    <th className="py-3 px-3 font-semibold">Code Used</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderSubtle">
                  {referrals.map((ref) => (
                    <tr key={ref._id}>
                      <td className="py-3 px-3">
                        <span className="font-bold text-textMain">{ref.referrer?.name}</span>
                        <span className="text-[11px] text-textMuted block">{ref.referrer?.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-textMain">{ref.referred?.name}</span>
                        <span className="text-[11px] text-textMuted block">{ref.referred?.email}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-brand-700">{ref.referralCode}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase">
                          {ref.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-textMuted">{new Date(ref.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-textMuted">No partner links registered yet.</div>
          )}
        </div>
      )}

      {/* TAB 3: Configurable Settings */}
      {activeTab === "settings" && (
        <div className="card-surface p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-textMain">Configurable Remuneration Calculation Rules</h3>
            <p className="text-xs text-textMuted">
              Adjust remuneration formula and holding period without editing application source code.
            </p>
          </div>

          {settingsMsg && (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800">
              {settingsMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-textMain">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded border-borderSubtle text-brand-600"
                />
                <span>Enable Partner Referral Engine</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textMain">Remuneration Calculation Method *</label>
              <select
                value={commissionMethod}
                onChange={(e) => setCommissionMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-medium"
              >
                <option value="lower_program_rule">
                  50% of Lower-Valued Program (Recommended)
                </option>
                <option value="flat_percentage">
                  Flat Percentage of Program Price
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-textMain">Remuneration Percentage (%) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={defaultPercentage}
                  onChange={(e) => setDefaultPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-textMain">Holding Period (Days) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={90}
                  value={holdingPeriodDays}
                  onChange={(e) => setHoldingPeriodDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textMain">Minimum Purchase Amount for Remuneration (₹)</label>
              <input
                type="number"
                value={minimumPurchaseAmount}
                onChange={(e) => setMinimumPurchaseAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold text-textMain">
                <input
                  type="checkbox"
                  checked={teamEnabled}
                  onChange={(e) => setTeamEnabled(e.target.checked)}
                  className="rounded border-borderSubtle text-brand-600"
                />
                <span>Enable Team Remuneration (Upline Earnings)</span>
              </label>
              <p className="text-[10px] text-textMuted">
                Allow Growth Partners to earn a percentage of their downline's partner remuneration.
              </p>
            </div>

            {teamEnabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-textMain">Team Levels (% per Position)</label>
                  <p className="text-[10px] text-textMuted">Set the team remuneration % for each position. Only Growth Partners with these positions earn team remuneration.</p>
                </div>
                {positions && positions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {positions.map((p) => (
                      <div key={p._id} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          {p.name}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="1"
                            min={0}
                            max={100}
                            value={teamLevels[p._id] ?? 0}
                            onChange={(e) =>
                              setTeamLevels((prev) => ({ ...prev, [p._id]: Number(e.target.value) }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm font-bold text-center"
                          />
                          <span className="text-[10px] font-bold text-neutral-400">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-textMuted">No positions configured yet.</p>
                )}
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="btn-primary py-2 px-4 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? "Saving Settings..." : "Save Engine Rules"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Growth Partners */}
      {activeTab === "partners" && (
        <div className="card-surface p-6 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" /> Growth Partner Management
              </h3>
            </div>
            <p className="text-xs text-textMuted">
              Growth Partners unlock exclusive team remuneration levels and the Partnership section in the Partner Center.
              Invite users who have demonstrated consistent impact and trustworthiness.
            </p>
          </div>

          {partnerMsg && (
            <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-700">
              {partnerMsg}
            </div>
          )}

          {/* Current Growth Partners */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-textMain">Current Growth Partners ({partners?.length || 0})</h4>
            {partners && partners.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-borderSubtle text-textMuted">
                      <th className="py-2.5 px-3 font-semibold">Name</th>
                      <th className="py-2.5 px-3 font-semibold">Email</th>
                      <th className="py-2.5 px-3 font-semibold">Referral Code</th>
                      <th className="py-2.5 px-3 font-semibold">Position</th>
                      <th className="py-2.5 px-3 font-semibold">Team %</th>
                      <th className="py-2.5 px-3 font-semibold">Partner Since</th>
                      <th className="py-2.5 px-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderSubtle">
                    {partners.map((p) => (
                      <tr key={p._id}>
                        <td className="py-3 px-3 font-bold text-textMain">{p.name}</td>
                        <td className="py-3 px-3 text-textMuted">{p.email}</td>
                        <td className="py-3 px-3 font-mono font-bold text-brand-700">{p.referralCode}</td>
                        <td className="py-3 px-3 text-textMuted">{p.positionName || "—"}</td>
                        <td className="py-3 px-3 font-bold text-brand-600">{p.chainPct}%</td>
                        <td className="py-3 px-3 text-textMuted">
                          {p.partnerSince ? new Date(p.partnerSince).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleRemovePartner(p._id)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-xs text-textMuted">No Growth Partners yet.</p>
            )}
          </div>

          {/* Add New Growth Partner */}
          <div className="border-t border-borderSubtle pt-6">
            <h4 className="text-sm font-bold text-textMain mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Invite New Growth Partner
            </h4>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Search User</label>
                  <input
                    type="text"
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    placeholder="Search by name, email, or referral code..."
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {allUsers && allUsers.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allUsers
                    .filter((u) =>
                      u.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                      u.referralCode.toLowerCase().includes(partnerSearch.toLowerCase())
                    )
                    .filter((u) => u.status === "active" && !(partners?.some((p) => p._id === u._id)))
                    .map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-3 rounded-lg border border-borderSubtle bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-textMain truncate">{u.name}</p>
                            <p className="text-[10px] text-textMuted truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{u.referralCode}</span>
                          <button
                            onClick={(e) => { e.preventDefault(); handleAddPartner(e, u._id); }}
                            className="btn-primary text-[11px] py-1.5 px-3"
                          >
                            Add as Partner
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {allUsers && allUsers.filter((u) => u.status === "active" && !(partners?.some((p) => p._id === u._id))).length === 0 && (
                <p className="text-center py-4 text-xs text-textMuted">No eligible users found.</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
