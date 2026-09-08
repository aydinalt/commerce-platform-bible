<!--
Owner:        Architecture Owner
Status:       Draft — built and tested. It runs ahead of a Frozen document on
              purpose; the superseding revision is named below and needs the
              Owner's decision.
Version:      0.1
Last Updated: 2026-09-03
-->

# I68 — The four tabs

## What was missing

_Tümü, En yeni, Yükselenler, Popüler_ have been at the top of the Owner's
prototype since the first one. Every list in the platform was arranged one way:
unavailable stock last, then cheapest delivered first (I63).

## The document this runs ahead of, stated first

`PRD-0002 §12.5` excludes five things from V1, and the first of them is a
**user-controlled Sort**. This increment implements one, so the honest order is
to name that before describing the code.

The superseding revision was written, approved and **Frozen on 2026-09-03** as
`PRD-0002-discovery.md` v3.0, together with `UX-0002-discovery.md` v1.3, the
Feature Registry v2.0 and `US-DSC-F14-001`. Frozen v2.4 and the v2.5 candidate
are preserved beside it. **This increment is no longer ahead of its document.**

Why the revision is not a reversal: §12.5's five exclusions were never one
thing. Four of them — paid placement, sponsored priority, promoted Listing
Cards, Business-controlled ranking override — protect a reader from an order
that was _sold_, and this increment does not touch them. The fifth protects
something different: an open sorting facility would have had to answer, field
by field, what may be sorted by and what that discloses. A closed set of four
arrangements answers the question once, in the document.

## What was built

| Piece                       | What it does                                                    |
| --------------------------- | --------------------------------------------------------------- |
| `RESULT_ARRANGEMENTS`       | four names, in the order the tabs are printed                   |
| `result-arrangement.sql.ts` | the ordering columns and the `order by` prefix                  |
| `pg-discovery.repository`   | one prefix in front of `LISTING_ORDER`, in Browse and in Search |
| `ArrangementTabs`           | the strip, with the tab's own promise written under it          |
| `applyArrangement`          | the criterion travels in the same carrier as the budget         |

### An arrangement leads; it does not replace

Every tab is a **prefix** to the ordinary arrangement, never a substitute for
it. Two products nobody has opened cannot be separated by _Popüler_, and the
answer is then the arrangement the rest of the platform uses — not whatever
order the database happened to produce. A newly listed product therefore appears
where its price puts it rather than at the bottom of a list of zeroes.

### Counted over the product, never over the seller

The same rule as the score and the heart (§5.12.1, and the Owner's _puanlama
ürüne ait olacak, satıcıya değil_). Three partners selling one phone are one
product, so the attention it received is one number rather than three that each
understate it. The test asserts exactly this: two sellers with three opens each
outrank a rival with five.

### Two tabs are free and two are not

_Tümü_ and _En yeni_ order by facts already on the row. _Popüler_ and
_Yükselenler_ count events, so their columns are **selected only when their tab
is in force** — otherwise every Browse and every Search in the platform would
carry two correlated aggregates permanently to serve a minority of requests.

| Tab         | What leads                                                                |
| ----------- | ------------------------------------------------------------------------- |
| Tümü        | out of stock last, then cheapest delivered first                          |
| En yeni     | later Initial Published At first                                          |
| Popüler     | Presentation Opens in the last 30 days                                    |
| Yükselenler | the average of Opens, Affiliate Handoffs and reviews over the same window |

**One substitution, stated rather than hidden.** The Owner's prototype averages
_yorum, tıklanma ve aranma_ — reviews, clicks and searches. The platform records
how many people went on to the partner and does not record how many searches a
product appeared in, so the Affiliate Handoff takes the third place. It is a
stronger signal than the one it replaces, and the difference is the Owner's to
accept or send back.

**Thirty days, rolling.** _"Bu ay"_, written as an interval rather than as a
calendar month: a calendar month would discard every product's history at
midnight on the first, and the tab would show whatever happened to be opened
overnight.

### Inside Search, within a match level

§12.2 still decides which tier a result is in — a query that names a title is
answered by that title first — and the tab arranges inside the tier. This is the
same shape I63 used for the price tie-break, and it keeps Best Match meaning
what the document says it means.

### The counts are not published

`openCount` and `trendScore` are ordering inputs. They are stripped before a
card is composed, and the `.strict()` card schema is the guard rather than the
inconvenience: publishing "opened 41 times" would put a popularity claim on a
card that no document has decided to make.

---

## Also in this increment

The Home search box now reads **"Kelime, ilan no ile ara"** — the Owner's own
words, and a statement of what the box accepts. After I67 it accepts a listing
number, and nothing on the page said so.

---

## Documents this increment is ahead of

**Resolved on 2026-09-03.** `PRD-0002-discovery.md` v3.0 §12.6 owns the
arrangement, `US-DSC-F14-001` v1.0 is its Story, and `UX-0002-discovery.md` v1.3
§9D describes the strip. All three are Frozen; nothing in this increment is
ahead of a document any longer.
