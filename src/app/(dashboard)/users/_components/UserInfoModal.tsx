"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import type { AdminUserDetailResponse } from "@/lib/types";
import { Check, Trash2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserInfoModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: () => void;
  onUserSuspended: () => void;
}

export function UserInfoModal({
  userId,
  isOpen,
  onClose,
  onUserDeleted,
  onUserSuspended,
}: UserInfoModalProps) {
  const [user, setUser] = useState<AdminUserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"info" | "deleteConfirm" | "deleteSuccess">("info");

  // Deletion checkboxes state
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    setIsLoading(true);
    setStep("info");
    setCheck1(false);
    setCheck2(false);
    setCheck3(false);

    apiClient
      .get<AdminUserDetailResponse>(`/api/v1/admin/users/${userId}`)
      .then((data) => {
        if (isMounted) {
          setUser(data);
          setIsLoading(false);
        }
      })
      .catch((e) => {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "Failed to load user info");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  const handleSuspendToggle = async () => {
    if (!user || !userId) return;
    try {
      if (user.isSuspended) {
        await apiClient.put(`/api/v1/admin/users/${userId}/unsuspend`);
      } else {
        await apiClient.put(`/api/v1/admin/users/${userId}/suspend`, {
          reason: "Suspended by admin via modal",
        });
      }
      onUserSuspended();
      // Optimistic update
      setUser({ ...user, isSuspended: !user.isSuspended });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !userId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/admin/users/${userId}`);
      setStep("deleteSuccess");
      onUserDeleted();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const parseDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const formatted = dateStr.includes("T")
        ? dateStr
        : dateStr.replace(" ", "T").replace(" +", "+");
      const d = new Date(formatted);
      return isNaN(d.getTime()) ? "—" : d.toLocaleString();
    } catch {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "—" : d.toLocaleString();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-zinc-900/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          {step === "info" && (
            <motion.div
              key="info"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-7 flex flex-col h-full"
            >
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white tracking-tight">User Information</h2>
                <p className="text-sm text-zinc-400 mt-1">Details and administrative actions.</p>
              </div>

              <div className="flex-1 overflow-y-auto mb-6 pr-1 space-y-1">
                {isLoading ? (
                  <div className="space-y-3.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-11 rounded-xl bg-white/[0.04] animate-pulse" />
                    ))}
                  </div>
                ) : error || !user ? (
                  <div className="py-8 text-center text-rose-400">{error ?? "User not found"}</div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                      <span className="text-xs font-medium text-zinc-400">ID</span>
                      <span className="text-xs text-zinc-300 font-mono select-all truncate max-w-[240px]">
                        {user.id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                      <span className="text-xs font-medium text-zinc-400">Email</span>
                      <span className="text-xs font-medium text-indigo-400 select-all">{user.email}</span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                      <span className="text-xs font-medium text-zinc-400">Roles</span>
                      <span className="text-xs text-zinc-200 font-medium">
                        {(user.roles ?? []).join(", ") || "—"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                      <span className="text-xs font-medium text-zinc-400">Reputation</span>
                      <span className="text-xs tabular-nums font-semibold text-zinc-200">
                        {user.reputationPoints ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                      <span className="text-xs font-medium text-zinc-400">Verified</span>
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          <Check className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/40">
                          Unverified
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                      <span className="text-xs font-medium text-zinc-400">Status</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                          user.isSuspended
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/25"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        }`}
                      >
                        {user.isSuspended ? "Suspended" : "Active"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-xs font-medium text-zinc-400">Joined</span>
                      <span className="text-xs text-zinc-300 font-medium">{parseDate(user.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3.5 pt-4 border-t border-white/10 mt-auto">
                <button
                  onClick={handleSuspendToggle}
                  disabled={isLoading || !user}
                  className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    user?.isSuspended
                      ? "bg-transparent text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                      : "bg-transparent text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
                  }`}
                >
                  {user?.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
                <button
                  onClick={() => setStep("deleteConfirm")}
                  disabled={isLoading || !user}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold bg-transparent text-rose-400 border border-rose-500/40 hover:bg-rose-500/10 transition-all"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          )}

          {step === "deleteConfirm" && (
            <motion.div
              key="deleteConfirm"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6 flex flex-col h-full"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 rounded-full text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Permanently Delete User</h2>
                  <p className="text-sm text-zinc-400">This action cannot be undone.</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={check1}
                      onChange={(e) => setCheck1(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border border-zinc-600 rounded bg-zinc-900/50 checked:bg-rose-500 checked:border-rose-500 transition-colors cursor-pointer"
                    />
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors select-none">
                    I understand that all user data, including profile and listings, will be permanently removed.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={check2}
                      onChange={(e) => setCheck2(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border border-zinc-600 rounded bg-zinc-900/50 checked:bg-rose-500 checked:border-rose-500 transition-colors cursor-pointer"
                    />
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors select-none">
                    Any active rescue cases associated with this user will be unassigned.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={check3}
                      onChange={(e) => setCheck3(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border border-zinc-600 rounded bg-zinc-900/50 checked:bg-rose-500 checked:border-rose-500 transition-colors cursor-pointer"
                    />
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors select-none">
                    I confirm I have the authorization to perform this deletion.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08] mt-auto">
                <button
                  onClick={() => setStep("info")}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={!check1 || !check2 || !check3 || isDeleting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "deleteSuccess" && (
            <motion.div
              key="deleteSuccess"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="p-8 flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">User Deleted</h2>
              <p className="text-sm text-zinc-400 mb-8">
                The user account and associated data have been permanently removed from the system.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
