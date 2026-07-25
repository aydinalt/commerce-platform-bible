# US-0001 — Offering User Stories

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-22
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Approved Candidate:** In Review v0.9
- **Freeze State:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Offering
- **Domain Code:** `OFR`
- **Feature Registry Owner:** `OFFERING_CAPABILITY_ARCHITECTURE.md`
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Parent Story Document baseline for the Offering Story Domain. This exact file must not be edited in place. Future Epic placement, Feature placement, Generated Story inventory, reference, or scope changes require a controlled revision. This Freeze changes no Delivery Status and does not update GitHub automatically.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.9 candidate becomes the authoritative Approved v1.0 Parent Story Document baseline. This approval does not Freeze the document, does not advance any Generated Story lifecycle, and does not update GitHub automatically.

**Revision Note (0.8):** Controlled package reconciliation of Draft v0.7 against Frozen Offering Capability Architecture v2.0, Frozen PRD-0001 v3.1, Frozen UX baselines, ADR-0006, ADR-0008, and the Frozen User Story Handbook. Replaces the stale F01–F05/Offering State Management structure with the authoritative F01–F07 inventory; removes the unallocated Offering State Management Feature; adds Affiliate Destination Readiness; records F02 as Deferred / Not Yet Decided; and records the seven exact Generated Story candidates by reference. It changes no Feature ID, Capability, PRD behaviour, UX behaviour, or Story lifecycle automatically.

**Review Entry Note (0.9):** Clerical package-inventory correction after the independent Claude audit. Updates only the by-reference F05 candidate version from 2.0 to 2.1. No Epic, Feature, Story identity, Capability state, behaviour, lifecycle authority, or product/UX decision changes.

**Review Entry Note (0.8):** The exact Draft v0.8 package-reconciled content entered formal review. All Feature identities are consumed from the Frozen Offering Capability Architecture. All Story states are recorded by reference only. This lifecycle transition approves or Freezes no Story and changes no GitHub file.

> The Parent Story Document for the Offering Story Domain. It owns the domain's Epic → Feature placement and records Generated Story files by reference. It does not own Feature IDs, Capability associations, product behaviour, UX behaviour, or the full content or lifecycle of an individual Generated Story.

---

## 1. Purpose

Organize the Offering Story Domain into bounded Epics and the authoritative Features F01–F07 so every Generated Story has exactly one Parent Story Document, Epic, and Feature.

## 2. Scope

This Parent Story Document owns:

- the Offering domain's Epic names and bounded outcomes;
- Feature placement under exactly one Epic;
- by-reference Generated Story inventory;
- package coverage and reconciliation status.

## 3. Out of Scope

It does not own or redefine:

- Feature IDs or Feature names — `OFFERING_CAPABILITY_ARCHITECTURE.md`;
- Feature → Capability associations;
- product behaviour — `PRD-0001-offering.md`;
- Business or Platform supporting behaviour — PRD-0005 / PRD-0006;
- UX behaviour — UX-0003 / UX-0005 / UX-0006;
- Generated Story text, Acceptance Criteria, BDD, dependencies, size, or lifecycle;
- delivery sequencing, Sprint planning, or implementation.

## 4. Epic Map

| Epic | Bounded Outcome | Features |
|---|---|---|
| Offering Authoring | An authorized Business can bring an Offering into existence and keep the owner-manageable record accurate. | F01, F02 |
| Offering Lifecycle Control | An authorized owner can publish a valid Draft or retire an active-lifecycle Offering into immutable history. | F03, F04 |
| Offering Presentation | A person can understand one publicly eligible Offering through complete public Presentation. | F05 |
| Affiliate Destination Readiness | An authorized Business can configure one associated destination and an authorized Admin can govern its Handoff Eligibility. | F06, F07 |

## 5. Feature Map

| Feature ID | Canonical Feature | Epic | Capability State | Behaviour Owner | Primary Experience |
|---|---|---|---|---|---|
| F01 | Offering Creation | Offering Authoring | Creation | `PRD-0001-offering.md` | `UX-0005-business-dashboard.md` |
| F02 | Offering Editing | Offering Authoring | Deferred / Capability home Not Yet Decided | `PRD-0001-offering.md` | `UX-0005-business-dashboard.md` |
| F03 | Offering Retirement | Offering Lifecycle Control | Lifecycle | `PRD-0001-offering.md` | `UX-0005-business-dashboard.md` |
| F04 | Offering Publication | Offering Lifecycle Control | Lifecycle | `PRD-0001-offering.md` | `UX-0005-business-dashboard.md` |
| F05 | Full Offering Detail Presentation | Offering Presentation | Presentation | `PRD-0001-offering.md` | `UX-0003-offering-detail.md` |
| F06 | Affiliate Destination Configuration | Affiliate Destination Readiness | Handoff Enablement | `PRD-0001-offering.md` | `UX-0005-business-dashboard.md` |
| F07 | Affiliate Destination Eligibility Governance | Affiliate Destination Readiness | Handoff Enablement | `PRD-0001-offering.md` | `UX-0006-admin-dashboard.md` |

F02's absence from the authoritative association list is consumed as Deferred / Not Yet Decided. No Capability is inferred.

## 6. Generated Story Inventory

| Feature | Generated Story | Candidate State | Baseline Treatment |
|---|---|---|---|
| F01 | `US-OFR-F01-001` — Offering Creation | In Review v0.5 | Controlled revision of Draft v0.4 |
| F02 | `US-OFR-F02-001` — Offering Editing | In Review v0.2 | Controlled revision of Draft v0.1 |
| F03 | `US-OFR-F03-001` — Offering Retirement | In Review v2.0 | Superseding revision; Frozen v1.0 preserved |
| F04 | `US-OFR-F04-001` — Offering Publication | In Review v2.0 | Superseding revision; Frozen v1.0 preserved |
| F05 | `US-OFR-F05-001` — Full Offering Detail Presentation | In Review v2.1 | Superseding revision; Frozen v1.0 preserved |
| F06 | `US-OFR-F06-001` — Affiliate Destination Configuration | In Review v0.1 | First Story candidate |
| F07 | `US-OFR-F07-001` — Affiliate Destination Eligibility Governance | In Review v0.1 | First Story candidate |

The Candidate State column is informative and recorded by reference. This Parent Story Document does not advance any Story lifecycle state.

## 7. Coverage and Readiness

| Check | Result |
|---|---|
| Authoritative Feature inventory F01–F07 consumed | PASS |
| Unallocated Offering State Management removed | PASS |
| Every Feature placed under exactly one Epic | PASS |
| F02 Deferred state preserved | PASS |
| One Generated Story candidate per Feature | PASS |
| Frozen F03–F05 baselines preserved | PASS |
| F06 and F07 Story IDs allocated from authoritative Feature IDs | PASS |
| Parent embeds no Story content | PASS |
| Story lifecycle remains file-local | PASS |
| GitHub unchanged | PASS |

## 8. Reconciliation Boundary

This Frozen baseline does not:

- modify itself in place;
- approve or Freeze a Generated Story;
- deprecate the preserved Frozen F03–F05 v1.0 baselines;
- decide F02's Capability home;
- create another Feature or Capability;
- update traceability, indexes, status files, or GitHub automatically.

## 9. References

- `OFFERING_CAPABILITY_ARCHITECTURE.md` — F01–F07 identity and authoritative associations.
- `PRD-0001-offering.md` — Offering behaviour.
- `PRD-0005-business.md` — Business-management gates and entries.
- `PRD-0006-platform.md` — Admin action surfaces.
- `UX-0003-offering-detail.md` — public Offering Presentation.
- `UX-0005-business-dashboard.md` — Business management experience.
- `UX-0006-admin-dashboard.md` — Affiliate Destination Administration.
- `ADR-0002`, `ADR-0003`, `ADR-0006`, `ADR-0008`.
- `USER_STORY_HANDBOOK.md` — Parent and Generated Story rules.
- `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`.
