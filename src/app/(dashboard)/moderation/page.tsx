"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  ModerationLogResponse,
  PagedResult,
} from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";

const PAGE_SIZE = 20;

export default function ModerationPage() {
  const [data, setData] = useState<PagedResult<ModerationLogResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<ModerationLogResponse>>(
        "/api/v1/admin/moderation",
        { Page: page, PageSize: PAGE_SIZE },
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load moderation log.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const columns: Column<ModerationLogResponse>[] = [
    {
      key: "targetType",
      header: "Target",
      render: (row) => (
        <div className="space-y-0.5">
          <span className="text-slate-200 text-xs font-medium">{row.targetType}</span>
          <p className="text-xs text-slate-500 font-mono">{(row.targetId ?? "").slice(0, 8)}…</p>
        </div>
      ),
    },
    {
      key: "actionType",
      header: "Action",
      render: (row) => <StatusBadge variant="moderationAction" value={row.actionType} />,
      width: "110px",
    },
    {
      key: "reason",
      header: "Reason",
      render: (row) => (
        <span className="text-slate-400 text-xs line-clamp-2">{row.reason}</span>
      ),
    },
    {
      key: "adminId",
      header: "Admin ID",
      render: (row) => (
        <span className="text-slate-400 text-xs font-mono">{row.adminId?.slice(0, 8)}…</span>
      ),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderation</h1>
        <p className="text-slate-400 mt-1 text-sm">Review the audit log</p>
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
        emptyMessage="No moderation actions found."
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
