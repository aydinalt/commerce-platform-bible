# PRD-0002 — Discovery

> **Freeze Note (2.2):** Frozen by separate explicit decision of the Product Owner / Architecture Owner on 2026-08-31, taken after and distinctly from the approval below. **Frozen simultaneously with `US-DSC-F02-001` v1.1, and deliberately so:** that Story consumes the Discovery Start definition this document owns, and freezing one without the other would leave a Story asserting a criterion its PRD no longer held — the drift both revisions exist to prevent. Frozen v2.1 is preserved unchanged at `docs/prd/PRD-0002-discovery-v2.1-superseded.md`. This document must not be edited in place; any future change requires a controlled superseding revision under `DOCUMENT_LIFECYCLE.md` §7.

> **Approval Note (2.2):** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-08-31. The Owner's recorded reasoning: the interface's fluency is a priority, and the bound "at most one Discovery Start per Discovery path" is what keeps that fluency from changing what the analytics have counted since I3. The approval introduces no Search engine, ranking algorithm, Pagination, Sorting, Autocomplete, Recommendation, Capability or Feature; changes no Offering eligibility input, Filter semantic, ordering rule, Zero Results behaviour or Presentation boundary; and advances no Story Delivery Status.

**Revision Note (2.2):** Superseding revision of Frozen v2.1, begun independently at Draft under a new version per `DOCUMENT_LIFECYCLE.md` §7. **It carries no Approval Note and no Freeze Note, because neither decision has been taken.** One change, in §5.10 and the four places that restate it:

**A Search Discovery Start no longer requires a submission.** v2.1 defined the occurrence as "when a person **submits** a valid Search query", and the word was written when a query could only reach the platform one way. The Owner's decision of 2026-08-31 adopts filter-as-you-type as the interface's behaviour, and a debounced query reaching the platform is the same product occurrence as a submitted one: a person expressing what they are looking for. The revision replaces the mechanism with the occurrence, and adds the bound that mechanism used to supply implicitly.

**What does not change, and this is most of it.** The Browse half of §5.10 is untouched — it already said "**selects** the first active Category that begins a Browse path", and a selection is a selection whether it posts a form or not, so the Category dropdown never conflicted with this document. Domain attribution is unchanged. The Listing Card minimum, Filter semantics, ordering, Zero Results and the Presentation boundary are unchanged. No Search engine, ranking algorithm, Pagination, Sorting, Autocomplete, Recommendation, Capability or Feature is introduced, and no Story Delivery Status moves.

**The bound is the substance of the change.** Without it, live filtering would record a Discovery Start on every keystroke that survived a debounce, and the figure Basic Analytics reports would stop meaning what it has meant since I3. "At most one per Discovery path" is not new: it is what the Browse half has always required and what the implementation already does — `i3-browse` names a test *"creates no further Start for descendants of the same path"*. This revision applies the same bound to Search.

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0002
- **Title:** Discovery
- **Status:** Frozen
- **Version:** 2.2
- **Last Updated:** 2026-08-31
- **Supersedes:** Frozen v2.1 (2026-07-21), preserved unchanged at
  `docs/prd/PRD-0002-discovery-v2.1-superseded.md`
- **Approval Date:** 2026-08-31
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Scope level:** Product behaviour (non-technical)
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
- combining Search, active leaf Category, and Filters;
- Filter-combination semantics;
- Discovery Results containing only publicly eligible Offerings;
- the Listing Card product minimum;
- product-defined default result ordering;
- Zero Results and bounded recovery actions;
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
- Favorites;
- Messaging;
- user-controlled Sorting;
- Pagination style, page size, continuous loading, or another result-delivery mechanism;
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

User-controlled Sorting, Pagination, Autocomplete, URL-state persistence, Search History, Saved Search, and Recommendations require a future explicit scope and ownership decision.

---

## 5. Core Concepts and Ownership

### 5.1 Homepage entry

The V1 entry behaviour owned by PRD-0002.

`UX-0001-home.md` owns screen layout, presentation, and interaction specification.

### 5.2 Search

A Discovery path started by submitting a non-empty person-entered query.

### 5.3 Browse

A Discovery path started by choosing and navigating an active Category hierarchy.

### 5.4 Category context

The current active Category path.

An Offering is assigned to exactly one active leaf Category under `PRD-0001-offering.md`.

### 5.5 Attribute Filter

A Discovery constraint based on an Attribute definition whose authoritative `filterable` property is enabled by `PRD-0006-platform.md`.

V1 Filter behaviour depends on the PRD-0006-owned Attribute value kind and definition properties, together with the PRD-0001-owned authoritative Offering value and its product meaning.

### 5.6 Discovery criteria

The current combination of:

- submitted Search query, where present;
- selected active leaf Category, where present;
- applied Attribute Filters.

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

No downstream UX or User Story may broaden these deferrals.

