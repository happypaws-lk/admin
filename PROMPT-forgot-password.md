# Implement: Forgot Password Flow — HappyPaws Admin Dashboard

## Agent role

You are an expert **Next.js 15+ and Frontend Architect**, specializing in the App Router, React Server Components (RSC), Client Components, and secure authentication flows. You are tasked with completing the "Forgot Password" UI flow for the HappyPaws Next.js Admin Dashboard. 

Your working directory is `admin/`. All file paths below are relative to that root.

---

## Before you write a single line of code

Read every one of these files in full to understand the project architecture and styling conventions:

1. `AGENTS.md` — Mandatory instructions, Next.js constraints, and code quality rules.
2. `src/app/(auth)/login/page.tsx` — The source of truth for the auth flow's styling (background blobs, glassmorphism card, dark UI theme).
3. `src/app/(auth)/forgot-password/page.tsx` — An existing scaffold that demonstrates the correct styling for the first step.
4. `src/app/(auth)/verify-reset-code/page.tsx` (and `_components`) — Existing scaffold for the OTP step.
5. `src/app/(auth)/reset-password/page.tsx` (and `_components`) — Existing scaffold for the final step.

---

## What you are building

The "Forgot Password" flow is a 3-step unauthenticated process that interacts with the backend API. The API endpoints already exist:
- `POST /api/v1/auth/forgot-password` (accepts `{ email }`)
- `POST /api/v1/auth/verify-reset-code` (accepts `{ email, code }`, returns `{ resetToken }`)
- `POST /api/v1/auth/reset-password` (accepts `{ email, resetToken, newPassword }`)

You must fully implement and refine the three screens. They must **perfectly match the visual style** of the `/login` page (the dark background, `#0d0f17`, glowing blobs, and `#131627/65` glassmorphism card).

---

## Step-by-Step Implementation

### Step 1: `src/app/(auth)/forgot-password/page.tsx`
This file is mostly correct but needs review.
- **Form:** Accepts an `email`.
- **Validation:** Zod schema (required, valid email).
- **Action:** Submits to `POST /api/v1/auth/forgot-password` (using standard `fetch` with the `NEXT_PUBLIC_API_URL` prefix).
- **On Success:** Redirects to `/verify-reset-code?email=user@example.com` using `useRouter`.
- **UI:** Must have the dark background, glass card, "Forgot password?" title, error banner (if applicable), and "Continue" button with loading spinner. Needs a `← Back to login` link.

### Step 2: `src/app/(auth)/verify-reset-code/`
The user enters the 6-digit OTP code sent to their email.
- **Client Component (`_components/VerifyResetCodeForm.tsx`):**
  - Read the `email` from the URL search params (`useSearchParams`). If missing, redirect back to `/forgot-password`.
  - **Inputs:** Six individual single-character boxes. They must auto-advance focus on typing, handle backspace to go to the previous box, and handle pasting a 6-digit code.
  - **Title:** "Check your email"
  - **Subtitle:** "Enter the 6-digit code we sent to {email}."
  - **Action:** Submit to `POST /api/v1/auth/verify-reset-code`.
  - **On Success:** The API returns `{ resetToken: string }`. Redirect to `/reset-password?email=...&resetToken=...`.
  - **Footer:** A "Resend code" button (calls `forgot-password` API again, ideally with a 60-second visual cooldown) and a "← Back" link.

### Step 3: `src/app/(auth)/reset-password/`
The user enters their new password.
- **Client Component (`_components/ResetPasswordForm.tsx`):**
  - Read `email` and `resetToken` from URL search params. Redirect to `/forgot-password` if missing.
  - **Title:** "Set a new password"
  - **Inputs:** "New password" and "Confirm password". Both should be type `password` with a show/hide eye toggle button (copy the exact SVG and logic from `login/page.tsx`).
  - **Validation:** Zod schema for min 8 chars, and confirming passwords match.
  - **Submit Button:** "Update Password". Keep it `disabled` (with lower opacity and `cursor-not-allowed`) until the form is fully valid.
  - **Action:** Submit to `POST /api/v1/auth/reset-password`.
  - **Success State:** When the API succeeds, *do not redirect immediately*. Replace the form in the card with a **Success View**: 
    - A large circular checkmark icon (green).
    - Heading: "Password changed"
    - Body: "Congratulations! Your password has been successfully updated."
    - Button: "Back to Login" (redirects to `/login`).

---

## Technical Constraints & Styling

1. **Next.js App Router:** 
   - All forms must be `"use client"` components since they manage state (`useState`, `useForm`, `useSearchParams`).
   - `page.tsx` for `verify-reset-code` and `reset-password` must wrap the client components in a `<Suspense>` boundary since they use `useSearchParams()`.
2. **Styling:** 
   - NO external UI libraries (no shadcn). Use raw Tailwind classes.
   - Background blobs: `bg-[#685cf0]/20` and `bg-[#4a29a0]/30`.
   - Card: `bg-[#131627]/65 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80`.
   - Inputs: `bg-[#181b2b]/90 border-[#2c3049] text-white focus:border-[#5b50e6] focus:ring-[#5b50e6]`.
   - Primary Buttons: `bg-[#5b50e6] hover:bg-[#4d42df]`.
3. **Data Fetching:** 
   - Since these are unauthenticated routes, use standard `fetch()` calls. Prefix the URL with `process.env.NEXT_PUBLIC_API_URL` (e.g., `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/...`).
4. **Error Handling:** 
   - Catch API errors and display them in an inline red banner (e.g. `bg-red-500/10 border-red-500/30 text-red-400`) above the form.

---

## Verification Plan

When you are done, verify the following manually:
1. `pnpm run build` succeeds without TS or ESLint errors.
2. The user can navigate to `/forgot-password`, enter an email, and click continue.
3. The `/verify-reset-code` page correctly reads the email from the URL and displays the 6 OTP input boxes.
4. Pasting a 6-digit code into the OTP boxes distributes the characters properly across the inputs.
5. The `/reset-password` page correctly prevents submission until the passwords match.
6. The show/hide password toggles work.
7. Upon successful reset, the success view appears inside the glass card without redirecting abruptly.
