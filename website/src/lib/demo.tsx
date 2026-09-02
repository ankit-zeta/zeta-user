"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "./convex";

interface DemoConfig {
  workBalance: number;
  partnerEarnings: number;
  totalWithdrawn: number;
  fakeTransactions: Array<{
    type: string;
    amount: number;
    description: string;
    status: string;
    createdAt: number;
  }>;
  fakeWithdrawals: Array<{
    amount: number;
    status: string;
    method: string;
    createdAt: number;
    processedAt?: number;
  }>;
  kycStatus: string;
}

interface DemoContextType {
  isDemo: boolean;
  demoConfig: DemoConfig | null;
  isLoading: boolean;
  refetchDemoData: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  demoConfig: null,
  isLoading: true,
  refetchDemoData: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const demoData = useQuery(
    api.users.getMyDemoData,
    token ? { token } : "skip"
  );

  const isDemo = demoData?.isDemo || false;
  const demoConfig = demoData?.demoConfig || null;
  const isLoading = token !== null && demoData === undefined;

  const refetchDemoData = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <DemoContext.Provider
      key={refreshKey}
      value={{
        isDemo,
        demoConfig,
        isLoading,
        refetchDemoData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}

// Re-export useAuth from convex.tsx for convenience
export { useAuth } from "./convex";