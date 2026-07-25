# US-BUS-F07-001 — Correction Notice and Owner Response

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Business Feature Registry; does not create a separate Business login identity; does not require prior Admin approval for Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Business Feature Registry; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public identity with protected Direct Contact; does not move final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Business Feature `F07`. The identifier consumes Domain code `BUS` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F07` from Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-BUS-F07-001` |
| Story Title | Correction Notice and Owner Response |
| Parent Story Document | `US-0005 Business` (`US-0005-business.md`) |
| Story Domain | Business |
| Domain Code | `BUS` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Correction Response and Re-Review |
| Feature | `F07` — Correction Notice and Owner Response |
| Feature ID | `F07` — owned by Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Target-owned Capability by reference |
| Perspective | Authorized Business owner responding to one approved Request Correction target |
| Behaviour Owner | `PRD-0005-business.md` |
| Experience Owner | `UX-0005-business-dashboard.md` §§11–12; `UX-0006-admin-dashboard.md` §8 |
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
| `[DOMAIN]` | `BUS` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F07` | Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Present one bounded correction notice and permit only the normally authorized or exact targeted owner edit while keeping the moderation case Open for Platform re-review.

---

## 4. Business Value

> **As a** authorized owner of the Business affected by Request Correction  
> **I want** to see the exact target and open the permitted management area  
> **So that** I can correct approved Business-owned information without Messaging, unrelated authority, automatic case closure, or automatic eligibility restoration

---

## 5. Description

Request Correction targets are exactly Business Information, Offering content, Affiliate Destination configuration, and Direct Contact information. User Account correction is outside V1.

The Business Dashboard may show a correction notice identifying the affected target area and open the applicable authorized management area. The notice changes no state or eligibility result by itself and creates no message, conversation, ticket discussion, reply, or inbox.

The owner may edit only information normally authorized under the current Business and target rules. For a Restricted Business, the bounded Offering correction path requires an Open case, Offering-content target, Published or Hidden lifecycle, exact owner, exact Offering, and exact targeted content area.

The bounded edit grants no new Offering creation, Draft publication, unrelated or untargeted edit, lifecycle change, moderation/exposure change, public eligibility, or automatic case closure. The saved result must preserve the Universal Publication Minimum.

After owner edit, the case remains Open; the Business remains Restricted, exposure input remains Ineligible, the Offering remains Published or Hidden and publicly ineligible, and Platform re-review is required. Platform may later apply an approved action, make a no-action decision, and explicitly close the case.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0005-business.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `BUS` code |
| Feature Registry | `BUSINESS_FEATURE_REGISTRY.md` | `F07` identity, scope label, references, and relationship classification |
| PRD | `PRD-0005-business.md` | Business behaviour and product rules |
| UX Business | `UX-0005-business-dashboard.md` §§11–12 | Bounded correction-edit path and notices |
| UX Admin | `UX-0006-admin-dashboard.md` §8 | Request Correction and re-review |
| Supporting PRD | `PRD-0001-offering.md` | Universal Publication Minimum and Offering state |
| Supporting PRD | `PRD-0006-platform.md` | Open/Closed case, re-review, action, and closure |
| Owner Decision | `OWNER-DECISION-D15-D16-RETIREMENT-AND-MODERATION-OUTCOMES-2026-07-21.md` | General Moderation and correction boundaries |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Business own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Business Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall accept only Business Information, Offering content, Affiliate Destination configuration, or Direct Contact information as V1 Request Correction targets for Business response.
- **AC-2** — The system shall exclude User Account correction from the V1 Business correction target set.
- **AC-3** — The system shall show a correction notice that identifies the exact approved target area.
- **AC-4** — The system shall open only the applicable currently authorized management area from the notice.
- **AC-5** — The system shall change no lifecycle, moderation, access, exposure, eligibility, validation, or case state solely because the notice exists.
- **AC-6** — The system shall create no message, conversation, ticket discussion, reply, inbox, or Messaging through the correction notice.
- **AC-7** — The system shall allow the owner to edit only information normally authorized under the current Business and exact target rules.
- **AC-8** — The system shall allow the Restricted-Business bounded Offering correction path only for an Open case targeting Offering content on an exact Published or Hidden Offering owned by the acting User.
- **AC-9** — The system shall limit a bounded Offering correction to the exact Offering and exact targeted content area.
- **AC-10** — The system shall grant no new Offering creation, Draft publication, unrelated Published/Hidden edit, untargeted edit, lifecycle change, moderation-status change, exposure-input change, public eligibility, or automatic case closure.
- **AC-11** — The system shall require the saved bounded Offering correction to preserve the Universal Publication Minimum.
- **AC-12** — The system shall keep the General Moderation Case `Open` after an owner edit.
- **AC-13** — The system shall keep a bounded correction Business `Restricted`, exposure input `Ineligible`, and the target Offering Published or Hidden and publicly ineligible until Platform re-review.
- **AC-14** — The system shall require Platform re-review after a bounded correction edit.
- **AC-15** — The system shall leave approved action, no-action decision, and explicit case closure to PRD-0006.

---

## 8. BDD

### Scenario: AC-1 — Correction target set is exact

```gherkin
Given Platform records Request Correction for Business response
When the target is evaluated
Then it is Business Information, Offering content, Affiliate Destination configuration, or Direct Contact information
```
### Scenario: AC-2 — User Account correction is absent

```gherkin
Given Request Correction concerns a User Account
When Business correction notice eligibility is evaluated
Then no Business owner response path is created
```
### Scenario: AC-3 — Notice identifies the exact target

```gherkin
Given an approved Request Correction exists
When the Business owner views correction notices
Then the affected target area is identified
```
### Scenario: AC-4 — Notice opens bounded management area

```gherkin
Given the owner selects a correction notice
When the target area is opened
Then only the applicable currently authorized management area is entered
```
### Scenario: AC-5 — Notice changes no state

```gherkin
Given a correction notice is presented
When authoritative states are evaluated
Then no lifecycle, moderation, access, exposure, eligibility, validation, or case state changes
```
### Scenario: AC-6 — Correction notice is not Messaging

```gherkin
Given the owner views or opens a correction notice
When communication behaviour is evaluated
Then no message, conversation, ticket discussion, reply, inbox, or Messaging is created
```
### Scenario: AC-7 — Owner response follows ordinary authorization

```gherkin
Given a correction notice identifies a target
When the owner attempts an edit
Then the edit is limited to current Business and target authorization
```
### Scenario: AC-8 — Bounded Offering correction requires all gates

```gherkin
Given the Business is `Restricted`
And the General Moderation Case is Open
And the target is Offering content
And the exact Offering is Published or Hidden
And the acting User is the authorized owner
When bounded correction entry is requested
Then the path may become available
```
### Scenario: AC-9 — Bounded edit is exact

```gherkin
Given the bounded correction path is available
When the owner edits
Then only the exact identified Offering and targeted content area may change
```
### Scenario: AC-10 — Bounded edit grants no unrelated authority

```gherkin
Given the owner uses the bounded correction path
When resulting permissions are evaluated
Then no creation, publication, unrelated or untargeted edit, lifecycle change, moderation or exposure change, public eligibility, or automatic closure is granted
```
### Scenario: AC-11 — Saved correction preserves publication minimum

```gherkin
Given the owner saves a bounded Offering correction
When PRD-0001 publication minimum is evaluated
Then the Universal Publication Minimum remains satisfied
```
### Scenario: AC-12 — Owner edit does not close the case

```gherkin
Given the owner saves an authorized correction
When case status is evaluated
Then the case remains `Open`
```
### Scenario: AC-13 — Bounded correction preserves restricted outcomes

```gherkin
Given a bounded correction edit is saved
When Business and Offering results are evaluated before re-review
Then the Business remains `Restricted`
And exposure input remains `Ineligible`
And the Offering remains Published or Hidden and publicly ineligible
```
### Scenario: AC-14 — Bounded edit requires re-review

```gherkin
Given a bounded correction edit is saved
When the correction response proceeds
Then Platform re-review is required
```
### Scenario: AC-15 — Platform owns post-response moderation

```gherkin
Given Platform re-review occurs
When the case is resolved
Then PRD-0006 owns approved action, no-action decision, and explicit closure
```

---

## 9. Dependencies

### Depends On

- `PRD-0006-platform.md` — an Open Request Correction case and exact target exist.
- `US-BUS-F03-001` — Restricted Business consequences apply where bounded correction is used.
- `US-BUS-F04-001` — the exact active Business context exists.

### Blocks

- `PRD-0006-platform.md` — Platform re-review may proceed after owner response.

---

## 10. Story Size

**L**

One bounded correction-response outcome with exact target set, notice semantics, ordinary and Restricted authorization, precise edit boundary, state preservation, and Platform re-review handoff.

---

## 11. Out of Scope

- General Moderation Case creation, action authorization, Open/Closed status ownership, or Admin closure.
- User Account correction.
- Messaging, inbox, conversation, reply, or ticket discussion.
- Automatic moderation, eligibility restoration, or case closure.
- Technical diff, form, storage, notification, or audit implementation.

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

- [x] Represents one bounded Business outcome
- [x] Provides observable owner, person, or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Business package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

F07 owns the Business-side notice and authorized response; the exact target retains its own Capability home and Platform owns re-review and closure.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
