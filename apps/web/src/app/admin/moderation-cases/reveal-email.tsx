"use client";

import { useActionState } from "react";

import { CASES } from "../../../platform/copy";
import {
  REVEAL_HIDDEN,
  type RevealState
} from "../../../platform/reveal-state";

/**
 * The control that fetches a User Account case target's address (I82).
 *
 * The Owner's PII rule ends here, and the shape of this component is the rule
 * rather than a decoration on it:
 *
 * - **the address is not in this component's props.** It arrives in the action's
 *   return value, after the button is pressed. A component that received the
 *   email and hid it would render exactly the same and mean the opposite — the
 *   address would already be in the page source of every case an Admin opened,
 *   readable by anybody looking over their shoulder at the network tab, and the
 *   button would be theatre.
 * - **pressing it is a request**, which is what makes it auditable later. There
 *   is nothing to log about a `hidden` attribute being removed.
 * - **there is no "hide again".** Un-rendering an address that has already been
 *   fetched restores nothing, and offering it would suggest the reveal could be
 *   taken back. Leaving the page is what ends it.
 *
 * `useActionState` keeps the address in React state rather than in the
 * document, so it survives no navigation and is written to no store.
 */
export function RevealEmail({
  reveal
}: {
  reveal: (previous: RevealState) => Promise<RevealState>;
}) {
  const [state, act, pending] = useActionState(reveal, REVEAL_HIDDEN);

  if (state.kind === "SHOWN")
    return (
      <p>
        <a href={`mailto:${state.email}`}>{state.email}</a>
        <br />
        <small>{CASES.emailNote}</small>
      </p>
    );

  return (
    <form action={act}>
      <button disabled={pending} type="submit">
        {pending ? CASES.emailRevealing : CASES.emailReveal}
      </button>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
