"use client";

import { useActionState } from "react";

import {
  DESTINATION_ACTION_LABELS,
  DESTINATION_ACTION_RESULTS
} from "../../../platform/destinations";
import { DESTINATIONS } from "../../../platform/copy";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

type Action = (
  previous: AdminActionState,
  form: FormData
) => Promise<AdminActionState>;

type Verb = keyof typeof DESTINATION_ACTION_LABELS;

/**
 * One Affiliate Destination Administration action (UX-0006 §9).
 *
 * The result is stated beside the button in `US-PLT-F07-001`'s own terms, and
 * §9's last line is why none of them is computed here: the Dashboard reports
 * what the platform decided and recalculates nothing.
 *
 * `REVIEW` says it changes nothing. That is the honest description of a
 * control that exists so somebody can record having looked — and a button that
 * appeared to decide something while deciding nothing would be worse than no
 * button.
 *
 * `VALIDATE_INVALID` asks for a reason, because an Invalid result is something
 * the Business has to act on and "invalid" alone tells them nothing. The
 * contract allows it to be empty; the form asks anyway.
 */
export function DestinationAction({
  action,
  verb
}: {
  action: Action;
  verb: Verb;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <input name="verb" type="hidden" value={verb} />
      <fieldset disabled={pending}>
        <legend>{DESTINATION_ACTION_LABELS[verb]}</legend>
        <p>{DESTINATION_ACTION_RESULTS[verb]}</p>

        {verb === "VALIDATE_INVALID" ? (
          <p>
            <label htmlFor={`reason-${verb}`}>
              {DESTINATIONS.invalidReason}
            </label>
            <textarea id={`reason-${verb}`} name="reason" />
          </p>
        ) : null}

        {verb === "REVIEW" ? (
          <p>
            <label htmlFor="note">{DESTINATIONS.note}</label>
            <textarea id="note" name="note" />
          </p>
        ) : null}

        <button type="submit">
          {pending ? DESTINATIONS.working : DESTINATION_ACTION_LABELS[verb]}
        </button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
