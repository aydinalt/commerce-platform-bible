# US-DSC-F02-001 — Search

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.2):** Bounded BDD correction after independent Claude audit. Adds Story-internal role-neutral Search matching coverage. No Story ID, Feature ID, Epic, Capability assignment, Acceptance Criterion, dependency, size, scope, or upstream behaviour changes.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F02`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F02` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F02-001` |
| Story Title | Search |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Search and Browse Navigation |
| Feature | `F02` — Search |
| Feature ID | `F02` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person submitting a public Discovery query |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | L |
| Version | 1.0 |
| Last Updated | 2026-07-24 |
| Approval Date | 2026-07-24 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.2 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-24 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `DSC` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F02` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Evaluate a valid person-submitted query only against the approved public searchable-information set and produce a bounded Search result context.

---

## 4. Business Value

> **As a** person searching across eligible Offerings  
> **I want** my submitted query to match only approved public Offering information  
> **So that** I receive relevant Search candidates without protected, owner-only, or Admin-only data influencing the result

---

## 5. Description

A valid Search submission creates a Search Discovery Start. Search may begin without a selected leaf Category and may span multiple active leaf Categories.

Search matches only title or name, description, active Category-path display names, public Business display name, and applicable public Offering Attribute display values. Protected contact information, Affiliate Destination information, owner-only information, Admin-only information, historical records, and ineligible Offerings are outside the Search matching set.

This Story identifies meaningful match relationships and their product match level. F07 owns final ordering of the matched set. F06 owns result presentation and Listing Cards.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F02` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0002-discovery.md` | Search submission, criteria, searchable-information boundary, cross-Category experience |
| Supporting PRD | `PRD-0001-offering.md` | Offering public information and final public eligibility input |
| Supporting PRD | `PRD-0005-business.md` | Public Business display name and protected contact boundary |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall create one Search Discovery Start whenever a person explicitly submits a valid non-empty Search query.
- **AC-2** — The system shall allow Search to begin without an active leaf Category and to produce candidates from more than one active leaf Category.
- **AC-3** — The system shall evaluate meaningful query relationships only against Offering title or name, description, active Category-path display names, public Business display name, and applicable public Offering Attribute display values.
- **AC-4** — The system shall exclude telephone, email, external contact URL, Affiliate Destination, owner-only information, Admin-only information, historical records, and ineligible Offerings from Search matching.
- **AC-5** — The system shall exclude an Offering that matches none of the approved searchable information.
- **AC-6** — The system shall retain the exact current query as visible Discovery criteria.
- **AC-7** — The system shall identify the applicable highest product match level for consumption by Default Result Ordering without defining a ranking algorithm.
- **AC-8** — The system shall apply the same public Search matching behaviour regardless of login or role context.

---

## 8. BDD

### Scenario: Approved public information may match

```gherkin
Given an eligible Offering has a meaningful query relationship through its title, description, Category path, public Business name, or applicable public Attribute value
When Search evaluates the submitted query
Then the Offering may enter the matched candidate set
```

### Scenario: Protected information never creates a Search match

```gherkin
Given an Offering matches a query only through telephone, email, external contact URL, Affiliate Destination, owner-only, or Admin-only information
When Search evaluates the query
Then the Offering is excluded from the matched candidate set
```

### Scenario: Unrelated Offering is excluded

```gherkin
Given an eligible Offering matches none of the approved public searchable information
When Search evaluates the query
Then the Offering is excluded
```

### Scenario: New valid submission creates a new Search start

```gherkin
Given UX-0002 is already open
When the person explicitly submits another valid Search query
Then one new Search Discovery Start occurs
And no hidden Category is invented
```


### Scenario: Login and role context do not change Search matching

```gherkin
Given the same valid query and the same eligible Offering set
And the person is a Guest, Enabled User, Business, Admin, or Suspended-account Guest baseline
When Search matching is evaluated
Then the same approved public searchable-information rules apply
And no role-specific data or matching advantage is used
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F01-001` — where the Search originates from Home.
- `PRD-0001-offering.md` — final public eligibility and public Offering information.

### Blocks

- `US-DSC-F04-001` — cross-Category Search may be narrowed.
- `US-DSC-F06-001` — matched candidates may be represented as Discovery Results.
- `US-DSC-F07-001` — matched candidates consume the Search ordering policy.
- `US-DSC-F08-001` — an empty matched result set produces Zero Results.

---

## 10. Story Size

**L**

One Search outcome with explicit start occurrence, cross-Category context, bounded searchable-information ownership, protected-data exclusions, and match-level classification.

---

## 11. Out of Scope

- Linguistic processing, query parsing, tokenization, stemming, synonyms, typo tolerance, normalization, index design, or search-engine selection.
- Category narrowing — `US-DSC-F04-001`.
- Listing Card presentation — `US-DSC-F06-001`.
- Final Search ordering — `US-DSC-F07-001`.
- Autocomplete, Search History, Saved Search, Recommendations, persistent URL state, Pagination, and user Sort.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

This Story is not committed to delivery merely because its document reaches Approved or Frozen.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations will be consumed from `ENGINEERING_CONSTITUTION.md` only after that document becomes authoritative. The current Engineering Constitution Draft is not a Story behaviour owner and does not advance this Story's Delivery Status.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Discovery outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent Story Document, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] No duplicate Story identified in the current Discovery package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Acceptance Criteria begin with “The system shall…”
- [x] Acceptance Criteria have corresponding BDD coverage

---

## 15. Notes

Product matching priority is consumed as match-level identity; final ordered placement remains owned by F07.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
