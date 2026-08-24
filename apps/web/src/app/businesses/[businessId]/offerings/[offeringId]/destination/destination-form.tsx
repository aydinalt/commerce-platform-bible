"use client";

import { SUBMIT, submitLabel } from "../../../../../../form-copy";

import { useActionState } from "react";

import { DESTINATION } from "../../../../../../business/copy";

import {
  ACTION_IDLE,
  type ActionState
} from "../../../../../../business/action-outcome";
import { SAVE_CONSEQUENCE } from "../../../../../../business/destination";

/**
 * The destination reference form (UX-0005 §13).
 *
 * One field, because the contract has one field. Status, validation result and
 * Handoff Eligibility are readings elsewhere on this page and are not inputs
 * anywhere — `US-OFR-F06-001` AC-8 reserves all three to the platform, and a
 * disabled control for each would suggest they are things an owner might one
 * day be allowed to set.
 *
 * The consequence of saving is stated above the field rather than after the
 * save. AC-4 returns the destination to Draft, Not Validated and Ineligible on
 * every reference change, so someone fixing a typo on an Enabled destination is
 * about to disable it — and finding that out afterwards would be too late.
 */
export function DestinationForm({
  action,
  label,
  reference
}: {
  action: (previous: ActionState, form: FormData) => Promise<ActionState>;
  label: string;
  reference: string;
}) {
  const [state, dispatch, pending] = useActionState(action, ACTION_IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>{label}</legend>
        <p>{SAVE_CONSEQUENCE}</p>

        <p>
          <label htmlFor="reference">{DESTINATION.address}</label>
          <input
            aria-invalid={fields.reference ? true : undefined}
            defaultValue={reference}
            id="reference"
            name="reference"
            required
            type="text"
          />
          {fields.reference ? (
            <span role="alert">{fields.reference.join(" ")}</span>
          ) : null}
        </p>

        <button type="submit">{submitLabel(SUBMIT.save, pending)}</button>
      </fieldset>

      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
      {state.kind === "DONE" ? <p role="status">{DESTINATION.saved}</p> : null}
    </form>
  );
}
