import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves a full, displayable image URL for user avatars or R2 keys.
 * Handles full URLs (http/https/blob/data) and relative R2 storage keys.
 * Returns undefined if no avatar URL is provided (triggering AvatarFallback).
 */
export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string" || !url.trim()) return undefined;
  const cleanUrl = url.trim();

  // Local object URLs or base64 data URLs for image cropping previews
  if (cleanUrl.startsWith("blob:") || cleanUrl.startsWith("data:")) {
    return cleanUrl;
  }

  // If it's already a full HTTP or HTTPS URL (like http://localhost:9000/...)
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  // Otherwise, it must be a relative R2 storage key (e.g. avatars/userId/guid.jpg)
  const baseUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:9000/happypaws-public";
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanKey = cleanUrl.replace(/^\//, "");
  
  return `${cleanBase}/${cleanKey}`;
}

