# US-0006 — Platform User Stories

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-25
- **Approval Date:** 2026-07-25
- **Approved By:** Product Owner / Architecture Owner
- **Approved Candidate:** In Review v0.2
- **Freeze State:** Frozen
- **Story Domain:** Platform
- **Domain Code:** `PLT`
- **Feature Registry Owner:** Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0
- **GitHub effect:** None

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Platform Parent Story Document baseline. This approval does not Freeze the document, does not change any Generated Story Delivery Status, does not create a separate Admin identity, account, or login, does not add Admin self-service provisioning, does not merge General Moderation with Affiliate Destination Administration, does not transfer target-owned results to Platform, does not apply the non-blocking observations as candidate changes, and does not update GitHub automatically.

**Revision Note (0.2):** Controlled replacement of documented Draft v0.1 embedded-Story content with the Frozen Handbook Parent → Epic → Feature architecture. Consumes authoritative PLT F01–F10, removes embedded `US-NNNN.n` Story ownership, establishes four bounded Epics, and records ten first Generated Story candidates by reference. It changes no Feature ID, canonical Feature name, relationship classification, Capability, PRD behaviour, UX behaviour, implementation, approval, Freeze, or GitHub file.

**Review Entry Note (0.2):** The exact Draft v0.2 candidate entered formal review on 2026-07-25. No Feature ID, canonical Feature name, Epic placement, Story identifier, PRD/UX behaviour, relationship classification, Capability reference, approval, Freeze, or GitHub state changed during review entry.

> This Parent Story Document owns Platform Epic → Feature placement and records Generated Story files by reference. It does not own Feature IDs, relationship classifications, Capability references, product behaviour, UX behaviour, Generated Story content, or implementation.

---

## 1. Purpose

Organize the Platform Story Domain into bounded Epics and authoritative Features F01–F10 so every Generated Platform Story has exactly one Parent, one Epic, and one Feature.

## 2. Scope

This Parent owns:

- Platform Epic names and bounded outcomes;
- Feature placement under exactly one Epic;
- by-reference Generated Story inventory;
- Platform package coverage and reconciliation state.

## 3. Out of Scope

This Parent does not own or redefine:

- Feature IDs, canonical names, short scope labels, references, or relationship classifications — Frozen `PLATFORM_FEATURE_REGISTRY.md`;
- Capability names or boundaries — Frozen Capability Architecture and Accepted ADRs;
- product behaviour — Frozen `PRD-0006-platform.md`;
- experience behaviour — referenced Frozen UX documents;
- Generated Story Acceptance Criteria, BDD, dependencies, size, scope, lifecycle, or complete content;
- implementation, technical architecture, delivery sequencing, or Sprint planning.

## 4. Epic Map

| Epic | Bounded Outcome | Features |
|---|---|---|
| Admin Context and Moderation Workload | One authorized Admin context enters the Platform and manages explicit Open/Closed moderation workload. | F01, F02 |
| Target Moderation and Correction | Platform applies approved Offering, Business, and User actions and coordinates bounded correction and re-review. | F03, F04, F05, F06 |
| Handoff and Representation Administration | Admin manages Affiliate Destination administration and authoritative Category/Attribute definitions without absorbing target-owned behaviour. | F07, F08, F09 |
| Operational Visibility | Admin consumes bounded current-state, workload, and core-flow indicators without automated action. | F10 |

## 5. Feature Map

| Feature ID | Canonical Feature | Epic | Relationship Classification | Capability Reference | Behaviour Owner | Primary Experience |
|---|---|---|---|---|---|---|
| F01 | Admin Panel Access and Baseline | Admin Context and Moderation Workload | No Capability Architecture required | Not required under ADR-0007 | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §§5–6; `UX-0008-authentication.md` §8.3 |
| F02 | General Moderation Case Management | Admin Context and Moderation Workload | No Capability Architecture required | Not required under ADR-0007 | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §§7–8 |
| F03 | Offering Moderation Actions | Target Moderation and Correction | Supporting relationship | Lifecycle; Visibility & Eligibility | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §§7.3–7.4 |
| F04 | Business Moderation Actions | Target Moderation and Correction | Supporting relationship | Visibility & Eligibility | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §§7.3–7.4 |
| F05 | User Access Moderation Actions | Target Moderation and Correction | No Capability Architecture required | Not required under ADR-0007 | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §§7.3–7.4, 13 |
| F06 | Request Correction and Re-Review | Target Moderation and Correction | Supporting relationship | Target-owned Capability by reference | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §8; `UX-0005-business-dashboard.md` §§11–12 |
| F07 | Affiliate Destination Administration | Handoff and Representation Administration | Supporting relationship | Handoff Enablement | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §9 |
| F08 | Category and Domain Management | Handoff and Representation Administration | Direct Frozen assignment | Representation | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §10 |
| F09 | Attribute Definition Management | Handoff and Representation Administration | Direct Frozen assignment | Representation | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §11 |
| F10 | Basic Analytics | Operational Visibility | No Capability Architecture required | Not required under ADR-0007 | `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` §12 |

## 6. Generated Story Inventory

| Feature | Generated Story | Candidate State |
|---|---|---|
| F01 | `US-PLT-F01-001` — Admin Panel Access and Baseline | In Review v0.1 |
| F02 | `US-PLT-F02-001` — General Moderation Case Management | In Review v0.1 |
| F03 | `US-PLT-F03-001` — Offering Moderation Actions | In Review v0.1 |
| F04 | `US-PLT-F04-001` — Business Moderation Actions | In Review v0.1 |
| F05 | `US-PLT-F05-001` — User Access Moderation Actions | In Review v0.1 |
| F06 | `US-PLT-F06-001` — Request Correction and Re-Review | In Review v0.1 |
| F07 | `US-PLT-F07-001` — Affiliate Destination Administration | In Review v0.1 |
| F08 | `US-PLT-F08-001` — Category and Domain Management | In Review v0.1 |
| F09 | `US-PLT-F09-001` — Attribute Definition Management | In Review v0.1 |
| F10 | `US-PLT-F10-001` — Basic Analytics | In Review v0.1 |

The candidate-state column is informative and by reference. This Parent advances no Generated Story lifecycle state.

## 7. Coverage and Readiness

| Check | Result |
|---|---|
| Authoritative F01–F10 consumed exactly | PASS |
| Every Feature placed under exactly one Epic | PASS |
| Ten first Generated Story candidates exist | PASS |
| Embedded legacy Stories removed | PASS |
| Parent embeds no Acceptance Criteria or BDD | PASS |
| Relationship classifications and Capability references match the Frozen Registry | PASS |
| Admin remains the existing User Account in explicit authorized context | PASS |
| General Moderation remains seven actions with Open/Closed case workflow | PASS |
| Offering, Business, User, and Affiliate results remain target-owned | PASS |
| Request Correction creates no Messaging and closes no case automatically | PASS |
| Category and Attribute management preserve Representation boundaries and mutation safety | PASS |
| Basic Analytics is bounded, non-autonomous, and non-transactional | PASS |
| No generic configuration, Admin provisioning, advanced analytics, Messaging, billing, CRM, or transaction expansion | PASS |
| GitHub unchanged | PASS |

## 8. Reconciliation Boundary

This Approved baseline does not:

- Freeze this Parent;
- approve or Freeze any Generated Story;
- revise the Frozen Feature Registry;
- create a Feature or Capability;
- broaden PRD or UX scope;
- start implementation;
- update traceability, repository indexes, changelog, or GitHub automatically.

## 9. References

- `PLATFORM_FEATURE_REGISTRY.md` — F01–F10 identity, references, and Capability relationships.
- `PRD-0006-platform.md` — Platform behaviour and ownership boundaries.
- `UX-0006-admin-dashboard.md` — Admin context, moderation, administration, management, and Basic Analytics experience.
- `UX-0008-authentication.md` — authorized Admin-context entry and Logout.
- `UX-0005-business-dashboard.md` — bounded correction-owner response.
- `PRD-0001` through `PRD-0005` — authoritative target states, metadata, occurrences, and Completion meaning.
- `ADR-0006`, `ADR-0007`, `ADR-0008`, `ADR-0009`.
- Owner Decisions D06, D07, D15/D16, D20, D21, D22, and D23.
- `USER_STORY_HANDBOOK.md`, `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`.
