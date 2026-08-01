import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, API_BASE_URL } from "@/lib/constants";
import type { DashboardStatsResponse } from "@/lib/types";
import { DashboardClient } from "./_components/DashboardClient";

export const metadata: Metadata = { title: "Dashboard - HappyPaws Admin" };

async function fetchStats(): Promise<DashboardStatsResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<DashboardStatsResponse>;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await fetchStats();
  return <DashboardClient stats={stats} />;
}
