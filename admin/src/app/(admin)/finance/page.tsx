"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertCircle, 
  CreditCard,
  PlusCircle,
  Building,
  Smartphone
} from "lucide-react";

export default function AdminFinancePage() {
  const { token } = useAdminAuth();

  const withdrawals = useQuery(
    api.withdrawals.getAllWithdrawalsAdmin,
    token ? { token } : "skip"
  );

  const users = useQuery(
    api.users.getAllUsers,
    token ? { token } : "skip"
  );

  const updateWithdrawalStatus = useMutation(api.withdrawals.updateWithdrawalStatus);
  const adminAdjustWallet = useMutation(api.wallets.adminAdjustWallet);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [withdrawalNote, setWithdrawalNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState("");

  // Manual Adjustment State
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustType, setAdjustType] = useState("CREDIT");
  const [adjustReason, setAdjustReason] = useState("");

  const handleWithdrawalAction = async (withdrawalId: any, status: string) => {
    if (!token) return;
    setIsProcessing(true);
    setMsg("");

    try {
      await updateWithdrawalStatus({
        token,
        withdrawalId,
        status,
        adminNote: withdrawalNote || undefined,
      });

      setMsg(`Withdrawal marked as ${status.toUpperCase()}.`);
      setSelectedWithdrawal(null);
      setWithdrawalNote("");
    } catch (err: any) {
      setMsg(err.message || "Failed to process withdrawal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !adjustUserId || !adjustReason) return;

    setIsProcessing(true);
    setMsg("");

    try {
      await adminAdjustWallet({
        token,
        userId: adjustUserId as any,
        amount: Number(adjustAmount),
        type: adjustType,
        reason: adjustReason,
      });

      setMsg("Wallet adjustment applied and recorded in audit ledger.");
      setAdjustmentModalOpen(false);
      setAdjustReason("");
    } catch (err: any) {
      setMsg(err.message || "Failed to adjust wallet.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Finance & Withdrawals Processing
          </h1>
          <p className="text-xs text-textMuted">
            Review member payout requests, verify banking details, and record audited wallet adjustments.
          </p>
        </div>

        <button
          onClick={() => setAdjustmentModalOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Wallet Adjustment</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800">
          {msg}
        </div>
      )}

      {/* Withdrawals Queue Table */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-textMain">Withdrawal Requests Queue</h3>

        {withdrawals === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-10 text-xs text-textMuted">
            No withdrawal requests currently in queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted bg-neutral-50">
                  <th className="py-3 px-3 font-semibold">User</th>
                  <th className="py-3 px-3 font-semibold">Amount</th>
                  <th className="py-3 px-3 font-semibold">Fee</th>
                  <th className="py-3 px-3 font-semibold">Net Payout</th>
                  <th className="py-3 px-3 font-semibold">Method & Payout Info</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Requested At</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-textMain block">{w.user?.name || "Member"}</span>
                      <span className="text-[11px] text-textMuted">{w.user?.email}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-textMain">
                      ₹{w.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-textMuted">
                      ₹{w.fee}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-brand-700">
                      ₹{w.netAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-textMain uppercase text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">
                          {w.payoutMethod}
                        </span>
                        {w.payoutMethod === "upi" ? (
                          <p className="font-mono text-[11px] text-brand-800">{w.payoutDetails.upiId}</p>
                        ) : (
                          <p className="text-[10px] text-textMuted leading-tight">
                            {w.payoutDetails.accountHolderName} • {w.payoutDetails.bankName} • A/C: {w.payoutDetails.accountNumber} • IFSC: {w.payoutDetails.ifscCode}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        w.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : w.status === "requested" || w.status === "under_review"
                          ? "bg-amber-100 text-amber-800"
                          : w.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-textMuted">{new Date(w.requestedAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 px-3 text-right">
                      {w.status === "requested" || w.status === "under_review" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleWithdrawalAction(w._id, "completed")}
                            disabled={isProcessing}
                            className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded font-semibold hover:bg-green-100"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleWithdrawalAction(w._id, "rejected")}
                            disabled={isProcessing}
                            className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Wallet Adjustment Modal */}
      {adjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-surface p-6 max-w-md w-full space-y-4 bg-white shadow-2xl">
            <h3 className="text-base font-bold text-textMain">Manual Wallet Adjustment</h3>
            <p className="text-xs text-textMuted">
              Credits or debits are recorded with an immutable audit entry.
            </p>

            <form onSubmit={handleManualAdjustment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-textMain">Select User *</label>
                <select
                  required
                  value={adjustUserId}
                  onChange={(e) => setAdjustUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                >
                  <option value="">Select an account...</option>
                  {users?.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) — Avail: ₹{u.availableBalance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-textMain">Type *</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-bold text-brand-700"
                  >
                    <option value="CREDIT">CREDIT (+)</option>
                    <option value="DEBIT">DEBIT (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-textMain">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-textMain">Mandatory Audit Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Incentive bonus / manual reconciliation"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentModalOpen(false)}
                  className="btn-secondary py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary py-1.5 px-4"
                >
                  {isProcessing ? "Processing..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
