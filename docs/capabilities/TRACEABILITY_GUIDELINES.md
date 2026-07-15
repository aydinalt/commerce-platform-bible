# Traceability Guidelines

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.2
- **Last Updated:** 2026-07-09

**Revision Note (0.2):** Controlled revision. Renamed the record-lifecycle section to "Traceability Record Lifecycle," and made this document the single owner of the status vocabulary (Draft, Mapped, Validated, Approved, Baseline), which other documents now reference rather than redefine.

> The traceability methodology for the repository. It defines how relationships between layers are recorded, advanced, and maintained. It is a process document: it defines no business behaviour, no user experience, no implementation, and no User Stories. Adjacent concerns — the traceability-update rule, document states, and the coverage relationship — are owned by other documents and are referenced here, never redefined.

---

## 1. Purpose

This document defines the traceability methodology for the Commerce Platform Bible: the principles, rules, record lifecycle, definitions, quality gates, and maintenance practices by which relationships between layers are recorded and kept trustworthy. Its purpose is to make traceability consistent and verifiable across the repository, so that every artifact can be followed to the authoritative source it depends on.

This document defines method only. It records no relationships itself and creates no traceability instances.

## 2. Scope

This document owns, and is the single information owner of:

- The principles of traceability.
- The lifecycle of a traceability record, and the status vocabulary (Draft, Mapped, Validated, Approved, Baseline) used across coverage and traceability work.
- The traceability rules that define which relationships must exist.
- The definitions used across traceability work.
- The traceability quality gates.
- The maintenance rules for traceability documents.

## 3. Out of Scope

This document does not own and does not define:

- Business behaviour or rules — owned by the PRDs.
- User experience — owned by the UX specifications.
- Implementation — owned by Engineering and Development.
- User Stories — owned by the User Story layer.
- The rule that requires traceability to be updated when a document changes — owned by `REVIEW_PROCESS.md`.
- The repository document lifecycle (document states and transitions) — owned by `DOCUMENT_LIFECYCLE.md`.
- The concrete capability-to-PRD coverage relationships — owned by `CAPABILITY_COVERAGE_MATRIX.md`.

Where any of the above is relevant, it is referenced, never redefined.

## 4. Traceability Principles

- **Traceability records relationships.** It links an artifact to the source it derives from; it captures connection, not content.
- **It never creates requirements.** Traceability records what already exists in an authoritative source; it never introduces new behaviour, rules, experience, or scope.
- **It never replaces ownership.** A recorded relationship does not make the recording document an owner. Ownership remains with the authoritative source.
- **It always references authoritative sources.** Every trace points to the single document that owns the information; it never points to a restatement, a copy, or a non-authoritative location.

## 5. Traceability Record Lifecycle

This document is the single owner of the traceability status vocabulary below. Other documents (for example `CAPABILITY_COVERAGE_MATRIX.md`) reference these statuses and do not redefine them.

A traceability record progresses through the following states. These are the states of a *traceability record*, and they are distinct from the repository document lifecycle, which is owned by `DOCUMENT_LIFECYCLE.md` and is not redefined here.

- **Draft** — the relationship has been identified but not yet confirmed. It is the initial state.
- **Mapped** — the relationship has been recorded and agreed between the artifact and its authoritative source.
- **Validated** — the relationship has been checked for completeness and correctness through review.
- **Approved** — the relationship has been accepted by the Product Owner / Architecture Owner.
- **Baseline** — the relationship has been locked as part of a frozen baseline.

States advance only in this order and only through the appropriate review and approval; a state is never advanced silently.

## 6. Traceability Rules

The following relationships must exist. They are stated generically; this document records no specific instances.

- **Every Capability traces to a PRD.** Each capability is supported by at least one PRD.
- **Every PRD supports Capabilities.** Each PRD supports at least one capability.
- **Every UX screen traces to a PRD.** Each UX surface derives from the PRD that owns its behaviour.
- **Every Story traces to a UX.** Each story derives from the UX that presents the behaviour it delivers.
- **Every Code Change traces to a Story.** Each change to the implementation derives from a story.

Each rule defines a required link in the chain; a missing link is an orphan or a broken chain (see Definitions).

## 7. Definitions

- **Orphan** — an artifact that has no valid trace to its required source: a capability with no supporting PRD, a UX surface with no PRD, a story with no UX, or a code change with no story. An orphan is surfaced, never hidden.
- **Broken Chain** — a traceability chain in which a link is missing, or points to a source that is not authoritative or does not exist, so the chain cannot be followed end to end.
- **Authoritative Source** — the single document that owns a piece of information. It is the only valid target of a trace for that information.
- **Reference** — a pointer from one document to the authoritative source of information it relies on, recorded without restating that information.
- **Ownership** — the property that a piece of information is defined in exactly one document. Traceability records relationships to owners; it never assumes ownership and never moves it.

## 8. Traceability Quality Gates

Coverage is established one layer at a time. Each gate must hold before the next layer is considered covered:

```
Coverage Matrix
  ↓
PRD Traceability
  ↓
UX Traceability
  ↓
Story Traceability
  ↓
Code Traceability
  ↓
Production Validation
```

- **Coverage Matrix** — every capability is supported by at least one PRD, and every PRD supports at least one capability.
- **PRD Traceability** — every PRD traces to the capabilities it supports, with no orphan PRD.
- **UX Traceability** — every UX surface traces to its owning PRD, with no orphan UX.
- **Story Traceability** — every story traces to its UX, with no orphan story.
- **Code Traceability** — every code change traces to its story, with no orphan change.
- **Production Validation** — the end-to-end chain is unbroken from capability to production, with no orphan and no broken chain.

A gate that is not satisfied is an open item; this document defines the gates and does not evaluate them.

## 9. Maintenance Rules

- Traceability documents are updated whenever a traced artifact is added, changed, or removed, in accordance with the traceability-update rule owned by `REVIEW_PROCESS.md`.
- A new artifact is recorded with a trace to its authoritative source; a removed artifact's relationships are retired rather than left dangling.
- Record states advance only through review and approval; they are never advanced silently.
- Orphans and broken chains are surfaced as open items, never hidden or deleted to force a clean view.
- Every trace continues to point to an authoritative source; a trace that points to a restatement or a non-owner is corrected.
- Traceability documents record relationships only. They never create requirements, behaviour, experience, stories, or implementation, and they never invent identifiers or instances.

## 10. References

- `REVIEW_PROCESS.md` — the rule requiring traceability to be updated when a document changes.
- `DOCUMENT_LIFECYCLE.md` — the repository document lifecycle (distinct from the traceability record lifecycle here).
- `CAPABILITY_COVERAGE_MATRIX.md` — the capability-to-PRD coverage relationship.
- `REPOSITORY_GOVERNANCE.md` — repository authority and roles.
