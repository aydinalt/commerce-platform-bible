/**
 * What an Admin action produced.
 *
 * Lives outside the `"use server"` module that produces it: such a file may
 * export only async functions.
 *
 * `DONE` carries nothing, and that is the point. UX-0006 §7.4 lets the
 * Dashboard consume the result the target PRD produced but never redefine it,
 * so the page re-reads the case and the target rather than displaying a
 * transition this application assembled — the only way to be sure the screen
 * is not describing something that did not happen.
 */
export type AdminActionState =
  { kind: "IDLE" } | { kind: "DONE" } | { kind: "REFUSED"; message: string };

export const ADMIN_IDLE: AdminActionState = { kind: "IDLE" };
