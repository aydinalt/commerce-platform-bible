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

import {
  appliedFilterSchema,
  type AppliedFilterInput
} from "@commerce/contracts";

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

/**
 * A Compare-preparation return (`US-DSC-F10-001`).
 *
 * Exactly one eligible Offering and the active leaf Category it sits in. It
 * says "find me a second one of these", and that is the whole of it: it is not
 * a Comparison Set, it holds no second member, and Discovery never adds one —
 * AC-6 gives that to UX-0004.
 *
 * It travels in the same carrier as the criteria and for the same reason. AC-3
 * requires it to be transient, unsaved, non-restorable once the flow ends and
 * absent from persistent or shareable URL state, which is exactly what a
 * short-lived cookie is and a query parameter is not.
 */
export interface PreparationContext {
  readonly categoryId: string;
  readonly offeringId: string;
}

export interface BrowseEntry extends PathContinuation {
  readonly categoryId: string;
  /**
   * Applied Attribute Filters (UX-0002 §9).
   *
   * They travel in the carrier the criteria already use, for the reason §4
   * gives: persistent or shareable URL state is outside V1, and a Filter in a
   * query string is that state. A Filter is part of what a person is asking
   * for, so it belongs beside the query and the Category rather than in a
   * second mechanism with different lifetime rules.
   */
  readonly filters?: readonly AppliedFilterInput[];
  readonly kind: "BROWSE";
  readonly preparation?: PreparationContext;
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
    if (!entry) return null;
    const preparation = readPreparation(value.preparation, entry.categoryId);
    const filters = readFilters(value.filters);
    return {
      ...entry,
      ...pathId,
      ...(filters.length === 0 ? {} : { filters }),
      ...(preparation === null ? {} : { preparation })
    };
  }
  return null;
}

/**
 * Applied Filters read back from the carrier.
 *
 * Parsed against the published contract rather than trusted, for the reason
 * the rest of this file gives: a person can edit a cookie. A Filter that does
 * not read back as one of the three shapes is dropped and the others are kept
 * — one unreadable entry is not a reason to discard criteria the person did
 * supply, and the API re-checks every one of them against the Category anyway.
 *
 * Availability is not decided here. UX-0002 §9.1 makes it a property of the
 * Category and the Attribute definition, which only the API can see, so a
 * Filter that is well-formed but not offered is refused there and named.
 */
function readFilters(raw: unknown): AppliedFilterInput[] {
  if (!Array.isArray(raw)) return [];
  const filters: AppliedFilterInput[] = [];
  for (const entry of raw.slice(0, 50)) {
    const parsed = appliedFilterSchema.safeParse(entry);
    if (parsed.success) filters.push(parsed.data);
  }
  return filters;
}

/**
 * A preparation context is accepted only where it is coherent
 * (`US-DSC-F10-001` AC-1 and AC-2).
 *
 * The Category it names must be the Category being browsed, because AC-2
 * constrains Results to *that same* active leaf. A return claiming one leaf
 * while showing another would satisfy neither, so it is discarded rather than
 * reconciled — Discovery does not get to decide which half the person meant.
 */
export function readPreparation(
  raw: unknown,
  categoryId: string
): PreparationContext | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.offeringId !== "string" || !UUID.test(value.offeringId))
    return null;
  if (value.categoryId !== categoryId) return null;
  return { categoryId, offeringId: value.offeringId };
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
