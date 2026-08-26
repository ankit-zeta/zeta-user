"use client";

import { friendlyError } from "@/lib/errors";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { useGst, withGst } from "@/lib/gst";
import {
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Clock,
  Award,
  CreditCard,
  FileText,
  XCircle,
  ArrowLeft,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: any) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );
    if (existing) {
      if (window.Razorpay) return resolve(true);
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      const checkInterval = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(Boolean(window.Razorpay));
      }, 3000);
      return;
    }
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Stage =
  | "review"
  | "creating_order"
  | "awaiting_payment"
  | "verifying"
  | "enrolling"
  | "done"
  | "failed";

export default function CheckoutPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user, token } = useAuth();

  const plan: any = useQuery(
    api.plans.getPlanBySlug,
    slug ? { slug } : "skip"
  );

  const rzpConfig: any = useQuery(api.paymentsConfig.getRazorpayConfig);
  const gst = useGst();

  const createOrder = useAction(api.payments.createRazorpayOrder);
  const verifyPayment = useAction(api.payments.verifyRazorpayPayment);
  const cancelOrder = useAction(api.payments.cancelRazorpayOrder);
  const completePurchase = useMutation(
    api.affiliates.processPurchaseWithAffiliate
  );

  const [agreeNoRefund, setAgreeNoRefund] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [stage, setStage] = useState<Stage>("review");
  const [errorMsg, setErrorMsg] = useState("");

  // Mirror of `stage` for use inside Razorpay callbacks without stale
  // closures (the callbacks are created once per payment attempt).
  const stageRef = useRef<Stage>("review");
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Recovery: a previous attempt was paid (webhook confirmed) but the browser
  // closed before activation finished — offer one-click completion.
  const pendingPaidOrder: any = useQuery(
    api.paymentsData.getMyPendingPaidOrder,
    token && plan ? { token, planId: plan._id } : "skip"
  );

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  const enrolledSet = new Set(user?.enrolledProgramIds || []);
  const planCourses: any[] = plan?.courses || [];
  const allOwned =
    plan && planCourses.length > 0 &&
    planCourses.every((c: any) => enrolledSet.has(c._id));

  const startPayment = useCallback(async () => {
    setErrorMsg("");
    if (!token || !plan) return;

    if (!rzpConfig?.keyId) {
      setStage("failed");
      setErrorMsg("Payment gateway is not ready (Razorpay Key ID missing). Please check back shortly.");
      return;
    }

    setStage("creating_order");

    // 1. Load the Checkout script
    const scriptOk = await loadRazorpayScript();
    if (!scriptOk) {
      setStage("failed");
      setErrorMsg("Could not load the payment gateway. Check your connection and try again.");
      return;
    }

    // 2. Create the order server-side
    let order: any;
    try {
      order = await createOrder({ token, planId: plan._id });
    } catch (err: any) {
      setStage("failed");
      setErrorMsg(friendlyError(err, "Could not start the payment. Please try again."));
      return;
    }

    // 3. Open Razorpay Checkout
    setStage("awaiting_payment");
    if (!window.Razorpay) {
      setStage("failed");
      setErrorMsg("Payment gateway failed to load. Please refresh and try again.");
      return;
    }
    const rzp = new window.Razorpay({
      key: rzpConfig?.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "ZetaGrow",
      description: `${plan.name} — all courses access`,
      order_id: order.razorpayOrderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      notes: { plan: plan.name },
      theme: { color: "#176B4D" },
      modal: {
        confirm_close: true,
        // IMPORTANT: the dismiss callback lives INSIDE `modal` as `ondismiss`.
        // (`modal_ondismiss` is not a Razorpay option — it never fired, which
        // left the button stuck on "Processing…" when the window was closed.)
        ondismiss: () => {
          // If verification already started, the money moved — don't reset.
          if (stageRef.current !== "awaiting_payment") return;

          // Record the abandonment in the payment funnel (fire-and-forget).
          cancelOrder({
            token,
            razorpayOrderId: order.razorpayOrderId,
            reason: "User closed the payment window",
          }).catch(() => {});

          setStage("review");
          setErrorMsg(
            "Payment was cancelled — no money was charged. You can retry whenever you're ready."
          );
        },
      },
      handler: async (response: any) => {
        // 4. Server-side signature verification
        setStage("verifying");
        try {
          const v: any = await verifyPayment({
            token,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          // 5. Unlock the courses (existing enrollment pipeline)
          setStage("enrolling");
          await completePurchase({
            token,
            planId: plan._id,
            paymentMethod: "razorpay",
            orderId: v.orderDbId,
          });

          setStage("done");
        } catch (err: any) {
          setStage("failed");
          setErrorMsg(friendlyError(err, "Payment could not be verified."));
        }
      },
    });

    rzp.open();
  }, [token, plan, rzpConfig, user, createOrder, verifyPayment, cancelOrder, completePurchase]);

  // Completes activation for an order the webhook confirmed as paid but the
  // browser never finished enrolling (user closed the tab mid-flow).
  const resumePendingActivation = useCallback(async () => {
    if (!token || !plan || !pendingPaidOrder) return;
    setErrorMsg("");
    setStage("enrolling");
    try {
      await completePurchase({
        token,
        planId: plan._id,
        paymentMethod: "razorpay",
        orderId: pendingPaidOrder.orderId,
      });
      setStage("done");
    } catch (err: any) {
      setStage("failed");
      setErrorMsg(
        friendlyError(err, "Activation failed. Please contact support with your payment id.")
      );
    }
  }, [token, plan, pendingPaidOrder, completePurchase]);

  // ── Loading / guards ──
  if (plan === undefined || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-64"></div>
        <div className="h-64 bg-neutral-200 rounded-xl"></div>
      </div>
    );
  }

  if (plan === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-textMain">Plan Not Found</h1>
        <p className="text-sm text-textMuted">This learning plan does not exist or has been archived.</p>
        <Link href="/programs" className="btn-primary inline-flex">Browse Programs</Link>
      </div>
    );
  }

  const savings = plan.compareAtPrice ? plan.compareAtPrice - plan.price : 0;
  // Paise-precise totals, identical formula to the server-side order creation.
  const totals = withGst(plan.price, gst);
  const fmt = (paise: number) =>
    (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // ── Success screen ──
  if (stage === "done") {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-textMain">Payment Successful!</h1>
        <p className="text-sm text-textMuted leading-relaxed">
          Welcome aboard! <strong className="text-textMain">{plan.name}</strong> is now active on your account — every course in the plan has been unlocked.
          A confirmation email is on its way.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/dashboard/programs" className="btn-primary text-sm py-2.5 px-6">
            Go to My Programs
          </Link>
          <Link href="/dashboard" className="btn-secondary text-sm py-2.5 px-6">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const busy =
    stage === "creating_order" ||
    stage === "awaiting_payment" ||
    stage === "verifying" ||
    stage === "enrolling";

  const stageLabel: Record<string, string> = {
    creating_order: "Preparing secure order…",
    awaiting_payment: "Complete the payment in the Razorpay window…",
    verifying: "Verifying payment signature…",
    enrolling: "Unlocking your courses…",
  };

  return (
    <div className="bg-warm min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-borderSubtle bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link href={plan.slug ? `/plans/${plan.slug}` : "/programs"} className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-textMain transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to plan details
          </Link>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-textMuted">
            <Lock className="w-3.5 h-3.5 text-brand-600" /> 256-bit SSL Secure Checkout
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">Checkout</h1>
        <p className="text-xs text-textMuted mt-1">
          Review your order, accept the terms, and unlock your courses instantly.
        </p>

        {allOwned ? (
          <div className="mt-8 card-surface p-8 text-center space-y-3 max-w-lg mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <h2 className="text-base font-bold text-textMain">You already own this plan</h2>
            <p className="text-xs text-textMuted">Every course in {plan.name} is already unlocked on your account.</p>
            <Link href="/dashboard/programs" className="btn-primary text-xs py-2 inline-flex mt-1">
              Open My Programs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
            {/* Recovery: paid earlier but activation didn't finish */}
            {pendingPaidOrder && stage === "review" && (
              <div className="lg:col-span-5 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-900">Payment received — activation incomplete</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    We received your payment for {plan.name}, but the activation didn't finish (the window may have closed too early).
                    Click below to unlock your courses now — you won't be charged again.
                  </p>
                </div>
                <button
                  onClick={resumePendingActivation}
                  disabled={busy}
                  className="btn-primary text-xs py-2 px-4 shrink-0 disabled:opacity-50"
                >
                  Complete activation
                </button>
              </div>
            )}

            {/* Left: Order summary */}
            <div className="lg:col-span-3 space-y-6">
              {/* Plan card */}
              <div className="card-surface overflow-hidden">
                <div className="p-6 border-b border-borderSubtle bg-gradient-to-r from-brand-50/70 to-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                    Learning Plan
                  </span>
                  <h2 className="text-lg font-bold text-textMain mt-0.5">{plan.name}</h2>
                  <p className="text-xs text-textMuted mt-1">{plan.tagline}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-textMuted">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    {planCourses.length} course{planCourses.length === 1 ? "" : "s"} included
                  </div>

                  <div className="space-y-3">
                    {planCourses.map((c: any) => (
                      <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg border border-borderSubtle bg-neutral-50/60">
                        <div className="relative w-16 h-10 rounded-md overflow-hidden bg-brand-50 shrink-0">
                          {c.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.thumbnail} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-brand-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-textMain truncate">{c.name}</p>
                          <p className="text-[11px] text-textMuted flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {c.totalMinutes >= 60
                              ? `${Math.floor(c.totalMinutes / 60)}h ${c.totalMinutes % 60}m`
                              : `${c.totalMinutes} min`}
                            · {c.lessonCount} lessons
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-1 text-[11px] text-textMuted">
                    {plan.certificateEnabled !== false && (
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-brand-600" /> Certificate per course</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Buyer info */}
              <div className="card-surface p-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-textMain">Billing Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Name</p>
                    <p className="font-medium text-textMain mt-0.5">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Email (receipt)</p>
                    <p className="font-medium text-textMain mt-0.5 break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-neutral-50 border border-borderSubtle">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-textMuted leading-relaxed">
                    Payment is processed securely by Razorpay. Your card / UPI details never touch ZetaGrow servers.
                  </p>
                </div>
              </div>

              {/* Agreements */}
              <div className="card-surface p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-textMain flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" /> Terms &amp; Policies
                </h3>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeNoRefund}
                    onChange={(e) => setAgreeNoRefund(e.target.checked)}
                    className="mt-0.5 accent-brand-600"
                  />
                  <span className="text-[11px] text-textMuted leading-relaxed">
                    <strong className="text-textMain">No-refund policy.</strong> I understand that ZetaGrow sells
                    digital learning content delivered instantly. Once payment succeeds and course access is granted,{" "}
                    <strong className="text-textMain">the fee is strictly non-refundable</strong> — including change of mind,
                    unused access, or failure to complete courses. Access is not transferable or shareable.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 accent-brand-600"
                  />
                  <span className="text-[11px] text-textMuted leading-relaxed">
                    <strong className="text-textMain">I agree</strong> to the{" "}
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline font-medium">Terms of Service</Link>,{" "}
                    <Link href="/refund-policy" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline font-medium">Refund Policy</Link>,{" "}
                    <Link href="/payment-terms" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline font-medium">Payment Terms</Link> and{" "}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline font-medium">Privacy Policy</Link>, and consent to
                    receiving transactional emails about my purchase.
                  </span>
                </label>

                <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-[10px] text-blue-800 leading-relaxed">
                  <strong>TDS disclosure:</strong> if you later earn via work projects or affiliate commissions,
                  Tax Deducted at Source applies as per Income Tax rules (currently 2% above ₹20,000/yr on affiliate
                  commissions and 10% above ₹50,000/yr on work earnings, Apr–Mar). Course fees are one-time purchase
                  prices; {gst?.enabled ? `${gst.rate}% ${gst.label} is added at checkout as shown in the order summary.` : "taxes are shown at checkout where applicable."}
                </div>
              </div>
            </div>

            {/* Right: Payment panel */}
            <div className="lg:col-span-2">
              <div className="card-surface p-6 space-y-5 lg:sticky lg:top-24 shadow-sm border-brand-200">
                <h3 className="text-sm font-bold text-textMain">Order Summary</h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-textMuted">
                    <span>{plan.name} <span className="text-[10px]">(excl. {gst?.label || "GST"})</span></span>
                    <span className="font-medium text-textMain">{fmt(totals.base)}</span>
                  </div>
                  {savings > 0 && (
                    <>
                      <div className="flex items-center justify-between text-textMuted">
                        <span>Bundle discount</span>
                        <span className="text-green-600 font-medium">− ₹{savings.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between text-textMuted">
                        <span>Compare at value</span>
                        <span className="line-through">₹{plan.compareAtPrice?.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  )}
                  {gst?.enabled ? (
                    <div className="flex items-center justify-between text-textMuted">
                      <span>{gst.label} @ {gst.rate}% (CGST + SGST / IGST as applicable)</span>
                      <span className="font-medium text-textMain">{fmt(totals.tax)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-textMuted">
                      <span>{gst?.label || "GST"}</span>
                      <span>Not applicable</span>
                    </div>
                  )}
                  <div className="border-t border-borderSubtle pt-3 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-textMain">Total payable</span>
                    <span className="text-2xl font-extrabold text-textMain">
                      ₹{fmt(totals.total)}
                    </span>
                  </div>
                </div>

                {(errorMsg || stage === "failed") && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-px" />
                    <p className="text-[11px] text-red-700 leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                {stage !== "review" && stage !== "failed" && busy && (
                  <div className="rounded-lg border border-borderSubtle bg-neutral-50 p-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin shrink-0" />
                    <p className="text-[11px] text-textMuted font-medium">{stageLabel[stage]}</p>
                  </div>
                )}

                {rzpConfig && !rzpConfig.enabled ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Online payments are being set up right now. Please check back shortly.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={startPayment}
                    disabled={!agreeNoRefund || !agreeTerms || busy}
                    className="btn-primary w-full py-3.5 text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {busy ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Pay ₹{fmt(totals.total)} Securely
                      </span>
                    )}
                  </button>
                )}

                <p className="text-center text-[10px] text-textMuted">
                  UPI · Cards · NetBanking · Wallets — powered by Razorpay
                </p>

                <div className="border-t border-borderSubtle pt-4 space-y-2">
                  <div className="flex items-start gap-2 text-[10px] text-textMuted leading-relaxed">
                    <Lock className="w-3 h-3 shrink-0 mt-0.5 text-brand-600" />
                    Instant access after payment verification — usually within seconds.
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-textMuted leading-relaxed">
                    <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5 text-brand-600" />
                    Every payment is signature-verified server-side before your courses unlock.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
