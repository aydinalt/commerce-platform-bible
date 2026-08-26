/**
 * How far to believe `x-forwarded-for` (I39).
 *
 * The platform already throttles registration, recovery and sign-in: since I13
 * `auth_throttle` counts attempts per hashed subject in one atomic statement, so
 * the count is shared across every instance. **The mechanism is sound and the
 * key it counts was wrong behind a proxy.**
 *
 * `identity.controller.ts` uses `request.ip` and calls it "the caller's
 * address". Fastify only populates that from `x-forwarded-for` when told to,
 * and it had not been told. Measured, against a forged
 * `x-forwarded-for: 9.9.9.9, 8.8.8.8`:
 *
 * | setting | `request.ip` | what that means in production |
 * |---|---|---|
 * | unset | `127.0.0.1` | **the proxy's address for every caller** — the whole internet shares one counter, and the first few dozen attempts globally lock everybody out |
 * | `true` | `9.9.9.9` | **the value the caller invented** — rotate the header, and the throttle never triggers |
 * | `1` | `8.8.8.8` | the entry the trusted proxy appended, which a caller cannot forge past |
 *
 * Both simple answers are wrong, in opposite directions, and neither would have
 * shown up in a test: one throttles everyone, the other throttles nobody, and
 * both return `200` to the request in front of you.
 *
 * ## Why the number is declared rather than detected
 *
 * The correct hop count is how many proxies sit in front of this process, and
 * that is a property of the deployment. Nothing in a request distinguishes an
 * entry a proxy appended from one a caller sent — that is the entire problem —
 * so it cannot be inferred, only stated. Same shape as
 * `DATABASE_CONNECTION_MODE` in I36.
 */

/**
 * No proxy, which is what every environment before Vercel was.
 *
 * **This default fails in the safe direction.** A deployment that forgets to set
 * it throttles all its callers together: visibly broken, and broken towards
 * refusing rather than towards allowing. The other default would let anybody
 * past the throttle by writing a header, and nothing would look wrong.
 */
export const DEFAULT_TRUSTED_PROXY_HOPS = 0;

/**
 * A malformed or negative value takes the default, for the reason above: the
 * failure that matters is trusting too much, so an unreadable setting must not
 * become "trust everything".
 */
export function trustedProxyHops(
  raw: string | undefined = process.env["TRUSTED_PROXY_HOPS"]
): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_TRUSTED_PROXY_HOPS;
}

/**
 * What Fastify is given.
 *
 * `false` rather than `0` when there is no proxy: they behave the same for
 * `request.ip`, and `false` says the thing out loud — this deployment does not
 * read `x-forwarded-for` at all.
 *
 * Note this also governs `request.protocol` and `request.hostname`. Nothing in
 * the platform makes a security decision from either; the session cookie's
 * `secure` flag and `ALLOWED_ORIGINS` are configured rather than sniffed, which
 * is why turning this on cannot widen anything else.
 */
export function trustProxySetting(
  hops: number = trustedProxyHops()
): false | number {
  return hops === 0 ? false : hops;
}
