import crypto from "crypto";

export function longUrlHash(longUrl: string) {
  return crypto.createHash("sha256").update(longUrl).digest("hex");
}

// longurl to code
export function urlKey(longUrl: string) {
  return `u:${longUrlHash(longUrl)}`;
}

// code to url
export function codeKey(code: string) {
  return `c:${code}`;
}
