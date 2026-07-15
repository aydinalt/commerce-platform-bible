# ADR-0002 — Offering Presentation Capability

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Last Updated:** 2026-07-15

**Revision Note (0.2):** Controlled revision — authority-language correction only. Corrected two authority-language defects: (1) §1 Context no longer characterizes the Architecture Decision Analysis as "approved"; it is now described as a completed analysis that evaluated the alternatives and recommended introducing a Presentation capability. (2) §11 Relationships now separates *Decision basis* (the Architecture Decision Analysis, a decision input and rationale source) from *Decision authority* (the Product Owner / Architecture Owner, per `ADR_PROCESS.md`). The Architecture Decision Analysis is characterized only as analysis, decision input, recommendation, and rationale source — never as approval, acceptance, or final-decision authority. No decision content changed: the ADR remains **Proposed**; the proposed Presentation capability, the `F05 → Presentation` mapping, alternatives, boundaries, consequences, risks, scope constraints, follow-ups, and the F02 deferral are unchanged. The ADR is not marked Accepted and the ADR Index is not modified.

**Revision Note (0.3):** Controlled revision resolving the remaining Architecture Review findings and precision items; no decision content changed and the ADR remains **Proposed**. (1) Neutralized the Architecture Re-Review authority wording in §1 and §2: "accepted Architecture Re-Review" / "accepted Re-Review" now read "completed Architecture Re-Review," referenced as review evidence only and not as an acceptance authority or governance decision. (2) Removed the unsupported capability attributions in §5: the Business information surfaced on the Offering is displayed by Presentation with behaviour owned by `PRD-0005-business.md`, and the Favorites entry is displayed by Presentation with behaviour owned by `PRD-0004-decision.md`; neither is assigned to Contact & Action, and no unsupported capability mapping is asserted. The authoritatively supported mappings (Attribute groups → Representation; Compare → Decision Analysis; Contact, messaging, and phone-reveal → Contact & Action) are retained. (3) Made §6 consequence language conditional on acceptance. (4) Corrected the §10 follow-up wording to extend the existing authoritative Feature Registry rather than refer to a Feature-to-Capability Registry as though it exists. (5) Added `docs/traceability.md` as a conditional follow-up per `REVIEW_PROCESS.md` §10 (not performed here). (6) Recorded a pre-commit ADR-identifier uniqueness check in §11. (7) Added a Presentation vs Decision Support boundary in §5. The v0.2 authority structure (Decision basis vs Decision authority; Architecture Decision Analysis described as completed, not approved) is preserved unchanged; the ADR is not marked Accepted and the ADR Index is not modified.

**Revision Note (0.4):** Controlled revision — §8 Risks terminology correction only. The second risk bullet's reference to a "Feature-to-Capability Registry" is corrected to "the Feature Registry's `F05 → Presentation` association," matching the existing authoritative Feature Registry in `OFFERING_CAPABILITY_ARCHITECTURE.md` and the already-corrected §10 follow-up wording. The risk's meaning is preserved. No decision content, authority language, boundary, ownership statement, consequence, scope constraint, follow-up, or status changed; the ADR remains **Proposed**, is not marked Accepted, and the ADR Index is not modified.

**Revision Note (1.0):** Acceptance. The Product Owner / Architecture Owner — the sole acceptance authority per `REPOSITORY_GOVERNANCE.md` §5 and `ADR_PROCESS.md` §8 — has formally accepted the decision recorded in this ADR, transitioning it **Proposed → Accepted** (`ADR_PROCESS.md` §5). Validation completed (validation review passed) prior to acceptance, and the §11 pre-commit identifier-uniqueness check was performed and confirmed that no other Proposed, in-flight, withdrawn, or unindexed ADR uses `ADR-0002`. The version is set to `1.0` on acceptance, per the "reaches `1.0` when first Approved" rule in `DOCUMENT_LIFECYCLE.md` §6 and consistent with the Accepted ADR-0001 precedent. The accepted decision is preserved exactly: introduce Presentation as a distinct Offering capability and map `F05 — Full Offering Detail Presentation` to Presentation; the alternatives, boundaries, ownership statements, consequences, risks, scope constraints (including the F01–F04 exclusion and the F02 deferral), and the §10 required follow-up revisions are unchanged. **No downstream revision was performed in this step:** the §10 follow-ups (Capability Architecture, Coverage Matrix, Implementation Blueprint, `US-OFR-F05-001`, `docs/traceability.md`) and the ADR Index update remain outstanding and are executed as separate change sets. Revision Notes 0.2, 0.3, and 0.4 are preserved above.

> A record of a single significant architectural decision: whether to introduce **Presentation** as a distinct Offering capability and map the Feature `F05` — Full Offering Detail Presentation to it. This ADR records the decision, its rationale, and its consequences; it does not itself change any repository document. The ADR process, numbering, lifecycle, and approval are owned by `ADR_PROCESS.md` and referenced here, never redefined.

**Status note:** Per `ADR_PROCESS.md` §5, an ADR uses only the states **Proposed → Accepted → Superseded**, which are specific to ADRs and separate from the document lifecycle. This record is **Accepted**: the decision below has been accepted by the Product Owner / Architecture Owner and is in force and authoritative. Per `ADR_PROCESS.md` §11, an Accepted ADR is not edited in place; any future change of substance is made by a superseding ADR. This ADR is not superseded.

---

## 1. Context

The authoritative Feature-to-Capability home for `F05` — Full Offering Detail Presentation is undetermined. During the Controlled Revision Assessment of `US-OFR-F05-001`, the Story was found to have *inferred* a capability (`Representation (presented to a viewer)`), which is prohibited: a downstream document may consume a capability mapping but may not allocate or infer one. The owning document, `OFFERING_CAPABILITY_ARCHITECTURE.md`, defines **Representation** as "the capability by which an Offering is described and structured through its Attributes and Categories **as descriptors**" — descriptor structuring, not consumer presentation. A completed Architecture Re-Review found that `F05` is **consumer-side Full Offering Detail Presentation**, distinct from Business-side descriptor authoring.

The behaviour `F05` realizes is approved: `PRD-0001-offering.md` states that Guests and Users can **view Offering details** (§11.13), and `UX-0003-offering-detail.md` specifies the Offering Detail screen, which presents a single Offering in full (its image gallery, its Attribute groups, and the Business behind it) together with entry points to act on it. `US-0001-offering.md` gives this a dedicated Epic, **Offering Presentation**, with the bounded outcome "A complete Offering can be presented in full." No capability currently defined in `OFFERING_CAPABILITY_ARCHITECTURE.md` §6 (Creation, Representation, Discovery, Decision Analysis, Decision Support, Lifecycle, Visibility & Eligibility, Contact & Action, Learning & Evolution) has, as its concern, presenting the complete Offering to a viewer. A completed Architecture Decision Analysis evaluated the alternatives and recommended introducing a Presentation capability.

Introducing a capability is an architecture change and a long-term architectural commitment, which under `ADR_PROCESS.md` §3 requires an ADR.

## 2. Decision Drivers

- **One concern per capability.** F05's concern — presenting the complete Offering (gallery + Attribute groups + Business) to a viewer for evaluation — is a distinct concern that no existing capability owns.
- **Do not broaden Representation without explicit architectural support.** §6 ties Representation to Attributes/Categories "as descriptors"; extending it to consumer presentation is a broadening the owning architecture does not state.
- **Reference, never redefine.** A mapping must be consumable by reference from an authoritative source; F05 must not invent its own.
- **Alignment with approved behaviour and experience.** `PRD-0001` §11.13 (view Offering details) and `UX-0003` (Offering Detail) both describe presenting the complete Offering to a viewer.
- **Consistency with the completed Architecture Re-Review**, which separated consumer-side Presentation from Business-side Representation.
- **Scalability** for future consumer-facing Offering presentation Features.

## 3. Considered Alternatives

1. **Map F05 to Representation.** Rejected as the home: Representation is descriptor structuring; mapping here broadens Representation without support and conflates two concerns (descriptor model vs full presentation). Note: `OFFERING_IMPLEMENTATION_BLUEPRINT.md` previously aligned the Offering-detail experience to Representation — a working (non-Baseline) alignment that is the principal counter-argument to this decision and is addressed as a follow-up reconciliation if accepted.
2. **Map F05 to Discovery.** Rejected: Discovery owns *reaching* the Offering (`PRD-0002`), which `US-0001` explicitly excludes from this Feature; F05 begins after the viewer has reached the Offering.
3. **Map F05 to Visibility & Eligibility.** Rejected as the home: Visibility & Eligibility governs *whether and where* an Offering is *eligible to appear* — a precondition of presentation, not the presentation of its full content.
4. **Map F05 to Decision Analysis.** Rejected: Decision Analysis owns analysing and comparing Offerings (`PRD-0004`, Compare); F05 presents a single Offering and excludes Compare behaviour.
5. **Introduce Presentation** as a distinct capability. **Selected** (see §4).
6. **Reframe or decompose F05.** Rejected as unnecessary: F05 is a coherent, bounded Feature (present the complete Offering; show action entries without performing them); no redefinition is warranted.

## 4. Decision

Introduce **Presentation** as a distinct Offering capability:

> **Presentation** — the capability by which a complete Offering is presented to a viewer.

Behaviour ownership is referenced to `PRD-0001-offering.md`; the primary experience owner is `UX-0003-offering-detail.md`. The Feature `F05` — Full Offering Detail Presentation maps to the **Presentation** capability (`F05 → Presentation`). Presentation is defined at the architectural-concern level only; it specifies no screen, field, user behaviour, acceptance criterion, or implementation.

## 5. Architectural Boundaries

Presentation is distinguished from every adjacent capability:

- **vs Representation** — Representation describes and structures the Offering through its Attributes and Categories *as descriptors*; Presentation *presents the complete Offering to a viewer*. Presentation displays the descriptors Representation defines but does not define or structure them.
- **vs Discovery** — Discovery owns *reaching* the Offering (search, browse, filter). Presentation begins once the viewer is on the Offering; it does not own discovery.
- **vs Visibility & Eligibility** — Visibility & Eligibility governs *whether and where* an Offering is eligible to appear. It is a precondition of Presentation; Presentation does not own eligibility.
- **vs Decision Analysis** — Decision Analysis owns analysing and comparing Offerings (Compare). Presentation presents a single Offering and does not own comparison.
- **vs Decision Support** — Decision Support owns assistive communication through Decision Chat; Presentation presents the Offering and does not own assistive conversation.
- **vs Contact & Action** — Contact & Action owns acting on a decision and reaching the Business. Presentation may display the *entry points* to those actions but does not own the actions.
- **vs Lifecycle** — Lifecycle owns the Offering's movement through its states over time. Presentation presents an Offering in a given state; it does not own state transitions.

**Entries without ownership.** Presentation may display information and action entries whose behaviour belongs elsewhere, **without taking ownership of that behaviour**. Where the owning capability is authoritatively established, it is named: Attribute groups (Representation); the Contact, messaging, and phone-reveal entries (Contact & Action); and the Compare entry (Decision Analysis). Two further entries are displayed **without asserting a capability owner the architecture does not establish**: the Business information surfaced on the Offering, whose behaviour is owned by `PRD-0005-business.md`, and the Favorites entry, whose behaviour is owned by `PRD-0004-decision.md`. Presenting an entry is not performing the action; the behaviour behind each entry remains owned by its PRD/UX, and by its capability only where that capability is authoritatively established.

## 6. Consequences — Positive

- Establishes a single, authoritative capability home for presenting a complete Offering to a viewer, so that, if accepted, `F05` will consume it by reference and the Story's inferred mapping will be removed.
- Preserves one-concern-per-capability and avoids broadening Representation.
- Aligns the capability model with the approved `PRD-0001` §11.13 behaviour, the `UX-0003` experience, and the `US-0001` "Offering Presentation" Epic.
- Provides a stable, scalable home for future consumer-facing Offering presentation Features.
- If accepted, reconciles the Implementation Blueprint's Offering-detail alignment with the capability model.

## 7. Consequences — Negative

- Adds a capability to the model, increasing the number of capabilities that downstream documents must account for (Coverage Matrix, Blueprint).
- Requires reconciling the Implementation Blueprint's prior Offering-detail → Representation alignment, and eventually reconciling the inferred capability strings in the already-baselined `F01`–`F04` Stories.
- Introduces a Representation/Presentation adjacency that authors must respect (display vs define descriptors), creating a boundary that could be misapplied if not clearly followed.

## 8. Risks

- **Boundary drift:** future Presentation Stories could absorb Representation (defining descriptors) or Contact & Action (performing actions) behaviour; mitigated by the §5 boundaries and the entries-without-ownership rule.
- **Coverage/consistency risk:** if the follow-up revisions are not applied together, the Coverage Matrix, Blueprint, and the Feature Registry's `F05 → Presentation` association could diverge; mitigated by applying the §10 follow-ups as one coordinated revision upon acceptance.
- **Superseded-context risk:** the prior Blueprint alignment (Representation) remains discoverable; mitigated by an append-only revision note recording the reconciliation.

## 9. Scope Constraints (explicit)

- **No Feature ID changes.** `F01`–`F05` identifiers are unchanged; no Feature ID is allocated by this ADR.
- **No Story ID changes.** No Generated Story ID is changed.
- **No PRD behaviour changes.** `PRD-0001-offering.md` behaviour is referenced, not modified.
- **No UX behaviour changes.** `UX-0003-offering-detail.md` behaviour is referenced, not modified.
- **No new Feature is introduced.** Only the Presentation *capability* is introduced; no Feature beyond `F05` is created.
- **F01–F04 mappings are not decided by this ADR.** Their Capability homes are outside this decision.
- **F02 requires a separate capability-mapping decision.** `F02` — Offering Editing has no authoritatively supported capability home in the current documents and is explicitly not resolved here.

## 10. Required Follow-up Revisions (documents affected if accepted)

These are the changes that would be required **if this ADR is accepted**. They are not performed by this ADR. (Any provisional controlled-revision drafts of these documents are proposals only and are not authoritative sources.)

- `OFFERING_CAPABILITY_ARCHITECTURE.md` — add Presentation to the Capability Map and extend the existing authoritative Feature Registry to record the `F05 → Presentation` capability association.
- `CAPABILITY_COVERAGE_MATRIX.md` — record Presentation → `PRD-0001` coverage (capability-to-PRD only; the matrix records no Features).
- `OFFERING_IMPLEMENTATION_BLUEPRINT.md` — reflect the Presentation aspect and reconcile the Offering-detail (`UX-0003`) alignment from Representation to Presentation (and Contact & Action).
- `US-OFR-F05-001-full-offering-detail-presentation.md` — replace the inferred capability metadata with the Presentation capability consumed by reference.
- `docs/traceability.md` — reflect the new Presentation capability and the `F05 → Presentation` relationship, per the traceability update requirement in `REVIEW_PROCESS.md` §10. This ADR does not perform the update.

On acceptance, this ADR is also added to the ADR Index (`docs/adr/README.md`), per `ADR_PROCESS.md` §11; the Index lists only Accepted ADRs. The Index update is performed as a separate change set and is not performed by this ADR.

## 11. Relationships

- **Decision basis:** the Architecture Decision Analysis for the Offering Feature-to-Capability mapping (analysis and recommendation: introduce Presentation) — a decision input and rationale source only, not an approval or acceptance authority.
- **Decision authority:** the Product Owner / Architecture Owner, who accepted this ADR according to `ADR_PROCESS.md` (§8 approval, §5 lifecycle).
- **Process owner:** `ADR_PROCESS.md` (creation, numbering §6, lifecycle §5, approval §8, indexing §11).
- **Index:** `docs/adr/README.md` (ADR Index).
- **Identifier integrity:** the pre-commit repository check was performed and confirmed that no other Proposed, in-flight, withdrawn, or unindexed ADR uses `ADR-0002`; the identifier is confirmed unique and unchanged.
- **Supersession:** none. This ADR supersedes no prior ADR and is not superseded.

---

**ADR ACCEPTED**
