"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loginSchema } from "@commerce/contracts";
import { z } from "zod";

import { logIn, logOut } from "../../identity/api";
import { refusalFor, type AuthState } from "../../identity/outcome";
import {
  AUTH_ROUTES,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../identity/session";

/**
 * Login (UX-0008 §7).
 *
 * Two conditions, and the screen learns which failed for neither of them. A
 * wrong password, an unknown address and a Suspended account all arrive as one
 * identical `401`, because `US-IDN-F03-001` AC-4 and AC-5 refuse them
 * identically — a screen that distinguished them would turn the login form
 * into a way of testing whether an address is registered, and a way of
 * learning that somebody has been suspended.
 */
export async function login(
  _previous: AuthState,
  form: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password")
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await logIn(parsed.data);
  if (outcome.status >= 400 || outcome.session === null)
    return refusalFor(outcome.status);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, outcome.session, sessionCookieOptions());
  // §8.1. The person lands where their own relationships are offered, and
  // chooses a context from there. Nothing is entered on their behalf.
  redirect(AUTH_ROUTES.account);
}

/**
 * Logout (§8.4).
 *
 * Callable from any authenticated context, and the same act wherever it is
 * called from. It ends the context and nothing else: the API keeps the
 * account, its Business ownership and its Admin authorization, and this
 * deletes one cookie.
 *
 * The server is told first. Clearing the cookie alone would leave a live
 * session nobody could see but anybody holding the token could still use.
 */
export async function logout(): Promise<never> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session !== undefined) await logOut(session);
  jar.delete(SESSION_COOKIE);
  redirect("/");
}
