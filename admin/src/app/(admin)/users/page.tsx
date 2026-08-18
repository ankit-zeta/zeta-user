"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  BookOpen, 
  Wallet, 
  MoreVertical,
  Plus
} from "lucide-react";

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
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

  const programs = useQuery(api.programs.getPublicPrograms);

  const updateUserStatusMutation = useMutation(api.users.updateUserStatus);
  const grantProgramMutation = useMutation(api.users.grantProgramAccess);

  const [selectedUserId, setSelectedUserId] = useState<any | null>(null);
  const userDetails = useQuery(
    api.users.getUserDetails,
    token && selectedUserId ? { token, userId: selectedUserId } : "skip"
  );

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantProgId, setGrantProgId] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusToggle = async () => {
    if (!token || !selectedUserId || !userDetails?.user) return;
    setIsProcessing(true);
    setActionMsg("");
    const newStatus = userDetails.user.status === "active" ? "suspended" : "active";

    try {
      await updateUserStatusMutation({
        token,
        userId: selectedUserId,
        status: newStatus,
        reason: suspendReason || `Admin manual toggle to ${newStatus}`,
      });
      setActionMsg(`User status updated to ${newStatus}.`);
      setSuspendModalOpen(false);
      setSuspendReason("");
    } catch (err: any) {
      setActionMsg(err.message || "Failed to update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGrantProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUserId || !grantProgId) return;

    setIsProcessing(true);
    setActionMsg("");

    try {
      await grantProgramMutation({
        token,
        userId: selectedUserId,
        programId: grantProgId as any,
        reason: grantReason || "Admin manual curriculum grant",
      });
      setActionMsg("Program access granted successfully.");
      setGrantModalOpen(false);
      setGrantReason("");
    } catch (err: any) {
      setActionMsg(err.message || "Failed to grant program.");
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
          Search registered accounts, inspect enrolled programs, adjust status, and audit actions.
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

        <span className="text-xs text-textMuted shrink-0">
          Showing {users?.length || 0} accounts
        </span>
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
                  <th className="py-3 px-4 font-semibold">Enrolled</th>
                  <th className="py-3 px-4 font-semibold">Total Earned</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {users.map((u) => (
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
                      ₹{u.totalEarned.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        u.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedUserId(u._id)}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Drawer / Modal */}
      {selectedUserId && userDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-borderSubtle pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-textMain">{userDetails.user.name}</h3>
                  <p className="text-xs text-textMuted">{userDetails.user.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="p-1 rounded-lg text-textMuted hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Overview Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-lg border border-borderSubtle">
                  <span className="text-textMuted block">Wallet Balance</span>
                  <strong className="text-sm font-extrabold text-brand-700">
                    ₹{(userDetails.wallet?.availableBalance || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-borderSubtle">
                  <span className="text-textMuted block">Direct Referrals</span>
                  <strong className="text-sm font-extrabold text-textMain">
                    {userDetails.referralsCount} Users
                  </strong>
                </div>
              </div>

              {/* Enrolled Programs */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-textMain">Enrolled Programs</h4>
                  <button
                    onClick={() => setGrantModalOpen(true)}
                    className="text-brand-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Grant Program</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {userDetails.enrolledPrograms.length === 0 ? (
                    <p className="text-textMuted py-2">No active program purchases.</p>
                  ) : (
                    userDetails.enrolledPrograms.map((ep, idx) => (
                      <div key={idx} className="p-2.5 bg-brand-50/50 rounded-lg border border-brand-200 flex items-center justify-between">
                        <span className="font-medium text-textMain">{ep.program?.name || "Program"}</span>
                        <span className="text-[10px] text-textMuted">₹{ep.purchase.amount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Administrative Actions */}
              <div className="space-y-3 pt-4 border-t border-borderSubtle">
                <h4 className="font-bold text-xs text-textMain">Administrative Operations</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSuspendModalOpen(true)}
                    className={`btn-secondary text-xs py-2 px-3 ${
                      userDetails.user.status === "active" ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {userDetails.user.status === "active" ? "Suspend Account" : "Activate Account"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-borderSubtle">
              <button
                onClick={() => setSelectedUserId(null)}
                className="btn-secondary w-full justify-center text-xs py-2"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Program Grant Modal */}
      {grantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-surface p-6 max-w-md w-full space-y-4 bg-white shadow-2xl">
            <h3 className="text-base font-bold text-textMain">Grant Program Access</h3>
            <form onSubmit={handleGrantProgram} className="space-y-3">
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-textMain">Select Program *</label>
                <select
                  required
                  value={grantProgId}
                  onChange={(e) => setGrantProgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle bg-white"
                >
                  <option value="">Select a curriculum tier...</option>
                  {programs?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-semibold text-textMain">Reason for Manual Grant *</label>
                <input
                  type="text"
                  required
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. Scholarship / Support resolution"
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGrantModalOpen(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  {isProcessing ? "Granting..." : "Confirm Grant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-surface p-6 max-w-md w-full space-y-4 bg-white shadow-2xl">
            <h3 className="text-base font-bold text-textMain">
              {userDetails?.user.status === "active" ? "Suspend Account" : "Activate Account"}
            </h3>
            <p className="text-xs text-textMuted">
              Please enter an administrative reason for audit logging.
            </p>
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-textMain">Audit Reason *</label>
              <input
                type="text"
                required
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Violation of policy or verified resolution"
                className="w-full px-3 py-2 rounded-lg border border-borderSubtle"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusToggle}
                disabled={isProcessing || !suspendReason}
                className="btn-primary text-xs py-1.5 px-3 bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
