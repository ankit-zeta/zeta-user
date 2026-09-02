"use client";

import { friendlyError } from "@/lib/errors";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import {
  Mail,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bgWarm">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email") || "";
  const { login } = useAuth();
  const verifyMutation = useAction((api as any).auth.verifyEmail);
  const resendMutation = useAction((api as any).auth.resendVerificationEmail);

  const startedRef = useRef(false);
  // "pending" = post-signup check-your-inbox screen (email param, no token).
  // "error" stays reserved for broken/missing verification links.
  const [status, setStatus] = useState<"pending" | "verifying" | "success" | "error">(
    token ? "verifying" : emailFromUrl ? "pending" : "error"
  );
  const [message, setMessage] = useState<string>(
    token ? "" : emailFromUrl ? "" : "No verification token found in the link."
  );
  const [countdown, setCountdown] = useState(3);
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState(emailFromUrl);
  const [resent, setResent] = useState(false);

  // Auto-verify the moment the page opens with a token (guarded against double-fire)
  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const res = await verifyMutation({ token });
        // Session created server-side on success — sign the user in immediately
        login(res.token, res.user);
        setStatus("success");
        setCountdown(3);
      } catch (err: any) {
        setStatus("error");
        setMessage(friendlyError(err, "Verification failed. The link may be invalid or expired."));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Countdown → dashboard
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      router.replace("/dashboard");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, router]);

  const handleResend = async () => {
    const email = resendEmail.trim().toLowerCase();
    if (!email) return;
    setIsResending(true);
    setMessage("");
    try {
      await resendMutation({ email });
      setResent(true);
      setMessage(`A fresh verification link was sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setMessage(friendlyError(err, "Failed to resend. Please try again."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bgWarm">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/zetagrow logo no bg.png"
            alt="ZetaGrow"
            width={36}
            height={36}
            className="h-9 w-auto mx-auto"
          />
          <span className="text-2xl font-bold tracking-tight text-textMain">ZetaGrow</span>
        </Link>

        {status === "pending" && (
          <>
            <h2 className="text-xl font-bold tracking-tight text-textMain">
              Confirm your email
            </h2>
            <p className="text-xs text-textMuted">
              One quick step left to activate your account.
            </p>
          </>
        )}
        {status === "verifying" && (
          <>
            <h2 className="text-xl font-bold tracking-tight text-textMain">
              Verifying your email…
            </h2>
            <p className="text-xs text-textMuted">Hang tight — this only takes a second.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-xl font-bold tracking-tight text-textMain">
              We couldn&apos;t verify that link
            </h2>
            <p className="text-xs text-textMuted">
              Let&apos;s get this sorted so you can start learning.
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-surface p-8 space-y-6">
          {/* ── PENDING: confirmation email sent after signup ──────── */}
          {status === "pending" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-brand-100 animate-ping opacity-50" />
                  <span className="relative w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-brand-600" strokeWidth={1.75} />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-textMain">Check your inbox 📬</h3>
                <p className="text-sm text-textMuted leading-relaxed max-w-xs">
                  We&apos;ve sent a confirmation link to{" "}
                  <strong className="text-textMain">{emailFromUrl}</strong>. Click it to activate
                  your account and start learning.
                </p>
              </div>

              {!resent ? (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="btn-secondary w-full justify-center inline-flex items-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending new link…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" /> Didn&apos;t get it? Send a fresh link
                    </>
                  )}
                </button>
              ) : (
                message && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700 text-center">
                    {message}
                  </div>
                )
              )}

              <p className="text-[11px] text-textMuted text-center leading-relaxed">
                Tip: check your spam/promotions folder if it doesn&apos;t arrive within a minute.
              </p>

              <div className="pt-4 border-t border-borderSubtle flex justify-center text-xs">
                <Link
                  href="/login"
                  className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* ── VERIFYING ─────────────────────────────────────────── */}
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
              <p className="text-sm text-textMuted">
                Confirming your verification link with our servers…
              </p>
            </div>
          )}

          {/* ── SUCCESS ───────────────────────────────────────────── */}
          {status === "success" && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-60" />
                <CheckCircle2 className="w-16 h-16 text-green-600 relative" strokeWidth={1.75} />
              </div>

              <h3 className="text-lg font-bold text-textMain">Email verified! 🎉</h3>
              <p className="text-sm text-textMuted leading-relaxed max-w-xs">
                Welcome aboard — your account is fully activated and you&apos;re already signed
                in.
              </p>

              {/* Countdown */}
              <div className="w-full rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-brand-800">
                  Taking you to your dashboard in{" "}
                  <strong className="tabular-nums">{countdown}</strong>…
                </span>
              </div>

              <button
                onClick={() => router.replace("/dashboard")}
                className="btn-primary w-full justify-center inline-flex items-center gap-2 py-2.5 text-sm font-semibold"
              >
                Go to Dashboard now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── ERROR ─────────────────────────────────────────────── */}
          {status === "error" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-sm text-textMuted leading-relaxed">{message}</p>
              </div>

              {!resent && (
                <div className="space-y-3">
                  {!emailFromUrl && (
                    <div className="space-y-1.5">
                      <label htmlFor="resend-email" className="text-xs font-semibold text-textMain">
                        Your account email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="resend-email"
                          type="email"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleResend}
                    disabled={isResending || !(emailFromUrl || resendEmail).trim()}
                    className="btn-primary w-full justify-center inline-flex items-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending new link…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" /> Send me a fresh link
                      </>
                    )}
                  </button>
                  {emailFromUrl && (
                    <p className="text-[11px] text-textMuted text-center">
                      Link will be sent to{" "}
                      <strong className="text-textMain">{emailFromUrl}</strong>
                    </p>
                  )}
                </div>
              )}

              {resent && message && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700 text-center">
                  {message}
                </div>
              )}

              <div className="pt-4 border-t border-borderSubtle flex items-center justify-between text-xs">
                <Link
                  href="/login"
                  className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </Link>
                <Link href="/signup" className="font-medium text-textMuted hover:text-textMain">
                  Create new account
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-textMuted">
          Wrong email or still stuck?{" "}
          <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
