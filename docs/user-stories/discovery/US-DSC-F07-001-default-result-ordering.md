# US-DSC-F07-001 — Default Result Ordering

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.2):** Bounded BDD correction after independent Claude audit. Adds Story-internal Filter-order preservation coverage. No Story ID, Feature ID, Epic, Capability assignment, Acceptance Criterion, dependency, size, scope, or upstream behaviour changes.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F07`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F07` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F07-001` |
| Story Title | Default Result Ordering |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Results and Refinement |
| Feature | `F07` — Default Result Ordering |
| Feature ID | `F07` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person viewing Search or Browse Results |
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
| `[FEATURE_ID]` | `F07` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Apply the fixed V1 product order to Search and Browse Results without exposing a user-controlled, paid, promoted, or role-specific ordering override.

---

## 4. Business Value

> **As a** person viewing public Discovery Results  
> **I want** results to appear in one predictable product-defined order  
> **So that** I can evaluate candidates without hidden paid priority or unsupported Sort controls

---

## 5. Description

Search Results use Best Match. The product priority is title/name relationship, Category-path relationship, public Business display-name relationship, then description and applicable Attribute-value relationship.

Within the same Search match level, later immutable `Initial Published At` appears first and remaining ties use a stable deterministic order. Browse Results use later `Initial Published At` first, then stable deterministic ties.

Filtering preserves the applicable Search or Browse order. V1 exposes no user Sort, paid placement, sponsored priority, promoted card, Business-controlled override, or role-specific Discovery advantage.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F07` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0002-discovery.md` | Fixed Search and Browse order and absence of Sort |
| Supporting PRD | `PRD-0001-offering.md` | Immutable Initial Published At |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall order Search Results by Best Match using title or name, Category path, public Business display name, then description and applicable Attribute-value relationship priority.
- **AC-2** — The system shall place the later Initial Published At first within the same Search match level.
- **AC-3** — The system shall use a stable deterministic order for remaining Search ties.
- **AC-4** — The system shall order Browse Results by later Initial Published At first.
- **AC-5** — The system shall use a stable deterministic order for remaining Browse ties.
- **AC-6** — The system shall preserve the applicable Search or Browse ordering mode after Filters are applied or removed.
- **AC-7** — The system shall provide no user-controlled Sort, paid placement, sponsored priority, promoted Listing Card, Business-controlled override, or role-specific ordering advantage.

---

## 8. BDD

### Scenario: Search uses Best Match priority

```gherkin
Given multiple eligible Offerings match a Search query at different product match levels
When Search Results are ordered
Then title or name relationship precedes Category path
And Category path precedes Business name
And Business name precedes description and Attribute-value relationship
```

### Scenario: Search tie uses publication recency

```gherkin
Given two Search Results have the same product match level
When they are ordered
Then the Offering with later Initial Published At appears first
And any remaining tie is stable
```

### Scenario: Browse uses publication recency

```gherkin
Given multiple eligible Offerings belong to one selected leaf Category
When Browse Results are ordered
Then later Initial Published At appears first
And remaining ties are stable
```

### Scenario: No ordering override exists

```gherkin
Given Search or Browse Results are presented
When available controls and priorities are evaluated
Then no user Sort or paid, sponsored, promoted, Business-controlled, or role-specific override exists
```


### Scenario: Filter changes preserve the applicable ordering mode

```gherkin
Given Search or Browse Results have an applicable default ordering mode
When one or more Filters are applied or removed
Then the candidate set may change
And the applicable Search or Browse ordering mode remains unchanged
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F02-001` or `US-DSC-F03-001` — Search or Browse candidates exist.
- `PRD-0001-offering.md` — immutable Initial Published At.

### Blocks

- None.

---

## 10. Story Size

**M**

One deterministic ordering outcome with distinct Search/Browse rules, stable ties, Filter preservation, and explicit override exclusions.

---

## 11. Out of Scope

- Ranking-algorithm implementation.
- User-controlled Sorting, paid placement, recommendations, promoted cards, or Business ranking controls.
- Result-delivery mechanism such as Pagination or infinite loading.
- Search matching-set eligibility — F02/F06.

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

Best Match is a product priority, not an implementation ranking algorithm.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
