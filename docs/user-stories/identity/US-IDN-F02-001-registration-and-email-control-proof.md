# US-IDN-F02-001 — Registration and Email-Control Proof

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Identity Feature Registry, does not create a separate Business/Admin login identity, does not add Favorites or Messaging, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, Identity Feature Registry, or add a separate Business/Admin login identity, Favorites, or Messaging, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, architecture-boundary, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Identity Feature `F02`. The identifier consumes Domain code `IDN` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F02` from Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-IDN-F02-001` |
| Story Title | Registration and Email-Control Proof |
| Parent Story Document | `US-0003 Identity` (`US-0003-identity.md`) |
| Story Domain | Identity |
| Domain Code | `IDN` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Public Access and Account Establishment |
| Feature | `F02` — Registration and Email-Control Proof |
| Feature ID | `F02` — owned by Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Guest creating a persistent User Account |
| Behaviour Owner | `PRD-0003-identity.md` |
| Experience Owner | `UX-0008-authentication.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
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
| `[FEATURE_ID]` | `F02` | Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Create exactly one Enabled User Account only after the Guest proves control of the supplied email address.

---

## 4. Business Value

> **As a** Guest choosing to register  
> **I want** to establish one account after proving control of my email address  
> **So that** I can enter an authenticated User context without a separate Pending, Verified, Business, or Admin identity

---

## 5. Description

Registration requires an email address and password. Registration is incomplete until email-control proof succeeds.

Successful completion creates exactly one User Account, records the supplied email as its registered email address, assigns access status Enabled, and enters the authenticated User context.

No separate Pending or Verified User Account state is created. Where the email already identifies an account, a second account is not created and the person is directed toward Login or Password Recovery.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0003-identity.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `IDN` code |
| Feature Registry | `IDENTITY_FEATURE_REGISTRY.md` | `F02` identity, scope label, references, and relationship classification |
| PRD | `PRD-0003-identity.md` | Identity behaviour and product rules |
| UX | `UX-0008-authentication.md` §6 | Registration, proof, completion, and existing-email experience |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Identity Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require an email address and password to begin V1 registration.
- **AC-2** — The system shall keep registration incomplete until control of the supplied email address is proven.
- **AC-3** — The system shall create exactly one User Account when valid Registration and email-control proof complete.
- **AC-4** — The system shall record the supplied email address as the registered email address for the new User Account.
- **AC-5** — The system shall set the newly created User Account access status to Enabled.
- **AC-6** — The system shall enter the person into an authenticated User context after successful Registration.
- **AC-7** — The system shall create no separate Pending or Verified User Account state.
- **AC-8** — The system shall prevent creation of a second account when the supplied email already identifies an existing User Account.
- **AC-9** — The system shall grant no Business ownership or Admin authorization through Registration.

---

## 8. BDD

### Scenario: AC-1 — Registration requires the approved information

```gherkin
Given a Guest chooses Registration
When required information is requested
Then an email address and password are required
```
### Scenario: AC-2 — Email control proof gates completion

```gherkin
Given a Guest supplied an email address and password
When control of the email address has not been proven
Then Registration remains incomplete
And no Enabled authenticated context is available
```
### Scenario: AC-3 — Completion creates one account

```gherkin
Given valid Registration information and successful email-control proof
When Registration completes
Then exactly one User Account is created
```
### Scenario: AC-4 — Supplied email becomes the registered email

```gherkin
Given a new User Account is created through completed Registration
When account identity is established
Then the supplied email address is recorded as the registered email address
```
### Scenario: AC-5 — New account is Enabled

```gherkin
Given Registration has completed successfully
When the account access status is established
Then User Account access status is Enabled
```
### Scenario: AC-6 — Successful Registration enters User context

```gherkin
Given one Enabled User Account was created
When Registration completes
Then the person enters an authenticated User context
```
### Scenario: AC-7 — No extra account state is created

```gherkin
Given Registration is incomplete or complete
When product-level account states are evaluated
Then no separate Pending or Verified User Account state exists
```
### Scenario: AC-8 — Existing email does not create a duplicate account

```gherkin
Given the supplied email already identifies one User Account
When the person attempts Registration
Then a second User Account is not created
And Login or Password Recovery remains available
```
### Scenario: AC-9 — Registration grants no elevated relationship

```gherkin
Given Registration completes
When resulting relationships are evaluated
Then no Business ownership is created by Identity
And no Admin authorization is granted
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F01-001` — Registration begins from the Guest baseline.

### Blocks

- `US-IDN-F03-001` — the registered email may later be used for Login.
- `US-IDN-F05-001` — the registered email may later be used for Password Recovery.
- `US-IDN-F09-001` — completed Registration may return to interrupted Direct Contact.

---

## 10. Story Size

**M**

One account-establishment outcome with proof gating, uniqueness, exact resulting status/context, and explicit relationship exclusions.

---

## 11. Out of Scope

- Email delivery provider, token, timeout, retry, password policy, credential storage, or session implementation.
- Business creation.
- Admin authorization provisioning.
- Identity verification policy.

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

Email-control proof completes Registration; it does not introduce a persistent Verified account state.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
