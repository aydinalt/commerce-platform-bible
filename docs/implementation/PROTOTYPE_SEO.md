<!--
Owner:        Architecture Owner
Status:       Complete
Version:      1.0
Last Updated: 2026-08-31
-->

# Prototype SEO — making the interface findable

## What this increment is

The prototype under `prototype/` had been built and judged as a **screen**. It
was never judged as a **document**, and a price comparison site is read by two
audiences: a person, and a crawler that will decide whether the person ever
arrives.

This increment audited the prototype against what a search engine reads, and
closed the five gaps that were found. It touches **only** `prototype/`; no
platform code, contract, migration or test changed.

---

## What was found

The audit read every route, every component that produces a heading or a link,
and the two Next metadata surfaces. Five findings, in order of what they cost.

### 1. Category was a query string, not a page — the expensive one

`CrossSell` linked to `/?kategori=insurance`. `SearchExperience` read that
parameter in a `useEffect`, **after mount**.

Three consequences, and the first is the serious one:

- **The server rendered the same HTML for every value of the parameter.** The
  filter ran in the browser; a crawler does not wait for an effect. Eleven
  addresses served one page. That is not eleven missed opportunities — it is
  eleven duplicates of the home page competing with it.
- Query strings are treated as parameters *of* a page rather than as pages, so
  even correctly rendered they must be argued into an index.
- There was nowhere to put a title, a description or a canonical URL, because
  those belong to a route and this was not one.

This matters more than any other item here because **the category page is the
only surface that can rank for the words a market is searched with.** Nobody
searches for the name of a comparison site. They search for *kasko fiyatları*
or *oyun klavyesi karşılaştırma*. A product page can rank for one product; the
home page can rank for the site's own name; everything else has to come through
a category.

### 2. No structured data anywhere

Not one `application/ld+json` node. For a price comparison this is the largest
single gap after the routing: it is what produces the star rating, the review
count and the price range in a result. Without it the site competes for a
product search with a plain blue link, against competitors showing all three.

Every field needed already existed in `prototype/src/lib/types.ts` — rating,
review list, offers with seller and stock, editorial dates, release year. The
data model was ready; nothing read it.

### 3. Sharing was a shipped feature with no preview

`ShareMenu` posts to WhatsApp, X, Facebook and mail. There was no Open Graph
tag, no Twitter card and no `metadataBase`, so every share produced a bare URL
with no title, description or image. The feature worked and delivered nothing.

`ProductDetail` also carried a hard-coded `https://ilanlar.example/urun/…` —
a second owner of the site's own address, which would have had to agree with
the canonical tags, the sitemap and every JSON-LD node.

### 4. No `robots.txt`, no `sitemap.xml`

Neither existed. The absence of `robots.txt` is the more interesting half: the
results page has four filter controls, so an unguarded crawl finds a very large
number of near-identical pages and spends its budget on them rather than on the
eleven pages that should rank.

### 5. Two smaller things

- The product page's `generateMetadata` set a title and nothing else. No
  description, so Google writes the snippet itself from page text.
- Twenty-nine product pages named their category in the breadcrumb without
  linking to it, so none of that internal weight reached the category pages.

**One thing was checked and found already correct**, and is recorded so it is
not "fixed" later: the heading hierarchy. `h1` → `h2` → `h3` with no skipped
level on either route.

---

## What was built

### `prototype/src/lib/seo.ts` — one owner

Site origin, absolute-URL construction, description clamping, and every JSON-LD
builder. The reason it is one module is Single Information Owner: the origin
would otherwise have appeared in six places that must agree, with no way to
notice when they stop.

`SITE_ORIGIN` reads `NEXT_PUBLIC_SITE_URL` and falls back to
`https://ilanlar.example` — a reserved name that can never resolve, chosen
deliberately over a plausible-looking placeholder. **It is the one line to
change when the domain is chosen.**

### The nodes

| Node | Where | What it earns |
|---|---|---|
| `Product` + `AggregateOffer` + `AggregateRating` + `Review` | product page | price range, star rating, review count in the result |
| `Review` (editorial) | product page | a dated, authored verdict distinct from the crowd's average |
| `BreadcrumbList` | product and category pages | the trail shown in place of a bare URL |
| `ItemList` | category page | the category as a ranked list rather than a wall of text |
| `WebSite` + `SearchAction` | every page | a search box for the site inside a search result |

**Two decisions in the markup are not conveniences.**

*An Offering with no amount carries no `offers` at all.* PRD-0001 v4.0 §5.10.5
restated for a machine reader. The temptation is `"price": "0"` so the node
validates; a zero is a claim that the thing is free, and a search engine that
believes it prints "₺0" beside a commercial property. The honest node has no
price, exactly as the page has none.

*`reviewCount` is the length of the review list, not `product.reviewCount`.*
The seed file sets a headline figure (88) independently of the reviews it
carries (7). Google's policy is that this markup must describe reviews a person
can actually see. The markup takes the smaller, true number.

### `prototype/src/app/kategori/[slug]/page.tsx` — the new route

Eleven pages, prerendered by `generateStaticParams`, each with its own title,
description, canonical and `ItemList`.

It renders `SearchExperience` with `initialCategoryId` as a **prop**, not a
parameter read after mount. The category is therefore part of the first render:
the HTML served for `/kategori/insurance` already contains only insurance
listings. The static page and the interactive page are the same component, so
there is no second copy of the results list to drift. Filters stay live.

`generateStaticParams` and the route's own `notFound()` both exclude `all`.
`all` is a category id because the dropdown needs one, not because there is
anything at the other end of it; `/kategori/all` would be exactly the duplicate
of the home page this route exists to end.

### `robots.ts` and `sitemap.ts`

Both generated from the catalogue. `robots.ts` allows `/` and `/kategori/…`
and disallows the five filter parameters and the account paths. `sitemap.ts`
takes `lastModified` from each product's editorial revision date rather than
from `now()` — a sitemap where every page changed today teaches a crawler that
the date means nothing, after which it ignores the date on the pages that
really did change. `priority` is left at its default for the same reason: a
site that marks all of its own pages important has said nothing.

### The rest

`SearchExperience`'s `h1` now names the selected category rather than always
saying "Tüm ürünler". The breadcrumb's middle step is a link. `CrossSell`
points at `/kategori/{id}` — eleven internal links that now pass their weight
to a real page instead of to a duplicate.

---

## How it is proved

`prototype/preview/seo.mjs` — **657 checks**, run with `npm run preview:seo`.

It bundles the real modules with esbuild and imports them; nothing in it
re-implements a builder or asserts against a fixture. Every figure is compared
to the catalogue it claims to describe.

Structured data is the one part of a page nobody can *see* is wrong. A broken
layout is reported within the hour; a `lowPrice` that disagrees with the
cheapest row renders as nothing at all, and the first symptom is a manual
action months later.

Section 6 is the one that matters most. Everything before it proves the
builders are right; section 6 proves **the routes use them** — a correct
`productJsonLd` that no page calls is worth nothing, and that gap is invisible
from either side. `generateMetadata` is an ordinary async function, so it is
called directly with the same argument the framework passes, and `JsonLd` is
rendered with `react-dom/server`.

### Mutation testing — 15 mutants, 15 dead

Applied with an exact-count harness (`assert count(old) == 1`), because a
mutation that silently matches nothing reports every test as passing.

| Mutation | Result |
|---|---|
| `ON_REQUEST` given a zero price | died (2 checks) |
| `lowPrice` = highest price | died (27) |
| `offerCount` off by one | died (27) |
| `reviewCount` = the headline figure | died (29) |
| stock availability inverted | died (27) |
| category ordering removed | died (6) |
| `clamp` limit ignored | died (5) |
| editorial `dateModified` = `datePublished` | died (4) |
| product URL left relative | died (29) |
| **`all` guard removed** | **survived — see below** |
| product canonical removed | died |
| category canonical removed | died |
| metadata generated for `all` | died |
| `robots` stops blocking filter queries | died |
| sitemap dates all set to `now()` | died |

**The survivor was the useful result.** Removing `category.id !== "all"` from
`INDEXABLE_CATEGORIES` changed nothing, because no product carries `all` as its
category — so the *other* condition excluded it anyway. The check was measuring
a coincidence, and the guard had become decorative without anyone being able to
tell. It would have stayed that way until a seed row was written with
`categoryId: "all"`.

The fix was not a better assertion over the same data. `indexableCategories`
was extracted as a function taking the catalogue as an argument, so the guard
can be exercised against a catalogue in which it is the only thing doing the
work — a fabricated product sitting in `all`. The mutant now dies.

### Defect found by the drivers, not by me

`seo.ts` read `process.env.NEXT_PUBLIC_SITE_URL` bare. Next inlines
`NEXT_PUBLIC_*` at build time, so it is correct there — but the same module is
bundled by esbuild for the single-file preview, where `process` does not exist.
It threw on module load and took the **entire preview down**: all five existing
drivers failed at once, including checks for the share menu and the year
stepper that this change never touched.

The lesson is narrow and worth keeping: a module read by two bundlers cannot
assume either one's globals. `typeof process` is now guarded.

### Verification run

| Check | Result |
|---|---|
| `prototype:typecheck` | ✓ |
| `preview/seo.mjs` | 657 / 657 |
| `preview/drive.mjs` | 40 / 40 |
| `preview/decision.mjs` | 20 / 20 |
| `preview/onrequest.mjs` | 30 / 30 |
| `preview/dropdown.mjs` | 12 / 12 |
| `preview/crosssell.mjs` | 103 / 103 (was 92; the route change added checks) |
| single-file build | 396 kB, 0 external requests |

**`next build` was not run.** It exits with `SIGBUS` in the verification
sandbox, in `/tmp` as well as on the mounted volume, with memory and disk
available — an environment limit rather than a code fault. This is stated
rather than omitted: the claim proved here is that the builders are correct and
that the routes call them, not that a production build succeeds. That will be
established by CI, which runs `prototype:typecheck` but not `next build`.

---

## What is still missing, and why it was not invented

**No `image` in the `Product` node.** Google requires `image` for a product
rich result, so this markup validates but will not earn the rich card. The
catalogue has no photographs — only placeholder colour pairs. Emitting a
placeholder URL to satisfy the validator would buy a warning-free report and a
broken card. Blocked on the image work already tracked (#307–#310).

**No `priceValidUntil` on offers.** Deriving one from `seenAt` would be
inventing a fact about how long a shop honours a price.

**`lang="tr"` and no `hreflang`.** Correct while the site is Turkish. If the
site becomes multi-market, this and the whole copy layer change together — it
is not a tag that can be added on its own.

**The page says "88 yorum" and shows 7.** A prototype seeding artefact, but it
is also the kind of gap that becomes a structured-data policy problem once the
markup and the visible text are read as one claim. The markup takes the honest
number today; the seed should be made consistent before anything goes live.
