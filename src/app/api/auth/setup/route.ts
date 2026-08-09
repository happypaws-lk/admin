import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_SECURE,
  COOKIE_DOMAIN,
} from "@/lib/constants";
import { decodeUserClaims, normalizeRoles } from "@/lib/auth";
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
  let body: { name: string; email: string; password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password } = body;

  const upstream = await fetch(`${API_BASE_URL}/api/v1/setup/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { message: "Unable to complete setup right now. Please try again." },
      { status: 503 }
    );
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  }

  const auth: AuthResponse = await upstream.json();
  const claims = decodeUserClaims(auth.accessToken);
  const roles = claims ? normalizeRoles(claims) : ["Admin"];
  const isVerifiedRaw = claims?.is_verified;
  const isVerified = isVerifiedRaw === true || isVerifiedRaw === "True";

  const res = NextResponse.json({
    id: claims?.sub ?? "",
    email: claims?.email ?? email,
    roles,
    isVerified,
  });

  res.cookies.set(
    ACCESS_TOKEN_COOKIE,
    auth.accessToken,
    cookieOptions("/") as Parameters<typeof res.cookies.set>[2]
  );
  res.cookies.set(
    REFRESH_TOKEN_COOKIE,
    auth.refreshToken,
    cookieOptions("/") as Parameters<typeof res.cookies.set>[2]
  );

  return res;
}
