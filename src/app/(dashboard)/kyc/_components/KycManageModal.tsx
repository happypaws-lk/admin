"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Copy,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import type { KycPendingResponse } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { ImageViewer } from "./ImageViewer";

interface KycManageModalProps {
  submission: KycPendingResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
}

type KycModalStep = "view" | "approveConfirm" | "rejectReason" | "success";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");

const slideProps = (dir: 1 | -1) => ({
  initial: { x: dir * 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: dir * -40, opacity: 0 },
  transition: { type: "spring" as const, stiffness: 400, damping: 30 },
});

export function KycManageModal({
  submission,
  isOpen,
  onClose,
  onActionComplete,
}: KycManageModalProps) {
  const [step, setStep] = useState<KycModalStep>("view");
  const [rejectReason, setRejectReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successAction, setSuccessAction] = useState<"approved" | "rejected" | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    if (isOpen) {
      setStep("view");
      setRejectReason("");
      setReasonError(false);
      setApiError(null);
      setSuccessAction(null);
      setDir(1);
    }
  }, [isOpen]);

  const goForward = (to: KycModalStep) => {
    setDir(1);
    setStep(to);
  };

  const goBack = (to: KycModalStep) => {
    setDir(-1);
    setStep(to);
  };

  const handleApprove = async () => {
    if (!submission) return;
    setIsActioning(true);
    setApiError(null);
    try {
      await apiClient.post(`/api/v1/admin/kyc/${submission.id}/approve`);
      onActionComplete();
      setSuccessAction("approved");
      setDir(1);
      setStep("success");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed to approve submission.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleReject = async () => {
    if (!submission) return;
    if (!rejectReason.trim()) {
      setReasonError(true);
      return;
    }
    setIsActioning(true);
    setApiError(null);
    try {
      await apiClient.post(`/api/v1/admin/kyc/${submission.id}/reject`, {
        reason: rejectReason.trim(),
      });
      onActionComplete();
      setSuccessAction("rejected");
      setDir(1);
      setStep("success");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed to reject submission.");
    } finally {
      setIsActioning(false);
    }
  };

  const copyId = () => {
    if (!submission) return;
    navigator.clipboard.writeText(submission.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-zinc-900/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          {/* ── view ──────────────────────────────────────────────────────── */}
          {step === "view" && submission && (
            <motion.div key="view" {...slideProps(dir)} className="flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/[0.07]">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm shrink-0">
                  {getInitials(submission.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{submission.userName}</p>
                  <p className="text-xs text-zinc-400 truncate">{submission.userEmail}</p>
                </div>
                <StatusBadge variant="documentType" value={submission.documentType} />
              </div>

              {/* Image viewer */}
              <div className="px-4 py-4">
                <ImageViewer src={submission.documentUrl} alt="KYC document" />
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 px-6 py-3 border-t border-white/[0.07] bg-white/[0.015]">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xs text-zinc-500 shrink-0">ID</span>
                  <span className="text-xs font-mono text-zinc-400 truncate">{submission.id}</span>
                  <button
                    onClick={copyId}
                    className="apple-press-feedback shrink-0 p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Copy ID"
                  >
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span className="text-xs text-zinc-500 shrink-0">
                  {new Date(submission.uploadedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <StatusBadge variant="documentStatus" value={0} />
              </div>

              {/* Action bar */}
              <div className="flex gap-3 px-6 py-4 border-t border-white/[0.07]">
                <button
                  onClick={() => goForward("approveConfirm")}
                  className="apple-press-feedback flex-1 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => goForward("rejectReason")}
                  className="apple-press-feedback flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25 transition-all"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          )}

          {/* ── approveConfirm ──────────────────────────────────────────── */}
          {step === "approveConfirm" && submission && (
            <motion.div key="approveConfirm" {...slideProps(dir)} className="p-6 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Approve this submission?</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    This will mark the document as verified and grant{" "}
                    <span className="text-zinc-200">{submission.userName}</span> the privileges
                    associated with their account role.
                  </p>
                </div>
              </div>

              {/* User card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-xs shrink-0">
                  {getInitials(submission.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{submission.userName}</p>
                  <p className="text-xs text-zinc-500 truncate">{submission.userEmail}</p>
                </div>
                <StatusBadge variant="documentType" value={submission.documentType} />
              </div>

              {apiError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  {apiError}
                </p>
              )}

              <div className="flex gap-3 pt-2 border-t border-white/[0.07]">
                <button
                  onClick={() => goBack("view")}
                  disabled={isActioning}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isActioning}
                  className="apple-press-feedback flex-1 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                >
                  {isActioning ? "Approving…" : "Confirm Approval"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── rejectReason ────────────────────────────────────────────── */}
          {step === "rejectReason" && submission && (
            <motion.div key="rejectReason" {...slideProps(dir)} className="p-6 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Reject this submission?</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    The user will be notified with your reason and asked to resubmit a valid
                    document.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Rejection reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    setReasonError(false);
                  }}
                  rows={3}
                  placeholder="e.g. Document is blurry or unreadable. Please resubmit a clear, well-lit photo."
                  className={cn(
                    "w-full px-3 py-2 rounded-xl bg-zinc-900 text-zinc-100 text-xs resize-none",
                    "border focus:outline-none focus:ring-1 transition-all placeholder:text-zinc-600",
                    reasonError
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30"
                      : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                  )}
                />
                {reasonError && (
                  <p className="text-xs text-rose-400 mt-1">A rejection reason is required.</p>
                )}
              </div>

              {apiError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  {apiError}
                </p>
              )}

              <div className="flex gap-3 pt-2 border-t border-white/[0.07]">
                <button
                  onClick={() => goBack("view")}
                  disabled={isActioning}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isActioning}
                  className="apple-press-feedback flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25 transition-all disabled:opacity-50"
                >
                  {isActioning ? "Rejecting…" : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── success ─────────────────────────────────────────────────── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="p-10 flex flex-col items-center text-center gap-4"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  successAction === "approved"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                )}
              >
                {successAction === "approved" ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {successAction === "approved" ? "Document Approved" : "Submission Rejected"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {successAction === "approved"
                    ? "The user has been verified and notified."
                    : "The user has been notified and will be asked to resubmit."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 w-full max-w-xs py-2.5 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-colors"
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
