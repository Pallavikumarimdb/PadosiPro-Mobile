# PadosiPro — Take-Home Assignment

Native mobile recreation of the PadosiPro reference flow (`/ss` screenshots are the design source of truth). No WebView — every screen is React Native + Tailwind (NativeWind).

**Stack:** Expo SDK 57 + TypeScript + Expo Router + NativeWind · Node.js + Express + TypeScript · PostgreSQL + Prisma

**Flow:** Register (email + password) → OTP → Login (verified users) → Onboarding → Task multi-select → Confirm → Home (lists your requests). Returning users skip onboarding.

```
mobile/             Expo app (screens in app/, UI kit in components/ui.tsx)
server/             Express API (routes/, services/, middleware/) + Prisma schema
docker-compose.yml  local PostgreSQL
```

## Run it

```sh
npm install              # installs mobile + server workspaces
docker compose up -d     # postgres :5432 + Mailpit :1025 (inbox at :8025)

cd server
cp .env.example .env
npx prisma migrate dev && npx prisma db seed
npm run dev              # http://localhost:3000

cd ../mobile
cp .env.example .env     # then set EXPO_PUBLIC_API_URL (below)
npx expo start           # scan QR with Expo Go
```

Or `npm run dev` from root for server + Expo together.

| Running on | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android emulator | `http://10.0.2.2:3000` |
| Physical phone (same Wi-Fi) | `http://<PC-LAN-IP>:3000` (`ipconfig` → IPv4) |

Restart Expo after any `.env` change. Test the path from the phone browser first: `<URL>/health` should return `{"ok":true,...}`.

## Email (OTP delivery)

Set `SMTP_HOST` to send real mail — local Mailpit via compose (`SMTP_HOST=localhost`, inbox at http://localhost:8025), or any real SMTP provider in production. Leave `SMTP_HOST` empty to log OTPs to the backend console instead (plus a dev-only gold box on the OTP screen):

```
[DEV EMAIL] OTP for you@example.com: 482913 (expires in 10 min)
```

OTPs are random 6-digit, bcrypt-hashed at rest, 10-min expiry, 5 attempts max, 30s resend cooldown, single-use.

QA path: register → OTP → verify → login → onboarding → save → multi-select services → confirm (urgency + details) → home lists requests → restart app (session persists) → account → household → sign out → log in again.

Business Name is optional: most accounts are individuals/households, so forcing it adds signup friction; the Lifestyle Manager collects it later when relevant.

## Other commands

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

- **Can't reach server:** wrong IP/port in `mobile/.env`, backend not running, or Windows Firewall blocking the port.
- **Prisma can't connect:** `docker compose ps`, check `DATABASE_URL`.
- **Port busy:** change `PORT` in `server/.env` and match it in `EXPO_PUBLIC_API_URL`.
- **Stale app/styles:** `npx expo start --clear`.
