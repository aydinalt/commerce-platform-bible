/**
 * A Category as a Browse destination.
 *
 * Only active Categories appear (`US-DSC-F03-001` AC-4): a retired one is not a
 * destination that is refused, it is not a destination.
 */
export interface BrowseCategory {
  id: string;
  /// A leaf carries Results; a branch carries only navigation (AC-5, AC-6).
  leaf: boolean;
  name: string;
  slug: string;
}

/**
 * The PRD-0002 §11 Listing Card product minimum.
 *
 * The fields are exactly the ones §11 names, and the omissions are the point:
 * no telephone, no email, no external contact URL, no Affiliate Destination.
 * They are not filtered out downstream — they never enter.
 */
export interface ListingCard {
  businessName: string;
  categoryName: string;
  offeringId: string;
  /// The immutable Initial Published At, which is also what Browse orders by.
  publishedAt: string;
  slug: string;
  title: string;
}

/**
 * What a person sees at one point in a Browse path.
 *
 * `results` is `null` rather than empty for a branch. An empty list would say
 * "nothing here", and AC-5 and AC-7 mean something different: results are not
 * being shown, and a parent never stands in for its descendants.
 */
export interface BrowseView {
  ancestors: BrowseCategory[];
  category: BrowseCategory;
  children: BrowseCategory[];
  discoveryPathId: string;
  domain: string;
  /// Offered on a leaf, where an active leaf Category is by definition
  /// selected. Empty on a branch, for the same reason Results are withheld.
  filters: AvailableFilter[];
  results: ListingCard[] | null;
  /// The other active branches at this level, so a person can change their mind
  /// without walking back up first (AC-3).
  siblings: BrowseCategory[];
  /// Present only when a leaf matched nothing (`US-DSC-F08-001` AC-1).
  zeroResults: ZeroResults | null;
}

/**
 * The four match relationships PRD-0002 §12.2 ranks, best first.
 *
 * `US-DSC-F02-001` AC-7 asks only that the highest applicable one be
 * identified; `US-DSC-F07-001` owns what ordering does with it. Keeping them
 * apart is why this is a level and not a score: a score would be a ranking
 * algorithm, which §12.2 explicitly does not define.
 */
export const SEARCH_MATCH_LEVELS = [
  "TITLE",
  "CATEGORY_PATH",
  "BUSINESS_NAME",
  "DESCRIPTION_OR_ATTRIBUTE"
] as const;

export type SearchMatchLevel = (typeof SEARCH_MATCH_LEVELS)[number];

export interface SearchResult extends ListingCard {
  matchLevel: SearchMatchLevel;
}

export interface SearchView {
  /// The active leaf Category the Search is narrowed to, if any
  /// (`US-DSC-F04-001` AC-3).
  categoryId: string | null;
  discoveryPathId: string;
  /// Available once one active leaf Category is selected (AC-5). Until then a
  /// Search spans Domains and has none.
  domain: string | null;
  /**
   * Whether category-specific Attribute Filters may be offered.
   *
   * `US-DSC-F04-001` AC-6 gates them on one selected active leaf Category, and
   * `US-DSC-F05-001` owns what they are and how they match. The gate is stated
   * here so it exists before the thing it gates.
   */
  filtersAvailable: boolean;
  /// The Filters that may be applied here, empty until a leaf is selected.
  filters: AvailableFilter[];
  /**
   * The active leaf Categories the current query reaches, offered when it
   * reaches more than one (AC-1). Computed from the unnarrowed candidate set,
   * so narrowing never hides the alternatives a person might switch to.
   */
  narrowing: BrowseCategory[];
  /// The exact submitted query, kept as visible Discovery criteria (AC-2).
  query: string;
  results: SearchResult[];
  /// Present only when nothing matched (`US-DSC-F08-001` AC-1).
  zeroResults: ZeroResults | null;
}

/**
 * The terms a query contributes to matching.
 *
 * Everything that is not a letter or a digit becomes a separator, so a term can
 * never carry `tsquery` syntax into the database. This is deliberately not
 * linguistic processing — PRD-0002 defines no stemming, no synonyms and no
 * language model, and inventing one here would be inventing product behaviour.
 *
 * The cap exists because a query is a person's sentence, not a workload.
 */
export function searchTerms(query: string): string[] {
  return query
    .toLocaleLowerCase("tr")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 0)
    .slice(0, 24);
}

/**
 * The value kinds that can be a Filter.
 *
 * `TEXT` is absent, which is `US-DSC-F05-001` AC-2 and PRD-0002 §10.1: Text
 * Attributes are not filterable in V1. `US-PLT-F09-001` already refuses to mark
 * a Text definition filterable, so this list and that constraint say the same
 * thing from opposite ends.
 */
export const FILTERABLE_VALUE_KINDS = [
  "NUMBER",
  "BOOLEAN",
  "SINGLE_SELECT",
  "MULTI_SELECT"
] as const;

export type FilterableValueKind = (typeof FILTERABLE_VALUE_KINDS)[number];

/// A Filter a person may apply here, offered only once one active leaf Category
/// is selected (AC-1).
export interface AvailableFilter {
  attributeId: string;
  name: string;
  /// The active allowed values, for the two Select kinds only.
  options: { id: string; label: string }[];
  unit: string | null;
  valueKind: FilterableValueKind;
}

/**
 * One applied Filter.
 *
 * The two Select kinds share a shape because PRD-0002 §10.2 gives them the same
 * matching rule from the Filter's side: one or more selected values combined
 * with OR. What differs is how many values an *Offering* may hold, which is the
 * definition's business, not the Filter's.
 */
export type AppliedFilter =
  | { attributeId: string; kind: "BOOLEAN"; value: boolean }
  | {
      attributeId: string;
      kind: "NUMBER";
      max: number | null;
      min: number | null;
    }
  | { attributeId: string; kind: "SELECT"; optionIds: string[] };

/**
 * Raised when an applied Filter names an Attribute that is not offered here —
 * not applicable to the selected Category, not filterable, or of a different
 * kind than the request claims.
 *
 * Refused rather than ignored: silently dropping a Filter would answer a
 * different question from the one that was asked, and PRD-0002 forbids
 * Discovery from silently removing or changing criteria.
 */
export class FilterNotAvailableError extends Error {
  constructor(readonly attributeId: string) {
    super("FILTER_NOT_AVAILABLE");
    this.name = "FilterNotAvailableError";
  }
}

/// Raised when Filters are applied with no active leaf Category selected (AC-1).
export class FilterContextMissingError extends Error {
  constructor() {
    super("FILTER_CONTEXT_MISSING");
    this.name = "FilterContextMissingError";
  }
}

/**
 * The bounded recovery actions of PRD-0002 §13.
 *
 * A closed list, because `US-DSC-F08-001` AC-8 forbids inventing anything
 * beyond it — no Recommendations, no sponsored alternatives, no Saved Search.
 * Naming what is allowed is the only way to make "nothing else" checkable.
 */
export const ZERO_RESULT_RECOVERIES = [
  "REMOVE_FILTER",
  "CLEAR_FILTERS",
  "CHANGE_QUERY",
  "CLEAR_QUERY",
  "MOVE_TO_PARENT_CATEGORY",
  "CHOOSE_ANOTHER_CATEGORY",
  "RETURN_TO_HOMEPAGE"
] as const;

export type ZeroResultRecovery = (typeof ZERO_RESULT_RECOVERIES)[number];

/**
 * One applied Filter as the person should see it back.
 *
 * Structured rather than phrased: PRD-0002 §13 requires an understandable
 * summary and leaves the exact copy to UX. A rendered sentence here would be
 * this layer writing UX's words.
 */
export interface AppliedFilterSummary {
  attributeId: string;
  kind: FilterableValueKind;
  max: number | null;
  min: number | null;
  name: string;
  optionLabels: string[];
  value: boolean | null;
}

/**
 * Zero Results (`US-DSC-F08-001`).
 *
 * Present only when nothing matched. The criteria are echoed rather than
 * cleared, because AC-7 forbids removing them silently — a person needs to see
 * what they asked for in order to decide what to change.
 */
export interface ZeroResults {
  criteria: {
    categoryName: string | null;
    filters: AppliedFilterSummary[];
    query: string | null;
  };
  recovery: ZeroResultRecovery[];
}

/**
 * Which of the bounded recovery actions apply here.
 *
 * Each is offered only when it would do something: clearing Filters that were
 * never applied is not a recovery, and moving to a parent Category is not one
 * when there is no parent. Returning to the Homepage always applies, which is
 * what stops this list from ever being empty.
 */
export function zeroResultRecovery(input: {
  filterCount: number;
  hasParentCategory: boolean;
  hasQuery: boolean;
}): ZeroResultRecovery[] {
  return ZERO_RESULT_RECOVERIES.filter((action) => {
    if (action === "REMOVE_FILTER") return input.filterCount > 1;
    if (action === "CLEAR_FILTERS") return input.filterCount > 0;
    if (action === "CHANGE_QUERY" || action === "CLEAR_QUERY")
      return input.hasQuery;
    if (action === "MOVE_TO_PARENT_CATEGORY") return input.hasParentCategory;
    return true;
  });
}

export const discoveryModule = { name: "discovery" } as const;
