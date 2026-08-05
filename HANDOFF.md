# Handoff: port the 2FA authenticator into keepkey-mobile-expo

**For:** a Claude Code session scoped to `illithics/keepkey-mobile-expo` (fork of `keepkey/keepkey-mobile-expo`).
**Goal:** add this repo's TOTP two-factor authenticator (Google Authenticator-style) as a feature of the existing KeepKey mobile app, on a branch, ready for a merge request upstream.

## Where the finished feature lives

This repository (`illithics/the-device-layer-website`) is **public**. The complete, tested feature is on branch `claude/keepkey-2fa-authenticator-ly595k`:

```bash
git clone --branch claude/keepkey-2fa-authenticator-ly595k \
  https://github.com/illithics/the-device-layer-website.git /tmp/authenticator-source
```

It is a standalone Expo SDK 57 app whose only feature is the authenticator. Verified state: 28 vitest unit tests pass (all RFC test vectors), `tsc --noEmit` clean.

## What to port

Everything under `src/features/authenticator/` — designed to be self-contained:

| Path | What it is | Porting notes |
|------|------------|---------------|
| `lib/hash.ts` | SHA-1, SHA-256, HMAC in pure TS | Copy verbatim. No dependencies. |
| `lib/base32.ts` | RFC 4648 base32 decode + secret validation | Copy verbatim. |
| `lib/otp.ts` | HOTP (RFC 4226) + TOTP (RFC 6238), 6–8 digits, SHA-1/SHA-256, custom periods | Copy verbatim. |
| `lib/otpauth.ts` | `otpauth://` provisioning-URI parser (hand-rolled; Hermes URL is unreliable for custom schemes) | Copy verbatim. |
| `types.ts` | `OtpAccount` model | Copy verbatim. |
| `storage.ts` | Persistence via `expo-secure-store`, device-only keychain flag, per-account keys + index (2 KB/value limit) | Keep if the target app has or can add `expo-secure-store`; otherwise adapt to the app's secure storage. Do NOT downgrade to AsyncStorage — these are 2FA secrets. |
| `screens/AccountsScreen.tsx` | Code list: live countdown, tap-to-copy, long-press delete with confirm | Restyle to the target app's theme/components. Uses `expo-clipboard`. |
| `screens/AddAccountScreen.tsx` | Manual entry (service, account, base32 setup key) with validation | Restyle; keep validation logic. |
| `screens/ScanScreen.tsx` | QR scanning via `expo-camera` `CameraView`, permission flow, dedup guard | If the target app already has a QR scanner, reuse it and just feed the string to `parseOtpAuthUri`. |
| `components/TokenCard.tsx` | Per-account card UI | Restyle freely; logic worth keeping is the `Math.floor(now/period)` memo key. |
| `index.ts` | Feature's public exports | Adjust to whatever the target app's module conventions are. |

Also port `tests/` (hash, base32, otp, otpauth — vitest) into the target repo's test setup. If the target uses jest, the tests are plain `describe/it/expect` and convert mechanically.

`App.tsx` and `src/theme.ts` in this repo are throwaway shell/demo — do **not** port them; the target app has its own navigation and theming.

## Integration checklist

1. Read the target app's structure first: navigation (likely expo-router or react-navigation — this repo's simple screen-switching must be replaced with real routes), theming, existing deps.
2. Dependencies needed: `expo-secure-store`, `expo-camera`, `expo-clipboard` (all SDK-versioned; use `npx expo install`). The crypto core needs nothing.
3. `app.json` needs the camera permission plugin config and iOS `NSCameraUsageDescription` (see this repo's `app.json` for exact strings).
4. Wire an "Authenticator" entry into the app's navigation.
5. Match the target app's visual language — the screens here are plain StyleSheet + a black/gold palette; rewrite against the app's component library if it has one.
6. Run the ported unit tests and the app's typecheck before pushing.

## Branch / MR protocol

- Work on branch **`feature/2fa-authenticator`** in `illithics/keepkey-mobile-expo`.
- **Never push to `main`** — the deliverable is a merge request to the upstream repo.
- After pushing, the MR is opened from:
  `https://github.com/keepkey/keepkey-mobile-expo/compare/main...illithics:feature/2fa-authenticator`
  (cross-repo PR creation may be blocked for the session; giving the user this link is sufficient.)

## Security decisions already made (keep them)

- Secrets stored base32-encoded in Keychain/Keystore-backed storage, `WHEN_UNLOCKED_THIS_DEVICE_ONLY` — excluded from cloud backup, decoded only in memory at generation time.
- No cloud sync/export; account deletion warns the user they may lose access.
- HOTP URIs and unsupported algorithms (MD5, SHA512) are rejected with clear messages rather than silently mis-generating codes.

## Nice-to-have ideas (only if asked)

- Biometric app-lock before showing codes.
- BIP-85-derived TOTP secrets from the KeepKey device seed (hardware-backed, recoverable 2FA) — bigger project, needs firmware support discussion.

## Context for the human reviewer

This branch was originally developed in `the-device-layer-website` only because that repo happened to be the session's scope; the repo is otherwise intended for a tech blog. Once the port lands in `keepkey-mobile-expo`, this branch can be deleted.
