"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api";
import type { AdminCaseResponse, Urgency, UpdateType } from "@/lib/types";
import { URGENCY_SOURCE_LABELS, UPDATE_TYPE_LABELS } from "@/lib/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";

export default function RescueCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [caseData, setCaseData] = useState<AdminCaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [urgencyOverride, setUrgencyOverride] = useState<Urgency | "">("");
  const [urgencyReason, setUrgencyReason] = useState("");
  const [urgencyPending, setUrgencyPending] = useState(false);
  const [urgencyError, setUrgencyError] = useState<string | null>(null);
  const [urgencySuccess, setUrgencySuccess] = useState(false);

  const [updateMsg, setUpdateMsg] = useState("");
  const [updateType, setUpdateType] = useState<UpdateType>(0);
  const [updatePending, setUpdatePending] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [resolveDialog, setResolveDialog] = useState(false);

  const fetchCase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<AdminCaseResponse>(
        `/api/v1/admin/rescue-cases/${id}`,
      );
      setCaseData(result);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 404
          ? "Case not found."
          : e instanceof Error
            ? e.message
            : "Failed to load case.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUrgencyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urgencyOverride === "") return;
    setUrgencyPending(true);
    setUrgencyError(null);
    try {
      await apiClient.post(`/api/v1/admin/rescue-cases/${id}/urgency-override`, {
        urgency: urgencyOverride,
        reason: urgencyReason.trim(),
      });
      setUrgencySuccess(true);
      setUrgencyOverride("");
      setUrgencyReason("");
      fetchCase();
      setTimeout(() => setUrgencySuccess(false), 3000);
    } catch (e) {
      setUrgencyError(e instanceof Error ? e.message : "Failed to override urgency.");
    } finally {
      setUrgencyPending(false);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatePending(true);
    setUpdateError(null);
    try {
      await apiClient.post(`/api/v1/admin/rescue-cases/${id}/updates`, {
        message: updateMsg.trim(),
        updateType,
      });
      setUpdateMsg("");
      fetchCase();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : "Failed to add update.");
    } finally {
      setUpdatePending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-400">{error ?? "Case not found."}</p>
        <Link href="/rescue-cases" className="text-sm text-[#818cf8] hover:text-indigo-300 transition-colors">
          ← Back to Rescue Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/rescue-cases" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          ← Rescue Cases
        </Link>
        <h1 className="text-xl font-bold text-white mt-1">{caseData.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <StatusBadge variant="urgency" value={caseData.urgency} />
          <StatusBadge variant="caseStatus" value={caseData.status} />
          <StatusBadge variant="urgencySource" value={caseData.urgencySource} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {[
          { label: "Location", value: caseData.location },
          { label: "Reported by", value: caseData.reportedByEmail },
          { label: "Created", value: new Date(caseData.createdAt).toLocaleString() },
          { label: "Updated", value: new Date(caseData.updatedAt).toLocaleString() },
          ...(caseData.resolvedAt
            ? [{ label: "Resolved", value: new Date(caseData.resolvedAt).toLocaleString() }]
            : []),
          ...(caseData.description
            ? [{ label: "Description", value: caseData.description }]
            : []),
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-3.5 flex items-start gap-4">
            <span className="w-28 text-xs font-medium text-slate-500 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-slate-200">{value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Override Urgency</h2>
        {urgencySuccess && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            Urgency updated successfully.
          </p>
        )}
        {urgencyError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {urgencyError}
          </p>
        )}
        <form onSubmit={handleUrgencyOverride} className="space-y-3">
          <select
            value={urgencyOverride}
            onChange={(e) => setUrgencyOverride(Number(e.target.value) as Urgency | "")}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all"
            required
          >
            <option value="">Select new urgency…</option>
            <option value="0">Low</option>
            <option value="1">Moderate</option>
            <option value="2">Critical</option>
          </select>
          <input
            type="text"
            value={urgencyReason}
            onChange={(e) => setUrgencyReason(e.target.value)}
            placeholder="Reason for override"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all placeholder:text-slate-600"
            required
          />
          <button
            type="submit"
            disabled={urgencyPending || urgencyOverride === "" || !urgencyReason.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5b50e6] hover:bg-[#4d42df] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {urgencyPending ? "Saving…" : "Apply Override"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Add Case Update</h2>
        {updateError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {updateError}
          </p>
        )}
        <form onSubmit={handleAddUpdate} className="space-y-3">
          <select
            value={updateType}
            onChange={(e) => setUpdateType(Number(e.target.value) as UpdateType)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all"
          >
            {Object.entries(UPDATE_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <textarea
            value={updateMsg}
            onChange={(e) => setUpdateMsg(e.target.value)}
            rows={3}
            placeholder="Write update message…"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all resize-none placeholder:text-slate-600"
            required
          />
          <button
            type="submit"
            disabled={updatePending || !updateMsg.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5b50e6] hover:bg-[#4d42df] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {updatePending ? "Posting…" : "Post Update"}
          </button>
        </form>
      </div>

      {(caseData.updates ?? []).length > 0 && (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-sm font-semibold text-white">
              Update Timeline ({(caseData.updates ?? []).length})
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {[...(caseData.updates ?? [])].reverse().map((u) => (
              <div key={u.id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="updateType" value={u.updateType} />
                    <span className="text-xs text-slate-500">{u.createdByEmail}</span>
                  </div>
                  <p className="text-sm text-slate-200">{u.message}</p>
                </div>
                <span className="text-xs text-slate-600 shrink-0">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={resolveDialog}
        title="Mark case as resolved?"
        description="This will update the case status to Resolved and close it."
        confirmLabel="Mark Resolved"
        onConfirm={async () => {
          setResolveDialog(false);
        }}
        onCancel={() => setResolveDialog(false)}
      />
    </div>
  );
}
