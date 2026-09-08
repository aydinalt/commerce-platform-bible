<!--
Owner:        Architecture Owner
Status:       Draft — built and tested; the documents it is ahead of are listed
              at the end.
Version:      0.1
Last Updated: 2026-09-03
-->

# I67 — The listing number

## What was missing

Every way to name a listing was addressed to a machine.

| Name            | Why a person cannot use it                                            |
| --------------- | --------------------------------------------------------------------- |
| `offering.id`   | a UUID — nobody reads one over the telephone                          |
| `offering.slug` | changes when a title is corrected, so yesterday's note leads to a 404 |
| the URL         | the slug with a host in front of it                                   |

The Owner's requirement is one line — _"her ilanın kendine özgü bir ilan
numarası olması gerekiyor. İlan numarasını arama kutusuna yazınca
listelensin"_ — and it asks for the third kind of name: short, stable, spoken.
His prototype has printed `İLN-482007` on every card since I65; the platform
had nothing behind it.

## What was built

| Piece                     | What it does                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `offering.listing_number` | `bigint`, unique, from a sequence starting at 482000, assigned once                                     |
| `listingReference()`      | recognises a query that _names_ a listing, and refuses one that describes something                     |
| `pg-discovery.repository` | a listing reference substitutes the text-index predicate; everything else about the Search is unchanged |
| `LISTING_NUMBER_SQL`      | one fragment, selected by all six queries that compose a Listing Card                                   |
| `ListingNumber`           | one renderer of the `İLN-` prefix, on the card and on the page it opens                                 |

### The number is not the code

~~The API carries digits; `İLN-` is how this platform reads them out.~~
**The Owner removed the prefix on 2026-09-03**: a number exists to be read out
and typed back, every letter in front of it is one more thing to get wrong, and
the Turkish `İ` has two spellings and no key on some layouts. Surfaces print
digits. Search still _accepts_ `İLN-482007`, `ILN-482007` and `iln 482007`,
because people paste what earlier pages printed — a lookup that refused a form
the platform itself taught them would fail for a reason nobody can see.

The reasoning below is why the prefix was never in the _value_, and it survives
the change unaltered. A prefix in
the value would make every comparison a string comparison against a piece of
Turkish presentation, and a second place that wrote the prefix would eventually
write it differently — `İLN 482007` copied into a box that expects
`İLN-482007` reads as a broken search.

It travels as a **string** for the same reason money does: it is an identifier
rather than a quantity, nothing adds two of them, and a number long enough to
be unique is a number a JSON reader may round.

### A sequence, and what it discloses

A running sequence tells a reader roughly how many listings exist. That is what
every classified site in the country already discloses by the same means, and
the alternative — a random code long enough not to collide — is a code nobody
can read back over the telephone, which is the one property the column exists
to have.

The migration builds exactly the shape `BIGSERIAL` produces — an owned sequence
supplying the column's default — so the Prisma model declares
`@default(autoincrement())` and `db:drift` compares one structure rather than
two descriptions of it.

---

## Typing it in is a lookup, not a match

The obvious implementation is to put the number into `searchable_text` and let
the text index find it. It was rejected for two measured reasons.

**Turkish casing.** `İ` lowercases in JavaScript to `i` plus a combining dot
above; PostgreSQL's `simple` configuration lowercases it to a plain `i`. So
`İLN` on the query side is `i̇ln` and on the stored side `iln`, and they do not
match. The same fold also splits the ASCII `I` a plain keyboard produces —
`toLocaleLowerCase("tr")` turns it into the dotless `ı`. Three spellings of one
prefix, two of which match nothing.

**The answer would be wrong even when it matched.** A text match for `482007`
returns every listing whose description contains those digits and ranks the one
the person named among them. Somebody who types a listing number is not
searching; they are naming one thing.

So a recognised reference substitutes the match predicate:

```
to_tsvector('simple', p.searchable_text) @@ to_tsquery('simple', $1)
→ o.listing_number = $1::bigint
```

and nothing else about the Search changes. The Category narrowing, the
Attribute Filters, the price and rating floors, the stock switch, the paging
and the Zero Results state all still apply, because a person who typed a number
into a filtered page has not stopped being on it. A number nobody has answers
with Zero Results — they searched, and the query stays visible with the
recovery beside it — rather than with a 404.

### The rule is written to be refusable

A run of five or more digits and, beside it, nothing but the prefix — in every
spelling: `İLN`, `ILN`, `iln`, `ilan no`, `no`, or nothing at all. Anything else
is a description:

| Typed                                    | Read as                                                      |
| ---------------------------------------- | ------------------------------------------------------------ |
| `482007`, `İLN-482007`, `ilan no 482007` | that listing                                                 |
| `16 gb ram laptop`, `iphone 15 128 gb`   | a search                                                     |
| `mavi 482007`                            | a search — the word beside it means the person is describing |
| `2024`                                   | a search — four digits is a year, a model or a price         |

A wider rule would have broken the catalogue I66 had just filled: the numbers a
person searches by are _in_ the index on purpose.

`matchLevel` falls to `DESCRIPTION_OR_ATTRIBUTE` for a reference. It is the
least fitting of the four names and the only honest option — PRD-0002 §12.2
fixes the list, a fifth level would be product behaviour invented from a
repository, and with one row the ordering it feeds has nothing to arrange.

---

## Where it shows

- **On the card**, in the row of facts, where the Owner's prototype puts it —
  in place of the "model age" it printed before, which was a number derived
  from another number.
- **On the page the card opens**, beside the Category path: quoting a listing
  to a seller, to support, or into the report form needs the number to be where
  the person is.

Both print it through one component, and both read it from the same column: the
number is selected from `offering` rather than from the projection, because a
stale listing number is the worst kind of stale — a number a person quotes that
finds a different listing, or none.

---

## Documents this increment is ahead of

1. **No user story names a listing number.** `US-DSC-F02-001` describes what
   Search matches and does not admit an identifier lookup; PRD-0002 §11.2's list
   of matchable information has no entry for one. The behaviour is the Owner's
   own requirement and is implemented from it directly.
2. **PRD-0001 §5** names an Offering's identity as its `id` and its `slug`.
   A third identifier — public, stable, and the only one a person can use —
   belongs in that section.
3. `PRD-0002 §12.2`'s match levels now receive a case that is more exact than
   any of the four, and is filed under the weakest.
