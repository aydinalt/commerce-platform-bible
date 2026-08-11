import { browseRootsSchema, type BrowseRoots } from "@commerce/contracts";

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
