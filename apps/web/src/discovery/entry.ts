/**
 * What Home hands to Discovery, and how.
 *
 * UX-0002 §4 places persistent or shareable URL state outside V1, so the
 * criteria a person entered are not written into the address. They travel in a
 * short-lived cookie instead: an act of looking is something a person is doing
 * now, not a location they can bookmark or send to someone else.
 *
 * The cookie carries only what the person supplied. It is not a session, it
 * identifies nobody, and it claims no Discovery Start — `US-DSC-F01-001` AC-8
 * is explicit that Home must not claim one, and the Search and Browse paths
 * are what create it.
 */

export const DISCOVERY_ENTRY_COOKIE = "discovery_entry";

/**
 * Long enough to survive the redirect and a slow page load, short enough that
 * a query left in a closed tab does not reappear an hour later as though the
 * person had just asked it.
 */
export const DISCOVERY_ENTRY_MAX_AGE_SECONDS = 300;

/// Where Home sends a person once an entry is valid. One route, because two
/// would themselves be the URL state UX-0002 defers.
export const DISCOVERY_ROUTE = "/discovery";

export interface SearchEntry {
  readonly kind: "SEARCH";
  readonly query: string;
}

/**
 * What a refused submission gives back to the person: their exact text, and
 * the fact that it was refused. Never a Discovery Start, and never a corrected
 * query.
 *
 * It lives here rather than beside the action because a `"use server"` module
 * may export nothing but async functions.
 */
export interface SearchEntryState {
  readonly refused: boolean;
  readonly typed: string;
}

export const NO_SEARCH_ENTRY: SearchEntryState = { refused: false, typed: "" };

export interface BrowseEntry {
  readonly categoryId: string;
  readonly kind: "BROWSE";
}

export type DiscoveryEntry = BrowseEntry | SearchEntry;

/**
 * UX-0001 §7.3 permits leading and trailing whitespace to be ignored for
 * validation, and AC-5 forbids whitespace-only input from starting Search.
 * Both are one question: what remains once the edges are trimmed.
 *
 * The exact text the person typed is returned alongside, because AC-8 requires
 * a refused submission to preserve it rather than hand back a tidied version
 * they did not write.
 */
export function readSearchEntry(raw: unknown): {
  entry: SearchEntry | null;
  typed: string;
} {
  const typed = typeof raw === "string" ? raw : "";
  const query = typed.trim();
  return {
    entry: query.length === 0 ? null : { kind: "SEARCH", query },
    typed
  };
}

/**
 * A Category identifier Home did not itself render is not a Category the
 * person selected. The shape is checked here so a hand-made submission cannot
 * make Home hand Discovery something the API never offered.
 */
export function readBrowseEntry(raw: unknown): BrowseEntry | null {
  const categoryId = typeof raw === "string" ? raw.trim() : "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(
    categoryId
  )
    ? { categoryId, kind: "BROWSE" }
    : null;
}
