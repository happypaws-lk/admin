"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { KycPendingResponse } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";

export default function KycPage() {
  const [items, setItems] = useState<KycPendingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [approveTarget, setApproveTarget] = useState<KycPendingResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<KycPendingResponse | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const fetchKyc = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<KycPendingResponse[]>("/api/v1/admin/kyc/pending");
      setItems(result ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load KYC queue.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionPending(true);
    try {
      await apiClient.post(`/api/v1/admin/kyc/${approveTarget.id}/approve`);
      setApproveTarget(null);
      fetchKyc();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve KYC.");
    } finally {
      setActionPending(false);
    }
  };

  const handleReject = async (reason: string | undefined) => {
    if (!rejectTarget) return;
    setActionPending(true);
    try {
      await apiClient.post(`/api/v1/admin/kyc/${rejectTarget.id}/reject`, {
        reason: reason ?? "",
      });
      setRejectTarget(null);
      fetchKyc();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject KYC.");
    } finally {
      setActionPending(false);
    }
  };

  const columns: Column<KycPendingResponse>[] = [
    {
      key: "userName",
      header: "User",
      render: (row) => (
        <div className="space-y-0.5">
          <span className="text-slate-200 font-medium text-sm">{row.userName}</span>
          <p className="text-xs text-slate-500">{row.userEmail}</p>
        </div>
      ),
    },
    {
      key: "documentType",
      header: "Document",
      render: (row) => <StatusBadge variant="documentType" value={row.documentType} />,
      width: "150px",
    },
    {
      key: "documentUrl",
      header: "File",
      render: (row) => (
        <a
          href={row.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#818cf8] hover:text-indigo-300 underline transition-colors"
        >
          View ↗
        </a>
      ),
      width: "80px",
    },
    {
      key: "uploadedAt",
      header: "Submitted",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {new Date(row.uploadedAt).toLocaleDateString()}
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
        data={items}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="No pending KYC submissions."
      />

      <ConfirmDialog
        isOpen={!!approveTarget}
        title={`Approve KYC for ${approveTarget?.userName ?? approveTarget?.userEmail}?`}
        description="This will mark the document as verified and grant the user the privileges associated with their role."
        confirmLabel={actionPending ? "Approving…" : "Approve"}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!rejectTarget}
        title={`Reject KYC for ${rejectTarget?.userName ?? rejectTarget?.userEmail}?`}
        description="The user will be notified and asked to resubmit with a valid document."
        destructive
        confirmLabel={actionPending ? "Rejecting…" : "Reject"}
        requireReason
        reasonLabel="Rejection reason"
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
