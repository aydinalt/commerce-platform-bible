import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** 256 bits of entropy, URL-safe so it survives an email link unchanged. */
export function issueSecret(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Only digests are persisted. A disclosure of `user_session` or
 * `pending_registration` therefore yields nothing replayable, because the
 * bearer value never touches the database (ADR-0012 §2).
 */
export function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Compares digests in constant time, so no comparison leaks by duration. */
export function digestsMatch(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
