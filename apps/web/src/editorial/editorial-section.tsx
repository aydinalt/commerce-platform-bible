import type { EditorialReviewView } from "@commerce/contracts";

import { EditorialReviewPresentation } from "./review-presentation";

/**
 * The editorial review on the Offering presentation (I95, `EDT F01`,
 * `UX-0003` **Frozen v1.2** §8.9).
 *
 * **Three states, and the section exists in only one of them.**
 *
 * ```text
 * review present → the heading and the review
 * review absent  → nothing at all: no heading, no frame, no placeholder
 * reading failed → the heading and a sentence saying the reading failed
 * ```
 *
 * **The absent case renders nothing, and that is `AC-14` rather than an
 * economy.** Most products will have no editorial review, so an empty frame
 * would appear on almost every listing and would imply a missing thing rather
 * than an absent one. §8.9.2: _"the screen presents no review and no
 * placeholder for one"_, and an Offering with no reviewed Product Key is
 * presented _"exactly as it presents one today"_.
 *
 * **The failed case says so, and this is the distinction §8.9.2 exists for.**
 * Folded into the absent case, a failed read would make the claim "there is no
 * review" on an outage's behalf — and it would be believed, because that claim
 * is true of most listings. The same rule `ReviewsSection` keeps for §8.6.
 *
 * **It never takes the page down.** A listing whose editorial review cannot be
 * read is still a listing: the price, the seller and the specification are
 * unaffected, and §8.9.2 does not permit a review's outage to become theirs.
 * That is why the read is separate from the Presentation read rather than a
 * field inside it.
 */
export function EditorialSection({
  editorial
}: {
  /**
   * `undefined` where the listing carries no Product Key, `null` where the
   * reading failed, and the wrapper otherwise.
   *
   * §8.9.2 makes the first two different cases that happen to look alike from a
   * distance: a listing with no Product Key has nothing to fail to read, so it
   * presents nothing and says nothing — _"nothing on the screen suggests a
   * review might arrive"_.
   */
  editorial: EditorialReviewView | null | undefined;
}) {
  if (editorial === undefined) return null;

  if (editorial === null)
    return (
      <section aria-labelledby="editorial-review">
        <h2 id="editorial-review">Editör incelemesi</h2>
        <p role="alert">Editör incelemesi şu anda okunamadı.</p>
      </section>
    );

  if (editorial.review === null) return null;

  return (
    <section aria-labelledby="editorial-review">
      {/*
        A heading of its own, and it names whose judgement this is. §8.9.1
        requires the platform's review and the crowd's to be presented as
        distinguishable regions so that _"a reader who reads only one of them
        knows which one they read"_ — and the two sit next to each other on this
        page, which is where a shared heading would do the most damage.
      */}
      <h2 id="editorial-review">Editör incelemesi</h2>
      <EditorialReviewPresentation review={editorial.review} />
    </section>
  );
}
