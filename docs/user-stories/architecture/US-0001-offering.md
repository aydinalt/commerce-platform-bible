# US-0001 — Offering User Stories

- **Status:** Draft
- **Version:** 0.4
- **Last Updated:** 2026-07-11

**Revision Note (0.2):** Controlled preparation. This document is restructured from draft User Stories into the Epic → Feature decomposition of the PRD-0001 Offering Story domain. It now contains no User Stories; Story generation for each Feature is Pending and begins only after Architecture Review. Scope is limited to behaviour owned by `PRD-0001-offering.md`; work owned by other PRDs is excluded. The capability-wide integration view remains owned by `OFFERING_IMPLEMENTATION_BLUEPRINT.md`.

**Revision Note (0.3):** Architectural consistency checks. The Epic "Offering Presentation" was reviewed and retained as the best bounded outcome for PRD-0001. The Feature "Offering removal" was renamed to "Offering retirement" because `PRD-0001-offering.md` models lifecycle through states rather than permanent deletion (no Delete behaviour is asserted). The Feature "Extended lifecycle states (Hidden, Archived)" was renamed to "Offering State Management," with Hidden and Archived kept as future Story concerns rather than Feature names. The Story Generation Status labels were mirrored to match; no status or structure changed.

**Revision Note (0.4):** Cross-reference reconciliation. `PRD-0001-offering.md` (v1.1) reworded its Business "delete" capability to "retire" — taking an owned Offering out of active circulation through the Offering lifecycle, not permanent deletion. This makes the "Offering retirement" Feature name and its §5 definition here fully consistent with the behaviour owner. No Epic, Feature, Feature ID, Story, or structure changed in this document; retirement behaviour remains owned by `PRD-0001-offering.md` and is referenced here, never redefined. The undecided consequences of retirement (resulting state, reversibility, visibility) are owned as TODOs by `PRD-0001-offering.md` (§16).

> The Offering Story document for the PRD-0001 Offering domain. This version establishes the Epic → Feature structure only. It contains no User Stories and defines no behaviour, experience, or implementation; those are owned by their layers and are referenced here, never redefined.

---

## 1. Purpose

This document prepares the Story layer for the PRD-0001 Offering domain by establishing its Epic → Feature structure. It exists so that Story generation has an agreed, bounded structure to attach to before any Story is written. Story creation begins only after Architecture Review; until then this document holds structure only, and nothing below the Feature level.

## 2. Scope

This document defines only the Epic → Feature decomposition of the Offering Story domain whose behaviour is owned by `PRD-0001-offering.md`. Behaviour is owned by `PRD-0001-offering.md`; the related experience is owned by the referenced UX specifications. This document is one of the PRD-aligned Story documents (US-0001 Offering, US-0002 Discovery, US-0003 Identity, US-0004 Decision, US-0005 Business, US-0006 Platform); the capability-wide integration view is owned by `OFFERING_IMPLEMENTATION_BLUEPRINT.md` and is not reproduced here.

## 3. Out of Scope

This document does not include, and this version does not define:

- Work owned by `PRD-0002-discovery.md`, `PRD-0003-identity.md`, `PRD-0004-decision.md`, `PRD-0005-business.md`, or `PRD-0006-platform.md`.
- User Stories, Story IDs, Acceptance Criteria, BDD scenarios, INVEST evaluations, Story Points, prioritisation, sequencing, and Sprint planning.
- Implementation details, APIs, and database design.

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
- **Full Offering detail presentation** — behaviour owned by `PRD-0001-offering.md`; experience `UX-0003-offering-detail.md`. (Reaching the Offering is owned by `PRD-0002-discovery.md` and is out of scope here.)

## 6. Story Generation Status

No Story identifiers are created. Every Feature is Pending Story generation until after Architecture Review.

| Epic | Feature | Story Generation |
|------|---------|------------------|
| Offering Authoring | Offering creation | Pending |
| Offering Authoring | Offering editing | Pending |
| Offering Authoring | Offering retirement | Pending |
| Offering Publication | Draft-to-Published publication | Pending |
| Offering Publication | Offering State Management | Pending |
| Offering Presentation | Full Offering detail presentation | Pending |

## 7. Readiness Check

| Check | Status |
|-------|--------|
| Epic Map complete | Yes |
| Feature Map complete | Yes |
| Ready for Architecture Review | Yes |

No Stories are generated; Story generation begins only after Architecture Review approves this decomposition.

## 8. References

- `PRD-0001-offering.md` — the owner of all behaviour referenced here.
- `UX-0003-offering-detail.md`, `UX-0005-business-dashboard.md` — the owners of the referenced experience.
- `USER_STORY_HANDBOOK.md` — the definitions of Epic and Feature usage and the Story standards.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — the capability context (referenced, not redefined).
- `OFFERING_IMPLEMENTATION_BLUEPRINT.md` — the capability-wide integration view.
- `REPOSITORY_GOVERNANCE.md`, `REVIEW_PROCESS.md`, `DOCUMENT_LIFECYCLE.md` — governance, review, and lifecycle.
