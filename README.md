# PadosiPro — Take-Home Assignment

Native mobile recreation of the PadosiPro reference flow (`/ss` screenshots are the design source of truth). No WebView — every screen is React Native + Tailwind (NativeWind).

**Stack:** Expo SDK 57 + TypeScript + Expo Router + NativeWind · Node.js + Express + TypeScript · PostgreSQL + Prisma

**Flow:** Register → OTP → Login → Onboarding → Task selection → Urgency → Details → Account. Returning users skip onboarding.

```
mobile/             Expo app (screens in app/, UI kit in components/ui.tsx)
server/             Express API (routes/, services/, middleware/) + Prisma schema
docker-compose.yml  local PostgreSQL
```

## Run it

```sh
npm install              # installs mobile + server workspaces
docker compose up -d     # postgres at localhost:5432

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

## Dev OTP (no email provider needed)

OTPs are random 6-digit, bcrypt-hashed, 10-min expiry, 5 attempts max, 30s resend cooldown, single-use. In development the OTP is logged to the backend console and shown in a gold box on the OTP screen:

```
[DEV EMAIL] OTP for you@example.com: 482913 (expires in 10 min)
```

QA path: register → OTP → verify → onboarding → save → pick category/service → urgency → details → “Leave it with us” → restart app (session persists) → account → sign out → log in again.

## Other commands

```sh
npm run typecheck          # tsc for server + mobile
npm run test:server        # backend unit tests
cd mobile && npx eas-cli@latest build -p android --profile preview   # APK
```

## Troubleshooting

- **Can't reach server:** wrong IP/port in `mobile/.env`, backend not running, or Windows Firewall blocking the port.
- **Prisma can't connect:** `docker compose ps`, check `DATABASE_URL`.
- **Port busy:** change `PORT` in `server/.env` and match it in `EXPO_PUBLIC_API_URL`.
- **Stale app/styles:** `npx expo start --clear`.
