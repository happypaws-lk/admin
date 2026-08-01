import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
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

  const isVerifiedRaw = claims.is_verified;
  const isVerified = isVerifiedRaw === true || isVerifiedRaw === "True";

  return NextResponse.json({
    id: claims.sub,
    email: claims.email,
    roles: normalizeRoles(claims),
    isVerified,
  });
}
