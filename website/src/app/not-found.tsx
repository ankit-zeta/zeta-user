import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Briefcase,
  LifeBuoy,
  ArrowRight,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

const QUICK_LINKS = [
  { name: "Learning Plans", href: "/plans", icon: BookOpen, desc: "Bundles of certified courses" },
  { name: "All Courses", href: "/programs", icon: Compass, desc: "Browse the full catalog" },
  { name: "Work Portal", href: "/work", icon: Briefcase, desc: "Client opportunities" },
  { name: "Support & FAQ", href: "/support/track", icon: LifeBuoy, desc: "Track a ticket or get help" },
];

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bgWarm flex flex-col">
      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(23,107,77,0.25), transparent 70%)" }} />
        <div className="absolute -bottom-32 right-1/4 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center space-y-10 flex-1 justify-center">
        {/* Logo */}
        <Link href="/" aria-label="ZetaGrow home">
          <Image
            src="/zetagrow logo no bg.png"
            alt="ZetaGrow"
            width={48}
            height={48}
            priority
            className="h-12 w-auto mx-auto"
          />
        </Link>

        {/* 404 graphic */}
        <div className="space-y-4">
          <p
            className="text-[96px] sm:text-[140px] leading-none font-extrabold tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, #176B4D 0%, #10B981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            This page took a different path
          </h1>
          <p className="text-sm sm:text-base text-textMuted leading-relaxed max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            Let&apos;s get you back to something useful.
          </p>
        </div>

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/plans" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold">
            Explore Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick links */}
        <div className="w-full pt-6 border-t border-borderSubtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-5">
            Popular destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="card-surface p-4 flex items-center gap-3 text-left hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <link.icon className="w-4 h-4" />
                </div>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-textMain">{link.name}</span>
                  <span className="block text-[11px] text-textMuted truncate">{link.desc}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-textMuted ml-auto shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-brand-600 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-textMuted">
          Think this is a mistake?{" "}
          <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </main>
  );
}
