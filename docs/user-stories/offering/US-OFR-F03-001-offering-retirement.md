# US-OFR-F03-001 — Offering Retirement

> **Reference note (informative only).** This document follows the repository Story structure established by the Golden Baselines `US-OFR-F01-001` and `US-OFR-F02-001`. It reuses that structure only; it copies no behaviour. `USER_STORY_HANDBOOK.md` remains the Single Information Owner of the Story standards, and behaviour is owned by `PRD-0001-offering.md`.

## 1. Metadata

| Field | Value |
|-------|-------|
| Story ID | `US-OFR-F03-001` |
| Story Title | Offering Retirement |
| Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` (owned by `REPOSITORY_GOVERNANCE.md`) |
| Epic | Offering Authoring |
| Feature | F03 — Offering Retirement |
| Feature ID | `F03` (owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`) |
| Capability | Lifecycle |
| Perspective | Business Owner (Decision Journey as owned by `glossary.md`) |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0005-business-dashboard.md` |
| Status | Frozen |
| Delivery Status | Not Started |
| Story Size | M |
| Version | 1.0 |
| Supersedes | `US-OFR-F03-001` v0.1 (Frozen Golden Baseline) |
| Last Updated | 2026-07-18 |

**Revision Note (0.2):** Superseding controlled revision of the Frozen Golden Baseline `US-OFR-F03-001` v0.1, re-entering the lifecycle per `DOCUMENT_LIFECYCLE.md` §6 (the frozen v0.1 baseline is preserved as the release baseline). The Capability metadata is reconciled with Accepted `ADR-0003-offering-feature-capability-associations.md`: the authoritative Feature → Capability association for `F03` is **Lifecycle** (previously self-declared "Creation (Offering Authoring family)"), as recorded in the authoritative Feature Registry of `OFFERING_CAPABILITY_ARCHITECTURE.md` §7. The incorrect treatment of "Offering Authoring family" as a Capability is removed; the Epic remains **Offering Authoring** in its own metadata field. No Story behaviour, Acceptance Criteria, scope, actors, flows, rules, dependencies, PRD/UX meaning, Feature ID, or Feature name is changed.

**Review Entry Note (0.2):** Entered formal review following successful controlled-revision validation. The superseding revision reconciles the `F03 → Lifecycle` Capability metadata with Accepted `ADR-0003-offering-feature-capability-associations.md` and the authoritative Feature Registry. No Story behaviour, Acceptance Criteria, BDD, scope, actor, dependency, Feature ID, Feature name, PRD/UX meaning, Story Size, Delivery Status, or TODO changed during this lifecycle transition.

**Approval Note (1.0):** Approved by the Product Owner / Architecture Owner following successful controlled-revision validation, formal Architecture Review, and Final Review. This approval establishes `US-OFR-F03-001` v1.0 as the Approved successor to the preserved v0.1 Frozen Golden Baseline. The approved revision records the authoritative `F03 → Lifecycle` Capability association. No Story behaviour, Acceptance Criteria, BDD, scope, actor, dependency, Feature ID, Feature name, PRD/UX meaning, Story Size, Delivery Status, or TODO changed during this lifecycle transition.

**Freeze Note (1.0):** Frozen by the Product Owner / Architecture Owner after successful controlled-revision validation, formal Architecture Review, Final Review, and explicit approval. `US-OFR-F03-001` v1.0 is now the authoritative Frozen Golden Baseline for Offering Retirement and supersedes the preserved v0.1 Frozen baseline for current repository use. Future changes must re-enter the controlled document lifecycle through a new superseding revision; this Frozen v1.0 baseline must not be edited in place. No Story behaviour, Acceptance Criteria, BDD, scope, actor, dependency, Feature ID, Feature name, Epic, Capability, PRD/UX meaning, Story Size, Delivery Status, or TODO changed during this lifecycle transition.

---

## 2. Story Identification

The Story identifier follows the Generated User Story ID format owned and defined in `USER_STORY_HANDBOOK.md` (§5); that format is referenced here, not restated.

| Segment | Value | Owner (by reference) |
|---------|-------|----------------------|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` (Offering Story Domain) | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F03` (Offering Retirement) | `OFFERING_CAPABILITY_ARCHITECTURE.md` — Feature ID Ownership |
| `[ID]` | `001` (first Story of the Feature) | `USER_STORY_HANDBOOK.md` |

This Story is contained by the Story Document `US-0001 Offering` (Document ID owned by `USER_STORY_HANDBOOK.md` §5) and belongs to exactly one Epic (Offering Authoring) and exactly one Feature (F03 — Offering Retirement).

---

## 3. Purpose

To let an owning Business retire an Offering it owns, so that the Business can take an Offering out of active circulation.

This Story realizes the Retirement part of Offering Authoring only: the owner-initiated act of taking an owned Offering out of active circulation through the Offering lifecycle. Behaviour is owned by `PRD-0001-offering.md`; this Story references that behaviour and does not redefine it.

---

## 4. Business Value

**As an** owning Business,
**I want** to retire an Offering I own,
**so that** it is taken out of active circulation when I no longer want it active.

Retirement is how a Business withdraws an existing Offering from active circulation. Without it, an Offering would remain active indefinitely once it exists. The value delivered here is that a Business can take an Offering it owns out of active circulation; it is not permanent deletion, nor the definition of what state the Offering then holds, nor how it later behaves — those are owned and decided elsewhere.

---

## 5. Description

An owning Business selects an Offering it already owns from its business surface and retires it. Retirement takes the Offering out of active circulation through the Offering lifecycle. The Offering remains owned by the same Business; retirement is not permanent deletion (`PRD-0001-offering.md` v1.1, §11.8).

This Story is bounded to the single meaningful Business outcome of **an owning Business retiring an Offering it owns**. It ends when the Offering has been taken out of active circulation. It does not create an Offering (Offering Creation, F01), change an Offering's content (Offering Editing, F02), move an Offering through publication (the Offering Publication Epic), or define the Offering's descriptor model (the Representation capability).

The resulting lifecycle state of a retired Offering (including any relationship to the Archived state), whether retirement is reversible, which lifecycle states may be retired, a retired Offering's visibility in Discovery, and the reporting of the retirement outcome are behaviour undecided in the owning documents. They are owned by `PRD-0001-offering.md` (lifecycle) and `PRD-0002-discovery.md` (Discovery visibility) and are carried here as TODO (see §7, §8, §11). They are not invented in this Story, in accordance with the Documentation-First discipline of `USER_STORY_HANDBOOK.md`.

---

## 6. References

Repository references only; each is consumed by reference and never redefined here.

| Layer | Document | Referenced For |
|-------|----------|----------------|
| Capability | `OFFERING_CAPABILITY_ARCHITECTURE.md` | The Lifecycle capability home and the Feature ID `F03` |
| ADR (association) | `ADR-0003-offering-feature-capability-associations.md` | The Accepted `F03 → Lifecycle` Feature → Capability association (recorded in `OFFERING_CAPABILITY_ARCHITECTURE.md` §7) |
| Implementation Blueprint | `OFFERING_IMPLEMENTATION_BLUEPRINT.md` | The capability-wide integration view |
| PRD (behaviour) | `PRD-0001-offering.md` | Retirement behaviour (a Business can retire an Offering it owns) and the Offering lifecycle |
| PRD (Business context) | `PRD-0005-business.md` | The owning Business that retires the Offering |
| PRD (access gating) | `PRD-0003-identity.md` | Login gating that governs who may act on Offerings |
| PRD (Discovery) | `PRD-0002-discovery.md` | Post-retirement Discovery visibility (undecided; referenced for the TODO owner) |
| UX | `UX-0005-business-dashboard.md` | The Business surface for retiring an Offering |
| Epic | `US-0001-offering.md` | Epic: Offering Authoring |
| Feature | `US-0001-offering.md` | Feature: F03 — Offering Retirement |
| Domain Code | `REPOSITORY_GOVERNANCE.md` | The `OFR` Story Domain code |
| Standards | `USER_STORY_HANDBOOK.md` | Story standards, INVEST, Definition of Ready, Definition of Done, Validation Checklist |

---

## 7. Acceptance Criteria

Each Acceptance Criterion expresses behaviour only and is objectively testable. Behaviour is owned by `PRD-0001-offering.md`; these criteria reference that behaviour and do not implement it.

- **AC-1** — The system shall allow an owning Business to retire an Offering it owns.
- **AC-2** — The system shall retire only the Offering the owning Business selected.
- **AC-3** — The system shall take a retired Offering out of active circulation.
- **AC-4** — The system shall keep the retired Offering associated with the same owning Business.
- **AC-5** — The system shall allow a Business to retire only Offerings it owns.
- **AC-6** — The system shall not permanently delete an Offering as part of retirement.

> **TODO (owned by `PRD-0001-offering.md`):** The resulting lifecycle state of a retired Offering (including any relationship to the Archived state), whether retirement is reversible, and which lifecycle states may be retired are undecided (`PRD-0001-offering.md` §6, §9, §16); the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `PRD-0002-discovery.md`, with offering visibility owned by `PRD-0001-offering.md`):** A retired Offering's visibility in Discovery is undecided; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** The reporting of the retirement outcome to the owning Business — including any distinction between a successful retirement and a retirement that does not complete — is undecided; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.

---

## 8. BDD

Given / When / Then scenarios are contained inside this Story. No external test documents are referenced.

### Scenario: An owning Business retires an Offering it owns
```
Given an owning Business with an Offering it already owns
When the Business retires that Offering
Then the system takes the Offering out of active circulation
And the system keeps the Offering associated with the same owning Business
```

### Scenario: Retirement is not permanent deletion
```
Given an owning Business with an Offering it already owns
When the Business retires that Offering
Then the system takes the Offering out of active circulation
And the system does not permanently delete the Offering
```

### Scenario: A Business can retire only Offerings it owns
```
Given a Business and an Offering that the Business does not own
When the Business attempts to retire that Offering
Then the system does not allow the retirement
```

> **TODO (owned by `PRD-0001-offering.md`):** Scenarios covering the resulting lifecycle state of a retired Offering, whether retirement is reversible, and which lifecycle states may be retired are undecided and are carried as TODO until decided there.
> **TODO (owned by `PRD-0002-discovery.md`, offering visibility owned by `PRD-0001-offering.md`):** Scenarios covering a retired Offering's visibility in Discovery are undecided and are carried as TODO until decided there.
> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** Scenarios covering how the retirement outcome is reported to the owning Business — including any distinction between a successful retirement and one that does not complete — are undecided and are carried as TODO until decided there.

---

## 9. Dependencies

Only the `Depends On` and `Blocks` relationships defined by `USER_STORY_HANDBOOK.md` are used.

**Depends On**
- Offering Creation (F01) — an Offering must exist before it can be retired.
- `PRD-0001-offering.md` — Retirement behaviour (a Business can retire an Offering it owns).
- `UX-0005-business-dashboard.md` — the Business surface for retiring an Offering.
- `PRD-0005-business.md` — the owning Business must exist as the actor and ownership context.
- `PRD-0003-identity.md` — access gating that determines an authenticated owning Business may act on Offerings.

**Blocks**
- None identified at this time.

The listed relationships represent the immediate dependencies of this Story and are not intended to be an exhaustive dependency inventory.

---

## 10. Story Size

**M** (repository T-Shirt sizing per `USER_STORY_HANDBOOK.md`).

No Story Points are used in this document.

---

## 11. Out of Scope

The following behaviour is intentionally excluded from this Story:

- **Creation** of an Offering — belongs to Offering Creation (F01).
- **Editing** an Offering's content — belongs to Offering Editing (F02).
- **Publication** and the Draft → Published transition, and any other lifecycle-state transition — belongs to the Offering Publication Epic and to `PRD-0001-offering.md` §9.
- **Representation** — defining, structuring, or managing the Offering's Attributes and Categories as descriptors (owned by `PRD-0001-offering.md` for Representation; management owned by `PRD-0006-platform.md`).
- **Discovery** of Offerings, including a retired Offering's Discovery visibility — owned by `PRD-0002-discovery.md`; carried as TODO (see §7, §8).
- **Identity behaviour** itself (authentication and login flows) — owned by `PRD-0003-identity.md`; referenced here only as a gating precondition.
- **Decision behaviour** (Compare, Decision Chat, Contact) — owned by `PRD-0004-decision.md`.
- **Business Profile management** — owned by `PRD-0005-business.md`; retiring an Offering is not managing the Business Profile.
- **Platform behaviour** (Category and Attribute management, moderation) — owned by `PRD-0006-platform.md`.
- **Permanent deletion** of an Offering — not modelled by the repository (`PRD-0001-offering.md` v1.1 §11.8; `US-0001-offering.md` §5); it is not part of this Story.
- **Consumer-side behaviour** — this Story is written from the Business Owner perspective only.
- **The resulting lifecycle state, reversibility (restore), retirement scope by state, Discovery visibility, and retirement outcome reporting** — owned by `PRD-0001-offering.md` (lifecycle) and `PRD-0002-discovery.md` (Discovery); carried as TODO where undecided (see §7, §8).

---

## 12. Definition of Ready

This Story's readiness is governed by the Definition of Ready in `USER_STORY_HANDBOOK.md` (§11). It is referenced here and not duplicated.

---

## 13. Definition of Done

This Story's completion is governed by the Definition of Done in `USER_STORY_HANDBOOK.md` (§18). It is referenced here and not duplicated.

---

## 14. Story Validation Checklist

Per the Story Validation Checklist in `USER_STORY_HANDBOOK.md` (§22):

- ☑ Represents one Decision Journey step (Decision Journey as owned by `glossary.md`; here, an owning Business retires an Offering it owns)
- ☑ Provides user value (the Business takes an Offering out of active circulation)
- ☑ Independently understandable
- ☑ Independently testable
- ☑ Traceable (Capability, Blueprint, PRD, UX, Epic, Feature — see §6)
- ☑ References resolve correctly
- ☑ No duplicate Story
- ☑ No implementation details
- ☑ No Story overlap (Creation, Editing, Publication, Representation, Discovery, permanent deletion excluded — see §11)
