# US-DSC-F01-001 — Homepage Discovery Entry

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.2):** Bounded BDD correction after independent Claude audit. Adds Story-internal scenarios for role neutrality and route-failure criteria preservation. No Story ID, Feature ID, Epic, Capability assignment, Acceptance Criterion, dependency, size, scope, or upstream behaviour changes.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F01`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F01` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F01-001` |
| Story Title | Homepage Discovery Entry |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Discovery Entry |
| Feature | `F01` — Homepage Discovery Entry |
| Feature ID | `F01` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person using the public V1 Homepage |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0001-home.md`; `UX-0002-discovery.md` |
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
| `[FEATURE_ID]` | `F01` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Provide one public, role-neutral entry into Discovery through the exact approved prompt and explicit person-controlled Search or Browse routing.

---

## 4. Business Value

> **As a** person with an open need  
> **I want** to begin Discovery by explicitly submitting a query or choosing an active Category  
> **So that** I can choose how to find relevant Offerings without login, silent intent inference, or recommendation-driven routing

---

## 5. Description

The Homepage presents the exact prompt `Bugün ne yapmak istiyorsunuz?` and exposes one explicit Search entry plus active root Category Browse entries.

A valid non-empty Search submission passes the exact current query into the Search path. Selecting an active root Category passes that Category into the Browse path. The Homepage does not perform Search matching, Browse hierarchy traversal, result composition, filtering, or decision behaviour.

Whitespace-only input does not start Search. The same public behaviour applies to Guest, Enabled User, Business, Admin, and a Suspended account using its Guest baseline. Unsupported featured, recommendation, Autocomplete, personalized, or role-specific entry behaviour is absent.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F01` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0001-home.md` | Exact prompt, public Search/Browse entry, validation, role-neutral experience |
| UX Handoff | `UX-0002-discovery.md` | Receives the exact query or initial Category |
| Supporting PRD | `PRD-0003-identity.md` | Public Guest baseline |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall present the exact prompt “Bugün ne yapmak istiyorsunuz?” when the public Search entry is available.
- **AC-2** — The system shall pass the exact current non-empty query to the Search path only after explicit submission.
- **AC-3** — The system shall pass the exact selected active root Category to the Browse path only after explicit selection.
- **AC-4** — The system shall require no authentication for Search or Browse entry.
- **AC-5** — The system shall prevent whitespace-only input from starting Search.
- **AC-6** — The system shall provide the same Search and Browse entry behaviour to Guest, Enabled User, Business, Admin, and Suspended-account Guest baseline contexts.
- **AC-7** — The system shall not infer a hidden route, show Autocomplete, invent Categories, present featured Offerings, or create recommendation, history, or personalization behaviour.
- **AC-8** — The system shall preserve the entered query or selected Category when the applicable route cannot begin and not claim a successful Discovery Start.

---

## 8. BDD

### Scenario: Exact public prompt is presented

```gherkin
Given a person opens the public Homepage
When the Discovery entry is available
Then the prompt is exactly “Bugün ne yapmak istiyorsunuz?”
And authentication is not required
```

### Scenario: Explicit query begins Search routing

```gherkin
Given a person entered a valid non-empty query
When the person explicitly submits it
Then UX-0002 receives the exact current query
And no Category or Filter is invented
```

### Scenario: Active Category begins Browse routing

```gherkin
Given active root Categories are available
When the person selects one active root Category
Then UX-0002 receives that exact Category as the initial Browse context
And no Offering Result is presented by Home
```

### Scenario: Invalid and unsupported entry behaviour is absent

```gherkin
Given Home is available
When a person submits whitespace-only input or inspects available routes
Then Search does not begin for the invalid input
And no Autocomplete, featured Offering, popular-Category ranking, recommendation, or role-specific route is presented
```


### Scenario: Role context does not change public entry behaviour

```gherkin
Given the Homepage is opened as a Guest, Enabled User, Business, Admin, or Suspended-account Guest baseline
When Search and Browse entry controls are evaluated
Then the same public Search and Browse entry behaviour is available
And no role-specific Discovery route or advantage is introduced
```

### Scenario: Failed route preserves the person's current entry context

```gherkin
Given a person entered a valid query or selected an active Category
When the applicable Discovery route cannot begin
Then the entered query or selected Category remains available
And no successful Discovery Start is claimed
```

---

## 9. Dependencies

### Depends On

- None.

### Blocks

- `US-DSC-F02-001` — Search consumes a valid submitted query.
- `US-DSC-F03-001` — Browse consumes the initial active Category.

---

## 10. Story Size

**M**

One public entry outcome with two explicit routes, bounded validation, role neutrality, and error preservation.

---

## 11. Out of Scope

- Search matching and Search Results — `US-DSC-F02-001` and `US-DSC-F06-001`.
- Browse hierarchy and leaf selection — `US-DSC-F03-001`.
- Filters, ordering, Zero Results, Listing Cards, and Offering Presentation.
- Visual layout, typography, responsive arrangement, and control design — `UX-0001-home.md`.

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

The exact prompt is product-owned by PRD-0002 and experience-owned by UX-0001; this Story consumes both by reference.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
