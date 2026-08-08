import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_ME_COOKIE,
  COOKIE_SECURE,
  COOKIE_DOMAIN,
} from "@/lib/constants";
import type { AuthResponse } from "@/lib/types";

function cookieOptions(path: string, rememberMe: boolean): Record<string, unknown> {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict" as const,
    path,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    ...(rememberMe ? { maxAge: 7 * 24 * 60 * 60 } : {}),
  };
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  const rememberMe = req.cookies.get(REMEMBER_ME_COOKIE)?.value === "1";

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
    cookieOptions("/", rememberMe) as Parameters<typeof res.cookies.set>[2]
  );
  res.cookies.set(
    REFRESH_TOKEN_COOKIE,
    auth.refreshToken,
    cookieOptions("/", rememberMe) as Parameters<typeof res.cookies.set>[2]
  );

  if (rememberMe) {
    res.cookies.set(REMEMBER_ME_COOKIE, "1", {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: COOKIE_SECURE,
      sameSite: "strict",
      ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    } as Parameters<typeof res.cookies.set>[2]);
  }

  return res;
}
