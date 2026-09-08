# Admin-First / Manual Override — Assessment Before Building

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — assessment, decides nothing
- **Version:** 0.2
- **Date:** 2026-09-07
- **Raised by:** Implementation, on the Owner's request of 2026-09-07 to build a
  hybrid manual/API affiliate structure.

> **This document was written instead of the schema and the code that were
> asked for.** The reason is in §1: the platform already is the architecture the
> request describes, and building a second one beside it would give the
> question "is this handoff live?" two different answers.
>
> §5 names the three things in the request that are genuinely new. Two of them
> collide with Frozen decisions and are the Owner's to take, not mine to
> implement.

---

## 1. The headline: this is already the architecture

**There is no API integration to wait for.** No affiliate network is connected,
nothing is fetched from Hepsiburada, Trendyol or Amazon, and no cron job writes
a destination. Every affiliate address in this platform is one an Admin typed.

The "Admin-First / Manual Override" strategy is not a change of direction. It is
a description of what was built, and it has been the design since `PRD-0001`
v4.0 excluded affiliate-network integration in as many words.

What the request asks to add is, item by item, already present:

| Requested                            | Where it already is                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `affiliate_url` on the listing       | `affiliate_destination.reference` — `varchar(2048)`, **1:1 with an Offering**                                                                  |
| Admin enters it manually             | `/businesses/:id/offerings/:id/destination` and the Admin acts on it                                                                           |
| Field filled ⇒ the listing goes live | The handoff biconditional: `handoff_eligibility` reaches `ELIGIBLE` only through Review → Validate → Enable                                    |
| Field empty ⇒ nothing offered        | An Offering with no destination publishes and compares; it simply cannot be handed off. `V1_LAUNCH_RUNBOOK.md` §2.2 records this as legitimate |
| `external_listing_id`                | `offering_feed_item.external_id` — the partner's own identifier for the row, `varchar(160)`                                                    |
| `api_source_platform`                | `offering.source` (`MANUAL` / `BUSINESS` / `FEED`) and `offering_feed` (the partner, the document, its format)                                 |
| Click tracking                       | `affiliate_handoff` — one row per handoff, carrying the exact address as it stood at that moment, indexed on `(offering_id, initiated_at)`     |
| The click number an operator reads   | The **Affiliate Handoff Rate**, built in `I78`, owned by `PRD-0006` v2.6 §11.6, on the Admin dashboard                                         |
| Future-proof for cron jobs           | Built and restricted on purpose: `I88`/`I89`. An intake matches by `product_key` and may write **price and stock only**                        |

## 2. Why not add the columns anyway

The request asks for nullable `affiliate_url` and friends on the listing table.
Adding them would not be additive; it would create **a second source of truth
for the same fact**, and the two would disagree within weeks.

The existing column is not a bare string. It sits inside a lifecycle:

```text
reference typed        → status DRAFT, validation NOT_VALIDATED, handoff INELIGIBLE
Admin reviews          → a review row is written; no state changes by itself
Admin validates        → VALID or INVALID, with a recorded reason
Admin enables          → requires VALID; handoff_eligibility becomes ELIGIBLE
Admin disables         → INELIGIBLE, and the validation result is preserved
```

A nullable `affiliate_url` beside that has **no lifecycle at all**. The moment it
exists, "does this listing have a live handoff?" has two answers: one from a
governed state machine, one from `IS NOT NULL`. Whichever the front end reads,
the other becomes a field somebody maintains for no effect — and the failure
shows up as a partner's link being live when an Admin believes they disabled it,
which is the one direction this must never fail in.

**The three Admin acts are the manual override.** They are separate on purpose:
`import-catalogue.mjs` performs all three per listing and its own comment
records why no batch endpoint was added — _"a deliberate three-step judgement
collapsed into one click for everybody, for ever, to save an operator some
minutes once."_

## 3. The Admin flow as it works today, step by step

1. **A listing exists.** Created by an Admin, or imported by
   `import-catalogue.mjs`, or created by a partner. Publication needs no
   destination.
2. **An Admin opens the listing's destination surface** and types the affiliate
   address. It is stored exactly as typed. Status `DRAFT`, eligibility
   `INELIGIBLE` — **the address is stored and the button is not live.**
3. **Review.** Recorded as its own row with the reviewer and an optional note.
   It changes no state; it is the condition a `Valid` result depends on.
4. **Validate.** Produces `VALID` or `INVALID` with a recorded reason.
5. **Enable.** Permitted only from `VALID`. `handoff_eligibility` becomes
   `ELIGIBLE`, and only now is the handoff offered anywhere.
6. **Disable** at any time. Eligibility returns to `INELIGIBLE`; the validation
   result is kept, so re-enabling does not require re-validating a link nobody
   changed.

Every one of steps 3–6 has been written to `admin_audit_event` since `I87`, so
"who made this handoff live" is answerable from the central trail.

**A partner feed changes none of this.** `PRD-0001` v4.2 §5.11.1 restricts an
intake to the price and stock of an already-published, already-matched listing.
A feed cannot create a listing, publish one, or touch a destination.

## 4. What the front end already does

The public Offering presentation does **not** carry a "go to shop" button, and
that is a Frozen decision rather than an omission:

- `UX-0003-offering-detail.md` Frozen v1.0 lists **Affiliate Handoff execution**
  under what it does not do, and hands execution to `UX-0009`.
- ~~`PRD-0004` §7.3 forbids a handoff that begins without a person choosing.~~
  **Corrected 2026-09-07, same day.** §7.3 constrains Decision **Chat** — it
  forbids the _assistant_ from choosing an Offering or initiating a handoff. It
  says nothing about where a person's own control may live, and a person
  pressing a button is the thing §7.3 protects rather than the thing it
  prohibits. The real constraint is narrower: a handoff is defined against a
  **Selected Offering** (`PRD-0004` §5.8, §9.2) and its record lives in a
  Decision Flow. `UX-0003` v1.2 §9.4.2 honours that rather than amending it.
  The error is left visible because §5.2 below was written on top of it.

So the address is reached through the Decision flow, where a person has selected
an Offering, and the handoff is recorded as an `affiliate_handoff` row at the
moment it happens. The conditional the request describes — filled means active,
empty means nothing — already exists, expressed as eligibility rather than as
`IS NOT NULL`.

## 5. What is genuinely new, and what it costs

### 5.1 Tracking parameters on the outgoing address — small, needs a revision

The stored `reference` is used as authored. Appending UTM parameters, or a
per-platform tag, at handoff time is a real addition and a small one.

It is not a code change alone: `PRD-0001` §9 owns what a destination is, and the
platform currently promises to send a person to **the address as it stood at
that moment** — `affiliate_handoff.destination` records exactly that. Appending
parameters changes what that record means, so the record's definition changes
with it.

**Path:** a `PRD-0001` revision defining the appended parameters and what the
handoff row stores, then the code. Days, not weeks.

### 5.2 A direct handoff button on the listing page — **collides with Frozen documents**

`UX-0003` (Frozen **v1.1**, not v1.0 as first written here) excludes handoff
execution. That is the one document this needed, and `PRD-0004` did not need
amending at all — see the correction in §4.

It may well be the right change — a comparison site whose price rows do not lead
anywhere is unusual, and the prototype draws exactly such a row. **But it is a
revision of two Frozen documents, not a component.** Whoever writes it must
answer: does a direct handoff still create a Decision Flow record, and if not,
what happens to the Affiliate Handoff Rate that counts them?

**Path taken:** `UX-0003` **v1.2 candidate**, 2026-09-07, carrying both this
and the editorial review. **No `PRD-0004` revision was required**, which the
first version of this section wrongly assumed.

### 5.3 Paid position in Results — **collides with a decision the Owner recorded**

The request includes placement rules such as _"Kategori Sayfası 1. Sıra"_.

`PRD-0005` **Frozen v1.4**, approved 2026-08-31, is explicit:

> Sponsored, paid or promoted **ordering remains forbidden** — an advertiser may
> buy a region of the page and **may not buy a position in the Results**.

And the reason recorded there is the Owner's own:

> a comparison platform's product is trust, and a page whose Results are
> indistinguishable from its advertisements has sold the thing it was selling.

This is also the rule `PRD-0009` §8 was sealed against three messages ago, in the
same spirit: an editorial judgement is not purchasable. Selling position and
refusing to sell verdicts would be a hard line to hold, and a harder one to
explain.

**Two readings of the request, and they need different answers:**

- **A region of a page sold as advertising, clearly labelled `Reklam`** — already
  permitted, already built (`PRD-0006` advertising placements, `I75`), and needs
  nothing new.
- **A bought position inside the Results** — forbidden by a Frozen decision. It
  would need a `PRD-0005` and `PRD-0002` revision, and it is the one change in
  this list I would argue against rather than merely sequence.

## 6. Recommended order

1. **`UX-0003` revision.** Already the editorial review's only blocker; §5.2
   would ride along if the Owner wants the direct handoff button.
2. **`PRD-0001` revision for tracking parameters** (§5.1), if wanted.
3. **A decision on §5.3**, taken as a decision and not as a placement feature.
4. Code, after each document it depends on is authoritative — the order this
   project has kept since `I89`.

**Nothing in §1 through §4 needs doing.** That is the useful finding here: the
launch is not waiting on affiliate plumbing. It is waiting on affiliate
agreements, which is where it was before this request.
