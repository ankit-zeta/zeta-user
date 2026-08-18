"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/convex";
import { 
  Compass, 
  Briefcase, 
  BookOpen, 
  HelpCircle, 
  LifeBuoy,
  User, 
  Menu, 
  X, 
  ArrowRight,
  LogOut,
  LayoutDashboard
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Programs", href: "/programs", icon: BookOpen },
    { name: "Work Portal", href: "/work", icon: Briefcase },
    { name: "How It Works", href: "/how-it-works", icon: Compass },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Track Ticket", href: "/support/track", icon: LifeBuoy },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-borderSubtle transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                Z
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-brand-900 leading-none">
                  ZetaGrow
                </span>
                <span className="text-[10px] text-textMuted tracking-wider font-medium uppercase mt-0.5">
                  Learn. Work. Grow.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "text-brand-700 bg-brand-50 font-semibold"
                        : "text-textMuted hover:text-textMain hover:bg-neutral-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-borderSubtle hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-textMain max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-borderSubtle py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-borderSubtle">
                      <p className="text-xs text-textMuted">Signed in as</p>
                      <p className="text-sm font-semibold text-textMain truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-textMain hover:bg-neutral-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-600" />
                      User Dashboard
                    </Link>
                    <Link
                      href="/dashboard/learning"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-textMain hover:bg-neutral-50"
                    >
                      <BookOpen className="w-4 h-4 text-brand-600" />
                      My Learning
                    </Link>
                    <Link
                      href="/dashboard/work"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-textMain hover:bg-neutral-50"
                    >
                      <Briefcase className="w-4 h-4 text-brand-600" />
                      Work Opportunities
                    </Link>
                    <div className="border-t border-borderSubtle my-1"></div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-textMain hover:text-brand-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-textMuted hover:text-textMain hover:bg-neutral-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-borderSubtle px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(link.href)
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-textMuted hover:bg-neutral-50 hover:text-textMain"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-borderSubtle pt-3 space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="btn-secondary w-full justify-center text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary justify-center"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary justify-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
