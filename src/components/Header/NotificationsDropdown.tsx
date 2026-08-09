"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, BadgeCheck, FileText, Info, AlertOctagon, X, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/api";
import type { NotificationResponse, PagedResult } from "@/lib/types";
import { cn } from "@/lib/utils";

function timeAgo(dateStr: string): string {
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t.includes("rescue") || t.includes("emergency") || t.includes("urgent")) {
    return (
      <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
      </div>
    );
  }
  if (t.includes("kyc") || t.includes("verif")) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <BadgeCheck className="w-3.5 h-3.5 text-primary" />
      </div>
    );
  }
  if (t.includes("listing") || t.includes("adoption") || t.includes("pet")) {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
        <FileText className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    );
  }
  if (t.includes("transport") || t.includes("rescue")) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
        <Heart className="w-3.5 h-3.5 text-amber-400" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
      <Info className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<PagedResult<NotificationResponse>>(
        "/api/v1/notification",
        { page: 1, pageSize: 15 }
      );
      setNotifications(data.items);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await apiClient.put(`/api/v1/notification/${id}/read`);
    } catch {
      // Revert on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiClient.put("/api/v1/notification/read-all");
    } catch {
      fetchNotifications();
    }
  };

  const dismiss = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filtered = activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) fetchNotifications(); }}>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          className="relative w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring select-none"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden apple-glass-popover rounded-2xl shadow-2xl" sideOffset={8}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/25">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="text-[11px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Tabs with Animated Sliding Pill */}
        <div className="flex px-4 gap-2 border-b border-white/[0.08] relative">
          {(["all", "unread"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative py-2.5 px-2 text-xs font-medium transition-colors capitalize select-none",
                activeTab === tab ? "text-zinc-100 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {tab} ({tab === "all" ? notifications.length : unreadCount})
              {activeTab === tab && (
                <motion.div
                  layoutId="activeNotifTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100 rounded-full"
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <ScrollArea className="max-h-72">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-40" />
              <p className="text-xs text-zinc-400">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] overflow-hidden">
              <AnimatePresence initial={false}>
                {filtered.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, x: -100 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                    drag="x"
                    dragConstraints={{ left: -120, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(_, info) => {
                      // Velocity handoff or offset threshold swipe-to-dismiss
                      if (info.offset.x < -60 || info.velocity.x < -300) {
                        dismiss(n.id);
                      }
                    }}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    className={cn(
                      "flex gap-3 p-3.5 group relative transition-colors touch-pan-y select-none",
                      !n.isRead ? "bg-white/[0.04] cursor-pointer" : "cursor-default hover:bg-white/[0.02]"
                    )}
                  >
                    <NotifIcon type={n.type} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span className={cn(
                          "text-xs font-semibold truncate tracking-tight",
                          !n.isRead ? "text-zinc-100" : "text-zinc-400"
                        )}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed apple-body">
                        {n.body}
                      </p>
                    </div>

                    {!n.isRead && (
                      <span className="absolute right-3 top-3.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm" />
                    )}

                    <button
                      onClick={(e) => dismiss(n.id, e)}
                      className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-all"
                      aria-label="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

