"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  FolderDown, 
  Briefcase, 
  FileCheck, 
  TrendingUp, 
  Users, 
  Wallet, 
  Zap, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  CheckCircle2
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const notifsData = useQuery(
    api.notifications.getUserNotifications,
    token ? { token } : "skip"
  );

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    }
  }, [isLoading, token, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgWarm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin"></div>
          <p className="text-xs text-textMuted font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const navSections = [
    {
      title: "Main",
      items: [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Learning",
      items: [
        { name: "My Programs", href: "/dashboard/programs", icon: BookOpen },
        { name: "Resources", href: "/dashboard/resources", icon: FolderDown },
        { name: "Certificates", href: "/dashboard/certificates", icon: Award },
      ],
    },
    {
      title: "Work Portal",
      items: [
        { name: "Opportunities", href: "/dashboard/work", icon: Briefcase },
        { name: "My Applications", href: "/dashboard/applications", icon: FileCheck },
      ],
    },
    {
      title: "Affiliate & Wallet",
      items: [
        { name: "Affiliate Center", href: "/dashboard/affiliate", icon: TrendingUp },
        { name: "Referrals", href: "/dashboard/referrals", icon: Users },
        { name: "Earnings & Sales", href: "/dashboard/earnings", icon: CreditCard },
        { name: "Wallet & Payouts", href: "/dashboard/withdrawals", icon: Wallet },
      ],
    },
    {
      title: "Growth & Account",
      items: [
        { name: "Achievements", href: "/dashboard/achievements", icon: Zap },
        { 
          name: "Notifications", 
          href: "/dashboard/notifications", 
          icon: Bell,
          badge: notifsData?.unreadCount && notifsData.unreadCount > 0 ? notifsData.unreadCount : null
        },
        { name: "Profile", href: "/dashboard/profile", icon: User },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex bg-bgWarm">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-borderSubtle shrink-0 fixed inset-y-0 z-30">
        {/* Sidebar Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-borderSubtle">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              Z
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-900">
              ZetaGrow
            </span>
          </Link>
        </div>

        {/* User Card in Sidebar */}
        <div className="px-4 py-3.5 border-b border-borderSubtle bg-neutral-50/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-textMain truncate">{user.name}</p>
            <p className="text-[11px] text-textMuted truncate">
              {user.position?.name || "Member"}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-textMuted/70 block mb-1.5">
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
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-textMuted hover:bg-neutral-50 hover:text-textMain"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${active ? "text-brand-600" : "text-neutral-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge ? (
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Logout at bottom */}
        <div className="p-3 border-t border-borderSubtle">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-borderSubtle sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-textMuted hover:bg-neutral-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-textMuted hidden sm:inline">
              Workspace / <span className="text-textMain">{user.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Quick Balance */}
            <Link
              href="/dashboard/withdrawals"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-borderSubtle bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs font-medium text-textMain"
            >
              <Wallet className="w-3.5 h-3.5 text-brand-600" />
              <span>Available: <strong>₹{(user.wallet?.availableBalance || 0).toLocaleString("en-IN")}</strong></span>
            </Link>

            {/* Notifications icon */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-lg text-textMuted hover:bg-neutral-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {notifsData?.unreadCount && notifsData.unreadCount > 0 ? (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600"></span>
              ) : null}
            </Link>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          ></div>
          <div className="relative w-64 max-w-[80%] bg-white flex flex-col h-full shadow-2xl">
            <div className="h-16 px-6 flex items-center justify-between border-b border-borderSubtle">
              <span className="font-bold text-brand-900 text-lg">ZetaGrow</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded text-textMuted hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-textMuted/70 block mb-1">
                    {section.title}
                  </span>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive(item.href)
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-textMuted hover:bg-neutral-50 hover:text-textMain"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-borderSubtle">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600"
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
