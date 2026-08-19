import { randomUUID } from "node:crypto";

import type { FastifyRequest } from "fastify";

/**
 * The one identifier that ties a request to everything it caused.
 *
 * Engineering Constitution §12.3: *"Distributed or asynchronous flows shall
 * support correlation across boundaries through an appropriate identifier."*
 * The identifier existed — it is in the error envelope a person can quote, and
 * in every `audit_record` — but **it did not reach the two places an incident
 * actually starts from.**
 *
 * Fastify generates its own `reqId` (`req-1`, `req-2`, …) and stamps it on
 * every automatic request and response log line. The application stamped the
 * caller's correlation identifier on its own lines. Two identifiers for one
 * request, joined by nothing: given a correlation id from a person's error
 * message you could find the failure and not the route, the status or the
 * duration; given a slow request you could not find what it did. And a
 * per-process counter collides across instances, so `req-1` is a different
 * request on every replica.
 *
 * Making Fastify's request id *be* the correlation identifier collapses the two
 * into one. Nothing gains a field; one field stops existing.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

/**
 * Reads the caller's identifier, or mints one.
 *
 * A correlation identifier reaches a `uuid` column, so a malformed one is
 * replaced rather than trusted — the same reason M11 gave for refusing a
 * malformed principal at the edge rather than in the driver.
 *
 * Called once per request, by Fastify, before any route runs. Everything after
 * that reads `request.id` instead of computing this again, which is why it is
 * exported for the adapter and not for general use.
 */
export function correlationIdFrom(request: {
  headers: Record<string, string | string[] | undefined>;
}): string {
  const header = request.headers["x-correlation-id"];
  const value = Array.isArray(header) ? header[0] : header;
  return value !== undefined && UUID_PATTERN.test(value) ? value : randomUUID();
}

/**
 * The identifier Fastify already computed for this request.
 *
 * `request.id` is a `string` by the time any handler sees it, because
 * `genReqId` produced it. The fallback covers the one caller that is not a real
 * Fastify request: a unit test constructing a request-shaped object by hand.
 */
export function correlationId(request: FastifyRequest): string {
  return typeof request.id === "string"
    ? request.id
    : correlationIdFrom(request);
}
