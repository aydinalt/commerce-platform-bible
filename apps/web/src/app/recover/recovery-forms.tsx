"use client";

import { useActionState } from "react";

import { PASSWORD_MIN_LENGTH } from "@commerce/contracts";

import { IDLE, REFUSAL_COPY, type AuthState } from "../../identity/outcome";

/**
 * Beginning recovery. One field, and one answer whatever happens: §9.1 does
 * not disclose whether the address is registered, so this screen has nothing
 * to branch on.
 */
export function BeginRecoveryForm({
  action
}: {
  action: (previous: AuthState, form: FormData) => Promise<AuthState>;
}) {
  const [state, dispatch, pending] = useActionState(action, IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>Reset your password</legend>
        <label htmlFor="email">Email address</label>
        <input
          aria-invalid={fields.email ? true : undefined}
          autoComplete="email"
          id="email"
          name="email"
          required
          type="email"
        />
        {fields.email ? <p role="alert">{fields.email.join(" ")}</p> : null}
        <button type="submit">{pending ? "Working…" : "Send link"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? (
        <p role="alert">{REFUSAL_COPY[state.reason]}</p>
      ) : null}
      {state.kind === "SENT" ? (
        <p role="status">
          If that address has an account, a link to set a new password is on its
          way.
        </p>
      ) : null}
    </form>
  );
}

/**
 * Setting the new password (§9.3).
 *
 * The token rides in a hidden field rather than being read from the address by
 * the action, so submitting the form is what spends it. A page that spent it
 * on arrival would burn the link for somebody who opened it and then went to
 * find their password manager.
 */
export function ResetPasswordForm({
  action,
  token
}: {
  action: (previous: AuthState, form: FormData) => Promise<AuthState>;
  token: string;
}) {
  const [state, dispatch, pending] = useActionState(action, IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>Set a new password</legend>
        <input name="token" type="hidden" value={token} />
        <label htmlFor="password">New password</label>
        <input
          aria-invalid={fields.password ? true : undefined}
          id="password"
          minLength={PASSWORD_MIN_LENGTH}
          name="password"
          required
          type="password"
        />
        {fields.password ? (
          <p role="alert">{fields.password.join(" ")}</p>
        ) : null}
        <button type="submit">
          {pending ? "Working…" : "Set new password"}
        </button>
      </fieldset>
      {state.kind === "REFUSED" ? (
        <p role="alert">{REFUSAL_COPY[state.reason]}</p>
      ) : null}
    </form>
  );
}
