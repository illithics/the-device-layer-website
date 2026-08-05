import { describe, expect, it } from "vitest";
import { OtpAuthParseError, parseOtpAuthUri } from "../src/features/authenticator/lib/otpauth";

describe("parseOtpAuthUri", () => {
  it("parses a typical Google Authenticator style URI", () => {
    const parsed = parseOtpAuthUri(
      "otpauth://totp/GitHub:chris%40keepkey.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub"
    );
    expect(parsed).toEqual({
      issuer: "GitHub",
      account: "chris@keepkey.com",
      secret: "JBSWY3DPEHPK3PXP",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });
  });

  it("applies explicit digits, period, and algorithm", () => {
    const parsed = parseOtpAuthUri(
      "otpauth://totp/Example:user?secret=JBSWY3DPEHPK3PXP&algorithm=SHA256&digits=8&period=60"
    );
    expect(parsed.algorithm).toBe("SHA256");
    expect(parsed.digits).toBe(8);
    expect(parsed.period).toBe(60);
  });

  it("falls back to the label issuer when the issuer param is absent", () => {
    const parsed = parseOtpAuthUri("otpauth://totp/Acme%20Co:alice?secret=JBSWY3DPEHPK3PXP");
    expect(parsed.issuer).toBe("Acme Co");
    expect(parsed.account).toBe("alice");
  });

  it("prefers the issuer query param over the label prefix", () => {
    const parsed = parseOtpAuthUri("otpauth://totp/Old:alice?secret=JBSWY3DPEHPK3PXP&issuer=New");
    expect(parsed.issuer).toBe("New");
  });

  it("handles labels without an issuer prefix", () => {
    const parsed = parseOtpAuthUri("otpauth://totp/just-an-account?secret=JBSWY3DPEHPK3PXP");
    expect(parsed.issuer).toBe("");
    expect(parsed.account).toBe("just-an-account");
  });

  it("decodes + as a space in query values", () => {
    const parsed = parseOtpAuthUri("otpauth://totp/x?secret=JBSWY3DPEHPK3PXP&issuer=Acme+Co");
    expect(parsed.issuer).toBe("Acme Co");
  });

  it("rejects non-otpauth input", () => {
    expect(() => parseOtpAuthUri("https://example.com")).toThrow(OtpAuthParseError);
    expect(() => parseOtpAuthUri("random text")).toThrow(/Not an otpauth/);
  });

  it("rejects HOTP with a specific message", () => {
    expect(() => parseOtpAuthUri("otpauth://hotp/x?secret=JBSWY3DPEHPK3PXP&counter=0")).toThrow(
      /HOTP/
    );
  });

  it("rejects missing or malformed secrets", () => {
    expect(() => parseOtpAuthUri("otpauth://totp/x?issuer=Acme")).toThrow(/missing the secret/);
    expect(() => parseOtpAuthUri("otpauth://totp/x?secret=1!nope")).toThrow(/not valid base32/);
  });

  it("rejects unsupported algorithms and digit counts", () => {
    expect(() => parseOtpAuthUri("otpauth://totp/x?secret=JBSWY3DPEHPK3PXP&algorithm=MD5")).toThrow(
      /Unsupported algorithm/
    );
    expect(() => parseOtpAuthUri("otpauth://totp/x?secret=JBSWY3DPEHPK3PXP&digits=4")).toThrow(
      /Unsupported code length/
    );
    expect(() => parseOtpAuthUri("otpauth://totp/x?secret=JBSWY3DPEHPK3PXP&period=0")).toThrow(
      /Invalid period/
    );
  });
});
