"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { beginRegistrationSchema } from "@commerce/contracts";
import { z } from "zod";

import { beginRegistration, confirmRegistration } from "../../identity/api";
import {
  AUTH_ROUTES,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../identity/session";
import { refusalFor, type AuthState } from "../../identity/outcome";

/**
 * Registration (UX-0008 §6).
 *
 * The screen's whole job before proof is to stop: §6.2 forbids an authenticated
 * context existing until control of the address is proven, so this action can
 * only ever reach `SENT`. There is no branch here that could produce a session,
 * because the API mints none — the token is created at delivery, not at
 * submission.
 *
 * §6.4 is why a repeated address looks identical. The API answers a second
 * registration for a known address exactly as it answers a new one, so this
 * has nothing to disclose even if it wanted to.
 */
export async function register(
  _previous: AuthState,
  form: FormData
): Promise<AuthState> {
  const parsed = beginRegistrationSchema.safeParse({
    email: form.get("email"),
    password: form.get("password")
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await beginRegistration(parsed.data);
  if (outcome.status >= 400) return refusalFor(outcome.status);
  return { kind: "SENT" };
}

/**
 * Completing the proof (§6.3).
 *
 * This is the first moment an account exists, and the first moment a session
 * may. Both happen at once: the API creates the Enabled account and returns
 * the token in the same response, so there is no window in which one exists
 * without the other.
 *
 * The token in the link is spent here and never rendered. It reaches this
 * function from the address bar and leaves it as a cookie, and appears in no
 * page in between.
 */
export async function confirm(token: string): Promise<AuthState> {
  const outcome = await confirmRegistration(token);
  if (outcome.status >= 400) return refusalFor(outcome.status);
  if (outcome.session !== null) {
    const jar = await cookies();
    jar.set(SESSION_COOKIE, outcome.session, sessionCookieOptions());
  }
  redirect(AUTH_ROUTES.account);
}
