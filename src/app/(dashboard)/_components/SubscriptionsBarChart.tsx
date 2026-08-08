"use client";

import { motion } from "framer-motion";

interface SubscriptionsBarChartProps {
  total: number;
  percentage: string;
}

export function SubscriptionsBarChart({ total, percentage }: SubscriptionsBarChartProps) {
  const bars = [
    { value: 240, label: "Jan" },
    { value: 300, label: "Feb" },
    { value: 200, label: "Mar" },
    { value: 278, label: "Apr" },
    { value: 189, label: "May" },
    { value: 239, label: "Jun" },
    { value: 278, label: "Jul" },
    { value: 189, label: "Aug" },
  ];

  const maxVal = Math.max(...bars.map((b) => b.value));

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subscriptions</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold tracking-tight text-white">+{total.toLocaleString()}</span>
          <span className="text-xs font-semibold text-emerald-400">{percentage} from last month</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-28 mt-4 pt-2">
        {bars.map((bar, i) => {
          const heightPercent = (bar.value / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.value}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="w-full bg-zinc-100 rounded-md group-hover:bg-white group-hover:shadow-glow transition-all"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
