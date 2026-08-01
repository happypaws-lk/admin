import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_SECURE,
  COOKIE_DOMAIN,
} from "@/lib/constants";

function clearOptions(path: string): Record<string, unknown> {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict" as const,
    path,
    maxAge: 0,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  };
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && refreshToken) {
    await fetch(`${API_BASE_URL}/api/v1/auth/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {
      // Ignore revoke errors — cookies are cleared regardless.
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    ACCESS_TOKEN_COOKIE,
    "",
    clearOptions("/") as Parameters<typeof res.cookies.set>[2]
  );
  res.cookies.set(
    REFRESH_TOKEN_COOKIE,
    "",
    clearOptions("/api/auth") as Parameters<typeof res.cookies.set>[2]
  );

  return res;
}
