# US-DEC-F07-001 — Decision Completion

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Decision Feature Registry, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not make Affiliate Handoff authentication-required, does not convert Direct Contact into Messaging, does not give Completion external-success meaning, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Decision Feature Registry; does not make Compare mandatory; does not grant Decision Chat selection or handoff authority; does not make Affiliate Handoff authenticated; does not convert Direct Contact into Messaging; does not give Completion external-success meaning; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Decision Feature `F07`. The identifier consumes Domain code `DEC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F07` from Frozen `DECISION_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DEC-F07-001` |
| Story Title | Decision Completion |
| Parent Story Document | `US-0004 Decision` (`US-0004-decision.md`) |
| Story Domain | Decision |
| Domain Code | `DEC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Completion and Journey End |
| Feature | `F07` — Decision Completion |
| Feature ID | `F07` — owned by Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Contact & Action |
| Perspective | Platform and person reaching the bounded end of one Decision-support journey |
| Behaviour Owner | `PRD-0004-decision.md` |
| Experience Owner | `UX-0009-decision-flow.md` §12 |
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
| `[FEATURE_ID]` | `F07` | Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Produce separate Affiliate Handoff Completion and Direct Contact Completion from the approved product evidence without asking for another confirmation or claiming that an external outcome succeeded.

---

## 4. Business Value

> **As a** person completing the platform's in-scope Decision-support journey  
> **I want** the journey to end when the approved handoff evidence occurs  
> **So that** the platform records the correct bounded result without pretending that a purchase, contact, or transaction succeeded

---

## 5. Description

Decision owns two separate Completion results: Affiliate Handoff Completion and Direct Contact Completion.

Affiliate Handoff Completion consumes successful eligible external handoff initiation from F05.

Direct Contact Completion consumes approved contact information revealed plus the external channel made available from F06.

No additional person confirmation is required. Completion means the platform's V1 decision-support responsibility ended; it does not prove purchase, sale, booking, contract, application, call, email, reply, or external service success.

PRD-0006 may consume the two Completion results, Compare Start, and Decision Chat Start for Basic Analytics without redefining their meaning. Completion creates no persistent personal Decision history.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0004-decision.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DEC` code |
| Feature Registry | `DECISION_FEATURE_REGISTRY.md` | `F07` identity, scope label, references, and relationship classification |
| PRD | `PRD-0004-decision.md` | Decision behaviour and product rules |
| UX | `UX-0009-decision-flow.md` §12 | Separate Completion experience and external-success boundary |
| Owner Decision | `OWNER-DECISION-D05-COMPLETION-EVIDENCE-2026-07-21.md` | Approved handoff-initiation evidence model |
| Supporting Feature | `US-DEC-F05-001` | Affiliate Handoff initiation result |
| Supporting Feature | `US-DEC-F06-001` | Direct Contact reveal-and-channel-availability result |
| Supporting PRD | `PRD-0006-platform.md` | Basic Analytics consumption without redefinition |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Decision own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Decision Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall produce Affiliate Handoff Completion when an eligible Affiliate Destination is selected and the external handoff is successfully initiated.
- **AC-2** — The system shall produce Direct Contact Completion when approved contact information is revealed and the external contact channel is made available.
- **AC-3** — The system shall require no additional person confirmation after the applicable Completion evidence occurs.
- **AC-4** — The system shall keep Affiliate Handoff Completion and Direct Contact Completion as separate product results.
- **AC-5** — The system shall define Completion only as the end of the platform's in-scope V1 Decision-support responsibility.
- **AC-6** — The system shall claim no purchase, sale, booking, contract, application, call, email, reply, response, transaction, or external-service success.
- **AC-7** — The system shall produce no Completion when the Selected Offering, required eligibility, handoff initiation, contact reveal, or external-channel availability is invalid or unsuccessful.
- **AC-8** — The system shall allow PRD-0006 to consume separate Completion results, Compare Start, and Decision Chat Start without redefining their product meaning.
- **AC-9** — The system shall create no persistent personal Decision history, Favorites, Messaging, or post-handoff outcome tracking.
- **AC-10** — The system shall apply the same Completion meaning across Mobility, Real Estate, and Technology.

---

## 8. BDD

### Scenario: AC-1 — Affiliate initiation produces its Completion

```gherkin
Given F05 supplies a successful eligible Affiliate Handoff initiation result
When Completion is evaluated
Then Affiliate Handoff Completion occurs
```
### Scenario: AC-2 — Contact reveal and availability produce Completion

```gherkin
Given F06 supplies approved contact information revealed and external channel available
When Completion is evaluated
Then Direct Contact Completion occurs
```
### Scenario: AC-3 — No extra confirmation is required

```gherkin
Given Affiliate Handoff or Direct Contact Completion evidence occurs
When the platform ends the journey
Then no additional person confirmation is required
```
### Scenario: AC-4 — Completion results remain separate

```gherkin
Given one approved handoff path reaches Completion
When the product result is recorded
Then it is identified specifically as Affiliate Handoff Completion or Direct Contact Completion
```
### Scenario: AC-5 — Completion has one bounded meaning

```gherkin
Given either Completion result occurs
When its meaning is presented or consumed
Then it means the platform's in-scope V1 Decision-support responsibility ended
```
### Scenario: AC-6 — Completion claims no external success

```gherkin
Given Completion occurs
When an outcome claim is evaluated
Then no purchase, sale, booking, contract, application, call, email, reply, response, transaction, or external-service success is asserted
```
### Scenario: AC-7 — Missing evidence produces no Completion

```gherkin
Given required handoff or contact evidence is absent, invalid, or unsuccessful
When Completion is evaluated
Then no Completion occurs
```
### Scenario: AC-8 — Platform consumes but does not redefine

```gherkin
Given PRD-0006 consumes Decision product occurrences for Basic Analytics
When their meaning is used
Then the separate Decision-owned meanings remain unchanged
```
### Scenario: AC-9 — Completion creates no excluded persistence

```gherkin
Given the Decision journey reaches or fails to reach Completion
When resulting persistence is evaluated
Then no persistent personal Decision history, Favorites, Messaging, or post-handoff outcome tracking is created
```
### Scenario: AC-10 — Completion meaning is domain-consistent

```gherkin
Given a Decision journey belongs to Mobility, Real Estate, or Technology
When Completion occurs
Then the same bounded Completion meaning applies
```

---

## 9. Dependencies

### Depends On

- `US-DEC-F05-001` or `US-DEC-F06-001` — the applicable approved product evidence exists.

### Blocks

- `PRD-0006-platform.md` Basic Analytics consumption by reference.

---

## 10. Story Size

**M**

One bounded journey-end outcome with two exact evidence paths, no extra confirmation, separate product results, external-success limits, and analytics consumption boundary.

---

## 11. Out of Scope

- Affiliate Handoff and Direct Contact execution — F05/F06.
- External transaction, contact, response, or service-success tracking.
- Technical analytics events, schemas, persistence, queries, or deduplication.
- Persistent personal Decision history.

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

F07 is the Single Information Owner at Story level for applying the PRD-0004 Completion meaning to the two handoff evidence paths.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
