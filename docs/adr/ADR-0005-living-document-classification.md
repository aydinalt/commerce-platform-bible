# ADR-0005 — Living Document Classification and Lifecycle Relationship

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-20
- **Deciders:** Product Owner / Architecture Owner
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `DOCUMENT_LIFECYCLE.md`, `REPOSITORY_GOVERNANCE.md`, `REVIEW_PROCESS.md`, `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, `CHANGELOG.md`, `docs/adr/README.md`

> **Status note.** This ADR is Accepted and authoritative from 2026-07-20. It records the Product Owner / Architecture Owner's decision resolving the conflict between the fixed document lifecycle and repository documents described as Living. The decision does not automatically revise any other document; all follow-ups remain separate controlled changes.

> **Acceptance Note (1.0).** Accepted by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 following successful Formal Architecture Review and Final Review. Living is not a lifecycle state; it is an optional maintenance classification recorded separately as `Maintenance Mode: Living`. The fixed lifecycle remains Draft → In Review → Approved → Frozen → Deprecated → Archived. This acceptance changes no existing document header, status, version, review rule, or template automatically. All post-acceptance actions in §7 are separate controlled changes.

---

## 1. Context

`DOCUMENT_LIFECYCLE.md` defines the repository document lifecycle as:

Draft → In Review → Approved → Frozen → Deprecated → Archived

It also states that no lifecycle state may be added, removed, or renamed.

The repository also uses the word **Living** for documents that are expected to change as repository state evolves, including repository management documents and the ADR index. In some places, Living is used as if it were a lifecycle status.

This creates an authority and terminology conflict:

- either Living is an additional lifecycle state, contradicting the fixed lifecycle;
- or Living describes how a document is maintained, not its lifecycle authority.

A repository-wide decision is required before `DOCUMENT_LIFECYCLE.md` can complete review.

## 2. Decision

1. **Living is not a lifecycle state.**
2. The only document lifecycle states remain:

   Draft → In Review → Approved → Frozen → Deprecated → Archived

3. **Living is an optional maintenance classification**, recorded separately from lifecycle status as:

   `Maintenance Mode: Living`

4. A Living document must still carry a valid lifecycle `Status` and `Version`.
5. The maintenance classification does not confer authority, approval, freeze, or permission to bypass review.
6. A Living document that is currently authoritative is normally `Approved`; changes re-enter the controlled lifecycle according to `DOCUMENT_LIFECYCLE.md` and `REVIEW_PROCESS.md`.
7. A Living document may be Frozen when a release requires a locked snapshot. Freezing, and any subsequent change through a superseding revision with the Frozen baseline preserved, follow the rules owned by `DOCUMENT_LIFECYCLE.md` (§6–§7), referenced here and not restated.
8. Existing headers that use `Status: Living` are noncanonical and must be reconciled through separate controlled changes.
9. Repository management documents may evolve frequently, but frequency does not exempt them from lifecycle, authority, versioning, or Single Information Owner rules.
10. This ADR does not itself change any document header or lifecycle state.

## 3. Rationale

- **One lifecycle vocabulary.** Authority remains understandable only when every document uses the same lifecycle states.
- **Different concerns remain separate.** Lifecycle status answers whether a document is Draft, authoritative, locked, deprecated, or archived. Maintenance Mode answers whether ongoing revisions are expected.
- **No silent authority.** Calling a document Living must not make it authoritative or editable outside the lifecycle.
- **Preserved release baselines.** A Living document may still need a stable release snapshot; Frozen remains available without turning Living into a competing state.
- **Repository consistency.** The decision resolves the conflict without adding another lifecycle state or weakening the existing lifecycle.

## 4. Scope

This ADR governs only the relationship between:

- document lifecycle status;
- Living maintenance classification.

It does not define:

- review stages or review outputs;
- approval or freeze authority;
- ADR lifecycle;
- product behaviour;
- UX behaviour;
- Story behaviour;
- Feature IDs or Feature → Capability associations;
- implementation workflow;
- Git commands or branch strategy.

## 5. Consequences

### Positive

- All documents use one authoritative lifecycle vocabulary.
- Living documents can evolve without bypassing approval and versioning.
- Repository management records remain clearly distinguishable from lifecycle authority.
- Frozen snapshots remain possible and historically stable.
- `DOCUMENT_LIFECYCLE.md` can define the distinction without adding a new state.

### Costs and risks

- Existing documents using `Status: Living` require controlled metadata reconciliation.
- Frequently updated documents must still follow an appropriate review and versioning path.
- Contributors must distinguish lifecycle status from maintenance classification.
- The repository must avoid using Living informally as a synonym for editable or authoritative.

### Safeguards

- `DOCUMENT_LIFECYCLE.md` remains the Single Information Owner of lifecycle states.
- `REVIEW_PROCESS.md` remains the owner of review mechanics.
- `REPOSITORY_GOVERNANCE.md` remains the owner of authority and repository-wide principles.
- A maintenance classification never overrides a canonical source header.
- No document state changes automatically because of this ADR.

## 6. Alternatives Considered

### Alternative A — Add Living as a lifecycle state

This would create an unclear relationship with Approved and Frozen, allow multiple interpretations of authority, and contradict the fixed lifecycle. **Not adopted.**

### Alternative B — Continue using Living informally

This preserves ambiguity and allows repository management documents to appear outside the lifecycle. **Not adopted.**

### Alternative C — Remove the Living concept entirely

This would lose a useful distinction between documents expected to evolve continuously and documents intended primarily as fixed baselines. **Not adopted.**

### Alternative D — Treat Living as a separate maintenance classification

This preserves one lifecycle while retaining a useful maintenance distinction. **Accepted decision.**

## 7. Post-Acceptance Follow-ups

The following separate controlled changes are required after acceptance:

1. `docs/adr/README.md` — add the ADR-0005 index entry once Accepted, per `ADR_PROCESS.md` §11. The index is not modified by this ADR, and no entry is added while this record remains Proposed. This is distinct from the header reconciliation in item 4.
2. Revise `DOCUMENT_LIFECYCLE.md` so it explicitly states that Living is a maintenance classification, not a lifecycle state.
3. Assess, under `REVIEW_PROCESS.md` and its owner, whether any clarification is needed for documents revised frequently. Any such clarification is decided by that document; this ADR proposes none and grants no reduction in review, approval, or Owner authority (§2.5).
4. Reconcile headers that currently use `Status: Living`, including the applicable repository management and index documents. Each such change follows `DOCUMENT_LIFECYCLE.md`; where an affected document is Frozen, reconciliation requires a superseding revision rather than an in-place edit.
5. Update repository management records to reflect the resulting canonical statuses.
6. Assess whether `docs/README.md` or templates need a `Maintenance Mode` metadata field.

No follow-up is performed by this ADR itself.

## 8. References

- `REPOSITORY_GOVERNANCE.md` — repository authority, Single Information Owner, and source-of-truth principles.
- `DOCUMENT_LIFECYCLE.md` — lifecycle states, transitions, versioning, freezing, deprecation, and archive.
- `REVIEW_PROCESS.md` — review mechanics.
- `ADR_PROCESS.md` — ADR process and acceptance authority.
- `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, and `CHANGELOG.md` — repository management documents affected by the distinction.
- `docs/adr/README.md` — ADR index affected by metadata reconciliation.

---

**Revision Note (0.1):** Initial Proposed draft. Defines Living as a maintenance classification rather than a lifecycle state, preserves the fixed lifecycle, requires valid Status and Version metadata for Living documents, and records that existing `Status: Living` headers require separate controlled reconciliation. No document state or repository file is changed by this proposal.

**Revision Note (1.0):** Accepted by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after successful Formal Architecture Review and Final Review. The accepted decision establishes that Living is not a lifecycle state and is instead an optional maintenance classification recorded separately as `Maintenance Mode: Living`. The fixed lifecycle remains unchanged. No other document, header, status, version, review rule, index metadata, or template is changed automatically by this acceptance; the §7 follow-ups remain separate controlled changes.
