"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DirectSellingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
        <ArrowRight className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-textMain">Direct Selling Policy</h1>
      <p className="text-textMuted leading-relaxed">
        Our direct selling and affiliate guidelines have been moved to a dedicated page.
      </p>
      <Link href="/affiliate-guidelines" className="btn-primary inline-flex items-center gap-2">
        View Affiliate Guidelines <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}