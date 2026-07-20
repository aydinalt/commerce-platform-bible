# ADR-0004 — Capability Architecture Layer Recognition

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-19
- **Deciders:** Product Owner / Architecture Owner
- **Author:** Claude (drafting advisor, per `ADR_PROCESS.md` §7)
- **Supersedes:** none
- **Related:** `ADR-0002-offering-presentation-capability.md` (Accepted v1.0), `ADR-0003-offering-feature-capability-associations.md` (Accepted v1.0) — both decided within the Capability Architecture layer whose recognition this record formalizes
- **Record type:** Retrospective — the architectural direction was implemented before this record existed

> **Status note.** This record is **Accepted**. Per `ADR_PROCESS.md` §5 and §8, an ADR is authoritative only once the Product Owner / Architecture Owner accepts it; AI may draft and recommend but may not accept. This record was Proposed at v0.1 and was accepted by the Owner on 2026-07-19 following Formal Architecture Review and Final Review. The decision in §2 is in force from that date. This ADR is **retrospective**: it records an architectural direction already implemented in the repository, and it does not claim to have been Accepted at the earlier date on which that direction was introduced. The follow-ups in §10 are separate controlled changes; nothing else in the repository is approved, frozen, or revised by virtue of this record.

> **Acceptance Note (1.0).** Accepted by the Product Owner / Architecture Owner on 2026-07-19 following successful Formal Architecture Review and Final Review. This acceptance formally recognizes Capability Architecture as an official repository documentation layer between Foundation and PRD. `REPOSITORY_GOVERNANCE.md` remains the Single Information Owner of the repository layer hierarchy. This retrospective acceptance does not claim that ADR-0004 existed or was authoritative before 2026-07-19, does not invalidate existing Capability Architecture work, does not reopen ADR-0002 or ADR-0003, and does not change any product behaviour, UX behaviour, Story behaviour, Feature ID, Feature → Capability association, or implementation decision.

---

## 1. Context

The repository recognizes an ordered documentation-layer hierarchy, owned by `REPOSITORY_GOVERNANCE.md` §10:
Foundation → Capability Architecture → PRD → UX → User Stories → Engineering → Development

The **Capability Architecture** layer was introduced into that hierarchy through ordinary controlled document revisions rather than through an Architecture Decision Record:

- `REPOSITORY_GOVERNANCE.md` **Revision Note (0.2)** records: "Officially recognized the Capability Architecture layer between Foundation and PRD… No ADR is created at this stage." That document's header records Last Updated **2026-07-11**.
- `ENGINEERING_CONSTITUTION.md` **Revision Note (1.2)** records: "Recognized the Capability Architecture layer between Foundation and PRD. Added a Capability Architecture row to the Layer Authority table (owns the Capability Model) and inserted it into the traceability chain." That document's header records Last Updated **2026-07-09**.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` implements the layer for the Offering architecture and is relied upon as an authoritative source by `ADR-0002` and `ADR-0003`, both Accepted.

`REPOSITORY_GOVERNANCE.md` §10 further records the reasoning for not creating an ADR at the time: "The decision to recognize this layer through governance and engineering documentation — rather than through a separate architecture decision record — was made deliberately after analysis… A recording via ADR was assessed as recommended but not required, and is not created at this stage."

`ADR_PROCESS.md` §3 lists **Architecture changes**, **Repository-wide decisions**, and **Governance changes** among the decisions for which an ADR is required. Introducing a new documentation layer into the repository hierarchy is all three. The recorded assessment in `REPOSITORY_GOVERNANCE.md` §10 and the rule in `ADR_PROCESS.md` §3 are therefore in tension.

An advisory review record — the *REPOSITORY_GOVERNANCE.md v0.4 Architecture and Recovery Review* — surfaced this tension and referred it to the Owner rather than resolving it. That review is advisory only and is not an authoritative repository document. The Product Owner / Architecture Owner has since decided that a retrospective ADR is required. This record is that ADR.

Capability, layer, and authority definitions referenced from their owning documents and **not redefined here**: the repository layer hierarchy (`REPOSITORY_GOVERNANCE.md` §10); per-layer authority (`ENGINEERING_CONSTITUTION.md` §2 Layer Authority); the Offering capability model, its Feature Registry, and its recorded Feature → Capability associations (`OFFERING_CAPABILITY_ARCHITECTURE.md`); document lifecycle (`DOCUMENT_LIFECYCLE.md`); review mechanics (`REVIEW_PROCESS.md`); ADR mechanics (`ADR_PROCESS.md`).

## 2. Decision

The following is the accepted architectural decision:

1. **Capability Architecture is an official repository documentation layer.**
2. **It sits between Foundation and PRD** in the repository layer hierarchy.
3. **`REPOSITORY_GOVERNANCE.md` remains the Single Information Owner of the repository layer hierarchy.** This ADR records the decision; it does not take ownership of the hierarchy and does not restate it as a competing definition.
4. **Capability Architecture documents own:**
   - capability definitions,
   - capability boundaries,
   - Feature ID allocation where assigned to them,
   - Feature → Capability associations where assigned to them.
5. **Capability Architecture does not own:** product behaviour; user-experience behaviour; individual Story behaviour; implementation design; database design; API contracts; infrastructure decisions.
6. **PRDs consume Capability Architecture by reference and own product behaviour.**
7. **UX documents consume PRDs and own experience behaviour.**
8. **User Stories consume authoritative Feature IDs and upstream behaviour by reference**, and never allocate or redefine them.
9. **Existing Capability Architecture work is not invalidated** by this retrospective recording.
10. **No downstream product or Story behaviour changes** as a result of this ADR.

## 3. Rationale

- **The rule requires it.** `ADR_PROCESS.md` §3 makes an ADR mandatory for architecture changes, repository-wide decisions, and governance changes. Recognizing a documentation layer that every downstream document must trace through is a lasting, cross-cutting architectural commitment of exactly that kind. Leaving it recorded only in revision notes leaves the repository's most structural decision without the permanent home that `ADR_PROCESS.md` §2 exists to provide.
- **The decision is already load-bearing.** Two Accepted ADRs already depend on the layer: `ADR-0002` introduced the Presentation capability and the Feature → Capability association mechanism, and `ADR-0003` decided `F01 → Creation`, `F03 → Lifecycle`, and `F04 → Lifecycle`. Both treat `OFFERING_CAPABILITY_ARCHITECTURE.md` as authoritative. A decision that Accepted ADRs build upon should itself be recorded as a decision.
- **Separating *what exists* from *how it behaves*.** The layer gives every downstream document a single, stable capability to trace to, so that behaviour (PRD), experience (UX), and delivery (User Stories, Engineering) each attach to a well-defined capability rather than to an undifferentiated whole. That reasoning is recorded in `REPOSITORY_GOVERNANCE.md` §10 and is referenced here, not restated as new rationale.
- **Consistency between two governance documents.** `REPOSITORY_GOVERNANCE.md` §10 currently records that an ADR was assessed as not required, while `ADR_PROCESS.md` §3 indicates otherwise. Recording the decision resolves the tension in the direction of the ADR process, without amending either document by this ADR.
- **Ownership boundaries need a durable statement.** Capability Architecture sits between two layers with strong ownership claims. Recording what it owns — and, equally, what it does not — protects PRDs as behaviour owners, UX as experience owner, and Engineering as implementation owner, consistent with `ENGINEERING_CONSTITUTION.md` §2.

## 4. Retrospective Recording

This section states plainly what kind of record this is.

- **The direction was implemented before this ADR existed.** The Capability Architecture layer was introduced through `ENGINEERING_CONSTITUTION.md` Revision Note (1.2) and `REPOSITORY_GOVERNANCE.md` Revision Note (0.2), and implemented for the Offering architecture by `OFFERING_CAPABILITY_ARCHITECTURE.md`. It has been in practical use since then.
- **Two distinct dates.** The layer was **originally introduced** as evidenced by the headers of those documents (`ENGINEERING_CONSTITUTION.md` Last Updated 2026-07-09; `REPOSITORY_GOVERNANCE.md` Last Updated 2026-07-11). The decision is **formally recorded** by this ADR on **2026-07-19**. These are different dates and are not conflated.
- **The absence of a previous ADR is not hidden.** No earlier ADR for this decision exists. `REPOSITORY_GOVERNANCE.md` §10 explicitly records that one was assessed as recommended but not required and was not created. That wording is quoted in §1 rather than removed or rewritten.
- **History is preserved.** This ADR rewrites no revision note, deletes no record, and back-dates nothing. Consistent with `ADR_PROCESS.md` §2 and §10, the repository's record of how the architecture actually evolved — including the earlier decision not to create an ADR — remains intact.
- **No retroactive acceptance is claimed.** This record does not assert that it was Accepted at any earlier date, and it confers no authority over any past action.
- **Authority began on acceptance.** Per `ADR_PROCESS.md` §5 and §8, this decision became authoritative on 2026-07-19 when the Product Owner / Architecture Owner explicitly accepted it. Before that acceptance, the record was Proposed and carried no authority.
- **No automatic document changes.** No source document is approved, frozen, revised, or re-versioned by this ADR. Any consequential document change is a separate controlled change performed under `DOCUMENT_LIFECYCLE.md` and `REVIEW_PROCESS.md` (see §10).

## 5. Consequences

**Positive**

- **Explicit architectural authority.** The layer's existence and its ownership boundaries have a single permanent, discoverable home rather than being inferred from revision notes.
- **Consistent repository hierarchy.** One recorded decision stands behind the hierarchy that `REPOSITORY_GOVERNANCE.md` owns and that `ENGINEERING_CONSTITUTION.md` §2 expresses as per-layer authority.
- **Stable Capability ownership.** Capability definitions, boundaries, Feature IDs, and Feature → Capability associations have a recorded architectural basis, which strengthens the ground on which `ADR-0002` and `ADR-0003` already stand.
- **Improved traceability.** Every downstream document traces through a layer whose recognition is itself traceable to a decision record.
- **Governance and ADR-process tension resolved.** The inconsistency between `REPOSITORY_GOVERNANCE.md` §10 and `ADR_PROCESS.md` §3 is closed by recording the decision.
- **Consumption by reference.** Downstream documents continue to consume the capability model by reference, never redefining it.

**Costs and risks**

- **Another formal architecture layer to maintain.** Recognition confirms a layer that must be kept current, reviewed, and versioned like any other.
- **Maintenance obligation.** Capability Architecture documents require ongoing controlled revisions as the capability structure evolves.
- **Controlled-revision cost.** Changes to capability structure follow the full document lifecycle owned by `DOCUMENT_LIFECYCLE.md`, including its rules for Frozen documents and superseding revisions (§6–§7), referenced here and not restated.
- **Risk of over-detail.** The layer could accumulate detail that belongs to PRDs or Engineering, becoming a second behaviour document.
- **Risk of leakage.** Product behaviour, UX behaviour, or implementation design could drift upward into the capability model if boundaries are not enforced.
- **Risk of proliferation.** Recognition may invite additional capability documents beyond the Offering architecture without a decision to create them; this ADR authorizes none.

**Safeguards**

- **Single Information Owner** — each concern keeps exactly one owning document; this ADR takes ownership of nothing.
- **Reference, Never Redefine** — Capability Architecture is consumed by reference downstream and redefines nothing upstream.
- **Governance simplicity** — governance remains simpler than the documentation it governs (`REPOSITORY_GOVERNANCE.md` §1, §3).
- **ADR for material architectural changes** — further material changes to the layer or its boundaries follow `ADR_PROCESS.md` §3.
- **PRDs remain behaviour owners**; **UX remains experience owner**; **Engineering remains implementation owner**, consistent with `ENGINEERING_CONSTITUTION.md` §2 Layer Authority.
- **Upward Dependency Forbidden** — the mandatory principle in `ENGINEERING_CONSTITUTION.md` §2 continues to prevent a layer from depending on one below it.

## 6. Boundaries

This ADR concerns only the formal recognition of the Capability Architecture documentation layer, its position in the repository hierarchy, its repository-wide authority boundaries, and the resolution of the `REPOSITORY_GOVERNANCE.md` / `ADR_PROCESS.md` inconsistency.

It does **not** decide, and must not be read as deciding:

- any new capability, or any change to an existing capability definition or boundary;
- any new Feature ID, or any change to Feature ID allocation;
- any new or changed Feature → Capability mapping;
- the Discovery Feature architecture, or whether Discovery Features fall inside any existing Feature Registry;
- `F02`'s capability home, which remains Deferred / Not Yet Decided per Accepted `ADR-0003` §2 and §8;
- any product behaviour, UX behaviour, engineering design, or implementation technology.

It further does not reopen or alter `ADR-0002` or `ADR-0003`; does not amend `REPOSITORY_GOVERNANCE.md`, `ENGINEERING_CONSTITUTION.md`, or any other document; and does not advance any document or ADR lifecycle status, which remain governed by `DOCUMENT_LIFECYCLE.md` and `ADR_PROCESS.md`.

## 7. Alternatives Considered

**Alternative A — No ADR: leave the decision recorded only in governance and architecture documents.**
This is the current state. It was defensible when originally assessed, on the reasoning recorded in `REPOSITORY_GOVERNANCE.md` §10 that the load-bearing need was recognition in the authority model plus a recorded rationale. It is no longer sufficient: `ADR_PROCESS.md` §3 requires an ADR for architecture changes, repository-wide decisions, and governance changes, and a new documentation layer is all three. Retaining Alternative A leaves an explicit rule unsatisfied, leaves two Accepted ADRs resting on an unrecorded structural decision, and leaves the reasoning discoverable only by reading revision notes across two documents — which is precisely the lost-context problem `ADR_PROCESS.md` §2 exists to prevent. **Not adopted.**

**Alternative B — Treat Capability Architecture as part of the PRD layer.**
Folding the capability model into the PRDs would give one document set both *what capabilities exist* and *how they behave*, violating Single Information Owner: capability definitions and behaviour would share an owner, and no single PRD could own a model that spans all PRDs. Traceability would degrade — downstream documents currently trace to one stable capability, but would instead trace to whichever PRD happened to hold the definition. `ADR-0002` and `ADR-0003` record Feature → Capability associations against an architecture document precisely because no PRD owns that concern. It would also contradict `ENGINEERING_CONSTITUTION.md` §2, which records PRD as owning Business Rules and as unable to change the Capability Model. **Not adopted.**

**Alternative C — Treat Capability Architecture as part of Engineering.**
Placing the capability model below User Stories would make PRDs, UX, and Stories depend on a layer that comes after them, inverting the hierarchy and breaching the Upward Dependency Forbidden principle in `ENGINEERING_CONSTITUTION.md` §2. Capabilities would become an implementation artifact, so product documents could not trace to a capability until engineering work existed — contradicting Documentation First. It would also place capability definitions under a layer whose recorded authority is Technical Architecture and which "cannot change Product Behaviour," while capabilities are a product-architecture concern. **Not adopted.**

**Alternative D — Recognize Capability Architecture as an official layer between Foundation and PRD, recorded through this ADR.**
Preserves the working structure already in use, satisfies `ADR_PROCESS.md` §3, keeps hierarchy ownership with `REPOSITORY_GOVERNANCE.md`, keeps behaviour with the PRDs and experience with UX, and gives the decision one permanent home without invalidating any existing work. **This is the accepted decision (§2).**

## 8. Relationships and References

All referenced by document identifier and never redefined here.

- `REPOSITORY_GOVERNANCE.md` — Single Information Owner of the repository layer hierarchy, repository authority, roles, and governance principles.
- `ADR_PROCESS.md` — the ADR rules, lifecycle, numbering, ownership, and approval this record follows.
- `DOCUMENT_LIFECYCLE.md` — document states, transitions, and versioning for any consequential document change.
- `REVIEW_PROCESS.md` — the review activity through which this record is evaluated, and the traceability update rule.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — the Offering implementation of the Capability Architecture layer; owner of the Offering capability model, its Feature Registry, and its recorded Feature → Capability associations.
- `ENGINEERING_CONSTITUTION.md` — the Layer Authority model expressing per-layer ownership consistent with the hierarchy.
- `ADR-0002-offering-presentation-capability.md` (Accepted v1.0) — introduced the Presentation capability and the Feature → Capability association mechanism within this layer.
- `ADR-0003-offering-feature-capability-associations.md` (Accepted v1.0) — recorded `F01 → Creation`, `F03 → Lifecycle`, `F04 → Lifecycle`; `F02` remains Deferred.
- `docs/adr/README.md` — the ADR index in which this Accepted record is listed.
- *REPOSITORY_GOVERNANCE.md v0.4 — Architecture and Recovery Review* — advisory review record that surfaced the governance / ADR-process tension. Advisory only; not an authoritative repository document.

## 9. Remaining Open Question

1. **Scope of recognition.** This ADR recognizes the layer generally. It authorizes no additional Capability Architecture documents beyond those that exist; whether any future domain warrants its own capability architecture document remains a separate decision.

## 10. Post-Acceptance Follow-ups (separate controlled changes — not performed by this ADR)

1. `docs/adr/README.md` — **completed on 2026-07-19.** ADR-0004 is listed as Accepted (v1.0) in the ADR index.
2. `REPOSITORY_GOVERNANCE.md` — controlled revision to reference ADR-0004 from §10 and to close the corresponding Open Item, preserving the historical §10 rationale unchanged. Performed only under `DOCUMENT_LIFECYCLE.md` and `REVIEW_PROCESS.md`; that document is currently Draft and must complete its own lifecycle.
3. `ENGINEERING_CONSTITUTION.md` — review only, to confirm the Layer Authority table remains consistent with the recorded decision. No change is anticipated.
4. Any traceability update required by `REVIEW_PROCESS.md` §10, if this record creates or changes a recorded relationship.

No source document is modified by this ADR. Each follow-up above is performed as its own controlled change under the owning process documents.

---

**Revision Note (0.1):** Initial Proposed draft of a **retrospective** ADR, authored as a drafting-advisor deliverable following the Product Owner / Architecture Owner's decision that a retrospective ADR is required for the recognition of the Capability Architecture layer. Records the proposed decision that Capability Architecture is an official repository documentation layer between Foundation and PRD, with `REPOSITORY_GOVERNANCE.md` remaining Single Information Owner of the hierarchy, and with the layer's ownership and non-ownership boundaries stated. Evaluates Alternatives A–D. Distinguishes the date the layer was originally introduced from the date of formal recording (2026-07-19), does not conceal the absence of a previous ADR, preserves the existing `REPOSITORY_GOVERNANCE.md` §10 wording by quotation, and claims no retroactive acceptance. No capability, Feature ID, Feature → Capability mapping, Discovery Feature architecture, `F02` capability home, product behaviour, UX behaviour, or implementation decision is made. No decision is in force; this record is Proposed and awaits Product Owner / Architecture Owner acceptance under `ADR_PROCESS.md` §8.

**Revision Note (1.0):** Accepted by explicit decision of the Product Owner / Architecture Owner on 2026-07-19 following successful Formal Architecture Review and Final Review. The accepted decision formally recognizes Capability Architecture as an official repository documentation layer between Foundation and PRD, while `REPOSITORY_GOVERNANCE.md` remains the Single Information Owner of the repository layer hierarchy. This is a retrospective record only from its acceptance date; it creates no claim of earlier ADR authority, invalidates no existing Capability Architecture work, reopens no Accepted ADR, and changes no capability, Feature ID, Feature → Capability association, product behaviour, UX behaviour, Story behaviour, or implementation decision.

**Post-Acceptance Editorial Note:** Corrected current-status wording after acceptance: §4 now records that authority began on 2026-07-19; §8 reflects that the ADR is already listed in the index; §9 removes the governance follow-up that is no longer an open question; and §10 records the ADR-index update as completed. No architectural decision, scope boundary, ownership rule, acceptance decision, or lifecycle state changed.
