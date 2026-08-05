/**
 * RFC 4648 base32 decoding — the encoding used for shared secrets in
 * otpauth:// URIs and manual-entry setup keys.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decode a base32 string into bytes. Tolerates lowercase, whitespace, and
 * hyphens (services often display setup keys in spaced groups) as well as
 * trailing `=` padding. Throws on any other character.
 */
export function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) {
      throw new Error(`Invalid base32 character: "${ch}"`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

/** True if the string decodes to at least one byte of secret material. */
export function isValidBase32Secret(input: string): boolean {
  try {
    return base32Decode(input).length > 0;
  } catch {
    return false;
  }
}
