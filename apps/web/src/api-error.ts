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
/**
 * How long the web application waits for the API before giving up.
 *
 * **Ten seconds, chosen by the Owner on 2026-08-19**, and it is a ceiling
 * derived from the budgets underneath it rather than a round number. The API
 * already bounds its own worst honest answer: two seconds to acquire a
 * connection, five for a statement, eight for the Chat provider. A shorter
 * timeout here would abort a request the API was about to answer *correctly* —
 * replacing a precise `503 DEPENDENCY_UNAVAILABLE` with a vague "could not
 * load", and cutting off a healthy Decision Chat answer at eight seconds.
 *
 * This was the last untimed dependency edge in the repository. Email had ten
 * seconds, Chat eight, the database five and two — and the one edge a person
 * actually waits on had none, across twenty-seven call sites. Node's `fetch`
 * has no default, so a hung API hung the page: the honest surfaces I23 and I24
 * built were unreachable in the failure that produces them most often.
 */
export const DEFAULT_API_TIMEOUT_MS = 10_000;

export function apiTimeoutMs(
  raw: string | undefined = process.env.API_TIMEOUT_MS
): number {
  const parsed = Number(raw);
  // A malformed setting takes the default rather than the process: `Number("")`
  // is 0, and a zero-millisecond budget aborts every request instantly.
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_API_TIMEOUT_MS;
}

/**
 * Runs one API request against the budget.
 *
 * The timer is cleared in a `finally` because an un-cleared `setTimeout` keeps
 * the event loop alive; on a server rendering thousands of requests that is a
 * slow leak rather than a visible fault.
 *
 * A timed-out request raises `ApiRequestError` with `504`, which
 * `isApiUnavailable` already treats as unavailable — so a hang reaches exactly
 * the same bounded surfaces as an outage. That is the honest mapping: to the
 * person, and to the retry they will make, "the API did not answer in time" and
 * "the API is not there" are one situation.
 *
 * **A network failure is not swallowed here.** `ECONNREFUSED` and DNS failures
 * arrive as `TypeError` and are left to propagate, because they are not this
 * request being too slow — and I23's discipline is that only what is known to
 * be the dependency's is presented as retryable.
 *
 * **Used by the sixteen reads and by none of the eight writes, deliberately.**
 * Aborting a write does not undo it: the API may have created the Offering,
 * saved the information or closed the case a moment after this side stopped
 * listening. Reporting that as a failure would be a claim about an outcome this
 * application does not know — and UX-0005 §15's "a failed Offering action does
 * not claim a lifecycle transition" cuts both ways, because claiming the
 * transition did *not* happen is the same kind of invention.
 *
 * Saying so honestly needs a third answer for writes — *this may or may not have
 * happened* — and, for the ones that are not naturally idempotent, a way to
 * retry safely. Neither is designed, and a timeout added before them would turn
 * an unbounded wait into a confident wrong answer.
 */
export async function fetchWithBudget(
  input: string,
  init: RequestInit,
  operation: string
): Promise<Response> {
  const abort = new AbortController();
  const expiry = setTimeout(() => abort.abort(), apiTimeoutMs());
  try {
    return await fetch(input, { ...init, signal: abort.signal });
  } catch (error) {
    if (abort.signal.aborted) throw new ApiRequestError(operation, 504);
    throw error;
  } finally {
    clearTimeout(expiry);
  }
}

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

/**
 * "This is not here" — unless the API never said so.
 *
 * The authenticated reads collapsed every failure into `null`, and their pages
 * turned `null` into `notFound()`. During an outage that told a Business owner
 * their **Business does not exist** and an Admin that the **Admin panel does
 * not exist**: thirteen routes, each stating something false, each
 * indistinguishable from the deliberate answer the API gives somebody with no
 * standing to learn a thing exists.
 *
 * UX-0006 §14 names the rule this restores in five words — *"distinguish zero
 * from unavailable"* — and it is a rule about honesty rather than about
 * analytics. Absence is a fact about the world; a failed read is a fact about
 * this request, and reporting the second as the first invents the world.
 *
 * `4xx` still means absent, and deliberately. `401`, `403` and `404` are how
 * the API says "not yours" without confirming existence, and that answer is
 * load-bearing — turning it into "unavailable" would leak that something is
 * there to be unavailable.
 */
export function absentUnlessUnavailable(
  response: Response,
  operation: string
): null {
  if (response.status >= 500)
    throw new ApiRequestError(operation, response.status);
  return null;
}
