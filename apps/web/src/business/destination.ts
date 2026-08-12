import type { DestinationManagementEntry } from "@commerce/contracts";

type Entry = DestinationManagementEntry["entries"][number];
type Destination = NonNullable<DestinationManagementEntry["destination"]>;

/**
 * What each entry is called.
 *
 * The vocabulary is read off the contract, so an entry added upstream breaks
 * this file rather than rendering as nothing. There is no `REVIEW`, `VALIDATE`,
 * `ENABLE` or `DISABLE` here for the same reason there is none there:
 * `US-OFR-F06-001` AC-8 denies all four to the Business, so none is a value
 * this type can hold and none can appear on this screen by accident.
 */
export const DESTINATION_ENTRY_LABELS: Record<Entry, string> = {
  CREATE: "Add a destination",
  EDIT: "Change the destination",
  VIEW: "Destination"
};

/**
 * The destination's own status, said plainly.
 *
 * These are readings of what the platform decided, never predictions of what
 * it will decide. `DRAFT` is not "waiting for approval" — nothing in
 * `US-OFR-F07-001` promises that a Draft destination will be looked at, and
 * copy that implied a queue would be inventing one.
 */
export const STATUS_COPY: Record<Destination["status"], string> = {
  DISABLED: "Disabled by the platform.",
  DRAFT: "Not enabled.",
  ENABLED: "Enabled by the platform."
};

export const VALIDATION_COPY: Record<Destination["validationResult"], string> =
  {
    INVALID: "The platform found a problem with this reference.",
    NOT_VALIDATED: "Not checked by the platform.",
    VALID: "Checked by the platform."
  };

/**
 * Handoff Eligibility, worded as the composed fact it is.
 *
 * `US-OFR-F07-001` derives this from the destination's status and validation
 * result rather than storing it, and this copy does not restate the
 * composition — a sentence here explaining which combination produces which
 * answer would be a second definition, and the first one is not this screen's.
 */
export const ELIGIBILITY_COPY: Record<
  Destination["handoffEligibility"],
  string
> = {
  ELIGIBLE: "Ready to hand off to.",
  INELIGIBLE: "Not ready to hand off to."
};

/**
 * What saving a reference does to everything else.
 *
 * Said before the form, because it is a consequence the person cannot see
 * coming: `US-OFR-F06-001` AC-4 returns the destination to Draft, Not
 * Validated and Ineligible whenever a reference is saved. Someone correcting a
 * typo on an Enabled destination is about to disable it, and finding that out
 * afterwards would be finding out too late.
 */
export const SAVE_CONSEQUENCE =
  "Saving a new address returns this destination to not enabled and not checked. The platform decides again from there.";

/**
 * Who does what, stated once so the screen never implies otherwise.
 *
 * §13 lists five things the Business cannot do. Rather than five absent
 * buttons and no explanation, the division is named — an owner who does not
 * know that enabling is the platform's job will read "Not enabled" as
 * something they forgot to do.
 */
export const PLATFORM_OWNS =
  "Checking, enabling and disabling a destination are the platform's, not yours.";

export function offers(entries: readonly Entry[], entry: Entry): boolean {
  return entries.includes(entry);
}
