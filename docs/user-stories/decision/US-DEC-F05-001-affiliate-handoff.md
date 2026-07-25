# US-DEC-F05-001 — Affiliate Handoff

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Decision Feature Registry, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not make Affiliate Handoff authentication-required, does not convert Direct Contact into Messaging, does not give Completion external-success meaning, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Decision Feature Registry; does not make Compare mandatory; does not grant Decision Chat selection or handoff authority; does not make Affiliate Handoff authenticated; does not convert Direct Contact into Messaging; does not give Completion external-success meaning; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Decision Feature `F05`. The identifier consumes Domain code `DEC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F05` from Frozen `DECISION_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DEC-F05-001` |
| Story Title | Affiliate Handoff |
| Parent Story Document | `US-0004 Decision` (`US-0004-decision.md`) |
| Story Domain | Decision |
| Domain Code | `DEC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Handoff Execution |
| Feature | `F05` — Affiliate Handoff |
| Feature ID | `F05` — owned by Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Contact & Action |
| Perspective | Person explicitly initiating a public external Affiliate handoff |
| Behaviour Owner | `PRD-0004-decision.md` |
| Experience Owner | `UX-0009-decision-flow.md` §10 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
| Priority | Must |
| Story Size | M |
| Version | 1.0 |
| Last Updated | 2026-07-25 |
| Approval Date | 2026-07-25 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.1 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-25 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `DEC` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F05` | Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Offer and initiate the public Affiliate Handoff only for a current eligible Selected Offering whose separate Affiliate Destination Handoff Eligibility result is Eligible.

---

## 4. Business Value

> **As a** Guest or authenticated person with one eligible Selected Offering  
> **I want** to explicitly leave the platform through the approved eligible Affiliate Destination  
> **So that** the platform hands me to the correct external destination without forced registration, silent path choice, or eligibility recalculation

---

## 5. Description

Affiliate Handoff is public. Guest, Enabled User, Business context, and Admin context receive the same person-facing baseline.

Availability requires both final Offering Public Eligibility Eligible and Affiliate Destination Handoff Eligibility Eligible. Decision consumes these PRD-0001-owned results without recalculating them.

The person explicitly chooses the available Affiliate action. The platform makes the exact eligible external Affiliate Destination the active destination of the journey.

Identity registration is not required before or after Guest Affiliate Handoff. F05 initiates the handoff result consumed by F07; it does not own Completion meaning.

No destination authoring, validation, enablement, administration, redirect technology, affiliate-network integration, attribution, or external-success tracking is defined here.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0004-decision.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DEC` code |
| Feature Registry | `DECISION_FEATURE_REGISTRY.md` | `F05` identity, scope label, references, and relationship classification |
| PRD | `PRD-0004-decision.md` | Decision behaviour and product rules |
| UX | `UX-0009-decision-flow.md` §10 | Availability and person-controlled initiation |
| Supporting PRD | `PRD-0001-offering.md` | Final Offering Public Eligibility, Affiliate Destination, and Handoff Eligibility |
| Accepted ADR | `ADR-0008-handoff-enablement-capability.md` | Handoff Enablement supply and Contact & Action consumption boundary |
| Owner Decision | `OWNER-DECISION-D01-D02-GUEST-DECISION-AND-AFFILIATE-ACCESS-2026-07-21.md` | Public Guest Affiliate access |
| Supporting Feature | `US-DEC-F04-001` | Current eligible Selected Offering |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Decision own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Decision Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Affiliate Handoff public without requiring authentication.
- **AC-2** — The system shall require final Offering Public Eligibility Eligible and Affiliate Destination Handoff Eligibility Eligible.
- **AC-3** — The system shall consume both PRD-0001-owned eligibility results without recalculating either result.
- **AC-4** — The system shall keep Affiliate Handoff unavailable when either required eligibility result is Ineligible.
- **AC-5** — The system shall require the person to explicitly choose the available Affiliate Handoff action.
- **AC-6** — The system shall make the exact eligible external Affiliate Destination the active destination of the person's journey.
- **AC-7** — The system shall require no Registration before or after a Guest Affiliate Handoff.
- **AC-8** — The system shall produce one successful Affiliate Handoff initiation result for consumption by F07.
- **AC-9** — The system shall produce no handoff-initiation result when external handoff initiation fails.
- **AC-10** — The system shall create no Favorites, Messaging, personal Decision history, destination-authoring state, or external-success claim.

---

## 8. BDD

### Scenario: AC-1 — Affiliate Handoff is public

```gherkin
Given a current eligible Selected Offering
When Affiliate Handoff access is evaluated for a Guest or authenticated context
Then authentication is not required
```
### Scenario: AC-2 — Both eligibility results are required

```gherkin
Given one Selected Offering
When Affiliate Handoff availability is evaluated
Then final Offering Public Eligibility must be Eligible
And Affiliate Destination Handoff Eligibility must be Eligible
```
### Scenario: AC-3 — Decision consumes eligibility without recalculation

```gherkin
Given PRD-0001 provides the two eligibility results
When Affiliate Handoff availability is determined
Then Decision consumes both results
And neither result is recalculated
```
### Scenario: AC-4 — One ineligible result blocks the path

```gherkin
Given one or both required eligibility results are Ineligible
When Affiliate Handoff availability is evaluated
Then the path remains unavailable
```
### Scenario: AC-5 — Person explicitly initiates the path

```gherkin
Given Affiliate Handoff is available
When the person explicitly chooses the Affiliate action
Then handoff initiation may proceed
And no path is chosen silently
```
### Scenario: AC-6 — Exact eligible destination becomes active

```gherkin
Given the person explicitly chooses Affiliate Handoff
When the handoff is initiated
Then the exact eligible external Affiliate Destination becomes the active destination
```
### Scenario: AC-7 — Guest handoff has no forced Registration

```gherkin
Given a Guest initiates an eligible Affiliate Handoff
When the handoff begins or ends
Then Registration is not required
```
### Scenario: AC-8 — Initiation result is available to Completion

```gherkin
Given the eligible destination becomes active
When handoff initiation succeeds
Then one Affiliate Handoff initiation result is available to F07
```
### Scenario: AC-9 — Initiation failure produces no result

```gherkin
Given Affiliate Handoff initiation is attempted
When the external handoff does not initiate
Then no successful Affiliate Handoff initiation result is produced
And the person remains in the current Decision flow
```
### Scenario: AC-10 — Affiliate Handoff creates no excluded behaviour

```gherkin
Given Affiliate Handoff is available, succeeds, or fails
When resulting product state is evaluated
Then no Favorites, Messaging, personal Decision history, destination-authoring state, or external-success claim is created
```

---

## 9. Dependencies

### Depends On

- `US-DEC-F04-001` — one current eligible Offering is explicitly selected.
- `PRD-0001-offering.md` — both eligibility results and exact destination exist.

### Blocks

- `US-DEC-F07-001` — successful initiation may produce Affiliate Handoff Completion.

---

## 10. Story Size

**M**

One public handoff-execution outcome with exact dual eligibility, person control, Guest boundary, failure handling, and bounded completion input.

---

## 11. Out of Scope

- Affiliate Destination authoring, status, validation, eligibility computation, or administration.
- Affiliate network, redirect, attribution, tab, application, or transport implementation.
- Completion meaning and evidence — F07.
- External transaction or success tracking.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

Approval or Freeze of this document does not itself commit the Story to delivery.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations may be consumed from `ENGINEERING_CONSTITUTION.md` only after that document becomes authoritative. Its current Draft state is not a Story behaviour owner and does not advance Delivery Status.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Decision outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Decision package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

F05 owns person-facing initiation in Contact & Action and consumes Handoff Enablement output; F07 owns Completion.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
