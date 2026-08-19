/**
 * What it means when the API did not answer a page's read.
 *
 * Every one of the eight Frozen UX documents has an "Error Behaviour" section
 * and the web application implemented none of them. There was no error boundary
 * on any of twenty-two routes, so a failed read threw and Next.js replaced the
 * whole page with its built-in crash screen — losing the person's criteria, the
 * bounded recoveries the documents name, and any statement of what happened.
 *
 * That mattered more after I22. The API now answers a database outage with
 * `503 DEPENDENCY_UNAVAILABLE`, which says truthfully "this is temporary, the
 * request was fine, come back" — and the person was shown an application crash,
 * which says the opposite about a different system.
 *
 * **The status is kept rather than folded into a message.** `Error("BROWSE_503")`
 * carried the number in a string nobody could branch on, so a page could not
 * tell a dependency being unavailable from its own code being broken. It has to,
 * because the two call for opposite treatment: one is presented as a bounded
 * retryable state, and the other must be left to fail loudly. A page that caught
 * everything would hide its own defects behind "please try again", for ever.
 */
export class ApiRequestError extends Error {
  readonly status: number;

  constructor(operation: string, status: number) {
    super(`${operation}_${status}`);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

/**
 * Whether a failure is the API's rather than this application's.
 *
 * `5xx` only, and deliberately not `4xx`. A `400` or a `409` from a page read
 * means this application sent something wrong — a defect, and presenting it as
 * "temporarily unavailable" would promise a retry that can never succeed. The
 * two statuses a page read legitimately expects, `401` and `404`, are already
 * handled where they arise rather than here.
 *
 * A non-`ApiRequestError` is never unavailable: it is a `TypeError`, a contract
 * parse failure, or any other bug, and those must keep reaching the crash
 * screen. Losing that would be the same trade I22 refused when it kept
 * constraint violations answering `500`.
 */
export function isApiUnavailable(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status >= 500;
}
