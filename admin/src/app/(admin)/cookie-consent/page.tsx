"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Tooltip } from "@/components/Tooltip";
import {
  Cookie,
  Search,
  Shield,
  BarChart3,
  Megaphone,
  User,
  Clock,
  Check,
  X,
  Filter,
  Download,
} from "lucide-react";

export default function CookieConsentPage() {
  const { token } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "analytics" | "marketing">("all");

  const consentRecords = useQuery(
    api.cookieConsent.getAllConsentAdmin,
    token ? {} : "skip"
  ) as Array<{
    _id: string;
    fingerprint: string;
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    consentedAt: number;
    updatedAt: number;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    userName: string;
    userEmail: string | null;
  }> | undefined;

  if (!token) {
    return (
      <div className="p-8 text-center animate-pulse space-y-3">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
      </div>
    );
  }

  const records = consentRecords ?? [];
  const filtered = records.filter((r) => {
    const matchesSearch =
      !search ||
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      r.fingerprint.toLowerCase().includes(search.toLowerCase());
    if (filter === "analytics") return matchesSearch && r.analytics;
    if (filter === "marketing") return matchesSearch && r.marketing;
    return matchesSearch;
  });

  const totalRecords = records.length;
  const analyticsCount = records.filter((r) => r.analytics).length;
  const marketingCount = records.filter((r) => r.marketing).length;
  const linkedToUser = records.filter((r) => r.userId).length;

  const exportCsv = () => {
    const header = "Name,Email,Fingerprint,Analytics,Marketing,Consented,Updated,IP\n";
    const rows = filtered
      .map(
        (r) =>
          `"${r.userName}","${r.userEmail ?? ""}","${r.fingerprint}",${r.analytics},${r.marketing},"${new Date(r.consentedAt).toISOString()}","${new Date(r.updatedAt).toISOString()}","${r.ipAddress ?? ""}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cookie-consent-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Cookie Consent Records
          </h1>
          <p className="text-xs text-textMuted">
            View and manage user cookie consent preferences across the platform.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-borderSubtle rounded-xl text-xs font-semibold text-textMain hover:bg-neutral-50"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-borderSubtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cookie className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-semibold text-textMuted uppercase">Total</span>
          </div>
          <p className="text-2xl font-bold text-textMain">{totalRecords}</p>
        </div>
        <div className="bg-white border border-borderSubtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <Tooltip content="Users who opted in to analytics tracking">
              <span className="text-[11px] font-semibold text-textMuted uppercase cursor-help">Analytics On</span>
            </Tooltip>
          </div>
          <p className="text-2xl font-bold text-textMain">{analyticsCount}</p>
        </div>
        <div className="bg-white border border-borderSubtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-4 h-4 text-purple-600" />
            <Tooltip content="Users who opted in to marketing cookies">
              <span className="text-[11px] font-semibold text-textMuted uppercase cursor-help">Marketing On</span>
            </Tooltip>
          </div>
          <p className="text-2xl font-bold text-textMain">{marketingCount}</p>
        </div>
        <div className="bg-white border border-borderSubtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-green-600" />
            <Tooltip content="Consent records linked to a registered user account">
              <span className="text-[11px] font-semibold text-textMuted uppercase cursor-help">Linked Users</span>
            </Tooltip>
          </div>
          <p className="text-2xl font-bold text-textMain">{linkedToUser}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name, email, or fingerprint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-borderSubtle bg-white text-xs"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "analytics", "marketing"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-borderSubtle text-textMuted hover:bg-neutral-50"
              }`}
            >
              {f === "all" ? "All" : f === "analytics" ? "Analytics On" : "Marketing On"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-borderSubtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-borderSubtle bg-neutral-50">
                <th className="text-left px-4 py-3 font-semibold text-textMuted">User</th>
                <th className="text-left px-4 py-3 font-semibold text-textMuted">Fingerprint</th>
                <th className="text-center px-4 py-3 font-semibold text-textMuted">
                  <Tooltip content="Required for site functionality — always enabled">
                    <span className="cursor-help">Essential</span>
                  </Tooltip>
                </th>
                <th className="text-center px-4 py-3 font-semibold text-textMuted">
                  <Tooltip content="Google Analytics / GTM tracking">
                    <span className="cursor-help">Analytics</span>
                  </Tooltip>
                </th>
                <th className="text-center px-4 py-3 font-semibold text-textMuted">
                  <Tooltip content="Ad campaigns and remarketing">
                    <span className="cursor-help">Marketing</span>
                  </Tooltip>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-textMuted">Consented</th>
                <th className="text-left px-4 py-3 font-semibold text-textMuted">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-textMuted">
                    No consent records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="border-b border-borderSubtle last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-textMain">{r.userName}</p>
                        {r.userEmail && (
                          <p className="text-[11px] text-textMuted">{r.userEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-textMuted">
                        {r.fingerprint.slice(0, 16)}...
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50">
                        <Check className="w-3 h-3 text-green-600" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.analytics ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50">
                          <Check className="w-3 h-3 text-green-600" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50">
                          <X className="w-3 h-3 text-red-500" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.marketing ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50">
                          <Check className="w-3 h-3 text-green-600" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50">
                          <X className="w-3 h-3 text-red-500" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-textMuted">
                      {new Date(r.consentedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-textMuted font-mono text-[11px]">
                      {r.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
