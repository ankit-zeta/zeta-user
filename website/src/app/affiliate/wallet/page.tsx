"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import {
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileBarChart,
} from "lucide-react";

type SavedMethod = {
  _id: string;
  type: string;
  name: string;
  details: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
    upiId?: string;
  };
  isDefault?: boolean;
};

export default function AffiliateWalletPage() {
  const { token, user } = useAuth();
  const walletData = useQuery(api.wallets.getUserWallet, token ? { token } : "skip");
  const withdrawals = useQuery(api.withdrawals.getUserWithdrawals, token ? { token } : "skip");
  const methods = useQuery(api.payoutMethods.getMyPayoutMethods, token ? { token } : "skip") as
    | SavedMethod[]
    | undefined;
  const withdrawalSettings = useQuery(api.settings.getSetting, { key: "withdrawals" }) as
    | { minimumWithdrawal?: number; maximumWithdrawal?: number }
    | undefined;

  // TDS engine — FY summary (live preview query lives below form state)
  const taxSummary = useQuery(api.tds.getMyTaxSummary, token ? { token } : "skip") as
    | {
        fyLabel: string;
        enabled: boolean;
        affiliate: { label: string; rate: number; gross: number; tds: number; threshold: number };
        work: { label: string; rate: number; gross: number; tds: number; threshold: number };
        totalTds: number;
      }
    | undefined;

  const requestMutation = useMutation(api.withdrawals.requestWithdrawal);
  const upsertMethodMutation = useMutation(api.payoutMethods.upsertPayoutMethod);

  const minWithdrawal = withdrawalSettings?.minimumWithdrawal ?? 1000;

  // Request form state
  const [amount, setAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [reqMsg, setReqMsg] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  // Live cost estimate for the amount being typed: platform fee + TDS + net
  const tdsPreview = useQuery(
    api.withdrawals.previewWithdrawalCosts,
    token && Number(amount) > 0 ? { token, amount: Number(amount) } : "skip"
  ) as
    | {
        feeSettings: { feePercentage: number; fixedFee: number; maxFee: number };
        fee: number;
        tdsEnabled: boolean;
        tdsTotal: number;
        net: number;
      }
    | undefined;

  // Add-method form state
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [methodMsg, setMethodMsg] = useState("");

  if (walletData === undefined || withdrawals === undefined || methods === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const wallet = walletData.wallet;
  const available = wallet?.availableBalance || 0;
  const hasPending = withdrawals.some((w) => w.status === "requested" || w.status === "processing");

  // TDS compliance: withdrawals unlock only after KYC verification
  const kycStatus = (user as any)?.kycStatus || "not_submitted";
  const kycVerified = kycStatus === "verified";

  const upiMethods = methods.filter((m) => m.type === "upi" || m.type === "upi_qr");
  const bankMethods = methods.filter((m) => m.type === "bank_transfer");
  const payoutReady = upiMethods.length > 0 && bankMethods.length > 0;
  const withdrawableMethods = methods.filter(
    (m) => m.type === "upi" || m.type === "upi_qr" || m.type === "bank_transfer"
  );

  const affiliateTxns = (walletData.transactions || []).filter(
    (t) => t.type === "AFFILIATE_COMMISSION" || t.type === "CHAIN_COMMISSION" || t.type === "WITHDRAWAL"
  );

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setMethodMsg("");
    try {
      await upsertMethodMutation({
        token,
        type: "upi",
        name: `UPI · ${upiId.split("@")[0]}`,
        details: { upiId },
      });
      setUpiId("");
      setMethodMsg("UPI details saved.");
    } catch (err: any) {
      setMethodMsg(err.message || "Failed to save UPI details.");
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setMethodMsg("");
    try {
      await upsertMethodMutation({
        token,
        type: "bank_transfer",
        name: `${bankName} · ••${accountNumber.slice(-4)}`,
        details: { bankName, accountNumber, ifscCode, accountHolderName },
      });
      setBankName("");
      setAccountNumber("");
      setIfscCode("");
      setAccountHolderName("");
      setMethodMsg("Bank details saved.");
    } catch (err: any) {
      setMethodMsg(err.message || "Failed to save bank details.");
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!kycVerified) {
      setReqMsg("Complete your KYC verification before requesting a withdrawal.");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setReqMsg("Enter a valid amount.");
      return;
    }
    if (!selectedMethodId) {
      setReqMsg("Select a payout method.");
      return;
    }
    setIsRequesting(true);
    setReqMsg("");
    try {
      const method = withdrawableMethods.find((m) => m._id === selectedMethodId);
      await requestMutation({
        token,
        amount: amt,
        payoutMethod: method?.type || "upi",
        payoutDetails: {},
        payoutMethodId: selectedMethodId as any,
      });
      setReqMsg("Withdrawal request submitted! Admin will process your payout shortly.");
      setAmount("");
    } catch (err: any) {
      setReqMsg(err.message || "Failed to submit withdrawal request.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="space-y-8 text-neutral-100">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Wallet &amp; Payouts</h1>
        <p className="text-xs text-neutral-400">
          Your affiliate commission balance, withdrawal requests and full transaction history.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-brand-700 bg-gradient-to-br from-brand-900/50 to-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-brand-300">
            <Wallet className="w-3.5 h-3.5" /> Affiliate Earnings
          </span>
          <p className="text-2xl font-extrabold">
            ₹{(wallet?.affiliateEarnings || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-neutral-500 block">Lifetime commission earned</span>
        </div>
        <div className="rounded-2xl border border-brand-700 bg-gradient-to-br from-brand-900/50 to-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-brand-300">
            <Landmark className="w-3.5 h-3.5" /> Available for Withdrawal
          </span>
          <p className="text-2xl font-extrabold">₹{available.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-neutral-500 block">
            Affiliate ₹{(wallet?.affiliateEarnings || 0).toLocaleString("en-IN")} · Work ₹
            {(wallet?.workEarnings || 0).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Withdrawn
          </span>
          <p className="text-2xl font-extrabold">
            ₹{(wallet?.totalWithdrawn || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-neutral-500 block">
            {withdrawals.length} payout request{withdrawals.length === 1 ? "" : "s"} lifetime
          </span>
        </div>
      </div>

      {/* ── FY Tax Summary (TDS) ───────────────────────────────────────────── */}
      {taxSummary?.enabled && (
        <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileBarChart className="w-4 h-4 text-brand-400" /> Tax Summary · {taxSummary.fyLabel}
            </h3>
            <span className="text-[10px] text-neutral-500">Apr – Mar financial year</span>
          </div>
          {taxSummary.totalTds === 0 ? (
            <p className="text-[11px] text-neutral-500">
              No TDS deducted yet this financial year. TDS applies only on payouts above your yearly
              threshold — 2% on affiliate commissions above ₹20,000, 10% on work earnings above ₹50,000.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TaxCard
                  title={`Affiliate (${taxSummary.affiliate.label} · ${taxSummary.affiliate.rate}%)`}
                  gross={taxSummary.affiliate.gross}
                  tds={taxSummary.affiliate.tds}
                />
                <TaxCard
                  title={`Work (${taxSummary.work.label} · ${taxSummary.work.rate}%)`}
                  gross={taxSummary.work.gross}
                  tds={taxSummary.work.tds}
                />
                <div className="rounded-xl border border-brand-800 bg-brand-950/30 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total TDS deducted</p>
                  <p className="text-lg font-extrabold text-amber-400 mt-1">₹{taxSummary.totalTds.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Claimable in your income tax return</p>
                </div>
              </div>
              <p className="text-[10px] text-neutral-600">
                Deducted TDS is deposited with the Income Tax Department against your PAN and appears in your
                Form 26AS / AIS. Form 16A is issued quarterly.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Request withdrawal ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Request Withdrawal</h3>
          <span className="text-[10px] text-neutral-500">
            Minimum ₹{minWithdrawal.toLocaleString("en-IN")} · Paid manually by admin after verification
          </span>
        </div>

        {/* Gate: KYC must be verified before any payout */}
        {!kycVerified ? (
          <a
            href="/dashboard/kyc"
            className="flex items-center gap-3 rounded-xl border border-amber-900 bg-amber-950/40 p-4 hover:bg-amber-950/60 transition-colors"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-200">
                {kycStatus === "pending"
                  ? "KYC under review — withdrawals unlock once approved"
                  : kycStatus === "rejected"
                    ? "KYC rejected — resubmit your documents to unlock withdrawals"
                    : "Complete KYC verification to unlock withdrawals"}
              </p>
              <p className="text-[11px] text-amber-200/70 mt-0.5">
                PAN &amp; Aadhaar verification is required for TDS-compliant payouts. Takes ~2 minutes.
              </p>
            </div>
            <span className="btn-primary text-[11px] py-2 px-3 shrink-0">
              {kycStatus === "pending" ? "View Status" : "Verify Now"}
            </span>
          </a>
        ) : !payoutReady ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-900 bg-amber-950/40 p-4">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200 leading-relaxed">
                To enable withdrawals, please save <strong>both</strong> your UPI details{" "}
                <strong>and</strong> your bank account details below. Payouts are sent manually by our
                team after admin confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Add UPI */}
              <form onSubmit={handleSaveUpi} className="space-y-3 rounded-xl border border-neutral-800 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Add UPI Details
                  {upiMethods.length > 0 && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 ml-auto" />
                  )}
                </span>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  required
                  className="w-full bg-black/30 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-600"
                />
                <button type="submit" className="btn-primary text-xs py-2 px-4 w-full">
                  Save UPI
                </button>
              </form>

              {/* Add Bank */}
              <form onSubmit={handleSaveBank} className="space-y-3 rounded-xl border border-neutral-800 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> Add Bank Details
                  {bankMethods.length > 0 && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 ml-auto" />
                  )}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank name"
                    required
                    className="bg-black/30 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-600 col-span-2"
                  />
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account number"
                    required
                    className="bg-black/30 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-600 col-span-2"
                  />
                  <input
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="IFSC code"
                    required
                    className="bg-black/30 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-600"
                  />
                  <input
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Account holder name"
                    required
                    className="bg-black/30 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-600"
                  />
                </div>
                <button type="submit" className="btn-primary text-xs py-2 px-4 w-full">
                  Save Bank Details
                </button>
              </form>
            </div>
            {methodMsg && (
              <p className="text-[11px] text-brand-300">{methodMsg}</p>
            )}
          </div>
        ) : hasPending ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-900 bg-amber-950/40 p-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              You already have a pending withdrawal under review. You can request again once it is
              processed.
            </p>
          </div>
        ) : available < minWithdrawal ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <Wallet className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-neutral-200 font-semibold">
                  {available === 0
                    ? "No withdrawable balance yet"
                    : `₹${available.toLocaleString("en-IN")} available — ₹${minWithdrawal.toLocaleString("en-IN")} minimum required`}
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {available === 0
                    ? "Your earnings will appear here once commissions clear the holding period (typically 7–30 days after a sale). Keep sharing your referral link to earn more."
                    : "Keep earning to reach the minimum withdrawal threshold."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/affiliate"
                className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                View affiliate stats →
              </a>
              <span className="text-neutral-700">·</span>
              <a
                href="/affiliate/earnings"
                className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Commission ledger →
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min={minWithdrawal}
                  max={available}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ₹${minWithdrawal.toLocaleString("en-IN")}`}
                  required
                  className="w-full bg-black/30 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600"
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(available))}
                  className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold"
                >
                  Withdraw full balance (₹{available.toLocaleString("en-IN")})
                </button>
                {/* Live cost breakdown: fee + TDS + net */}
                {Number(amount) > 0 && tdsPreview && (
                  <div className="mt-2 rounded-lg border border-neutral-800 bg-black/20 px-3 py-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>
                        Processing fee
                        {tdsPreview.feeSettings.feePercentage > 0
                          ? ` (${tdsPreview.feeSettings.feePercentage}%${tdsPreview.feeSettings.maxFee > 0 ? `, max ₹${tdsPreview.feeSettings.maxFee}` : ""})`
                          : ""}
                      </span>
                      <span className={tdsPreview.fee > 0 ? "text-neutral-200 font-semibold" : "text-green-400 font-semibold"}>
                        {tdsPreview.fee > 0 ? `− ₹${tdsPreview.fee.toLocaleString("en-IN")}` : "₹0 · currently free"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>TDS (Income Tax)</span>
                      {tdsPreview.tdsTotal > 0 ? (
                        <span className="text-amber-400 font-semibold">− ₹{tdsPreview.tdsTotal.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-green-400 font-semibold">₹0</span>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-neutral-800">
                      <span className="text-neutral-300 font-semibold">You'd receive approx.</span>
                      <span className="text-brand-300 font-bold">₹{tdsPreview.net.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[9px] text-neutral-600 leading-snug">
                      TDS is deducted as per Income Tax rules and reported against your PAN — claimable in your ITR.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Payout method
                </label>
                <select
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                  required
                  className="w-full bg-black/30 border border-neutral-700 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-brand-600 capitalize"
                >
                  <option value="">Select method…</option>
                  {withdrawableMethods.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.type === "bank_transfer"
                        ? `${m.details.bankName || "Bank"} ••${(m.details.accountNumber || "").slice(-4)}`
                        : `UPI · ${m.details.upiId || ""}`}
                      {m.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-600">
                  Payouts are processed manually within 3–7 business days after admin verification.
                </p>
              </div>
            </div>
            {reqMsg && (
              <p className={`text-[11px] ${reqMsg.includes("submitted") ? "text-green-400" : "text-red-400"}`}>
                {reqMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={isRequesting || available < minWithdrawal}
              className="btn-primary text-xs py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isRequesting ? "Submitting…" : `Request Withdrawal`}
            </button>
            {available < minWithdrawal && (
              <p className="text-[11px] text-amber-400">
                You need at least ₹{minWithdrawal.toLocaleString("en-IN")} available to request a payout.
              </p>
            )}
          </form>
        )}
      </div>

      {/* Payout requests */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        <h3 className="text-sm font-bold">Payout Requests</h3>
        {withdrawals.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">
            No payout requests yet. Request a withdrawal once commissions clear the holding period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Method</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Requested</th>
                  <th className="py-2.5 px-3 font-semibold">Admin note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td className="py-3 px-3 font-bold">₹{w.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-neutral-400 capitalize">
                      {w.payoutMethod.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          w.status === "completed"
                            ? "bg-green-950 text-green-400"
                            : w.status === "rejected"
                            ? "bg-red-950 text-red-400"
                            : "bg-amber-950 text-amber-400"
                        }`}
                      >
                        {w.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-500">
                      {new Date(w.requestedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 max-w-[200px] truncate" title={w.adminNote || ""}>
                      {(w as any).adminNote || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        <h3 className="text-sm font-bold">Transaction History</h3>
        {affiliateTxns.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {affiliateTxns.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between py-2.5 border-b border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.amount > 0 ? "bg-green-950 text-green-400" : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{tx.description}</p>
                    <p className="text-[10px] text-neutral-500">
                      {tx.type.replace(/_/g, " ")} ·{" "}
                      {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p
                    className={`text-sm font-bold ${
                      tx.amount > 0 ? "text-green-400" : "text-neutral-200"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-neutral-500 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaxCard({ title, gross, tds }: { title: string; gross: number; tds: number }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black/20 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{title}</p>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-sm font-bold text-neutral-200">₹{gross.toLocaleString("en-IN")}</span>
        {tds > 0 && (
          <span className="text-[10px] text-amber-400 font-semibold">− ₹{tds.toLocaleString("en-IN")} TDS</span>
        )}
      </div>
      <p className="text-[9px] text-neutral-600 mt-0.5">paid out this FY</p>
    </div>
  );
}
