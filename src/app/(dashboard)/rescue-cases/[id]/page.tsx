"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api";
import type {
  RescueCaseResponse,
  CaseUpdateResponse,
  Urgency,
  UpdateType,
} from "@/lib/types";
import { UPDATE_TYPE_LABELS, URGENCY_SOURCE_LABELS, URGENCY_LABELS, CASE_STATUS_LABELS } from "@/lib/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RescueCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [caseData, setCaseData] = useState<RescueCaseResponse | null>(null);
  const [updates, setUpdates] = useState<CaseUpdateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [urgencyOverride, setUrgencyOverride] = useState<Urgency | "">("");
  const [urgencyPending, setUrgencyPending] = useState(false);
  const [urgencyError, setUrgencyError] = useState<string | null>(null);
  const [urgencySuccess, setUrgencySuccess] = useState(false);

  const [updateText, setUpdateText] = useState("");
  const [updateType, setUpdateType] = useState<UpdateType>(0);
  const [updatePending, setUpdatePending] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [resolveDialog, setResolveDialog] = useState(false);
  const [resolvePending, setResolvePending] = useState(false);

  const fetchCase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [caseResult, updatesResult] = await Promise.all([
        apiClient.get<RescueCaseResponse>(`/api/v1/rescues/${id}`),
        apiClient.get<CaseUpdateResponse[]>(`/api/v1/rescues/${id}/updates`).catch(() => []),
      ]);
      setCaseData(caseResult);
      setUpdates(updatesResult ?? []);
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
      await apiClient.put(`/api/v1/rescues/${id}/urgency`, {
        urgency: urgencyOverride,
      });
      setUrgencySuccess(true);
      setUrgencyOverride("");
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
      const fd = new FormData();
      fd.append("UpdateType", String(updateType));
      fd.append("UpdateText", updateText.trim());
      await apiClient.postForm(`/api/v1/rescues/${id}/updates`, fd);
      setUpdateText("");
      fetchCase();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : "Failed to add update.");
    } finally {
      setUpdatePending(false);
    }
  };

  const handleApproveCase = async () => {
    setResolvePending(true);
    try {
      await apiClient.post(`/api/v1/admin/cases/${id}/approve`, {});
      fetchCase();
    } catch (e) {
      console.error(e);
    } finally {
      setResolvePending(false);
    }
  };

  const handleResolve = async () => {
    setResolvePending(true);
    try {
      await apiClient.post(`/api/v1/rescues/${id}/resolve`);
      setResolveDialog(false);
      fetchCase();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resolve case.");
      setResolveDialog(false);
    } finally {
      setResolvePending(false);
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

  const isResolved = caseData.status === 2;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/rescue-cases" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Rescue Cases
          </Link>
          <h1 className="text-xl font-bold text-white mt-1">{caseData.locationName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge variant="urgency" value={caseData.urgency} />
            <StatusBadge variant="caseStatus" value={caseData.status} />
            <StatusBadge variant="urgencySource" value={caseData.urgencySource} />
          </div>
        </div>

        <div className="flex gap-2">
          {caseData.status === 3 && (
            <button
              onClick={handleApproveCase}
              className="text-xs px-4 py-2 rounded-xl font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition-colors shrink-0"
            >
              {resolvePending ? "Approving..." : "Approve Case"}
            </button>
          )}

          {!isResolved && (
            <button
              onClick={() => setResolveDialog(true)}
              className="text-xs px-4 py-2 rounded-xl font-semibold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors shrink-0"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {caseData.photoUrl && (
        <div className="w-full h-48 rounded-xl overflow-hidden bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={caseData.photoUrl}
            alt="Rescue case photo"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {[
          { label: "Location", value: caseData.locationName },
          { label: "Reported by", value: caseData.reporterName },
          { label: "Description", value: caseData.description },
          ...(caseData.conditionNotes
            ? [{ label: "Condition Notes", value: caseData.conditionNotes }]
            : []),
          ...(caseData.assignedFosterName
            ? [{ label: "Assigned Foster", value: caseData.assignedFosterName }]
            : []),
          { label: "Urgency", value: URGENCY_LABELS[caseData.urgency] ?? String(caseData.urgency) },
          { label: "Status", value: CASE_STATUS_LABELS[caseData.status] ?? String(caseData.status) },
          { label: "Urgency Source", value: URGENCY_SOURCE_LABELS[caseData.urgencySource] ?? String(caseData.urgencySource) },
          { label: "Reported", value: new Date(caseData.createdAt).toLocaleString() },
          { label: "Updated", value: new Date(caseData.updatedAt).toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-3.5 flex items-start gap-4">
            <span className="w-28 text-xs font-medium text-slate-500 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-slate-200 break-words">{value}</span>
          </div>
        ))}
      </div>

      {!isResolved && (
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
            <Select
              value={urgencyOverride === "" ? "EMPTY" : String(urgencyOverride)}
              onValueChange={(val) => setUrgencyOverride(val === "EMPTY" ? "" : (Number(val) as Urgency))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new urgency…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPTY">Select new urgency…</SelectItem>
                <SelectItem value="0">Low</SelectItem>
                <SelectItem value="1">Moderate</SelectItem>
                <SelectItem value="2">Critical</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="submit"
              disabled={urgencyPending || urgencyOverride === ""}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5b50e6] hover:bg-[#4d42df] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {urgencyPending ? "Saving…" : "Apply Override"}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Add Case Update</h2>
        {updateError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {updateError}
          </p>
        )}
        <form onSubmit={handleAddUpdate} className="space-y-3">
          <Select
            value={String(updateType)}
            onValueChange={(val) => setUpdateType(Number(val) as UpdateType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UPDATE_TYPE_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <textarea
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            rows={3}
            placeholder="Write update message…"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] transition-all resize-none placeholder:text-slate-600"
            required
          />
          <button
            type="submit"
            disabled={updatePending || !updateText.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5b50e6] hover:bg-[#4d42df] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {updatePending ? "Posting…" : "Post Update"}
          </button>
        </form>
      </div>

      {updates.length > 0 && (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-sm font-semibold text-white">
              Update Timeline ({updates.length})
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {[...updates].reverse().map((u) => (
              <div key={u.id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="updateType" value={u.updateType} />
                    <span className="text-xs text-slate-500">{u.userName}</span>
                  </div>
                  <p className="text-sm text-slate-200">{u.updateText}</p>
                  {u.photoUrl && (
                    <a
                      href={u.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      View photo ↗
                    </a>
                  )}
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
        description="This will update the case status to Resolved and close it permanently."
        confirmLabel={resolvePending ? "Resolving…" : "Mark Resolved"}
        onConfirm={handleResolve}
        onCancel={() => setResolveDialog(false)}
      />
    </div>
  );
}
