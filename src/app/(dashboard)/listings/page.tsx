"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { ListingResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 20;

export default function ListingsPage() {
  const [data, setData] = useState<PagedResult<ListingResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<ListingResponse>>(
        "/api/v1/listings",
        {
          Page: page,
          PageSize: PAGE_SIZE,
          ...(statusFilter !== "" ? { status: statusFilter } : {}),
          ...(speciesFilter ? { species: speciesFilter } : {}),
        },
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listings.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, speciesFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const columns: Column<ListingResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link
          href={`/listings/${row.id}`}
          className="text-[#818cf8] hover:text-indigo-300 font-medium transition-colors"
        >
          {row.name}
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
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge variant="listingStatus" value={row.status} />,
      width: "110px",
    },
    {
      key: "locationName",
      header: "Location",
      render: (row) => <span className="text-slate-400 text-xs">{row.locationName}</span>,
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
        <Select
          value={statusFilter || "ALL"}
          onValueChange={(val) => {
            setStatusFilter(val === "ALL" ? "" : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="0">Available</SelectItem>
            <SelectItem value="1">Pending</SelectItem>
            <SelectItem value="2">Adopted</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="text"
          placeholder="Filter by species…"
          value={speciesFilter}
          onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-all w-48 placeholder:text-zinc-500"
        />
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
