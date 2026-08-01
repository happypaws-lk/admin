import { decodeJwt } from "jose";
import type { UserClaims } from "./types";

export function decodeUserClaims(token: string): UserClaims | null {
  try {
    return decodeJwt(token) as unknown as UserClaims;
  } catch {
    return null;
  }
}

/** Alias for decodeUserClaims — preferred in new code. */
export const decodeAccessToken = decodeUserClaims;

export function isAdmin(claims: UserClaims): boolean {
  const role =
    claims.role ??
    claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  if (Array.isArray(role)) return role.includes("Admin");
  return role === "Admin";
}

export function isExpired(claims: UserClaims): boolean {
  return Date.now() / 1000 > claims.exp;
}

/** Returns true if the token string decodes to an expired JWT. */
export function isTokenExpired(token: string): boolean {
  const claims = decodeUserClaims(token);
  if (!claims) return true;
  return isExpired(claims);
}

export function isExpiringSoon(
  claims: UserClaims,
  thresholdSeconds = 120,
): boolean {
  return Date.now() / 1000 > claims.exp - thresholdSeconds;
}

export function normalizeRoles(claims: UserClaims): string[] {
  const role =
    claims.role ??
    claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  if (!role) return [];
  return Array.isArray(role) ? role : [role];
}

/** Returns true if the token string contains the given role name. */
export function hasRole(token: string, role: string): boolean {
  const claims = decodeUserClaims(token);
  if (!claims) return false;
  return normalizeRoles(claims).includes(role);
}
