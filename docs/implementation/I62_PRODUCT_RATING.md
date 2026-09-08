<!--
Owner:        Architecture Owner
Status:       Draft — the capability is built and tested; the governing
              documents it needs are listed below and not yet revised.
Version:      0.1
Last Updated: 2026-09-02
-->

# I62 — A product carries a score, and the score belongs to the product

## What this increment is

The Owner's prototype has shown stars on every card and a **Yorum** tab on
every product page since the layout was settled. The platform had nothing
behind either: no table, no contract field, no route. The word that decides the
whole shape is his:

> puanlama ürüne ait olacak satıcıya değil

The rating belongs to the **product**, not to the seller. Everything below
follows from that one sentence.

---

## Why the product group and not the Offering

PRD-0001 v4.0 §5.12 already says what a product is on this platform: the set of
Offerings sharing a `productKey`, and — for one nobody has matched — the
Offering itself. Discovery and Presentation have grouped on exactly that
expression since I58:

```sql
coalesce(o.product_key, o.id::text)
```

`product_review.product_group_key` is written against it. A review keyed on
`offering_id` would give five partners selling one phone five separate scores,
and the card — which is drawn from the cheapest seller — would show *that
seller's* score under a title that names the product. Keying on the group is the
only shape that answers the rule as written.

`offering_id` is kept as **provenance**: which listing the person was reading
when they wrote. It is never what the score is read back by, so a withdrawn
listing does not take a product's score with it.

**PRD-0001 §4's exclusion of seller reputation is untouched.** `sellerOfferSchema`
still carries no rating, and nothing here computes one. A product score and a
seller score are different facts about different things.

---

## What was built

| Layer | Change |
|---|---|
| Schema | `ProductReview` (`product_group_key`, `offering_id`, `user_id`, `rating` 1–5, `body`, timestamps), unique on `(product_group_key, user_id)`; `user_account.display_name` and `pending_registration.display_name` |
| Migrations | `20260902000100_product_review`, `20260902000200_account_display_name` |
| Contracts | `productRatingSchema`; `rating` on `listingCardSchema`, `searchResultSchema` and `offeringPresentationSchema`; `productReviewSchema`, `productReviewsSchema`, `writeProductReviewSchema`; `ratingConstraintSchema` on Search and Browse submissions; `name` on `beginRegistrationSchema` |
| Persistence | `product-rating.sql.ts` (`PRODUCT_RATING_SQL`, `withRating`, `ratingPredicate`), `pg-review.repository.ts` (`byline`, `list`, `write`, `rating`, `groupKeyOf`) |
| API | `GET /api/v1/offerings/{slug}/reviews`, `POST /api/v1/offerings/{slug}/reviews`; `PrincipalResolver.resolveOptional` |
| Web | `ProductRatingSummary` on the Listing Card and the Presentation |
| Tests | `tests/i62-product-rating.test.ts` — 16 cases |

---

## Three decisions worth recording

**The average is a string.** `4.3` has no exact binary representation, and a
score that renders as `4.2999999` in one client is a fact the platform failed
to state. PostgreSQL returns `numeric`, the query casts it to `text`, and the
digits travel unchanged — the same discipline every amount in this repository
already follows.

**An unrated product is `{ average: null, count: 0 }`, never zero.** A product
nobody has scored is not a product everybody scored badly. The same distinction
decides the Rating Constraint: a product with no score satisfies no floor,
which is §10.4's rule for an absent value applied to an aggregate.

**The byline is a masking rule, not a stored value.** The account holds the name
the person typed at registration and the API publishes `Aylin K.` — given name,
surname initial. That is enough to tell two reviewers apart; the full surname
would hand every reader a real person's name in exchange for a sentence about a
phone. An account with no name publishes `null`: an anonymous review is honest,
an invented byline is not.

The name itself is new. The Owner's registration dialog has asked for **Adınız**
since the first prototype and the platform discarded it, which was defensible
while nothing public was written by a person. It stopped being defensible the
moment reviews existed.

---

## Documents this increment is ahead of

The capability is built and passing; these are the revisions it needs before it
can be called Complete.

1. **PRD-0002 §5.6** closes the Discovery criteria to three. The Rating
   Constraint is a fourth, exactly as the Price Constraint was a fourth in I61 —
   and it needs the same kind of revision §5.5A got.
2. **A user story for product reviews.** There is none: `US-DSC-*` covers
   Discovery and `US-OFR-F05-001` covers Presentation, and neither has a
   criterion about what other buyers said.
3. **PRD-0003 (identity)** does not mention a display name, because until now
   an account had none.

None of these is a conflict with a Frozen rule — they are silences, which is a
different thing and still has to be closed rather than left.
