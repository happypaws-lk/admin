import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_SECURE,
  COOKIE_DOMAIN,
} from "@/lib/constants";
import {
  decodeUserClaims,
  isAdmin,
  isExpired,
  isExpiringSoon,
} from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/verify-reset-code",
  "/reset-password",
];

function refreshCookieOptions(path: string) {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict" as const,
    path,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  };
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = accessToken ? decodeUserClaims(accessToken) : null;
  const validAdmin = claims && !isExpired(claims) && isAdmin(claims);

  // Redirect authenticated admins away from auth pages.
  if (isAuthRoute) {
    if (validAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes below. Non-admin or missing token: redirect to login.
  if (!claims || !isAdmin(claims)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Token is expired — attempt silent refresh.
  if (isExpired(claims)) {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

    const upstream = await fetch(`${apiBase}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null);

    if (!upstream || !upstream.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const auth: AuthResponse = await upstream.json();
    const next = NextResponse.next();
    next.cookies.set(
      ACCESS_TOKEN_COOKIE,
      auth.accessToken,
      refreshCookieOptions("/")
    );
    next.cookies.set(
      REFRESH_TOKEN_COOKIE,
      auth.refreshToken,
      refreshCookieOptions("/api/auth")
    );
    return next;
  }

  // Proactive refresh when the token is expiring soon (fire-and-forget).
  if (isExpiringSoon(claims)) {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
      fetch(`${apiBase}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|ico|css|js|woff2?)$).*)",
  ],
};
