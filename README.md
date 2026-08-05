# KeepKey Companion

Mobile companion app for KeepKey, built with [Expo](https://expo.dev) / React Native. Its first
feature is a built-in **two-factor authenticator** — the same idea as Google Authenticator:
add an account by scanning a service's 2FA QR code (or typing the setup key), and the app
generates the rotating 6-digit sign-in codes.

## Features

- **TOTP code generation** per [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
  (and HOTP per RFC 4226 under the hood), verified against the RFC test vectors.
  Supports SHA-1 and SHA-256, 6–8 digit codes, and custom periods.
- **QR provisioning** — scans standard `otpauth://totp/...` QR codes with the camera.
- **Manual entry** — paste or type a base32 setup key for services that don't show a QR code.
- **Secure storage** — secrets are stored with `expo-secure-store` (iOS Keychain /
  Android Keystore-encrypted storage), marked device-only so they are excluded from
  cloud backups, and never leave the phone.
- **Authenticator UX** — live countdown per account, tap a card to copy the code,
  long-press to remove an account (with a confirmation warning).

## Getting started

```bash
npm install
npx expo start
```

Then press `a`/`i` for an Android/iOS simulator, or scan the terminal QR code with the
[Expo Go](https://expo.dev/go) app on a phone. Note that the QR *scanner* needs a real
camera, so test that part on a physical device; manual entry works everywhere.

## Development

```bash
npm test           # unit tests (vitest) — RFC 4226/6238/2202/4231/4648 vectors
npm run typecheck  # tsc --noEmit
```

The TOTP engine (`src/features/authenticator/lib/`) is dependency-free, pure TypeScript —
including SHA-1/SHA-256 and HMAC — so it runs identically under Hermes on-device and under
Node in CI, with no native crypto module required.

## Project layout

```
App.tsx                          # root: screen switching + account state
src/theme.ts                     # shared dark palette
src/features/authenticator/      # self-contained feature module
  lib/hash.ts                    #   SHA-1, SHA-256, HMAC (pure TS)
  lib/base32.ts                  #   RFC 4648 base32 decoding
  lib/otp.ts                     #   HOTP (RFC 4226) + TOTP (RFC 6238)
  lib/otpauth.ts                 #   otpauth:// URI parsing
  storage.ts                     #   expo-secure-store persistence
  components/, screens/          #   UI
tests/                           # vitest unit tests for the pure logic
```

The `src/features/authenticator` directory has no dependencies on the rest of the app
beyond `src/theme.ts`, so it can be lifted wholesale into another KeepKey mobile codebase.

## Security notes

- Secrets are kept base32-encoded in secure storage and only decoded in memory at
  code-generation time.
- `keychainAccessible` is `WHEN_UNLOCKED_THIS_DEVICE_ONLY`: secrets are unavailable
  before first unlock and are not restored onto other devices from backups.
- There is intentionally **no cloud sync or export** in this version — removing an
  account is destructive, and the UI warns accordingly.
