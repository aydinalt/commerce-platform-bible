# Repository Governance

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-19

> **Approval Note (1.0).** Approved by the Product Owner / Architecture Owner on 2026-07-19 following successful Formal Architecture Review and Final Review. This approval establishes `REPOSITORY_GOVERNANCE.md` as the approved repository-wide governance source for scope, authority, roles, principles, the repository documentation layer hierarchy, governance change principles, and the Story Domain Code Registry. The approval records no historical Baseline v1.0, does not alter Accepted ADR-0004 or any product, UX, Story, engineering, or implementation decision, and does not complete the repository management-document reconciliation recorded in §12. Freeze is a separate Product Owner / Architecture Owner decision and is not part of this approval.

> **Freeze Note (1.0).** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-19. This freeze locks the Approved v1.0 baseline of `REPOSITORY_GOVERNANCE.md` as the canonical governance record for its current release state. The document must not be edited in place while Frozen; any future change requires a lawful superseding revision under `DOCUMENT_LIFECYCLE.md`. The freeze does not close or modify the immediate repository management-document reconciliation recorded in §12, does not alter Accepted ADR-0004, and does not change any product, UX, Story, engineering, or implementation decision.

**Revision Note (0.2):** Officially recognized the Capability Architecture layer between Foundation and PRD. Added a "Documentation Layers and Flow" section stating the repository documentation flow, the new layer's place and ownership (deferring per-layer authority to `ENGINEERING_CONSTITUTION.md` and the capability model to `OFFERING_CAPABILITY_ARCHITECTURE.md`), and a short rationale for introducing the layer. No ADR is created at this stage.

**Revision Note (0.3):** Harmonization. Declared this document the single owner of the official repository layer hierarchy, which other documents reference rather than redefine. No hierarchy wording changed.

**Revision Note (0.4):** Controlled revision resolving Architecture Review blocking finding AF-2 only. This document is declared the Single Information Owner of the controlled vocabulary of Story Domain codes used in the `[DOMAIN]` segment of Generated Story IDs, and a bounded Story Domain Code Registry is added (new §11; the former §11 Deferred Repository-Level Items and §12 Next Recommended Reading are renumbered to §12 and §13). The registry governs repository identifiers only — it defines no product behaviour, Capability Architecture, PRD scope, UX behaviour, or implementation — and introduces no new repository layer and no new document. The repository layer hierarchy (§10), authority, roles, and principles are unchanged.

**Revision Note (0.5):** Controlled recovery revision of Draft v0.4. The source document remained **Draft** throughout its history; **no canonical Baseline v1.0 source file was available**, and this revision therefore **claims no historical approval, baseline, or freeze**. Repository scope now covers the documentation layers and the repository management documents (§2), which are positioned as Living records that may report a source document's lifecycle status by reference but may never confer, approve, advance, freeze, or override it; the canonical source header governs its own status and version (§3, §8). The Single Source of Truth principle identifies the version-controlled GitHub repository as where authoritative documents reside (§3). The AI boundary is clarified so that recording an Owner decision is expressly distinguished from making one (§6). Story Domain Code ownership is separated from Feature concerns, with Feature IDs and Feature → Capability associations owned by the applicable Capability Architecture document **where assigned to it** and referenced, never redefined, here (§11). Recognition of the Capability Architecture layer is now formally governed by Accepted `ADR-0004-capability-architecture-layer-recognition.md` (Accepted v1.0, accepted 2026-07-19); repository-wide recognition and authority are distinguished from the Offering-domain capability model, and the earlier "recommended but not required" assessment is preserved in Revision Note (0.2) and in §10 as the **historical** position at the time of introduction, expressly no longer the current governance position (§10). The retrospective-ADR item is **closed** by that Accepted ADR and is recorded only as Closed (§12); it is not carried forward as an open Owner decision. Adjacent non-governance owners are listed as referenced-never-redefined (§8). No lifecycle, review, or ADR rule owned elsewhere is restated; no product, PRD, UX, Story, database, API, infrastructure, or implementation behaviour is defined; no Story Domain code, Feature ID, Feature → Capability association, or repository layer is added or changed. **This document must complete formal review — Architecture Review and Final Review — before any approval decision, and approval and freeze remain separate Owner decisions.**

**Revision Note (1.0):** First approval. Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-19 after the Architecture Review and Final Review completed with no remaining corrections. The document advanced from In Review v0.5 to Approved v1.0. The recovery history remains preserved: no earlier Baseline v1.0 source is claimed, Accepted `ADR-0004-capability-architecture-layer-recognition.md` remains the authority recording formal recognition of the Capability Architecture layer, and this document remains the Single Information Owner of the repository layer hierarchy. The repository management-document reconciliation in §12 remains an immediate separate follow-up. This approval does not include freeze.

**Freeze Record (1.0):** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-19 after approval as v1.0. The lifecycle transition is Approved v1.0 → Frozen v1.0; the version remains 1.0. This locks the current governance baseline against in-place edits. Any future change requires a superseding revision under the owning lifecycle process. The immediate repository management-document reconciliation in §12 remains a separate open follow-up and is not completed by this freeze.

> The single entry point to the governance layer. It defines repository scope, authority, roles, and the principles under which all governance operates, and how governance itself changes. Process mechanics are owned by the other governance documents and are referenced here, never redefined.

---

## 1. Purpose and Philosophy

This document establishes who holds authority over the repository, what the repository governs, and the principles under which governance operates. Governance exists to simplify product development, never to increase bureaucracy, and every governance document must remain simpler than the product documentation it governs. This document delegates each process concern to a single owning document, so that no rule exists in more than one place.

## 2. Repository Scope

Governance applies to the entire repository and to every area within it, present and future:

- docs
- backend
- frontend
- infrastructure
- mobile
- AI
- tools

It applies to every documentation layer recorded in the repository layer hierarchy (§10):
Foundation
↓
Capability Architecture
↓
PRD
↓
UX
↓
User Stories
↓
Engineering
↓
Development

It also applies to the repository management documents that record repository state and history:

- `CURRENT_STATUS.md`
- `PROJECT_ROADMAP.md`
- `CHANGELOG.md`

Authority and principles apply uniformly across all areas. Area-specific process is added to the relevant governance document when that area begins active work; its absence today does not narrow this scope.

## 3. Governance Principles

- **Documentation First** — work proceeds from approved documentation.
- **Single Source of Truth** — the documentation is authoritative for the product. The authoritative documents are those held in the version-controlled GitHub repository; GitHub is the repository source of truth. A document's own canonical header governs its status and version. Status summaries, roadmaps, and changelogs report that state and cannot override it; where such a record conflicts with a source document, the source document governs and the record is corrected to match it.
- **Single Information Owner** — every piece of information has exactly one owning document.
- **Implementation Agnostic** — governance describes intent, not implementation.
- **Technology Independent** — governance remains valid regardless of tools, languages, or platforms.
- **Governance serves delivery** — governance exists to simplify product development, never to increase bureaucracy.
- **Proportional simplicity** — a governance document must remain simpler than the product documentation it governs.
- **Reference, never redefine** — a governance document may reference another governance document but must never redefine it.

## 4. Repository Authority

Final authority over the repository is singular and human. It resides with the Product Owner / Architecture Owner. Wherever a rule, review, or record requires a final decision, that decision belongs to that role. The mechanics of approval, freezing, and acceptance are defined in the owning process documents and are not restated here.

## 5. Roles and Decision Authority

**Product Owner / Architecture Owner**
- Holds final decision authority.
- Approves documents.
- Freezes documents.
- Accepts ADRs.
- Approves governance changes.

**ChatGPT**
- Product architecture advisor.
- Documentation architecture advisor.
- Consistency reviewer.
- Strategic analysis contributor.

**Claude**
- Documentation drafting advisor.
- Engineering advisor.
- Implementation advisor.
- Code generation lead during development.

## 6. AI Authority Boundaries

AI operates strictly under the authority of the Product Owner / Architecture Owner.

**AI may**
- Draft documents.
- Review documents.
- Identify inconsistencies.
- Suggest changes.
- Provide second opinions.
- Record an explicit decision already made by the Product Owner / Architecture Owner.

**AI may not**
- Approve documents.
- Reject documents.
- Freeze documents.
- Accept an ADR.
- Infer an Owner decision.
- Change repository authority.
- Make final product decisions.

**Recording a decision is not making a decision.** AI may write down a decision the Owner has explicitly given, together with the record required by the owning process document. It may never originate, infer, or assume that decision, and a document revision alone never constitutes an approval, an acceptance, or a freeze.

## 7. Multi-Review Policy

Major architectural decisions use a lightweight multi-review sequence:

1. ChatGPT analysis.
2. Claude technical review.
3. Product Owner / Architecture Owner final decision.
4. ADR, if required.

This policy applies only to major architectural decisions. Routine documents follow the standard review process. The mechanics of review and of ADRs are defined in `REVIEW_PROCESS.md` and `ADR_PROCESS.md`.

## 8. Governance Document Boundaries

This document owns only repository-wide scope, authority, roles, principles, the repository layer hierarchy, governance change principles, and the Story Domain Code Registry.

The governance layer resides in `docs/governance/`. Each document owns a single concern and duplicates no other:

- `REPOSITORY_GOVERNANCE.md` — scope, authority, roles, principles, the repository layer hierarchy, governance changes, and the Story Domain Code Registry.
- `DOCUMENT_LIFECYCLE.md` — document states, transitions, versioning, freeze, deprecation, and archive.
- `REVIEW_PROCESS.md` — review roles, stages, criteria, checklist, outputs, records, cross-tier propagation, and the traceability update rule.
- `ADR_PROCESS.md` — ADR rules, lifecycle, numbering, ownership, approval, and relationships.

For any concern above, the named document is authoritative. This document does not restate their contents.

**Adjacent owners.** The following are referenced by this document and never redefined by it:

- `USER_STORY_HANDBOOK.md` — Story standards and the Generated Story ID structure.
- Capability Architecture documents — capability definitions, capability boundaries, and the Feature concerns assigned to them.
- PRDs — product behaviour.
- UX documents — experience behaviour.
- Engineering documents — technical and implementation design.

**Repository management documents.** `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, and `CHANGELOG.md` are Living records of repository state and history. They may report a source document's lifecycle status **by reference**. They may not confer, approve, advance, freeze, or override that status. A source document's own canonical header remains authoritative for its status and version, and where such a record disagrees with the source, the record is corrected.

## 9. Governance Change Rules

- A proposed governance change is drafted and reviewed like any other document, following `REVIEW_PROCESS.md`.
- The Product Owner / Architecture Owner approves every governance change.
- Each approved change is versioned and recorded as defined in `DOCUMENT_LIFECYCLE.md`.
- No change may grant final authority to any party other than the Product Owner / Architecture Owner, and no change may violate the principles in Section 3.
- Where a governance change also constitutes a decision for which `ADR_PROCESS.md` requires an Architecture Decision Record, that ADR is created and Accepted under `ADR_PROCESS.md`; only Accepted ADRs are authoritative, and a Proposed or Draft ADR is not.

## 10. Documentation Layers and Flow

The repository's documentation is organized into ordered layers. This document is the single owner of the official repository layer hierarchy defined below; other documents may reference this hierarchy but must not redefine it. Each layer derives from the layer above it and is referenced by the layer below it; no layer redefines another. The documentation flow is:
Foundation
↓
Capability Architecture
↓
PRD
↓
UX
↓
User Stories
↓
Engineering
↓
Development

This hierarchy describes documentation layers only. Project delivery milestones — for example Software Architecture and Release — are a separate concept and are not repository documentation layers.

**The Capability Architecture layer.** It sits between Foundation and PRD. Its repository-wide recognition as an official documentation layer is recorded by Accepted `ADR-0004-capability-architecture-layer-recognition.md` (Accepted v1.0, accepted 2026-07-19); its place in the hierarchy is owned by this document; and its per-layer authority is referenced from the Layer Authority model in `ENGINEERING_CONSTITUTION.md`, not redefined here. For the Offering domain, the capability model is implemented by `OFFERING_CAPABILITY_ARCHITECTURE.md`. The layer defines no business rules, user experience, Story behaviour, or implementation; those remain owned by the layers below it, and the layer's ownership boundaries are governed by Accepted ADR-0004 together with the applicable Capability Architecture documents, referenced here and never redefined. ADR-0004 **records** that architectural decision; it does **not** own or redefine the repository layer hierarchy wording, which remains owned by this document.

**Rationale for the Capability Architecture layer (retained).** The layer was introduced to give every downstream document a single, stable capability to trace to, so that behaviour (PRD), experience (UX), and delivery (User Stories, Engineering) each attach to a well-defined capability rather than to an undifferentiated whole. It separates *what capabilities exist* (architecture) from *how they behave* (PRD), improving traceability, coverage, and long-term maintainability.

**Historical note on the ADR position.** Historically, the layer was introduced through controlled revisions of this document and of `ENGINEERING_CONSTITUTION.md` before any ADR existed, and the assessment recorded at that time was that a recording via ADR was recommended but not required. That was the position **at the time of introduction** and is **no longer the current governance position**. Currently, formal recognition is governed by Accepted `ADR-0004-capability-architecture-layer-recognition.md`. Revision Note (0.2) is preserved unchanged as the historical record.

## 11. Story Domain Code Registry

This document is the Single Information Owner of the controlled vocabulary of **Story Domain codes** used in the `[DOMAIN]` segment of Generated Story IDs. The Generated Story ID structure itself is owned by `USER_STORY_HANDBOOK.md`; this registry owns only the Domain-code vocabulary that the structure consumes. The registry governs repository identifiers only: it defines no product behaviour, no Capability Architecture, no PRD scope, no UX behaviour, and no implementation, and it introduces no new repository layer.

| Story Domain | Domain Code |
|--------------|-------------|
| Offering | `OFR` |
| Discovery | `DSC` |
| Identity | `IDN` |
| Decision | `DEC` |
| Business | `BUS` |
| Platform | `PLT` |

The following rules bind the vocabulary above:

- This document owns the controlled vocabulary of Story Domain codes; no other document allocates or redefines them.
- A Domain code is a permanent repository identifier. It is never reused or recycled.
- Renaming a Story Domain's display label does not automatically change its Domain code; the code is independent of the label.
- Adding a new Domain code, or retiring an existing one, requires repository-governance approval under the Governance Change Rules (§9).
- Downstream documents, including User Story documents and Generated Story IDs, consume Domain codes **by reference**. `USER_STORY_HANDBOOK.md` consumes Domain codes and does not allocate or redefine them. No downstream document allocates or redefines a Domain code.
- **This registry allocates no Feature IDs and records no Feature → Capability association.** Where those concerns are assigned to Capability Architecture documents, they are owned by the applicable Capability Architecture document and are referenced, never redefined, here. Story Domain Code ownership and Feature concerns are separate concerns with separate owners.
- No new Domain code is introduced by this revision.

## 12. Repository-Level Items and Follow-ups

Recorded, not decided here. Nothing in this section is decided by this revision.

**Closed**

- **Retrospective ADR for the Capability Architecture layer.** Resolved by Accepted `ADR-0004-capability-architecture-layer-recognition.md` (Accepted v1.0, 2026-07-19) and recorded in §10. This is not an open Owner decision and is not carried forward.

**Immediate Open Follow-up**

- **Repository management-document reconciliation.** During the v0.5 recovery it was identified that `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, and `CHANGELOG.md` describe source documents in states their canonical headers do not support. A separate, immediate reconciliation of those records to the actual source-document states is required; it does not wait on the approval or freezing of this document, and no such record confers or advances any status (§3, §8). Those documents are not modified by this revision, and they are updated again whenever a source document lawfully advances through its lifecycle. **This follow-up remains recorded only until that reconciliation is completed, after which this item is removed or marked completed through a controlled revision of this document.**

**Deferred**

The following are accepted in principle but deferred; their absence is a recorded decision, not an oversight:

- Repository community-health files: `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `LICENSE`, and `.gitignore`.
- Area-specific governance for `backend`, `frontend`, `infrastructure`, `mobile`, `AI`, and `tools`, added when each area begins active work.

## 13. Next Recommended Reading

- `DOCUMENT_LIFECYCLE.md` — how documents move through states and versions.
- `REVIEW_PROCESS.md` — how documents are reviewed and how changes propagate.
- `ADR_PROCESS.md` — how architecture decisions are recorded.
