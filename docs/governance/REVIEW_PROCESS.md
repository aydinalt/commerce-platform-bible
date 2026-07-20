# Review Process

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-20

> **Approval Note (1.0).** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 following successful Formal Architecture Review and Final Review. This first approval advances the document from In Review v0.2 to Approved v1.0. The approval establishes this document as the authoritative source for repository documentation review roles, stages, criteria, checklists, verdicts, records, cross-tier review propagation, traceability update responsibility, and review proportionality. Lifecycle states remain owned by `DOCUMENT_LIFECYCLE.md`, repository authority remains owned by `REPOSITORY_GOVERNANCE.md`, and ADR lifecycle and acceptance remain owned by `ADR_PROCESS.md`. This approval does not freeze the document and does not approve, freeze, accept, or modify any other repository document automatically.

> **Freeze Note (1.0).** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20. This freeze locks the Approved v1.0 baseline of `REVIEW_PROCESS.md` as the canonical review-process reference for the current release state. The Frozen document must not be edited in place. Any future change requires a separate superseding revision that begins independently at Draft under a new version, while this Frozen v1.0 baseline remains preserved. The freeze does not approve, freeze, accept, or otherwise modify any other repository document automatically and does not alter lifecycle, authority, or ADR rules owned by their respective governance documents.

**Revision Note (1.0):** First approval. Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after Formal Architecture Review and Final Review completed with no remaining corrections. The document advances from In Review v0.2 to Approved v1.0. Review verdicts remain advisory and separate from lifecycle and Owner decisions. Routine documents may use provider-flexible review with disclosed role overlap, while the major architectural decision multi-review policy remains governed by `REPOSITORY_GOVERNANCE.md`. Freeze remains a separate Owner decision.

**Freeze Record (1.0):** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after first approval as v1.0. The lifecycle transition is Approved v1.0 → Frozen v1.0; the version remains 1.0. The baseline is now locked against in-place edits. Future change requires a superseding Draft revision under a new version. Review verdicts remain advisory, Owner decisions remain separate, and no other repository document is changed by this freeze.

> The single owner of how repository documentation is reviewed: review roles, stages, criteria, checklists, verdicts, records, cross-tier propagation, and traceability update responsibility. Lifecycle states and transitions are owned by `DOCUMENT_LIFECYCLE.md`; repository authority is owned by `REPOSITORY_GOVERNANCE.md`; ADR-specific lifecycle and acceptance are owned by `ADR_PROCESS.md`. They are referenced here, never redefined.

**Revision Note (0.2):** Controlled revision of Draft v0.1. Separates review verdicts from lifecycle and Owner decisions; removes approval from the review-stage sequence; aligns standard-document review with Frozen `DOCUMENT_LIFECYCLE.md` v1.0 and ADR review with `ADR_PROCESS.md`; clarifies that named AI tools are capabilities and not a mandatory sequence for routine documents; preserves the major-architectural-decision multi-review policy owned by `REPOSITORY_GOVERNANCE.md`; records role-overlap disclosure for routine AI review; expands cross-tier review triggers across the official documentation hierarchy; and confirms that Living maintenance classification grants no reduced review authority. No document is approved, frozen, accepted, or otherwise modified by this revision.

---

## 1. Purpose

Review exists to improve quality, consistency, traceability, and architectural integrity before an Owner decision makes a document authoritative.

Review:

- evaluates a document version;
- records findings and evidence;
- recommends whether the document is ready for the applicable Owner decision;
- never grants lifecycle authority by itself.

This document defines review mechanics only.

Repository authority and final decision rights are defined in `REPOSITORY_GOVERNANCE.md`. Standard document lifecycle states and transitions are defined in `DOCUMENT_LIFECYCLE.md`. ADR lifecycle and acceptance are defined in `ADR_PROCESS.md`.

---

## 2. Relationship to Lifecycle and Authority

Review stages are activities, not lifecycle states.

For a standard document:

1. the author prepares a Draft;
2. the author requests formal review;
3. the canonical candidate enters `In Review` under `DOCUMENT_LIFECYCLE.md`;
4. Architecture Review and Final Review occur;
5. a successful Final Review recommends the document for explicit Owner approval;
6. only the Product Owner / Architecture Owner may approve;
7. any freeze decision is separate from approval.

For an ADR:

- review follows this document;
- the ADR-specific state sequence and acceptance decision remain owned by `ADR_PROCESS.md`;
- a successful Final Review recommends the ADR for explicit Owner acceptance;
- only the Product Owner / Architecture Owner may accept an ADR.

A review verdict does not:

- approve a document;
- freeze a document;
- accept an ADR;
- change repository authority;
- infer an Owner decision.

A Frozen standard document is never reviewed by editing its baseline in place. A proposed change is reviewed as a separate superseding Draft revision under `DOCUMENT_LIFECYCLE.md`.

---

## 3. Standard Review Flow

```text
Draft Preparation
→ Self Review
→ Formal Review Request
→ Architecture Review
→ Correction Cycle (when required)
→ Final Review
→ Owner Decision (outside review)
```

### Draft Preparation

The author prepares a structurally complete candidate within the document's ownership boundary.

### Self Review

The author applies the criteria and checklist in this document before requesting formal review.

### Formal Review Request

The author identifies the exact candidate, version, related sources, and requested review scope. For a standard document, the candidate enters `In Review` under `DOCUMENT_LIFECYCLE.md`.

### Architecture Review

The reviewer assesses:

- architectural and governance consistency;
- Single Information Owner boundaries;
- cross-document consistency;
- scope;
- traceability impact;
- material contradictions and omissions.

### Correction Cycle

Required corrections are applied to the same review candidate while its lifecycle treatment follows `DOCUMENT_LIFECYCLE.md`.

A review that identifies redesign-level failure may recommend return to Draft. The recommendation does not itself perform the lifecycle transition.

### Final Review

The reviewer verifies that:

- all required corrections are applied;
- no new material issue was introduced;
- metadata and lifecycle treatment are correct;
- the candidate is ready for the applicable Owner decision.

### Owner Decision

Owner approval of a standard document or Owner acceptance of an ADR occurs outside the review process under the applicable owning governance document.

Review never substitutes for that decision.

---

## 4. Review Roles

Roles describe review responsibility only. They do not confer repository authority.

### Document Author

- prepares the candidate;
- performs Self Review;
- supplies the relevant review context;
- applies required corrections;
- does not treat authorship as approval.

### Reviewer

A Reviewer may be human or AI.

The Reviewer:

- evaluates the candidate against the defined criteria;
- records evidence and findings;
- issues a review verdict;
- recommends but does not make the Owner decision.

### Architecture Reviewer

The Architecture Reviewer focuses on:

- architecture and governance consistency;
- information ownership;
- scope boundaries;
- cross-document consistency;
- traceability;
- material decision and lifecycle conflicts.

### Final Reviewer

The Final Reviewer confirms that the corrected candidate is complete and ready for the applicable Owner decision.

### Product Owner / Architecture Owner

The Product Owner / Architecture Owner:

- holds final authority under `REPOSITORY_GOVERNANCE.md`;
- decides approval, freeze, ADR acceptance, and other Owner decisions;
- is not replaced by a reviewer or review verdict.

---

## 5. Human and AI Review Arrangement

### 5.1 Named AI capabilities

The repository recognizes the advisory roles recorded in `REPOSITORY_GOVERNANCE.md`.

**ChatGPT may contribute:**

- product and documentation architecture review;
- governance and cross-document consistency;
- information ownership validation;
- strategic analysis;
- drafting and correction support.

**Claude may contribute:**

- technical and engineering review;
- structural and internal consistency;
- implementation feasibility;
- drafting and code-generation support.

These descriptions identify capabilities. They do not make a particular AI provider mandatory for every routine review.

### 5.2 Routine documents

A routine document may be reviewed by one or more qualified human or AI reviewers.

For routine work, the same AI may:

- assist with drafting;
- perform Architecture Review;
- apply corrections;
- perform Final Review in a separate recorded pass.

When a reviewer also authored or materially edited the candidate, the review record must disclose that role overlap. Role overlap does not create Owner authority and does not remove the Owner decision requirement.

An independent second review is recommended when:

- the reviewer identifies uncertainty;
- the Owner requests it;
- findings are disputed;
- technical risk is high;
- repository impact is unusually broad.

### 5.3 Major architectural decisions

Major architectural decisions follow the multi-review policy owned by `REPOSITORY_GOVERNANCE.md`.

That policy requires:

1. ChatGPT analysis;
2. Claude technical review;
3. Product Owner / Architecture Owner final decision;
4. an ADR where required by `ADR_PROCESS.md`.

This document does not broaden or narrow the definition of a major architectural decision.

---

## 6. Review Criteria

A candidate is evaluated against:

- **Purpose** — it states why it exists.
- **Scope** — it stays within its ownership boundary.
- **Consistency** — it agrees with authoritative related documents.
- **Completeness** — required content is present.
- **Terminology** — terms match their owning definitions and glossary.
- **Traceability** — relationships are correct and recorded.
- **Cross-references** — references are valid and point to owning documents.
- **Information ownership** — each normative concern has one owner.
- **Reference, never redefine** — rules owned elsewhere are cited rather than duplicated.
- **Lifecycle integrity** — metadata and transitions follow the applicable lifecycle owner.
- **Authority integrity** — review does not infer or exercise Owner authority.
- **Implementation agnosticism** — governance and product intent do not drift into implementation detail.
- **Technology independence** — content stays valid across tool and technology choices where required.
- **Readability** — the document is clear.
- **Maintainability** — the document remains usable as the repository grows.
- **Proportionality** — review and document complexity remain proportionate to risk and scope.

---

## 7. Review Checklist

A concise review confirms:

- [ ] The exact document and version under review are identified.
- [ ] Header and metadata are present and correct.
- [ ] Lifecycle Status matches the applicable owning process.
- [ ] Structure follows the applicable template or documented exception.
- [ ] Purpose and scope are explicit.
- [ ] Terminology matches owning definitions and glossary.
- [ ] Cross-references point to authoritative owners.
- [ ] Single Information Owner boundaries are respected.
- [ ] Rules owned elsewhere are referenced, not restated.
- [ ] Architecture and governance consistency are maintained.
- [ ] Traceability impact is assessed.
- [ ] Cross-tier review triggers are assessed.
- [ ] No Owner decision is inferred.
- [ ] No other document is modified automatically.
- [ ] Required corrections are clearly distinguished from non-blocking observations.
- [ ] Reviewer role overlap is disclosed where applicable.

---

## 8. Review Verdicts

Review verdicts are advisory review results. They are not lifecycle states and do not constitute approval, freeze, acceptance, rejection by the Owner, or any other final decision.

### 8.1 Architecture Review verdicts

Choose exactly one:

- **PASS — READY FOR FINAL REVIEW**
- **PASS WITH REQUIRED CORRECTIONS**
- **FAIL — RETURN TO REVISION**

`PASS WITH REQUIRED CORRECTIONS` means the decision or structure is viable, but every listed required correction must be applied and verified before a successful Final Review.

`FAIL — RETURN TO REVISION` means the candidate requires material redesign before continuing. It does not reject the document permanently and does not itself change lifecycle Status.

### 8.2 Final Review verdicts

For a standard document, choose exactly one:

- **PASS — READY FOR OWNER APPROVAL**
- **PASS WITH REQUIRED CORRECTIONS**
- **FAIL — RETURN TO ARCHITECTURE REVIEW**

For an ADR, choose exactly one:

- **PASS — READY FOR OWNER ACCEPTANCE**
- **PASS WITH REQUIRED CORRECTIONS**
- **FAIL — RETURN TO ARCHITECTURE REVIEW**

A PASS verdict means only that the candidate is ready for the applicable explicit Owner decision.

---

## 9. Findings and Corrections

Review findings are recorded as:

### Required Correction

A material issue that must be resolved before a successful Final Review.

Examples include:

- authority conflicts;
- lifecycle contradictions;
- Single Information Owner violations;
- missing load-bearing content;
- material scope expansion;
- incorrect or unsupported traceability.

### Non-Blocking Observation

An improvement, maintenance note, or future consideration that does not prevent the candidate from proceeding.

A Non-Blocking Observation:

- must not be disguised as a required correction;
- must not be treated as an Owner decision;
- may be recorded for later controlled work.

---

## 10. Review Records

Each formal review records:

- **Target** — document identifier and title;
- **Candidate Version** — the exact version reviewed;
- **Candidate Status** — lifecycle or ADR status at review time;
- **Review Type** — Architecture Review or Final Review;
- **Reviewer** — human or AI reviewer;
- **Reviewer Role** — the role performed;
- **Role Overlap** — whether the reviewer also authored or materially edited the candidate;
- **Date** — review date;
- **Scope** — what was evaluated;
- **Verdict** — one allowed verdict from Section 8;
- **Evidence** — concise evidence supporting the verdict;
- **Required Corrections** — material actions, if any;
- **Non-Blocking Observations** — optional;
- **Next Lawful Stage** — the permitted next step without performing it.

Review records may be stored as separate review documents or retained in a durable repository review record. The canonical target document remains the owner of its own Status and Version.

---

## 11. Cross-Tier Propagation

Changes propagate as review triggers. No downstream document is modified automatically, and no lifecycle Status changes automatically.

The repository hierarchy is owned by `REPOSITORY_GOVERNANCE.md` and is referenced here:

```text
Foundation
→ Capability Architecture
→ PRD
→ UX
→ User Stories
→ Engineering
→ Development
```

When an authoritative upstream document changes, directly affected downstream documents become **Review Needed**:

- Foundation change → affected Capability Architecture documents;
- Capability Architecture change → affected PRDs;
- PRD change → affected UX Specifications;
- UX change → affected User Stories;
- User Story change → affected Engineering documents;
- Engineering change → affected Development specifications or implementation guidance.

A governance change triggers review of documents that directly consume the changed rule.

`Review Needed`:

- is a review trigger only;
- is not a lifecycle state;
- does not make the affected document non-authoritative automatically;
- requires the affected document to be reviewed and either realigned or confirmed unaffected;
- must be recorded in the applicable repository management or traceability record without conferring lifecycle authority.

Propagation follows actual relationships, not merely directory proximity.

---

## 12. Traceability Update Responsibility

A documentation change that creates, removes, or changes a governed relationship must update `traceability.md` within the same controlled change set, unless the authoritative traceability owner explicitly records that no update is required.

The structure and content model of `traceability.md` are not defined here.

The review record must state one of:

- traceability updated;
- traceability update required before completion;
- no traceability change required, with a brief reason.

---

## 13. Living Documents and Review Proportionality

`Maintenance Mode: Living` is not a lifecycle state and grants no reduced authority or bypass, as established by Accepted `ADR-0005-living-document-classification.md` and recorded in `DOCUMENT_LIFECYCLE.md`.

A Living document follows the same applicable review, lifecycle, versioning, and Owner-decision requirements as another document.

Review depth and record length may be proportionate to:

- scope;
- risk;
- number of affected documents;
- whether the change is editorial, clarifying, or substantive;
- whether the candidate is disputed or uncertain.

Proportionality may reduce unnecessary review detail. It may not:

- skip a required lifecycle stage;
- bypass an applicable Owner decision;
- convert maintenance classification into authority;
- permit in-place editing of a Frozen baseline;
- weaken the major-architectural-decision multi-review policy.

---

## 14. Scope Boundaries

This document owns:

- review roles and responsibilities;
- review stages and flow;
- review criteria and checklist;
- Architecture Review and Final Review verdicts;
- findings and correction categories;
- review record requirements;
- cross-tier review propagation;
- traceability update responsibility;
- review proportionality.

This document references and does not redefine:

- `REPOSITORY_GOVERNANCE.md` — repository authority, AI boundaries, major-decision multi-review policy, and repository hierarchy;
- `DOCUMENT_LIFECYCLE.md` — standard document states, transitions, versioning, freeze, deprecation, archive, and Living lifecycle treatment;
- `ADR_PROCESS.md` — ADR states, acceptance, maintenance, and supersession;
- Accepted `ADR-0005-living-document-classification.md` — the decision that Living is maintenance classification rather than lifecycle Status.

This document does not:

- approve, freeze, deprecate, or archive a document;
- accept or supersede an ADR;
- determine product behaviour;
- determine UX behaviour;
- determine Story behaviour;
- allocate Feature IDs;
- assign Feature → Capability relationships;
- define database, API, infrastructure, technology, Git, branch, merge, or implementation workflow;
- modify another repository document automatically.

---

## 15. Next Recommended Reading

- `ADR_PROCESS.md`
- `REPOSITORY_GOVERNANCE.md`
- `DOCUMENT_LIFECYCLE.md`
- `docs/adr/ADR-0005-living-document-classification.md`
