import {
  browseRootsSchema,
  browseViewSchema,
  offeringPresentationSchema,
  searchViewSchema,
  type BrowseRoots,
  type BrowseViewResponse,
  type OfferingPresentationResponse,
  type SearchViewResponse
} from "@commerce/contracts";

import type { BrowseEntry, SearchEntry } from "./entry";

/**
 * The web application talks to the API over the same published contract every
 * other consumer uses. Nothing here re-describes a response shape: a payload
 * that does not satisfy the contract is a failure, not something to render
 * defensively around.
 */

/**
 * Server-side only. The browser never calls the API directly, so this is not a
 * `NEXT_PUBLIC_` value and must not become one — the base address is
 * deployment information, not part of the page.
 */
function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

/**
 * The active root Categories, by Domain.
 *
 * `US-DSC-F01-001` AC-3 lets a person begin Browse from one of these, and
 * UX-0001 §8.1 forbids Home from reordering them, featuring a subset or
 * showing a retired one. So this returns exactly what the API returned, in the
 * order it returned, and Home has no opportunity to do otherwise.
 *
 * The read is uncached because a Category retired a moment ago must stop being
 * an active destination immediately; a stale cached homepage would offer a
 * route that no longer exists.
 */
export async function fetchBrowseRoots(): Promise<BrowseRoots> {
  const response = await fetch(`${apiBaseUrl()}/discovery/browse`, {
    cache: "no-store",
    headers: { accept: "application/json" }
  });
  if (!response.ok) throw new Error(`BROWSE_ROOTS_${response.status}`);
  return browseRootsSchema.parse(await response.json());
}

/**
 * Both Discovery reads are `POST`s, and both are uncached.
 *
 * They are `POST`s because the API treats beginning to look as an occurrence
 * rather than a page — `US-DSC-F02-001` AC-1 and `US-DSC-F03-001` AC-1 each
 * create a Discovery Start. Caching them would mean either replaying somebody
 * else's Results or recording a Start that nobody made.
 */
async function post(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: { accept: "application/json", "content-type": "application/json" },
    method: "POST"
  });
  if (!response.ok) throw new Error(`DISCOVERY_${response.status}`);
  return response.json();
}

export async function fetchSearchView(
  entry: SearchEntry
): Promise<SearchViewResponse> {
  return searchViewSchema.parse(
    await post("/discovery/search", {
      query: entry.query,
      ...(entry.pathId === undefined ? {} : { discoveryPathId: entry.pathId })
    })
  );
}

/**
 * Beginning complete Presentation for the Offering behind a Listing Card
 * (`US-DSC-F09-001`, `US-OFR-F05-001`).
 *
 * `null` rather than a thrown error, because "this cannot be presented" is an
 * ordinary answer: eligibility is a condition of beginning Presentation at
 * all, and an Offering retired between the card being drawn and the card being
 * opened is the expected case, not a fault.
 *
 * The request is what produces `Offering Presentation Open`, so it must not be
 * made speculatively — no prefetch, no warming, no retry on success.
 */
export async function fetchOfferingPresentation(
  slug: string
): Promise<OfferingPresentationResponse | null> {
  const response = await fetch(
    `${apiBaseUrl()}/offerings/${encodeURIComponent(slug)}`,
    { cache: "no-store", headers: { accept: "application/json" } }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`OFFERING_${response.status}`);
  return offeringPresentationSchema.parse(await response.json());
}

export async function fetchBrowseView(
  entry: BrowseEntry
): Promise<BrowseViewResponse> {
  return browseViewSchema.parse(
    await post(`/discovery/browse/categories/${entry.categoryId}`, {
      // Sent whenever the person has any, so the API applies UX-0002 §9.6 —
      // OR within a Select, AND across Attributes — rather than the page
      // filtering a full result set after the fact, which would be a second
      // implementation of the same rule and eventually a different one.
      ...(entry.filters === undefined ? {} : { filters: entry.filters }),
      ...(entry.pathId === undefined ? {} : { discoveryPathId: entry.pathId })
    })
  );
}
