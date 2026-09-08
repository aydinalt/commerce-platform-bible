# EDITORIAL FEATURE REGISTRY

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07. This exact version must not be edited in place; a further
> change requires a controlled superseding revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8. `EDT F01` is authoritative from this Freeze.
>
> **Approval Note (1.0):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-07 — _"Registry (EDT F01 tahsisi) ve ardından
> US-EDT-F01-001 Story'si onaylanmış ve dondurulmuştur."_ The exact Draft v0.1
> content becomes authoritative as **v1.0** under the first-approval versioning
> rule. In the same decision the Owner recorded that separating the review from
> the Offering domain, and refusing to invent an authoring Feature for the open
> §9.3, were both right.
>
> **Why a new registry rather than a row in an existing one.** The Owner
> deferred this question to commissioning on 2026-09-07, and it is answered
> here rather than assumed.
>
> Every Feature registry in this repository is the registry **of one domain**,
> and each domain has exactly one PRD that owns its Features' behaviour:
> Offering → `PRD-0001`, Discovery → `PRD-0002`, Identity → `PRD-0003`,
> Decision → `PRD-0004`, Business → `PRD-0005`, Platform → `PRD-0006`.
>
> The editorial review's behaviour is owned by **`PRD-0009`**. Allocating it an
> `OFR` identifier would put a Feature whose behaviour `PRD-0009` owns into the
> registry of the domain `PRD-0001` owns — and the Offering Capability
> Architecture names `PRD-0001` as the **sole Capability behaviour owner** for
> that domain. The registry would then say something untrue about who decides
> what a review is, and it would say it in the one place a Story generator
> looks.
>
> **That the review is presented on an Offering surface does not make it
> Offering-domain behaviour.** `PRD-0001` **Frozen v4.3** §8.2 lists it among
> what an Offering Presentation may carry and points at `PRD-0009` for what it
> is — presentation host and behaviour owner are already recorded as different
> documents, which is the distinction this registry keeps.
>
> **Editorial is a bounded context of its own**: material the platform writes in
> its own voice about a product, attached to a Product Key rather than to any
> Offering, and governed by an integrity rule (`PRD-0009` §8) that exists
> nowhere else in the repository.

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Supersedes:** Draft v0.1, promoted unchanged in content
- **Approval Date:** 2026-09-07
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-07
- **Frozen By:** Product Owner / Architecture Owner
- **Last Updated:** 2026-09-07
- **Story Domain:** Editorial
- **Domain Code:** EDT
- **Behaviour owner:** `PRD-0009-editorial-review.md` **Frozen v0.3**
- **Release:** V1.1. Outside the Frozen V1 baseline.

This document is the **Single Information Owner** of Editorial-domain Feature ID
allocation. Feature IDs are consumed downstream by reference only and are never
allocated by a downstream document.

---

## 1. Feature Registry

| Feature ID | Name                          | Status | Description                                                                                                                                                                 | Behaviour owner                  | Experience                                        | Notes                                                                                                                      |
| ---------- | ----------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `F01`      | Editorial Review Presentation | Active | The editorial review as a reader meets it: its parts, its two dates, its score kept apart from the crowd's, and its attachment to a Product Key rather than to an Offering. | `PRD-0009` **Frozen v0.3** §§5–8 | `UX-0003-offering-detail.md` **Frozen v1.2** §8.9 | Presented on an Offering surface; owned by `PRD-0009`. `PRD-0001` v4.3 §8.2 records the same split from the Offering side. |

## 2. Not allocated, and why

### 2.1 Authoring — no Feature, because no document owns the behaviour

**A Feature is not allocated for writing, editing or publishing a review.**

`PRD-0009` Frozen v0.3 defines what a review **is** and what it must not
become. It defines no surface on which one is written, and §9.3 — _"who writes
them, and at what cadence?"_ — is still open in the Frozen document.

Allocating an authoring Feature now would create a Feature ID whose behaviour
owner does not exist, which is precisely the defect `traceability.md` v2.2
§5C.2 recorded three times and this repository spent a week closing. It would
also be the harder version of that defect to spot, because the identifier would
look allocated.

**What it needs:** a `PRD-0009` revision that answers §9.3 and defines the
authoring surface, and then an allocation here. Until then, reviews reach the
platform by whatever operational means the Owner chooses, and no document
claims otherwise.

### 2.2 Editorial selection

Not in `PRD-0009` at all, by the Owner's scope decision of 2026-09-07, and not
drawn in the prototype. No identifier is reserved for it: a reserved identifier
for an undrawn surface is a promise the registry cannot keep.

## 3. Related documents

- `PRD-0009-editorial-review.md` **Frozen v0.3** — the behaviour owner.
- `PRD-0001-offering.md` **Frozen v4.3** — §5.12.4, the Product Key material the
  review is; §8.2, the Offering Presentation that carries it.
- `docs/user-stories/USER_STORY_HANDBOOK.md` — Story form and the rule that a
  Story references a Feature ID and never allocates one.

## 4. Revision History

| Version | Date       | Summary                                                                                                                                                                                                 |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-09-07 | Registry opened at the Owner's commissioning of the editorial Stories. Allocates `F01`. Records why authoring is not allocated.                                                                         |
| 1.0     | 2026-09-07 | Approved and Frozen. The `F01` UX column, which read "section pending" while `UX-0003` had no section for it, now cites `UX-0003` **Frozen v1.2** §8.9 — the only content change between v0.1 and v1.0. |
