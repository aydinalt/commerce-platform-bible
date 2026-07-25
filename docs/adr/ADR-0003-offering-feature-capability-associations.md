# ADR-0003 — Offering Authoring & Publication Feature → Capability Associations (F01–F04)

- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-16
- **Accepted:** 2026-07-17
- **Deciders:** Product Owner / Architecture Owner
- **Author:** Claude (drafting advisor, per `ADR_PROCESS.md` §7)
- **Supersedes:** none
- **Related:** `ADR-0002-offering-presentation-capability.md` (Accepted v1.0 — introduced the Feature → Capability association mechanism and deferred F02, §9)

> **Status note.** This record is **Accepted**. The Product Owner / Architecture Owner has accepted the associations decided in §2 (`F01 → Creation`, `F03 → Lifecycle`, `F04 → Lifecycle`), and has decided that `F02` remains **Deferred** (its capability home is Not Yet Decided). Per `ADR_PROCESS.md` §5 and §8, these associations are authoritative as of acceptance; the ADR was drafted by an AI advisor and accepted by the Owner, who is the sole accepting authority. The follow-ups in §9 are to be performed as separate controlled revisions — nothing else in the repository changes by virtue of this record alone.

---

## 1. Context

The authoritative Feature Registry in `OFFERING_CAPABILITY_ARCHITECTURE.md` (§7, v0.6) is the Single Information Owner of Offering-domain Feature → Capability associations. Prior to this decision it recorded only `F05 → Presentation` (decided by Accepted `ADR-0002`). The associations for `F01`–`F04` were **not decided**, and `ADR-0002` §9 explicitly deferred `F02`.

Meanwhile the four Golden Baseline Stories self-declare a Capability in their metadata — `F01 → Creation`, and `F02`/`F03`/`F04 → "Creation (…family)"`. Because the Registry, not the Story, is the authoritative owner, these self-declarations are not authoritatively backed, and two of them cite an Epic family ("Offering Authoring family", "Offering lifecycle family") rather than a capability (there is no "Authoring" capability in the Capability Map). This ADR decides the authoritative associations so the Registry and the Stories agree.

Capability definitions referenced from `OFFERING_CAPABILITY_ARCHITECTURE.md` (not redefined here): **Creation** — an Offering comes into existence; **Representation** — an Offering is described/structured through descriptors; **Lifecycle** — an Offering moves through its states over time; **Visibility & Eligibility** — whether and where an Offering is eligible to appear.

## 2. Decision

| Feature | Decided Capability | Decision Status / Note |
|---------|--------------------|------------------------|
| `F01` Offering Creation | **Creation** | Accepted. Matches the existing Story metadata; no Story reconciliation required. |
| `F03` Offering Retirement | **Lifecycle** | Accepted. Supersedes the Story self-declaration "Creation" (reconciliation required, §4). |
| `F04` Offering Publication | **Lifecycle** | Accepted. Visibility & Eligibility was considered and not chosen (§6). Supersedes the Story self-declaration "Creation" (reconciliation required, §4). |
| `F02` Offering Editing | **Not Yet Decided (—)** | **Deferred.** No capability home is decided by this ADR; F02 remains a separate future architecture decision (§6, §8). It is not recorded in the Registry as an association and is not marked "Unresolved." |

This ADR records only the accepted Feature → Capability associations (`F01 → Creation`, `F03 → Lifecycle`, `F04 → Lifecycle`) in the authoritative Feature Registry. `F02` remains deferred and is not recorded as an association.

## 3. Rationale

- **F01 → Creation.** Creation is "the capability by which an Offering comes into existence." Offering Creation is that concern exactly; the Story's self-declaration already matches. No contention.
- **F03 → Lifecycle.** Retirement takes an owned Offering out of active circulation — a movement of the Offering into a new state, which is the Lifecycle concern ("an Offering moves through its states over time"), not Creation. The cessation of appearance is a downstream consequence governed by Visibility & Eligibility, not the primary concern the Feature owns. _Verification Note: the retirement-through-lifecycle framing is confirmed by `US-OFR-F03-001` (§3, §5), which describes retirement as the owner-initiated act of taking an owned Offering out of active circulation through the Offering lifecycle; the Lifecycle conclusion also rests independently on the §6 Lifecycle definition._
- **F04 → Lifecycle.** Publication is the Draft → Published transition — a movement between states, which is the Lifecycle concern. Becoming eligible to appear is the downstream consequence of that transition; Visibility & Eligibility governs eligibility itself, but the Feature names the state transition, so Lifecycle is its home. The Story labels this "(Offering lifecycle family)" while declaring "Creation," an internal tension this decision resolves in favour of Lifecycle. The Visibility & Eligibility framing was considered and not adopted (§6).
- **F02 deferred.** Editing keeps an existing Offering accurate; it is not "coming into existence," so Creation does not fit its literal definition, and Representation (descriptor editing) is only a partial fit. `ADR-0002` §9 found no authoritatively supported home. The Owner has decided to keep F02 deferred as a genuine product/architecture judgment to be made explicitly in a future decision rather than inferred here.

## 4. Consequences

- The Feature Registry §7 "Recorded Feature → Capability associations" is extended by a controlled revision of `OFFERING_CAPABILITY_ARCHITECTURE.md` to record `F01 → Creation`, `F03 → Lifecycle`, and `F04 → Lifecycle` (reference recording only; no capability is redefined). `F02` is not recorded (deferred).
- **Golden Baseline reconciliation.** `F01`–`F04` Stories are Frozen (Golden Baseline). Each Story whose self-declared Capability differs from this decision requires a **superseding** controlled revision (a new version), because frozen documents are never edited in place:
  - `F03` (declared "Creation", decided **Lifecycle**) — superseding revision required.
  - `F04` (declared "Creation", decided **Lifecycle**) — superseding revision required.
  - `F01` (declared "Creation", decided **Creation**) — no change required.
  - `F02` — no change required while deferred.
- No Feature ID, Feature name, Feature behaviour, PRD, UX, Epic, or Story behaviour changes; only the authoritative Feature → Capability association is recorded.
- Traceability relationships created or changed are recorded per the traceability update rule in `REVIEW_PROCESS.md`.

## 5. Boundaries

- This ADR decides Feature → Capability **associations** only. It does not redefine any capability, alter any Feature's behaviour, change any Feature ID or name, or modify any PRD or UX.
- It does not reopen or alter `ADR-0002`.
- It does not advance any document or traceability lifecycle status; those remain governed by `DOCUMENT_LIFECYCLE.md` and `TRACEABILITY_GUIDELINES.md`.

## 6. Alternatives Considered

- **F04 → Visibility & Eligibility** (not chosen): publication makes an Offering eligible to appear. Reasonable under a "purpose" framing. Not adopted because the Feature names the mechanism — a state transition — with eligibility as a downstream consequence; the decision leans Lifecycle on that basis.
- **F02 → Creation (broadened)** (not adopted; F02 deferred): treat "authoring/maintenance" as part of Creation. This would keep the Authoring Epic in one capability but stretches Creation's definition beyond "comes into existence." Broadening a capability definition is a redefinition outside the scope of an association-only ADR, so it is not available here; it is recorded only as a considered option for any future F02 decision.
- **F02 → Representation** (not adopted; F02 deferred): editing largely touches descriptors (Attributes/Categories), which is Representation's concern. Recorded as a considered option for a future F02 decision; the fit for editing that reaches non-descriptor fields is partial. _Future Decision Prerequisite: any future F02 decision toward Representation should confirm the scope of Offering Editing against `PRD-0001-offering.md` before recording._
- **Do nothing** (rejected): leave all four undecided. Rejected — the Registry/Story conflict persists and blocks a clean documentation package.

## 7. Relationships and References

- `OFFERING_CAPABILITY_ARCHITECTURE.md` — owner of the capability definitions and the Feature Registry that records the accepted associations.
- `US-0001-offering.md`, `US-OFR-F01-001`…`US-OFR-F04-001` — the Stories whose metadata this decision reconciles.
- `PRD-0001-offering.md` — behaviour owner for Creation, Lifecycle, and Offering-authoring behaviour (referenced, not redefined).
- `ADR-0002-offering-presentation-capability.md` — related; established the association mechanism and deferred F02.
- `REVIEW_PROCESS.md`, `DOCUMENT_LIFECYCLE.md`, `TRACEABILITY_GUIDELINES.md`, `REPOSITORY_GOVERNANCE.md` — governance, lifecycle, traceability, and authority (referenced, not redefined).

## 8. Future Decisions

ADR-0003 is **complete and Accepted**. The associations in §2 (`F01 → Creation`, `F03 → Lifecycle`, `F04 → Lifecycle`) are final and unconditional. One matter is intentionally left to a separate future architecture decision and does not affect the acceptance of this record:

1. **F02 Offering Editing — capability home (Not Yet Decided).** F02 is deferred; its capability home is not decided by this ADR and is not recorded as an association. A future architecture decision must choose an architecturally available home — the considered options are Representation, or a decomposition of the Feature per `OFFERING_CAPABILITY_ARCHITECTURE.md` §9 if Editing genuinely spans concerns — without redefining Creation.

## 9. Follow-ups (this ADR is Accepted — performed as separate controlled changes, not by this ADR)

1. Controlled revision of `OFFERING_CAPABILITY_ARCHITECTURE.md` §7 to record `F01 → Creation`, `F03 → Lifecycle`, and `F04 → Lifecycle`.
2. Superseding controlled revisions of the Golden Baseline Stories whose Capability metadata differs from the decision (`F03` and `F04`; `F01` and `F02` need no change).
3. `docs/adr/README.md` ADR Index entry for ADR-0003 (per `ADR_PROCESS.md` §11).
4. Any traceability update required by `REVIEW_PROCESS.md`; `CAPABILITY_COVERAGE_MATRIX.md` needs no change (it records capability → PRD, not Feature → Capability).

---

**Revision Note (1.0):** Accepted by the Product Owner / Architecture Owner. Records `F01 → Creation`, `F03 → Lifecycle`, and `F04 → Lifecycle`; keeps `F02` Deferred (capability home Not Yet Decided). Removed Proposed/"Owner decision required" framing from §2 and §3; moved the F04 → Visibility & Eligibility and F02 → Creation-broadened / Representation options into Alternatives Considered (§6) as considered-but-not-adopted; resolved the F04 open question and narrowed the future work to F02 (§8). No capability defined or redefined, no architecture modified, no Feature ID/name/behaviour changed; only the authoritative Feature → Capability associations are decided, to be recorded via the §9 follow-ups.

**Revision Note (0.1):** Initial Proposed draft, authored as a drafting-advisor deliverable following the F01–F04 Feature → Capability analysis. Proposed `F01 → Creation`, `F03 → Lifecycle`, `F04 → Lifecycle` (V&E alternative), and kept `F02` deferred pending an explicit Owner decision. No decision was in force at 0.1; the record was Proposed and awaited Product Owner / Architecture Owner acceptance under `ADR_PROCESS.md` §8.
