import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SearchExperience } from "@/components/SearchExperience";
import { JsonLd } from "@/components/site/JsonLd";
import { categoryById } from "@/lib/products";
import {
  INDEXABLE_CATEGORIES,
  breadcrumbJsonLd,
  categoryCopy,
  categoryJsonLd,
  categoryPath
} from "@/lib/seo";

/**
 * The category route.
 *
 * **This is the page a comparison site is actually found by.** Nobody searches
 * for the name of a comparison site; they search for "kasko fiyatları" or
 * "oyun klavyesi karşılaştırma". A product page can only rank for one product,
 * and the home page can only rank for the site's own name — the category page
 * is the only surface that can rank for the words a market is searched with,
 * and until now it did not exist as an address at all.
 *
 * What it replaced was `/?kategori=insurance`: a query string on the home page,
 * read after mount by an effect. Three things were wrong with it, and all three
 * are fixed by the URL alone.
 *
 * 1. **The server rendered the same thing for every value.** The filter ran in
 *    the browser, so the HTML a crawler received was the unfiltered catalogue —
 *    eleven addresses serving one page.
 * 2. **Query strings are treated as parameters of a page, not as pages.** Even
 *    correctly rendered, a crawler must be persuaded to index them.
 * 3. **There was nowhere to put a title, a description or a canonical**, because
 *    those belong to a route, and this was not one.
 *
 * `generateStaticParams` prerenders all eleven at build time, so the page a
 * crawler gets is a file rather than a render — and `SearchExperience` still
 * runs in the browser afterwards, so the filters remain live. The static HTML
 * and the interactive page are the same component; there is no second copy of
 * the results list to drift.
 */
export function generateStaticParams() {
  return INDEXABLE_CATEGORIES.map((category) => ({ slug: category.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryById(slug);
  if (category === undefined || slug === "all") return {};

  const { title, description } = categoryCopy(category);
  const path = categoryPath(category);

  return {
    alternates: { canonical: path },
    description,
    openGraph: { description, title, type: "website", url: path },
    title,
    twitter: { card: "summary_large_image", description, title }
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryById(slug);

  /*
   * `all` is a filter, not a place. It has a route-shaped id because the
   * dropdown needs one, but `/kategori/all` would be a second address for the
   * home page — the exact duplication this route exists to end.
   */
  if (category === undefined || slug === "all") notFound();

  return (
    <>
      <JsonLd
        nodes={[
          categoryJsonLd(category),
          breadcrumbJsonLd([
            { name: "Tüm ürünler", path: "/" },
            { name: category.name, path: categoryPath(category) }
          ])
        ]}
      />
      <SearchExperience initialCategoryId={category.id} />
    </>
  );
}
