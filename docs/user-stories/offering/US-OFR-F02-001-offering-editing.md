# US-OFR-F02-001 — Offering Editing

> **Reference note (informative only).** This document follows the repository Story structure established by the Golden Reference `US-OFR-F01-001`. It reuses that structure only; it copies no behaviour. `USER_STORY_HANDBOOK.md` remains the Single Information Owner of the Story standards, and behaviour is owned by `PRD-0001-offering.md`.

## 1. Metadata

| Field | Value |
|-------|-------|
| Story ID | `US-OFR-F02-001` |
| Story Title | Offering Editing |
| Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` (owned by `REPOSITORY_GOVERNANCE.md`) |
| Epic | Offering Authoring |
| Feature | F02 — Offering Editing |
| Feature ID | `F02` (owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`) |
| Capability | Creation (Offering Authoring family) |
| Perspective | Business Owner (Decision Journey as owned by `glossary.md`) |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0005-business-dashboard.md` |
| Status | Draft |
| Delivery Status | Not Started |
| Story Size | M |
| Version | 0.1 |
| Last Updated | 2026-07-11 |

---

## 2. Story Identification

The Story identifier follows the Generated User Story ID format owned and defined in `USER_STORY_HANDBOOK.md` (§5); that format is referenced here, not restated.

| Segment | Value | Owner (by reference) |
|---------|-------|----------------------|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` (Offering Story Domain) | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F02` (Offering Editing) | `OFFERING_CAPABILITY_ARCHITECTURE.md` — Feature ID Ownership |
| `[ID]` | `001` (first Story of the Feature) | `USER_STORY_HANDBOOK.md` |

This Story is contained by the Story Document `US-0001 Offering` (Document ID owned by `USER_STORY_HANDBOOK.md` §5) and belongs to exactly one Epic (Offering Authoring) and exactly one Feature (F02 — Offering Editing).

---

## 3. Purpose

To let an owning Business change an Offering it already owns, so that the Business can keep its Offering accurate.

This Story realizes the Editing part of Offering Authoring only: the owner-initiated act of changing an Offering that already exists. Behaviour is owned by `PRD-0001-offering.md`; this Story references that behaviour and does not redefine it.

---

## 4. Business Value

**As an** owning Business,
**I want** to change an Offering I own,
**so that** my Offering stays accurate over time.

Editing is how a Business keeps an existing Offering correct after it has been created. Without it, an Offering would be frozen at the moment it came into existence and could not be corrected or kept current. The value delivered here is that a Business can change an Offering it owns; it is not the Offering's creation, its publication, its removal, or the definition of its descriptor model — each of those is delivered elsewhere.

---

## 5. Description

An owning Business opens an Offering it already owns from its business surface and changes it. The change applies to that Offering, which remains owned by the same Business. Editing operates on an Offering that already exists; bringing an Offering into existence is Offering Creation (F01) and is a precondition of this Story.

This Story is bounded to the single meaningful Business outcome of **an owning Business changing an Offering it owns**. It does not move the Offering between lifecycle states (the Draft → Published transition belongs to the Offering Publication Epic), it does not remove the Offering from circulation (Offering Retirement, F03), and it does not define or manage the Attributes and Categories that describe an Offering (the Representation capability; management owned by `PRD-0006-platform.md`).

The specific set of fields that may be edited, the validation applied to an edit, the behaviour on an edit that does not complete, and whether an Offering may be edited in states beyond Draft are behaviour owned by `PRD-0001-offering.md` and its experience owned by `UX-0005-business-dashboard.md`. Where those documents leave the behaviour undecided, it is carried here as a TODO (see §7, §8, §11) and is not invented in this Story, in accordance with the Documentation-First discipline of `USER_STORY_HANDBOOK.md`.

---

## 6. References

Repository references only; each is consumed by reference and never redefined here.

| Layer | Document | Referenced For |
|-------|----------|----------------|
| Capability | `OFFERING_CAPABILITY_ARCHITECTURE.md` | The Creation/Authoring capability home and the Feature ID `F02` |
| Implementation Blueprint | `OFFERING_IMPLEMENTATION_BLUEPRINT.md` | The capability-wide integration view |
| PRD (behaviour) | `PRD-0001-offering.md` | Editing behaviour (a Business can edit an Offering it owns) |
| PRD (Business context) | `PRD-0005-business.md` | The owning Business that edits the Offering |
| PRD (access gating) | `PRD-0003-identity.md` | Login gating that governs who may act on Offerings |
| UX | `UX-0005-business-dashboard.md` | The Business surface for editing an Offering |
| Epic | `US-0001-offering.md` | Epic: Offering Authoring |
| Feature | `US-0001-offering.md` | Feature: F02 — Offering Editing |
| Domain Code | `REPOSITORY_GOVERNANCE.md` | The `OFR` Story Domain code |
| Standards | `USER_STORY_HANDBOOK.md` | Story standards, INVEST, Definition of Ready, Definition of Done, Validation Checklist |

---

## 7. Acceptance Criteria

Each Acceptance Criterion expresses behaviour only and is objectively testable. Behaviour is owned by `PRD-0001-offering.md`; these criteria reference that behaviour and do not implement it.

- **AC-1** — The system shall allow an owning Business to change an Offering it owns.
- **AC-2** — The system shall apply an edit only to the Offering the owning Business selected.
- **AC-3** — The system shall keep the edited Offering associated with the same owning Business after the edit.
- **AC-4** — The system shall allow a Business to edit only Offerings it owns.
- **AC-5** — The system shall not change the Offering's lifecycle state as part of an edit.
- **AC-6** — The system shall not publish or otherwise change the visibility of an Offering as part of an edit.

> **TODO (owned by `PRD-0001-offering.md`; fields owned via `UX-0005-business-dashboard.md` §11):** The set of fields that may be edited, and the validation applied to an edit, are undecided at the time of writing; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** The reporting of the edit outcome to the owning Business — including any distinction between a successful edit and an edit that does not complete — is undecided; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `PRD-0001-offering.md`):** Whether an Offering may be edited in states beyond Draft is undecided; `PRD-0001-offering.md` §9 defines only the Draft → Published transition. The editable-state scope remains a TODO and is not defined in this Story.

---

## 8. BDD

Given / When / Then scenarios are contained inside this Story. No external test documents are referenced.

### Scenario: An owning Business changes an Offering it owns
```
Given an owning Business with an Offering it already owns
When the Business changes that Offering
Then the system applies the change to that Offering
And the system keeps the Offering associated with the same owning Business
```

### Scenario: Editing does not change the Offering's lifecycle state
```
Given an owning Business with an Offering it already owns
When the Business changes that Offering
Then the Offering's lifecycle state is unchanged by the edit
And the edit neither publishes the Offering nor changes its visibility
```

### Scenario: A Business can edit only Offerings it owns
```
Given a Business and an Offering that the Business does not own
When the Business attempts to edit that Offering
Then the system does not allow the edit
```

> **TODO (owned by `PRD-0001-offering.md`; fields via `UX-0005-business-dashboard.md` §11):** Scenarios covering which fields may be edited and the validation applied to an edit are undecided and are carried as TODO until decided there.
> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** Scenarios covering how the edit outcome is reported to the owning Business — including any distinction between a successful edit and an edit that does not complete — are undecided and are carried as TODO until decided there.

---

## 9. Dependencies

Only the `Depends On` and `Blocks` relationships defined by `USER_STORY_HANDBOOK.md` are used.

**Depends On**
- Offering Creation (F01) — an Offering must exist before it can be edited.
- `PRD-0001-offering.md` — Editing behaviour (a Business can edit an Offering it owns).
- `UX-0005-business-dashboard.md` — the Business surface for editing an Offering.
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
- **Retirement** / taking an Offering out of circulation — belongs to Offering Retirement (F03).
- **Publication** and the Draft → Published transition, and any other lifecycle-state change — belongs to the Offering Publication Epic.
- **Representation** — defining, structuring, or managing the Offering's Attributes and Categories as descriptors (owned by `PRD-0001-offering.md` for Representation; management owned by `PRD-0006-platform.md`). Changing a value through editing is in scope only to the extent `PRD-0001-offering.md` owns it; the descriptor model itself is not.
- **Discovery** of Offerings — owned by `PRD-0002-discovery.md`.
- **Identity behaviour** itself (authentication and login flows) — owned by `PRD-0003-identity.md`; referenced here only as a gating precondition.
- **Decision behaviour** (Compare, Decision Chat, Contact) — owned by `PRD-0004-decision.md`.
- **Business Profile management** — owned by `PRD-0005-business.md`; editing an Offering is not editing the Business Profile.
- **Platform behaviour** (Category and Attribute management, moderation) — owned by `PRD-0006-platform.md`.
- **Consumer-side behaviour** — this Story is written from the Business Owner perspective only.
- **The editable field set, edit validation, edit-outcome behaviour, and editable-state scope** — owned by `PRD-0001-offering.md` (fields via `UX-0005-business-dashboard.md` §11); carried as TODO where undecided (see §7, §8).

---

## 12. Definition of Ready

This Story's readiness is governed by the Definition of Ready in `USER_STORY_HANDBOOK.md` (§11). It is referenced here and not duplicated.

---

## 13. Definition of Done

This Story's completion is governed by the Definition of Done in `USER_STORY_HANDBOOK.md` (§18). It is referenced here and not duplicated.

---

## 14. Story Validation Checklist

Per the Story Validation Checklist in `USER_STORY_HANDBOOK.md` (§22):

- ☑ Represents one Decision Journey step (Decision Journey as owned by `glossary.md`; here, an owning Business changes an Offering it owns)
- ☑ Provides user value (the Business keeps its Offering accurate)
- ☑ Independently understandable
- ☑ Independently testable
- ☑ Traceable (Capability, Blueprint, PRD, UX, Epic, Feature — see §6)
- ☑ References resolve correctly
- ☑ No duplicate Story
- ☑ No implementation details
- ☑ No Story overlap (Creation, Retirement, Publication, Representation excluded — see §11)
