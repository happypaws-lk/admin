"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { AdminUserResponse, PagedResult } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { UserInfoModal } from "./_components/UserInfoModal";
import { MoreVertical, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  const parseDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const formatted = dateStr.includes("T")
        ? dateStr
        : dateStr.replace(" ", "T").replace(" +", "+");
      const d = new Date(formatted);
      return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
    } catch {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
    }
  };

  const columns: Column<AdminUserResponse>[] = [
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="text-[#818cf8] font-medium transition-colors">
          {row.email}
        </span>
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
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      render: (row) => (
        <span className="tabular-nums text-slate-300">{row.reputationPoints ?? 0}</span>
      ),
      width: "110px",
    },
    {
      key: "isVerified",
      header: "Verified",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      render: (row) =>
        row.isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/40">
            Unverified
          </span>
        ),
      width: "110px",
    },
    {
      key: "isSuspended",
      header: "Status",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
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
      key: "actions",
      header: "",
      width: "48px",
      render: (row) => (
        <div
          className="flex items-center justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none"
                aria-label="User actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 px-4 py-4 space-y-4 apple-glass-popover rounded-xl shadow-2xl"
            >
              <div className="space-y-3 text-xs border-b border-white/10 pb-4">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="font-medium">Reputation</span>
                  <span className="tabular-nums font-semibold text-zinc-200">
                    {row.reputationPoints ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="font-medium">Verified</span>
                  {row.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/40">
                      Unverified
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="font-medium">Status</span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                      row.isSuspended
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/25"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    }`}
                  >
                    {row.isSuspended ? "Suspended" : "Active"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="font-medium">Joined</span>
                  <span className="text-zinc-300 font-medium">
                    {parseDate(row.createdAt)}
                  </span>
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => setSelectedUserId(row.id)}
                className="w-full cursor-pointer justify-center font-semibold bg-white/[0.08] hover:bg-white/[0.16] text-white rounded-lg py-2.5 text-xs transition-all border border-white/10 shadow-sm focus:bg-white/[0.16] focus:text-white"
              >
                Manage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
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
        onRowClick={(row) => setSelectedUserId(row.id)}
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

      <UserInfoModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserDeleted={() => {
          fetchUsers();
        }}
        onUserSuspended={() => {
          fetchUsers();
        }}
      />
    </div>
  );
}
