<div align="center">

# PadosiPro

### Your Neighborhood Lifestyle & Home Services Assistant

A production-grade native mobile application and backend platform recreating the end-to-end PadosiPro experience. Built with native performance, responsive design tokens, robust authentication, and resilient local-first workflows.

[![React Native](https://img.shields.io/badge/React_Native-0.86-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-NativeWind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://www.nativewind.dev/)

---

</div>

## Overview

PadosiPro connects residents with dedicated Lifestyle Managers (LMs) to handle everyday domestic errands, repairs, travel coordination, and concierge services. Every screen is implemented using native primitives and styled with a curated design system (NativeWind/Tailwind) without WebViews or third-party UI wrappers.

### Key Capabilities

- **Intelligent Search & Catalog Discovery:** Instant word-level weighted catalog indexing over 50+ service offerings with direct partner shortcuts (Booking.com, PolicyBazaar).
- **Multi-Service Batch Requests:** Multi-select errands across categories, configure shared urgency levels (Standard, Same Day, Express, Scheduled), and submit in a single unified flow.
- **Secure Dual-Layer Authentication:** Password-protected accounts backed by bcrypt hashing and 6-digit OTP verification with rate limiting, cooldown protection, and in-memory credential passing.
- **Household & Profile Management:** Persistent household member profiles (family, staff, pets) to give your assigned Lifestyle Manager complete context.
- **Offline Dev Experience:** Out-of-the-box local SMTP capture via Mailpit, automated database seeding, and zero-config development fallbacks.

---

## App Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <img src="mobile/assets/images/app-ss/home-dashboard.png" alt="Home Dashboard & Requests" width="220" />
        <br />
        <sub><b>Home & Requests</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="mobile/assets/images/app-ss/categories-selection.png" alt="Task & Category Selection" width="220" />
        <br />
        <sub><b>Category & Service Selection</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="mobile/assets/images/app-ss/urgency-selection.png" alt="Urgency & Timeline" width="220" />
        <br />
        <sub><b>Urgency & Timeline</b></sub>
      </td>
      <td align="center" width="25%">
        <img src="mobile/assets/images/app-ss/request-submitted.png" alt="Request Confirmation" width="220" />
        <br />
        <sub><b>Leave It With Us (Success)</b></sub>
      </td>
    </tr>
  </table>
</div>

---

## Repository Structure

```
padosipro/
├── mobile/                      # Expo React Native client application
│   ├── app/                     # File-based navigation routes (Expo Router)
│   │   ├── auth/                # Welcome, Login, OTP verification screens
│   │   ├── onboarding/          # Profile details & address capture
│   │   └── main/                # Home, Categories, Urgency, Confirm, Account
│   ├── components/ui.tsx        # Reusable design system primitives & buttons
│   ├── services/                # Typed API clients & catalog search index
│   ├── store/                   # SecureStore token management & auth context
│   └── tailwind.config.js       # PadosiPro design tokens (mint, gold, forest)
├── server/                      # Node.js + Express backend service
│   ├── prisma/                  # Schema, migrations, and catalog seed script
│   └── src/
│       ├── routes/              # Modular Express route handlers
│       ├── middleware/          # JWT authentication & validation middleware
│       ├── services/            # Pluggable email & OTP delivery service
│       └── config/              # Centralized environment configuration
├── docker-compose.yml           # Local PostgreSQL 16 + Mailpit SMTP stack
└── package.json                 # Monorepo workspaces configuration
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.x or newer (v20+ recommended)
- **Docker**: Docker Desktop or Docker Engine running locally
- **Expo Go App**: Installed on physical Android/iOS device (or Android Studio emulator)

### 1. Clone & Install Dependencies

From the repository root:

```sh
npm install
```

### 2. Start the Local Infrastructure

Start PostgreSQL (port `5432`) and the Mailpit local mail server (port `1025` SMTP, port `8025` web UI):

```sh
docker compose up -d
```

### 3. Initialize the Backend Service

```sh
cd server
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The API server will listen on `http://localhost:3001` (or your configured `PORT`).

### 4. Launch the Mobile Application

In a separate terminal window:

```sh
cd mobile
cp .env.example .env
npx expo start
```

Scan the QR code displayed in your terminal using **Expo Go** on your mobile device, or press **`a`** to launch on a running Android emulator.

---

## Device & Network Configuration

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to ensure your mobile device can reach the backend server:

| Target Environment | `EXPO_PUBLIC_API_URL` | Setup Instructions |
|---|---|---|
| **Android Emulator** | `http://10.0.2.2:3001` | Default emulator alias for host machine localhost |
| **Android Device (USB / ADB)** | `http://localhost:3001` | Run port reverse command (see below) |
| **Physical Phone (Same Wi-Fi)** | `http://<YOUR-LOCAL-IP>:3001` | Find via `ipconfig` (Windows) or `ifconfig` (macOS/Linux) |

### Port Forwarding for Android Emulator & USB Devices

When developing on an Android emulator or a physical device connected via USB, run ADB reverse to route requests seamlessly:

```sh
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3001 tcp:3001
```

> **Note:** Restart the Expo dev server (`npx expo start`) whenever you modify `mobile/.env`. You can verify API health by navigating to `<API_URL>/health` in your mobile browser.

---

## User Journey & Core Flows

```
[Register] ────────> [OTP Verify] ────────> [Auto Sign-In] ────────> [Onboarding]
(Email + Mobile)     (6-Digit Code)         (Secure JWT Token)       (Address & Name)
                                                                            │
┌───────────────────────────────────────────────────────────────────────────┘
▼
[Category / Search] ──────> [Urgency & Details] ──────> [Review & Confirm] ──────> [Home]
(Select Errand Tasks)       (Standard / Same-Day)       (Consolidated Batch)       (Track Requests)
```

1. **Registration & Collision Prevention:** New accounts register with email, a unique 10-digit Indian mobile number, and password. If a verified account already exists for that email, the user is redirected to Log In.
2. **OTP Verification:** Verification codes expire in 10 minutes and support a 30s resend cooldown with a 5-attempt brute-force lock. In local development without SMTP, the active OTP appears in a gold banner on the screen and in terminal logs.
3. **Onboarding:** Captures delivery address, society, flat number, and optional business details.
4. **Task Multi-Select & Review:** Tasks can be selected from categorized lists or discovered via search suggestions. The review screen allows inspecting and deleting specific tasks before final submission.
5. **Session Persistence:** Returning verified users log in with their email/mobile and password, automatically restoring session tokens from device SecureStore.

---

## Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | - | PostgreSQL connection URI |
| `JWT_SECRET` | Yes | `dev-only-...` | Secret used to sign authentication tokens (strict in prod) |
| `PORT` | No | `3001` | HTTP port for the Express API |
| `NODE_ENV` | No | `development` | Runtime environment (`development` / `production`) |
| `OTP_EXPIRY_MINUTES` | No | `10` | OTP code lifespan in minutes |
| `OTP_RESEND_SECONDS` | No | `30` | Minimum wait duration between OTP resend requests |
| `OTP_MAX_ATTEMPTS` | No | `5` | Maximum failed attempts allowed per OTP code |
| `SMTP_HOST` | No | `localhost` | Outgoing SMTP host (Mailpit or cloud provider) |
| `SMTP_PORT` | No | `1025` | SMTP port (Mailpit default is `1025`) |
| `ALLOWED_ORIGINS` | No | `*` | Allowed CORS origins for cross-origin client requests |

### Mobile (`mobile/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | Yes | `http://localhost:3001` | Base URL pointing to the running backend service |

---

## Quality Assurance & Verification

### Running Automated Checks

```sh
# Typecheck entire workspace
npm run typecheck

# Execute backend unit test suite
npm run test:server

# Run auth integration tests against an isolated test database
docker exec padosipro-postgres createdb -U padosi padosipro_test
cd server && TEST_DATABASE_URL="postgresql://padosi:padosi@localhost:5432/padosipro_test?schema=public" npx prisma migrate deploy
TEST_DATABASE_URL="postgresql://padosi:padosi@localhost:5432/padosipro_test?schema=public" npm run test:integration
```

### Building the Android APK

The project includes a configured `mobile/eas.json` for generating standalone Android APKs via EAS Build:

```sh
cd mobile

# 1. Log in to Expo (one-time setup)
npx eas-cli login

# 2. Trigger the cloud APK build
npx eas-cli build -p android --profile preview
```

Once the build finishes, EAS provides a direct download link for the installable `.apk` file that can be side-loaded onto any Android phone or emulator.

### Manual QA Checklist

- [x] **Registration:** Enter fresh email + 10-digit mobile + password -> OTP generated and verified.
- [x] **Duplicate Guard:** Attempting to register an already-verified email displays a banner and redirects to login with email pre-filled.
- [x] **Mobile Uniqueness:** Attempting to register with an existing mobile on a different email returns 409 Conflict.
- [x] **Search Discovery:** Searching for "Travel insurance" surfaces "Insurance claim coordination" with zero tasks dropped in confirm step.
- [x] **Keyboard Avoidance:** Focusing on lower onboarding inputs (e.g. Business Name) scrolls smoothly above the soft keyboard.
- [x] **Household Directory:** Adding, listing, and removing household members persists across app relaunches.
- [x] **Session Recovery:** Force-closing and reopening the app restores session without requiring re-authentication.

---

## Security & Architecture Highlights

- **In-Memory Credential Exchange:** Sensitive development OTP codes are kept in application memory rather than leaked into URL query parameters or device navigation history.
- **Production Secret Validation:** Express refuses to start in production if `JWT_SECRET` is unset or default.
- **Strict Input Sanitization:** Every API endpoint validates payloads via Zod schemas, enforcing E.164-compatible Indian mobile normalization and email downcasing.
- **Relational Integrity:** PostgreSQL schemas leverage cascading deletions on child records (profiles, OTPs, service requests) to prevent orphaned data.

---

## License

This project was developed as a technical evaluation submission and is private to PadosiPro.

