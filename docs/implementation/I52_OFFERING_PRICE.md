<!--
Owner:        Architecture Owner
Status:       Complete
Version:      1.0
Last Updated: 2026-08-31
-->

# I52 — An Offering states what it costs, where it came from, and which product it is

## What this increment is

The Owner's decisions of 2026-08-30 turned the platform toward an
affiliate-first price comparison across many Domains. Three of those decisions
change what an Offering **is**:

1. price belongs to the **Offering**, not to a separate Product or Merchant;
2. an Offering carries a **Product Key** so several Offerings can be presented
   as one product;
3. the Domain set is **open**, not three.

`Offering` is defined by PRD-0001, which was Frozen at v3.1. So this increment
began with the document, not with the migration.

---

## The governance step came first, and it had to

`REPOSITORY_GOVERNANCE.md` and `DOCUMENT_LIFECYCLE.md` §7–§8 forbid editing a
Frozen document in place: *"A required change creates a separate superseding
revision that begins at Draft under a new version."*

Writing the columns first and the PRD afterwards would have made the datamodel
the definition of an Offering and the PRD a description of the code — the exact
inversion `Documentation First Development` exists to prevent. So the sequence
was: draft the superseding revision → Owner approval (**"onaylıyorum"**,
2026-08-30) → one code increment.

**PRD-0001 is now Frozen v4.0**, superseding Frozen v3.1, whose Freeze,
Approval and Revision Notes are preserved in the document.

---

## The design decision this increment turned on

The Owner supplied it:

> *"ilan fiyatı olmayan ürünlerde olabilir örnek hizmet veriliyordur ama bir
> fiyatı yok — yönlendirme sonrası istenen hizmete göre belirlenen fiyat
> olabilir."*

There are **two different absences of price**:

| | Meaning | What a surface should say |
|---|---|---|
| **On Request** | The Offering has no amount *by its nature*. A consultancy, a repair, a bespoke installation. The amount is settled after the Handoff. | "Sorulduğunda belirlenir" |
| **Unknown** | The *platform* has not read one yet. A feed carried nothing; a source went quiet. | "Bilinmiyor" |

A single nullable `price` column makes these one row, and every surface then
has to guess which it is looking at. Showing a service as "price unknown" tells
a person the platform failed when nothing failed.

So price is a **Kind first and an amount second** — three values, not one
nullable number. This is the same distinction PRD-0002 §14 already draws between
zero results and results unavailable, and PRD-0006 §14 between absent and
unavailable. The repository had the shape; price had to be made to fit it.

---

## What was built

### Datamodel — `20260830000100_offering_price_source_product_key`

Three enums, nine columns, **four CHECK constraints**, three indexes.

The constraints are the point. They make the invalid state unrepresentable at
the only layer that sees every write:

| Constraint | Refuses |
|---|---|
| `offering_fixed_price_is_complete` | `FIXED` without an amount, a currency, or the instant |
| `offering_unpriced_carries_no_amount` | `ON_REQUEST`/`UNKNOWN` carrying money |
| `offering_amounts_are_not_negative` | negative amount, prior amount or delivery cost |
| `offering_prior_amount_is_a_reduction` | a prior amount at or below the current one |

`UNKNOWN` is the default because it is what is true of every Offering that
existed before the migration. A `0` default would have published a catalogue of
free things.

`NUMERIC(12,2)`, never a float. §5.10.5 makes the ordering of these amounts the
product, and an ordering computed from approximations is one that is
occasionally and silently wrong. The value stays a **string** from column to
driver to contract to JSON, so nothing ever parses it into something that could
round it.

### Contracts

`offeringPriceInputSchema` is a **discriminated union**, so §5.10.3's rule is a
shape rather than a check. `amountSetAt` is absent from it by construction: a
caller able to name the instant could present a year-old amount as established a
minute ago. It is stamped where the amount is written — the same pattern as the
registration token minted at delivery.

`editOfferingSchema` gains `pricing` and `productKey` and **not `source`**.
§5.11.1 protects a Feed Offering from the intake that did not create it, and
that protection is worth nothing if an owner can label their own Offering
`FEED`. The refusal is `unrecognized_keys` — the shape's, not a rule someone has
to remember.

### Repository, service, OpenAPI, owner screen

The read composes the union in TypeScript rather than in a `case` expression
assembling JSON: the union is a fact about the contract, and SQL would be that
fact written a second time in a second language.

The OpenAPI document publishes `pricing`, `productKey` and `source` on both read
shapes and `pricing`/`productKey` — not `source` — on the write shape. This is
I42's lesson made into a test: a field stored, carried and returned but absent
from the document is a field no client knows exists.

The owner's edit form gained a price fieldset. **It had to.** The write shape is
a replacement, so an edit that says nothing about price says the price is gone;
leaving the form unchanged would have made every routine save silently wipe a
price. The amount fields render only for `FIXED`, because a box beside
"sorulduğunda belirlenir" collects a value both the contract and the column
refuse.

---

## Two mistakes, and what caught them

**1. The raw columns rode along on the read.** `composePrice` built the union
correctly and I left `pricingKind`, `amount`, `currency`, `amountSetAt`,
`priorAmount`, `deliveryCost` and `stockState` on the same object through the
spread. Every read and every write answered `500`.

`offeringContentSchema` is `.strict()`, so the stray keys were a refusal rather
than a harmless extra. **That is what strict is for**, and it caught this on the
first request rather than in a client six months later wondering which of
`amount` and `pricing.amount` to trust.

**2. `inconsistent types deduced for parameter $6`.** Postgres infers a
parameter's type from where it appears; `$6` was the enum in
`pricing_kind = $6` and `text` in `$6 = 'FIXED'`. A runtime failure no
type-checker could have named. Both uses now carry `::"PricingKind"`.

And one wasted hour worth recording: I first diagnosed the `500` as an SQL fault
and proved the SQL fine. The actual cause of *that* round was a
**`packages/contracts/dist` from 24 August** — the API resolved a build of the
contracts that predated the fields. The chain's "clean tree, every `dist` and
`tsbuildinfo` deleted" rule exists for exactly this, and I had skipped it while
iterating.

### The thirteenth wrong match

My own mutation harness. Two `perl -0pi` substitutions silently matched nothing
and reported the tests as *surviving* the mutation — which, taken at face value,
would have led me to weaken two correct tests. Rewritten to assert the
substitution applied (`assert s.count(old) == 1`) before running anything.

A check that looks like verification but verifies something else, for the
thirteenth recorded time, and the first time the check was mine rather than the
repository's.

---

## Evidence

**40 cases across two files, and 13 mutations, every one killed.**

`tests/i52-offering-price.test.ts` — 28 cases: the exact set of three Kinds,
three Stock States and three Sources; what a Fixed price must carry; the refusal
of a caller-supplied instant; money that is not money; `ON_REQUEST` carrying an
amount; a prior amount that is not a reduction; `0` delivery versus unstated;
the absent Source field; the Product Key kept as supplied; the OpenAPI
publication; and the owner's form.

`tests/i52-offering-price.integration.test.ts` — 12 cases against a real
PostgreSQL: a new Offering reads `UNKNOWN`/`BUSINESS`; a Fixed price round-trips
as the exact decimal; the instant is stamped by the server and cleared when the
price goes; an edit that omits price clears it and leaves a Published Offering
Published; `source: "FEED"` in a body is refused and the column is unchanged;
and the four constraints refuse invalid **rows**, which is the case no request
can be trusted to cover — the feed intakes §5.11 anticipates write rows without
ever making a request.

The mutations: removing the `pricing` default; dropping `.strict()` from the
`ON_REQUEST` branch; making the reduction rule always true; reading `""` as `0`;
case-folding the Product Key; adding `amountSetAt` to the input schema; four
OpenAPI removals and additions; rendering the amount fields for every Kind;
taking the instant from a fixed past date; leaving the instant behind when the
price goes; and not writing the Product Key.

---

## What this increment deliberately did not do

The **public** surfaces do not publish price yet. `ListingCard`,
`SearchResult`, `OfferingPresentation` and `OfferingSearchProjection` are
unchanged, so nothing a visitor sees has moved. §8.2 now permits price in the
Presentation; delivering it, and the price ordering §5.10.5 defines, is the next
increment.

Also untouched, and named so they are not forgotten:

- Domains are still the three seeded ones — the PRD now permits more, and
  seeding them is separate work;
- there is no `FeedSource`/`FeedRun`/`FeedItem`, so nothing can write
  `source = FEED` yet;
- there is no system Business, so Phase-1 Admin-authored Offerings have no owner
  to belong to;
- the bounded correction edit (`saveCorrection`) does not touch price, which is
  correct — UX-0005 §11 bounds a correction to targeted content areas — but it
  means a correction case cannot be used to fix a wrong price.

## One defect found and not fixed here

`content-form.tsx` renders a Boolean Attribute's choices as `Yes` and `No`, in
English, on a Turkish site. It predates this increment and survived I27–I29's
consolidation. Fixing it changes what those tests measure, so it belongs in its
own increment rather than buried in this one.
