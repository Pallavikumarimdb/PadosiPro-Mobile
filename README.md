# PadosiPro — Take-Home Assignment

Native mobile recreation of the PadosiPro reference flow (`/ss` screenshots are the design source of truth). No WebView — every screen is React Native + Tailwind (NativeWind).

**Stack:** Expo SDK 57 + TypeScript + Expo Router + NativeWind · Node.js + Express + TypeScript · PostgreSQL + Prisma

**User Flow:** Register (email + mobile + password) → OTP verification → Immediate session sign-in → Onboarding (Details, Household, Categories) → Task multi-select → Confirm → Home (view submitted requests). Returning verified users log in directly via email/mobile + password.

```
mobile/             Expo app (screens in app/, UI kit in components/ui.tsx)
server/             Express API (routes/, services/, middleware/) + Prisma schema
docker-compose.yml  local PostgreSQL + Mailpit
```

## Run it

```sh
npm install              # installs mobile + server workspaces
docker compose up -d     # postgres :5432 + Mailpit :1025 (inbox at :8025)

cd server
cp .env.example .env     # check PORT (default 3001 or 3000)
npx prisma migrate dev && npx prisma db seed
npm run dev              # http://localhost:3001 (or your configured PORT)

cd ../mobile
cp .env.example .env     # set EXPO_PUBLIC_API_URL matching your server PORT
npx expo start           # scan QR with Expo Go or run on Android emulator
```

Or `npm run dev` from root for server + Expo together.

### API URL by Platform

| Running on | `EXPO_PUBLIC_API_URL` | Notes |
|---|---|---|
| Android emulator | `http://10.0.2.2:3001` | Use port from `server/.env` |
| Android via USB / ADB | `http://localhost:3001` | Run `adb reverse` (see below) |
| Physical phone (same Wi-Fi) | `http://<PC-LAN-IP>:3001` | Run `ipconfig` (Windows) / `ifconfig` (Mac/Linux) |

> **Tip for Android Emulator & USB Devices:** Run reverse forwarding so the device can reach both Metro and the API directly on localhost:
> ```sh
> adb reverse tcp:8081 tcp:8081
> adb reverse tcp:3001 tcp:3001
> ```

Restart Expo after any `.env` change. Test the API path from your device browser first: `<URL>/health` should return `{"ok":true,...}`.

## Email & OTP Delivery

Set `SMTP_HOST` in `server/.env` to send real mail — local Mailpit via compose (`SMTP_HOST=localhost`, inbox at http://localhost:8025), or any real SMTP provider in production. Leave `SMTP_HOST` empty to log OTPs to the backend console instead (plus a dev-only gold banner on the OTP screen):

```
[DEV EMAIL] OTP for you@example.com: 482913 (expires in 10 min)
```

OTPs are random 6-digit codes, bcrypt-hashed at rest, 10-min expiry, 5 max attempts, 30s resend cooldown, and single-use. Dev OTP is transferred in-memory between screens (never exposed in URL query parameters).

## Account Rules & QA Path

1. **Re-registration Guard:** If an email is already verified, re-registration returns a redirect to Log In with email pre-filled.
2. **Mobile Uniqueness:** Each account requires a unique 10-digit Indian mobile number. Conflicting mobile numbers are rejected during registration.
3. **QA Path:** Register → OTP → verify → automatic sign-in → onboarding details → save → multi-select services (or search match) → confirm (urgency + details) → home lists submitted requests → restart app (session persists via SecureStore) → account → household → sign out → log in again.
4. **Business Name:** Optional in onboarding — most accounts are individuals/households, so forcing it adds signup friction; the Lifestyle Manager collects it later when relevant.

## Other Commands

```sh
npm run typecheck          # tsc for server + mobile
npm run test:server        # backend unit tests (no DB)
# API integration tests (OTP expiry/attempts, login rules) against an isolated DB:
docker exec padosipro-postgres createdb -U padosi padosipro_test
cd server && TEST_DATABASE_URL="postgresql://padosi:padosi@localhost:5432/padosipro_test?schema=public" npx prisma migrate deploy
TEST_DATABASE_URL="postgresql://padosi:padosi@localhost:5432/padosipro_test?schema=public" npm run test:integration
cd mobile && npx eas-cli@latest build -p android --profile preview   # APK
```

## Troubleshooting

- **Cannot connect to Expo CLI / network error:** Ensure `adb reverse tcp:8081 tcp:8081` and `adb reverse tcp:3001 tcp:3001` are run, and press `r` in the Expo terminal to reload.
- **Can't reach server:** Verify that the port in `mobile/.env` matches `PORT` in `server/.env` (e.g. `3001`), and Windows Firewall allows inbound connections on that port.
- **Prisma can't connect:** Run `docker compose ps` and verify `DATABASE_URL` in `server/.env`.
- **Stale app/styles:** Run `npx expo start --clear`.
