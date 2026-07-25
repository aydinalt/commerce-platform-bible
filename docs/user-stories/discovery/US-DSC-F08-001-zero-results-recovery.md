# US-DSC-F08-001 — Zero Results Recovery

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F08`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F08` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F08-001` |
| Story Title | Zero Results Recovery |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Results and Refinement |
| Feature | `F08` — Zero Results Recovery |
| Feature ID | `F08` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person whose current valid Discovery criteria match no eligible Offering |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
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
| `[FEATURE_ID]` | `F08` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Explain a no-match Discovery outcome and preserve person control through only the bounded V1 recovery actions.

---

## 4. Business Value

> **As a** person seeing no eligible Offering for the current criteria  
> **I want** to understand and adjust the exact criteria that produced no results  
> **So that** I can recover without silent broadening, recommendation replacement, or route switching

---

## 5. Description

Zero Results occurs when no publicly eligible Offering matches the current Search query, active Category, and applied Filters.

The state preserves an understandable summary of the current criteria and permits removing one or more Filters, clearing all Filters, changing or clearing the query, moving to a parent or another active Category, or returning Home.

Discovery does not silently remove criteria, switch between Search and Browse, invent Recommendations, show ineligible Offerings, create sponsored alternatives, or create Saved Search, History, Notifications, Favorites, or Messaging.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F08` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0002-discovery.md` | Zero Results criteria preservation and bounded recovery |
| UX Return | `UX-0001-home.md` | Return to public Home entry |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall present Zero Results when no publicly eligible Offering matches the current valid Discovery criteria.
- **AC-2** — The system shall state that no eligible Offering matches and preserve an understandable summary of the current query, Category, and Filters.
- **AC-3** — The system shall allow one or more Filters to be removed and all Filters to be cleared.
- **AC-4** — The system shall allow the Search query to be changed or cleared.
- **AC-5** — The system shall allow movement to a parent Category or another active Category.
- **AC-6** — The system shall allow return to the Homepage entry.
- **AC-7** — The system shall not silently remove criteria or switch between Search and Browse.
- **AC-8** — The system shall not invent Recommendations, sponsored alternatives, ineligible Offerings, Saved Search, History, Notification, Favorites, or Messaging behaviour.

---

## 8. BDD

### Scenario: Zero Results preserves current criteria

```gherkin
Given no eligible Offering matches the current query, Category, and Filters
When Zero Results is presented
Then the current criteria remain understandable
And no criterion is silently removed
```

### Scenario: Person uses a bounded recovery action

```gherkin
Given Zero Results is visible
When the person removes Filters, changes the query, changes Category, or returns Home
Then only the selected recovery action changes the current flow
And the criteria are reevaluated when applicable
```

### Scenario: Unsupported replacement is absent

```gherkin
Given Zero Results is visible
When recovery options are presented
Then no recommendation, sponsored alternative, ineligible Offering, saved criteria, history, notification, Favorite, or Messaging action is inserted
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F02-001` or `US-DSC-F03-001` — valid Discovery criteria exist.
- `US-DSC-F05-001` — where Filters contribute to the no-match criteria.
- `US-DSC-F06-001` — no Listing Card is available for the criteria.

### Blocks

- None.

---

## 10. Story Size

**M**

One recovery outcome with criteria explanation, six bounded actions, route preservation, and strict unsupported-behaviour exclusions.

---

## 11. Out of Scope

- Recommendations, sponsored alternatives, Saved Search, Search History, Notifications, Favorites, or Messaging.
- Exact copy, visual hierarchy, and control placement — `UX-0002-discovery.md`.
- Automatic criteria relaxation or Search/Browse route conversion.

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

The state preserves user control and never treats absence of results as permission to broaden product scope.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
