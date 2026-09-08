# PRD-0001 — Offering

> **Freeze Note (4.3):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07. This exact version must not be edited in place; a further
> change requires a controlled superseding revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v4.2 is preserved unchanged at
> `PRD-0001-offering-v4.2-superseded.md`.
>
> **Approval Note (4.3):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-07 — _"PRD-0001 v4.3 taslağını resmi olarak
> onaylıyorum."_ Approval and Freeze were taken in one decision. He recorded his
> reason for §5.12.4's shape in the same message: allocating the key's capacity
> to `PRD-0009`'s editorial review alone, rather than opening a broad
> "product data" category, is what prevents later leakage into it.
>
> **Commission Note (4.3):** In the same decision the Owner took §4.1's recorded
> defect — the crowd review surface built in `I71` with no behaviour owner — and
> **deferred it deliberately rather than leaving it unanswered**: it is to be
> closed under V1.1 as a separate discussion, immediately after the editorial
> review chain completes, and it must not block that chain. §4.1 stands as
> written; nothing about it is resolved by this Freeze.
>
> **Revision Note (4.3):** Superseding revision of Frozen v4.2, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7. Raised by the Owner's
> decision of 2026-09-07 in `PRD-0009` §6.1, and **required by it**: that
> decision attaches an editorial review to the Product Key, and this document
> currently says the Product Key is a matching hint and nothing more. Two Frozen
> documents describing the same value differently is the defect this revision
> exists to prevent, which is why it comes first and `PRD-0009` waits.
>
> **One change of substance: §5.12 says what the Product Key may carry.**
> §4's restated exclusion is amended to match, because an exclusion list that
> contradicts a section of the same document is worse than either statement
> alone.
>
> **A second thing this revision does is name a defect it does not fix.** While
> checking §4 against reality, the crowd review surface built in `I71` was found
> to have no behaviour owner at all, and to be excluded by the same §4 line this
> revision amends. It is recorded in §4.1 the way `traceability.md` v2.2 §5C.2
> recorded its three: named, with the action it needs, and not quietly folded
> into a section that does not cover it.
>
> No lifecycle state, eligibility composition, publication minimum, moderation
> rule, Capability, Feature or ownership boundary changes. §6.1.1's Universal
> Publication Minimum is **not** extended: an Offering needs no Product Key to
> publish, and a Product Key needs no review to exist.

> **Freeze Note (4.2):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-05. This exact version must not be edited in place; a further
> change requires a controlled superseding revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v4.1 is preserved unchanged at
> `PRD-0001-offering-v4.1-superseded.md`.
>
> **Approval Note (4.2):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-05 — _"PRD-0001 v4.2-candidate taslağını resmi
> olarak onaylıyorum. Bu belgeyi dondurup (Freeze) platformun yetkili belgesi
> kılabilir ve v4.1 sürümünü `-superseded` olarak arşive kaldırabilirsin."_
> Approval and Freeze were taken in one decision, and this note records both.
>
> **Revision Note (4.2):** Superseding revision of Frozen v4.1, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7 and raised by
> implementation in `I89` rather than by a change of product intent: the code
> that the Owner's decision of 2026-09-05 required could not be written under
> v4.1, and was held until this document was approved.
>
> **One change: §5.11.1 says what an intake may touch, and it is no longer
> answered by Source alone.**
>
> ## The decision, and why v4.1 cannot carry it
>
> The Owner, 2026-09-05: _"feed entegrasyonu bizim titizlikle içeri aktardığımız
> (import) ve zenginleştirdiğimiz katalogda kafasına göre yeni ilan
> oluşturmamalı veya bizim kapattığımız ilanları diriltmemeli. Feed'in görevi
> yalnızca eşleşen ve yayında olan ilanların fiyat ve stok durumunu (price &
> stock updates) güncellemektir."_
>
> The catalogue is now built by file import and enriched by hand — Category,
> field values, affiliate address, pictures — and a partner's feed is used for
> the one thing it is genuinely good at: what a price is today and whether the
> thing is in stock. That is a **narrowing** of what an intake may do in every
> respect but one: the listing it updates was not created by an intake, so its
> Source is not Feed.
>
> v4.1 §5.11.1 answers "what may an intake touch?" with "an Offering whose
> Source is Feed". Under the Owner's model no such Offering will ever be
> created again, so the sentence permits an intake to maintain exactly the
> listings that no longer arrive, and forbids it to maintain the ones that do.
> The rule has become the opposite of its own purpose, which is why it is
> changed here rather than worked around in an implementation.
>
> ## What replaces it, and what is kept
>
> The boundary moves from **provenance** to an **explicit link**, and everything
> the old boundary protected is protected by the new one:
>
> | v4.1 protected                              | v4.2 keeps it by                                                                                                                                                                             |
> | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | An Admin's typed correction                 | An intake may write **price and stock state only**. Title, summary, Category, Product Key and every other field are outside what it may touch, whatever it is linked to.                     |
> | A Business owner's authoring                | A link is established by one explicit match rule against a **Published** listing and only where the match is unambiguous; nothing is linked by inference and nothing is created.             |
> | "An intake may only update what it created" | An intake may only update **what it is linked to**, and a listing holds at most one link. What it may do to that listing is now strictly smaller than what v4.1 allowed it to do to its own. |
>
> ## What it does not change
>
> - **no lifecycle state, transition or rule changes.** §6 is untouched, and an
>   intake may now reach **no** lifecycle state at all: it may not create,
>   publish, hide, retire or restore anything;
> - §7.1's composition and §7.2's three inputs are unchanged;
> - the Universal Publication Minimum is unchanged;
> - Source keeps its meaning as provenance and §5.11.2 stands: it still confers
>   no authority. This revision **stops** an authority being read out of it.

> **Freeze Note (4.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-03, together with `PRD-0006-platform.md` v2.5 — the two were
> approved in one decision and freezing one without the other would leave §21.5
> and §11.6 resting on a revision that is not authoritative. This exact version
> must not be edited in place; a further change requires a controlled revision
> under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v4.0 is preserved unchanged at
> `PRD-0001-offering-v4.0-superseded.md`.
>
> **Approval Note (4.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-03 — _"Yaşam döngüsüne (`Archived` veya
> `Hidden`) dokunmadan, tamamen otomatik ve geri alınabilir bir 'yayından
> çekme' (Intake Availability Input) durumu icat etmen en temiz çözüm oldu…
> Hazırladığın PRD-0001 v4.1 ve PRD-0006 v2.5 taslaklarını resmi olarak
> onaylıyorum."_ This Approval Note records that approval and Freeze were
> separate decisions taken on the same day.
>
> **Revision Note (4.1):** Superseding revision of Frozen v4.0, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7.
>
> **One change: §7.2 admits a third final-eligibility input, and §5.11 says who
> may set it.** It exists because a decision the Owner took on 2026-09-03 cannot
> be implemented without it.
>
> ## The decision, and why v4.0 cannot carry it
>
> The Owner set the rule for a product that disappears from a partner's feed:
> _"Ürün feed'den düştüğünde derhal emekliye ayrılmasın. Bunun yerine 3 ardışık
> gün (72 saat) boyunca 'stokta yok' durumuna çekilsin. Bu tolerans süresinin
> sonunda hala feed'de yoksa, sistem ürünü otomatik olarak yayından
> kaldırsın."_ His stated reason is the one that shapes this revision: a single
> API outage or one bad partner sync must not delete a catalogue.
>
> The first half needs nothing new — an out-of-stock state is a plain update and
> §5.11.1 already permits one. **The second half has nowhere to go.**
>
> | Candidate  | Why it fails                                                                                                                                                                                                                                                                       |
> | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `Archived` | §6.5: no V1 transition exists out of it, and FR-17 makes it irreversible. A three-day partner outage would permanently destroy their catalogue — **the exact outcome the tolerance exists to prevent**.                                                                            |
> | `Hidden`   | §7.2 makes it the outcome of an Admin's _Hide Offering_ action, and FR-15 reserves the restore to an Admin. An intake producing Hidden would be an intake performing a moderation action, and a partner coming back would leave an Admin restoring four thousand listings by hand. |
> | `Draft`    | §6.5: no transition exists from Published back to Draft, and §6.2 says an edit "does not silently move the Offering to Draft".                                                                                                                                                     |
>
> **The shape that fits already exists in this document and is not a lifecycle
> state.** §7.3 lets a Business restriction make a lifecycle-Published Offering
> publicly ineligible _without changing its lifecycle state_ — reversible,
> automatic, and invisible to the lifecycle. That is precisely what withdrawing
> a vanished feed product needs to be.
>
> §7.2 names **exactly two** inputs, and §7.1 forbids consumers recalculating
> the result. So a third input is a change to this document and cannot be made
> anywhere else. That is what this revision makes.
>
> ## What it does not change
>
> - **no lifecycle state, transition or rule changes.** §6 is untouched;
> - `Archived` stays irreversible and `Hidden` stays an Admin outcome;
> - the new input applies **only to an Offering whose Source is Feed**, and only
>   through the intake that created it — §5.11.1's boundary is unchanged and is
>   now stated twice rather than once;
> - a Business owner's authoring and an Admin's typed correction remain
>   untouchable by any intake;
> - `Initial Published At` is unaffected, because nothing here republishes.

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 4.2
- **Approval Date:** 2026-09-05
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-05
- **Frozen By:** Product Owner / Architecture Owner
- **Supersedes:** Frozen v4.1, preserved at `PRD-0001-offering-v4.1-superseded.md`
- **Raised by:** Implementation, `I89`, on the Owner's decision of 2026-09-05
- **Last Updated:** 2026-08-31
- **Scope level:** Product behaviour (non-technical)
- **Supersedes:** Frozen v3.1
- **Approved candidate:** In Review v4.0
- **Approval Date:** 2026-08-30
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-08-30
- **Frozen By:** Product Owner / Architecture Owner

> This document is the Single Information Owner of the universal Offering product model, Offering lifecycle, final Offering Public Eligibility, complete Offering Presentation behaviour, and the PRD-0001-owned portion of Handoff Enablement. It defines product behaviour only. It does not define APIs, database tables, frameworks, storage, security implementation, frontend components, backend architecture, validation algorithms, affiliate-network integration, analytics instrumentation, or infrastructure.

**Freeze Note (4.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-08-30. Frozen v4.0 is the locked PRD baseline for PRD-0001 — Offering and supersedes Frozen v3.1, which remains preserved in the historical notes below. This exact version must not be edited in place. Any future change requires a controlled superseding revision under `DOCUMENT_LIFECYCLE.md` §7 and §8, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (4.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-08-30. The revision was raised because the Owner's decisions of that date — affiliate first, price belonging to the Offering, a product-matching key, and an open Domain set — change what an Offering **is**, which is this document's subject. The datamodel waited for this document rather than the reverse.

**Revision Note (4.0):** Controlled superseding revision of Frozen v3.1. Adds §5.10 Offering Price, §5.11 Offering Source, and §5.12 Product Key. Lifts the V1 restriction of the Domain set to three. Restates §6.1.1 unchanged in substance, recording explicitly that the Universal Publication Minimum is **not** extended by Price, Source or Product Key. Extends §8.2's optional Presentation content and §10's Business Rules. No lifecycle state, eligibility composition, moderation rule, Capability, Feature, or ownership boundary changes. The revision introduces no Product entity, no Merchant entity, no payment or checkout, no price history or alerts, and no rating or seller score; the mechanism by which an amount is obtained remains an engineering concern governed by its own documents.

> **On the two absences of price.** The three Pricing Kinds in §5.10.1 exist because _On Request_ and _Unknown_ are different answers. The Owner named the case this document was about to lose: an Offering may genuinely have no price because the amount is settled after the Handoff, according to the service asked for. A single missing value would have reported a platform failure where none occurred. This is the distinction PRD-0002 §14 already draws between zero results and results unavailable, and PRD-0006 §14 between absent and unavailable.

**Freeze Note (3.1):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-21. Frozen v3.1 is the locked V1 PRD baseline for PRD-0001 — Offering. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (3.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, Final Review, package-level reconciliation, independent Claude audit, and all bounded audit corrections. Approved v3.1 supersedes Approved v2.1 and is the authoritative PRD baseline for PRD-0001 — Offering. This historical Approval Note records that approval and Freeze were separate decisions. The PRD was subsequently Frozen on 2026-07-21. No UX, User Story, traceability, or GitHub file changes automatically.

**Revision Note (3.1):** Controlled Claude-audit correction for finding A-04. Defines one authoritative `Universal Publication Minimum`, separates Business Moderation Status and authorization as distinct transition/edit availability gates, and applies the same term consistently in lifecycle rules, Business Rules, and Functional Requirements. No product scope, lifecycle state, eligibility composition, Capability, Feature, or ownership boundary changes.

**Revision Note (3.0):** Controlled post-approval Freeze-correction candidate applying Owner Decisions P-02, P-03, P-04, and P-05. Preserves the existing universal Offering, lifecycle, public-eligibility, Presentation, Affiliate Destination, and Handoff Enablement ownership architecture while adding edit-time publication invariants, Business-display-name dependency, Attribute value-kind meaning, Attribute mutation-safety consumption, Category historical-retirement rules, V1 Domain derivation, immutable `Initial Published At`, bounded `Offering Presentation Open`, public Business identity wording, and Archived Affiliate Destination view-only behaviour. Removes stale In Review wording from the 2.1 historical note. Status remains In Review v3.0. Approved v2.1 remains authoritative until explicit approval.

**Approval Note (2.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER APPROVAL`. Approved v2.1 supersedes Approved v1.1 and becomes the authoritative product-behaviour source for the universal Offering model, lifecycle, retirement, Admin Hide/Restore outcomes, final Offering Public Eligibility composition, complete Offering Presentation, Category and Attribute ownership boundaries, and PRD-0001-owned Handoff Enablement behaviour. This approval does not freeze the PRD, allocate Feature IDs, resolve F02, modify the Offering Capability Architecture, revise downstream documents, or update GitHub automatically.

**Revision Note (2.1):** Controlled correction revision following the v2.0 Architecture Review. Defines the minimum product conditions for Draft → Published and defines the V1 product meaning of Valid and Invalid Affiliate Destination validation results. Adds `required for publication` to the PRD-0006-owned Attribute-definition property set. No architecture, ownership, lifecycle, eligibility composition, Capability, Feature, or role boundary changes. This sentence records the historical In Review v2.1 candidate state.

**Revision Note (2.0):** Controlled superseding revision of Approved v1.1. Removes stale Favorites and Identity-dashboard references; adds the applicable Accepted ADR references; defines Offering Presentation behaviour and its product minimum; completes Draft, Published, Hidden, and Archived behaviour and transitions; records owner retirement and Admin Hide/Restore authority; defines final Offering Public Eligibility composition; defines the Affiliate Destination product model, status, validation result, administration outcomes, and Affiliate Destination Handoff Eligibility under Accepted ADR-0006 and ADR-0008; preserves PRD-0005 and PRD-0006 supporting boundaries; clarifies Category and Attribute ownership; uses only the V1 domain names Mobility, Real Estate, and Technology; and removes the v1.1 lifecycle TODOs. Approved v2.1 supersedes Approved v1.1 and is authoritative from 2026-07-21. It is not Frozen; Freeze requires a separate Product Owner / Architecture Owner decision.

---

## 1. Purpose

Define the universal Offering model used across the platform.

Every item that can be publicly discovered and evaluated through the platform is represented as an **Offering**, regardless of V1 domain.

The Offering model provides the shared product object through which:

- Categories organize;
- Attributes describe;
- Discovery finds;
- Presentation displays;
- Compare analyses;
- Decision behaviour consumes;
- Businesses publish and manage;
- Platform moderation applies approved target-owned outcomes.

This PRD owns Offering behaviour. It references, and does not redefine, the behaviour owned by Identity, Discovery, Decision, Business, or Platform.

---

## 2. Business Value

The Offering model exists so the platform can support multiple industries without creating a separate product object for every domain.

It supports the Foundation by:

- preserving one universal product model;
- keeping cross-domain behaviour consistent;
- allowing Discovery and Compare to consume the same object;
- allowing Businesses to manage what they offer through one model;
- giving people a complete, understandable Offering presentation;
- separating public eligibility from lifecycle, Business restriction, and handoff eligibility;
- allowing the platform to add domains without redesigning its core product vocabulary.

V1 uses the same Offering model across:

- Mobility;
- Real Estate;
- Technology.

---

## 3. Scope

V1 Offering behaviour includes:

- the universal Offering definition;
- ownership of each Offering by exactly one Business;
- Category association and Attribute values;
- Offering creation and editing;
- Offering lifecycle states and transitions;
- owner-initiated retirement;
- Admin Hide and Restore outcomes;
- final Offering Public Eligibility;
- complete public Offering Presentation;
- Business-managed Affiliate Destination authoring and editing;
- Affiliate Destination status and validation meaning;
- Affiliate Destination Handoff Eligibility;
- authoritative outcomes consumed by Discovery, Decision, Business, and Platform;
- the V1 role boundaries that directly affect Offering behaviour.

This PRD covers product behaviour only.

---

## 4. Out of Scope

The following are outside PRD-0001:

- Search, Browse, Filter, Listing Card behaviour, result ordering, Zero Results, and Homepage entry behaviour — owned by `PRD-0002-discovery.md`;
- authentication, User Account status, Business-context access, Admin authorization, and access gates — owned by `PRD-0003-identity.md`;
- Compare, Decision Chat, Affiliate Handoff initiation, Direct Contact, and Completion — owned by `PRD-0004-decision.md`;
- Business Profile, Business Information, Business Moderation Status, Business Public Exposure Input, and Business Dashboard entry behaviour — owned by `PRD-0005-business.md`;
- Admin Panel, moderation cases, general moderation action surfaces, Affiliate Destination Administration action surfaces, Category management, Attribute-definition management, and Basic Analytics — owned by `PRD-0006-platform.md`;
- Listing Card product minimum and Listing Card layout;
- Favorites;
- Messaging;
- notifications, saved searches, history, watchlists, or engagement systems;
- payment, transaction, logistics, credit application, insurance sale, commission, settlement, and attribution behaviour;
- affiliate-network integration or external conversion tracking;
- technical validation, URL safety implementation, API, storage, database, security, caching, routing, event, frontend, backend, and infrastructure design;
- V2 or explicitly excluded behaviour in `V1_SCOPE.md`.

Restated for v4.0, which introduces price without introducing any of these:

- a Product entity, Product ownership, or a Product lifecycle. §5.12 defines a **key** that groups Offerings and, since v4.3, may carry product-level material named there; it defines no record that is created, owned, edited or retired as a thing in its own right, and §5.12.4 states plainly what that distinction does and does not survive;
- a Merchant or seller entity distinct from Business;
- basket, checkout, or order;
- price history, price alerts, or price trend presentation;
- a seller score, and any aggregate rating treated as a property of the Offering or of the Business. **The editorial review of §5.12.4 is not excluded here**; it is not a property of any Offering, which is the whole reason it hangs on the key. See §4.1 for what this line covered when it was written and what it was found to be excluding in fact;
- the mechanism by which an amount is obtained — feeds, merchant APIs and any other intake are engineering concerns governed by their own documents.

### 4.1 Recorded, not resolved: the crowd review surface has no behaviour owner

The line above read _"rating, review, or seller score"_ from v4.0 until this
revision. Checking it against the repository while amending it turned up
something the line was not written to say.

**`I71` built a review surface, and it is in use.** `traceability.md` records it
as completing `OFR F05` Offering Presentation — a Feature this document owns —
and no section of this document, or of any other PRD, defines it. §8.2's
Presentation list does not include it. So the platform has a surface that
collects and shows what people write about a product, and its behaviour rests on
no authoritative document at all.

That is the same defect `traceability.md` v2.2 §5C.2 named for the audit trail,
the personal-data rule and feed management: **built, in use, and
Frozen-document-less.** All three were commissioned and closed. This one was not
found at the time because nobody was reading §4's exclusion list against the
running platform.

**It is named here and not fixed here**, for the reason §2 of the traceability
document gives about itself: writing the behaviour into this revision would
confer ownership by drafting rather than by decision, and what a crowd review is
— who may write one, what moderates it, whether it survives the Offering it was
written under, how it relates to the score `PRD-0002` already orders by — is a
product decision with several defensible answers.

**What it needs:** an Owner decision on where it belongs, then a section in the
document that takes it, and a Story. Until then this revision narrows §4's line
to what the platform actually excludes rather than leaving a Frozen document
forbidding something it ships.

---

## 5. Core Concepts and Ownership

### 5.1 Offering

An **Offering** is the universal product object representing something a Business makes available for people to discover and evaluate.

Every Offering:

- belongs to exactly one Business;
- is organized by one Category in V1;
- may carry Attribute values applicable to its Category;
- has one Offering lifecycle state;
- produces one final Offering Public Eligibility result;
- may have zero or one Affiliate Destination in V1.

### 5.2 Business

A **Business** is a profile managed through an authorized User Account context.

`PRD-0005-business.md` owns:

- Business Profile and Business Information;
- Business Moderation Status;
- Business Public Exposure Input;
- Business Dashboard and management-entry behaviour.

PRD-0001 consumes those results and does not redefine them.

### 5.3 Category

A governed hierarchy used for Offering assignment, Discovery, applicable Attribute definitions, and Domain derivation.

Product rules:

- an Offering is assigned to exactly one active leaf Category;
- a Category may have zero or one parent;
- a Category with no parent is a root Category;
- every root Category is assigned to exactly one Domain at creation;
- a Domain is a governed record and **the set is open**, extended by Platform administration. `Mobility`, `Real Estate` and `Technology` were the first three, not the whole set;
- every child Category inherits the Domain of its root Category;
- an Offering derives its Domain from its active leaf Category;
- Category reparenting is permitted only within the same Domain in V1;
- a root Category Domain assignment cannot change after any child Category or Offering exists beneath it;
- a Category may retire only when no Draft, Published, or Hidden Offering remains assigned and no active child remains;
- Archived Offerings may retain historical Category association;
- a retired Category cannot receive new Offering assignments or appear as an active Browse destination;
- a retired Category remains renderable in historical records.

`PRD-0006-platform.md` owns Category definition-management actions.

PRD-0001 owns the meaning of Offering assignment, historical association, and Offering Domain derivation.

### 5.4 Attribute

A governed definition describing Offering information.

Every V1 Attribute definition includes:

- a non-empty display name;
- one value kind;
- applicable Categories;
- `required for publication`;
- `filterable`;
- `comparable`.

Approved V1 value kinds:

```text
Text
Number
Boolean
Single Select
Multi Select
```

Value meaning:

- Text stores one authored textual value;
- Number stores one numeric value and may use one governed unit label defined by the Attribute;
- Boolean stores one true/false value;
- Single Select stores exactly one value from the governed allowed-value set;
- Multi Select stores zero or more values from the governed allowed-value set.

Single Select and Multi Select require governed allowed values.

`PRD-0006-platform.md` owns Attribute-definition management, including the value kind, unit label, allowed values, Category applicability, and usage flags.

PRD-0001 owns the meaning and authoring of Offering Attribute values.

Text is not filterable in V1.

Definition changes may not silently delete existing Offering values or invalidate Published or Hidden Offerings. The approved mutation-safety rules are enforced through PRD-0006 by reference.

### 5.5 Offering lifecycle state

The Offering lifecycle state is one of:

```text
Draft
Published
Hidden
Archived
```

### 5.6 Final Offering Public Eligibility

The authoritative Offering-level result indicating whether an Offering may participate in public product experiences.

Values:

```text
Eligible
Ineligible
```

### 5.7 Offering Presentation

The product behaviour by which a complete, publicly eligible Offering is presented to a viewer.

It realizes the Presentation capability and `F05 — Full Offering Detail Presentation`.

### 5.8 Affiliate Destination

An **Affiliate Destination** is the Offering-associated external destination that may later be used by Decision for a person-facing Affiliate Handoff.

Each Affiliate Destination:

- belongs to exactly one Offering;
- is managed as a distinct object from the Offering;
- has one destination status;
- has one validation result;
- produces one Affiliate Destination Handoff Eligibility result.

### 5.9 Handoff Enablement

**Handoff Enablement** is the Capability authorized by Accepted ADR-0008.

PRD-0001 is its sole behaviour owner.

PRD-0005 and PRD-0006 participate only through supporting relationships.

### 5.10 Offering Price

#### 5.10.1 Pricing Kind is the fact; the amount is a detail

An Offering states a **Pricing Kind**, and it is one of exactly three:

| Kind           | Meaning                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Fixed**      | The Offering has a stated amount.                                                                                                  |
| **On Request** | The Offering has no fixed amount **by its nature**. What it costs is determined after the Handoff, according to what is asked for. |
| **Unknown**    | The platform does not currently know what it costs.                                                                                |

**These are three different answers and the product must never show one as another.**

_On Request_ is a property of **the Offering**: a consultancy, a repair service, a bespoke installation genuinely has no price until the work is specified. Showing such an Offering as "price unknown" tells a person the platform has failed, when nothing has failed.

_Unknown_ is a property of **the platform's knowledge**: a source did not carry a price, a reading has not happened yet, a source went quiet. It is a temporary state and it is honest to say so.

#### 5.10.2 Price is never required

Pricing Kind is required; **an amount is not**. No Pricing Kind blocks publication, and §6.1.1 is not extended by this section. An Offering priced _On Request_ is as publishable as one priced at a stated amount.

#### 5.10.3 What a price carries

When Pricing Kind is _Fixed_, the Offering carries:

- an **amount**, in minor-unit precision;
- a **currency**;
- the **instant the amount was last established**.

**A price without an instant is not a price.** It is a claim about the present that the platform cannot keep, and the surface that shows it must be able to say when it was true. This is the same rule §9.4 applies to a Destination's validation result.

The Offering may additionally carry:

- a **prior amount**, so a reduction can be shown;
- a **delivery cost**, where delivery is a separable charge;
- a **stock state**: _In Stock_, _Out of Stock_, or _Unknown_.

#### 5.10.4 A reduction is derived, never stored

Where a prior amount is present and exceeds the current amount, the difference may be presented as a reduction. **The percentage is computed at presentation and never stored**: a stored percentage is a second copy of a fact that can disagree with the two amounts it came from.

Where no prior amount is present, **no reduction is claimed**. The platform does not invent a "was" price.

#### 5.10.5 Ordering by price

Where a surface orders Offerings by price, it orders on **the amount a person would pay**, including delivery cost where one is stated. Ordering on the amount alone while delivery differs makes the ordering wrong, and the ordering is the only thing a comparison offers.

Offerings that are not _Fixed_ have no position in a price ordering and are not silently placed at either end.

### 5.11 Offering Source

Every Offering records **how its record came to exist**:

| Source       | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| **Manual**   | Created by an Admin acting for the platform.            |
| **Feed**     | Created by an automated intake from an external source. |
| **Business** | Created by a Business owner in their own context.       |

#### 5.11.1 An intake may only update what it is linked to, and only its price and stock

An automated intake **creates no Offering.** It may **update the Price and the
Stock State** of an Offering it is **linked** to, and may change nothing else
about any Offering.

- **The link is the boundary.** An Offering carries at most one intake link.
  Without one, an intake has no way to name the Offering at all — the boundary
  is structural rather than a check an implementation performs.
- **A link is established once, explicitly, and only against a Published
  Offering.** The match rule is an engineering concern governed by its own
  documents; what this document fixes is that a link is made only where the
  match is **unambiguous**, and that an ambiguous or absent match links nothing
  and reports itself.
- **An intake may reach no lifecycle state.** It may not create, publish, hide,
  retire or restore an Offering, and it may not make a Draft live. An Offering
  that is not Published is not updated at all.
- **Everything else about an Offering is outside an intake.** Title, Summary,
  Category, Product Key, Presentation content, Affiliate Destination and every
  Attribute value are decisions made by a person. An intake that overwrote one
  would destroy a decision and leave no trace that it did.
- **An absent field is not an empty one.** A source document that says nothing
  about a price or a stock state has stated nothing, and an intake must leave
  what it does not carry alone rather than clearing it.

Source (§5.11) records provenance and no longer decides this: under v4.1 the
answer was "an Offering whose Source is Feed", which under the Owner's decision
of 2026-09-05 would permit an intake to maintain only the listings that are no
longer created and forbid it the ones that are.

#### 5.11.1a Intake Availability

An intake that maintains an Offering may record that **the source no longer
offers it**. This is the `Intake Availability Input` of §7.2 and it is the only
eligibility input an intake may set.

- it applies **only** to an Offering that intake is linked to, and only through
  that link. The boundary is §5.11.1's, restated here because this is the one
  place an intake touches something a person can see disappear;
- it is **reversible by the same intake**: a product that returns to the source
  is available again, without an Admin and without a lifecycle transition;
- it is **not a moderation outcome and not a retirement.** An Admin's Hide and
  an owner's retirement remain the only ways to reach `Hidden` and `Archived`,
  and an intake may reach neither;
- **a source that cannot be read says nothing.** An intake that failed to reach
  or parse its source has learned nothing about availability, and must not
  record absence on the strength of its own failure. This is the rule that makes
  the whole input safe, and it is the one an implementation would omit.

The tolerance before absence is recorded — how long a product may be missing
before it stops being published — is an operational setting outside this
document. What this document fixes is that the tolerance **exists**: absence on
a single reading is never enough.

#### 5.11.2 Source is not authority

Source records provenance. It does not grant or withhold any capability, does not affect final Offering Public Eligibility, and does not change moderation: a Feed Offering is moderated exactly as a Business one is.

### 5.12 Product Key

An Offering may carry a **Product Key** — a value identifying the product the Offering is an instance of, where such a value exists and is known.

#### 5.12.1 It groups Offerings, and it is not an identity for them

Offerings that share a Product Key **may be presented together**, so a person comparing the same product across Offerings sees one product with several Offerings rather than several unrelated results.

**A Product Key creates no entity that is owned, edited or retired.** There is no Product record with a lifecycle, no Product ownership, and no Offering rule that runs through one. Every rule in this document continues to be about the Offering.

**What changed in v4.3, stated here rather than only in §5.12.4:** until v4.2 this section could say the key carried nothing whatever, and it can no longer say that. It may carry material that is about the product rather than about any one Offering — today, the editorial review. The distinction that survives is between _grouping and carrying_ on one side and _ownership and lifecycle_ on the other; it is a real distinction and it is a narrower one than v4.2 held.

#### 5.12.2 Absence is not a defect

An Offering with no Product Key stands alone, and that is a complete and correct presentation. Most Offerings in most Domains will never have one — a property listing and a repair service have no product identifier and are not missing anything.

#### 5.12.3 The platform does not guess

Two Offerings are presented as the same product **only when they carry the same Product Key**. Similar titles, similar attributes and similar prices are not evidence, and grouping on them would put a person in front of a comparison the platform invented.

#### 5.12.4 What the Product Key may carry

A Product Key **may carry material that is about the product rather than about any one Offering**. Today there is exactly one such thing, and it is named rather than described by a category:

- the **editorial review**, whose behaviour is owned by `PRD-0009`.

Nothing else is admitted by this section. A second kind of material is a decision of the same weight as this one and gets it, not a consequence of this one.

**Why the review hangs here and could hang nowhere else.** A review is a judgement about a product that several Businesses sell. Copying it onto each of their Offerings would create three records that must agree and will not; attaching it to one of them would make one seller's listing the home of a judgement about all of them, and would delete the judgement when that seller withdrew. Neither is a presentation problem to be solved later; both are the record being in the wrong place.

**What this costs, recorded because the Owner insisted on recording it.** His decision of 2026-09-07 characterised it exactly:

> _"incelemeyi `productKey`'e bağlamak, PRD-0001'de kapıdan kovduğumuz 'Ürün' varlığını (Virtual Product Entity) bacadan içeri almaktır. … Bu yapısal sapmayı bilinçli olarak kabul ediyorum."_

Attaching material to the key admits through the chimney what §4 turned away at the door. He weighed that against the two alternatives above and judged them worse — a data-integrity fault rather than an architectural drift — and accepted the deviation knowingly.

**The obligation that follows is on whoever reads this next.** The failure mode of an accepted deviation is not the deviation; it is that three increments later nobody remembers it was one, and the next thing attached to the key arrives without a decision. That is why this section names one thing instead of opening a category, and why the paragraph above is here rather than in a changelog nobody opens.

**The Publication Minimum is untouched.** An Offering publishes with no Product Key, and a Product Key exists with no review. Neither is a gate on the other, and §6.1.1 is not extended by this section.

---

## 6. Offering Lifecycle

### 6.1 Draft

A Draft Offering:

- is being prepared by its owning Business;
- is not public;
- is not discoverable;
- cannot be opened through public Offering Presentation;
- cannot participate in Compare;
- cannot be selected by Decision Chat;
- cannot be used for Direct Contact;
- cannot be used for Affiliate Handoff;
- may be edited by its authorized Business owner;
- may be published only through the approved Draft → Published transition;
- may be retired by its Business owner to Archived.

### 6.1.1 Universal Publication Minimum

The `Universal Publication Minimum` is satisfied when the Offering has:

- a recognizable title or name;
- exactly one active leaf Category;
- a value for every Attribute required for publication in that Category;
- exactly one owning Business;
- an owning Business with a non-empty required Business display name.

Business authorization and Business Moderation Status are separate transition/edit availability gates.

They are not part of the Universal Publication Minimum.

**Price, Source and Product Key are not part of it either.** An Offering may be published with Pricing Kind _Unknown_ and no amount, with no Product Key, and with any Source.

> Recorded explicitly in v4.0 because "we have price now, so a published Offering should have one" is the obvious next step and it is wrong. It would make every service Offering unpublishable and every Offering awaiting its first price reading disappear.

### 6.2 Published

Draft → Published is available only when:

- the acting Business is authorized to manage the Offering;
- Business Moderation Status is `Unrestricted`;
- the Universal Publication Minimum is satisfied.

The first successful Draft → Published transition creates:

```text
Initial Published At
```

`Initial Published At` is immutable.

A visual, visual set, or long description is not universally required for publication in V1 because the universal Offering model spans domains with different presentation needs.

A Published Offering:

- has passed the Offering lifecycle publication transition;
- may be publicly eligible when all required eligibility inputs are eligible;
- may be presented publicly only when final Offering Public Eligibility is Eligible;
- may be edited by its authorized Business owner according to the PRD-0005 Business access rules;
- may be hidden by an authorized Admin;
- may be retired by its Business owner to Archived.

A Published edit may be saved only when:

- the Universal Publication Minimum remains satisfied; and
- the applicable PRD-0005 Business access gate permits the edit.

An invalid edit is rejected.

Editing does not change `Initial Published At` and does not silently move the Offering to Draft.

Business Moderation Status remains a separate edit-availability gate and is not part of the Universal Publication Minimum.

Published does not by itself guarantee public availability. Business restriction may make a lifecycle-Published Offering publicly ineligible without changing its lifecycle state.

### 6.3 Hidden

A Hidden Offering:

- is a Published Offering removed from public circulation by an authorized Admin;
- is not public;
- is not discoverable;
- cannot be opened through public Offering Presentation;
- cannot participate in Compare;
- cannot be selected by Decision Chat;
- cannot be used for Direct Contact;
- cannot be used for Affiliate Handoff;
- remains visible to its Business owner for management;
- may be edited by its Business owner only where the applicable PRD-0005 Business access gate permits the edit;
- cannot be returned to Published by the Business owner;
- may be restored only by an authorized Admin;
- may be retired by its Business owner to Archived.

A Hidden edit may be saved only when the Universal Publication Minimum remains satisfied.

An invalid edit is rejected.

Editing does not change `Initial Published At`.

Business Moderation Status remains a separate edit-availability gate and is not part of the Universal Publication Minimum.

Hidden → Published restore does not change `Initial Published At`.

### 6.4 Archived

An Archived Offering:

- is the result of owner-initiated retirement;
- is not public;
- is not discoverable;
- cannot be opened through public Offering Presentation;
- cannot participate in Compare;
- cannot be selected by Decision Chat;
- cannot be used for Direct Contact;
- cannot be used for Affiliate Handoff;
- may be viewed by its Business owner as a historical record;
- may be viewed by an authorized Admin as a historical record;
- retains its historical Category and Domain association;
- retains historical Attribute values;
- cannot be edited;
- cannot be restored in V1.

An Admin cannot archive an Offering in V1.

### 6.5 Approved transitions

```text
Create Offering
      ↓
    Draft
      │ Publish by authorized Business
      ▼
  Published
      │ Hide by authorized Admin
      ▼
    Hidden
      │ Restore by authorized Admin
      └────────────────────────────→ Published
```

Owner retirement:

```text
Draft     ─┐
Published ─┼─→ Archived
Hidden    ─┘
```

No V1 transition exists:

- from Archived to any other state;
- from Published back to Draft;
- from Hidden to Draft;
- through Admin Archive;
- through Business-owned Hidden → Published restore.

---

## 7. Final Offering Public Eligibility

### 7.1 Ownership

`PRD-0001` is the Single Information Owner of the final Offering Public Eligibility result.

The result is consumed by:

- `PRD-0002-discovery.md`;
- `PRD-0004-decision.md`;
- `PRD-0006-platform.md`.

Consumers must not recalculate it.

### 7.2 Authoritative inputs

V1 composition consumes:

1. Offering lifecycle state, owned here;
2. Business Public Exposure Input, owned by `PRD-0005-business.md`;
3. **Intake Availability Input**, owned here and set only as §5.11.1a permits.

The third input exists so that an automated intake can stop publishing a
product its source no longer offers **without reaching for a lifecycle state**.
Both lifecycle answers are wrong for it: `Archived` is irreversible (§6.5), so a
partner's outage would destroy their catalogue permanently, and `Hidden` is an
Admin's moderation outcome that only an Admin may undo (§7.2, FR-15). This input
is reversible, is set by the intake that owns the Offering, and changes no
lifecycle state — which is exactly what §7.3 already does for a Business
restriction.

The approved Offering moderation outcome is expressed through the Offering lifecycle:

- Hide Offering produces Hidden;
- Restore Offering produces Published.

V1 therefore does not create a separate Platform-owned Offering moderation eligibility state.

### 7.3 Composition

Lifecycle input:

```text
Published → Eligible
Draft     → Ineligible
Hidden    → Ineligible
Archived  → Ineligible
```

Business input:

```text
Business Moderation Status = Unrestricted
→ Business Public Exposure Input = Eligible

Business Moderation Status = Restricted
→ Business Public Exposure Input = Ineligible
```

Intake Availability input:

```text
The Offering has no intake link
→ Intake Availability Input = Eligible

The Offering has an intake link AND that intake has not recorded the source as
no longer offering it
→ Intake Availability Input = Eligible

The Offering has an intake link AND that intake has recorded the source as no
longer offering it
→ Intake Availability Input = Ineligible
```

Every Offering has this input and for almost every Offering it is `Eligible` by
construction: an Offering no intake maintains cannot be made unavailable by one.
v4.1 wrote `Source is Feed` where this writes `has an intake link`, and the two
said the same thing while an intake could only maintain what it created.

Final composition:

```text
Offering lifecycle input = Eligible
AND
Business Public Exposure Input = Eligible
AND
Intake Availability Input = Eligible
→ final Offering Public Eligibility = Eligible
```

All other combinations produce:

```text
final Offering Public Eligibility = Ineligible
```

### 7.4 Consequences

Only an Offering whose final result is Eligible may:

- appear in public Discovery;
- open through public Offering Presentation;
- participate in public Compare;
- be selected by Decision Chat;
- expose Direct Contact through the Decision owner;
- proceed to Affiliate Handoff when the separate Affiliate Destination result is also Eligible.

Business restriction and restoration do not change Offering lifecycle state.

When a Business returns to Unrestricted, only lifecycle-Published Offerings may regain final public eligibility.

---

## 8. Offering Presentation

### 8.1 Ownership and entry condition

PRD-0001 owns complete Offering Presentation behaviour.

Public Offering Presentation is available only when:

```text
final Offering Public Eligibility = Eligible
```

Discovery ends when the person opens the selected Offering. Presentation begins at that point.

### 8.2 Product minimum

A complete public Offering presentation must provide enough product information for a person to understand and evaluate the single Offering.

The product minimum includes:

- the Offering's recognizable title or name;
- the available primary visual or visual set authored for the Offering;
- the Offering's Category context;
- the available Offering description;
- the Offering's applicable Attribute values, organized into understandable groups;
- the PRD-0005-owned public Business identity set;
- the available action-entry set supplied by the applicable owning PRDs.

Protected telephone, email, and external website or contact URL information is not part of the public Business identity set and is not included merely because Offering Presentation is public.

Offering Presentation **may** additionally carry:

- the Pricing Kind, and where _Fixed_, the amount, currency and the instant it was established;
- the prior amount and the derived reduction, where a prior amount exists;
- the delivery cost and stock state, where stated;
- where a Product Key is present, the other Offerings sharing it, ordered by the amount a person would pay;
- where a Product Key is present **and an editorial review exists for it**, that review, whose behaviour is owned by `PRD-0009`. It is listed here because a reader takes this list as exhaustive, and a thing that appears on the page while absent from the list is how the defect §4.1 records came about.

**Each is present only when the underlying fact is.** The rule above stands: the Presentation does not invent what was not supplied.

The exact information architecture, visual hierarchy, component choice, responsive treatment, and interaction presentation are owned by `UX-0003-offering-detail.md`.

### 8.2.1 Offering Presentation Open

`Offering Presentation Open` occurs when:

- final Offering Public Eligibility is `Eligible`; and
- complete public Offering Presentation successfully begins.

Opening an owner/Admin management view does not create this occurrence.

`PRD-0006-platform.md` may consume this occurrence for Basic Analytics without redefining it.

### 8.3 Entries without behaviour ownership

Presentation may display entries to:

- Compare;
- Decision Chat;
- Direct Contact;
- Affiliate Handoff.

Displaying an entry does not transfer ownership of the action.

The owning PRD determines whether an entry is available and what happens after selection.

PRD-0001 does not:

- perform Compare;
- conduct Decision Chat;
- reveal Direct Contact information;
- initiate Affiliate Handoff;
- produce Completion.

### 8.4 Non-public management views

Business-owner and Admin access to Draft, Hidden, or Archived records is a management or historical-record experience.

It is not public Offering Presentation.

---

## 9. Affiliate Destination and Handoff Enablement

### 9.1 Cardinality and association

In V1, an Offering may have:

```text
zero or one Affiliate Destination
```

Each Affiliate Destination belongs to exactly one Offering and cannot be shared across Offerings.

Affiliate Destination authoring and editing act on the Affiliate Destination as a distinct associated object.

They are not `F01 — Offering Creation` or `F02 — Offering Editing`.

### 9.2 Business authoring

An authorized Business owner may:

- create an Affiliate Destination for an owned Draft, Published, or Hidden Offering where none exists;
- edit the Affiliate Destination associated with an owned Draft, Published, or Hidden Offering;
- view the historical Affiliate Destination associated with an Archived Offering;
- view its current status, validation result, and Handoff Eligibility through the approved management experience.

An Archived Offering and its associated Affiliate Destination are view-only.

Business management entry is supplied by `PRD-0005-business.md`.

PRD-0005 does not redefine the model.

### 9.3 Destination status

V1 Affiliate Destination status values are:

```text
Draft
Enabled
Disabled
```

- **Draft** — the destination is authored or changed and is not enabled for Affiliate Handoff.
- **Enabled** — the destination has a Valid validation result and has been enabled through the approved Platform administration action.
- **Disabled** — a previously enabled destination has been disabled through the approved Platform administration action.

### 9.4 Validation result

V1 validation result values are:

```text
Not Validated
Valid
Invalid
```

- **Not Validated** — the current authored destination configuration has not received a current validation result.
- **Valid** — the current configuration satisfies every V1 product condition required for possible enablement.
- **Invalid** — one or more V1 product conditions required for possible enablement is not satisfied.

A current Affiliate Destination configuration is **Valid** only when:

- it contains a usable external destination reference;
- it is associated with exactly one Offering owned by the managing Business;
- the destination reference is currently supplied by the Business and is not empty;
- it represents an Affiliate Handoff destination rather than a Direct Contact channel;
- the approved Admin review identifies no product-level condition that prevents enablement.

A configuration is **Invalid** when one or more of those product conditions is not satisfied.

This PRD defines the product meaning of the result. It does not define the technical method, automated check, provider integration, URL-security implementation, or evidence collection used to reach that result.

### 9.5 Authoring and editing effects

Creating an Affiliate Destination produces:

```text
Destination Status = Draft
Validation Result = Not Validated
Affiliate Destination Handoff Eligibility = Ineligible
```

Editing an Affiliate Destination, including an Enabled or Disabled destination, produces:

```text
Destination Status = Draft
Validation Result = Not Validated
Affiliate Destination Handoff Eligibility = Ineligible
```

This prevents a changed destination from remaining eligible under an earlier validation result.

### 9.6 Administration action outcomes

`PRD-0006-platform.md` owns the action surface and execution of:

- Review Affiliate Destination;
- Validate Affiliate Destination;
- Enable Affiliate Destination;
- Disable Affiliate Destination.

PRD-0001 owns the resulting product state and meaning.

#### Review Affiliate Destination

Review:

- changes no destination status by itself;
- changes no validation result by itself;
- changes no Handoff Eligibility result by itself.

#### Validate Affiliate Destination

Validate produces one current validation result:

```text
Valid
or
Invalid
```

Validate does not change destination status by itself.

If the result is Invalid:

```text
Affiliate Destination Handoff Eligibility = Ineligible
```

If the result is Valid, the destination remains Ineligible until it is Enabled.

#### Enable Affiliate Destination

Enable is available only when:

```text
Validation Result = Valid
```

Enable produces:

```text
Destination Status = Enabled
Affiliate Destination Handoff Eligibility = Eligible
```

#### Disable Affiliate Destination

Disable applies to an Enabled destination and produces:

```text
Destination Status = Disabled
Affiliate Destination Handoff Eligibility = Ineligible
```

The current validation result is preserved until the Business edits the destination or a later validation replaces it.

### 9.7 Affiliate Destination Handoff Eligibility

Values:

```text
Eligible
Ineligible
```

Composition:

```text
Destination Status = Enabled
AND
Validation Result = Valid
→ Affiliate Destination Handoff Eligibility = Eligible
```

All other combinations produce Ineligible.

This result is separate from final Offering Public Eligibility.

Affiliate Destination Handoff Eligibility is not an input to final Offering Public Eligibility composition.

### 9.8 Affiliate Handoff availability

`PRD-0004-decision.md` may make Affiliate Handoff available only when:

```text
final Offering Public Eligibility = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
```

PRD-0004 owns the person-facing handoff and Completion.

### 9.9 Separation from other states

Enabling or disabling an Affiliate Destination does not change:

- Offering lifecycle;
- final Offering Public Eligibility;
- Business Moderation Status;
- Business Public Exposure Input;
- User Account access status.

Offering retirement does not permanently delete the Affiliate Destination. The destination remains part of the owner/Admin historical record but cannot be used because the Archived Offering's final public eligibility is Ineligible.

---

## 10. Business Rules

1. Every Offering belongs to exactly one Business.
2. A Business may own multiple Offerings.
3. Every Offering is assigned to exactly one active leaf Category in V1.
4. Every root Category belongs to exactly one V1 Domain and child Categories inherit that Domain.
5. An Offering derives its Domain from its active leaf Category.
6. Attributes describe Offerings only where applicable to the Offering's Category.
7. PRD-0006 owns Attribute-definition management; PRD-0001 owns Offering Attribute-value meaning.
8. Discovery consumes only Offerings whose final Offering Public Eligibility is Eligible.
9. Public Offering Presentation consumes only Offerings whose final Offering Public Eligibility is Eligible.
10. Compare and Decision behaviour consume Offering and Attribute results without redefining the Offering model.
11. A Business creates an Offering in Draft.
12. An authorized Business may publish an owned Draft Offering only when the Universal Publication Minimum is satisfied and the separate authorization and Business Moderation Status gates permit publication.
13. Published and Hidden edits may be saved only while the Universal Publication Minimum remains satisfied and the applicable PRD-0005 Business access gate permits the edit.
14. An invalid save is rejected and creates no automatic transition to Draft.
15. `Initial Published At` is created once on the first Draft → Published transition and never changes.
16. An authorized Business may retire an owned Draft, Published, or Hidden Offering to Archived.
17. Archived is irreversible and immutable in V1.
18. Archived may retain historical Category, Domain, Attribute, and Affiliate Destination information.
19. An authorized Admin may Hide a Published Offering and Restore a Hidden Offering.
20. An Admin cannot archive or restore an Archived Offering.
21. An Offering may have zero or one Affiliate Destination in V1.
22. An Affiliate Destination belongs to exactly one Offering.
23. Affiliate Destination authoring is available only for Draft, Published, and Hidden Offerings.
24. PRD-0001 owns Affiliate Destination state, validation meaning, and Handoff Eligibility.
25. PRD-0006 supplies only the approved administration action surface and applies PRD-0001 outcomes.
26. PRD-0005 supplies only the authorized Business-management entry.
27. PRD-0004 owns the person-facing Affiliate Handoff and Completion.
28. No consumer PRD recalculates final Offering Public Eligibility or Affiliate Destination Handoff Eligibility.
29. Every Offering has exactly one Pricing Kind.
30. No Pricing Kind prevents publication.
31. An amount is accompanied by the instant it was established.
32. A reduction is derived from two amounts and is never stored.
33. Price ordering uses the amount a person would pay, including stated delivery.
34. Every Offering records exactly one Source.
35. An automated intake may modify only Offerings it is linked to, and of those may change only the Price and the Stock State.
    35a1. An automated intake shall create no Offering and shall reach no lifecycle state.
    35a2. An intake link shall be established only against a Published Offering, only where the match is unambiguous, and an Offering shall carry at most one.
    35a3. An automated intake shall not modify an Offering that is not Published.
    35a4. A field a source document does not carry shall be left unchanged rather than cleared.
    35a. An automated intake may set the Intake Availability Input only for an Offering it is linked to.
    35b. The Intake Availability Input shall be reversible by the same intake without an Admin action and without a lifecycle transition.
    35c. An intake shall not record source absence on the strength of a reading it failed to complete.
    35d. Source absence on a single reading shall not by itself make an Offering ineligible.
    35e. The Intake Availability Input shall not produce Hidden or Archived, and shall not change any lifecycle state.
36. Source confers no authority and does not affect eligibility or moderation.
37. A Product Key groups Offerings for presentation and creates no entity.
38. Offerings are presented as the same product only when their Product Keys are equal.
39. The Domain set is open and is extended by Platform administration.

## 11. Role and Access Boundaries

### 11.1 Guest

A Guest may:

- use public Discovery;
- open a publicly eligible Offering;
- view complete Offering Presentation;
- use public Decision behaviour according to `PRD-0003` and `PRD-0004`.

This PRD does not create Favorites or Messaging behaviour.

### 11.2 Authenticated User

An authenticated User inherits public behaviour and may use authenticated Offering-related actions only where the owning PRD authorizes them.

PRD-0001 does not define Direct Contact, Affiliate Handoff, Decision Chat, or Completion access gates.

### 11.3 Business context

A User acting in an authorized Business context may, subject to the applicable Business rules:

- create Offerings;
- edit owned Offerings;
- publish owned Draft Offerings;
- retire owned Draft, Published, or Hidden Offerings;
- manage the Affiliate Destination of an owned Offering;
- view owned Draft, Published, Hidden, and Archived records as permitted here.

Business Dashboard entry behaviour is owned by `PRD-0005-business.md`, not Identity.

### 11.4 Admin context

An authorized Admin may, through `PRD-0006-platform.md`:

- Hide a Published Offering;
- Restore a Hidden Offering;
- view Offering historical records;
- perform the approved Affiliate Destination Administration actions.

An Admin cannot:

- archive an Offering;
- restore an Archived Offering;
- invent an Offering lifecycle state;
- invent an Affiliate Destination status or validation result;
- redefine either eligibility result.

---

## 12. Product Flows

### 12.1 Publish and public presentation

```text
Authorized Business
→ Create Offering
→ Draft
→ Publish
→ Published
→ final Offering Public Eligibility evaluated
→ Discovery
→ person opens Offering
→ complete Offering Presentation
```

### 12.2 Owner retirement

```text
Authorized Business
→ selects owned Draft / Published / Hidden Offering
→ Retire Offering
→ Archived
→ historical owner/Admin record only
```

### 12.3 Admin hide and restore

```text
Published
→ Hide Offering by authorized Admin
→ Hidden
→ Restore Offering by authorized Admin
→ Published
→ final Offering Public Eligibility reevaluated
```

### 12.4 Business restriction and restoration

```text
Business = Restricted
→ Business Public Exposure Input = Ineligible
→ lifecycle-Published Offerings remain Published
→ final Offering Public Eligibility = Ineligible
```

```text
Business = Unrestricted
→ Business Public Exposure Input = Eligible
→ only lifecycle-Published Offerings may regain final eligibility
```

### 12.5 Affiliate Destination preparation

```text
Authorized Business
→ create or edit Affiliate Destination
→ Draft / Not Validated / Ineligible
→ Platform Review
→ Platform Validate
→ Valid or Invalid
→ if Valid, Platform Enable
→ Enabled / Valid / Eligible
```

### 12.6 Affiliate Handoff consumption

```text
final Offering Public Eligibility = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
→ PRD-0004 may offer Affiliate Handoff
→ PRD-0004 owns handoff initiation and Completion
```

---

## 13. Functional Requirements

### Offering model

1. The platform shall represent every publicly discoverable item as an Offering.
2. Every Offering shall belong to exactly one Business.
3. A Business may own multiple Offerings.
4. Every Offering shall be assigned to exactly one active leaf Category in V1.
5. An Offering may contain Attribute values applicable to its Category.

### Lifecycle

6. Creating an Offering shall produce Draft.
7. Publishing shall be available only when the Business is Unrestricted, the Offering has a recognizable title, an active leaf Category, all Category-required Attribute values, and exactly one owning Business.
8. Publishing an owned Draft that satisfies those conditions shall produce Published.
9. Owner retirement of Draft, Published, or Hidden shall produce Archived.
10. Archived shall be irreversible in V1.
11. Hide Offering shall produce Published → Hidden.
12. Restore Offering shall produce Hidden → Published.
13. Admin shall not archive an Offering.
14. Business owner shall not restore Hidden to Published.
15. Draft, Hidden, and Archived shall be publicly ineligible.
16. Hidden shall remain owner-editable and owner-manageable.
17. Archived shall remain owner/Admin viewable as a historical record and shall not be editable.

### Public eligibility

18. PRD-0001 shall publish exactly one final Offering Public Eligibility result.
19. Final eligibility shall be Eligible only when lifecycle is Published and Business Public Exposure Input is Eligible.
20. Consumers shall receive the final result without recalculating it.
21. Business restriction or restoration shall not change Offering lifecycle state.

### Presentation

22. A publicly eligible Offering shall support complete Offering Presentation.
23. Presentation shall include the product minimum defined in §8.2.
24. Presentation may display action entries without taking ownership of the actions.
25. A publicly ineligible Offering shall not open through public Offering Presentation.

### Affiliate Destination

26. An Offering may have zero or one Affiliate Destination in V1.
27. Each Affiliate Destination shall belong to exactly one Offering.
28. Creation or editing shall result in Draft, Not Validated, and Ineligible.
29. Review shall produce no state or eligibility change by itself.
30. Validate shall produce Valid or Invalid without changing destination status by itself.
31. Enable shall require Valid and shall produce Enabled and Eligible.
32. Disable shall produce Disabled and Ineligible.
33. Affiliate Destination Handoff Eligibility shall be Eligible only for Enabled + Valid.
34. Affiliate Destination Handoff Eligibility shall remain separate from final Offering Public Eligibility.
35. Affiliate Handoff availability shall require both results to be Eligible.
36. Affiliate Destination administration shall not change Offering lifecycle, Business moderation, or User Account access status.
37. Every root Category shall have exactly one V1 Domain and every child Category shall inherit it.
38. Category reparenting shall remain within the same Domain.
39. Category retirement shall ignore Archived historical assignments but shall require no Draft, Published, or Hidden assignment and no active child.
40. Attribute value kinds shall be Text, Number, Boolean, Single Select, or Multi Select.
41. Published and Hidden Offering edits shall preserve the Universal Publication Minimum and satisfy the separate applicable Business access gate.
42. A save violating the Universal Publication Minimum shall be rejected without a lifecycle transition.
43. The first Draft → Published transition shall create immutable Initial Published At.
44. Offering edits and Hidden → Published restore shall not change Initial Published At.
45. Public Offering Presentation shall consume only the public Business identity set.
46. Offering Presentation Open shall occur only when public complete Presentation successfully begins.
47. Affiliate Destination authoring shall be unavailable for Archived Offerings.

---

## 14. Non-functional Product Expectations

These are qualitative product expectations, not implementation metrics.

- **Universal:** the Offering model works consistently across Mobility, Real Estate, and Technology.
- **Understandable:** people can recognize and evaluate a complete Offering without learning a domain-specific product model.
- **Bounded:** lifecycle, public eligibility, Presentation, and Handoff Enablement remain distinct concerns.
- **Traceable:** Offering-domain behaviour references authorized Capabilities and Accepted ADRs.
- **Consistent:** consumers use authoritative Offering results rather than duplicating business rules.
- **Owner-safe:** Businesses manage only Offerings and Affiliate Destinations they are authorized to manage.
- **Moderation-safe:** Platform applies only target-owned outcomes.
- **Implementation-neutral:** requirements do not prescribe technical architecture.

---

## 15. Acceptance Criteria

```gherkin
Scenario: Every public item uses the universal Offering model
  Given an item can be discovered through the platform
  When the item is represented
  Then it is represented as an Offering

Scenario: An Offering belongs to one Business
  Given an Offering exists
  When its ownership is examined
  Then exactly one Business owns it

Scenario: Creating an Offering produces Draft
  Given an authorized Business creates an Offering
  When creation completes
  Then the Offering lifecycle state is Draft
  And final Offering Public Eligibility is Ineligible

Scenario: Publishing requires the product minimum
  Given an authorized Business owns a Draft Offering
  And the Business is Unrestricted
  And the Offering has a recognizable title
  And the Offering is assigned to an active leaf Category
  And every Category-required Attribute has a value
  And exactly one Business owns the Offering
  When the Business publishes it
  Then the Offering lifecycle state is Published
  And final Offering Public Eligibility is evaluated

Scenario: An incomplete Draft cannot be published
  Given a Draft Offering is missing one or more §6.2 publication conditions
  When publication availability is evaluated
  Then Draft → Published is unavailable

Scenario: A Published Offering can become publicly eligible
  Given an Offering lifecycle state is Published
  And Business Public Exposure Input is Eligible
  When final Offering Public Eligibility is composed
  Then the result is Eligible

Scenario: Business restriction does not change Offering lifecycle
  Given an Offering lifecycle state is Published
  And its Business becomes Restricted
  When Business Public Exposure Input becomes Ineligible
  Then the Offering remains Published
  And final Offering Public Eligibility becomes Ineligible

Scenario: Admin hides a Published Offering
  Given an authorized Admin targets a Published Offering
  When Hide Offering is applied
  Then the Offering lifecycle state becomes Hidden
  And the Offering is not publicly eligible

Scenario: A vanished feed product stops being published without being retired
  Given a Published Offering linked to an intake
  When its intake records that the source no longer offers it
  Then final Offering Public Eligibility becomes Ineligible
  And the Offering lifecycle state is still Published
  And no Admin action occurred

Scenario: A product that comes back is available again
  Given an Offering whose Intake Availability Input is Ineligible
  When the same intake finds it in the source again
  Then the Intake Availability Input becomes Eligible
  And no Admin action is required
  And Initial Published At is unchanged

Scenario: A failed reading says nothing about availability
  Given a Published Offering linked to an intake
  When its intake cannot reach or parse the source
  Then no Intake Availability Input changes
  And the Offering remains publicly eligible

Scenario: An intake cannot reach an Offering it is not linked to
  Given a Published Offering with no intake link
  When any intake attempts to update or withdraw it
  Then the attempt is refused
  And final Offering Public Eligibility is unchanged

Scenario: An intake cannot create a listing a source offers
  Given a source document that offers a product the platform does not carry
  When the intake reads the document
  Then no Offering is created
  And the product is reported as not acted upon

Scenario: An intake cannot make a listing live
  Given an Offering that is not Published and is linked to an intake
  When the intake reads the source, which offers that product
  Then the Offering lifecycle state is unchanged
  And its Price and Stock State are unchanged

Scenario: An intake leaves the words alone
  Given a Published Offering linked to an intake
  When the source document states a different title and a different price
  Then the Price changes
  And the Title is unchanged

Scenario: Admin restores a Hidden Offering
  Given an authorized Admin targets a Hidden Offering
  When Restore Offering is applied
  Then the Offering lifecycle state becomes Published
  And final Offering Public Eligibility is reevaluated

Scenario: Business retires an Offering
  Given an authorized Business owns a Draft, Published, or Hidden Offering
  When the Business retires it
  Then the Offering lifecycle state becomes Archived
  And the Offering cannot be restored in V1

Scenario: Archived is historical only
  Given an Offering is Archived
  When public product experiences evaluate it
  Then it is unavailable to Discovery, public Presentation, Compare, Decision Chat selection, Direct Contact, and Affiliate Handoff
  And its owner and an authorized Admin may view it as a historical record

Scenario: Public Offering Presentation provides the product minimum
  Given an Offering is publicly eligible
  When a person opens it
  Then Presentation provides its title, available visuals, Category context, description, applicable Attribute values, owning Business identity, and available action entries

Scenario: Presentation does not perform Decision actions
  Given Presentation displays a Compare, Decision Chat, Direct Contact, or Affiliate Handoff entry
  When the person selects the entry
  Then the owning PRD controls the action behaviour
  And PRD-0001 does not perform the action

Scenario: Affiliate Destination creation begins ineligible
  Given an authorized Business creates an Affiliate Destination for an owned Offering
  When it is saved
  Then Destination Status is Draft
  And Validation Result is Not Validated
  And Affiliate Destination Handoff Eligibility is Ineligible

Scenario: Editing invalidates the prior destination result
  Given an Affiliate Destination exists in any status
  When the authorized Business edits it
  Then Destination Status becomes Draft
  And Validation Result becomes Not Validated
  And Affiliate Destination Handoff Eligibility becomes Ineligible

Scenario: Validation alone does not enable handoff
  Given a Draft Affiliate Destination
  When Validate Affiliate Destination produces Valid
  Then Destination Status remains Draft
  And Affiliate Destination Handoff Eligibility remains Ineligible

Scenario: Admin enables a valid destination
  Given an Affiliate Destination has Validation Result Valid
  When Enable Affiliate Destination is applied
  Then Destination Status becomes Enabled
  And Affiliate Destination Handoff Eligibility becomes Eligible

Scenario: Admin disables an enabled destination
  Given an Affiliate Destination is Enabled and Valid
  When Disable Affiliate Destination is applied
  Then Destination Status becomes Disabled
  And Affiliate Destination Handoff Eligibility becomes Ineligible

Scenario: Affiliate Handoff requires two independent results
  Given final Offering Public Eligibility is Eligible
  And Affiliate Destination Handoff Eligibility is Eligible
  When PRD-0004 evaluates Affiliate Handoff availability
  Then Affiliate Handoff may be offered

Scenario: Destination eligibility does not redefine Offering eligibility
  Given an Affiliate Destination is Enabled and Valid
  And final Offering Public Eligibility is Ineligible
  When Affiliate Handoff availability is evaluated
  Then Affiliate Handoff is unavailable
  And final Offering Public Eligibility remains unchanged

Scenario: Published edit preserves the publication minimum
  Given a Published Offering satisfies every publication condition
  When an authorized Business edits it
  Then the save succeeds only if every publication condition remains satisfied
  And an invalid save is rejected
  And lifecycle remains Published
  And Initial Published At remains unchanged

Scenario: Hidden edit preserves the publication minimum
  Given a Hidden Offering satisfies every publication condition
  When an authorized Business edits it
  Then the save succeeds only if every publication condition remains satisfied
  And an invalid save is rejected
  And lifecycle remains Hidden

Scenario: Archived Offering preserves Category history
  Given an Archived Offering retains a historical Category association
  When Category retirement is evaluated
  Then the historical Archived assignment does not block retirement
  And the retired Category remains renderable for the Archived record

Scenario: Offering derives one Domain
  Given an Offering is assigned to an active leaf Category
  When its Domain is evaluated
  Then the Offering inherits the Domain of the root Category

Scenario: Initial Published At is immutable
  Given an Offering has previously completed Draft to Published
  When it is edited, hidden, or restored
  Then Initial Published At does not change

Scenario: Public Presentation uses only public Business identity
  Given an Offering is publicly eligible
  When complete Offering Presentation begins
  Then the PRD-0005 public Business identity set may be shown
  And protected Direct Contact information is not included by this Presentation rule
  And Offering Presentation Open occurs

Scenario: Archived Affiliate Destination is view-only
  Given an Offering is Archived
  When its associated Affiliate Destination is opened by the owner
  Then historical information may be viewed
  And creation or editing is unavailable

Scenario: F02 remains undecided
  Given a Business edits an Affiliate Destination
  When the behaviour is classified
  Then it is editing the associated Affiliate Destination object
  And it does not decide the Capability home of F02 Offering Editing
```

---

## 16. Related PRDs

- `PRD-0002-discovery.md`
  - consumes final Offering Public Eligibility;
  - owns Homepage, Search, Browse, Filter, Listing Card product behaviour, and Discovery handoff.

- `PRD-0003-identity.md`
  - owns User Account, authentication, context gates, and access-status behaviour.

- `PRD-0004-decision.md`
  - consumes final Offering Public Eligibility and Affiliate Destination Handoff Eligibility;
  - owns Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion.

- `PRD-0005-business.md`
  - owns Business Profile, Business Information, Business Moderation Status, Business Public Exposure Input, Business Dashboard, and management entry.

- `PRD-0006-platform.md`
  - owns Admin surfaces, approved moderation actions, Affiliate Destination Administration action surfaces, Category management, Attribute-definition management, and Basic Analytics.

---

## 17. Related ADRs and Owner Decisions

### Accepted ADRs

- `ADR-0002 — Offering Presentation Capability`
  - establishes Presentation and `F05 → Presentation`.

- `ADR-0003 — Offering Feature → Capability Associations`
  - records the accepted Offering Feature associations and preserves F02 as Not Yet Decided.

- `ADR-0004 — Capability Architecture Layer Recognition`
  - recognizes the Capability Architecture layer.

- `ADR-0006 — Affiliate Destination Ownership`
  - establishes Cross-PRD ownership for Affiliate Destination and Affiliate Handoff.

- `ADR-0007 — Domain Scope of the Capability First Rule`
  - establishes Offering-domain traceability and supporting-relationship treatment.

- `ADR-0008 — Handoff Enablement Capability`
  - establishes Handoff Enablement and PRD-0001 as sole behaviour owner.

### Applied Owner decisions

- D-03 — Affiliate Destination ownership;
- D-15 / D-16 — retirement and moderation outcomes;
- D-20 — final Offering Public Eligibility composition;
- D-21 — Affiliate Destination Administration action family;
- D-23 — Handoff Enablement Capability.

---

## 18. Accepted Deferrals

The following are accepted V1 deferrals and do not block Freeze:

1. **Domain-specific publication extensions**
   - The universal minimum is authoritative.
   - Future domain-specific additions require a controlled PRD revision and may not weaken the universal minimum.

2. **Provider-specific Affiliate Destination validation**
   - Provider rules, automated verification, URL-security checks, and technical evidence remain implementation concerns.

3. **Category rename and retirement UX**
   - Product consequences are defined here; interaction design remains downstream.

4. **Future Attribute lifecycle**
   - Attribute deprecation, replacement, and permanent deletion remain outside V1.

5. **F02 — Offering Editing Capability home**
   - Remains Deferred / Not Yet Decided.
   - This PRD defines editing behaviour but creates no Feature → Capability association.

No downstream UX or User Story may broaden these deferrals.
