"use client";

import { useState } from "react";
import { Search, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Payment {
  id: string;
  customer: string;
  email: string;
  amount: string;
  status: "Success" | "Pending" | "Failed";
  date: string;
}

const PAYMENTS: Payment[] = [
  { id: "1", customer: "Olivia Martin", email: "olivia.martin@email.com", amount: "$1,999.00", status: "Success", date: "Jul 02, 2026" },
  { id: "2", customer: "Jackson Lee", email: "jackson.lee@email.com", amount: "$39.00", status: "Success", date: "Jul 01, 2026" },
  { id: "3", customer: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "$299.00", status: "Pending", date: "Jun 30, 2026" },
  { id: "4", customer: "William Kim", email: "will@email.com", amount: "$99.00", status: "Success", date: "Jun 28, 2026" },
  { id: "5", customer: "Sofia Davis", email: "sofia.davis@email.com", amount: "$450.00", status: "Failed", date: "Jun 25, 2026" },
];

export function LatestPaymentsTable() {
  const [filter, setFilter] = useState("");

  const filtered = PAYMENTS.filter(
    (p) =>
      p.customer.toLowerCase().includes(filter.toLowerCase()) ||
      p.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Latest Payments</h3>
          <p className="text-xs text-zinc-400 mt-0.5">See recent payments from your customers here.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter payments..."
            className="h-8 pl-8 text-xs bg-zinc-900/90 border-zinc-800 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-[#121215] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 cursor-pointer" />
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 cursor-pointer" />
                </TableCell>
                <TableCell className="font-semibold text-white">{p.customer}</TableCell>
                <TableCell className="text-zinc-400 font-mono text-xs">{p.email}</TableCell>
                <TableCell className="font-semibold text-zinc-100">{p.amount}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      p.status === "Success"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : p.status === "Pending"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-md hover:bg-zinc-800 inline-flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-[#121215] border-zinc-800 text-xs">
                      <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800">View Details</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800">Download Receipt</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-rose-400 hover:bg-rose-500/10">Refund</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
        <span>0 of 5 row(s) selected.</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="h-8 text-xs border-zinc-800 bg-zinc-900/60">
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800">
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
