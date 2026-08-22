import type { DestinationManagementEntry } from "@commerce/contracts";

import { TERMS } from "../vocabulary";

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
  CREATE: "Adres ekle",
  EDIT: "Adresi değiştir",
  VIEW: TERMS.affiliateDestination
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
  DISABLED: "Platform tarafından kapatıldı.",
  DRAFT: "Açık değil.",
  ENABLED: "Platform tarafından açıldı."
};

export const VALIDATION_COPY: Record<Destination["validationResult"], string> =
  {
    INVALID: "Platform bu adreste bir sorun buldu.",
    NOT_VALIDATED: "Platform tarafından kontrol edilmedi.",
    VALID: "Platform tarafından kontrol edildi."
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
  ELIGIBLE: "Yönlendirmeye hazır.",
  INELIGIBLE: "Yönlendirmeye hazır değil."
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
  "Yeni bir adres kaydetmek bu yönlendirmeyi açık değil ve kontrol edilmedi durumuna döndürür. Karar yeniden platformundur.";

/**
 * Who does what, stated once so the screen never implies otherwise.
 *
 * §13 lists five things the Business cannot do. Rather than five absent
 * buttons and no explanation, the division is named — an owner who does not
 * know that enabling is the platform's job will read "Not enabled" as
 * something they forgot to do.
 */
export const PLATFORM_OWNS =
  "Kontrol etmek, açmak ve kapatmak platformun işidir, sizin değil.";

export function offers(entries: readonly Entry[], entry: Entry): boolean {
  return entries.includes(entry);
}
