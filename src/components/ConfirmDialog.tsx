"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Enter a reason…",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !isPending && (!requireReason || reason.trim().length > 0);

  const handleConfirm = async () => {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(requireReason ? reason.trim() : undefined);
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    if (isPending) return;
    setReason("");
    setError(null);
    onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 440, damping: 28 }}
            className="relative w-full max-w-md rounded-2xl bg-[#131627] border border-white/10 shadow-2xl shadow-black/90 overflow-hidden z-10"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                {destructive && (
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-white">{title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">{description}</p>
                </div>
              </div>

              {requireReason && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-0.5">
                    {reasonLabel}
                    <span className="text-rose-400 ml-0.5">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder={reasonPlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all resize-none placeholder:text-slate-600"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 pb-5">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canSubmit}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  destructive
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-[#5b50e6] hover:bg-[#4d42df] text-white shadow-lg shadow-[#5b50e6]/30 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isPending ? "Processing…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
