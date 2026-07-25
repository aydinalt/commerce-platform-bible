# US-0004 — Decision User Stories

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-25
- **Approval Date:** 2026-07-25
- **Approved By:** Product Owner / Architecture Owner
- **Approved Candidate:** In Review v0.2
- **Freeze State:** Frozen
- **Freeze Date:** 2026-07-25
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Decision
- **Domain Code:** `DEC`
- **Feature Registry Owner:** Frozen `DECISION_FEATURE_REGISTRY.md` v1.0
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Decision Parent Story Document baseline. This exact file must not be edited in place. Future Epic placement, Feature placement, relationship classification, Capability reference, Generated Story inventory, UX reference, or scope changes require a controlled revision. This Freeze changes no Generated Story Delivery Status, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not alter Affiliate Handoff, Direct Contact, or Completion boundaries, and does not update GitHub automatically.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Decision Parent Story Document baseline. This approval does not Freeze the document, does not change any Generated Story Delivery Status, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not change Affiliate Handoff, Direct Contact, or Completion boundaries, and does not update GitHub automatically.

**Revision Note (0.2):** Controlled replacement of documented Draft v0.1 embedded-Story content with the Frozen Handbook Parent → Epic → Feature architecture. Consumes authoritative DEC F01–F07, removes embedded `US-NNNN.n` Story ownership, establishes four bounded Epics, and records seven first Generated Story candidates by reference. It changes no Feature ID, canonical Feature name, relationship classification, Capability, PRD behaviour, UX behaviour, implementation, approval, Freeze, or GitHub file.

**Review Entry Note (0.2):** The exact Draft v0.2 candidate entered formal review on 2026-07-25. No Feature ID, canonical Feature name, Epic placement, Story identifier, PRD/UX behaviour, relationship classification, Capability reference, approval, Freeze, or GitHub state changed during review entry.

> This Parent Story Document owns Decision Epic → Feature placement and records Generated Story files by reference. It does not own Feature IDs, relationship classifications, Capability references, product behaviour, UX behaviour, Generated Story content, or implementation.

---

## 1. Purpose

Organize the Decision Story Domain into bounded Epics and authoritative Features F01–F07 so every Generated Decision Story has exactly one Parent, one Epic, and one Feature.

## 2. Scope

This Parent owns:

- Decision Epic names and bounded outcomes;
- Feature placement under exactly one Epic;
- by-reference Generated Story inventory;
- Decision package coverage and reconciliation state.

## 3. Out of Scope

This Parent does not own or redefine:

- Feature IDs, canonical names, short scope labels, references, or relationship classifications — Frozen `DECISION_FEATURE_REGISTRY.md`;
- Capability names or boundaries — Frozen Capability Architecture and Accepted ADRs;
- product behaviour — Frozen `PRD-0004-decision.md`;
- experience behaviour — Frozen `UX-0004-compare.md` and `UX-0009-decision-flow.md`;
- Generated Story Acceptance Criteria, BDD, dependencies, size, scope, lifecycle, or complete content;
- implementation, technical architecture, delivery sequencing, or Sprint planning.

## 4. Epic Map

| Epic | Bounded Outcome | Features |
|---|---|---|
| Comparison and Decision Context | A person optionally compares compatible Offerings and enters one bounded current Decision Context. | F01, F02 |
| Assistive Decision and Selection | Public assistive Chat supports understanding while the person retains explicit control of one Selected Offering. | F03, F04 |
| Handoff Execution | The person explicitly initiates an eligible public Affiliate Handoff or authenticated Direct Contact path. | F05, F06 |
| Completion and Journey End | The platform produces the correct bounded Completion result without claiming external success. | F07 |

## 5. Feature Map

| Feature ID | Canonical Feature | Epic | Relationship Classification | Capability Reference | Behaviour Owner | Primary Experience |
|---|---|---|---|---|---|---|
| F01 | Comparison Set and Compare | Comparison and Decision Context | Direct Frozen assignment | Decision Analysis | `PRD-0004-decision.md` | `UX-0004-compare.md` |
| F02 | Decision Context | Comparison and Decision Context | Direct Frozen assignment | Decision Support | `PRD-0004-decision.md` | `UX-0009-decision-flow.md` §6 |
| F03 | Decision Chat | Assistive Decision and Selection | Direct Frozen assignment | Decision Support | `PRD-0004-decision.md` | `UX-0009-decision-flow.md` §7 |
| F04 | Explicit Offering Selection | Assistive Decision and Selection | Direct Frozen assignment | Contact & Action | `PRD-0004-decision.md` | `UX-0009-decision-flow.md` §8 |
| F05 | Affiliate Handoff | Handoff Execution | Direct Frozen assignment | Contact & Action | `PRD-0004-decision.md` | `UX-0009-decision-flow.md` §10 |
| F06 | Direct Contact | Handoff Execution | Direct Frozen assignment | Contact & Action | `PRD-0004-decision.md` | `UX-0009-decision-flow.md` §11; `UX-0008-authentication.md` §10 |
| F07 | Decision Completion | Completion and Journey End | Direct Frozen assignment | Contact & Action | `PRD-0004-decision.md` | `UX-0009-decision-flow.md` §12 |

## 6. Generated Story Inventory

| Feature | Generated Story | Candidate State |
|---|---|---|
| F01 | `US-DEC-F01-001` — Comparison Set and Compare | In Review v0.1 |
| F02 | `US-DEC-F02-001` — Decision Context | In Review v0.1 |
| F03 | `US-DEC-F03-001` — Decision Chat | In Review v0.1 |
| F04 | `US-DEC-F04-001` — Explicit Offering Selection | In Review v0.1 |
| F05 | `US-DEC-F05-001` — Affiliate Handoff | In Review v0.1 |
| F06 | `US-DEC-F06-001` — Direct Contact | In Review v0.1 |
| F07 | `US-DEC-F07-001` — Decision Completion | In Review v0.1 |

The candidate-state column is informative and by reference. This Parent advances no Generated Story lifecycle state.

## 7. Coverage and Readiness

| Check | Result |
|---|---|
| Authoritative F01–F07 consumed exactly | PASS |
| Every Feature placed under exactly one Epic | PASS |
| Seven first Generated Story candidates exist | PASS |
| Embedded legacy Stories removed | PASS |
| Parent embeds no Acceptance Criteria or BDD | PASS |
| Relationship classifications and Capability references match the Frozen Registry | PASS |
| Compare remains optional | PASS |
| Decision Chat remains public and assistive | PASS |
| Selection remains explicit and person-controlled | PASS |
| Affiliate Handoff remains public | PASS |
| Direct Contact remains authenticated-only and creates no Messaging | PASS |
| Completion remains separate and claims no external success | PASS |
| No Favorites, Messaging, persistent personal Decision history, or autonomous selection | PASS |
| GitHub unchanged | PASS |

## 8. Reconciliation Boundary

This Frozen baseline does not:

- permit direct in-place modification;
- approve or Freeze any Generated Story;
- revise the Frozen Feature Registry;
- create a Feature or Capability;
- broaden PRD or UX scope;
- start implementation;
- update traceability, repository indexes, changelog, or GitHub automatically.

## 9. References

- `DECISION_FEATURE_REGISTRY.md` — F01–F07 identity, references, and Capability relationships.
- `PRD-0004-decision.md` — Decision behaviour and Completion meaning.
- `UX-0004-compare.md` — Compare experience.
- `UX-0009-decision-flow.md` — Decision Context, Chat, selection, handoff, and Completion experience.
- `UX-0008-authentication.md` — exact Direct Contact authentication return.
- `PRD-0001-offering.md`, `PRD-0003-identity.md`, `PRD-0005-business.md`, `PRD-0006-platform.md` — supporting authoritative inputs.
- `ADR-0007`, `ADR-0008`, `ADR-0009`.
- Owner Decisions D01/D02, D04, D05, D17, and D23.
- `USER_STORY_HANDBOOK.md`, `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`.
