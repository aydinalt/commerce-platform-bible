# Traceability

- **Owner:** Product Owner / Architecture Owner
- **Document:** Cross-Tier Traceability
- **Status:** In Review
- **Version:** 0.8
- **Last Updated:** 2026-07-25

**Revision Note (0.7):** Records the Owner-approved and Frozen Offering Capability Architecture v2.0 baseline and closes the F06/F07 capability-home gap. This revision records existing authoritative relationships only and does not change the Draft lifecycle state of this traceability document.

**Review Entry Note (0.8):** Completes repository-wide Feature-level validation across all six Story Domains. Every authoritative Feature ID is matched to its behaviour-owning PRD, applicable Frozen V1 UX source, Frozen Parent Story placement, and Frozen Generated Story. It also records that Draft `UX-0007 Messaging` is outside the Frozen V1 scope and is not required by any V1 Feature chain. This revision creates no product, UX, Feature, Story, Capability, or implementation behaviour.

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

The table confirms repository presence and lifecycle state. Feature-level validation evidence is recorded below.

## 5. Feature-Level Validation Matrix

Each listed Feature was checked individually against its authoritative Feature owner, behaviour-owning PRD reference, applicable UX reference, Parent Story Feature Map, Generated Story identifier, and current lifecycle metadata.

| Domain | Validated Feature IDs | PRD owner | Frozen V1 UX coverage | Parent | Generated Stories | Result |
|---|---|---|---|---|---:|---|
| Offering | F01–F07 | PRD-0001; PRD-0005/0006 supporting where cited | UX-0003, UX-0005, UX-0006 | US-0001 | 7 | PASS |
| Discovery | F01–F10 | PRD-0002 | UX-0001, UX-0002, UX-0003, UX-0004 | US-0002 | 10 | PASS |
| Identity | F01–F09 | PRD-0003 | UX-0001, UX-0002, UX-0005, UX-0006, UX-0008, UX-0009 as cited | US-0003 | 9 | PASS |
| Decision | F01–F07 | PRD-0004 | UX-0004, UX-0008, UX-0009 | US-0004 | 7 | PASS |
| Business | F01–F07 | PRD-0005 | UX-0003, UX-0005, UX-0006, UX-0009 as cited | US-0005 | 7 | PASS |
| Platform | F01–F10 | PRD-0006; target-owning PRDs supporting where cited | UX-0005, UX-0006, UX-0008 | US-0006 | 10 | PASS |
| **Total** | **50 authoritative Feature IDs** | **6 owning PRDs** | **8 Frozen V1 UX documents** | **6 Parents** | **50** | **PASS** |

Validation rules and results:

- every authoritative Feature ID has exactly one canonical owner;
- every Feature is placed exactly once in its domain Parent Story;
- every Feature has exactly one first Generated Story in the current V1 baseline;
- all 50 Generated Stories are `Frozen` with Delivery Status `Not Started`;
- all cited PRD and UX files exist in the repository;
- supporting cross-domain references do not transfer behaviour ownership;
- no generated Story depends on Draft `UX-0007 Messaging`.

## 6. Parent and Generated Story Counts

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

## 7. Scope Decision — UX-0007 Messaging

`UX-0007 Messaging` is not part of the current Frozen V1 baseline. Frozen PRD-0003, PRD-0004, PRD-0005, and PRD-0006 explicitly exclude Messaging, while Frozen UX-0008 and UX-0009 preserve the no-Messaging boundary. No authoritative Feature or Generated Story requires UX-0007.

Repository treatment:

- retain `UX-0007-messaging.md` as historical Draft v0.2;
- do not use it as a V1 behaviour or traceability source;
- do not approve, Freeze, delete, or archive it without a separate lifecycle decision;
- require a future V1 scope revision before Messaging can enter an authoritative chain.

## 8. Remaining Lifecycle Work

| Item | State | Required action |
|---|---|---|
| Full Feature-level validation across all six domains | Complete — PASS | Preserve evidence and rerun after any controlled upstream revision |
| Repository-wide traceability lifecycle | In Review v0.8 | Complete Architecture Review and Final Review before Owner approval |
| `UX-0007 Messaging` relationship to V1 | Resolved for V1 | Retain as historical Draft outside the Frozen V1 baseline |

## 9. Maintenance

Update this document whenever an authoritative cross-tier relationship is added, revised, validated, approved, frozen, deprecated, or archived. The source document controls its own lifecycle; this traceability record cannot confer status on another document.
