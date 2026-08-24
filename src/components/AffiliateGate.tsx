"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/convex";

export function useHasPurchasedProgram(): boolean {
  const { user } = useAuth();
  return !!user && (user.enrolledProgramIds?.length || 0) > 0;
}

export default function AffiliateGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const hasPurchased = useHasPurchasedProgram();

  useEffect(() => {
    if (user && !hasPurchased) {
      router.replace("/dashboard");
    }
  }, [user, hasPurchased, router]);

  if (!hasPurchased) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
