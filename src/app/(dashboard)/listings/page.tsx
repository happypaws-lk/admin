"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { AdminListingResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

const PAGE_SIZE = 20;

export default function ListingsPage() {
  const [data, setData] = useState<PagedResult<AdminListingResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<AdminListingResponse>>(
        "/api/v1/admin/listings",
        {
          page,
          pageSize: PAGE_SIZE,
          ...(statusFilter !== "" ? { status: statusFilter } : {}),
        },
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listings.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const columns: Column<AdminListingResponse>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <Link
          href={`/listings/${row.id}`}
          className="text-[#818cf8] hover:text-indigo-300 font-medium transition-colors"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: "species",
      header: "Animal",
      render: (row) => (
        <span className="text-slate-300 text-xs">
          {row.species}
          {row.breed ? ` · ${row.breed}` : ""}
        </span>
      ),
    },
    {
      key: "listingStatus",
      header: "Status",
      render: (row) => <StatusBadge variant="listingStatus" value={row.listingStatus} />,
      width: "110px",
    },
    {
      key: "location",
      header: "Location",
      render: (row) => <span className="text-slate-400 text-xs">{row.location}</span>,
    },
    {
      key: "postedByEmail",
      header: "Posted by",
      render: (row) => <span className="text-slate-400 text-xs">{row.postedByEmail}</span>,
    },
    {
      key: "createdAt",
      header: "Posted",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      width: "110px",
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link
          href={`/listings/${row.id}`}
          className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          View
        </Link>
      ),
      width: "60px",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Listings</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage adoption listings</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-[#0d0f17] border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all"
        >
          <option value="">All statuses</option>
          <option value="0">Available</option>
          <option value="1">Pending</option>
          <option value="2">Adopted</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="No listings found."
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
    </div>
  );
}
