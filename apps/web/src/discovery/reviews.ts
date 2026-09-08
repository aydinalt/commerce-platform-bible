import {
  productReviewsSchema,
  type ProductReviewsResponse
} from "@commerce/contracts";

import { fetchWithBudget } from "../api-error";
import { SESSION_COOKIE } from "../identity/session";

/**
 * What people said about this product, and writing one's own (I62 gave the API;
 * this is the surface that was missing).
 *
 * Its own module rather than a section of `discovery/api.ts`, for the reason
 * favourites has one: the read carries the caller's session when there is one
 * and answers slightly differently for them — their own review is marked
 * `mine` — where everything in that file answers the same to everybody.
 */
function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

function headers(session: string | undefined): Record<string, string> {
  return {
    accept: "application/json",
    ...(session === undefined
      ? {}
      : { cookie: `${SESSION_COOKIE}=${session}` }),
    origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
  };
}

/**
 * The reviews of one product.
 *
 * **`null` on any failure, never an empty list.** "Nobody has reviewed this"
 * and "the reviews could not be read" are different statements, and a product
 * page that printed the first during an outage would be telling every visitor
 * something untrue about a real product.
 */
export async function readProductReviews(input: {
  session: string | undefined;
  slug: string;
}): Promise<ProductReviewsResponse | null> {
  try {
    const response = await fetchWithBudget(
      `${apiBaseUrl()}/offerings/${encodeURIComponent(input.slug)}/reviews`,
      { cache: "no-store", headers: headers(input.session) },
      "PRODUCT_REVIEWS"
    );
    if (!response.ok) return null;
    return productReviewsSchema.parse(await response.json());
  } catch {
    return null;
  }
}

/** What writing one can end in, and each is a different thing to say. */
export type ReviewOutcome = "GONE" | "REFUSED" | "SIGN_IN" | "WRITTEN";

/**
 * Writing, or replacing, one's own review.
 *
 * Unbudgeted, like every write this application makes: aborting one does not
 * undo it, and a timeout reported as a failure would invite somebody to write
 * their review twice.
 */
export async function writeProductReview(input: {
  body: string | null;
  rating: number;
  session: string;
  slug: string;
}): Promise<ReviewOutcome> {
  try {
    const response = await fetch(
      `${apiBaseUrl()}/offerings/${encodeURIComponent(input.slug)}/reviews`,
      {
        body: JSON.stringify({ body: input.body, rating: input.rating }),
        cache: "no-store",
        headers: {
          ...headers(input.session),
          "content-type": "application/json"
        },
        method: "POST"
      }
    );
    if (response.ok) return "WRITTEN";
    // The session expired between the page and the press. Saying so is better
    // than a general refusal, because the person can do something about it.
    if (response.status === 401) return "SIGN_IN";
    if (response.status === 404) return "GONE";
    return "REFUSED";
  } catch {
    return "REFUSED";
  }
}
