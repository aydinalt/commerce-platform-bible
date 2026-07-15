# US-OFR-F01-001 — Offering Creation

> **Golden Reference (informative only).** This document serves as the reference implementation of the repository Story structure. Future Story documents should follow its structure while consuming repository standards by reference. This note is informative only: it defines no normative behaviour, claims no methodology ownership, and alters no standard. `USER_STORY_HANDBOOK.md` remains the Single Information Owner of the Story standards.

## 1. Metadata

| Field | Value |
|-------|-------|
| Story ID | `US-OFR-F01-001` |
| Story Title | Offering Creation |
| Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` (owned by `REPOSITORY_GOVERNANCE.md`) |
| Epic | Offering Authoring |
| Feature | F01 — Offering Creation |
| Feature ID | `F01` (owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`) |
| Capability | Creation |
| Perspective | Business Owner (Decision Journey as owned by `glossary.md`) |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0005-business-dashboard.md` |
| Status | Draft |
| Delivery Status | Not Started |
| Story Size | M |
| Version | 0.4 |
| Last Updated | 2026-07-11 |

---

## 2. Story Identification

The Story identifier follows the Generated User Story ID format owned and defined in `USER_STORY_HANDBOOK.md` (§5); that format is referenced here, not restated.

| Segment | Value | Owner (by reference) |
|---------|-------|----------------------|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` (Offering Story Domain) | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F01` (Offering Creation) | `OFFERING_CAPABILITY_ARCHITECTURE.md` — Feature ID Ownership |
| `[ID]` | `001` (first Story of the Feature) | `USER_STORY_HANDBOOK.md` |

This Story is contained by the Story Document `US-0001 Offering` (Document ID owned by `USER_STORY_HANDBOOK.md` §5) and belongs to exactly one Epic (Offering Authoring) and exactly one Feature (F01 — Offering Creation).

---

## 3. Purpose

To let an owning Business bring a new Offering into existence so that the Offering exists as a Draft the Business owns and can subsequently author.

This Story realizes the Creation capability only: the act by which an Offering comes into existence. Behaviour is owned by `PRD-0001-offering.md`; this Story references that behaviour and does not redefine it.

---

## 4. Business Value

**As an** owning Business,
**I want** to create a new Offering,
**so that** it exists as a Draft I own and can begin to author toward publication.

Creation is the entry point of the Business-side authoring journey. Until an Offering exists, the Business has no object to describe, refine, or publish. Bringing the Offering into existence as a Draft gives the Business an owned, persistent object to work on, without exposing anything to consumers before the Business is ready. The value delivered here is the existence and ownership of the Offering, not its description, its publication, or its discoverability — each of which is delivered by other Features.

---

## 5. Description

An owning Business initiates the creation of a new Offering from its business surface. On creation, the Offering comes into existence in the **Draft** state and is associated with the owning Business that created it. The Draft Offering is available to that Business as an owned Draft, and it is neither Published nor publicly visible as a result of creation.

This Story is bounded to the single meaningful Business outcome of **an Offering coming into existence as a Draft owned by the creating Business**. It ends at the Draft state. Moving the Offering toward availability (the Draft → Published transition) belongs to the Offering Publication Epic; changing the Offering after it exists belongs to Offering Editing (F02); taking it out of circulation belongs to Offering Retirement (F03); describing it through Attributes and Categories belongs to the Representation capability. None of those is part of this Story.

The specific set of content required for a valid Draft Offering at the moment of creation is behaviour owned by `PRD-0001-offering.md`. Where `PRD-0001-offering.md` leaves that requirement undecided, it is carried here as a TODO (see §11) and is not invented in this Story, in accordance with the Documentation-First discipline of `USER_STORY_HANDBOOK.md`.

---

## 6. References

Repository references only; each is consumed by reference and never redefined here.

| Layer | Document | Referenced For |
|-------|----------|----------------|
| Capability | `OFFERING_CAPABILITY_ARCHITECTURE.md` | The Creation capability and the Feature ID `F01` |
| Implementation Blueprint | `OFFERING_IMPLEMENTATION_BLUEPRINT.md` | The capability-wide integration view (Creation aspect) |
| PRD (behaviour) | `PRD-0001-offering.md` | Creation behaviour and the Offering lifecycle (Draft state) |
| PRD (Business context) | `PRD-0005-business.md` | The owning Business that creates the Offering |
| PRD (access gating) | `PRD-0003-identity.md` | Login gating that governs who may act on Offerings |
| UX | `UX-0005-business-dashboard.md` | The Business surface for creating and managing Offerings |
| Epic | `US-0001-offering.md` | Epic: Offering Authoring |
| Feature | `US-0001-offering.md` | Feature: F01 — Offering Creation |
| Domain Code | `REPOSITORY_GOVERNANCE.md` | The `OFR` Story Domain code |
| Standards | `USER_STORY_HANDBOOK.md` | Story standards, INVEST, Definition of Ready, Definition of Done, Validation Checklist |

---

## 7. Acceptance Criteria

Each Acceptance Criterion expresses behaviour only and is objectively testable. Behaviour is owned by `PRD-0001-offering.md`; these criteria reference that behaviour and do not implement it.

- **AC-1** — The system shall bring a new Offering into existence when an owning Business initiates creation.
- **AC-2** — The system shall place a newly created Offering in the Draft state.
- **AC-3** — The system shall associate a newly created Offering with the owning Business that created it.
- **AC-4** — The system shall make a newly created Offering available to its owning Business.
- **AC-5** — The system shall not publish an Offering as part of its creation.
- **AC-6** — The system shall not make a newly created Offering publicly visible as part of its creation.

> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** The reporting of the creation outcome to the owning Business — including any distinction between a successful creation and a creation that does not complete — depends on the creation-validation behaviour owned by `PRD-0001-offering.md` and its presentation owned by `UX-0005-business-dashboard.md`. Both are undecided at the time of writing; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `PRD-0001-offering.md`):** The specific content required for a valid Draft Offering at creation, and the system's behaviour when that content is absent, are owned by `PRD-0001-offering.md`. Where undecided there, the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.

---

## 8. BDD

Given / When / Then scenarios are contained inside this Story. No external test documents are referenced.

### Scenario: An owning Business creates a new Offering
```
Given an owning Business on its business surface
When the Business creates a new Offering
Then the system brings the Offering into existence in the Draft state
And the system associates the Offering with that owning Business
```

### Scenario: A newly created Offering is a Draft and is not published
```
Given an owning Business has created a new Offering
When the creation completes
Then the Offering is in the Draft state
And the Offering is not Published
And the Offering is not publicly visible
```

### Scenario: A created Offering is available to its owning Business
```
Given an owning Business has created a new Offering in the Draft state
When the Business views its owned Offerings
Then the system lists the created Offering as owned by that Business
And the system shows the Offering in the Draft state
```

> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** Scenarios covering how the creation outcome is reported to the owning Business — including any distinction between a successful creation and a creation that does not complete — depend on the creation-validation behaviour owned by `PRD-0001-offering.md` and its presentation owned by `UX-0005-business-dashboard.md`, and are carried as TODO until decided there.
> **TODO (owned by `PRD-0001-offering.md`):** Scenarios covering the required content of a valid Draft at creation, and the behaviour when required content is missing, are owned by `PRD-0001-offering.md` and are carried as TODO until decided there.

---

## 9. Dependencies

Only the `Depends On` and `Blocks` relationships defined by `USER_STORY_HANDBOOK.md` are used.

**Depends On**
- `PRD-0001-offering.md` — Creation behaviour and the Draft lifecycle state.
- `UX-0005-business-dashboard.md` — the Business surface for creation.
- `PRD-0005-business.md` — the owning Business must exist as the creation actor and ownership recipient.
- `PRD-0003-identity.md` — access gating that determines an authenticated owning Business may act on Offerings.

**Blocks**
- Offering Editing (F02) — an Offering must exist before it can be edited.
- Draft-to-Published publication (Offering Publication Epic) — an Offering must exist as a Draft before it can be published.

The listed Blocks relationships represent the immediate downstream dependencies of this Story and are not intended to be an exhaustive dependency inventory.

---

## 10. Story Size

**M** (repository T-Shirt sizing per `USER_STORY_HANDBOOK.md`).

No Story Points are used in this document.

---

## 11. Out of Scope

The following behaviour is intentionally excluded from this Story:

- **Editing** an existing Offering — belongs to Offering Editing (F02).
- **Publication** and the Draft → Published transition — belongs to the Offering Publication Epic.
- **Retirement** / taking an Offering out of circulation — belongs to Offering Retirement (F03).
- **Representation** — defining or populating the Offering's Attributes and Categories as descriptors (owned by `PRD-0001-offering.md` for Representation; management owned by `PRD-0006-platform.md`).
- **Discovery** of Offerings — owned by `PRD-0002-discovery.md`.
- **Identity behaviour** itself (authentication and login flows) — owned by `PRD-0003-identity.md`; referenced here only as a gating precondition.
- **Decision behaviour** (Compare, Decision Chat, Contact) — owned by `PRD-0004-decision.md`.
- **Business Profile management** — owned by `PRD-0005-business.md`; only the ownership association at creation is in scope.
- **Platform behaviour** (Category and Attribute management, moderation) — owned by `PRD-0006-platform.md`.
- **Consumer-side behaviour** — this Story is written from the Business Owner perspective only.
- **The mandatory content of a valid Draft at creation** — owned by `PRD-0001-offering.md`; carried as a TODO where undecided (see §7, §8).

---

## 12. Definition of Ready

This Story's readiness is governed by the Definition of Ready in `USER_STORY_HANDBOOK.md` (§11). It is referenced here and not duplicated.

---

## 13. Definition of Done

This Story's completion is governed by the Definition of Done in `USER_STORY_HANDBOOK.md` (§18). It is referenced here and not duplicated.

---

## 14. Story Validation Checklist

Per the Story Validation Checklist in `USER_STORY_HANDBOOK.md` (§22):

- ☑ Represents one Decision Journey step (Decision Journey as owned by `glossary.md`; here, an owning Business brings an Offering into existence)
- ☑ Provides user value (an owned Draft Offering the Business can author)
- ☑ Independently understandable
- ☑ Independently testable
- ☑ Traceable (Capability, Blueprint, PRD, UX, Epic, Feature — see §6)
- ☑ References resolve correctly
- ☑ No duplicate Story
- ☑ No implementation details
- ☑ No Story overlap (Editing, Publication, Retirement, Representation excluded — see §11)
