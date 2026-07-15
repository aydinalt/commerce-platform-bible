# Capability Coverage Matrix

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.4
- **Last Updated:** 2026-07-15

**Revision Note (0.2):** Controlled revision. The status vocabulary (Draft, Mapped, Validated, Approved, Baseline) is no longer defined here; it is owned by `TRACEABILITY_GUIDELINES.md` and referenced. The Learning & Evolution coverage cell now reads "Pending Mapping" instead of "None (future scope)"; no mapping is invented.

**Revision Note (0.3):** Ownership correction in Section 2 (Scope). Removed the claim that this document owns the coverage status vocabulary; it now records that the vocabulary is owned by `TRACEABILITY_GUIDELINES.md` and only referenced here. No other section changed.

**Revision Note (0.4):** Controlled revision implementing Accepted `ADR-0002-offering-presentation-capability.md` (v1.0). Added the **Presentation** capability to the coverage matrix and recorded **Presentation → PRD-0001** in §6.1, with the reciprocal addition of Presentation to PRD-0001's supported capabilities in §6.2. This is capability-to-PRD coverage only; no Feature is recorded. Every existing capability and relationship is preserved; the coverage status for the new relationship is Draft, consistent with the rest of the matrix. Capabilities remain owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` and behaviour by the PRDs; both are referenced, not redefined.

> The relationship between the Offering capabilities and the PRD layer. It proves that every capability is supported by at least one PRD and that every PRD supports at least one capability. It is not a PRD, not UX, and not traceability; it records architectural coverage only. Capabilities are owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` and behaviour is owned by the PRDs; both are referenced here, never redefined.

---

## 1. Purpose

This document establishes and proves the coverage relationship between the Offering's capabilities and the PRD layer. Its purpose is to demonstrate architectural coverage: that no capability is left without a supporting PRD, and that no PRD exists without supporting a capability. It gives the architecture a single place to confirm that the capability model and the PRD layer are aligned before behaviour is validated downstream.

Capabilities are defined by `OFFERING_CAPABILITY_ARCHITECTURE.md`. PRD behaviour is owned by the individual PRDs. This document introduces neither.

## 2. Scope

This document owns, and is the single information owner of:

- The coverage relationship between capabilities and PRDs.
- The coverage philosophy that governs how that relationship is expressed.
- The coverage rules.
- The maintenance rules for the matrix.

This document references, but does not own:

- The coverage status vocabulary (Draft, Mapped, Validated, Approved, Baseline), which is owned by `TRACEABILITY_GUIDELINES.md`.

## 3. Out of Scope

This document does not own and does not define:

- Business rules or product behaviour — owned by the PRDs.
- User experience — owned by the UX specifications.
- Traceability of features, stories, code, or tests — a separate, downstream concern.
- The definition of capabilities — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`.
- The definition of V1 scope — owned by `V1_SCOPE.md`.

This matrix proves coverage; it does not create traceability and records no features, stories, or code.

## 4. Coverage Philosophy

Capabilities and PRDs have a **many-to-many** relationship.

- A Capability may span multiple PRDs.
- A PRD may support multiple Capabilities.
- A one-to-one mapping is never forced. Where a capability is supported by more than one PRD, all supporting PRDs are recorded; where a PRD supports more than one capability, all supported capabilities are recorded.

Coverage means only that a capability is *supported* by a PRD — that the PRD is a place where that capability's behaviour is owned. It does not measure completeness, correctness, or approval; those are expressed by coverage status and confirmed downstream.

## 5. Validation Flow

Coverage sits between the capability model and downstream traceability:

```
Capability Architecture
  ↓
Coverage Matrix
  ↓
PRD Traceability
  ↓
UX Traceability
  ↓
Story Traceability
  ↓
Code Traceability
```

The Capability Architecture defines the capabilities. This Coverage Matrix proves those capabilities are supported by the PRD layer. The traceability layers below then carry each capability's behaviour down through PRD, UX, Story, and Code. This document performs only the second step; it never performs the traceability steps beneath it.

## 6. Capability Coverage Matrix

The following uses only the existing PRDs. No new PRDs are introduced.

### 6.1 Capability → Supporting PRDs

| Capability | Supporting PRDs | Coverage Status |
|---|---|---|
| Creation | PRD-0001, PRD-0005 | Draft |
| Representation | PRD-0001, PRD-0006 | Draft |
| Presentation | PRD-0001 | Draft |
| Discovery | PRD-0002 | Draft |
| Decision Analysis | PRD-0004 | Draft |
| Decision Support | PRD-0004 | Draft |
| Lifecycle | PRD-0001 | Draft |
| Visibility & Eligibility | PRD-0001, PRD-0006 | Draft |
| Contact & Action | PRD-0004, PRD-0003, PRD-0005 | Draft |
| Learning & Evolution | Pending Mapping (future scope) | Draft |

Note: Learning & Evolution is a capability defined for future scope in `OFFERING_CAPABILITY_ARCHITECTURE.md` and carried by no current PRD. It is represented here so that no capability is omitted; its supporting PRDs are recorded as **Pending Mapping** (no mapping is invented), its coverage remains Draft, and whether it enters V1 is governed by `V1_SCOPE.md`.

Note: Presentation is the capability introduced by `ADR-0002-offering-presentation-capability.md` (Accepted) and defined in `OFFERING_CAPABILITY_ARCHITECTURE.md`; its behaviour is supported by `PRD-0001`. This matrix records capability-to-PRD coverage only and records no Feature; the `F05 → Presentation` association is owned by the Feature Registry in `OFFERING_CAPABILITY_ARCHITECTURE.md`.

### 6.2 PRD → Supported Capabilities

| PRD | Supported Capabilities | Coverage Status |
|---|---|---|
| PRD-0001 | Creation, Representation, Presentation, Lifecycle, Visibility & Eligibility | Draft |
| PRD-0002 | Discovery | Draft |
| PRD-0003 | Contact & Action | Draft |
| PRD-0004 | Decision Analysis, Decision Support, Contact & Action | Draft |
| PRD-0005 | Creation, Contact & Action | Draft |
| PRD-0006 | Representation, Visibility & Eligibility | Draft |

## 7. Coverage Status

Coverage status describes how far a coverage relationship has progressed. The status vocabulary — Draft, Mapped, Validated, Approved, Baseline — is owned by `TRACEABILITY_GUIDELINES.md` and is referenced here, not redefined. For the definition of each status and the order in which they advance, see `TRACEABILITY_GUIDELINES.md`.

In this document, "Coverage Status" applies that shared vocabulary to a capability-to-PRD coverage relationship. Nothing in this Draft is marked beyond Draft.

## 8. Coverage Rules

- **Every Capability must be represented.** Every capability defined by `OFFERING_CAPABILITY_ARCHITECTURE.md` appears in this matrix.
- **Every PRD must support at least one Capability.** No PRD appears without at least one supported capability.
- **No orphan Capability.** A capability with no supporting PRD is flagged as an open coverage item, not omitted.
- **No orphan PRD.** A PRD that supports no capability is flagged for correction, not hidden.
- **Many-to-many is preserved.** No rule forces a capability onto a single PRD or a PRD onto a single capability.

## 9. Maintenance Rules

- The matrix is updated whenever a capability or a PRD is added, changed, or removed.
- A new capability is added as a new row in the capability view and reconciled in the PRD view; a new PRD is added as a new row in the PRD view and reconciled in the capability view.
- Both views are kept consistent: a relationship recorded in one view is recorded in the other.
- Coverage status advances only through review and approval, per the governance documents; it is never advanced silently.
- Orphans — a capability with no PRD, or a PRD with no capability — are surfaced as open coverage items rather than removed.
- The matrix remains a coverage artifact only. It is not traceability, and it never records features, stories, code, or tests.

## 10. References

- `OFFERING_CAPABILITY_ARCHITECTURE.md` — the capability model these rows are drawn from.
- `TRACEABILITY_GUIDELINES.md` — the owner of the status vocabulary (Draft, Mapped, Validated, Approved, Baseline) referenced by this document.
- `PRD-0001-offering.md` through `PRD-0006-platform.md` — the PRDs whose support is recorded here.
- `V1_SCOPE.md` — the authoritative statement of what is in and out of V1.
- Governance: `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`.
