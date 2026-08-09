"use client";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="h-16 apple-glass-header flex items-center justify-end px-6 shrink-0 z-30 sticky top-0">
      {/* Header Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationsDropdown />

        {/* Vertical Separator */}
        <Separator orientation="vertical" className="h-5 bg-white/[0.08]" />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}

