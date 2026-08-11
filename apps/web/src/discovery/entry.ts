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

/**
 * The server-issued path a person is already following.
 *
 * `US-DSC-F03-001` AC-8 allows exactly one Discovery Start per Browse path, so
 * every selection after the first has to say which path it belongs to.
 * Forgetting it would not lose data — it would silently record a second person
 * beginning to look.
 */
export interface PathContinuation {
  readonly pathId?: string;
}

export interface SearchEntry extends PathContinuation {
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

export interface BrowseEntry extends PathContinuation {
  readonly categoryId: string;
  readonly kind: "BROWSE";
}

export type DiscoveryEntry = BrowseEntry | SearchEntry;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

/**
 * The carrier is a cookie, so it is worth remembering that a person can edit
 * it. Nothing here trusts it: an entry that does not read back as one of the
 * two shapes is discarded rather than repaired, and the criteria it carries
 * are re-validated by the API on every read anyway.
 */
export function readDiscoveryEntry(
  raw: string | undefined
): DiscoveryEntry | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const value = parsed as Record<string, unknown>;
  const pathId =
    typeof value.pathId === "string" && UUID.test(value.pathId)
      ? { pathId: value.pathId }
      : {};

  if (value.kind === "SEARCH") {
    const { entry } = readSearchEntry(value.query);
    return entry ? { ...entry, ...pathId } : null;
  }
  if (value.kind === "BROWSE") {
    const entry = readBrowseEntry(value.categoryId);
    return entry ? { ...entry, ...pathId } : null;
  }
  return null;
}

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
  return UUID.test(categoryId) ? { categoryId, kind: "BROWSE" } : null;
}
