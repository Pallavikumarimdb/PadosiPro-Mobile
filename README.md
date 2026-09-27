# PadosiPro — Take-Home Assignment (Native Mobile)

Native mobile recreation of the PadosiPro reference flow (`/ss` screenshots are the design source of truth).
No WebView/iframe — every screen is React Native + Tailwind (NativeWind).

**Stack:** Expo SDK 57 + TypeScript + Expo Router + NativeWind · Node.js + Express + TypeScript · PostgreSQL + Prisma

## User flow

`Welcome (register) → OTP → Login → Onboarding (name, mobile, address, business name) → Task selection → Urgency → Details → Account`

Returning users with a completed profile skip onboarding (startup gate in `mobile/app/index.tsx`).

## Repo structure

```
package.json        npm workspaces root (mobile + server) + one-command scripts
server/             Express + TypeScript API
  src/config/       env config
  src/routes/       auth.ts, profile.ts, tasks.ts (Express routers)
  src/services/     email.ts (Dev/Prod abstraction), tasks.ts (category catalog)
  src/middleware/   auth.ts (JWT Bearer guard)
  src/utils/        otp.ts (generate/hash/validate), otp.test.ts
  prisma/           schema.prisma, seed.ts
mobile/             Expo app (created with `npx create-expo-app@latest mobile --template tabs`)
  app/              Expo Router screens: index, auth/, onboarding/, main/
  components/ui.tsx reusable design system (Screen, Field, OtpInput, PrimaryButton, Chip, ...)
  constants/theme.ts design tokens (also mirrored in tailwind.config.js)
  services/         api.ts (typed client), padosi.ts (auth/profile/tasks)
  store/AuthContext.tsx token in SecureStore + /me bootstrap
  eas.json          preview APK profile
ss/                 reference screenshots (design only, never embedded)
docker-compose.yml  local PostgreSQL
.gitignore          node_modules, .env, build output (never commit secrets)
```

## Monorepo shortcuts (run from repo root)

```sh
npm install            # installs mobile + server workspaces
npm run db:up          # same as docker compose up -d
npm run dev            # server (:3000) + Expo dev server together
npm run typecheck      # tsc --noEmit for server and mobile
npm run test:server    # backend unit tests
```

Per-app commands still work (`npm run dev --workspace=server`, or `cd server` / `cd mobile`).


## Prerequisites

- Node.js LTS (22+), npm
- Docker (for PostgreSQL) **or** a local PostgreSQL 16
- Expo Go on an Android device (quickest), or an Android emulator
- For APK: an Expo account + `npx eas-cli@latest`

## 1. Database

```sh
docker compose up -d            # postgres:16 at localhost:5432 (padosi/padosi/padosipro)
```

Or use your own Postgres and set `DATABASE_URL` accordingly.

## 2. Backend

```sh
cd server
cp .env.example .env            # defaults match docker-compose
npm install
npx prisma generate
npx prisma migrate dev          # creates tables
npx prisma db seed              # seeds the 14 task categories
npm run dev                     # http://localhost:3000
npm test                        # validation unit tests (5 passing, no DB needed)
```

`.env` example (`server/.env.example`):

```
DATABASE_URL=postgresql://padosi:padosi@localhost:5432/padosipro?schema=public
JWT_SECRET=dev-only-change-me-min-32-chars
PORT=3000
OTP_EXPIRY_MINUTES=10
OTP_RESEND_SECONDS=30
OTP_MAX_ATTEMPTS=5
```

## 3. Mobile

```sh
cd mobile
cp .env.example .env
npm install
npx expo start                  # scan QR with Expo Go
```

`mobile/.env.example`:

```
# Android emulator -> host machine. Physical device -> your LAN IP, e.g. http://192.168.1.5:3000
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

Checks: `npx tsc --noEmit` (typecheck) · `npx expo export --platform web` (bundle sanity).

## 4. Android APK (EAS, per https://docs.expo.dev)

```sh
cd mobile
npx eas-cli@latest login
npx eas-cli@latest init         # links app.json to your Expo project id
npx eas-cli@latest build -p android --profile preview   # produces an installable APK
```

Local alternative (needs Android Studio): `npx expo run:android`.

## Test credentials / development OTP

No real email provider is wired. `DevelopmentEmailService` **logs every OTP to the backend console**:

```
[DEV EMAIL] OTP for you@example.com: 482913 (expires in 10 min)
```

Plus, in non-production, the OTP is returned as `devOtp` in the API response and shown in a gold box on the OTP screen (`__DEV__` only). Never hard-coded — random 6-digit, bcrypt-hashed at rest, 10-min expiry, 5 attempts max, 30s resend cooldown, single-use.

Manual QA script: register → read OTP from backend logs → verify → login (`auth/login` accepts email or mobile) → onboarding → save → task selection → pick category/kind/service → urgency → details → “Leave it with us” → restart app (session persists) → account → sign out → log in again. Covered API cases: invalid/expired OTP, resend cooldown, bad token (401 + signed out), backend down (friendly retry UI, never a crash).

## API

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/health` | – | |
| POST | `/auth/register` | – | `{email, mobile}` → sends OTP |
| POST | `/auth/send-otp` | – | `{email}` (resend) |
| POST | `/auth/verify-otp` | – | `{email, code}` → `{token, user, profile}` |
| POST | `/auth/login` | – | `{identifier}` → sends OTP (+ account email) |
| GET | `/auth/me` | Bearer | `{user, profile}` |
| POST | `/auth/logout` | Bearer | stateless confirm |
| GET/PUT | `/profile` | Bearer | fullName, address, city, society, flatUnit, gateNotes, businessName |
| GET | `/tasks` | – | category catalog (DB or built-in fallback) |
| GET/POST | `/requests` | Bearer | persist selected task/request |

## Troubleshooting

- **App can't reach backend on emulator:** use `http://10.0.2.2:3000`; on a physical phone use your PC's LAN IP and ensure the firewall allows port 3000.
- **Prisma can't connect:** `docker compose ps`, verify `DATABASE_URL`, then `npx prisma migrate dev`.
- **Port 3000 busy:** change `PORT` in `server/.env` and `EXPO_PUBLIC_API_URL` to match.
- **Stale styles after Tailwind changes:** `npx expo start --clear`.
- **`expo-doctor` version warnings after adding packages:** `npx expo install --fix`.

## Publish to GitHub (single repo)

```sh
git init -b main
git add .
git commit -m "PadosiPro take-home: Expo app + Express API + Postgres"
gh repo create padosipro-assignment --private --source=. --push
# or: git remote add origin <url> && git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.env`, and build output — secrets never get committed.
