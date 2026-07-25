# Decision Story Domain Feature Registry

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Date:** 2026-07-22
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Approved candidate:** In Review v0.3
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Decision
- **Domain Code:** DEC
- **Parent Story Document:** US-0004
- **Authority:** `ADR-0009-story-domain-feature-registry-ownership.md`
- **Generated Story allocation:** Available from Frozen v1.0 Feature IDs
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Feature Registry baseline for Story Domain `DEC`. Its Active Feature IDs may now be consumed by authoritative Generated Story identifiers under the Frozen User Story Handbook. This exact registry must not be edited in place. Future Feature ID allocation, retirement, canonical-name correction, authority-reference change, or relationship-classification change requires a controlled revision. This Freeze creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.3 candidate becomes the authoritative Approved v1.0 Feature Registry baseline under the first-approval versioning rule. All registry Feature entry statuses become Active. This historical Approval Note records that approval and Freeze were separate decisions. The registry was subsequently Frozen on 2026-07-22, making its Active Feature IDs available for authoritative Generated Story allocation. This approval creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Revision Note (0.3):** Clerical Freeze-preparation correction after the independent focused delta audit. Updates the §9 current-state snapshot from `In Review v0.1` to `In Review v0.3` so the document carries no stale version label. No Feature ID, Feature name, order, scope label, authority reference, UX reference, Capability relationship, entry status, Story-generation rule, or architecture decision changes.

**Revision Note (0.2):** Focused independent-audit correction for A-01 and A-02 only. Reclassifies `F02 — Decision Context` to one existing Capability (`Decision Support`), `F04 — Explicit Offering Selection` to one existing Capability (`Contact & Action`), and `F07 — Decision Completion` to the direct Frozen `Contact & Action` assignment. Feature IDs, canonical Feature names, Feature order, scope labels, behaviour-owner references, UX references, Story-generation gate, and all other registry entries remain unchanged. No Capability, Capability Map, PRD/UX behaviour, Epic placement, Story content, or implementation is created.

**Creation Note (0.1):** Initial controlled Feature-ID allocation proposal for Story Domain `DEC`, authorized by Accepted `ADR-0009-story-domain-feature-registry-ownership.md`. All Feature entries are Active, but they cannot be consumed by authoritative Generated Story IDs until this registry is Frozen. No Capability, Capability Map, PRD/UX behaviour, Epic placement, Story content, or implementation is created.

**Review Entry Note (0.2):** The registry remains In Review and non-authoritative. Only the bounded Capability relationship classifications and boundary notes for F02, F04, and F07 changed to close the independent audit findings. All Feature entries are Active.

> This document is the Single Information Owner for `DEC` Feature IDs and bounded Feature identity metadata. It is not a Capability Architecture document and defines no product behaviour, UX behaviour, Epic placement, Story content, or implementation.

---

## 1. Purpose

Provide stable, domain-local Feature identities that may later be consumed by Generated User Story identifiers for the Decision Story Domain.

## 2. Scope

This registry owns only:

- Feature ID allocation within `DEC`;
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

1. Feature IDs are unique within Story Domain `DEC`.
2. The complete Story identifier remains globally unambiguous through the Domain code.
3. Feature IDs are never allocated by Parent Story Documents or Generated Stories.
4. Active entries in this Frozen registry are authoritative for Story ID allocation.
5. A Feature ID is available for authoritative Generated Story use because this registry is Approved and Frozen.
6. Feature IDs are never recycled after authoritative use.
7. A Frozen registry is never edited in place.
8. Behaviour remains owned by `PRD-0004-decision.md`.
9. UX behaviour remains owned by the referenced Frozen UX documents.
10. Capability names and boundaries are referenced, never redefined.

## 5. Relationship Classification Vocabulary

This registry uses only:

- **Direct Frozen assignment** — the governing Accepted ADR or Frozen Capability Map directly assigns the behaviour to an existing Offering Capability.
- **Supporting relationship** — the domain Feature supports or governs access/action around an existing Capability-owned flow without becoming its behaviour owner.
- **No Capability Architecture required** — own-domain V1 behaviour follows the direct ADR-0007 authority chain.

Relationship classification is descriptive by reference and does not create a Feature → Capability decision beyond the cited authority.

## 6. Authoritative Feature Registry

| Feature ID | Canonical Feature Name | Entry Status | Short Scope Label | Behaviour Owner Reference | Applicable UX Reference | Relationship Type | Capability Reference | Notes |
|---|---|---|---|---|---|---|---|---|
| F01 | Comparison Set and Compare | Active | Optional comparison of two to five eligible same-leaf Offerings. | `PRD-0004-decision.md` §§5.2–5.4, 6 | `UX-0004-compare.md` | Direct Frozen assignment | Decision Analysis | Includes authoritative values, Not provided, explicit replacement, and invalid-member handling by reference. |
| F02 | Decision Context | Active | Current single-Offering or valid Comparison-Set context used by the Decision flow. | `PRD-0004-decision.md` §5.5 | `UX-0009-decision-flow.md` §6 | Direct Frozen assignment | Decision Support | Bounded input to Decision Chat; Compare remains F01 / Decision Analysis, while selection and handoff remain F04–F07 / Contact & Action. |
| F03 | Decision Chat | Active | Public assistive communication within the current Decision Context. | `PRD-0004-decision.md` §§5.6, 7 | `UX-0009-decision-flow.md` §7 | Direct Frozen assignment | Decision Support | Assistive only; does not select, decide, or act. |
| F04 | Explicit Offering Selection | Active | Person-controlled selection of one current eligible Offering before handoff. | `PRD-0004-decision.md` §§5.7, 8 | `UX-0009-decision-flow.md` §8 | Direct Frozen assignment | Contact & Action | Person-controlled prerequisite to the handoff stage; Decision Chat never selects or acts. |
| F05 | Affiliate Handoff | Active | Public external Affiliate handoff for an eligible Selected Offering. | `PRD-0004-decision.md` §9 | `UX-0009-decision-flow.md` §10 | Direct Frozen assignment | Contact & Action | Consumes destination eligibility owned by PRD-0001. |
| F06 | Direct Contact | Active | Authenticated person-facing access to one approved external contact channel. | `PRD-0004-decision.md` §10 | `UX-0009-decision-flow.md` §11; `UX-0008-authentication.md` §10 | Direct Frozen assignment | Contact & Action | Creates no Messaging, inbox, conversation, reply, or delivery state. |
| F07 | Decision Completion | Active | Separate in-scope Completion for Affiliate Handoff and Direct Contact. | `PRD-0004-decision.md` §§5.10, 11 | `UX-0009-decision-flow.md` §12 | Direct Frozen assignment | Contact & Action | Completion is directly owned with Affiliate Handoff and Direct Contact and does not claim external success. |

## 7. Feature Entry Records

### F01 — Comparison Set and Compare

- **Entry status:** Active
- **Short scope label:** Optional comparison of two to five eligible same-leaf Offerings.
- **Behaviour owner reference:** `PRD-0004-decision.md` §§5.2–5.4, 6
- **Applicable UX reference:** `UX-0004-compare.md`
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Decision Analysis
- **Boundary note:** Includes authoritative values, Not provided, explicit replacement, and invalid-member handling by reference.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F02 — Decision Context

- **Entry status:** Active
- **Short scope label:** Current single-Offering or valid Comparison-Set context used by the Decision flow.
- **Behaviour owner reference:** `PRD-0004-decision.md` §5.5
- **Applicable UX reference:** `UX-0009-decision-flow.md` §6
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Decision Support
- **Boundary note:** Decision Context is the bounded input to Decision Chat. Compare remains F01 under Decision Analysis; explicit selection, handoff, and Completion remain F04–F07 under Contact & Action.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F03 — Decision Chat

- **Entry status:** Active
- **Short scope label:** Public assistive communication within the current Decision Context.
- **Behaviour owner reference:** `PRD-0004-decision.md` §§5.6, 7
- **Applicable UX reference:** `UX-0009-decision-flow.md` §7
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Decision Support
- **Boundary note:** Assistive only; does not select, decide, or act.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F04 — Explicit Offering Selection

- **Entry status:** Active
- **Short scope label:** Person-controlled selection of one current eligible Offering before handoff.
- **Behaviour owner reference:** `PRD-0004-decision.md` §§5.7, 8
- **Applicable UX reference:** `UX-0009-decision-flow.md` §8
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Contact & Action
- **Boundary note:** Explicit selection is the person-controlled prerequisite to the handoff stage. Decision Chat never selects, initiates a handoff, or acts for the person.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F05 — Affiliate Handoff

- **Entry status:** Active
- **Short scope label:** Public external Affiliate handoff for an eligible Selected Offering.
- **Behaviour owner reference:** `PRD-0004-decision.md` §9
- **Applicable UX reference:** `UX-0009-decision-flow.md` §10
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Contact & Action
- **Boundary note:** Consumes destination eligibility owned by PRD-0001.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F06 — Direct Contact

- **Entry status:** Active
- **Short scope label:** Authenticated person-facing access to one approved external contact channel.
- **Behaviour owner reference:** `PRD-0004-decision.md` §10
- **Applicable UX reference:** `UX-0009-decision-flow.md` §11; `UX-0008-authentication.md` §10
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Contact & Action
- **Boundary note:** Creates no Messaging, inbox, conversation, reply, or delivery state.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F07 — Decision Completion

- **Entry status:** Active
- **Short scope label:** Separate in-scope Completion for Affiliate Handoff and Direct Contact.
- **Behaviour owner reference:** `PRD-0004-decision.md` §§5.10, 11
- **Applicable UX reference:** `UX-0009-decision-flow.md` §12
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Contact & Action
- **Boundary note:** Contact & Action directly owns person-facing Affiliate Handoff, Direct Contact, and Completion. Completion ends the platform journey and does not claim external success.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.


## 8. Identifier Examples

After this registry is Frozen, Generated Stories may use identifiers such as:

```text
US-DEC-F01-001
US-DEC-F02-001
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
- `PRD-0004-decision.md`
- `US-0004`

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
