"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { KycPendingResponse } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserInfoModal } from "../users/_components/UserInfoModal";
import { KycManageModal } from "./_components/KycManageModal";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");

const getRelativeDate = (dateStr: string): string => {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export default function KycPage() {
  const [items, setItems] = useState<KycPendingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [manageSubmission, setManageSubmission] = useState<KycPendingResponse | null>(null);

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

  const columns: Column<KycPendingResponse>[] = [
    {
      key: "userName",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-xs shrink-0">
            {getInitials(row.userName)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-zinc-100 truncate">{row.userName}</p>
            <p className="text-xs text-zinc-500 truncate">{row.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "documentType",
      header: "Document",
      width: "140px",
      render: (row) => <StatusBadge variant="documentType" value={row.documentType} />,
    },
    {
      key: "uploadedAt",
      header: "Submitted",
      width: "130px",
      render: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-zinc-400 text-xs cursor-default">
                {getRelativeDate(row.uploadedAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{new Date(row.uploadedAt).toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setManageSubmission(row)}
            className="apple-press-feedback px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] text-zinc-300 border border-white/10 hover:bg-white/[0.12] hover:text-white transition-all"
          >
            Manage
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">KYC Review</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Review and process identity verification documents
        </p>
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
        onRowClick={(row) => setProfileUserId(row.userId)}
      />

      <UserInfoModal
        userId={profileUserId}
        isOpen={!!profileUserId}
        onClose={() => setProfileUserId(null)}
        onUserDeleted={() => {
          setProfileUserId(null);
          fetchKyc();
        }}
        onUserSuspended={() => {}}
      />

      <KycManageModal
        submission={manageSubmission}
        isOpen={!!manageSubmission}
        onClose={() => setManageSubmission(null)}
        onActionComplete={fetchKyc}
      />
    </div>
  );
}
