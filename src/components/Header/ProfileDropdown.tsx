"use client";

import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDisplayNameFromEmail(email?: string): string {
  if (!email) return "System Administrator";
  const namePart = email.split("@")[0];
  if (namePart.toLowerCase() === "admin") return "System Administrator";
  return namePart
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName = getDisplayNameFromEmail(user?.email);
  const userEmail = user?.email || "admin@happypaws.lk";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative rounded-full focus-visible:outline-none ring-offset-background transition-transform active:scale-95 flex items-center justify-center"
          aria-label="User profile menu"
        >
          <Avatar className="h-8 w-8 cursor-pointer border border-zinc-700">
            <AvatarFallback className="text-[11px] font-bold bg-zinc-800 text-zinc-100">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#09090b]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-1.5 bg-[#121215] border-zinc-800 text-zinc-100 shadow-2xl rounded-xl">
        {/* User Info Header */}
        <div className="px-3 py-2.5 flex items-center gap-3 border-b border-zinc-800/80 mb-1">
          <Avatar className="h-9 w-9 border border-zinc-700">
            <AvatarFallback className="text-xs font-bold bg-zinc-800 text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
            <p className="text-[11px] text-zinc-400 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-0.5">
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="gap-2.5 px-3 py-2 cursor-pointer text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="flex-1">Account Settings</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 bg-zinc-800" />

        {/* Log out item */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2.5 px-3 py-2 cursor-pointer text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="flex-1">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
