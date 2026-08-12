import { SESSION_COOKIE } from "./api";

/**
 * How the web application stores the API's session token.
 *
 * `httpOnly` because no page needs to read it and every page that could would
 * be a place it leaks from. `sameSite: "lax"` because every authenticated
 * action is a form submission from this origin, and a token that travelled on
 * a cross-site request would make one possible from somewhere else.
 *
 * No `maxAge`: the token's life belongs to the API, which can revoke it at any
 * moment. A browser that kept it a minute longer would only produce a session
 * the server has already forgotten.
 */
export function sessionCookieOptions(): {
  httpOnly: true;
  path: string;
  sameSite: "lax";
  secure: boolean;
} {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  };
}

export { SESSION_COOKIE };

/**
 * The routes UX-0008 owns.
 *
 * Named once so the outbox's registration and recovery links, the pages and
 * the redirects cannot drift apart. `/register/confirm` and `/recover/reset`
 * are the exact addresses the worker already writes into its messages.
 */
export const AUTH_ROUTES = {
  account: "/account",
  confirm: "/register/confirm",
  login: "/login",
  recover: "/recover",
  register: "/register",
  reset: "/recover/reset"
} as const;

/**
 * Where an interrupted journey may be sent back to (UX-0009 §11.2).
 *
 * A closed vocabulary of destinations rather than a URL carried through the
 * login form. A `next=` parameter holding an address would be an open redirect
 * waiting to be validated correctly forever; a name that this map turns into a
 * path cannot point anywhere this application does not already own.
 *
 * The Decision return needs nothing more than the name. What was selected and
 * which action was interrupted live in the flow the person still holds, so the
 * "exact return context" §11.2 asks for is already on the server — and every
 * gate is re-evaluated on arrival because the page simply reads it again.
 */
export const RETURN_DESTINATIONS = { decision: "/decision" } as const;

export type ReturnDestination = keyof typeof RETURN_DESTINATIONS;

export function returnPath(raw: string | undefined): string | null {
  return raw !== undefined && raw in RETURN_DESTINATIONS
    ? RETURN_DESTINATIONS[raw as ReturnDestination]
    : null;
}
