import { sitemapSchema, type SitemapResponse } from "@commerce/contracts";

import { fetchWithBudget } from "../api-error";

/**
 * The indexable address set (I97).
 *
 * **`null` on any failure, never an empty list.** "This site has no listings"
 * and "the listings could not be read" are different statements, and a sitemap
 * that made the first during an outage would ask every crawler to forget the
 * catalogue. The caller answers an outage with the home page alone rather than
 * with a file claiming the site is empty — the same distinction the product
 * reviews and the editorial review each keep on the reader's side.
 */
function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

export async function readSitemap(): Promise<SitemapResponse | null> {
  try {
    const response = await fetchWithBudget(
      `${apiBaseUrl()}/discovery/sitemap`,
      { cache: "no-store" },
      "SITEMAP"
    );
    if (!response.ok) return null;
    return sitemapSchema.parse(await response.json());
  } catch {
    return null;
  }
}
