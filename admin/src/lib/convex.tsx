"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export { api };

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://terrific-dove-836.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

interface AdminAuthContextType {
  token: string | null;
  adminUser: any | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  token: null,
  adminUser: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("zetagrow_admin_token");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsInitialized(true);
  }, []);

  const adminUser = useQuery(api.auth.getSessionUser, token ? { token } : "skip");
  const logoutMutation = useMutation(api.auth.logout);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("zetagrow_admin_token", newToken);
    setToken(newToken);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation({ token });
      } catch (err) {
        console.error("Admin logout error", err);
      }
    }
    localStorage.removeItem("zetagrow_admin_token");
    setToken(null);
    window.location.href = "/login";
  };

  const isAdminRole = adminUser && ["super_admin", "admin", "content_admin", "finance_admin", "work_admin"].includes(adminUser.role);
  const isLoading = !isInitialized || (token !== null && adminUser === undefined);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        adminUser: isAdminRole ? adminUser : null,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </ConvexProvider>
  );
}
