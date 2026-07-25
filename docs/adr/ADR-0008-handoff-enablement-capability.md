# ADR-0008 — Handoff Enablement Capability

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-21
- **Deciders:** Product Owner / Architecture Owner
- **Accepted By:** Product Owner / Architecture Owner
- **Acceptance Date:** 2026-07-21
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `OWNER-DECISION-D23-HANDOFF-ENABLEMENT-CAPABILITY-2026-07-21.md`, `ADR-NUMBER-RESERVATION-ADR-0008-2026-07-21.md`, `ADR-0004-capability-architecture-layer-recognition.md`, `ADR-0006-affiliate-destination-ownership.md`, `ADR-0007-domain-scope-of-capability-first-rule.md`, `OFFERING_CAPABILITY_ARCHITECTURE.md`, `V1_SCOPE.md`, `PRD-0001-offering.md`, `PRD-0004-decision.md`, `PRD-0005-business.md`, `PRD-0006-platform.md`, `OWNER-DECISION-D04-DIRECT-CONTACT-MODEL-2026-07-21.md`, `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md`, `OWNER-DECISION-D21-AFFILIATE-DESTINATION-ADMIN-ACTIONS-2026-07-21.md`

> **Authority note.** ADR-0008 was explicitly accepted by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review. This Accepted v1.0 record is authoritative from its acceptance date. Acceptance authorizes the Handoff Enablement Capability and its durable boundaries but does not allocate Feature IDs, create Feature → Capability associations, modify the Frozen Offering Capability Architecture in place, revise any PRD, UX specification, User Story, traceability record, ADR index, repository status document, or GitHub repository automatically.

---

## 1. Context

Accepted `ADR-0006` assigns authoritative product ownership for Affiliate Destination configuration, status, validation meaning, Affiliate Destination Handoff Eligibility, Business management entry, Platform administration actions, person-facing Affiliate Handoff, and Completion.

ADR-0006 deliberately leaves the Capability home and Feature decomposition of Affiliate Destination Handoff Eligibility, authoring, editing, and administration undecided.

Accepted `ADR-0007` requires Offering-domain behaviour and governed Offering relationships to trace through the Offering Capability Architecture.

Each Affiliate Destination belongs to exactly one Offering. Its configuration, target state, validation meaning, and eligibility result are therefore Offering-domain behaviour.

The Frozen Offering Capability Architecture contains no existing Capability whose concern lawfully owns this enabling product state:

- **Creation** governs an Offering coming into existence;
- **Representation** governs Offering descriptors;
- **Presentation** governs presentation of a complete Offering;
- **Lifecycle** governs Offering state;
- **Visibility & Eligibility** governs whether and where an Offering appears;
- **Contact & Action** governs the person-facing act and reaching the Business.

Placing the concern in any of those Capabilities would broaden or blur an existing boundary. Splitting it across several Capabilities would fragment one bounded concern and risk prejudging F02.

Owner Decision D-23 therefore authorizes a new Capability subject to this ADR process.

---

## 2. Decision

### 2.1 Introduce Handoff Enablement

Introduce **Handoff Enablement** as an Offering Capability.

Its single architectural concern is:

> The capability by which an Offering is equipped with and governed through an Offering-associated external destination that may become eligible for a later person-facing handoff.

The destination's mandatory association with exactly one Offering is the domain discriminator.

### 2.2 Capability behaviour ownership

`PRD-0001-offering.md` is the sole behaviour owner within Handoff Enablement.

The Capability contains the architectural concern represented by these `PRD-0001` behaviours:

- Affiliate Destination definition;
- association with exactly one Offering;
- Business-managed Affiliate Destination authoring;
- Business-managed Affiliate Destination editing;
- destination status;
- validation meaning;
- Affiliate Destination Handoff Eligibility.

This ADR does not define the detailed product fields, state values, validation criteria, or eligibility rules. Those remain controlled PRD-0001 requirements.

### 2.3 Business supporting relationship

`PRD-0005-business.md` provides an `ADR-0007` §2.4B supporting relationship:

- authorized Business-management entry to PRD-0001-owned behaviour.

`PRD-0005`:

- does not become the Handoff Enablement Capability owner;
- does not redefine the Affiliate Destination model;
- does not own destination status, validation meaning, or Affiliate Destination Handoff Eligibility.

### 2.4 Platform supporting relationship

`PRD-0006-platform.md` provides an `ADR-0007` §2.4B supporting relationship through the approved Affiliate Destination Administration action surface:

- Review Affiliate Destination;
- Validate Affiliate Destination;
- Enable Affiliate Destination;
- Disable Affiliate Destination.

`PRD-0006`:

- does not become the Handoff Enablement Capability owner;
- invents no destination status;
- invents no validation meaning;
- invents no eligibility rule;
- applies only the outcomes defined by PRD-0001.

The Capability name **Handoff Enablement** does not redefine the D-21 action **Enable Affiliate Destination**. The former is an architectural concern; the latter is one Platform administration action.

### 2.5 Contact & Action consumption boundary

The person-facing Affiliate Handoff and Completion remain within **Contact & Action** and remain owned by `PRD-0004-decision.md`.

Handoff Enablement supplies the authoritative Affiliate Destination Handoff Eligibility result to Contact & Action through a bounded consumption relationship.

Handoff Enablement does not:

- display or offer a handoff;
- initiate the external handoff;
- record or produce Completion.

### 2.6 Direct Contact exclusion

Handoff Enablement applies only to Offering-associated external destinations.

It does not own:

- Direct Contact enablement;
- telephone numbers;
- email addresses;
- external contact URLs;
- Business contact-information authoring.

Those concerns remain outside this Capability under D-04 and the applicable Business and Decision boundaries.

### 2.7 Eligibility boundary

Final Offering Public Eligibility and Affiliate Destination Handoff Eligibility remain separate authoritative results owned by `PRD-0001`.

Affiliate Destination Handoff Eligibility is not an input to final Offering Public Eligibility composition.

Affiliate Handoff availability consumes both results:

```text
final Offering Public Eligibility = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
```

The two results are conjoined only at handoff availability.

### 2.8 F01 and F02 safeguards

Affiliate Destination authoring and editing act on the Affiliate Destination as a distinct object associated with an Offering.

They are not instances of:

- `F01 — Offering Creation`;
- `F02 — Offering Editing`.

This decision:

- does not broaden the accepted F01 boundary;
- does not decide or prejudge F02;
- preserves F02 as Deferred / Not Yet Decided.

### 2.9 Capability boundary map

```text
Handoff Enablement
  behaviour owner:
    PRD-0001
      → Affiliate Destination definition
      → one-Offering association
      → destination authoring and editing
      → destination status
      → validation meaning
      → Affiliate Destination Handoff Eligibility

  supporting relationships:
    PRD-0005
      → authorized Business-management entry

    PRD-0006
      → Review / Validate / Enable / Disable action surface
      → applies PRD-0001-owned outcomes

  bounded consumer:
    Contact & Action / PRD-0004
      → consumes Affiliate Destination Handoff Eligibility
      → owns person-facing Affiliate Handoff
      → owns Completion
```

---

## 3. Rationale

### 3.1 Existing Capabilities do not own the concern

The concern is not Offering creation, description, presentation, appearance, lifecycle, discovery, analysis, decision support, or the person-facing act.

A new Capability is required to preserve the independence and one-concern rules of the Offering Capability Architecture.

### 3.2 The enabling state is distinct from the person-facing action

Contact & Action should consume an eligible destination result without owning how the destination is configured, validated, or governed.

This keeps:

- enabling product state in Handoff Enablement;
- person-facing action in Contact & Action.

### 3.3 One behaviour owner preserves Single Information Ownership

PRD-0001 owns the destination model and result.

PRD-0005 and PRD-0006 participate only through supporting relationships. This follows Accepted ADR-0007 and avoids silently turning management entry or administration surface into Capability ownership.

### 3.4 The two eligibility results remain independent

Final Offering Public Eligibility answers whether the Offering is publicly eligible.

Affiliate Destination Handoff Eligibility answers whether the associated destination may be used.

Keeping them separate prevents action availability from redefining Offering public appearance.

### 3.5 Object-level distinction protects F02

Editing an associated destination is not editing the Offering itself.

The distinction protects the deferred F02 decision while allowing the new concern to be governed coherently.

---

## 4. Scope

This ADR governs:

- creation of the Handoff Enablement Capability;
- its single architectural concern;
- PRD-0001 as sole behaviour owner;
- PRD-0005 and PRD-0006 supporting relationships;
- Contact & Action consumption;
- Direct Contact exclusion;
- eligibility separation;
- F01/F02 safeguards;
- required controlled revision and sequencing consequences.

This ADR does not govern:

- detailed Affiliate Destination fields or status values;
- validation criteria;
- destination cardinality per Offering;
- Feature decomposition;
- Feature ID allocation;
- Feature → Capability association;
- technical implementation;
- affiliate-network integration;
- attribution, commission, payment, settlement, or external transaction tracking;
- API, storage, database, infrastructure, or event design.

---

## 5. Consequences

### 5.1 Positive

- Affiliate Destination enabling behaviour receives one coherent Capability home.
- Existing Capability definitions remain bounded.
- PRD-0001 has one authorized architecture path for its v2.0 requirements.
- PRD-0005 and PRD-0006 supporting roles remain consistent with ADR-0007.
- Contact & Action remains focused on the person-facing journey.
- F01 and F02 remain intact.
- Future Offering-associated external destinations may use the same concern without changing person-facing Decision ownership.

### 5.2 Costs

- The Frozen Offering Capability Architecture requires a superseding revision.
- Feature decomposition and Feature IDs must be added through that revision.
- Affected PRDs, UX, Stories, traceability, ADR index, and repository status require later controlled reconciliation.
- Reviewers must distinguish the Capability name from the Enable Affiliate Destination action.

### 5.3 Risks and safeguards

- **Risk:** Direct Contact is pulled into the new Capability.
  - **Safeguard:** §2.6 explicitly excludes it.
- **Risk:** Destination eligibility is merged into Offering public eligibility.
  - **Safeguard:** §2.7 preserves two independent results.
- **Risk:** PRD-0005 or PRD-0006 becomes Capability owner by implication.
  - **Safeguard:** §§2.3–2.4 classify both as supporting relationships.
- **Risk:** F02 is decided implicitly through the word editing.
  - **Safeguard:** §2.8 distinguishes the edited object and preserves F02.
- **Risk:** Two divergent Capability Architecture revisions branch from one Frozen baseline.
  - **Safeguard:** one combined superseding revision is required.

---

## 6. Alternatives Considered

### 6.1 Extend Contact & Action

Rejected because destination configuration and governance are not the person-facing act.

### 6.2 Extend Visibility & Eligibility

Rejected because destination usability is not Offering appearance.

### 6.3 Use Lifecycle

Rejected because destination status is not Offering lifecycle.

### 6.4 Use Representation

Rejected because the destination is not an Attribute or Category descriptor.

### 6.5 Use Creation

Rejected because creating a destination is not creating an Offering and would broaden F01.

### 6.6 Split across existing Capabilities

Rejected because it fragments one bounded concern and prejudges existing boundaries.

### 6.7 Use supporting relationships only

Rejected because supporting relationships cannot provide a Capability home for PRD-0001's Offering-domain behaviour.

---

## 7. Required Controlled Follow-Ups

After Acceptance:

1. **PRD-0001 v2.0**
   - may begin using Accepted ADR-0008 as Capability authority;
   - defines detailed Affiliate Destination product behaviour;
   - references Handoff Enablement without inventing a Feature.

2. **Offering Capability Architecture**
   - create one combined superseding revision;
   - discharge the ADR-0007 Review Needed obligation;
   - record Handoff Enablement;
   - perform controlled Feature decomposition;
   - allocate Feature IDs;
   - record applicable Feature → Capability associations;
   - preserve the existing Frozen baseline until the successor is Frozen.

3. **PRD-0005**
   - record only the Business-management supporting relationship.

4. **PRD-0006**
   - record only the Platform administration supporting relationship and target-owned outcome boundary.

5. **PRD-0004**
   - retain Contact & Action ownership;
   - consume Affiliate Destination Handoff Eligibility by reference.

6. **UX and User Stories**
   - do not advance generated Story work for the new concern until Feature IDs exist;
   - preserve Golden Baseline Stories F01–F04 unchanged unless another authoritative change requires review.

7. **Traceability and indexes**
   - update through separate controlled changes after acceptance;
   - list ADR-0008 only after acceptance;
   - record the new Capability and supporting relationships after the superseding architecture revision.

No follow-up occurs automatically.

---

## 8. Sequencing Rule

Minimum sequence:

```text
ADR-0008 Proposed
→ Architecture Review
→ Final Review
→ explicit Owner acceptance
→ PRD-0001 v2.0 may begin
→ combined Offering Capability Architecture superseding revision
→ UX / Story / traceability reconciliation
```

Accepted ADR-0008 is the minimum authority gate for PRD-0001 v2.0.

The completed superseding revision is the Feature ID and generated-Story gate.

---

## 9. References

- `OWNER-DECISION-D23-HANDOFF-ENABLEMENT-CAPABILITY-2026-07-21.md` — explicit Owner decision.
- `ADR-NUMBER-RESERVATION-ADR-0008-2026-07-21.md` — identifier reservation.
- `ADR-0006-affiliate-destination-ownership.md` — product and Cross-PRD ownership authority.
- `ADR-0007-domain-scope-of-capability-first-rule.md` — Offering-domain traceability and supporting-relationship rules.
- `ADR-0004-capability-architecture-layer-recognition.md` — official Capability Architecture layer.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — Frozen Capability definitions, Feature Registry ownership, and production rules.
- `OWNER-DECISION-D04-DIRECT-CONTACT-MODEL-2026-07-21.md` — Direct Contact boundary.
- `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md` — two-result eligibility boundary.
- `OWNER-DECISION-D21-AFFILIATE-DESTINATION-ADMIN-ACTIONS-2026-07-21.md` — administration action family.
- `CLAUDE_AFFILIATE_DESTINATION_CAPABILITY_HOME_REVIEW.md` — independent architecture review.

---

**Revision Note (1.0):** Accepted by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER ACCEPTANCE`. Establishes Handoff Enablement as an authoritative Offering Capability; records `PRD-0001` as its sole behaviour owner; preserves `PRD-0005` and `PRD-0006` as ADR-0007 §2.4B supporting relationships; keeps person-facing Affiliate Handoff and Completion in Contact & Action; excludes Direct Contact; preserves the separation between final Offering Public Eligibility and Affiliate Destination Handoff Eligibility; protects F01 and leaves F02 Deferred / Not Yet Decided; allocates no Feature ID; and requires one combined Offering Capability Architecture superseding revision. No downstream document changes automatically.

**Revision Note (0.1):** Initial Proposed ADR candidate created after Architecture Decision Analysis v0.2, independent Claude review, explicit Owner Decision D-23, and ADR-0008 uniqueness reservation. Introduces one bounded Capability decision; preserves PRD-0001 as sole behaviour owner; classifies PRD-0005 and PRD-0006 as supporting relationships; separates Contact & Action, Direct Contact, and the two eligibility results; preserves F01/F02; allocates no Feature ID; and requires one combined Offering Capability Architecture superseding revision. Status remains Proposed and non-authoritative.
