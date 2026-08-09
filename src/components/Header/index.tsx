"use client";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { motion } from "framer-motion";

export function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-16 apple-glass-header flex items-center justify-between px-6 shrink-0 z-30 sticky top-0">
      {/* Mobile Hamburger Menu */}
      <div className="flex items-center md:hidden">
        <motion.button
          onClick={toggleSidebar}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-md focus:outline-none transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Spacer for desktop to keep right alignment */}
      <div className="hidden md:block" />

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

