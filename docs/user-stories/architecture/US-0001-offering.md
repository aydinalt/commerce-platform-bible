# US-0001 — Offering User Stories

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.7
- **Last Updated:** 2026-07-16

**Revision Note (0.2):** Controlled preparation. This document is restructured from draft User Stories into the Epic → Feature decomposition of the PRD-0001 Offering Story domain. It now contains no User Stories; Story generation for each Feature is Pending and begins only after Architecture Review. Scope is limited to behaviour owned by `PRD-0001-offering.md`; work owned by other PRDs is excluded. The capability-wide integration view remains owned by `OFFERING_IMPLEMENTATION_BLUEPRINT.md`.

**Revision Note (0.3):** Architectural consistency checks. The Epic "Offering Presentation" was reviewed and retained as the best bounded outcome for PRD-0001. The Feature "Offering removal" was renamed to "Offering retirement" because `PRD-0001-offering.md` models lifecycle through states rather than permanent deletion (no Delete behaviour is asserted). The Feature "Extended lifecycle states (Hidden, Archived)" was renamed to "Offering State Management," with Hidden and Archived kept as future Story concerns rather than Feature names. The Story Generation Status labels were mirrored to match; no status or structure changed.

**Revision Note (0.4):** Cross-reference reconciliation. `PRD-0001-offering.md` (v1.1) reworded its Business "delete" capability to "retire" — taking an owned Offering out of active circulation through the Offering lifecycle, not permanent deletion. This makes the "Offering retirement" Feature name and its §5 definition here fully consistent with the behaviour owner. No Epic, Feature, Feature ID, Story, or structure changed in this document; retirement behaviour remains owned by `PRD-0001-offering.md` and is referenced here, never redefined. The undecided consequences of retirement (resulting state, reversibility, visibility) are owned as TODOs by `PRD-0001-offering.md` (§16).

**Revision Note (0.5):** Controlled revision — Story Generation reconciliation. This parent Story Document is reconciled with the actual repository state: it now records, by reference, the generated Offering Stories for Features F01 through F05. F01–F04 are recorded by reference as Golden Baseline Stories (`US-OFR-F01-001` through `US-OFR-F04-001`); F05 is recorded by reference as an existing Draft Story (`US-OFR-F05-001`, Draft v0.2) and is not advanced by this revision. Offering State Management remains Pending because no Story has yet been generated for it. The stale statements that no Story identifiers exist, that every Feature is Pending, and that Story generation has not begun are corrected in the informative description, §1 Purpose, §3 Out of Scope, §6 Story Generation Status, and §7 Readiness Check; the Presentation Feature name is normalized to the authoritative casing "Full Offering Detail Presentation." Story IDs and Story lifecycle states are recorded here by reference only. No Story content, behaviour, identifier, Epic, Feature, Capability, PRD, or UX relationship changed; the Epic → Feature structure, the Epic bounded outcomes, the Feature meanings, the Offering Retirement definition, the Offering State Management TODO boundaries, and the Discovery exclusion are all preserved. Status remains Draft.

**Revision Note (0.6):** Controlled revision — metadata only. The mandatory **Owner: Product Owner / Architecture Owner** metadata field was added to the header, placed consistently with the repository's other governance documents. No Epic, Feature, Story reference, Story lifecycle state, behaviour, identifier, Capability, PRD, UX, readiness result, or document status changed; the F01–F04 Golden Baseline references, F05 (`US-OFR-F05-001`) Draft v0.2, the Offering State Management Pending state, the Epic Map, the Feature Map, the Story Generation Status, the Readiness Check, and the references are all unchanged. Status remains Draft.

**Revision Note (0.7):** Controlled revision — bounded Story-status propagation. `US-OFR-F05-001` reached Golden Baseline v1.0 following explicit Product Owner / Architecture Owner approval; this parent document updates only its by-reference Story inventory (§6) and readiness record (§7) to reflect that state. No Epic, Feature, Story content, behaviour, identifier, Capability, PRD, UX, dependency, or architecture relationship changed. The parent document remains Draft because Offering State Management remains Pending and the parent continues as a maintained by-reference Story inventory.

> The parent Story Document for the PRD-0001 Offering domain. It owns and records the Epic → Feature organization of the domain and records the domain's generated Story documents by reference. It does not embed or redefine the complete text, Acceptance Criteria, BDD scenarios, INVEST evaluation, or delivery content of any individual Story; those remain owned by each Story's own file and by the layers that own behaviour, experience, and standards, and are referenced here, never redefined.

---

## 1. Purpose

This document is the parent Story Document for the PRD-0001 Offering domain. Its agreed Epic → Feature structure provides the parent organization to which the domain's generated Story documents attach, and it tracks those generated Stories by reference. The Epic → Feature structure is owned here; individual Story content — a Story's full text, Acceptance Criteria, BDD, INVEST evaluation, sizing, and delivery detail — remains in that Story's own file and is not reproduced here.

## 2. Scope

This document defines only the Epic → Feature decomposition of the Offering Story domain whose behaviour is owned by `PRD-0001-offering.md`. Behaviour is owned by `PRD-0001-offering.md`; the related experience is owned by the referenced UX specifications. This document is one of the PRD-aligned Story documents (US-0001 Offering, US-0002 Discovery, US-0003 Identity, US-0004 Decision, US-0005 Business, US-0006 Platform); the capability-wide integration view is owned by `OFFERING_IMPLEMENTATION_BLUEPRINT.md` and is not reproduced here.

## 3. Out of Scope

This document does not own, embed, or redefine:

- Work owned by `PRD-0002-discovery.md`, `PRD-0003-identity.md`, `PRD-0004-decision.md`, `PRD-0005-business.md`, or `PRD-0006-platform.md`.
- The complete text of any User Story, its Acceptance Criteria, BDD scenarios, INVEST evaluations, Story sizing details, prioritisation, sequencing, and Sprint planning.
- Implementation details, APIs, and database design.

Story IDs and Story lifecycle states are recorded here by reference only. Recording a Story's identifier and its lifecycle state is not the same as owning, embedding, or redefining that Story's content, which remains in the Story's own file.

## 4. Epic Map

Each Epic is a bounded, outcome-oriented body of work owned by `PRD-0001-offering.md` and capable of eventual closure. Epics are not permanent categories and are not restatements of capability-aspect names. Behaviour is owned by `PRD-0001-offering.md` and is not redefined here.

| Epic | Bounded Outcome | Owning PRD |
|------|-----------------|------------|
| Offering Authoring | An owning Business can bring an Offering into existence and keep it accurate. | `PRD-0001-offering.md` |
| Offering Publication | An Offering moves to the Published state and becomes available. | `PRD-0001-offering.md` |
| Offering Presentation | A complete Offering can be presented in full. | `PRD-0001-offering.md` |

## 5. Feature Map

For each Epic, the Features below are the structural units of decomposition. Features remain above the User Story level, reference their authoritative PRD/UX sources, and define no new behaviour and no implementation.

### Epic: Offering Authoring
- **Offering creation** — behaviour owned by `PRD-0001-offering.md`; experience `UX-0005-business-dashboard.md`.
- **Offering editing** — behaviour owned by `PRD-0001-offering.md`; experience `UX-0005-business-dashboard.md`.
- **Offering retirement** — the owner-initiated act of taking an owned Offering out of active circulation through the Offering lifecycle, not permanent deletion (which `PRD-0001-offering.md` does not model). Behaviour owned by `PRD-0001-offering.md`; experience `UX-0005-business-dashboard.md`.

### Epic: Offering Publication
- **Draft-to-Published publication** — behaviour owned by `PRD-0001-offering.md`; experience `UX-0005-business-dashboard.md`. (Reaching Discovery after publication is owned by `PRD-0002-discovery.md` and is out of scope here.)
- **Offering State Management** — the management of an Offering's lifecycle states, owned by `PRD-0001-offering.md`. The Draft and Published states and the Draft → Published transition are defined; the Hidden and Archived states and their transitions remain future Story concerns (TODO in `PRD-0001-offering.md`) and are not defined here.

### Epic: Offering Presentation
- **Full Offering Detail Presentation** — behaviour owned by `PRD-0001-offering.md`; experience `UX-0003-offering-detail.md`. (Reaching the Offering is owned by `PRD-0002-discovery.md` and is out of scope here.)

## 6. Story Generation Status

Story generation for the Offering domain has begun and Architecture Review has occurred for the generated Stories. The table below records, for each Feature, its generated Story and that Story's current lifecycle state **by reference**; the authoritative metadata and lifecycle state of each Story remain owned by the Story's own file. Where no Story has yet been generated for a Feature, that Feature remains Pending.

| Epic | Feature | Generated Story | Recorded State |
|------|---------|-----------------|----------------|
| Offering Authoring | Offering creation | `US-OFR-F01-001` | Golden Baseline |
| Offering Authoring | Offering editing | `US-OFR-F02-001` | Golden Baseline |
| Offering Authoring | Offering retirement | `US-OFR-F03-001` | Golden Baseline |
| Offering Publication | Draft-to-Published publication | `US-OFR-F04-001` | Golden Baseline |
| Offering Publication | Offering State Management | — | Pending |
| Offering Presentation | Full Offering Detail Presentation | `US-OFR-F05-001` | Golden Baseline |

The Recorded State column is a reference to each Story's own lifecycle state and to repository history; it is not set or advanced by this document. In particular, `US-OFR-F05-001` is recorded by reference as **Golden Baseline v1.0**, following explicit Owner approval; its authoritative lifecycle state is owned by its own Story file. Offering State Management remains Pending because no Story has yet been generated for it.

## 7. Readiness Check

| Check | Status |
|-------|--------|
| Epic Map complete | Yes |
| Feature Map complete | Yes |
| Architecture Review (generated Stories) | Occurred |
| Story generation started | Yes |
| F01–F04 lifecycle | Golden Baseline (by reference) |
| F05 (`US-OFR-F05-001`) | Golden Baseline v1.0 (by reference) |
| Offering State Management | Pending (no Story generated) |

Story generation for this domain has started, and Architecture Review has occurred for the generated Stories. F01 through F05 are Golden Baseline, and with `US-OFR-F05-001` at Golden Baseline the Offering Presentation Epic is complete — each recorded here by reference. Offering State Management remains Pending because no Story has yet been generated for it. This parent document therefore remains Draft and continues to be maintained by reference as further Stories are generated.

## 8. References

- `PRD-0001-offering.md` — the owner of all behaviour referenced here.
- `UX-0003-offering-detail.md`, `UX-0005-business-dashboard.md` — the owners of the referenced experience.
- `USER_STORY_HANDBOOK.md` — the definitions of Epic and Feature usage and the Story standards.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — the capability context (referenced, not redefined).
- `OFFERING_IMPLEMENTATION_BLUEPRINT.md` — the capability-wide integration view.
- `REPOSITORY_GOVERNANCE.md`, `REVIEW_PROCESS.md`, `DOCUMENT_LIFECYCLE.md` — governance, review, and lifecycle.
