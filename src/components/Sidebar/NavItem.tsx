"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: "green" | "neutral" | "amber";
}

const MotionLink = motion.create(Link);

export function NavItem({ href, label, icon, badge, badgeVariant = "neutral" }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <MotionLink
      href={href}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
      className={cn(
        "group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium select-none transition-colors duration-150",
        isActive
          ? "text-white"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
      )}
    >
      {/* Dynamic Animated Active Highlight Pill */}
      {isActive && (
        <motion.div
          layoutId="activeSidebarPill"
          className="absolute inset-0 bg-white/[0.08] border border-white/[0.1] rounded-xl shadow-sm z-0"
          transition={{
            type: "spring",
            bounce: 0,
            duration: 0.35,
          }}
        />
      )}

      <div className="relative z-10 flex items-center gap-2.5 min-w-0">
        <span
          className={cn(
            "flex-shrink-0 transition-colors duration-150",
            isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
          )}
        >
          {icon}
        </span>
        <span className="truncate font-medium tracking-tight">{label}</span>
      </div>

      {badge !== undefined && (
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0 transition-colors",
            badgeVariant === "green" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
            badgeVariant === "amber" && "bg-amber-500/15 text-amber-400 border border-amber-500/30",
            badgeVariant === "neutral" && "bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
          )}
        >
          {badge}
        </span>
      )}
    </MotionLink>
  );
}

