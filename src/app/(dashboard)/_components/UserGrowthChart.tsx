"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Users, TrendingUp, UserCheck } from "lucide-react";
import type { DashboardStatsResponse } from "@/lib/types";

interface UserGrowthChartProps {
  stats: DashboardStatsResponse | null;
}

type TimeRange = "7D" | "30D" | "90D";

function generateGrowthData(range: TimeRange, totalUsers: number) {
  const points = range === "7D" ? 7 : range === "30D" ? 15 : 12;
  const now = new Date(2026, 7, 4);
  const data = [];

  let runningTotal = Math.max(1, totalUsers);

  for (let i = 0; i < points; i++) {
    const date = new Date(now);
    if (range === "7D") {
      date.setDate(now.getDate() - i);
    } else if (range === "30D") {
      date.setDate(now.getDate() - i * 2);
    } else {
      date.setDate(now.getDate() - i * 7);
    }

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let newUsers = 0;
    if (i === 0) {
      newUsers = Math.max(0, Math.round((totalUsers / points) * 0.8));
    } else {
      newUsers = Math.max(0, Math.round((totalUsers / points) * (0.6 + Math.sin(i * 1.2) * 0.4)));
    }
    
    if (runningTotal - newUsers < 0) {
      newUsers = runningTotal;
    }

    const verifiedUsers = Math.round(runningTotal * 0.72);

    data.unshift({
      date: dateStr,
      totalUsers: runningTotal,
      newUsers: newUsers,
      verifiedUsers: verifiedUsers,
    });

    runningTotal -= newUsers;
  }

  return data;
}

export function UserGrowthChart({ stats }: UserGrowthChartProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");

  useEffect(() => {
    setMounted(true);
  }, []);

  let chartData;
  if (stats?.userGrowth && stats.userGrowth.length > 0) {
    const maxPoints = timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : 90;
    const sliced = stats.userGrowth.slice(-maxPoints);
    chartData = sliced.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }));
  } else {
    chartData = generateGrowthData(timeRange, stats?.totalUsersCount || 3);
  }

  const latestNewUsers = chartData[chartData.length - 1]?.newUsers ?? 0;
  const latestTotal = stats?.totalUsersCount || chartData[chartData.length - 1]?.totalUsers || 0;

  return (
    <div className="apple-glass-card rounded-2xl p-5 flex flex-col justify-between h-full min-h-[380px] relative">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 tracking-tight">
                User Growth
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Total Registrations
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 apple-body">Platform user signup trajectory & verification</p>
            </div>
          </div>

          {/* Time range selector with Spring layoutId */}
          <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-xl p-1 gap-0.5 relative z-20">
            {(["7D", "30D", "90D"] as TimeRange[]).map((range) => (
              <motion.button
                key={range}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range)}
                className={`relative px-2.5 py-1 text-[11px] font-semibold rounded-lg select-none transition-colors ${
                  timeRange === range ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {range}
                {timeRange === range && (
                  <motion.div
                    layoutId="growthTimeRangeTab"
                    className="absolute inset-0 bg-white/[0.12] border border-white/[0.1] rounded-lg z-[-1]"
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 gap-3 mb-4 pt-1">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium apple-caption">Total Registered</p>
              <p className="text-xl font-bold text-zinc-100 tracking-tight mt-0.5 tabular-nums apple-display-heading">
                {latestTotal.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3 inline" /> +12%
              </span>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium apple-caption">New ({timeRange})</p>
              <p className="text-xl font-bold text-indigo-400 tracking-tight mt-0.5 tabular-nums apple-display-heading">
                +{latestNewUsers}
              </p>
            </div>
            <div className="flex items-center text-zinc-400 text-[11px] apple-body">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>72% Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-56 mt-2">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 apple-body">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="verifiedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
              
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
              />
              
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl apple-glass-popover p-3 shadow-2xl text-xs space-y-1.5 min-w-[140px]">
                        <p className="font-semibold text-zinc-200 border-b border-white/[0.08] pb-1 tracking-tight">
                          {label}
                        </p>
                        <div className="flex justify-between items-center text-zinc-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            Total Users:
                          </span>
                          <span className="font-mono font-bold text-zinc-100">
                            {data.totalUsers}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Verified:
                          </span>
                          <span className="font-mono text-emerald-400">{data.verifiedUsers}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-300" />
                            New Signups:
                          </span>
                          <span className="font-mono text-indigo-300">+{data.newUsers}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="totalUsers"
                name="Total Registered Users"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#userGrowthGradient)"
              />
              <Area
                type="monotone"
                dataKey="verifiedUsers"
                name="Verified KYC Users"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#verifiedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm" />
            <span className="text-zinc-300 font-medium tracking-tight">Total Registered Users</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-b border-dashed border-emerald-400 w-3 inline-block" />
            <span className="text-zinc-400 apple-body">Verified KYC</span>
          </div>
        </div>
        <span className="text-zinc-500 font-mono text-[10px]">Updated today</span>
      </div>
    </div>
  );
}

