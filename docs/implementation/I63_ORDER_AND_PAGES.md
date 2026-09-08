<!--
Owner:        Architecture Owner
Status:       Draft — built and tested; PRD-0002 §12 revision outstanding.
Version:      0.1
Last Updated: 2026-09-02
-->

# I63 — Cheapest first, twenty-five to a page

## What this increment is

Two things the platform inherited from a document written before it had prices.

**The order.** PRD-0002 §12.3 fixes Browse at *later Initial Published At
first*, and §12.2 gives Search the same key inside each Best Match level. Both
were decided when no Offering carried an amount at all. A price-comparison
platform whose default order is "most recently listed" is answering a question
nobody asked it. The Owner's instruction:

> Sıralama konusunu prototipine uyduralım.

**The length.** The answer carried every result, which was defensible while a
Category held a dozen Offerings and stops being defensible at the thousand the
Owner's own analysis plans for. His number:

> Sayfa başına 25 kart gösterilsin… aşağıda sayfa ilerleme butonları olsun.

---

## The order, key by key

`LISTING_ORDER` in `offering-price.sql.ts`, applied to the grouped result set:

1. **Out of stock sinks.** A price a person cannot buy at is not a better offer
   than one they can, and putting it first makes the top row the one row that
   cannot be acted on. `UNKNOWN` is not `OUT_OF_STOCK` — an unstated stock level
   is not a claim that there is none — so it stays with the buyable rows. The
   seller list inside a Presentation has ordered this way since I58; this is the
   same rule applied to the list of products.
2. **Priced before unpriced.** An Offering with no amount has no position in a
   price ordering. Sorting it to either end would state a comparison the
   platform cannot make, so it follows the rows that can be compared.
3. **What a person would pay** (PRD-0001 §5.10.5), not the sticker price:
   43.700 + 150 delivery is dearer than 43.750 delivered free.
4. **Then recency** — what §12.3 used to decide alone, now the tie-break it is
   good at.
5. **Then the identifier**, so the order is total and a page boundary cannot
   show one product twice.

### Search keeps relevance above price — and this is the open question

Best Match still decides which **tier** a result is in (§12.2's four levels);
I63 changes only the arrangement *inside* one tier, from recency to price. A
query that names a title is still answered by that title first even when
something cheaper matched through its Category path.

This is the conservative reading of the Owner's instruction: his prototype has
one list sorted by price, but his prototype has no relevance tiers to preserve.
**If he wants Search ordered purely by price, it is one line** — dropping
`array_position($4::text[], "matchLevel")` from the `order by` — and `matchLevel`
then becomes a label rather than an ordering input.

---

## Paging

`PAGE_SIZE = 25`, published in every response as `paging.pageSize` rather than
assumed by the surface: a client cannot check a boundary it has to guess. A
caller-chosen page size is deliberately **not** offered — §12.5 refuses
user-controlled ordering for V1, and one request asking for the whole catalogue
would undo the reason the page exists.

`total` counts **products**, the same grouping the cards are drawn from. A pager
that promised forty pages of five hundred listings and delivered twenty pages of
two hundred and fifty products would be counting one thing and showing another.

**One statement, one snapshot.** `count(*) over ()` is computed before `limit`,
so the total is the length of the whole ordered list and the rows are one page
of it — there is no window in which a total and its page disagree because
something was published between two queries. The one exception is a page past
the end, which carries no row for the window to report from; the count is then
taken separately, precisely so that overshooting a pager reports a *position*
rather than an empty catalogue.

**An empty page is not Zero Results.** Somebody on page nine of three has
overshot a list that exists, and §13's recovery actions — change the query,
clear the filters — would be answering a question they did not ask.
`zeroResults` therefore consults `paging.total`, not the length of the page.

**Every criterion change returns to page one.** Dropped in the web app's
`handOff`, not in each action, because that is exactly the thing one action out
of six would forget: a budget narrowed from page four is a new question, and
page four of the new answer usually reads as "nothing matched".

---

## What was built

| Layer | Change |
|---|---|
| Persistence | `LISTING_ORDER`; `PAGE_SIZE`; paging and the new order in `browse` and `search`; `matchCount` for a page past the end |
| Contracts | `pagingSchema`; `paging` on `browseViewSchema` (nullable) and `searchViewSchema`; `page` on both submissions |
| Module | `Paging` on `BrowseView` and `SearchView` in `modules/discovery` |
| Web | `Pager` under the Results; `page` in the Discovery entry carrier; `goToPage` action; `handOff` drops the page on every criterion change |
| Tests | `tests/i63-order-and-pages.test.ts` — 8 cases |

---

## Documents this increment is ahead of

**PRD-0002 §12.2 and §12.3 now describe an order the platform no longer
implements.** This is a real conflict with a Frozen document rather than a
silence, and it needs a superseding revision under `DOCUMENT_LIFECYCLE.md`
§7–§8. §12.5 is untouched and stays: there is no user-controlled Sort, no paid
placement, no promoted card — the default order changed, and it is still the
only order.

`i61-price-constraint`'s ordering case was rewritten rather than deleted. It
used to assert Initial-Published-At, which made "the budget does not reorder"
indistinguishable from "the budget happens to agree with recency"; it now
asserts that a constrained list is arranged exactly as the unconstrained one is,
which is the same statement against a rule the budget could actually disturb.
