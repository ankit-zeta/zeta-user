"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-borderSubtle p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-textMain">Something went wrong</h2>
        <p className="text-sm text-textMuted">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
