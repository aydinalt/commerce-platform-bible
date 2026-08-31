import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/lib/products";
import {
  INDEXABLE_CATEGORIES,
  SITE_ORIGIN,
  absoluteUrl,
  categoryPath,
  productPath
} from "@/lib/seo";

/**
 * The sitemap, derived from the catalogue.
 *
 * **Generated, never maintained.** A hand-written sitemap is a second list of
 * the site's pages, and the day somebody adds a product is the day the two
 * disagree — silently, because nothing on screen depends on it.
 *
 * `lastModified` comes from the editorial revision date rather than from
 * "now". A sitemap where every page changed today teaches a crawler that the
 * date means nothing, and it then ignores it on the pages that really did
 * change. `priority` is left at its default for the same reason: a site that
 * marks all of its own pages important has said nothing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const products = PRODUCTS.map((product) => ({
    changeFrequency: "daily" as const,
    /*
     * Daily, and it is true rather than optimistic: a price comparison page
     * changes whenever a shop moves a price, which is the one thing on the
     * page a person returns to check.
     */
    lastModified: new Date(product.editorial.updatedAt),
    url: absoluteUrl(productPath(product))
  }));

  const categories = INDEXABLE_CATEGORIES.map((category) => ({
    changeFrequency: "daily" as const,
    lastModified: new Date(
      Math.max(
        ...PRODUCTS.filter((product) => product.categoryId === category.id).map(
          (product) => new Date(product.editorial.updatedAt).getTime()
        )
      )
    ),
    url: absoluteUrl(categoryPath(category))
  }));

  return [
    { changeFrequency: "hourly", lastModified: new Date(), url: SITE_ORIGIN },
    ...categories,
    ...products
  ];
}
