"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { useAuth } from "@/lib/convex";
import { User, Mail, Lock, Phone, Gift, Eye, EyeOff } from "lucide-react";

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
    website: "",
    formStartedAt: Date.now(),
  });

  useEffect(() => {
    if (refCodeFromUrl) {
      setFormData((prev) => ({ ...prev, referralCode: refCodeFromUrl.toUpperCase() }));
    }
  }, [refCodeFromUrl]);

  const [isLoading, setIsLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementScrolled, setAgreementScrolled] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const refCodeLocked = Boolean(refCodeFromUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    // Open the full-read agreement popup instead of creating the account yet
    setShowAgreement(true);
  };

  const handleAgreementScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setAgreementScrolled(true);
  };

  const createAccount = async () => {
    if (!agreementScrolled && !agreementAccepted) return;
    setFormData((prev) => ({ ...prev, agreeTerms: true }));
    setShowAgreement(false);
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

                        <button
              type="button"
              onClick={() => setShowAgreement(true)}
              className="w-full text-left p-3 rounded-lg bg-brand-50 border border-brand-200 text-[11px] text-textMuted hover:border-brand-400 transition-colors"
            >
              <span className="font-semibold text-textMain">Terms, Referral Program &amp; Remuneration Policy:</span>{" "}
              By creating an account you accept our{" "}
              <Link href="/terms" className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Terms</Link>,{" "}
              <Link href="/affiliate-guidelines" className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Referral Guidelines</Link> and{" "}
              <Link href="/variable-remuneration-policy" className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Variable Remuneration Policy</Link>.
              Courses are text-based digital products (non-refundable once accessed). A full-read confirmation popup will appear when you continue.
              <span className="block mt-1 font-semibold text-brand-700">Tap to read the full agreement →</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
      {/* Full-read agreement popup */}
      {showAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-borderSubtle">
              <h3 className="text-base font-bold text-textMain">Before you continue — please read</h3>
              <p className="text-[11px] text-textMuted mt-0.5">Scroll to the bottom to enable acceptance.</p>
            </div>

            <div
              onScroll={handleAgreementScroll}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs text-textMuted leading-relaxed"
            >
              <section className="space-y-1.5">
                <h4 className="font-bold text-textMain text-sm">1. What You Are Buying</h4>
                <p>ZetaGrow provides text-based educational courses delivered instantly inside your dashboard, along with downloadable resource kits and lifetime access to the curriculum you purchase. Courses are digital products — once accessed, they are non-refundable.</p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-textMain text-sm">2. Certificates</h4>
                <p>Each course ends with a short test. Passing it generates a certificate with a unique public verification ID that anyone can check on this website. Certificates confirm course completion only — they are not professional licences or job guarantees.</p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-textMain text-sm">3. No Income, Job or Outcome Guarantees</h4>
                <p>ZetaGrow is an education platform. We never promise income, employment, business results or returns of any kind. Any work opportunities shown in our marketplace are independent client projects that qualified learners may choose to apply for; selection depends entirely on client requirements and deliverable quality.</p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-textMain text-sm">4. Optional Referral Program (How Commissions Work)</h4>
                <p>Participation is completely optional. If you choose to share your referral link, ZetaGrow may pay you a single-level commission when a person you referred makes a genuine, completed program purchase. Key conditions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Commissions are earned only on completed course purchases — never for sign-ups, clicks or recruitment.</li>
                  <li>The program is strictly single-level: no downline, upline, team or tiered structures exist.</li>
                  <li>Each sale must pass a genuine-consumption check: the referred learner must actually start using the course before any commission is activated.</li>
                  <li>Commissions are held for a 30-day review window, subject to taxes/TDS as applicable under Indian law.</li>
                  <li>Self-referrals, fake accounts or misleading promotion end participation immediately.</li>
                </ul>
                <p>Full details:{" "}
                  <Link href="/affiliate-guidelines" className="text-brand-700 underline" target="_blank">Referral Guidelines</Link> ·{" "}
                  <Link href="/variable-remuneration-policy" className="text-brand-700 underline" target="_blank">Variable Remuneration Policy</Link>
                </p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-textMain text-sm">5. Platform Terms & Usage Data</h4>
                <p>Use of ZetaGrow is governed by our{" "}
                  <Link href="/terms" className="text-brand-700 underline" target="_blank">Terms of Service</Link>,{" "}
                  <Link href="/privacy" className="text-brand-700 underline" target="_blank">Privacy Policy</Link> and{" "}
                  <Link href="/acceptable-use" className="text-brand-700 underline" target="_blank">Acceptable Use Policy</Link>. To verify genuine course consumption for referral purposes, we record lesson-completion events within your account, as described in these policies.
                </p>
              </section>
              <p className="text-[11px] italic">You scrolled to the end — thank you for reading carefully. ✅</p>
            </div>

            <div className="px-6 py-4 border-t border-borderSubtle flex items-center justify-between gap-3 bg-neutral-50">
              <button type="button" onClick={() => setShowAgreement(false)} className="btn-secondary text-xs py-2 px-4">
                Decline & Edit
              </button>
              <button
                type="button"
                disabled={!agreementScrolled}
                onClick={createAccount}
                className={`btn-primary text-xs py-2 px-5 ${!agreementScrolled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Creating Account…" : agreementScrolled ? "I Have Read & Accept — Continue" : "Scroll to accept"}
              </button>
            </div>
          </div>
        </div>
      )}

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
