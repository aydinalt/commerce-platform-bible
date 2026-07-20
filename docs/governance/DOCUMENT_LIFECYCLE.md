# Document Lifecycle

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-20

> **Approval Note (1.0).** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 following successful Formal Architecture Review and Final Review. This first approval advances the document from In Review v0.2 to Approved v1.0. The approval establishes this document as the authoritative source for the standard document lifecycle, lifecycle transitions, versioning, freeze, deprecation, archive, and the lifecycle treatment of the optional `Maintenance Mode: Living` classification. Architecture Decision Records remain governed by `ADR_PROCESS.md`. This approval does not freeze the document and does not reconcile any existing `Status: Living` header or modify another repository document automatically.

> **Freeze Note (1.0).** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20. This freeze locks the Approved v1.0 baseline of `DOCUMENT_LIFECYCLE.md` as the canonical lifecycle reference for the current release state. The Frozen document must not be edited in place. Any future change requires a separate superseding revision that begins independently at Draft under a new version, while this Frozen v1.0 baseline remains preserved. The freeze does not reconcile existing `Status: Living` headers, modify another repository document, or alter ADR lifecycle rules owned by `ADR_PROCESS.md`.

**Revision Note (1.0):** First approval. Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after Formal Architecture Review and Final Review completed with no remaining corrections. The document advances from In Review v0.2 to Approved v1.0. The fixed standard lifecycle remains Draft → In Review → Approved → Frozen → Deprecated → Archived. `Living` remains an optional maintenance classification, not a lifecycle state. Freeze remains a separate Owner decision, and metadata reconciliation of existing `Status: Living` documents remains separate controlled work.

**Freeze Record (1.0):** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after first approval as v1.0. The lifecycle transition is Approved v1.0 → Frozen v1.0; the version remains 1.0. The baseline is now locked against in-place edits. Future change requires a superseding Draft revision under a new version. Metadata reconciliation of existing `Status: Living` documents remains separate controlled work.

> The single owner of the standard document lifecycle: the states a governed document may hold, the transitions between them, versioning, and the rules for freezing, deprecation, and archival. It also records the relationship between lifecycle Status and the optional Living maintenance classification established by Accepted `ADR-0005-living-document-classification.md`. Repository authority, review mechanics, and ADR-specific lifecycle rules are defined in their owning governance documents and are referenced here, never redefined.

**Revision Note (0.2):** Controlled revision implementing Accepted `ADR-0005-living-document-classification.md` (Accepted v1.0, 2026-07-20). Adds the bounded distinction between lifecycle `Status` and the optional `Maintenance Mode: Living` classification; confirms that Living is not a lifecycle state; requires every Living document to retain a valid lifecycle Status and Version; and records that maintenance classification grants no authority and bypasses no review or lifecycle rule. Formal Architecture Review also clarified that ADRs follow their separate lifecycle owned by `ADR_PROCESS.md`, that a Frozen baseline never transitions back into active revision, and that a superseding revision begins independently at Draft. Pre-approval `0.x` versioning is distinguished from post-approval major and minor versioning. No existing document header or repository record is reconciled by this revision.

---

## 1. Purpose

This document defines how governed repository documents move from creation to retirement.

It establishes:

- lifecycle states and their meanings;
- allowed and forbidden transitions;
- the document versioning scheme;
- freezing, deprecation, and archival rules;
- the relationship between lifecycle Status and the optional Living maintenance classification.

It is the authoritative source for the standard document lifecycle and for the lifecycle treatment of maintenance classification.

Architecture Decision Records are an explicit exception: their separate lifecycle is owned by `ADR_PROCESS.md` and is not governed by the state sequence in this document.

Review activity is governed by `REVIEW_PROCESS.md`. Repository authority is governed by `REPOSITORY_GOVERNANCE.md`. ADR rules are governed by `ADR_PROCESS.md`.

---

## 2. Lifecycle States

The standard document lifecycle is fixed. No state may be added, removed, or renamed except through a controlled governance change.

```text
Draft
→ In Review
→ Approved
→ Frozen
→ Deprecated
→ Archived
```

`Living` is not a lifecycle state. Its separate maintenance meaning is defined in Section 3 in accordance with Accepted `ADR-0005-living-document-classification.md`.

ADRs do not use this state sequence. Their lifecycle is defined exclusively in `ADR_PROCESS.md`.

---

## 3. Maintenance Classification

### 3.1 Separation from lifecycle Status

A maintenance classification describes whether ongoing controlled revisions are expected. It does not describe a document's lifecycle authority and does not replace its lifecycle Status.

The optional Living classification is recorded separately as:

```text
Maintenance Mode: Living
```

A document carrying this classification must also carry:

- a valid lifecycle `Status`;
- a valid document `Version`.

Example:

```text
Status: Approved
Maintenance Mode: Living
Version: 1.0
```

The example illustrates field separation only. It does not approve a document or prescribe the correct Status or Version for any individual repository document.

Absence of the `Maintenance Mode` field means that the document is not explicitly classified as Living. It does not create an implicit lifecycle state or change the meaning of the document's Status.

### 3.2 Meaning of Living

`Maintenance Mode: Living` means that the document is expected to receive controlled revisions as repository state, history, or operational information evolves.

The classification:

- does not confer authority;
- does not imply approval;
- does not freeze or unfreeze a document;
- does not permit editing outside the lifecycle;
- does not bypass review, versioning, approval, or Owner authority;
- does not override the canonical Status and Version in the document header.

A Living document that is authoritative is normally in the `Approved` lifecycle state. It becomes authoritative only through the normal lifecycle and Owner authority.

Future revisions of a Living document follow the applicable lifecycle transitions and the review mechanics owned by `REVIEW_PROCESS.md`.

A Living document may be `Frozen` when a release requires a locked snapshot. A Frozen Living baseline remains locked; later change is made through an independent superseding revision under Sections 7 and 8.

### 3.3 Metadata reconciliation

A header using `Status: Living` is noncanonical because Living is not a lifecycle state.

Such a header must be reconciled through a separate controlled revision to:

- a valid lifecycle `Status`;
- and, where appropriate, the optional `Maintenance Mode: Living` classification.

This document does not determine the correct lifecycle Status of any individual affected document and does not modify another document automatically.

---

## 4. State Definitions

Each definition states what the state means, what entering it authorizes, and what leaving it requires.

### Draft

- **Meaning:** The document or a new version of it is being written or revised.
- **Entering authorizes:** Editing by contributors under repository authority.
- **Leaving requires:** The document is structurally complete and its author requests review.

### In Review

- **Meaning:** The document version is under review.
- **Entering authorizes:** Review activity under `REVIEW_PROCESS.md`.
- **Leaving requires:** A review outcome that either supports advancement or returns the document version for revision.

### Approved

- **Meaning:** The document version has been accepted as correct and current.
- **Entering authorizes:** The version to be treated as authoritative and, when a release requires it, to be frozen.
- **Leaving requires:** A freeze decision or a controlled revision of an unfrozen Approved version through the allowed transition to In Review.

### Frozen

- **Meaning:** The document version is locked as a release baseline.
- **Entering authorizes:** Reliance on that version as a stable, unchanging reference for the release.
- **Leaving requires:** A decision to deprecate. A required content change does not transition or edit the Frozen baseline; it creates a separate superseding revision under Section 7.

### Deprecated

- **Meaning:** The document version is no longer authoritative but remains present for readers who reach it.
- **Entering authorizes:** Readers to be directed to the document or version that replaces it.
- **Leaving requires:** A decision to archive.

### Archived

- **Meaning:** The document version is retired from the active set and retained only for history.
- **Entering authorizes:** Removal from active indexes.
- **Leaving requires:** Nothing; Archived is terminal.

---

## 5. Allowed Transitions

For a single document version, only the following transitions are allowed:

- Draft → In Review
- In Review → Approved
- In Review → Draft
- Approved → Frozen
- Approved → In Review *(controlled revision of an unfrozen Approved version)*
- Frozen → Deprecated
- Deprecated → Archived

Creating a superseding revision of a Frozen baseline is not a transition of the Frozen version. The superseding revision begins independently at Draft under a new version; the Frozen baseline remains Frozen.

Maintenance classification creates no transition and changes none of the transitions above.

---

## 6. Forbidden Transitions

- No skipping states, for example Draft → Approved or Draft → Frozen.
- No returning from Approved directly to Draft; revision re-enters through In Review.
- No direct Frozen → Draft, Frozen → In Review, or Frozen → Approved transition; a Frozen baseline is not silently unfrozen or rewritten.
- No transition out of Archived; it is terminal.
- No transition that is not listed in Section 5.
- No use of `Living` or `Maintenance Mode: Living` as a substitute for a lifecycle Status or transition.
- No maintenance classification may be used to bypass review, versioning, approval, freezing, deprecation, or archival rules.
- No standard document-lifecycle state may be applied as a substitute for an ADR state owned by `ADR_PROCESS.md`.

---

## 7. Versioning

Versioning is expressed as a document version paired with a lifecycle Status in the document header.

Maintenance classification, when present, is additional metadata and does not replace either field.

Versioning is independent of any tooling or source-control strategy.

- **Document Version** — a `MAJOR.MINOR` number recorded in the header.
- **Status** — the current lifecycle state, recorded in the header alongside the version.
- **Maintenance Mode** — optional metadata recorded separately from Status; `Living` is the classification established by Accepted ADR-0005.
- **Pre-approval revision** — before first approval, controlled Draft and In Review revisions remain in the `0.x` series and increment the minor component, for example `0.1 → 0.2`.
- **First approval** — the first Approved version is `1.0`.
- **Post-approval minor revision** — a clarifying or non-substantive change after first approval increments the minor component, for example `1.0 → 1.1`.
- **Post-approval major revision** — a substantive change to meaning or scope after first approval increments the major component, for example `1.1 → 2.0`.
- **Approved revision** — a controlled revision of an unfrozen Approved document enters In Review under the new version selected by the post-approval rules above.
- **Frozen superseding revision** — a Frozen document version is never edited in place and never changes Status to Draft or In Review. A required change creates a separate superseding revision that begins at Draft under a new version. The Frozen version remains preserved as the baseline until the superseding revision is independently reviewed, Approved, and, when required, Frozen.

The expected frequency of change does not determine version significance. A Living document follows the same version assessment as any other document.

---

## 8. Freeze Rules

- **What Frozen means:** The document version is a locked baseline for a release and does not change while Frozen.
- **Who may freeze:** Freezing is performed under the authority defined in `REPOSITORY_GOVERNANCE.md`.
- **After Frozen:** The version is relied upon as a stable reference and is not edited in place.
- **How content may change after freeze:** Only by creating a separate superseding Draft revision under Section 7, or by deprecating the Frozen version when a successor becomes authoritative.
- **Living documents:** A Living maintenance classification does not prevent freezing and does not weaken the rules above. A Frozen Living version remains locked; its superseding revision advances independently through the lifecycle.

---

## 9. Deprecation and Archive

- **Deprecated** — the document version is no longer authoritative but remains accessible and points to the document or version that supersedes it.
- **Archived** — the document version is retired from the active set and kept only for historical reference.
- **Difference** — a Deprecated version still appears to readers and names its successor; an Archived version is removed from active indexes and is not maintained.

Deprecation precedes archival; archival is terminal.

Maintenance classification does not alter deprecation or archival behaviour.

---

## 10. Scope Boundaries

This document owns:

- standard document lifecycle states and terminology;
- allowed and forbidden lifecycle transitions;
- document versioning;
- freeze, deprecation, and archive rules;
- the lifecycle treatment of maintenance classification.

This document references and does not redefine:

- `REPOSITORY_GOVERNANCE.md` — repository authority, roles, and governance principles;
- `REVIEW_PROCESS.md` — review roles, stages, criteria, outputs, and records;
- `ADR_PROCESS.md` — the separate ADR lifecycle, acceptance, maintenance, and supersession;
- Accepted `ADR-0005-living-document-classification.md` — the architectural decision establishing Living as an optional maintenance classification rather than a lifecycle state.

This document does not:

- apply the standard document lifecycle to ADRs;
- approve, freeze, deprecate, or archive any document;
- reconcile any existing document header automatically;
- define the final lifecycle Status of a repository management document or ADR index;
- define review mechanics;
- define ADR mechanics;
- define Git, branch, merge, or implementation workflow;
- define product, UX, Story, architecture, engineering, database, API, infrastructure, or technology behaviour.

---

## 11. Next Recommended Reading

- `REVIEW_PROCESS.md`
- `ADR_PROCESS.md`
- `REPOSITORY_GOVERNANCE.md`
- `docs/adr/ADR-0005-living-document-classification.md`
