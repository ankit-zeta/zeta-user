"use client";

import React, { useState } from "react";
import { useAuth, useDemo } from "@/lib/demo";
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
  Loader2,
  Zap,
} from "lucide-react";
import { compressImage } from "@/lib/imageCompress";

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
  const { isDemo, demoConfig } = useDemo();
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
  const [setDefaultLoading, setSetDefaultLoading] = useState<string>("");
  const [removeLoading, setRemoveLoading] = useState<string>("");

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

  // Use demo data for demo accounts
  const wallet = isDemo && demoConfig ? {
    availableBalance: demoConfig.workBalance || 0,
    workEarnings: demoConfig.workBalance || 0,
    affiliateEarnings: demoConfig.partnerEarnings || 0,
    totalWithdrawn: demoConfig.totalWithdrawn || 0,
  } : walletData.wallet;

  // Use demo withdrawals for demo accounts (needed before hasPending)
  const demoWithdrawals = isDemo && demoConfig?.fakeWithdrawals
    ? demoConfig.fakeWithdrawals.map((w, idx) => ({
        _id: `demo-wd-${idx}`,
        amount: w.amount,
        payoutMethod: w.method.toLowerCase().replace(" ", "_"),
        status: w.status,
        requestedAt: w.createdAt,
        processedAt: w.processedAt,
        adminNote: "Demo withdrawal - no real money",
      }))
    : withdrawals;

  const available = wallet?.availableBalance || 0;
  const workEarnings = wallet?.workEarnings || 0;
  const affiliateEarnings = wallet?.affiliateEarnings || 0;
  const hasPending = demoWithdrawals.some((w) => w.status === "requested" || w.status === "processing" || w.status === "pending");

  const kycStatus = isDemo ? (demoConfig?.kycStatus || "verified") : ((user as any)?.kycStatus || "not_submitted");
  const kycVerified = isDemo ? true : kycStatus === "verified";

  // Use demo transactions for demo accounts
  const allTxns = isDemo && demoConfig?.fakeTransactions
    ? demoConfig.fakeTransactions.map((tx, idx) => ({
        _id: `demo-tx-${idx}`,
        type: tx.type === "credit" ? "WORK_PAYOUT" : tx.type === "partner_earning" ? "AFFILIATE_COMMISSION" : "ADMIN_ADJUSTMENT",
        amount: tx.amount * (tx.type === "debit" ? -1 : 1),
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
      }))
    : (walletData.transactions || []);

  const upiMethods = methods.filter((m) => m.type === "upi");
  const bankMethods = methods.filter((m) => m.type === "bank_transfer");
  const qrMethods = methods.filter((m) => m.type === "upi_qr");
  const payoutReady = methods.length > 0;
  const withdrawableMethods = methods.filter(
    (m) => m.type === "upi" || m.type === "upi_qr" || m.type === "bank_transfer"
  );

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (isDemo) {
      setMethodMsg("Demo mode: Payment methods cannot be saved. This is a demo account with fake data.");
      return;
    }
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
    if (isDemo) {
      setMethodMsg("Demo mode: Payment methods cannot be saved. This is a demo account with fake data.");
      return;
    }
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
      const compressed = await compressImage(file);
      const url = await generateQrUploadUrl();
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: compressed,
      });
      if (!resp.ok) throw new Error("Upload failed");
      const { storageId } = JSON.parse(await resp.text());
      setQrStorageId(storageId);
      setQrPreview(URL.createObjectURL(compressed));
    } catch (err: any) {
      setMethodMsg(err.message || "QR upload failed");
    } finally {
      setQrUploading(false);
    }
  };

  const handleSaveQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !qrStorageId) return;
    if (isDemo) {
      setMethodMsg("Demo mode: Payment methods cannot be saved. This is a demo account with fake data.");
      return;
    }
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
    if (isDemo) {
      setMethodMsg("Demo mode: Payment methods cannot be deleted. This is a demo account with fake data.");
      return;
    }
    setRemoveLoading(methodId);
    try {
      await deleteMethodMutation({ token, id: methodId as any });
      setMethodMsg("Payment method removed.");
    } catch (err: any) {
      setMethodMsg(err.message || "Failed to delete method.");
    } finally {
      setRemoveLoading("");
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!token) return;
    if (isDemo) {
      setMethodMsg("Demo mode: Payment methods cannot be modified. This is a demo account with fake data.");
      return;
    }
    setSetDefaultLoading(methodId);
    try {
      await setDefaultMutation({ token, id: methodId as any });
      setMethodMsg("Default method updated.");
    } catch (err: any) {
      setMethodMsg(err.message || "Failed to update default.");
    } finally {
      setSetDefaultLoading("");
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
      
      if (isDemo) {
        const demoReqMutation = useMutation(api.users.demoRequestWithdrawal);
        const res = await demoReqMutation({
          token,
          amount: amt,
          method: method?.type || "upi",
        });
        setReqMsg(res.message || "Demo withdrawal request submitted! It will show as pending in your history.");
      } else {
        await requestMutation({
          token,
          amount: amt,
          payoutMethod: method?.type || "upi",
          payoutDetails: {},
          payoutMethodId: selectedMethodId as any,
        });
        setReqMsg("Withdrawal request submitted! Admin will process your payout shortly.");
      }
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

      {/* Add bank details banner — shown when no payout methods are saved */}
      {!payoutReady && (
        <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-emerald-50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG illustration */}
            <div className="shrink-0">
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bank building */}
                <rect x="25" y="35" width="70" height="45" rx="4" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
                <polygon points="60,15 95,35 25,35" fill="#10B981" opacity="0.2" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="60" cy="22" r="4" fill="#10B981"/>
                {/* Pillars */}
                <rect x="35" y="42" width="6" height="30" rx="2" fill="#10B981" opacity="0.3"/>
                <rect x="50" y="42" width="6" height="30" rx="2" fill="#10B981" opacity="0.3"/>
                <rect x="65" y="42" width="6" height="30" rx="2" fill="#10B981" opacity="0.3"/>
                <rect x="80" y="42" width="6" height="30" rx="2" fill="#10B981" opacity="0.3"/>
                {/* Base */}
                <rect x="20" y="78" width="80" height="6" rx="2" fill="#10B981" opacity="0.15"/>
                {/* UPI icon floating */}
                <circle cx="100" cy="25" r="14" fill="#176B4D" opacity="0.15"/>
                <text x="100" y="29" textAnchor="middle" fill="#176B4D" fontSize="10" fontWeight="bold">₹</text>
                {/* Coins */}
                <circle cx="15" cy="70" r="8" fill="#FBBF24" opacity="0.5"/>
                <circle cx="10" cy="62" r="7" fill="#F59E0B" opacity="0.4"/>
                <circle cx="18" cy="58" r="6" fill="#FCD34D" opacity="0.5"/>
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-textMain flex items-center gap-2 justify-center sm:justify-start">
                <Landmark className="w-5 h-5 text-brand-600" />
                Add your bank details to get started
              </h3>
              <p className="text-xs text-textMuted mt-1.5 leading-relaxed max-w-lg">
                Set up your withdrawal method now so you're ready to receive payments the moment you earn.
                Add your UPI ID, bank account, or upload a QR code — it takes less than a minute.
              </p>
              <a
                href="#payment-methods"
                className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Payment Method
              </a>
            </div>
          </div>
        </div>
      )}

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

      {/* ─── Payment Methods (always visible) ─── */}
      <div id="payment-methods" className="card-surface p-6 space-y-4">
        <h3 className="text-sm font-bold text-textMain">Payment Methods</h3>
        {methods === undefined ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-14 bg-neutral-100 rounded-xl" />
            <div className="h-14 bg-neutral-100 rounded-xl" />
          </div>
        ) : (
          <>
            {methods.length > 0 && (
              <div className="space-y-2">
                {methods.map((m) => (
                  <div
                    key={m._id}
                    className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors ${
                      m.isDefault
                        ? "border-brand-200 bg-brand-50/40"
                        : "border-borderSubtle hover:border-brand-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {m.type === "upi_qr" && m.qrImageUrl ? (
                        <img src={m.qrImageUrl} alt="QR" className="w-10 h-10 rounded object-cover border border-borderSubtle" />
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          m.type === "bank_transfer" ? "bg-emerald-50" : m.type === "upi" ? "bg-blue-50" : "bg-purple-50"
                        }`}>
                          {m.type === "bank_transfer" ? (
                            <Landmark className={`w-5 h-5 text-emerald-600`} />
                          ) : m.type === "upi" ? (
                            <Smartphone className={`w-5 h-5 text-blue-600`} />
                          ) : (
                            <QrCode className={`w-5 h-5 text-purple-600`} />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-textMain capitalize">
                            {m.type === "bank_transfer" ? "Bank Account" : m.type === "upi" ? "UPI ID" : "UPI QR Code"}
                          </span>
                          {m.isDefault && (
                            <span className="text-[9px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-textMuted mt-0.5 truncate">
                          {m.type === "bank_transfer"
                            ? `${m.details.bankName || "Bank"} · A/C ${m.details.accountNumber || ""} · IFSC ${m.details.ifscCode || ""}`
                            : m.type === "upi"
                              ? m.details.upiId
                              : `QR · ${m.details.accountHolderName || ""}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!m.isDefault && (
                        <button
                          onClick={() => handleSetDefault(m._id)}
                          disabled={setDefaultLoading === m._id}
                          className="px-2 py-1 text-[10px] font-semibold border border-neutral-200 rounded-lg hover:border-brand-200 hover:text-brand-700 transition-colors"
                        >
                          {setDefaultLoading === m._id ? "..." : "Set Default"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMethod(m._id)}
                        disabled={removeLoading === m._id}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove payment method"
                      >
                        {removeLoading === m._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new method tabs */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted">
                {methods.length > 0 ? "Add Another Method" : "Add Your First Method"}
              </h4>
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

              {activeMethodTab === "upi" && (
                <form onSubmit={handleSaveUpi} className="space-y-3 rounded-xl border border-borderSubtle p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Add UPI Details
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

              {activeMethodTab === "bank" && (
                <form onSubmit={handleSaveBank} className="space-y-3 rounded-xl border border-borderSubtle p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" /> Add Bank Details
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

              {activeMethodTab === "qr" && (
                <form onSubmit={handleSaveQr} className="space-y-3 rounded-xl border border-borderSubtle p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" /> Upload UPI QR Code
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
                          {qrUploading ? "Compressing & uploading..." : "Click to upload QR image (auto-compressed)"}
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
          </>
        )}
      </div>

      {/* ─── Request Withdrawal ─── */}
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
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-amber-800 leading-relaxed">
                Add at least <strong>one</strong> payment method above to enable withdrawals.
              </p>
              <a href="#payment-methods" className="text-[11px] font-semibold text-brand-600 hover:text-brand-700">
                Add Payment Method →
              </a>
            </div>
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
                href="/partner"
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-textMain">Payout Requests</h3>
          {isDemo && (
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> Demo transactions
            </span>
          )}
        </div>
        {demoWithdrawals.length === 0 ? (
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
                {demoWithdrawals.map((w) => (
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
