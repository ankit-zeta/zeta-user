"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ConvexProvider, ConvexReactClient, useQuery_experimental, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export { api };

const convexUrl = (process.env.NEXT_PUBLIC_CONVEX_URL || "https://terrific-dove-836.convex.cloud").trim();
const convex = new ConvexReactClient(convexUrl, { skipConvexDeploymentUrlCheck: true });

interface AuthContextType {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  login: (token: string, userData?: any) => void;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refetchUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem("zetagrow_user_token");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsInitialized(true);
  }, []);

  const userState = useQuery_experimental({
    query: api.auth.getSessionUser,
    args: token ? { token } : "skip",
  });
  const user = userState.status === "success" ? userState.data : null;
  const logoutMutation = useMutation(api.auth.logout);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("zetagrow_user_token", newToken);
    setToken(newToken);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation({ token });
      } catch {
        // Logout proceeds locally regardless — never surface server details.
      }
    }
    localStorage.removeItem("zetagrow_user_token");
    setToken(null);
    window.location.href = "/login";
  };

  const refetchUser = () => {
    setRefreshKey((k) => k + 1);
  };

  const isLoading = !isInitialized || (token !== null && userState.status === "pending");

  return (
    <AuthContext.Provider
      key={refreshKey}
      value={{
        token,
        user: user || null,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}
