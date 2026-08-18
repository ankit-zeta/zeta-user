import React from "react";
import Link from "next/link";
import { Shield, BookOpen, Briefcase, Award, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C221F] text-neutral-300 border-t border-neutral-800 text-sm mt-auto relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-600 to-transparent" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                Z
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                ZetaGrow
              </span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              ZetaGrow is an integrated digital skill development and vetted
              work platform. We prepare ambitious individuals with actionable
              skills, verifiable credentials, and direct client project access.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="font-medium">Learn. Work. Grow.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Shield className="w-4 h-4 text-brand-400" />
              <span>Compliant & Transparent Operations</span>
            </div>
          </div>

          {/* Programs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Programs
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/programs/starter-digital-skills" className="hover:text-white transition-colors">
                  Starter Program (₹2,000)
                </Link>
              </li>
              <li>
                <Link href="/programs/growth-professional" className="hover:text-white transition-colors">
                  Growth Program (₹4,000)
                </Link>
              </li>
              <li>
                <Link href="/programs/advanced-pro-specialist" className="hover:text-white transition-colors">
                  Advanced Pro (₹8,000)
                </Link>
              </li>
              <li>
                <Link href="/programs/premium-master-program" className="hover:text-white transition-colors">
                  Master Program (₹14,000)
                </Link>
              </li>
            </ul>
          </div>

          {/* Work & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/work" className="hover:text-white transition-colors">
                  Work Opportunities
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About ZetaGrow
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/direct-selling-policy" className="hover:text-white transition-colors">
                  Direct Selling & Affiliate Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} ZetaGrow Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Learn. Work. Grow.</span>
            <span>support@zetagrow.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
