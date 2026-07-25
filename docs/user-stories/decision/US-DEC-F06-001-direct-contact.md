# US-DEC-F06-001 — Direct Contact

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Decision Feature Registry, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not make Affiliate Handoff authentication-required, does not convert Direct Contact into Messaging, does not give Completion external-success meaning, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Decision Feature Registry; does not make Compare mandatory; does not grant Decision Chat selection or handoff authority; does not make Affiliate Handoff authenticated; does not convert Direct Contact into Messaging; does not give Completion external-success meaning; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Decision Feature `F06`. The identifier consumes Domain code `DEC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F06` from Frozen `DECISION_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DEC-F06-001` |
| Story Title | Direct Contact |
| Parent Story Document | `US-0004 Decision` (`US-0004-decision.md`) |
| Story Domain | Decision |
| Domain Code | `DEC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Handoff Execution |
| Feature | `F06` — Direct Contact |
| Feature ID | `F06` — owned by Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Contact & Action |
| Perspective | Enabled authenticated person explicitly accessing one approved external contact channel |
| Behaviour Owner | `PRD-0004-decision.md` |
| Experience Owner | `UX-0009-decision-flow.md` §11; `UX-0008-authentication.md` §10 |
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
| `[FEATURE_ID]` | `F06` | Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Gate and perform one authenticated person-facing Direct Contact handoff through an approved supplied channel without creating Messaging, Business-response state, or an external-success claim.

---

## 4. Business Value

> **As a** person explicitly requesting Direct Contact for one eligible Selected Offering  
> **I want** to authenticate where required and choose one available approved contact channel  
> **So that** I can receive the approved contact information and leave through that external channel without an in-platform conversation

---

## 5. Description

Direct Contact requires an Enabled authenticated User context, one publicly eligible Selected Offering, and at least one approved supplied Business contact channel.

The complete V1 channel set is telephone number, email address, and external website or contact URL. When more than one is available, the person explicitly selects one.

A Guest sees no protected contact information. UX-0008 receives the exact interrupted action and returns it unchanged after Registration or Login; UX-0009 then reevaluates account, Offering, channel, and Direct Contact eligibility.

For a valid chosen channel, Decision reveals the approved contact information and makes the external channel available. F06 supplies the successful reveal-and-availability result to F07.

Direct Contact creates no message, inbox, conversation, reply, delivery, answer, Business-response state, or confirmation of external action.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0004-decision.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DEC` code |
| Feature Registry | `DECISION_FEATURE_REGISTRY.md` | `F06` identity, scope label, references, and relationship classification |
| PRD | `PRD-0004-decision.md` | Decision behaviour and product rules |
| UX Decision | `UX-0009-decision-flow.md` §11 | Availability, channels, reveal, and external handoff |
| UX Authentication | `UX-0008-authentication.md` §10 | Exact interrupted-action return |
| Supporting PRD | `PRD-0003-identity.md` | Enabled authenticated User gate |
| Supporting PRD | `PRD-0005-business.md` | Approved Business contact-information authoring |
| Owner Decision | `OWNER-DECISION-D04-DIRECT-CONTACT-MODEL-2026-07-21.md` | External person-facing contact model |
| Supporting Story | `US-IDN-F09-001-direct-contact-authentication-return.md` — Frozen v1.0 | Exact Authentication return |
| Supporting Feature | `US-DEC-F04-001` | Current eligible Selected Offering |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Decision own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Decision Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require User Account access status Enabled and an authenticated User context.
- **AC-2** — The system shall require the Selected Offering to remain publicly eligible.
- **AC-3** — The system shall require at least one approved supplied Business contact channel.
- **AC-4** — The system shall support only telephone number, email address, and external website or contact URL as V1 Direct Contact channels.
- **AC-5** — The system shall require explicit person selection where more than one approved channel is available.
- **AC-6** — The system shall keep protected contact information unavailable to a Guest.
- **AC-7** — The system shall send a Guest to UX-0008 with the exact interrupted Direct Contact context.
- **AC-8** — The system shall reevaluate account, Selected Offering, channel, and Direct Contact eligibility after successful Authentication return.
- **AC-9** — The system shall reveal approved contact information and make the explicitly selected external channel available only after every gate passes.
- **AC-10** — The system shall produce one successful Direct Contact reveal-and-channel-availability result for consumption by F07.
- **AC-11** — The system shall continue no Direct Contact and reveal no protected information when Authentication return or current eligibility is invalid.
- **AC-12** — The system shall create no message, inbox, conversation, reply, delivery, answer, Business-response state, or external-success confirmation.

---

## 8. BDD

### Scenario: AC-1 — Direct Contact requires Enabled authentication

```gherkin
Given Direct Contact is requested
When account access is evaluated
Then User Account access status must be Enabled
And an authenticated User context must exist
```
### Scenario: AC-2 — Selected Offering must remain eligible

```gherkin
Given one Offering is selected
When Direct Contact availability is evaluated
Then final Offering Public Eligibility must remain Eligible
```
### Scenario: AC-3 — At least one approved channel is required

```gherkin
Given an Enabled authenticated User and eligible Selected Offering
When Direct Contact availability is evaluated
Then at least one approved supplied Business contact channel must be available
```
### Scenario: AC-4 — V1 channel set is exact

```gherkin
Given Direct Contact channels are presented
When the V1 channel set is evaluated
Then only telephone number, email address, and external website or contact URL are supported
```
### Scenario: AC-5 — Multiple channels require explicit selection

```gherkin
Given more than one approved channel is available
When Direct Contact continues
Then the person explicitly selects one channel
And no channel is chosen silently
```
### Scenario: AC-6 — Guest sees no protected contact information

```gherkin
Given a Guest requests Direct Contact
When protected contact information would be needed
Then that information remains unavailable
```
### Scenario: AC-7 — Guest enters Authentication with exact context

```gherkin
Given a Guest explicitly requests Direct Contact
When Authentication is required
Then UX-0008 receives the exact Decision flow, Selected Offering, Direct Contact action, and selected still-available channel where applicable
```
### Scenario: AC-8 — Return context is revalidated

```gherkin
Given UX-0008 returns a successful exact Authentication context
When Direct Contact resumes
Then account, Selected Offering, channel, and Direct Contact eligibility are reevaluated
```
### Scenario: AC-9 — Valid contact handoff reveals and enables

```gherkin
Given every Direct Contact gate passes
And one approved channel is explicitly selected
When the person-facing handoff occurs
Then the approved contact information is revealed
And the external channel is made available
```
### Scenario: AC-10 — Successful Direct Contact result is available to Completion

```gherkin
Given approved contact information is revealed and the external channel is available
When the person-facing handoff succeeds
Then one Direct Contact result is available to F07
```
### Scenario: AC-11 — Invalid return or eligibility blocks contact

```gherkin
Given Authentication return, account, Offering, or channel eligibility is invalid
When Direct Contact is reevaluated
Then Direct Contact does not continue
And protected contact information remains unavailable
```
### Scenario: AC-12 — Direct Contact creates no Messaging workflow

```gherkin
Given Direct Contact succeeds or fails
When resulting product state is evaluated
Then no message, inbox, conversation, reply, delivery, answer, Business-response state, or external-success confirmation is created
```

---

## 9. Dependencies

### Depends On

- `US-DEC-F04-001` — one current eligible Offering is explicitly selected.
- `US-IDN-F09-001` — exact Authentication return where the requester begins as Guest.
- `PRD-0005-business.md` — approved supplied Business contact information.

### Blocks

- `US-DEC-F07-001` — successful reveal and channel availability may produce Direct Contact Completion.

---

## 10. Story Size

**L**

One authenticated contact-handoff outcome with exact gates, three channels, Guest return, revalidation, protected-data handling, successful-result boundary, and no Messaging.

---

## 11. Out of Scope

- Business contact-information authoring.
- Authentication mechanics beyond the exact return contract.
- Messaging, inbox, conversation, reply, delivery, answer, or Business response.
- Telephony, email, browser, URL, transport, session, or security implementation.
- Completion meaning and evidence — F07.

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

F06 owns person-facing Direct Contact in Contact & Action; Identity owns Authentication and Business owns contact-information authoring.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
