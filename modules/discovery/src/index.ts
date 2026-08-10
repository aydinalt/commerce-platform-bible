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

export const discoveryModule = { name: "discovery" } as const;
