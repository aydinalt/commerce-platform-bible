"use server";

import { redirect } from "next/navigation";

import {
  beginPasswordResetSchema,
  completePasswordResetSchema
} from "@commerce/contracts";
import { z } from "zod";

import { beginRecovery, completeRecovery } from "../../identity/api";
import { refusalFor, type AuthState } from "../../identity/outcome";
import { AUTH_ROUTES } from "../../identity/session";

/**
 * Beginning recovery (UX-0008 §9.1).
 *
 * Always `SENT`, whatever the address turns out to be. The API answers a known
 * and an unknown address identically, and the screen keeps that promise: a
 * recovery form that said "no such account" would be a way of asking whether
 * somebody has one.
 */
export async function beginReset(
  _previous: AuthState,
  form: FormData
): Promise<AuthState> {
  const parsed = beginPasswordResetSchema.safeParse({
    email: form.get("email")
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await beginRecovery(parsed.data.email);
  if (outcome.status >= 400) return refusalFor(outcome.status);
  return { kind: "SENT" };
}

/**
 * Setting the new password (§9.3).
 *
 * The same account is kept, and this grants nothing: no Business
 * authorization, no Admin authorization, and no change to a Suspended access
 * status. The API enforces all three; this adds no step that could.
 *
 * No session is set afterwards even where one could be. §9.3 leaves the person
 * able to *attempt* Login, and signing them in automatically would mean a
 * recovery link was enough on its own — which is a different security promise
 * from the one the Story makes.
 */
export async function completeReset(
  _previous: AuthState,
  form: FormData
): Promise<AuthState> {
  const parsed = completePasswordResetSchema.safeParse({
    password: form.get("password"),
    token: form.get("token")
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await completeRecovery(parsed.data);
  if (outcome.status >= 400) return refusalFor(outcome.status);
  redirect(AUTH_ROUTES.login);
}
