# US-BUS-F02-001 — Business Information and Exposure

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Business Feature Registry; does not create a separate Business login identity; does not require prior Admin approval for Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Business Feature Registry; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public identity with protected Direct Contact; does not move final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Business Feature `F02`. The identifier consumes Domain code `BUS` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F02` from Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-BUS-F02-001` |
| Story Title | Business Information and Exposure |
| Parent Story Document | `US-0005 Business` (`US-0005-business.md`) |
| Story Domain | Business |
| Domain Code | `BUS` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Business Establishment and Information |
| Feature | `F02` — Business Information and Exposure |
| Feature ID | `F02` — owned by Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Presentation; Contact & Action |
| Perspective | Authorized owner managing Business identity and Direct Contact information |
| Behaviour Owner | `PRD-0005-business.md` |
| Experience Owner | `UX-0005-business-dashboard.md` §7; `UX-0003-offering-detail.md` §8.5; `UX-0009-decision-flow.md` §11 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
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
| `[FEATURE_ID]` | `F02` | Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Manage the complete Business Information set while keeping public Business identity and authenticated-only Direct Contact exposure distinct.

---

## 4. Business Value

> **As a** authorized owner of the selected Business  
> **I want** to maintain Business identity and optional contact fields  
> **So that** approved public identity can support Offering Presentation while protected contact information remains available only through authenticated Direct Contact

---

## 5. Description

The owner may view and edit every Business Information field for the exact selected owned Business: required display name; optional logo or brand image; optional short description; optional telephone; optional email; optional external website or contact URL.

Business display name remains non-empty. Optional fields may be added, changed, or removed. Supplying zero Direct Contact channels is allowed.

The public Business identity set consists only of display name, supplied logo, and supplied short description. PRD-0001 may consume that set inside complete Offering Presentation only when Business Public Exposure Input and final Offering Public Eligibility are both `Eligible`.

Telephone, email, and external website/contact URL are never part of public Business identity, remain unavailable to Guests, and may be revealed only to an Enabled authenticated User through PRD-0004 Direct Contact.

Changing valid Business Information changes no moderation status, exposure input, Offering lifecycle, final Offering Public Eligibility, or Completion by itself. Owner/Admin management visibility remains separate from public exposure.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0005-business.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `BUS` code |
| Feature Registry | `BUSINESS_FEATURE_REGISTRY.md` | `F02` identity, scope label, references, and relationship classification |
| PRD | `PRD-0005-business.md` | Business behaviour and product rules |
| UX Management | `UX-0005-business-dashboard.md` §7 | Business Information and Direct Contact authoring |
| UX Presentation | `UX-0003-offering-detail.md` §8.5 | Public Business identity subset |
| UX Contact | `UX-0009-decision-flow.md` §11 | Authenticated Direct Contact consumption |
| Supporting PRD | `PRD-0001-offering.md` | Complete Offering Presentation and final Offering Public Eligibility |
| Supporting PRD | `PRD-0003-identity.md` | Authenticated-only protection |
| Supporting PRD | `PRD-0004-decision.md` | Reveal, channel choice, handoff, and Completion |
| Owner Decision | `OWNER-DECISION-D04-DIRECT-CONTACT-MODEL-2026-07-21.md` | Three-channel external Direct Contact model |
| Owner Decision | `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md` | Business exposure input versus final Offering eligibility |
| Supporting Story | `US-DEC-F06-001-direct-contact.md` — Frozen v1.0 | Authenticated person-facing Direct Contact |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Business own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Business Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow the authorized owner to view every Business Information field for the exact selected owned Business.
- **AC-2** — The system shall allow the authorized owner to edit display name, logo, short description, telephone, email, and external website or contact URL.
- **AC-3** — The system shall reject a save that removes or empties the Business display name.
- **AC-4** — The system shall allow optional logo, description, telephone, email, and external website or contact URL to be added, changed, or removed.
- **AC-5** — The system shall allow a Business to exist with zero supplied Direct Contact channels.
- **AC-6** — The system shall define the public Business identity set as display name plus supplied logo and supplied short description only.
- **AC-7** — The system shall make the public Business identity set available to PRD-0001 only when Business Public Exposure Input and final Offering Public Eligibility are both `Eligible`.
- **AC-8** — The system shall expose no Business Information publicly through an owned Offering while Business Public Exposure Input is `Ineligible`.
- **AC-9** — The system shall keep telephone, email, and external website or contact URL unavailable to Guests and outside public Business identity.
- **AC-10** — The system shall make supplied Direct Contact information available only through PRD-0004 to an Enabled authenticated User.
- **AC-11** — The system shall make Direct Contact unavailable where no approved supplied channel exists.
- **AC-12** — The system shall change no Business Moderation Status, Business Public Exposure Input, Offering lifecycle, final Offering Public Eligibility, or Completion solely because valid Business Information is edited.
- **AC-13** — The system shall keep owner and authorized Admin visibility separate from public exposure.
- **AC-14** — The system shall create no Business inbox, conversation, response workflow, or Messaging through Direct Contact information management.

---

## 8. BDD

### Scenario: AC-1 — Owner views every Business field

```gherkin
Given an Enabled owner is in the exact Business context
When Business Information is opened
Then every Business Information field is visible to the owner
```
### Scenario: AC-2 — Owner edits the complete information set

```gherkin
Given the owner manages the exact Business
When a valid edit is made
Then display name, logo, short description, telephone, email, or external website/contact URL may be changed
```
### Scenario: AC-3 — Display name remains required

```gherkin
Given the owner attempts to save Business Information
When the display name is absent or empty
Then the save is rejected
```
### Scenario: AC-4 — Optional fields remain optional

```gherkin
Given the Business has optional information
When the owner adds, changes, or removes an optional field
Then the valid change may be saved
```
### Scenario: AC-5 — Zero Direct Contact channels are allowed

```gherkin
Given no telephone, email, or external contact URL is supplied
When Business Information is saved
Then the Business remains valid
```
### Scenario: AC-6 — Public identity subset is exact

```gherkin
Given Business Information exists
When the public Business identity set is composed
Then it contains display name
And supplied logo and short description may be included
And telephone, email, and external contact URL are excluded
```
### Scenario: AC-7 — Public identity requires both eligibility conditions

```gherkin
Given an owned Offering is presented
When Business exposure and final Offering eligibility are evaluated
Then public Business identity is available only when both results are `Eligible`
```
### Scenario: AC-8 — Ineligible exposure hides Business Information

```gherkin
Given Business Public Exposure Input is `Ineligible`
When an owned Offering is viewed publicly
Then no Business Information is publicly exposed through that Offering
```
### Scenario: AC-9 — Protected contact remains non-public

```gherkin
Given a Guest views an Offering or Decision flow
When protected Business contact information is evaluated
Then telephone, email, and external website/contact URL remain unavailable
```
### Scenario: AC-10 — Direct Contact exposure uses the approved gate

```gherkin
Given one or more approved contact channels are supplied
When Direct Contact exposure is requested
Then an Enabled authenticated User context is required
And PRD-0004 owns reveal and handoff
```
### Scenario: AC-11 — No channel means no Direct Contact

```gherkin
Given the Business supplies no approved Direct Contact channel
When Direct Contact availability is evaluated
Then Direct Contact is unavailable
```
### Scenario: AC-12 — Information edit has no automatic state effects

```gherkin
Given valid Business Information is saved
When related product states are evaluated
Then moderation status, exposure input, Offering lifecycle, final Offering eligibility, and Completion remain unchanged by the edit alone
```
### Scenario: AC-13 — Management visibility and public exposure are distinct

```gherkin
Given Business Information is not publicly exposed
When the authorized owner or Admin performs approved management or review
Then required management visibility may remain available
```
### Scenario: AC-14 — Contact authoring creates no Messaging

```gherkin
Given Business contact information is managed or consumed
When resulting Business behaviour is evaluated
Then no inbox, conversation, response workflow, or Messaging is created
```

---

## 9. Dependencies

### Depends On

- `US-BUS-F01-001` — one owned Business exists.
- `US-IDN-F07-001` — the acting User is authorized for the exact Business context.

### Blocks

- `US-DEC-F06-001` — approved supplied channels may support authenticated Direct Contact.
- `US-OFR-F05-001` — eligible public Business identity may support complete Offering Presentation.

---

## 10. Story Size

**L**

One Business-information outcome with exact field set, required invariant, optional contact authoring, public identity subset, authenticated exposure, and non-state-change boundaries.

---

## 11. Out of Scope

- Offering Presentation composition and final Offering Public Eligibility.
- Direct Contact reveal, channel selection, handoff, and Completion.
- Dedicated public Business page.
- Messaging, inbox, reply, lead management, or contact-response tracking.
- Technical field, telephone, email, or URL validation.

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

Business owns information authoring; Presentation and Contact & Action consume approved subsets without transferring ownership.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
