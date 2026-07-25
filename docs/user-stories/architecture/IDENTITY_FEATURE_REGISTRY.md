# Identity Story Domain Feature Registry

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Date:** 2026-07-22
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Approved candidate:** In Review v0.1
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Identity
- **Domain Code:** IDN
- **Parent Story Document:** US-0003
- **Authority:** `ADR-0009-story-domain-feature-registry-ownership.md`
- **Generated Story allocation:** Available from Frozen v1.0 Feature IDs
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Feature Registry baseline for Story Domain `IDN`. Its Active Feature IDs may now be consumed by authoritative Generated Story identifiers under the Frozen User Story Handbook. This exact registry must not be edited in place. Future Feature ID allocation, retirement, canonical-name correction, authority-reference change, or relationship-classification change requires a controlled revision. This Freeze creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Feature Registry baseline under the first-approval versioning rule. All registry Feature entry statuses become Active. This historical Approval Note records that approval and Freeze were separate decisions. The registry was subsequently Frozen on 2026-07-22, making its Active Feature IDs available for authoritative Generated Story allocation. This approval creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Creation Note (0.1):** Initial controlled Feature-ID allocation proposal for Story Domain `IDN`, authorized by Accepted `ADR-0009-story-domain-feature-registry-ownership.md`. All Feature entries are Active, but they cannot be consumed by authoritative Generated Story IDs until this registry is Frozen. No Capability, Capability Map, PRD/UX behaviour, Epic placement, Story content, or implementation is created.

**Review Entry Note (0.1):** The exact Draft v0.1 content entered formal review without changing Feature IDs, Feature names, scope labels, authority references, relationship classifications, or lifecycle gates. The registry is now authoritative as Approved v1.0 and its entries are Active; Story allocation remains blocked until Freeze.

> This document is the Single Information Owner for `IDN` Feature IDs and bounded Feature identity metadata. It is not a Capability Architecture document and defines no product behaviour, UX behaviour, Epic placement, Story content, or implementation.

---

## 1. Purpose

Provide stable, domain-local Feature identities that may later be consumed by Generated User Story identifiers for the Identity Story Domain.

## 2. Scope

This registry owns only:

- Feature ID allocation within `IDN`;
- canonical Feature names;
- Feature identity status;
- Feature-ID reservation and retirement;
- short non-behavioural Feature scope labels;
- behaviour-owner references;
- applicable UX references;
- Capability relationship classifications by reference.

## 3. Out of Scope

- product behaviour or business rules;
- UX interaction or visual design;
- Capability definitions or Capability Maps;
- Epic placement;
- Generated Story content, identifiers, lifecycle, estimation, or delivery planning;
- implementation architecture, APIs, storage, or technology;
- changes to PRD, UX, ADR, governance, or Offering Feature ownership.

## 4. Governing Rules

1. Feature IDs are unique within Story Domain `IDN`.
2. The complete Story identifier remains globally unambiguous through the Domain code.
3. Feature IDs are never allocated by Parent Story Documents or Generated Stories.
4. Active entries in this Frozen registry are authoritative for Story ID allocation.
5. A Feature ID is available for authoritative Generated Story use because this registry is Approved and Frozen.
6. Feature IDs are never recycled after authoritative use.
7. A Frozen registry is never edited in place.
8. Behaviour remains owned by `PRD-0003-identity.md`.
9. UX behaviour remains owned by the referenced Frozen UX documents.
10. Capability names and boundaries are referenced, never redefined.

## 5. Relationship Classification Vocabulary

This registry uses only:

- **Direct Frozen assignment** — the governing Accepted ADR or Frozen Capability Map directly assigns the behaviour to an existing Offering Capability.
- **Supporting relationship** — the domain Feature supports or governs access/action around an existing Capability-owned flow without becoming its behaviour owner.
- **No Capability Architecture required** — own-domain V1 behaviour follows the direct ADR-0007 authority chain.

Relationship classification is descriptive by reference and does not create a Feature → Capability decision beyond the cited authority.

## 6. Authoritative Feature Registry

| Feature ID | Canonical Feature Name | Entry Status | Short Scope Label | Behaviour Owner Reference | Applicable UX Reference | Relationship Type | Capability Reference | Notes |
|---|---|---|---|---|---|---|---|---|
| F01 | Public Guest Access Baseline | Active | Public platform use without an authenticated User context. | `PRD-0003-identity.md` §§5, 7, 10.1 | `UX-0001-home.md`; `UX-0002-discovery.md`; `UX-0009-decision-flow.md` | Supporting relationship | Discovery; Decision Support; Contact & Action | Identity owns the access gate; public product behaviour remains owned by the applicable PRDs. |
| F02 | Registration and Email-Control Proof | Active | Creation of one Enabled User Account after email-control proof. | `PRD-0003-identity.md` §§6, 9.2, 10.3 | `UX-0008-authentication.md` §6 | No Capability Architecture required | Not required under ADR-0007 | Own-domain Identity behaviour. |
| F03 | Login | Active | Entry to authenticated User context using registered email address and password. | `PRD-0003-identity.md` §§6, 10.4 | `UX-0008-authentication.md` §7 | No Capability Architecture required | Not required under ADR-0007 | Suspended accounts remain outside authenticated contexts. |
| F04 | Logout | Active | Exit from authenticated User, Business, or Admin context to the Guest baseline. | `PRD-0003-identity.md` §10.4 | `UX-0008-authentication.md` §8.4 | No Capability Architecture required | Not required under ADR-0007 | Does not remove ownership or authorization relationships. |
| F05 | Password Recovery | Active | Unauthenticated recovery through the registered email while preserving the same account. | `PRD-0003-identity.md` §§9.3, 10.5 | `UX-0008-authentication.md` §9 | No Capability Architecture required | Not required under ADR-0007 | Does not reinstate suspension or grant authorization. |
| F06 | User Account Access Status | Active | Governance and consequences of Enabled and Suspended User Account access. | `PRD-0003-identity.md` §§6, 9.1, 10.8 | `UX-0008-authentication.md` §§7, 14 | No Capability Architecture required | Not required under ADR-0007 | Admin actions may request transitions; Identity owns the authoritative account result. |
| F07 | Business Context Access | Active | Explicit entry into one owned Business context from the same User Account. | `PRD-0003-identity.md` §§7, 9.2, 10.6 | `UX-0008-authentication.md` §8.2; `UX-0005-business-dashboard.md` §5 | No Capability Architecture required | Not required under ADR-0007 | Does not create ownership or a separate Business login. |
| F08 | Admin Authorization and Context Access | Active | Owner-governed Admin authorization and explicit Admin-context entry. | `PRD-0003-identity.md` §§6, 9.4, 10.7 | `UX-0008-authentication.md` §8.3; `UX-0006-admin-dashboard.md` §5 | No Capability Architecture required | Not required under ADR-0007 | Admin authorization attaches to the existing User Account and grants no Business ownership. |
| F09 | Direct Contact Authentication Return | Active | Exact return to an interrupted authenticated-only Direct Contact action. | `PRD-0003-identity.md` §§10.2–10.4 | `UX-0008-authentication.md` §10; `UX-0009-decision-flow.md` §11.2 | Supporting relationship | Contact & Action | Identity owns authentication and return; Decision owns the person-facing Direct Contact flow. |

## 7. Feature Entry Records

### F01 — Public Guest Access Baseline

- **Entry status:** Active
- **Short scope label:** Public platform use without an authenticated User context.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§5, 7, 10.1
- **Applicable UX reference:** `UX-0001-home.md`; `UX-0002-discovery.md`; `UX-0009-decision-flow.md`
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Discovery; Decision Support; Contact & Action
- **Boundary note:** Identity owns the access gate; public product behaviour remains owned by the applicable PRDs.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F02 — Registration and Email-Control Proof

- **Entry status:** Active
- **Short scope label:** Creation of one Enabled User Account after email-control proof.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§6, 9.2, 10.3
- **Applicable UX reference:** `UX-0008-authentication.md` §6
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Own-domain Identity behaviour.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F03 — Login

- **Entry status:** Active
- **Short scope label:** Entry to authenticated User context using registered email address and password.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§6, 10.4
- **Applicable UX reference:** `UX-0008-authentication.md` §7
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Suspended accounts remain outside authenticated contexts.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F04 — Logout

- **Entry status:** Active
- **Short scope label:** Exit from authenticated User, Business, or Admin context to the Guest baseline.
- **Behaviour owner reference:** `PRD-0003-identity.md` §10.4
- **Applicable UX reference:** `UX-0008-authentication.md` §8.4
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Does not remove ownership or authorization relationships.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F05 — Password Recovery

- **Entry status:** Active
- **Short scope label:** Unauthenticated recovery through the registered email while preserving the same account.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§9.3, 10.5
- **Applicable UX reference:** `UX-0008-authentication.md` §9
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Does not reinstate suspension or grant authorization.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F06 — User Account Access Status

- **Entry status:** Active
- **Short scope label:** Governance and consequences of Enabled and Suspended User Account access.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§6, 9.1, 10.8
- **Applicable UX reference:** `UX-0008-authentication.md` §§7, 14
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Admin actions may request transitions; Identity owns the authoritative account result.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F07 — Business Context Access

- **Entry status:** Active
- **Short scope label:** Explicit entry into one owned Business context from the same User Account.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§7, 9.2, 10.6
- **Applicable UX reference:** `UX-0008-authentication.md` §8.2; `UX-0005-business-dashboard.md` §5
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Does not create ownership or a separate Business login.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F08 — Admin Authorization and Context Access

- **Entry status:** Active
- **Short scope label:** Owner-governed Admin authorization and explicit Admin-context entry.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§6, 9.4, 10.7
- **Applicable UX reference:** `UX-0008-authentication.md` §8.3; `UX-0006-admin-dashboard.md` §5
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Admin authorization attaches to the existing User Account and grants no Business ownership.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F09 — Direct Contact Authentication Return

- **Entry status:** Active
- **Short scope label:** Exact return to an interrupted authenticated-only Direct Contact action.
- **Behaviour owner reference:** `PRD-0003-identity.md` §§10.2–10.4
- **Applicable UX reference:** `UX-0008-authentication.md` §10; `UX-0009-decision-flow.md` §11.2
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Contact & Action
- **Boundary note:** Identity owns authentication and return; Decision owns the person-facing Direct Contact flow.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.


## 8. Identifier Examples

After this registry is Frozen, Generated Stories may use identifiers such as:

```text
US-IDN-F01-001
US-IDN-F02-001
```

The `[ID]` segment remains owned by the User Story Handbook rules.

## 9. Story Generation Gate

Current state:

```text
Registry status: Frozen v1.0
Feature entry status: Active
Generated Story allocation: Available
```

The gate is open because the registry completed:

```text
Architecture Review
→ Final Review
→ explicit Owner Approval
→ separate Owner Freeze
```

The applicable registry is now Frozen; its Active Feature IDs may be consumed by authoritative Generated Story identifiers.

## 10. Change Rules

A controlled revision is required for:

- allocating another Feature ID;
- correcting a canonical Feature name;
- changing a scope label;
- changing an authority or UX reference;
- changing a relationship classification;
- retiring a Feature.

No revision may silently renumber an ID already consumed by an authoritative Story.

## 11. Related Documents

- `ADR-0009-story-domain-feature-registry-ownership.md`
- `ADR-0007-domain-scope-of-capability-first-rule.md`
- `USER_STORY_HANDBOOK.md`
- `REPOSITORY_GOVERNANCE.md`
- `OFFERING_CAPABILITY_ARCHITECTURE.md`
- `PRD-0003-identity.md`
- `US-0003`

## 12. Readiness

The registry is ready for review when:

- every Feature is independently identifiable;
- no two entries duplicate the same bounded Feature concern;
- every entry has a behaviour-owner reference;
- every applicable UX reference is recorded;
- every Capability relationship follows ADR-0007 and ADR-0009;
- no entry defines behaviour or Epic placement;
- no Feature ID is missing or duplicated.

This document is Frozen v1.0 and must not be edited in place.
