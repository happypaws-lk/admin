export const ACCESS_TOKEN_COOKIE = "hp_access_token";
export const REFRESH_TOKEN_COOKIE = "hp_refresh_token";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
export const COOKIE_SECURE = process.env.AUTH_COOKIE_SECURE === "true";
export const COOKIE_DOMAIN =
  process.env.AUTH_COOKIE_DOMAIN || undefined;
