import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_ME_COOKIE,
  COOKIE_SECURE,
  COOKIE_DOMAIN,
} from "@/lib/constants";
import {
  decodeUserClaims,
  isAdmin,
  isExpired,
} from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/verify-reset-code",
  "/reset-password",
];

function refreshCookieOptions(path: string, rememberMe: boolean) {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict" as const,
    path,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    ...(rememberMe ? { maxAge: 7 * 24 * 60 * 60 } : {}),
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

    const rememberMe = req.cookies.get(REMEMBER_ME_COOKIE)?.value === "1";
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
      refreshCookieOptions("/", rememberMe)
    );
    next.cookies.set(
      REFRESH_TOKEN_COOKIE,
      auth.refreshToken,
      refreshCookieOptions("/", rememberMe)
    );
    if (rememberMe) {
      next.cookies.set(REMEMBER_ME_COOKIE, "1", {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        secure: COOKIE_SECURE,
        sameSite: "strict" as const,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      });
    }
    return next;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|ico|css|js|woff2?)$).*)",
  ],
};
