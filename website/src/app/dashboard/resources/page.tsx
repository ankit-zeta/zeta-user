"use client";

import React, { useState } from "react";
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

function fileStyle(fileType: string) {
  const base = FILE_STYLES[fileType] ?? FILE_STYLES.link;
  return {
    ...base,
    badge: `border ${base.badge}`,
    bg: base.bg,
  };
}

export default function ResourcesPage() {
  const { token } = useAuth();
  const resources = useQuery(
    api.resources.getResourcesForUser,
    token ? { token } : "skip"
  );

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-textMain">
          Resource Library & Toolkits
        </h1>
        <p className="text-xs text-textMuted">
          Curated templates, content libraries, checklists, and commercial asset kits. Access is determined by your enrolled curriculums.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources === undefined ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface p-6 animate-pulse space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-2/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
            </div>
          ))
        ) : resources.length === 0 ? (
          <div className="col-span-3 card-surface p-12 text-center text-sm text-textMuted">
            No resources available at this time.
          </div>
        ) : (
          resources.map((r) => {
            const style = fileStyle(r.fileType);
            return (
              <div
                key={r._id}
                className={`card-surface p-6 flex flex-col justify-between transition-all ${
                  !r.hasAccess ? "bg-neutral-50/70 border-dashed" : "bg-white"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center text-brand-700`}>
                        {style.icon}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${style.badge}`}>
                        {r.fileType} • {r.fileSize}
                      </span>
                    </div>
                    {!r.hasAccess && (
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-textMain">{r.title}</h3>
                  <p className="text-xs text-textMuted leading-relaxed">{r.description}</p>

                  {r.programName && (
                    <p className="text-[11px] text-textMuted">
                      Associated Program: <strong className="text-textMain">{r.programName}</strong>
                    </p>
                  )}

                  {!r.hasAccess && r.lockReason && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium">
                      {r.lockReason}
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-borderSubtle flex gap-2">
                  {r.hasAccess && r.fileUrl ? (
                    <>
                      {r.fileType === "pdf" ? (
                        <button
                          onClick={() => {
                            setPreviewUrl(r.fileUrl);
                            setPreviewTitle(r.title);
                          }}
                          className="btn-primary flex-1 justify-center text-xs py-2 flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </button>
                      ) : (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary flex-1 justify-center text-xs py-2 flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Document</span>
                        </a>
                      )}
                      <a
                        href={r.fileUrl}
                        download={r.title.replace(/[^a-z0-9]+/gi, "_")}
                        className="btn-secondary text-xs py-2 px-3 flex items-center justify-center"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </>
                  ) : (
                    <Link
                      href="/dashboard/programs"
                      className="btn-secondary flex-1 justify-center text-xs py-2 text-textMuted hover:text-textMain"
                    >
                      Enroll to Unlock
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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