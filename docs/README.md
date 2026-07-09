# Commerce Platform Bible — Documentation Index

- **Document:** Documentation Bible Index
- **Status:** Draft
- **Version:** 0.1

> Outline-level scaffolding. Tables contain placeholder rows only and are not populated with repository data. Each heading carries a one-line description of what belongs beneath it.

---

## 1. Purpose
<!-- One line: states that this document is the single entry point and index for the documentation bible, and how to navigate it. -->

## 2. Repository documentation structure
<!-- One line: shows the top-level `docs/` layout (folders and root documents) as a simple tree, without describing contents. -->

## 3. Folder descriptions
<!-- One line: describes what each folder holds, one short description per folder; contested terminology is tracked in the glossary and marked "Pending Harmonization" there, not duplicated here. -->

- `docs/foundation/` — <one line: timeless foundation documents and the version scope document>
- `docs/prd/` — <one line: product requirement documents (capability behaviour)>
- `docs/ux-specs/` — <one line: UX specifications (screen and interaction behaviour)>
- `docs/user-stories/` — <one line: user stories derived from PRDs and UX specs>
- `docs/adr/` — <one line: architecture decision records>
- `docs/_templates/` — <one line: document skeletons that enforce required section structures>
- `docs/glossary.md` — <one line: canonical terminology and terms Pending Harmonization>
- `docs/traceability.md` — <one line: cross-tier coverage map and known gaps>

## 4. Documentation hierarchy
<!-- One line: explains how the tiers relate (Foundation informs PRDs; PRDs inform UX Specs and User Stories; ADRs record architecture decisions referenced by PRDs). -->

## 5. Documentation lifecycle
<!-- One line: describes the stages a document moves through from creation to freeze, and where reviews occur. -->

## 6. Document status definitions
<!-- One line: defines each status value used in headers; ADR-specific statuses live in docs/adr/ and are not redefined here. -->

| Status | Meaning |
|---|---|
| `Draft` | <one line: work in progress; not yet approved> |
| `Approved` | <one line: reviewed and frozen for the stated version> |
| … | <placeholder — add statuses only if already in use> |

## 7. Versioning rules
<!-- One line: states how version numbers are assigned and when they change (e.g., relative to Draft vs Approved), implementation-agnostic. -->

| Version state | Applies when |
|---|---|
| `0.x` | <one line: pre-approval / draft> |
| `1.0` | <one line: first approved/frozen version> |
| … | <placeholder — subsequent versions> |

## 8. Naming conventions
<!-- One line: records the existing naming rules for documents and IDs; do not introduce new conventions. -->

- **Document IDs:** <one line: `PREFIX-NNNN` with zero-padded four digits> — placeholder example: `PRD-NNNN`
- **Capability filenames:** <one line: `PREFIX-NNNN-slug.md`>
- **Foundation filenames:** <one line: `UPPERCASE.md`>
- **Folders:** <one line: existing folder names are canonical and are not renamed>

## 9. Documentation index tables
<!-- One line: one index table per tier listing every document; leave placeholder rows — do not populate with repository assumptions. -->

### 9.1 Foundation
<!-- One line: index of foundation documents and the version scope document. -->

| Document | Title | Status | Version |
|---|---|---|---|
| … | … | … | … |
| … | … | … | … |

### 9.2 PRDs
<!-- One line: index of product requirement documents. -->

| ID | Title | Status | Version |
|---|---|---|---|
| PRD-NNNN | … | … | … |
| … | … | … | … |

### 9.3 UX Specifications
<!-- One line: index of UX specification documents. -->

| ID | Title | Status | Version |
|---|---|---|---|
| UX-NNNN | … | … | … |
| … | … | … | … |

### 9.4 User Stories
<!-- One line: index of user-story documents. -->

| ID | Title | Status | Version |
|---|---|---|---|
| US-NNNN | … | … | … |
| … | … | … | … |

### 9.5 ADRs
<!-- One line: index of architecture decision records; detailed ADR process lives in docs/adr/. -->

| ID | Title | Status | Date |
|---|---|---|---|
| ADR-NNNN | … | … | … |
| … | … | … | … |

---

_Outline only. Populate descriptions and table rows in a later pass, confirming each document's header against the repository. Contested terminology is recorded as "Pending Harmonization" in `docs/glossary.md`._
