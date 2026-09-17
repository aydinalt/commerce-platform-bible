import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { readCategoryAddress } from "../../../discovery/category-address";
import { readFavouriteMarks } from "../../../discovery/favourites";
import { SESSION_COOKIE } from "../../../identity/session";
import { absoluteUrl, categoryPath } from "../../../seo";
import { TERMS } from "../../../vocabulary";

import { handoffFromCard } from "../../decision/actions";
import { keepFavourite, releaseFavourite } from "../../favourites/actions";
import { ListingCards } from "../../discovery/listing-card";

import { CategoryUnavailable } from "./category-unavailable";

import type { Metadata } from "next";

/**
 * The Category address (`UX-0002` **Frozen v1.4** §8A).
 *
 * **This is the first surface in the platform that exists to be found.** Every
 * other public route is somewhere a person arrives after already being here:
 * Discovery holds one visit's criteria and Home is reachable only by the site's
 * own name. Nobody searches for the name of a comparison site — they search for
 * the thing they are comparing — and until this route there was no address that
 * could answer such a search, because a Category existed only as a selection
 * inside somebody's session.
 *
 * **Read once, per request.** `generateMetadata` and the body both need the
 * answer, and without `cache` each would ask the API separately — doubling the
 * load on the route a crawler will walk thousands of times.
 */
const categoryOf = cache(async (slug: string) => readCategoryAddress(slug));

/**
 * The tab, the snippet and the canonical address.
 *
 * **The canonical is the reason the route exists** (§8A.5). A Category is
 * reachable by more than one route — Browse walks to it through the hierarchy —
 * and this address is the one that names it. Everything else about the page is
 * reuse; this line is the new fact.
 *
 * The description is composed from the Category's own place in the catalogue
 * rather than authored, because §8A.6 decides that no authored content lives
 * here. What it says is true of every Category and specific to each: what this
 * branch holds and where it sits.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const read = await categoryOf(slug);
  /* A Category that cannot be read keeps the generic title rather than failing.
     Metadata is not worth a 500 on a page that would otherwise render. */
  if (read === "MISSING" || read === "UNAVAILABLE")
    return { title: TERMS.category };

  const canonical = absoluteUrl(categoryPath(read.category.slug));
  const trail = [
    ...read.ancestors.map((step) => step.name),
    read.category.name
  ];
  const description = read.category.leaf
    ? `${read.category.name} ilanları ve fiyatları. ${trail.join(" › ")}.`
    : `${read.category.name} altındaki kategoriler. ${trail.join(" › ")}.`;

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      title: read.category.name,
      type: "website",
      url: canonical
    },
    title: read.category.name
  };
}

/**
 * Never prerendered, for the reason the Offering route is not: what a Category
 * presents depends on which Offerings are eligible right now, and eligibility
 * changes between two requests.
 */
export const dynamic = "force-dynamic";

/**
 * The way up, and the way down.
 *
 * **Plain links, where Discovery uses a submission.** `CategoryChoices` in
 * Discovery posts to a server action because "a Category chosen by being linked
 * to could be chosen by a prefetch" — and in Discovery a selection creates a
 * Discovery Start, so a prefetch would create one nobody performed. Here it
 * cannot: §8A.4 makes arrival at a Category address record no occurrence at
 * all. The concern that forced a form on the other surface is exactly the
 * concern §8A.4 removes on this one, so these are links — which is also what
 * makes the hierarchy crawlable.
 */
function CategoryLinks({
  categories,
  heading
}: {
  categories: { name: string; slug: string }[];
  heading: string;
}) {
  if (categories.length === 0) return null;
  return (
    <nav
      aria-labelledby={`category-links-${heading}`}
      className="mt-8 border-t border-border pt-6"
    >
      <h2
        className="mb-3 text-sm font-medium text-text-muted"
        id={`category-links-${heading}`}
      >
        {heading}
      </h2>
      <ul className="flex list-none flex-wrap gap-2 p-0">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              className="inline-block rounded-md border border-border px-3 py-2 text-sm text-text hover:border-border-strong"
              href={categoryPath(category.slug)}
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Where this Category sits, as a trail of addresses.
 *
 * Ordered root-first, which is how `ancestors` arrives, and every step is a
 * link to that ancestor's own address — the hierarchy made navigable without
 * any of it being a Discovery path.
 */
function Trail({ ancestors }: { ancestors: { name: string; slug: string }[] }) {
  if (ancestors.length === 0) return null;
  return (
    <nav aria-label="Kategori yolu" className="mb-4 text-sm text-text-muted">
      <ol className="flex list-none flex-wrap items-center gap-2 p-0">
        {ancestors.map((step) => (
          <li key={step.slug}>
            <a href={categoryPath(step.slug)}>{step.name}</a>
            <span aria-hidden="true"> ›</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * A Category holding nothing (§8A.3).
 *
 * **Stated as a fact and never as an error**, which is §12's rule applied here.
 * The recovery it offers is the Category's own parent rather than a relaxed
 * criterion, because there are no criteria at an address to relax — §12's
 * recovery list is built from what a person applied, and nobody applied
 * anything to arrive here.
 */
function NothingHere({
  parent
}: {
  parent: { name: string; slug: string } | undefined;
}) {
  return (
    <section className="rounded-md border border-dashed border-border-strong p-6">
      <p role="status">Bu kategoride uygun bir ilan bulunamadı.</p>
      <p>
        {parent === undefined ? (
          <a href="/">Ana sayfaya dönün</a>
        ) : (
          <>
            <a href={categoryPath(parent.slug)}>{parent.name}</a> kategorisine
            dönün ya da <a href="/">ana sayfaya</a> gidin.
          </>
        )}
      </p>
    </section>
  );
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const read = await categoryOf(slug);

  /* An outage is not an absence. §8A.2 decides what an address presents; it
     does not decide what a failed read means, and answering one with "this
     Category holds nothing" would be a false statement about the catalogue. */
  if (read === "UNAVAILABLE") return <CategoryUnavailable slug={slug} />;

  /* Retired and never-existed answer alike, so the page leaks neither a
     retirement nor a moderation decision (§8A.2, §8.1). */
  if (read === "MISSING") notFound();

  const jar = await cookies();
  /*
   * §8A.3 presents "the same Listing Cards §10 defines", and §10 has carried
   * the Favourites mark since v1.3. Read the same way Discovery reads it —
   * `null` for a Guest and `null` again on failure, because a card with no
   * heart is a smaller answer than a card claiming somebody kept nothing.
   *
   * The session cookie is read; the **Discovery criteria carrier is not**, and
   * nothing here writes it. A person who had Results open, followed a shared
   * Category link and went back finds the Results they left.
   */
  const favourites = await readFavouriteMarks(jar.get(SESSION_COOKIE)?.value);
  const parent = read.ancestors.at(-1);

  return (
    <main className="block">
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <Trail ancestors={read.ancestors} />
        <h1 className="mb-6 border-b-2 border-border-strong pb-2 text-2xl font-semibold text-text">
          {read.category.name}
        </h1>

        {/*
         * §8A.2, which is §8.2 at an address. A non-leaf presents its children
         * and no Results — not an empty list, not a combined count, and nothing
         * that would aggregate what is beneath it. `results === null` is the
         * API saying "withheld"; an empty array would say "none here", and the
         * two cases below are deliberately not merged.
         */}
        {read.results === null ? (
          <CategoryLinks categories={read.children} heading="Alt kategoriler" />
        ) : read.results.length === 0 ? (
          <NothingHere parent={parent} />
        ) : (
          /*
           * §8A.3. No Filter controls, no budget, no availability switch and no
           * arrangement tabs — every one of those is Discovery's, and an
           * address that grew them would grow the criteria state §4 excludes.
           * The order is fixed by §8.3 and applied by the API.
           */
          <ListingCards
            cards={read.results}
            handoffAction={handoffFromCard}
            {...(favourites === null
              ? {}
              : {
                  favourites: {
                    from: categoryPath(read.category.slug),
                    keepAction: keepFavourite,
                    kept: favourites,
                    releaseAction: releaseFavourite
                  }
                })}
          />
        )}
      </section>
    </main>
  );
}
