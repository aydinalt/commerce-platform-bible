# US-IDN-F09-001 — Direct Contact Authentication Return

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Identity Feature Registry, does not create a separate Business/Admin login identity, does not add Favorites or Messaging, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, Identity Feature Registry, or add a separate Business/Admin login identity, Favorites, or Messaging, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, architecture-boundary, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Identity Feature `F09`. The identifier consumes Domain code `IDN` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F09` from Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-IDN-F09-001` |
| Story Title | Direct Contact Authentication Return |
| Parent Story Document | `US-0003 Identity` (`US-0003-identity.md`) |
| Story Domain | Identity |
| Domain Code | `IDN` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Authenticated Action Continuity |
| Feature | `F09` — Direct Contact Authentication Return |
| Feature ID | `F09` — owned by Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Contact & Action |
| Perspective | Guest interrupted by authenticated-only Direct Contact |
| Behaviour Owner | `PRD-0003-identity.md` |
| Experience Owner | `UX-0008-authentication.md`; `UX-0009-decision-flow.md` |
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
| `[DOMAIN]` | `IDN` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F09` | Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Preserve and return to the exact interrupted Direct Contact action after successful Registration or Login while requiring fresh Decision eligibility before protected information is revealed.

---

## 4. Business Value

> **As a** Guest who explicitly chose Direct Contact for one Selected Offering  
> **I want** to authenticate and return to the exact action I intended  
> **So that** I can continue only if the Offering, selected channel, and Direct Contact conditions remain eligible

---

## 5. Description

When a Guest explicitly chooses Direct Contact, UX-0009 sends UX-0008 the exact Decision flow, Selected Offering, Direct Contact action, and already selected channel where one remains available.

Successful Registration or Login returns that unchanged context to UX-0009. Decision reevaluates all Direct Contact eligibility before any protected contact information is revealed.

If the Offering or channel is no longer eligible, Direct Contact does not continue and protected information remains unavailable. Direct Registration or Login with no interrupted action creates no return context.

Decision Chat and eligible Affiliate Handoff remain public and never use this authentication-return path.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0003-identity.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `IDN` code |
| Feature Registry | `IDENTITY_FEATURE_REGISTRY.md` | `F09` identity, scope label, references, and relationship classification |
| PRD | `PRD-0003-identity.md` | Identity behaviour and product rules |
| UX Authentication | `UX-0008-authentication.md` §10 | Exact return context and success/failure treatment |
| UX Decision | `UX-0009-decision-flow.md` §§5.3, 11.2 | Interrupted Direct Contact and exact return destination |
| Supporting PRD | `PRD-0004-decision.md` | Direct Contact eligibility and protected information |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Identity Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall create an exact return context only when a Guest explicitly attempts authenticated-only Direct Contact.
- **AC-2** — The system shall include the exact Decision flow, Selected Offering, Direct Contact action, and explicitly selected still-available channel in the return context.
- **AC-3** — The system shall keep protected Direct Contact information unavailable throughout unauthenticated Registration or Login.
- **AC-4** — The system shall return the unchanged exact context to UX-0009 after successful Registration or Login.
- **AC-5** — The system shall require UX-0009 to reevaluate Selected Offering, account, contact-channel, and Direct Contact eligibility before protected information is revealed.
- **AC-6** — The system shall prevent Direct Contact continuation when the Selected Offering or requested contact channel is no longer eligible.
- **AC-7** — The system shall create no interrupted-action return when Registration or Login was opened directly.
- **AC-8** — The system shall require no authentication-return path for public Decision Chat or an eligible Affiliate Handoff.
- **AC-9** — The system shall create no message, inbox, conversation, reply, or persistent personal Decision history through authentication return.

---

## 8. BDD

### Scenario: AC-1 — Only Direct Contact creates return context

```gherkin
Given a Guest explicitly chooses Direct Contact
When Authentication is opened
Then an exact return context is created
And public Decision Chat or Affiliate Handoff creates no such context
```
### Scenario: AC-2 — Return context contains the exact interrupted action

```gherkin
Given a Guest was interrupted by Direct Contact
When the return context is recorded
Then it contains the exact Decision flow, Selected Offering, and Direct Contact action
And it contains the selected channel when that channel was explicitly chosen and remains available
```
### Scenario: AC-3 — Protected information remains hidden during Authentication

```gherkin
Given a Guest is authenticating for Direct Contact
When Registration or Login is incomplete
Then protected telephone, email, and external contact URL information remains unavailable
```
### Scenario: AC-4 — Successful Authentication returns exact context

```gherkin
Given a valid Direct Contact return context exists
When Registration or Login succeeds
Then UX-0009 receives the unchanged exact return context
```
### Scenario: AC-5 — Decision reevaluates all gates after return

```gherkin
Given successful Authentication returned the exact Direct Contact context
When Direct Contact is resumed
Then UX-0009 reevaluates Selected Offering, account, channel, and Direct Contact eligibility
And protected information remains hidden until all gates pass
```
### Scenario: AC-6 — Invalid return context does not continue

```gherkin
Given the returned Selected Offering or contact channel is no longer eligible
When UX-0009 reevaluates the action
Then Direct Contact does not continue
And protected information remains unavailable
```
### Scenario: AC-7 — Direct Authentication invents no return action

```gherkin
Given Authentication was opened directly without interrupted Direct Contact
When Registration or Login succeeds
Then no interrupted-action return is created
And only existing authoritative context entries are available
```
### Scenario: AC-8 — Public Decision paths bypass Authentication return

```gherkin
Given a Guest uses Decision Chat or an eligible Affiliate Handoff
When the action begins
Then UX-0008 is not opened for that action
And no Direct Contact return context is created
```
### Scenario: AC-9 — Authentication return creates no Messaging or persistence

```gherkin
Given a Direct Contact return completes or fails
When resulting product state is evaluated
Then no message, inbox, conversation, reply, or persistent personal Decision history is created
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F01-001` — Direct Contact is the public-to-authenticated boundary.
- `US-IDN-F02-001` or `US-IDN-F03-001` — Registration or Login succeeds.
- `US-IDN-F06-001` — access status must be Enabled.
- `PRD-0004-decision.md` and `UX-0009-decision-flow.md` — the exact Direct Contact action and eligibility exist.

### Blocks

- Decision-domain Direct Contact continuation after successful authentication and reevaluation.

---

## 10. Story Size

**M**

One exact cross-UX continuity outcome with bounded trigger, context contract, protected-data gate, fresh eligibility evaluation, invalid-return handling, and no persistence.

---

## 11. Out of Scope

- Direct Contact channel authoring or Decision behaviour.
- Authentication mechanics owned by F02 and F03.
- Messaging, Business inbox, replies, contact confirmation, or external-success tracking.
- Persistent authentication-return or Decision history.

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

- [x] Represents one bounded Identity outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification matches the Frozen Feature Registry
- [x] No duplicate Story identified in the current Identity package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

Identity owns authentication and exact return transport; Decision owns whether Direct Contact may continue and what person-facing handoff occurs.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
