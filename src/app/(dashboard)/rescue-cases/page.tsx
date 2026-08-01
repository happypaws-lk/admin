"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { AdminCaseResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

const RescueMap = dynamic(
  () => import("./_components/RescueMap"),
  { ssr: false, loading: () => <div className="h-full w-full rounded-xl bg-white/[0.04] animate-pulse" /> },
);

const PAGE_SIZE = 20;
const MAP_LIMIT = 500;

export default function RescueCasesPage() {
  const [data, setData] = useState<PagedResult<AdminCaseResponse> | null>(null);
  const [mapCases, setMapCases] = useState<AdminCaseResponse[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listResult, mapResult] = await Promise.all([
        apiClient.get<PagedResult<AdminCaseResponse>>(
          "/api/v1/admin/rescue-cases",
          {
            page,
            pageSize: PAGE_SIZE,
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(urgencyFilter ? { urgency: urgencyFilter } : {}),
          },
        ),
        apiClient.get<PagedResult<AdminCaseResponse>>("/api/v1/admin/rescue-cases", {
          page: 1,
          pageSize: MAP_LIMIT,
        }),
      ]);
      setData(listResult);
      setMapCases(mapResult.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rescue cases.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, urgencyFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const columns: Column<AdminCaseResponse>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <Link
          href={`/rescue-cases/${row.id}`}
          className="text-[#818cf8] hover:text-indigo-300 font-medium transition-colors"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (row) => <span className="text-slate-400 text-xs">{row.location}</span>,
    },
    {
      key: "urgency",
      header: "Urgency",
      render: (row) => <StatusBadge variant="urgency" value={row.urgency} />,
      width: "110px",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge variant="caseStatus" value={row.status} />,
      width: "120px",
    },
    {
      key: "createdAt",
      header: "Reported",
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
          href={`/rescue-cases/${row.id}`}
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
        <h1 className="text-2xl font-bold text-white">Rescue Cases</h1>
        <p className="text-slate-400 mt-1 text-sm">Monitor and manage active rescue cases</p>
      </div>

      <div className="h-72 rounded-xl overflow-hidden border border-white/10">
        <RescueMap cases={mapCases} />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-[#0d0f17] border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all"
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => { setUrgencyFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-[#0d0f17] border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all"
        >
          <option value="">All urgency</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="Critical">Critical</option>
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
        emptyMessage="No rescue cases found matching your filters."
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
