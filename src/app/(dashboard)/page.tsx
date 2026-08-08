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
    const [dashboardRes, listingsRes] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/api/v1/admin/dashboard?startDate=${startDateIso}&endDate=${endDateIso}`, { headers, cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/v1/admin/listings?status=0&pageSize=1`, { headers, cache: "no-store" }),
    ]);

    let stats: DashboardStatsResponse | null = null;
    if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
      stats = await dashboardRes.value.json();
    }

    let activeListingsCount = 0;
    if (listingsRes.status === "fulfilled" && listingsRes.value.ok) {
      const listingsData = await listingsRes.value.json();
      activeListingsCount = listingsData.totalCount ?? listingsData.items?.length ?? 0;
    }

    if (stats) {
      stats.activeListingsCount = activeListingsCount;
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
