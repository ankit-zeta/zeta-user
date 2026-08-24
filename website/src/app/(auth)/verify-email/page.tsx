"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";

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
  const emailFromUrl = searchParams.get("email");
  const { login } = useAuth();
  const verifyMutation = useAction(api.auth.verifyEmail);
  const resendMutation = useAction(api.auth.resendVerificationEmail);

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "idle">("idle");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    setStatus("verifying");
    setMessage("");

    try {
      const res = await verifyMutation({ token });
      login(res.token, res.user);
      setStatus("success");
      setMessage("Email verified successfully! Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Verification failed. The link may be invalid or expired.");
    }
  };

  const handleResend = async () => {
    if (!emailFromUrl) return;
    setIsResending(true);
    try {
      await resendMutation({ email: emailFromUrl });
      setMessage("Verification email resent! Check your inbox.");
    } catch (err: any) {
      setMessage(err.message || "Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bgWarm">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
              Z
            </div>
            <span className="text-2xl font-bold tracking-tight text-textMain">ZetaGrow</span>
          </Link>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-textMain">Email Verified!</h2>
          <p className="text-xs text-textMuted">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bgWarm">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
            Z
          </div>
          <span className="text-2xl font-bold tracking-tight text-textMain">ZetaGrow</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-textMain">
          {status === "verifying" ? "Verifying your email..." : "Verify Your Email"}
        </h2>
        <p className="text-xs text-textMuted">
          {status === "verifying"
            ? "Please wait while we verify your email address."
            : "Click the link in your email to verify your account."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-surface p-8 space-y-6">
          {emailFromUrl && (
            <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-700">
              Sending verification to: <strong>{emailFromUrl}</strong>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg text-xs ${
              status === "error" ? "bg-red-50 border border-red-200 text-red-700"
              : status === "verifying" ? "bg-brand-50 border border-brand-200 text-brand-700"
              : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              {message}
            </div>
          )}

          {status === "verifying" ? (
            <div className="flex items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-sm text-textMuted">Verifying your email address...</p>
            </div>
          ) : status === "error" ? (
            <div className="space-y-4">
              <p className="text-sm text-textMuted">
                The verification link may have expired or already been used.
              </p>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="btn-secondary w-full justify-center py-2.5 text-xs font-semibold"
              >
                {isResending ? (
                  <> <Loader2 className="w-4 h-4 animate-spin mr-2" /> Resending... </>
                ) : (
                  <> <RefreshCw className="w-4 h-4 mr-2" /> Resend Verification Email </>
                )}
              </button>
              <Link href="/signup" className="block text-center text-xs text-brand-600 hover:text-brand-700">
                Create a new account instead
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-y-3">
                <Mail className="w-8 h-8 text-brand-600" />
                <div className="text-center">
                  <p className="text-sm font-medium text-textMain">Check your inbox</p>
                  <p className="text-xs text-textMuted">We sent a verification link to your email</p>
                </div>
              </div>
              <p className="text-xs text-textMuted">
                Didn't receive the email? Check your spam folder or request a new link.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}