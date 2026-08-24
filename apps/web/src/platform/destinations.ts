import type { DestinationWorkloadItem } from "@commerce/contracts";

import { TERMS } from "../vocabulary";

type Category = NonNullable<DestinationWorkloadItem["category"]>;
type Destination = DestinationWorkloadItem["destination"];

/**
 * What each workload category means, and who is expected to move next.
 *
 * The last part matters most. `BUSINESS_CORRECTION_NEEDED` is the one item in
 * this queue that is *not* waiting on the platform, and an Admin who did not
 * know that would keep looking at it wondering what to do. Saying whose turn
 * it is turns a list of work into a list of work you can actually do.
 */
export const WORKLOAD_COPY: Record<Category, string> = {
  BUSINESS_CORRECTION_NEEDED: `Platform bu adreste bir sorun buldu. Değiştirmesi gereken ${TERMS.business} — onlar yapana kadar burada yapılacak bir şey yok.`,
  NEEDS_VALIDATION: "Bu adresi henüz kimse denetlemedi.",
  READY_TO_ENABLE: "Denetlendi ve geçerli. Açılabilir."
};

export const WORKLOAD_HEADINGS: Record<Category, string> = {
  BUSINESS_CORRECTION_NEEDED: `${TERMS.business} bekleniyor`,
  NEEDS_VALIDATION: "Denetim bekliyor",
  READY_TO_ENABLE: "Açılmaya hazır"
};

/**
 * The order the queue is worked in.
 *
 * Deliberate rather than alphabetical: what the platform can act on comes
 * first, and what it is waiting on somebody else for comes last. A queue that
 * opened on items nobody here can move would teach an Admin to scroll past the
 * top of it.
 */
export const WORKLOAD_ORDER: readonly Category[] = [
  "READY_TO_ENABLE",
  "NEEDS_VALIDATION",
  "BUSINESS_CORRECTION_NEEDED"
];

/**
 * The four actions, and what each produces.
 *
 * `US-PLT-F07-001` owns every one of these results; §9 lets the Dashboard
 * report them and forbids recalculating them. Review is the one that produces
 * nothing, and saying so is the point — a control that appeared to decide
 * something while deciding nothing is worse than no control.
 */
export const DESTINATION_ACTION_LABELS = {
  DISABLE: "Kapat",
  ENABLE: "Aç",
  REVIEW: "İnceleme kaydet",
  VALIDATE_INVALID: "Geçersiz işaretle",
  VALIDATE_VALID: "Geçerli işaretle"
} as const;

export const DESTINATION_ACTION_RESULTS = {
  DISABLE:
    "Kapalı duruma geçer ve devir alamaz. Denetim sonucu olduğu gibi kalır.",
  ENABLE: "Açık duruma geçer ve devir alabilir. Geçerli bir sonuç gerektirir.",
  REVIEW: "Hiçbir şeyi değiştirmez. Birinin baktığını kaydeder.",
  VALIDATE_INVALID: "Geçersiz sonucunu kaydeder. Durum olduğu yerde kalır.",
  VALIDATE_VALID: "Geçerli sonucunu kaydeder. Durum olduğu yerde kalır."
} as const;

export const DESTINATION_PATHS = {
  DISABLE: "affiliate-destination/disablement",
  ENABLE: "affiliate-destination/enablement",
  REVIEW: "affiliate-destination/review",
  VALIDATE: "affiliate-destination/validation"
} as const;

/**
 * Whether Enable may be offered.
 *
 * `US-PLT-F07-001` AC-6 requires a Valid result, and the route refuses without
 * one inside its own transaction. This is the same condition read as a
 * question — an offered Enable is one that would be honoured.
 */
export function enableAvailable(destination: Destination): boolean {
  return (
    destination.validationResult === "VALID" && destination.status !== "ENABLED"
  );
}

/// Disable applies to something that is enabled. Nothing else can be disabled,
/// because nothing else is on.
export function disableAvailable(destination: Destination): boolean {
  return destination.status === "ENABLED";
}

/**
 * §9. This family is separate from General Moderation.
 *
 * Said on the screen, because the two queues sit in the same panel and an
 * Admin moving between them has no other way to know that validating a
 * destination is not a moderation action and opens no case.
 */
export const SEPARATE_FROM_MODERATION = `${TERMS.affiliateDestination} yönetimi, Genel Moderasyon değildir. Buradaki hiçbir şey ${TERMS.moderationCase.toLocaleLowerCase("tr")} açmaz ya da kapatmaz.`;

/// §14. An empty queue is a state worth naming, and it is not an invitation to
/// go and find something else to do to a Business.
export const NO_WORKLOAD = `Platformu bekleyen ${TERMS.affiliateDestination.toLocaleLowerCase("tr")} yok.`;
