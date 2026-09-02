"use client";

import { friendlyError } from "@/lib/errors";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bgWarm">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Open-redirect guard: only allow same-site relative paths
  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  const redirectUrl =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !/^https?:\/\//i.test(rawRedirect)
      ? rawRedirect
      : "/dashboard";

  const { login, token, user, isLoading: authLoading } = useAuth();
  const loginAction = useAction(api.auth.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Hydration gate: prevents native form submission if the user clicks
  // before React event handlers are attached.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Already signed in? Skip the form entirely.
  useEffect(() => {
    if (!authLoading && token && user) {
      router.replace(redirectUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token, user]);

  // Contextual notice based on why the user landed here
  const reason = searchParams.get("reason");
  const notice =
    reason === "session_expired"
      ? "You were signed out because your account was used to log in on another device. Please sign in again."
      : reason === "affiliate_refresh"
      ? "Your Affiliate Center session ended (page refresh). Sign in again to continue."
      : reason === "affiliate_timeout"
      ? "Your Affiliate Center session ended automatically after 10 minutes for security. Sign in again to continue."
      : null;

  const handleSubmit = async () => {
    if (!hydrated) return; // never act before handlers are live
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Collect client metadata for login audit
      let ip = "";
      let location = "";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ip = ipData.ip || "";
        if (ip) {
          try {
            const locRes = await fetch(`https://ipapi.co/${ip}/json/`);
            const locData = await locRes.json();
            location = [locData.city, locData.region, locData.country_name].filter(Boolean).join(", ");
          } catch {}
        }
      } catch {}

      const ua = navigator.userAgent;
      const deviceType = /Mobi|Android|iPhone/i.test(ua) ? "mobile" : /iPad|Tablet/i.test(ua) ? "tablet" : "desktop";
      const deviceOS = /Win/i.test(ua) ? "Windows" : /Mac/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : "Unknown";
      const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Brave)\/[\d.]+/);
      const deviceBrowser = browserMatch ? browserMatch[1] : "Unknown";

      const res = await loginAction({
        email: email.trim().toLowerCase(),
        password,
        ip: ip || undefined,
        userAgent: ua || undefined,
        deviceType,
        deviceOS,
        deviceBrowser,
        location: location || undefined,
      });

      login(res.token, res.user);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(friendlyError(err, "Invalid email or password."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bgWarm">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
            Z
          </div>
          <span className="text-2xl font-bold tracking-tight text-textMain">
            ZetaGrow
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-textMain">
          Sign in to your account
        </h2>
        <p className="text-xs text-textMuted">
          Access your courses, client deliverables, and wallet dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-surface p-8 space-y-6">
          {notice && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              {notice}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && hydrated && !isLoading) void handleSubmit();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-textMain">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isLoading || !hydrated}
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2 disabled:opacity-60"
            >
              {!hydrated ? "Loading…" : isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="text-center pt-2 border-t border-borderSubtle">
            <p className="text-xs text-textMuted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
