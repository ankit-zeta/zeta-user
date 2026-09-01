"use client";

import React, { useState, useRef, useCallback } from "react";
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
  Copy,
  Calendar,
  Clock,
  Filter,
  Search,
  ChevronDown,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type Banner = {
  _id: string;
  title: string;
  subtitle: string | undefined;
  imageUrl: string;
  linkUrl: string | undefined;
  targetPage: string;
  isActive: boolean;
  sortOrder: number;
  ctaText: string | undefined;
  ctaColor: string | undefined;
  startDate: number | undefined;
  endDate: number | undefined;
  openInNewTab: boolean | undefined;
  createdAt: number;
  updatedAt: number;
};

export default function AdminBannersPage() {
  const { token } = useAdminAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [targetPage, setTargetPage] = useState("both");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [ctaText, setCtaText] = useState("");
  const [ctaColor, setCtaColor] = useState("#16a34a");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterTarget, setFilterTarget] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const banners = useQuery(
    api.banners.getAllBanners,
    token ? { token } : "skip"
  ) as Banner[] | undefined;

  const createBanner = useMutation(api.banners.createBanner);
  const updateBanner = useMutation(api.banners.updateBanner);
  const deleteBanner = useMutation(api.banners.deleteBanner);
  const reorderBanners = useMutation(api.banners.reorderBanners);
  const duplicateBanner = useMutation(api.banners.duplicateBanner);
  const bulkToggleActive = useMutation(api.banners.bulkToggleActive);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setLinkUrl("");
    setTargetPage("both");
    setIsActive(true);
    setSortOrder(0);
    setCtaText("");
    setCtaColor("#16a34a");
    setStartDate("");
    setEndDate("");
    setOpenInNewTab(true);
    setEditingBanner(null);
    setShowForm(false);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || "");
    setTargetPage(b.targetPage);
    setIsActive(b.isActive);
    setSortOrder(b.sortOrder);
    setCtaText(b.ctaText || "");
    setCtaColor(b.ctaColor || "#16a34a");
    setStartDate(b.startDate ? new Date(b.startDate).toISOString().slice(0, 16) : "");
    setEndDate(b.endDate ? new Date(b.endDate).toISOString().slice(0, 16) : "");
    setOpenInNewTab(b.openInNewTab ?? true);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!token || !title.trim() || !imageUrl.trim()) return;
    setSaving(true);
    try {
      const data = {
        token,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim() || undefined,
        targetPage,
        isActive,
        sortOrder,
        ctaText: ctaText.trim() || undefined,
        ctaColor: ctaColor || undefined,
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        openInNewTab,
      };

      if (editingBanner) {
        await updateBanner({ ...data, bannerId: editingBanner._id as any });
        toast.success("Banner updated");
      } else {
        await createBanner(data);
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

  const handleDuplicate = async (b: Banner) => {
    if (!token) return;
    try {
      await duplicateBanner({ token, bannerId: b._id as any });
      toast.success("Banner duplicated");
    } catch (e: any) {
      toast.error(e.message || "Failed to duplicate banner");
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!token || !banners || !draggedId || draggedId === targetId) return;

    const fromIdx = banners.findIndex((b) => b._id === draggedId);
    const toIdx = banners.findIndex((b) => b._id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newOrder = [...banners];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);

    try {
      await reorderBanners({
        token,
        orderedIds: newOrder.map((b) => b._id as any),
      });
      toast.success("Banner order updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to reorder banners");
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const toggleSelectAll = () => {
    if (!filteredBanners) return;
    if (selectedIds.size === filteredBanners.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBanners.map((b) => b._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkToggle = async (isActive: boolean) => {
    if (!token || selectedIds.size === 0) return;
    try {
      await bulkToggleActive({
        token,
        bannerIds: Array.from(selectedIds) as any[],
        isActive,
      });
      toast.success(`${selectedIds.size} banners ${isActive ? "activated" : "deactivated"}`);
      setSelectedIds(new Set());
    } catch (e: any) {
      toast.error(e.message || "Failed to update banners");
    }
  };

  const filteredBanners = banners?.filter((b) => {
    if (filterTarget !== "all" && b.targetPage !== filterTarget) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedBanners = filteredBanners?.sort((a, b) => a.sortOrder - b.sortOrder);

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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <p className="text-2xl font-bold text-textMain">{banners.length}</p>
          <p className="text-xs text-textMuted">Total Banners</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-2xl font-bold text-green-600">
            {banners.filter((b) => b.isActive).length}
          </p>
          <p className="text-xs text-textMuted">Active</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-2xl font-bold text-neutral-500">
            {banners.filter((b) => !b.isActive).length}
          </p>
          <p className="text-xs text-textMuted">Inactive</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-2xl font-bold text-brand-600">
            {banners.filter((b) => b.startDate || b.endDate).length}
          </p>
          <p className="text-xs text-textMuted">Scheduled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search banners..."
            className="input-field pl-9 w-full"
          />
        </div>
        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Pages</option>
          <option value="affiliate">Affiliate Dashboard</option>
          <option value="work">Work Dashboard</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="card-surface p-3 flex items-center gap-3 bg-brand-50 border-brand-200">
          <span className="text-xs font-semibold text-brand-700">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => handleBulkToggle(true)}
            className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> Activate
          </button>
          <button
            onClick={() => handleBulkToggle(false)}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-700 flex items-center gap-1"
          >
            <EyeOff className="w-3 h-3" /> Deactivate
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-textMuted hover:text-textMain"
          >
            Clear
          </button>
        </div>
      )}

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
              <label className="text-xs font-semibold text-textMain">Banner Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Holiday Sale Banner"
                className="input-field"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Limited time offer"
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

            {/* Image URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-textMain">Image URL *</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg or Convex storage URL"
                className="input-field"
              />
              <p className="text-[10px] text-textMuted">
                Recommended size: 1200 x 400px. Use a hosted image URL or Convex storage link.
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

            {/* CTA Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Button Text (optional)</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Learn More"
                className="input-field"
              />
            </div>

            {/* CTA Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Button Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={ctaColor}
                  onChange={(e) => setCtaColor(e.target.value)}
                  className="w-10 h-10 rounded border border-borderSubtle cursor-pointer"
                />
                <input
                  type="text"
                  value={ctaColor}
                  onChange={(e) => setCtaColor(e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Start Date (optional)</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">End Date (optional)</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Open in New Tab */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMain">Link Target</label>
              <button
                type="button"
                onClick={() => setOpenInNewTab(!openInNewTab)}
                className={`input-field flex items-center gap-2 ${
                  openInNewTab ? "text-brand-700 bg-brand-50" : "text-neutral-500"
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                {openInNewTab ? "Open in new tab" : "Open in same tab"}
              </button>
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
              <div className="rounded-lg overflow-hidden border border-borderSubtle bg-neutral-50 relative">
                <img
                  src={imageUrl}
                  alt={title || "Banner preview"}
                  className="w-full h-[200px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {(title || subtitle || ctaText) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                )}
                {(title || subtitle || ctaText) && (
                  <div className="absolute inset-0 flex flex-col justify-center px-8">
                    {title && (
                      <h3 className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-xs sm:text-sm text-white/90 mt-1 sm:mt-2 max-w-md drop-shadow-md">
                        {subtitle}
                      </p>
                    )}
                    {ctaText && (
                      <div
                        className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-lg w-fit"
                        style={{ backgroundColor: ctaColor || "#16a34a" }}
                      >
                        {ctaText}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                )}
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
        <div className="p-4 border-b border-borderSubtle bg-neutral-50/70 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted">
            All Banners ({sortedBanners?.length || 0})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-xs text-textMuted hover:text-textMain flex items-center gap-1"
            >
              {selectedIds.size === (filteredBanners?.length || 0) ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 border border-textMuted rounded" />
              )}
              Select all
            </button>
          </div>
        </div>

        {sortedBanners?.length === 0 ? (
          <div className="p-12 text-center text-sm text-textMuted space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-neutral-300" />
            <p>No banners yet. Create one to show images on dashboards.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderSubtle">
            {sortedBanners?.map((b) => (
              <div
                key={b._id}
                draggable
                onDragStart={(e) => handleDragStart(e, b._id)}
                onDragOver={(e) => handleDragOver(e, b._id)}
                onDrop={(e) => handleDrop(e, b._id)}
                onDragEnd={handleDragEnd}
                className={`p-4 flex items-center gap-4 transition-colors ${
                  draggedId === b._id ? "opacity-50" : ""
                } ${dragOverId === b._id ? "bg-brand-50 border-t-2 border-brand-500" : ""} ${
                  selectedIds.has(b._id) ? "bg-brand-50/50" : "hover:bg-neutral-50/50"
                }`}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-textMuted hover:text-textMain">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(b._id)}
                  className={`shrink-0 ${
                    selectedIds.has(b._id) ? "text-brand-600" : "text-neutral-300"
                  }`}
                >
                  {selectedIds.has(b._id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border border-neutral-300 rounded" />
                  )}
                </button>

                {/* Thumbnail */}
                <div className="w-40 h-16 rounded-lg overflow-hidden border border-borderSubtle bg-neutral-100 shrink-0">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='16'><rect fill='%23f3f4f6' width='40' height='16'/></svg>";
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
                    {b.ctaText && (
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        CTA: {b.ctaText}
                      </span>
                    )}
                    {(b.startDate || b.endDate) && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        Scheduled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    Sort: {b.sortOrder} | Created: {new Date(b.createdAt).toLocaleDateString()}
                    {b.linkUrl && " | Has link"}
                    {b.startDate && ` | Starts: ${new Date(b.startDate).toLocaleDateString()}`}
                    {b.endDate && ` | Ends: ${new Date(b.endDate).toLocaleDateString()}`}
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
                    onClick={() => handleDuplicate(b)}
                    className="p-2 rounded-lg text-xs text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
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
