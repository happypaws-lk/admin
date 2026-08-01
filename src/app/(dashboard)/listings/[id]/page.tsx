"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api";
import type { AdminListingResponse, ApplicationResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { ModerationTargetType, ModerationActionType } from "@/lib/types";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [listing, setListing] = useState<AdminListingResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const [removeDialog, setRemoveDialog] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setAppsLoading(true);
      setError(null);
      try {
        const [listingData, appsData] = await Promise.all([
          apiClient.get<AdminListingResponse>(`/api/v1/admin/listings/${id}`),
          apiClient
            .get<PagedResult<ApplicationResponse>>(`/api/v1/listings/${id}/applications`)
            .catch(() => null),
        ]);
        setListing(listingData);
        setApplications(appsData?.items ?? []);
      } catch (e) {
        setError(
          e instanceof ApiError && e.status === 404
            ? "Listing not found."
            : e instanceof Error
              ? e.message
              : "Failed to load listing.",
        );
      } finally {
        setIsLoading(false);
        setAppsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRemove = async (reason: string | undefined) => {
    if (!listing) return;
    setRemoving(true);
    try {
      await apiClient.post("/api/v1/admin/moderation", {
        targetType: ModerationTargetType.Listing,
        targetId: listing.id,
        actionType: ModerationActionType.Removed,
        reason: reason ?? "",
      });
      setRemoveDialog(false);
    } finally {
      setRemoving(false);
    }
  };

  const appColumns: Column<ApplicationResponse>[] = [
    {
      key: "applicantEmail",
      header: "Applicant",
      render: (row) => <span className="text-slate-200">{row.applicantEmail}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge variant="applicationStatus" value={row.status} />,
      width: "110px",
    },
    {
      key: "createdAt",
      header: "Applied",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      width: "110px",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-400">{error ?? "Listing not found."}</p>
        <Link href="/listings" className="text-sm text-[#818cf8] hover:text-indigo-300 transition-colors">
          ← Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/listings" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Listings
          </Link>
          <h1 className="text-xl font-bold text-white mt-1">{listing.title}</h1>
        </div>
        <button
          onClick={() => setRemoveDialog(true)}
          disabled={removing}
          className="text-xs px-4 py-2 rounded-xl font-semibold bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 transition-colors disabled:opacity-50"
        >
          Remove Listing
        </button>
      </div>

      {(listing.photoUrls ?? []).length > 0 && (
        <div className="space-y-2">
          <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-900">
            <Image
              src={listing.photoUrls[selectedPhoto]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
          {(listing.photoUrls ?? []).length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(listing.photoUrls ?? []).map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPhoto(i)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    i === selectedPhoto
                      ? "border-[#5b50e6]"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {[
          { label: "Status", value: <StatusBadge variant="listingStatus" value={listing.listingStatus} /> },
          { label: "Species", value: listing.species },
          ...(listing.breed ? [{ label: "Breed", value: listing.breed }] : []),
          ...(listing.ageMonths != null ? [{ label: "Age", value: `${listing.ageMonths} months` }] : []),
          { label: "Location", value: listing.location },
          { label: "Posted by", value: listing.postedByEmail },
          { label: "Posted on", value: new Date(listing.createdAt).toLocaleString() },
          { label: "Last updated", value: new Date(listing.updatedAt).toLocaleString() },
          { label: "Vaccinated", value: listing.isVaccinated ? "Yes" : "No" },
          { label: "Neutered", value: listing.isNeutered ? "Yes" : "No" },
          ...(listing.description ? [{ label: "Description", value: listing.description }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-3.5 flex items-start gap-4">
            <span className="w-28 text-xs font-medium text-slate-500 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-slate-200">{value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-sm font-semibold text-white">Applications</h2>
        </div>
        <DataTable
          columns={appColumns}
          data={applications}
          isLoading={appsLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="No applications for this listing."
        />
      </div>

      <ConfirmDialog
        isOpen={removeDialog}
        title={`Remove "${listing.title}"?`}
        description="This will create a moderation action and remove the listing from the platform."
        destructive
        confirmLabel="Remove Listing"
        requireReason
        reasonLabel="Reason for removal"
        onConfirm={handleRemove}
        onCancel={() => setRemoveDialog(false)}
      />
    </div>
  );
}
