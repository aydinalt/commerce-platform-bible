# Repository Governance

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.4
- **Last Updated:** 2026-07-11

**Revision Note (0.2):** Officially recognized the Capability Architecture layer between Foundation and PRD. Added a "Documentation Layers and Flow" section stating the repository documentation flow, the new layer's place and ownership (deferring per-layer authority to `ENGINEERING_CONSTITUTION.md` and the capability model to `OFFERING_CAPABILITY_ARCHITECTURE.md`), and a short rationale for introducing the layer. No ADR is created at this stage.

**Revision Note (0.3):** Harmonization. Declared this document the single owner of the official repository layer hierarchy, which other documents reference rather than redefine. No hierarchy wording changed.

**Revision Note (0.4):** Controlled revision resolving Architecture Review blocking finding AF-2 only. This document is declared the Single Information Owner of the controlled vocabulary of Story Domain codes used in the `[DOMAIN]` segment of Generated Story IDs, and a bounded Story Domain Code Registry is added (new §11; the former §11 Deferred Repository-Level Items and §12 Next Recommended Reading are renumbered to §12 and §13). The registry governs repository identifiers only — it defines no product behaviour, Capability Architecture, PRD scope, UX behaviour, or implementation — and introduces no new repository layer and no new document. The repository layer hierarchy (§10), authority, roles, and principles are unchanged.

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

Authority and principles apply uniformly across all areas. Area-specific process is added to the relevant governance document when that area begins active work; its absence today does not narrow this scope.

## 3. Governance Principles

- **Documentation First** — work proceeds from approved documentation.
- **Single Source of Truth** — the documentation is authoritative for the product.
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
- Generate drafts.
- Review documents.
- Find inconsistencies.
- Suggest improvements.
- Provide second opinions.

**AI may not**
- Approve documents.
- Freeze documents.
- Accept ADRs.
- Change governance authority.
- Make final product decisions.

## 7. Multi-Review Policy

Major architectural decisions use a lightweight multi-review sequence:

1. ChatGPT analysis.
2. Claude technical review.
3. Product Owner / Architecture Owner final decision.
4. ADR, if required.

This policy applies only to major architectural decisions. Routine documents follow the standard review process. The mechanics of review and of ADRs are defined in `REVIEW_PROCESS.md` and `ADR_PROCESS.md`.

## 8. Governance Document Boundaries

The governance layer resides in `docs/governance/`. Each document owns a single concern and duplicates no other:

- `REPOSITORY_GOVERNANCE.md` — scope, authority, roles, principles, governance changes, and the Story Domain Code Registry.
- `DOCUMENT_LIFECYCLE.md` — document states, transitions, versioning, freeze, deprecation, and archive.
- `REVIEW_PROCESS.md` — review roles, stages, criteria, checklist, outputs, records, cross-tier propagation, and the traceability update rule.
- `ADR_PROCESS.md` — ADR rules, lifecycle, numbering, ownership, approval, and relationships.

For any concern above, the named document is authoritative. This document does not restate their contents.

## 9. Governance Change Rules

- A proposed governance change is drafted and reviewed like any other document, following `REVIEW_PROCESS.md`.
- The Product Owner / Architecture Owner approves every governance change.
- Each approved change is versioned and recorded as defined in `DOCUMENT_LIFECYCLE.md`.
- No change may grant final authority to any party other than the Product Owner / Architecture Owner, and no change may violate the principles in Section 3.

## 10. Documentation Layers and Flow

The repository's documentation is organized into ordered layers. This document is the single owner of the official repository layer hierarchy defined below; other documents may reference this hierarchy but must not redefine it. Each layer derives from the layer above it and is referenced by the layer below it; no layer redefines another. The documentation flow is:

```
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
```

The **Capability Architecture** layer sits between Foundation and PRD. It owns the capability model of the platform — the set of capabilities, their independence, and their boundaries — and is defined by `OFFERING_CAPABILITY_ARCHITECTURE.md`. It defines no business rules, user experience, or implementation; those remain owned by the layers below it. Per-layer authority (what each layer owns and cannot change) is defined by the Layer Authority model in `ENGINEERING_CONSTITUTION.md` and is referenced here, not redefined.

**Rationale for the Capability Architecture layer.** The layer was introduced to give every downstream document a single, stable capability to trace to, so that behaviour (PRD), experience (UX), and delivery (User Stories, Engineering) each attach to a well-defined capability rather than to an undifferentiated whole. It separates *what capabilities exist* (architecture) from *how they behave* (PRD), improving traceability, coverage, and long-term maintainability. The decision to recognize this layer through governance and engineering documentation — rather than through a separate architecture decision record — was made deliberately after analysis: the load-bearing need is recognition in the authority model and a recorded rationale, both satisfied here. A recording via ADR was assessed as recommended but not required, and is not created at this stage.

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
- User Story documents and Generated Story IDs consume Domain codes by reference. `USER_STORY_HANDBOOK.md` consumes Domain codes and does not allocate or redefine them.

## 12. Deferred Repository-Level Items

The following are accepted in principle but deferred; their absence is a recorded decision, not an oversight:

- Repository community-health files: `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `LICENSE`, and `.gitignore`.
- Area-specific governance for `backend`, `frontend`, `infrastructure`, `mobile`, `AI`, and `tools`, added when each area begins active work.

## 13. Next Recommended Reading

- `DOCUMENT_LIFECYCLE.md` — how documents move through states and versions.
- `REVIEW_PROCESS.md` — how documents are reviewed and how changes propagate.
- `ADR_PROCESS.md` — how architecture decisions are recorded.
