"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 6,
  keyExtractor,
  emptyMessage = "No results found.",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#121215] shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400",
                  col.headerClassName ?? col.className
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/60">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3.5", col.className)}>
                      <div
                        className="h-3.5 rounded-md bg-zinc-800 animate-pulse"
                        style={{ width: col.width ?? "75%" }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-14 text-center text-sm text-zinc-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((row, i) => (
                  <motion.tr
                    key={keyExtractor(row)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-4 py-3 text-zinc-200 align-middle", col.className)}
                      >
                        {col.render
                          ? col.render(row)
                          : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}
