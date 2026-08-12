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
