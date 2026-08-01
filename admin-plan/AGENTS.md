# HappyPaws Admin - Agent Instructions

This document is the master rulebook for any AI agent building the HappyPaws Admin Next.js application. Follow every rule below without exception.

---

## 1. Tech Stack

- **Framework:** Next.js 15+ (App Router only)
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm
- **HTTP Client:** Native `fetch` via Next.js server actions and route handlers
- **Form Handling:** React Hook Form + Zod for validation
- **State Management:** React Context + `useReducer` for auth state; no external state libraries unless explicitly needed
- **Real-time:** Native WebSocket or socket.io-client for SignalR hub connections (chat features are out of scope for the admin panel unless explicitly requested)

---

## 2. Project Structure

Use a feature-based folder structure inside `src/`:

```
src/
  app/                        # Next.js App Router pages
    (auth)/
      login/page.tsx          # Login page (unprotected)
    (dashboard)/
      layout.tsx              # Authenticated shell (sidebar, header)
      page.tsx                # Dashboard home (/)
      users/
        page.tsx              # User management
        [id]/page.tsx         # User detail (if needed)
      rescue-cases/
        page.tsx              # Rescue case management
      listings/
        page.tsx              # Listing management
        [id]/page.tsx         # Listing detail
      kyc/
        page.tsx              # KYC review queue
      moderation/
        page.tsx              # Moderation log
      transports/
        page.tsx              # Transport task overview
      pledges/
        page.tsx              # Pledge overview
    layout.tsx                # Root layout
    not-found.tsx             # 404 page
  components/
    Header/
      index.tsx               # Main header component
      UserMenu.tsx            # Child component
    Sidebar/
      index.tsx
      NavItem.tsx
    DataTable.tsx             # Standalone single-file component (permitted)
    Pagination.tsx
    StatusBadge.tsx
    ConfirmDialog.tsx
  lib/
    api.ts                    # Centralized API client (base URL, auth headers, refresh logic)
    auth.ts                   # Auth utilities (token decode, storage, middleware helpers)
    types.ts                  # TypeScript types generated/derived from openapi.json
    constants.ts              # App-wide constants (API base URL, routes, enum labels)
  hooks/
    useAuth.ts                # Auth context hook
    usePagination.ts          # Pagination state hook
  middleware.ts               # Next.js middleware for route protection
```

### Component Rules

- If a component requires child components, create a folder with an `index.tsx` as the entry point.
- If a component is a single file with no children, keep it as a standalone `.tsx` file (no folder needed).
- Never nest feature components more than 2 levels deep inside `components/`.
- Page-specific components that are NOT reused elsewhere should live in a `_components/` subfolder next to the page file.

---

## 3. Routing & Authentication

### Deployment

- The app is deployed at `admin.happypaws.lk`.
- It is protected by **Cloudflare Zero Trust** at the network level.
- The app itself still requires API-level authentication (JWT) for all data operations.

### Route Protection

- The root route `/` is the main admin dashboard.
- All routes under `/(dashboard)` require an authenticated session with the `Admin` role.
- The `/login` route is the only unprotected route.
- **Unauthorized access** (no token, expired token, non-Admin role) must trigger an automatic redirect to `/login`.
- Implement route protection in `middleware.ts` using Next.js middleware. The middleware must:
  1. Check for a valid access token (stored in an HTTP-only cookie).
  2. If missing or expired, attempt a silent refresh using the stored refresh token.
  3. If refresh fails, redirect to `/login` and clear all auth cookies.
  4. If the token's roles do not include `Admin`, redirect to `/login`.

### Auth Flow

- Login: POST to `/api/v1/auth/login` with email + password.
- On success, store `accessToken` and `refreshToken` in HTTP-only, Secure, SameSite=Strict cookies.
- The access token expires in 15 minutes; the refresh token in 7 days.
- Implement automatic token refresh in the API client (intercept 401 responses, call `/api/v1/auth/refresh`, retry the original request).
- On logout: call `/api/v1/auth/revoke` with the refresh token, then clear cookies and redirect to `/login`.

---

## 4. API Integration

### Critical Rule

Before writing ANY data-fetching logic, API call, type definition, or request/response handling, you MUST first read the `openapi.json` file located in this same directory (`admin-plan/openapi.json`). This file is the single source of truth for:

- All available endpoints and their HTTP methods
- Request body schemas (required fields, types, formats)
- Response schemas (field names, types, nullable fields)
- Query parameters and path parameters
- Error response codes and their meanings
- Enum values for dropdowns and filters

### API Client Design

- Create a centralized API client in `src/lib/api.ts`.
- The client must:
  1. Prepend the base URL (configurable via environment variable `NEXT_PUBLIC_API_URL`).
  2. Automatically attach the `Authorization: Bearer <accessToken>` header.
  3. Handle 401 responses by attempting a token refresh before failing.
  4. Return typed responses matching the OpenAPI schemas.
  5. Throw typed errors that the UI can catch and display.

### Data Fetching Patterns

- For server components: use `fetch` directly in the component with the auth cookie forwarded.
- For client components: use the centralized API client via custom hooks.
- All paginated endpoints return `PagedResult<T>` with `items`, `totalCount`, `page`, `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`.

---

## 5. UI Guidelines

### Absolute Rules

- **DO NOT** specify any CSS, Tailwind classes, color schemes, font sizes, spacing, or visual styling.
- **DO NOT** choose or recommend a UI component library (no shadcn, MUI, Ant Design, etc.).
- Focus EXCLUSIVELY on:
  - Page structure and layout hierarchy (what sections exist, what goes where)
  - Form fields (which inputs, their types, labels, validation rules)
  - Tables (which columns, sort/filter capabilities)
  - Interactive elements (buttons, dropdowns, modals, confirmations)
  - Data flow (what data appears where, how it updates)
  - UX flows (what happens on click, form submission, error states)

### Structural Requirements for Each Page

When building a page, specify:
1. The data it fetches (which API endpoint, query params).
2. The structural elements (table with columns X/Y/Z, form with fields A/B/C).
3. The actions available (button triggers what API call).
4. Error and empty states (what appears when data is empty or request fails).
5. Loading states (skeleton or spinner placement).

### Form Fields Specification

For every form, define:
- Field name, corresponding API property, input type (text, email, number, select, textarea, file, checkbox, etc.)
- Validation rules derived from the OpenAPI schema (required, min/max length, enum values for selects)
- Error message placement (inline below field)

### Tables Specification

For every data table, define:
- Column headers mapped to response object fields
- Which columns are sortable
- Which columns have filter controls
- Row actions (view, edit, delete, approve, reject, etc.)
- Pagination controls (using the PagedResult shape)

---

## 6. Error Handling

- Display API errors inline where they occur (form validation errors below fields, toast for action failures).
- Network errors should show a retry-able error state.
- 403 errors should show an "insufficient permissions" message (should rarely happen since the app is admin-only).
- 404 errors should redirect to the appropriate list page.

---

## 7. Environment Variables

The app requires these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the HappyPaws API | `https://api.happypaws.lk` |
| `AUTH_COOKIE_DOMAIN` | Cookie domain | `.happypaws.lk` |
| `AUTH_COOKIE_SECURE` | Whether cookies require HTTPS | `true` |

---

## 8. Code Quality Rules

- Use `"use client"` directive only when the component needs interactivity (event handlers, hooks, browser APIs).
- Default to server components for data display.
- Never use `any` type. Derive types from the OpenAPI spec or define explicit interfaces.
- Use barrel exports (`index.ts`) only at the `components/` level, not deeper.
- Keep page components thin - extract data fetching into server actions or hooks, extract complex UI into sub-components.
