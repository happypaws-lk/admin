"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  ModerationLogResponse,
  PagedResult,
  ModerationTargetType,
  ModerationActionType,
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

  const [targetType, setTargetType] = useState<ModerationTargetType | "">("");
  const [targetId, setTargetId] = useState("");
  const [actionType, setActionType] = useState<ModerationActionType | "">("");
  const [reason, setReason] = useState("");
  const [formPending, setFormPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<ModerationLogResponse>>(
        "/api/v1/admin/moderation",
        { page, pageSize: PAGE_SIZE },
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetType === "" || actionType === "") return;
    setFormPending(true);
    setFormError(null);
    try {
      await apiClient.post("/api/v1/admin/moderation", {
        targetType,
        targetId: targetId.trim(),
        actionType,
        reason: reason.trim(),
      });
      setFormSuccess(true);
      setTargetType("");
      setTargetId("");
      setActionType("");
      setReason("");
      fetchLog();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create moderation action.");
    } finally {
      setFormPending(false);
    }
  };

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
      key: "performedByEmail",
      header: "By",
      render: (row) => (
        <span className="text-slate-400 text-xs">{row.performedByEmail}</span>
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
        <p className="text-slate-400 mt-1 text-sm">Create moderation actions and review the audit log</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Create Moderation Action</h2>

        {formSuccess && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            Moderation action created successfully.
          </p>
        )}
        {formError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as ModerationTargetType | "")}
            required
            className="px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all col-span-1"
          >
            <option value="">Target type…</option>
            <option value="0">Listing</option>
            <option value="1">Message</option>
            <option value="2">User</option>
          </select>

          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ModerationActionType | "")}
            required
            className="px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all col-span-1"
          >
            <option value="">Action type…</option>
            <option value="0">Remove</option>
            <option value="1">Suspend</option>
            <option value="2">Warn</option>
          </select>

          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Target ID (UUID)"
            required
            className="col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all font-mono placeholder:font-sans placeholder:text-slate-600"
          />

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for this action…"
            rows={2}
            required
            className="col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all resize-none placeholder:text-slate-600"
          />

          <button
            type="submit"
            disabled={formPending || targetType === "" || actionType === "" || !targetId.trim() || !reason.trim()}
            className="col-span-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#5b50e6] hover:bg-[#4d42df] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all w-fit"
          >
            {formPending ? "Submitting…" : "Create Action"}
          </button>
        </form>
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
