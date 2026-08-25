"use client";

import { friendlyError } from "@/lib/errors";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bgWarm">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useAuth();
  const resetMutation = useAction(api.auth.resetPassword);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Hydration gate
  const [hydrated, setHydrated] = useState(false);
  React.useEffect(() => setHydrated(true), []);

  const handleSubmit = async () => {
    if (!hydrated) return;
    if (!token) {
      setStatus("error");
      setMessage("No reset token found in the link.");
      return;
    }
    if (!password || password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await resetMutation({ token, newPassword: password });
      login(res.token, res.user);
      setStatus("success");
      setMessage("Password reset successfully! Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(friendlyError(err, "Reset failed. The link may be invalid or expired."));
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
          <h2 className="text-xl font-bold tracking-tight text-textMain">Password Reset!</h2>
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
        <h2 className="text-xl font-bold tracking-tight text-textMain">Reset Your Password</h2>
        <p className="text-xs text-textMuted">
          Enter your new password below. Must be at least 8 characters.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-surface p-8 space-y-6">
          {message && (
            <div className={`p-3 rounded-lg text-xs ${
              status === "error" ? "bg-red-50 border border-red-200 text-red-700"
              : status === "loading" ? "bg-brand-50 border border-brand-200 text-brand-700"
              : ""
            }`}>
              {message}
            </div>
          )}

          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && hydrated && status !== "loading") void handleSubmit();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  disabled={status === "loading"}
                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  disabled={status === "loading"}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={status === "loading" || !hydrated}
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2 disabled:opacity-60"
            >
              {!hydrated ? (
                "Loading…"
              ) : status === "loading" ? (
                <> <Loader2 className="w-4 h-4 animate-spin mr-2" /> Resetting... </>
              ) : (
                <> <Lock className="w-3.5 h-3.5 mr-2" /> Reset Password </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-borderSubtle">
              <p className="text-xs text-textMuted">
                <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                  <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}