import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_SECURE,
  COOKIE_DOMAIN,
} from "@/lib/constants";
import type { AuthResponse } from "@/lib/types";

function cookieOptions(path: string): Record<string, unknown> {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict" as const,
    path,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  };
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
  }

  const auth: AuthResponse = await upstream.json();
  const res = NextResponse.json({ ok: true });

  res.cookies.set(
    ACCESS_TOKEN_COOKIE,
    auth.accessToken,
    cookieOptions("/") as Parameters<typeof res.cookies.set>[2]
  );
  res.cookies.set(
    REFRESH_TOKEN_COOKIE,
    auth.refreshToken,
    cookieOptions("/api/auth") as Parameters<typeof res.cookies.set>[2]
  );

  return res;
}
