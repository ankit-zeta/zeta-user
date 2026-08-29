"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Bell, CheckCheck, BookOpen, Briefcase, Award, TrendingUp, ShieldCheck } from "lucide-react";

class NotificationPageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-textMain">Notifications Center</h1>
            <p className="text-xs text-textMuted">Notifications are temporarily unavailable. Please try again later.</p>
          </div>
          <div className="card-surface text-center py-12 space-y-3">
            <Bell className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-textMain">Service Temporarily Unavailable</h3>
            <p className="text-xs text-textMuted">We couldn't load your notifications right now.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotificationsContent() {
  const { token } = useAuth();
  const notifsData = useQuery(
    api.notifications.getUserNotifications,
    token ? { token } : "skip"
  ) as {
    notifications: Array<{
      _id: string;
      _creationTime: number;
      userId: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      actionUrl: string | undefined;
      createdAt: number;
    }>;
    unreadCount: number;
  } | undefined;

  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
  const markSingleRead = useMutation(api.notifications.markNotificationRead);

  const handleMarkAll = async () => {
    if (token) {
      try {
        await markAllRead({ token });
      } catch {
        // Silently ignore — list re-syncs from the server
      }
    }
  };

  const handleMarkOne = async (id: string) => {
    if (token) {
      try {
        await markSingleRead({ token, notificationId: id });
      } catch {
        // Silently ignore — list re-syncs from the server
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="w-4 h-4 text-brand-600" />;
      case "application":
      case "job":
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case "certificate":
        return <Award className="w-4 h-4 text-amber-600" />;
      case "affiliate":
      case "commission":
      case "withdrawal":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-textMain">
            Notifications Center
          </h1>
          <p className="text-xs text-textMuted">
            Updates regarding your course completions, application status changes, commissions, and payouts.
          </p>
        </div>

        {notifsData?.unreadCount && notifsData.unreadCount > 0 ? (
          <button
            onClick={handleMarkAll}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            <span>Mark all as read</span>
          </button>
        ) : null}
      </div>

      <div className="card-surface divide-y divide-borderSubtle">
        {notifsData === undefined ? (
          <div className="p-8 text-center animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : notifsData.notifications.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Bell className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-textMain">All Caught Up</h3>
            <p className="text-xs text-textMuted">You have no new notifications.</p>
          </div>
        ) : (
          notifsData.notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkOne(n._id)}
              className={`p-4 flex items-start gap-3 transition-colors ${
                !n.read ? "bg-brand-50/30" : "bg-white"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${!n.read ? "text-brand-900" : "text-textMain"}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-textMuted shrink-0">
                    {new Date(n.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-textMuted leading-relaxed">{n.message}</p>
                {n.actionUrl && (
                  <Link
                    href={n.actionUrl}
                    className="text-[11px] font-semibold text-brand-700 hover:underline inline-block pt-1"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <NotificationPageErrorBoundary>
      <NotificationsContent />
    </NotificationPageErrorBoundary>
  );
}
