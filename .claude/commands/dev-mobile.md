---
description: Start and develop the React Native mobile app
---

1. Ensure the Next.js web API is running: `cd apps/web && npm run dev`
2. Start the Expo dev server: `cd apps/mobile && npx expo start`
3. For iOS simulator: press `i` in Expo CLI
4. For Android emulator: press `a` in Expo CLI
5. For physical device: scan QR code with Expo Go app

When making changes:
- Screens are in `apps/mobile/app/` (Expo Router)
- Components in `apps/mobile/src/components/`
- Zustand stores in `apps/mobile/src/stores/`
- API client in `packages/shared/src/api-client.ts`
- Run `pnpm dev:mobile` from monorepo root as shortcut

$ARGUMENTS
