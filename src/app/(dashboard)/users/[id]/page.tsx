"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api";
import type { AdminUserDetailResponse } from "@/lib/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuthContext } from "@/components/AuthProvider";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user: currentUser } = useAuthContext();

  const [user, setUser] = useState<AdminUserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [repDelta, setRepDelta] = useState("");
  const [repReason, setRepReason] = useState("");
  const [repError, setRepError] = useState<string | null>(null);
  const [repSuccess, setRepSuccess] = useState(false);
  const [repPending, setRepPending] = useState(false);

  const [suspendDialog, setSuspendDialog] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<AdminUserDetailResponse>(
        `/api/v1/admin/users/${id}`,
      );
      setUser(result);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 404
          ? "User not found."
          : e instanceof Error
            ? e.message
            : "Failed to load user.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReputation = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepError(null);
    const pointsToAdjust = parseInt(repDelta, 10);
    if (isNaN(pointsToAdjust)) {
      setRepError("Points must be a valid integer.");
      return;
    }
    setRepPending(true);
    try {
      await apiClient.put(`/api/v1/admin/reputation/${id}`, {
        pointsToAdjust,
        reason: repReason.trim(),
      });
      setRepSuccess(true);
      setRepDelta("");
      setRepReason("");
      fetchUser();
      setTimeout(() => setRepSuccess(false), 3000);
    } catch (e) {
      setRepError(e instanceof Error ? e.message : "Failed to adjust reputation.");
    } finally {
      setRepPending(false);
    }
  };

  const isSelf = !!(
    currentUser &&
    user &&
    (currentUser.id === user.id ||
      currentUser.email.toLowerCase() === user.email.toLowerCase())
  );

  const handleSuspendToggle = async (reason: string | undefined) => {
    if (!user || isSelf) return;
    if (user.isSuspended) {
      await apiClient.put(`/api/v1/admin/users/${id}/unsuspend`);
    } else {
      await apiClient.put(`/api/v1/admin/users/${id}/suspend`, {
        reason: reason ?? "",
      });
    }
    setSuspendDialog(false);
    fetchUser();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-400">{error ?? "User not found."}</p>
        <Link href="/users" className="text-sm text-[#818cf8] hover:text-indigo-300 transition-colors">
          ← Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/users" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Users
          </Link>
          <h1 className="text-xl font-bold text-white mt-1">{user.email}</h1>
        </div>
        {!isSelf && (
          <button
            onClick={() => setSuspendDialog(true)}
            className={`text-xs px-4 py-2 rounded-xl font-semibold transition-colors ${
              user.isSuspended
                ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                : "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
            }`}
          >
            {user.isSuspended ? "Unsuspend User" : "Suspend User"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {[
          { label: "User ID", value: user.id },
          { label: "Email", value: user.email },
          { label: "Roles", value: (user.roles ?? []).join(", ") || "—" },
          { label: "Reputation Points", value: String(user.reputationPoints ?? 0) },
          { label: "Verified", value: user.isVerified ? "Yes" : "No" },
          { label: "Status", value: user.isSuspended ? "Suspended" : "Active" },
          { label: "Joined", value: new Date(user.createdAt).toLocaleString() },
          ...(user.fullName ? [{ label: "Full Name", value: user.fullName }] : []),
          ...(user.location ? [{ label: "Location", value: user.location }] : []),
          ...(user.bio ? [{ label: "Bio", value: user.bio }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-3.5 flex items-start gap-4">
            <span className="w-36 text-xs font-medium text-slate-500 shrink-0 pt-0.5">
              {label}
            </span>
            <span className="text-sm text-slate-200 break-all">{value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Adjust Reputation</h2>

        {repSuccess && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            Reputation adjusted successfully.
          </p>
        )}
        {repError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {repError}
          </p>
        )}

        <form onSubmit={handleReputation} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">
              Points to adjust (positive or negative integer)
            </label>
            <input
              type="number"
              step="1"
              value={repDelta}
              onChange={(e) => setRepDelta(e.target.value)}
              placeholder="e.g. 10 or -5"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all placeholder:text-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">Reason</label>
            <input
              type="text"
              value={repReason}
              onChange={(e) => setRepReason(e.target.value)}
              placeholder="Reason for adjustment"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all placeholder:text-slate-600"
              required
            />
          </div>
          <button
            type="submit"
            disabled={repPending || !repDelta || !repReason.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5b50e6] hover:bg-[#4d42df] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {repPending ? "Saving…" : "Apply Adjustment"}
          </button>
        </form>
      </div>

      <ConfirmDialog
        isOpen={suspendDialog}
        title={user.isSuspended ? `Unsuspend ${user.email}?` : `Suspend ${user.email}?`}
        description={
          user.isSuspended
            ? "The user will regain full platform access."
            : "The user will lose access to the platform immediately."
        }
        destructive={!user.isSuspended}
        confirmLabel={user.isSuspended ? "Unsuspend" : "Suspend"}
        requireReason={!user.isSuspended}
        reasonLabel="Reason for suspension"
        onConfirm={handleSuspendToggle}
        onCancel={() => setSuspendDialog(false)}
      />
    </div>
  );
}
