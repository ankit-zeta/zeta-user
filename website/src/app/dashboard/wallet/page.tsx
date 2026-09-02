"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation, useAction } from "convex/react";
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
  Briefcase,
  Users,
  QrCode,
  Upload,
  Trash2,
  Star,
  ExternalLink,
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
    qrImageUrl?: string;
  };
  isDefault?: boolean;
  qrImageUrl?: string | null;
};

function txnSourceLabel(tx: { type: string; description: string }) {
  if (tx.type === "WORK_PAYOUT") return "Work";
  if (tx.type === "AFFILIATE_COMMISSION" || tx.type === "CHAIN_COMMISSION") return "Partner";
  if (tx.type === "WITHDRAWAL") return "Withdrawal";
  if (tx.type === "ADMIN_ADJUSTMENT") return "Admin";
  if (tx.type === "REFUND") return "Refund";
  return tx.type.replace(/_/g, " ");
}

function txnSourceIcon(tx: { type: string }) {
  if (tx.type === "WORK_PAYOUT") return Briefcase;
  if (tx.type === "AFFILIATE_COMMISSION" || tx.type === "CHAIN_COMMISSION") return Users;
  return ArrowDownLeft;
}

export default function DashboardWalletPage() {
  const { token, user } = useAuth();
  const walletData = useQuery(api.wallets.getUserWallet, token ? { token } : "skip");
  const withdrawals = useQuery(api.withdrawals.getUserWithdrawals, token ? { token } : "skip");
  const methods = useQuery(api.payoutMethods.getMyPayoutMethods, token ? { token } : "skip") as
    | SavedMethod[]
    | undefined;
  const withdrawalSettings = useQuery(api.settings.getSetting, { key: "withdrawals" }) as
    | { minimumWithdrawal?: number; maximumWithdrawal?: number }
    | undefined;

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
  const deleteMethodMutation = useMutation(api.payoutMethods.deletePayoutMethod);
  const setDefaultMutation = useMutation(api.payoutMethods.setDefaultPayoutMethod);
  const generateQrUploadUrl = useAction(api.payoutMethods.generatePayoutMethodQrUploadUrl);

  const minWithdrawal = withdrawalSettings?.minimumWithdrawal ?? 1000;

  const [amount, setAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [reqMsg, setReqMsg] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

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

  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [methodMsg, setMethodMsg] = useState("");
  const [activeMethodTab, setActiveMethodTab] = useState<"upi" | "bank" | "qr">("upi");
  const [qrUploading, setQrUploading] = useState(false);
  const [qrStorageId, setQrStorageId] = useState<string>("");
  const [qrPreview, setQrPreview] = useState<string>("");

  if (walletData === undefined || withdrawals === undefined || methods === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const wallet = walletData.wallet;
  const available = wallet?.availableBalance || 0;
  const workEarnings = wallet?.workEarnings || 0;
  const affiliateEarnings = wallet?.affiliateEarnings || 0;
  const hasPending = withdrawals.some((w) => w.status === "requested" || w.status === "processing");

  const kycStatus = (user as any)?.kycStatus || "not_submitted";
  const kycVerified = kycStatus === "verified";

  const upiMethods = methods.filter((m) => m.type === "upi");
  const bankMethods = methods.filter((m) => m.type === "bank_transfer");
  const qrMethods = methods.filter((m) => m.type === "upi_qr");
  const payoutReady = methods.length > 0;
  const withdrawableMethods = methods.filter(
    (m) => m.type === "upi" || m.type === "upi_qr" || m.type === "bank_transfer"
  );

  const allTxns = walletData.transactions || [];

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

  const handleQrUpload = async (file: File) => {
    if (!token || !file) return;
    setQrUploading(true);
    setMethodMsg("");
    try {
      const url = await generateQrUploadUrl();
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!resp.ok) throw new Error("Upload failed");
      const { storageId } = JSON.parse(await resp.text());
      setQrStorageId(storageId);
      setQrPreview(URL.createObjectURL(file));
    } catch (err: any) {
      setMethodMsg(err.message || "QR upload failed");
    } finally {
      setQrUploading(false);
    }
  };

  const handleSaveQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !qrStorageId) return;
    setMethodMsg("");
    try {
      await upsertMethodMutation({
        token,
        type: "upi_qr",
        name: `UPI QR · ${accountHolderName || "My QR"}`,
        details: { qrImageUrl: qrStorageId, accountHolderName },
      });
      setQrStorageId("");
      setQrPreview("");
      setAccountHolderName("");
      setMethodMsg("QR code saved.");
    } catch (err: any) {
      setMethodMsg(err.message || "Failed to save QR code.");
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!token) return;
    try {
      await deleteMethodMutation({ token, id: methodId as any });
      setMethodMsg("Payment method removed.");
    } catch (err: any) {
      setMethodMsg(err.message || "Failed to delete method.");
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!token) return;
    try {
      await setDefaultMutation({ token, id: methodId as any });
      setMethodMsg("Default method updated.");
    } catch (err: any) {
      setMethodMsg(err.message || "Failed to update default.");
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
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">My Wallet</h1>
        <p className="text-xs text-textMuted">
          Your combined earnings from work and referrals. Withdraw funds, manage payment methods, and view full transaction history.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5 space-y-2 border-brand-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Available Balance
          </span>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{available.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">Ready to withdraw</span>
        </div>
        <div className="card-surface p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Work Earnings
          </span>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{workEarnings.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">From completed jobs</span>
        </div>
        <div className="card-surface p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Partner Earnings
          </span>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{affiliateEarnings.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">From partner remuneration</span>
        </div>
        <div className="card-surface p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Withdrawn
          </span>
          <p className="text-2xl font-extrabold text-textMain">
            ₹{(wallet?.totalWithdrawn || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-textMuted block">
            {withdrawals.length} payout request{withdrawals.length === 1 ? "" : "s"} lifetime
          </span>
        </div>
      </div>

      {/* FY Tax Summary */}
      {taxSummary?.enabled && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 text-textMain">
              <FileBarChart className="w-4 h-4 text-brand-600" /> Tax Summary · {taxSummary.fyLabel}
            </h3>
            <span className="text-[10px] text-textMuted">Apr – Mar financial year</span>
          </div>
          {taxSummary.totalTds === 0 ? (
            <p className="text-[11px] text-textMuted">
              No TDS deducted yet this financial year. TDS applies only on payouts above your yearly
              threshold — 2% on partner remuneration above ₹20,000, 10% on work earnings above ₹50,000.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-borderSubtle bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">
                    Partner ({taxSummary.affiliate.label} · {taxSummary.affiliate.rate}%)
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-bold text-textMain">₹{taxSummary.affiliate.gross.toLocaleString("en-IN")}</span>
                    {taxSummary.affiliate.tds > 0 && (
                      <span className="text-[10px] text-amber-600 font-semibold">− ₹{taxSummary.affiliate.tds.toLocaleString("en-IN")} TDS</span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-borderSubtle bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">
                    Work ({taxSummary.work.label} · {taxSummary.work.rate}%)
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-bold text-textMain">₹{taxSummary.work.gross.toLocaleString("en-IN")}</span>
                    {taxSummary.work.tds > 0 && (
                      <span className="text-[10px] text-amber-600 font-semibold">− ₹{taxSummary.work.tds.toLocaleString("en-IN")} TDS</span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Total TDS deducted</p>
                  <p className="text-lg font-extrabold text-amber-600 mt-1">₹{taxSummary.totalTds.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-textMuted mt-0.5">Claimable in your income tax return</p>
                </div>
              </div>
              <p className="text-[10px] text-textMuted">
                Deducted TDS is deposited with the Income Tax Department against your PAN and appears in your
                Form 26AS / AIS. Form 16A is issued quarterly.
              </p>
            </>
          )}
        </div>
      )}

      {/* Request withdrawal */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-textMain">Request Withdrawal</h3>
          <span className="text-[10px] text-textMuted">
            Minimum ₹{minWithdrawal.toLocaleString("en-IN")} · Paid manually by admin after verification
          </span>
        </div>

        {!kycVerified ? (
          <a
            href="/dashboard/kyc"
            className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-800">
                {kycStatus === "pending"
                  ? "KYC under review — withdrawals unlock once approved"
                  : kycStatus === "rejected"
                    ? "KYC rejected — resubmit your documents to unlock withdrawals"
                    : "Complete KYC verification to unlock withdrawals"}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                PAN &amp; Aadhaar verification is required for TDS-compliant payouts. Takes ~2 minutes.
              </p>
            </div>
            <span className="btn-primary text-[11px] py-2 px-3 shrink-0">
              {kycStatus === "pending" ? "View Status" : "Verify Now"}
            </span>
          </a>
        ) : !payoutReady ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Add at least <strong>one</strong> payout method below to enable withdrawals. You can add UPI, bank account, or UPI QR code.
                Payouts are sent manually by our team after admin confirmation.
              </p>
            </div>

            {/* Saved methods */}
            {methods.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Saved Methods</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {methods.map((m) => (
                    <div key={m._id} className="flex items-center gap-3 p-3 rounded-lg border border-borderSubtle bg-white">
                      {m.type === "upi_qr" && m.qrImageUrl && (
                        <img src={m.qrImageUrl} alt="UPI QR" className="w-10 h-10 rounded object-cover border" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-textMain truncate">
                          {m.type === "bank_transfer"
                            ? `${m.details.bankName || "Bank"} ••${(m.details.accountNumber || "").slice(-4)}`
                            : m.type === "upi_qr"
                            ? `UPI QR · ${m.details.accountHolderName || ""}`
                            : `UPI · ${m.details.upiId || ""}`}
                        </p>
                        <p className="text-[10px] text-textMuted capitalize">{m.type.replace("_", " ")}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!m.isDefault && (
                          <button onClick={() => handleSetDefault(m._id)} className="p-1 rounded hover:bg-neutral-100" title="Set as default">
                            <Star className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        )}
                        {m.isDefault && (
                          <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">DEFAULT</span>
                        )}
                        <button onClick={() => handleDeleteMethod(m._id)} className="p-1 rounded hover:bg-red-50" title="Remove">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new method tabs */}
            <div className="space-y-3">
              <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg">
                {([
                  { key: "upi" as const, label: "UPI ID", icon: Smartphone },
                  { key: "bank" as const, label: "Bank Account", icon: Landmark },
                  { key: "qr" as const, label: "UPI QR Code", icon: QrCode },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveMethodTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-colors ${
                      activeMethodTab === tab.key
                        ? "bg-white text-textMain shadow-sm"
                        : "text-textMuted hover:text-textMain"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* UPI form */}
              {activeMethodTab === "upi" && (
                <form onSubmit={handleSaveUpi} className="space-y-3 rounded-xl border border-borderSubtle p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Add UPI Details
                    {upiMethods.length > 0 && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
                    )}
                  </span>
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    required
                    className="w-full border border-borderSubtle rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                  <button type="submit" className="btn-primary text-xs py-2 px-4 w-full">
                    Save UPI
                  </button>
                </form>
              )}

              {/* Bank form */}
              {activeMethodTab === "bank" && (
                <form onSubmit={handleSaveBank} className="space-y-3 rounded-xl border border-borderSubtle p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" /> Add Bank Details
                    {bankMethods.length > 0 && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
                    )}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank name"
                      required
                      className="border border-borderSubtle rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 col-span-2"
                    />
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number"
                      required
                      className="border border-borderSubtle rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 col-span-2"
                    />
                    <input
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="IFSC code"
                      required
                      className="border border-borderSubtle rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                    <input
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Account holder name"
                      required
                      className="border border-borderSubtle rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                  </div>
                  <button type="submit" className="btn-primary text-xs py-2 px-4 w-full">
                    Save Bank Details
                  </button>
                </form>
              )}

              {/* QR code form */}
              {activeMethodTab === "qr" && (
                <form onSubmit={handleSaveQr} className="space-y-3 rounded-xl border border-borderSubtle p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" /> Upload UPI QR Code
                    {qrMethods.length > 0 && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
                    )}
                  </span>
                  <p className="text-[10px] text-textMuted">
                    Upload a screenshot of your UPI QR code. Admin will scan it to send your payout.
                  </p>
                  <input
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Account holder name (must match your profile)"
                    required
                    className="w-full border border-borderSubtle rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                  <div className="space-y-2">
                    {qrPreview ? (
                      <div className="relative">
                        <img src={qrPreview} alt="QR preview" className="w-full max-h-48 object-contain rounded-lg border border-borderSubtle" />
                        <button
                          type="button"
                          onClick={() => { setQrPreview(""); setQrStorageId(""); }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-borderSubtle rounded-lg cursor-pointer hover:border-brand-400 transition-colors">
                        <Upload className="w-6 h-6 text-textMuted" />
                        <span className="text-[11px] text-textMuted font-medium">
                          {qrUploading ? "Uploading..." : "Click to upload QR image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={qrUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQrUpload(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <button type="submit" disabled={!qrStorageId || !accountHolderName} className="btn-primary text-xs py-2 px-4 w-full disabled:opacity-40">
                    Save QR Code
                  </button>
                </form>
              )}
            </div>
            {methodMsg && (
              <p className="text-[11px] text-brand-600">{methodMsg}</p>
            )}
          </div>
        ) : hasPending ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              You already have a pending withdrawal under review. You can request again once it is
              processed.
            </p>
          </div>
        ) : available < minWithdrawal ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-borderSubtle bg-neutral-50 p-4">
              <Wallet className="w-4 h-4 text-textMuted shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-textMain font-semibold">
                  {available === 0
                    ? "No withdrawable balance yet"
                    : `₹${available.toLocaleString("en-IN")} available — ₹${minWithdrawal.toLocaleString("en-IN")} minimum required`}
                </p>
                <p className="text-[11px] text-textMuted leading-relaxed">
                  {available === 0
                    ? "Your earnings will appear here once work is approved or referral commissions clear the holding period. Keep applying for work opportunities."
                    : "Keep earning to reach the minimum withdrawal threshold."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/dashboard/work"
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Browse work opportunities →
              </a>
              <span className="text-neutral-300">·</span>
              <a
                href="/affiliate"
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View partner stats →
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-textMuted block">
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
                  className="w-full border border-borderSubtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(available))}
                  className="text-[10px] text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Withdraw full balance (₹{available.toLocaleString("en-IN")})
                </button>
                {Number(amount) > 0 && tdsPreview && (
                  <div className="mt-2 rounded-lg border border-borderSubtle bg-neutral-50 px-3 py-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-textMuted">
                      <span>
                        Processing fee
                        {tdsPreview.feeSettings.feePercentage > 0
                          ? ` (${tdsPreview.feeSettings.feePercentage}%${tdsPreview.feeSettings.maxFee > 0 ? `, max ₹${tdsPreview.feeSettings.maxFee}` : ""})`
                          : ""}
                      </span>
                      <span className={tdsPreview.fee > 0 ? "text-textMain font-semibold" : "text-green-600 font-semibold"}>
                        {tdsPreview.fee > 0 ? `− ₹${tdsPreview.fee.toLocaleString("en-IN")}` : "₹0 · currently free"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-textMuted">
                      <span>TDS (Income Tax)</span>
                      {tdsPreview.tdsTotal > 0 ? (
                        <span className="text-amber-600 font-semibold">− ₹{tdsPreview.tdsTotal.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-green-600 font-semibold">₹0</span>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-borderSubtle">
                      <span className="text-textMain font-semibold">You'd receive approx.</span>
                      <span className="text-brand-600 font-bold">₹{tdsPreview.net.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[9px] text-textMuted leading-snug">
                      TDS is deducted as per Income Tax rules and reported against your PAN — claimable in your ITR.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-textMuted block">
                  Payout method
                </label>
                <select
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                  required
                  className="w-full border border-borderSubtle rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                >
                  <option value="">Select method…</option>
                  {withdrawableMethods.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.type === "bank_transfer"
                        ? `Bank · ${m.details.bankName || ""} ••${(m.details.accountNumber || "").slice(-4)}`
                        : m.type === "upi_qr"
                        ? `UPI QR · ${m.details.accountHolderName || ""}`
                        : `UPI · ${m.details.upiId || ""}`}
                      {m.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-textMuted">
                  Payouts are processed manually within 3–7 business days after admin verification.
                </p>
              </div>
            </div>
            {reqMsg && (
              <p className={`text-[11px] ${reqMsg.includes("submitted") ? "text-green-600" : "text-red-600"}`}>
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
          </form>
        )}
      </div>

      {/* Payout requests */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-sm font-bold text-textMain">Payout Requests</h3>
        {withdrawals.length === 0 ? (
          <p className="text-xs text-textMuted py-6 text-center">
            No payout requests yet. Complete work or earn referral bonuses to build your balance.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle text-textMuted">
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Method</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Requested</th>
                  <th className="py-2.5 px-3 font-semibold">Admin note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td className="py-3 px-3 font-bold text-textMain">₹{w.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-textMuted capitalize">
                      {w.payoutMethod.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          w.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : w.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {w.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-textMuted">
                      {new Date(w.requestedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-textMuted max-w-[200px] truncate" title={w.adminNote || ""}>
                      {(w as any).adminNote || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction history — all types */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-sm font-bold text-textMain">Transaction History</h3>
        {allTxns.length === 0 ? (
          <p className="text-xs text-textMuted py-6 text-center">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {allTxns.map((tx) => {
              const SourceIcon = txnSourceIcon(tx);
              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-2.5 border-b border-borderSubtle last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.amount > 0 ? "bg-brand-50 text-brand-600" : "bg-neutral-100 text-textMuted"
                      }`}
                    >
                      <SourceIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-textMain">{tx.description}</p>
                      <p className="text-[10px] text-textMuted">
                        {txnSourceLabel(tx)} ·{" "}
                        {tx.type.replace(/_/g, " ")} ·{" "}
                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p
                      className={`text-sm font-bold ${
                        tx.amount > 0 ? "text-brand-600" : "text-textMain"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-textMuted capitalize">{tx.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
