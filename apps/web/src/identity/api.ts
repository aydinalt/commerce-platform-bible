import {
  authorizedBusinessesSchema,
  sessionSchema,
  type AuthorizedBusinesses,
  type Session
} from "@commerce/contracts";

import { ApiRequestError, fetchWithBudget } from "../api-error";

/**
 * The name the API sets and reads. It is repeated here rather than imported
 * because the web application is a *client* of that cookie: it carries it
 * between the browser and the API and never inspects what is inside.
 */
export const SESSION_COOKIE = "commerce_session";

/**
 * Server-side only, like the Discovery client. The browser never calls the API
 * directly, so the session cookie never has to be readable by script and the
 * base address stays deployment information rather than part of the page.
 */
function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

/**
 * What an authentication call produced.
 *
 * `session` is the token the API minted, if it minted one. It is handed
 * straight to the browser's cookie jar by the caller and is never rendered,
 * logged or put in a URL — a secret that appears in a page is a secret in
 * somebody's history.
 */
export interface AuthOutcome<T> {
  body: T;
  session: string | null;
  status: number;
}

/**
 * Reads the session token out of the API's `Set-Cookie`.
 *
 * Only the value is taken. The API's own attributes are not copied forward,
 * because the web application sets its own on the way out — the two are
 * different hops with different origins, and pretending otherwise would mean
 * an API deployment change silently altering how the browser stores it.
 */
function readSessionCookie(response: Response): string | null {
  const header = response.headers.get("set-cookie");
  if (header === null) return null;
  const match = new RegExp(`${SESSION_COOKIE}=([^;]*)`, "u").exec(header);
  const value = match?.[1];
  return value === undefined || value === "" ? null : value;
}

async function call<T>(
  path: string,
  init: RequestInit & { budget?: string; session?: string | undefined }
): Promise<AuthOutcome<T>> {
  const { budget, session, ...rest } = init;
  /*
   * Annotated rather than inferred. Lifted out of the `fetch` call the literal
   * lost its contextual type and `cache: "no-store"` widened to `string`, which
   * `RequestCache` does not accept — the compiler caught it, and an inferred
   * `RequestInit` here would have been a silent widening of every field.
   */
  const request: RequestInit = {
    ...rest,
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      // The API refuses a cookie-authenticated mutation from an unrecognised
      // origin, so the web application names itself rather than relying on
      // whatever the runtime would have sent.
      origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000",
      ...(session === undefined
        ? {}
        : { cookie: `${SESSION_COOKIE}=${session}` }),
      ...rest.headers
    }
  };
  /*
   * **The budget is per call site rather than on `call`**, because this one
   * function serves eight writes and two reads, and I25 timed the reads
   * deliberately while leaving the writes alone: aborting a write does not undo
   * it, so reporting a timeout as a failure would claim an outcome this
   * application does not know.
   *
   * Until I45 neither read was on the budget at all. `identity/api.ts` was the
   * one module I25 did not reach, so a hung API hung `/account` with no
   * ceiling — the exact failure I25 was written to stop, in the one place it
   * was not applied.
   */
  const response =
    budget === undefined
      ? await fetch(`${apiBaseUrl()}${path}`, request)
      : await fetchWithBudget(`${apiBaseUrl()}${path}`, request, budget);
  const text = await response.text();
  return {
    body: (text === "" ? {} : JSON.parse(text)) as T,
    session: readSessionCookie(response),
    status: response.status
  };
}

export function beginRegistration(input: {
  email: string;
  password: string;
}): Promise<AuthOutcome<unknown>> {
  return call("/auth/registrations", {
    body: JSON.stringify(input),
    method: "POST"
  });
}

export function confirmRegistration(
  token: string
): Promise<AuthOutcome<unknown>> {
  return call("/auth/registrations/confirmations", {
    body: JSON.stringify({ token }),
    method: "POST"
  });
}

export function logIn(input: {
  email: string;
  password: string;
}): Promise<AuthOutcome<unknown>> {
  return call("/auth/sessions", {
    body: JSON.stringify(input),
    method: "POST"
  });
}

export function logOut(session: string): Promise<AuthOutcome<unknown>> {
  return call("/auth/sessions/current", { method: "DELETE", session });
}

export function beginRecovery(email: string): Promise<AuthOutcome<unknown>> {
  return call("/auth/password-resets", {
    body: JSON.stringify({ email }),
    method: "POST"
  });
}

export function completeRecovery(input: {
  password: string;
  token: string;
}): Promise<AuthOutcome<unknown>> {
  return call("/auth/password-resets/completions", {
    body: JSON.stringify(input),
    method: "POST"
  });
}

/**
 * The current session, re-read from the API rather than remembered.
 *
 * Every gate this page shows depends on state that can change between
 * requests — an account suspended, an authorization removed, an ownership
 * ended — so the answer is asked for again each time rather than cached in the
 * cookie alongside the token.
 */
export async function readSession(
  session: string | undefined
): Promise<Session | null> {
  if (session === undefined) return null;
  const outcome = await call<unknown>("/auth/sessions/current", {
    budget: "SESSION",
    method: "GET",
    session
  });
  /*
   * **`null` used to carry four unrelated facts**, and the caller turned every
   * one of them into "sign in again": no cookie, a `401` for a token that is
   * spent or an account suspended, a `503` because the database is not there,
   * and any other `5xx`.
   *
   * The first two are the person's session genuinely not being one. The last
   * two are **this application not knowing**, and answering them with the
   * sign-in screen is the boldest claim available — it tells somebody holding a
   * perfectly valid token that they are signed out, and sends them to a form
   * that cannot work either, because it calls the same API that just failed.
   *
   * I24 gave thirteen routes the vocabulary for this, in UX-0006 §14's five
   * words: *distinguish zero from unavailable*. `identity/api.ts` was not among
   * them, so the rule was applied everywhere except the one read whose false
   * answer is about the person rather than about the catalogue.
   *
   * `4xx` still means no session, and deliberately — that is how the API says
   * "not yours" without confirming anything, and it is the same reason
   * `absentUnlessUnavailable` keeps `4xx` absent for every other read.
   */
  if (outcome.status >= 500)
    throw new ApiRequestError("SESSION", outcome.status);
  if (outcome.status !== 200) return null;
  const parsed = sessionSchema.safeParse(outcome.body);
  return parsed.success ? parsed.data : null;
}

/**
 * The Businesses this person owns, which UX-0008 §8.1 offers as explicit
 * entries. An empty list is a real answer: most people own none.
 *
 * **Which is exactly what hid the defect.** Because zero is the ordinary
 * answer, an outage that produced zero looked like the ordinary answer, and a
 * person who owns three Businesses was shown none of them and told nothing had
 * gone wrong. That is UX-0006 §14's "distinguish zero from unavailable" in its
 * purest form — a count stated as fact when the count is not known.
 *
 * An empty list stays a real answer for `4xx`, and only for `4xx`.
 */
export async function readOwnedBusinesses(
  session: string
): Promise<AuthorizedBusinesses> {
  const outcome = await call<unknown>("/auth/me/businesses", {
    budget: "OWNED_BUSINESSES",
    method: "GET",
    session
  });
  if (outcome.status >= 500)
    throw new ApiRequestError("OWNED_BUSINESSES", outcome.status);
  if (outcome.status !== 200) return { businesses: [] };
  const parsed = authorizedBusinessesSchema.safeParse(outcome.body);
  return parsed.success ? parsed.data : { businesses: [] };
}

export function selectBusinessContext(
  session: string,
  businessId: string
): Promise<AuthOutcome<unknown>> {
  return call("/auth/me/business-context", {
    body: JSON.stringify({ businessId }),
    method: "PUT",
    session
  });
}

export function enterAdminContext(
  session: string
): Promise<AuthOutcome<unknown>> {
  return call("/auth/me/admin-context", { method: "PUT", session });
}
