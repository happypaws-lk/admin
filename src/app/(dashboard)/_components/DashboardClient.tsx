"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, BadgeCheck, Users, ArrowRight, CheckCircle2 } from "lucide-react";
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
      <div className="flex items-center justify-center h-40 text-zinc-500 text-sm apple-body">
        Dashboard data unavailable — please refresh.
      </div>
    );
  }

  const {
    pendingKycCount,
    openRescueCasesCount,
    totalUsersCount,
  } = stats;

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-10">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white apple-display-heading">Platform overview</h1>
          <p className="text-zinc-400 mt-1 text-sm apple-body">{formatDate()}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5 shrink-0 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
          <span className="apple-caption font-semibold">System operational</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Rescue cases */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, type: "spring", bounce: 0, duration: 0.35 }}
          className="h-full"
        >
          <Link href="/rescue-cases" className="group block h-full focus:outline-none">
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              className="apple-glass-card rounded-2xl p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:border-white/[0.16]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                      <Heart className="w-4 h-4 text-zinc-300" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 truncate tracking-tight">Open rescue cases</span>
                  </div>
                  {openRescueCasesCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-0.5 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>

                {openRescueCasesCount === 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-400 apple-body">All clear</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums apple-display-heading">
                    {openRescueCasesCount.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1.5 group-hover:text-zinc-300 transition-colors apple-body">
                View active cases <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </motion.div>
          </Link>
        </motion.div>

        {/* 2. KYC queue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: "spring", bounce: 0, duration: 0.35 }}
          className="h-full"
        >
          <Link href="/kyc" className="group block h-full focus:outline-none">
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              className="apple-glass-card rounded-2xl p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:border-white/[0.16]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                      <BadgeCheck className="w-4 h-4 text-zinc-300" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 truncate tracking-tight">Awaiting KYC review</span>
                  </div>
                  {pendingKycCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                {pendingKycCount === 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-400 apple-body">Queue clear</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-zinc-100 tabular-nums apple-display-heading">
                    {pendingKycCount.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1.5 group-hover:text-zinc-300 transition-colors apple-body">
                Open review queue <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </motion.div>
          </Link>
        </motion.div>

        {/* 3. Registered users */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0, duration: 0.35 }}
          className="h-full"
        >
          <Link href="/users" className="group block h-full focus:outline-none">
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              className="apple-glass-card rounded-2xl p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:border-white/[0.16]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                      <Users className="w-4 h-4 text-zinc-300" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 truncate tracking-tight">Registered users</span>
                  </div>
                </div>

                <p className="text-3xl font-bold text-zinc-100 tabular-nums apple-display-heading">
                  {totalUsersCount.toLocaleString()}
                </p>
              </div>

              <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1.5 group-hover:text-zinc-300 transition-colors apple-body">
                Browse all users <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </motion.div>
          </Link>
        </motion.div>

        {/* 4. Active adoption listings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", bounce: 0, duration: 0.35 }}
          className="h-full"
        >
          <Link href="/community" className="group block h-full focus:outline-none">
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              className="apple-glass-card rounded-2xl p-5 h-full flex flex-col justify-between transition-colors duration-200 group-hover:border-white/[0.16]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                      <Users className="w-4 h-4 text-zinc-300" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 truncate tracking-tight">Community</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-zinc-400 apple-body">Coming soon</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1.5 group-hover:text-zinc-300 transition-colors apple-body">
                Manage community <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </motion.div>
          </Link>
        </motion.div>

      </div>

      {/* ── Charts Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0, duration: 0.35 }}
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

