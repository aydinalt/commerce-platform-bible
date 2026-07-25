# US-DEC-F03-001 — Decision Chat

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Decision Feature Registry, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not make Affiliate Handoff authentication-required, does not convert Direct Contact into Messaging, does not give Completion external-success meaning, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Decision Feature Registry; does not make Compare mandatory; does not grant Decision Chat selection or handoff authority; does not make Affiliate Handoff authenticated; does not convert Direct Contact into Messaging; does not give Completion external-success meaning; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Decision Feature `F03`. The identifier consumes Domain code `DEC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F03` from Frozen `DECISION_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DEC-F03-001` |
| Story Title | Decision Chat |
| Parent Story Document | `US-0004 Decision` (`US-0004-decision.md`) |
| Story Domain | Decision |
| Domain Code | `DEC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Assistive Decision and Selection |
| Feature | `F03` — Decision Chat |
| Feature ID | `F03` — owned by Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Decision Support |
| Perspective | Person using public assistive communication within one valid Decision Context |
| Behaviour Owner | `PRD-0004-decision.md` |
| Experience Owner | `UX-0009-decision-flow.md` §7 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
| Priority | Must |
| Story Size | L |
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
| `[FEATURE_ID]` | `F03` | Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Provide public, non-autonomous assistance that explains authoritative information and helps the person prepare to select without choosing, acting, revealing protected contact information, or creating persistent memory.

---

## 4. Business Value

> **As a** person interpreting one current eligible Offering or Comparison Set  
> **I want** assistive explanations limited to my current Decision Context  
> **So that** I can understand authoritative differences and express priorities while keeping the final choice and action under my control

---

## 5. Description

Decision Chat is public for Guest and authenticated contexts, including a Suspended account only through its Guest baseline. No account is required before, during, or after Guest Chat.

Decision Chat Start occurs when assistive Chat successfully begins with one valid current Decision Context.

Chat may explain authoritative Offering information, comparable Attribute differences, authoritative values, `Not provided`, and the person's stated priorities.

Chat may not invent values, choose or mark a final Offering, initiate a handoff, select a channel, reveal protected Direct Contact information to a Guest, act outside the context, or claim external success.

Current-flow context may remain while the journey continues, but V1 creates no saved Chat history, personal Decision profile, cross-decision memory, Decision Watch, or forced account.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0004-decision.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DEC` code |
| Feature Registry | `DECISION_FEATURE_REGISTRY.md` | `F03` identity, scope label, references, and relationship classification |
| PRD | `PRD-0004-decision.md` | Decision behaviour and product rules |
| UX | `UX-0009-decision-flow.md` §7 | Public access, start, assistive boundary, and current-flow memory |
| Supporting Feature | `US-DEC-F02-001` | Valid current Decision Context |
| Supporting PRD | `PRD-0003-identity.md` | Guest and Suspended-account authentication baseline |
| Owner Decision | `OWNER-DECISION-D01-D02-GUEST-DECISION-AND-AFFILIATE-ACCESS-2026-07-21.md` | Public Guest Decision Chat |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Decision own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Decision Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Decision Chat public to Guest, Enabled User, Business context, Admin context, and a Suspended account through its Guest baseline.
- **AC-2** — The system shall require no account creation before, during, or after Guest Decision Chat.
- **AC-3** — The system shall produce Decision Chat Start only when assistive Chat successfully begins with one valid current Decision Context.
- **AC-4** — The system shall use only authoritative information belonging to the current Decision Context.
- **AC-5** — The system shall permit explanation of Offering information, comparable Attribute differences, authoritative values, `Not provided`, and person-stated priorities.
- **AC-6** — The system shall invent no unavailable Attribute value, Offering fact, ranking, winner, or recommendation.
- **AC-7** — The system shall select or mark no final Offering and initiate no Affiliate Handoff or Direct Contact.
- **AC-8** — The system shall select no Direct Contact channel and reveal no protected Direct Contact information to a Guest.
- **AC-9** — The system shall retain context only for the current Decision flow and create no saved Chat history, personal Decision profile, cross-decision memory, Decision Watch, or forced account.
- **AC-10** — The system shall claim no purchase, sale, contract, contact response, or external success.

---

## 8. BDD

### Scenario: AC-1 — Decision Chat is public

```gherkin
Given a valid Decision Context
And the person is a Guest, Enabled User, Business context, Admin context, or Suspended-account Guest baseline
When Decision Chat access is evaluated
Then Decision Chat is available without additional Decision authority
```
### Scenario: AC-2 — Guest Chat requires no account

```gherkin
Given a Guest uses Decision Chat
When the Chat starts, continues, or ends
Then Registration is not required
```
### Scenario: AC-3 — Valid Chat entry produces Decision Chat Start

```gherkin
Given one valid Decision Context exists
When assistive Chat successfully begins
Then Decision Chat Start occurs
```
### Scenario: AC-4 — Chat remains inside authoritative context

```gherkin
Given Decision Chat is active
When explanations are produced
Then only authoritative information from the current Decision Context is used
```
### Scenario: AC-5 — Chat provides bounded assistance

```gherkin
Given authoritative context information and person-stated priorities
When the person asks for assistance
Then Chat may explain the information, differences, values, `Not provided`, and expressed priorities
```
### Scenario: AC-6 — Chat invents no decision fact

```gherkin
Given authoritative information is incomplete or missing
When Chat responds
Then no unavailable value, fact, ranking, winner, or recommendation is invented
```
### Scenario: AC-7 — Chat does not choose or act

```gherkin
Given a final selection or handoff would be required
When Chat assists the person
Then Chat does not select or mark an Offering
And no Affiliate Handoff or Direct Contact is initiated
```
### Scenario: AC-8 — Chat protects Direct Contact

```gherkin
Given a Guest is using Decision Chat
When Direct Contact information or a channel choice is relevant
Then Chat selects no channel
And protected contact information remains unavailable
```
### Scenario: AC-9 — Chat creates no persistent personal memory

```gherkin
Given the current Decision flow ends
When Chat persistence is evaluated
Then no saved Chat history, personal Decision profile, cross-decision memory, Decision Watch, or forced account is created
```
### Scenario: AC-10 — Chat claims no external outcome

```gherkin
Given Chat explains a Decision journey or handoff option
When an outcome is described
Then no purchase, sale, contract, response, or external success is claimed
```

---

## 9. Dependencies

### Depends On

- `US-DEC-F02-001` — one valid current Decision Context exists.

### Blocks

- `US-DEC-F04-001` — the person may explicitly select after or without assistive Chat.

---

## 10. Story Size

**L**

One cohesive assistive outcome with public access, start occurrence, allowed assistance, human-control limits, protected-data boundary, and current-flow memory restriction.

---

## 11. Out of Scope

- Decision Context ownership — F02.
- Explicit selection — F04.
- Affiliate Handoff, Direct Contact, or Completion — F05–F07.
- AI model, prompt, provider, ranking, persistence, or session implementation.

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

Decision Chat assists under Decision Support; human selection and Contact & Action remain separate Features.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
