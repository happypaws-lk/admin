"use client";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDropdown } from "./ProfileDropdown";

export function Header() {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0d0f17]/90 backdrop-blur-md shrink-0 z-30">
      {/* Left section: Context / Breadcrumb / Quick Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            HappyPaws Admin Console
          </span>
        </div>
      </div>

      {/* Right section: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-3">
        <NotificationsDropdown />
        <div className="w-px h-6 bg-white/10 mx-1" />
        <ProfileDropdown />
      </div>
    </header>
  );
}
