/**
 * What a Decision action produced.
 *
 * Lives outside the `"use server"` module that produces it: such a file may
 * export only async functions.
 *
 * There is no `DONE` payload. A successful selection or question changes what
 * the server holds, and the page re-reads it — so nothing on screen can be a
 * turn or a selection the browser assembled and the platform never saw.
 */
export type DecisionActionState =
  { kind: "IDLE" } | { kind: "DONE" } | { kind: "REFUSED"; message: string };

export const DECISION_IDLE: DecisionActionState = { kind: "IDLE" };

export { chatRefusal, selectionRefusal } from "./copy";
