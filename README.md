# Praxis

Mobile learning app for practice, battles, chat, and daily exercises. Built with Expo for Android, iOS, and web.

## Features

- Auth (login / register) with secure token storage
- Practice flows, daily exercises, and scan-based study
- Real-time battles and chat (Socket.IO)
- Profile, shop, fishing, and ranking surfaces
- i18n (react-i18next) and light/dark theming

## Stack

- TypeScript, React 19, React Native 0.81
- Expo SDK 54, Expo Router, NativeWind / Tailwind
- TanStack Query, Zustand, React Hook Form, Zod
- Axios, Socket.IO client, i18next

## Requirements

- Node.js 20+
- npm (comes with Node)
- Expo Go or a native build toolchain (Android Studio / Xcode) for device or emulator runs
- Optional: EAS CLI for cloud builds

## Setup

### 1. Clone

```bash
git clone https://github.com/subhin4078/PraxisMobileApp_OfflineDemo.git
cd PraxisMobileApp_OfflineDemo
```

### 2. Install

```bash
npm install
```

### 3. Configure

Create a `.env` in the project root (no `.env.example` is checked in):

```bash
# Backend API / Socket.IO base URL used by Axios and battle socket
EXPO_PUBLIC_SERVER_URL=https://your-api.example.com
```

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SERVER_URL` | API and Socket.IO server base URL |

Do not commit secrets or production credentials.

### 4. Run

```bash
npm start
# or: npx expo start
```

Then press `a` / `i` / `w` in the Expo CLI, or scan the QR code with Expo Go.

Phone over tunnel:

```bash
npm run dev:phone
```

Android emulator (Expo Go):

```bash
npm run dev:emulator
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run dev:phone` | Expo Go over tunnel |
| `npm run dev:emulator` | Expo Go on Android emulator |
| `npm run android` | Native Android run (`expo run:android`) |
| `npm run ios` | Native iOS run (`expo run:ios`) |
| `npm run web` | Start web target |
| `npm run lint` | Run ESLint via Expo |
| `npm run format` | Format with Prettier |
| `npx expo install <pkg>` | Add a dependency with Expo-compatible versions |

APK helper scripts (`apk:*`) target a local `android/` Gradle project when present (Windows-oriented).

## Project structure

```text
README.md
app.json                 # Expo app config
assets/                  # Images, icons, splash
src/
  app/                   # Expo Router routes
  screens/               # Screen UI by feature
  components/            # Shared UI
  api/                   # API hooks and clients
  hooks/
  stores/                # Zustand stores
  lib/                   # Axios, QueryClient, sockets
  i18n/
  constants/
  utils/
  types/
```

## Contributing

1. Create a branch: `feat/short-description` (or `fix/…`, `docs/…`, `chore/…`)
2. Commit with [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(auth): add password reset email flow`
3. Open a PR with title `type(scope): summary`, plus Summary / Changes / Test plan in the body

## Notes

- `WARN: SafeAreaView has been deprecated...` comes from NativeWind and can be ignored safely.

## License

Proprietary
