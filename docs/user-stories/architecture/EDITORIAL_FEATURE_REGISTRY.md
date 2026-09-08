# EDITORIAL FEATURE REGISTRY

> **Freeze Note (1.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-08, **third in the four-step order he set out**, and before
> `US-EDT-F02-001` so that the Story cites a Feature that is authoritative when
> it is frozen. This exact version must not be edited in place; a further change
> requires a controlled superseding revision under `DOCUMENT_LIFECYCLE.md`
> §7–§8. Frozen v1.0 is preserved unchanged at
> `EDITORIAL_FEATURE_REGISTRY-v1.0-superseded.md`. **`EDT F02` is authoritative
> from this Freeze.**
>
> **Approval Note (1.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-08 — _"EDITORIAL_FEATURE_REGISTRY v1.1 ve
> US-EDT-F02-001 taslaklarını resmi olarak onaylıyorum. İkisini de derhal
> dondurabilirsin."_
>
> **The registry question is decided, and decided against the words of the
> Owner's own earlier instruction.** He had named the Platform registry; the
> departure was raised rather than resolved quietly, and he settled it in the
> same message: _"Yüzeyi kimin kullandığına (Admin) değil, davranışı hangi
> belgenin sahiplendiğine (PRD-0009) bakarak tahsisi Platform yerine Editöryel
> (EDT) registry'ye yapman kusursuz bir mimari refleks… Tahsisi kesinlikle
> EDT F02 kimliğiyle onaylıyorum."_ **`EDT F02` is the allocation.** The
> reasoning that produced it is kept below rather than trimmed, because the next
> Admin surface whose behaviour a non-Platform PRD owns will pose the same
> question, and the answer should not have to be rediscovered.
>
> **Revision Note (1.1):** Superseding revision of Frozen v1.0, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7. **It allocates
> `EDT F02` — Editorial Review Authoring — because the condition v1.0 set for
> that allocation has been met.**
>
> Raised by the Owner's instruction of 2026-09-08, the third step of a four-step
> order he set out in the same message: _"Platform Feature Registry'yi
> güncelleyerek yazım (Write) yeteneğinin tahsisini tamamla."_
>
> **The allocation is made in this registry rather than in
> `PLATFORM_FEATURE_REGISTRY.md`, and that is a departure from the words of the
> instruction. It is stated here rather than quietly resolved.**
>
> The Owner's instruction named the Platform registry. The substance of it — the
> authoring capability is allocated a Feature — is followed exactly; only the
> registry differs, and it differs because of a rule the Owner approved in this
> document's own v1.0 Freeze Note eight days earlier:
>
> > _"Every Feature registry in this repository is the registry **of one
> > domain**, and each domain has exactly one PRD that owns its Features'
> > behaviour."_
>
> **The test is which document owns the behaviour, not which tier operates the
> surface.** That distinction matters here because the Platform registry does
> hold Admin surfaces — `F13` Feed Management and `F14` Audit Trail Reading are
> both screens only an Admin sees — and an authoring surface only an Admin uses
> looks, at a glance, like a fourth of the same kind. It is not, and the
> difference is visible in one line: `F13`'s and `F14`'s behaviour owners are
> `PRD-0006` §24 and §22.6. This surface's behaviour owner is **`PRD-0009` §13**.
> `PRD-0006` **Frozen v2.7** gained exactly one row about editorial acts — that
> they are recorded — and defines nothing else about them: not the states, not
> the byline rule, not what `updatedAt` means, not what a review may not be
> published without.
>
> Allocating `PLT F15` would therefore record `PRD-0006` as deciding what
> writing a review is, in the one place a Story generator looks for that answer —
> the same defect v1.0 refused when it declined an `OFR` identifier, in the same
> shape, from the other side.
>
> **That was put to the Owner as a Draft, which was the cheapest possible place
> to overrule it, and he confirmed the editorial allocation instead.** The
> Approval Note above carries his words. It is settled: moving `EDT F02` now
> would be a superseding revision of two Frozen registries.
>
> **Two changes besides the allocation:**
>
> - **§2.1 is discharged rather than deleted.** It recorded why authoring had no
>   Feature; the condition it named has been met and it now records that, with
>   its original reasoning intact. A section that vanishes when its problem is
>   solved takes the reason with it.
> - **Every citation of `PRD-0009` moves from Frozen v0.3 to Frozen v0.4.**
>   Stale registry citations have twice sent readers of this repository to
>   superseded baselines, and both times they were found by accident.
>
> **One consequence of that last change is recorded rather than fixed**, in §5.

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
- **Version:** 1.1
- **Supersedes:** Frozen v1.0, preserved unchanged at
  `EDITORIAL_FEATURE_REGISTRY-v1.0-superseded.md`
- **Approval Date:** 2026-09-08
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-08
- **Frozen By:** Product Owner / Architecture Owner
- **Last Updated:** 2026-09-08
- **Story Domain:** Editorial
- **Domain Code:** EDT
- **Behaviour owner:** `PRD-0009-editorial-review.md` **Frozen v0.4**
- **Release:** V1.1. Outside the Frozen V1 baseline.

This document is the **Single Information Owner** of Editorial-domain Feature ID
allocation. Feature IDs are consumed downstream by reference only and are never
allocated by a downstream document.

---

## 1. Feature Registry

| Feature ID | Name                          | Status | Description                                                                                                                                                                                                             | Behaviour owner                  | Experience                                                               | Notes                                                                                                                                                                |
| ---------- | ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `F01`      | Editorial Review Presentation | Active | The editorial review as a reader meets it: its parts, its two dates, its score kept apart from the crowd's, and its attachment to a Product Key rather than to an Offering.                                             | `PRD-0009` **Frozen v0.4** §§5–8 | `UX-0003-offering-detail.md` **Frozen v1.2** §8.9                        | Presented on an Offering surface; owned by `PRD-0009`. `PRD-0001` v4.3 §8.2 records the same split from the Offering side.                                           |
| `F02`      | Editorial Review Authoring    | Active | The surface on which a review is written, published, re-checked and withdrawn: who may write, the byline kept apart from the acting account, the three states, what publication requires, and what the form cannot say. | `PRD-0009` **Frozen v0.4** §13   | **Section pending** — no UX document owns the Admin authoring screen yet | An Admin surface whose behaviour `PRD-0009` owns, which is why it is here and not in the Platform registry. Its acts are recorded: `PRD-0006` **Frozen v2.7** §22.2. |

**`F02`'s Experience column is honest about a gap.** No UX document describes the
Admin authoring screen. That is a real dependency for the Story and is named in
it rather than discovered during implementation; it is not a reason to withhold
the Feature, because the behaviour owner exists and the identifier is what the
Story references.

## 2. Allocation history and closed questions

### 2.1 Authoring — allocated at v1.1, after the condition v1.0 set was met

**v1.0 declined to allocate this Feature, and the reason is preserved because it
is the reason the allocation is now safe.** It read:

> _"A Feature is not allocated for writing, editing or publishing a review.
> `PRD-0009` Frozen v0.3 defines what a review **is** and what it must not
> become. It defines no surface on which one is written, and §9.3 — 'who writes
> them, and at what cadence?' — is still open in the Frozen document. Allocating
> an authoring Feature now would create a Feature ID whose behaviour owner does
> not exist, which is precisely the defect `traceability.md` v2.2 §5C.2 recorded
> three times and this repository spent a week closing. It would also be the
> harder version of that defect to spot, because the identifier would look
> allocated."_
>
> _"**What it needs:** a `PRD-0009` revision that answers §9.3 and defines the
> authoring surface, and then an allocation here."_

**That is exactly what happened, in that order.** `PRD-0009` **Frozen v0.4**
(2026-09-08) answers §9.3 and adds §13, the authoring surface. `PRD-0006`
**Frozen v2.7** was frozen first, on the same day, so that §22.2 records these
acts rather than promising not to. `EDT F02` is allocated here afterwards.

The condition was met before the allocation, and not the other way round. That
sequence is the whole content of the rule, and it is recorded so that the next
time a Feature is wanted before its behaviour owner exists, the precedent is a
week of work rather than a memory.

### 2.2 Editorial selection

Not in `PRD-0009` at all, by the Owner's scope decision of 2026-09-07, and not
drawn in the prototype. No identifier is reserved for it: a reserved identifier
for an undrawn surface is a promise the registry cannot keep.

**Unchanged at v1.1.** `PRD-0009` v0.4 adds an authoring surface and does not
add selection; §13.6 in fact narrows the space it could occupy, by forbidding
any field through which a commercial relationship could reach a review.

## 3. Related documents

- `PRD-0009-editorial-review.md` **Frozen v0.4** — the behaviour owner. §§5–8 for
  `F01`, §13 for `F02`, §14 for the `PRD-0006` amendment they depend on.
- `PRD-0006-platform.md` **Frozen v2.7** — §22.2, which records the authoring
  acts; §22.5, which keeps the trail closed to any tier below the platform
  administrator.
- `PRD-0001-offering.md` **Frozen v4.3** — §5.12.4, the Product Key material the
  review is; §8.2, the Offering Presentation that carries it.
- `PLATFORM_FEATURE_REGISTRY.md` **Frozen v1.4** — the registry `F02` is
  deliberately **not** in. The Freeze Note above gives the reason and records the Owner's decision of 2026-09-08.
- `docs/user-stories/USER_STORY_HANDBOOK.md` — Story form and the rule that a
  Story references a Feature ID and never allocates one.

## 4. Revision History

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-09-07 | Registry opened at the Owner's commissioning of the editorial Stories. Allocates `F01`. Records why authoring is not allocated.                                                                                                                                                                                                                                                                                                                                        |
| 1.0     | 2026-09-07 | Approved and Frozen. The `F01` UX column, which read "section pending" while `UX-0003` had no section for it, now cites `UX-0003` **Frozen v1.2** §8.9 — the only content change between v0.1 and v1.0.                                                                                                                                                                                                                                                                |
| 1.1     | 2026-09-08 | **Approved and Frozen.** Allocates `F02` Editorial Review Authoring, the condition §2.1 set having been met by `PRD-0009` **Frozen v0.4** §13 and `PRD-0006` **Frozen v2.7** §22.2. Allocated here rather than in the Platform registry the Owner's earlier instruction named; the departure was raised as a Draft and the Owner confirmed `EDT F02` on 2026-09-08. Every `PRD-0009` citation moves v0.3 → v0.4. Records the stale citation in `US-EDT-F01-001` at §5. |

## 5. A consequence of freezing `PRD-0009` v0.4, recorded rather than fixed

**`US-EDT-F01-001` is Frozen at v0.1 and cites `PRD-0009` Frozen v0.3
throughout.** v0.3 is now a superseded baseline, so that Story points at a
version that is no longer authoritative.

**Its content is not wrong.** `PRD-0009` v0.4's own Revision Note states that
nothing in §§1–8 changes, and every section the Story cites — §3, §5, §5.1,
§5.2, §6.1, §7, §8 — is in that range and is unchanged. Every Acceptance
Criterion still traces to the text it names, and v0.3 is preserved at
`PRD-0009-editorial-review-v0.3-superseded.md`, so the citation resolves to a
real document saying what the Story says it says.

**What is wrong is the version label**, and a Frozen document cannot be edited in
place to correct it. The choice is therefore between a superseding revision of a
Frozen Story whose only change is a version number, and carrying the staleness
visibly until that Story needs a revision for a substantive reason.

**The second was recommended, and the Owner decided it on 2026-09-08** — _"İçerik bağlamı sapmadığı sürece bu atıflar yerinde kalabilir; ancak esaslı bir değişiklik gerektiğinde güncellenirler."_ It is recorded
here so that it is not carried only in conversation — which is how the three
stale `UX` rows of 2026-09-07 survived long enough to be found by accident. One
consequence follows either way: `US-EDT-F01-001` **v0.1 §10** names authoring as
out of scope "because `PRD-0009` §9.3 is open and the registry records that no
Feature is allocated for it". Both halves of that sentence are now false. The
Story's own scope is unaffected — it is still the reading Story — but a reader
should know the reason it gives has expired.
