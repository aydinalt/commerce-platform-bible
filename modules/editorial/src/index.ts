/**
 * The Editorial module — the platform's own judgement of a product.
 *
 * Behaviour owner: `PRD-0009-editorial-review.md` **Frozen v0.4**. Features
 * `EDT F01` (presentation) and `EDT F02` (authoring), allocated in
 * `EDITORIAL_FEATURE_REGISTRY.md` **Frozen v1.1**.
 *
 * This module holds types and domain errors only, per `modules/README.md`.
 * `F01` reading and `F02` writing are two surfaces over the one model below —
 * that is the whole reason the Owner commissioned them together rather than
 * building the read side first and refactoring when writing arrived.
 */

/**
 * The Product Key a review is written about.
 *
 * **This is a real `offering.product_key`, never the `coalesce` fallback.**
 * `product_review` and `favourite` group by
 * `coalesce(offering.product_key, offering.id::text)`, so a listing with no key
 * becomes its own group of one. Editorial cannot use that. A review written
 * against such a group would be attached to an Offering wearing a Product Key's
 * name, and would vanish with that Offering — which is precisely the failure
 * `US-EDT-F01-001` AC-9 exists to prevent, arriving through the back door of
 * the convenience that was supposed to help.
 *
 * `US-EDT-F02-001` AC-1 forbids attaching a review to an Offering and AC-14
 * requires the key to be one the catalogue carries. Together they leave one
 * reading: a real key, or no review.
 */
export type ProductKey = string;

/**
 * `PRD-0009` §13.3.
 *
 * `WITHDRAWN` exists so that removing a published judgement is not a database
 * operation. Without it the only remedy for a review that turns out to be wrong
 * is an operator editing rows — the first of the three risks §13 was written to
 * close, arriving through the back door of the document that closes it.
 *
 * Withdrawal is not deletion: the review stops being presented and the record
 * that it existed, and who withdrew it, remains.
 */
export type EditorialReviewStatus = "DRAFT" | "PUBLISHED" | "WITHDRAWN";

export const EDITORIAL_REVIEW_STATUSES: readonly EditorialReviewStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "WITHDRAWN"
];

/** `PRD-0009` §5 — pros and cons are two lists, kept apart and both required. */
export type EditorialPointKind = "PRO" | "CON";

export const EDITORIAL_POINT_KINDS: readonly EditorialPointKind[] = [
  "PRO",
  "CON"
];

/** A headed passage of prose. `PRD-0009` §5. */
export interface EditorialSection {
  body: string;
  heading: string;
  /** Author-chosen order. Presentation follows it; nothing sorts by content. */
  position: number;
}

/** One entry in the pros list or the cons list. `PRD-0009` §5. */
export interface EditorialPoint {
  kind: EditorialPointKind;
  position: number;
  text: string;
}

/**
 * The review as both surfaces see it.
 *
 * **What is deliberately absent is as much of the model as what is present.**
 * There is no sponsor, partner, commission, promotion, placement or reason
 * field, and no open-ended bag that could carry one. `US-EDT-F02-001` AC-16
 * requires that a commercial relationship have nowhere to go, and a prohibition
 * is only as good as the shapes that can carry a violation. That is also why
 * the sections and the points are typed lists rather than a JSON document: a
 * document field can express anything, sponsorship included, and would make
 * §8's integrity rule aspirational rather than structural.
 *
 * There is likewise no `businessId`. This is platform-owned material, like
 * `category` and `admin_audit_event` and unlike everything a Business writes.
 * The absence is the isolation boundary: no seller can reach the judgement
 * written about the product they sell, because no column expresses the
 * relationship.
 */
export interface EditorialReview {
  /**
   * Published content: whose judgement this is offered as. `PRD-0009` §13.2.
   *
   * **Not the account that typed it, and never derived from it.** A byline may
   * be a team ("Editör ekibi", as the prototype has it), a pen name, or a
   * person's name where that is a deliberate editorial choice. The acting
   * account is accountability and lives in the audit trail; this is content and
   * lives on the page. Deriving either from the other collapses both.
   */
  byline: string | null;
  cons: readonly EditorialPoint[];
  id: string;
  /**
   * When the review was last **re-checked** — not when its row last changed.
   * `PRD-0009` §13.4. See `EditorialDates` for why this is the model's most
   * fragile invariant.
   */
  lastCheckedAt: Date | null;
  productKey: ProductKey;
  pros: readonly EditorialPoint[];
  /** When it was **first** published. Set once, never again. */
  publishedAt: Date | null;
  /** `0`–`10` with one decimal. Deliberately not the crowd's `0`–`5`. */
  score: number | null;
  sections: readonly EditorialSection[];
  status: EditorialReviewStatus;
  verdict: string | null;
}

/**
 * The two dates, and the rule that keeps them meaning different things.
 *
 * **This is the invariant the reading surface depends on and the one most
 * easily lost.** `US-EDT-F01-001` AC-4 requires both dates to be presented and
 * neither shown in place of the other — which is only worth doing while they
 * answer different questions. If a save moved the second one, "last re-checked"
 * would come to mean "last touched": a corrected comma would present as a fresh
 * verification, and the date a reader is invited to trust would be the least
 * trustworthy thing on the page. A correct read surface over a write surface
 * that does that presents a lie carefully.
 *
 * Two defences, because a rule that lives only in a service is a rule one
 * refactor from gone:
 *
 * 1. **The column is not called `updated_at`.** Every other table in this
 *    repository sets `updated_at = now()` on write, and the day somebody
 *    follows that habit here is the day AC-9 breaks silently. The re-check date
 *    is `last_checked_at`; ordinary row bookkeeping is `row_revised_at`. There
 *    is no column whose name invites the wrong write.
 * 2. **Re-checking is its own transition**, not a flag on save. `recheck()` is
 *    a separate act with its own audit entry; `save()` cannot reach the date at
 *    all.
 */
export interface EditorialDates {
  lastCheckedAt: Date | null;
  publishedAt: Date | null;
}

/** What a Draft must carry before `PRD-0009` §13.5 will let it be published. */
export interface EditorialPublicationRequirements {
  byline: boolean;
  cons: boolean;
  pros: boolean;
  score: boolean;
  sections: boolean;
  verdict: boolean;
}

/**
 * Raised when a review is offered for a Product Key the catalogue does not
 * carry. `US-EDT-F02-001` AC-14.
 *
 * **The check runs inside the write transaction and there is no foreign key**,
 * and the two facts are one decision. AC-14 requires the key to exist when the
 * review is written; AC-9 requires the review to survive every Offering that
 * carried the key being retired, hidden or withdrawn. A foreign key would serve
 * the first by defeating the second — it would either block the retirement or
 * take the judgement down with the last seller, which is the exact loss the
 * Product Key backbone was secured to prevent. Checking first and writing after
 * without a transaction leaves a window; inside one, it does not.
 */
export class UnknownProductKeyError extends Error {
  constructor(readonly productKey: ProductKey) {
    super(`no published Offering carries the Product Key ${productKey}`);
    this.name = "UnknownProductKeyError";
  }
}

/**
 * Raised when a second review is offered for a key that already has one.
 * `PRD-0009` §3, `US-EDT-F02-001` AC-15.
 *
 * **In any state, withdrawn included**, and the consequence is worth stating
 * where somebody will read it: a withdrawn review occupies its key permanently,
 * because nothing deletes one (AC-7). The remedy for a wrong judgement is to
 * revise and republish the review that exists, which is what §13.5 means by "a
 * second is a revision of the first, not a second review".
 */
export class ReviewAlreadyExistsError extends Error {
  constructor(readonly productKey: ProductKey) {
    super(`the Product Key ${productKey} already carries an editorial review`);
    this.name = "ReviewAlreadyExistsError";
  }
}

/**
 * Raised when publication is attempted without everything §13.5 requires.
 *
 * It carries which parts are missing rather than a message, because the surface
 * has to say what is wrong and a caller reconstructing that from prose is a
 * caller that will get it wrong in the second language.
 */
export class IncompleteReviewError extends Error {
  constructor(
    readonly missing: readonly (keyof EditorialPublicationRequirements)[]
  ) {
    super(
      `an editorial review may not be published without: ${missing.join(", ")}`
    );
    this.name = "IncompleteReviewError";
  }
}

/** Raised when a transition the lifecycle does not allow is attempted. */
export class InvalidReviewTransitionError extends Error {
  constructor(
    readonly from: EditorialReviewStatus,
    readonly to: EditorialReviewStatus
  ) {
    super(`an editorial review cannot move from ${from} to ${to}`);
    this.name = "InvalidReviewTransitionError";
  }
}

/**
 * The score is `0`–`10` with **one decimal**, and this is where that is
 * decided rather than in three validators that drift apart.
 *
 * Expressed as a distance from the nearest tenth rather than a modulo on a
 * float, because `8.4 % 0.1` is not `0` in binary floating point and a rule
 * written that way rejects a score the document permits.
 *
 * The tolerance is what makes it work in both directions. `8.4 * 10` is
 * `84.00000000000001`, a hair from a whole number, and legal; `8.45 * 10` is
 * `84.5`, half a unit away, and is not. Note that `Number.isInteger(Math.round
 * (score * 10))` — the shape this was first written in — is always true, since
 * rounding produces an integer by definition. It accepted every score in the
 * range and was caught by the test rather than by reading it.
 */
export function isValidEditorialScore(score: number): boolean {
  if (!Number.isFinite(score)) return false;
  if (score < 0 || score > 10) return false;
  const tenths = score * 10;
  return Math.abs(tenths - Math.round(tenths)) < 1e-9;
}

/**
 * The lifecycle of `PRD-0009` §13.3, as the only place that answers "may this
 * move there".
 *
 * A `WITHDRAWN` review may be published again — §13.3 makes withdrawal a
 * removal from presentation rather than an end state, and a judgement taken
 * down to be corrected has to be able to come back. What it may not do is
 * return to `DRAFT`: a review the public has seen has a first-publication date,
 * and a state that pretends otherwise would make `publishedAt` a lie.
 */
export function canTransition(
  from: EditorialReviewStatus,
  to: EditorialReviewStatus
): boolean {
  if (from === to) return false;
  if (to === "DRAFT") return false;
  if (from === "DRAFT") return to === "PUBLISHED";
  if (from === "PUBLISHED") return to === "WITHDRAWN";
  return to === "PUBLISHED";
}

/**
 * Which of §13.5's requirements a review does not yet meet.
 *
 * Returns them all rather than the first, so that a writer is told everything
 * that is missing at once instead of discovering it one refusal at a time.
 */
export function missingForPublication(
  review: Pick<
    EditorialReview,
    "byline" | "cons" | "pros" | "score" | "sections" | "verdict"
  >
): (keyof EditorialPublicationRequirements)[] {
  const missing: (keyof EditorialPublicationRequirements)[] = [];
  if (review.verdict === null || review.verdict.trim() === "")
    missing.push("verdict");
  if (review.score === null) missing.push("score");
  if (review.sections.length === 0) missing.push("sections");
  if (review.pros.length === 0) missing.push("pros");
  // §5: "A review with no cons is an advertisement, and readers know it."
  if (review.cons.length === 0) missing.push("cons");
  if (review.byline === null || review.byline.trim() === "")
    missing.push("byline");
  return missing;
}

/**
 * Whether a review is presented to a reader.
 *
 * One function rather than a `status === "PUBLISHED"` written at each call
 * site, because `US-EDT-F02-001` AC-5 and AC-6 are two halves of one rule and a
 * surface that forgets either shows a draft or keeps showing a withdrawal.
 */
export function isPresentable(
  review: Pick<EditorialReview, "status">
): boolean {
  return review.status === "PUBLISHED";
}

export const editorialModule = { name: "editorial" } as const;
