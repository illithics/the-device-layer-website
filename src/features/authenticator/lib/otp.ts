/**
 * HOTP (RFC 4226) and TOTP (RFC 6238) code generation.
 */

import { hmac, sha1, sha256, HashFn } from "./hash";
import { base32Decode } from "./base32";

export type OtpAlgorithm = "SHA1" | "SHA256";

const HASHES: Record<OtpAlgorithm, HashFn> = {
  SHA1: sha1,
  SHA256: sha256,
};

export const DEFAULT_DIGITS = 6;
export const DEFAULT_PERIOD = 30;

/** RFC 4226 §5.3: HMAC over the 8-byte big-endian counter, dynamically truncated. */
export function hotp(
  secret: Uint8Array,
  counter: number,
  digits: number = DEFAULT_DIGITS,
  algorithm: OtpAlgorithm = "SHA1"
): string {
  if (!Number.isInteger(counter) || counter < 0) {
    throw new Error("HOTP counter must be a non-negative integer");
  }
  if (!Number.isInteger(digits) || digits < 6 || digits > 8) {
    throw new Error("OTP length must be 6, 7, or 8 digits");
  }

  const msg = new Uint8Array(8);
  const view = new DataView(msg.buffer);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);

  const digest = hmac(HASHES[algorithm], secret, msg);
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];

  return String(binary % 10 ** digits).padStart(digits, "0");
}

export interface TotpParams {
  /** Base32-encoded shared secret, as found in otpauth:// URIs. */
  secret: string;
  digits?: number;
  period?: number;
  algorithm?: OtpAlgorithm;
}

/** RFC 6238: HOTP over the count of `period`-second steps since the Unix epoch. */
export function totp(params: TotpParams, unixSeconds: number): string {
  const { secret, digits = DEFAULT_DIGITS, period = DEFAULT_PERIOD, algorithm = "SHA1" } = params;
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("TOTP period must be a positive integer");
  }
  const counter = Math.floor(unixSeconds / period);
  return hotp(base32Decode(secret), counter, digits, algorithm);
}

/** Seconds until the current code rolls over. */
export function secondsRemaining(period: number, unixSeconds: number): number {
  return period - (Math.floor(unixSeconds) % period);
}

/** "123456" → "123 456" for display; 7/8-digit codes split near the middle. */
export function formatCode(code: string): string {
  const half = Math.ceil(code.length / 2);
  return `${code.slice(0, half)} ${code.slice(half)}`;
}
