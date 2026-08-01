"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { PledgeResponse, PagedResult } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

const PAGE_SIZE = 20;

export default function PledgesPage() {
  const { user } = useAuth();
  const isSponsor = user?.roles?.includes("Sponsor") ?? false;

  const [data, setData] = useState<PagedResult<PledgeResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPledges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<PledgeResponse>>(
        "/api/v1/admin/pledges",
        { page, pageSize: PAGE_SIZE },
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
      key: "userEmail",
      header: "Sponsor",
      render: (row) => <span className="text-slate-200 font-medium">{row.userEmail}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) =>
        isSponsor ? (
          <span className="text-slate-200 font-semibold tabular-nums">
            LKR {(row.amount ?? 0).toLocaleString()}
          </span>
        ) : (
          <span className="text-slate-600 text-xs">Hidden</span>
        ),
      width: "140px",
    },
    {
      key: "caseTitle",
      header: "Rescue Case",
      render: (row) => (
        <span className="text-slate-400 text-xs">{row.caseTitle ?? "General pledge"}</span>
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
        <p className="text-slate-400 mt-1 text-sm">Overview of all sponsor pledges</p>
      </div>

      {!isSponsor && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
          <svg
            className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-amber-300">
            Pledge amounts are only visible to admins with the{" "}
            <span className="font-semibold">Sponsor</span> role. Your account does not have
            this role, so amounts are hidden.
          </p>
        </div>
      )}

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
