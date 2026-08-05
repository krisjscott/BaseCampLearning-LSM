/**
 * Obfuscates database ids (course/lesson/module/assessment/certificate ids, etc.) before they
 * appear in a URL or query string, so raw UUIDs are never visible in the address bar, browser
 * history, or shared links. This is a reversible client-side transform, not real encryption —
 * the key ships in the JS bundle like any client-side secret, so it stops casual exposure and
 * ID-guessing, not a determined attacker with the source. Real access control still happens on
 * the backend via the JWT on every API call.
 */

const KEY = [0x7a, 0x4f, 0x9c, 0x1e, 0xb3, 0x62, 0xd8, 0x05, 0xf1, 0x3a, 0x88, 0x2c, 0x67, 0xe9, 0x14, 0x5b];

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function xor(bytes: Uint8Array): Uint8Array {
  const output = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    output[i] = bytes[i] ^ KEY[i % KEY.length];
  }
  return output;
}

/** Turns a raw id (or any string) into an opaque, URL-safe token. */
export function encodeId(value: string): string {
  const bytes = new TextEncoder().encode(value);
  return toBase64Url(xor(bytes));
}

/** Reverses encodeId. Returns null if the token is malformed rather than throwing. */
export function decodeId(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const bytes = xor(fromBase64Url(token));
    const value = new TextDecoder().decode(bytes);
    return value || null;
  } catch {
    return null;
  }
}

/** Reads and decodes a query param in one step. */
export function decodeParam(params: URLSearchParams, key: string): string | null {
  return decodeId(params.get(key));
}
