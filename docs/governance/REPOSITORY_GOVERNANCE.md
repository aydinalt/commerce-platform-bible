# Repository Governance

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.1
- **Last Updated:** 2026-07-09

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

- `REPOSITORY_GOVERNANCE.md` — scope, authority, roles, principles, and governance changes.
- `DOCUMENT_LIFECYCLE.md` — document states, transitions, versioning, freeze, deprecation, and archive.
- `REVIEW_PROCESS.md` — review roles, stages, criteria, checklist, outputs, records, cross-tier propagation, and the traceability update rule.
- `ADR_PROCESS.md` — ADR rules, lifecycle, numbering, ownership, approval, and relationships.

For any concern above, the named document is authoritative. This document does not restate their contents.

## 9. Governance Change Rules

- A proposed governance change is drafted and reviewed like any other document, following `REVIEW_PROCESS.md`.
- The Product Owner / Architecture Owner approves every governance change.
- Each approved change is versioned and recorded as defined in `DOCUMENT_LIFECYCLE.md`.
- No change may grant final authority to any party other than the Product Owner / Architecture Owner, and no change may violate the principles in Section 3.

## 10. Deferred Repository-Level Items

The following are accepted in principle but deferred; their absence is a recorded decision, not an oversight:

- Repository community-health files: `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `LICENSE`, and `.gitignore`.
- Area-specific governance for `backend`, `frontend`, `infrastructure`, `mobile`, `AI`, and `tools`, added when each area begins active work.

## 11. Next Recommended Reading

- `DOCUMENT_LIFECYCLE.md` — how documents move through states and versions.
- `REVIEW_PROCESS.md` — how documents are reviewed and how changes propagate.
- `ADR_PROCESS.md` — how architecture decisions are recorded.
