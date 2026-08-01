"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUDIT_LOGS = [
  {
    id: "log-1",
    action: "Approved KYC Verification",
    target: "User #4092 (Saman Fernando)",
    timestamp: "12 minutes ago",
    status: "success",
  },
  {
    id: "log-2",
    action: "Updated Rescue Case Status",
    target: "Case #RC-8041 -> In Transport",
    timestamp: "1 hour ago",
    status: "info",
  },
  {
    id: "log-3",
    action: "Resolved Moderation Report",
    target: "Listing #L-902 (Flagged Description)",
    timestamp: "3 hours ago",
    status: "success",
  },
  {
    id: "log-4",
    action: "System Admin Session Initiated",
    target: "IP 192.168.1.100 (Cloudflare Zero Trust)",
    timestamp: "Today at 08:30 AM",
    status: "system",
  },
];

export function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative w-full max-w-lg rounded-2xl bg-[#131627] border border-white/10 shadow-2xl shadow-black/90 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Administrative Audit Log</h3>
                  <p className="text-xs text-slate-400">Recent security and action audit trail</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {AUDIT_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">{log.action}</p>
                    <p className="text-xs text-slate-400 font-mono">{log.target}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0 font-medium">{log.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Close Log
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
