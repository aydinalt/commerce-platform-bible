# Generated User Story Template

- **Owner:** Product Owner / Architecture Owner
- **Status:** Approved
- **Version:** 1.0
- **Last Updated:** 2026-07-20
- **Maintenance Mode:** Living

> **Approval Note (1.0).** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 following successful Formal Architecture Review and Final Review. This first approval advances the template from In Review v0.1 to Approved v1.0. The approval establishes this file as the canonical Generated User Story layout template conforming to Frozen `USER_STORY_HANDBOOK.md` v1.0. The template remains in `Maintenance Mode: Living`; that classification does not replace lifecycle Status or Version and grants no authority to bypass controlled review. This approval does not freeze the template, modify any existing Parent Story Document or Generated Story file, allocate Domain codes or Feature IDs, create Feature → Capability associations, or modify another repository document automatically.

> This template implements the concrete layout of one Generated User Story file. It does not own User Story standards. `USER_STORY_HANDBOOK.md` is the Single Information Owner of Story structure, identifiers, wording, acceptance criteria, Definition of Ready, Definition of Done, dependencies, sizing, traceability, and quality rules. Repository authority, document lifecycle, review mechanics, and ADR rules are referenced from their owning governance documents and are never redefined here.

**Recovery Note (0.1):** Controlled recovery of the legacy `docs/_templates/US-template.md` source. The legacy source carried no canonical Owner, lifecycle Status, or document Version and contained an internal `Revision History` value of `1.1`. That internal value is preserved only as historical source evidence and is not treated as an Approved, Frozen, or authoritative lifecycle version. This candidate begins at In Review v0.1 after a Draft recovery pass and aligns the template with Frozen `USER_STORY_HANDBOOK.md` v1.0. No existing Generated Story file is modified automatically.

---

**Revision Note (1.0):** First approval. Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after Formal Architecture Review and Final Review completed with no remaining corrections. The template advances from In Review v0.1 to Approved v1.0. It implements the handbook-owned Generated Story structure, identifier and filename format, Parent Story Document / Epic / Feature cardinality, acceptance-criteria and BDD layout, dependency types, sizing, and Definition of Ready / Definition of Done references. `Maintenance Mode: Living` remains active. Freeze remains optional and requires a separate Owner decision.

## Usage Rules

1. Copy this file to create exactly one Generated User Story.
2. Replace every placeholder.
3. Use the canonical filename:

```text
US-[DOMAIN]-[FEATURE_ID]-[ID]-kebab-case-title.md
```

4. Do not invent a Domain code, Feature ID, Feature → Capability association, PRD behaviour, UX behaviour, or ADR decision.
5. Remove optional rows and sections that are not applicable.
6. Keep lifecycle `Status` separate from operational `Delivery Status`.
7. Reference Definition of Ready and Definition of Done from `USER_STORY_HANDBOOK.md`; never duplicate them.
8. Review the completed Story under `REVIEW_PROCESS.md`.

---

# US-[DOMAIN]-[FEATURE_ID]-[ID] — Story Title

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-[DOMAIN]-[FEATURE_ID]-[ID]` |
| Story Title | Story Title |
| Parent Story Document | `US-NNNN Domain` (`US-NNNN-kebab-case-domain.md`) |
| Story Domain | Domain name |
| Domain Code | `[DOMAIN]` — owned by the Story Domain Code Registry in `REPOSITORY_GOVERNANCE.md` |
| Epic | Epic name |
| Feature | `[FEATURE_ID]` — Feature name |
| Feature ID | `[FEATURE_ID]` — owned by the applicable Capability Architecture document |
| Capability | Optional — authoritative Capability name where an association exists; otherwise record `Unassigned`, `Deferred`, or `Not Applicable` exactly as owned upstream |
| Perspective | Actor / Decision Journey perspective, using glossary-owned terminology where applicable |
| Behaviour Owner | Canonical PRD |
| Experience Owner | Applicable canonical UX specification, or `Not Applicable` |
| Owner | Product Owner / Architecture Owner |
| Status | Draft |
| Delivery Status | Not Started |
| Priority | Must / Should / Could / Won't |
| Story Size | XS / S / M / L |
| Version | 0.1 |
| Last Updated | YYYY-MM-DD |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | Domain code | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | Feature ID | Applicable Capability Architecture document |
| `[ID]` | Three-digit sequence within the Feature | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Describe the single outcome this Story exists to enable.

State the boundary clearly and reference the behaviour-owning PRD rather than redefining it.

---

## 4. Business Value

> **As a** &lt;defined actor&gt;  
> **I want** &lt;one desired behaviour&gt;  
> **So that** &lt;observable benefit&gt;

Explain why the outcome matters to the actor or business.

---

## 5. Description

Describe the behaviour and its boundaries in implementation-neutral language.

Where an owning source leaves behaviour undecided, record a TODO with the owning document. Do not invent the missing decision.

---

## 6. References

List only authoritative and applicable references. Remove non-applicable rows.

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-NNNN-kebab-case-domain.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `[DOMAIN]` code |
| Capability Architecture | Optional applicable document | Feature ID and authoritative Feature → Capability association, where assigned |
| Implementation Blueprint | Optional applicable document | Integration view, only where an authoritative Blueprint exists |
| PRD | Canonical PRD | Behaviour and business rules |
| UX | Applicable canonical UX specification | Experience behaviour, where applicable |
| ADR | Accepted ADR(s), where applicable | Architectural constraints |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md`, where applicable | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

Each Acceptance Criterion states testable system behaviour and begins with **“The system shall…”**.

- **AC-1** — The system shall …
- **AC-2** — The system shall …
- **AC-3** — The system shall …

Record upstream-undecided behaviour as a TODO naming its owner.

---

## 8. BDD

BDD scenarios remain inside this Story.

### Scenario: Descriptive scenario name

```gherkin
Given <context>
When <action>
Then <observable outcome>
```

### Scenario: Additional distinct behaviour

```gherkin
Given <context>
When <action>
Then <observable outcome>
```

---

## 9. Dependencies

Use only the dependency types defined by `USER_STORY_HANDBOOK.md`.

### Depends On

- None, or list the immediate blocking prerequisite by reference.

### Blocks

- None, or list the immediate downstream Story or Feature by reference.

---

## 10. Story Size

**XS / S / M / L**

Give a brief product-level sizing rationale. Do not include Story Points or technical estimates.

---

## 11. Out of Scope

List adjacent behaviours intentionally excluded from this Story and name their authoritative owner where known.

- …
- …

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

Before requesting delivery commitment, confirm in the review record that the Story satisfies the authoritative Definition of Ready.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations are consumed by reference from `ENGINEERING_CONSTITUTION.md` and related authoritative engineering sources.

---

## 14. Story Validation Checklist

Validate against `USER_STORY_HANDBOOK.md` §22:

- [ ] Represents one Decision Journey step, where that glossary-owned concept applies
- [ ] Provides user value
- [ ] Independently understandable
- [ ] Independently testable
- [ ] Traceable
- [ ] References resolve correctly
- [ ] No duplicate Story
- [ ] No implementation details
- [ ] No Story overlap

---

## 15. Notes

Optional clarifications only. Do not place new product, UX, architecture, lifecycle, or implementation decisions here.

---

## Template Ownership Boundary

This template owns only the concrete layout and placeholders of a Generated User Story file.

It references and does not redefine:

- `USER_STORY_HANDBOOK.md` — Story standards and identifier rules;
- `REPOSITORY_GOVERNANCE.md` — authority and Domain codes;
- `DOCUMENT_LIFECYCLE.md` — document Status and Version;
- `REVIEW_PROCESS.md` — review mechanics;
- `ADR_PROCESS.md` — ADR lifecycle and acceptance;
- Capability Architecture documents — Feature IDs and assigned Feature → Capability associations;
- PRDs — product behaviour;
- UX specifications — experience behaviour;
- `ENGINEERING_CONSTITUTION.md` and Engineering documents — technical and QA obligations.

Using this template does not approve, freeze, or make a Story Ready or Done.
