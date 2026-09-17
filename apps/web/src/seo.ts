/**
 * Where this site lives, and the addresses a crawler is given (I97).
 *
 * **One owner for the origin.** `PUBLIC_WEB_URL` is already the value every
 * outbound `origin` header carries; a second notion of "where we are" would
 * disagree with it the first time a deployment moved, and it would disagree in
 * the one place nothing on screen depends on — a canonical tag pointing at the
 * wrong host is invisible until a search engine has already merged two sites.
 */
export function siteOrigin(): string {
  return process.env.PUBLIC_WEB_URL ?? "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${siteOrigin().replace(/\/$/u, "")}${path}`;
}

export function offeringPath(slug: string): string {
  return `/offerings/${encodeURIComponent(slug)}`;
}

/**
 * A Category's permanent address (`UX-0002` **Frozen v1.4** §8A).
 *
 * The segment is Turkish where every other route in this application is
 * English, and that is deliberate rather than an inconsistency: §8A names
 * `/kategori/{slug}` as the address, and this is the one route whose path a
 * person reads, shares and is shown in a search result. The Category names it
 * carries are Turkish, so an English wrapper around them would read as a
 * translation seam in the middle of the address.
 *
 * It is one function rather than a template in three files, because §8A.5 makes
 * this the canonical address: two spellings of a canonical address is the
 * defect the canonical tag exists to prevent.
 */
export function categoryPath(slug: string): string {
  return `/kategori/${encodeURIComponent(slug)}`;
}

/**
 * A description a search engine will actually print, cut at a word.
 *
 * **Cut on whitespace rather than mid-word**, and only when the text is over
 * the limit — a description that ends "…bu ürün mükemme" reads as a broken page
 * rather than a truncated sentence, and the ellipsis is the honest signal that
 * there is more.
 */
export function clampDescription(text: string, limit = 155): string {
  const collapsed = text.replace(/\s+/gu, " ").trim();
  if (collapsed.length <= limit) return collapsed;
  const cut = collapsed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
