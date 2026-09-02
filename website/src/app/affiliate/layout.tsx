"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/convex";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import {
  TrendingUp,
  Users,
  CreditCard,
  Wallet,
  Zap,
  Bell,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Timer,
  Crown,
  Link2,
} from "lucide-react";

const PARTNER_SESSION_MS = 10 * 60 * 1000; // 10 minutes
const PARTNER_FLAG = "zg_partner_session_active";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const logoutMutation = useMutation(api.auth.logout);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Force-logout helper for partner ephemerality (custom redirect reason)
  const partnerLogout = async (reason: "partner_refresh" | "partner_timeout") => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sessionStorage.removeItem(PARTNER_FLAG);
    try {
      if (token) await logoutMutation({ token });
    } catch {
      /* session may already be gone */
    }
    localStorage.removeItem("zetagrow_user_token");
    window.location.href = `/login?reason=${reason}`;
  };

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    } else if (!isLoading && token && !user) {
      localStorage.removeItem("zetagrow_user_token");
      window.location.href = "/login?reason=session_expired";
    }
  }, [isLoading, token, user, router, pathname]);

// Purchase + cooling-period gate: Partner Center requires at least one
  // completed programme AND one hour since that first purchase (server flag).
  const partnerEligible = !!user?.affiliateEligible;
  useEffect(() => {
    if (!isLoading && user && !partnerEligible) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, partnerEligible, router]);

  // ── Partner ephemeral session ────────────────────────────────────────────
  // Runs once per layout mount (mounts when entering /affiliate/* from outside).
  useEffect(() => {
    if (isLoading || !token || !user || !partnerEligible) return;

    // Flag already present => this mount is a PAGE REFRESH inside partner → logout
    if (sessionStorage.getItem(PARTNER_FLAG) === "1") {
      partnerLogout("partner_refresh");
      return;
    }

    // Fresh entry: mark + start the 10-minute countdown
    sessionStorage.setItem(PARTNER_FLAG, "1");
    const expiry = Date.now() + PARTNER_SESSION_MS;
    setSecondsLeft(PARTNER_SESSION_MS / 1000);

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiry - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        partnerLogout("partner_timeout");
      }
    }, 1000);

    // Cleanup on SPA navigation away from /affiliate — clears flag & timer so a
    // later re-entry starts fresh. (On refresh this never runs, which is exactly
    // how we detect the refresh above.)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      sessionStorage.removeItem(PARTNER_FLAG);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, token, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgWarm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin"></div>
          <p className="text-xs text-textMuted font-medium">Loading Partner Center...</p>
        </div>
      </div>
    );
  }

  const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(2, "0") : "--";
  const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, "0") : "--";

  // Growth Partner Program: exclusive section visibility (invite-only)
  const isGrowthPartner = !!(user as any)?.partnerTier;

  const navSections = [
    {
      title: "Partner",
      items: [
        { name: "Overview", href: "/affiliate", icon: TrendingUp },
        { name: "My Partner Links", href: "/affiliate/link", icon: Link2 },
        { name: "My Referrals", href: "/affiliate/referrals", icon: Users },
        { name: "Earnings Ledger", href: "/affiliate/earnings", icon: CreditCard },
        { name: "Earnings Dashboard", href: "/affiliate/wallet", icon: Wallet },
        ...(isGrowthPartner
          ? [{ name: "Team Remuneration", href: "/affiliate/achievements", icon: Zap }]
          : []),
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
];

  const isActive = (path: string) => {
    if (path === "/affiliate" && pathname === "/affiliate") return true;
    if (path !== "/affiliate" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex bg-[#141A17]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0F1412] shrink-0 fixed inset-y-0 z-30 border-r border-neutral-800">
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-800">
          <Link href="/affiliate" className="flex items-center gap-2.5">
            <Image
              src="/zetagrow logo no bg.png"
              alt="ZetaGrow"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-none">
                ZetaGrow
              </span>
              <span className="text-[9px] text-brand-400 font-bold uppercase tracking-wider mt-0.5">
                Partner Program
              </span>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3.5 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            {isGrowthPartner ? (
              <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-800/70 px-1.5 py-0.5 rounded-full">
                <Crown className="w-2.5 h-2.5" /> Growth Partner
              </span>
            ) : (
              <p className="text-[11px] text-neutral-400 truncate">Partner Member</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                {section.title}
              </span>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-brand-600 text-white font-semibold shadow-sm"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${active ? "text-white" : ""}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-neutral-800 space-y-1">
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
<header className="h-16 bg-[#0F1412] border-b border-neutral-800 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:bg-neutral-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-neutral-400 hidden sm:inline">
            Partner Center / <span className="text-white">{user.name}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Ephemeral session countdown */}
          {secondsLeft !== null && secondsLeft > 0 && (
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                secondsLeft <= 60
                  ? "text-red-400 bg-red-950/60 border-red-900 animate-pulse"
                  : "text-amber-400 bg-amber-950/40 border-amber-900"
              }`}
              title="Partner session ends automatically"
            >
              <Timer className="w-3 h-3" />
              Session ends in {mm}:{ss}
            </span>
          )}
          <span className="text-[10px] font-bold text-brand-400 bg-brand-950 border border-brand-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Partner Program
          </span>
        </div>
      </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          ></div>
          <div className="relative w-64 max-w-[80%] bg-[#0F1412] flex flex-col h-full shadow-2xl border-r border-neutral-800">
            <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-800">
              <span className="font-bold text-white text-base">Partner Center</span>
              <button onClick={() => setMobileNavOpen(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    {section.title}
                  </span>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive(item.href)
                          ? "bg-brand-600 text-white font-semibold"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-neutral-800 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
