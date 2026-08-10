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
  results: ListingCard[] | null;
  /// The other active branches at this level, so a person can change their mind
  /// without walking back up first (AC-3).
  siblings: BrowseCategory[];
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
  /**
   * The active leaf Categories the current query reaches, offered when it
   * reaches more than one (AC-1). Computed from the unnarrowed candidate set,
   * so narrowing never hides the alternatives a person might switch to.
   */
  narrowing: BrowseCategory[];
  /// The exact submitted query, kept as visible Discovery criteria (AC-2).
  query: string;
  results: SearchResult[];
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

export const discoveryModule = { name: "discovery" } as const;
