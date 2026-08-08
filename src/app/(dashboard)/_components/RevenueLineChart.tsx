"use client";

import { motion } from "framer-motion";

interface RevenueLineChartProps {
  amount: string;
  percentage: string;
}

export function RevenueLineChart({ amount, percentage }: RevenueLineChartProps) {
  // SVG Bezier curve data points
  const points = [
    { x: 10, y: 70 },
    { x: 70, y: 50 },
    { x: 130, y: 20 },
    { x: 190, y: 35 },
    { x: 250, y: 65 },
    { x: 300, y: 15 },
  ];

  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Revenue</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold tracking-tight text-white">{amount}</span>
          <span className="text-xs font-semibold text-emerald-400">{percentage} from last month</span>
        </div>
      </div>

      <div className="relative w-full h-28 mt-4">
        <svg viewBox="0 0 310 90" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathD} L 300,90 L 10,90 Z`}
            fill="url(#revenueGlow)"
          />
          <motion.path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#09090b" stroke="#ffffff" strokeWidth="2" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
