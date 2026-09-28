# DESIGN.md - PadosiPro take-home

## Architecture

Monorepo (`mobile/`, `server/`, `docker-compose.yml`, npm workspaces):

- **Mobile (Expo SDK 57, TypeScript, Expo Router, NativeWind):** file-based routes in `app/` (`auth/`, `onboarding/`, `main/`). All screens are native components styled with Tailwind; one UI kit (`components/ui.tsx`) + tokens (`constants/theme.ts`, mirrored in `tailwind.config.js`). `services/` holds the typed API client, `store/AuthContext.tsx` holds the JWT (SecureStore) and bootstraps `/me` to route users to auth / onboarding / home. No business logic in screens beyond form state.
- **Search & Discovery Engine (`mobile/services/searchIndex.ts`):** client-side fuzzy / word-level search index over categories, help kinds, services, and curated phrases. Surfaces best matches, alternative category possibilities, and DIY partner redirects (e.g. Booking.com, PolicyBazaar). Seamlessly normalizes tasks picked via search for the urgency/confirmation flow.
- **Backend (Node + Express + TypeScript, Prisma + PostgreSQL):** thin routers (`auth`, `profile`, `tasks`, `household`), bcrypt for passwords and OTP codes, JWT (30d) for sessions, Zod validation on every input, one centralized error shape `{ ok, error }`. `EmailService` abstraction: SMTP when `SMTP_HOST` is set (local Mailpit via compose, any provider in prod), console fallback otherwise.
- **Data:** `User` → `OtpCode` / `UserProfile` / `ServiceRequest` / `HouseholdMember`. The task catalogue is seeded reference data: 14 categories holding 24 help-kinds + 27 services (51 selectable tasks, each with name + category + description), so the "≥20 tasks" requirement is met by selectable items, not category rows.

## Main trade-offs

- **Password + OTP (not OTP-only):** the brief demands email+password login for verified users. OTP stays for verification only. Passwords are bcrypt-hashed; unverified logins get 403 + a verification redirect.
- **Account & Mobile Safety:** registration strictly enforces unique 10-digit mobile numbers; attempts to register an already-verified email cleanly redirect to login with the email prefilled.
- **One request per picked service** instead of a multi-item order table: matches how an LM works (each need is tracked separately) and reuses the existing `ServiceRequest` model.
- **Shared urgency + details on the confirm screen** rather than per-task: one confirm step for N picks, as the brief asks.
- **Business Name optional:** most accounts are individuals; forcing it adds signup friction and the LM collects it later when relevant.
- **Mailpit over Ethereal:** runs offline in compose, inbox at `:8025`, same SMTP code path as production.
- **Expo Go compatible:** no custom native code, so reviewers run it without a dev build.

## Security & Resilience

- **Secure Auth Transmission:** Dev OTPs are passed through in-memory module storage rather than URL query parameters or browser history.
- **Production Secrets & CORS:** Production environment enforces non-empty `JWT_SECRET`; Express API enforces restricted origins via `ALLOWED_ORIGINS`.
- **Keyboard & Deep Navigation Resilience:** Dynamic keyboard tracking with `onLayout` field coordinates prevents lower inputs (like Business Name) from being hidden by the soft keyboard. Multi-layer URL decoding handles parameter unwrapping across navigation hops.

## Left out (deliberately)

Payments, chat backend (LM card "Chat" is visual), wallet top-up, push notifications, admin - none in the brief's journey. No refresh-token rotation (30d JWT + SecureStore is enough for a take-home). "Soon" catalogue categories are visible but not selectable, per the reference.

## With another week

Wire a real SMTP provider and remove the dev-OTP echo; add refresh-token rotation + server-side logout denylist; request detail/status timeline screens driven by `ServiceRequest.status`; EAS preview APK + a 2–3 min screen recording; load the catalogue from an admin-editable source instead of seed data.
