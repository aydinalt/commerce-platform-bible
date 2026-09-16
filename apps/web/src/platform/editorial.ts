import type { EditorialReviewAdmin } from "@commerce/contracts";

import { EDITORIAL } from "./copy";

/**
 * What the platform refuses when a review is written, and what it sounds like
 * (I94, `UX-0006` **Frozen v1.2** §12C).
 *
 * None of these sentences is the rule. Every one of them is enforced in the
 * domain, the service or a database constraint — `modules/editorial` holds the
 * transitions and the publication requirements, and four CHECK constraints hold
 * the rest. These are what a rule sounds like when somebody meets it.
 *
 * **Each says what survived**, for the reason `CATALOG_REFUSALS` does: the
 * alternative to an act being performed is not nothing. A refused publication
 * leaves a Draft, a refused withdrawal leaves a published review on every
 * listing carrying its key, and a writer who did not know that would go looking
 * for what they had just broken.
 */
export const EDITORIAL_REFUSALS: Record<string, string> = {
  /**
   * AC-15. The refusal leads to the review that already exists, because the act
   * the writer wanted is almost always a revision of it — §12C.4 says so, and
   * the page supplies the link beside this sentence.
   */
  EDITORIAL_REVIEW_EXISTS:
    "Bu ürün anahtarı zaten bir editöryel inceleme taşıyor. Bir ürünün bir incelemesi olur; var olanı düzenleyin.",
  EDITORIAL_REVIEW_INCOMPLETE:
    "Bu inceleme yayımlanabilmek için eksik. Eksik olanların tamamı aşağıda.",
  EDITORIAL_REVIEW_NOT_FOUND: EDITORIAL.notFound,
  /**
   * The transitions §12C.1 draws, refused from the one side a writer can reach
   * them: nothing returns to Draft, and a re-check is offered only where it
   * would mean something.
   */
  EDITORIAL_REVIEW_TRANSITION:
    "Bu inceleme bu durumdayken bu işlem yapılamaz. Durumu değişmedi.",
  /** AC-14. A review of a key nothing carries is a judgement about nothing. */
  UNKNOWN_PRODUCT_KEY:
    "Katalog bu ürün anahtarını taşımıyor. Hiçbir şey oluşturulmadı.",
  VALIDATION_FAILED:
    "Bu, bu alanın kabul ettiği bir değer değil. Hiçbir şey değişmedi."
};

export function editorialRefusal(code: string): string {
  return (
    EDITORIAL_REFUSALS[code] ??
    "Bu işlem yapılamadı. İnceleme olduğu gibi duruyor."
  );
}

/**
 * What publication is still missing, named in the writer's language.
 *
 * The domain returns these in a fixed order and returns **all** of them rather
 * than the first, so that a writer is told everything at once instead of
 * discovering it one refusal at a time (§12C.8). This translates; it does not
 * decide, and a part the domain names that this map does not know falls through
 * to its own key rather than disappearing.
 */
const MISSING_PARTS: Record<string, string> = {
  byline: EDITORIAL.byline,
  cons: EDITORIAL.cons,
  pros: EDITORIAL.pros,
  score: EDITORIAL.score,
  sections: EDITORIAL.sections,
  verdict: EDITORIAL.verdict
};

export function missingParts(missing: readonly string[]): string[] {
  return missing.map((part) => MISSING_PARTS[part] ?? part);
}

/**
 * How long it has been since a review was last re-checked (AC-17).
 *
 * **A review that has never been re-checked is not given the age of its
 * publication.** `null` returns `null` here and the column says so in words.
 * "Published eight months ago" and "checked eight months ago" are different
 * claims; borrowing the first to fill the second is the one thing this column
 * must not do, and it is the kind of helpfulness that would be added by
 * accident.
 *
 * Coarse on purpose. The figure informs a decision a person takes — AC-18
 * forbids the platform taking it — so the distance between "2 gün" and "3 gün"
 * carries nothing, while the distance between days and months carries the whole
 * signal.
 */
export function sinceLastChecked(
  lastCheckedAt: string | null,
  now: Date = new Date()
): string | null {
  if (lastCheckedAt === null) return null;
  const then = new Date(lastCheckedAt).getTime();
  if (Number.isNaN(then)) return null;

  const days = Math.floor((now.getTime() - then) / 86_400_000);
  if (days <= 0) return "bugün";
  if (days === 1) return "1 gün";
  if (days < 30) return `${days} gün`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay`;
  return `${Math.floor(days / 365)} yıl`;
}

/**
 * The acts a review's current state allows (§12C.1).
 *
 * The moves are `Draft → Published`, `Published → Withdrawn` and
 * `Withdrawn → Published`; **nothing returns to Draft**, and re-checking is
 * offered on a Published review and on no other — a Draft has never been
 * presented, and a Withdrawn review is presented nowhere, so re-checking either
 * would claim currency for something nobody can read.
 *
 * This decides what the screen *offers*. It is not the enforcement: the domain
 * refuses the same moves, and the page reports what came back rather than
 * assuming it knew. Offering an act the platform would refuse is a worse
 * screen, not a security hole.
 */
export function actsAvailable(status: EditorialReviewAdmin["status"]): {
  publish: boolean;
  recheck: boolean;
  withdraw: boolean;
} {
  return {
    publish: status !== "PUBLISHED",
    recheck: status === "PUBLISHED",
    withdraw: status === "PUBLISHED"
  };
}

/**
 * One item per line, which is how a person writes a list of short points.
 *
 * Blank lines are dropped rather than sent as empty strings: the contract holds
 * each item to at least one character, so a trailing newline would otherwise
 * turn a finished list into a refused one.
 */
export function linesToItems(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/**
 * The parts of a review, read off the form (§12C.5).
 *
 * **Here rather than beside the actions that call it, so that it can be
 * tested.** A `"use server"` module may export only async functions, which
 * would have made this the one piece of the surface whose output — the body
 * every save and every creation sends — could not be checked against the
 * contract that has to accept it. That is the seam most likely to break and was
 * the one with no test on it.
 *
 * **There is nothing here that is not one of the six parts** (AC-16). No note,
 * no tag, no label. A form field this function does not read is a field that
 * cannot reach storage, which is the closed shape `PRD-0009` §13.6 requires
 * seen from the one end a caller controls.
 *
 * **Sections arrive as indexed pairs and a pair with neither half is dropped.**
 * The form renders the sections that exist plus one empty slot, so the blank
 * slot is submitted on every save and must not become an empty section — the
 * contract holds a heading and a body to at least one character each, so it
 * would be refused rather than ignored.
 */
export function draftFromForm(form: FormData): {
  byline: string | null;
  cons: string[];
  pros: string[];
  score: number | null;
  sections: { body: string; heading: string }[];
  verdict: string | null;
} {
  const text = (name: string): string | null => {
    const value = form.get(name);
    if (typeof value !== "string" || value.trim() === "") return null;
    return value.trim();
  };

  const sections: { body: string; heading: string }[] = [];
  for (let index = 0; ; index += 1) {
    const heading = form.get(`sectionHeading${String(index)}`);
    const body = form.get(`sectionBody${String(index)}`);
    if (heading === null && body === null) break;
    const pair = {
      body: typeof body === "string" ? body.trim() : "",
      heading: typeof heading === "string" ? heading.trim() : ""
    };
    if (pair.heading !== "" || pair.body !== "") sections.push(pair);
  }

  const score = form.get("score");
  return {
    byline: text("byline"),
    cons: linesToItems(form.get("cons")),
    pros: linesToItems(form.get("pros")),
    /*
     * An empty box is "no score yet", which a Draft may be. A box carrying
     * something that is not a number is sent as it stands so the contract
     * refuses it — parsing it to `null` here would silently discard what the
     * writer typed and report success.
     */
    score:
      typeof score !== "string" || score.trim() === "" ? null : Number(score),
    sections,
    verdict: text("verdict")
  };
}
