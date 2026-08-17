# Glossary

- **Document:** Canonical Terminology Reference
- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Maintenance Mode:** Living
- **Version:** 0.2
- **Last Updated:** 2026-08-17

> This document records terminology; it does not resolve conflicts. Contested
> terms are listed under "Pending Harmonization" with their variants and left
> unresolved.

---

## 1. Purpose

The single place to look up a term used across this repository's documentation,
and the single place that is **not** allowed to define one. Every definition
below is a short restatement of what its owning document says, kept short on
purpose: a reader who needs the rule goes to the source, and a definition long
enough to be relied on here would be a second definition to keep in step.

Where two documents word the same thing differently, §4 records both and picks
neither.

## 2. How terminology is maintained

A term enters §3 when exactly one Approved or Frozen document owns it and no
other document words it differently. The `Source` column names that owner — the
document whose "Single Information Owner" statement claims the term, not
whichever document happens to use it most.

A term enters §4 when more than one wording exists across Approved or Frozen
documents. It stays there until the owning document is revised under
`DOCUMENT_LIFECYCLE.md`. **Harmonizing is a controlled revision of the owner,
never an edit here.**

A term enters §5 when a controlled revision removed it. The entry records what
replaced it, or records that nothing did.

## 3. Canonical Terms

| Term | Short definition | Source |
|---|---|---|
| Offering | The universal thing a Business publishes, modelled the same way across every Domain | PRD-0001 |
| Offering lifecycle | `Draft`, `Published`, `Hidden`, `Archived` | PRD-0001 |
| final Offering Public Eligibility | The composed answer to whether an Offering may be seen publicly at all; the sole eligibility input Discovery reads | PRD-0001 |
| Offering Presentation | The complete public view of one eligible Offering | PRD-0001 |
| Universal Publication Minimum | What every Offering must carry before it may be Published | PRD-0001 |
| Initial Published At | The first publication moment, preserved across later transitions | PRD-0001 |
| Affiliate Destination | The external place an Affiliate Handoff sends a person | PRD-0001 |
| Affiliate Destination Handoff Eligibility | Whether a destination may currently receive a Handoff; separate from Offering eligibility | PRD-0001 |
| Handoff Enablement | The capability grouping F06 and F07 belong to | PRD-0001 (Capability Architecture owns the Feature IDs) |
| Domain | The V1 grouping of Offerings: `Mobility`, `Real Estate`, `Technology` | PRD-0001 |
| Category / Attribute | The catalog structure an Offering is placed in and described by | PRD-0001 defines ownership; PRD-0006 owns their management surfaces |
| Discovery Start | The recorded occurrence of a person beginning to look | PRD-0002 |
| Search / Browse | The two Discovery routes from the Homepage prompt | PRD-0002 |
| Listing Card | The product minimum for one result in a Discovery Result list | PRD-0002 |
| Attribute Filter | Narrowing Results by Attribute value; OR within one Attribute, AND across Attributes | PRD-0002 |
| Zero Results | The stated outcome when nothing matches, with the criteria intact and bounded recovery offered | PRD-0002 |
| User Account | One account, used in every context | PRD-0003 |
| Guest | A person using the platform without an authenticated session | PRD-0003 |
| Business context / Admin context | The two entered contexts an authenticated account may hold | PRD-0003 |
| Compare | Placing between two and five eligible Offerings from one leaf Category side by side | PRD-0004 |
| Comparison Set | The bounded set Compare is opened on | PRD-0004 |
| Decision Chat | Assistive answering bounded to the current Decision Context | PRD-0004 |
| Decision Context | Exactly one eligible Offering or one valid Comparison Set | PRD-0004 |
| Affiliate Handoff | Sending a person to the active Affiliate Destination | PRD-0004 |
| Direct Contact | Revealing a Business's protected contact channel | PRD-0004 |
| Completion | The two separate results V1 recognises: Affiliate Handoff and Direct Contact | PRD-0004 |
| Business Profile | The Business as an owned entity; V1 has no dedicated public profile page | PRD-0005 |
| Business Information | The field inventory a Business holds, split into public and protected exposure classes | PRD-0005 |
| Business Moderation Status | `Unrestricted` or `Restricted` | PRD-0005 |
| Business Public Exposure Input | `Eligible` or `Ineligible`; an input to Offering eligibility, not a thing an owner sets directly | PRD-0005 |
| Business Dashboard | The owner's entry to managing one Business | PRD-0005 |
| Admin Panel | The action-oriented Admin surface | PRD-0006 |
| General Moderation Case | The record a moderation action is taken against | PRD-0006 |
| Request Correction | The moderation action that asks an owner to change something, without changing it for them | PRD-0006 |
| Affiliate Destination Administration | The Admin surface for Review, Validate, Enable and Disable | PRD-0006 |
| Basic Analytics | The Admin-facing counts, bounded by period, with no derived or per-Business figure | PRD-0006 |

## 4. Pending Harmonization

| Term | Variant wordings (with source) | Status |
|---|---|---|
| Affiliate Destination Handoff Eligibility | Long form in PRD-0001 (23), PRD-0002 (1), PRD-0004 (7), PRD-0005 (2), PRD-0006 (1). Short form **Handoff Eligibility** in PRD-0006 (7), PRD-0001 (3), PRD-0005 (3) | Pending Harmonization |
| final Offering Public Eligibility | With `final` 70 times across five PRDs; without it twice. The qualifier is load-bearing — it names a composed result rather than one input — which is why the two bare uses are recorded rather than ignored | Pending Harmonization |

Neither is a disagreement about meaning. Both are the same concept written at two
lengths, which is exactly what this section is for: a reader who greps for one
form finds a subset of the places the concept is governed.

## 5. Deprecated Terms

| Deprecated term | Replaced by | Notes |
|---|---|---|
| Favorites | *(nothing)* | Removed from PRD-0001 and PRD-0002 by controlled revision; explicitly outside V1 |
| Related Offerings | *(nothing)* | Removed from `US-OFR-F05-001` by its v2.0 controlled revision |
| Messaging | *(nothing)* | `UX-0007 Messaging` is retained as historical Draft v0.2 outside the Frozen V1 baseline; every V1 PRD excludes it |
| `Retired` (Offering lifecycle) | `Archived` | An implementation-side rename, not a documentation one: PRD-0001 always said `Archived` and the datamodel said `Retired` until I2. Recorded in `I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md` |

## 6. Naming Rules

Recorded from the Frozen documents, not introduced here.

- Defined terms are written in Title Case and keep it mid-sentence:
  *final Offering Public Eligibility*, not *final offering public eligibility*.
- **`Admin`, never `Administrator`.** `Administrator` appears nowhere in any PRD.
- Lifecycle and status values are written as they are defined and are not
  pluralised or inflected: `Draft`, `Published`, `Hidden`, `Archived`;
  `Unrestricted`, `Restricted`; `Eligible`, `Ineligible`.
- The V1 Domain names are exactly `Mobility`, `Real Estate` and `Technology`.
- Role words are the ones the PRDs use: `Guest`, `User Account`, `Business`,
  `Admin`, `Product Owner / Architecture Owner`.

## 7. Notes

This document confers no status. A term appearing in §3 does not make its
source Approved, Frozen, or current; the source document's own lifecycle
metadata does that.

Capability-level coverage and the cross-tier chains are in
`docs/traceability.md`, not here. Where a definition here and its source
disagree, the source is right and this file is wrong.

**This is a first population, and it is not exhaustive.** It covers the terms
the six Frozen PRDs own. Foundation vocabulary, governance vocabulary and the
Story-level terms are not yet recorded, and their absence from §3 means nobody
has read them for this purpose — not that they are uncontested.
