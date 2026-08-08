"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { AdminUserResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [data, setData] = useState<PagedResult<AdminUserResponse> | null>(null);
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [suspendedFilter, setSuspendedFilter] = useState<"" | "true" | "false">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    email: string;
    action: "suspend" | "unsuspend";
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<PagedResult<AdminUserResponse>>(
        "/api/v1/admin/users",
        {
          page,
          pageSize: PAGE_SIZE,
          ...(emailFilter ? { email: emailFilter } : {}),
          ...(roleFilter ? { role: roleFilter } : {}),
          ...(suspendedFilter !== "" ? { isSuspended: suspendedFilter } : {}),
        },
      );
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [page, emailFilter, roleFilter, suspendedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspendAction = async (reason: string | undefined) => {
    if (!confirmAction) return;
    if (confirmAction.action === "suspend") {
      await apiClient.put(`/api/v1/admin/users/${confirmAction.userId}/suspend`, {
        reason: reason ?? "",
      });
    } else {
      await apiClient.put(`/api/v1/admin/users/${confirmAction.userId}/unsuspend`);
    }
    setConfirmAction(null);
    fetchUsers();
  };

  const columns: Column<AdminUserResponse>[] = [
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <Link
          href={`/users/${row.id}`}
          className="text-[#818cf8] hover:text-indigo-300 font-medium transition-colors"
        >
          {row.email}
        </Link>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (row) => (
        <span className="text-slate-300 text-xs">{(row.roles ?? []).join(", ") || "—"}</span>
      ),
    },
    {
      key: "reputationPoints",
      header: "Reputation",
      render: (row) => (
        <span className="tabular-nums text-slate-300">{row.reputationPoints ?? 0}</span>
      ),
      width: "110px",
    },
    {
      key: "isVerified",
      header: "Verified",
      render: (row) => (
        <span className={row.isVerified ? "text-emerald-400 text-xs" : "text-slate-500 text-xs"}>
          {row.isVerified ? "Yes" : "No"}
        </span>
      ),
      width: "80px",
    },
    {
      key: "isSuspended",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
            row.isSuspended
              ? "bg-rose-500/15 text-rose-400 border-rose-500/25"
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
          }`}
        >
          {row.isSuspended ? "Suspended" : "Active"}
        </span>
      ),
      width: "100px",
    },
    {
      key: "createdAt",
      header: "Joined",
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
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/users/${row.id}`}
            className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            View
          </Link>
          <button
            onClick={() =>
              setConfirmAction({
                userId: row.id,
                email: row.email,
                action: row.isSuspended ? "unsuspend" : "suspend",
              })
            }
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
              row.isSuspended
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            }`}
          >
            {row.isSuspended ? "Unsuspend" : "Suspend"}
          </button>
        </div>
      ),
      width: "140px",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage registered platform users</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by email…"
          value={emailFilter}
          onChange={(e) => {
            setEmailFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-all w-64 placeholder:text-zinc-500"
        />
        <Select
          value={roleFilter || "ALL"}
          onValueChange={(val) => {
            setRoleFilter(val === "ALL" ? "" : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="Adopter">Adopter</SelectItem>
            <SelectItem value="Foster">Foster</SelectItem>
            <SelectItem value="Transporter">Transporter</SelectItem>
            <SelectItem value="Sponsor">Sponsor</SelectItem>
            <SelectItem value="Veterinarian">Veterinarian</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={suspendedFilter || "ALL"}
          onValueChange={(val) => {
            setSuspendedFilter((val === "ALL" ? "" : val) as "" | "true" | "false");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Suspended</SelectItem>
          </SelectContent>
        </Select>
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
        emptyMessage="No users found matching your filters."
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
        isOpen={!!confirmAction}
        title={
          confirmAction?.action === "suspend"
            ? `Suspend ${confirmAction?.email}?`
            : `Unsuspend ${confirmAction?.email}?`
        }
        description={
          confirmAction?.action === "suspend"
            ? "The user will lose access to the platform immediately."
            : "The user will regain full platform access."
        }
        destructive={confirmAction?.action === "suspend"}
        confirmLabel={confirmAction?.action === "suspend" ? "Suspend User" : "Unsuspend User"}
        requireReason={confirmAction?.action === "suspend"}
        reasonLabel="Reason for suspension"
        onConfirm={handleSuspendAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
