"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
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
          Reset Your Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-surface p-8 space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-textMain">Recovery Email Dispatched</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
              </p>
              <Link href="/login" className="btn-primary text-xs inline-flex mt-2">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-textMuted leading-relaxed">
                Enter your registered account email and we will send you a secure verification link.
              </p>

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

              <button
                type="submit"
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2"
              >
                Send Reset Link
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-borderSubtle">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
