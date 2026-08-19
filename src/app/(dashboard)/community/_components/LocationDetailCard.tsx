"use client";

import { useState } from "react";
import {
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Compass,
} from "lucide-react";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { getGoogleMapsUrl } from "@/lib/location";

interface LocationDetailCardProps {
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
  variant?: "emerald" | "blue" | "neutral";
  className?: string;
}

export function LocationDetailCard({
  locationName,
  latitude,
  longitude,
  label,
  variant = "emerald",
  className = "",
}: LocationDetailCardProps) {
  const { location, isLoading } = useReverseGeocode(latitude, longitude);
  const [copied, setCopied] = useState(false);

  const hasCoords =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  const mapsUrl = getGoogleMapsUrl({
    latitude,
    longitude,
    query: locationName,
  });

  const handleCopyCoords = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasCoords) return;

    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const colorVariants = {
    emerald: {
      iconBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      accentText: "text-emerald-400",
      btnBg: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/25",
    },
    blue: {
      iconBg: "bg-blue-500/15 border-blue-500/30 text-blue-400",
      accentText: "text-blue-400",
      btnBg: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/25",
    },
    neutral: {
      iconBg: "bg-white/[0.08] border-white/15 text-zinc-300",
      accentText: "text-zinc-300",
      btnBg: "bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border-white/15",
    },
  };

  const colors = colorVariants[variant] || colorVariants.emerald;

  // Determine what to display as primary heading and address subline
  const primaryTitle =
    location?.formattedHeader ||
    (isLoading ? "Resolving town & city…" : locationName) ||
    "Location specified";

  const showSpecificLocationSubline =
    locationName &&
    location?.formattedHeader &&
    locationName.trim().toLowerCase() !==
      location.formattedHeader.trim().toLowerCase();

  return (
    <div
      className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-4.5 space-y-3.5 transition-all ${className}`}
    >
      {/* Header and CTA */}
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-inner ${colors.iconBg}`}
          >
            <MapPin className="w-4 h-4" />
          </div>

          <div className="min-w-0 space-y-1">
            {label && (
              <p
                className={`text-[11px] font-semibold uppercase tracking-wider ${colors.accentText}`}
              >
                {label}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm sm:text-base leading-snug">
                {primaryTitle}
              </span>
              {isLoading && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>

            {showSpecificLocationSubline && (
              <p className="text-xs text-zinc-300 flex items-center gap-1.5 pt-0.5">
                <span className="text-zinc-500 font-medium">Specified address:</span>
                <span className="text-zinc-200 font-medium">{locationName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Google Maps CTA button */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all active:scale-[0.97] shrink-0 self-start cursor-pointer shadow-sm ${colors.btnBg}`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Google Maps</span>
        </a>
      </div>

      {/* Structured Details: Badges & Coordinates */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/[0.05]">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {location?.cityOrTown && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06] font-medium">
              <Building2 className="w-3 h-3 text-zinc-400" />
              {location.cityOrTown}
            </span>
          )}

          {location?.districtOrProvince && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06] font-medium">
              <Compass className="w-3 h-3 text-zinc-400" />
              {location.districtOrProvince}
            </span>
          )}
        </div>

        {hasCoords && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] text-zinc-500 tabular-nums font-mono">
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </span>
            <button
              onClick={handleCopyCoords}
              title="Copy coordinates"
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors active:scale-95 cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
