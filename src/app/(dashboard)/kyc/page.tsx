"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { KycPendingResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";

const PAGE_SIZE = 20;

export default function KycPage() {
  const [data, setData] = useState<PagedResult<KycPendingResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [approveTarget, setApproveTarget] = useState<KycPendingResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<KycPendingResponse | null>(null);

  const fetchKyc = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<KycPendingResponse>>(
        "/api/v1/admin/kyc/pending",
        { page, pageSize: PAGE_SIZE },
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load KYC queue.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    await apiClient.post(`/api/v1/admin/kyc/${approveTarget.id}/approve`);
    setApproveTarget(null);
    fetchKyc();
  };

  const handleReject = async (reason: string | undefined) => {
    if (!rejectTarget) return;
    await apiClient.post(`/api/v1/admin/kyc/${rejectTarget.id}/reject`, {
      reason: reason ?? "",
    });
    setRejectTarget(null);
    fetchKyc();
  };

  const columns: Column<KycPendingResponse>[] = [
    {
      key: "userEmail",
      header: "User",
      render: (row) => <span className="text-slate-200 font-medium">{row.userEmail}</span>,
    },
    {
      key: "documentType",
      header: "Document",
      render: (row) => <StatusBadge variant="documentType" value={row.documentType} />,
      width: "150px",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge variant="documentStatus" value={row.status} />,
      width: "110px",
    },
    {
      key: "documentUrl",
      header: "Document",
      render: (row) => (
        <a
          href={row.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#818cf8] hover:text-indigo-300 underline transition-colors"
        >
          View file ↗
        </a>
      ),
      width: "100px",
    },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {new Date(row.submittedAt).toLocaleDateString()}
        </span>
      ),
      width: "110px",
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setApproveTarget(row)}
            className="text-xs px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-colors font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => setRejectTarget(row)}
            className="text-xs px-3 py-1 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 transition-colors font-medium"
          >
            Reject
          </button>
        </div>
      ),
      width: "160px",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">KYC Review</h1>
        <p className="text-slate-400 mt-1 text-sm">Review and process identity verification documents</p>
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
        emptyMessage="No pending KYC submissions."
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

      <ConfirmDialog
        isOpen={!!approveTarget}
        title={`Approve KYC for ${approveTarget?.userEmail}?`}
        description="This will mark the document as verified and grant the user the privileges associated with their role."
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!rejectTarget}
        title={`Reject KYC for ${rejectTarget?.userEmail}?`}
        description="The user will be notified and asked to resubmit with a valid document."
        destructive
        confirmLabel="Reject"
        requireReason
        reasonLabel="Rejection reason"
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
