"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { User, Mail, Lock, Phone, Gift } from "lucide-react";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bgWarm">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCodeFromUrl = searchParams.get("ref") || "";

  const { login } = useAuth();
  const signupMutation = useMutation(api.auth.signup);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    referralCode: refCodeFromUrl,
    agreeTerms: true,
  });

  useEffect(() => {
    if (refCodeFromUrl) {
      setFormData((prev) => ({ ...prev, referralCode: refCodeFromUrl.toUpperCase() }));
    }
  }, [refCodeFromUrl]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please accept the Terms of Service to proceed.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signupMutation({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        referralCode: formData.referralCode.trim() ? formData.referralCode.trim().toUpperCase() : undefined,
        phone: formData.phone.trim() || undefined,
      });

      login(res.token, res.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
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
          Create your account
        </h2>
        <p className="text-xs text-textMuted">
          Start your journey in verified digital skills and client projects.
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
              <label className="text-xs font-semibold text-textMain">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-textMain">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-textMain">Confirm *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Referral Code (Optional)</label>
              <div className="relative">
                <Gift className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. DEMO123"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs uppercase focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 text-xs text-textMuted">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-0.5 rounded border-borderSubtle text-brand-600 focus:ring-brand-600"
              />
              <label htmlFor="terms" className="leading-tight">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-brand-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-brand-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-borderSubtle">
            <p className="text-xs text-textMuted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
