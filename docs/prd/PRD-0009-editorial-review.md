# PRD-0009 — Editorial Review

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0009
- **Title:** Editorial Review
- **Status:** Frozen
- **Version:** 0.4
- **Supersedes:** Frozen v0.3, preserved unchanged at
  `PRD-0009-editorial-review-v0.3-superseded.md`
- **Approval Date:** 2026-09-08
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-08
- **Frozen By:** Product Owner / Architecture Owner
- **Depends on:** `PRD-0006` **Frozen v2.7** §22.2, frozen first on the same day
- **Last Updated:** 2026-09-08
- **Scope level:** Product behaviour (non-technical)
- **Release:** **V1.1. Outside the Frozen V1 baseline.**

> **Freeze Note (0.4):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-08, **second in the order the Owner set out** and immediately
> after `PRD-0006` reached Frozen **v2.7** — so that this document cites nothing
> that was not authoritative when it was frozen. This exact version must not be
> edited in place; a further change requires a controlled superseding revision
> under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v0.3 is preserved unchanged at
> `PRD-0009-editorial-review-v0.3-superseded.md`. **It remains outside the Frozen
> V1 baseline**: freezing a document settles what it says, not when it ships.
>
> **Approval Note (0.4):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-08 — _"PRD-0009 v0.4-candidate ve PRD-0006 v2.7
> taslaklarını resmi olarak onaylıyorum. Belgeleri derhal dondur (Freeze)."_ In
> the same decision the Owner restated the four-step order this freeze is the
> second step of, and commissioned the two steps that follow: the registry's
> authoring Feature, then the Story.
>
> **The blocker §14 named is discharged, not deferred.** `PRD-0006` **Frozen
> v2.7** carries the §22.2 row verbatim as §14 stated it. Every dependency this
> document had is now Frozen, and §14 records the closure in its own text.
>
> **Two things were changed in the act of freezing, and both are recorded rather
> than folded in silently.** §14's closing paragraph gains a line marking the
> freeze order as executed, and the two references to `PRD-0006` **v2.6** in the
> Revision Note below are left exactly as written — they were true when written,
> and rewriting them would erase the reason this document could not be frozen
> alone. Neither touches a rule, a section or a decision.
>
> **Revision Note (0.4):** Superseding revision of Frozen v0.3, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7. **It answers §9.3 —
> who writes a review, and at what cadence — and adds §13, the authoring
> surface.**
>
> Raised by the Owner's decision of 2026-09-08 to build reading and writing as
> one architecture rather than to enter reviews by hand while the read side was
> built. His three reasons are recorded in §13's opening, because they are the
> reasons the section is shaped the way it is.
>
> **This document cannot be frozen alone, and the reason is not this document.**
> `PRD-0006` **Frozen v2.6 §22.2** lists what the Admin audit trail records and
> says in as many words: _"This list is exhaustive and adding to it is a
> revision of this section."_ Its opening sentence is _"Every act by which an
> Admin changes something"_. Writing a review is such an act. So either §22.2
> gains a row or §22.2's own first sentence stops being true — and the second is
> not available. **§14 states the exact amendment `PRD-0006` needs**, and the
> two freeze in that order: `PRD-0006` v2.7 first, then this.
>
> Nothing in §§1–8 changes. §9.3 keeps its question and carries its answer, in
> the pattern §9.1 set.

> **Freeze Note (0.3):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07. This exact version must not be edited in place; a further
> change requires a controlled superseding revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8. It is the behaviour owner for the editorial
> review. **It remains outside the Frozen V1 baseline**: freezing a document
> settles what it says, not when it ships.
>
> **Approval Note (0.3):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-07 — _"PRD-0009 v0.3 onaylanmıştır; belgeyi
> dondurup Story üretimine geçebilirsiniz."_ Approval and Freeze were taken in
> one decision.
>
> **Commission Note (0.3):** In the same decision the Owner commissioned the
> Stories and confirmed that the **Feature allocation** — which registry
> product-level material presented on an Offering surface belongs to — is
> settled at commissioning rather than inside this document.
>
> **Revision Note (0.3):** **The blocker is gone.** v0.2 recorded that this
> document could not be frozen before `PRD-0001` said the Product Key may carry
> a review, because §5.12 called it a matching hint and nothing more. `PRD-0001`
> **v4.3** was approved and Frozen on 2026-09-07 and its **§5.12.4** now names
> the editorial review as the one thing the key carries. Every reference in this
> document is re-pointed at that authoritative version, and §11's precondition
> is discharged rather than deleted.
>
> **This revision decides nothing new.** It makes the chain citable: a document
> approved while pointing at a version that had not yet become authoritative
> would be a Story-generation hazard, because whoever generated from it would
> have to work out which claim was true when.
>
> **Revision Note (0.2):** The Owner decided §9.1 — the question this document
> said everything else depended on — on 2026-09-07, and confirmed §8. **A review
> attaches to the `productKey`.** §6 now records the decision and, at the
> Owner's own insistence, records what it costs; §9.1 is closed.
>
> **Scope confirmed with the Owner before drafting.** "Editöryel İlan
> Seçimleri" can mean two different products — the editor's _review_ of a
> product, or the editor's _selection_ of which listings get shown — and the
> Owner confirmed on 2026-09-07 that it means the review. **Editorial selection
> of what appears where is not in this document** and is not deferred here
> either; nothing in the prototype draws such a surface, so it would first have
> to be drawn.
>
> **Everything described here is already drawn.** The surface is the
> prototype's `EditorialReview` component and its shape is the `Editorial`
> interface in `prototype/src/lib/types.ts`. This document records them.
> Nothing visual is invented.
>
> **The architectural consequence is settled, and named for what it is.** An
> editorial review is about a _product_, and the platform deliberately has no
> Product. The Owner's decision attaches reviews to the `productKey` and accepts
> the deviation knowingly rather than denying it — §6.

---

## 1. Purpose

A comparison platform answers "which is cheapest" mechanically. It cannot answer
"is this one any good" without somebody forming and publishing a judgement.

This document defines the **editorial review**: a long-form, dated, attributed
judgement about a product, published by the platform in its own voice and kept
strictly apart from both the crowd's opinion and from anything a partner pays
for.

## 2. Business Value

Two values, and they are different enough to be listed separately because a
later decision may serve one and damage the other.

**Discovery.** The prototype names it in one line: this is _"the tab a search
engine indexes"_. A price table is thin, near-duplicate content across every
comparison site in the market. A written judgement is the page that can rank,
and ranking is how a platform with no advertising budget acquires the traffic
its affiliate model converts.

**Trust.** The platform earns a commission on the handoff, which gives every
reader a reason to doubt it. A published judgement that is dated, attributed,
sometimes negative, and demonstrably not for sale is the only thing that answers
that doubt. §8 is therefore not a nicety; it is the asset.

## 3. Scope

- One editorial review per product, as the prototype draws it.
- Its parts: verdict, score, sections, pros, cons, author, and two dates.
- Where it appears and how it relates to the crowd's reviews and to the price
  table.
- The rules that keep it worth reading.

## 4. Out of Scope

- **Editorial selection of listings** — which products appear on the home page,
  in a showcase, or above others. Not drawn in the prototype and not decided
  here (Draft Note).
- **A media pipeline.** The prototype's `video` is a placeholder and this
  document keeps it one; see §9.4.
- Any change to how offers are priced, ordered or handed off. This document adds
  a judgement to a page and touches no number on it.
- User-submitted reviews, which `I71` already built and which §7 separates from
  this.

## 5. The review, as the prototype draws it

| Part             | What it is                  | Why it is separate                                                                           |
| ---------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| **Verdict**      | One line of judgement       | The prototype's own note: it is what most people actually read                               |
| **Score**        | `0–10`, one decimal         | Deliberately **not** the crowd's `0–5` star average. Two scales, because they are two claims |
| **Sections**     | Headed passages of prose    | A person scanning and a crawler parsing both fail on a wall of text                          |
| **Pros**         | An explicit list            |                                                                                              |
| **Cons**         | An explicit list            | A review with no cons is an advertisement, and readers know it                               |
| **Author**       | Who formed the judgement    | An unattributed judgement is a claim nobody stands behind                                    |
| **Published**    | When it was first written   |                                                                                              |
| **Last updated** | When it was last re-checked | §5.1                                                                                         |

### 5.1 The two dates are the product, not the metadata

The prototype prints both dates in full, above the prose, rather than in small
grey type at the bottom — and its comment says why: _a comparison site's
editorial content ages faster than anything else on it. Prices move weekly, and
a verdict written against last quarter's prices is wrong without looking wrong._

"Written in March, checked last week" and "written in March" are different
claims, and only one of them is worth trusting. A three-year-old review with no
revision date is worse than no review at all, because it looks current.

**This is a requirement and not a display detail.** Any implementation that
collapses the two dates into one, or that omits the revision date when a review
has never been revised, removes the reason the reader can trust the page.

### 5.2 The score is not the crowd's rating

The platform already carries the crowd's average — `0–5` with one decimal,
derived from user reviews. The editorial score is `0–10` and is formed by a
person.

They must not be merged, averaged, or displayed as one number. They answer
different questions: one is "what do buyers say", the other is "what do we
think". A blended number answers neither and cannot be defended when a partner
asks how it was calculated.

## 6. What a review attaches to — the unresolved consequence

**An editorial review is about a product. The platform has no Product.**

This is not an oversight to be corrected; it is a decision. `PRD-0001` **Frozen v4.2** §4
excludes a Product entity, Product ownership and a Product lifecycle — §5.12
defines a matching hint and nothing more, and the platform groups two
sellers' offers of one thing by a shared **`productKey`** — a string the
importer requires and the feed matches on.

That model has carried everything so far, because everything so far has been
_about an Offering_: a price, a stock state, a destination, a moderation case.
A review is the first thing that is about the **group**. It would be absurd to
write one review of the same headphone for each of three sellers, and worse to
attach it to one of them.

So a review needs somewhere to live, and the honest options are few:

- **Attach it to the `productKey`**, within its Category. The key gains an
  identity — a row of its own — which is a smaller change than a Product entity
  and is a change in that direction, and should be recognised as one.
- **Introduce the Product entity** that `PRD-0001` §4 excludes, and
  re-examine that exclusion with a reason it did not have at the time.
- **Attach it to a Category**, and accept that the review is about a class of
  thing rather than a thing. Cheapest, and it is a different product: "how to
  choose a wireless headphone" is not "is the XZ-200 any good".

### 6.1 Decided — the `productKey` backbone

> **Owner decision, 2026-09-07:** _"incelemeyi `productKey`'e bağlamak,
> PRD-0001'de kapıdan kovduğumuz 'Ürün' varlığını (Virtual Product Entity)
> bacadan içeri almaktır. Ancak aynı kulaklığın incelemesini üç ayrı satıcı
> (offering) için kopyalamak veya rastgele birine iliştirmek çok daha büyük bir
> veri bütünlüğü hatasıdır. İncelemeleri `productKey` omurgasına bağlıyoruz. Bu
> yapısal sapmayı bilinçli olarak kabul ediyorum."_

**A review attaches to the `productKey`, within its Category.**

The decision is recorded with the Owner's own characterisation of it, and that
characterisation is the most useful sentence in this document: attaching a
review to the key admits through the chimney the entity `PRD-0001` §4 turned
away at the door. He weighed that against duplicating one review across three
sellers, or attaching it to one of them arbitrarily, and judged the second worse
— a data-integrity fault rather than an architectural drift.

**Two things follow, and both are obligations rather than observations.**

First, the key stops being only a matching hint. `PRD-0001` v4.2 defined it as
_"a matching hint and nothing more"_, and a `productKey` that carries a review
carries something. That obligation is **discharged**: `PRD-0001` **Frozen v4.3**
§5.12.4 now names the editorial review as the one kind of material the key may
carry, and §4's restated exclusion was amended to match. The two documents
describe the same string the same way, which is the state this obligation
existed to reach.

**§5.12.4 admits this review and nothing else**, deliberately. Anything further
proposed for the key is a fresh decision of the same weight, not a consequence
of this one — the second obligation below, now written into `PRD-0001` itself.

Second, the deviation is now on the record and must stay visible. The failure
mode of an accepted structural deviation is not the deviation; it is that three
increments later nobody remembers it was one, and the next thing attached to the
key is attached without a decision at all. **Anything further proposed for the
`productKey` is a decision of the same kind and gets the same scrutiny**, not a
consequence of this one.

## 7. Boundaries with what already exists

| Neighbour                                     | The line                                                                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **The `description`** (`PRD-0001`)            | Description says _what it is_, in a paragraph, above the fold. The review says _what it is like to own_, at length                            |
| **User reviews** (`I71`)                      | The crowd's opinion, unverified and labelled so. The editorial is the platform's own, attributed and dated. Neither is a version of the other |
| **The price table**                           | The review may cite a price band; it must not restate prices, which move weekly while the prose does not                                      |
| **Advertising** (`PRD-0005` v1.4, `PRD-0006`) | §8                                                                                                                                            |
| **Ordering and ranking** (`I62`, `I63`)       | Untouched by this document, and §9.2 is where that could change                                                                               |

## 8. Integrity — the rule this document exists to protect

**An editorial judgement is not purchasable, in any form, by anyone.**

Concretely, and stated as prohibitions because that is how this rule survives
contact with a commercial conversation:

- No payment, commission rate, or partnership status may influence a score, a
  verdict, or whether a review is written at all.
- A review must not be withheld from a product because its judgement would be
  unwelcome, nor written for a product because a partner asked.
- Advertising is permitted only in the three named regions the Frozen PRDs
  allow, and the surface labels it _Reklam_. **An editorial review is not one of
  those regions and must never become one.**
- Where the platform earns a commission on a handoff from a page carrying a
  review — which is every such page — that relationship is disclosed on the
  page.

The reason to write this into a PRD rather than to rely on good intentions: the
pressure to breach it does not arrive as a proposal to sell reviews. It arrives
as a reasonable-sounding request from a partner who buys placement, months from
now, addressed to somebody who was not in this conversation.

> **Owner endorsement, 2026-09-07:** _"İleride iş biriminden gelecek 'sponsorlu
> inceleme' taleplerini bugünden duvara toslatacak o katı yasak listesini tam
> destekliyorum. Editör yargısı ile reklam yerleşimi arasına çekilen bu çizgi
> platformun güvenilirliği için esnetilemez."_
>
> Recorded here rather than in the Draft Note, because this is the paragraph a
> future request will be measured against and the endorsement should be found by
> whoever is measuring it.

## 9. Open — the Owner's decisions

### 9.1 What a review attaches to — **Decided: the `productKey`**

Decided by the Owner on 2026-09-07 and recorded in **§6.1**, with the two
obligations that follow from it. The remaining questions in this section are
product choices; this was the one with architectural weight.

### 9.2 Does the editorial score affect ordering anywhere?

Today ordering is the platform's own arrangement of offers, and no editorial
input reaches it.

If the score influenced position, the editorial team would hold a distribution
lever, and §8's rule would immediately become harder to keep — because the value
of a good score would no longer be reputational.

**This draft recommends no for the first version**, and recommends that the
question be reopened only with §8 in front of whoever reopens it.

### 9.3 Who writes them, and at what cadence? — **Decided: §13**

> **Owner decision, 2026-09-08:** reading and writing are built as one
> architecture. Entering reviews by hand while the read side was built would
> _"aylardır kurduğumuz veri bütünlüğü, denetim izi (audit trail) ve yazar
> kimliği kurallarını baypas etmektir"_.

The question is kept with its answer, in the pattern §9.1 set. **§13 defines the
authoring surface**; the cadence half is answered there too, and answered by
making staleness visible rather than by inventing an interval — §13.7.

### 9.4 The video

The prototype draws a video placeholder. The platform has **no media pipeline
and no object storage** — the same constraint that produced the Owner's V1
decision to hotlink partner images rather than store copies. A video is
substantially heavier than a photograph, so this is a real decision and not a
small one.

Options: omit video entirely in the first version; embed from a third-party
host; or open the storage question properly.

### 9.5 Must a product have a review to be listed?

**No** is the only workable answer at launch — a catalogue that waits for prose
does not launch — but it should be recorded rather than assumed, along with what
the page shows in its absence. A tab that opens onto nothing is worse than a tab
that is not there.

## 10. Related documents

- `PRD-0001-offering.md` **Frozen v4.3** — the Offering; `productKey` §5.12 and
  **§5.12.4**, which names the editorial review as the one thing the key
  carries; §4 as amended; §8.2, which lists the review among what an Offering
  Presentation may carry; and **§4.1**, the recorded defect this document is
  deliberately not waiting on (see §12).
- `PRD-0002-discovery.md` — Discovery surfaces and ordering.
- `PRD-0006-platform.md` **Frozen v2.6** — §22 the Admin audit trail and §22.2's
  exhaustive list, which §14 amends; §22.5 the reading exclusion, which applies
  to an editorial writer unchanged; §23 personal data, which §13.2 follows.
- `PRD-0008-sub-admin-tier.md` Draft — §4 excludes a third tier, which is why
  §13.1 reserves authoring to the platform administrator rather than inventing
  an editor role here.
- `PRD-0005-business.md` **Frozen v1.4**, `PRD-0006-platform.md` **Frozen
  v2.6** — advertising permitted in three named regions and nowhere else, which
  §8 relies on.
- `prototype/src/components/product/EditorialReview.tsx` and
  `prototype/src/lib/types.ts` — the drawn surface and its shape.

## 11. What approving this document would require

- ~~A decision on §9.1 first.~~ **Taken 2026-09-07** (§6.1).
- ~~A `PRD-0001` revision recording that the `productKey` carries an editorial
  review.~~ **Done: `PRD-0001` Frozen v4.3 §5.12.4, 2026-09-07.**
- **A `PRD-0006` revision adding the editorial acts to §22.2.** Opened by this
  revision; the exact amendment is in §14. This document is blocked on it, and
  the block is the point rather than an inconvenience.
- `UX-0003-offering-detail.md` — a superseding revision, for the tab and its
  empty state.
- A Feature allocation, which has not been made. The review is product-level
  material on an Offering surface, so which registry it belongs to is a real
  question and is answered when the Stories are commissioned, not here.
- A Feature and Story in whichever domain §9.1 places the review.
- If §9.1 chooses the Product entity, a `PRD-0001` revision that reopens §4.

## 12. The crowd review surface is not this document's dependency

`PRD-0001` **Frozen v4.3 §4.1** records a defect found while amending §4: the
crowd review surface built in `I71` is in use and no document owns its
behaviour. The Owner deferred it on 2026-09-07 to a separate V1.1 discussion,
explicitly so that it does not block this chain.

**That deferral is safe in one direction and would not be in the other**, and
the reason belongs here rather than in the deferral:

- This document depends on nothing the crowd surface owns. §5.2 keeps the two
  scores apart — `0–10` formed by a person, `0–5` derived from the crowd — and
  §7 keeps the two kinds of writing apart. Whatever is decided about who may
  write a crowd review changes nothing above.
- The reverse is not true. Whoever writes the crowd surface's rules will find
  this document already occupying the product page and already holding the
  `0–10` scale, and **must not resolve their questions by reaching into it**.
  In particular, merging the two scores would be a revision of §5.2, taken as
  such, and not a presentation decision.

Stated now, while both are open, because it is the kind of boundary that is
cheap to write and expensive to reconstruct once one side has shipped.

## 13. Writing a review — the authoring surface

The Owner's three reasons for building this before the read side, recorded
because they shape every rule below:

- **Operator intervention.** Reviews entered by hand — raw SQL, a script —
  bypass the data-integrity, audit-trail and author-identity rules this
  repository spent months building. A path that bypasses them is not a
  temporary convenience; it is the path somebody uses again.
- **Blind schema design.** A read model built without knowing what writing
  constrains gets refactored the day writing arrives.
- **Boundaries are tested by opposites.** A reading surface designed with no
  writing surface beside it has boundaries nobody has pushed on.

### 13.1 Who may write

**The platform administrator.**

Not an editor tier, and the omission is deliberate. An "Editor" is a third
authorization tier, and `PRD-0008` §4 excludes exactly that from its own scope:
one additional tier with a fixed act set, not a permission system. Inventing a
second one here — in a document about content — would settle an authorization
question in the wrong place, and settle it where no reviewer of authorization
would look for it.

**This is a real operational limit and it is stated rather than smoothed over.**
One person writing every review does not scale, and the moment it stops being
tolerable is the moment an editor tier is worth designing. That belongs in a
`PRD-0008` successor, with the trail question answered alongside it — an editor
who may write reviews is an Admin whose acts are recorded and who still may not
read the trail (`PRD-0006` §22.5).

### 13.2 The byline is not the account

`§5` gives a review an **author**, and the prototype fills it with _"Editör
ekibi"_ — a voice, not a person.

**Two different facts, and they must not be collapsed:**

|             | The byline                                            | The acting account                              |
| ----------- | ----------------------------------------------------- | ----------------------------------------------- |
| What it is  | Published content: whose judgement this is offered as | Accountability: which account performed the act |
| Who sees it | Every reader                                          | The platform administrator, in the audit trail  |
| Governed by | §8, like every other part of the review               | `PRD-0006` §22                                  |

A byline may be a team, a pen name, or a person's name where that is a
deliberate editorial choice. It is **not** derived from the account that typed
it, and the account is **not** published. This is the same separation §23 draws
for personal data: what is shown and what is recorded answer different
questions, and deriving one from the other collapses both.

### 13.3 A review is written before it is presented

```text
Draft      → written, revisable, presented nowhere
Published  → presented wherever §8.2 of PRD-0001 carries it
Withdrawn  → presented nowhere; the record that it existed remains
```

**Withdrawal exists so that removal is not a database operation.** A published
judgement that turns out to be wrong has to be removable by the surface that
published it. Without withdrawal the only remedy is an operator editing rows —
the first of the three risks above, arriving through the back door of the very
document written to close it.

**Withdrawal is not deletion.** The review stops being presented; that it
existed, and who withdrew it, stays in the trail. A judgement the platform
published and then made vanish without trace is the one shape §8's integrity
cannot survive.

### 13.4 Saving is not re-checking

**`updatedAt` changes only by a deliberate act, never as a side effect of
saving.**

This is the rule the whole of §5.1 depends on, and it is easy to lose. If every
save moved the date, "last re-checked" would come to mean "last touched" — a
typo fix would present as a fresh verification, and the date a reader is invited
to trust would be the least trustworthy thing on the page.

So:

- **`publishedAt`** is set once, when a review is first published, and never
  again.
- **`updatedAt`** is set when a published review is republished **and the
  writer states that it has been re-checked**. It is a separate act from saving
  and the surface asks for it separately.
- A **Draft** edit moves neither date. Nothing is being claimed to a reader yet.

A writer who fixes a comma and does not claim a re-check leaves the date alone,
and the page keeps telling the truth about its own age.

### 13.5 What the surface accepts

Bounded, because an unbounded field is a page nobody can lay out and a limit
discovered in production is a limit somebody hit:

| Part          | Rule                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Verdict       | One line. Required to publish                                                                          |
| Score         | `0`–`10`, one decimal. Required to publish                                                             |
| Sections      | Each a heading and a body; at least one required to publish                                            |
| Pros, Cons    | Lists; **at least one of each required to publish** (§5: a review with no cons is an advertisement)    |
| Author byline | Required to publish (§5: an unattributed judgement is a claim nobody stands behind)                    |
| Product Key   | Required, and existing. A review of a key the catalogue has never carried is a judgement about nothing |

The exact numeric limits are an engineering concern and belong in the Story, not
here. What this section fixes is **which parts a review may not be published
without**, and every one of them is a rule §5 already gives a reason for.

**One review per Product Key** (§3). A second is a revision of the first, not a
second review.

### 13.6 What the surface cannot express

**There is no field, flag, note or state on this surface by which a commercial
relationship can reach a review.** No sponsor, no partner association, no
"promoted", no reason code that could carry one.

§8 is a prohibition, and a prohibition is only as good as the shapes that can
carry a violation. A surface with nowhere to put a sponsorship makes §8
structural instead of aspirational — the request arrives and there is no field
to satisfy it, which is a far better answer than a policy somebody has to
remember.

### 13.7 Cadence — made visible rather than enforced

§5.1 makes the revision date a requirement and sets no interval. This revision
does not set one either, and the reason is that an interval nobody keeps is
worse than none: it turns a real claim into a missed target and teaches everyone
to ignore both.

**What the surface does instead is show the age.** The Admin list of reviews
presents, for each, how long since it was last re-checked, so that a review
ageing past usefulness is visible to the person who could re-check it rather
than only to a reader who will not.

If the Owner later sets an interval, it belongs here as a revision — and it will
be a policy with a number, taken deliberately, rather than a default nobody
chose.

### 13.8 Every write is recorded

Creating, publishing, revising, re-checking and withdrawing a review are each
acts by which an Admin changes something, and `PRD-0006` §22.2's first sentence
puts every such act in the trail. §14 is the amendment that makes that true
rather than assumed.

Reading a review — by an Admin or by anyone else — records nothing. It is
published content.

## 14. What this document needs from `PRD-0006`

**`PRD-0006` §22.2 must gain a row before this document is frozen.** Its list is
exhaustive by its own statement, so an editorial act that is not on it is an act
the platform promises not to record — while §22.2's opening sentence promises
the opposite. Two sentences of one Frozen document would disagree.

The amendment is small and is stated here so that the second candidate is
mechanical rather than a fresh design:

> | Publishing, revising, re-checking and withdrawing an editorial review
> (`PRD-0009` §13) | They change what the platform says in its own voice about a
> product, on a page that earns a commission. `PRD-0009` §8 makes the judgement
> unpurchasable; the trail is what makes it answerable |

Nothing else in `PRD-0006` changes. §22.5's exclusion, §22.3's append-only
enforcement and §23's personal-data rule all apply to these acts unchanged and
need no amendment to do so.

**Freeze order:** `PRD-0006` v2.7, then this document, then the registry's
authoring Feature, then the Story. The reverse order would freeze a document
whose own dependency is still a Draft — the defect the `PRD-0001` §5.12 round
was spent avoiding.

> **Closed on freezing, 2026-09-08.** `PRD-0006` reached **Frozen v2.7** first
> and carries the row above verbatim; this document was frozen second. The
> requirement is stated above in the present tense and is left that way, because
> what a document required at the time is part of what it records. Steps three
> and four of the order — the registry's authoring Feature and the Story — were
> commissioned in the same decision.
