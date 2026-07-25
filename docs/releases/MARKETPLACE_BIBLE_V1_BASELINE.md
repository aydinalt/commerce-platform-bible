# Marketplace Bible v1.0 Baseline

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Freeze Date:** 2026-07-25
- **Baseline Branch:** `main`
- **Development Status:** Not Started

> **Approval Note (1.0):** Approved by explicit Product Owner / Architecture Owner direction on 2026-07-25 after repository-wide Final Freeze Gate validation returned PASS with no Blocker or Major finding.

> **Freeze Note (1.0):** Frozen by separate Product Owner / Architecture Owner direction on 2026-07-25. This manifest identifies the current V1 documentation baseline; it does not edit or confer lifecycle status on its member documents. Future baseline change must follow each owning document's lifecycle and applicable ADR rules.

## 1. Purpose

This manifest identifies the authoritative documentation set from which V1 software architecture and implementation planning may begin.

## 2. Included Baseline

| Layer | Included authoritative baseline |
|---|---|
| Governance | Four Frozen v1.0 governance documents |
| Foundation | Vision, Mission, Product Manifesto, Product Principles, and V1 Scope |
| ADR | Accepted ADR-0001 through ADR-0009 |
| PRD | Frozen PRD-0001 through PRD-0006 |
| UX | Frozen UX-0001–UX-0006, UX-0008, and UX-0009 |
| Story standard | Frozen User Story Handbook v1.0 |
| Feature identity | Frozen Offering Capability Architecture v2.0 and five Frozen Feature Registries |
| Stories | Six Frozen Parent Story Documents and fifty Frozen Generated Stories |
| Traceability | Frozen traceability v1.0; fifty Feature-level chains validated |
| Engineering | Frozen Engineering Constitution v1.0 |

## 3. Explicit Exclusions

- `UX-0007-messaging.md` remains Draft v0.2 outside the V1 baseline.
- Draft blueprints, pilots, matrices, guidelines, future-vision documents, templates, indexes, and operational status files are supporting or living repository material unless separately listed above.
- Software architecture, database, API, infrastructure, hosting, code, tests, deployment, and release evidence are not part of this documentation baseline.

## 4. Gate Meaning

The baseline is ready to enter software architecture planning. It does not mean:

- implementation has started;
- any Story is delivered;
- a technology stack has been selected;
- code or infrastructure exists;
- V1 release readiness has been achieved.

All fifty Generated Stories retain `Delivery Status: Not Started`.

## 5. Change Control

- Frozen documents are never edited in place.
- A change to a Frozen standard document begins as a separate superseding Draft.
- Architectural decisions follow `ADR_PROCESS.md`.
- Repository indexes and status reports may describe this baseline but cannot redefine it.
- Any material product change requires downstream impact analysis and traceability reconciliation before implementation.

