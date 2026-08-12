"use client";

import { useActionState } from "react";

import { DECISION_IDLE, type DecisionActionState } from "../../decision/state";

/**
 * One explicit selection (UX-0009 §8).
 *
 * A submission per member, and one more that names nothing — clearing. §8.3
 * lists four ways selection clears and three of them happen on the server; this
 * is the fourth, the person changing their mind, and it goes through the same
 * route so all four end in one place.
 *
 * The single-Offering context still renders this. §8.1 requires the explicit
 * act even where there is only one thing to choose, because a handoff that
 * began without anyone choosing would be the platform choosing.
 */
export function SelectionButton({
  action,
  label,
  offeringId
}: {
  action: (
    previous: DecisionActionState,
    form: FormData
  ) => Promise<DecisionActionState>;
  label: string;
  offeringId: string | null;
}) {
  const [state, dispatch, pending] = useActionState(action, DECISION_IDLE);

  return (
    <form action={dispatch}>
      {offeringId === null ? null : (
        <input name="offeringId" type="hidden" value={offeringId} />
      )}
      <button disabled={pending} type="submit">
        {label}
      </button>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
