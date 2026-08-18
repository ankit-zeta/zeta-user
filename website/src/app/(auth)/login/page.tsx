"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { Lock, Mail } from "lucide-react";

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
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login } = useAuth();
  const loginMutation = useMutation(api.auth.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await loginMutation({
        email: email.trim().toLowerCase(),
        password,
      });

      login(res.token, res.user);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
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
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@zetagrow.com"
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Demo Login Helper */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-borderSubtle text-[11px] space-y-1 text-textMuted">
            <p className="font-semibold text-textMain">Demo User Credentials:</p>
            <p>Email: <code className="text-brand-700">demo@zetagrow.com</code></p>
            <p>Password: <code className="text-brand-700">DemoPassword123!</code></p>
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
