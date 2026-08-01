# HappyPaws Admin - Complete Implementation Roadmap

---

## 1. Authentication Strategy

### 1.1 Token Architecture

The ASP.NET API uses JWT bearer tokens with the following characteristics:

| Property | Value |
|----------|-------|
| Access Token Lifetime | 15 minutes |
| Refresh Token Lifetime | 7 days |
| Signing Algorithm | HMAC-SHA256 |
| Token Claims | `sub` (userId), `email`, `role` (multiple), `is_verified`, `jti` |
| Issuer | `https://happypaws.lk` |
| Audience | `https://happypaws.lk` |

### 1.2 Token Storage Strategy

Use **HTTP-only cookies** managed by a Next.js API route (not client-side storage):

1. Create a Next.js Route Handler at `app/api/auth/[...action]/route.ts` that acts as a BFF (Backend for Frontend):
   - `POST /api/auth/login` - Proxies the login to the ASP.NET API, sets cookies from the response.
   - `POST /api/auth/refresh` - Proxies the refresh, rotates cookies.
   - `POST /api/auth/logout` - Calls revoke on the API, clears cookies.

2. Cookie configuration:
   - `hp_access_token`: HTTP-only, Secure, SameSite=Strict, Path=/
   - `hp_refresh_token`: HTTP-only, Secure, SameSite=Strict, Path=/api/auth (only sent to refresh endpoint)
   - Domain: `.happypaws.lk` (shared between admin.happypaws.lk and the cookie setter)

3. Why HTTP-only cookies over localStorage:
   - XSS-proof: JavaScript cannot read the tokens.
   - Automatic attachment: Browser sends cookies with every same-origin request.
   - Next.js middleware can read them server-side for route protection.

### 1.3 Remember Me Toggle

- When "Remember Me" is **checked**: Set both cookies with `maxAge: 7 * 24 * 60 * 60` (7 days, matching refresh token TTL).
- When "Remember Me" is **unchecked**: Set cookies as session cookies (no `maxAge`/`expires`). They vanish when the browser closes.
- The refresh token lifecycle remains unchanged on the API side; this only controls cookie persistence.

### 1.4 Token Refresh Cycle

Implement a proactive + reactive refresh strategy:

**Proactive (middleware-level):**
1. Next.js middleware runs on every request to `/(dashboard)` routes.
2. Decode the access token (without verifying signature - just read expiry).
3. If `exp` is within 2 minutes of now, trigger a refresh before forwarding the request.
4. If refresh succeeds, set the new cookies and continue.
5. If refresh fails (token revoked/expired), redirect to `/login`.

**Reactive (client-side):**
1. The API client wraps every fetch call.
2. On receiving a 401 response:
   - Call `POST /api/auth/refresh` (the BFF route, which proxies to the ASP.NET API).
   - If refresh succeeds, retry the original request with the new token.
   - If refresh fails, clear auth state and redirect to `/login`.
3. Use a mutex/lock to prevent multiple simultaneous refresh attempts.

### 1.5 Route Redirect on Auth State Changes

| Event | Action |
|-------|--------|
| User visits any `/(dashboard)` route without valid token | Redirect to `/login` |
| User visits `/login` with a valid admin token | Redirect to `/` |
| Token refresh fails mid-session | Redirect to `/login`, show "Session expired" message |
| User logs out | Clear cookies, redirect to `/login` |
| Non-Admin user somehow has a valid token | Redirect to `/login`, show "Insufficient permissions" |

---

## 2. Comprehensive Route Map

| Route | Purpose | Protection | API Endpoints Used |
|-------|---------|------------|-------------------|
| `/login` | Admin login form | Public (redirects to `/` if already authenticated) | `POST /api/v1/auth/login` |
| `/` | Dashboard home - stats overview | Admin required | `GET /api/v1/admin/dashboard` |
| `/users` | Paginated user list with filters | Admin required | `GET /api/v1/admin/users` |
| `/users/[id]` | User detail with moderation actions | Admin required | `GET /api/v1/admin/users`, `PUT .../suspend`, `PUT .../unsuspend`, `PUT /api/v1/admin/reputation/{userId}` |
| `/rescue-cases` | Live map + list of active rescue cases | Admin required | `GET /api/v1/admin/cases`, `GET /api/v1/rescues` |
| `/rescue-cases/[id]` | Rescue case detail with updates timeline | Admin required | `GET /api/v1/rescues/{id}`, `GET /api/v1/rescues/{id}/updates`, `PUT /api/v1/rescues/{id}/urgency` |
| `/listings` | Paginated listing management | Admin required | `GET /api/v1/listings` |
| `/listings/[id]` | Listing detail with photos and applications | Admin required | `GET /api/v1/listings/{id}`, `GET /api/v1/listings/{id}/applications` |
| `/kyc` | KYC review queue | Admin required | `GET /api/v1/admin/kyc/pending`, `POST .../approve`, `POST .../reject` |
| `/moderation` | Moderation action log + create new actions | Admin required | `GET /api/v1/admin/moderation`, `POST /api/v1/admin/moderation` |
| `/transports` | Transport task overview | Admin required | `GET /api/v1/transports` |
| `/pledges` | Pledge overview (read-only for admin) | Admin required | `GET /api/v1/pledges/me` (or custom admin endpoint if added) |

---

## 3. Step-by-Step Implementation

---

### Phase 1: Project Scaffolding

#### Step 1.1: Initialize Next.js Project

- Run: `pnpm create next-app@latest admin --typescript --app --src-dir --no-tailwind --no-eslint`
- Configure `tsconfig.json` with `"strict": true` and path aliases (`@/` -> `src/`).
- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000`.

#### Step 1.2: Install Dependencies

- `react-hook-form` + `@hookform/resolvers` + `zod` (form handling & validation)
- `jose` (JWT decode without full verification for reading claims/expiry in middleware)

#### Step 1.3: Create Folder Structure

Create all directories as defined in AGENTS.md Section 2.

#### Step 1.4: Define TypeScript Types

In `src/lib/types.ts`, define TypeScript interfaces for every schema in `openapi.json`:
- All enums as TypeScript union types or `const` enums
- All request/response interfaces
- `PagedResult<T>` generic type
- `ProblemDetails` error type

---

### Phase 2: Authentication System

#### Step 2.1: Build the BFF Auth Route Handler

File: `src/app/api/auth/[...action]/route.ts`

Handles:
- `POST /api/auth/login` - Accepts `{ email, password, rememberMe }`, calls ASP.NET login, sets cookies
- `POST /api/auth/refresh` - Reads refresh token cookie, calls ASP.NET refresh, rotates cookies
- `POST /api/auth/logout` - Reads refresh token cookie, calls ASP.NET revoke, clears cookies
- `GET /api/auth/me` - Reads access token cookie, decodes claims, returns user info to client

Cookie setting logic:
- On `rememberMe: true`: `Set-Cookie: hp_access_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`
- On `rememberMe: false`: `Set-Cookie: hp_access_token=...; HttpOnly; Secure; SameSite=Strict; Path=/` (session cookie)

#### Step 2.2: Build Next.js Middleware

File: `src/middleware.ts`

```
Matcher: ["/(dashboard)(.*)", "/"]
Excluded: ["/login", "/api/auth", "/_next", "/favicon.ico"]
```

Logic:
1. Read `hp_access_token` from cookies.
2. If missing -> redirect to `/login`.
3. Decode JWT payload (using `jose`'s `decodeJwt` - no signature verification needed, just expiry check).
4. If `exp` < now -> attempt refresh via internal fetch to `/api/auth/refresh`.
5. If refresh fails -> redirect to `/login`.
6. If decoded `role` claims do not include `Admin` -> redirect to `/login`.
7. If user is at `/login` AND has a valid admin token -> redirect to `/`.

#### Step 2.3: Build Auth Context Provider

File: `src/hooks/useAuth.ts` and `src/components/AuthProvider.tsx`

Provides:
- `user: { id, email, name, roles, isVerified } | null`
- `isLoading: boolean`
- `login(email, password, rememberMe): Promise<void>`
- `logout(): Promise<void>`

The provider calls `GET /api/auth/me` on mount to hydrate user state from the cookie.

#### Step 2.4: Build Login Page

Route: `/login`

**UI Elements:**
- Email input (type: email, required, label: "Email")
- Password input (type: password, required, label: "Password")
- "Remember Me" checkbox (default: unchecked)
- Submit button (label: "Sign In")
- Error message area (shown on 401: "Invalid email or password", on 403: "Account suspended")
- Loading state on submit button

**Behavior:**
- On successful login, redirect to `/`.
- If already authenticated (detected by middleware), redirects to `/` before rendering.

---

### Phase 3: App Shell & Dashboard

#### Step 3.1: Build Authenticated Layout

File: `src/app/(dashboard)/layout.tsx`

**Structural elements:**
- Sidebar (fixed left, collapsible): Navigation links for all admin routes
- Header (top bar): Page title, notification bell (showing unread count), user avatar + dropdown menu
- Main content area: Renders child pages

**Sidebar Navigation Items:**
| Label | Route | Icon placeholder |
|-------|-------|-----------------|
| Dashboard | `/` | grid |
| Users | `/users` | users |
| Rescue Cases | `/rescue-cases` | alert |
| Listings | `/listings` | list |
| KYC Review | `/kyc` | document |
| Moderation | `/moderation` | shield |
| Transports | `/transports` | truck |
| Pledges | `/pledges` | heart |

**Header Elements:**
- Breadcrumb based on current route
- Notification badge: calls `GET /api/v1/notifications/unread-count`, displays count
- User menu dropdown: shows logged-in admin name + "Sign Out" action

#### Step 3.2: Build Dashboard Page

Route: `/`

**API Call:** `GET /api/v1/admin/dashboard`

**Structural elements:**

1. **Stat Cards Row** (3 cards):
   - "Pending KYC" - displays `pendingKycCount` - links to `/kyc`
   - "Open Rescue Cases" - displays `openRescueCasesCount` - links to `/rescue-cases`
   - "Total Users" - displays `totalUsersCount` - links to `/users`

2. **Recent Activity Table:**
   - Data source: `recentActivity` array from dashboard response (max 5 items)
   - Columns: Action Type | Target Type | Reason | Date
   - Each row displays a `ModerationLogResponse`
   - "View All" link to `/moderation`

---

### Phase 4: User Management

#### Step 4.1: Users List Page

Route: `/users`

**API Call:** `GET /api/v1/admin/users?page=X&pageSize=Y&name=&email=&role=&isSuspended=`

**Filter Controls:**
- Text input: "Search by name" (maps to `name` query param)
- Text input: "Search by email" (maps to `email` query param)
- Select dropdown: "Filter by Role" (options: All, Adopter, Foster, Transporter, Sponsor, Veterinarian, Admin)
- Select dropdown: "Status" (options: All, Active, Suspended)

**Data Table Columns:**
| Column | Field | Sortable |
|--------|-------|----------|
| Name | `name` | No |
| Email | `email` | No |
| Roles | `roles` (comma-joined badges) | No |
| Verified | `isVerified` (boolean indicator) | No |
| Status | `isSuspended` (Active/Suspended badge) | No |
| Reputation | `reputationPoints` | No |
| Actions | Row action buttons | - |

**Row Actions:**
- "View" button -> navigates to `/users/[id]`
- "Suspend" button (shown if not suspended) -> opens confirmation dialog with reason textarea, calls `PUT /api/v1/admin/users/{id}/suspend`
- "Unsuspend" button (shown if suspended) -> calls `PUT /api/v1/admin/users/{id}/unsuspend`

**Pagination:** Standard pagination component using `PagedResult` fields.

#### Step 4.2: User Detail Page

Route: `/users/[id]`

**API Calls:**
- `GET /api/v1/admin/users` (filter by the specific user - or use the list response if navigated from list)
- `GET /api/v1/users/{id}` (public profile for badges)

**Structural elements:**

1. **User Info Section:**
   - Name, Email, Verification status, Suspension status, Reputation points
   - List of roles as badges

2. **Actions Section:**
   - Suspend/Unsuspend button (with confirmation dialog)
   - Reputation adjustment form:
     - Number input: "Points to adjust" (positive or negative integer)
     - Textarea: "Reason"
     - Submit button: "Adjust Reputation"
     - API: `PUT /api/v1/admin/reputation/{userId}`

---

### Phase 5: KYC Review

#### Step 5.1: KYC Queue Page

Route: `/kyc`

**API Call:** `GET /api/v1/admin/kyc/pending`

**Data Table Columns:**
| Column | Field | Notes |
|--------|-------|-------|
| User Name | `userName` | |
| User Email | `userEmail` | |
| Document Type | `documentType` | Display as readable label (NIC, License, Clinic Reg) |
| Uploaded At | `uploadedAt` | Formatted date |
| Actions | - | View, Approve, Reject buttons |

**Row Actions:**
- "View Document" button -> opens the `documentUrl` (presigned URL) in a new tab or inline viewer
- "Approve" button -> calls `POST /api/v1/admin/kyc/{id}/approve` with confirmation dialog
- "Reject" button -> opens dialog with:
  - Textarea: "Rejection Reason" (required)
  - Submit button: "Reject"
  - API: `POST /api/v1/admin/kyc/{id}/reject` with `{ reason }`

**Empty State:** "No pending KYC documents to review."

---

### Phase 6: Rescue Case Management

#### Step 6.1: Rescue Cases Page

Route: `/rescue-cases`

**API Calls:**
- `GET /api/v1/admin/cases` (for map data)
- `GET /api/v1/rescues?page=X&pageSize=Y&status=&urgency=` (for list data)

**Structural elements:**

1. **Map Section:**
   - Renders all active rescue cases as markers on an interactive map
   - Each marker positioned at (`latitude`, `longitude`) from `AdminCaseResponse`
   - Marker color/icon varies by `urgency` (Low, Moderate, Critical)
   - Clicking a marker shows popup with: location name, urgency, status, link to detail page

2. **Filter Controls:**
   - Select: "Status" (options: All, Open, InProgress, Resolved)
   - Select: "Urgency" (options: All, Low, Moderate, Critical)

3. **Data Table:**
   | Column | Field |
   |--------|-------|
   | Location | `locationName` |
   | Urgency | `urgency` (colored badge) |
   | Status | `status` (badge) |
   | Reported | `createdAt` (relative time) |
   | Photo | `photoUrl` (thumbnail) |
   | Actions | "View" link |

**Pagination:** Standard.

#### Step 6.2: Rescue Case Detail Page

Route: `/rescue-cases/[id]`

**API Calls:**
- `GET /api/v1/rescues/{id}` (full case details)
- `GET /api/v1/rescues/{id}/updates` (timeline of updates)

**Structural elements:**

1. **Case Header:**
   - Photo (from `photoUrl`)
   - Location name
   - Urgency badge (with source indicator: AI, RuleBased, or ManualOverride)
   - Status badge
   - Reporter name + link
   - Assigned Foster name + link (if assigned)
   - Dates: created, last updated

2. **Urgency Override Section (Admin action):**
   - Select dropdown: "New Urgency" (options: Low, Moderate, Critical)
   - Submit button: "Override Urgency"
   - API: `PUT /api/v1/rescues/{id}/urgency` with `{ urgency }`
   - Shows current AI assessment vs. any manual override

3. **Case Updates Timeline:**
   - Chronological list of all `CaseUpdateResponse` items
   - Each item shows: user name, update type (badge), update text, photo (if present), timestamp
   - Update types color-coded: StatusUpdate, ConditionUpdate, MedicalGuidance, Note

4. **Condition Notes:**
   - Display `conditionNotes` if present

---

### Phase 7: Listings Management

#### Step 7.1: Listings Page

Route: `/listings`

**API Call:** `GET /api/v1/listings?page=X&pageSize=Y&species=&size=&gender=&status=&locationName=`

**Filter Controls:**
- Text input: "Species" (free text)
- Select: "Size" (options: All, Small, Medium, Large)
- Select: "Gender" (options: All, Male, Female, Unknown)
- Select: "Status" (options: All, Available, Pending, Adopted)
- Text input: "Location"

**Data Table Columns:**
| Column | Field |
|--------|-------|
| Photo | `primaryPhotoUrl` (thumbnail) |
| Name | `name` |
| Species | `species` |
| Breed | `breed` |
| Size | `size` |
| Status | `status` (badge) |
| Location | `locationName` |
| Created | `createdAt` |
| Actions | "View" link |

**Pagination:** Standard.

#### Step 7.2: Listing Detail Page

Route: `/listings/[id]`

**API Calls:**
- `GET /api/v1/listings/{id}` (full listing detail)
- `GET /api/v1/listings/{id}/applications` (applications for this listing)

**Structural elements:**

1. **Listing Info Section:**
   - Photo gallery (all photos from `photos` array, ordered by `sortOrder`)
   - Name, Species, Breed, Age (months + label), Gender, Size, Activity Level
   - Description (full text)
   - Location (name + coordinates)
   - Owner name
   - Status badge
   - Linked rescue case ID (if `rescueCaseId` is present, link to `/rescue-cases/[id]`)

2. **Applications Section:**
   - Table of `ApplicationResponse` items
   - Columns: Applicant Name | Status (badge) | Applied At | Updated At
   - Read-only for admin (accept/decline is listing owner's action)

3. **Admin Actions:**
   - "Remove Listing" button -> opens confirmation dialog with reason textarea
   - API: `POST /api/v1/admin/moderation` with `{ targetType: "Listing", targetId: id, actionType: "Removed", reason }`

---

### Phase 8: Moderation

#### Step 8.1: Moderation Log Page

Route: `/moderation`

**API Call:** `GET /api/v1/admin/moderation?page=X&pageSize=Y`

**Data Table Columns:**
| Column | Field |
|--------|-------|
| Date | `createdAt` |
| Admin ID | `adminId` (or resolved name if cross-referencing) |
| Action | `actionType` (badge: Removed, Suspended, Warned) |
| Target Type | `targetType` (Listing, Message, User) |
| Target ID | `targetId` (link to relevant detail page) |
| Reason | `reason` (truncated, expandable) |

**Pagination:** Standard.

#### Step 8.2: Create Moderation Action Form

Accessible from the moderation page or inline on other pages.

**Form Fields:**
| Field | Input Type | Validation | Options |
|-------|-----------|------------|---------|
| Target Type | Select (required) | Must be one of enum values | Listing, Message, User |
| Target ID | Text input (required) | Valid UUID format | - |
| Action Type | Select (required) | Depends on target type | Removed (Listing/Message), Suspended (User), Warned (User) |
| Reason | Textarea (required) | Non-empty string | - |

**Submit:** `POST /api/v1/admin/moderation`

**Validation Rules (from API):**
- Listing + Removed = valid
- Message + Removed = valid
- User + Suspended = valid
- User + Warned = valid
- Any other combination = 400 error

---

### Phase 9: Transport Tasks

#### Step 9.1: Transports Page

Route: `/transports`

**API Call:** `GET /api/v1/transports` (returns pending tasks)

**Data Table Columns:**
| Column | Field |
|--------|-------|
| Case ID | `caseId` (link to `/rescue-cases/[caseId]`) |
| Pickup | `pickupLocation` |
| Dropoff | `dropoffLocation` |
| Status | `status` (badge: Pending, Assigned, PickedUp, InTransit, Delivered) |
| Transporter | `transporterName` (or "Unclaimed" if null) |
| Created | `createdAt` |

**Note:** Admin views transport tasks read-only. Claiming and status updates happen from the mobile/transporter app.

---

### Phase 10: Pledges

#### Step 10.1: Pledges Page

Route: `/pledges`

**Note:** The current API does not have an admin-specific pledge listing endpoint. For now, this page serves as a read-only overview. If an admin pledge listing endpoint is added later, use it here.

**Placeholder implementation:**
- Display a message explaining pledge management is available through the main platform.
- OR if the admin also has a Sponsor role, use `GET /api/v1/pledges/me`.

---

### Phase 11: Shared Components

#### Step 11.1: DataTable Component

A reusable table component that accepts:
- `columns: Array<{ key, header, render? }>` - column definitions
- `data: T[]` - row data
- `isLoading: boolean` - shows skeleton rows
- `emptyMessage: string` - shown when data is empty

#### Step 11.2: Pagination Component

Accepts:
- `page: number`
- `totalPages: number`
- `hasNextPage: boolean`
- `hasPreviousPage: boolean`
- `onPageChange: (page: number) => void`

Renders: Previous/Next buttons, page number display, total count.

#### Step 11.3: ConfirmDialog Component

A modal dialog for destructive actions:
- `title: string`
- `message: string`
- `confirmLabel: string`
- `onConfirm: () => void`
- `onCancel: () => void`
- Optional: textarea for reason input (used by suspend, reject, moderate)

#### Step 11.4: StatusBadge Component

Renders a contextual badge for status enums:
- Accepts: `value: string`, `variant: "urgency" | "case" | "listing" | "application" | "transport"`
- Maps enum values to semantic meaning (no colors specified - just structural variant)

---

### Phase 12: API Client & Utilities

#### Step 12.1: Centralized API Client

File: `src/lib/api.ts`

```
Functions:
- apiClient.get<T>(path, params?) -> Promise<T>
- apiClient.post<T>(path, body?) -> Promise<T>
- apiClient.put<T>(path, body?) -> Promise<T>
- apiClient.delete(path) -> Promise<void>
```

Internal behavior:
1. Reads access token from cookie (server-side) or calls the BFF refresh route (client-side 401 handling).
2. Sets `Content-Type: application/json` for JSON bodies.
3. Sets `Content-Type: multipart/form-data` for file uploads.
4. Throws `ApiError` with `{ status, title, detail }` on non-2xx responses.

#### Step 12.2: Type Definitions

File: `src/lib/types.ts`

Define all interfaces matching `openapi.json` schemas. Key types:
- `AuthResponse`, `LoginRequest`
- `DashboardResponse`, `AdminCaseResponse`, `AdminUserResponse`
- `KycPendingResponse`, `ModerationLogResponse`, `ModerationRequest`
- `RescueCaseResponse`, `CaseUpdateResponse`
- `ListingResponse`, `ListingDetailResponse`, `ApplicationResponse`
- `TransportTaskResponse`
- `PledgeResponse`
- `PagedResult<T>`
- All enum types as TypeScript string literal unions

---

### Phase 13: Testing & Quality

#### Step 13.1: Set Up Testing

- Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
- Configure: `vitest.config.ts` with path aliases matching tsconfig
- Create test utilities: mock API responses, mock auth context

#### Step 13.2: Key Test Cases

- Auth flow: login success, login failure, token refresh, logout
- Middleware: redirect unauthenticated users, redirect non-admins, allow admins
- Dashboard: renders stat cards with correct data
- Users: table renders, filters work, suspend/unsuspend actions call correct API
- KYC: approve/reject flows call correct endpoints with correct payloads

---

### Phase 14: Deployment Configuration

#### Step 14.1: Cloudflare Pages Setup

- Build command: `pnpm build`
- Output directory: `.next` (or use `@cloudflare/next-on-pages`)
- Environment variables: Set `NEXT_PUBLIC_API_URL` to production API URL

#### Step 14.2: Cloudflare Zero Trust Integration

- The app runs at `admin.happypaws.lk`.
- Cloudflare Access policy restricts who can reach the app at the network level.
- The app's own JWT auth provides API-level authorization (defense in depth).
- No additional code needed - Zero Trust is configured in the Cloudflare dashboard.

---

## Implementation Order Summary

Execute in this exact sequence:

1. Project scaffolding (Step 1.1-1.4)
2. Auth system (Step 2.1-2.4) - login must work before building anything else
3. App shell (Step 3.1-3.2) - layout + dashboard
4. User management (Step 4.1-4.2) - most critical admin feature
5. KYC review (Step 5.1) - high-priority daily workflow
6. Rescue case management (Step 6.1-6.2)
7. Listings management (Step 7.1-7.2)
8. Moderation (Step 8.1-8.2)
9. Transports (Step 9.1) - read-only view
10. Pledges (Step 10.1) - lowest priority
11. Shared components refinement (Step 11.x) - extract patterns found during steps 4-10
12. Testing (Step 13.x)
13. Deployment (Step 14.x)
