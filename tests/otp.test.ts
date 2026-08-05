import { describe, expect, it } from "vitest";
import { formatCode, hotp, secondsRemaining, totp } from "../src/features/authenticator/lib/otp";

const encoder = new TextEncoder();

// RFC 4226 appendix D: secret "12345678901234567890".
const HOTP_SECRET = encoder.encode("12345678901234567890");

// RFC 6238 appendix B secrets (ASCII, sized to the hash's output length),
// base32-encoded since our totp() takes the secret as provisioned in otpauth URIs.
const TOTP_SECRET_SHA1 = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // "12345678901234567890"
const TOTP_SECRET_SHA256 = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZA"; // 32-byte variant

describe("hotp", () => {
  it("matches all ten RFC 4226 appendix D vectors", () => {
    const expected = [
      "755224", "287082", "359152", "969429", "338314",
      "254676", "287922", "162583", "399871", "520489",
    ];
    expected.forEach((code, counter) => {
      expect(hotp(HOTP_SECRET, counter)).toBe(code);
    });
  });

  it("rejects invalid parameters", () => {
    expect(() => hotp(HOTP_SECRET, -1)).toThrow();
    expect(() => hotp(HOTP_SECRET, 0, 5)).toThrow();
    expect(() => hotp(HOTP_SECRET, 0, 9)).toThrow();
  });
});

describe("totp", () => {
  const sha1Vectors: Array<[number, string]> = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
    [20000000000, "65353130"],
  ];

  it("matches RFC 6238 appendix B SHA-1 vectors", () => {
    for (const [time, code] of sha1Vectors) {
      expect(totp({ secret: TOTP_SECRET_SHA1, digits: 8 }, time)).toBe(code);
    }
  });

  const sha256Vectors: Array<[number, string]> = [
    [59, "46119246"],
    [1111111109, "68084774"],
    [1111111111, "67062674"],
    [1234567890, "91819424"],
    [2000000000, "90698825"],
    [20000000000, "77737706"],
  ];

  it("matches RFC 6238 appendix B SHA-256 vectors", () => {
    for (const [time, code] of sha256Vectors) {
      expect(totp({ secret: TOTP_SECRET_SHA256, digits: 8, algorithm: "SHA256" }, time)).toBe(code);
    }
  });

  it("defaults to 6 digits and a 30-second period", () => {
    expect(totp({ secret: TOTP_SECRET_SHA1 }, 59)).toBe("287082");
    // Same 30-second window produces the same code; the next window differs.
    expect(totp({ secret: TOTP_SECRET_SHA1 }, 31)).toBe(totp({ secret: TOTP_SECRET_SHA1 }, 59));
    expect(totp({ secret: TOTP_SECRET_SHA1 }, 60)).not.toBe(totp({ secret: TOTP_SECRET_SHA1 }, 59));
  });

  it("preserves leading zeros", () => {
    expect(totp({ secret: TOTP_SECRET_SHA1, digits: 8 }, 1111111109)).toBe("07081804");
  });
});

describe("secondsRemaining", () => {
  it("counts down within the period", () => {
    expect(secondsRemaining(30, 0)).toBe(30);
    expect(secondsRemaining(30, 29)).toBe(1);
    expect(secondsRemaining(30, 30)).toBe(30);
    expect(secondsRemaining(30, 59.9)).toBe(1);
  });
});

describe("formatCode", () => {
  it("splits codes for readability", () => {
    expect(formatCode("123456")).toBe("123 456");
    expect(formatCode("1234567")).toBe("1234 567");
    expect(formatCode("12345678")).toBe("1234 5678");
  });
});
