# ADR-0007 — Domain Scope of the Capability First Rule

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-21
- **Deciders:** Product Owner / Architecture Owner
- **Accepted By:** Product Owner / Architecture Owner
- **Acceptance Date:** 2026-07-21
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `OWNER-DECISION-D19-CAPABILITY-FIRST-SCOPE-2026-07-21.md`, `OWNER-DECISION-D18-HOMEPAGE-OWNERSHIP-2026-07-21.md`, `CLAUDE_FOCUSED_ADR_DECISION_CONSISTENCY_REVIEW.md`, `ADR-0004-capability-architecture-layer-recognition.md`, `OFFERING_CAPABILITY_ARCHITECTURE.md`, `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `ADR_PROCESS.md`, `TRACEABILITY_GUIDELINES.md`, `docs/traceability.md`, `PRD-0001-offering.md`, `PRD-0002-discovery.md`, `PRD-0003-identity.md`, `PRD-0004-decision.md`, `PRD-0005-business.md`, `PRD-0006-platform.md`

> **Authority note.** ADR-0007 was explicitly accepted by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, independent Claude consistency review, and Final Review. This Accepted v1.0 record is authoritative from its acceptance date. Acceptance makes the V1 domain-scope and traceability boundary authoritative, but it does not edit the Frozen Offering Capability Architecture in place or automatically modify any governance document, PRD, UX specification, User Story, traceability record, ADR index, or repository status document. The existing Frozen v1.0 baseline is preserved and becomes Review Needed only for a future separate superseding revision.

---

## 1. Context

The repository recognizes Capability Architecture as an official documentation and authority layer through Accepted `ADR-0004`.

The Frozen `OFFERING_CAPABILITY_ARCHITECTURE.md` defines the Capability model for the Offering domain and establishes Capability First production rules for Offering-domain downstream documents.

Its broad wording may be interpreted to mean that every PRD, UX specification, and User Story in the repository must trace to a Capability defined in the Offering Capability Architecture.

That interpretation creates a structural problem:

- the existing Capability Architecture is explicitly Offering-scoped;
- Identity behaviour is not Offering behaviour;
- Business Profile and Business-context behaviour are not Offering behaviour;
- Platform administration, moderation, Basic Analytics, and Platform Configuration are not Offering behaviour;
- V1 does not currently authorize separate Identity, Business, or Platform Capability Architecture documents;
- Accepted `ADR-0004` recognizes the layer but does not automatically authorize additional Capability Architecture documents.

The independent Cross-PRD Architecture Audit recorded this as **F-M11 — Non-Offering PRDs have no capability home** and identified the scope of the Capability First production rule as a repository-wide authority decision requiring an ADR.

A durable rule is therefore required to distinguish:

1. Offering-domain traceability, which must pass through the Frozen Offering Capability Architecture; and
2. non-Offering V1 traceability, which must not be forced into an unrelated Offering Capability merely to satisfy a repository-wide reading of Capability First.

---

## 2. Decision

### 2.1 V1 domain scope and acceptance proposition

For V1, the Capability First production and traceability rule applies only to **Offering-domain behaviour and governed Offering relationships**.

The Frozen `OFFERING_CAPABILITY_ARCHITECTURE.md` §9 states broadly that every downstream document traces to a Capability defined there. This ADR proposes that the Product Owner / Architecture Owner accept the following V1 application rule:

> Every downstream Offering-domain behaviour, experience, Feature, and governed Offering relationship traces to an authorized Capability in the Frozen Offering Capability Architecture. Identity, Business, and Platform own-domain behaviour is not forced into an unrelated Offering Capability.

The authority basis for presenting this V1 application boundary is:

- `REPOSITORY_GOVERNANCE.md` §4 gives final repository decision authority to the Product Owner / Architecture Owner;
- `REPOSITORY_GOVERNANCE.md` §9 requires Owner approval of governance changes and states that, where an ADR is required, only an Accepted ADR is authoritative;
- `ADR_PROCESS.md` §3 requires an ADR for significant repository-wide and governance decisions;
- `ADR_PROCESS.md` §5 makes an Accepted ADR authoritative from its recorded acceptance date.

This Accepted ADR does not override, amend, or edit the Frozen document. If the Owner accepts this exact candidate, that acceptance also explicitly accepts the V1 application boundary above as a later repository-wide decision that must be read together with Frozen §9.

Where the Frozen wording remains broader than the Accepted V1 application boundary:

- downstream documents apply the Accepted V1 boundary;
- the Frozen Capability Architecture becomes `Review Needed` for a future superseding revision;
- its text remains unchanged until that separate controlled revision is completed;
- no Proposed ADR has interpretive authority before this acceptance.

Domain classification is applied to the behaviour or governed relationship. It is not determined only by a document's filename, title, directory, or primary domain label.

Identity, Business, and Platform own-domain behaviour does not require separate Capability Architecture documents in V1.
### 2.2 Offering-domain authority chain

For Offering-domain behaviour, the authoritative chain is:

```text
Foundation
  → Offering Capability Architecture
  → behaviour-owning PRD
  → applicable UX
  → applicable User Story
```

Offering-domain requirements:

- no downstream document may invent an Offering Capability;
- no downstream document may change a Feature → Capability association without the required Accepted ADR authority;
- PRD, UX, and User Story documents consume Capability ownership by reference;
- the Frozen Offering Capability Architecture remains authoritative within its scope;
- Accepted ADRs remain authoritative for durable Feature → Capability associations.

Classification follows the Frozen Capability Map, including behaviour owned outside a document named “Offering”:

- core Offering representation behaviour owned by `PRD-0001-offering.md` traces to **Representation**;
- Category and Attribute management owned by `PRD-0006-platform.md` is direct Frozen-assigned **Representation** behaviour and uses the Offering Capability Architecture chain at the behaviour level;
- Presentation behaviour owned by `PRD-0001-offering.md` traces to **Presentation**;
- Discovery behaviour owned by `PRD-0002-discovery.md` traces to **Discovery**;
- Compare behaviour owned by `PRD-0004-decision.md` traces to **Decision Analysis**;
- Decision Chat behaviour owned by `PRD-0004-decision.md` traces to **Decision Support**;
- Affiliate Handoff and Direct Contact behaviour owned by `PRD-0004-decision.md` trace to **Contact & Action**.

The PRD title or primary domain does not remove a Frozen-assigned behaviour from the Offering Capability Architecture.

Under Owner Decision D-18, the Homepage opening prompt and Search/Browse routing are owned by `PRD-0002-discovery.md`. Because this entry behaviour routes the person into Discovery, it is classified as **Discovery** capability behaviour for V1.

Its complete traceability chain is therefore:

```text
Foundation / V1 Scope
  → Offering Capability Architecture: Discovery
  → PRD-0002 Discovery
  → UX-0001 Home
```

The shorter chain written in D-18 remains a valid local ownership summary but is not the complete Capability traceability chain. ADR-0007 does not change D-18's PRD/UX ownership allocation.
### 2.3 Non-Offering V1 authority chain

For Identity, Business, and Platform **own-domain behaviour** that is not assigned by the Frozen Capability Map to an Offering Capability, the authoritative V1 chain is:

```text
Foundation
  → Domain PRD
  → Domain UX
  → Domain User Story
```

For these own-domain concerns:

- the PRD is the product-behaviour Single Information Owner beneath Foundation;
- UX consumes the owning PRD;
- User Stories consume the owning PRD and applicable UX;
- a separate Capability Architecture document is not required;
- no behaviour may be assigned to an Offering Capability solely to satisfy repository-wide traceability wording;
- ordinary governance, review, lifecycle, ADR, and traceability rules still apply.

Examples include User Account and access-context behaviour in Identity, Business Profile behaviour in Business, and Admin Panel / Basic Analytics behaviour in Platform.

Platform ownership by filename alone is not sufficient to use this direct chain. Category and Attribute management is excluded from these examples because the Frozen Capability Map directly assigns it to Representation.
### 2.4 Mixed-domain, direct assignments, and supporting relationships

A PRD whose primary domain is Identity, Business, or Platform may relate to an Offering Capability in either of two ways.

#### A. Direct Frozen assignment

Where the Frozen Capability Map directly assigns behaviour ownership to that PRD, the assigned behaviour uses the Offering Capability Architecture chain.

Example:

```text
PRD-0006 Category and Attribute management
→ Representation
```

This is direct Offering-capability behaviour ownership, not merely a supporting contribution. It does not make all Platform behaviour Offering-domain.

#### B. Supporting relationship

A non-Offering PRD may contribute a gate, management entry, administration action, or moderation effect to an Offering-domain flow without becoming the owner of the Offering Capability.

These supporting relationships are recorded at behaviour, section, or governed-relationship level:

- `PRD-0003-identity.md` may govern authentication or access for Contact & Action while `PRD-0004-decision.md` remains the person-facing behaviour owner;
- `PRD-0005-business.md` may provide a Business Dashboard entry to `PRD-0001`-owned Offering management without redefining the Offering Capability;
- `PRD-0006-platform.md` may own an approved Admin action affecting an Offering-owned target result while the target-owning PRD retains the product state or eligibility result.

The supporting PRD remains the Single Information Owner of its own gate, access, management-entry, or Admin-action concern. It does not become the Capability owner, and the entire supporting PRD is not forced into the Offering authority chain.

Mixed documents and relationships must use section-level or relationship-level traceability where whole-document classification would be misleading.
### 2.5 Relationship to ADR-0004

This decision does not supersede or weaken Accepted `ADR-0004`.

`ADR-0004` continues to:

- recognize Capability Architecture as an official repository layer;
- preserve `REPOSITORY_GOVERNANCE.md` as the Single Information Owner of the repository layer hierarchy;
- recognize the Frozen Offering Capability Architecture as the existing Offering implementation;
- authorize no additional Capability Architecture documents beyond those already existing.

`ADR-0004` §9.1 is direct Accepted support for the rule that general layer recognition does not automatically authorize additional domain Capability Architecture documents.

The broad statement in `ADR-0004` §3 that every downstream document traces through the layer appears in the decision's rationale for recognizing the layer. `ADR-0004` §2, its decision body, does not establish a repository-wide obligation that every unrelated domain must instantiate or use the existing Offering Capability model.

ADR-0007 records the V1 domain-scope and application boundary as a separate later repository-wide decision. Acceptance of ADR-0007 does not rewrite ADR-0004 or the Frozen Offering Capability Architecture.

The Frozen Capability Architecture is not edited in place. Acceptance makes it `Review Needed` only for a future superseding revision that may align the broad §9 wording with the accepted V1 boundary while preserving the original Frozen baseline.
### 2.6 Future domain Capability Architecture

This decision does not prohibit a future Capability Architecture for another domain.

A future Identity, Business, Platform, Decision, or Discovery Capability Architecture requires:

- explicit product and architecture justification;
- a new governed architectural decision;
- a defined authority boundary;
- a controlled repository change;
- reconciliation with existing governance and traceability rules.

No future Capability Architecture is authorized by this ADR merely because it is theoretically possible.

### 2.7 No new product Capability

This decision creates:

- no new product Capability;
- no new Feature;
- no new Feature ID;
- no new Feature → Capability association;
- no new Capability Architecture document.

It defines only the repository-wide scope within which existing Capability First rules apply in V1.

---

## 3. Rationale

### 3.1 Capability Architecture must remain domain-correct

The Frozen Capability Architecture models Offering capabilities.

Forcing unrelated Identity, Business, or Platform own-domain behaviour into that model would create false ownership and weaken Capability references. This does not exclude behaviour that the Frozen Capability Map directly assigns to an Offering Capability, such as Category and Attribute management under Representation.

Domain-correct traceability is more important than universal use of one documentation layer.

### 3.2 Layer recognition does not imply mandatory instantiation

Accepted `ADR-0004` recognizes Capability Architecture as an official layer. It does not require every domain to have a Capability Architecture document.

A repository may recognize a valid layer while using it only where the domain complexity and authority model require it.

### 3.3 V1 scope discipline

Creating additional Capability Architecture documents for Identity, Business, and Platform would add substantial governance and documentation work before the V1 product behaviour is stabilized.

V1 should not introduce new authority layers without a demonstrated need.

The direct Foundation → PRD → UX → User Story chain is sufficient for non-Offering V1 domains because their PRDs already own their product behaviour.

### 3.4 Preventing false capability homes

Without this decision, a downstream document might:

- incorrectly trace authentication to an Offering Capability;
- incorrectly trace Business Profile behaviour to Offering Creation or Lifecycle;
- incorrectly trace unrelated Admin Panel or Basic Analytics behaviour to an Offering Capability;
- incorrectly omit Representation traceability from Platform-owned Category and Attribute management;
- invent a new Capability without authorization;
- create unofficial Capability Architecture documents.

The proposed boundary prevents these invalid shortcuts.

### 3.5 Preserving future extensibility

The decision is V1-specific.

It avoids unnecessary documents now while preserving the possibility of future domain Capability Architecture where scale, complexity, reuse, or governance needs justify it.

---

## 4. Scope

This ADR governs:

- the V1 domain scope of the Capability First production rule;
- the V1 traceability chain for Offering-domain documents;
- the V1 traceability chain for Identity, Business, and Platform own-domain behaviour;
- direct Frozen assignments of Offering-capability behaviour to a non-Offering PRD;
- the V1 Discovery classification of the D-18 Homepage entry behaviour;
- the relationship between this rule and Accepted `ADR-0004`;
- the authority requirement for any future domain Capability Architecture.

This ADR does not:

- redefine any Offering Capability;
- change the Frozen Offering Capability Architecture in place;
- change Accepted Feature → Capability associations;
- authorize a new Capability Architecture document;
- define Identity, Business, or Platform product behaviour;
- define PRD, UX, or User Story content;
- remove review, lifecycle, traceability, or ADR requirements;
- change the Foundation;
- change V1 scope;
- define software architecture;
- define code, APIs, databases, infrastructure, or implementation.

---

## 5. Consequences

### 5.1 Positive consequences

- Offering-domain Capability First rules remain authoritative and unambiguous.
- Identity, Business, and Platform own-domain behaviour no longer appears structurally incomplete merely because it does not reference an Offering Capability.
- Frozen-assigned Offering behaviour in a non-Offering PRD remains correctly traceable, including Category and Attribute management under Representation.
- Homepage entry behaviour receives a complete Discovery capability chain without changing D-18 ownership.
- Non-Offering behaviour is not forced into false Capability ownership.
- V1 avoids unnecessary Capability Architecture documents.
- The repository obtains two explicit, valid traceability chains.
- `ADR-0004` remains authoritative without being overextended.
- Future domain Capability Architecture remains possible through a controlled decision.
- No new Capability, Feature, or Feature → Capability association is introduced.

### 5.2 Costs and risks

- Repository guidance with broad “every downstream document” wording may require clarification by reference.
- Reviewers must determine whether a requirement is a direct Frozen Offering assignment, a supporting relationship, or unrelated own-domain behaviour before applying the correct traceability chain.
- Mixed documents may require more precise section-level traceability.
- Future teams may incorrectly treat the direct non-Offering chain as permission to bypass product ownership or UX authority.
- A future domain may outgrow the direct chain and need its own Capability Architecture.

### 5.3 Safeguards

- Offering-domain behaviour and direct Frozen assignments must continue to use the Frozen Offering Capability Architecture.
- Non-Offering domains must still follow Foundation, PRD, UX, Story, governance, review, and traceability authority.
- No new Capability Architecture document may be created without a separate governed decision.
- No document may invent a Capability or Feature → Capability association.
- Mixed-domain behaviour must identify the owning product concern and use the correct authority chain.
- Frozen documents must not be edited in place; acceptance of this ADR creates a Review Needed trigger rather than an in-place edit.
- No downstream file changes automatically after ADR acceptance.

---

## 6. Alternatives Considered

### Alternative A — Apply Offering Capability First to every repository domain

Every PRD, UX specification, and User Story would be required to trace to a Capability in the Offering Capability Architecture.

This would force unrelated Identity, Business, and Platform behaviour into an Offering-scoped model and create false authority. **Not proposed.**

### Alternative B — Create separate Capability Architecture documents for every domain now

Identity, Discovery, Decision, Business, and Platform would each receive a new Capability Architecture document before PRD reconciliation.

This would create a large new governance and documentation layer during V1 recovery without evidence that every domain requires it. It would also exceed what Accepted `ADR-0004` currently authorizes. **Not proposed.**

### Alternative C — Remove Capability Architecture from the repository

All domains would use Foundation → PRD → UX → Story.

This would discard the established Offering Capability Architecture, Accepted ADR relationships, Feature Registry, and Feature → Capability authority already validated for the Offering domain. **Not proposed.**

### Alternative D — Domain-scoped Capability First

Offering-domain behaviour uses:

```text
Foundation
→ Offering Capability Architecture
→ PRD
→ UX
→ Story
```

Identity, Business, and Platform V1 behaviour uses:

```text
Foundation
→ PRD
→ UX
→ Story
```

Future domains may add Capability Architecture only through a separate governed decision. This preserves the valid Offering layer without forcing it onto unrelated domains. **Proposed decision.**

### Alternative E — Treat Capability Architecture as optional per document

Each document author would decide whether to reference a Capability.

This would weaken authority, create inconsistent traceability, and allow Capability references to become stylistic rather than governed. **Not proposed.**

---

## 7. Required Follow-ups if Accepted

All follow-ups are separate controlled changes.

1. **`docs/traceability.md`**
   - record the two valid V1 authority chains;
   - apply classification at behaviour, section, or governed-relationship level where a document is mixed;
   - preserve Offering Capability references for PRD-0001, Discovery and Homepage-entry behaviour in PRD-0002, Decision behaviour in PRD-0004, and Category/Attribute management in PRD-0006;
   - record direct Foundation → PRD relationships for Identity, Business, and Platform own-domain behaviour;
   - distinguish direct Frozen assignments from supporting gates, management entries, and moderation contributions;
   - avoid creating artificial Offering Capability links for unrelated non-Offering behaviour.

2. **`TRACEABILITY_GUIDELINES.md`**
   - review whether existing wording implies repository-wide mandatory Capability references;
   - apply a controlled clarification by reference or revision under the document's lifecycle;
   - define how mixed-domain relationships are recorded.

3. **`OFFERING_CAPABILITY_ARCHITECTURE.md`**
   - do not edit the Frozen document in place;
   - on ADR-0007 acceptance, record the document as `Review Needed` for a future superseding revision;
   - preserve the Frozen v1.0 baseline and its authority until that separate revision completes;
   - preserve Representation ownership for PRD-0001 and Category/Attribute management for PRD-0006;
   - reference ADR-0007 through an authorized index, traceability record, or future superseding revision only where governance requires it.

4. **`REPOSITORY_GOVERNANCE.md`**
   - do not edit the Frozen document in place;
   - review repository-wide wording for consistency with ADR-0007;
   - use an authorized reference or future controlled revision if clarification is required.

5. **`PRD-0001-offering.md`**
   - retain required references to the Frozen Offering Capability Architecture and Accepted Feature → Capability ADRs.

6. **`PRD-0003-identity.md`, `PRD-0005-business.md`, and `PRD-0006-platform.md`**
   - close Open Questions arising solely from the missing Capability-home interpretation;
   - do not add irrelevant Offering Capability references to own-domain behaviour;
   - retain Foundation → PRD ownership for own-domain behaviour;
   - preserve the direct Representation chain for Category and Attribute management in PRD-0006.

7. **UX and User Stories**
   - Offering-domain documents retain Capability references;
   - Identity, Business, and Platform documents trace through their owning PRDs and applicable UX;
   - no document is modified automatically.

8. **`docs/adr/README.md`**
   - add ADR-0007 to the authoritative ADR index only after explicit acceptance as v1.0.

9. **Repository status documents**
   - update `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, and `CHANGELOG.md` through their applicable controlled maintenance process.

10. **Future Capability Architecture proposals**
    - require a separate ADR or other governance-authorized architecture decision;
    - must define domain, authority, downstream relationships, and migration impact.

No follow-up is performed by this Proposed ADR.

---

## 8. References

- `OWNER-DECISION-D19-CAPABILITY-FIRST-SCOPE-2026-07-21.md` — explicit Owner direction requiring this ADR.
- `OWNER-DECISION-D18-HOMEPAGE-OWNERSHIP-2026-07-21.md` — Homepage entry ownership and the local PRD/UX boundary clarified by the complete Discovery traceability chain.
- `CLAUDE_FOCUSED_ADR_DECISION_CONSISTENCY_REVIEW.md` — independent review findings M-04, M-05, M-06, MIN-03, and MIN-04 applied in v0.3.
- `CLAUDE_CROSS_PRD_ARCHITECTURE_AUDIT.md` — F-M11 finding and A-03 ADR assessment.
- `ADR-0004-capability-architecture-layer-recognition.md` — official layer recognition; §9.1 authorizes no additional Capability Architecture documents, while §2 contains no universal domain-instantiation rule.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — Frozen Offering-domain Capability authority.
- `REPOSITORY_GOVERNANCE.md` — §4 final Owner authority and §9 governance-change / Accepted-ADR authority basis.
- `DOCUMENT_LIFECYCLE.md` — Frozen-document and controlled-revision rules.
- `REVIEW_PROCESS.md` — Architecture Review, Final Review, and Review Needed mechanics.
- `ADR_PROCESS.md` — §3 requirement for repository-wide / governance ADRs and §5 authority of Accepted ADRs.
- `TRACEABILITY_GUIDELINES.md` — traceability rules requiring reconciliation with this decision.
- `docs/traceability.md` — governed relationship record after acceptance.
- `PRD-0001-offering.md` — owner of core Offering-domain behaviour consuming Capability Architecture.
- `PRD-0002-discovery.md` — owner of Offering-domain Discovery behaviour.
- `PRD-0004-decision.md` — owner of Offering-domain Decision Analysis, Decision Support, and Contact & Action behaviour.
- `PRD-0003-identity.md` — Identity-domain PRD using the direct Foundation → PRD chain for own-domain behaviour while contributing referenced access gates to Offering flows.
- `PRD-0005-business.md` — Business-domain PRD using the direct Foundation → PRD chain.
- `PRD-0006-platform.md` — Platform-domain PRD using the direct Foundation → PRD chain.
- `docs/adr/README.md` — authoritative ADR index after acceptance.

---

**Revision Note (1.0):** Accepted by the Product Owner / Architecture Owner on 2026-07-21 after Final Review verdict `PASS — READY FOR OWNER ACCEPTANCE`. Establishes the authoritative V1 domain-scope and traceability rule: Offering-domain behaviour, direct Frozen Offering Capability assignments, and governed Offering relationships use the Offering Capability Architecture chain; unrelated Identity, Business, and Platform own-domain behaviour uses Foundation → PRD → UX → User Story without requiring separate Capability Architecture documents. Confirms Homepage opening prompt and Search/Browse routing as Discovery Capability behaviour, Category and Attribute management owned by PRD-0006 as Representation Capability behaviour, preserves ADR-0004, creates no new Capability Architecture document, edits no Frozen document in place, and triggers only a future Review Needed assessment for a separate superseding revision. No downstream document changes automatically.

**Revision Note (0.3):** Independent Claude focused-review correction revision. Classifies Category and Attribute management owned by PRD-0006 as direct Frozen-assigned Representation behaviour; distinguishes direct Offering assignments from supporting cross-domain relationships and unrelated own-domain behaviour; grounds the V1 application boundary in `REPOSITORY_GOVERNANCE.md` §§4 and 9 and `ADR_PROCESS.md` §§3 and 5; presents acceptance of the boundary explicitly to the Owner rather than claiming Proposed interpretive authority; engages `ADR-0004` §9.1 and distinguishes its §3 rationale from its §2 decision body; classifies D-18 Homepage entry and Search/Browse routing as Discovery capability behaviour while preserving D-18 ownership; and makes the Frozen Offering Capability Architecture Review Needed for a future superseding revision after acceptance, without editing it in place. Status remains Proposed.

**Revision Note (0.2):** Architecture Review correction revision. Establishes the authoritative V1 interpretation of Frozen Offering Capability Architecture §9 as applying to Offering-domain behaviour and governed Offering relationships; makes domain classification behaviour-level rather than filename-level; explicitly keeps PRD-0002 Discovery and PRD-0004 Decision behaviours within the Offering Capability Architecture; defines section-level traceability for Identity gates, Business management entry, and Platform moderation contributions to Offering flows; clarifies that ADR-0007 controls the V1 interpretation without editing Frozen documents in place; and expands references and follow-ups accordingly. The Owner Decision D-19 direction is unchanged. Status remains Proposed.

**Revision Note (0.1):** Initial Proposed draft. Records the Product Owner / Architecture Owner's explicit D-19 direction that the Capability First production and traceability rule applies in V1 only to the Offering domain. Offering-domain PRD, UX, and User Story behaviour must trace through the Frozen Offering Capability Architecture; Identity, Business, and Platform V1 behaviour follows Foundation → PRD → UX → User Story without requiring separate Capability Architecture documents. Preserves Accepted ADR-0004 and the authority of the Frozen Offering Capability Architecture, creates no new Capability, Feature, Feature ID, Feature → Capability association, or Capability Architecture document, changes no Frozen document, and modifies no repository document automatically. This record is Accepted v1.0 and authoritative from 2026-07-21.
