import { describe, expect, it } from "vitest";
import { hmac, sha1, sha256 } from "../src/features/authenticator/lib/hash";

const encoder = new TextEncoder();

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

describe("sha1", () => {
  it("matches FIPS 180 test vectors", () => {
    expect(hex(sha1(new Uint8Array(0)))).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709");
    expect(hex(sha1(encoder.encode("abc")))).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
    expect(hex(sha1(encoder.encode("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")))).toBe(
      "84983e441c3bd26ebaae4aa1f95129e5e54670f1"
    );
  });

  it("handles messages spanning multiple blocks", () => {
    expect(hex(sha1(encoder.encode("a".repeat(1000))))).toBe("291e9a6c66994949b57ba5e650361e98fc36b1ba");
  });
});

describe("sha256", () => {
  it("matches FIPS 180 test vectors", () => {
    expect(hex(sha256(new Uint8Array(0)))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    expect(hex(sha256(encoder.encode("abc")))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    expect(hex(sha256(encoder.encode("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")))).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"
    );
  });
});

describe("hmac", () => {
  // RFC 2202 test case 2 and a >64-byte-key case (test case 6).
  it("matches RFC 2202 HMAC-SHA1 vectors", () => {
    expect(hex(hmac(sha1, encoder.encode("Jefe"), encoder.encode("what do ya want for nothing?")))).toBe(
      "effcdf6ae5eb2fa2d27416d5f184df9c259a7c79"
    );
    const longKey = new Uint8Array(80).fill(0xaa);
    expect(hex(hmac(sha1, longKey, encoder.encode("Test Using Larger Than Block-Size Key - Hash Key First")))).toBe(
      "aa4ae5e15272d00e95705637ce8a3b55ed402112"
    );
  });

  // RFC 4231 test case 2.
  it("matches RFC 4231 HMAC-SHA256 vectors", () => {
    expect(hex(hmac(sha256, encoder.encode("Jefe"), encoder.encode("what do ya want for nothing?")))).toBe(
      "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"
    );
  });
});
