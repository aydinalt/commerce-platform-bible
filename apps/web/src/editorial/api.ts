import {
  editorialReviewViewSchema,
  type EditorialReviewView
} from "@commerce/contracts";

import { fetchWithBudget } from "../api-error";

/**
 * The editorial review of a product, as a reader meets it (I95, `EDT F01`).
 *
 * **Its own module rather than a section of `discovery/api.ts`**, for the
 * reason the crowd reviews have one: this is the editorial bounded context, and
 * `PRD-0009` owns what a review is where `PRD-0001` owns the listing it appears
 * on. The registry records that split; this keeps it in the file layout.
 *
 * **Three answers, and the whole of `UX-0003` **Frozen v1.2** §8.9.2 lives in
 * keeping them apart:**
 *
 * ```text
 * { review: … }   the product has a review
 * { review: null } the product has none — present nothing at all
 * null             the reading failed — say so; claim nothing about the product
 * ```
 *
 * A two-state answer would have to fold one of the last two into the other, and
 * both foldings are wrong in the same direction: _"an outage is not entitled to
 * make the claim 'there is no review'"_. The crowd reviews of §8.6 are fetched
 * the same way for the same reason.
 */
function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

/**
 * **`null` on any failure, never an empty answer.** A page that printed "this
 * product has no editorial review" during an outage would be telling every
 * visitor something untrue about a real product — and unlike a missing price it
 * would look entirely normal, because most products genuinely have none.
 *
 * Budgeted, like every read this application makes. An unbudgeted one would
 * hang and then be indistinguishable from the absence it is not.
 */
export async function readEditorialReview(
  productKey: string
): Promise<EditorialReviewView | null> {
  try {
    const response = await fetchWithBudget(
      `${apiBaseUrl()}/products/${encodeURIComponent(productKey)}/editorial-review`,
      { cache: "no-store" },
      "EDITORIAL_REVIEW"
    );
    if (!response.ok) return null;
    return editorialReviewViewSchema.parse(await response.json());
  } catch {
    return null;
  }
}
