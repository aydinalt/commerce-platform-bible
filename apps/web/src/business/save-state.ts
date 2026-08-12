/**
 * What a save attempt produced.
 *
 * `UNCHANGED` rather than an error string, because UX-0005 §15 is specific: a
 * failed save preserves the last confirmed information. The screen needs to be
 * able to say "nothing was saved" without implying that anything was.
 *
 * This lives outside the `"use server"` module that uses it. A server-action
 * file may export nothing but async functions, so a shared constant declared
 * beside one would fail the build — the split is a framework rule rather than
 * a design choice, and worth stating so nobody folds it back.
 */
export type SaveState =
  | { kind: "IDLE" }
  | { kind: "SAVED" }
  | { kind: "UNCHANGED"; message: string }
  | { kind: "INVALID"; fields: Record<string, string[]> };

export const SAVE_IDLE: SaveState = { kind: "IDLE" };
