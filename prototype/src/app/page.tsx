import type { Metadata } from "next";

import { SearchExperience } from "@/components/SearchExperience";
import { SITE_DESCRIPTION } from "@/lib/seo";

/**
 * `title: absolute` so the home page is not "İlanlar — İlanlar".
 *
 * The layout's template appends the site name to every page, which is right
 * for a product and wrong for the one page whose title already is the site
 * name. The description was also stale: it promised comparison by instalment,
 * and the instalment control was removed when release year replaced it.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description: SITE_DESCRIPTION,
  openGraph: {
    description: SITE_DESCRIPTION,
    title: "İlanlar — Ürün ve Fiyat Karşılaştırma",
    type: "website",
    url: "/"
  },
  title: { absolute: "İlanlar — Ürün ve Fiyat Karşılaştırma" }
};

/**
 * The search and results route.
 *
 * A server component whose only job is to render one client component. The
 * boundary is drawn here rather than deeper because everything below it reacts
 * to the same filter state, and a boundary in the middle of that would mean
 * serialising the state across it on every keystroke.
 */
export default function Page() {
  return <SearchExperience />;
}
