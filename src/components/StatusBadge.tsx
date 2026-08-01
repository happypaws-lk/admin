"use client";

type Color = "green" | "amber" | "red" | "blue" | "purple" | "slate" | "indigo" | "cyan";

const COLOR_CLASSES: Record<Color, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  red: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  slate: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

// ─── Urgency (integer 0-2 OR string "Low"|"Moderate"|"Critical") ─────────────
function urgencyConfig(value: string | number): { label: string; color: Color } {
  const v = typeof value === "string" ? value.toLowerCase() : value;
  if (v === 2 || v === "critical") return { label: "Critical", color: "red" };
  if (v === 1 || v === "moderate") return { label: "Moderate", color: "amber" };
  return { label: "Low", color: "green" };
}

// ─── CaseStatus (integer 0-2 OR string "Open"|"InProgress"|"Resolved") ───────
function caseStatusConfig(value: string | number): { label: string; color: Color } {
  const v = typeof value === "string" ? value.toLowerCase() : value;
  if (v === 0 || v === "open") return { label: "Open", color: "blue" };
  if (v === 1 || v === "inprogress") return { label: "In Progress", color: "amber" };
  return { label: "Resolved", color: "green" };
}

// ─── DocumentType (integer 0-2) ───────────────────────────────────────────────
function documentTypeConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "NIC", color: "indigo" };
  if (value === 1) return { label: "License", color: "cyan" };
  return { label: "Clinic Reg.", color: "purple" };
}

// ─── DocumentStatus (integer 0-2) ─────────────────────────────────────────────
function documentStatusConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "Pending", color: "amber" };
  if (value === 1) return { label: "Approved", color: "green" };
  return { label: "Rejected", color: "red" };
}

// ─── ListingStatus (integer 0-2) ─────────────────────────────────────────────
function listingStatusConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "Available", color: "green" };
  if (value === 1) return { label: "Pending", color: "amber" };
  return { label: "Adopted", color: "slate" };
}

// ─── ApplicationStatus (integer 0-2) ─────────────────────────────────────────
function applicationStatusConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "Pending", color: "amber" };
  if (value === 1) return { label: "Accepted", color: "green" };
  return { label: "Declined", color: "red" };
}

// ─── TransportStatus (integer 0-4) ───────────────────────────────────────────
function transportStatusConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "Pending", color: "slate" };
  if (value === 1) return { label: "Assigned", color: "blue" };
  if (value === 2) return { label: "Picked Up", color: "amber" };
  if (value === 3) return { label: "In Transit", color: "purple" };
  return { label: "Delivered", color: "green" };
}

// ─── PledgeStatus (integer 0-1) ──────────────────────────────────────────────
function pledgeStatusConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "Pledged", color: "amber" };
  return { label: "Confirmed", color: "green" };
}

// ─── ModerationAction (string "Removed"|"Suspended"|"Warned") ────────────────
function moderationActionConfig(value: string | number): { label: string; color: Color } {
  const v = typeof value === "string" ? value.toLowerCase() : value;
  if (v === "removed" || v === 0) return { label: "Removed", color: "red" };
  if (v === "suspended" || v === 1) return { label: "Suspended", color: "amber" };
  return { label: "Warned", color: "indigo" };
}

// ─── UrgencySource (integer 0-2) ─────────────────────────────────────────────
function urgencySourceConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "AI (Gemini)", color: "purple" };
  if (value === 1) return { label: "Rule-Based", color: "cyan" };
  return { label: "Manual Override", color: "amber" };
}

// ─── UpdateType (integer 0-3) ─────────────────────────────────────────────────
function updateTypeConfig(value: string | number): { label: string; color: Color } {
  if (value === 0) return { label: "Status Update", color: "blue" };
  if (value === 1) return { label: "Condition", color: "amber" };
  if (value === 2) return { label: "Medical", color: "red" };
  return { label: "Note", color: "slate" };
}

// ─── Props ────────────────────────────────────────────────────────────────────

export type StatusBadgeVariant =
  | "urgency"
  | "caseStatus"
  | "documentType"
  | "documentStatus"
  | "listingStatus"
  | "applicationStatus"
  | "transportStatus"
  | "pledgeStatus"
  | "moderationAction"
  | "urgencySource"
  | "updateType";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  value: string | number;
  className?: string;
}

export function StatusBadge({ variant, value, className = "" }: StatusBadgeProps) {
  const config = resolve(variant, value);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${COLOR_CLASSES[config.color]} ${className}`}
    >
      {config.label}
    </span>
  );
}

function resolve(
  variant: StatusBadgeVariant,
  value: string | number,
): { label: string; color: Color } {
  switch (variant) {
    case "urgency": return urgencyConfig(value);
    case "caseStatus": return caseStatusConfig(value);
    case "documentType": return documentTypeConfig(value);
    case "documentStatus": return documentStatusConfig(value);
    case "listingStatus": return listingStatusConfig(value);
    case "applicationStatus": return applicationStatusConfig(value);
    case "transportStatus": return transportStatusConfig(value);
    case "pledgeStatus": return pledgeStatusConfig(value);
    case "moderationAction": return moderationActionConfig(value);
    case "urgencySource": return urgencySourceConfig(value);
    case "updateType": return updateTypeConfig(value);
    default: return { label: String(value), color: "slate" };
  }
}
