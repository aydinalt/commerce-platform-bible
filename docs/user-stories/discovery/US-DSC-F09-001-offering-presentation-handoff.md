# US-DSC-F09-001 — Offering Presentation Handoff

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.3 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.3):** Documentation-precision correction after the focused Claude PASS. Narrows the ADR-0002 statement to the specific `US-OFR-F05-001` Story-level follow-up evidenced by Frozen v2.1. It does not claim completion of every ADR-0002 §10 follow-up. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency meaning, size, scope, PRD/UX behaviour, lifecycle state, or GitHub file changes.

> **Review Entry Note (0.2):** Dependency-verification correction after independent Claude audit. Records exact evidence that `US-OFR-F05-001` is Frozen v2.1 and that the Story-level follow-up for `US-OFR-F05-001` identified in ADR-0002 is completed. No Story ID, Feature ID, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency meaning, size, scope, or upstream behaviour changes.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F09`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F09` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F09-001` |
| Story Title | Offering Presentation Handoff |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Discovery Continuity and Handoff |
| Feature | `F09` — Offering Presentation Handoff |
| Feature ID | `F09` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person opening one eligible Discovery Result |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md`; `UX-0003-offering-detail.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | S |
| Version | 1.0 |
| Last Updated | 2026-07-24 |
| Approval Date | 2026-07-24 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.3 |
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
| `[FEATURE_ID]` | `F09` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

End the current Discovery action by sending one exact eligible Offering to complete Offering Presentation.

---

## 4. Business Value

> **As a** person opening one Discovery Listing Card  
> **I want** the exact selected Offering to open in complete Offering Presentation  
> **So that** I can evaluate it without Discovery automatically starting Compare, Decision Chat, contact, handoff, or Completion

---

## 5. Description

Opening a Listing Card supplies the exact selected Offering identity to UX-0003 and ends Discovery responsibility for that current action.

Complete Offering Presentation begins only if final Offering Public Eligibility remains Eligible. PRD-0001 and `US-OFR-F05-001` Frozen v2.1 own Presentation behaviour by reference.

The handoff is not Completion and does not automatically start Compare, Decision Chat, Affiliate Handoff, Direct Contact, or any transaction. If the open action fails, current Discovery criteria remain and Offering Presentation Open does not occur.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F09` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX Source | `UX-0002-discovery.md` | Listing Card open and context preservation on failure |
| UX Target | `UX-0003-offering-detail.md` | Complete Offering Presentation entry |
| Supporting PRD | `PRD-0001-offering.md` | Final public eligibility and Presentation behaviour |
| Supporting Story | `US-OFR-F05-001-full-offering-detail-presentation.md` — Frozen v2.1 | Authoritative Offering Presentation outcome and completed `US-OFR-F05-001` Story-level follow-up identified in ADR-0002 §10 |
| ADR | `ADR-0002-offering-presentation-capability.md` | Presentation boundary |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow one eligible Discovery Listing Card to be opened.
- **AC-2** — The system shall supply the exact selected Offering identity to UX-0003.
- **AC-3** — The system shall end Discovery responsibility for that current open action.
- **AC-4** — The system shall begin complete Offering Presentation only when final Offering Public Eligibility remains Eligible.
- **AC-5** — The system shall not treat the open action as Completion.
- **AC-6** — The system shall not automatically begin Compare, Decision Chat, Affiliate Handoff, Direct Contact, or a transaction.
- **AC-7** — The system shall preserve current Discovery criteria when the Offering cannot be opened and not produce Offering Presentation Open.

---

## 8. BDD

### Scenario: Eligible result opens Presentation

```gherkin
Given an eligible Offering appears on one Discovery Listing Card
When the person opens it
Then UX-0003 receives the exact Offering
And complete Offering Presentation may begin
```

### Scenario: Open action starts no Decision behaviour

```gherkin
Given the person opens an eligible Discovery Result
When the Discovery handoff completes
Then Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion have not started automatically
```

### Scenario: Ineligible result cannot begin Presentation

```gherkin
Given the selected Offering is no longer publicly eligible before Presentation begins
When the open action is evaluated
Then complete Offering Presentation does not begin
And Offering Presentation Open is not produced
```

### Scenario: Open failure preserves Discovery context

```gherkin
Given current Discovery criteria and one selected Listing Card
When the Listing Card cannot open
Then the current Discovery context remains
And the person may retry or choose another result
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F06-001` — an eligible Offering is represented by a Listing Card.
- `US-OFR-F05-001` — complete Offering Presentation is authoritative and Frozen v2.1.

### Blocks

- None.

---

## 10. Story Size

**S**

One bounded cross-UX handoff with exact identity, eligibility recheck, error preservation, and explicit non-Decision boundary.

---

## 11. Out of Scope

- Complete Offering Presentation — Offering domain / UX-0003.
- Compare mechanics, Decision Chat, Affiliate Handoff, Direct Contact, and Completion — Decision domain.
- Transient Compare-preparation context — `US-DSC-F10-001`.

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

Discovery owns the selected Offering handoff only; Presentation begins under its own authoritative owners.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
