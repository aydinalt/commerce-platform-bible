# Traceability

- **Owner:** Product Owner / Architecture Owner
- **Document:** Cross-Tier Traceability
- **Status:** Draft
- **Version:** 0.5
- **Last Updated:** 2026-07-16

**Revision Note (0.2):** Controlled revision implementing Accepted `ADR-0002-offering-presentation-capability.md` (v1.0). Recorded the verified Presentation row in §3 and the Accepted ADR-0002 relationship chain (ADR-0002 → Presentation → F05 → PRD-0001 → UX-0003 → US-0001 → US-OFR-F05-001), following the existing matrix structure. The opening note and closing maintenance note are reconciled so they no longer claim the document is empty or placeholder-only: this Draft may now contain a verified populated row alongside placeholders for coverage not yet reconciled. Presentation's Foundation basis is not established by ADR-0002 and is left recorded as not yet established. This document records coverage only; it duplicates no definitions from the owning documents.

**Revision Note (0.3):** Controlled revision — status terminology conformance only, following the availability of `TRACEABILITY_GUIDELINES.md` as the single owner of the traceability status vocabulary (Draft, Mapped, Validated, Approved, Baseline). (1) §4 Coverage Status: the Presentation record's status value `Partial` is replaced by `Draft` (the initial vocabulary state per `TRACEABILITY_GUIDELINES.md` §5), and the §4 section comment now references that owned vocabulary rather than the informal "fully traced / partial / missing" examples; this does not advance any record silently. (2) §5 Known Coverage Gaps: the Presentation Foundation-basis gap's status word `Open` is reworded to an unresolved open item, and it is noted that a missing Foundation basis is not a formal Orphan or Broken Chain per `TRACEABILITY_GUIDELINES.md` §7. No relationship, row, PRD/UX/Story/Feature ID, or Foundation-basis content changed; the vocabulary remains owned by `TRACEABILITY_GUIDELINES.md` and is referenced, not redefined. Status remains Draft.

**Revision Note (0.4):** Controlled revision — mandatory metadata addition, plus preservation of the terminology corrections already completed in v0.3 (they are preserved, not reintroduced as new changes). (1) The mandatory **Owner: Product Owner / Architecture Owner** metadata field is added to the header, placed consistently with the repository's other governance documents. (2) The v0.3 status-terminology corrections are preserved intact: the vocabulary owned by `TRACEABILITY_GUIDELINES.md` (Draft → Mapped → Validated → Approved → Baseline) continues to be referenced, not redefined; the Presentation record's Coverage Status remains **Draft** and is not advanced to Mapped, Validated, Approved, or Baseline; the §5 gap wording continues to avoid using "Open" as a traceability lifecycle status and continues to record the Foundation-basis gap as an unresolved open item that is not a formal Orphan or Broken Chain per `TRACEABILITY_GUIDELINES.md` §7; the §3 and §4 comments remain aligned to the vocabulary owned by `TRACEABILITY_GUIDELINES.md`. No traceability relationship, identifier, Foundation basis, status advancement, or ownership relationship changed; the verified Presentation row and the ADR-0002 → Presentation → F05 → PRD-0001 → UX-0003 → US-0001 → US-OFR-F05-001 chain, the not-yet-established Foundation basis, the Presentation Foundation-basis gap and open item, the placeholder rows, and the distinction between verified and placeholder rows are all unchanged. Status remains Draft.

**Revision Note (0.5):** Controlled revision — Presentation Foundation-basis recording (traceability-only), following the Foundation-Basis Assessment and Product Owner / Architecture Owner confirmation that Frozen `V1_SCOPE.md` establishes the Presentation product concern. (1) §3: the Presentation row's Foundation-basis cell is changed from "not yet established" to the **direct** basis `V1_SCOPE.md` (§3, Offering detail included in V1 scope; §5, full detail for a single Offering positioned Listing → Offering Detail → Compare), with `VISION.md`, `MISSION.md`, `PRODUCT_MANIFESTO.md`, and `PRODUCT_PRINCIPLES.md` recorded as **supporting** alignment; the cell continues to note the basis was not established by ADR-0002. (2) §4 Coverage Status: the Presentation record advances **Draft → Mapped** per `TRACEABILITY_GUIDELINES.md` §5 (the relationship is now recorded and agreed with its authoritative source); it is **not** advanced to Validated, Approved, or Baseline. (3) §5: the "Presentation Foundation basis" gap is closed, as the basis is established by Frozen `V1_SCOPE.md`. (4) §6: the corresponding open item is closed. No Foundation document is modified; no ADR is created or reopened; no capability, PRD, UX, Story, Feature ID, or ownership relationship changed. The Presentation capability definition remains owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` and the V1-scope basis by `V1_SCOPE.md`, referenced here and not redefined; recording this existing relationship does not transfer the capability definition into Foundation. Status remains Draft.

> This Draft traceability document may contain verified populated rows alongside placeholders for coverage that has not yet been reconciled. A populated relationship is included only when confirmed against its authoritative repository documents. Placeholder rows remain where coverage has not yet been reconciled; document IDs are recorded only where confirmed, and are not assumed for unreconciled rows. Record status values, where used, are drawn from the vocabulary owned by `TRACEABILITY_GUIDELINES.md` and are referenced, not redefined.

---

## 1. Purpose
<!-- One line: states that this document traces coverage across Foundation, PRDs, UX Specifications, and User Stories, and how to read the matrices. -->

## 2. Traceability Rules
<!-- One line: describes how items are linked across tiers (which tier informs which) and what "traced" and "gap" mean here. -->

## 3. Traceability Matrix
<!-- One line: one row per capability mapping it across the tiers; verified rows carry confirmed document IDs, placeholder rows remain until reconciled. -->

| Capability | Foundation basis | PRD | UX Spec(s) | User Stories |
|---|---|---|---|---|
| Presentation | Direct: `V1_SCOPE.md` §3 (Offering detail included in V1) & §5 (full detail for a single Offering, positioned Listing → Offering Detail → Compare). Supporting: `VISION.md`, `MISSION.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_PRINCIPLES.md`. Not established by ADR-0002. | PRD-0001 | UX-0003 | US-0001 (Epic: Offering Presentation); US-OFR-F05-001 |
| … | … | … | … | … |

Accepted-ADR relationship recorded (record only; definitions are owned by the referenced documents): `ADR-0002-offering-presentation-capability.md` (Accepted) establishes `F05 — Full Offering Detail Presentation → Presentation`, realized down this chain: ADR-0002 → Presentation → F05 → PRD-0001 → UX-0003 → US-0001 → US-OFR-F05-001. The Feature ID `F05` is owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`; the `F05 → Presentation` capability association is recorded there and consumed here by reference. The Presentation Foundation basis is owned by `V1_SCOPE.md` (Frozen) and recorded here by reference; it is not established by ADR-0002.

## 4. Coverage Status
<!-- One line: records the coverage state per capability using a status value from the vocabulary owned by TRACEABILITY_GUIDELINES.md (Draft, Mapped, Validated, Approved, Baseline); placeholder rows remain until reconciled. -->

| Capability | Status | Notes |
|---|---|---|
| Presentation | Mapped | Foundation (`V1_SCOPE.md`, direct), PRD-0001, UX-0003, and the Story layer (US-0001 / US-OFR-F05-001) are all recorded. Status is Mapped per `TRACEABILITY_GUIDELINES.md` §5 — the relationship is recorded and agreed with its authoritative source. Not advanced to Validated, Approved, or Baseline. |
| … | … | … |

## 5. Known Coverage Gaps
<!-- One line: records capabilities or items referenced in one tier but not yet owned by another; record only, do not resolve. -->

| Gap | Where referenced | Where missing | Notes |
|---|---|---|---|
| … | … | … | … |

_The former "Presentation Foundation basis" gap is closed: the basis is established by Frozen `V1_SCOPE.md` (§3, §5) and recorded in §3 above (see Revision Note 0.5)._

## 6. Open Items
<!-- One line: cross-tier questions awaiting a decision-maker; TODO only, no resolutions. -->

- <one line: open item placeholder — TODO>

_The former open item "Establish the Foundation basis for the Presentation capability" is closed: the basis exists in Frozen `V1_SCOPE.md` and is recorded in §3 (see Revision Note 0.5)._

## 7. Maintenance Rules
<!-- One line: states when this document must be updated (e.g., whenever a document is added, finalized, or reconciled) and who confirms it. -->

---

_This Draft carries verified populated rows alongside placeholders. A populated relationship is included only when confirmed against its authoritative repository documents; unreconciled rows remain placeholders and their IDs are not assumed. Record status values, where used, are drawn from the vocabulary owned by `TRACEABILITY_GUIDELINES.md`. Terminology conflicts are tracked in `docs/glossary.md` as "Pending Harmonization"; this document tracks coverage, not definitions._
