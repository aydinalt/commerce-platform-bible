import type { CookieSerializeOptions } from "@fastify/cookie";

export const SESSION_COOKIE = "commerce_session";

/** Sessions outlive a browsing sitting but not an unattended machine. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** A registration link must expire quickly enough to limit mailbox exposure. */
export const REGISTRATION_TTL_MS = 30 * 60 * 1000;

/**
 * `SameSite=Strict` is the first half of the CSRF defence required by
 * ADR-0012 §2; origin validation on mutations is the second. `secure` is
 * relaxed only outside production so that plain-HTTP local development still
 * receives the cookie.
 */
export function sessionCookieOptions(
  environment: string
): CookieSerializeOptions {
  return {
    httpOnly: true,
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
    sameSite: "strict",
    secure: environment === "production"
  };
}

export function clearedCookieOptions(
  environment: string
): CookieSerializeOptions {
  return { ...sessionCookieOptions(environment), maxAge: 0 };
}
