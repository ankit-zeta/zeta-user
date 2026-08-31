"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import {
  ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Upload,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

type Banner = {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | undefined;
  targetPage: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export default function AdminBannersPage() {
  const { token } = useAdminAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [targetPage, setTargetPage] = useState("both");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const banners = useQuery(
    api.banners.getAllBanners,
    token ? { token } : "skip"
  ) as Banner[] | undefined;

  const createBanner = useMutation(api.banners.createBanner);
  const updateBanner = useMutation(api.banners.updateBanner);
  const deleteBanner = useMutation(api.banners.deleteBanner);

  const resetForm = () => {
    setTitle("");
    setImageUrl("");
    setLinkUrl("");
    setTargetPage("both");
    setIsActive(true);
    setSortOrder(0);
    setEditingBanner(null);
    setShowForm(false);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || "");
    setTargetPage(b.targetPage);
    setIsActive(b.isActive);
    setSortOrder(b.sortOrder);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!token || !title.trim() || !imageUrl.trim()) return;
    setSaving(true);
    try {
      if (editingBanner) {
        await updateBanner({
          token,
          bannerId: editingBanner._id as any,
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          linkUrl: linkUrl.trim() || undefined,
          targetPage,
          isActive,
          sortOrder,
        });
        toast.success("Banner updated");
      } else {
        await createBanner({
          token,
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          linkUrl: linkUrl.trim() || undefined,
          targetPage,
          isActive,
          sortOrder,
        });
        toast.success("Banner created");
      }
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!token) return;
    if (!confirm(`Delete banner "${b.title}"? This cannot be undone.`)) return;
    try {
      await deleteBanner({ token, bannerId: b._id as any });
      toast.success("Banner deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete banner");
    }
  };

  const handleToggleActive = async (b: Banner) => {
    if (!token) return;
    try {
      await updateBanner({
        token,
        bannerId: b._id as any,
        isActive: !b.isActive,
      });
      toast.success(b.isActive ? "Banner deactivated" : "Banner activated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update banner");
    }
  };

  if (banners === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
        <div className="h-64 bg-neutral-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-brand-600" />
            Dashboard Banners
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Manage banner images shown on affiliate and work portal dashboards.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Banner
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="card-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-textMain">
              {editingBanner ? "Edit Banner" : "Create New Banner"}
            </h2>
            <button onClick={resetForm} className="p-1 text-textMuted hover:text-textMain">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Banner Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Holiday Sale Banner"
                className="input-field"
              />
            </div>

            {/* Target Page */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Display On</label>
              <select
                value={targetPage}
                onChange={(e) => setTargetPage(e.target.value)}
                className="input-field"
              >
                <option value="both">Both (Affiliate + Work)</option>
                <option value="affiliate">Affiliate Dashboard Only</option>
                <option value="work">Work Dashboard Only</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-textMain">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg or Convex storage URL"
                className="input-field"
              />
              <p className="text-[10px] text-textMuted">
                Recommended size: 1200 x 200px. Use a hosted image URL or Convex storage link.
              </p>
            </div>

            {/* Link URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-textMain">Click-through URL (optional)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="input-field"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="input-field"
              />
            </div>

            {/* Active Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Status</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`input-field flex items-center gap-2 ${
                  isActive ? "text-green-700 bg-green-50" : "text-neutral-500"
                }`}
              >
                {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {isActive ? "Active (visible to users)" : "Inactive (hidden)"}
              </button>
            </div>
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Preview</label>
              <div className="rounded-lg overflow-hidden border border-borderSubtle bg-neutral-50">
                <img
                  src={imageUrl}
                  alt={title || "Banner preview"}
                  className="w-full h-[200px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !imageUrl.trim()}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {editingBanner ? "Update Banner" : "Create Banner"}
            </button>
            <button onClick={resetForm} className="btn-secondary text-xs py-2 px-5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Banner List */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 border-b border-borderSubtle bg-neutral-50/70">
          <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted">
            All Banners ({banners.length})
          </h3>
        </div>

        {banners.length === 0 ? (
          <div className="p-12 text-center text-sm text-textMuted space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-neutral-300" />
            <p>No banners yet. Create one to show images on dashboards.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderSubtle">
            {banners.map((b) => (
              <div key={b._id} className="p-4 flex items-center gap-4 hover:bg-neutral-50/50 transition-colors">
                {/* Thumbnail */}
                <div className="w-40 h-16 rounded-lg overflow-hidden border border-borderSubtle bg-neutral-100 shrink-0">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='16'><rect fill='%23f3f4f6' width='40' height='16'/></svg>";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-textMain truncate">{b.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded capitalize">
                      {b.targetPage === "both" ? "Affiliate + Work" : b.targetPage}
                    </span>
                  </div>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    Sort: {b.sortOrder} | Created: {new Date(b.createdAt).toLocaleDateString()}
                    {b.linkUrl && " | Has link"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleActive(b)}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      b.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-neutral-400 hover:bg-neutral-100"
                    }`}
                    title={b.isActive ? "Deactivate" : "Activate"}
                  >
                    {b.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(b)}
                    className="p-2 rounded-lg text-xs text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Edit"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    className="p-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
