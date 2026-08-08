"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { PledgeResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

const PAGE_SIZE = 20;

export default function PledgesPage() {
  const [data, setData] = useState<PagedResult<PledgeResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPledges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<PledgeResponse>>(
        "/api/v1/pledge/api/v1/pledges/me",
        { Page: page, PageSize: PAGE_SIZE },
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pledges.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPledges();
  }, [fetchPledges]);

  const columns: Column<PledgeResponse>[] = [
    {
      key: "sponsorName",
      header: "Sponsor",
      render: (row) => <span className="text-slate-200 font-medium">{row.sponsorName}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="text-slate-200 font-semibold tabular-nums">
          LKR {(row.amount ?? 0).toLocaleString()}
        </span>
      ),
      width: "140px",
    },
    {
      key: "caseId",
      header: "Case / Listing",
      render: (row) => (
        <span className="text-slate-400 text-xs font-mono">
          {row.caseId
            ? row.caseId.slice(0, 8) + "…"
            : row.listingId
              ? row.listingId.slice(0, 8) + "…"
              : "General"}
        </span>
      ),
    },
    {
      key: "note",
      header: "Note",
      render: (row) => (
        <span className="text-slate-500 text-xs line-clamp-1">{row.note ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge variant="pledgeStatus" value={row.status} />,
      width: "110px",
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      width: "110px",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Pledges</h1>
        <p className="text-slate-400 mt-1 text-sm">Overview of sponsor pledges</p>
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
        emptyMessage="No pledges found."
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
