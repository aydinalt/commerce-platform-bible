# Offering Capability Architecture

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.6
- **Last Updated:** 2026-07-15

**Revision Note (0.2):** Controlled revision. Removed engineering-specific philosophy from Learning & Evolution (architecture-only). Epic is now referenced only and its ownership left with `USER_STORY_HANDBOOK.md` (no redefinition). Feature clarified as a structural decomposition unit owned here, explicitly excluding planning, prioritization, sequencing, estimation, and sprint planning.

**Revision Note (0.3):** Controlled ownership clarification only, establishing reciprocal ownership with `USER_STORY_HANDBOOK.md`. Feature ID ownership is made explicit: this document is stated as the Single Information Owner of Feature ID allocation for the Offering domain (added to §2 Scope and detailed in a new "Feature ID Ownership" subsection under §7). Feature IDs are permanent architectural identifiers, independent of Feature names; Story documents and Generated Story IDs consume them by reference and never allocate or redefine them. Illustrative Feature ID examples are given only to show the form of an identifier; no Feature inventory is created, no Feature is invented, and no Story ID, Story behaviour, or implementation is introduced. The capability model, capability aspects, Feature structure, and repository hierarchy are unchanged.

**Revision Note (0.4):** Controlled revision converting the §7 "Feature ID Ownership" subsection from illustrative examples into the **authoritative Feature Registry** for the Offering domain. This resolves a Single-Information-Owner allocation gap discovered during Story generation: this document declared itself the owner of Feature ID allocation, yet §7 previously stated its identifiers were "illustrative examples" that "do not constitute a Feature inventory," while four Golden Baseline Stories (`US-OFR-F01-001` through `US-OFR-F04-001`) already consumed `F01`–`F04`, and the next Story could not be generated because no identifier had been authoritatively allocated. This revision formally allocates the Feature IDs already in use (`F01`–`F04`) and allocates the next one (`F05` — Full Offering Detail Presentation), and restates that these identifiers are consumed downstream by reference only and are never allocated by any downstream document. It changes no Feature behaviour, no Story ID, no capability, and no ownership boundary; it makes the allocation that was already implied by the baselined Stories explicit and authoritative. No new Feature beyond `F05` is introduced.

**Revision Note (0.5):** Controlled revision implementing Accepted `ADR-0002-offering-presentation-capability.md` (v1.0). (1) §6 Capability Map adds **Presentation** — the capability by which a complete Offering is presented to a viewer — with behaviour referenced to `PRD-0001-offering.md` and primary experience `UX-0003-offering-detail.md`; the Representation entry is unchanged, preserving the descriptor-structuring vs full-presentation distinction. (2) §7 extends the existing authoritative Feature Registry with a recorded Feature → Capability association for `F05 → Presentation` only; F01–F05 Feature IDs and names are unchanged, no new Feature or Feature ID is allocated, F01–F04 capability associations are not decided here (and are not marked "Unresolved"), and no separate "Feature-to-Capability Registry" artifact is created. No behaviour, PRD scope, UX behaviour, or Story is defined or redefined; the Presentation boundaries against adjacent capabilities are recorded in `ADR-0002` §5 and referenced here, not restated. Status remains Draft.

**Revision Note (0.6):** Controlled revision. §2 Scope now explicitly records this document as the Single Information Owner of **authoritative Offering-domain Feature → Capability associations**, recorded in the authoritative Feature Registry (§7). Feature ID allocation remains a separate, existing ownership responsibility, listed distinctly in §2; the two responsibilities are kept distinct. This ownership does not extend to Feature behaviour, Story ownership, Acceptance Criteria, BDD, planning, prioritization, sequencing, estimation, sprint planning, or implementation. No Feature behaviour, Story ownership, planning concern, implementation concern, Capability, Feature, Feature ID, or accepted association changed; the Presentation definition, the Representation definition, their distinction, the accepted `F05 → Presentation` association, the undecided F01–F04 capability associations, the F02 deferral, the Feature IDs `F01`–`F05` and all Feature names, all existing Capabilities, all PRD and UX ownership boundaries, the authoritative Feature Registry, and its Recorded Feature → Capability associations subsection are all preserved. Status remains Draft.

> The architectural capability model for the universal Offering. It defines the capabilities that the Offering is composed of, their independence, and their boundaries. It sits between the Foundation and the PRD layer and is technology-independent. It defines no business rules, no user experience, and no implementation; those are owned by the layers below it and are referenced here, never redefined.

## Position in the Architecture

This document introduces the Capability Architecture layer, positioned between Foundation and PRD:

```
Foundation
  ↓
Capability Architecture
  ↓
PRD
  ↓
UX
  ↓
User Stories
  ↓
Engineering
  ↓
Development
```

The Capability Architecture layer derives from the Foundation and is referenced by the PRD layer. It expresses *what capabilities exist* and *how they are separated*; it never expresses *how they behave* (PRD), *how they are experienced* (UX), or *how they are built* (Engineering/Development).

---

## 1. Purpose

This document defines the architectural capability model of the universal Offering: the set of capabilities the Offering comprises, the principle of their independence, and the boundaries between them. Its purpose is to give every downstream document a single, stable capability to trace to, so that behaviour (PRD), experience (UX), and delivery (User Stories, Engineering) each attach to a well-defined capability rather than to an undifferentiated whole.

This document derives from the Foundation (`VISION.md`, `PRODUCT_PRINCIPLES.md`, `V1_SCOPE.md`) and references the PRD and ADR layers as the owners of behaviour. It introduces no behaviour of its own.

## 2. Scope

This document owns, and is the single information owner of:

- The capability model of the Offering — which capabilities exist.
- The Capability Independence Constitution — the rules by which capabilities remain independent and separated.
- The Capability Map — the architectural responsibility of each capability.
- The Capability Breakdown model — how a capability decomposes (Capability → Epic → Feature) at an architectural level.
- Feature ID allocation for the Offering domain — the permanent architectural identifiers of Features, owned here and consumed downstream by reference.
- Authoritative Feature → Capability associations for the Offering domain — which Capability each Offering-domain Feature maps to, recorded in the authoritative Feature Registry (§7) and consumed downstream by reference. This is a distinct ownership responsibility from Feature ID allocation above; it does not extend to Feature behaviour, Story ownership, Acceptance Criteria, BDD, planning, prioritization, sequencing, estimation, sprint planning, or implementation, which remain owned by the PRD and User Story layers.
- The separation between Decision Analysis and Decision Support.
- The production rules that bind downstream work to capabilities.

## 3. Out of Scope

This document does not own and does not define:

- Business rules — owned by the PRDs.
- User experience — owned by the UX specifications.
- Functional behaviour and stories — owned by the User Story layer.
- Technical implementation, APIs, data schema, or infrastructure — owned by Engineering and Development.
- Document states and versioning, review, authority, and architecture decision records — owned by the governance documents.
- The definition of V1 scope — owned by `V1_SCOPE.md`.

Where any of the above is relevant, it is referenced, never redefined.

## 4. Core Philosophy

**Offering is the platform's universal Decision Object.**

Every discoverable item on the platform is an Offering, and the Offering exists to be decided upon. Consistent with `VISION.md` and `PRODUCT_PRINCIPLES.md`, the platform's purpose is to help people complete decisions about Offerings quickly and with confidence. The Offering is therefore modelled not as a catalogue entry but as the single object around which decision-making is organized.

Because the Offering is universal, its capabilities are defined once, at this architectural level, and are reused across every domain rather than being redefined per category. The term *Offering*, and related terms such as *Attribute*, *Category*, and *Decision Chat*, are defined in the glossary and are referenced here, not redefined.

## 5. Capability Independence Constitution

The Offering is composed of independent capabilities. The following rules are binding on this layer:

- **One concern per capability.** Each capability owns exactly one architectural concern (Separation of Concerns).
- **Capability Independence.** Each capability can evolve without requiring another capability to change, and without redefining another capability's concern.
- **Bounded interaction.** Capabilities interact only across defined boundaries; no capability reaches into the internals of another.
- **No behavioural ownership here.** A capability names a concern; the behaviour that realizes it is owned downstream by a PRD. This layer never specifies behaviour.
- **Reference, never redefine.** Lower layers reference a capability; they do not restate or override it, and this layer does not restate Foundation, PRD, UX, or governance content.
- **Timeless and technology-independent.** A capability is expressed without reference to tools, platforms, or implementation.

## 6. Capability Map

The Offering comprises the following capabilities. Each entry states the capability's single architectural concern and references the document(s) that own its behaviour. None of the descriptions below defines behaviour.

- **Creation** — the capability by which an Offering comes into existence. Behaviour owned by `PRD-0001-offering.md`.
- **Representation** — the capability by which an Offering is described and structured through its Attributes and Categories as descriptors. Behaviour owned by `PRD-0001-offering.md`; management of Categories and Attributes owned by `PRD-0006-platform.md`.
- **Presentation** — the capability by which a complete Offering is presented to a viewer. Behaviour owned by `PRD-0001-offering.md`; primary experience `UX-0003-offering-detail.md`. Introduced by `ADR-0002-offering-presentation-capability.md`. Presentation displays the descriptors Representation defines but does not define or structure them; its boundaries against Discovery, Visibility & Eligibility, Decision Analysis, Decision Support, Contact & Action, and Lifecycle are recorded in `ADR-0002` §5 and referenced here, not redefined.
- **Discovery** — the capability by which people find Offerings. Behaviour owned by `PRD-0002-discovery.md`.
- **Decision Analysis** — the capability by which Offerings are analysed and compared to inform a decision. Behaviour owned by `PRD-0004-decision.md` (Compare).
- **Decision Support** — the capability by which a person is assisted, through assistive communication, in reaching a decision. Behaviour owned by `PRD-0004-decision.md` (Decision Chat), per `ADR-0001-decision-chat-ownership.md`; assistive only.
- **Lifecycle** — the capability by which an Offering moves through its states over time. Behaviour owned by `PRD-0001-offering.md`.
- **Visibility & Eligibility** — the capability that governs whether and where an Offering is eligible to appear. Behaviour owned by `PRD-0001-offering.md` (states) and `PRD-0006-platform.md` (moderation).
- **Contact & Action** — the capability by which a person acts on a decision and reaches the Business behind an Offering. Behaviour owned by `PRD-0004-decision.md`; access governed by `PRD-0003-identity.md`.
- **Learning & Evolution** — the capability by which the platform learns from decision outcomes and improves the Offering model over time. It introduces no behaviour here and is an architectural capability for future scope.

## 7. Capability Breakdown

Capabilities decompose downward using a single, consistent model. This model is structural; it creates no User Stories and specifies no behaviour.

```
Capability
  ↓
Epic
  ↓
Feature
```

- **Capability** — the architectural unit of concern, owned by this layer.
- **Epic** — owned and defined by `USER_STORY_HANDBOOK.md`. This document only references Epic as the next level of decomposition beneath a Capability; it does not define, describe, or redefine what an Epic is. For the meaning of Epic, see `USER_STORY_HANDBOOK.md`.
- **Feature** — a structural unit of a Capability's decomposition, owned by this layer. This layer owns the structural decomposition only: a Feature names a coherent part of a Capability that maps to behaviour owned by a PRD. A Feature does not own — and this document does not define — planning, prioritization, sequencing, estimation, or sprint planning; those belong to the User Story layer and `USER_STORY_HANDBOOK.md`. Concrete Features' behaviour is owned by the PRD layer.

The breakdown flows in one direction and is structural only: a Capability decomposes into Epics (owned by `USER_STORY_HANDBOOK.md`) and Features (structural units owned here), and is realized by PRD-owned behaviour and delivered through the User Story layer. Nothing in the breakdown grants this layer ownership of behaviour or of any planning concern.

### Feature ID Ownership — Feature Registry (Authoritative)

Features are owned by this layer (see the Feature entry above); their identifiers are owned here as well. This subsection is the **authoritative Feature Registry** for the Offering domain. It clarifies ownership and allocates identifiers; it changes neither the Feature structure nor the capability model.

- This document is the sole authoritative owner — the Single Information Owner — of Feature ID allocation for the Offering domain. No other document allocates Offering-domain Feature IDs.
- A Feature ID is a permanent architectural identifier of a Feature. Once allocated, it is stable and is never reused or recycled.
- A Feature's name may evolve without changing its Feature ID; the identifier is independent of the name.
- Every Story, PRD, UX Specification, and other downstream document consumes these identifiers **by reference only**; a downstream document may never allocate, reassign, or redefine a Feature ID.
- Generated Story IDs, defined by `USER_STORY_HANDBOOK.md`, inherit their Feature ID segment from the Feature IDs allocated here; that layer references this document and does not redefine it.

The following is the authoritative allocation of Offering-domain Feature IDs. It is a Feature Registry, not an illustrative list:

| Feature ID | Feature |
|------------|---------|
| `F01` | Offering Creation |
| `F02` | Offering Editing |
| `F03` | Offering Retirement |
| `F04` | Offering Publication |
| `F05` | Full Offering Detail Presentation |

`F01`–`F04` are the identifiers already consumed by the Golden Baseline Stories `US-OFR-F01-001` through `US-OFR-F04-001`; their allocation is confirmed here. `F05` is allocated for the Full Offering Detail Presentation Feature. No Feature beyond `F05` is allocated by this revision; further Feature IDs are allocated only by a future controlled revision of this document.

#### Recorded Feature → Capability associations

This is part of the authoritative Feature Registry above (it is not a separate registry artifact, and it is not a "Feature-to-Capability Registry"). It records only Feature → Capability associations that have been authoritatively decided. A Feature appears here only once its capability home is decided by an authoritative source; absence from this list means the association is not yet decided, not "Unresolved."

| Feature ID | Feature | Capability | Decided by |
|------------|---------|------------|------------|
| `F05` | Full Offering Detail Presentation | Presentation | `ADR-0002-offering-presentation-capability.md` (Accepted) |

`F01`–`F04` capability associations are not decided by this revision and remain outside its scope; `F02` — Offering Editing has no authoritatively supported capability home and is deferred to a separate decision (see `ADR-0002` §9). No Feature or Feature ID is added or changed by this subsection.

## 8. Decision Analysis vs Decision Support

Decision Analysis and Decision Support are distinct capabilities with distinct concerns. Separating them keeps analysis and communication independent.

- **Decision Analysis analyses.** It produces structured analysis and comparison of Offerings so a person can weigh them. Its concern is the *analysis* of Offerings, not communication with the person. Its behaviour is owned by `PRD-0004-decision.md` (Compare).
- **Decision Support communicates.** It assists the person in reaching a decision through assistive communication. Its concern is *support of the person*, not the production of analysis. It is assistive only — it supports the person and does not analyse in place of them, decide for them, or act on their behalf. Its behaviour is owned by `PRD-0004-decision.md` (Decision Chat), per `ADR-0001-decision-chat-ownership.md`.

Neither capability redefines the other. Analysis informs; support communicates. A change to how Offerings are analysed does not change how the person is supported, and vice versa.

## 9. Production Rules

The following rules bind downstream production to this capability model:

- **Capability First.** Every downstream document — PRD, UX, User Story, and the work below them — traces to a Capability defined here. No behaviour, experience, or feature is produced without a capability home.
- **Feature Mapping.** Every Feature maps to exactly one Capability (Single Information Owner). A unit of work that appears to span capabilities is decomposed until each part maps to a single capability.
- **Behavioural Scope.** This layer defines capability concerns and boundaries only. Behaviour, rules, experience, and implementation are out of scope here and are owned by the layers below; this layer never specifies them.

## 10. V1 Capability Scope

The set of capabilities active in V1 is governed by `V1_SCOPE.md`. This document does not redefine V1 scope and does not restate its contents.

- Capabilities whose behaviour is included by `V1_SCOPE.md` are active in V1 through their owning PRDs.
- Capabilities not included by `V1_SCOPE.md` — for example, Learning & Evolution — are architectural capabilities defined here for completeness and future scope; they carry no V1 behaviour.

For the authoritative statement of what is in and out of V1, refer to `V1_SCOPE.md`.

## 11. References

- `VISION.md`, `PRODUCT_PRINCIPLES.md`, `V1_SCOPE.md` — the Foundation this layer derives from.
- `PRD-0001-offering.md` through `PRD-0006-platform.md` — the owners of capability behaviour.
- `ADR-0001-decision-chat-ownership.md` — the ownership of Decision Support (Decision Chat).
- `ADR-0002-offering-presentation-capability.md` — the introduction of the Presentation capability and the `F05 → Presentation` association.
- `USER_STORY_HANDBOOK.md` — the definition of Epic and the User Story standards.
- `glossary.md` — defined terms (Offering, Attribute, Category, Decision Chat, and others).
- Governance: `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `ADR_PROCESS.md`.
