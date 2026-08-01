// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserClaims {
  sub: string;
  email: string;
  role?: string | string[];
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
  /** Stored as string "True"/"False" by ASP.NET TokenService */
  is_verified?: boolean | string;
  exp: number;
  jti?: string;
}

export interface MeResponse {
  id: string;
  email: string;
  roles: string[];
  isVerified: boolean;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  resetToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Enums (integer values matching C# ordinals) ─────────────────────────────

export const CaseStatus = { Open: 0, InProgress: 1, Resolved: 2 } as const;
export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

export const Urgency = { Low: 0, Moderate: 1, Critical: 2 } as const;
export type Urgency = (typeof Urgency)[keyof typeof Urgency];

export const UrgencySource = { Gemini: 0, RuleBased: 1, ManualOverride: 2 } as const;
export type UrgencySource = (typeof UrgencySource)[keyof typeof UrgencySource];

export const DocumentType = { Nic: 0, License: 1, ClinicReg: 2 } as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DocumentStatus = { Pending: 0, Approved: 1, Rejected: 2 } as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const AnimalSize = { Small: 0, Medium: 1, Large: 2 } as const;
export type AnimalSize = (typeof AnimalSize)[keyof typeof AnimalSize];

export const Gender = { Male: 0, Female: 1, Unknown: 2 } as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const ListingStatus = { Available: 0, Pending: 1, Adopted: 2 } as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const ApplicationStatus = { Pending: 0, Accepted: 1, Declined: 2 } as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const TransportStatus = {
  Pending: 0,
  Assigned: 1,
  PickedUp: 2,
  InTransit: 3,
  Delivered: 4,
} as const;
export type TransportStatus = (typeof TransportStatus)[keyof typeof TransportStatus];

export const UpdateType = {
  StatusUpdate: 0,
  ConditionUpdate: 1,
  MedicalGuidance: 2,
  Note: 3,
} as const;
export type UpdateType = (typeof UpdateType)[keyof typeof UpdateType];

export const ModerationTargetType = { Listing: 0, Message: 1, User: 2 } as const;
export type ModerationTargetType =
  (typeof ModerationTargetType)[keyof typeof ModerationTargetType];

export const ModerationActionType = { Removed: 0, Suspended: 1, Warned: 2 } as const;
export type ModerationActionType =
  (typeof ModerationActionType)[keyof typeof ModerationActionType];

export const PledgeStatus = { Pledged: 0, Confirmed: 1 } as const;
export type PledgeStatus = (typeof PledgeStatus)[keyof typeof PledgeStatus];

// ─── Enum label maps ──────────────────────────────────────────────────────────

export const CASE_STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "In Progress",
  2: "Resolved",
};

export const URGENCY_LABELS: Record<number, string> = {
  0: "Low",
  1: "Moderate",
  2: "Critical",
};

export const URGENCY_SOURCE_LABELS: Record<number, string> = {
  0: "AI (Gemini)",
  1: "Rule-Based",
  2: "Manual Override",
};

export const DOCUMENT_TYPE_LABELS: Record<number, string> = {
  0: "National ID (NIC)",
  1: "Driving License",
  2: "Clinic Registration",
};

export const DOCUMENT_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
};

export const LISTING_STATUS_LABELS: Record<number, string> = {
  0: "Available",
  1: "Pending",
  2: "Adopted",
};

export const APPLICATION_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Accepted",
  2: "Declined",
};

export const TRANSPORT_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Assigned",
  2: "Picked Up",
  3: "In Transit",
  4: "Delivered",
};

export const UPDATE_TYPE_LABELS: Record<number, string> = {
  0: "Status Update",
  1: "Condition Update",
  2: "Medical Guidance",
  3: "Note",
};

export const PLEDGE_STATUS_LABELS: Record<number, string> = {
  0: "Pledged",
  1: "Confirmed",
};

// ─── Admin DTOs ───────────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  pendingKycCount: number;
  openRescueCasesCount: number;
  totalUsersCount: number;
  activeListingsCount: number;
  recentModerationLogs: ModerationLogResponse[];
}

export interface AdminUserResponse {
  id: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  reputationScore: number;
}

export interface AdminUserDetailResponse extends AdminUserResponse {
  fullName?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface SuspendUserRequest {
  reason: string;
}

export interface AdjustReputationRequest {
  delta: number;
  reason: string;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export interface KycPendingResponse {
  id: string;
  userId: string;
  userEmail: string;
  documentType: DocumentType;
  documentUrl: string;
  status: DocumentStatus;
  submittedAt: string;
}

export interface RejectKycRequest {
  reason: string;
}

// ─── Rescue Cases ─────────────────────────────────────────────────────────────

export interface RescueCaseUpdateResponse {
  id: string;
  message: string;
  updateType: UpdateType;
  createdAt: string;
  createdByEmail: string;
}

export interface AdminCaseResponse {
  id: string;
  title: string;
  description?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  /** Explicit string property — values: "Low" | "Moderate" | "Critical" */
  urgency: string;
  /** Explicit string property — values: "Open" | "InProgress" | "Resolved" */
  status: string;
  urgencySource: UrgencySource;
  reportedById?: string;
  reportedByEmail: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  updates: RescueCaseUpdateResponse[];
}

export interface UrgencyOverrideRequest {
  urgency: Urgency;
  reason: string;
}

export interface AddCaseUpdateRequest {
  message: string;
  updateType: UpdateType;
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export interface AdminListingResponse {
  id: string;
  title: string;
  description?: string;
  species: string;
  breed?: string;
  ageMonths?: number;
  size: AnimalSize;
  gender: Gender;
  listingStatus: ListingStatus;
  photoUrls: string[];
  location: string;
  postedByEmail: string;
  createdAt: string;
  updatedAt: string;
  isVaccinated: boolean;
  isNeutered: boolean;
}

export interface ApplicationResponse {
  id: string;
  listingId: string;
  applicantId: string;
  applicantEmail: string;
  note?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export interface ModerationLogResponse {
  id: string;
  /** Explicit string property — values: "Listing" | "Message" | "User" */
  targetType: string;
  targetId: string;
  /** Explicit string property — values: "Removed" | "Suspended" | "Warned" */
  actionType: string;
  reason: string;
  performedByEmail: string;
  createdAt: string;
}

export interface CreateModerationActionRequest {
  targetType: ModerationTargetType;
  targetId: string;
  actionType: ModerationActionType;
  reason: string;
}

// ─── Transports ───────────────────────────────────────────────────────────────

export interface TransportTaskResponse {
  id: string;
  rescueCaseId: string;
  caseTitle: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: TransportStatus;
  assignedToId?: string;
  assignedToEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Pledges ─────────────────────────────────────────────────────────────────

export interface PledgeResponse {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  rescueCaseId?: string;
  caseTitle?: string;
  status: PledgeStatus;
  createdAt: string;
}
