"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Cookie, Shield, BarChart3, Megaphone, X, Check } from "lucide-react";

function generateFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx?.fillText("cookie-consent", 2, 2);
  const canvasData = canvas.toDataURL();
  const nav = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    `${screen.width}x${screen.height}`,
    new Date().getTimezoneOffset(),
    canvasData.slice(-50),
  ].join("|");
  let hash = 0;
  for (let i = 0; i < nav.length; i++) {
    const char = nav.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export default function CookieConsent() {
  const saveConsent = useMutation(api.cookieConsent.saveConsent);
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const existingConsent = useQuery(
    api.cookieConsent.getConsent,
    fingerprint ? { fingerprint } : "skip"
  );

  useEffect(() => {
    const fp = generateFingerprint();
    setFingerprint(fp);
    const stored = localStorage.getItem("zetagrow_cookie_consent");
    if (!stored) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (existingConsent) {
      localStorage.setItem("zetagrow_cookie_consent", "true");
      setVisible(false);
    }
  }, [existingConsent]);

  const handleAcceptAll = async () => {
    if (!fingerprint) return;
    await saveConsent({
      fingerprint,
      essential: true,
      analytics: true,
      marketing: true,
    });
    localStorage.setItem("zetagrow_cookie_consent", "true");
    setVisible(false);
  };

  const handleAcceptSelected = async () => {
    if (!fingerprint) return;
    await saveConsent({
      fingerprint,
      essential: true,
      analytics,
      marketing,
    });
    localStorage.setItem("zetagrow_cookie_consent", "true");
    setVisible(false);
  };

  const handleRejectAll = async () => {
    if (!fingerprint) return;
    await saveConsent({
      fingerprint,
      essential: true,
      analytics: false,
      marketing: false,
    });
    localStorage.setItem("zetagrow_cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-50 rounded-xl shrink-0">
            <Cookie className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-neutral-900">
              We value your privacy
            </h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              We use cookies to enhance your experience, analyze site traffic, and
              personalize content. You can choose which cookies to allow.
            </p>
          </div>
          <button
            onClick={handleRejectAll}
            className="p-1 text-neutral-400 hover:text-neutral-600 shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showDetails && (
          <div className="space-y-3 pl-1">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Essential</p>
                  <p className="text-[10px] text-neutral-500">Required for the site to function</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Always On</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Analytics</p>
                  <p className="text-[10px] text-neutral-500">Help us understand how visitors use the site</p>
                </div>
              </div>
              <button
                onClick={() => setAnalytics(!analytics)}
                className={`w-9 h-5 rounded-full transition-colors ${analytics ? "bg-brand-600" : "bg-neutral-300"}`}
              >
                <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${analytics ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Marketing</p>
                  <p className="text-[10px] text-neutral-500">Used to deliver relevant ads and campaigns</p>
                </div>
              </div>
              <button
                onClick={() => setMarketing(!marketing)}
                className={`w-9 h-5 rounded-full transition-colors ${marketing ? "bg-brand-600" : "bg-neutral-300"}`}
              >
                <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${marketing ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {!showDetails ? (
            <>
              <button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 sm:flex-none px-4 py-2 text-neutral-500 text-xs font-semibold hover:text-neutral-700 transition-colors"
              >
                Reject All
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleAcceptSelected}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-neutral-500 text-xs font-semibold hover:text-neutral-700 transition-colors"
              >
                Back
              </button>
            </>
          )}
        </div>

        <p className="text-[10px] text-neutral-400 text-center">
          By continuing to use this site, you agree to our{" "}
          <a href="/cookie-policy" className="underline hover:text-neutral-600">Cookie Policy</a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-neutral-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
