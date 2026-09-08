# Traceability

> **Freeze Note (2.2):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-06. This exact version must not be edited in place; a further
> change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8.
> Frozen v2.1 is preserved unchanged at `docs/traceability-v2.1-superseded.md`.
>
> **Approval Note (2.2):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-06 — _"Traceability v2.2 taslağını resmi olarak
> onaylıyorum; belgeyi dondurup (Freeze) v2.1 sürümünü `-superseded` olarak
> arşive kaldırabilirsin."_ Approval and Freeze were taken in one decision.
>
> **Commission Note (2.2):** In the same decision the Owner commissioned all
> three of §5C.2's unowned behaviours — _"Bu üç boşluğu V1 lansmanından hemen
> önce kapatmak zorundayız"_ — as `PRD-0006` sections, a Security Requirement,
> and Feature `F13` with its Stories. §9 records each as commissioned rather
> than as open, and the documents that discharge them are drafted separately:
> this record does not confer their status.
>
> **Revision Note (2.2):** Superseding revision of Frozen v2.1, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7.
>
> **What it records: fifteen increments were built between 2026-09-03 and
> 2026-09-06, and three of them shipped behaviour that no authoritative document
> owns.** v2.1's §9 named `I76`–`I78` as "built and PRD-owned; not yet traced
> here" and left them for a v2.2. That list has since grown to `I90`, and
> tracing it turned up something a count of increments would have hidden: most
> of the work is owned, two things are owned by a document that was revised to
> own them, and **three are not owned by anything**.
>
> The three are named in §5C and repeated in §9 with the action each needs.
> They are recorded rather than resolved here, because inventing a behaviour
> owner is exactly what this document must not do — it records ownership and
> never confers it (§2).

> **Freeze Note (2.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-04, together with `PLATFORM_FEATURE_REGISTRY.md` v1.2,
> `US-PLT-F11-001` v0.1 and `US-PLT-F12-001` v0.1 — the four documents whose
> shared blocker was `PRD-0006-platform.md` §21. This exact version must not be
> edited in place; a further change requires a controlled revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v2.0 is preserved unchanged at
> `docs/traceability-v2.0-superseded.md`.
>
> **Approval Note (2.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-04 — _"Bekleyen dört aday belgeyi
> (PLATFORM_FEATURE_REGISTRY v1.2, iki PLT story'si ve traceability v2.1) resmi
> olarak onaylıyorum. Belgeleri dondurup (Freeze) F12'nin §21'e bağlanma
> sürecini tamamlayabilir ve eski sürümleri arşive kaldırabilirsin."_
>
> **Revision Note (2.1):** Superseding revision of Frozen v2.0, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7.
>
> **What it records: the two Platform chains v2.0 left open are now closed, and
> a ninth behaviour shipped.**
>
> v2.0's §5A named `PLT F11` and `PLT F12` as the two Features without a Story,
> and named Listing Reports as "the one chain that is still incomplete" —
> allocated, implemented, UX Frozen, and with no behaviour owner at all. §9
> recorded the required action as _"Owner commission"_.
>
> The Owner commissioned it on 2026-09-03, in his admin architecture document:
> _"F12 için PRD bölümü ve saklama süresi… PLT F11/F12 story'leri"_. All four
> documents are now authoritative:
>
> - `PRD-0006-platform.md` **Frozen v2.5** — §21 Listing Reports (the missing
>   behaviour owner), §20.4 amended, a defect in v2.3's §12 corrected, and
>   §11.2's analytics inventory extended with the Affiliate Handoff Rate.
>   Frozen 2026-09-03;
> - `PLATFORM_FEATURE_REGISTRY.md` **Frozen v1.2** — `F12`'s Pending reference
>   replaced. Frozen 2026-09-04;
> - `US-PLT-F11-001` and `US-PLT-F12-001` **Frozen v0.1**. Frozen 2026-09-04.
>
> **The revision that carried §21 is v2.5, not the v2.4 this document named
> while it was a Draft.** v2.4 was superseded before it was ever Frozen, so
> every reference below was re-pointed at v2.5 before Freeze; a Frozen
> traceability record citing v2.4 would trace the chain to a version that never
> became authoritative. v2.4 is preserved at
> `docs/prd/PRD-0006-platform-v2.4-candidate.md` as evidence of what was
> proposed and when.
>
> **The one question inside §21 that was a decision rather than a review item is
> decided:** §21.5's retention period for a reviewed Listing Report was set by
> the Owner at **180 days** on 2026-09-03, and the sweep was built in `I77`.
>
> A ninth behaviour also shipped: increment `I75` built the settings `PLT F11`
> has named since 2026-08-31 and never had. §5A's row for `PLT F11` is corrected
> to say so, because v2.0's row described the complementary region alone.
>
> §5A and §5B are amended and §9 is updated. Nothing in §5, §6 or §7 is altered:
> a candidate is not counted with the Frozen set, because counting it there is
> precisely the error v1.1 was written to correct.

- **Owner:** Product Owner / Architecture Owner
- **Document:** Cross-Tier Traceability
- **Status:** Frozen
- **Approval Date:** 2026-09-06
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-06
- **Frozen By:** Product Owner / Architecture Owner
- **Maintenance Mode:** Living
- **Version:** 2.2
- **Supersedes:** Frozen v2.1, preserved unchanged at
  `docs/traceability-v2.1-superseded.md`
- **Last Updated:** 2026-09-06
- **Raised by:** Implementation, after `I90`, to discharge the v2.1 §9 item
  _"Increments `I76`, `I77`, `I78` … not yet traced here"_
- **Supersedes:** Frozen v1.0 (2026-07-25), preserved unchanged at
  `docs/traceability-v1.0-superseded.md`

> **Freeze Note (1.1):** Frozen by separate explicit decision of the Product Owner / Architecture Owner on 2026-08-31, taken after and distinctly from the approval recorded below. This freeze locks Approved v1.1 as the authoritative cross-tier traceability baseline and installs it at `docs/traceability.md`; Frozen v1.0 is preserved unchanged at `docs/traceability-v1.0-superseded.md`, because a superseded baseline is evidence of what was recorded and when, and deleting it would remove the only proof that the correction was a correction. The Frozen document must not be edited in place; any future change requires a controlled superseding revision under `DOCUMENT_LIFECYCLE.md` §7. The freeze changes no referenced source document, advances no Story Delivery Status, and updates no GitHub state.

> **Approval Note (1.1):** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-08-31, after the independent review this candidate had been waiting on since 2026-08-17. The Owner's decision was recorded in these terms: fifty Stories that are in fact complete appearing as `Not Started` is an unacceptable documentation debt. This approval advances the exact reviewed candidate from Draft v1.1 to Approved v1.1. **It does not freeze the document**, which `DOCUMENT_LIFECYCLE.md` keeps as a separate Owner decision, and Frozen v1.0 at `docs/traceability.md` remains the baseline until that decision is taken. The approval changes no Story, PRD, UX, Capability or Feature behaviour, advances no Delivery Status, and updates no GitHub state.

> **Review Note (1.1):** Independent review completed 2026-08-31 with verdict **PASS**. Every figure was counted from the repository rather than read back from the document. All 50 Generated Story files carry `Delivery Status | Done` in their own metadata — 50 of 50 — which is what makes v1.0's §5 and §7 wrong rather than merely stale: `REPOSITORY_GOVERNANCE.md` §3 gives the source document precedence, so the record is the thing that must be corrected. The per-domain counts in §6 match the files exactly: Offering 7/64, Discovery 10/81, Identity 9/81, Decision 7/72, Business 7/95, Platform 10/133, totalling 50 Stories and 526 Acceptance Criteria. `UX-0007-messaging.md` carries `Status: Draft`, so §8's statement that it is outside the Frozen V1 UX baseline holds. The structural claim of "two corrections and one addition" is what the document does: §6 Implementation Coverage is new and the sections after it are renumbered, with no other section altered. **The Freeze Notes preserved in this document's own history are not evidence of current status** — a Story's Freeze Note reads "Delivery Status remains Not Started" because that was true on the day it was frozen, while the metadata table is what states the status now. Reading the prose instead of the table is how this correction could have been mistaken for an error.

**Revision Note (1.1):** Superseding revision of Frozen v1.0, begun independently at Draft under a new version per `DOCUMENT_LIFECYCLE.md` §7. **It carried no Approval Note and no Freeze Note when written, because neither decision had been taken; the Approval Note above records the first of the two, taken on 2026-08-31.** Two corrections and one addition:

1. **§5 and §7 no longer assert that all 50 Generated Stories carry Delivery Status `Not Started`.** That was true when v1.0 was Frozen on 2026-07-25 and stopped being true on 2026-08-15, when increment I9 advanced 49 Stories to `Done` against per-criterion evidence and `US-OFR-F05-001` to `In Progress`. The Owner's AC-3 decision of 2026-08-17 advanced the last one. All 50 now carry `Done`. Nothing else in either statement changed: the Stories are still Frozen, still 50, and still one per Feature.
2. **§6 records the implementation tier**, which v1.0 had no row for because no implementation existed. `M11_STORY_LINK_PROPOSAL.md` recorded three partial links and said in as many words that folding them into this baseline required this revision; they are now subsumed by complete per-criterion coverage of all six domains.
3. **§9 replaces lifecycle work that had already closed.** v1.0 still listed its own repository-wide lifecycle as `In Review v0.8`, which its own approval and freeze completed on the day it was written.

No Feature ID, capability mapping, ownership statement, PRD or UX reference, Story count or scope decision is changed by this revision. `UX-0007 Messaging` remains outside the Frozen V1 baseline. A Delivery Status is a record of delivery and confers no lifecycle authority.

> **Approval Note (1.0).** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-25 after repository-wide Feature-level validation, Formal Architecture Review, and Final Review completed with verdict `PASS — READY FOR OWNER APPROVAL`. This first approval advances the exact reviewed candidate from In Review v0.8 to Approved v1.0 and establishes it as the authoritative cross-tier traceability record for the current V1 baseline. The approval creates no product, UX, Feature, Story, Capability, delivery, or implementation behaviour and does not freeze the document.

> **Freeze Note (1.0).** Frozen by separate explicit decision of the Product Owner / Architecture Owner on 2026-07-25 after approval as v1.0. This freeze locks the Approved v1.0 cross-tier traceability baseline. The Frozen document must not be edited in place; any future change requires a controlled superseding revision under `DOCUMENT_LIFECYCLE.md`. The freeze does not change any referenced source document or any Story Delivery Status.

**Revision Note (1.0):** First approval and subsequent separate freeze of the exact v0.8 review candidate. All 50 authoritative Feature chains remain validated across six Story Domains; `UX-0007 Messaging` remains outside the Frozen V1 UX baseline; all 50 Generated Stories remain `Frozen v1.0` with Delivery Status `Not Started`.

**Revision Note (0.7):** Records the Owner-approved and Frozen Offering Capability Architecture v2.0 baseline and closes the F06/F07 capability-home gap. This revision records existing authoritative relationships only and does not change the Draft lifecycle state of this traceability document.

**Review Entry Note (0.8):** Completes repository-wide Feature-level validation across all six Story Domains. Every authoritative Feature ID is matched to its behaviour-owning PRD, applicable Frozen V1 UX source, Frozen Parent Story placement, and Frozen Generated Story. It also records that Draft `UX-0007 Messaging` is outside the Frozen V1 scope and is not required by any V1 Feature chain. This revision creates no product, UX, Feature, Story, Capability, or implementation behaviour.

## 1. Purpose

This document records cross-tier coverage and unresolved traceability work. Definitions remain owned by the referenced authoritative documents.

## 2. Rules

- A row is populated only from repository sources that are present and authoritative.
- A reference records ownership; it never transfers or duplicates ownership.
- Status values follow `TRACEABILITY_GUIDELINES.md`.
- Repository reconciliation is not by itself traceability validation.

## 3. Verified Capability Mapping

| Capability         | Foundation basis                                                                                      | PRD                                        | UX                                                           | Story coverage                          | Status |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ | --------------------------------------- | ------ |
| Presentation       | Direct: `V1_SCOPE.md` §§3, 5. Supporting: Vision, Mission, Product Manifesto, and Product Principles. | PRD-0001                                   | UX-0003                                                      | US-0001; US-OFR-F05-001                 | Mapped |
| Handoff Enablement | `ADR-0006`, `ADR-0007`, and `ADR-0008`                                                                | PRD-0001; PRD-0005 and PRD-0006 supporting | Applicable Business/Admin and person-facing handoff surfaces | US-0001; US-OFR-F06-001; US-OFR-F07-001 | Mapped |

Accepted relationship chain:

`ADR-0002 → Presentation → F05 → PRD-0001 → UX-0003 → US-0001 → US-OFR-F05-001`

`ADR-0008 → Handoff Enablement → F06/F07 → PRD-0001 → US-0001 → US-OFR-F06-001/US-OFR-F07-001`

`OFFERING_CAPABILITY_ARCHITECTURE.md` owns the Feature ID and Feature → Capability association. This file records the chain only.

## 4. Reconciled Story-Domain Inventory

| Story Domain      | Feature-ID owner                      | Behaviour owner | Primary UX owners                           | Parent Story | Generated Stories | Repository state |
| ----------------- | ------------------------------------- | --------------- | ------------------------------------------- | ------------ | ----------------: | ---------------- |
| Offering (`OFR`)  | `OFFERING_CAPABILITY_ARCHITECTURE.md` | PRD-0001        | UX-0003, UX-0005 and applicable handoff UX  | US-0001      |                 7 | Frozen           |
| Discovery (`DSC`) | `DISCOVERY_FEATURE_REGISTRY.md`       | PRD-0002        | UX-0001, UX-0002, UX-0003, UX-0004          | US-0002      |                10 | Frozen           |
| Identity (`IDN`)  | `IDENTITY_FEATURE_REGISTRY.md`        | PRD-0003        | UX-0008 and applicable return surfaces      | US-0003      |                 9 | Frozen           |
| Decision (`DEC`)  | `DECISION_FEATURE_REGISTRY.md`        | PRD-0004        | UX-0004, UX-0008, UX-0009                   | US-0004      |                 7 | Frozen           |
| Business (`BUS`)  | `BUSINESS_FEATURE_REGISTRY.md`        | PRD-0005        | UX-0005 and applicable Admin review surface | US-0005      |                 7 | Frozen           |
| Platform (`PLT`)  | `PLATFORM_FEATURE_REGISTRY.md`        | PRD-0006        | UX-0006, UX-0008                            | US-0006      |                10 | Frozen           |

The table confirms repository presence and lifecycle state. Feature-level validation evidence is recorded below.

## 5. Feature-Level Validation Matrix

Each listed Feature was checked individually against its authoritative Feature owner, behaviour-owning PRD reference, applicable UX reference, Parent Story Feature Map, Generated Story identifier, and current lifecycle metadata.

| Domain    | Validated Feature IDs            | PRD owner                                           | Frozen V1 UX coverage                                         | Parent        | Generated Stories | Result   |
| --------- | -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------- | ------------- | ----------------: | -------- |
| Offering  | F01–F07                          | PRD-0001; PRD-0005/0006 supporting where cited      | UX-0003, UX-0005, UX-0006                                     | US-0001       |                 7 | PASS     |
| Discovery | F01–F10                          | PRD-0002                                            | UX-0001, UX-0002, UX-0003, UX-0004                            | US-0002       |                10 | PASS     |
| Identity  | F01–F09                          | PRD-0003                                            | UX-0001, UX-0002, UX-0005, UX-0006, UX-0008, UX-0009 as cited | US-0003       |                 9 | PASS     |
| Decision  | F01–F07                          | PRD-0004                                            | UX-0004, UX-0008, UX-0009                                     | US-0004       |                 7 | PASS     |
| Business  | F01–F07                          | PRD-0005                                            | UX-0003, UX-0005, UX-0006, UX-0009 as cited                   | US-0005       |                 7 | PASS     |
| Platform  | F01–F10                          | PRD-0006; target-owning PRDs supporting where cited | UX-0005, UX-0006, UX-0008                                     | US-0006       |                10 | PASS     |
| **Total** | **50 authoritative Feature IDs** | **6 owning PRDs**                                   | **8 Frozen V1 UX documents**                                  | **6 Parents** |            **50** | **PASS** |

Validation rules and results:

- every authoritative Feature ID has exactly one canonical owner;
- every Feature is placed exactly once in its domain Parent Story;
- every Feature has exactly one first Generated Story in the current V1 baseline;
- all 50 Generated Stories are `Frozen`, and all 50 carry Delivery Status `Done`, evidenced per criterion in `docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md` and `docs/implementation/AC3_ATTRIBUTE_GROUPING_DECISION.md`;
- all cited PRD and UX files exist in the repository;
- supporting cross-domain references do not transfer behaviour ownership;
- no generated Story depends on Draft `UX-0007 Messaging`.

## 5A. The 2026-09-03 Extension

Nine behaviours shipped after Frozen v1.1 was written. On 2026-09-03 the Owner
approved and Froze the documents for the first eight, in five linked decisions.
The ninth shipped later the same day and its documents are candidates; the two
Platform chains that were incomplete now have candidates too, and both are named
at the end.

**They are recorded here rather than folded into §5's totals**, because §5 is
the validated baseline of 2026-08-31 and rewriting it would destroy the record
of what was checked, when, and by whom. §5B carries the new totals.

| Behaviour                          | Increment | Feature ID | Behaviour owner              | Story                 | UX                  |
| ---------------------------------- | --------- | ---------- | ---------------------------- | --------------------- | ------------------- |
| Price Constraint                   | I61       | `DSC F11`  | `PRD-0002` v3.0 §§5.5A, 10.6 | `US-DSC-F11-001` v1.0 | `UX-0002` v1.3 §9A  |
| Product Score floor                | I62       | `DSC F12`  | `PRD-0002` v3.0 §§5.5B, 10.7 | `US-DSC-F12-001` v1.0 | `UX-0002` v1.3 §9B  |
| Stated availability                | I64       | `DSC F13`  | `PRD-0002` v3.0 §§5.5C, 10.8 | `US-DSC-F13-001` v1.0 | `UX-0002` v1.3 §9C  |
| Result Arrangement                 | I68       | `DSC F14`  | `PRD-0002` v3.0 §12.6        | `US-DSC-F14-001` v1.0 | `UX-0002` v1.3 §9D  |
| Listing Number                     | I67       | `DSC F15`  | `PRD-0002` v3.0 §8.2         | `US-DSC-F15-001` v1.0 | `UX-0002` v1.3 §10  |
| Kept Products                      | I64       | `DSC F16`  | `PRD-0007-member-area.md`    | `US-DSC-F16-001` v1.0 | `UX-0002` v1.3 §10  |
| Advertising — complementary region | I70       | `PLT F11`  | `PRD-0006` v2.3 §20          | `US-PLT-F11-001` **Frozen v0.1** | `UX-0003` v1.1 §8.7 |
| Advertising — placement settings   | I75       | `PLT F11`  | `PRD-0006` v2.3 §20 + **Frozen v2.5** §20.4 | `US-PLT-F11-001` **Frozen v0.1** | `UX-0006` |
| Listing Reports                    | I69       | `PLT F12`  | `PRD-0006` **Frozen v2.5** §21 | `US-PLT-F12-001` **Frozen v0.1** | `UX-0003` v1.1 §8.8 |

All six Discovery Stories carry `Frozen v1.0` and Delivery Status `Done`. The
Delivery Status is `Done` on the day of approval because each Story was written
after its behaviour shipped and its Acceptance Criteria were extracted from a
running, tested implementation — the Story records what was built rather than
commissioning it.

Two further behaviours have implementation and documentation but no Feature of
their own, because they complete Features that already exist:

| Behaviour                                                           | Increment | Completes                                                              |
| ------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| Category field sets — 404 Attribute definitions across 127 headings | I66       | `DSC F05` Attribute Filtering, which had no Attributes to filter on    |
| The product review surface                                          | I71       | `OFR F05` Offering Presentation, whose score had no reviews beneath it |

### Documents Frozen on 2026-09-03

| Document                            | From                        | To                                      |
| ----------------------------------- | --------------------------- | --------------------------------------- |
| `PRD-0002-discovery.md`             | Frozen v2.4; candidate v2.5 | **Frozen v3.0**                         |
| `UX-0002-discovery.md`              | Frozen v1.1; candidate v1.2 | **Frozen v1.3**                         |
| `DISCOVERY_FEATURE_REGISTRY.md`     | Frozen v1.0; candidate v1.1 | **Frozen v2.0**                         |
| `US-DSC-F11-001` … `US-DSC-F16-001` | Draft candidates            | **Frozen v1.0**, Delivery Status `Done` |
| `PRD-0006-platform.md`              | Frozen v2.2                 | **Frozen v2.3**                         |
| `PLATFORM_FEATURE_REGISTRY.md`      | Frozen v1.0                 | **Frozen v1.1**                         |
| `UX-0003-offering-detail.md`        | Frozen v1.0                 | **Frozen v1.1**                         |

Superseded versions are preserved beside each: a superseded baseline is evidence
of what was recorded and when, and deleting it removes the proof that a
correction was a correction.

### The two Platform chains, and where they now stand

v2.0 recorded one chain as incomplete — **Listing Reports had no behaviour
owner at all** — and recorded the required action as an Owner commission,
because writing a PRD section for behaviour that had shipped without one is a
decision rather than a gap to fill quietly.

**The Owner commissioned it on 2026-09-03**, in his admin architecture document,
and closed the chain over the two days that followed:

| Document                           | From        | Now             | Frozen     | Carries |
| ---------------------------------- | ----------- | --------------- | ---------- | ------- |
| `PRD-0006-platform.md`             | Frozen v2.3 | **Frozen v2.5** | 2026-09-03 | §21 Listing Reports; §20.4 amended; §12's list corrected; §11.2 extended with the Affiliate Handoff Rate |
| `PLATFORM_FEATURE_REGISTRY.md`     | Frozen v1.1 | **Frozen v1.2** | 2026-09-04 | `F12`'s Pending behaviour-owner reference replaced |
| `US-PLT-F11-001`                   | none        | **Frozen v0.1** | 2026-09-04 | Advertising Placement Settings |
| `US-PLT-F12-001`                   | none        | **Frozen v0.1** | 2026-09-04 | Listing Reports |

Four things are true of this set and are stated rather than implied:

1. **The order was wrong, and is recorded as wrong.** Both Features shipped
   before their Story existed, and `PLT F12` shipped before any PRD section
   owned it. Each document says so in its own Creation Note, and Freezing them
   has not removed those notes. Writing the documents afterwards does not make
   the sequence correct; hiding that it happened would make it worse.
2. **The registry's rule was satisfied in sequence, not evaded.** v1.1 forbade
   writing a Story against `PLT F12` until a PRD section existed. §21 was
   written first; the Story was written against it; and neither was Approved
   before §21 was Frozen, on 2026-09-03.
3. **The item inside §21 that was a decision rather than a review comment is
   decided.** §21.5 deletes a reviewed Listing Report — and the reporter's own
   words with it — **180 days** after review, and keeps an unreviewed report
   whatever its age. The Owner set the period on 2026-09-03; `US-PLT-F12-001`
   AC-11 now names it, and `I77` built the sweep.
4. **The Frozen chain names v2.5, not v2.4.** The four documents were drafted
   against `PRD-0006` v2.4 and were re-pointed at v2.5 before Freeze, because
   v2.4 was superseded before it was ever Frozen. Freezing the drafted text
   would have left four Frozen documents tracing a chain to a version with no
   authority — the same class of defect as the Pending reference this whole
   sequence existed to discharge.

**A defect in v2.3 is also corrected by the same chain.** `PRD-0006` §12 lists
the places where platform-owned operational rules may live, and v2.2 added §20
Advertising Placement Settings without adding it to that list — so the document
named five places on one page and described a sixth on another. v2.5 corrects
the list and records the omission rather than repairing it silently: it is the
exact failure §12 exists to prevent, and it happened inside §12.

## 5C. The 2026-09-03 to 2026-09-06 increments

Fifteen increments were built after v2.1 was frozen. This section records what
each one shipped and **which authoritative document owns it**, because that is
the only question this file answers. It does not assess the code.

### 5C.1 Owned, and by what

| Increment | What shipped | Behaviour owner | Feature | Note |
| --- | --- | --- | --- | --- |
| `I76` | Partner feed intake, on a schedule, with failures on the dashboard | `PRD-0001` §5.11 (Source), now **v4.2** §5.11.1 | — (mechanism) | The intake is a mechanism; §5.11.1 fixes what it may touch and leaves the mechanism to engineering documents |
| `I77` | 72-hour missing-product tolerance; Listing Report retention sweep | `PRD-0001` v4.2 §5.11.1a; `PRD-0006` v2.5 §21.5 | `PLT F12` for the report half | The tolerance figure is the Owner's decision of 2026-09-03 |
| `I78` | Intake Availability Input; Affiliate Handoff Rate | `PRD-0001` §7.2 (third input); `PRD-0006` v2.5 §11.2 | `PLT F10` for the rate | Both were added to their PRDs before the code, which is the order this project keeps |
| `I79` | Admin overview dashboard with metric cards and engagement bars | `PRD-0006` §6, §11 | `PLT F01`, `PLT F10` | A presentation of indicators `F10` already owns; no new indicator was invented |
| `I80` | Brand palette applied to the interface and the Admin panel | — (visual design) | — | No behaviour. Recorded so that a reader does not go looking for an owner |
| `I81` | Admin surface completeness: case targets, dates, workload headings | `PRD-0006` §§7, 11 | `PLT F02`, `F07`, `F10` | Filled in surfaces the Features already required |
| `I85`, `I86`, `I90` | Catalogue importer, image ingest, development reset | — (engineering tooling) | — | Operator tooling. `PRD-0001` v4.2 §5.11.1 says explicitly that a match rule is "an engineering concern governed by its own documents"; the same reading covers these |
| `I87` | Affiliate-destination acts written to the central audit trail | `PRD-0006` §8 for the acts | `PLT F07` | The acts are owned. **The trail they are written to is not** — see §5C.2 |
| `I88` | The intake restricted to price and stock of live listings | **`PRD-0001` v4.2 §5.11.1** | — | The Owner's decision of 2026-09-05, carried into a superseding revision before the code was written |
| `I89` | A feed matched to an imported listing by Product Key | **`PRD-0001` v4.2 §5.11.1** | — | Same revision. The match rule itself is engineering, and the document says so |

### 5C.2 Not owned by anything — three items for Owner commission

Each of these is **built, in use, and Frozen-document-less**. They are listed
the way `PLT F12`'s missing behaviour owner was listed in v2.0: named, with the
action, and not quietly folded into a Feature that does not cover them.

| # | What exists | What owns it today | What it needs |
| --- | --- | --- | --- |
| 1 | **The Admin audit trail** (`I83`, `I84`, `I87`): what is recorded, that it is append-only, who may read it, that it is never swept, and that a Sub-Admin tier must not reach it | Nothing. `PRD-0006` has no section for it; the rules live in the Owner's messages of 2026-09-04 and 2026-09-05 and in code comments | A `PRD-0006` section, and a `PLT` Feature and Story. Until then the strongest rule the platform has — an immutable record of what Admins do — rests on no authoritative document |
| 2 | **The personal-data disclosure rule** (`I82`): no email address on any operational Admin surface; an address is revealed only on one case, only on request, and the request is recorded | Nothing. The Owner's rule of 2026-09-04, verbatim, is the only statement of it | A `PRD-0006` sentence at minimum. It is a data-protection commitment, and a commitment that exists only in an implementation is one nobody can hold the platform to |
| 3 | **Admin feed management** (`I76`): the surface where an Admin registers a partner feed, sets its mapping, pauses it and reads its runs | `PRD-0001` owns what an intake may do; nothing owns the Admin surface that configures one | A `PLT` Feature and Story, and a `UX-0006` section. The Features stop at `F12` and none of them covers it |

**Why they are not being written here.** §2: this document records ownership
and never confers it. Writing a Feature row for the audit trail would create the
appearance of an authoritative chain whose PRD section does not exist — which is
the defect v1.1 was written to correct, in a new place.

### 5C.3 What `/admin/users` is, and is not

`I83` also added a user list. It is a **reading surface** over accounts that
`PLT F05` already owns the actions for, carrying ids, status, registration date
and counts — and, by rule 2 above, no email addresses. It needs no new Feature;
it is named here because a new Admin page that appears in no document is exactly
the thing a later reader will not find.

## 5B. Totals After the Extension

|                           | Frozen at v1.1 (2026-08-31) | Added 2026-09-03 | Added 2026-09-04 |          Now |
| ------------------------- | --------------------------: | ---------------: | ---------------: | -----------: |
| Authoritative Feature IDs |                          50 |                8 |                0 |       **58** |
| Generated Stories         |                          50 |                6 |                2 |       **58** |
| Features with a Story     |                          50 |                6 |                2 | **58 of 58** |

**The count reaches 58 of 58 on 2026-09-04, and only because the Freezes were
taken in order.** `PLT F11` and `PLT F12` are counted here because their Stories
are **Frozen v0.1**, not because they exist: a Draft is not a Generated Story
for the purpose of this count, and counting a candidate with the Frozen set is
the error v1.1 was written to correct.

The order the count depended on was `PRD-0006-platform.md` v2.5 (2026-09-03),
then `PLATFORM_FEATURE_REGISTRY.md` v1.2, then the two Stories (2026-09-04) —
each depending on the one before it. **58 of 58 is a statement about documents,
not about delivery**: it says every authoritative Feature has a Frozen Story,
and says nothing about whether any of them is built.

## 6. Implementation Coverage

v1.0 recorded six tiers — capability, PRD, UX, Parent, Feature, Generated Story
— and stopped there, because there was no seventh to record. There is now.

Each domain's Acceptance Criteria are matched to the tests that verify them,
criterion by criterion, in `docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`.
This section records that the tier exists and where its evidence lives; it does
not restate the evidence, and it confers no status on any Story.

| Domain    | Generated Stories | Acceptance Criteria | Delivery Status | Evidence                                                                                          |
| --------- | ----------------: | ------------------: | --------------- | ------------------------------------------------------------------------------------------------- |
| Offering  |                 7 |                  64 | `Done`          | `DELIVERY_STATUS_ADVANCEMENT.md`; `US-OFR-F05-001` AC-3 also `AC3_ATTRIBUTE_GROUPING_DECISION.md` |
| Discovery |                10 |                  81 | `Done`          | `DELIVERY_STATUS_ADVANCEMENT.md`                                                                  |
| Identity  |                 9 |                  81 | `Done`          | `DELIVERY_STATUS_ADVANCEMENT.md`                                                                  |
| Decision  |                 7 |                  72 | `Done`          | `DELIVERY_STATUS_ADVANCEMENT.md`                                                                  |
| Business  |                 7 |                  95 | `Done`          | `DELIVERY_STATUS_ADVANCEMENT.md`                                                                  |
| Platform  |                10 |                 133 | `Done`          | `DELIVERY_STATUS_ADVANCEMENT.md`                                                                  |
| **Total** |            **50** |             **526** | **all `Done`**  | —                                                                                                 |

Rules this tier follows, which are the rules of the tiers above it:

- an implementation reference records coverage; it never transfers or duplicates
  behaviour ownership, which stays with the PRD;
- a Delivery Status is an operational planning signal owned by
  `USER_STORY_HANDBOOK.md` §18, not a lifecycle state under
  `DOCUMENT_LIFECYCLE.md`; advancing one neither unfreezes a Story nor changes
  an Acceptance Criterion;
- a criterion is recorded as covered only where a named test asserts it. Ten
  criteria are covered by **absence** — the platform is asserted not to do
  something — and are marked as such at their entries rather than counted as
  ordinary coverage.

`M11_STORY_LINK_PROPOSAL.md` recorded three partial links in August 2026 and
stated that folding them into this baseline required a controlled superseding
revision. This is that revision, and the three links are subsumed: every Story
it named, and every other, now carries complete per-criterion coverage.

## 7. Parent and Generated Story Counts

The `Candidate State` values embedded in the six Frozen Parent Story Documents are
historical snapshots of the candidates reviewed when each Parent was approved.
They are not the current lifecycle authority for the referenced Generated Story
files. The current repository state is the lifecycle metadata in each Generated
Story file and the reconciliation table below: all 50 Generated Stories are
`Frozen v1.0`, and all 50 carry Delivery Status `Done`. The Frozen Parent files
remain unchanged; any future change to their inventories requires a controlled
revision. A Delivery Status records delivery and confers no lifecycle authority:
the Story files remain Frozen and their Acceptance Criteria unaltered.

| Domain    | Parent | Generated |  Total |
| --------- | -----: | --------: | -----: |
| Offering  |      1 |         7 |      8 |
| Discovery |      1 |        10 |     11 |
| Identity  |      1 |         9 |     10 |
| Decision  |      1 |         7 |      8 |
| Business  |      1 |         7 |      8 |
| Platform  |      1 |        10 |     11 |
| **Total** |  **6** |    **50** | **56** |

## 8. Scope Decision — UX-0007 Messaging

`UX-0007 Messaging` is not part of the current Frozen V1 baseline. Frozen PRD-0003, PRD-0004, PRD-0005, and PRD-0006 explicitly exclude Messaging, while Frozen UX-0008 and UX-0009 preserve the no-Messaging boundary. No authoritative Feature or Generated Story requires UX-0007.

Repository treatment:

- retain `UX-0007-messaging.md` as historical Draft v0.2;
- do not use it as a V1 behaviour or traceability source;
- do not approve, Freeze, delete, or archive it without a separate lifecycle decision;
- require a future V1 scope revision before Messaging can enter an authoritative chain.

## 9. Remaining Lifecycle Work

| Item                                                     | State                             | Required action                                                                                                                                                                                             |
| -------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full Feature-level validation across all six domains     | Complete — PASS                   | Preserve evidence and rerun after any controlled upstream revision                                                                                                                                          |
| Eight in-flight chains of 2026-09-03 (§5A)               | Resolved — Approved and Frozen    | Complete. Recorded in §5A                                                                                                                                                                                   |
| `PRD-0006` section for Listing Reports                   | Resolved — **Frozen v2.5 §21**    | Complete. Approved and Frozen 2026-09-03; `PLT F12`'s behaviour owner is authoritative                                                                                                                       |
| Listing Report retention period (§21.5)                  | Resolved — **180 days**           | Complete. Decided by the Owner 2026-09-03; sweep built in `I77`, with `status <> 'OPEN'` guarding an unreviewed report of any age                                                                            |
| `PLT F11` and `PLT F12` Stories                          | Resolved — **Frozen v0.1**        | Complete. Approved and Frozen 2026-09-04, after `PRD-0006` v2.5 and `PLATFORM_FEATURE_REGISTRY.md` v1.2, in that order. Both carry Delivery Status `Implemented`                                             |
| `PRD-0006` §12 list omitting §20                         | Resolved — corrected in v2.5      | Complete. The correction is recorded as a defect in Frozen v2.3 rather than as a silent repair                                                                                                               |
| Frozen v2.1                                              | **Frozen v2.1**                   | Complete. Owner approval and, separately, Owner freeze taken 2026-09-04; preserved as the baseline until this revision is approved                                                                            |
| This superseding revision (v2.2)                         | **Frozen v2.2**                   | Complete. Approved and Frozen 2026-09-06. This document is the baseline; v2.1 is preserved at `docs/traceability-v2.1-superseded.md`                                                                          |
| Increments `I76`–`I90` | **Traced — recorded in §5C**              | Complete for the twelve that have an owner. `PRD-0001` **v4.2** (Frozen 2026-09-05) now owns what an intake may do, which is what `I88` and `I89` rest on |
| **The Admin audit trail** (`I83`, `I84`, `I87`) | **Commissioned 2026-09-06** | `PRD-0006` §22, drafted in the v2.6 revision as a binding technical commitment: append-only at the database, retained indefinitely, super-admin only, closed to any future Sub-Admin tier |
| **The personal-data disclosure rule** (`I82`) | **Commissioned 2026-09-06** | `PRD-0006` §23, drafted in the v2.6 revision as a **Security Requirement**: no address on any operational surface, revealed only by a deliberate act on one case, and that act audited |
| **Admin feed management surface** (`I76`) | **Commissioned 2026-09-06** | `PRD-0006` §24 as the behaviour owner, `F13` in `PLATFORM_FEATURE_REGISTRY.md` v1.3, and `US-PLT-F13-001`. None of the three is authoritative until approved |
| Implementation coverage of all 526 Acceptance Criteria   | Complete — recorded in §6         | Rerun the per-criterion evidence extraction after any controlled Story or PRD revision                                                                                                                      |
| Outbound email vendor and Decision Chat assistant vendor | Not selected                      | Owner selection. Both transports are written and tested with no vendor in them; neither affects any chain this document traces                                                                              |
| `UX-0007 Messaging` relationship to V1                   | Resolved for V1                   | Retain as historical Draft outside the Frozen V1 baseline                                                                                                                                                   |

## 10. Maintenance

Update this document whenever an authoritative cross-tier relationship is added, revised, validated, approved, frozen, deprecated, or archived. The source document controls its own lifecycle; this traceability record cannot confer status on another document.
