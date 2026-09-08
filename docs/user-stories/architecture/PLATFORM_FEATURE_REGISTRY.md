# Platform Story Domain Feature Registry

> **Freeze Note (1.3):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07, **after** `PRD-0006-platform.md` v2.6 and never before it
> — the condition this revision carried while it was a Draft, and the reason it
> carried it: a Frozen registry naming a section that is not authoritative is a
> reference pointing at nothing. Frozen v1.2 is preserved unchanged at
> `PLATFORM_FEATURE_REGISTRY-v1.2-superseded.md`.
>
> **Approval Note (1.3):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-06 — _"Hazırladığın PRD-0006 v2.6, Registry v1.3
> ve US-PLT-F13-001 taslaklarını resmi olarak onaylıyorum."_
>
> **Two Features, and the second was added after that approval, on the Owner's
> instruction in the same message.** The approved draft allocated `F13` alone.
> `F14` follows from his decision of 2026-09-06: _"Kesinlikle F14'ü (Denetim İzi
> Okuma Yüzeyi) açıyoruz… Özellik kimliği atanmamış bir arayüz, yetkilendirme
> açısından sistemde sahipsiz bir kat çıkmak anlamına gelir."_ It is recorded
> here rather than folded in silently, so that the approval is not made to cover
> a row the Owner had not read when he gave it.
>
> | Feature                   | Why it is allocated                                                                                                                                                                                                    |
> | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `F13` Feed Management     | The Admin surface where a partner feed is registered, mapped, paused and read has existed since `I76` and was owned by no Feature and no Story — `traceability.md` Frozen v2.2 §5C.2                                   |
> | `F14` Audit Trail Reading | `/admin/audit-logs` carries filters, paging and an export. An interface with no Feature ID is a tier of the system with no owner, and there has to be a Feature for a later Sub-Admin tier to be **refused** access to |
>
> **`F15` is not allocated for the personal-data rule, by the Owner's decision.**
> _"Bu kural bağımsız bir etkileşim yüzeyi değil, tüm platformu yatay olarak
> kesen yapısal bir kısıtlamadır."_ `PRD-0006` §23 is a Security Requirement over
> every surface, and the disclosure act itself lives under `F02`'s case detail
> as a condition on it. A Feature is allocated for a surface, and §23 is not one.
>
> This revision defines no behaviour, no Acceptance Criteria and no Story.

> **Freeze Note (1.2):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-04, together with `US-PLT-F11-001` v0.1, `US-PLT-F12-001`
> v0.1 and `traceability.md` v2.1 — the same four documents whose blocker was
> `PRD-0006-platform.md` §21, and freezing a subset of them would leave one
> asserting something its own references do not support. This exact version
> must not be edited in place; a further change requires a controlled revision
> under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v1.1 is preserved unchanged at
> `PLATFORM_FEATURE_REGISTRY-v1.1-superseded.md`.
>
> **Approval Note (1.2):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-04 — _"Bekleyen dört aday belgeyi
> (PLATFORM_FEATURE_REGISTRY v1.2, iki PLT story'si ve traceability v2.1)
> resmi olarak onaylıyorum. Belgeleri dondurup (Freeze) F12'nin §21'e bağlanma
> sürecini tamamlayabilir ve eski sürümleri arşive kaldırabilirsin."_
>
> **Revision Note (1.2):** Superseding revision of Frozen v1.1, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7 and `ADR-0009`.
>
> **One change: `F12` gets the behaviour owner v1.1 recorded as Pending.**
> v1.1 allocated `F12` Listing Reports and stated that no Generated Story may be
> written against it until a section of `PRD-0006-platform.md` owns it.
> `PRD-0006-platform.md` **Frozen v2.5 §21** is that section.
>
> **The blocker this revision carried while it was a Draft is now discharged,
> and the discharge is recorded rather than erased.** While at Draft this
> revision said it may not be Frozen before its behaviour owner is, because
> naming a Draft section as a Feature's behaviour owner in a Frozen registry
> would be exactly the failure v1.1 refused to commit — a reference pointing at
> something not yet authoritative. That condition was met on 2026-09-03, when
> `PRD-0006-platform.md` v2.5 was Approved and Frozen carrying §21.
>
> **The bound version is v2.5, not the v2.4 this revision named at Draft.**
> v2.4 was superseded before it was ever Frozen, so every reference below was
> re-pointed at v2.5 before Freeze. Freezing the v2.4 text would have shipped a
> Frozen registry citing a version that never became authoritative — the same
> defect in a new place. v2.4 is preserved at
> `PRD-0006-platform-v2.4-candidate.md` as evidence of what was proposed.
>
> `F11`'s behaviour-owner reference gains the same versioned form: two of
> `US-PLT-F11-001`'s Acceptance Criteria are owned by §20.4 as v2.5 amends it,
> and v2.3 §20 alone does not support them.
>
> This revision allocates no Feature. It defines no behaviour, no Acceptance
> Criteria and no Story.

> **Freeze Note (1.4):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07. This exact version must not be edited in place; a further
> change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8.
> Frozen v1.3 is preserved unchanged at
> `PLATFORM_FEATURE_REGISTRY-v1.3-superseded.md`.
>
> **Approval Note (1.4):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-07 — _"Platform Feature Registry v1.4 Taslağı
> resmi olarak onaylıyorum; dondurup v1.3'ü arşive kaldırabilirsin."_ Approval
> and Freeze were taken in one decision. With it the Owner recorded that the V1
> governance cycle closes with no open item: every Platform Feature now has a
> Frozen behaviour owner, a Frozen Story, and a Frozen UX section.
>
> **Revision Note (1.4):** Superseding revision of Frozen v1.3, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7.
>
> **One change, in two table cells.** `F13` and `F14` carried
> _"`UX-0006-admin-dashboard.md` — section pending"_ in their UX column, because
> when v1.3 was frozen on 2026-09-07 no UX section existed for either. Both now
> do: `UX-0006` **Frozen v1.1** adds §12A Feed Management and §12B Audit Trail
> Reading, approved and frozen the same day.
>
> **This is a revision rather than an edit, and the distinction is the point.**
> Two words in two cells could have been changed in place in seconds, and the
> registry would then carry a Freeze Note attesting to content that is not what
> was frozen. A Frozen document whose cells quietly track reality is one nobody
> can cite, because no reader can tell which statements were approved and which
> were tidied afterwards.
>
> This revision allocates no Feature, retires none, and changes nothing else.
> `F15` remains deliberately unallocated for `PRD-0006` §23; nothing about that
> decision changes here.

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.4
- **Approval Date:** 2026-09-07
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-07
- **Frozen By:** Product Owner / Architecture Owner
- **Supersedes:** Frozen v1.3, preserved at `PLATFORM_FEATURE_REGISTRY-v1.3-superseded.md`
- **Supersedes:** Frozen v1.2, preserved at `PLATFORM_FEATURE_REGISTRY-v1.2-superseded.md`
- **Supersedes:** Frozen v1.1, preserved at `PLATFORM_FEATURE_REGISTRY-v1.1-superseded.md`
- **Supersedes:** Frozen v1.0, preserved at `PLATFORM_FEATURE_REGISTRY-v1.0-superseded.md`
- **Date:** 2026-07-22
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Approved candidate:** In Review v0.1
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Platform
- **Domain Code:** PLT
- **Parent Story Document:** US-0006
- **Authority:** `ADR-0009-story-domain-feature-registry-ownership.md`
- **Generated Story allocation:** Available from Frozen v1.0 Feature IDs
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Feature Registry baseline for Story Domain `PLT`. Its Active Feature IDs may now be consumed by authoritative Generated Story identifiers under the Frozen User Story Handbook. This exact registry must not be edited in place. Future Feature ID allocation, retirement, canonical-name correction, authority-reference change, or relationship-classification change requires a controlled revision. This Freeze creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Feature Registry baseline under the first-approval versioning rule. All registry Feature entry statuses become Active. This historical Approval Note records that approval and Freeze were separate decisions. The registry was subsequently Frozen on 2026-07-22, making its Active Feature IDs available for authoritative Generated Story allocation. This approval creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Creation Note (0.1):** Initial controlled Feature-ID allocation proposal for Story Domain `PLT`, authorized by Accepted `ADR-0009-story-domain-feature-registry-ownership.md`. All Feature entries are Active, but they cannot be consumed by authoritative Generated Story IDs until this registry is Frozen. No Capability, Capability Map, PRD/UX behaviour, Epic placement, Story content, or implementation is created.

**Review Entry Note (0.1):** The exact Draft v0.1 content entered formal review without changing Feature IDs, Feature names, scope labels, authority references, relationship classifications, or lifecycle gates. The registry is now authoritative as Approved v1.0 and its entries are Active; Story allocation remains blocked until Freeze.

> This document is the Single Information Owner for `PLT` Feature IDs and bounded Feature identity metadata. It is not a Capability Architecture document and defines no product behaviour, UX behaviour, Epic placement, Story content, or implementation.

---

## 1. Purpose

Provide stable, domain-local Feature identities that may later be consumed by Generated User Story identifiers for the Platform Story Domain.

## 2. Scope

This registry owns only:

- Feature ID allocation within `PLT`;
- canonical Feature names;
- Feature identity status;
- Feature-ID reservation and retirement;
- short non-behavioural Feature scope labels;
- behaviour-owner references;
- applicable UX references;
- Capability relationship classifications by reference.

## 3. Out of Scope

- product behaviour or business rules;
- UX interaction or visual design;
- Capability definitions or Capability Maps;
- Epic placement;
- Generated Story content, identifiers, lifecycle, estimation, or delivery planning;
- implementation architecture, APIs, storage, or technology;
- changes to PRD, UX, ADR, governance, or Offering Feature ownership.

## 4. Governing Rules

1. Feature IDs are unique within Story Domain `PLT`.
2. The complete Story identifier remains globally unambiguous through the Domain code.
3. Feature IDs are never allocated by Parent Story Documents or Generated Stories.
4. Active entries in this Frozen registry are authoritative for Story ID allocation.
5. A Feature ID is available for authoritative Generated Story use because this registry is Approved and Frozen.
6. Feature IDs are never recycled after authoritative use.
7. A Frozen registry is never edited in place.
8. Behaviour remains owned by `PRD-0006-platform.md`.
9. UX behaviour remains owned by the referenced Frozen UX documents.
10. Capability names and boundaries are referenced, never redefined.

## 5. Relationship Classification Vocabulary

This registry uses only:

- **Direct Frozen assignment** — the governing Accepted ADR or Frozen Capability Map directly assigns the behaviour to an existing Offering Capability.
- **Supporting relationship** — the domain Feature supports or governs access/action around an existing Capability-owned flow without becoming its behaviour owner.
- **No Capability Architecture required** — own-domain V1 behaviour follows the direct ADR-0007 authority chain.

Relationship classification is descriptive by reference and does not create a Feature → Capability decision beyond the cited authority.

## 6. Authoritative Feature Registry

| Feature ID | Canonical Feature Name               | Entry Status | Short Scope Label                                                                                  | Behaviour Owner Reference                                      | Applicable UX Reference                                                  | Relationship Type                   | Capability Reference                 | Notes                                                                                                                                                          |
| ---------- | ------------------------------------ | ------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01        | Admin Panel Access and Baseline      | Active       | Entry to the Admin Panel under existing authorization and inherited public baseline.               | `PRD-0006-platform.md` §6                                      | `UX-0006-admin-dashboard.md` §§5–6; `UX-0008-authentication.md` §8.3     | No Capability Architecture required | Not required under ADR-0007          | Identity owns authorization; Platform owns the Admin experience and action surface.                                                                            |
| F02        | General Moderation Case Management   | Active       | Open/Closed moderation-case workload and explicit case closure.                                    | `PRD-0006-platform.md` §§5.3–5.4, 7.1–7.3                      | `UX-0006-admin-dashboard.md` §§7–8                                       | No Capability Architecture required | Not required under ADR-0007          | Case state creates no target state by itself.                                                                                                                  |
| F03        | Offering Moderation Actions          | Active       | Hide and Restore actions for authoritative Offering lifecycle targets.                             | `PRD-0006-platform.md` §§7.2, 7.4                              | `UX-0006-admin-dashboard.md` §§7.3–7.4                                   | Supporting relationship             | Lifecycle; Visibility & Eligibility  | Platform owns the action; PRD-0001 owns the target result.                                                                                                     |
| F04        | Business Moderation Actions          | Active       | Restrict and Restore Business actions.                                                             | `PRD-0006-platform.md` §§7.2, 7.5                              | `UX-0006-admin-dashboard.md` §§7.3–7.4                                   | Supporting relationship             | Visibility & Eligibility             | Platform owns the action; PRD-0005 owns Business Moderation Status.                                                                                            |
| F05        | User Access Moderation Actions       | Active       | Suspend and Reinstate User actions with the Admin-authorized-account boundary.                     | `PRD-0006-platform.md` §§6.5, 7.2, 7.6                         | `UX-0006-admin-dashboard.md` §§7.3–7.4, 13                               | No Capability Architecture required | Not required under ADR-0007          | Identity owns the User Account access-status result.                                                                                                           |
| F06        | Request Correction and Re-Review     | Active       | Correction targeting, bounded owner response, Admin re-review, and explicit closure.               | `PRD-0006-platform.md` §§7.3–7.3.2                             | `UX-0006-admin-dashboard.md` §8; `UX-0005-business-dashboard.md` §§11–12 | Supporting relationship             | Target-owned Capability by reference | Request Correction is one General Moderation action and creates no Messaging.                                                                                  |
| F07        | Affiliate Destination Administration | Active       | Review, Validate, Enable, and Disable administration as a separate action family.                  | `PRD-0006-platform.md` §8                                      | `UX-0006-admin-dashboard.md` §9                                          | Supporting relationship             | Handoff Enablement                   | PRD-0001 owns destination states, validation meaning, and Handoff Eligibility.                                                                                 |
| F08        | Category and Domain Management       | Active       | Admin management of Category hierarchy, Domain assignment, and retirement.                         | `PRD-0006-platform.md` §9                                      | `UX-0006-admin-dashboard.md` §10                                         | Direct Frozen assignment            | Representation                       | Direct Offering-capability behaviour assigned by ADR-0007.                                                                                                     |
| F09        | Attribute Definition Management      | Active       | Admin management of Attribute definitions and mutation-safety rules.                               | `PRD-0006-platform.md` §10                                     | `UX-0006-admin-dashboard.md` §11                                         | Direct Frozen assignment            | Representation                       | Direct Offering-capability behaviour assigned by ADR-0007.                                                                                                     |
| F10        | Basic Analytics                      | Active       | Admin-facing bounded current-state and core-flow indicators.                                       | `PRD-0006-platform.md` §11                                     | `UX-0006-admin-dashboard.md` §12                                         | No Capability Architecture required | Not required under ADR-0007          | Consumes Discovery, Presentation, Compare, Decision Chat, and Completion occurrences without redefining them.                                                  |
| F11        | Advertising Placement Settings       | Active       | Where advertising may appear and whether it appears at all.                                        | `PRD-0006-platform.md` v2.3 §20, extended by Frozen v2.5 §20.4 | `UX-0006-admin-dashboard.md`; `UX-0003-offering-detail.md` §8.7          | No Capability Architecture required | Not required under ADR-0007          | The platform configures placement and serves the complementary region; it sells, prices, moderates and reports nothing.                                        |
| F12        | Listing Reports                      | Active       | A reader's report that something on one listing is wrong, and its review.                          | `PRD-0006-platform.md` **Frozen v2.5** §21                     | `UX-0006-admin-dashboard.md`; `UX-0003-offering-detail.md` §8.8          | No Capability Architecture required | Not required under ADR-0007          | Not a General Moderation case: opened by anybody, changes no target state, and produces an Admin judgement rather than an action.                              |
| F13        | Feed Management                      | Active       | Registering a partner feed, holding its mapping, pausing it, and reading its runs.                 | `PRD-0006-platform.md` **Frozen v2.6 §24**                     | `UX-0006-admin-dashboard.md` **Frozen v1.1** §12A                        | No Capability Architecture required | Not required under ADR-0007          | `PRD-0001` §5.11 owns what an intake may do to an Offering; this Feature owns only the surface that configures one. It creates, publishes and edits nothing.   |
| F14        | Audit Trail Reading                  | Active       | Reading the Admin audit trail: filters, paging and export, reserved to the platform administrator. | `PRD-0006-platform.md` **Frozen v2.6** §22, §22.6              | `UX-0006-admin-dashboard.md` **Frozen v1.1** §12B                        | No Capability Architecture required | Not required under ADR-0007          | §22 owns what the trail is and who it is for; this Feature owns only the surface that reads it. It writes nothing, and reading is not itself recorded (§22.6). |

## 7. Feature Entry Records

### F01 — Admin Panel Access and Baseline

- **Entry status:** Active
- **Short scope label:** Entry to the Admin Panel under existing authorization and inherited public baseline.
- **Behaviour owner reference:** `PRD-0006-platform.md` §6
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§5–6; `UX-0008-authentication.md` §8.3
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Identity owns authorization; Platform owns the Admin experience and action surface.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F02 — General Moderation Case Management

- **Entry status:** Active
- **Short scope label:** Open/Closed moderation-case workload and explicit case closure.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§5.3–5.4, 7.1–7.3
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7–8
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Case state creates no target state by itself.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F03 — Offering Moderation Actions

- **Entry status:** Active
- **Short scope label:** Hide and Restore actions for authoritative Offering lifecycle targets.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§7.2, 7.4
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7.3–7.4
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Lifecycle; Visibility & Eligibility
- **Boundary note:** Platform owns the action; PRD-0001 owns the target result.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F04 — Business Moderation Actions

- **Entry status:** Active
- **Short scope label:** Restrict and Restore Business actions.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§7.2, 7.5
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7.3–7.4
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Visibility & Eligibility
- **Boundary note:** Platform owns the action; PRD-0005 owns Business Moderation Status.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F05 — User Access Moderation Actions

- **Entry status:** Active
- **Short scope label:** Suspend and Reinstate User actions with the Admin-authorized-account boundary.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§6.5, 7.2, 7.6
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §§7.3–7.4, 13
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Identity owns the User Account access-status result.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F06 — Request Correction and Re-Review

- **Entry status:** Active
- **Short scope label:** Correction targeting, bounded owner response, Admin re-review, and explicit closure.
- **Behaviour owner reference:** `PRD-0006-platform.md` §§7.3–7.3.2
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §8; `UX-0005-business-dashboard.md` §§11–12
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Target-owned Capability by reference
- **Boundary note:** Request Correction is one General Moderation action and creates no Messaging.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F07 — Affiliate Destination Administration

- **Entry status:** Active
- **Short scope label:** Review, Validate, Enable, and Disable administration as a separate action family.
- **Behaviour owner reference:** `PRD-0006-platform.md` §8
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §9
- **Capability relationship type:** Supporting relationship
- **Capability reference:** Handoff Enablement
- **Boundary note:** PRD-0001 owns destination states, validation meaning, and Handoff Eligibility.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F08 — Category and Domain Management

- **Entry status:** Active
- **Short scope label:** Admin management of Category hierarchy, Domain assignment, and retirement.
- **Behaviour owner reference:** `PRD-0006-platform.md` §9
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §10
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Representation
- **Boundary note:** Direct Offering-capability behaviour assigned by ADR-0007.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F09 — Attribute Definition Management

- **Entry status:** Active
- **Short scope label:** Admin management of Attribute definitions and mutation-safety rules.
- **Behaviour owner reference:** `PRD-0006-platform.md` §10
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §11
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Representation
- **Boundary note:** Direct Offering-capability behaviour assigned by ADR-0007.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F10 — Basic Analytics

- **Entry status:** Active
- **Short scope label:** Admin-facing bounded current-state and core-flow indicators.
- **Behaviour owner reference:** `PRD-0006-platform.md` §11
- **Applicable UX reference:** `UX-0006-admin-dashboard.md` §12
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Consumes Discovery, Presentation, Compare, Decision Chat, and Completion occurrences without redefining them.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F11 — Advertising Placement Settings

- **Entry status:** Active
- **Short scope label:** Where advertising may appear and whether it appears at all.
- **Behaviour owner reference:** `PRD-0006-platform.md` v2.3 §20, extended by **Frozen v2.5** §20.4 (master-switch coverage of the platform's own region; downward inheritance of a Category exclusion)
- **Applicable UX reference:** `UX-0006-admin-dashboard.md`; `UX-0003-offering-detail.md` §8.7
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** The platform owns placement and the master switch only. It sells, prices, moderates and reports nothing, and records no impression, click or revenue.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F12 — Listing Reports

- **Entry status:** Active
- **Short scope label:** A reader's report that something on one listing is wrong, and its review.
- **Behaviour owner reference:** `PRD-0006-platform.md` **Frozen v2.5 §21**. The section v1.1 recorded as Pending exists and is Frozen as of 2026-09-03, so `F12`'s Pending state is discharged and a Generated Story against it may now be Approved.
- **Applicable UX reference:** `UX-0006-admin-dashboard.md`; `UX-0003-offering-detail.md` §8.8
- **Capability relationship type:** No Capability Architecture required
- **Capability reference:** Not required under ADR-0007
- **Boundary note:** Distinct from `F02` General Moderation: anybody may open a report, it changes no target state, and accepting one records a judgement rather than performing an action.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

## 8. Identifier Examples

After this registry is Frozen, Generated Stories may use identifiers such as:

```text
US-PLT-F01-001
US-PLT-F02-001
```

The `[ID]` segment remains owned by the User Story Handbook rules.

## 9. Story Generation Gate

Current state:

```text
Registry status: Frozen v1.0
Feature entry status: Active
Generated Story allocation: Available
```

The gate is open because the registry completed:

```text
Architecture Review
→ Final Review
→ explicit Owner Approval
→ separate Owner Freeze
```

The applicable registry is now Frozen; its Active Feature IDs may be consumed by authoritative Generated Story identifiers.

## 10. Change Rules

A controlled revision is required for:

- allocating another Feature ID;
- correcting a canonical Feature name;
- changing a scope label;
- changing an authority or UX reference;
- changing a relationship classification;
- retiring a Feature.

No revision may silently renumber an ID already consumed by an authoritative Story.

## 11. Related Documents

- `ADR-0009-story-domain-feature-registry-ownership.md`
- `ADR-0007-domain-scope-of-capability-first-rule.md`
- `USER_STORY_HANDBOOK.md`
- `REPOSITORY_GOVERNANCE.md`
- `OFFERING_CAPABILITY_ARCHITECTURE.md`
- `PRD-0006-platform.md`
- `US-0006`

## 12. Readiness

The registry is ready for review when:

- every Feature is independently identifiable;
- no two entries duplicate the same bounded Feature concern;
- every entry has a behaviour-owner reference;
- every applicable UX reference is recorded;
- every Capability relationship follows ADR-0007 and ADR-0009;
- no entry defines behaviour or Epic placement;
- no Feature ID is missing or duplicated.

This document is Frozen v1.0 and must not be edited in place.
