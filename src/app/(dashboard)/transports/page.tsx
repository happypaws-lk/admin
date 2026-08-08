"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { TransportTaskResponse } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransportsPage() {
  const [data, setData] = useState<TransportTaskResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<TransportTaskResponse[]>("/api/v1/transports");
      setData(result ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransports();
  }, [fetchTransports]);

  const filtered =
    statusFilter !== ""
      ? data.filter((t) => String(t.status) === statusFilter)
      : data;

  const columns: Column<TransportTaskResponse>[] = [
    {
      key: "caseId",
      header: "Rescue Case",
      render: (row) => (
        <Link
          href={`/rescue-cases/${row.caseId}`}
          className="text-[#818cf8] hover:text-indigo-300 font-medium transition-colors font-mono text-xs"
        >
          {row.caseId.slice(0, 8)}…
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
      key: "transporterName",
      header: "Transporter",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {row.transporterName || (row.transporterId ? "—" : "Unassigned")}
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
        <Select
          value={statusFilter || "ALL"}
          onValueChange={(val) => setStatusFilter(val === "ALL" ? "" : val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="0">Pending</SelectItem>
            <SelectItem value="1">Assigned</SelectItem>
            <SelectItem value="2">Picked Up</SelectItem>
            <SelectItem value="3">In Transit</SelectItem>
            <SelectItem value="4">Delivered</SelectItem>
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
        data={filtered}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="No transport tasks found."
      />
    </div>
  );
}
