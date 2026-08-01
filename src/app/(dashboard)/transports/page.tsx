"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { TransportTaskResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

const PAGE_SIZE = 20;

export default function TransportsPage() {
  const [data, setData] = useState<PagedResult<TransportTaskResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<TransportTaskResponse>>(
        "/api/v1/admin/transports",
        {
          page,
          pageSize: PAGE_SIZE,
          ...(statusFilter !== "" ? { status: statusFilter } : {}),
        },
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transports.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchTransports();
  }, [fetchTransports]);

  const columns: Column<TransportTaskResponse>[] = [
    {
      key: "caseTitle",
      header: "Rescue Case",
      render: (row) => (
        <Link
          href={`/rescue-cases/${row.rescueCaseId}`}
          className="text-[#818cf8] hover:text-indigo-300 font-medium transition-colors"
        >
          {row.caseTitle}
        </Link>
      ),
    },
    {
      key: "pickupLocation",
      header: "Pickup",
      render: (row) => <span className="text-slate-300 text-xs">{row.pickupLocation}</span>,
    },
    {
      key: "dropoffLocation",
      header: "Drop-off",
      render: (row) => <span className="text-slate-300 text-xs">{row.dropoffLocation}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge variant="transportStatus" value={row.status} />,
      width: "120px",
    },
    {
      key: "assignedToEmail",
      header: "Assigned to",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {row.assignedToEmail ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
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
        <h1 className="text-2xl font-bold text-white">Transports</h1>
        <p className="text-slate-400 mt-1 text-sm">Overview of all rescue transport tasks</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-[#0d0f17] border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all"
        >
          <option value="">All statuses</option>
          <option value="0">Pending</option>
          <option value="1">Assigned</option>
          <option value="2">Picked Up</option>
          <option value="3">In Transit</option>
          <option value="4">Delivered</option>
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
        emptyMessage="No transport tasks found."
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
