"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, RotateCw, Home, LifeBuoy } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bgWarm">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/zetagrow logo no bg.png"
            alt="ZetaGrow"
            width={36}
            height={36}
            className="h-9 w-auto mx-auto"
          />
          <span className="text-2xl font-bold tracking-tight text-textMain">ZetaGrow</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-surface p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-textMain">Something went wrong</h2>
            <p className="text-xs text-textMuted leading-relaxed">
              We hit an unexpected snag loading this page. It&apos;s not you — try again, and
              if it keeps happening we&apos;re one click away.
            </p>
          </div>

          <button
            onClick={reset}
            className="btn-primary w-full justify-center inline-flex items-center gap-2 py-2.5 text-sm font-semibold"
          >
            <RotateCw className="w-4 h-4" />
            Try again
          </button>

          <div className="pt-4 border-t border-borderSubtle flex items-center justify-center gap-5 text-xs">
            <Link
              href="/"
              className="font-medium text-textMuted hover:text-textMain inline-flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <Link
              href="/contact"
              className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5" /> Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
