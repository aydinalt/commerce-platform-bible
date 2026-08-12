"use client";

import { useActionState } from "react";

import {
  ACTION_IDLE,
  type ActionState
} from "../../../business/action-outcome";

/**
 * One Offering action, as a submission.
 *
 * A form rather than a link, for the same reason the API makes each one a
 * `POST`: publishing and retiring are things a person does, not places they
 * go. A link would let a transition begin by being followed — from a bookmark,
 * a prefetch, a crawler.
 *
 * The button is disabled while the action resolves, which is §14's loading
 * behaviour: the action stays unavailable until the authoritative target state
 * is resolved, so a second click cannot make a second attempt.
 */
export function OfferingAction({
  action,
  label
}: {
  action: (previous: ActionState, form: FormData) => Promise<ActionState>;
  label: string;
}) {
  const [state, dispatch, pending] = useActionState(action, ACTION_IDLE);

  return (
    <form action={dispatch}>
      <button type="submit">{pending ? `${label}…` : label}</button>
      {/* §15. A refusal says what did not happen. It never says the Offering
          moved, because it did not — the message is the API's own reason,
          repeated rather than reinterpreted. */}
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
