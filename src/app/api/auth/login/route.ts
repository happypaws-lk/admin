import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_ME_COOKIE,
  COOKIE_SECURE,
  COOKIE_DOMAIN,
} from "@/lib/constants";
import { decodeUserClaims, isAdmin, normalizeRoles } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

function cookieOptions(
  path: string,
  rememberMe: boolean
): Record<string, unknown> {
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
  let body: { email: string; password: string; rememberMe?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { email, password, rememberMe = false } = body;

  const upstream = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { message: "Unable to log you in right now. Please wait a moment and try again." },
      { status: 503 }
    );
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  }

  const auth: AuthResponse = await upstream.json();
  const claims = decodeUserClaims(auth.accessToken);

  if (!claims || !isAdmin(claims)) {
    return NextResponse.json(
      { message: "Insufficient permissions" },
      { status: 403 }
    );
  }

  let name: string | null = null;
  let avatarUrl: string | null = null;

  try {
    const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile?.name) name = profile.name;
      if (profile?.avatarUrl) avatarUrl = profile.avatarUrl;
    }
  } catch {
    // Ignore fallback
  }

  if (!name) {
    name =
      claims.name ??
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      claims.given_name ??
      null;
  }

  const roles = normalizeRoles(claims);
  const isVerifiedRaw = claims.is_verified;
  const isVerified = isVerifiedRaw === true || isVerifiedRaw === "True";
  const res = NextResponse.json({
    id: claims.sub,
    name,
    email: claims.email,
    roles,
    isVerified,
    avatarUrl,
  });

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
