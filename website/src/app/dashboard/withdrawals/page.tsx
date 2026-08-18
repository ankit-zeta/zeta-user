"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Building,
  Smartphone,
  Plus
} from "lucide-react";

export default function WithdrawalsPage() {
  const { token, user } = useAuth();
  const walletData = useQuery(
    api.wallets.getUserWallet,
    token ? { token } : "skip"
  );
  const withdrawals = useQuery(
    api.withdrawals.getUserWithdrawals,
    token ? { token } : "skip"
  );

  const requestWithdrawalMutation = useMutation(api.withdrawals.requestWithdrawal);

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [payoutMethod, setPayoutMethod] = useState<string>("upi");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState(user?.name || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const available = walletData?.wallet?.availableBalance || 0;
  const feePercent = 2; // default 2%
  const calculatedFee = Math.round((amount * feePercent) / 100);
  const netPayout = Math.max(0, amount - calculatedFee);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (amount < 1000) {
      setError("Minimum withdrawal amount is ₹1,000.");
      return;
    }
    if (amount > available) {
      setError("Amount exceeds available balance.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await requestWithdrawalMutation({
        token,
        amount,
        payoutMethod,
        payoutDetails: {
          upiId: payoutMethod === "upi" ? upiId : undefined,
          accountNumber: payoutMethod === "bank_transfer" ? accountNumber : undefined,
          ifscCode: payoutMethod === "bank_transfer" ? ifscCode : undefined,
          bankName: payoutMethod === "bank_transfer" ? bankName : undefined,
          accountHolderName: accountHolderName || undefined,
        },
      });

      setSuccess("Withdrawal request submitted successfully!");
      setTimeout(() => {
        setModalOpen(false);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit withdrawal request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Balance Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Wallet & Withdrawals
          </h1>
          <p className="text-xs text-textMuted">
            Manage your available funds from client projects and affiliate commissions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          disabled={available < 1000}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Request Withdrawal</span>
        </button>
      </div>

      {/* Wallet Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-6 space-y-1 bg-white border-2 border-brand-200">
          <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">Available to Withdraw</span>
          <p className="text-3xl font-extrabold text-brand-700">
            ₹{available.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Minimum threshold: ₹1,000</span>
        </div>

        <div className="card-surface p-6 space-y-1">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Pending Balance</span>
          <p className="text-3xl font-extrabold text-amber-700">
            ₹{(walletData?.wallet?.pendingBalance || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Under holding period</span>
        </div>

        <div className="card-surface p-6 space-y-1">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Total Withdrawn</span>
          <p className="text-3xl font-extrabold text-textMain">
            ₹{(walletData?.wallet?.totalWithdrawn || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Completed payouts</span>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-surface p-6 max-w-md w-full space-y-5 bg-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-borderSubtle pb-3">
              <h3 className="text-base font-bold text-textMain">Request Payout</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-textMuted hover:text-textMain text-xs"
              >
                Close
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textMain">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={available}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                />
              </div>

              {/* Fee Breakdown */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-borderSubtle space-y-1 text-xs text-textMuted">
                <div className="flex justify-between">
                  <span>Processing Fee (2%):</span>
                  <span>₹{calculatedFee}</span>
                </div>
                <div className="flex justify-between font-bold text-textMain pt-1 border-t border-borderSubtle">
                  <span>Net Payout to Receive:</span>
                  <span className="text-brand-700">₹{netPayout}</span>
                </div>
              </div>

              {/* Payout method selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-textMain">Payout Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("upi")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                      payoutMethod === "upi"
                        ? "border-brand-600 bg-brand-50 text-brand-700 font-bold"
                        : "border-borderSubtle bg-white text-textMuted"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod("bank_transfer")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                      payoutMethod === "bank_transfer"
                        ? "border-brand-600 bg-brand-50 text-brand-700 font-bold"
                        : "border-borderSubtle bg-white text-textMuted"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Payout Fields */}
              {payoutMethod === "upi" ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-textMain">UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-semibold text-textMain">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-textMain">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-textMain">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5 uppercase"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-textMain">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
              >
                {isSubmitting ? "Submitting Request..." : "Confirm & Submit Withdrawal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Requests History */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-textMain">Withdrawal Requests</h3>

        {withdrawals === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-2">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-xs text-textMuted">
            No withdrawal requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted">
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Fee</th>
                  <th className="py-2.5 px-3 font-semibold">Net Payout</th>
                  <th className="py-2.5 px-3 font-semibold">Method</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Requested At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td className="py-3 px-3 font-bold text-textMain">₹{w.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-textMuted">₹{w.fee}</td>
                    <td className="py-3 px-3 font-bold text-brand-700">₹{w.netAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 uppercase text-textMuted">{w.payoutMethod}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Wallet Ledger Transactions */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-textMain">Wallet Ledger Activity</h3>

        {walletData?.transactions && walletData.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted">
                  <th className="py-2.5 px-3 font-semibold">Transaction</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Balance After</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {walletData.transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="py-3 px-3 font-medium text-textMain">{tx.description}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded font-mono text-neutral-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-3 px-3 font-bold ${tx.amount > 0 ? "text-green-700" : "text-textMain"}`}>
                      {tx.amount > 0 ? `+₹${tx.amount.toLocaleString("en-IN")}` : `-₹${Math.abs(tx.amount).toLocaleString("en-IN")}`}
                    </td>
                    <td className="py-3 px-3 font-semibold text-textMuted">₹{tx.balanceAfter.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-textMuted">{new Date(tx.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-textMuted">
            No transactions in ledger.
          </div>
        )}
      </div>
    </div>
  );
}
