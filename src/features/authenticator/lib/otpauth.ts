/**
 * Parser for otpauth:// provisioning URIs — the payload of the QR codes shown
 * by services when enabling two-factor authentication.
 *
 * Format: otpauth://totp/Issuer:account?secret=BASE32&issuer=Issuer&digits=6&period=30
 * (Parsed by hand: Hermes' URL implementation does not reliably support
 * custom schemes or searchParams.)
 */

import { isValidBase32Secret } from "./base32";
import { DEFAULT_DIGITS, DEFAULT_PERIOD, OtpAlgorithm } from "./otp";

export interface ParsedOtpAuth {
  issuer: string;
  account: string;
  secret: string;
  algorithm: OtpAlgorithm;
  digits: number;
  period: number;
}

export class OtpAuthParseError extends Error {}

function parseQuery(query: string): Map<string, string> {
  const params = new Map<string, string>();
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? "" : pair.slice(eq + 1);
    try {
      params.set(decodeURIComponent(key).toLowerCase(), decodeURIComponent(value.replace(/\+/g, "%20")));
    } catch {
      throw new OtpAuthParseError("Malformed percent-encoding in QR code");
    }
  }
  return params;
}

export function parseOtpAuthUri(uri: string): ParsedOtpAuth {
  const match = /^otpauth:\/\/([^/]+)\/([^?]*)(?:\?(.*))?$/i.exec(uri.trim());
  if (!match) {
    throw new OtpAuthParseError("Not an otpauth:// QR code");
  }

  const type = match[1].toLowerCase();
  if (type !== "totp") {
    throw new OtpAuthParseError(
      type === "hotp"
        ? "Counter-based (HOTP) accounts are not supported"
        : `Unsupported otpauth type "${type}"`
    );
  }

  let label: string;
  try {
    label = decodeURIComponent(match[2]);
  } catch {
    throw new OtpAuthParseError("Malformed percent-encoding in QR code");
  }
  const params = parseQuery(match[3] ?? "");

  // Label is conventionally "Issuer:account"; the issuer query param wins when present.
  const colon = label.indexOf(":");
  const labelIssuer = colon === -1 ? "" : label.slice(0, colon).trim();
  const account = (colon === -1 ? label : label.slice(colon + 1)).trim();
  const issuer = (params.get("issuer") ?? labelIssuer).trim();

  const secret = (params.get("secret") ?? "").replace(/\s/g, "");
  if (!secret) {
    throw new OtpAuthParseError("QR code is missing the secret");
  }
  if (!isValidBase32Secret(secret)) {
    throw new OtpAuthParseError("Secret is not valid base32");
  }

  const algorithmRaw = (params.get("algorithm") ?? "SHA1").toUpperCase();
  if (algorithmRaw !== "SHA1" && algorithmRaw !== "SHA256") {
    throw new OtpAuthParseError(`Unsupported algorithm "${algorithmRaw}"`);
  }

  const digits = params.has("digits") ? Number(params.get("digits")) : DEFAULT_DIGITS;
  if (![6, 7, 8].includes(digits)) {
    throw new OtpAuthParseError(`Unsupported code length "${params.get("digits")}"`);
  }

  const period = params.has("period") ? Number(params.get("period")) : DEFAULT_PERIOD;
  if (!Number.isInteger(period) || period <= 0) {
    throw new OtpAuthParseError(`Invalid period "${params.get("period")}"`);
  }

  return { issuer, account, secret, algorithm: algorithmRaw, digits, period };
}
