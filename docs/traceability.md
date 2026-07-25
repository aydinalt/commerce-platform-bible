# Traceability

- **Owner:** Product Owner / Architecture Owner
- **Document:** Cross-Tier Traceability
- **Status:** Draft
- **Version:** 0.7
- **Last Updated:** 2026-07-25

**Revision Note (0.7):** Records the Owner-approved and Frozen Offering Capability Architecture v2.0 baseline and closes the F06/F07 capability-home gap. This revision records existing authoritative relationships only and does not change the Draft lifecycle state of this traceability document.

## 1. Purpose

This document records cross-tier coverage and unresolved traceability work. Definitions remain owned by the referenced authoritative documents.

## 2. Rules

- A row is populated only from repository sources that are present and authoritative.
- A reference records ownership; it never transfers or duplicates ownership.
- Status values follow `TRACEABILITY_GUIDELINES.md`.
- Repository reconciliation is not by itself traceability validation.

## 3. Verified Capability Mapping

| Capability | Foundation basis | PRD | UX | Story coverage | Status |
|---|---|---|---|---|---|
| Presentation | Direct: `V1_SCOPE.md` §§3, 5. Supporting: Vision, Mission, Product Manifesto, and Product Principles. | PRD-0001 | UX-0003 | US-0001; US-OFR-F05-001 | Mapped |
| Handoff Enablement | `ADR-0006`, `ADR-0007`, and `ADR-0008` | PRD-0001; PRD-0005 and PRD-0006 supporting | Applicable Business/Admin and person-facing handoff surfaces | US-0001; US-OFR-F06-001; US-OFR-F07-001 | Mapped |

Accepted relationship chain:

`ADR-0002 → Presentation → F05 → PRD-0001 → UX-0003 → US-0001 → US-OFR-F05-001`

`ADR-0008 → Handoff Enablement → F06/F07 → PRD-0001 → US-0001 → US-OFR-F06-001/US-OFR-F07-001`

`OFFERING_CAPABILITY_ARCHITECTURE.md` owns the Feature ID and Feature → Capability association. This file records the chain only.

## 4. Reconciled Story-Domain Inventory

| Story Domain | Feature-ID owner | Behaviour owner | Primary UX owners | Parent Story | Generated Stories | Repository state |
|---|---|---|---|---|---:|---|
| Offering (`OFR`) | `OFFERING_CAPABILITY_ARCHITECTURE.md` | PRD-0001 | UX-0003, UX-0005 and applicable handoff UX | US-0001 | 7 | Frozen |
| Discovery (`DSC`) | `DISCOVERY_FEATURE_REGISTRY.md` | PRD-0002 | UX-0001, UX-0002, UX-0003, UX-0004 | US-0002 | 10 | Frozen |
| Identity (`IDN`) | `IDENTITY_FEATURE_REGISTRY.md` | PRD-0003 | UX-0008 and applicable return surfaces | US-0003 | 9 | Frozen |
| Decision (`DEC`) | `DECISION_FEATURE_REGISTRY.md` | PRD-0004 | UX-0004, UX-0008, UX-0009 | US-0004 | 7 | Frozen |
| Business (`BUS`) | `BUSINESS_FEATURE_REGISTRY.md` | PRD-0005 | UX-0005 and applicable Admin review surface | US-0005 | 7 | Frozen |
| Platform (`PLT`) | `PLATFORM_FEATURE_REGISTRY.md` | PRD-0006 | UX-0006, UX-0008 | US-0006 | 10 | Frozen |

The table confirms repository presence and lifecycle state. It does not assert that every Feature-level chain has completed independent traceability validation.

## 5. Parent and Generated Story Counts

The `Candidate State` values embedded in the six Frozen Parent Story Documents are
historical snapshots of the candidates reviewed when each Parent was approved.
They are not the current lifecycle authority for the referenced Generated Story
files. The current repository state is the lifecycle metadata in each Generated
Story file and the reconciliation table below: all 50 Generated Stories are
`Frozen v1.0` with Delivery Status `Not Started`. The Frozen Parent files remain
unchanged; any future change to their inventories requires a controlled revision.

| Domain | Parent | Generated | Total |
|---|---:|---:|---:|
| Offering | 1 | 7 | 8 |
| Discovery | 1 | 10 | 11 |
| Identity | 1 | 9 | 10 |
| Decision | 1 | 7 | 8 |
| Business | 1 | 7 | 8 |
| Platform | 1 | 10 | 11 |
| **Total** | **6** | **50** | **56** |

## 6. Known Coverage Gaps

| Gap | State | Required action |
|---|---|---|
| Full Feature-level capability validation across all six domains | Open work item; not a lifecycle status | Validate every registry Feature against its owning PRD, UX reference, Parent Story, and Generated Story |
| Repository-wide traceability lifecycle | Draft | Complete Architecture Review and Final Review before any Owner approval |
| `UX-0007 Messaging` relationship to the current V1 baseline | Unresolved | Preserve Draft v0.2 until an explicit lifecycle or scope decision is made |

## 7. Maintenance

Update this document whenever an authoritative cross-tier relationship is added, revised, validated, approved, frozen, deprecated, or archived. The source document controls its own lifecycle; this traceability record cannot confer status on another document.
