"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { toast } from "sonner";
import {
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CreditCard,
  Coins,
  ShieldCheck,
  Database,
  Zap,
} from "lucide-react";
import { Tooltip } from "@/components/Tooltip";

function fmtINR(n?: number) {
  return `₹${(n || 0).toLocaleString("en-IN")}`;
}

function fmtDate(ts?: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ value, tooltip }: { value: string; tooltip?: string }) {
  const tone = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    approved: "bg-green-100 text-green-800",
    available: "bg-blue-100 text-blue-800",
    pending: "bg-amber-100 text-amber-800",
    qualifying: "bg-blue-100 text-blue-800",
    requested: "bg-amber-100 text-amber-800",
    under_review: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-neutral-200 text-neutral-700",
  };
  const badge = (
    <span
      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
        (tone as any)[value] || "bg-neutral-100 text-neutral-600"
      }`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
  if (tooltip) {
    return <Tooltip content={tooltip}>{badge}</Tooltip>;
  }
  return badge;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="p-3 bg-neutral-50 rounded-lg border border-borderSubtle">
      <span className="text-textMuted block text-[11px]">{label}</span>
      <strong className={`text-sm font-extrabold ${accent || "text-textMain"}`}>
        {value}
      </strong>
    </div>
  );
}

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const users = useQuery(
    api.users.getAllUsers,
    token
      ? {
          token,
          search: search || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        }
      : "skip"
  );

  const [sortKey, setSortKey] = useState<"joined" | "earned" | "enrolled">("joined");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const sortedUsers = React.useMemo(() => {
    const list = [...(users || [])];
    list.sort((a: any, b: any) => {
      let av: number = 0;
      let bv: number = 0;
      if (sortKey === "earned") {
        av = a.totalEarned || 0;
        bv = b.totalEarned || 0;
      } else if (sortKey === "enrolled") {
        av = a.enrolledCount || 0;
        bv = b.enrolledCount || 0;
      } else {
        av = a.createdAt || 0;
        bv = b.createdAt || 0;
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return list;
  }, [users, sortKey, sortDir]);

  const pagedUsers = sortedUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil((sortedUsers?.length || 0) / PAGE_SIZE));

  React.useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, users?.length]);

  const exportCsv = () => {
    const header = "Name,Email,Role,Status,Referral Code,Phone,Enrolled,Total Earned,Available,Joined";
    const rows = (sortedUsers || []).map((u: any) =>
      [
        `"${(u.name || "").replace(/"/g, '""')}"`,
        `"${(u.email || "").replace(/"/g, '""')}"`,
        u.role,
        u.status,
        u.referralCode,
        `"${(u.phone || "").replace(/"/g, '""')}"`,
        u.enrolledCount,
        u.totalEarned,
        u.availableBalance,
        new Date(u.createdAt).toISOString().slice(0, 10),
      ].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zetagrow-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [actionMsg, setActionMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Create User (admin) ──
  const createUserMutation = useMutation(api.users.adminCreateUser);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [cuName, setCuName] = useState("");
  const [cuEmail, setCuEmail] = useState("");
  const [cuPassword, setCuPassword] = useState("");
  const [cuSendEmail, setCuSendEmail] = useState(true);
  const [cuPhone, setCuPhone] = useState("");
  const [cuAccountType, setCuAccountType] = useState<"real" | "demo">("real");
  const [cuDemoWorkBalance, setCuDemoWorkBalance] = useState(50000);
  const [cuDemoPartnerEarnings, setCuDemoPartnerEarnings] = useState(15000);
  const [cuDemoTotalWithdrawn, setCuDemoTotalWithdrawn] = useState(8000);
  const [cuDemoTxnCount, setCuDemoTxnCount] = useState(8);
  const [cuDemoWithdrawalCount, setCuDemoWithdrawalCount] = useState(3);
  const [cuDemoKycStatus, setCuDemoKycStatus] = useState<"verified" | "pending" | "not_submitted" | "rejected">("verified");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsProcessing(true);
    setActionMsg("");
    try {
      const args: any = {
        token,
        name: cuName,
        email: cuEmail,
        password: cuPassword,
        phone: cuPhone || undefined,
        sendWelcomeEmail: cuSendEmail,
        accountType: cuAccountType,
      };
      if (cuAccountType === "demo") {
        args.demoConfig = {
          workBalance: cuDemoWorkBalance,
          partnerEarnings: cuDemoPartnerEarnings,
          totalWithdrawn: cuDemoTotalWithdrawn,
          transactionCount: cuDemoTxnCount,
          withdrawalCount: cuDemoWithdrawalCount,
          kycStatus: cuDemoKycStatus,
        };
      }
      await createUserMutation(args);
      toast.success(`Demo account created for ${cuEmail}`, { description: cuAccountType === "demo" ? "Demo account with fake balances ready" : "Share the password privately." });
      setCreateUserOpen(false);
      setCuName(""); setCuEmail(""); setCuPassword(""); setCuPhone(""); setCuSendEmail(true);
      setCuAccountType("real");
      setCuDemoWorkBalance(50000); setCuDemoPartnerEarnings(15000); setCuDemoTotalWithdrawn(8000);
      setCuDemoTxnCount(8); setCuDemoWithdrawalCount(3); setCuDemoKycStatus("verified");
    } catch (err: any) {
      const msg = err?.name === "ConvexError" && typeof err.data === "string" ? err.data : err.message;
      toast.error("Failed to create user", { description: msg || "Please try again" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Users & Account Management
        </h1>
        <p className="text-xs text-textMuted">
          Search registered accounts, inspect full user history (programs, affiliate, earnings,
          activity), adjust status, and audit actions.
        </p>
      </div>

      {actionMsg && (
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800">
          {actionMsg}
        </div>
      )}

      {/* Filter toolbar */}
      <div className="card-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white text-textMuted"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="super_admin">Super Admin</option>
            <option value="content_admin">Content Admin</option>
            <option value="finance_admin">Finance Admin</option>
            <option value="work_admin">Work Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white text-textMuted"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs bg-white text-textMuted"
          >
            <option value="joined">Sort: Joined</option>
            <option value="earned">Sort: Total Earned</option>
            <option value="enrolled"><Tooltip content="Sort by number of programs enrolled"><span>Sort: Enrolled</span></Tooltip></option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
            className="btn-secondary text-[11px] py-1.5 px-2.5"
          >
            {sortDir === "desc" ? "Desc ↓" : "Asc ↑"}
          </button>
          <button
            onClick={exportCsv}
            className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setCreateUserOpen(true)}
            className="btn-primary text-[11px] py-1.5 px-2.5 flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create User
          </button>
          <span className="text-xs text-textMuted">
            {sortedUsers.length} accounts · page {page}/{totalPages}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-surface overflow-hidden">
        {users === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-textMuted">
            No users match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderSubtle bg-neutral-50 text-textMuted">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Referral Code</th>
                  <th className="py-3 px-4 font-semibold"><Tooltip content="Number of programs the user is enrolled in"><span>Enrolled</span></Tooltip></th>
                  <th className="py-3 px-4 font-semibold">Total Earned</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold">Wallet</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {pagedUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-textMain block">{u.name}</span>
                        <span className="text-[11px] text-textMuted">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-semibold uppercase">
                        {u.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {u.referralCode}
                    </td>
                    <td className="py-3 px-4 text-textMain font-medium">
                      {u.enrolledCount} Programs
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-700">
                      {fmtINR(u.totalEarned)}
                    </td>
                    <td className="py-3 px-4 text-textMuted text-[11px]">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-bold text-textMain">
                      {fmtINR(u.availableBalance)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge value={u.status} tooltip={u.status === "qualifying" ? "User is meeting criteria for a position upgrade" : undefined} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => router.push(`/users/${u._id}`)}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination footer */}
      {users && users.length > PAGE_SIZE && (
        <div className="flex items-center justify-between card-surface p-3">
          <span className="text-xs text-textMuted">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, sortedUsers.length)} of {sortedUsers.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-[11px] py-1.5 px-2.5 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-[11px] py-1.5 px-2.5 disabled:opacity-40 flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

{/* Create User Modal */}
      {createUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card-surface w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-textMain flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" /> Create User Account
              </h3>
              <button onClick={() => setCreateUserOpen(false)} className="text-textMuted hover:text-textMain">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              {/* Basic Info */}
              <div className="space-y-3 pt-2 border-t border-borderSubtle">
                <h4 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5 text-brand-600" /> Basic Information
                </h4>
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Full Name *</span>
                  <input required minLength={2} value={cuName} onChange={(e) => setCuName(e.target.value)} placeholder="e.g. Priya Sharma" className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white" />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Email *</span>
                  <input required type="email" value={cuEmail} onChange={(e) => setCuEmail(e.target.value)} placeholder="person@example.com" className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white" />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Phone</span>
                  <input value={cuPhone} onChange={(e) => setCuPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white" />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Password * (min 8 chars)</span>
                  <input required minLength={8} value={cuPassword} onChange={(e) => setCuPassword(e.target.value)} placeholder="Set a temporary password" className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white font-mono" />
                </label>
              </div>

              {/* Account Type */}
              <div className="space-y-3 pt-2 border-t border-borderSubtle">
                <h4 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-brand-600" /> Account Type
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${cuAccountType === "real" ? "border-brand-500 bg-brand-50" : "border-borderSubtle hover:border-brand-300"}`}>
                    <input type="radio" name="accountType" value="real" checked={cuAccountType === "real"} onChange={() => setCuAccountType("real")} className="sr-only" />
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs font-bold text-textMain">Real Account</p>
                        <p className="text-[10px] text-textMuted">Normal user account with real transactions</p>
                      </div>
                    </div>
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${cuAccountType === "real" ? "border-brand-500 bg-brand-500" : "border-borderSubtle"}`}>
                      {cuAccountType === "real" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </label>
                  <label className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${cuAccountType === "demo" ? "border-amber-500 bg-amber-50" : "border-borderSubtle hover:border-amber-300"}`}>
                    <input type="radio" name="accountType" value="demo" checked={cuAccountType === "demo"} onChange={() => setCuAccountType("demo")} className="sr-only" />
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-xs font-bold text-textMain">Demo Account</p>
                        <p className="text-[10px] text-textMuted">Fake balances for showcase (no real money)</p>
                      </div>
                    </div>
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${cuAccountType === "demo" ? "border-amber-500 bg-amber-500" : "border-borderSubtle"}`}>
                      {cuAccountType === "demo" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </label>
                </div>
              </div>

              {/* Demo Config (only shown when demo selected) */}
              {cuAccountType === "demo" && (
                <div className="space-y-3 pt-2 border-t border-borderSubtle bg-amber-50/30 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-amber-600" /> Demo Account Configuration
                  </h4>
                  <p className="text-[10px] text-amber-800 mb-2">
                    Configure the fake balances and transaction history for this demo account. These numbers are shown to the demo user but don't affect real earnings.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Work Balance (₹)</span>
                      <input type="number" min={0} step={1000} value={cuDemoWorkBalance} onChange={(e) => setCuDemoWorkBalance(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white font-mono" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Partner Earnings (₹)</span>
                      <input type="number" min={0} step={1000} value={cuDemoPartnerEarnings} onChange={(e) => setCuDemoPartnerEarnings(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white font-mono" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Total Withdrawn (₹)</span>
                      <input type="number" min={0} step={1000} value={cuDemoTotalWithdrawn} onChange={(e) => setCuDemoTotalWithdrawn(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white font-mono" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Fake Transactions</span>
                      <input type="number" min={0} max={50} value={cuDemoTxnCount} onChange={(e) => setCuDemoTxnCount(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white font-mono" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Fake Withdrawals</span>
                      <input type="number" min={0} max={20} value={cuDemoWithdrawalCount} onChange={(e) => setCuDemoWithdrawalCount(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white font-mono" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">KYC Status</span>
                      <select value={cuDemoKycStatus} onChange={(e) => setCuDemoKycStatus(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white">
                        <option value="verified">Verified (Shows KYC done)</option>
                        <option value="pending">Pending Review</option>
                        <option value="not_submitted">Not Submitted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="pt-2 border-t border-borderSubtle">
                <label className="flex items-center gap-2 text-xs text-textMain cursor-pointer">
                  <input type="checkbox" checked={cuSendEmail} onChange={(e) => setCuSendEmail(e.target.checked)} className="rounded border-borderSubtle text-brand-600" />
                  Send them a welcome email (password is never emailed — share it privately)
                </label>
                <p className="text-[10px] text-textMuted">
                  Account is created active & verified, with wallet and referral code ready. Action is audit-logged.
                  {cuAccountType === "demo" && " Demo accounts have fake balances and transaction history."}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setCreateUserOpen(false)} className="btn-secondary text-xs py-2 px-3">Cancel</button>
                <button type="submit" disabled={isProcessing} className="btn-primary text-xs py-2 px-4 disabled:opacity-60">
                  {isProcessing ? "Creating…" : cuAccountType === "demo" ? "Create Demo Account" : "Create Real Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}