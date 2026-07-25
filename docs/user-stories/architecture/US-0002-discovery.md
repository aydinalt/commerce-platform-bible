# US-0002 — Discovery User Stories

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-24
- **Approval Date:** 2026-07-24
- **Approved By:** Product Owner / Architecture Owner
- **Approved Candidate:** In Review v0.4
- **Freeze State:** Frozen
- **Freeze Date:** 2026-07-24
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Discovery
- **Domain Code:** `DSC`
- **Feature Registry Owner:** Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Discovery Parent Story Document baseline. This exact file must not be edited in place. Future Epic placement, Feature placement, Generated Story inventory, reference, or scope changes require a controlled revision. This Freeze changes no Generated Story Delivery Status, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.4 candidate becomes the authoritative Approved v1.0 Discovery Parent Story Document baseline. This approval does not Freeze the document, does not advance any Generated Story Delivery Status, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

**Revision Note (0.2):** Controlled replacement of documented Draft v0.1 embedded-Story content with the Frozen Handbook Parent → Epic → Feature architecture. Consumes authoritative DSC F01–F10, removes embedded `US-NNNN.n` Story ownership, establishes four bounded Epics, and records ten first Generated Story candidates by reference. It changes no Feature ID, Capability, PRD behaviour, UX behaviour, Acceptance Criterion, implementation, approval, Freeze, or GitHub file.

**Review Entry Note (0.4):** Documentation-precision inventory correction after the focused Claude PASS. Updates only the by-reference F09 candidate version from In Review v0.2 to In Review v0.3. No Epic, Feature, Story ID, Capability assignment, PRD/UX behaviour, Acceptance Criterion, BDD content, dependency, size, scope, lifecycle authority, or GitHub file changes.

**Review Entry Note (0.3):** Bounded post-audit inventory correction. Updates only the by-reference candidate versions for F01, F02, F04, F06, F07, and F09 after BDD and dependency-verification remediation. No Epic, Feature, Story ID, Capability assignment, PRD/UX behaviour, Acceptance Criterion, BDD content, or lifecycle authority is owned or changed by the Parent.

**Review Entry Note (0.2):** The exact Draft v0.2 candidate entered formal review on 2026-07-24. No Feature ID, Feature name, Epic placement, Story identifier, PRD/UX behaviour, Capability relationship, or lifecycle authority changed during review entry.

> The Parent Story Document for the Discovery Story Domain. It owns Epic → Feature placement and records Generated Story files by reference. It does not own Feature IDs, Capability assignments, product behaviour, UX behaviour, or the complete text or lifecycle of any Generated Story.

---

## 1. Purpose

Organize Discovery into bounded Epics and authoritative Features F01–F10 so every Generated Discovery Story has exactly one Parent Story Document, one Epic, and one Feature.

## 2. Scope

This Parent Story Document owns:

- Discovery Epic names and bounded outcomes;
- Feature placement under exactly one Epic;
- by-reference Generated Story inventory;
- Discovery package coverage and reconciliation state.

## 3. Out of Scope

This document does not own or redefine:

- Feature IDs, canonical Feature names, or Feature relationship classifications — Frozen `DISCOVERY_FEATURE_REGISTRY.md`;
- Discovery Capability meaning — `OFFERING_CAPABILITY_ARCHITECTURE.md`;
- product behaviour — Frozen `PRD-0002-discovery.md`;
- experience behaviour — Frozen UX documents;
- Generated Story text, Acceptance Criteria, BDD, dependency, size, scope, or lifecycle;
- implementation, technical architecture, delivery sequencing, or Sprint planning.

## 4. Epic Map

| Epic | Bounded Outcome | Features |
|---|---|---|
| Discovery Entry | A person explicitly begins public Discovery through the approved Home prompt and Search or Browse route. | F01 |
| Search and Browse Navigation | A person submits Search or navigates the active Category hierarchy and may narrow Search to one leaf Category. | F02, F03, F04 |
| Results and Refinement | Matching eligible Offerings are refined, ordered, represented, and recoverable when no result exists. | F05, F06, F07, F08 |
| Discovery Continuity and Handoff | A person opens one Offering for Presentation or continues one transient Compare-preparation flow through Discovery. | F09, F10 |

## 5. Feature Map

| Feature ID | Canonical Feature | Epic | Capability Relationship | Behaviour Owner | Primary Experience |
|---|---|---|---|---|---|
| F01 | Homepage Discovery Entry | Discovery Entry | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0001-home.md`; `UX-0002-discovery.md` |
| F02 | Search | Search and Browse Navigation | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md` |
| F03 | Browse | Search and Browse Navigation | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md` |
| F04 | Search Category Narrowing | Search and Browse Navigation | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md` |
| F05 | Attribute Filtering | Results and Refinement | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md` |
| F06 | Discovery Results and Listing Cards | Results and Refinement | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md` |
| F07 | Default Result Ordering | Results and Refinement | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md` |
| F08 | Zero Results Recovery | Results and Refinement | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md` |
| F09 | Offering Presentation Handoff | Discovery Continuity and Handoff | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md`; `UX-0003-offering-detail.md` |
| F10 | Compare Preparation Discovery Return | Discovery Continuity and Handoff | Direct Frozen assignment → Discovery | `PRD-0002-discovery.md` | `UX-0002-discovery.md`; `UX-0003-offering-detail.md`; `UX-0004-compare.md` |

## 6. Generated Story Inventory

| Feature | Generated Story | Candidate State |
|---|---|---|
| F01 | `US-DSC-F01-001` — Homepage Discovery Entry | In Review v0.2 |
| F02 | `US-DSC-F02-001` — Search | In Review v0.2 |
| F03 | `US-DSC-F03-001` — Browse | In Review v0.1 |
| F04 | `US-DSC-F04-001` — Search Category Narrowing | In Review v0.2 |
| F05 | `US-DSC-F05-001` — Attribute Filtering | In Review v0.1 |
| F06 | `US-DSC-F06-001` — Discovery Results and Listing Cards | In Review v0.2 |
| F07 | `US-DSC-F07-001` — Default Result Ordering | In Review v0.2 |
| F08 | `US-DSC-F08-001` — Zero Results Recovery | In Review v0.1 |
| F09 | `US-DSC-F09-001` — Offering Presentation Handoff | In Review v0.3 |
| F10 | `US-DSC-F10-001` — Compare Preparation Discovery Return | In Review v0.1 |

The candidate-state column is informative and recorded by reference. This Parent does not advance any Generated Story lifecycle state.

## 7. Coverage and Readiness

| Check | Result |
|---|---|
| Authoritative F01–F10 consumed exactly | PASS |
| Every Feature placed under exactly one Epic | PASS |
| Ten first Generated Story candidates exist | PASS |
| Embedded legacy Stories removed | PASS |
| Parent embeds no Acceptance Criteria or BDD | PASS |
| PRD and UX behaviour referenced, not redefined | PASS |
| No Favorites, Messaging, Autocomplete, user Sort, recommendation, saved criteria, or Pagination product behaviour | PASS |
| GitHub unchanged | PASS |

## 8. Reconciliation Boundary

This Frozen baseline does not:

- permit direct in-place modification;
- approve or Freeze a Generated Story;
- change the Frozen Feature Registry;
- create another Feature or Capability;
- broaden PRD or UX scope;
- start implementation;
- update traceability, repository indexes, changelog, or GitHub automatically.

## 9. References

- `DISCOVERY_FEATURE_REGISTRY.md` — F01–F10 identity and relationships.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — Discovery Capability boundary.
- `PRD-0002-discovery.md` — Discovery behaviour.
- `UX-0001-home.md` — public Home entry.
- `UX-0002-discovery.md` — Search, Browse, Filters, Results, ordering, recovery, and handoff.
- `UX-0003-offering-detail.md` — selected Offering and transient Compare context reception.
- `UX-0004-compare.md` — Compare-preparation return.
- `ADR-0007`, `ADR-0009`, and `ADR-0002` where Presentation boundary applies.
- `USER_STORY_HANDBOOK.md`, `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`.
