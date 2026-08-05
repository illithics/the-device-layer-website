import { describe, expect, it } from "vitest";
import { base32Decode, isValidBase32Secret } from "../src/features/authenticator/lib/base32";

const decoder = new TextDecoder();

describe("base32Decode", () => {
  it("matches RFC 4648 test vectors", () => {
    expect(base32Decode("")).toEqual(new Uint8Array(0));
    expect(decoder.decode(base32Decode("MY======"))).toBe("f");
    expect(decoder.decode(base32Decode("MZXQ===="))).toBe("fo");
    expect(decoder.decode(base32Decode("MZXW6==="))).toBe("foo");
    expect(decoder.decode(base32Decode("MZXW6YQ="))).toBe("foob");
    expect(decoder.decode(base32Decode("MZXW6YTB"))).toBe("fooba");
    expect(decoder.decode(base32Decode("MZXW6YTBOI======"))).toBe("foobar");
  });

  it("tolerates lowercase, spaces, hyphens, and missing padding", () => {
    expect(decoder.decode(base32Decode("mzxw 6ytb-oi"))).toBe("foobar");
    expect(decoder.decode(base32Decode("MZXW6YQ"))).toBe("foob");
  });

  it("rejects characters outside the alphabet", () => {
    expect(() => base32Decode("MZXW1")).toThrow(/Invalid base32/); // '1' is not in the alphabet
    expect(() => base32Decode("MZXW8")).toThrow(/Invalid base32/);
  });
});

describe("isValidBase32Secret", () => {
  it("accepts a typical setup key", () => {
    expect(isValidBase32Secret("JBSWY3DPEHPK3PXP")).toBe(true);
  });

  it("rejects empty and malformed input", () => {
    expect(isValidBase32Secret("")).toBe(false);
    expect(isValidBase32Secret("not!base32")).toBe(false);
  });
});
