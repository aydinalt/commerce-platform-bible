import {
  categoryAddressSchema,
  type CategoryAddressResponse
} from "@commerce/contracts";

import { fetchWithBudget, isApiUnavailable } from "../api-error";

/**
 * A Category read at its own address (`UX-0002` **Frozen v1.4** §8A).
 *
 * **A `GET`, and that is the point of the whole module.** `discovery/api.ts`
 * reaches Discovery through two `POST`s, and each of them creates a Discovery
 * Start — which is why this route cannot use them. §8A.4 makes arrival at a
 * Category address record no occurrence, because this is the first surface in
 * the platform a crawler reaches by design, and an arrival that produced one
 * would put a machine's traversal into the platform's own account of what
 * people did.
 *
 * Nothing here touches the Discovery criteria carrier either. A person who had
 * Results open, followed a shared Category link and went back finds the Results
 * they left, because this route never wrote the cookie that holds them.
 *
 * **Three answers, kept apart.** `"MISSING"` is a Category that is retired or
 * was never there — §8A.2 and §8.1, and the API answers both the same way so
 * that a not-found leaks neither a retirement nor a moderation decision.
 * `"UNAVAILABLE"` is the API failing to answer at all, which is a different
 * statement and gets a different surface. Anything else is a defect and is
 * rethrown rather than presented as a temporary condition.
 */
export type CategoryAddressRead =
  CategoryAddressResponse | "MISSING" | "UNAVAILABLE";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

export async function readCategoryAddress(
  slug: string
): Promise<CategoryAddressRead> {
  try {
    const response = await fetchWithBudget(
      `${apiBaseUrl()}/discovery/categories/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
      "CATEGORY"
    );
    if (response.status === 404) return "MISSING";
    if (!response.ok) return "UNAVAILABLE";
    return categoryAddressSchema.parse(await response.json());
  } catch (error) {
    if (isApiUnavailable(error)) return "UNAVAILABLE";
    throw error;
  }
}
