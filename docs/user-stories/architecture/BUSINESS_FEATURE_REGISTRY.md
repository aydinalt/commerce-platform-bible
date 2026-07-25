# Business Story Domain Feature Registry

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
- **Story Domain:** Business
- **Domain Code:** BUS
- **Parent Story Document:** US-0005
- **Authority:** `ADR-0009-story-domain-feature-registry-ownership.md`
- **Generated Story allocation:** Available from Frozen v1.0 Feature IDs
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Feature Registry baseline for Story Domain `BUS`. Its Active Feature IDs may now be consumed by authoritative Generated Story identifiers under the Frozen User Story Handbook. This exact registry must not be edited in place. Future Feature ID allocation, retirement, canonical-name correction, authority-reference change, or relationship-classification change requires a controlled revision. This Freeze creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Feature Registry baseline under the first-approval versioning rule. All registry Feature entry statuses become Active. This historical Approval Note records that approval and Freeze were separate decisions. The registry was subsequently Frozen on 2026-07-22, making its Active Feature IDs available for authoritative Generated Story allocation. This approval creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Creation Note (0.1):** Initial controlled Feature-ID allocation proposal for Story Domain `BUS`, authorized by Accepted `ADR-0009-story-domain-feature-registry-ownership.md`. All Feature entries are Active, but they cannot be consumed by authoritative Generated Story IDs until this registry is Frozen. No Capability, Capability Map, PRD/UX behaviour, Epic placement, Story content, or implementation is created.

**Review Entry Note (0.1):** The exact Draft v0.1 content entered formal review without changing Feature IDs, Feature names, scope labels, authority references, relationship classifications, or lifecycle gates. The registry is now authoritative as Approved v1.0 and its entries are Active; Story allocation remains blocked until Freeze.

> This document is the Single Information Owner for `BUS` Feature IDs and bounded Feature identity metadata. It is not a Capability Architecture document and defines no product behaviour, UX behaviour, Epic placement, Story content, or implementation.

---

## 1. Purpose

Provide stable, domain-local Feature identities that may later be consumed by Generated User Story identifiers for the Business Story Domain.

## 2. Scope

This registry owns only:

- Feature ID allocation within `BUS`;
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

1. Feature IDs are unique within Story Domain `BUS`.
2. The complete Story identifier remains globally unambiguous through the Domain code.
3. Feature IDs are never allocated by Parent Story Documents or Generated Stories.
4. Active entries in this Frozen registry are authoritative for Story ID allocation.
5. A Feature ID is available for authoritative Generated Story use because this registry is Approved and Frozen.
6. Feature IDs are never recycled after authoritative use.
7. A Frozen registry is never edited in place.
8. Behaviour remains owned by `PRD-0005-business.md`.
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
| F01 | Business Creation and Ownership | Active | Creation of one Business Profile with one authorized owner. | `PRD-0005-business.md` §6 | `UX-0005-business-dashboard.md` §§5–6 | No Capability Architecture required | Not required under ADR-0007 | Business remains a profile under the User Account, not a separate login identity. |
| F02 | Business Information and Exposure | Active | Management and bounded public/authenticated exposure of Business Information. | `PRD-0005-business.md` §7 | `UX-0005-business-dashboard.md` §7; `UX-0003-offering-detail.md` §8.5; `UX-0009-decision-flow.md` §11 | Supporting relationship | Presentation; Contact & Action | Business owns the information; Presentation and Direct Contact consume approved subsets. |
| F03 | Business Moderation and Public Exposure Input | Active | Restricted/Unrestricted Business state and its contribution to Offering eligibility. | `PRD-0005-business.md` §8 | `UX-0005-business-dashboard.md` §10; `UX-0006-admin-dashboard.md` §7 | Supporting relationship | Visibility & Eligibility | Business owns its moderation result; final Offering eligibility remains PRD-0001-owned. |
| F04 | Business Dashboard and Context Selection | Active | Management surface for one explicitly selected owned Business. | `PRD-0005-business.md` §9 | `UX-0005-business-dashboard.md` §§5–6 | No Capability Architecture required | Not required under ADR-0007 | Entry authentication is supported by Identity without transferring Business ownership. |
| F05 | Offering Management Entry | Active | Business-side entry to applicable owned-Offering management actions. | `PRD-0005-business.md` §10 | `UX-0005-business-dashboard.md` §§8–9 | Supporting relationship | Creation; Lifecycle; Handoff Enablement, as applicable | The Offering-owning PRD retains lifecycle and target-result ownership. |
| F06 | Affiliate Destination Management Entry | Active | Business-side create/edit entry for one Offering-associated Affiliate Destination. | `PRD-0005-business.md` §11 | `UX-0005-business-dashboard.md` §13 | Supporting relationship | Handoff Enablement | Business does not Review, Validate, Enable, Disable, or own Handoff Eligibility. |
| F07 | Correction Notice and Owner Response | Active | Bounded owner response to an approved Request Correction target. | `PRD-0005-business.md` §12 | `UX-0005-business-dashboard.md` §§11–12; `UX-0006-admin-dashboard.md` §8 | Supporting relationship | Target-owned Capability by reference | The exact target determines the applicable Capability; the registry does not pre-assign one universal home. |

## 7. Feature Entry Records

### F01 — Business Creation and Ownership

- **Entry status:** Active
- **Short scope label:** Creation of one Business Profile with one authorized owner.
- **Behaviour owner reference:** `PRD-0005-business.md` §6
- **Applicable UX reference:** `UX-0005-business-dashboard.md` §§5–6
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Business remains a profile under the User Account, not a separate login identity.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F02 — Business Information and Exposure

- **Entry status:** Active
- **Short scope label:** Management and bounded public/authenticated exposure of Business Information.
- **Behaviour owner reference:** `PRD-0005-business.md` §7
- **Applicable UX reference:** `UX-0005-business-dashboard.md` §7; `UX-0003-offering-detail.md` §8.5; `UX-0009-decision-flow.md` §11
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Presentation; Contact & Action
- **Boundary note:** Business owns the information; Presentation and Direct Contact consume approved subsets.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F03 — Business Moderation and Public Exposure Input

- **Entry status:** Active
- **Short scope label:** Restricted/Unrestricted Business state and its contribution to Offering eligibility.
- **Behaviour owner reference:** `PRD-0005-business.md` §8
- **Applicable UX reference:** `UX-0005-business-dashboard.md` §10; `UX-0006-admin-dashboard.md` §7
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Visibility & Eligibility
- **Boundary note:** Business owns its moderation result; final Offering eligibility remains PRD-0001-owned.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F04 — Business Dashboard and Context Selection

- **Entry status:** Active
- **Short scope label:** Management surface for one explicitly selected owned Business.
- **Behaviour owner reference:** `PRD-0005-business.md` §9
- **Applicable UX reference:** `UX-0005-business-dashboard.md` §§5–6
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Entry authentication is supported by Identity without transferring Business ownership.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F05 — Offering Management Entry

- **Entry status:** Active
- **Short scope label:** Business-side entry to applicable owned-Offering management actions.
- **Behaviour owner reference:** `PRD-0005-business.md` §10
- **Applicable UX reference:** `UX-0005-business-dashboard.md` §§8–9
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Creation; Lifecycle; Handoff Enablement, as applicable
- **Boundary note:** The Offering-owning PRD retains lifecycle and target-result ownership.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F06 — Affiliate Destination Management Entry

- **Entry status:** Active
- **Short scope label:** Business-side create/edit entry for one Offering-associated Affiliate Destination.
- **Behaviour owner reference:** `PRD-0005-business.md` §11
- **Applicable UX reference:** `UX-0005-business-dashboard.md` §13
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Handoff Enablement
- **Boundary note:** Business does not Review, Validate, Enable, Disable, or own Handoff Eligibility.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F07 — Correction Notice and Owner Response

- **Entry status:** Active
- **Short scope label:** Bounded owner response to an approved Request Correction target.
- **Behaviour owner reference:** `PRD-0005-business.md` §12
- **Applicable UX reference:** `UX-0005-business-dashboard.md` §§11–12; `UX-0006-admin-dashboard.md` §8
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Target-owned Capability by reference
- **Boundary note:** The exact target determines the applicable Capability; the registry does not pre-assign one universal home.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.


## 8. Identifier Examples

After this registry is Frozen, Generated Stories may use identifiers such as:

```text
US-BUS-F01-001
US-BUS-F02-001
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
- `PRD-0005-business.md`
- `US-0005`

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
