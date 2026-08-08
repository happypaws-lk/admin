"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: "green" | "neutral" | "amber";
}

export function NavItem({ href, label, icon, badge, badgeVariant = "neutral" }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium transition-all duration-150 select-none",
        isActive
          ? "bg-zinc-800/80 text-white shadow-sm"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={cn(
            "flex-shrink-0 transition-colors duration-150",
            isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
          )}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      {badge !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide shrink-0 transition-colors",
            badgeVariant === "green" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            badgeVariant === "amber" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
            badgeVariant === "neutral" && "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
