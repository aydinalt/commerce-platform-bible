/**
 * The state of a PII reveal (I82).
 *
 * **Kept out of the `"use server"` module on purpose.** A file marked
 * `"use server"` may export async functions and nothing else — every other
 * export becomes a server-action reference the client cannot dereference, and
 * `next build` fails while collecting page data with an error that names the
 * page rather than the export.
 *
 * `REVEAL_HIDDEN` lived in `moderation-cases/actions.ts` for one commit and the
 * build caught it. This repository has been here before: `I69` shipped a string
 * constant in a `"use server"` file, and it reached the Owner's machine because
 * typecheck, lint and the whole suite all pass — none of them runs `next build`.
 */
export type RevealState =
  | { kind: "HIDDEN" }
  | { kind: "REFUSED"; message: string }
  | { kind: "SHOWN"; email: string };

export const REVEAL_HIDDEN: RevealState = { kind: "HIDDEN" };
