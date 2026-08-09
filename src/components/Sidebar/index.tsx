"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NavItem } from "./NavItem";
import {
  LayoutDashboard,
  Users,
  Heart,
  FileText,
  BadgeCheck,
  Shield,
  Truck,
  DollarSign,
} from "lucide-react";

const DASHBOARD_ITEMS = [
  { href: "/", label: "Overview Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
];

const MANAGEMENT_ITEMS = [
  { href: "/users", label: "User Management", icon: <Users className="w-4 h-4" /> },
  { href: "/rescue-cases", label: "Rescue Cases", icon: <Heart className="w-4 h-4" />, badge: "Live", badgeVariant: "green" as const },
  { href: "/listings", label: "Pet Listings", icon: <FileText className="w-4 h-4" /> },
  { href: "/kyc", label: "KYC Review Queue", icon: <BadgeCheck className="w-4 h-4" />, badge: "Review", badgeVariant: "amber" as const },
];

const OPERATIONS_ITEMS = [
  { href: "/moderation", label: "Moderation Log", icon: <Shield className="w-4 h-4" /> },
  { href: "/transports", label: "Transport Tasks", icon: <Truck className="w-4 h-4" /> },
  { href: "/pledges", label: "Pledges & Funders", icon: <DollarSign className="w-4 h-4" /> },
];


export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col apple-glass-sidebar z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.07] flex-shrink-0">
        <motion.div whileTap={{ scale: 0.96 }} transition={{ type: "spring", bounce: 0, duration: 0.2 }}>
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <Image
              src="/images/branding/logo.svg"
              alt="HappyPaws Admin"
              width={120}
              height={28}
              className="h-9 w-auto filter drop-shadow-sm transition-opacity group-hover:opacity-90"
              priority
            />
          </Link>
        </motion.div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Dashboards Section */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none apple-caption">
            Dashboards
          </p>
          <div className="space-y-1">
            {DASHBOARD_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* Management Section */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none apple-caption">
            Management
          </p>
          <div className="space-y-1">
            {MANAGEMENT_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* Operations Section */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none apple-caption">
            Operations & Audit
          </p>
          <div className="space-y-1">
            {OPERATIONS_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Version Info */}
      <div className="px-4 py-3 border-t border-white/[0.07] flex-shrink-0 bg-black/20">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium select-none">
          <span className="apple-body text-zinc-400">HappyPaws Admin</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-900/80 border border-white/[0.08] text-zinc-400">
            v0.1.0
          </span>
        </div>
      </div>
    </aside>
  );
}

