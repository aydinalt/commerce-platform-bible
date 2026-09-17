import type { MetadataRoute } from "next";

import { readSitemap } from "../discovery/sitemap";
import { absoluteUrl, categoryPath, offeringPath, siteOrigin } from "../seo";

/**
 * The sitemap, derived from the catalogue (I97).
 *
 * **Generated, never maintained.** A hand-written sitemap is a second list of
 * the site's pages, and the day somebody publishes a listing is the day the two
 * disagree — silently, because nothing on screen depends on it.
 *
 * **Only publicly eligible listings appear**, and that is a property of the
 * source rather than a filter applied here: the API reads the Discovery
 * projection, which holds a row only while an Offering's final Public
 * Eligibility is Eligible and which retirement removes. A sitemap advertising a
 * retired listing sends a crawler to a `404` and spends the budget the live
 * listings need.
 *
 * **`lastModified` is the real publication moment, never "now".** A sitemap
 * where every page changed today teaches a crawler that the date means nothing,
 * and it then ignores the date on the pages that really did change. `priority`
 * is left unset for the same reason: a site that marks all of its own pages
 * important has said nothing.
 *
 * **An outage yields the home page alone rather than an error.** A sitemap that
 * fails to build takes the route down, and a `500` at `/sitemap.xml` is read by
 * a crawler as a site-level fault; one honest entry is a smaller and truer
 * answer than that. It is never an empty file either — an empty sitemap is the
 * claim that this site has no pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home = {
    changeFrequency: "hourly" as const,
    lastModified: new Date(),
    url: siteOrigin()
  };

  const read = await readSitemap();
  if (read === null) return [home];

  return [
    home,
    /*
     * The Category addresses (I99), ahead of the listings because they are the
     * shallower surface and the one the listings are reached through.
     *
     * **`weekly`, where a listing is `daily`.** What changes at a Category
     * address is which listings sit under it, and a branch of a catalogue does
     * not turn over the way one product's price does. Claiming daily change
     * here would spend crawl budget re-reading pages that had not moved.
     *
     * Only Categories the API listed appear, and it lists active Categories
     * with something published beneath them — §8.1 and a refusal to advertise
     * an address that says "nothing here". Neither rule is applied in this
     * file, because a sitemap that filtered its own source would be a second
     * opinion about what is indexable.
     */
    ...read.categories.map((entry) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(entry.lastModified),
      url: absoluteUrl(categoryPath(entry.slug))
    })),
    ...read.offerings.map((entry) => ({
      /*
       * Daily, and it is true rather than optimistic: a comparison page changes
       * whenever a seller moves a price, which is the one thing on it a person
       * returns to check.
       */
      changeFrequency: "daily" as const,
      lastModified: new Date(entry.lastModified),
      url: absoluteUrl(offeringPath(entry.slug))
    }))
  ];
}
