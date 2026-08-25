"use client";

import { friendlyError } from "@/lib/errors";
import { compressImage } from "@/lib/imageCompress";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Info,
  User,
  FileText,
  RefreshCw,
  CreditCard,
} from "lucide-react";

type KycData = {
  status: "not_submitted" | "pending" | "verified" | "rejected";
  profile: {
    fullNameAsPerPan: string;
    aadhaarLast4: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    rejectionReason?: string;
    submittedAt: number;
    reviewedAt?: number;
    submissionCount: number;
  } | null;
  panMasked: string | null;
  panImageUrl: string | null;
  aadhaarImageUrl: string | null;
};

type DocState = {
  blob: Blob;
  previewUrl: string;
  name: string;
  sizeKb: number;
} | null;

const STATUS_META: Record<
  string,
  { label: string; icon: any; classes: string; chip: string; blurb: string }
> = {
  not_submitted: {
    label: "Not Submitted",
    icon: ShieldAlert,
    classes: "border-amber-200 bg-gradient-to-r from-amber-50 to-white",
    chip: "bg-amber-100 text-amber-700 border-amber-200",
    blurb:
      "Complete your KYC to unlock work applications, affiliate payouts and withdrawals.",
  },
  pending: {
    label: "Under Review",
    icon: Clock,
    classes: "border-blue-200 bg-gradient-to-r from-blue-50 to-white",
    chip: "bg-blue-100 text-blue-700 border-blue-200",
    blurb:
      "We've received your documents. Our team verifies within 24-48 hours — we'll email you once confirmed.",
  },
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    classes: "border-green-200 bg-gradient-to-r from-green-50 to-white",
    chip: "bg-green-100 text-green-700 border-green-200",
    blurb:
      "Your identity is verified. Earnings and withdrawals are unlocked.",
  },
  rejected: {
    label: "Rejected",
    icon: ShieldAlert,
    classes: "border-red-200 bg-gradient-to-r from-red-50 to-white",
    chip: "bg-red-100 text-red-700 border-red-200",
    blurb: "Please correct the issue below and resubmit your documents.",
  },
};

// Phones/tablets get the OS camera app from the hidden capture input.
// Desktop browsers ignore the capture attribute, so they get an in-page webcam modal instead.
function hasNativeCapture() {
  if (typeof window === "undefined") return false;
  const touch =
    "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  return touch || uaMobile;
}

export default function KycPage() {
  const { token, user } = useAuth();

  const kyc = useQuery(api.kyc.getMyKyc, token ? { token } : "skip") as
    | KycData
    | undefined;

  const generateUploadUrl = useAction(api.kyc.generateKycUploadUrl);
  const submitKyc = useMutation(api.kyc.submitKyc);

  const [fullName, setFullName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarLast4, setAadhaarLast4] = useState("");

  const [panDoc, setPanDoc] = useState<DocState>(null);
  const [aadhaarDoc, setAadhaarDoc] = useState<DocState>(null);
  const [processingDoc, setProcessingDoc] = useState<"pan" | "aadhaar" | null>(
    null
  );

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const panCameraRef = useRef<HTMLInputElement>(null);
  const panFileRef = useRef<HTMLInputElement>(null);
  const aadhaarCameraRef = useRef<HTMLInputElement>(null);
  const aadhaarFileRef = useRef<HTMLInputElement>(null);

  // Webcam capture (desktop)
  const [cameraDoc, setCameraDoc] = useState<"pan" | "aadhaar" | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]);

  const applyDoc = (
    which: "pan" | "aadhaar",
    blob: Blob,
    name: string
  ): DocState => ({
    blob,
    previewUrl: URL.createObjectURL(blob),
    name,
    sizeKb: Math.round(blob.size / 1024),
  });

  const handleDocPicked = async (
    e: React.ChangeEvent<HTMLInputElement>,
    which: "pan" | "aadhaar"
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setProcessingDoc(which);
    try {
      const blob = await compressImage(file);
      const state = applyDoc(
        which,
        blob,
        file.name.replace(/\.[^.]+$/, "") + ".jpg"
      );
      if (which === "pan") {
        if (panDoc) URL.revokeObjectURL(panDoc.previewUrl);
        setPanDoc(state);
      } else {
        if (aadhaarDoc) URL.revokeObjectURL(aadhaarDoc.previewUrl);
        setAadhaarDoc(state);
      }
    } catch (err: any) {
      setError(friendlyError(err, "Could not process that image."));
    } finally {
      setProcessingDoc(null);
    }
  };

  const clearDoc = (which: "pan" | "aadhaar") => {
    if (which === "pan" && panDoc) {
      URL.revokeObjectURL(panDoc.previewUrl);
      setPanDoc(null);
    }
    if (which === "aadhaar" && aadhaarDoc) {
      URL.revokeObjectURL(aadhaarDoc.previewUrl);
      setAadhaarDoc(null);
    }
  };

  const requestCamera = (which: "pan" | "aadhaar") => {
    setError("");
    setCameraError("");
    if (hasNativeCapture()) {
      (which === "pan" ? panCameraRef : aadhaarCameraRef).current?.click();
    } else {
      setCameraDoc(which);
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
    setCameraError("");
    setCameraDoc(null);
  };

  React.useEffect(() => {
    if (!cameraDoc) return;
    let cancelled = false;
    setCameraReady(false);
    setCameraError("");
    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setCameraReady(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setCameraError(
          err?.name === "NotAllowedError" || err?.name === "SecurityError"
            ? "Camera access was blocked. Allow camera permission for this site (check the lock icon in your address bar), then try again."
            : err?.name === "NotFoundError"
            ? "No camera was found on this device. Please upload a photo of your document instead."
            : "Could not start the camera. Please upload a photo of your document instead."
        );
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [cameraDoc]);

  const capturePhoto = async () => {
    const which = cameraDoc;
    const video = videoRef.current;
    if (!which || !video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const raw: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.92)
    );
    if (!raw) {
      setCameraError("Capture failed. Please try again.");
      return;
    }
    setProcessingDoc(which);
    try {
      const blob = await compressImage(raw);
      const state = applyDoc(
        which,
        blob,
        `${which === "pan" ? "pan-card" : "aadhaar-card"}-photo.jpg`
      );
      if (which === "pan") {
        if (panDoc) URL.revokeObjectURL(panDoc.previewUrl);
        setPanDoc(state);
      } else {
        if (aadhaarDoc) URL.revokeObjectURL(aadhaarDoc.previewUrl);
        setAadhaarDoc(state);
      }
      closeCamera();
    } catch (err: any) {
      setCameraError(friendlyError(err, "Could not process the captured photo."));
    } finally {
      setProcessingDoc(null);
    }
  };

  const uploadOne = async (doc: NonNullable<DocState>) => {
    const uploadUrl = await generateUploadUrl();
    const resp = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: doc.blob,
    });
    if (!resp.ok) throw new Error("Upload failed");
    const parsed = JSON.parse(await resp.text());
    return parsed.storageId as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSuccess(false);
    if (!panDoc || !aadhaarDoc) {
      setError("Please capture or upload both your PAN card and Aadhaar card images.");
      return;
    }
    setSubmitting(true);
    try {
      const panImageId = await uploadOne(panDoc);
      const aadhaarImageId = await uploadOne(aadhaarDoc);
      await submitKyc({
        token,
        fullNameAsPerPan: fullName,
        panNumber: panNumber.trim().toUpperCase(),
        panImageId,
        aadhaarLast4: aadhaarLast4.trim(),
        aadhaarImageId,
      });
      clearDoc("pan");
      clearDoc("aadhaar");
      setSuccess(true);
    } catch (err: any) {
      setError(friendlyError(err, "Failed to submit KYC. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (kyc === undefined || !user) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-neutral-200 rounded-lg w-64"></div>
        <div className="h-28 rounded-xl bg-neutral-200"></div>
        <div className="h-72 rounded-xl bg-neutral-200/70"></div>
      </div>
    );
  }

  const meta = STATUS_META[kyc.status] || STATUS_META.not_submitted;
  const StatusIcon = meta.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-textMain">
            KYC Verification
          </h1>
          <p className="text-xs text-textMuted mt-1 leading-relaxed">
            Required for TDS-compliant earnings. Your Aadhaar is stored securely — only the last 4 digits are kept on our servers.
          </p>
        </div>
      </div>

      {/* Success banner after fresh submit */}
      {success && kyc.status !== "verified" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-green-800">KYC submitted successfully</p>
            <p className="text-[11px] text-green-700 mt-0.5">
              We will notify you by email as soon as we confirm your KYC — usually within 24-48 hours.
            </p>
          </div>
        </div>
      )}

      {/* Status card */}
      <div className={`rounded-xl border p-5 flex items-start gap-4 ${meta.classes}`}>
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${meta.chip}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-textMain">{meta.label}</p>
            {kyc.status === "pending" && kyc.profile?.submittedAt && (
              <span className="text-[10px] font-semibold text-textMuted">
                Submitted {new Date(kyc.profile.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5 text-textMuted leading-relaxed">{meta.blurb}</p>
          {kyc.status === "rejected" && kyc.profile?.rejectionReason && (
            <div className="mt-3 p-3 rounded-lg bg-white border border-red-200 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Reason for rejection
              </p>
              <p className="text-xs text-textMain leading-relaxed">{kyc.profile.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Verified summary */}
      {kyc.status === "verified" && kyc.profile ? (
        <div className="card-surface p-6 space-y-5">
          <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" /> Verified details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            <Detail label="Full Name (as per PAN)" value={kyc.profile.fullNameAsPerPan} />
            <Detail label="PAN Number" value={kyc.panMasked || "—"} masked />
            <Detail label="Aadhaar" value={`XXXX XXXX ${kyc.profile.aadhaarLast4}`} masked />
            {(kyc.profile.city || kyc.profile.state) && (
              <Detail label="City / State" value={`${kyc.profile.city ?? ""}${kyc.profile.city && kyc.profile.state ? ", " : ""}${kyc.profile.state ?? ""}`} />
            )}
            <Detail
              label="Verified On"
              value={new Date(kyc.profile.reviewedAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            />
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 border border-borderSubtle">
            <Info className="w-3.5 h-3.5 text-textMuted shrink-0 mt-0.5" />
            <p className="text-[11px] text-textMuted">
              Need to correct something? Contact support — for security, verified details can only be changed by our team.
            </p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50/70 border border-green-100">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-textMuted leading-relaxed">
              <span className="font-semibold text-textMain">Your privacy matters to us.</span> Your uploaded PAN
              &amp; Aadhaar images will be <span className="font-semibold text-textMain">automatically and
              permanently deleted from our servers 90 days after approval</span>. Only masked identifiers and your
              address are retained for compliance.
            </p>
          </div>
        </div>
      ) : (
        /* ── Submission form ── */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity */}
          <SectionCard
            step={1}
            icon={User}
            title="Identity Details"
            subtitle="Must exactly match your official records."
          >
            <Field label="Full Name (exactly as printed on PAN card)">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="input-field"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="PAN Number">
                <input
                  required
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="input-field font-mono tracking-widest uppercase"
                />
              </Field>
              <Field label="Aadhaar Last 4 Digits">
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={aadhaarLast4}
                  onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className="input-field font-mono tracking-[0.4em]"
                />
              </Field>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
              <Lock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Never share your full Aadhaar number anywhere. We only ask for the last 4 digits — the uploaded image is used solely for manual verification and is never shared.
              </p>
            </div>
          </SectionCard>

          {/* Documents */}
          <SectionCard
            step={2}
            icon={FileText}
            title="Document Images"
            subtitle="Take a photo or upload an existing image — files are compressed automatically before upload."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DocUploader
                title="PAN Card Image"
                icon={CreditCard}
                required
                doc={panDoc}
                serverUrl={kyc.status === "pending" || kyc.status === "rejected" ? kyc.panImageUrl : null}
                processing={processingDoc === "pan"}
                onCamera={() => requestCamera("pan")}
                onFile={() => panFileRef.current?.click()}
                onClear={() => clearDoc("pan")}
              />
              <DocUploader
                title="Aadhaar Card Image"
                icon={CreditCard}
                required
                doc={aadhaarDoc}
                serverUrl={kyc.status === "pending" || kyc.status === "rejected" ? kyc.aadhaarImageUrl : null}
                processing={processingDoc === "aadhaar"}
                onCamera={() => requestCamera("aadhaar")}
                onFile={() => aadhaarFileRef.current?.click()}
                onClear={() => clearDoc("aadhaar")}
              />
            </div>

            {/* Hidden inputs: native camera + file picker per document */}
            <input ref={panCameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleDocPicked(e, "pan")} />
            <input ref={panFileRef} type="file" accept="image/*" hidden onChange={(e) => handleDocPicked(e, "pan")} />
            <input ref={aadhaarCameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleDocPicked(e, "aadhaar")} />
            <input ref={aadhaarFileRef} type="file" accept="image/*" hidden onChange={(e) => handleDocPicked(e, "aadhaar")} />

            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50/70 border border-green-100">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-textMuted leading-relaxed">
                <span className="font-semibold text-textMain">Your privacy matters to us.</span> Document
                images are used only for manual verification and are{" "}
                <span className="font-semibold text-textMain">automatically &amp; permanently deleted from our
                servers 90 days after approval</span>. Only your name and masked ID numbers are retained
                for compliance.
              </p>
            </div>
          </SectionCard>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="card-surface p-5 space-y-3">
            <button
              type="submit"
              disabled={submitting || !!processingDoc}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting KYC…
                </>
              ) : kyc.status === "rejected" ? (
                "Resubmit KYC for Verification"
              ) : (
                "Submit KYC for Verification"
              )}
            </button>
            <p className="text-center text-[11px] text-textMuted">
              {submitting
                ? "Uploading documents securely… please keep this tab open."
                : "By submitting you confirm the details match your original documents."}
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 border border-borderSubtle max-w-xl mx-auto">
            <Info className="w-3.5 h-3.5 text-textMuted shrink-0 mt-0.5" />
            <p className="text-[11px] text-textMuted leading-relaxed">
              <span className="font-semibold text-textMain">TDS disclosure:</span> payouts are subject to Tax
              Deducted at Source as per Income Tax rules — currently <span className="font-semibold">2%</span> on
              affiliate commissions above ₹20,000/year and <span className="font-semibold">10%</span> on work
              earnings above ₹50,000/year (Apr–Mar). Deducted TDS is reported against your PAN and is claimable
              when you file your income tax return.
            </p>
          </div>
        </form>
      )}

      {/* Pending cross-link to affiliate */}
      {(kyc.status === "pending" || kyc.status === "not_submitted") &&
        user.affiliateEligible && (
          <Link
            href="/affiliate"
            className="block text-center text-[11px] text-brand-600 hover:text-brand-700 font-medium"
          >
            Affiliate commissions keep accruing during review → they release automatically once verified
          </Link>
        )}

      {/* Webcam capture modal (desktop) */}
      {cameraDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${cameraDoc === "pan" ? "PAN" : "Aadhaar"} photo capture`}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-borderSubtle">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-textMain truncate">
                  Capture {cameraDoc === "pan" ? "PAN Card" : "Aadhaar Card"} Photo
                </h3>
              </div>
              <button
                onClick={closeCamera}
                className="p-2 rounded-lg border border-borderSubtle hover:bg-neutral-50 text-textMuted transition-colors"
                aria-label="Close camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-black aspect-video shrink-0">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {!cameraError && (
                <>
                  <div className="pointer-events-none absolute inset-6 sm:inset-10">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-md" />
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-medium pointer-events-none">
                    Fit the full card inside the frame — all 4 corners visible
                  </div>
                </>
              )}

              {processingDoc && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-white/90 leading-relaxed max-w-sm">{cameraError}</p>
                  <button
                    onClick={() =>
                      (cameraDoc === "pan" ? panFileRef : aadhaarFileRef).current?.click()
                    }
                    className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload an Image Instead
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 bg-neutral-50 border-t border-borderSubtle">
              <p className="hidden sm:block text-[11px] text-textMuted">
                Place the card on a flat surface in good lighting.
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={closeCamera} className="btn-secondary text-xs py-2">
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady || !!cameraError || !!processingDoc}
                  className="btn-primary text-xs py-2 inline-flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">{label}</p>
      <p className={`mt-0.5 text-textMain ${masked ? "font-mono tracking-wider" : "font-semibold"}`}>
        {value}
      </p>
    </div>
  );
}

function SectionCard({
  step,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface p-6 space-y-5">
      <div className="flex items-start gap-3 pb-1">
        <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center shrink-0 relative">
          <Icon className="w-4 h-4" />
          <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center px-1">
            {step}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-textMain">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-textMuted mt-0.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function DocUploader({
  title,
  icon: Icon,
  required,
  doc,
  serverUrl,
  processing,
  onCamera,
  onFile,
  onClear,
}: {
  title: string;
  icon: any;
  required?: boolean;
  doc: DocState;
  serverUrl: string | null;
  processing: boolean;
  onCamera: () => void;
  onFile: () => void;
  onClear: () => void;
}) {
  const preview = doc?.previewUrl || serverUrl || null;
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-brand-600" />
        {title} {required && <span className="text-red-500">*</span>}
      </p>

      {preview ? (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-borderSubtle bg-neutral-50 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={title} className="w-full h-full object-cover" />
            {doc && (
              <>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                  {doc.sizeKb} KB · optimized
                </span>
                <button
                  type="button"
                  onClick={onClear}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          {doc && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCamera}
                className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Retake
              </button>
              <button
                type="button"
                onClick={onFile}
                className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1.5"
              >
                <Upload className="w-3 h-3" /> Replace
              </button>
              <span className="ml-auto text-[10px] font-semibold text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-borderSubtle bg-neutral-50/60 aspect-video flex flex-col items-center justify-center gap-3 p-5 text-center transition-colors">
          {processing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
              <p className="text-[10px] text-textMuted font-medium">Optimizing image…</p>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-full bg-white border border-borderSubtle flex items-center justify-center shadow-sm">
                <Camera className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={onCamera}
                  className="btn-primary text-[11px] py-2 px-3.5 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> Take Photo
                </button>
                <button
                  type="button"
                  onClick={onFile}
                  className="btn-secondary text-[11px] py-2 px-3.5 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
              </div>
              <p className="text-[10px] text-textMuted leading-relaxed max-w-[220px]">
                Full card visible, all 4 corners, no glare
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
