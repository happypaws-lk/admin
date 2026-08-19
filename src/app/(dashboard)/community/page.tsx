"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import type { CommunityPostResponse, CommunityPostDetailResponse, PagedResult } from "@/lib/types";
import { CONTENT_TYPE_LABELS } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  AlertTriangle,
  Truck,
  Heart,
  BookOpen,
  Tag,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  Check,
  X,
  Phone,
  Trash2,
} from "lucide-react";
import { LocationDetailCard } from "./_components/LocationDetailCard";

const PAGE_SIZE = 20;

export default function CommunityPage() {
  const [data, setData] = useState<PagedResult<CommunityPostResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approve / Reject / Delete actions
  const [approveTarget, setApproveTarget] = useState<{ id: string; contentType: string; title: string; authorName: string } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; contentType: string; title: string; authorName: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; contentType: string; title: string; authorName: string } | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<CommunityPostDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | boolean> = {
        Page: page,
        PageSize: PAGE_SIZE,
      };
      if (typeFilter) {
        params.type = typeFilter;
      }
      if (showPendingOnly) {
        params.onlyPending = true;
      }

      const result = await apiClient.get<PagedResult<CommunityPostResponse>>(
        "/api/v1/admin/community/posts",
        params
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load community posts.");
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, showPendingOnly]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openDetail = async (contentType: string, id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailPost(null);
    try {
      const result = await apiClient.get<CommunityPostDetailResponse>(
        `/api/v1/admin/community/${contentType}/${id}`
      );
      setDetailPost(result);
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionPending(true);
    try {
      await apiClient.post(
        `/api/v1/admin/community/${approveTarget.contentType}/${approveTarget.id}/approve`
      );
      setApproveTarget(null);
      setDetailOpen(false);
      fetchPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve post.");
    } finally {
      setActionPending(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionPending(true);
    try {
      await apiClient.post(
        `/api/v1/admin/community/${rejectTarget.contentType}/${rejectTarget.id}/reject`
      );
      setRejectTarget(null);
      setDetailOpen(false);
      fetchPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject post.");
    } finally {
      setActionPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    const targetId = deleteTarget.id;
    const previousData = data;

    // Optimistically remove the post from the UI immediately
    if (data) {
      setData({
        ...data,
        items: data.items.filter((item) => item.id !== targetId),
        totalCount: Math.max(0, data.totalCount - 1),
      });
    }

    try {
      await apiClient.delete(
        `/api/v1/admin/community/${deleteTarget.contentType}/${deleteTarget.id}`
      );
      setDeleteTarget(null);
      setDetailOpen(false);
      fetchPosts();
    } catch (e) {
      // Revert optimistic update if deletion fails
      setData(previousData);
      setError(e instanceof Error ? e.message : "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<CommunityPostResponse>[] = [
    {
      key: "title",
      header: "Post",
      render: (row) => {
        const isPending = row.status === "Pending";
        return (
          <div className="flex items-center gap-3">
            {row.photoUrl ? (
              <img
                src={row.photoUrl}
                alt=""
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] ring-1 ring-white/10 flex items-center justify-center shrink-0">
                <ContentTypeIcon type={row.contentType} className="w-4 h-4 text-zinc-400" />
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-100 font-semibold text-sm truncate group-hover:text-white transition-colors">
                  {row.title}
                </span>
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0 select-none">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                    </span>
                    Pending
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-400 block truncate max-w-md">
                {row.description}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="tabular-nums">
                  {new Date(row.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "contentType",
      header: "Type",
      render: (row) => <StatusBadge variant="contentType" value={row.contentType} />,
      width: "140px",
    },
    {
      key: "authorName",
      header: "Author",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] font-medium text-zinc-300 uppercase shrink-0">
            {row.authorName ? row.authorName.charAt(0) : "U"}
          </div>
          <span className="text-zinc-300 text-sm truncate">{row.authorName}</span>
        </div>
      ),
      width: "160px",
    },
    {
      key: "tags",
      header: "Tags",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
            >
              {tag}
            </span>
          ))}
          {row.tags && row.tags.length > 2 && (
            <span className="text-[10px] text-zinc-500">+{row.tags.length - 2}</span>
          )}
        </div>
      ),
      width: "150px",
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({
                id: row.id,
                contentType: row.contentType,
                title: row.title,
                authorName: row.authorName,
              });
            }}
            title="Delete post"
            aria-label={`Delete ${row.title}`}
            className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/35 flex items-center justify-center transition-all duration-100 ease-out active:scale-[0.90] cursor-pointer shadow-xs hover:shadow-rose-950/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight apple-display-heading">
          Community
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Review, moderate, and manage community posts across all channels
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-zinc-900/40 p-2.5 rounded-2xl border border-white/[0.06] backdrop-blur-md">
        {/* Left: Type select */}
        <div className="flex items-center gap-3">
          <Select
            value={typeFilter || "ALL"}
            onValueChange={(val) => {
              setTypeFilter(val === "ALL" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[210px] bg-white/[0.03] border-white/10 hover:border-white/20">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="ADOPTION_LISTING">Adoption Listing</SelectItem>
              <SelectItem value="RESCUE_REPORT">Emergency Rescue</SelectItem>
              <SelectItem value="TRANSPORT_REQUEST">Transport Request</SelectItem>
              <SelectItem value="COMMUNITY_STORY">Community Story</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Show pending only checkbox */}
        <div className="ml-auto flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
          <Checkbox
            id="show-pending-filter"
            checked={showPendingOnly}
            onCheckedChange={(checked) => {
              setShowPendingOnly(checked === true);
              setPage(1);
            }}
          />
          <label
            htmlFor="show-pending-filter"
            className="text-xs font-medium text-zinc-300 select-none cursor-pointer flex items-center gap-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Show pending only
          </label>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center justify-between text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-300 text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage={
          showPendingOnly
            ? "No posts awaiting pending approval."
            : "No community posts found."
        }
        onRowClick={(row) => openDetail(row.contentType, row.id)}
      />

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={data.pageSize}
          hasNextPage={data.hasNextPage}
          hasPreviousPage={data.hasPreviousPage}
          onPageChange={setPage}
        />
      )}

      {/* Redesigned Post Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden p-0 bg-zinc-950/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl rounded-3xl flex flex-col">
          <AnimatePresence mode="wait">
            {detailLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 space-y-6 flex-1 overflow-y-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 rounded-md bg-white/[0.06] animate-pulse" />
                    <div className="h-3 w-1/4 rounded-md bg-white/[0.04] animate-pulse" />
                  </div>
                </div>
                <div className="h-64 rounded-2xl bg-white/[0.04] animate-pulse" />
                <div className="h-6 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-md bg-white/[0.04] animate-pulse" />
                  <div className="h-4 w-5/6 rounded-md bg-white/[0.04] animate-pulse" />
                </div>
              </motion.div>
            ) : detailPost ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 6 }}
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <PostDetailView
                  post={detailPost}
                  onApprove={() =>
                    setApproveTarget({
                      id: detailPost.id,
                      contentType: detailPost.contentType,
                      title: detailPost.title,
                      authorName: detailPost.authorName,
                    })
                  }
                  onReject={() =>
                    setRejectTarget({
                      id: detailPost.id,
                      contentType: detailPost.contentType,
                      title: detailPost.title,
                      authorName: detailPost.authorName,
                    })
                  }
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!approveTarget}
        title={`Approve "${approveTarget?.title}"?`}
        description={`This ${
          CONTENT_TYPE_LABELS[approveTarget?.contentType ?? ""] ?? "post"
        } by ${approveTarget?.authorName} will be published live to the community feed.`}
        confirmLabel={actionPending ? "Approving…" : "Approve post"}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />
      <ConfirmDialog
        isOpen={!!rejectTarget}
        title={`Reject "${rejectTarget?.title}"?`}
        description={`This ${
          CONTENT_TYPE_LABELS[rejectTarget?.contentType ?? ""] ?? "post"
        } by ${rejectTarget?.authorName} will be rejected and removed from public view.`}
        destructive
        confirmLabel={actionPending ? "Rejecting…" : "Reject post"}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        description={`This action will permanently delete this ${
          CONTENT_TYPE_LABELS[deleteTarget?.contentType ?? ""] ?? "post"
        } by ${deleteTarget?.authorName}. This action is permanent and cannot be undone.`}
        destructive
        confirmLabel={isDeleting ? "Deleting…" : "Delete post"}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}

function ContentTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "RESCUE_REPORT":
      return <AlertTriangle className={className} />;
    case "ADOPTION_LISTING":
      return <Heart className={className} />;
    case "TRANSPORT_REQUEST":
      return <Truck className={className} />;
    case "COMMUNITY_STORY":
      return <BookOpen className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

function PostDetailView({
  post,
  onApprove,
  onReject,
}: {
  post: CommunityPostDetailResponse;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isPending =
    post.status === "Pending" ||
    post.status === "PendingApproval" ||
    post.status === "0";

  const photos =
    post.photos && post.photos.length > 0
      ? post.photos
      : post.photoUrl
      ? [post.photoUrl]
      : [];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable Post Content */}
      <div className="overflow-y-auto max-h-[calc(88vh-80px)] p-6 space-y-6">
        {/* Author Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-sm shadow-inner">
              {post.authorName ? post.authorName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{post.authorName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-medium">
                  Author
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge variant="contentType" value={post.contentType} />
            {isPending ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 select-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
                Pending approval
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 select-none">
                <Check className="w-3 h-3" />
                Approved
              </span>
            )}
          </div>
        </div>

        {/* Media Presentation */}
        {photos.length > 0 && (
          <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-lg bg-black/40">
            <PhotoGallery photos={photos} />
          </div>
        )}

        {/* Video Player */}
        {post.videoUrl && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Video attachment</p>
            <video
              src={post.videoUrl}
              controls
              className="w-full rounded-2xl border border-white/[0.08] shadow-md bg-black max-h-72 object-contain"
            />
          </div>
        )}

        {/* Post Title & Description */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight apple-title-heading leading-snug">
            {post.title}
          </h2>
          <div className="text-sm sm:text-base text-zinc-300 leading-relaxed apple-body whitespace-pre-wrap">
            {post.description}
          </div>
        </div>

        {/* Rescue Report Context Card */}
        {post.contentType === "RESCUE_REPORT" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Rescue report details
              </div>
              {post.urgency && (
                <div className="flex items-center gap-2">
                  <StatusBadge variant="urgency" value={post.urgency} />
                  {post.urgencySource && (
                    <span className="text-[11px] text-zinc-500">via {post.urgencySource}</span>
                  )}
                </div>
              )}
            </div>

            {(post.locationName || (post.latitude && post.longitude)) && (
              <LocationDetailCard
                locationName={post.locationName}
                latitude={post.latitude}
                longitude={post.longitude}
                label="Incident Location"
                variant="emerald"
              />
            )}

            {post.conditionNotes && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 space-y-1">
                <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Condition notes
                </p>
                <p className="text-xs sm:text-sm text-zinc-200 leading-normal">{post.conditionNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Adoption Listing Context Card */}
        {post.contentType === "ADOPTION_LISTING" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4" />
              Pet profile
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {post.animalName && (
                <MetricChip label="Pet Name" value={post.animalName} />
              )}
              {post.species && (
                <MetricChip label="Species" value={post.species} />
              )}
              {post.breed && (
                <MetricChip label="Breed" value={post.breed} />
              )}
              {(post.ageLabel || post.ageMonths) && (
                <MetricChip
                  label="Age"
                  value={post.ageLabel ?? `${post.ageMonths} months`}
                />
              )}
              {post.gender && (
                <MetricChip label="Gender" value={post.gender} />
              )}
              {post.size && (
                <MetricChip label="Size" value={post.size} />
              )}
              {post.activityLevel && (
                <MetricChip label="Activity" value={post.activityLevel} />
              )}
            </div>

            {(post.locationName || (post.latitude && post.longitude)) && (
              <div className="pt-2 border-t border-white/[0.06]">
                <LocationDetailCard
                  locationName={post.locationName}
                  latitude={post.latitude}
                  longitude={post.longitude}
                  label="Pet Location"
                  variant="neutral"
                />
              </div>
            )}
          </div>
        )}

        {/* Transport Request Context Card */}
        {post.contentType === "TRANSPORT_REQUEST" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4" />
              Transport route & logistics
            </div>

            <div className="space-y-4">
              {/* Pickup */}
              <div className="space-y-2">
                <LocationDetailCard
                  locationName={post.locationName}
                  latitude={post.latitude}
                  longitude={post.longitude}
                  label="Pickup Point"
                  variant="emerald"
                />
                {(post.pickupContactName || post.pickupTimeStart) && (
                  <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-zinc-400">
                    {post.pickupContactName && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-500" /> Contact: {post.pickupContactName}
                      </span>
                    )}
                    {post.pickupTimeStart && (
                      <span className="text-zinc-500">
                        Window: {new Date(post.pickupTimeStart).toLocaleString()}
                        {post.pickupTimeEnd && ` — ${new Date(post.pickupTimeEnd).toLocaleTimeString()}`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Dropoff */}
              <div className="space-y-2">
                <LocationDetailCard
                  locationName={post.dropoffLocation}
                  latitude={post.dropoffLatitude}
                  longitude={post.dropoffLongitude}
                  label="Dropoff Destination"
                  variant="blue"
                />
                {post.dropoffContactName && (
                  <div className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-zinc-400">
                    <Phone className="w-3 h-3 text-zinc-500" /> Contact: {post.dropoffContactName}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <Tag className="w-3.5 h-3.5 text-zinc-500" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar with 2 CTA Buttons on Bottom Right */}
      <div className="sticky bottom-0 bg-zinc-900/90 backdrop-blur-xl border-t border-white/[0.08] px-6 py-4 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>Last updated {new Date(post.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* CTA Buttons in Bottom Right */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-sm font-medium transition-all active:scale-[0.97] cursor-pointer"
          >
            <X className="w-4 h-4 text-rose-400" />
            Reject
          </button>
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.97] cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 space-y-0.5">
      <span className="text-[10px] text-zinc-500 block uppercase font-medium tracking-wide">
        {label}
      </span>
      <span className="text-xs sm:text-sm text-zinc-100 font-semibold truncate block">
        {value}
      </span>
    </div>
  );
}

function PhotoGallery({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const hasMultiple = photos.length > 1;

  const goTo = (idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    goTo((current - 1 + photos.length) % photos.length, -1);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    goTo((current + 1) % photos.length, 1);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: -dir * 30, opacity: 0 }),
  };

  return (
    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-zinc-950">
      <AnimatePresence custom={direction} mode="wait">
        <motion.img
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          src={photos[current]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Fade-to-content gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />

      {hasMultiple && (
        <>
          {/* Previous button */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-transform active:scale-[0.92] hover:bg-black/80"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          {/* Next button */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-transform active:scale-[0.92] hover:bg-black/80"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i, i > current ? 1 : -1);
                }}
                aria-label={`Photo ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === current
                    ? "w-5 h-1.5 bg-emerald-400"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Photo Counter */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-white/90 tabular-nums font-medium">
            {current + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
