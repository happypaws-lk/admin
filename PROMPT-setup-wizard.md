# Task: Implement One-Time Admin Setup Page

## Goal

Add a first-time setup experience to the admin panel. When no admin account exists in the system, the user should see a setup page instead of the login page. Once the admin account is created, the setup page locks out permanently and the normal login flow takes over.

This is the same pattern used by Coolify, Ghost, WordPress, and other self-hosted tools.

---

## Backend API Endpoints (being built simultaneously)

These two new endpoints will be available at the backend:

### `GET /api/v1/setup/status`
- Public (no auth required)
- Response: `{ "isSetupComplete": boolean }`
- Returns `true` if at least one admin account exists

### `POST /api/v1/setup/complete`
- Public (no auth required)
- Request body: `{ "name": string, "email": string, "password": string }`
- **201 Success response:** `{ "accessToken": string, "refreshToken": string, "expiresAt": string }`
- **409 Conflict:** Setup already completed (admin exists)
- **422 Validation error:** Standard ProblemDetails with field errors

---

## What to Build

### 1. Setup Route Handler

Create a Next.js API route handler for the setup POST request, following the same auth cookie pattern used by the existing login route handler. On success, it should set the auth cookies (same way login does) and return success to the client.

### 2. Setup Page

Create the setup page at `(auth)/setup/page.tsx`. Study the existing login page and other auth pages to match the project's auth patterns, styling approach, and component conventions.

**Form fields:**
- Full name (text, required, 2-100 chars)
- Email address (email, required)
- Password (password, required, min 8 chars, with show/hide toggle)
- Confirm password (must match password, client-side only, do NOT send to backend)

**Behavior:**
- On mount, check setup status via the backend. If setup is already complete, redirect to `/login`.
- On successful submission, set cookies and navigate to the dashboard (same flow as login).
- On 409, show a message that setup is already done and redirect to `/login`.
- On validation errors, display them inline.
- Show loading states during the status check and form submission.

**Design:** Make it feel like a welcoming first-time setup experience, not just another login form. This is the admin's first impression of the platform. Go all out.

### 3. Login Page Modification

Modify the login page to check setup status on mount. If no admin exists yet, redirect to `/setup` instead of showing the login form. Show a brief loading state while checking.

### 4. Middleware / Proxy Awareness

The `/setup` route needs to be accessible without authentication (just like `/login`). Make sure the middleware or proxy configuration allows unauthenticated access to it.

---

## Verification

Run `pnpm dev` and confirm the app compiles. The setup page should be reachable at `/setup`.
