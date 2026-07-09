# ADR Process

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.1
- **Last Updated:** 2026-07-09

> The single owner of the Architecture Decision Record process: what an ADR is, when it is and is not required, its lifecycle, numbering, ownership, approval, relationships, and supersession. Repository authority, document lifecycle, review mechanics, and traceability structure are defined in the other governance documents and are referenced here, never redefined.

---

## 1. Purpose

This document defines how Architecture Decision Records (ADRs) are created, reviewed, approved, maintained, and superseded. It governs the ADR process only; it does not govern architecture itself, and it does not make architectural decisions.

## 2. What an ADR Is

- **What it is.** An ADR is a record of a single significant architectural decision, capturing its context, rationale, and consequences.
- **Why ADRs exist.** They make significant decisions explicit, durable, and discoverable, so future contributors understand not only what was decided but why.
- **What they solve.** They prevent lost context, silent reversals, and repeated debate by giving each decision one permanent home.
- **Why they are immutable.** An Accepted ADR is a historical record. It is not rewritten; if a decision changes, a new ADR supersedes it. This preserves the true history of how the architecture evolved.

## 3. When an ADR Is Required

An ADR is required for significant, lasting decisions, including:

- Architecture changes.
- Repository-wide decisions.
- Governance changes.
- Cross-cutting design decisions.
- Major technology direction.
- Significant design trade-offs.
- Long-term architectural commitments.

## 4. When an ADR Is Not Required

An ADR is not required for changes that carry no architectural weight, including:

- Editorial corrections.
- Typos.
- Formatting.
- Documentation wording.
- Minor clarifications.
- Routine maintenance.
- Implementation details.

## 5. ADR Lifecycle

An ADR uses only these states. They are specific to ADRs and are separate from the document lifecycle defined in `DOCUMENT_LIFECYCLE.md`.

```
Proposed → Accepted → Superseded
```

**Proposed**
- *Meaning:* the decision is drafted and under consideration.
- *Entering:* an author records the decision, context, rationale, and consequences.
- *Leaving:* the decision is accepted, or the proposal is withdrawn.

**Accepted**
- *Meaning:* the decision is in force and authoritative.
- *Entering:* the decision receives final approval (see Section 8).
- *Leaving:* only by being superseded; the record itself is not edited.

**Superseded**
- *Meaning:* the decision has been replaced by a later ADR.
- *Entering:* a newer Accepted ADR replaces it; the superseding ADR is referenced.
- *Terminal behaviour:* Superseded is terminal. The record remains permanently for history and is never deleted or reused.

## 6. ADR Numbering

- ADRs are numbered sequentially: `ADR-0001`, `ADR-0002`, `ADR-0003`, and so on.
- Numbering is strictly sequential.
- Numbers are never reused.
- A withdrawn or deleted number is never recycled.

## 7. ADR Ownership

Ownership describes responsibilities only. Authority is defined in `REPOSITORY_GOVERNANCE.md`.

- **Author** — writes the ADR with its context, rationale, and consequences, and keeps it within a single decision.
- **Reviewer** — evaluates the ADR and records findings. A reviewer may be human or AI.
- **ChatGPT** — reviews for architecture, consistency, and information ownership, and may recommend.
- **Claude** — reviews for technical soundness and structure, may draft the ADR, and may recommend.
- **Product Owner / Architecture Owner** — makes the final decision to accept an ADR.

## 8. ADR Approval

The approval workflow is:

```
Draft ADR → Review → Product Owner / Architecture Owner Decision → Accepted
```

- **Who approves.** Only the Product Owner / Architecture Owner accepts an ADR.
- **Who may recommend.** Reviewers, including ChatGPT and Claude, may review and recommend.
- **Who may not approve.** AI may not accept ADRs. The review activity itself follows `REVIEW_PROCESS.md`.

## 9. ADR Relationships

ADRs record decisions that affect other documents and reference them rather than restating their content.

- **Foundation** — an ADR may record a decision that interprets or implements Foundation intent.
- **PRDs** — a PRD's "Related ADRs" section links to the ADRs that constrain it; the ADR references the PRD in return.
- **UX Specifications and User Stories** — an ADR references these where a decision affects them.
- **Governance** — a governance change requiring an ADR references the affected governance document.
- **Traceability** — relationships created or changed by an ADR are recorded per the traceability update rule in `REVIEW_PROCESS.md`; the structure of traceability is not defined here.

References are made by document identifier so that links remain stable as documents evolve.

## 10. Superseded ADRs

- **How supersession works.** When a decision changes, a new ADR is created and Accepted; it names the ADR it supersedes, and the superseded ADR is marked Superseded and names its successor.
- **Why superseded ADRs remain.** The original record is preserved unchanged so the history of the decision is intact.
- **Why history is preserved.** ADRs are the permanent memory of the architecture; removing a superseded decision would erase the reasoning that led to the current one.

## 11. ADR Maintenance

- An Accepted ADR is not edited in place; corrections of substance are made by superseding it.
- The only status changes after acceptance are to Superseded, together with the reference to the superseding ADR.
- Records are indexed in `docs/adr/README.md`, which lists ADRs and refers to this document for the process.

## 12. Next Recommended Reading

- `docs/adr/README.md`
