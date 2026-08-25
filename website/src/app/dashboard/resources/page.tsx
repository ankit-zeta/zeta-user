"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import {
  Lock,
  Download,
  X,
  ExternalLink,
  Eye,
  FileText,
  FileSpreadsheet,
  FileType,
  FileArchive,
  LayoutTemplate,
  Video,
  Link2,
  FolderDown,
  Folder,
  FolderOpen,
  Search,
  Layers,
  CheckCircle2,
  LockKeyhole,
  ArrowRight,
  DownloadCloud,
} from "lucide-react";

const FILE_STYLES: Record<
  string,
  { icon: React.ReactNode; badge: string; bg: string }
> = {
  pdf: {
    icon: <FileText className="w-5 h-5" />,
    badge: "bg-red-50 text-red-600 border-red-200",
    bg: "bg-red-50",
  },
  doc: {
    icon: <FileType className="w-5 h-5" />,
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    bg: "bg-blue-50",
  },
  xls: {
    icon: <FileSpreadsheet className="w-5 h-5" />,
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    bg: "bg-emerald-50",
  },
  zip: {
    icon: <FileArchive className="w-5 h-5" />,
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    bg: "bg-amber-50",
  },
  template: {
    icon: <LayoutTemplate className="w-5 h-5" />,
    badge: "bg-violet-50 text-violet-600 border-violet-200",
    bg: "bg-violet-50",
  },
  video: {
    icon: <Video className="w-5 h-5" />,
    badge: "bg-pink-50 text-pink-600 border-pink-200",
    bg: "bg-pink-50",
  },
  link: {
    icon: <Link2 className="w-5 h-5" />,
    badge: "bg-neutral-100 text-neutral-600 border-neutral-200",
    bg: "bg-neutral-100",
  },
};

const TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "pdf", label: "PDF" },
  { value: "template", label: "Templates" },
  { value: "xls", label: "Spreadsheets" },
  { value: "doc", label: "Documents" },
  { value: "zip", label: "Zips" },
  { value: "video", label: "Videos" },
  { value: "link", label: "Links" },
];

function fileStyle(fileType: string) {
  const base = FILE_STYLES[fileType] ?? FILE_STYLES.link;
  return {
    ...base,
    badge: `border ${base.badge}`,
    bg: base.bg,
  };
}

function formatSize(size: string | undefined) {
  if (!size) return "";
  return size;
}

export default function ResourcesPage() {
  const { token, user } = useAuth();
  const resources = useQuery(
    api.resources.getResourcesForUser,
    token ? { token } : "skip"
  ) as Array<{
    _id: string;
    title: string;
    description: string;
    fileType: string;
    fileSize: string;
    fileUrl: string | null;
    accessType: string;
    hasAccess: boolean;
    lockReason: string;
    programId: string | undefined;
    programName: string | undefined;
    programSlug: string | undefined;
    downloadCount: number;
  }> | undefined;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showLocked, setShowLocked] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    if (!resources) return null;

    const visible = resources.filter((r) => {
      if (typeFilter !== "all" && r.fileType !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !r.title.toLowerCase().includes(q) &&
          !(r.description || "").toLowerCase().includes(q) &&
          !(r.programName || "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    const folders = new Map<string, any[]>();
    for (const r of visible) {
      const key = r.programId ? r.programId.toString() : "general";
      if (!folders.has(key)) folders.set(key, []);
      folders.get(key)!.push(r);
    }

    const programKey = (r: any) => r.programId?.toString() ?? "general";
    const programOrder = (key: string) => {
      if (key === "general") return 1;
      const prog = resources.find((r) => programKey(r) === key);
      return prog ? (prog.hasAccess ? 0 : 2) : 2;
    };

    const sortedKeys = Array.from(folders.keys()).sort((a, b) => {
      if (programOrder(a) !== programOrder(b)) return programOrder(a) - programOrder(b);
      const nameA = folders.get(a)![0]?.programName || "General Library";
      const nameB = folders.get(b)![0]?.programName || "General Library";
      return nameA.localeCompare(nameB);
    });

    return sortedKeys.map((key) => {
      const items = folders.get(key)!;
      const first = items[0];
      const unlocked = items.filter((i) => i.hasAccess).length;
      return {
        key,
        name: first.programName || "General Library",
        slug: first.programSlug,
        resources: items,
        total: items.length,
        unlocked,
        locked: items.length - unlocked,
        isGeneral: key === "general",
      };
    });
  }, [resources, search, typeFilter]);

  const stats = useMemo(() => {
    if (!resources) return null;
    const total = resources.length;
    const unlocked = resources.filter((r) => r.hasAccess).length;
    return { total, unlocked, locked: total - unlocked };
  }, [resources]);

  const hasEnrollments = (user?.enrolledProgramIds?.length || 0) > 0;
  const noUnlockedResources =
    stats !== null && stats.total > 0 && stats.unlocked === 0;

  const toggleFolder = (key: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    if (!grouped) return;
    setExpandedFolders(new Set(grouped.map((g) => g.key)));
  };

  const collapseAll = () => setExpandedFolders(new Set());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Resource Library & Toolkits
        </h1>
        <p className="text-xs text-textMuted">
          Resources are organized by program. Open a folder to view, preview, and download the assets you have access to.
        </p>
      </div>

      {/* Stats row — hidden when nothing is unlocked (empty state below takes over) */}
      {stats && !noUnlockedResources && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card-surface p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-textMain">{stats.total}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-textMuted">
                Total Resources
              </p>
            </div>
          </div>
          <div className="card-surface p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-textMain">{stats.unlocked}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-textMuted">
                Available to You
              </p>
            </div>
          </div>
          <div className="card-surface p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-textMain">{stats.locked}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-textMuted">
                Locked / Needs Enrollment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {!noUnlockedResources && (
        <div className="card-surface p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources by name, description, or program..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle bg-white text-xs"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-borderSubtle bg-white text-xs font-medium"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs font-medium text-textMuted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(e) => setShowLocked(e.target.checked)}
            className="accent-brand-600"
          />
          Show locked
        </label>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-2 rounded-lg border border-borderSubtle bg-white text-xs font-semibold text-textMain hover:bg-neutral-50"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 rounded-lg border border-borderSubtle bg-white text-xs font-semibold text-textMain hover:bg-neutral-50"
          >
            Collapse
          </button>
        </div>
        </div>
      )}

      {/* Program folders */}
      {noUnlockedResources ? (
        <div className="card-surface p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <LockKeyhole className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-textMain">
              {hasEnrollments ? "No resources available yet" : "No resources unlocked yet"}
            </h2>
            <p className="text-xs text-textMuted max-w-md mx-auto leading-relaxed">
              {hasEnrollments
                ? "Your enrolled programs don't have downloadable resources published yet. Check back soon — new toolkits are added regularly."
                : "Resource libraries and toolkits are included with every program. Enroll in a program and your downloads will appear here."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link href="/programs" className="btn-primary text-xs py-2 inline-flex items-center gap-1.5">
              Explore Programs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/dashboard/programs" className="btn-secondary text-xs py-2">
              My Programs
            </Link>
          </div>
        </div>
      ) : grouped === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card-surface p-6 animate-pulse space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-2/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="card-surface p-12 text-center text-sm text-textMuted">
          No resources match your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((folder) => {
            const visibleItems = showLocked
              ? folder.resources
              : folder.resources.filter((r) => r.hasAccess);
            if (visibleItems.length === 0) return null;

            const isOpen = expandedFolders.has(folder.key) || !folder.isGeneral;
            const pct = folder.total > 0 ? Math.round((folder.unlocked / folder.total) * 100) : 0;

            return (
              <div
                key={folder.key}
                className={`card-surface overflow-hidden ${
                  folder.isGeneral ? "" : folder.locked > 0 && folder.unlocked === 0 ? "border-amber-200" : ""
                }`}
              >
                {/* Folder header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 border-b border-borderSubtle bg-warm cursor-pointer hover:bg-brand-50/40 transition-colors"
                  onClick={() => toggleFolder(folder.key)}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      folder.isGeneral
                        ? "bg-neutral-200 text-neutral-600"
                        : folder.unlocked > 0
                          ? "bg-brand-600 text-white"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-textMain truncate">{folder.name}</h3>
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase shrink-0">
                        {folder.unlocked}/{folder.total} unlocked
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 max-w-xs h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${folder.unlocked > 0 ? "bg-brand-600" : "bg-amber-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-textMuted shrink-0">{pct}% available</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!folder.isGeneral && folder.slug && (
                      <Link
                        href={`/programs/${folder.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline"
                      >
                        View Program <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    {folder.locked > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> {folder.locked} locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Folder body */}
                {isOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                    {visibleItems.map((r) => {
                      const style = fileStyle(r.fileType);
                      return (
                        <div
                          key={r._id}
                          className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                            !r.hasAccess
                              ? "bg-neutral-50/70 border-dashed"
                              : "bg-white border-borderSubtle hover:border-brand-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center text-brand-700 shrink-0`}>
                                  {style.icon}
                                </span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${style.badge}`}>
                                  {r.fileType}
                                </span>
                              </div>
                              {!r.hasAccess && (
                                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-textMain leading-snug">{r.title}</h4>
                            <p className="text-[11px] text-textMuted leading-relaxed line-clamp-2">
                              {r.description}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] text-textMuted">
                              <span className="inline-flex items-center gap-1">
                                <DownloadCloud className="w-3 h-3" />
                                {formatSize(r.fileSize)}
                              </span>
                              {typeof r.downloadCount === "number" && r.downloadCount > 0 && (
                                <span>· {r.downloadCount} downloads</span>
                              )}
                            </div>

                            {!r.hasAccess && r.lockReason && (
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 font-medium leading-snug">
                                {r.lockReason}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 mt-3 border-t border-borderSubtle flex gap-2">
                            {r.hasAccess && r.fileUrl ? (
                              <>
                                {r.fileType === "pdf" ? (
                                  <button
                                    onClick={() => {
                                      setPreviewUrl(r.fileUrl);
                                      setPreviewTitle(r.title);
                                    }}
                                    className="btn-primary flex-1 justify-center text-[11px] py-1.5 flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </button>
                                ) : (
                                  <a
                                    href={r.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-primary flex-1 justify-center text-[11px] py-1.5 flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Open</span>
                                  </a>
                                )}
                                <a
                                  href={r.fileUrl}
                                  download={r.title.replace(/[^a-z0-9]+/gi, "_")}
                                  className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center justify-center"
                                  title="Download"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </>
                            ) : (
                              <Link
                                href="/dashboard/programs"
                                className="btn-secondary flex-1 justify-center text-[11px] py-1.5 text-textMuted hover:text-textMain"
                              >
                                Enroll to Unlock
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* In-app PDF Viewer */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-borderSubtle bg-warm">
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderDown className="w-4 h-4 text-brand-600 shrink-0" />
                <h3 className="text-sm font-bold text-textMain truncate">{previewTitle}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewUrl}
                  download={previewTitle.replace(/[^a-z0-9]+/gi, "_")}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-2 rounded-lg border border-borderSubtle hover:bg-neutral-50 text-textMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-neutral-100">
              <iframe
                src={`${previewUrl}#toolbar=1&navpanes=0`}
                title={previewTitle}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}