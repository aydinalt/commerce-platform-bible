# Offering Pilot

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.2
- **Last Updated:** 2026-07-11

**Revision Note (0.2):** Controlled revision after Architecture Audit. F1 — clarified that this document is the first *implementation* of the Capability Pilot methodology (applied to the Offering capability), not the methodology itself, which belongs to the repository. F2 — the Validation Chain now allows a layer to be recorded as "Not Applicable" with documented justification when a capability legitimately does not traverse it; the official hierarchy is unchanged. F3 — reproduced hierarchy and layer-responsibility text replaced with references to the owning documents. Scope, objectives, methodology, deliverables, risks, references, exit criteria, and success criteria are unchanged.

> The first implementation of the repository's Capability Pilot methodology, applied to the Offering capability. The Capability Pilot methodology belongs to the repository; this document does not define it — it demonstrates its application. Its objective is to validate the methodology, not business functionality. It defines no behaviour, no experience, and no implementation; those remain owned by their layers and are referenced here, never redefined. Future pilots (for example `DISCOVERY_PILOT.md`, `DECISION_PILOT.md`, `BUSINESS_PILOT.md`, `PLATFORM_PILOT.md`) follow the same methodology.

---

## 1. Purpose

This document defines how the Offering capability will be used to validate the complete documentation methodology of the repository. The pilot exercises the frozen methodology — Documentation First, layer authority, the document lifecycle, the review workflow, traceability, Single Information Owner, and Reference Never Redefine — by following one capability through every documentation layer.

The purpose is methodological, not functional. The pilot does not test whether the Offering behaves correctly as a product; it tests whether the repository's methodology carries a capability cleanly from architecture to development without breaking ownership, traceability, or layer boundaries.

This document is the first implementation of the Capability Pilot methodology, not the methodology itself. The methodology belongs to the repository and is governed by its existing documents; this document demonstrates the methodology's application using the Offering capability. Future Capability Pilots follow the same methodology.

## 2. Repository Context

The Offering Pilot sits within the Capability Architecture layer's folder as a methodology-validation artifact. It is not a new repository layer and it does not alter the official repository layer hierarchy, which is defined and owned by `REPOSITORY_GOVERNANCE.md` (Foundation through Development). This document references that hierarchy and does not reproduce or redefine it.

The pilot takes the Offering capability — defined by `OFFERING_CAPABILITY_ARCHITECTURE.md` and mapped to the PRD layer by `CAPABILITY_COVERAGE_MATRIX.md` — and observes it as it moves down the official hierarchy. The pilot is a consumer and observer of the methodology; it owns none of the layers it traverses.

## 3. Pilot Objectives

- Confirm that a single capability can flow from Capability Architecture down to Development with its ownership preserved at every layer.
- Confirm that each layer transition respects Reference Never Redefine — each layer references the layer above rather than restating it.
- Confirm that the review workflow (Architecture Audit → Controlled Revision → Validation → Freeze Review) and the document lifecycle apply consistently at each layer, per `REVIEW_PROCESS.md` and `DOCUMENT_LIFECYCLE.md`.
- Confirm that traceability holds unbroken across layers, per `TRACEABILITY_GUIDELINES.md`.
- Confirm that Single Information Owner holds — no piece of information is owned in two places as the capability descends.
- Surface where the methodology creates friction, ambiguity, or duplication, so it can be improved before it is applied at scale.

## 4. Scope

- Validating the documentation methodology using the Offering capability as the single pilot subject.
- Exercising the full validation chain (Section 6) for that capability.
- Observing governance authority, the review workflow, the document lifecycle, and traceability as the capability moves through the layers.
- Producing methodology artifacts (Section 7) that record what the pilot observed.

## 5. Out of Scope

- Validating business functionality, product behaviour, or correctness of the Offering.
- Defining or changing any business rule, user experience, user story, engineering decision, or implementation.
- Technology, APIs, database, or infrastructure of any kind.
- Sprint planning or delivery scheduling.
- Introducing new capabilities, new layers, or changes to any frozen document.
- Redefining anything owned by another document; the pilot references owners only.

## 6. Validation Chain

The pilot follows the capability down the official repository layer hierarchy, which is owned by `REPOSITORY_GOVERNANCE.md` (Foundation → Capability Architecture → PRD → UX → User Stories → Engineering → Development). This document references that hierarchy and does not reproduce or redefine it. Each transition exists for a specific methodological reason, and the pilot validates that the transition works without ownership drift or redefinition.

Per-layer ownership (what each layer owns and cannot change) is defined by the Layer Authority model in `ENGINEERING_CONSTITUTION.md`. The transitions below reference that model; they do not restate it.

- **Capability Architecture → PRD.** The transition carries the capability into the layer that owns its behaviour, so behaviour is owned by the PRD and traced back to the capability, never defined at the capability layer.
- **PRD → UX.** The transition carries owned behaviour into the layer that owns its experience, so experience derives from behaviour rather than inventing it.
- **UX → User Stories.** The transition carries the experience into the layer that owns functional behaviour and its verification, so deliverable units derive from experience and remain traceable to it.
- **User Stories → Engineering.** The transition carries validated requirements into the layer that owns technical decisions, so construction derives from requirements rather than leading them.
- **Engineering → Development.** The transition carries engineering decisions into implementation, so what is built derives from documented decisions rather than undocumented assumptions.

Across every transition, the pilot checks the same methodological invariants: single ownership, reference-not-redefinition, and unbroken traceability.

**Layer Not Applicable.** The official hierarchy is never modified. However, a capability may legitimately not traverse a given layer — for example a backend, infrastructure, IoT, or AI-platform capability may have no UX surface, and therefore no user-facing experience or stories at that layer. When this occurs, the pilot records that layer as **Not Applicable** with a documented justification, and traceability continues across the layers that do apply. Marking a layer Not Applicable records that the capability does not reach it; it never removes, reorders, or redefines the layer in the hierarchy.

## 7. Deliverables

The pilot produces the following repository artifacts. Their contents are not defined here.

- A **Pilot Execution Record** documenting that the validation chain was exercised for the Offering capability.
- A **Methodology Findings record** capturing where the methodology held and where it created friction.
- A **Traceability confirmation** for the Offering capability across the layers, recorded per `TRACEABILITY_GUIDELINES.md`.
- **Per-layer review records**, produced through the standard review workflow, per `REVIEW_PROCESS.md`.
- A **Lessons record** (Section 11) feeding methodology improvement.

The pilot creates no product artifacts — no PRD behaviour, no UX, no stories, no engineering content, and no implementation.

## 8. Success Criteria

The pilot succeeds if, for the Offering capability:

- The capability is carried through every layer of the validation chain.
- Single Information Owner holds at every layer — no duplicated or conflicting ownership appears.
- Reference Never Redefine holds — each layer references, and does not restate, the layer above.
- The review workflow and document lifecycle are applied consistently and produce review records at each layer.
- Traceability is unbroken from Capability Architecture through Development, with no orphan and no broken chain.
- Any friction, ambiguity, or gap in the methodology is captured rather than silently worked around.

## 9. Exit Criteria

The pilot is complete when:

- Every transition in the validation chain has been exercised and recorded.
- All deliverables in Section 7 exist.
- The success criteria in Section 8 are either met, or the gaps are explicitly recorded.
- The Lessons record is produced.
- The Product Owner / Architecture Owner confirms the pilot outcome under the authority defined in `REPOSITORY_GOVERNANCE.md`.

## 10. Risks

Methodology risks only:

- **Ownership drift** — a lower layer restating or overriding information owned above it, violating Single Information Owner.
- **Terminology drift** — the same concept named differently across layers, weakening consistency.
- **Traceability gaps** — a layer transition that is not recorded, breaking the chain.
- **Layer boundary erosion** — behaviour, experience, or implementation appearing in the wrong layer.
- **Over-documentation** — the methodology adding process out of proportion to the value it protects.
- **Review fatigue** — the review workflow being applied inconsistently as it repeats across layers.
- **Mistaken objective** — the pilot being treated as business validation rather than methodology validation.

## 11. Lessons Expected

The repository expects to learn:

- Whether the methodology carries a capability end to end without ownership or traceability breaking.
- Where the layer handoffs are clear and where they are ambiguous.
- Whether the review workflow and lifecycle are proportionate, or too heavy or too light.
- Whether Single Information Owner and Reference Never Redefine are practical to sustain in daily use.
- Where terminology or structure needs harmonization before the methodology is applied to further capabilities.
- What should change in this pilot template before the next Capability Pilot runs.

## 12. References

- `OFFERING_CAPABILITY_ARCHITECTURE.md` — the capability the pilot exercises.
- `CAPABILITY_COVERAGE_MATRIX.md` — the capability-to-PRD coverage the pilot follows.
- `TRACEABILITY_GUIDELINES.md` — the traceability methodology the pilot validates.
- `REPOSITORY_GOVERNANCE.md` — the official layer hierarchy and authority.
- `ENGINEERING_CONSTITUTION.md` — layer authority and engineering governance.
- `USER_STORY_HANDBOOK.md` — the User Story standards referenced in the chain.
- `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md` — the lifecycle and review workflow the pilot exercises.
- `PRD-0001-offering.md` through `PRD-0006-platform.md` — the PRDs that own the Offering capability's behaviour.
- `V1_SCOPE.md`, `ADR-0001-decision-chat-ownership.md` — scope and the accepted architecture decision referenced by the layers.
- `PROJECT_ROADMAP.md`, `CURRENT_STATUS.md` — where the Offering Pilot milestone and repository status are recorded.
