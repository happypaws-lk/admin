import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, API_BASE_URL } from "@/lib/constants";
import { decodeUserClaims, isExpired, normalizeRoles } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const claims = decodeUserClaims(token);
  if (!claims || isExpired(claims)) {
    return NextResponse.json({ message: "Token expired" }, { status: 401 });
  }

  let name: string | null = null;
  let avatarUrl: string | null = null;

  try {
    const upstreamRes = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (upstreamRes.ok) {
      const profile = await upstreamRes.json();
      if (profile?.name) name = profile.name;
      if (profile?.avatarUrl) avatarUrl = profile.avatarUrl;
    }
  } catch {
    // Ignore upstream error and fall back to claims
  }

  if (!name) {
    name =
      claims.name ??
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      claims.given_name ??
      null;
  }

  const isVerifiedRaw = claims.is_verified;
  const isVerified = isVerifiedRaw === true || isVerifiedRaw === "True";

  return NextResponse.json({
    id: claims.sub,
    name,
    email: claims.email,
    roles: normalizeRoles(claims),
    isVerified,
    avatarUrl,
  });
}
