# US-OFR-F04-001 — Offering Publication

> **Reference note (informative only).** This document follows the repository Story structure established by the Golden Baselines `US-OFR-F01-001`, `US-OFR-F02-001`, and `US-OFR-F03-001`. It reuses that structure only; it copies no behaviour. `USER_STORY_HANDBOOK.md` remains the Single Information Owner of the Story standards, and behaviour is owned by `PRD-0001-offering.md`.

## 1. Metadata

| Field | Value |
|-------|-------|
| Story ID | `US-OFR-F04-001` |
| Story Title | Offering Publication |
| Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` (owned by `REPOSITORY_GOVERNANCE.md`) |
| Epic | Offering Publication |
| Feature | F04 — Offering Publication |
| Feature ID | `F04` (owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`) |
| Capability | Creation (Offering lifecycle family) |
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
| `[FEATURE_ID]` | `F04` (Offering Publication) | `OFFERING_CAPABILITY_ARCHITECTURE.md` — Feature ID Ownership |
| `[ID]` | `001` (first Story of the Feature) | `USER_STORY_HANDBOOK.md` |

This Story is contained by the Story Document `US-0001 Offering` (Document ID owned by `USER_STORY_HANDBOOK.md` §5) and belongs to exactly one Epic (Offering Publication) and exactly one Feature (F04 — Offering Publication).

---

## 3. Purpose

To let an owning Business publish a Draft Offering it owns, so that the Offering moves from Draft to Published and becomes discoverable.

This Story realizes the single approved lifecycle transition, Draft → Published (`PRD-0001-offering.md` §9). Behaviour is owned by `PRD-0001-offering.md`; this Story references that behaviour and does not redefine it.

---

## 4. Business Value

**As an** owning Business,
**I want** to publish a Draft Offering I own,
**so that** it becomes Published and discoverable to people using the platform.

Publication is the step that takes an Offering from private preparation to public availability. Until it is published, a Draft is not discoverable (`PRD-0001-offering.md` §6); once Published, the Offering can appear in Discovery and Comparison. The value delivered here is the transition from Draft to Published; it is not the creation of the Offering, the editing of its content, its removal from circulation, or the behaviour of Discovery — each of those is delivered elsewhere.

---

## 5. Description

An owning Business selects a Draft Offering it already owns from its business surface and publishes it. Publication moves the Offering from the **Draft** state to the **Published** state (`PRD-0001-offering.md` §9, §11.9). A Published Offering is discoverable and can appear in Discovery and Comparison (`PRD-0001-offering.md` §6). The Offering remains owned by the same Business.

This Story is bounded to the single meaningful Business outcome of **an owning Business publishing a Draft Offering it owns (Draft → Published)**. It ends when the Offering is Published. It does not create the Offering (Offering Creation, F01), change the Offering's content (Offering Editing, F02), take the Offering out of active circulation (Offering Retirement, F03), or define how Discovery operates on Published Offerings (the Discovery capability).

Draft → Published is the only lifecycle transition approved in the owning document (`PRD-0001-offering.md` §9). The minimum content a Draft must have to be publishable, the reporting of the publication outcome, and any transition other than Draft → Published (including returning a Published Offering to Draft, and the Hidden and Archived states) are undecided in the owning documents. They are owned by `PRD-0001-offering.md` (lifecycle and required content) and presented via `UX-0005-business-dashboard.md`, and are carried here as TODO (see §7, §8, §11). They are not invented in this Story, in accordance with the Documentation-First discipline of `USER_STORY_HANDBOOK.md`.

---

## 6. References

Repository references only; each is consumed by reference and never redefined here.

| Layer | Document | Referenced For |
|-------|----------|----------------|
| Capability | `OFFERING_CAPABILITY_ARCHITECTURE.md` | The Offering lifecycle capability home and the Feature ID `F04` |
| Implementation Blueprint | `OFFERING_IMPLEMENTATION_BLUEPRINT.md` | The capability-wide integration view |
| PRD (behaviour) | `PRD-0001-offering.md` | Publication behaviour (Draft → Published) and the Offering lifecycle |
| PRD (Business context) | `PRD-0005-business.md` | The owning Business that publishes the Offering |
| PRD (access gating) | `PRD-0003-identity.md` | Login gating that governs who may act on Offerings |
| PRD (Discovery) | `PRD-0002-discovery.md` | How Discovery operates on Published Offerings (out of scope; referenced for the boundary owner) |
| UX | `UX-0005-business-dashboard.md` | The Business surface for publishing an Offering |
| Epic | `US-0001-offering.md` | Epic: Offering Publication |
| Feature | `US-0001-offering.md` | Feature: F04 — Offering Publication |
| Domain Code | `REPOSITORY_GOVERNANCE.md` | The `OFR` Story Domain code |
| Standards | `USER_STORY_HANDBOOK.md` | Story standards, INVEST, Definition of Ready, Definition of Done, Validation Checklist |

---

## 7. Acceptance Criteria

Each Acceptance Criterion expresses behaviour only and is objectively testable. Behaviour is owned by `PRD-0001-offering.md`; these criteria reference that behaviour and do not implement it.

- **AC-1** — The system shall allow an owning Business to publish a Draft Offering it owns.
- **AC-2** — The system shall move a published Offering from the Draft state to the Published state.
- **AC-3** — The system shall publish only the Offering the owning Business selected.
- **AC-4** — The system shall keep a published Offering associated with the same owning Business.
- **AC-5** — The system shall allow a Business to publish only Offerings it owns.
- **AC-6** — The system shall make a Published Offering available to Discovery.

> **TODO (owned by `PRD-0001-offering.md`):** The minimum content a Draft Offering must have in order to be publishable is undecided (the required content of a valid Draft is a `PRD-0001-offering.md`-owned TODO); the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** The reporting of the publication outcome to the owning Business — including any distinction between a successful publication and a publication that does not complete — is undecided (`UX-0005-business-dashboard.md` §14); the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `PRD-0001-offering.md`):** Any lifecycle transition other than Draft → Published — including returning a Published Offering to Draft (unpublish) and the Hidden and Archived states — is undecided (`PRD-0001-offering.md` §6, §9, §16); it is outside this Story and remains a TODO.

---

## 8. BDD

Given / When / Then scenarios are contained inside this Story. No external test documents are referenced.

### Scenario: An owning Business publishes a Draft Offering it owns
```
Given an owning Business with a Draft Offering it already owns
When the Business publishes that Offering
Then the system moves the Offering from Draft to Published
And the system keeps the Offering associated with the same owning Business
```

### Scenario: A Published Offering becomes available to Discovery
```
Given an owning Business has published a Draft Offering it owns
When the publication moves the Offering to Published
Then the system makes the Published Offering available to Discovery
```

### Scenario: A Business can publish only Offerings it owns
```
Given a Business and a Draft Offering that the Business does not own
When the Business attempts to publish that Offering
Then the system does not allow the publication
```

> **TODO (owned by `PRD-0001-offering.md`):** Scenarios covering the minimum content required for a Draft to be publishable are undecided and are carried as TODO until decided there.
> **TODO (owned by `PRD-0001-offering.md`, presented via `UX-0005-business-dashboard.md`):** Scenarios covering how the publication outcome is reported to the owning Business — including any distinction between a successful publication and one that does not complete — are undecided and are carried as TODO until decided there.
> **TODO (owned by `PRD-0001-offering.md`):** Scenarios covering any transition other than Draft → Published (including unpublish and the Hidden and Archived states) are undecided and are carried as TODO until decided there.

---

## 9. Dependencies

Only the `Depends On` and `Blocks` relationships defined by `USER_STORY_HANDBOOK.md` are used.

**Depends On**
- Offering Creation (F01) — a Draft Offering must exist before it can be published.
- `PRD-0001-offering.md` — Publication behaviour (Draft → Published) and the Offering lifecycle.
- `UX-0005-business-dashboard.md` — the Business surface for publishing an Offering.
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
- **Retirement** / taking an Offering out of active circulation — belongs to Offering Retirement (F03).
- **Discovery** of Published Offerings — owned by `PRD-0002-discovery.md`. This Story makes a Published Offering available to Discovery; how Discovery operates is not defined here.
- **Representation** — defining, structuring, or managing the Offering's Attributes and Categories as descriptors (owned by `PRD-0001-offering.md` for Representation; management owned by `PRD-0006-platform.md`).
- **Identity behaviour** itself (authentication and login flows) — owned by `PRD-0003-identity.md`; referenced here only as a gating precondition.
- **Decision behaviour** (Compare, Decision Chat, Contact) — owned by `PRD-0004-decision.md`.
- **Business Profile management** — owned by `PRD-0005-business.md`; publishing an Offering is not managing the Business Profile.
- **Platform behaviour** (Category and Attribute management, moderation) — owned by `PRD-0006-platform.md`.
- **Any lifecycle transition other than Draft → Published** — including unpublish / return-to-Draft and the Hidden and Archived states — owned by `PRD-0001-offering.md` (§6, §9, §16); carried as TODO (see §7, §8).
- **The minimum content required for a Draft to be publishable, and publication outcome reporting** — owned by `PRD-0001-offering.md` (required content) and presented via `UX-0005-business-dashboard.md` (§14); carried as TODO where undecided (see §7, §8).
- **Consumer-side behaviour** — this Story is written from the Business Owner perspective only.

---

## 12. Definition of Ready

This Story's readiness is governed by the Definition of Ready in `USER_STORY_HANDBOOK.md` (§11). It is referenced here and not duplicated.

---

## 13. Definition of Done

This Story's completion is governed by the Definition of Done in `USER_STORY_HANDBOOK.md` (§18). It is referenced here and not duplicated.

---

## 14. Story Validation Checklist

Per the Story Validation Checklist in `USER_STORY_HANDBOOK.md` (§22):

- ☑ Represents one Decision Journey step (Decision Journey as owned by `glossary.md`; here, an owning Business publishes a Draft Offering it owns)
- ☑ Provides user value (the Offering becomes Published and discoverable)
- ☑ Independently understandable
- ☑ Independently testable
- ☑ Traceable (Capability, Blueprint, PRD, UX, Epic, Feature — see §6)
- ☑ References resolve correctly
- ☑ No duplicate Story
- ☑ No implementation details
- ☑ No Story overlap (Creation, Editing, Retirement, Discovery, non-approved transitions excluded — see §11)
