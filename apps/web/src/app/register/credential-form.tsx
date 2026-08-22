"use client";

import { useActionState } from "react";

import { PASSWORD_MIN_LENGTH } from "@commerce/contracts";

import { ACTIONS, FIELDS, SENT } from "../../identity/copy";
import { IDLE, REFUSAL_COPY, type AuthState } from "../../identity/outcome";

/**
 * The one form both Registration and Login use.
 *
 * They ask for the same two things and refuse in the same shapes, so one
 * component serves both — which also means the two screens cannot drift into
 * disclosing different amounts about an address.
 *
 * `useActionState` keeps the submitted address across a refusal and never the
 * password: UX-0008 §13 preserves entered non-secret context, and a password
 * put back into a field is a password sitting in a page.
 */
export function CredentialForm({
  action,
  legend,
  returnTo,
  submit
}: {
  action: (previous: AuthState, form: FormData) => Promise<AuthState>;
  legend: string;
  /**
   * Where an interrupted journey resumes (UX-0009 §11.2).
   *
   * A destination *name*, not an address. The action maps it through a closed
   * list, so a value this application does not own resolves to nothing — an
   * open redirect is not defended against, it is unspeakable.
   */
  returnTo?: string | undefined;
  submit: string;
}) {
  const [state, dispatch, pending] = useActionState(action, IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      {returnTo === undefined ? null : (
        <input name="return" type="hidden" value={returnTo} />
      )}
      <fieldset disabled={pending}>
        <legend>{legend}</legend>

        <label htmlFor="email">{FIELDS.email}</label>
        <input
          aria-describedby={fields.email ? "email-error" : undefined}
          aria-invalid={fields.email ? true : undefined}
          autoComplete="email"
          id="email"
          name="email"
          required
          type="email"
        />
        {fields.email ? (
          <p id="email-error" role="alert">
            {fields.email.join(" ")}
          </p>
        ) : null}

        <label htmlFor="password">{FIELDS.password}</label>
        <input
          aria-describedby={fields.password ? "password-error" : undefined}
          aria-invalid={fields.password ? true : undefined}
          id="password"
          minLength={PASSWORD_MIN_LENGTH}
          name="password"
          required
          type="password"
        />
        {fields.password ? (
          <p id="password-error" role="alert">
            {fields.password.join(" ")}
          </p>
        ) : null}

        {/* §13. The button is disabled while the step resolves, so a second
            submission cannot create a second attempt. */}
        <button type="submit">{pending ? ACTIONS.pending : submit}</button>
      </fieldset>

      {state.kind === "REFUSED" ? (
        <p role="alert">{REFUSAL_COPY[state.reason]}</p>
      ) : null}
      {state.kind === "SENT" ? <p role="status">{SENT.registration}</p> : null}
    </form>
  );
}
