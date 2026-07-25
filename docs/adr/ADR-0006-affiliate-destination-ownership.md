# ADR-0006 — Affiliate Destination Ownership

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-21
- **Deciders:** Product Owner / Architecture Owner
- **Accepted By:** Product Owner / Architecture Owner
- **Acceptance Date:** 2026-07-21
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `OWNER-DECISION-D03-AFFILIATE-DESTINATION-OWNERSHIP-2026-07-21.md`, `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md`, `OWNER-DECISION-D21-AFFILIATE-DESTINATION-ADMIN-ACTIONS-2026-07-21.md`, `CLAUDE_FOCUSED_ADR_DECISION_CONSISTENCY_REVIEW.md`, `V1_SCOPE.md`, `PRD-0001-offering.md`, `PRD-0004-decision.md`, `PRD-0005-business.md`, `PRD-0006-platform.md`, `OFFERING_CAPABILITY_ARCHITECTURE.md`, `ADR-0004-capability-architecture-layer-recognition.md`, `REPOSITORY_GOVERNANCE.md`, `ADR_PROCESS.md`, `REVIEW_PROCESS.md`, `docs/traceability.md`

> **Authority note.** ADR-0006 was explicitly accepted by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, independent Claude consistency review, and Final Review. This Accepted v1.0 record is authoritative from its acceptance date. Acceptance makes the durable ownership boundary authoritative but does not automatically modify any PRD, UX specification, User Story, traceability record, Frozen document, ADR index, or repository status document. All downstream applications remain separate controlled changes.

---

## 1. Context

Frozen `V1_SCOPE.md` includes affiliate links and requires affiliate hand-offs to function as part of the V1 decision journey.

The PRD package separates two different concerns:

1. **Affiliate Destination management**
   - defining the destination as product information;
   - associating it with an Offering;
   - allowing an authorized Business owner to create and edit it;
   - defining destination status and Affiliate Handoff eligibility;
   - allowing approved Admin review and control actions.

2. **Affiliate Handoff**
   - presenting an available handoff path to the person;
   - initiating the external handoff;
   - reaching platform-level Completion.

The user-facing Affiliate Handoff is already placed in `PRD-0004-decision.md`. However, the package previously had no authoritative owner for the Affiliate Destination that makes the handoff possible:

- `PRD-0004` disclaimed destination creation, editing, validation, enablement, disablement, and Offering association;
- `PRD-0005` disclaimed affiliate-destination management and kept it as an Open Question;
- `PRD-0006` kept administrative ownership as an Open Question;
- the Approved `PRD-0001` baseline did not define the concern.

The independent Cross-PRD Architecture Audit recorded this as **F-B02 — Affiliate-destination ownership vacuum**. Affiliate Handoff was conditional on an eligible destination, but no authoritative source could define or produce that result.

The Approved `PRD-0001` baseline also contains no existing final Offering Public Eligibility model or Affiliate Destination Handoff Eligibility model to extend. Owner Decision D-20 now assigns composition of final Offering Public Eligibility to `PRD-0001`, with the Business Public Exposure Input owned by `PRD-0005`. Owner Decision D-21 separately classifies Affiliate Destination review, validation, enablement, and disablement as a domain-specific administration action family rather than general moderation.

A durable Cross-PRD ownership boundary is therefore required.

---

## 2. Decision

### 2.1 Primary ownership

`PRD-0001-offering.md` is the Single Information Owner of Affiliate Destination configuration and Affiliate Destination Handoff Eligibility.

`PRD-0001` owns:

- the Affiliate Destination product definition;
- association of each Affiliate Destination with exactly one owned Offering;
- creation and editing of the destination as part of owned-Offering management;
- the destination status model;
- the product meaning of validation results;
- the product rules that determine Affiliate Destination Handoff Eligibility;
- the authoritative Affiliate Destination Handoff Eligibility result consumed by Decision and applied by Platform administration.

Each Affiliate Destination belongs to exactly one Offering. This ADR does not decide how many Affiliate Destinations one Offering may have; that cardinality remains a controlled `PRD-0001` product decision.

Under Owner Decision D-20, `PRD-0001` also owns composition of the separate **final Offering Public Eligibility** result. `PRD-0005-business.md` owns the Business Moderation Status and Business Public Exposure Input consumed by that composition.

Affiliate Handoff availability requires both authoritative results:

```text
final Offering Public Eligibility = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
```

`PRD-0002`, `PRD-0004`, and `PRD-0006` consume the final Offering Public Eligibility result from `PRD-0001` and do not recalculate it. `PRD-0004` consumes Affiliate Destination Handoff Eligibility from `PRD-0001` and does not redefine it.

The detailed destination fields, status values, validation criteria, cardinality, and eligibility rules are product requirements to be defined through the controlled `PRD-0001` revision. This ADR assigns ownership and does not define those details.
### 2.2 Decision ownership

`PRD-0004-decision.md` owns only the person-facing Affiliate Handoff and the resulting platform-level Completion behaviour.

`PRD-0004`:

- consumes the authoritative Affiliate Destination eligibility result from `PRD-0001`;
- offers Affiliate Handoff only when an eligible destination exists for the selected Offering;
- initiates the external Affiliate Handoff;
- owns Completion according to the authoritative Decision PRD rule;
- does not define, create, edit, validate, enable, disable, or associate Affiliate Destinations.

### 2.3 Business ownership boundary

`PRD-0005-business.md` owns the Business-side access boundary to Affiliate Destination management.

`PRD-0005`:

- allows an authorized Business context to reach the `PRD-0001`-owned management behaviour for an owned Offering through the Business Dashboard;
- enforces normal Business ownership or authorization before that management entry is available;
- does not redefine the Affiliate Destination model, status, Offering association, or eligibility rules;
- does not own Affiliate Handoff.

### 2.4 Platform ownership boundary

`PRD-0006-platform.md` owns the V1 Affiliate Destination Administration action surface and application of the approved actions defined by Owner Decision D-21.

The domain-specific Affiliate Destination Administration action family is:

- Review Affiliate Destination;
- Validate Affiliate Destination;
- Enable Affiliate Destination;
- Disable Affiliate Destination.

These four actions are not general moderation actions and do not extend the exhaustive seven-action general moderation set defined by D-15 / D-16.

`PRD-0006`:

- owns the review process and authorized Admin action surface;
- applies the selected administration action;
- does not invent Affiliate Destination states;
- does not define validation meaning or a separate eligibility model;
- treats the action names as administration actions, not as authority to define destination status values;
- applies only the status, validation, and Affiliate Destination Handoff Eligibility effects defined by `PRD-0001`;
- does not own the person-facing Affiliate Handoff or Completion.

`Review Affiliate Destination` changes no status or eligibility result by itself.

The exact results of Validate, Enable, and Disable are owned by `PRD-0001`. Enablement or disablement does not change Offering lifecycle state, final Offering Public Eligibility, Business Moderation Status, or User Account access status.
### 2.5 Capability and Feature boundary

This decision creates no new Capability, Feature, Feature ID, or Feature → Capability association.

The person-facing Affiliate Handoff remains within **Contact & Action**, whose behaviour is owned by `PRD-0004-decision.md` and whose access is governed by `PRD-0003-identity.md`.

This ADR does **not** decide the Capability home or Feature decomposition of:

- Affiliate Destination Handoff Eligibility;
- Affiliate Destination authoring;
- Affiliate Destination editing;
- Affiliate Destination administration.

No Capability placement is inferred merely from PRD ownership.

In particular, this ADR:

- does not place Affiliate Destination Handoff Eligibility in Visibility & Eligibility;
- does not broaden the accepted scope of `F01 — Offering Creation`;
- does not decide the capability home of `F02 — Offering Editing`, which remains Deferred / Not Yet Decided;
- does not allocate a new Feature;
- does not permit downstream UX or Stories to invent a Feature or association.

Before a Capability-mandated downstream document or Feature association is advanced for these concerns, the applicable Capability home must be resolved through the governed Capability Architecture and ADR process.

The controlled PRD and Story reconciliation must use the authoritative Frozen Offering Capability Architecture, Feature Registry, and Accepted ADRs. Assigning Affiliate Destination definition, Offering association, state, and eligibility ownership to `PRD-0001` does not transfer Affiliate Handoff behaviour away from `PRD-0004` and does not modify the Frozen Offering Capability Architecture.
### 2.6 Authority map

```text
PRD-0005 Business
  → Business Moderation Status
  → Business Public Exposure Input

PRD-0001 Offering
  → final Offering Public Eligibility composition
  → Affiliate Destination definition
  → association with one owned Offering
  → Business-managed creation and editing
  → destination status and validation meaning
  → Affiliate Destination Handoff Eligibility

PRD-0005 Business
  → authorized owner-facing management entry
  → consumes PRD-0001 behaviour by reference

PRD-0006 Platform
  → separate Affiliate Destination Administration action family
  → applies PRD-0001-owned status, validation, and eligibility effects

PRD-0004 Decision
  → consumes final Offering Public Eligibility
  → consumes Affiliate Destination Handoff Eligibility
  → person-facing Affiliate Handoff
  → Completion
```
---

## 3. Rationale

### 3.1 The eligibility result belongs with the Offering association

Affiliate Handoff availability depends on two separate authoritative results: final Offering Public Eligibility and Affiliate Destination Handoff Eligibility. `PRD-0001` owns composition of the former under D-20 and owns the destination-specific latter under D-03 and D-21.

Placing those product results in `PRD-0001` prevents Decision from owning the configuration and rules that merely enable its handoff behaviour. The Capability home of the destination-specific eligibility concern remains a separate governed architecture decision.

### 3.2 Business provides management context, not the product model

A Business owner must be able to manage Affiliate Destinations for owned Offerings. However, the Business Profile and Business Dashboard do not become the source of truth for an Offering-associated concept merely because they provide the owner-facing entry point.

This preserves the existing rule that Offering-management actions reached through the Business Dashboard remain Offering-owned.

### 3.3 Platform governs approved Admin actions, not the underlying model

Platform may need to review or control destination availability. That does not make Platform the owner of the Affiliate Destination definition, state model, or eligibility rule.

The split follows the target-owned-state principle: Platform owns the separate Affiliate Destination Administration action surface; the target's owning PRD owns the resulting product state, validation meaning, and eligibility effect. This action family remains distinct from general moderation under D-21.

### 3.4 Decision remains focused on the person-facing journey

`PRD-0004` remains responsible for the external handoff and Completion. It consumes an eligibility result instead of managing partner-entered configuration.

This keeps the Decision PRD implementation-neutral and prevents configuration, administration, and person-facing handoff from becoming one circular ownership area.

### 3.5 One authoritative ownership chain

The decision removes the previous circular deferral:

```text
Business Open Question
→ Platform Open Question
→ Decision Open Question
→ no owner
```

and replaces it with:

```text
PRD-0001 authoritative eligibility
→ PRD-0004 handoff consumption
```

with Business and Platform acting only within bounded access and administration roles.

---

## 4. Scope

This ADR governs only the durable ownership boundary for:

- Affiliate Destination product definition;
- Offering association;
- Business-owner management entry;
- destination status ownership;
- Affiliate Destination Handoff Eligibility ownership;
- final Offering Public Eligibility composition relationship to the Business Public Exposure Input;
- separation of Affiliate Destination Administration from general moderation;
- person-facing Affiliate Handoff consumption;
- approved Admin review and control boundaries.

It does not define:

- the exact Affiliate Destination fields;
- the exact destination statuses;
- the detailed eligibility criteria;
- the exact status and eligibility result of each approved Affiliate Destination Administration action;
- the Capability home of Affiliate Destination Handoff Eligibility, authoring, editing, or administration;
- Affiliate Handoff Guest access;
- Completion evidence;
- external-network integration;
- affiliate tracking;
- attribution;
- cookies;
- analytics instrumentation;
- commission calculation;
- commission settlement;
- payment;
- contract;
- API;
- database;
- storage;
- security implementation;
- frontend or backend implementation;
- external destination availability or correctness guarantees.

Those concerns remain with their owning product documents or outside the PRD layer.

---

## 5. Consequences

### 5.1 Positive consequences

- Affiliate Destination configuration and Affiliate Destination Handoff Eligibility have one authoritative product owner.
- Final Offering Public Eligibility composition is reconciled through D-20 without transferring Business-owned inputs.
- Affiliate Destination Administration is separated from general moderation through D-21.
- Affiliate Handoff no longer depends on an eligibility authority that does not exist.
- `PRD-0004` remains focused on the person-facing Decision journey.
- `PRD-0005` provides Business management access without duplicating the Offering model.
- `PRD-0006` may govern approved Admin actions without becoming the owner of Business-entered Offering data.
- The existing Contact & Action capability boundary is preserved.
- No new Capability, Feature, Feature ID, or Feature → Capability association is required.
- The V1 affiliate path becomes traceable from configuration through handoff and Completion.

### 5.2 Costs and risks

- `PRD-0001` requires a substantive controlled revision to introduce the previously missing product concern.
- Four PRDs and their downstream UX and Stories require reconciliation.
- The exact status, validation, and Affiliate Destination Handoff Eligibility model must be defined carefully so that Business and Admin actions do not create conflicting state machines.
- The Capability home of destination-specific eligibility and administration remains unresolved and requires separate governed treatment before affected downstream Feature work advances.
- Platform review actions may be incorrectly implemented as Platform-owned destination states unless the PRD boundary is explicit.
- Business Dashboard UX may accidentally redefine Offering behaviour rather than link to it.
- External affiliate implementation concerns may be mistakenly pulled into the PRD or ADR layer.

### 5.3 Safeguards

- `PRD-0001` remains the only owner of destination state, validation meaning, and Affiliate Destination Handoff Eligibility.
- `PRD-0001` owns final Offering Public Eligibility composition while `PRD-0005` owns only the Business Public Exposure Input.
- D-21 keeps Affiliate Destination Administration separate from general moderation.
- `PRD-0004` consumes eligibility and owns only handoff and Completion.
- `PRD-0005` owns management access, not the destination model.
- `PRD-0006` owns approved Admin actions, not a competing state model.
- No downstream document may invent additional ownership.
- No technical affiliate-network or tracking behaviour is authorized by this ADR.
- No document is modified automatically by ADR acceptance.

---

## 6. Alternatives Considered

### Alternative A — PRD-0004 owns configuration and Affiliate Handoff

This would place destination definition, Business editing, Admin control, user-facing handoff, and Completion in the Decision PRD.

It would conflate the product state that enables a decision action with the action itself and would make Decision responsible for Business-managed Offering configuration. **Not proposed.**

### Alternative B — PRD-0005 owns the complete Affiliate Destination model

This would align management with the Business Dashboard, but it would make Business Profile behaviour the source of truth for a destination associated with one Offering.

It would also weaken the existing boundary that Offering-management behaviour remains Offering-owned even when reached from the Business Dashboard. **Not proposed.**

### Alternative C — PRD-0006 owns the complete Affiliate Destination model

This would centralize validation and control but would incorrectly make Platform administration the owner of partner-entered Offering data and handoff eligibility.

It would risk turning post-creation administration into the primary product model. **Not proposed.**

### Alternative D — Split ownership by product concern

- `PRD-0001` owns definition, association, status, and eligibility;
- `PRD-0005` owns Business management entry;
- `PRD-0006` owns approved Admin actions;
- `PRD-0004` owns handoff and Completion.

This preserves Single Information Owner while respecting the existing boundaries of all four PRDs. **Proposed decision.**

### Alternative E — Leave destination configuration outside V1

Frozen V1 includes affiliate links and requires affiliate hand-offs to function. Leaving the enabling destination concern unowned would preserve an unexecutable V1 path. **Not proposed.**

---

## 7. Required Follow-ups if Accepted

All follow-ups are separate controlled changes.

1. **`PRD-0001-offering.md`**
   - create the controlled superseding candidate;
   - introduce the final Offering Public Eligibility model because the current Approved baseline has no such model;
   - consume the `PRD-0005` Business Public Exposure Input under D-20;
   - add Affiliate Destination to Scope and Core Concepts;
   - define Offering association, owner management, destination state, validation meaning, and Affiliate Destination Handoff Eligibility;
   - define the target-owned results of Validate, Enable, and Disable under D-21;
   - define the authority boundary between Business-owner actions and Platform administration;
   - expose the two authoritative eligibility results consumed by Decision.

2. **`PRD-0004-decision.md`**
   - replace the missing-authority condition with a reference to `PRD-0001`;
   - remove the Affiliate Destination ownership Open Question;
   - preserve Affiliate Handoff and Completion ownership;
   - consume only eligible destinations.

3. **`PRD-0005-business.md`**
   - add the Business Dashboard entry to `PRD-0001`-owned Affiliate Destination management;
   - enforce owned-Business and owned-Offering authorization;
   - remove the Affiliate Destination ownership Open Question;
   - avoid redefining destination state or eligibility.

4. **`PRD-0006-platform.md`**
   - preserve the exhaustive seven-action general moderation set defined by D-15 / D-16;
   - define the separate four-action Affiliate Destination Administration family under D-21;
   - consume `PRD-0001` status, validation, and Affiliate Destination Handoff Eligibility effects;
   - remove the Affiliate Destination ownership Open Question;
   - prevent a competing Platform-owned state model.

5. **Capability Architecture and Feature Registry**
   - no Capability, Feature, Feature ID, or Feature → Capability association is created by this ADR;
   - Affiliate Handoff remains Contact & Action;
   - the Capability home of Affiliate Destination Handoff Eligibility, authoring, editing, and administration remains undecided by ADR-0006;
   - controlled PRD and Story work must use the authoritative Feature Registry;
   - the work must not broaden F01 or resolve F02 by implication;
   - any genuinely new or changed Capability placement or Feature → Capability association requires a separate governed decision;
   - the Frozen Offering Capability Architecture must not be edited in place because of this ADR.

6. **UX and User Stories**
   - affected Offering management, Business Dashboard, Admin, Offering Detail, and Decision documents become Review Needed after the owning PRDs change;
   - no UX or Story is modified automatically.

7. **`docs/traceability.md`**
   - after acceptance and PRD reconciliation, record:
     - `ADR-0006 → PRD-0001` ownership;
     - `PRD-0001 → PRD-0005` management-entry consumption;
     - `PRD-0001 → PRD-0006` administration-outcome consumption;
     - `PRD-0001 → PRD-0004` eligibility consumption;
     - `PRD-0004 → Affiliate Handoff → Completion`.

8. **`docs/adr/README.md`**
   - add ADR-0006 to the authoritative ADR index only after explicit acceptance as v1.0.

9. **Repository status documents**
   - update `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, and `CHANGELOG.md` only through their applicable controlled maintenance process.

No follow-up is performed by this Proposed ADR.

---

## 8. References

- `OWNER-DECISION-D03-AFFILIATE-DESTINATION-OWNERSHIP-2026-07-21.md` — explicit Owner direction requiring this ADR.
- `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md` — final Offering Public Eligibility composition and Business Public Exposure Input boundary.
- `OWNER-DECISION-D21-AFFILIATE-DESTINATION-ADMIN-ACTIONS-2026-07-21.md` — separation of Affiliate Destination Administration from general moderation.
- `CLAUDE_FOCUSED_ADR_DECISION_CONSISTENCY_REVIEW.md` — independent review findings M-01, M-02, M-03, MIN-01, and MIN-02 applied in v0.3.
- `CLAUDE_CROSS_PRD_ARCHITECTURE_AUDIT.md` — F-B02 ownership-vacuum finding and ADR assessment.
- `V1_SCOPE.md` — affiliate links and affiliate hand-off in the V1 scope and success criteria.
- `PRD-0001-offering.md` — future Single Information Owner of Affiliate Destination definition, association, state, and eligibility.
- `PRD-0004-decision.md` — owner of Affiliate Handoff and Completion.
- `PRD-0005-business.md` — owner of the Business context and Business Dashboard management-entry boundary.
- `PRD-0006-platform.md` — owner of Platform administration and approved Admin actions.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — existing Contact & Action boundary, Feature Registry, and Capability governance; unchanged by this Accepted ADR. This ADR does not allocate destination-specific eligibility to a Capability.
- `ADR-0004-capability-architecture-layer-recognition.md` — Accepted recognition and authority of the Capability Architecture layer.
- `REPOSITORY_GOVERNANCE.md` — authority and Single Information Owner principles.
- `ADR_PROCESS.md` — ADR lifecycle, numbering, review, and acceptance.
- `REVIEW_PROCESS.md` — Architecture Review and Final Review mechanics.
- `DOCUMENT_LIFECYCLE.md` — controlled revision rules for affected non-ADR documents.
- `docs/traceability.md` — governed relationship recording after acceptance and reconciliation.
- `docs/adr/README.md` — authoritative ADR index after acceptance.

---

**Revision Note (1.0):** Accepted by the Product Owner / Architecture Owner on 2026-07-21 after Final Review verdict `PASS — READY FOR OWNER ACCEPTANCE`. Establishes the authoritative Cross-PRD ownership boundary for Affiliate Destination configuration, final Offering Public Eligibility composition input relationships, Affiliate Destination Handoff Eligibility, Business management entry, Platform administration actions, person-facing Affiliate Handoff, and Completion. Creates no Capability, Feature, Feature ID, or Feature → Capability association; decides no Capability home for Affiliate Destination Handoff Eligibility, authoring, editing, or administration; changes no Frozen document; and performs no downstream PRD, UX, Story, traceability, index, or repository-status update automatically.

**Revision Note (0.3):** Independent Claude focused-review correction revision. Applies Owner Decisions D-20 and D-21; separates final Offering Public Eligibility composition from Affiliate Destination Handoff Eligibility; assigns the Business Public Exposure Input to PRD-0005 and final composition to PRD-0001; establishes Affiliate Destination Administration as a four-action domain-specific family distinct from the exhaustive general moderation action set; removes the unsupported Visibility & Eligibility placement; records that the Capability home and Feature decomposition of destination-specific eligibility, authoring, editing, and administration are not decided by ADR-0006; replaces Proposed ADR-0007-dependent vocabulary; and records that the current Approved PRD-0001 baseline has no existing eligibility model to extend. Status remains Proposed and the ownership decision remains unchanged.

**Revision Note (0.2):** Architecture Review correction revision. Clarifies that Affiliate Handoff remains Contact & Action, Affiliate Destination eligibility participates in Visibility & Eligibility, and Affiliate Destination authoring/ editing receives no new Feature or Feature → Capability association through this ADR. Protects the Accepted `F01 → Creation` boundary and preserves F02 as Deferred / Not Yet Decided; states that each destination belongs to one Offering while the number of destinations per Offering remains a PRD-0001 decision; clarifies that Platform action names do not define destination status values; and adds Accepted ADR-0004 as the authority recognizing the Capability Architecture layer. The ownership decision is unchanged. Status remains Proposed.

**Revision Note (0.1):** Initial Proposed draft. Records the Product Owner / Architecture Owner's explicit D-03 direction as a durable Cross-PRD ownership boundary: `PRD-0001` owns Affiliate Destination definition, Offering association, state, and Affiliate Handoff eligibility; `PRD-0005` owns the authorized Business-management entry; `PRD-0006` owns approved Admin review and control actions while consuming `PRD-0001` effects; and `PRD-0004` consumes an eligible destination and owns the person-facing Affiliate Handoff and Completion. Creates no new Capability, Feature, Feature ID, or Feature → Capability association; changes no Frozen document; defines no technical affiliate integration, tracking, attribution, commission, payment, API, database, or infrastructure behaviour; and modifies no repository document automatically. This record is Accepted v1.0 and authoritative from 2026-07-21.
