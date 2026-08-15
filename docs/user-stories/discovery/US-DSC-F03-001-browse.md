# US-DSC-F03-001 — Browse

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F03`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F03` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F03-001` |
| Story Title | Browse |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Search and Browse Navigation |
| Feature | `F03` — Browse |
| Feature ID | `F03` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person navigating the public active Category hierarchy |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
| Version | 1.0 |
| Last Updated | 2026-07-24 |
| Approval Date | 2026-07-24 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.1 |
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
| `[FEATURE_ID]` | `F03` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Let a person follow the authoritative active Category hierarchy until one active leaf Category establishes the Browse result context.

---

## 4. Business Value

> **As a** person browsing by Category  
> **I want** to navigate active Category relationships and select one active leaf Category  
> **So that** I can reach a clear category-specific result context without non-leaf aggregation

---

## 5. Description

A Browse path begins when the person selects the first active Category in a new Browse path. That occurrence creates one Browse Discovery Start and inherits the Category Domain.

The person may move through active children, return to a parent, choose another active branch, and select an active leaf Category. Retired Categories are not active Browse destinations.

A non-leaf Category provides navigation only. V1 does not aggregate descendant Offerings into a parent-category result set. Browse Results begin only after an active leaf Category is selected.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F03` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0002-discovery.md` | Active hierarchy, Browse Start, navigation, leaf-only result context |
| Supporting PRD | `PRD-0006-platform.md` | Active Category hierarchy and Category Domain source |
| Supporting PRD | `PRD-0001-offering.md` | Offering assignment to one active leaf Category |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall create one Browse Discovery Start when a person selects the first active Category that begins a new Browse path.
- **AC-2** — The system shall associate the Browse Discovery Start with the Domain inherited from the selected Category.
- **AC-3** — The system shall allow navigation through active root, child, parent, and alternative branch relationships.
- **AC-4** — The system shall exclude retired Categories from active Browse destinations.
- **AC-5** — The system shall withhold Offering Results while the current Category is non-leaf.
- **AC-6** — The system shall present Browse Results only after one active leaf Category is selected.
- **AC-7** — The system shall not aggregate descendant Offering Results into a non-leaf parent result set.
- **AC-8** — The system shall avoid creating additional Browse Discovery Starts for descendant Category selections within the same Browse path.

---

## 8. BDD

### Scenario: New Browse path creates one start

```gherkin
Given no Browse path is active
When the person selects the first active Category
Then one Browse Discovery Start occurs
And it inherits that Category Domain
```

### Scenario: Active hierarchy remains navigable

```gherkin
Given the person is inside an active Category branch
When they choose an active child, parent, or another active branch
Then the current active Category path updates
And retired Categories are not offered as active destinations
```

### Scenario: Non-leaf Category does not aggregate results

```gherkin
Given the selected active Category has active children
When Browse presents the current context
Then active children remain available
And descendant Offering Results are not aggregated
```

### Scenario: Leaf selection establishes results context

```gherkin
Given the person reaches an active leaf Category
When that leaf is selected
Then the current Browse criteria include the leaf Category and Domain
And Browse Results or Zero Results may be evaluated
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F01-001` — where the Browse path originates from Home.
- `PRD-0006-platform.md` — authoritative active Category hierarchy.

### Blocks

- `US-DSC-F05-001` — leaf selection enables applicable Attribute Filters.
- `US-DSC-F06-001` — leaf selection enables Browse Results.
- `US-DSC-F07-001` — Browse Results consume publication-recency ordering.
- `US-DSC-F08-001` — an empty leaf result set produces Zero Results.

---

## 10. Story Size

**M**

One navigation outcome with occurrence ownership, Domain attribution, active-hierarchy traversal, and leaf-only result boundary.

---

## 11. Out of Scope

- Category creation, retirement, ordering, or structural management — `PRD-0006-platform.md`.
- Non-leaf Offering aggregation — excluded from V1.
- Search Category narrowing — `US-DSC-F04-001`.
- Browse result ordering and Listing Cards — F07 and F06.

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

PRD-0002 imposes no additional hierarchy-depth limit; Browse follows the authoritative active hierarchy.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
