# Review Process

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.1
- **Last Updated:** 2026-07-09

> The single owner of how documentation is reviewed: review roles, stages, criteria, checklist, outputs, records, cross-tier propagation, and the traceability update responsibility. Lifecycle states, authority, and ADR rules are defined in the other governance documents and are referenced here, never redefined.

---

## 1. Purpose

Review exists to improve quality, consistency, traceability, and architectural integrity before a document becomes authoritative. Review is not document ownership and does not grant authority. Authority is defined in `REPOSITORY_GOVERNANCE.md`; document states are defined in `DOCUMENT_LIFECYCLE.md`. This document defines only the review activity that occurs while a document is being reviewed.

## 2. Review Stages

The standard review flow is a sequence of activities, not lifecycle states:

```
Document Draft → Self Review → Architecture Review → Revision (if required) → Final Review → Approval
```

- **Document Draft** — the author prepares a structurally complete document.
- **Self Review** — the author checks the document against the criteria and checklist below.
- **Architecture Review** — reviewers assess consistency, ownership, and architectural integrity.
- **Revision (if required)** — the author resolves findings; the document may cycle back through review.
- **Final Review** — reviewers confirm all findings are resolved or accepted.
- **Approval** — the reviewing outcome that authorizes the document to advance. The state change itself is governed by `DOCUMENT_LIFECYCLE.md` under the authority in `REPOSITORY_GOVERNANCE.md`.

## 3. Review Roles

Roles describe review responsibilities only; they do not redefine authority.

- **Document Author** — produces the document, performs self review, and resolves findings.
- **Reviewer** — evaluates the document against the criteria and checklist and records findings. A reviewer may be human or AI.
- **ChatGPT** — reviews for architecture and consistency (see Section 4).
- **Claude** — reviews for technical quality and structure, and may generate drafts (see Section 4).
- **Product Owner / Architecture Owner** — provides the final review decision. Their authority is defined in `REPOSITORY_GOVERNANCE.md`; within review, they determine the final outcome.

## 4. AI Review Responsibilities

AI reviews and advises; it never issues the final decision.

**ChatGPT**
- Architecture consistency.
- Documentation consistency.
- Cross-document consistency.
- Governance consistency.
- Information ownership verification.
- Duplicate detection.
- Traceability verification.
- Strategic review.

**Claude**
- Technical review.
- Engineering review.
- Documentation quality.
- Structural consistency.
- Internal consistency.
- Implementation feasibility.
- Draft generation.
- Self review.

## 5. Review Criteria

A document is evaluated against:

- Purpose — the document states why it exists.
- Scope — the document stays within its scope.
- Consistency — the document agrees with related documents.
- Completeness — required content is present.
- Terminology — terms match the glossary.
- Traceability — relationships are correct and recorded.
- Cross references — references are valid and point to the owning document.
- Information ownership — each piece of information has exactly one owner.
- No duplicated information — nothing owned elsewhere is restated.
- Implementation agnostic — no implementation detail.
- Technology independent — no technology-specific decision.
- Readability — the document is clear.
- Maintainability — the document remains valid over time.

## 6. Review Checklist

A concise pass confirms:

- [ ] Header and metadata are present and correct.
- [ ] Structure follows the applicable template.
- [ ] Terminology matches the glossary.
- [ ] Cross references are valid and point to owners.
- [ ] Information ownership is respected (single owner per item).
- [ ] Document boundaries are respected (nothing owned elsewhere is redefined).
- [ ] Traceability impact is handled (see Section 9).
- [ ] Governance consistency is maintained.
- [ ] Architecture consistency is maintained.

## 7. Review Outputs

A review produces one outcome. These are review results, not lifecycle states:

- **Approved** — the document meets all criteria.
- **Approved with Minor Revisions** — the document is acceptable once small, listed changes are made.
- **Requires Revision** — the document must be revised and reviewed again.
- **Rejected** — the document is not accepted in its current form.

## 8. Review Records

Each review records:

- **Reviewer** — who performed the review.
- **Date** — when the review occurred.
- **Outcome** — one of the review outputs in Section 7.
- **Summary** — a brief statement of what was assessed.
- **Required actions** — the changes needed, if any.

## 9. Cross-Tier Propagation

Changes propagate downward as review triggers. No document is modified automatically.

- When a PRD changes, related UX Specifications become **Review Needed**.
- When a UX Specification changes, related User Stories become **Review Needed**.

**Review Needed** is a review trigger only; it is not a lifecycle state. It signals that the affected document must be reviewed and either realigned or confirmed unaffected.

## 10. Traceability Update Responsibility

Any documentation change that affects relationships must update `traceability.md` within the same change set. The structure and content of traceability are not defined here.

## 11. Next Recommended Reading

- `ADR_PROCESS.md`
