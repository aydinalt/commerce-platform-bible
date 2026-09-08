# Traceability

> **Freeze Note (2.0):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-03, after the decision that Froze the documents §5A was
> written to track. Frozen v1.1 is preserved at
> `docs/traceability-v1.1-superseded.md`.
>
> **Approval Note (2.0):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-03 — _"onaylıyorum işleme alabilirsin"_.
>
> **Revision Note (2.0):** Superseding revision of Frozen v1.1 under
> `DOCUMENT_LIFECYCLE.md` §7.
>
> **What it records: the chain grew by six Features and two more, and the
> Owner's decision of the same day made all but one of them authoritative.** The Frozen baseline of 50 Features and 50 Stories
> is unchanged and every figure in §5 to §7 still describes it. Since it was
> frozen the platform has shipped eight further behaviours, and each of them is
> now represented by candidate documents that no Owner decision has yet
> approved. Recording them here — separately, and marked — is what keeps this
> document a record rather than an aspiration.
>
> §5A is new and is the only section added. Nothing in §5, §6 or §7 is altered:
> a candidate is not counted with the Frozen set, because counting it there is
> precisely the error v1.1 was written to correct.

- **Owner:** Product Owner / Architecture Owner
- **Document:** Cross-Tier Traceability
- **Status:** Frozen
- **Approval Date:** 2026-09-03
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-03
- **Frozen By:** Product Owner / Architecture Owner
- **Maintenance Mode:** Living
- **Version:** 2.0
- **Last Updated:** 2026-09-03
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

Eight behaviours shipped after Frozen v1.1 was written. On 2026-09-03 the Owner
approved and Froze the documents for all of them, in five linked decisions; one
chain remains incomplete and is named at the end.

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
| Advertising — complementary region | I70       | `PLT F11`  | `PRD-0006` v2.3 §20          | **none yet**          | `UX-0003` v1.1 §8.7 |
| Listing Reports                    | I69       | `PLT F12`  | **none yet**                 | **none yet**          | `UX-0003` v1.1 §8.8 |

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

### The one chain that is still incomplete

**Listing Reports has no behaviour owner.** `PRD-0006-platform.md` describes
General Moderation and says nothing about a reader-originated queue. `PLT F12`
is allocated, the UX section is Frozen and the implementation is live — and the
PRD section that would govern them is not written, because commissioning one is
the Owner's decision and not a gap to be filled quietly.

Until it exists: no Story may be written against `PLT F12`, and the Feature's
Behaviour Owner reference in `PLATFORM_FEATURE_REGISTRY.md` v1.1 says
_pending_ rather than naming a section that does not exist.

## 5B. Totals After the Extension

|                           | Frozen at v1.1 (2026-08-31) | Added 2026-09-03 |          Now |
| ------------------------- | --------------------------: | ---------------: | -----------: |
| Authoritative Feature IDs |                          50 |                8 |       **58** |
| Generated Stories         |                          50 |                6 |       **56** |
| Features with a Story     |                          50 |                6 | **56 of 58** |

The two Features without a Story are `PLT F11` and `PLT F12`. `PLT F11`'s
behaviour is owned by `PRD-0006` §20 and a Story may be written whenever the
Owner wants one; `PLT F12`'s cannot be written at all until its PRD section
exists.

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
| Eight in-flight chains (§5A)                             | **Candidate — no Owner decision** | Five decisions, each taken over the document set §5A names. Until each is taken, the behaviour is live and its documents are not authoritative                                                              |
| `PRD-0006` section for Listing Reports                   | **Not written**                   | Owner commission. The only in-flight chain with no behaviour owner at all                                                                                                                                   |
| This superseding revision                                | **Frozen v1.1**                   | Complete. Independent review passed 2026-08-31; Owner approval and, separately, Owner freeze taken the same day. This document is the baseline; v1.0 is preserved at `docs/traceability-v1.0-superseded.md` |
| Implementation coverage of all 526 Acceptance Criteria   | Complete — recorded in §6         | Rerun the per-criterion evidence extraction after any controlled Story or PRD revision                                                                                                                      |
| Outbound email vendor and Decision Chat assistant vendor | Not selected                      | Owner selection. Both transports are written and tested with no vendor in them; neither affects any chain this document traces                                                                              |
| `UX-0007 Messaging` relationship to V1                   | Resolved for V1                   | Retain as historical Draft outside the Frozen V1 baseline                                                                                                                                                   |

## 10. Maintenance

Update this document whenever an authoritative cross-tier relationship is added, revised, validated, approved, frozen, deprecated, or archived. The source document controls its own lifecycle; this traceability record cannot confer status on another document.
