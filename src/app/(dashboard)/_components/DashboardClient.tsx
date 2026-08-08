"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, BadgeCheck, Users, ArrowRight, CheckCircle2, Tag } from "lucide-react";
import type { DashboardStatsResponse } from "@/lib/types";
import { UserGrowthChart } from "./UserGrowthChart";
import { AdoptionActivityChart } from "./AdoptionActivityChart";

function formatDate(): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

interface Props {
  stats: DashboardStatsResponse | null;
}

export function DashboardClient({ stats }: Props) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
        Dashboard data unavailable — please refresh.
      </div>
    );
  }

  const {
    pendingKycCount,
    openRescueCasesCount,
    totalUsersCount,
    activeListingsCount = 0,
  } = stats;

  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform overview</h1>
          <p className="text-slate-400 mt-1 text-sm">{formatDate()}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System operational
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Rescue cases — neutral */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, type: "spring", stiffness: 280, damping: 22 }}
          className="h-full"
        >
          <Link href="/rescue-cases" className="group block h-full">
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:bg-zinc-900/60 group-hover:border-zinc-700">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <Heart className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 truncate">Open rescue cases</span>
                  </div>
                  {openRescueCasesCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-zinc-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>

                {openRescueCasesCount === 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-400">All clear</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums tracking-tight">
                    {openRescueCasesCount.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-xs text-zinc-600 mt-4 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
                View active cases <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </Link>
        </motion.div>

        {/* 2. KYC queue — neutral */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, type: "spring", stiffness: 280, damping: 22 }}
          className="h-full"
        >
          <Link href="/kyc" className="group block h-full">
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:bg-zinc-900/60 group-hover:border-zinc-700">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <BadgeCheck className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 truncate">Awaiting KYC review</span>
                  </div>
                  {pendingKycCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5 shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                {pendingKycCount === 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-400">Queue clear</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums tracking-tight">
                    {pendingKycCount.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-xs text-zinc-600 mt-4 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
                Open review queue <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </Link>
        </motion.div>

        {/* 3. Registered users — neutral */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 280, damping: 22 }}
          className="h-full"
        >
          <Link href="/users" className="group block h-full">
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:bg-zinc-900/60 group-hover:border-zinc-700">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 truncate">Registered users</span>
                  </div>
                </div>

                <p className="text-3xl font-bold text-zinc-100 tabular-nums tracking-tight">
                  {totalUsersCount.toLocaleString()}
                </p>
              </div>

              <p className="text-xs text-zinc-600 mt-4 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
                Browse all users <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </Link>
        </motion.div>

        {/* 4. Active adoption listings — neutral */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 280, damping: 22 }}
          className="h-full"
        >
          <Link href="/listings" className="group block h-full">
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:bg-zinc-900/60 group-hover:border-zinc-700">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 truncate">Adoption listings</span>
                  </div>
                  {activeListingsCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {activeListingsCount === 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-400">No active listings</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums tracking-tight">
                    {activeListingsCount.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-xs text-zinc-600 mt-4 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
                Manage listings <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </Link>
        </motion.div>

      </div>

      {/* ── Charts Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Left: User Growth Chart */}
        <UserGrowthChart stats={stats} />

        {/* Right: Adoption Applications & Daily Adoptions (Crossed Chart) */}
        <AdoptionActivityChart stats={stats} />
      </motion.div>

    </div>
  );
}
