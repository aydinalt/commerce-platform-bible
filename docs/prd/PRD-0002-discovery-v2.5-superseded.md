# PRD-0002 — Discovery

> **Candidate Status (2.5):** **controlled revision candidate** under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v2.4 remains authoritative and is untouched at `PRD-0002-discovery.md`. Nothing here is authoritative until the Owner Freezes it.
>
> **Revision Note (2.5):** Adds one Discovery criterion — a **Price Constraint** — and nothing else. Requested by the Owner on 2026-09-02, after the platform's own comparison surfaces made the omission visible.
>
> **What was missing, and why it was missing.** §5.6 closes the Discovery criteria to three: a Search query, an active leaf Category, and Attribute Filters. §5.5 then requires every Filter to be *an Attribute whose `filterable` property is enabled*. Price is not an Attribute — `PRD-0001-offering.md` §5.10 makes it a first-class property of the Offering with its own Pricing Kind, amount, currency and instant — so between them those two sections do not merely omit a budget control, they **exclude one by construction**. That was correct while no Offering carried an amount. PRD-0001 v4.0 gave every Offering one; the surfaces now show it on the Listing Card, on complete Presentation and in a per-product seller list. A comparison platform that shows a price on every card and cannot narrow by it is asking a person to do by eye the one filtering a machine does perfectly.
>
> **What this revision deliberately does not do.**
>
> - **It adds no Sort.** §12.5 and §21.5 keep user-controlled Sorting outside V1 and this revision does not touch either. A Price Constraint changes *which* Offerings are Results; §12 still decides the order they appear in, and §10.6.6 says so in the same words §12.4 uses for Filters. **Narrowing and ordering are different powers, and only the first is being granted.**
> - **It does not make price an Attribute.** §5.5 is unchanged, `US-DSC-F05-001` is unchanged, and no Attribute definition gains a meaning it did not have. The Price Constraint is a fourth criterion beside the three, defined in its own §10.6, precisely so that the Attribute model stays what `PRD-0006-platform.md` owns.
> - **It resolves an apparent conflict rather than creating one.** `PRD-0001-offering.md` v4.0 §5.10.5 states how a surface *that orders by price* must behave — on the amount a person would pay, delivery included. Read beside PRD-0002 §12 that looked like two Frozen documents disagreeing. They do not: §5.10.5 governs the price ordering **inside one product's seller list** on complete Presentation, which `US-OFR-F05-001` owns and which exists today, not a Discovery result ordering. §10.6.4 borrows the same measure for the constraint, so one rule about "what a person would pay" now governs both places rather than each inventing its own.
>
> **Not revised by this candidate:** §5.5, §8, §9, §11, §12, §13, §14, §22, and every Frozen document downstream of them. `DISCOVERY_FEATURE_REGISTRY.md` gains `F11` in its own controlled revision, because a criterion this document defines needs a Feature to hang a Story from.

> **Freeze Note (2.2):** Frozen by separate explicit decision of the Product Owner / Architecture Owner on 2026-08-31, taken after and distinctly from the approval below. **Frozen simultaneously with `US-DSC-F02-001` v1.1, and deliberately so:** that Story consumes the Discovery Start definition this document owns, and freezing one without the other would leave a Story asserting a criterion its PRD no longer held — the drift both revisions exist to prevent. Frozen v2.1 is preserved unchanged at `docs/prd/PRD-0002-discovery-v2.1-superseded.md`. This document must not be edited in place; any future change requires a controlled superseding revision under `DOCUMENT_LIFECYCLE.md` §7.

> **Freeze Note (2.3):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-08-31, simultaneously with the four other documents that state this rule, because a Freeze of any subset would reintroduce the drift these revisions remove. This exact version must not be edited in place; a further change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen together: `PRD-0002-discovery.md` v2.3, `UX-0001-home.md` v1.1, `UX-0002-discovery.md` v1.1, `US-DSC-F01-001-homepage-discovery-entry.md` v1.1, `US-DSC-F02-001-search.md` v1.2. This Freeze does not change Delivery Status, traceability, repository indexes or GitHub content.
>
> **Approval Note (2.3):** Explicitly approved by the Product Owner / Architecture Owner on 2026-08-31. The Owner's recorded reasoning: *"BDD senaryosundaki çelişkiyi erken yakalamak, ileride analitik verilerinin sessizce kaymasını engelledi. Yetim kalmış kuralları temizlemek, dokümantasyon borcunun birikmesini önlemenin en iyi yoludur."* The five revisions were approved together because they state one rule between them; approving a subset would have left the contradiction alive in whichever document was omitted. This Approval Note records that approval and Freeze were separate decisions.
>
> **Revision Note (2.3):** Controlled superseding revision of Frozen v2.2, **one sentence, for the reason v2.2 exists.**
>
> §5.10 was rewritten in v2.2 so that a Search Discovery Start occurs when a query *reaches the platform*. §5.2 — the definition of Search itself — was left saying *"A Discovery path started by **submitting** a non-empty person-entered query."* The same document then defined the same thing two ways, with the older, narrower word sitting in the definition and the newer one in the rule. That is the shape of defect the four accompanying revisions exist to remove, kept alive inside the document that governs them.
>
> §5.2 now defers to §5.10 rather than restating it, under Reference Never Redefine. §5.3 (Browse) is untouched: "choosing and navigating an active Category hierarchy" names no mechanism that changed.

> **Approval Note (2.2):** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-08-31. The Owner's recorded reasoning: the interface's fluency is a priority, and the bound "at most one Discovery Start per Discovery path" is what keeps that fluency from changing what the analytics have counted since I3. The approval introduces no Search engine, ranking algorithm, Pagination, Sorting, Autocomplete, Recommendation, Capability or Feature; changes no Offering eligibility input, Filter semantic, ordering rule, Zero Results behaviour or Presentation boundary; and advances no Story Delivery Status.

**Revision Note (2.2):** Superseding revision of Frozen v2.1, begun independently at Draft under a new version per `DOCUMENT_LIFECYCLE.md` §7. **It carries no Approval Note and no Freeze Note, because neither decision has been taken.** One change, in §5.10 and the four places that restate it:

**A Search Discovery Start no longer requires a submission.** v2.1 defined the occurrence as "when a person **submits** a valid Search query", and the word was written when a query could only reach the platform one way. The Owner's decision of 2026-08-31 adopts filter-as-you-type as the interface's behaviour, and a debounced query reaching the platform is the same product occurrence as a submitted one: a person expressing what they are looking for. The revision replaces the mechanism with the occurrence, and adds the bound that mechanism used to supply implicitly.

**What does not change, and this is most of it.** The Browse half of §5.10 is untouched — it already said "**selects** the first active Category that begins a Browse path", and a selection is a selection whether it posts a form or not, so the Category dropdown never conflicted with this document. Domain attribution is unchanged. The Listing Card minimum, Filter semantics, ordering, Zero Results and the Presentation boundary are unchanged. No Search engine, ranking algorithm, Pagination, Sorting, Autocomplete, Recommendation, Capability or Feature is introduced, and no Story Delivery Status moves.

**The bound is the substance of the change.** Without it, live filtering would record a Discovery Start on every keystroke that survived a debounce, and the figure Basic Analytics reports would stop meaning what it has meant since I3. "At most one per Discovery path" is not new: it is what the Browse half has always required and what the implementation already does — `i3-browse` names a test *"creates no further Start for descendants of the same path"*. This revision applies the same bound to Search.

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0002
- **Title:** Discovery
- **Status:** In Review — controlled revision candidate
- **Version:** 2.5 (candidate)
- **Supersedes:** Frozen v2.4 on Freeze — until then v2.4 remains authoritative
- **Revision Requested By:** Product Owner / Architecture Owner, 2026-09-02
- **Supersedes (2.4):** Frozen v2.3 (preserved at `PRD-0002-discovery-v2.3-superseded.md`)
- **Approval Date:** 2026-08-31
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-08-31
- **Frozen By:** Product Owner / Architecture Owner
- **Supersedes:** Frozen v2.2 (preserved at `PRD-0002-discovery-v2.2-superseded.md`)
- **Approval Date:** 2026-08-31
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-08-31
- **Frozen By:** Product Owner / Architecture Owner
- **Last Updated:** 2026-08-31
- **Supersedes:** Frozen v2.1 (2026-07-21), preserved unchanged at
  `docs/prd/PRD-0002-discovery-v2.1-superseded.md`
- **Approval Date:** 2026-08-31
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Scope level:** Product behaviour (non-technical)

> **Freeze Note (2.4):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-08-31, simultaneously with the other three documents of this decision, because a Freeze of any subset would reintroduce the contradiction these revisions exist to prevent. This exact version must not be edited in place; a further change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen together: `PRD-0002-discovery.md` v2.4, `PRD-0005-business.md` v1.4, `PRD-0006-platform.md` v2.2, and `PRD-0007-member-area.md` v1.0. This Freeze does not change Delivery Status, traceability, repository indexes, or GitHub content.
>
> **Approval Note (2.4):** Explicitly approved by the Product Owner / Architecture Owner on 2026-08-31. The four were approved together because they state one decision between them: advertising is permitted in three named regions and nowhere else, Favorites and the Member Profile become a capability the platform owns, and Results are delivered a page at a time. Approving a subset would have left a document forbidding what another permits — the defect the 2026-08-31 Discovery Start round was spent removing. This Approval Note records that approval and Freeze were separate decisions.
>
> **Revision Note (2.4):** Controlled superseding revision of Frozen
> v2.3, opened by Owner decision of 2026-08-31. Two lines leave §4 and one
> section is appended.
>
> **Pagination.** §4 excluded *"Pagination style, page size, continuous loading,
> or another result-delivery mechanism"* and the section closed by requiring
> *"a future explicit scope and ownership decision"* for it. This is that
> decision. The exclusion was correct when written — a result-delivery mechanism
> chosen early is chosen without knowing how many Results there will be — and it
> has now been made with the number in hand: the platform returns **every**
> matching row today, which is invisible against an empty catalogue and is a
> 1.5 MB response and a thousand DOM nodes at a thousand Offerings.
>
> **Favorites moves rather than leaves.** It is owned by the new PRD-0007
> (Member Area). A Favorite is not a step in a Discovery path; it is a record
> that outlives every path, and this document is about paths. Keeping it here
> would have made Discovery the owner of a persistence concept it has no other
> reason to hold.
>
> §22 is new and is the only section added; it is appended rather than inserted,
> because renumbering twenty-one sections would break every reference in the
> repository to make room for one.
- **Supersedes:** Approved v1.0
- **Approved candidate:** In Review v2.1
- **Approval Date:** 2026-07-21
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-21
- **Frozen By:** Product Owner / Architecture Owner

> This document is the Single Information Owner of Discovery product behaviour: the V1 Homepage entry, the required opening prompt, Search and Browse routing, Search matching boundaries, Category navigation, Attribute Filter behaviour, Discovery Results, the Listing Card product minimum, default result ordering, Zero Results, Discovery Start meaning, and the handoff from a selected result to Offering Presentation. It defines no search engine, ranking algorithm, linguistic-processing implementation, index, API, database, route format, pagination mechanism, frontend component, storage, security implementation, analytics instrumentation, or infrastructure.

**Freeze Note (2.1):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-21. Frozen v2.1 is the locked V1 PRD baseline for PRD-0002 — Discovery. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (2.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, Final Review, package-level reconciliation, independent Claude audit, and all bounded audit corrections. Approved v2.1 supersedes Approved v1.0 and is the authoritative PRD baseline for PRD-0002 — Discovery. This historical Approval Note records that approval and Freeze were separate decisions. The PRD was subsequently Frozen on 2026-07-21. No UX, User Story, traceability, or GitHub file changes automatically.

**Revision Note (2.1):** Controlled Claude-audit correction for finding A-01. Corrects Attribute ownership language: PRD-0006 owns the Attribute value kind and definition properties; PRD-0001 owns the authoritative Offering value and its product meaning. No Filter behaviour or architecture changes.

**Revision Note (2.0):** Controlled post-approval Freeze-correction candidate applying Owner Decisions P-03, P-04, and P-05. Adds value-kind-specific Filter behaviour, consumes Category-derived Domain association, defines Discovery Start Domain attribution, replaces ambiguous publication recency with PRD-0001-owned immutable `Initial Published At`, and converts pre-approval Open Question wording into accepted deferrals. No Search engine, ranking algorithm, Pagination, Sorting, Recommendation, Capability, or Feature is introduced. Status remains In Review v2.0. Approved v1.0 remains authoritative until explicit approval.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER APPROVAL`. Approved v1.0 becomes the authoritative product-behaviour source for the V1 Homepage entry, the prompt **“Bugün ne yapmak istiyorsunuz?”**, Search and Browse routing, public Search matching boundaries, active Category navigation, Attribute Filter semantics, Discovery Results, the Listing Card product minimum, fixed default ordering, Zero Results recovery, Discovery Start, and the handoff to complete Offering Presentation. It preserves final Offering Public Eligibility as the sole Discovery eligibility input; excludes protected contact and Affiliate Destination information; preserves UX ownership of presentation; and excludes user-controlled Sorting, paid priority, Pagination product behaviour, Autocomplete, persisted URL state, Search History, Saved Search, Notifications, Recommendations, Favorites, and Messaging from V1. It is not Frozen. Freeze requires a separate Product Owner / Architecture Owner decision.

**Revision Note (0.3):** Controlled decision-reconciled revision of In Review v0.2 after the independent Cross-PRD Architecture Audit, explicit Owner Decision D-18, and approval of the authoritative Offering, Identity, Decision, Business, Platform, and Capability Architecture documents. Adds Homepage entry ownership and the required prompt **“Bugün ne yapmak istiyorsunuz?”**; defines deterministic routing to Search or Browse; replaces Published-only assumptions with final Offering Public Eligibility; defines active Category hierarchy navigation and leaf-only result context; defines the approved Search-match information set while excluding protected contact information; defines Filter availability and OR-within / AND-across combination semantics; defines the Listing Card product minimum; defines Search and Browse default ordering without introducing user-controlled Sorting or a ranking algorithm; defines bounded Zero Results recovery; defines Discovery Start for Platform consumption; removes Favorites and Messaging from the PRD-0004 ownership reference; closes the Homepage, Search matching, Category navigation, Filter availability, Filter combination, default ordering, Listing Card minimum, and Zero Results product Open Questions. Approved v1.0 is authoritative from 2026-07-21. No other repository document changes automatically.

---

## 1. Purpose

Discovery helps a person move from an open need to one or more publicly eligible Offerings that can be evaluated.

Discovery begins at the V1 Homepage.

The required opening prompt is:

> **Bugün ne yapmak istiyorsunuz?**

From that entry, a person may begin one of two alternative Discovery paths:

- **Search** — submit a person-entered query;
- **Browse** — choose and navigate the active Category hierarchy.

Discovery may narrow the current context through Category selection and Attribute Filters.

Discovery ends when the person opens a selected Offering. Complete Offering Presentation begins under `PRD-0001-offering.md`.

---

## 2. Business Value

Discovery reduces the effort between a person's open need and an understandable set of Offerings.

It supports the Foundation by:

- respecting the person's time;
- presenting an immediate Search or Browse choice;
- using one universal Offering model across Mobility, Real Estate, and Technology;
- using governed Categories and Attributes rather than category-specific code paths;
- preventing ineligible Offerings or protected Business information from appearing;
- providing predictable matching, filtering, ordering, and Zero Results recovery;
- moving the person toward Offering Presentation and Decision rather than maximizing time spent in results.

Discovery succeeds when a person can:

1. understand how to begin;
2. find or narrow eligible Offerings;
3. identify an Offering from its Listing Card;
4. open it for complete Presentation;
5. understand and recover when no eligible result exists.

---

## 3. Scope

V1 Discovery includes:

- Homepage entry behaviour;
- the opening prompt **“Bugün ne yapmak istiyorsunuz?”**;
- routing a submitted query to Search;
- routing a Category choice to Browse;
- Search against the approved public searchable-information set;
- Browse through active root, child, and leaf Categories;
- active leaf Category selection before category-specific result display;
- Category narrowing for cross-category Search Results;
- Attribute Filters supplied by authoritative filterable definitions;
- a Price Constraint on what a person would pay (§10.6);
- combining Search, active leaf Category, Filters, and a Price Constraint;
- Filter-combination semantics;
- Discovery Results containing only publicly eligible Offerings;
- the Listing Card product minimum;
- product-defined default result ordering;
- Zero Results and bounded recovery actions;
- **delivering Results one page at a time, with each page reachable by its own
  address** (§22);
- opening a selected Offering and handing off to Offering Presentation;
- Discovery Start meaning for Admin-facing Basic Analytics consumption;
- public use without login;
- the same product behaviour across Mobility, Real Estate, and Technology.

PRD-0002 owns the product minimum of the Listing Card.

UX owns its layout, hierarchy, visual treatment, responsive behaviour, and controls.

---

## 4. Out of Scope

The following are outside PRD-0002:

- Offering creation, editing, publication, retirement, lifecycle, ownership, or final Offering Public Eligibility composition;
- Category or Attribute definition and management;
- Offering Presentation;
- Compare;
- Decision Chat;
- Affiliate Handoff;
- Direct Contact;
- Completion;
- Messaging;
- user-controlled Sorting;
- Autocomplete;
- persisted, shareable, restorable, or bookmarkable Discovery URL state;
- Search History;
- Saved Search;
- Notifications;
- Recommendations or advanced recommendations;
- sponsored, paid, or promoted ordering;
- protected telephone, email, or external contact URL matching or exposure;
- Admin-specific Discovery tooling, moderation, or analytics presentation;
- Business-facing analytics;
- search-engine selection;
- index design;
- query parsing, tokenization, stemming, synonym, typo-tolerance, language-detection, or normalization implementation;
- ranking-algorithm implementation;
- analytics event instrumentation, storage, or query implementation;
- API, database, caching, routing, frontend, backend, storage, security, logging, monitoring, deployment, or infrastructure;
- any V2 or excluded behaviour in `V1_SCOPE.md`.

**Pagination left this list on 2026-08-31 and Favorites moved rather than left.**
Pagination is now §22 of this document. Favorites — with the Member Profile it
belongs beside — is owned by **PRD-0007 (Member Area)**, because a Favorite is
not a step in a Discovery path: it is a record that outlives every path a person
takes, and PRD-0002's whole subject is paths.

User-controlled Sorting, Autocomplete, URL-state persistence, Search History,
Saved Search, and Recommendations still require a future explicit scope and
ownership decision.

---

## 5. Core Concepts and Ownership

### 5.1 Homepage entry

The V1 entry behaviour owned by PRD-0002.

`UX-0001-home.md` owns screen layout, presentation, and interaction specification.

### 5.2 Search

A Discovery path started by a non-empty person-entered query reaching the platform (§5.10).

### 5.3 Browse

A Discovery path started by choosing and navigating an active Category hierarchy.

### 5.4 Category context

The current active Category path.

An Offering is assigned to exactly one active leaf Category under `PRD-0001-offering.md`.

### 5.5 Attribute Filter

A Discovery constraint based on an Attribute definition whose authoritative `filterable` property is enabled by `PRD-0006-platform.md`.

V1 Filter behaviour depends on the PRD-0006-owned Attribute value kind and definition properties, together with the PRD-0001-owned authoritative Offering value and its product meaning.

### 5.5A Price Constraint

A Discovery constraint on **the amount a person would pay** for an Offering, as `PRD-0001-offering.md` §5.10 owns that amount and §5.10.5 defines what it includes.

A Price Constraint is not an Attribute Filter and does not become one. §5.5 continues to describe every Attribute Filter this document admits; this section describes the one criterion that is not one.

Unlike an Attribute Filter it does not depend on a Category, because the amount is a property every Offering may carry rather than one a Category confers.

### 5.6 Discovery criteria

The current combination of:

- submitted Search query, where present;
- selected active leaf Category, where present;
- applied Attribute Filters;
- applied Price Constraint, where present.

### 5.7 Discovery Results

The publicly eligible Offerings matching the current Discovery criteria.

### 5.8 Listing Card

The Discovery-owned product representation through which a person identifies and opens one Offering.

### 5.9 Zero Results

The state in which no publicly eligible Offering matches the current criteria.

### 5.10 Discovery Start

The bounded product occurrence when a person:

- expresses a valid non-empty Search query that reaches the platform, whether by
  an explicit submission or after the interface settles on what has been typed;
  or
- selects the first active Category that begins a Browse path.

**At most one Discovery Start occurs per Discovery path.** A Search Discovery
Start occurs on the first valid non-empty query in a path; later narrowing
within the same path — a changed query, a Category selection, an Attribute
Filter — produces no further Start. The same has always been true of Browse,
where only the *first* active Category begins one.

This bound is what the word "submits" used to supply. An interface that filters
as a person types would otherwise record a Discovery Start for every keystroke
that survived a debounce, and the count would stop describing how many people
began looking for something.

Domain attribution:

- a Browse Discovery Start inherits the Domain of the selected Category;
- a Search Discovery Start has no Domain association until the current Discovery criteria include one selected active leaf Category;
- the lack of a Domain association does not block overall counting.

`PRD-0006-platform.md` may consume Discovery Start and its available Domain association for Basic Analytics without redefining either.

### 5.11 Offering Presentation boundary

Discovery ends when a Listing Card is opened.

Complete Offering Presentation begins under PRD-0001 and Accepted ADR-0002.

---

## 6. Homepage Entry and Routing

### 6.1 Required prompt

The Homepage must present the approved opening prompt:

> **Bugün ne yapmak istiyorsunuz?**

The exact layout, typography, placement, visual hierarchy, and control design are UX-owned.

### 6.2 Search routing

When a valid non-empty query reaches the platform:

```text
Homepage
→ Search path
→ Discovery Start
→ Search Results or Zero Results
```

Whitespace-only input does not start Search.

### 6.3 Browse routing

When a person chooses an active Category:

```text
Homepage
→ Browse path
→ Discovery Start
→ Category navigation
→ active leaf Category
→ Browse Results or Zero Results
```

### 6.4 Routing boundary

The Homepage does not:

- infer a hidden goal and silently choose a path;
- require login;
- start Compare or Decision Chat directly;
- create Recommendations;
- create persistent preference or history.

The person initiates Search by submitting a query or Browse by choosing a Category.

---

## 7. Public Eligibility and Discovery Inputs

### 7.1 Eligibility consumption

Discovery consumes exactly one Offering-level result:

```text
final Offering Public Eligibility
```

Only:

```text
final Offering Public Eligibility = Eligible
```

may appear in Discovery Results.

Discovery does not inspect or recalculate:

- Offering lifecycle;
- Business Moderation Status;
- Business Public Exposure Input;
- Affiliate Destination Handoff Eligibility.

### 7.2 Category consumption

Discovery consumes:

- active root Categories;
- active child relationships;
- active leaf Categories;
- stable Category identity;
- Category display names;
- the V1 Domain inherited by each Category.

Retired Categories do not appear as active Browse destinations.

A selected leaf Category supplies the current Discovery Domain context.

### 7.3 Attribute consumption

Discovery consumes:

- Attribute applicability to the selected active leaf Category;
- the authoritative `filterable` property;
- authoritative Offering Attribute values.

Discovery does not manage Attribute definitions.

---

## 8. Search Matching Policy

### 8.1 Approved searchable-information set

A Search query may match only public authoritative information belonging to an eligible Offering:

- Offering title or name;
- Offering description;
- active Category display names in the Offering's Category path;
- public Business display name;
- applicable public Offering Attribute display values.

Search must not match against or expose:

- telephone number;
- email address;
- external website or contact URL;
- Affiliate Destination;
- Admin-only information;
- owner-only information;
- historical or ineligible Offering records.

### 8.2 Product matching boundary

An Offering may enter Search Results only when the approved matching process finds a meaningful relationship between the submitted query and at least one item in the approved searchable-information set.

An Offering that matches none of the approved searchable information must not enter the Search Result set.

The exact linguistic processing used to identify a meaningful relationship is implementation-owned and must not expand the searchable-information set.

### 8.3 Category narrowing from Search

A Search may initially produce eligible results from more than one active leaf Category.

Where multiple leaf Categories are represented:

- Category narrowing is available;
- category-specific Attribute Filters are not available until one active leaf Category is selected;
- selecting a leaf Category retains the Search query and narrows the result set.

---

## 9. Browse Behaviour

### 9.1 Active hierarchy

Browse presents the active Category hierarchy supplied by PRD-0006.

A person may:

- start from an active root Category;
- move through active child Categories;
- move back to a parent Category;
- choose another active branch;
- select an active leaf Category.

### 9.2 Leaf-only result context

V1 Browse Results are presented only after an active leaf Category is selected.

A non-leaf Category:

- provides navigation to active children;
- does not aggregate descendant Offerings into a parent-category result set in V1.

### 9.3 Depth boundary

PRD-0002 imposes no separate Category-depth limit.

Browse follows the authoritative active hierarchy.

UX must make the current Category path understandable without redefining the hierarchy.

---

## 10. Filter Behaviour

### 10.1 Availability

Attribute Filters are available only when:

```text
active leaf Category selected
AND
Attribute applies to that Category
AND
Attribute filterable = true
```

An Attribute that is not applicable or not filterable must not appear as a Filter.

Text Attributes are not filterable in V1.

### 10.2 Value-kind behaviour

#### Number

A Number Filter may use:

- an inclusive minimum;
- an inclusive maximum;
- both.

An Offering matches when its authoritative numeric value is inside every supplied bound.

An Offering with no value does not match the Number Filter.

#### Boolean

A Boolean Filter matches the exact selected true/false value.

An Offering with no value does not match the Boolean Filter.

#### Single Select

One or more selected allowed values combine with OR.

An Offering matches when its authoritative single value equals at least one selected value.

#### Multi Select

One or more selected allowed values combine with OR.

An Offering matches when the Offering's authoritative value set intersects at least one selected Filter value.

### 10.3 Combination semantics

For multiple selected values within the same Single Select or Multi Select Filter:

```text
value A OR value B OR value C
```

For different Attribute Filters:

```text
Filter 1 AND Filter 2 AND Filter 3
```

Where Search query, active leaf Category, and Attribute Filters coexist:

```text
Search match
AND
active leaf Category
AND
all applied Attribute Filters
```

### 10.4 Missing values

An Offering without a value for an applied Filter does not satisfy that Filter.

Discovery does not invent a default value.

### 10.5 Filter changes

Applying a Filter narrows or preserves the current result set.

Removing a Filter expands or preserves the current result set.

Clearing all Filters retains the current Search query and active leaf Category unless the person separately changes them.

Discovery does not invent a Filter for a missing Attribute definition.

### 10.6 Price Constraint behaviour

#### 10.6.1 Availability

A Price Constraint is available wherever Discovery Results are available, with or without a Search query and with or without an active leaf Category.

This is the difference between it and an Attribute Filter, and it follows from what each one is: an Attribute is governed *for a Category*, so §10.1 can only offer it once a leaf is chosen; an amount is carried by the Offering itself.

#### 10.6.2 Form

A Price Constraint is an inclusive upper bound, an inclusive lower bound, or both.

It expresses a currency amount. Discovery does not convert between currencies, and an Offering whose currency differs from the constraint's is outside the constraint rather than converted into it — a converted amount is a figure nobody quoted.

#### 10.6.3 Bound direction

Where both bounds are present and the lower exceeds the upper, no Offering satisfies the constraint. Discovery does not silently swap them: reversing a person's stated bounds answers a question they did not ask.

#### 10.6.4 What is compared

An Offering satisfies a Price Constraint when **the amount a person would pay**, as `PRD-0001-offering.md` §5.10.5 defines it — the amount together with a stated delivery cost — falls within the stated bounds.

A delivery cost that is not stated is not treated as zero and not guessed at. §5.10.5 separates *not stated* from *free*, and the comparison uses the amount alone where nothing is stated, which is the least the Offering could cost.

#### 10.6.5 Offerings with no amount

An Offering whose Pricing Kind is not *Fixed* has no amount and therefore does not satisfy an applied Price Constraint.

This is §10.4 applied unchanged: an Offering without a value for an applied criterion does not satisfy it, and Discovery does not invent a default value. It is not a judgement that quoted work is expensive — a person who has stated a budget has asked to see things whose cost is known, and an Offering that answers "it depends" is not one of them until it is asked.

Discovery states that such Offerings exist and are excluded, so a person can remove the constraint deliberately rather than conclude the catalogue is empty. Exact wording is UX-owned.

#### 10.6.6 Ordering is unchanged

A Price Constraint does not create a new ordering mode.

- constrained Search retains Best Match order (§12.2);
- constrained Browse retains Initial-Published-At order (§12.3).

This is the same sentence §12.4 makes about Filters, for the same reason. **Narrowing what a person sees and choosing the order they see it in are different powers.** §12.5 and §21.5 are untouched by this revision: V1 still provides no user-controlled Sort.

#### 10.6.7 Constraint changes

Applying a Price Constraint narrows or preserves the current result set. Widening or removing it expands or preserves that set.

Removing it retains the current Search query, active leaf Category and Attribute Filters unless the person separately changes them.

#### 10.6.8 Zero Results

A Price Constraint that admits nothing produces Zero Results under §13, and the constraint is one of the criteria §13's recovery may relax.

---

## 11. Listing Card Product Minimum

Every Discovery Result must be represented by one Listing Card.

The minimum information set is:

- recognizable Offering title or name;
- available primary visual, where one has been supplied;
- active leaf Category display name;
- owning Business display name;
- a clear product affordance to open the Offering.

A Listing Card:

- represents one Offering only;
- must not expose protected telephone, email, or external contact URL information;
- must not expose Affiliate Destination information;
- must not imply purchase, transaction, Completion, or external success;
- does not perform complete Offering Presentation;
- does not own Compare, Decision Chat, Affiliate Handoff, or Direct Contact.

UX owns:

- card layout;
- component hierarchy;
- image treatment;
- truncation;
- spacing;
- responsive behaviour;
- whether the whole card or a dedicated control implements the open affordance.

---

## 12. Default Result Ordering

### 12.1 Authoritative publication recency

Discovery consumes PRD-0001-owned:

```text
Initial Published At
```

It is created once by the first Draft → Published transition.

Offering edits and Hidden → Published restore do not change it.

### 12.2 Search default order

Search Results use **Best Match** as the fixed V1 product order.

Best Match prioritizes, in this order:

1. direct title or name relationship to the query;
2. active Category-path relationship;
3. public Business display-name relationship;
4. Offering description and applicable Attribute-value relationship.

Within the same product match level:

1. the later `Initial Published At` appears first;
2. any remaining tie uses a stable deterministic order.

This section defines product priority, not a ranking algorithm.

### 12.3 Browse default order

Browse Results use:

```text
later Initial Published At first
```

Any remaining tie uses a stable deterministic order.

### 12.4 Filtered results

Filters do not create a new ordering mode.

- filtered Search retains Best Match order;
- filtered Browse retains Initial-Published-At order.

The same holds for a Price Constraint (§10.6.6). No criterion in §5.6 chooses an order; §12 is the only section that does.

### 12.5 Ordering exclusions

V1 provides no:

- user-controlled Sort;
- paid placement;
- sponsored priority;
- promoted Listing Card;
- Business-controlled ranking override.

## 13. Zero Results

Zero Results must:

- state that no publicly eligible Offering matches the current criteria;
- preserve an understandable summary of the current query, Category, and Filters;
- allow one or more Filters to be removed;
- allow all Filters to be cleared;
- allow the Search query to be changed or cleared;
- allow the person to move to a parent Category or choose another active Category;
- allow return to the Homepage entry.

Zero Results must not:

- invent Recommendations;
- show an ineligible Offering;
- create Saved Search, History, Notification, or Messaging;
- silently remove criteria;
- silently switch from Search to Browse or Browse to Search.

Exact copy and layout are UX-owned.

---

## 14. Discovery Result Handoff

When a person opens a Listing Card:

```text
Discovery Result
→ selected Offering
→ complete Offering Presentation
```

Discovery supplies the selected Offering identity.

PRD-0001 owns the Presentation behaviour.

Opening an Offering:

- ends the Discovery responsibility;
- is not Completion;
- does not automatically begin Compare;
- does not automatically begin Decision Chat;
- does not initiate Affiliate Handoff or Direct Contact.

---

## 15. Permissions Matrix

Legend:

- `✓` — permitted through public Discovery;
- `✗` — not permitted;
- `Conditional` — available when applicable public criteria exist.

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| View Homepage prompt | ✓ | ✓ | ✓ | ✓ |
| Start Search | ✓ | ✓ | ✓ | ✓ |
| Start Browse | ✓ | ✓ | ✓ | ✓ |
| Navigate active Categories | ✓ | ✓ | ✓ | ✓ |
| Select active leaf Category | ✓ | ✓ | ✓ | ✓ |
| Apply or remove applicable Filters | Conditional | Conditional | Conditional | Conditional |
| Apply or remove a Price Constraint | ✓ | ✓ | ✓ | ✓ |
| View Discovery Results | ✓ | ✓ | ✓ | ✓ |
| View Zero Results | ✓ | ✓ | ✓ | ✓ |
| Open an Offering | ✓ | ✓ | ✓ | ✓ |
| Receive role-specific Discovery priority | ✗ | ✗ | ✗ | ✗ |
| Use user-controlled Sorting | ✗ | ✗ | ✗ | ✗ |
| Access Admin-specific Discovery tooling through PRD-0002 | ✗ | ✗ | ✗ | ✗ |

Business and Admin contexts receive only the public person baseline.

Login or role does not grant a Discovery-specific ordering, visibility, or matching advantage.

---

## 16. Product Flows

### 16.1 Homepage to Search

```text
Homepage
→ “Bugün ne yapmak istiyorsunuz?”
→ a non-empty query reaches the platform
→ Discovery Start
→ Search evaluates eligible Offerings
→ Search Results or Zero Results
```

### 16.2 Homepage to Browse

```text
Homepage
→ “Bugün ne yapmak istiyorsunuz?”
→ person chooses active Category
→ Discovery Start
→ navigate active hierarchy
→ choose active leaf Category
→ Browse Results or Zero Results
```

### 16.3 Search with Category and Filters

```text
Search query
→ cross-category eligible results
→ choose active leaf Category
→ applicable filterable Attributes become available
→ apply Filters
→ narrowed Search Results or Zero Results
```

### 16.4 Browse with Filters

```text
active leaf Category
→ eligible Browse Results
→ applicable filterable Attributes
→ apply Filters
→ narrowed Browse Results or Zero Results
```

### 16.5 Result to Presentation

```text
Listing Card
→ open Offering
→ PRD-0001 complete Offering Presentation
```

### 16.6 Zero Results recovery

```text
Zero Results
→ remove / clear Filters
or
→ change / clear query
or
→ change Category
or
→ return Homepage
→ reevaluate criteria
```

---

## 17. Functional Requirements

### Homepage and entry

1. Discovery shall own the V1 Homepage entry behaviour.
2. Homepage shall present **“Bugün ne yapmak istiyorsunuz?”**.
3. Submitting a non-empty query shall route to Search.
4. Choosing an active Category shall route to Browse.
5. Homepage entry shall require no login.
6. Discovery Start shall occur on the first valid non-empty Search query in a Discovery path, however that query reaches the platform, or on first active Category selection, and at most once per Discovery path.

### Eligibility and inputs

7. Discovery shall include only Offerings whose final Offering Public Eligibility is Eligible.
8. Discovery shall consume active Category hierarchy and filterable Attribute definitions by reference.
9. Discovery shall not recalculate Offering eligibility.

### Search

10. Search shall match only the approved searchable-information set in §8.1.
11. Search shall not match protected contact or owner/Admin-only information.
12. An Offering matching none of the approved information shall not enter Search Results.
13. A cross-category Search shall provide Category narrowing.
14. Category-specific Attribute Filters shall require one selected active leaf Category.

### Browse

15. Browse shall navigate active root, child, and leaf Categories.
16. Browse Results shall require an active leaf Category.
17. Non-leaf Categories shall not aggregate descendant Offering Results in V1.
18. Retired Categories shall not appear as active Browse destinations.

### Filters

19. A Filter shall require applicable Category association and `filterable = true`.
20. Text Attributes shall not be filterable in V1.
21. Number Filters shall use inclusive minimum and/or maximum bounds.
22. Boolean Filters shall use exact true/false selection.
23. Single Select and Multi Select selected values shall combine with OR.
24. Multi Select shall match when Offering values intersect a selected Filter value.
25. Different Attribute Filters shall combine with AND.
26. Search, selected leaf Category, and Attribute Filters shall combine with AND.
27. An Offering with no value for an applied Filter shall not satisfy that Filter.
28. Discovery shall allow applied Filters to be removed or cleared.

### Price Constraint

28A. A Price Constraint shall be available with or without a Search query and with or without an active leaf Category.
28B. A Price Constraint shall express an inclusive upper bound, an inclusive lower bound, or both.
28C. A Price Constraint shall be satisfied by the amount a person would pay as `PRD-0001-offering.md` §5.10.5 defines it, using the amount alone where no delivery cost is stated.
28D. An Offering whose Pricing Kind is not *Fixed* shall not satisfy an applied Price Constraint.
28E. Discovery shall state that Offerings without a Fixed amount are excluded while a Price Constraint is applied.
28F. An Offering whose currency differs from the Price Constraint's shall not satisfy it, and shall not be converted.
28G. A Price Constraint whose lower bound exceeds its upper bound shall be satisfied by no Offering, and shall not be reversed.
28H. A Price Constraint shall combine with Search, active leaf Category, and Attribute Filters using AND.
28I. A Price Constraint shall not change the applicable §12 ordering.
28J. Discovery shall allow an applied Price Constraint to be widened, narrowed, or removed.

### Listing Card

29. Every Discovery Result shall use one Listing Card.
30. Every Listing Card shall contain the §11 product minimum.
31. Listing Cards shall not expose protected contact or Affiliate Destination information.
32. Listing Cards shall allow the represented Offering to be opened.
33. Listing Cards shall not perform complete Offering Presentation or Decision actions.

### Ordering

34. Search Results shall use the Best Match product order in §12.2.
35. Browse Results shall use later Initial Published At first.
36. Filter application shall preserve the applicable Search or Browse order.
37. V1 shall expose no user-controlled Sort, paid placement, or ranking override.

### Zero Results and handoff

38. Discovery shall present Zero Results where no eligible Offering matches.
39. Zero Results shall provide only the bounded recovery actions in §13.
40. Discovery shall not silently remove or change criteria.
41. Opening a Listing Card shall hand off the selected Offering to PRD-0001 Presentation.
42. The same Discovery rules shall apply across Mobility, Real Estate, and Technology.

---

## 18. Acceptance Criteria

```gherkin
Scenario: Homepage owns the V1 entry prompt
  Given a person enters the V1 Homepage
  When Discovery entry is presented
  Then the prompt “Bugün ne yapmak istiyorsunuz?” is available
  And login is not required

Scenario: A query routes to Search
  Given a person is on the Homepage
  When a non-empty query the person has expressed reaches the platform
  Then Discovery Start occurs
  And the Search path begins
  And Browse is not selected silently

Scenario: Refining a query starts nothing further
  Given a Discovery path has begun with a Search Discovery Start
  When the person changes the query within that path
  Then Search Results are re-evaluated
  And no further Discovery Start occurs

Scenario: Category choice routes to Browse
  Given a person is on the Homepage
  When the person chooses an active Category
  Then Discovery Start occurs
  And the Browse path begins
  And Search is not selected silently

Scenario: Discovery consumes final public eligibility
  Given an Offering has final Offering Public Eligibility Ineligible
  When Search or Browse Results are composed
  Then the Offering is excluded

Scenario: Search uses only approved public information
  Given an eligible Offering matches the query through its title, description, Category path, public Business display name, or applicable Attribute value
  When Search is evaluated
  Then the Offering may enter Search Results
  And protected telephone, email, external URL, Affiliate Destination, owner-only, and Admin-only information are not searched or exposed

Scenario: Search excludes unrelated Offering
  Given an eligible Offering matches none of the approved searchable information
  When Search is evaluated
  Then the Offering is excluded from Search Results

Scenario: Cross-category Search requires leaf selection for Attribute Filters
  Given Search Results include more than one active leaf Category
  When no active leaf Category is selected
  Then Category narrowing is available
  And category-specific Attribute Filters are unavailable

Scenario: Browse follows the active hierarchy
  Given active root, child, and leaf Categories exist
  When a person browses
  Then only active Category relationships are navigable
  And Results are presented after an active leaf Category is selected

Scenario: Non-leaf Category does not aggregate Offerings
  Given an active Category has active child Categories
  When the person selects the non-leaf Category
  Then active children are available
  And descendant Offerings are not aggregated into a V1 parent result set

Scenario: Filter values combine with OR
  Given one filterable Attribute has more than one selected value
  When the Filter is applied
  Then an Offering satisfies the Filter when it matches at least one selected value

Scenario: Different Filters combine with AND
  Given more than one Attribute Filter is applied
  When Results are evaluated
  Then an Offering appears only when it satisfies every applied Filter

Scenario: Number Filter uses inclusive bounds
  Given a filterable Number Attribute applies to the selected leaf Category
  And the person supplies a minimum and maximum
  When Results are evaluated
  Then an Offering matches only when its authoritative numeric value is inside both inclusive bounds
  And an Offering without a value does not match

Scenario: Multi Select Filter uses intersection
  Given a filterable Multi Select Attribute applies
  And more than one allowed value is selected
  When Results are evaluated
  Then an Offering matches when its authoritative value set contains at least one selected value

Scenario: Discovery Start carries Domain where available
  Given the person begins Browse from an active Category
  When Discovery Start occurs
  Then the occurrence inherits the Category Domain
  Given the person submits a cross-category Search without a leaf Category
  When Discovery Start occurs
  Then the occurrence has no Domain association
  And it remains countable overall

Scenario: Listing Card exposes the product minimum
  Given an eligible Offering appears in Discovery Results
  When its Listing Card is presented
  Then its title or name is available
  And its supplied primary visual may be available
  And its active leaf Category is available
  And its owning Business display name is available
  And a clear Offering-open affordance is available

Scenario: Listing Card protects out-of-scope information
  Given an Offering has contact and Affiliate Destination information
  When its Listing Card is presented
  Then telephone, email, external contact URL, and Affiliate Destination information are not exposed
  And no Completion or external-success claim is made

Scenario: Search uses Best Match order
  Given multiple eligible Offerings match a Search query
  When Search Results are ordered
  Then title or name relationship has the highest product priority
  And Category-path relationship precedes Business-name relationship
  And Business-name relationship precedes description and Attribute-value relationship
  And ties prefer the Offering with the later Initial Published At

Scenario: Browse uses publication recency
  Given multiple eligible Offerings belong to the selected active leaf Category
  When Browse Results are ordered
  Then the Offering with the later Initial Published At appears first
  And no user-controlled Sort is required

Scenario: Zero Results preserves user control
  Given no eligible Offering matches the current criteria
  When Zero Results is presented
  Then the current criteria remain understandable
  And the person may remove Filters, change the query, change the Category, or return to Homepage
  And Discovery does not silently change the criteria or invent Recommendations

Scenario: Result opens complete Offering Presentation
  Given an eligible Offering appears on a Listing Card
  When the person opens it
  Then Discovery supplies the selected Offering
  And PRD-0001 complete Offering Presentation begins
  And Compare, Chat, handoff, Contact, and Completion do not begin automatically

Scenario: Role grants no Discovery advantage
  Given a Guest, Enabled User, Business context, and Admin context use the same criteria
  When Discovery evaluates them
  Then the same public matching, eligibility, filtering, Listing Card, and ordering behaviour applies
```

---

## 19. Related PRDs

### PRD-0001 — Offering

Owns:

- universal Offering;
- Category and Attribute product concepts;
- final Offering Public Eligibility;
- complete Offering Presentation;
- Listing Card source information.

Discovery consumes those results.

### PRD-0003 — Identity

Owns the public Guest baseline.

Discovery is public and creates no additional role gate.

### PRD-0004 — Decision

Owns:

- Compare;
- Decision Chat;
- Affiliate Handoff;
- Direct Contact;
- Completion.

Discovery does not begin those actions automatically.

### PRD-0005 — Business

Owns:

- Business Profile;
- public Business display name;
- Business Information;
- protected contact-information authoring.

Discovery consumes only the public Business display name for Search and Listing Cards.

### PRD-0006 — Platform

Owns:

- active Category hierarchy management;
- Attribute applicability;
- the `filterable` property;
- Admin-facing Basic Analytics.

It may consume Discovery Start.

---

## 20. Related ADRs, Capability Architecture, and Owner Decisions

### Accepted ADRs

- `ADR-0002 — Offering Presentation Capability`
  - Discovery ends when the selected Offering is opened; Presentation begins there.

- `ADR-0007 — Domain Scope of the Capability First Rule`
  - Discovery is Offering-domain behaviour and traces to the Frozen Discovery Capability.

### Frozen Capability Architecture

- `OFFERING_CAPABILITY_ARCHITECTURE.md` Frozen v2.0
  - Discovery Capability;
  - Visibility & Eligibility consumption boundary;
  - Presentation handoff boundary.

### Applied Owner Decision

- D-18 — Homepage Entry Behaviour Ownership
  - PRD-0002 owns Homepage entry, the required prompt, and Search/Browse routing;
  - UX-0001 owns layout and interaction specification.

No new ADR is required for this controlled product-behaviour revision.

---

## 21. Accepted Deferrals

The following are accepted V1 deferrals and do not block Freeze:

1. **Linguistic matching implementation**
   - Tokenization, stemming, synonyms, typo handling, language processing, and normalization remain implementation concerns.
   - They may not expand the approved searchable-information set.

2. **Result-delivery implementation**
   - Page size, pagination, continuous loading, and result retrieval remain outside V1 product behaviour.
   - Every delivered result must preserve the approved ordering.

3. **Listing Card visual design**
   - Layout, visual hierarchy, truncation, image treatment, and responsive behaviour remain UX-owned.

4. **Zero Results copy**
   - Exact language and control placement remain UX-owned.
   - Available actions may not exceed §13.

5. **Future Discovery capabilities**
   - User-controlled Sorting, Autocomplete, URL-state persistence, Search History, Saved Search, Notifications, Recommendations, and sponsored placement remain outside V1.
   - **The v2.5 Price Constraint does not reopen the first of these.** A constraint narrows the set; a Sort arranges it. §10.6.6 keeps them apart in the document, and a surface that offered "cheapest first" would be exercising a power this deferral still withholds.

No downstream UX or User Story may broaden these deferrals.

---

## 22. Result Delivery

Discovery Results are delivered **one page at a time**.

### 22.1 Why a page rather than a stream

A stream that grows as a person scrolls is pleasant and costs three things this
product cannot pay:

- **A search engine sees only the first load.** Offerings past it are never
  indexed, and an Offering nobody can find is an Offering nobody published.
- **A person cannot return to where they were.** There is no address for "the
  third screenful", so a Result seen and left is a Result found again by
  scrolling from the top.
- **The count stops meaning anything.** A Discovery path is bounded to one
  Discovery Start; a scroll that silently fetches more makes "how many people
  began looking" and "how much did they look" the same number.

### 22.2 What a page is

- Each page carries **at most a product-defined number of Results**. The number
  is one decision made once, not a per-request parameter a caller may set.
- Each page is reachable by **its own address**, and that address is stable: the
  same criteria and the same page number produce the same page.
- A person can always tell **whether another page exists**, without being told
  how many there are in total. A total is a second question with a second cost,
  and the answer to "is there more" is the one that changes what a person does.
- Moving between pages **does not begin a Discovery path** and produces no
  further Discovery Start. It is narrowing within a path, exactly as a changed
  query or an Attribute Filter is (§5.10).

### 22.3 Bounds

- A page number that names no page is answered as **Zero Results with the
  criteria intact**, not as an error and not as page one. A person who followed
  a stale link is told what they asked for and how to change it.
- Depth is **bounded**. Beyond the bound the platform offers narrowing rather
  than a further page: nobody reads the fiftieth page of Results, and a crawler
  that tries costs the database a full scan for a page no person will see.

### 22.4 What §22 does not decide

Page size, the depth bound, control layout, labels, and whether a page change is
a full navigation are **not** decided here. The two numbers are product
decisions recorded in the Story; the rest is UX-0002's.

### 22.5 Acceptance Criteria

```gherkin
Scenario: Results arrive one page at a time
  Given more Results match than one page carries
  When Results are presented
  Then at most one page of Results is presented
  And the person can tell that another page exists

Scenario: A page has its own address
  Given a person is on the second page of Results
  When they return to that address later
  Then the same criteria and the same page are presented

Scenario: Changing page begins no Discovery path
  Given a Discovery path has begun
  When the person moves to another page of the same Results
  Then no additional Discovery Start is recorded

Scenario: A page that does not exist states Zero Results
  Given a person requests a page beyond the last
  When Results are presented
  Then Zero Results is stated with the criteria intact
  And the person is offered the bounded recovery actions

Scenario: Depth is bounded
  Given a person has reached the depth bound
  When they ask for a further page
  Then the platform offers narrowing rather than another page
```
