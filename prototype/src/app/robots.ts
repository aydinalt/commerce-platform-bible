import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/seo";

/**
 * `robots.txt`, generated rather than written.
 *
 * **The disallow list is the interesting half.** Everything under `/hesap` and
 * every filtered variant of the results page is a view of content that already
 * has a canonical home — a crawler that indexes `/?butce=5000&yil=2023` finds
 * a thousand near-identical pages, spends its budget on them, and the eleven
 * category pages that should rank get visited less. Filters are for people;
 * categories are for search engines.
 *
 * `/kategori/…` is deliberately **not** blocked, and that is the whole reason
 * it stopped being a query string.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE_ORIGIN,
    rules: [
      {
        allow: "/",
        disallow: [
          /*
           * The results page's own controls. `/` itself stays indexable — it
           * is only the parameterised copies that are duplicates of it.
           */
          "/?arama=",
          "/?butce=",
          "/?kategori=",
          "/?sekme=",
          "/?yil=",
          "/hesap/",
          "/favorilerim"
        ],
        userAgent: "*"
      }
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`
  };
}
