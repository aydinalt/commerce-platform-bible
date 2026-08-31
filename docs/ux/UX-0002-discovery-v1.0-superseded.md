# UX-0002 — Discovery

- **UX ID:** UX-0002
- **Title:** Discovery
- **Status:** Frozen
- **Version:** 1.0
- **Supersedes:** Draft v0.1
- **Approved candidate:** In Review v0.3
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0002 — Discovery. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.3 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.3):** Focused independent-audit correction for UX-A02 and UX-A03. Adds the transient current-flow Compare-preparation return from UX-0004, preserves that context through UX-0003, and defines in-Discovery Discovery Start occurrence ownership and Search-originated Domain association. No saved state, persistent URL behaviour, ranking, Filter, Listing Card, or product-rule change is introduced.

**Revision Note (0.2):** Controlled revision against Frozen PRD-0002 v2.1. Removes user-controlled Sorting, Pagination as product behaviour, Autocomplete, persistent/shareable URL state, Favorites, Messaging, and fixed implementation-specific layouts. Defines Search and Browse entry, leaf-only Browse results, cross-Category Search narrowing, authoritative Filters by value kind, Listing Card minimum, fixed product ordering, Zero Results recovery, public role neutrality, and Offering Presentation handoff.

> This document defines experience behaviour only. It does not define search-engine technology, ranking algorithms, URLs, APIs, storage, components, pagination implementation, or visual layout.

---

## 1. Purpose

Discovery lets a person find eligible Offerings through Search or Browse, narrow a leaf-Category result set through approved Attribute Filters, understand results through bounded Listing Cards, and open one Offering in UX-0003.

## 2. Business Value

The experience reduces effort by preserving person-controlled criteria, exposing only meaningful Filters, and avoiding paid, promoted, personalized, or unsupported ordering.

## 3. Scope

- Search;
- Browse;
- active Category hierarchy;
- leaf-Category result context;
- Category narrowing from Search;
- approved searchable-information set;
- value-kind Filter behaviour;
- criteria combination;
- Listing Card product minimum;
- fixed Search and Browse ordering;
- Zero Results;
- Offering Presentation handoff;
- public role-neutral behaviour;
- loading and error behaviour.

## 4. Out of Scope

- Home entry prompt;
- Offering Presentation;
- Compare;
- Decision Flow;
- Autocomplete;
- user-controlled Sorting;
- paid or sponsored ordering;
- Recommendations;
- Search history;
- Saved Search;
- Notifications;
- persistent or shareable URL state;
- Favorites;
- Messaging;
- result-delivery implementation such as Pagination or infinite loading.

## 5. Entry Points

### 5.1 Search from Home

UX-0001 supplies a valid person-submitted query.

Search may initially span multiple leaf Categories.

The valid submission produces a Search Discovery Start.

### 5.2 Browse from Home

UX-0001 supplies the first active Category that begins a Browse path.

Browse presents Offering Results only after one active leaf Category is selected.

The first Category selection beginning that Browse path produces a Browse Discovery Start.

### 5.3 Compare-preparation return

UX-0004 may return one current-flow-only comparison-preparation context containing:

- exactly one eligible Offering already chosen for Compare preparation;
- its active leaf Category;
- an instruction to find another eligible Offering from that same leaf Category.

This context:

- is transient;
- belongs only to the current Compare preparation flow;
- is not saved;
- is not restored after the flow ends;
- is not represented as persistent or shareable URL state;
- does not create a new Discovery Start merely because the return opens.

UX-0002 constrains the result context to the same active leaf Category.

When the person opens another eligible Offering:

- UX-0002 passes that Offering and the unchanged transient preparation context to UX-0003;
- UX-0003 may return them together to UX-0004 when Compare is chosen;
- UX-0002 does not add the Offering to the Comparison Set itself.

Leaving the current preparation flow clears the transient context.

### 5.4 Existing current criteria

Within the current Discovery session, the person may change query, Category, or Filters without creating saved history.

### 5.5 Discovery Start occurrence ownership

UX-0002 consumes the PRD-0002 Discovery Start definition.

A new Search Discovery Start occurs whenever the person explicitly submits a valid Search query inside UX-0002.

A Browse Discovery Start occurs when the person selects the first active Category that begins a new Browse path.

Further descendant Category selections within the same Browse path do not create additional Discovery Starts.

Selecting a Category to narrow an existing Search does not create a Browse Discovery Start.

For a Search-originated Discovery Start:

- no Domain association is available while no active leaf Category is selected;
- the Domain association becomes available when the current Search criteria include one active leaf Category;
- where a valid Search is submitted while one active leaf Category is already selected, that Domain association is available immediately.

UX-0002 supplies only the available occurrence and Domain context. UX-0006 consumes them for Basic Analytics without redefining them.

## 6. Discovery Criteria

Current criteria may contain:

- Search query;
- one selected active Category path;
- one active leaf Category;
- applicable Attribute Filters.

The experience:

- shows current criteria clearly;
- does not add hidden criteria;
- preserves unchanged criteria when one criterion changes;
- applies the approved AND/OR rules;
- does not save criteria as a personal capability.

## 7. Search Behaviour

### 7.1 Searchable-information boundary

Search may match only public information from:

- Offering title or name;
- Offering description;
- active Category path display names;
- public Business display name;
- applicable public Offering Attribute display values.

Search does not match or reveal:

- telephone;
- email;
- external contact URL;
- Affiliate Destination;
- owner-only information;
- Admin-only information.

### 7.2 Cross-Category Search

A Search may begin without one leaf Category.

Results may span multiple leaf Categories.

The person may narrow Search through the active Category hierarchy.

### 7.3 Product matching order

Search uses the Frozen Best Match product priority:

1. title or name relationship;
2. active Category-path relationship;
3. public Business display-name relationship;
4. description and applicable Attribute-value relationship.

Within the same product match level:

- later `Initial Published At` appears first;
- remaining ties remain stable.

No Sort control is presented.

## 8. Browse Behaviour

### 8.1 Active hierarchy

Browse presents active Category relationships only.

Retired Categories are not active destinations.

### 8.2 Leaf-only result context

Selecting a non-leaf Category continues hierarchy navigation.

It does not aggregate descendant Offering Results in V1.

Offering Results begin only after an active leaf Category is selected.

### 8.3 Browse order

Browse Results use later `Initial Published At` first.

Remaining ties remain stable.

No Sort control is presented.

## 9. Filter Behaviour

### 9.1 Availability

Attribute Filters are available only when:

```text
active leaf Category selected
AND
Attribute applies to that Category
AND
filterable = true
```

Text Attributes are not Filters in V1.

### 9.2 Number

A Number Filter may accept:

- inclusive minimum;
- inclusive maximum;
- both.

An Offering without a value does not match the applied Number Filter.

### 9.3 Boolean

Boolean uses exact true or false selection.

An Offering without a value does not match the applied Boolean Filter.

### 9.4 Single Select

One or more selected allowed values combine with OR.

An Offering matches where its authoritative single value equals at least one selected value.

### 9.5 Multi Select

Selected allowed values combine with OR.

An Offering matches where its authoritative value set intersects at least one selected value.

### 9.6 Criteria combination

```text
values within one Select Filter → OR
different Attribute Filters → AND
Search + leaf Category + all Filters → AND
```

### 9.7 Filter changes

Applying a Filter narrows or preserves the current result set.

Removing a Filter expands or preserves it.

Clearing all Filters preserves the current query and active leaf Category unless the person separately changes them.

## 10. Listing Card

Every Listing Card provides:

- recognizable Offering title or name;
- supplied primary visual where available;
- active leaf Category display name;
- owning Business display name;
- clear entry to UX-0003.

A Listing Card does not include:

- protected contact information;
- Affiliate Destination;
- Completion or external-success claims;
- Favorites;
- Messaging;
- Decision execution.

## 11. Result Handoff

Opening a Listing Card:

- ends Discovery for that current action;
- sends the exact Offering to UX-0003;
- begins Offering Presentation only if eligibility remains valid;
- does not automatically start Compare, Decision Chat, or handoff.

Where a current-flow Compare-preparation context is present, UX-0002 passes that context unchanged with the exact Offering to UX-0003.

The context remains transient and does not become saved Discovery state.

## 12. Zero Results

Zero Results preserves the current criteria.

The person may:

- remove one or more Filters;
- clear all Filters;
- change or clear the query;
- change Category;
- return Home.

The experience does not:

- silently broaden criteria;
- replace criteria with recommendations;
- add sponsored alternatives;
- auto-select another Category.

## 13. Loading Behaviour

While results or Filter definitions are being resolved:

- current criteria remain visible;
- the experience does not silently change criteria;
- result actions are unavailable until confirmed;
- partial loading does not imply product Pagination behaviour.

## 14. Error Behaviour

### Search or Browse result error

- current criteria remain;
- no alternative query or Category is invented;
- the person may retry, change criteria, or return Home.

### Filter application error

- the last confirmed criteria and result set remain;
- the failed Filter is not silently applied;
- the person may retry or remove it.

### Listing Card open error

- Discovery context remains;
- Offering Presentation Open does not occur;
- the person may retry or choose another result.

## 15. Role-Neutral Behaviour

Discovery behaviour is identical for:

- Guest;
- Enabled User;
- Business context;
- Admin context;
- Suspended account using Guest baseline.

No role receives paid, promoted, or private results through UX-0002.

## 16. User Actions

- enter or change Search query;
- submit Search and produce the applicable Search Discovery Start;
- begin a new Browse path and produce the applicable Browse Discovery Start;
- navigate active Categories;
- select an active leaf Category;
- apply, remove, or clear Filters;
- inspect Listing Cards;
- open one Offering;
- recover from Zero Results;
- return Home.

## 17. Permissions

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| Search | ✓ | ✓ | ✓ | ✓ |
| Browse | ✓ | ✓ | ✓ | ✓ |
| Apply approved Filters | Conditional | Conditional | Conditional | Conditional |
| Open eligible Listing Card | Conditional | Conditional | Conditional | Conditional |
| Use Sort control | ✗ | ✗ | ✗ | ✗ |
| Use Favorites | ✗ | ✗ | ✗ | ✗ |
| Use Messaging | ✗ | ✗ | ✗ | ✗ |

## 18. Accessibility Requirements

- Current query, Category path, and Filters are identifiable.
- Category hierarchy communicates parent, child, and current leaf context.
- Filter labels, values, bounds, and applied states are accessible.
- OR and AND behaviour is understandable through wording and grouping.
- Listing Card identity and open action have a meaningful reading order.
- Zero Results and errors are announced without removing current criteria.
- Keyboard users can change criteria and open results.

## 19. Related Documents

- `PRD-0001-offering.md` — eligibility, Category, Attributes, Initial Published At.
- `PRD-0002-discovery.md` — Discovery product behaviour.
- `PRD-0003-identity.md` — public role-neutral baseline.
- `PRD-0005-business.md` — public Business display name.
- `PRD-0006-platform.md` — Category and Attribute definitions.
- `UX-0001-home.md` — initial Search and Browse entry.
- `UX-0003-offering-detail.md` — result handoff and transient Compare-preparation context preservation.
- `UX-0004-compare.md` — current-flow Compare-preparation return and resumed set formation.
- `UX-0006-admin-dashboard.md` — Basic Analytics consumer of Discovery Start and available Domain association.

## 20. Acceptance Criteria

```gherkin
Scenario: In-Discovery Search submission creates a new Discovery Start
  Given UX-0002 is already open
  And the person enters a valid Search query
  When the person explicitly submits it
  Then a new Search Discovery Start occurs
  And no hidden Category is invented

Scenario: Browse Start occurs once for a new Browse path
  Given no Browse path is active
  When the person selects the first active Category to begin Browse
  Then one Browse Discovery Start occurs
  When the person later selects a descendant Category in that same path
  Then no additional Browse Discovery Start occurs

Scenario: Search Domain association becomes available at leaf selection
  Given a Search Discovery Start has no active leaf Category
  When the person narrows the current Search to one active leaf Category
  Then the current Search Discovery Start gains that Category Domain association
  And no Browse Discovery Start is created

Scenario: Compare preparation returns through Discovery
  Given UX-0004 returns one eligible preparation Offering and its active leaf Category
  When UX-0002 opens
  Then Results are constrained to that same leaf Category
  And the preparation context remains current-flow only
  When the person opens another eligible Offering
  Then UX-0003 receives the Offering and the unchanged preparation context

Scenario: Search may span Categories
  Given UX-0002 receives a valid Search query without a leaf Category
  When Results are shown
  Then eligible Offerings may come from multiple leaf Categories
  And Category narrowing is available

Scenario: Browse waits for a leaf Category
  Given the person selects a non-leaf Category
  When Browse continues
  Then no descendant Offering Results are aggregated
  And the person continues to an active leaf Category

Scenario: Filter availability follows the definition
  Given one active leaf Category
  When Filter options are presented
  Then only applicable Attributes with filterable true are available
  And Text Attributes are absent

Scenario: Multiple values use OR
  Given more than one allowed value is selected in one Select Filter
  When Results are evaluated
  Then an Offering may match any selected value

Scenario: Different Filters use AND
  Given two different Attribute Filters are applied
  When Results are evaluated
  Then an Offering must satisfy both Filters

Scenario: Search order has no Sort control
  Given Search Results
  When ordering is presented
  Then Best Match is used
  And equal-level ties prefer later Initial Published At
  And no user Sort control exists

Scenario: Browse order uses Initial Published At
  Given Browse Results in one leaf Category
  When ordering is presented
  Then later Initial Published At appears first
  And no user Sort control exists

Scenario: Listing Card is bounded
  Given an eligible Offering Result
  When its Listing Card appears
  Then the title, leaf Category, Business display name, available primary visual, and open action are available
  And no protected contact, Affiliate Destination, Favorites, Messaging, or Completion claim is shown

Scenario: Zero Results preserves criteria
  Given current Discovery criteria produce no Results
  When Zero Results appears
  Then the current criteria remain visible
  And the person may remove Filters, change query, change Category, or return Home
  And no recommendation is inserted

Scenario: Opening a result hands off to Offering Detail
  Given an eligible Listing Card
  When the person opens it
  Then UX-0003 receives the exact Offering
  And Compare, Decision Chat, and handoff do not start automatically
```

## 21. Accepted UX Deferrals

The following do not block review:

- exact result-delivery implementation;
- page size or continuous technical retrieval;
- visual layout of Filters and Listing Cards;
- Search linguistic-processing implementation;
- exact copy for Zero Results and errors;
- technical URL behaviour.

No deferral may add Autocomplete, Sort, sponsored ordering, Recommendations, saved criteria, persistent URL-state capability, Favorites, Messaging, or non-leaf Browse aggregation.
