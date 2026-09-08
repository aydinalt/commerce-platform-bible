<!--
Owner:        Architecture Owner
Status:       Draft — built and tested; the documents it is ahead of are listed
              at the end.
Version:      0.1
Last Updated: 2026-09-02
-->

# I64 — Keeping something, and asking for only what is in stock

## What this increment is

Two controls the Owner's prototype has carried since the layout was settled,
with nothing behind either: a heart on every card with **Favorilerim** in the
header, and **Sadece stokta olanlar** under the search bar.

---

## Favourites are kept on the product

The same decision I62 made about ratings, for the same reason and against the
same expression:

```sql
coalesce(o.product_key, o.id::text)
```

A person who kept a phone kept the phone, not one shop's listing of it. Three
consequences, each of which is the behaviour rather than a side effect of it:

1. **Keeping it from the cheapest seller and returning through a dearer one
   shows it already kept.** It is one thing, so it is one heart. A
   `favourite(user, offering)` table would show the second card hollow and
   nobody would call it a bug until a person kept the same phone twice.
2. **A seller withdrawing does not delete somebody's favourite.** The person
   kept a product; the catalogue lost a way to buy it. The row survives, the
   list reports `unavailable`, and a listing published tomorrow brings it back.
3. **The list shows today's cheapest seller**, by the same `PRODUCT_GROUP_PICK`
   Discovery uses. Somebody who saved a phone at 9.000 and comes back to find it
   at 1.000 has been told something useful; one shown the old figure has been
   told something false, and the price is the one number this platform exists to
   report.

### Two routes rather than one toggle

`PUT` and `DELETE` on `/offerings/{slug}/favourite`. A toggle's effect depends
on a state the caller cannot see: two presses racing would leave the heart
wherever the last one landed, and a retried request would undo itself. Both of
these say what they mean and repeat harmlessly — `on conflict do nothing` and a
delete of a row that may not exist.

`DELETE` is the **one route in the platform that resolves an Offering without
the eligibility gate**. An Offering whose sellers all withdrew is exactly the
favourite a person is most likely to want off their list, and refusing because
the catalogue can no longer show it would trap the row there. Nothing about the
hidden listing reaches the response: the key is resolved, the caller's own row
is deleted, and a slug that never existed answers identically.

### Marks are a separate route from the list

`GET /me/favourites` answers with cards; `GET /me/favourites/marks` answers with
keys. A Discovery page needs the marks and not the list — it already holds the
cards — and a favourites page needs the list and not the marks. One response
carrying both would make every Discovery render fetch a page of cards nobody was
going to look at.

---

## "Only what is in stock" excludes `UNKNOWN`

`o.stock_state = 'IN_STOCK'`, not `<> 'OUT_OF_STOCK'`. PRD-0002 §10.4 decides
it: an Offering with no value for an applied criterion does not satisfy it, and
somebody who ticked this box asked for things a seller has *stated* are
available.

**This is deliberately the opposite of the ordering's treatment of `UNKNOWN`**,
which does not sink it (I63). Both are right, and the asymmetry is the point: an
arrangement should not punish silence, because absence of a claim is not a claim
of absence — but a filter for a stated fact requires the statement, or it is not
a filter.

---

## What was built

| Layer | Change |
|---|---|
| Schema | `Favourite` (`user_id` + `product_group_key` primary key, `offering_id` as provenance) |
| Migration | `20260902000300_favourite` |
| Contracts | `favouritesSchema`, `favouriteMarksSchema`; `inStockOnly` on both Discovery submissions |
| Persistence | `pg-favourite.repository.ts`; `stockPredicate` in `product-rating.sql.ts` |
| API | `GET /me/favourites`, `GET /me/favourites/marks`, `PUT`/`DELETE /offerings/{slug}/favourite` |
| Web | the heart on every card, `/favourites`, the header entry, `StockControl`, `applyStock` |
| Tests | `tests/i64-favourites-and-stock.test.ts` — 9 cases |

---

## Documents this increment is ahead of

1. **There is no user story for favourites.** PRD-0007 (member area) is the
   nearest owner and does not mention them.
2. **PRD-0002 §5.6** closes the Discovery criteria to three; this is now the
   fifth (Attribute Filters, Category, query, Price, Rating, stock) and the
   §5.5A-style revision I61 and I62 already need has one more clause to carry.
3. **UX-0002 §9A** describes the budget control and its applied state. The stock
   control is built to the same rules — readable while it applies, confirmed by
   a press rather than on change — and the section says nothing about it.
