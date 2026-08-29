"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAdminAuth } from "@/lib/convex";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Briefcase, CheckCircle2, Clock, XCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#94a3b8",
  under_review: "#f59e0b",
  shortlisted: "#3b82f6",
  accepted: "#10b981",
  in_progress: "#6366f1",
  revision_required: "#f97316",
  completed: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

export function ApplicationAnalytics() {
  const { token } = useAdminAuth();
  const applications = useQuery(
    api.applications.getAllApplicationsAdmin,
    token ? { token } : "skip"
  );
  const jobs = useQuery(
    api.jobs.getAllJobsAdmin,
    token ? { token } : "skip"
  );

  if (!applications || !jobs) {
    return (
      <div className="card-surface p-6 animate-pulse space-y-4">
        <div className="h-6 bg-neutral-200 rounded w-1/3" />
        <div className="h-48 bg-neutral-100 rounded" />
      </div>
    );
  }

  const totalApps = applications.length;
  const statusCounts: Record<string, number> = {};
  applications.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
    color: STATUS_COLORS[name] || "#94a3b8",
  }));

  // Applications per job (top 10)
  const jobAppCounts: Record<string, number> = {};
  applications.forEach((a) => {
    const title = a.job?.title || "Unknown";
    jobAppCounts[title] = (jobAppCounts[title] || 0) + 1;
  });
  const jobAppsData = Object.entries(jobAppCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + "..." : name, count }));

  // Applications over time (last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    dailyCounts[key] = 0;
  }
  applications.forEach((a) => {
    if (a.submittedAt >= thirtyDaysAgo) {
      const d = new Date(a.submittedAt);
      const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (key in dailyCounts) dailyCounts[key]++;
    }
  });
  const timelineData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  const acceptanceRate = totalApps > 0
    ? Math.round(((statusCounts["completed"] || 0) / totalApps) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-surface p-4 space-y-1">
          <div className="flex items-center gap-2 text-textMuted">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Applications</span>
          </div>
          <p className="text-2xl font-extrabold text-textMain">{totalApps}</p>
        </div>
        <div className="card-surface p-4 space-y-1">
          <div className="flex items-center gap-2 text-textMuted">
            <Briefcase className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Jobs</span>
          </div>
          <p className="text-2xl font-extrabold text-textMain">{jobs.length}</p>
        </div>
        <div className="card-surface p-4 space-y-1">
          <div className="flex items-center gap-2 text-textMuted">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-2xl font-extrabold text-green-600">{statusCounts["completed"] || 0}</p>
        </div>
        <div className="card-surface p-4 space-y-1">
          <div className="flex items-center gap-2 text-textMuted">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Acceptance Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-brand-600">{acceptanceRate}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-sm font-bold text-textMain">Applications (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#176B4D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-sm font-bold text-textMain">Status Distribution</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Jobs by Applications */}
      {jobAppsData.length > 0 && (
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-sm font-bold text-textMain">Top Jobs by Applications</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobAppsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
                <Tooltip />
                <Bar dataKey="count" fill="#176B4D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
