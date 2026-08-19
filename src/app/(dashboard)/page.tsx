import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, API_BASE_URL } from "@/lib/constants";
import type { DashboardStatsResponse } from "@/lib/types";
import { DashboardClient } from "./_components/DashboardClient";

export const metadata: Metadata = { title: "Dashboard - HappyPaws Admin" };

async function fetchStats(): Promise<DashboardStatsResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  // Always fetch the maximum time range (90 days) so charts can slice data locally independently
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 90);

  const startDateIso = startDate.toISOString().split("T")[0];
  const endDateIso = endDate.toISOString().split("T")[0];

  try {
    const dashboardRes = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard?startDate=${startDateIso}&endDate=${endDateIso}`, { headers, cache: "no-store" });

    let stats: DashboardStatsResponse | null = null;
    if (dashboardRes.ok) {
      stats = await dashboardRes.json();
    }

    return stats;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await fetchStats();
  return <DashboardClient stats={stats} />;
}
