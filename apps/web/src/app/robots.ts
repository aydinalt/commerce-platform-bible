import type { MetadataRoute } from "next";

import { absoluteUrl, siteOrigin } from "../seo";

/**
 * `robots.txt`, generated rather than written (I97).
 *
 * **The disallow list is the interesting half**, and every entry on it is a
 * page that already has a canonical home somewhere else.
 *
 * A crawler that indexes the filtered variants of Discovery finds a thousand
 * near-identical pages, spends its budget on them, and visits the listings that
 * should rank less often. **Filters are for people; listings and categories are
 * for search engines.** The parameterised copies are excluded, and `/discovery`
 * itself is left indexable because it is the canonical one of them.
 *
 * The authenticated and operational areas are excluded for a different reason:
 * they answer differently to everyone, and half of them answer `404` to a
 * crawler that has no session at all. Listing them here is cheaper than letting
 * a crawler discover that one request at a time.
 *
 * **Nothing here is a security boundary and nothing here is treated as one.**
 * `robots.txt` is a request a well-behaved crawler honours, not an access
 * control; `/admin` is closed by `PrincipalResolver`, and it would be closed if
 * this file did not exist.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    host: siteOrigin(),
    rules: [
      {
        allow: "/",
        disallow: [
          /*
           * Discovery's own controls. The page stays indexable; only the
           * parameterised copies of it are duplicates.
           */
          "/discovery?",
          "/compare",
          "/decision",
          /*
           * Signed-in surfaces. A crawler reaching these gets a redirect to
           * sign in, which is a page it should never have been sent to.
           */
          "/account",
          "/favourites",
          "/login",
          "/recover",
          "/register",
          /* Operational surfaces, closed by authorization rather than by this. */
          "/admin",
          "/businesses"
        ],
        userAgent: "*"
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
