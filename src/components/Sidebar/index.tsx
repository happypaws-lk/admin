"use client";

import Image from "next/image";
import Link from "next/link";
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
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col border-r border-zinc-800 bg-[#09090b]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-zinc-800 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/images/branding/logo.svg"
            alt="HappyPaws Admin"
            width={120}
            height={28}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Dashboards Section */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
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
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
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
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
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
      <div className="px-4 py-3 border-t border-zinc-800 flex-shrink-0 bg-[#09090b]">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium select-none">
          <span>HappyPaws Admin</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            v0.1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
