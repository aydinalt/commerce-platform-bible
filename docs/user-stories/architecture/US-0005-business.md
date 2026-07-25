# US-0005 — Business User Stories

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-25
- **Approval Date:** 2026-07-25
- **Approved By:** Product Owner / Architecture Owner
- **Approved Candidate:** In Review v0.2
- **Freeze State:** Frozen
- **Freeze Date:** 2026-07-25
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Business
- **Domain Code:** `BUS`
- **Feature Registry Owner:** Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Business Parent Story Document baseline. This exact file must not be edited in place. Future Epic placement, Feature placement, relationship classification, Capability reference, Generated Story inventory, UX reference, or scope changes require a controlled revision. This Freeze changes no Generated Story Delivery Status; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; and does not update GitHub automatically.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Business Parent Story Document baseline. This approval does not Freeze the document, does not change any Generated Story Delivery Status, does not create a separate Business login identity, does not require prior Admin approval for Business creation, does not merge public Business identity with protected Direct Contact, does not transfer final Offering Public Eligibility ownership to Business, and does not update GitHub automatically.

**Revision Note (0.2):** Controlled replacement of documented Draft v0.1 embedded-Story content with the Frozen Handbook Parent → Epic → Feature architecture. Consumes authoritative BUS F01–F07, removes embedded `US-NNNN.n` Story ownership, establishes four bounded Epics, and records seven first Generated Story candidates by reference. It changes no Feature ID, canonical Feature name, relationship classification, Capability, PRD behaviour, UX behaviour, implementation, approval, Freeze, or GitHub file.

**Review Entry Note (0.2):** The exact Draft v0.2 candidate entered formal review on 2026-07-25. No Feature ID, canonical Feature name, Epic placement, Story identifier, PRD/UX behaviour, relationship classification, Capability reference, approval, Freeze, or GitHub state changed during review entry.

> This Parent Story Document owns Business Epic → Feature placement and records Generated Story files by reference. It does not own Feature IDs, relationship classifications, Capability references, product behaviour, UX behaviour, Generated Story content, or implementation.

---

## 1. Purpose

Organize the Business Story Domain into bounded Epics and authoritative Features F01–F07 so every Generated Business Story has exactly one Parent, one Epic, and one Feature.

## 2. Scope

This Parent owns:

- Business Epic names and bounded outcomes;
- Feature placement under exactly one Epic;
- by-reference Generated Story inventory;
- Business package coverage and reconciliation state.

## 3. Out of Scope

This Parent does not own or redefine:

- Feature IDs, canonical names, short scope labels, references, or relationship classifications — Frozen `BUSINESS_FEATURE_REGISTRY.md`;
- Capability names or boundaries — Frozen Capability Architecture and Accepted ADRs;
- product behaviour — Frozen `PRD-0005-business.md`;
- experience behaviour — referenced Frozen UX documents;
- Generated Story Acceptance Criteria, BDD, dependencies, size, scope, lifecycle, or complete content;
- implementation, technical architecture, delivery sequencing, or Sprint planning.

## 4. Epic Map

| Epic | Bounded Outcome | Features |
|---|---|---|
| Business Establishment and Information | An Enabled User establishes one owned Business and manages public identity plus protected contact information. | F01, F02 |
| Moderation and Business Context Governance | One explicit Business context applies authoritative moderation and exposure consequences without unrelated state mutation. | F03, F04 |
| Owned Offering and Handoff Configuration Entry | The Business reaches only permitted Offering and Affiliate Destination management owned by other authoritative domains. | F05, F06 |
| Correction Response and Re-Review | The owner receives one bounded correction notice and submits an authorized response for Platform re-review. | F07 |

## 5. Feature Map

| Feature ID | Canonical Feature | Epic | Relationship Classification | Capability Reference | Behaviour Owner | Primary Experience |
|---|---|---|---|---|---|---|
| F01 | Business Creation and Ownership | Business Establishment and Information | No Capability Architecture required | Not required under ADR-0007 | `PRD-0005-business.md` | `UX-0005-business-dashboard.md` §§5–6 |
| F02 | Business Information and Exposure | Business Establishment and Information | Supporting relationship | Presentation; Contact & Action | `PRD-0005-business.md` | `UX-0005-business-dashboard.md` §7; `UX-0003-offering-detail.md` §8.5; `UX-0009-decision-flow.md` §11 |
| F03 | Business Moderation and Public Exposure Input | Moderation and Business Context Governance | Supporting relationship | Visibility & Eligibility | `PRD-0005-business.md` | `UX-0005-business-dashboard.md` §10; `UX-0006-admin-dashboard.md` §7 |
| F04 | Business Dashboard and Context Selection | Moderation and Business Context Governance | No Capability Architecture required | Not required under ADR-0007 | `PRD-0005-business.md` | `UX-0005-business-dashboard.md` §§5–6 |
| F05 | Offering Management Entry | Owned Offering and Handoff Configuration Entry | Supporting relationship | Creation; Lifecycle; Handoff Enablement, as applicable | `PRD-0005-business.md` | `UX-0005-business-dashboard.md` §§8–9 |
| F06 | Affiliate Destination Management Entry | Owned Offering and Handoff Configuration Entry | Supporting relationship | Handoff Enablement | `PRD-0005-business.md` | `UX-0005-business-dashboard.md` §13 |
| F07 | Correction Notice and Owner Response | Correction Response and Re-Review | Supporting relationship | Target-owned Capability by reference | `PRD-0005-business.md` | `UX-0005-business-dashboard.md` §§11–12; `UX-0006-admin-dashboard.md` §8 |

## 6. Generated Story Inventory

| Feature | Generated Story | Candidate State |
|---|---|---|
| F01 | `US-BUS-F01-001` — Business Creation and Ownership | In Review v0.1 |
| F02 | `US-BUS-F02-001` — Business Information and Exposure | In Review v0.1 |
| F03 | `US-BUS-F03-001` — Business Moderation and Public Exposure Input | In Review v0.1 |
| F04 | `US-BUS-F04-001` — Business Dashboard and Context Selection | In Review v0.1 |
| F05 | `US-BUS-F05-001` — Offering Management Entry | In Review v0.1 |
| F06 | `US-BUS-F06-001` — Affiliate Destination Management Entry | In Review v0.1 |
| F07 | `US-BUS-F07-001` — Correction Notice and Owner Response | In Review v0.1 |

The candidate-state column is informative and by reference. This Parent advances no Generated Story lifecycle state.

## 7. Coverage and Readiness

| Check | Result |
|---|---|
| Authoritative F01–F07 consumed exactly | PASS |
| Every Feature placed under exactly one Epic | PASS |
| Seven first Generated Story candidates exist | PASS |
| Embedded legacy Stories removed | PASS |
| Parent embeds no Acceptance Criteria or BDD | PASS |
| Relationship classifications and Capability references match the Frozen Registry | PASS |
| Business remains a profile and context, not a separate login | PASS |
| Public identity and protected Direct Contact remain distinct | PASS |
| Restriction and restoration preserve Offering/Identity/Affiliate ownership boundaries | PASS |
| Dashboard has no analytics, CRM, Messaging, or transaction expansion | PASS |
| Offering and Affiliate Destination behaviour remain owned by PRD-0001 | PASS |
| Correction notice creates no Messaging and requires Platform re-review | PASS |
| No permanent deletion, Business team access, dedicated public Business page, or complete Business lifecycle | PASS |
| GitHub unchanged | PASS |

## 8. Reconciliation Boundary

This Frozen baseline does not:

- permit direct in-place modification;
- approve or Freeze any Generated Story;
- revise the Frozen Feature Registry;
- create a Feature or Capability;
- broaden PRD or UX scope;
- start implementation;
- update traceability, repository indexes, changelog, or GitHub automatically.

## 9. References

- `BUSINESS_FEATURE_REGISTRY.md` — F01–F07 identity, references, and Capability relationships.
- `PRD-0005-business.md` — Business behaviour and ownership boundaries.
- `UX-0005-business-dashboard.md` — Business context and management experience.
- `UX-0003-offering-detail.md` — public Business identity.
- `UX-0006-admin-dashboard.md` — moderation and correction action surfaces.
- `UX-0009-decision-flow.md` — authenticated Direct Contact consumption.
- `PRD-0001-offering.md`, `PRD-0003-identity.md`, `PRD-0004-decision.md`, `PRD-0006-platform.md` — supporting authoritative inputs and consumers.
- `ADR-0006`, `ADR-0007`, `ADR-0008`, `ADR-0009`.
- Owner Decisions D03, D04, D15/D16, D20, and D21.
- `USER_STORY_HANDBOOK.md`, `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`.
