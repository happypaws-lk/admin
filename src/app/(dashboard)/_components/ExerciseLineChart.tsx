"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExerciseLineChart() {
  const path1 = "M 20 80 C 80 120, 160 20, 240 70 C 320 120, 400 40, 480 60 L 560 90";
  const path2 = "M 20 110 C 90 140, 170 60, 250 100 C 330 140, 410 70, 490 80 L 560 110";

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Exercise & Rescue Activity</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Your rescue activity minutes are ahead of where you normally are.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800">
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </Button>
      </div>

      <div className="relative w-full h-44 mt-6">
        <svg viewBox="0 0 580 140" className="w-full h-full overflow-visible">
          {/* Subtle grid lines */}
          <line x1="0" y1="30" x2="580" y2="30" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="70" x2="580" y2="70" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="110" x2="580" y2="110" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />

          {/* Secondary Line */}
          <motion.path
            d={path2}
            fill="none"
            stroke="#71717a"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Primary Line */}
          <motion.path
            d={path1}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Data points */}
          <circle cx="160" cy="20" r="4.5" fill="#09090b" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="240" cy="70" r="4.5" fill="#09090b" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="400" cy="40" r="4.5" fill="#09090b" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  );
}
