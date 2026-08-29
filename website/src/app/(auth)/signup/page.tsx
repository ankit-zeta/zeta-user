"use client";

import { friendlyError } from "@/lib/errors";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { User, Mail, Lock, Phone, Gift, Eye, EyeOff, Check } from "lucide-react";

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

  const { login, token, user, isLoading: authLoading } = useAuth();
  const signupAction = useAction(api.auth.signup);

  // Already signed in? No need for the signup form.
  useEffect(() => {
    if (!authLoading && token && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, token, user, router]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    referralCode: refCodeFromUrl,
    agreeTerms: false,
    agreePrivacy: false,
    website: "",
    formStartedAt: Date.now(),
  });

  useEffect(() => {
    if (refCodeFromUrl) {
      setFormData((prev) => ({ ...prev, referralCode: refCodeFromUrl.toUpperCase() }));
    }
  }, [refCodeFromUrl]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const refCodeLocked = Boolean(refCodeFromUrl);

  // Hydration gate: prevents native form submission before handlers attach.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const handleSubmit = async () => {
    if (!hydrated) return;
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must accept the Terms of Service.");
      return;
    }

    if (!formData.agreePrivacy) {
      setError("You must accept the Privacy Policy.");
      return;
    }

    // Honeypot check: if hidden field is filled, likely a bot
    if (formData.website) {
      setError("Invalid submission.");
      return;
    }

    // Timing check: reject submissions under 2 seconds (likely bots)
    if (Date.now() - formData.formStartedAt < 2000) {
      setError("Please take a moment to fill out the form.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signupAction({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        referralCode: formData.referralCode.trim() ? formData.referralCode.trim().toUpperCase() : undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website,
        formStartedAt: formData.formStartedAt,
      });

      // Redirect to verification page instead of dashboard
      // The signup now returns emailVerified: false
      router.push(`/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`);
    } catch (err: any) {
      setError(friendlyError(err, "Failed to create account. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (field: "agreeTerms" | "agreePrivacy") => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const Checkbox = ({ checked, onChange, label, href, linkText }: { 
    checked: boolean; 
    onChange: () => void;
    label: string;
    href: string;
    linkText: string;
  }) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <button
        type="button"
        onClick={onChange}
        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? "border-brand-600 bg-brand-600" : "border-borderSubtle bg-white"
        } hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200`}
        aria-checked={checked}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </button>
      <span className="text-xs text-textMuted leading-relaxed">
        {label} <Link href={href} className="text-brand-700 underline hover:text-brand-600">{linkText}</Link>
      </span>
    </label>
  );

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

          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && hydrated && !isLoading) void handleSubmit();
            }}
          >
            {/* Honeypot field - hidden from users, filled by bots */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />
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
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 chars"
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
                <label className="text-xs font-semibold text-textMain">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-9 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white"
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

            {refCodeLocked && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">
                Referral Code
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.referralCode}
                  readOnly
                  disabled
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs uppercase focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white disabled:bg-neutral-100 disabled:text-textMuted"
                />
              </div>
              <p className="text-[10px] text-brand-700 font-semibold flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Applied from your referral link — it cannot be changed.
              </p>
            </div>
            )}

            <div className="space-y-2.5 pt-2">
              <Checkbox
                checked={formData.agreeTerms}
                onChange={() => handleCheckboxChange("agreeTerms")}
                label="I agree to the"
                href="/terms"
                linkText="Terms of Service"
              />
              <Checkbox
                checked={formData.agreePrivacy}
                onChange={() => handleCheckboxChange("agreePrivacy")}
                label="I agree to the"
                href="/privacy"
                linkText="Privacy Policy"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isLoading || !hydrated}
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2 disabled:opacity-60"
            >
              {!hydrated ? "Loading…" : isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

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