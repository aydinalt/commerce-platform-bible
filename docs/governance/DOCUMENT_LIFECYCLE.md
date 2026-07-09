# Document Lifecycle

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.1
- **Last Updated:** 2026-07-09

> The single owner of the document lifecycle: the states a document may hold, the transitions between them, versioning, and the rules for freezing, deprecation, and archival. Authority, review mechanics, and ADR rules are defined in the other governance documents and are referenced here, never redefined.

---

## 1. Purpose

This document defines how every document in the repository moves from creation to retirement. It establishes the lifecycle states, their meanings, the allowed transitions, the versioning scheme, and the rules for freezing, deprecating, and archiving. It is the authoritative source for all lifecycle terminology.

## 2. Lifecycle States

The lifecycle is fixed. No state may be added, removed, or renamed.

```
Draft → In Review → Approved → Frozen → Deprecated → Archived
```

## 3. State Definitions

Each definition states what the state means, what entering it authorizes, and what leaving it requires.

**Draft**
- *Meaning:* the document is being written or revised.
- *Entering authorizes:* free editing by contributors.
- *Leaving requires:* the document is structurally complete and its author requests review.

**In Review**
- *Meaning:* the document is under review.
- *Entering authorizes:* review activity, per `REVIEW_PROCESS.md`.
- *Leaving requires:* a review outcome — either a decision to approve, or a decision to return the document for revision.

**Approved**
- *Meaning:* the document has been accepted as correct and current.
- *Entering authorizes:* the document to be treated as authoritative and, when a release requires it, to be frozen.
- *Leaving requires:* a freeze decision (to Frozen) or a decision to revise (returning to In Review).

**Frozen**
- *Meaning:* the document is locked as a release baseline.
- *Entering authorizes:* reliance on the document as a stable, unchanging reference for that release.
- *Leaving requires:* a superseding versioned revision (see Section 6) or a decision to deprecate.

**Deprecated**
- *Meaning:* the document is no longer authoritative but remains present for readers who reach it.
- *Entering authorizes:* readers to be directed to the document that replaces it.
- *Leaving requires:* a decision to archive.

**Archived**
- *Meaning:* the document is retired from the active set and retained only for history.
- *Entering authorizes:* removal from active indexes.
- *Leaving requires:* nothing; Archived is terminal.

## 4. Allowed Transitions

- Draft → In Review
- In Review → Approved
- In Review → Draft
- Approved → Frozen
- Approved → In Review
- Frozen → Deprecated
- Frozen → In Review *(only as a new versioned revision; the frozen baseline is preserved — see Section 6)*
- Deprecated → Archived

## 5. Forbidden Transitions

- No skipping states (for example, Draft → Approved or Draft → Frozen).
- No returning from Approved directly to Draft; revision re-enters through In Review.
- No returning from Frozen to Approved; a frozen baseline is not silently unfrozen.
- No transition out of Archived; it is terminal.
- No transition that is not listed in Section 4.

## 6. Versioning

Versioning is expressed as a document version paired with a status in the document header. It is independent of any tooling or source-control strategy.

- **Document Version** — a `MAJOR.MINOR` number recorded in the header.
- **Status** — the current lifecycle state, recorded in the header alongside the version.
- **Minor revision** — a clarifying or non-substantive change; increments the minor number (for example, `0.1 → 0.2`).
- **Major revision** — a substantive change to meaning or scope; increments the major number. A document reaches `1.0` when it is first Approved.
- **Frozen revision** — a Frozen document is not edited in place. A required change is made as a superseding revision that re-enters the lifecycle at Draft or In Review under a new version; the frozen version remains preserved as the baseline until the new version is itself Approved and, if required, Frozen.

## 7. Freeze Rules

- **What Frozen means:** the document is a locked baseline for a release and does not change while Frozen.
- **Who may Freeze:** freezing is performed under the authority defined in `REPOSITORY_GOVERNANCE.md`.
- **After Frozen:** the document is relied upon as a stable reference; it is not edited in place.
- **How a Frozen document may change:** only through a superseding versioned revision, as defined in Section 6, or by being Deprecated.

## 8. Deprecation and Archive

- **Deprecated** — the document is no longer authoritative but remains accessible and points to the document that supersedes it.
- **Archived** — the document is retired from the active set and kept only for historical reference.
- **Difference** — a Deprecated document still appears to readers and names its successor; an Archived document is removed from active indexes and is not maintained. Deprecation precedes archival; archival is terminal.

## 9. Next Recommended Reading

- `REVIEW_PROCESS.md`
