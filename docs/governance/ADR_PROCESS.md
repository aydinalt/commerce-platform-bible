# ADR Process

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-20

> **Approval Note (1.0).** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 following successful Formal Architecture Review and Final Review. This first approval advances the governance document from In Review v0.2 to Approved v1.0. The approval establishes this document as the authoritative source for the ADR process, including ADR requirement criteria, ADR-specific lifecycle and versioning, numbering, authorship, review relationship, Owner acceptance records, retrospective ADR safeguards, Accepted ADR immutability, bounded maintenance, withdrawal, supersession, relationships, indexing, and minimum structure. This approval does not accept, withdraw, or supersede any ADR, does not update the ADR index, does not freeze this document, and does not modify another repository document automatically.

> **Freeze Note (1.0).** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20. This freeze locks the Approved v1.0 baseline of `ADR_PROCESS.md` as the canonical ADR-process reference for the current release state. The Frozen governance document must not be edited in place. Any future change requires a separate superseding revision that begins independently at Draft under a new version, while this Frozen v1.0 baseline remains preserved. The freeze does not accept, withdraw, supersede, or otherwise modify any ADR, does not update `docs/adr/README.md`, and does not change another repository document automatically.

**Revision Note (1.0):** First approval. Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after Formal Architecture Review and Final Review completed with no remaining corrections. The document advances from In Review v0.2 to Approved v1.0. ADRs remain governed by the ADR-specific lifecycle Proposed → Accepted → Superseded, with Proposed → Withdrawn as the non-authoritative terminal path. ADRs are accepted rather than Approved or Frozen. Accepted decision bodies remain immutable except for the bounded maintenance defined in this document. Freeze of `ADR_PROCESS.md` remains a separate Owner decision.

**Freeze Record (1.0):** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after first approval as v1.0. The standard document lifecycle transition is Approved v1.0 → Frozen v1.0; the version remains 1.0. This locks the governance baseline against in-place edits. Future change requires a superseding Draft revision under a new version. ADR-specific lifecycle states and existing ADR records are unaffected by this freeze.

> The single owner of the Architecture Decision Record process: what an ADR is, when it is and is not required, ADR-specific lifecycle states, numbering, authorship, review, Owner acceptance, retrospective recording, relationships, maintenance, indexing, withdrawal, and supersession. Repository authority, standard document lifecycle, review mechanics, and traceability structure are defined in their owning governance documents and are referenced here, never redefined.

**Revision Note (0.2):** Controlled revision of Draft v0.1. Replaces approval terminology with ADR-specific acceptance; completes the ADR lifecycle with a non-authoritative terminal Withdrawn state; separates ADR review activity from ADR lifecycle states; defines Proposed `0.x` and first Accepted `1.0` versioning; formalizes explicit Owner acceptance and Acceptance Notes; establishes the immutability boundary of the Accepted decision body while allowing only bounded append-only maintenance and supersession metadata; defines retrospective ADR safeguards; aligns major-decision review with `REPOSITORY_GOVERNANCE.md` and routine review mechanics with Frozen `REVIEW_PROCESS.md` v1.0; clarifies index, traceability, downstream review-trigger, withdrawal, and supersession responsibilities. No ADR is accepted, withdrawn, superseded, or otherwise modified by this revision.

---

## 1. Purpose

This document defines how Architecture Decision Records are:

- identified;
- drafted;
- numbered;
- reviewed;
- accepted;
- maintained;
- withdrawn;
- indexed;
- related to other documents;
- superseded.

It governs the ADR process only.

It does not:

- make an architectural decision;
- grant repository authority;
- govern the standard document lifecycle;
- define review mechanics generally;
- define the structure of repository traceability.

Repository authority is owned by `REPOSITORY_GOVERNANCE.md`. Standard document lifecycle is owned by `DOCUMENT_LIFECYCLE.md`. Review mechanics are owned by `REVIEW_PROCESS.md`.

---

## 2. What an ADR Is

An ADR is the durable record of one significant architectural or governance decision.

An ADR records:

- the context that required a decision;
- the decision itself;
- the rationale;
- materially considered alternatives;
- consequences and trade-offs;
- scope and exclusions;
- relationships and required follow-ups.

An ADR exists so that a future contributor can determine:

- what was decided;
- why it was decided;
- when the decision became authoritative;
- what it affects;
- whether it remains in force;
- what later decision replaced it, when applicable.

An ADR is not:

- a product requirement;
- a UX specification;
- a User Story;
- an implementation plan;
- a meeting transcript;
- a review report;
- a repository status report;
- a substitute for its affected canonical documents.

Each ADR records one bounded decision. Multiple independent decisions require separate ADRs.

---

## 3. When an ADR Is Required

An ADR is required when a decision is significant, lasting, and difficult to reverse silently.

Typical triggers include:

- repository architecture changes;
- repository-wide governance decisions;
- changes to an official documentation layer or authority boundary;
- cross-cutting design decisions;
- major technology direction;
- significant design trade-offs;
- durable capability or ownership decisions;
- long-term architectural commitments;
- changes that supersede an Accepted ADR.

The need for an ADR is determined by decision impact, not by document length, implementation effort, or the number of files affected.

Where uncertainty exists, the reviewer records whether an ADR is required and the Product Owner / Architecture Owner resolves disputed classification.

---

## 4. When an ADR Is Not Required

An ADR is not required for a change with no material architectural or governance weight, including:

- typographical correction;
- formatting correction;
- link repair;
- editorial wording that does not alter meaning;
- routine document maintenance;
- implementation detail already constrained by authoritative architecture;
- clarification fully owned by an existing authoritative document and introducing no new decision.

A change described as editorial is not exempt when it changes:

- authority;
- scope;
- lifecycle;
- ownership;
- architectural meaning;
- a durable trade-off;
- an Accepted decision.

Review records must distinguish genuine clarification from a hidden architectural decision.

---

## 5. ADR Lifecycle

ADR states are specific to ADRs and are separate from the standard document lifecycle defined in `DOCUMENT_LIFECYCLE.md`.

The ADR lifecycle is:

```text
Proposed → Accepted → Superseded
    └────→ Withdrawn
```

### Proposed

- **Meaning:** The decision is drafted and under consideration.
- **Authority:** Non-authoritative.
- **Entering:** An ADR identifier is assigned and a complete proposal is recorded.
- **Review:** Architecture Review and Final Review occur while Status remains Proposed.
- **Leaving:** Explicit Owner acceptance or explicit withdrawal.

### Accepted

- **Meaning:** The decision is in force and authoritative from the recorded acceptance date.
- **Authority:** Authoritative under `REPOSITORY_GOVERNANCE.md`.
- **Entering:** The Product Owner / Architecture Owner explicitly accepts the exact Proposed candidate.
- **Leaving:** Only by explicit supersession through a newer Accepted ADR.
- **Maintenance:** Governed by Section 12; the Accepted decision body is not rewritten.

### Superseded

- **Meaning:** The decision was authoritative but has been replaced wholly or partly by a later Accepted ADR.
- **Authority:** No longer authoritative for the scope replaced by the successor.
- **Entering:** A newer ADR is explicitly Accepted and names the older ADR it supersedes; the older ADR is then marked Superseded with a successor reference.
- **Terminal behaviour:** The record remains permanently for history.

### Withdrawn

- **Meaning:** A Proposed ADR is no longer being pursued and never became authoritative.
- **Authority:** Non-authoritative.
- **Entering:** The Product Owner / Architecture Owner explicitly withdraws the proposal, or records an explicit withdrawal requested by the proposal owner.
- **Terminal behaviour:** The identifier is retired and never reused; the record may remain for historical context but is excluded from the authoritative ADR index.

No ADR may skip Proposed and become Accepted directly without review of an exact candidate.

---

## 6. ADR Versioning

ADR versioning is specific to the ADR process.

- **Proposed revisions** use the `0.x` series, for example `0.1 → 0.2`.
- **Final Review** does not change the version by itself.
- **First acceptance** produces `Accepted v1.0`.
- **Accepted decision body** is immutable in meaning and is not revised to v1.1 or v2.0.
- **Changed decision** requires a new ADR with a new sequential identifier.
- **Supersession** does not change the original Accepted version number; the original record receives only the bounded lifecycle metadata described in Sections 11 and 12.
- **Withdrawn proposal** retains its last Proposed `0.x` version.

Standard document versioning rules in `DOCUMENT_LIFECYCLE.md` do not replace these ADR-specific rules.

---

## 7. ADR Numbering and Filenames

ADRs use sequential identifiers:

```text
ADR-0001
ADR-0002
ADR-0003
...
```

Rules:

- the next identifier is the next unused sequential number;
- an identifier is reserved when the Proposed ADR is first committed to the repository;
- identifiers are never reused;
- an Accepted, Superseded, or Withdrawn identifier remains permanently retired from reuse;
- deletion of a proposal does not make its committed number available again;
- the identifier remains stable when the title changes during Proposed revision.

Canonical filename format:

```text
ADR-NNNN-kebab-case-title.md
```

The filename must begin with the exact ADR identifier.

---

## 8. ADR Roles and Authority

Roles describe responsibilities. Final repository authority remains owned by `REPOSITORY_GOVERNANCE.md`.

### Author

The Author may be human or AI.

The Author:

- records the context, decision, rationale, alternatives, consequences, scope, and follow-ups;
- keeps the ADR limited to one decision;
- revises the Proposed candidate in response to findings;
- does not gain acceptance authority through authorship.

### Reviewer

A Reviewer may be human or AI.

The Reviewer:

- evaluates the ADR under `REVIEW_PROCESS.md`;
- checks architecture, governance, ownership, consistency, technical soundness, consequences, and scope;
- records evidence and findings;
- recommends but does not accept.

### Product Owner / Architecture Owner

Only the Product Owner / Architecture Owner may:

- accept a Proposed ADR;
- withdraw a Proposed ADR;
- explicitly accept a new ADR that supersedes an earlier decision;
- record the intended supersession scope.

AI may draft, review, correct, and record an explicit Owner decision already made. AI may not infer, make, or substitute for that decision.

---

## 9. ADR Review

ADR review follows the review mechanics owned by `REVIEW_PROCESS.md`.

A Proposed ADR normally receives:

1. Self Review;
2. Architecture Review;
3. correction cycle when required;
4. Final Review;
5. explicit Owner acceptance decision outside review.

The ADR remains `Proposed` throughout review. `In Review`, `Approved`, and `Frozen` are not ADR states.

Allowed ADR review verdicts are those defined by `REVIEW_PROCESS.md`, including:

- Architecture Review: `PASS — READY FOR FINAL REVIEW`, `PASS WITH REQUIRED CORRECTIONS`, or `FAIL — RETURN TO REVISION`;
- Final Review: `PASS — READY FOR OWNER ACCEPTANCE`, `PASS WITH REQUIRED CORRECTIONS`, or `FAIL — RETURN TO ARCHITECTURE REVIEW`.

Review never:

- accepts an ADR;
- withdraws an ADR;
- supersedes an ADR;
- backdates authority;
- changes another document automatically.

Where an ADR records a major architectural decision, the applicable multi-review policy owned by `REPOSITORY_GOVERNANCE.md` must be followed. This document does not broaden or narrow that policy.

---

## 10. Owner Acceptance

Acceptance requires an explicit Product Owner / Architecture Owner decision identifying:

- the ADR identifier and title;
- the exact Proposed candidate;
- the instruction that it be recorded as Accepted v1.0;
- the acceptance date.

After explicit acceptance is given, the accepted record must:

- set `Status: Accepted`;
- set `Version: 1.0`;
- record the acceptance date;
- include an Acceptance Note;
- preserve the reviewed decision;
- be added to `docs/adr/README.md`;
- trigger the applicable traceability and downstream review checks without modifying downstream documents automatically.

An Acceptance Note records the Owner decision. It does not replace the decision and may not be created before the Owner explicitly accepts.

An Accepted ADR is authoritative only from its recorded acceptance date. Acceptance is not backdated merely because implementation or documentation previously reflected the decision.

ADRs are accepted; they are not Approved or Frozen.

---

## 11. Retrospective ADRs

A retrospective ADR may be used when a significant decision already exists in repository content or practice but was never formally recorded.

A retrospective ADR must:

- state that it is retrospective;
- identify the evidence showing that the earlier decision existed;
- distinguish historical existence from formal authority;
- avoid claiming that the ADR itself existed earlier;
- avoid backdating acceptance;
- state that ADR authority begins only on the actual acceptance date;
- identify any reconciliation follow-ups separately.

A retrospective ADR does not automatically validate every earlier implementation, document, or status claim.

---

## 12. Accepted ADR Immutability and Maintenance

The Accepted decision body is immutable.

The following parts must not be rewritten after acceptance:

- context;
- decision;
- rationale;
- alternatives;
- consequences;
- scope;
- authority date;
- accepted follow-ups as originally recorded.

Permitted post-acceptance maintenance is limited to:

1. **Supersession metadata**
   - change Status from Accepted to Superseded;
   - add `Superseded By`;
   - add a dated Supersession Note;
   - identify whether supersession is full or partial.

2. **Append-only correction note**
   - correct a demonstrably non-semantic typographical, formatting, or reference defect;
   - preserve the original accepted text;
   - state the correction and date in an appended Correction Note;
   - state explicitly that decision meaning, scope, rationale, consequences, and authority are unchanged.

3. **Reference maintenance**
   - repair a broken repository link or identifier reference without changing decision meaning;
   - record the repair in a dated maintenance note when material to discoverability.

A substantive correction, reinterpretation, scope change, consequence change, or changed decision requires a new ADR and, where applicable, supersession.

Permitted maintenance does not change the Accepted ADR version from v1.0.

---

## 13. Supersession

When an Accepted decision changes:

1. create a new Proposed ADR with a new sequential identifier;
2. identify the ADR proposed for full or partial supersession;
3. review the new ADR;
4. obtain explicit Product Owner / Architecture Owner acceptance;
5. record the new ADR as Accepted v1.0;
6. update the former ADR to Superseded using only the bounded metadata in Section 12;
7. update `docs/adr/README.md`;
8. update applicable traceability and downstream review records.

The successor ADR must state:

- the identifier of the ADR it supersedes;
- whether supersession is full or partial;
- the scope replaced;
- the reason for change;
- migration or reconciliation consequences when applicable.

A Superseded ADR remains permanently available and must not be deleted.

---

## 14. ADR Relationships and Follow-Ups

ADRs reference affected canonical documents and never replace their owned content.

An ADR may relate to:

- Foundation;
- Capability Architecture;
- PRD;
- UX;
- User Stories;
- Engineering;
- Development;
- governance documents;
- other ADRs.

The repository hierarchy itself remains owned by `REPOSITORY_GOVERNANCE.md`.

Acceptance of an ADR:

- makes the recorded decision authoritative;
- does not automatically revise an affected document;
- creates controlled follow-up work where an owning document must implement or record the decision;
- may trigger `Review Needed` under `REVIEW_PROCESS.md`;
- requires traceability handling under the rule owned by `REVIEW_PROCESS.md`.

The acceptance record must distinguish:

- actions performed as part of ADR registration;
- separate follow-ups that remain open;
- documents unaffected by the decision.

---

## 15. ADR Index

`docs/adr/README.md` is the repository ADR index.

The authoritative index lists:

- Accepted ADRs;
- Superseded ADRs, preserving their historical status and successor relationship.

Proposed and Withdrawn ADRs are non-authoritative and are not listed in the authoritative ADR table.

Index rules:

- add an ADR only after explicit acceptance;
- update status and successor information when an ADR is superseded;
- never list a Proposed ADR as Accepted;
- never use the index to confer ADR authority;
- treat each ADR as the Single Information Owner of its decision and status;
- reference this document for process rules rather than redefining them.

Index metadata and maintenance classification follow their applicable owning governance documents.

---

## 16. Required ADR Structure

A Proposed ADR must contain, at minimum:

- title and ADR identifier;
- Owner;
- Status;
- Version;
- Date;
- Deciders;
- Author;
- related documents or decisions;
- context;
- proposed decision;
- rationale;
- alternatives considered;
- consequences;
- scope and exclusions;
- follow-ups;
- references;
- revision note.

An Accepted ADR additionally contains:

- `Status: Accepted`;
- `Version: 1.0`;
- acceptance date;
- Acceptance Note;
- accepted decision wording;
- post-acceptance follow-ups where applicable.

A Superseded ADR additionally contains:

- `Status: Superseded`;
- `Superseded By`;
- supersession date;
- Supersession Note;
- full or partial supersession scope.

Templates may implement this structure but do not own or redefine it.

---

## 17. Scope Boundaries

This document owns:

- ADR definition and purpose;
- ADR requirement criteria;
- ADR-specific lifecycle;
- ADR versioning;
- numbering and filenames;
- ADR roles within the process;
- ADR review relationship;
- Owner acceptance record requirements;
- retrospective ADR safeguards;
- Accepted ADR immutability and maintenance;
- withdrawal;
- supersession;
- ADR relationships and follow-ups;
- ADR indexing rules;
- minimum ADR structure.

This document references and does not redefine:

- `REPOSITORY_GOVERNANCE.md` — repository authority, AI boundaries, and major-decision multi-review policy;
- `DOCUMENT_LIFECYCLE.md` — standard document lifecycle;
- `REVIEW_PROCESS.md` — review roles, stages, verdicts, records, propagation, and traceability update responsibility;
- `docs/adr/README.md` — the ADR index;
- ADR templates — implementation of the minimum structure.

This document does not:

- make or accept an architectural decision;
- approve or freeze a standard document;
- define product, UX, Story, capability, engineering, or implementation behaviour;
- allocate Feature IDs;
- assign Feature → Capability relationships;
- define traceability structure;
- define Git, branch, merge, or release workflow;
- modify an ADR or another repository document automatically.

---

## 18. Next Recommended Reading

- `docs/adr/README.md`
- `REPOSITORY_GOVERNANCE.md`
- `DOCUMENT_LIFECYCLE.md`
- `REVIEW_PROCESS.md`
