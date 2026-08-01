"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import { ActivityLogModal } from "./ActivityLogModal";

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Custom display name state
  const defaultDisplayName = user?.email
    ? user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Admin User";

  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button (Avatar Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#5b50e6] focus:ring-offset-2 focus:ring-offset-[#0d0f17] group transition-all duration-200"
        aria-label="User profile menu"
      >
        <div className="relative">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#5b50e6] via-[#6366f1] to-[#818cf8] text-white flex items-center justify-center font-bold text-xs shadow-md border ${
            isOpen ? "border-white ring-2 ring-[#5b50e6]/50 scale-105" : "border-white/20 group-hover:border-white/40 group-hover:scale-105"
          } transition-all duration-200`}>
            {getInitials(displayName)}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d0f17]" />
        </div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#131627]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/90 z-50 overflow-hidden"
          >
            {/* Top Profile Card */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="flex items-center gap-3.5">
                {/* Left Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5b50e6] via-[#6366f1] to-[#a855f7] text-white flex items-center justify-center font-bold text-base shadow-lg shadow-[#5b50e6]/30 border border-white/20">
                    {getInitials(displayName)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#131627]" />
                </div>

                {/* Right Name Above, Email Below */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#5b50e6]/20 text-[#a5b4fc] text-[10px] font-bold border border-[#5b50e6]/40 uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user?.email || "admin@happypaws.lk"}</p>
                </div>
              </div>
            </div>

            {/* Menu Buttons Section */}
            <div className="p-2 space-y-1">
              {/* Profile / Settings Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-3 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white">Profile Settings</p>
                  <p className="text-[11px] text-slate-400">Edit preferences and personal info</p>
                </div>
              </button>

              {/* Audit / Activity Log Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsActivityOpen(true);
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-3 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white">Audit Activity Log</p>
                  <p className="text-[11px] text-slate-400">View recent administrative actions</p>
                </div>
              </button>

              {/* Security & Zero Trust Status */}
              <div className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 flex items-center justify-between bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Cloudflare Zero Trust</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">ACTIVE</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 my-1" />

            {/* Sign Out Button */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-3 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        profileName={displayName}
        onSaveName={setDisplayName}
      />

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />
    </div>
  );
}
