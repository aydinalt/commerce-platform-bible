import type { DirectContactRevealResponse } from "@commerce/contracts";

/**
 * What a Decision action produced.
 *
 * Lives outside the `"use server"` module that produces it: such a file may
 * export only async functions.
 *
 * `DONE` carries nothing. A selection or a question changes what the server
 * holds and the page re-reads it, so nothing on screen can be a turn or a
 * selection the browser assembled and the platform never saw.
 *
 * `REVEALED` is the one exception, and it is one because of a property worth
 * keeping: `US-DEC-F06-001` records the *channel* and not the value, so the
 * Business's protected information exists in exactly one place — the response
 * to the request that asked for it. Re-reading it later would mean storing it
 * somewhere a second time, which is the thing the record deliberately avoids.
 */
export type DecisionActionState =
  | { kind: "IDLE" }
  | { kind: "DONE" }
  | {
      kind: "REVEALED";
      channel: DirectContactRevealResponse["channel"];
      value: string;
    }
  | { kind: "REFUSED"; message: string };

export const DECISION_IDLE: DecisionActionState = { kind: "IDLE" };

export { chatRefusal, selectionRefusal } from "./copy";
