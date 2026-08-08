"use client";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-end px-6 bg-[#09090b]/90 backdrop-blur-md shrink-0 z-30">
      {/* Header Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationsDropdown />

        {/* Vertical Separator */}
        <Separator orientation="vertical" className="h-5 bg-zinc-800" />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
