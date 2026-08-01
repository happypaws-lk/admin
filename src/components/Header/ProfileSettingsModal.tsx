"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MeResponse } from "@/lib/types";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: MeResponse | null;
  profileName: string;
  onSaveName: (newName: string) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  profileName,
  onSaveName,
}: ProfileSettingsModalProps) {
  const [nameInput, setNameInput] = useState(profileName);
  const [accentColor, setAccentColor] = useState("violet");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveName(nameInput.trim() || "Admin User");
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
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
                <div className="w-10 h-10 rounded-xl bg-[#5b50e6]/20 border border-[#5b50e6]/30 text-[#818cf8] flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Profile & Preferences</h3>
                  <p className="text-xs text-slate-400">Manage your administrative account settings</p>
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

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {isSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Profile preferences updated successfully!
                </motion.div>
              )}

              {/* Display Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all"
                  placeholder="e.g. System Administrator"
                />
              </div>

              {/* Email Address (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user?.email || "admin@happypaws.lk"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-slate-400 text-sm cursor-not-allowed pr-24"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Verified
                  </span>
                </div>
              </div>

              {/* Role Tag */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Assigned Administrative Role
                </label>
                <div className="flex gap-2">
                  {(user?.roles ?? ["Admin"]).map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1.5 rounded-lg bg-[#5b50e6]/20 border border-[#5b50e6]/40 text-[#a5b4fc] text-xs font-semibold"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accent Theme Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Dashboard Accent Highlight
                </label>
                <div className="flex gap-3">
                  {[
                    { id: "violet", color: "bg-[#5b50e6]" },
                    { id: "cyan", color: "bg-cyan-500" },
                    { id: "emerald", color: "bg-emerald-500" },
                    { id: "rose", color: "bg-rose-500" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAccentColor(t.id)}
                      className={`w-7 h-7 rounded-full ${t.color} flex items-center justify-center transition-transform ${
                        accentColor === t.id ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#131627]" : "hover:scale-110"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Preferences Toggles */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Email Digest & System Alerts</p>
                    <p className="text-[11px] text-slate-400">Receive critical notifications via email</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      emailAlerts ? "bg-[#5b50e6]" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        emailAlerts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Security Log Notifications</p>
                    <p className="text-[11px] text-slate-400">Notify on unusual administrative login attempts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurityAlerts(!securityAlerts)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      securityAlerts ? "bg-[#5b50e6]" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        securityAlerts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5b50e6] hover:bg-[#4d42df] text-white shadow-lg shadow-[#5b50e6]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
