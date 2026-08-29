"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";

class NotificationQueryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function NotificationBadgeInner({ token }: { token: string | null }) {
  const notifsData = useQuery(
    api.notifications.getUserNotifications,
    token ? { token } : "skip"
  );

  return (
    <Link
      href="/dashboard/notifications"
      className="relative p-2 rounded-lg text-textMuted hover:bg-neutral-100 transition-colors"
    >
      <Bell className="w-4 h-4" />
      {notifsData?.unreadCount && notifsData.unreadCount > 0 ? (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600"></span>
      ) : null}
    </Link>
  );
}

const BellFallback = (
  <Link
    href="/dashboard/notifications"
    className="relative p-2 rounded-lg text-textMuted hover:bg-neutral-100 transition-colors"
  >
    <Bell className="w-4 h-4" />
  </Link>
);

export function NotificationBadge({ token }: { token: string | null }) {
  return (
    <NotificationQueryErrorBoundary fallback={BellFallback}>
      <NotificationBadgeInner token={token} />
    </NotificationQueryErrorBoundary>
  );
}

function NavNotificationItemInner({ token }: { token: string | null }) {
  const notifsData = useQuery(
    api.notifications.getUserNotifications,
    token ? { token } : "skip"
  );

  return (
    <span>
      Notifications
      {notifsData?.unreadCount && notifsData.unreadCount > 0 ? (
        <span className="ml-2 w-4 h-4 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
          {notifsData.unreadCount}
        </span>
      ) : null}
    </span>
  );
}

const NavNotificationsFallback = <span>Notifications</span>;

export function NavNotificationItem({ token }: { token: string | null }) {
  return (
    <NotificationQueryErrorBoundary fallback={NavNotificationsFallback}>
      <NavNotificationItemInner token={token} />
    </NotificationQueryErrorBoundary>
  );
}
