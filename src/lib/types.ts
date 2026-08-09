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
  name?: string;
  given_name?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  role?: string | string[];
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
  /** Stored as string "True"/"False" by ASP.NET TokenService */
  is_verified?: boolean | string;
  exp: number;
  jti?: string;
}

export interface MeResponse {
  id: string;
  name?: string | null;
  email: string;
  roles: string[];
  isVerified: boolean;
  avatarUrl?: string | null;
}

export interface SetupStatusResponse {
  isSetupComplete: boolean;
}

export interface SetupCompleteRequest {
  name: string;
  email: string;
  password: string;
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

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface BadgeResponse {
  badgeType: string;
  awardedAt: string;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isVerified: boolean;
  reputationPoints: number;
  badges: BadgeResponse[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardUserGrowth {
  date: string;
  totalUsers: number;
  newUsers: number;
  verifiedUsers: number;
}

export interface DashboardAdoptionActivity {
  date: string;
  applications: number;
  adoptions: number;
}

export interface DashboardResponse {
  pendingKycCount: number;
  openRescueCasesCount: number;
  totalUsersCount: number;
  recentActivity: ModerationLogResponse[];
  userGrowth?: DashboardUserGrowth[];
  adoptionActivity?: DashboardAdoptionActivity[];
}

/** Frontend-augmented version with activeListingsCount added client-side. */
export interface DashboardStatsResponse extends DashboardResponse {
  activeListingsCount?: number;
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isSuspended: boolean;
  reputationPoints: number;
  roles: string[];
  createdAt: string;
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

export interface ReputationAdjustRequest {
  pointsToAdjust: number;
  reason: string;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export interface KycPendingResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: DocumentType;
  documentUrl: string;
  uploadedAt: string;
}

export interface RejectKycRequest {
  reason: string;
}

// ─── Rescue Cases ─────────────────────────────────────────────────────────────

/** Response from GET /api/v1/admin/cases — used only for the live map. */
export interface AdminCaseResponse {
  id: string;
  longitude: number;
  latitude: number;
  locationName: string;
  urgency: string;
  status: string;
}

/** Response from GET /api/v1/rescues (paginated list). */
export interface RescueCaseSummaryResponse {
  id: string;
  locationName: string;
  photoUrl: string;
  urgency: Urgency;
  status: CaseStatus;
  createdAt: string;
}

/** Response from GET /api/v1/rescues/{id} (full detail). */
export interface RescueCaseResponse {
  id: string;
  reporterId: string;
  reporterName: string;
  assignedFosterId: string | null;
  assignedFosterName: string | null;
  latitude: number;
  longitude: number;
  locationName: string;
  description: string;
  photoUrl: string;
  conditionNotes: string | null;
  urgency: Urgency;
  originalAiUrgency: Urgency | null;
  urgencySource: UrgencySource;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CaseUpdateResponse {
  id: string;
  userId: string;
  userName: string;
  updateType: UpdateType;
  updateText: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface UrgencyOverrideRequest {
  urgency: Urgency;
}

export interface AddCaseUpdateRequest {
  updateType: UpdateType;
  updateText: string;
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export interface ListingPhotoResponse {
  id: string;
  photoUrl: string;
  sortOrder: number;
  createdAt: string;
}

/** Response from GET /api/v1/listings (browse). */
export interface ListingResponse {
  id: string;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  ageLabel: string | null;
  gender: Gender;
  size: AnimalSize;
  activityLevel: number;
  locationName: string;
  status: ListingStatus;
  primaryPhotoUrl: string | null;
  createdAt: string;
}

/** Response from GET /api/v1/listings/{id} (detail). */
export interface ListingDetailResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  rescueCaseId: string | null;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  ageLabel: string | null;
  gender: Gender;
  size: AnimalSize;
  activityLevel: number;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  photos: ListingPhotoResponse[];
}

export interface ApplicationResponse {
  id: string;
  listingId: string;
  listingName: string;
  applicantId: string;
  applicantName: string;
  status: ApplicationStatus;
  reviewNotes: string | null;
  appliedAt: string;
  updatedAt: string;
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export interface ModerationLogResponse {
  id: string;
  adminId: string;
  targetType: string;
  targetId: string;
  actionType: string;
  reason: string;
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
  caseId: string;
  transporterId: string | null;
  transporterName: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupLocation: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffLocation: string;
  status: TransportStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

// ─── Pledges ─────────────────────────────────────────────────────────────────

export interface PledgeResponse {
  id: string;
  sponsorId: string;
  sponsorName: string;
  caseId: string | null;
  listingId: string | null;
  amount: number;
  status: PledgeStatus;
  note: string | null;
  createdAt: string;
}
