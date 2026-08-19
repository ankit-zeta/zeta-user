"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation, useAction } from "convex/react";
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
  QrCode,
  Mail,
  Plus,
  UploadCloud,
  Star,
  Trash2,
  ShieldCheck
} from "lucide-react";

async function compressImage(file: File, maxBytes = 100 * 1024, hardCap = 1024 * 1024): Promise<Blob> {
  if (file.size <= maxBytes) return file;
  if (file.size > hardCap) throw new Error("QR image must be under 1MB. Please upload a smaller image.");

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Invalid image file"));
    image.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 640 / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.8, 0.6, 0.4, 0.25, 0.12]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (blob && blob.size <= maxBytes) return blob;
  }
  return canvas.toBlob!((b) => b as Blob, "image/jpeg", 0.1) ?? file;
}

const METHOD_META: Record<string, { icon: typeof Building; label: string }> = {
  bank_transfer: { icon: Building, label: "Bank Transfer" },
  upi: { icon: Smartphone, label: "UPI ID" },
  upi_qr: { icon: QrCode, label: "UPI QR" },
  paypal: { icon: Mail, label: "PayPal" },
};

function methodSummary(m: any) {
  if (m.type === "upi") return m.details.upiId || "";
  if (m.type === "upi_qr") return `${m.details.accountHolderName || ""} (QR)`;
  if (m.type === "bank_transfer")
    return `${m.details.bankName || "Bank"} ••••${String(m.details.accountNumber || "").slice(-4)} — ${m.details.accountHolderName || ""}`;
  return "";
}

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
  const payoutMethods = useQuery(
    api.payoutMethods.getMyPayoutMethods,
    token ? { token } : "skip"
  );

  const requestWithdrawalMutation = useMutation(api.withdrawals.requestWithdrawal);
  const getQrUploadUrl = useAction(api.withdrawals.generateWithdrawalQrUploadUrl);
  const getMethodQrUploadUrl = useAction(api.payoutMethods.generatePayoutMethodQrUploadUrl);
  const upsertPayoutMethodMutation = useMutation(api.payoutMethods.upsertPayoutMethod);
  const deletePayoutMethodMutation = useMutation(api.payoutMethods.deletePayoutMethod);
  const setDefaultPayoutMethodMutation = useMutation(api.payoutMethods.setDefaultPayoutMethod);
  const withdrawalSettings = useQuery(api.settings.getSetting, { key: "withdrawals" });

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [payoutMethod, setPayoutMethod] = useState<string>("upi");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState(user?.name || "");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState("");
  const [qrSizeLabel, setQrSizeLabel] = useState("");

  // Add-method modal state
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [addType, setAddType] = useState<string>("upi");
  const [addLabel, setAddLabel] = useState("");
  const [addUpiId, setAddUpiId] = useState("");
  const [addAccNum, setAddAccNum] = useState("");
  const [addIfsc, setAddIfsc] = useState("");
  const [addBank, setAddBank] = useState("");
  const [addHolder, setAddHolder] = useState(user?.name || "");
  const [addQrFile, setAddQrFile] = useState<File | null>(null);
  const [addQrPreview, setAddQrPreview] = useState("");
  const [addQrSize, setAddQrSize] = useState("");
  const [methodErr, setMethodErr] = useState("");
  const [methodMsg, setMethodMsg] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const available = walletData?.wallet?.availableBalance || 0;
  const feePercent = withdrawalSettings?.feePercentage ?? 2;
  const fixedFee = withdrawalSettings?.fixedFee ?? 0;
  const minWithdrawal = withdrawalSettings?.minimumWithdrawal ?? 1000;
  const calculatedFee = Math.round((amount * feePercent) / 100) + fixedFee;
  const netPayout = Math.max(0, amount - calculatedFee);
  const allowedMethods = (withdrawalSettings?.allowedMethods?.length
    ? withdrawalSettings.allowedMethods
    : ["upi", "bank_transfer", "upi_qr", "paypal"]) as string[];

  const savedMethods = payoutMethods || [];
  const selectedMethod = savedMethods.find((m) => m._id.toString() === selectedMethodId);

  const handleQrFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG/JPG/JPEG).");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("QR image must be under 1MB. Please upload a smaller image.");
      return;
    }
    setQrFile(file);
    setQrSizeLabel(`${(file.size / 1024).toFixed(0)} KB — will be compressed`);
    setQrPreview(URL.createObjectURL(file));
  };

  const uploadQr = async (): Promise<string> => {
    if (!qrFile) throw new Error("Please upload your UPI QR image");
    const blob = await compressImage(qrFile);
    const uploadUrl = await getQrUploadUrl();
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": blob.type },
      body: blob,
    });
    if (!response.ok) throw new Error("QR upload failed, please try again");
    const { storageId } = await response.json();
    return storageId as string;
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (amount < minWithdrawal) {
      setError(`Minimum withdrawal amount is ₹${minWithdrawal.toLocaleString("en-IN")}.`);
      return;
    }
    if (amount > available) {
      setError("Amount exceeds available balance.");
      return;
    }
    if (!selectedMethod && savedMethods.length > 0) {
      setError("Please select a saved payout method.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (selectedMethod) {
        await requestWithdrawalMutation({
          token,
          amount,
          payoutMethod: selectedMethod.type,
          payoutDetails: {},
          payoutMethodId: selectedMethod._id,
        });
      } else {
        let qrStorageId: string | undefined;
        if (payoutMethod === "upi_qr") {
          qrStorageId = await uploadQr();
        }
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
            paypalEmail: payoutMethod === "paypal" ? paypalEmail : undefined,
            qrImageUrl: qrStorageId,
          },
        });
      }

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

  const handleAddQrFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setMethodErr("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMethodErr("Please upload an image file (PNG/JPG/JPEG).");
      return;
    }
    if (file.size > 1024 * 1024) {
      setMethodErr("QR image must be under 1MB. Please upload a smaller image.");
      return;
    }
    setAddQrFile(file);
    setAddQrSize(`${(file.size / 1024).toFixed(0)} KB — will be compressed`);
    setAddQrPreview(URL.createObjectURL(file));
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsAdding(true);
    setMethodErr("");
    setMethodMsg("");
    try {
      let qrStorageId: string | undefined;
      if (addType === "upi_qr") {
        if (!addQrFile) throw new Error("Please upload your UPI QR image");
        const blob = await compressImage(addQrFile);
        const uploadUrl = await getMethodQrUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });
        if (!response.ok) throw new Error("QR upload failed, please try again");
        qrStorageId = (await response.json()).storageId;
      }

      await upsertPayoutMethodMutation({
        token,
        type: addType,
        name: addLabel || (addType === "upi" ? addUpiId : addType === "upi_qr" ? "UPI QR" : addBank || "Bank"),
        details: {
          upiId: addType === "upi" ? addUpiId : undefined,
          accountNumber: addType === "bank_transfer" ? addAccNum : undefined,
          ifscCode: addType === "bank_transfer" ? addIfsc : undefined,
          bankName: addType === "bank_transfer" ? addBank : undefined,
          accountHolderName: addHolder || undefined,
          qrImageUrl: qrStorageId,
        },
      });

      setMethodMsg("Payout method saved. You can now select it when requesting a withdrawal.");
      setTimeout(() => {
        setMethodModalOpen(false);
        setMethodMsg("");
        setAddQrFile(null);
        setAddQrPreview("");
        setAddQrSize("");
        setAddUpiId("");
        setAddAccNum("");
        setAddIfsc("");
        setAddBank("");
        setAddHolder(user?.name || "");
      }, 1500);
    } catch (err: any) {
      setMethodErr(err.message || "Failed to save payout method.");
    } finally {
      setIsAdding(false);
    }
  };

  const openWithdrawModal = () => {
    setSelectedMethodId(savedMethods.find((m) => m.isDefault) ? savedMethods.find((m) => m.isDefault)!._id.toString() : savedMethods.length ? savedMethods[0]._id.toString() : "");
    setModalOpen(true);
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
          onClick={openWithdrawModal}
          disabled={available < minWithdrawal}
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
          <span className="text-[11px] text-textMuted block">Minimum threshold: ₹{minWithdrawal.toLocaleString("en-IN")}</span>
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

      {/* Saved Payout Methods */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-textMain flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" /> My Payout Methods
          </h3>
          <button
            onClick={() => { setMethodModalOpen(true); setAddType("upi"); }}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Bank / UPI / QR
          </button>
        </div>
        <p className="text-[11px] text-textMuted">
          Save your bank account, UPI ID or UPI QR once — withdrawals to your saved methods are processed faster.
          For QR, the account holder name must match your profile name.
        </p>

        {payoutMethods === undefined ? (
          <div className="p-6 text-center animate-pulse space-y-2">
            <div className="h-5 bg-neutral-200 rounded w-1/2 mx-auto"></div>
          </div>
        ) : savedMethods.length === 0 ? (
          <div className="text-center py-6 text-xs text-textMuted">
            No payout methods saved yet. Add your bank account, UPI ID or UPI QR to withdraw faster.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedMethods.map((m) => {
              const meta = METHOD_META[m.type] || METHOD_META.bank_transfer;
              const Icon = meta.icon;
              return (
                <div key={m._id} className={`relative p-3 rounded-lg border bg-white ${m.isDefault ? "border-brand-300 bg-brand-50/40" : "border-borderSubtle"}`}>
                  {m.isDefault && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                      DEFAULT
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-bold text-textMain">{meta.label}</span>
                    {m.name && m.name !== meta.label && (
                      <span className="text-[10px] text-textMuted truncate">· {m.name}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-textMuted truncate">{methodSummary(m)}</p>
                  {m.type === "upi_qr" && m.qrImageUrl && (
                    <a href={m.qrImageUrl} target="_blank" rel="noreferrer" className="inline-block mt-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.qrImageUrl} alt="UPI QR" className="w-12 h-12 object-contain rounded border border-borderSubtle bg-white" />
                    </a>
                  )}
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-borderSubtle">
                    {!m.isDefault && (
                      <button
                        onClick={async () => {
                          try { await setDefaultPayoutMethodMutation({ token: token!, id: m._id }); } catch {}
                        }}
                        className="text-[10px] font-bold text-brand-700 hover:underline flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" /> Set Default
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try { await deletePayoutMethodMutation({ token: token!, id: m._id }); } catch {}
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                  min={minWithdrawal}
                  max={available}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                />
              </div>

              {/* Fee Breakdown */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-borderSubtle space-y-1 text-xs text-textMuted">
                <div className="flex justify-between">
                  <span>Processing Fee ({feePercent}%{fixedFee ? ` + ₹${fixedFee}` : ""}):</span>
                  <span>₹{calculatedFee}</span>
                </div>
                <div className="flex justify-between font-bold text-textMain pt-1 border-t border-borderSubtle">
                  <span>Net Payout to Receive:</span>
                  <span className="text-brand-700">₹{netPayout}</span>
                </div>
              </div>

              {/* Saved method picker (primary path) */}
              {savedMethods.length > 0 ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMain">Payout To (saved methods)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {savedMethods.map((m) => {
                      const meta = METHOD_META[m.type] || METHOD_META.bank_transfer;
                      const Icon = meta.icon;
                      const active = selectedMethodId === m._id.toString();
                      return (
                        <button
                          type="button"
                          key={m._id}
                          onClick={() => setSelectedMethodId(m._id.toString())}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left ${
                            active
                              ? "border-brand-600 bg-brand-50"
                              : "border-borderSubtle bg-white hover:border-brand-300"
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-brand-700" : "text-textMuted"}`} />
                          <span className="min-w-0">
                            <span className="block text-[11px] font-bold text-textMain truncate">
                              {meta.label}{m.isDefault ? " (Default)" : ""}
                            </span>
                            <span className="block text-[10px] text-textMuted truncate">{methodSummary(m)}</span>
                          </span>
                          {m.type === "upi_qr" && m.qrImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.qrImageUrl} alt="QR" className="w-8 h-8 object-contain rounded border border-borderSubtle bg-white shrink-0" />
                          )}
                          <span className={`ml-auto shrink-0 w-3.5 h-3.5 rounded-full border-2 ${active ? "border-brand-600 bg-brand-600" : "border-neutral-300"}`}>
                            {active && <span className="block w-1.5 h-1.5 rounded-full bg-white mx-auto mt-[2.5px]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setModalOpen(false); setMethodModalOpen(true); }}
                    className="text-[11px] font-bold text-brand-700 hover:underline"
                  >
                    + Add new payout method
                  </button>
                </div>
              ) : (
                <>
                  {/* Fallback: inline method entry (no saved methods yet) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-textMain">Payout Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {allowedMethods.includes("upi") && (
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
                      )}
                      {allowedMethods.includes("upi_qr") && (
                        <button
                          type="button"
                          onClick={() => setPayoutMethod("upi_qr")}
                          className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                            payoutMethod === "upi_qr"
                              ? "border-brand-600 bg-brand-50 text-brand-700 font-bold"
                              : "border-borderSubtle bg-white text-textMuted"
                          }`}
                        >
                          <QrCode className="w-4 h-4" />
                          <span>UPI QR</span>
                        </button>
                      )}
                      {allowedMethods.includes("bank_transfer") && (
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
                      )}
                      {allowedMethods.includes("paypal") && (
                        <button
                          type="button"
                          onClick={() => setPayoutMethod("paypal")}
                          className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                            payoutMethod === "paypal"
                              ? "border-brand-600 bg-brand-50 text-brand-700 font-bold"
                              : "border-borderSubtle bg-white text-textMuted"
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                          <span>PayPal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline payout fields */}
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
                  ) : payoutMethod === "upi_qr" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-textMain">UPI QR Image *</label>
                      <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/50 cursor-pointer hover:bg-brand-50 text-center">
                        {qrPreview ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrPreview} alt="UPI QR preview" className="w-24 h-24 object-contain rounded bg-white border border-borderSubtle" />
                            <span className="text-[11px] font-semibold text-brand-700">{qrSizeLabel}</span>
                            <span className="text-[10px] text-textMuted">Click to change. Auto-compressed to under 100 KB.</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 text-brand-600" />
                            <span className="text-[11px] font-semibold text-textMain">Upload your UPI QR screenshot</span>
                            <span className="text-[10px] text-textMuted">PNG / JPG, under 1 MB (auto-compressed to ~100 KB)</span>
                          </>
                        )}
                        <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleQrFile} />
                      </label>
                      <p className="text-[10px] text-textMuted">
                        We only accept your own UPI QR. It will be visible to our finance team to pay you.
                      </p>
                    </div>
                  ) : payoutMethod === "paypal" ? (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-textMain">PayPal Email *</label>
                      <input
                        type="email"
                        required
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="e.g. yourname@example.com"
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
                </>
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

      {/* Add Payout Method Modal */}
      {methodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-surface p-6 max-w-md w-full space-y-5 bg-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-borderSubtle pb-3">
              <h3 className="text-base font-bold text-textMain">Add Payout Method</h3>
              <button
                onClick={() => setMethodModalOpen(false)}
                className="text-textMuted hover:text-textMain text-xs"
              >
                Close
              </button>
            </div>

            {methodErr && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {methodErr}
              </div>
            )}
            {methodMsg && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                {methodMsg}
              </div>
            )}

            <form onSubmit={handleAddMethod} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-textMain">Method Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["upi", "UPI ID", Smartphone], ["bank_transfer", "Bank", Building], ["upi_qr", "UPI QR", QrCode]].map(([t, label, Icon]: any[]) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => { setAddType(t); setMethodErr(""); }}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 ${
                        addType === t
                          ? "border-brand-600 bg-brand-50 text-brand-700 font-bold"
                          : "border-borderSubtle bg-white text-textMuted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-textMain">Label (optional)</label>
                <input
                  type="text"
                  value={addLabel}
                  onChange={(e) => setAddLabel(e.target.value)}
                  placeholder={addType === "upi" ? "e.g. Personal UPI" : addType === "upi_qr" ? "e.g. QR for phonepe" : "e.g. HDFC Salary"}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                />
              </div>

              {addType === "upi" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-textMain">UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={addUpiId}
                    onChange={(e) => setAddUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white"
                  />
                </div>
              )}

              {addType === "bank_transfer" && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-semibold text-textMain">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      value={addHolder}
                      onChange={(e) => setAddHolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5"
                    />
                    <p className="text-[10px] text-textMuted mt-0.5">Must match the name on your profile.</p>
                  </div>
                  <div>
                    <label className="font-semibold text-textMain">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={addAccNum}
                      onChange={(e) => setAddAccNum(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-textMain">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={addIfsc}
                        onChange={(e) => setAddIfsc(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5 uppercase"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-textMain">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={addBank}
                        onChange={(e) => setAddBank(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {addType === "upi_qr" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-textMain">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      value={addHolder}
                      onChange={(e) => setAddHolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-borderSubtle mt-0.5"
                    />
                    <p className="text-[10px] text-textMuted mt-0.5">Must match the name shown on your UPI QR to be verified.</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-textMain">UPI QR Image *</label>
                    <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/50 cursor-pointer hover:bg-brand-50 text-center">
                      {addQrPreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={addQrPreview} alt="UPI QR preview" className="w-24 h-24 object-contain rounded bg-white border border-borderSubtle" />
                          <span className="text-[11px] font-semibold text-brand-700">{addQrSize}</span>
                          <span className="text-[10px] text-textMuted">Click to change. Auto-compressed to under 100 KB.</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-brand-600" />
                          <span className="text-[11px] font-semibold text-textMain">Upload your UPI QR screenshot</span>
                          <span className="text-[10px] text-textMuted">PNG / JPG, under 1 MB (auto-compressed to ~100 KB)</span>
                        </>
                      )}
                      <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleAddQrFile} />
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAdding}
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
              >
                {isAdding ? "Saving..." : "Save Payout Method"}
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
                    <td className="py-3 px-3">
                      <span className="uppercase text-textMuted text-[10px]">{w.payoutMethod}</span>
                      {w.payoutMethod === "upi_qr" && w.qrImageUrl && (
                        <a href={w.qrImageUrl} target="_blank" rel="noreferrer" className="block mt-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={w.qrImageUrl} alt="QR" className="w-8 h-8 object-contain rounded border border-borderSubtle bg-white" />
                        </a>
                      )}
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
            No wallet activity yet. Earnings from work payouts and affiliate commissions appear here.
          </div>
        )}
      </div>
    </div>
  );
}