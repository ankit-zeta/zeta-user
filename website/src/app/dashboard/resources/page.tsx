"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import {
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
  Folder,
  FolderOpen,
  Search,
  Layers,
  ArrowRight,
  DownloadCloud,
  Loader2,
  Lock,
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
  html: {
    icon: <FileText className="w-5 h-5" />,
    badge: "bg-teal-50 text-teal-600 border-teal-200",
    bg: "bg-teal-50",
  },
};

const TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "pdf", label: "PDF" },
  { value: "html", label: "HTML" },
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
    content: string | null;
    accessType: string;
    hasAccess: boolean;
    lockReason: string;
    programId: string | undefined;
    programName: string | undefined;
    programSlug: string | undefined;
    downloadCount: number;
  }> | undefined;

  const recordDownload = useMutation(api.resources.recordDownload);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewResourceId, setPreviewResourceId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (resourceId: string, fileUrl: string, title: string, fileType: string) => {
    setDownloadingId(resourceId);
    try {
      // Fetch the file from the signed URL
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = title.replace(/[^a-z0-9]+/gi, "_") + getFileExtension(fileType);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record the download (fire and forget)
      try {
        await recordDownload({ resourceId });
      } catch {
        // Non-critical
      }
    } catch {
      // Fallback: open in new tab
      window.open(fileUrl, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  function getFileExtension(fileType: string): string {
    const extensions: Record<string, string> = {
      pdf: ".pdf",
      doc: ".docx",
      xls: ".xlsx",
      zip: ".zip",
      template: ".html",
      video: ".mp4",
      link: "",
    };
    return extensions[fileType] || "";
  }

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

    const sortedKeys = Array.from(folders.keys()).sort((a, b) => {
      if (a === "general") return 1;
      if (b === "general") return -1;
      const nameA = folders.get(a)![0]?.programName || "General Library";
      const nameB = folders.get(b)![0]?.programName || "General Library";
      return nameA.localeCompare(nameB);
    });

    return sortedKeys.map((key) => {
      const items = folders.get(key)!;
      const first = items[0];
      return {
        key,
        name: first.programName || "General Library",
        slug: first.programSlug,
        resources: items,
        total: items.length,
        isGeneral: key === "general",
      };
    });
  }, [resources, search, typeFilter]);

  const stats = useMemo(() => {
    if (!resources) return null;
    return { total: resources.length };
  }, [resources]);

  const isEmpty = stats !== null && stats.total === 0;

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
          Resources for your enrolled programs. Open a folder to view, preview, and download assets.
        </p>
      </div>

      {/* Stats row */}
      {stats && !isEmpty && (
        <div className="grid grid-cols-2 gap-4 max-w-md">
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
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-textMain">{grouped?.length || 0}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-textMuted">
                Program Folders
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {!isEmpty && (
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
      {isEmpty ? (
        <div className="card-surface p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Folder className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-textMain">
              No resources available yet
            </h2>
            <p className="text-xs text-textMuted max-w-md mx-auto leading-relaxed">
              Enroll in a program to access its resource library and toolkits.
              New resources are added regularly.
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
            const isOpen = expandedFolders.has(folder.key);

            return (
              <div
                key={folder.key}
                className="card-surface overflow-hidden"
              >
                {/* Folder header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 border-b border-borderSubtle bg-warm cursor-pointer hover:bg-brand-50/40 transition-colors"
                  onClick={() => toggleFolder(folder.key)}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                    {isOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-textMain truncate">{folder.name}</h3>
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase shrink-0">
                        {folder.total} resources
                      </span>
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
                  </div>
                </div>

                {/* Folder body */}
                {isOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                    {folder.resources.map((r) => {
                      const style = fileStyle(r.fileType);
                      const isDownloading = downloadingId === r._id;

                      return (
                        <div
                          key={r._id}
                          className="rounded-xl border p-4 flex flex-col justify-between transition-all bg-white border-borderSubtle hover:border-brand-300 hover:shadow-sm"
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
                                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
                                <span>{r.downloadCount} downloads</span>
                              )}
                            </div>

                            {!r.hasAccess && r.lockReason && (
                              <p className="text-[10px] text-amber-600 font-medium">{r.lockReason}</p>
                            )}
                          </div>

                          <div className="pt-3 mt-3 border-t border-borderSubtle flex gap-2">
                            {r.hasAccess && (r.fileUrl || r.content) ? (
                              <>
                                {r.fileType === "pdf" && r.fileUrl ? (
                                  <button
                                    onClick={() => {
                                      setPreviewUrl(r.fileUrl);
                                      setPreviewTitle(r.title);
                                      setPreviewResourceId(r._id);
                                      setPreviewError(false);
                                    }}
                                    className="btn-primary flex-1 justify-center text-[11px] py-1.5 flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </button>
                                ) : r.fileType === "html" && r.content ? (
                                  <button
                                    onClick={() => {
                                      const blob = new Blob([r.content!], { type: "text/html" });
                                      const url = URL.createObjectURL(blob);
                                      window.open(url, "_blank");
                                    }}
                                    className="btn-primary flex-1 justify-center text-[11px] py-1.5 flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </button>
                                ) : r.fileType === "link" && r.fileUrl ? (
                                  <a
                                    href={r.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-primary flex-1 justify-center text-[11px] py-1.5 flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Open Link</span>
                                  </a>
                                ) : r.fileUrl ? (
                                  <button
                                    onClick={() => handleDownload(r._id, r.fileUrl!, r.title, r.fileType)}
                                    disabled={isDownloading}
                                    className="btn-primary flex-1 justify-center text-[11px] py-1.5 flex items-center gap-1"
                                  >
                                    {isDownloading ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Download className="w-3 h-3" />
                                    )}
                                    <span>{isDownloading ? "Downloading..." : "Download"}</span>
                                  </button>
                                ) : null}
                                {r.fileType === "pdf" && r.fileUrl && (
                                  <button
                                    onClick={() => handleDownload(r._id, r.fileUrl!, r.title, r.fileType)}
                                    disabled={isDownloading}
                                    className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center justify-center"
                                    title="Download"
                                  >
                                    {isDownloading ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Download className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </>
                            ) : !r.hasAccess ? (
                              <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            ) : (
                              <span className="text-[11px] text-textMuted">File not available</span>
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
          onClick={() => {
            setPreviewUrl(null);
            setPreviewResourceId(null);
            setPreviewError(false);
          }}
        >
          <div
            className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-borderSubtle bg-warm">
              <div className="flex items-center gap-2.5 min-w-0">
                <Folder className="w-4 h-4 text-brand-600 shrink-0" />
                <h3 className="text-sm font-bold text-textMain truncate">{previewTitle}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {previewResourceId && (
                  <button
                    onClick={() => {
                      if (previewUrl) {
                        handleDownload(previewResourceId, previewUrl, previewTitle, "pdf");
                      }
                    }}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setPreviewResourceId(null);
                    setPreviewError(false);
                  }}
                  className="p-2 rounded-lg border border-borderSubtle hover:bg-neutral-50 text-textMuted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-neutral-100 flex items-center justify-center">
              {previewError ? (
                <div className="text-center space-y-3 p-8">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto" />
                  <p className="text-sm font-semibold text-textMain">Unable to preview this file</p>
                  <p className="text-xs text-textMuted">The file may be unavailable. Try downloading it instead.</p>
                  {previewResourceId && (
                    <button
                      onClick={() => {
                        if (previewUrl) {
                          handleDownload(previewResourceId, previewUrl, previewTitle, "pdf");
                        }
                      }}
                      className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>
                  )}
                </div>
              ) : (
                <iframe
                  src={`${previewUrl}#toolbar=1&navpanes=0`}
                  title={previewTitle}
                  className="w-full h-full border-0"
                  onError={() => setPreviewError(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
