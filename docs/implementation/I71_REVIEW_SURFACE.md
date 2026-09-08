<!--
Owner:        Architecture Owner
Status:       Draft — built and tested.
Version:      0.1
Last Updated: 2026-09-03
-->

# I71 — The reviews, on the page

## What was missing

**I62 built the whole of this and stopped one step short.** The API answered
`GET /offerings/{slug}/reviews` and accepted `POST`; the score reached every
Listing Card and sat under every product title. The sentences behind the stars
were nowhere.

So a person could see that a phone scored 4.3 out of 2 reviews and could not
read one word about why, and nobody could write one. **A score with no reviews
under it is a number the platform is asking to be trusted about** — which is the
opposite of what a comparison site is for.

## What was built

| Piece                  | What it does                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `discovery/reviews.ts` | the read (with the session, when there is one) and the write     |
| `ReviewsSection`       | the list, the aggregate, and what the page is not showing        |
| `ReviewForm`           | five labelled radios and a box, or somebody's own review to edit |
| `writeReview`          | the action, revalidating the page only on success                |

### `null` is an outage, not an absence

The read answers `null` when the reviews could not be read, and the section says
so. Rendering the empty state there would tell every visitor that nobody has
reviewed a product that may have two hundred reviews — the failure that is
invisible in production because it looks exactly like a new product.

### The form is offered where the API said it may be

`writable` is an answer about _this request_, computed by the route that would
have to refuse the submission. A form shown to a Guest would collect a review
and then refuse it, which is a worse answer than not offering one.

### One person, one review

A repeat submission replaces the previous one — that is what keeps the average
an average of _people_ — so somebody who has already written one is offered
their own words back under "Yorumunuzu değiştirin" rather than an empty box that
would read as a chance to vote twice. Their row in the list is marked, so they
can find it among twenty.

### Radios, not a star widget

Five labelled radio buttons are a control a keyboard can already use. A row of
clickable stars is that same control rebuilt badly unless somebody spends a day
on it, and the stars are what the _scores_ are printed as either way.

### The score is the product's

The reviews are keyed on the product group, so three partners selling one phone
show one set of reviews and one score. The Owner's rule, unchanged since I62:
_puanlama ürüne ait olacak, satıcıya değil_.

---

## What this completes

With this the six requests of the Owner's 2026-09-02 list are all implemented:

|     | Request                                             | Increment     |
| --- | --------------------------------------------------- | ------------- |
| 1   | complementary-product advertising under the actions | I70           |
| 2   | the home card CTA reaching the affiliate link       | I59 (already) |
| 3   | listing number on the card, searchable              | I67           |
| 4   | En yeni / Tümü / Yükselenler / Popüler              | I68           |
| 5   | Hata Bildir in place of Listeye dön                 | I69           |
| 6   | "Kelime, ilan no ile ara"                           | I68           |

and the review surface I62 left unfinished is now on the page.

## Documents this increment is ahead of

`US-OFR-F05-001` and `UX-0003` describe the Presentation and name no review
region — the same gap I62 recorded for the API, now also true of the surface.
Nothing here adds a rule the API did not already enforce.
