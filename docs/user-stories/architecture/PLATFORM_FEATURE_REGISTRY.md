# Platform Story Domain Feature Registry

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
- **Story Domain:** Platform
- **Domain Code:** PLT
- **Parent Story Document:** US-0006
- **Authority:** `ADR-0009-story-domain-feature-registry-ownership.md`
- **Generated Story allocation:** Available from Frozen v1.0 Feature IDs
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Feature Registry baseline for Story Domain `PLT`. Its Active Feature IDs may now be consumed by authoritative Generated Story identifiers under the Frozen User Story Handbook. This exact registry must not be edited in place. Future Feature ID allocation, retirement, canonical-name correction, authority-reference change, or relationship-classification change requires a controlled revision. This Freeze creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Feature Registry baseline under the first-approval versioning rule. All registry Feature entry statuses become Active. This historical Approval Note records that approval and Freeze were separate decisions. The registry was subsequently Frozen on 2026-07-22, making its Active Feature IDs available for authoritative Generated Story allocation. This approval creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Creation Note (0.1):** Initial controlled Feature-ID allocation proposal for Story Domain `PLT`, authorized by Accepted `ADR-0009-story-domain-feature-registry-ownership.md`. All Feature entries are Active, but they cannot be consumed by authoritative Generated Story IDs until this registry is Frozen. No Capability, Capability Map, PRD/UX behaviour, Epic placement, Story content, or implementation is created.

**Review Entry Note (0.1):** The exact Draft v0.1 content entered formal review without changing Feature IDs, Feature names, scope labels, authority references, relationship classifications, or lifecycle gates. The registry is now authoritative as Approved v1.0 and its entries are Active; Story allocation remains blocked until Freeze.

> This document is the Single Information Owner for `PLT` Feature IDs and bounded Feature identity metadata. It is not a Capability Architecture document and defines no product behaviour, UX behaviour, Epic placement, Story content, or implementation.

---

## 1. Purpose

Provide stable, domain-local Feature identities that may later be consumed by Generated User Story identifiers for the Platform Story Domain.

## 2. Scope

This registry owns only:

- Feature ID allocation within `PLT`;
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

1. Feature IDs are unique within Story Domain `PLT`.
2. The complete Story identifier remains globally unambiguous through the Domain code.
3. Feature IDs are never allocated by Parent Story Documents or Generated Stories.
4. Active entries in this Frozen registry are authoritative for Story ID allocation.
5. A Feature ID is available for authoritative Generated Story use because this registry is Approved and Frozen.
6. Feature IDs are never recycled after authoritative use.
7. A Frozen registry is never edited in place.
8. Behaviour remains owned by `PRD-0006-platform.md`.
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
| F01 | Admin Panel Access and Baseline | Active | Entry to the Admin Panel under existing authorization and inherited public baseline. | `PRD-0006-platform.md` §6 | `UX-0006-admin-dashboard.md` §§5–6; `UX-0008-authentication.md` §8.3 | No Capability Architecture required | Not required under ADR-0007 | Identity owns authorization; Platform owns the Admin experience and action surface. |
| F02 | General Moderation Case Management | Active | Open/Closed moderation-case workload and explicit case closure. | `PRD-0006-platform.md` §§5.3–5.4, 7.1–7.3 | `UX-0006-admin-dashboard.md` §§7–8 | No Capability Architecture required | Not required under ADR-0007 | Case state creates no target state by itself. |
| F03 | Offering Moderation Actions | Active | Hide and Restore actions for authoritative Offering lifecycle targets. | `PRD-0006-platform.md` §§7.2, 7.4 | `UX-0006-admin-dashboard.md` §§7.3–7.4 | Supporting relationship | Lifecycle; Visibility & Eligibility | Platform owns the action; PRD-0001 owns the target result. |
| F04 | Business Moderation Actions | Active | Restrict and Restore Business actions. | `PRD-0006-platform.md` §§7.2, 7.5 | `UX-0006-admin-dashboard.md` §§7.3–7.4 | Supporting relationship | Visibility & Eligibility | Platform owns the action; PRD-0005 owns Business Moderation Status. |
| F05 | User Access Moderation Actions | Active | Suspend and Reinstate User actions with the Admin-authorized-account boundary. | `PRD-0006-platform.md` §§6.5, 7.2, 7.6 | `UX-0006-admin-dashboard.md` §§7.3–7.4, 13 | No Capability Architecture required | Not required under ADR-0007 | Identity owns the User Account access-status result. |
| F06 | Request Correction and Re-Review | Active | Correction targeting, bounded owner response, Admin re-review, and explicit closure. | `PRD-0006-platform.md` §§7.3–7.3.2 | `UX-0006-admin-dashboard.md` §8; `UX-0005-business-dashboard.md` §§11–12 | Supporting relationship | Target-owned Capability by reference | Request Correction is one General Moderation action and creates no Messaging. |
| F07 | Affiliate Destination Administration | Active | Review, Validate, Enable, and Disable administration as a separate action family. | `PRD-0006-platform.md` §8 | `UX-0006-admin-dashboard.md` §9 | Supporting relationship | Handoff Enablement | PRD-0001 owns destination states, validation meaning, and Handoff Eligibility. |
| F08 | Category and Domain Management | Active | Admin management of Category hierarchy, Domain assignment, and retirement. | `PRD-0006-platform.md` §9 | `UX-0006-admin-dashboard.md` §10 | Direct Frozen assignment | Representation | Direct Offering-capability behaviour assigned by ADR-0007. |
| F09 | Attribute Definition Management | Active | Admin management of Attribute definitions and mutation-safety rules. | `PRD-0006-platform.md` §10 | `UX-0006-admin-dashboard.md` §11 | Direct Frozen assignment | Representation | Direct Offering-capability behaviour assigned by ADR-0007. |
| F10 | Basic Analytics | Active | Admin-facing bounded current-state and core-flow indicators. | `PRD-0006-platform.md` §11 | `UX-0006-admin-dashboard.md` §12 | No Capability Architecture required | Not required under ADR-0007 | Consumes Discovery, Presentation, Compare, Decision Chat, and Completion occurrences without redefining them. |

## 7. Feature Entry Records

### F01 — Admin Panel Access and Baseline

- **Entry status:** Active
- **Short scope label:** Entry to the Admin Panel under existing authorization and inherited public baseline.
- **Behaviour owner reference:** `PRD-0006-platform.md` §6
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§5–6; `UX-0008-authentication.md` §8.3
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Identity owns authorization; Platform owns the Admin experience and action surface.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F02 — General Moderation Case Management

- **Entry status:** Active
- **Short scope label:** Open/Closed moderation-case workload and explicit case closure.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§5.3–5.4, 7.1–7.3
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7–8
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Case state creates no target state by itself.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F03 — Offering Moderation Actions

- **Entry status:** Active
- **Short scope label:** Hide and Restore actions for authoritative Offering lifecycle targets.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§7.2, 7.4
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7.3–7.4
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Lifecycle; Visibility & Eligibility
- **Boundary note:** Platform owns the action; PRD-0001 owns the target result.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F04 — Business Moderation Actions

- **Entry status:** Active
- **Short scope label:** Restrict and Restore Business actions.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§7.2, 7.5
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7.3–7.4
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Visibility & Eligibility
- **Boundary note:** Platform owns the action; PRD-0005 owns Business Moderation Status.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F05 — User Access Moderation Actions

- **Entry status:** Active
- **Short scope label:** Suspend and Reinstate User actions with the Admin-authorized-account boundary.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§6.5, 7.2, 7.6
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7.3–7.4, 13
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Identity owns the User Account access-status result.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F06 — Request Correction and Re-Review

- **Entry status:** Active
- **Short scope label:** Correction targeting, bounded owner response, Admin re-review, and explicit closure.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§7.3–7.3.2
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §8; `UX-0005-business-dashboard.md` §§11–12
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Target-owned Capability by reference
- **Boundary note:** Request Correction is one General Moderation action and creates no Messaging.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F07 — Affiliate Destination Administration

- **Entry status:** Active
- **Short scope label:** Review, Validate, Enable, and Disable administration as a separate action family.
- **Behaviour owner reference:** `PRD-0006-platform.md` §8
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §9
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Handoff Enablement
- **Boundary note:** PRD-0001 owns destination states, validation meaning, and Handoff Eligibility.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F08 — Category and Domain Management

- **Entry status:** Active
- **Short scope label:** Admin management of Category hierarchy, Domain assignment, and retirement.
- **Behaviour owner reference:** `PRD-0006-platform.md` §9
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §10
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Representation
- **Boundary note:** Direct Offering-capability behaviour assigned by ADR-0007.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F09 — Attribute Definition Management

- **Entry status:** Active
- **Short scope label:** Admin management of Attribute definitions and mutation-safety rules.
- **Behaviour owner reference:** `PRD-0006-platform.md` §10
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §11
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Representation
- **Boundary note:** Direct Offering-capability behaviour assigned by ADR-0007.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F10 — Basic Analytics

- **Entry status:** Active
- **Short scope label:** Admin-facing bounded current-state and core-flow indicators.
- **Behaviour owner reference:** `PRD-0006-platform.md` §11
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §12
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Consumes Discovery, Presentation, Compare, Decision Chat, and Completion occurrences without redefining them.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.


## 8. Identifier Examples

After this registry is Frozen, Generated Stories may use identifiers such as:

```text
US-PLT-F01-001
US-PLT-F02-001
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
- `PRD-0006-platform.md`
- `US-0006`

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
