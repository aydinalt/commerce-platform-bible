/**
 * What an Offering action produced.
 *
 * `REFUSED` carries the code the API used rather than a message this file
 * invented, because UX-0005 §15 says a failed Offering action does not claim a
 * lifecycle transition — and the safest way not to claim one is to repeat what
 * the authority said instead of interpreting it.
 *
 * Like `SaveState`, this lives outside the `"use server"` module that produces
 * it: such a file may export only async functions.
 */
export type ActionState =
  | { kind: "IDLE" }
  | { kind: "DONE" }
  | { kind: "REFUSED"; code: string; message: string }
  | { kind: "INVALID"; fields: Record<string, string[]> };

export const ACTION_IDLE: ActionState = { kind: "IDLE" };

/**
 * What each refusal says, in the platform's own words.
 *
 * `PUBLICATION_MINIMUM_NOT_SATISFIED` is the one worth being careful about.
 * UX-0005 §9 requires the experience to present validation feedback *without
 * redefining the minimum*, so this says the Offering is not ready and points
 * at the edit screen — it does not list conditions, because listing them here
 * would be a second definition of PRD-0001 §6.1.1 that could drift from the
 * one the API enforces.
 *
 * The API's error envelope publishes a code and a message and drops everything
 * else, so the specific shortfall is not available to show even if the screen
 * wanted to. That is a real limitation and is recorded rather than papered
 * over: the person is told what to do next, not exactly what is missing.
 */
export const ACTION_REFUSALS: Record<string, string> = {
  BUSINESS_RESTRICTED:
    "This Business is Restricted, so that action is unavailable right now.",
  OFFERING_ALREADY_ARCHIVED: "This Offering has already been retired.",
  OFFERING_NOT_EDITABLE: "This Offering can no longer be edited.",
  OFFERING_NOT_PUBLISHABLE: "Only a Draft Offering can be published.",
  OFFERING_SLUG_CONFLICT:
    "You already have an Offering with that address. Choose another.",
  PUBLICATION_MINIMUM_NOT_SATISFIED:
    "This Offering is not ready to publish yet. Open it to see what is still needed."
};

export function refusalMessage(code: string): string {
  return (
    ACTION_REFUSALS[code] ??
    "That could not be done. Nothing about this Offering has changed."
  );
}

/**
 * The same codes, said the way a save has to say them.
 *
 * A second map rather than a second sentence bolted onto the first, because
 * two of these codes reach the person at two different moments and mean two
 * different things. `PUBLICATION_MINIMUM_NOT_SATISFIED` on a publication means
 * "this is not ready yet"; on a save of a Published Offering it means "your
 * change would have left something already public incomplete, so it was not
 * applied". Wording that covered both would be true of neither.
 *
 * `BUSINESS_RESTRICTED` is likewise narrower here: `US-BUS-F03-001` AC-5 keeps
 * Draft editing with a Restricted owner, so the refusal is about which
 * Offering, not about editing as such.
 */
export const EDIT_REFUSALS: Record<string, string> = {
  ATTRIBUTE_VALUE_MISMATCH:
    "One of the values does not fit the Attribute it belongs to. Nothing was saved.",
  BUSINESS_RESTRICTED:
    "This Business is Restricted, so only its Draft Offerings can be edited. Nothing was saved.",
  OFFERING_ARCHIVED: "This Offering is retired and can no longer be edited.",
  PUBLICATION_MINIMUM_NOT_SATISFIED:
    "That change was not saved: it would have left this Offering short of what it needs to stay published."
};

export function editRefusalMessage(code: string): string {
  return (
    EDIT_REFUSALS[code] ??
    "That could not be saved. This Offering still holds what it held before."
  );
}
