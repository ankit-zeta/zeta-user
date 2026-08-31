"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useGst, gstSuffix } from "@/lib/gst";
import Image from "next/image";
import {
  Copy,
  Check,
  BookOpen,
  Clock,
  Layers,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  Award,
  Clock as ClockIcon,
  Users,
  ShieldCheck,
  CreditCard,
  ExternalLink as ExternalLinkIcon,
  Link2,
} from "lucide-react";

export default function AffiliateLinkPage() {
  const { user, token } = useAuth();
  const plans = useQuery(api.plans.getPublicPlans);
  const gst = useGst();
  const stats = useQuery(api.affiliates.getUserAffiliateStats, token ? { token } : "skip");

  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);

  const copyLink = async (planSlug: string, planId: string) => {
    const referralCode = user?.referralCode?.toUpperCase() || "";
    const link = `${typeof window !== "undefined" ? window.location.origin : "https://zetagrow.in"}/checkout/${planSlug}?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedPlanId(planId);
      setTimeout(() => setCopiedPlanId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedPlanId(planId);
      setTimeout(() => setCopiedPlanId(null), 2000);
    }
  };

  if (token === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
        <div className="h-32 bg-neutral-800 rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-neutral-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-neutral-100">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Links</h1>
        <p className="text-xs text-neutral-400">
          Generate unique affiliate links for each plan. Share these links — when someone purchases through your link, you earn commission.
        </p>
      </div>

      {/* Referral Code Display */}
      <div className="rounded-2xl border border-brand-800 bg-gradient-to-br from-brand-900/40 to-[#0F1412] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Your Referral Code
            </span>
            <p className="text-xs text-neutral-400">
              All your affiliate links use this code. It's automatically appended to checkout links.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-300 bg-brand-950 border border-brand-800 px-3 py-1 rounded-lg">
            {user?.referralCode}
          </span>
        </div>
        <p className="text-xs text-neutral-500">
          Example link: <code className="text-brand-400 font-mono">zetagrow.in/checkout/plan-slug?ref={user?.referralCode}</code>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Total Earnings"
          value={stats?.totalCommissions ? `₹${stats.totalCommissions.toLocaleString("en-IN")}` : "₹0"}
          sub="Lifetime affiliate commissions"
        />
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Referrals"
          value={String(stats?.totalReferrals ?? 0)}
          sub="People who signed up via your link"
        />
        <StatCard
          icon={<CreditCard className="w-4 h-4" />}
          label="Pending"
          value={stats?.pendingCommissions ? `₹${stats.pendingCommissions.toLocaleString("en-IN")}` : "₹0"}
          sub="In holding period"
        />
        <StatCard
          icon={<Award className="w-4 h-4" />}
          label="Conversions"
          value={String(stats?.totalSalesCount ?? 0)}
          sub="Successful purchases via your links"
        />
      </div>

      {/* Plan Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Plans to Promote</h2>
          <span className="text-xs text-neutral-400">
            {plans?.length ?? 0} plans available
          </span>
        </div>

        {plans === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : plans?.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-12 text-center">
            <p className="text-neutral-500">No plans available to promote.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan: any) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                gst={gst}
                referralCode={user?.referralCode?.toUpperCase() || ""}
                onCopy={copyLink}
                copiedPlanId={copiedPlanId}
              />
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-6 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ExternalLinkIcon className="w-4 h-4 text-brand-400" />
          How Affiliate Links Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-neutral-400">
          <StepCard number={1} title="Copy Link" description="Click 'Copy Link' on any plan card to copy your unique affiliate link." />
          <StepCard number={2} title="Share" description="Share the link on social media, email, WhatsApp, or your website." />
          <StepCard number={3} title="Visitor Clicks" description="When someone clicks, they land on the checkout page with your referral code." />
          <StepCard number={4} title="Earn Commission" description="When they purchase, you earn commission automatically tracked." />
        </div>
        <div className="pt-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 leading-relaxed">
            <strong className="text-neutral-300">Commission:</strong> You earn 50% of the plan price (excl. GST) on each sale, subject to a 7-day holding period. Commissions appear in your wallet after the holding period.
          </p>
        </div>
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-4 animate-pulse">
      <div className="aspect-video w-full bg-neutral-800 rounded-xl"></div>
      <div className="h-6 bg-neutral-800 rounded w-3/4"></div>
      <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
      <div className="h-10 bg-neutral-800 rounded"></div>
      <div className="h-10 bg-neutral-800 rounded"></div>
    </div>
  );
}

function PlanCard({
  plan,
  gst,
  referralCode,
  onCopy,
  copiedPlanId,
}: {
  plan: any;
  gst: any;
  referralCode: string;
  onCopy: (slug: string, planId: string) => void;
  copiedPlanId: string | null;
}) {
  const savings = plan.compareAtPrice ? plan.compareAtPrice - plan.price : 0;
  const savingsPercent = plan.compareAtPrice ? Math.round((savings / plan.compareAtPrice) * 100) : 0;
  const totals = gst?.enabled ? {
    base: plan.price,
    tax: Math.round(plan.price * (gst.rate || 0) / 100),
    total: plan.price + Math.round(plan.price * (gst.rate || 0) / 100),
  } : { base: plan.price, tax: 0, total: plan.price };

  const affiliateLink = `https://zetagrow.in/checkout/${plan.slug}?ref=${referralCode}`;
  const isCopied = copiedPlanId === plan._id;

  const planImageUrl = plan.thumbnail || plan.bannerImage;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0F1412] p-5 space-y-4 hover:border-brand-800/50 transition-colors">
      {/* Plan Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-800">
        {planImageUrl ? (
          <Image
            src={planImageUrl}
            alt={plan.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
            <span className="text-white/90 text-sm font-bold px-4 text-center">{plan.name}</span>
          </div>
        )}
        {savings > 0 && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold text-green-400 bg-green-900/30 border border-green-800 px-2 py-1 rounded-full">
              Save {savingsPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Plan Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-brand-400 bg-brand-950/50 border border-brand-800 px-2.5 py-1 rounded-full">
            {plan.courses?.length || 0} Courses
          </span>
          {plan.tagline && (
            <span className="text-xs text-brand-400 bg-brand-950/30 border border-brand-800 px-2.5 py-1 rounded-full">
              {plan.tagline}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-neutral-100 leading-snug">{plan.name}</h3>
        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{plan.shortDescription}</p>

        {/* Price */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-neutral-100">
              ₹{plan.price.toLocaleString("en-IN")}
            </span>
            {plan.compareAtPrice && (
              <span className="text-base text-neutral-500 line-through">
                ₹{plan.compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {plan.courses?.length || 0} courses
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {plan.courses?.reduce((s: number, c: any) => s + (c.totalMinutes || 0), 0) >= 60
                ? `${Math.floor(plan.courses.reduce((s: number, c: any) => s + (c.totalMinutes || 0), 0) / 60)}h`
                : `${plan.courses?.reduce((s: number, c: any) => s + (c.totalMinutes || 0), 0)} min`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onCopy(plan.slug, plan._id)}
            className={`btn-primary flex-1 justify-center py-2.5 text-xs font-semibold flex items-center gap-1.5 ${isCopied ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Affiliate Link
              </>
            )}
          </button>
          <Link
            href={`/plans/${plan.slug}`}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5" />
            View Plan
          </Link>
        </div>

        {/* Affiliate Link Preview */}
        <div className="bg-black/30 rounded-lg border border-neutral-800 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Your Affiliate Link</p>
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-neutral-800">
            <input
              type="text"
              readOnly
              value={`https://zetagrow.in/checkout/${plan.slug}?ref=${referralCode.toUpperCase()}`}
              className="w-full bg-transparent text-xs text-neutral-300 px-2 font-mono focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-neutral-500">
            When someone purchases via this link, you earn <strong className="text-brand-400">50% commission</strong> (excl. GST), after 7-day holding period.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="space-y-1">
      <div className="w-6 h-6 rounded-full bg-brand-600 text-neutral-100 text-[10px] font-bold flex items-center justify-center">
        {number}
      </div>
      <p className="text-xs font-bold text-neutral-300">{title}</p>
      <p className="text-[10px] text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 space-y-2 border ${
        highlight
          ? "border-brand-700 bg-gradient-to-br from-brand-900/50 to-[#0F1412]"
          : "border-neutral-800 bg-[#0F1412]"
      }`}
    >
      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${highlight ? "text-brand-300" : "text-neutral-400"}`}>
        {icon} {label}
      </span>
      <p className={`text-2xl font-extrabold ${highlight ? "text-white" : "text-neutral-100"}`}>
        {value}
      </p>
      <span className="text-[11px] text-neutral-500 block">{sub}</span>
    </div>
  );
}