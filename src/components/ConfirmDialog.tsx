"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl shadow-black/90 overflow-hidden z-10"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                {destructive && (
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">{description}</p>
                </div>
              </div>

              {requireReason && (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-0.5">
                    {reasonLabel}
                    <span className="text-rose-400 ml-0.5">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder={reasonPlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none placeholder:text-zinc-600"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-rose-400 bg-rose-500/15 border border-rose-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canSubmit}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  destructive
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-900/40"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/40"
                }`}
              >
                {isPending ? "Processing…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
