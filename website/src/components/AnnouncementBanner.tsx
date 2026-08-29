"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Info, AlertTriangle, AlertCircle } from "lucide-react";

export function AnnouncementBanner() {
  const announcements = useQuery(api.notifications.getActiveAnnouncements);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load dismissed announcements from sessionStorage
    try {
      const stored = sessionStorage.getItem("dismissed_announcements");
      if (stored) {
        setDismissed(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  if (!announcements || announcements.length === 0 || !mounted) return null;

  const visible = announcements.filter((a) => !dismissed.has(a._id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try {
      sessionStorage.setItem("dismissed_announcements", JSON.stringify(Array.from(next)));
    } catch {}
  };

  const priorityConfig: Record<string, { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
    urgent: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-500",
    },
    high: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
    },
    normal: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-500",
    },
  };

  return (
    <div className="space-y-2">
      {visible.map((a) => {
        const config = priorityConfig[a.priority] || priorityConfig.normal;
        const Icon = config.icon;
        return (
          <div
            key={a._id}
            className={`${config.bg} ${config.border} border rounded-xl p-3 sm:p-4 flex items-start gap-3 animate-slide-down`}
          >
            <Icon className={`w-4 h-4 ${config.iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-textMain">{a.title}</p>
              <p className="text-[11px] text-textMuted mt-0.5 leading-relaxed">{a.content}</p>
            </div>
            <button
              onClick={() => dismiss(a._id)}
              className="p-1 rounded-lg text-textMuted hover:bg-white/50 hover:text-textMain transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
