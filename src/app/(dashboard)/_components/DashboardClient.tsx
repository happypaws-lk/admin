"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { DashboardStatsResponse } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  index: number;
  accent?: string;
}

function StatCard({ label, value, href, index, accent = "text-white" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        href={href}
        className="block p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors group"
      >
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">{label}</p>
        <p className={`text-3xl font-bold ${accent} tabular-nums`}>{value.toLocaleString()}</p>
        <p className="text-xs text-slate-600 mt-2 group-hover:text-slate-400 transition-colors">
          View all →
        </p>
      </Link>
    </motion.div>
  );
}

interface Props {
  stats: DashboardStatsResponse | null;
}

export function DashboardClient({ stats }: Props) {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Unable to load dashboard data. Please refresh the page.
      </div>
    );
  }

  const recentLogs = stats.recentModerationLogs ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">Platform overview and recent activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index={0}
          label="Pending KYC"
          value={stats.pendingKycCount ?? 0}
          href="/kyc"
          accent="text-amber-400"
        />
        <StatCard
          index={1}
          label="Open Rescue Cases"
          value={stats.openRescueCasesCount ?? 0}
          href="/rescue-cases"
          accent="text-rose-400"
        />
        <StatCard
          index={2}
          label="Total Users"
          value={stats.totalUsersCount ?? 0}
          href="/users"
          accent="text-indigo-400"
        />
        <StatCard
          index={3}
          label="Active Listings"
          value={stats.activeListingsCount ?? 0}
          href="/listings"
          accent="text-emerald-400"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-sm font-semibold text-white">Recent Moderation Activity</h2>
        </div>

        {recentLogs.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-500 text-sm">No recent moderation activity.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">
                    <span className="text-slate-500 mr-1.5">{log.performedByEmail}</span>
                    acted on {log.targetType} #{log.targetId?.slice(0, 8) ?? ""}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{log.reason}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge variant="moderationAction" value={log.actionType} />
                  <span className="text-xs text-slate-600">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
