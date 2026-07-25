# ADR-0009 — Story Domain Feature Registry Ownership

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-22
- **Acceptance Date:** 2026-07-22
- **Accepted By:** Product Owner / Architecture Owner
- **Deciders:** Product Owner / Architecture Owner
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `OWNER-DECISION-STORY-DOMAIN-FEATURE-REGISTRY-OWNERSHIP-2026-07-22.md`, `ADR-0004-capability-architecture-layer-recognition.md`, `ADR-0007-domain-scope-of-capability-first-rule.md`, `USER_STORY_HANDBOOK.md`, `REPOSITORY_GOVERNANCE.md`, `ADR_PROCESS.md`, `OFFERING_CAPABILITY_ARCHITECTURE.md`, `US-0001-offering.md`, `US-0002-discovery.md`, `US-0003-identity.md`, `US-0004-decision.md`, `US-0005-business.md`, `US-0006-platform.md`

> **Acceptance note.** Explicitly accepted by the Product Owner / Architecture Owner on 2026-07-22. ADR-0009 Accepted v1.0 is authoritative for non-Offering Story Domain Feature-ID ownership. It preserves Accepted ADR-0007, allocates no Feature ID, creates no Capability, approves or Freezes no registry, revises no Story, and changes no GitHub file automatically.

---

## 1. Context

The Frozen User Story Handbook requires every Generated Story identifier to use:

```text
US-[DOMAIN]-[FEATURE_ID]-[ID]
```

The repository already has authoritative Story Domain codes:

```text
OFR
DSC
IDN
DEC
BUS
PLT
```

However, only the Offering Story Domain currently has an authoritative Feature-ID owner.

The Frozen `OFFERING_CAPABILITY_ARCHITECTURE.md` owns:

```text
F01–F07
```

for the Offering domain.

No authoritative Feature-ID allocation owner currently exists for:

- Discovery;
- Identity;
- Decision;
- Business;
- Platform.

Under the Frozen User Story Handbook, a Generated Story ID cannot be allocated where its Feature ID does not already exist in an authoritative source.

Story generation for `DSC`, `IDN`, `DEC`, `BUS`, and `PLT` is therefore blocked.

An initial proposal considered creating one Capability Architecture document per remaining Story Domain.

Independent architecture review found that approach incompatible with Accepted `ADR-0007`:

- Discovery and Decision behaviour already references applicable Capabilities in the Offering Capability Architecture;
- Identity, Business, and Platform own-domain V1 behaviour does not require separate Capability Architecture documents;
- creating new Capability Architecture documents merely to allocate Feature IDs would conflate Feature identity with Capability ownership.

A durable Feature-ID ownership mechanism is required without redefining Capability Architecture.

---

## 2. Decision

### 2.1 Establish per-domain Feature Registries

Create one lightweight Story Domain Feature Registry for each non-Offering Story Domain:

```text
DISCOVERY_FEATURE_REGISTRY.md
IDENTITY_FEATURE_REGISTRY.md
DECISION_FEATURE_REGISTRY.md
BUSINESS_FEATURE_REGISTRY.md
PLATFORM_FEATURE_REGISTRY.md
```

Each registry is a User Story architecture document.

It is not:

- a Capability Architecture document;
- a PRD;
- a UX specification;
- a Parent Story Document;
- a Generated Story;
- an implementation blueprint.

### 2.2 Registry information ownership

Each registry is the Single Information Owner for its Story Domain's:

- Feature ID sequence;
- canonical Feature name;
- Feature identity status;
- Feature-ID reservation and retirement;
- short non-behavioural Feature scope label;
- behaviour-owner reference;
- applicable UX reference;
- applicable Capability relationship classification by reference.

The registry may identify a Feature.

It does not define the Feature's product or experience behaviour.

### 2.3 Registry exclusions

A registry must not:

- define or revise product requirements;
- define or revise UX behaviour;
- define a Capability;
- define or duplicate a Capability Map;
- redefine an Offering Capability;
- assign Epic placement;
- allocate Generated Story IDs;
- contain Generated Story content;
- control Generated Story lifecycle;
- define implementation architecture;
- change PRD or UX lifecycle.

### 2.4 Discovery registry boundary

`DISCOVERY_FEATURE_REGISTRY.md` allocates Feature IDs for Story Domain `DSC`.

Where applicable, registry entries reference the existing Offering Capability:

```text
Discovery
```

The registry does not create a second Discovery Capability or a Discovery Capability Architecture document.

### 2.5 Decision registry boundary

`DECISION_FEATURE_REGISTRY.md` allocates Feature IDs for Story Domain `DEC`.

Where applicable, registry entries reference existing Offering Capabilities:

```text
Decision Analysis
Decision Support
Contact & Action
```

The registry does not redefine those Capabilities or create a Decision Capability Architecture document.

### 2.6 Identity and Business registry boundary

`IDENTITY_FEATURE_REGISTRY.md` and `BUSINESS_FEATURE_REGISTRY.md` allocate `IDN` and `BUS` Feature IDs.

Own-domain behaviour continues to follow the Accepted ADR-0007 V1 chain:

```text
Foundation
→ Domain PRD
→ Domain UX
→ Domain User Story
```

An entry may classify an applicable relationship as:

- Direct Frozen Offering assignment;
- Supporting relationship;
- No Capability Architecture required.

The classification is by reference only and does not transfer behaviour ownership.

### 2.7 Platform registry boundary

`PLATFORM_FEATURE_REGISTRY.md` allocates `PLT` Feature IDs.

It distinguishes:

1. Platform own-domain behaviour using the direct ADR-0007 V1 chain;
2. direct Frozen Offering assignments, such as Category and Attribute management under `Representation`;
3. supporting administration or moderation relationships.

The registry records the applicable relationship by reference without becoming the Capability owner.

### 2.8 Offering domain remains unchanged

The Offering domain continues to use:

```text
OFFERING_CAPABILITY_ARCHITECTURE.md
```

as the authoritative owner for:

- Offering Feature IDs F01–F07;
- applicable Offering Feature → Capability associations.

No separate Offering Feature Registry is created.

### 2.9 Feature-ID semantics

Within each non-Offering Story Domain:

- Feature IDs use a domain-local sequence such as `F01`, `F02`, `F03`;
- Feature IDs are unique within that Story Domain;
- Feature IDs become immutable after authoritative Story use;
- Feature IDs are never recycled;
- Parent Story Documents do not allocate Feature IDs;
- Generated Stories do not allocate Feature IDs;
- filenames do not create authority.

The complete Generated Story identifier remains globally unambiguous through the Domain code:

```text
US-DSC-F01-001
US-IDN-F01-001
US-DEC-F01-001
US-BUS-F01-001
US-PLT-F01-001
```

### 2.10 Registry lifecycle gate

A registry follows the standard document lifecycle:

```text
Draft
→ In Review
→ Approved
→ Frozen
```

A Feature ID is authoritative for Generated Story allocation only after the applicable registry is Frozen.

Before Freeze:

- entries are proposals;
- Generated Story IDs must not consume them as authoritative Feature IDs.

A Frozen registry must not be edited in place.

### 2.11 Relationship to ADR-0007

This ADR supplements and preserves Accepted ADR-0007.

It does not supersede ADR-0007.

It adds Feature-ID ownership only.

It does not change:

- the V1 domain scope of Capability First;
- existing Offering Capability ownership;
- the direct V1 chain for Identity, Business, and Platform own-domain behaviour;
- direct Frozen Offering assignments;
- supporting relationship rules.

### 2.12 Story-generation gate

Generated Story production for:

```text
DSC
IDN
DEC
BUS
PLT
```

remains blocked until the applicable registry is Frozen.

Offering Story generation continues to consume Feature IDs from the Frozen Offering Capability Architecture.

---

## 3. Rationale

### 3.1 Feature identity and Capability ownership are different concerns

A Story requires a stable Feature ID even where no separate domain Capability Architecture is required.

Using a Feature Registry solves identifier ownership without creating a false Capability layer.

### 3.2 Per-domain ownership preserves repository boundaries

One registry per Story Domain:

- keeps ID allocation local;
- avoids one broad cross-domain bottleneck;
- limits review scope;
- supports independent controlled revisions;
- scales with Story growth.

### 3.3 Discovery and Decision must not duplicate existing Capabilities

Their applicable V1 behaviour already has authoritative Capability homes.

A registry can reference those homes without becoming another owner.

### 3.4 Identity, Business, and Platform must not be forced into unrelated Capabilities

Accepted ADR-0007 already protects their own-domain authority chain.

The registry records Feature identity without changing that chain.

### 3.5 Freeze before Story use prevents provisional identifiers from becoming permanent accidentally

Generated Story IDs are durable.

Requiring registry Freeze before use ensures:

- reviewed allocation;
- stable Feature names;
- no silent renumbering;
- no competing ID sources.

---

## 4. Scope

This ADR governs:

- the Feature-ID owner for non-Offering Story Domains;
- creation of five registry document types;
- registry information ownership;
- registry exclusions;
- domain-local Feature-ID semantics;
- registry lifecycle gate;
- relationship to ADR-0007;
- preservation of Offering Feature ownership;
- Generated Story allocation blocking.

This ADR does not govern:

- the actual Feature inventory;
- individual Feature IDs or names;
- Epic structure;
- Parent Story Document content;
- Generated Story content;
- Story lifecycle decisions;
- PRD or UX behaviour;
- Capability creation;
- Capability Maps;
- implementation;
- repository path selection;
- final registry template wording;
- traceability completion.

---

## 5. Consequences

### 5.1 Positive

- Story generation receives an authoritative Feature-ID path.
- ADR-0007 remains intact.
- Offering Capability Architecture remains bounded.
- Discovery and Decision do not gain duplicate Capability owners.
- Identity, Business, and Platform retain their direct V1 authority chain.
- Feature IDs become stable before Story generation.
- Each domain can evolve independently through controlled registry revisions.

### 5.2 Costs

- Five new governed architecture documents must be prepared and Frozen.
- Story generation remains blocked until applicable registry Freeze.
- Registry review adds an additional pre-Story gate.
- Parent Story Documents and traceability must later reference the registries.
- Governance and Handbook harmonization may be required in a future controlled revision.

### 5.3 Risks and safeguards

- **Risk:** Registry text begins defining behaviour.
  - **Safeguard:** §2.3 prohibits PRD, UX, and Story behaviour.
- **Risk:** Discovery or Decision Capabilities are duplicated.
  - **Safeguard:** §§2.4–2.5 allow reference only.
- **Risk:** Feature IDs are used before stable review.
  - **Safeguard:** §2.10 requires registry Freeze.
- **Risk:** One domain reuses another domain's Feature identity.
  - **Safeguard:** Feature IDs are domain-local and combined with Domain codes.
- **Risk:** Offering Feature ownership becomes split.
  - **Safeguard:** §2.8 preserves the Offering architecture as sole owner.
- **Risk:** Registry classification changes Capability ownership.
  - **Safeguard:** relationship classification is descriptive by reference only.

---

## 6. Alternatives Considered

### 6.1 One Capability Architecture document per Story Domain

Rejected.

It conflicts with ADR-0007 and would duplicate Capability ownership for Discovery and Decision.

### 6.2 One cross-domain Capability Architecture document

Rejected.

It carries the same ADR-0007 conflict and creates an excessively broad information owner.

### 6.3 Expand Offering Capability Architecture

Rejected.

It violates the Offering-only domain boundary and would turn one domain architecture into a repository-wide registry.

### 6.4 One cross-domain Feature Registry

Considered acceptable but rejected.

It would solve Feature-ID ownership but create:

- one broad allocation bottleneck;
- larger review surfaces;
- weaker domain isolation;
- higher coordination cost.

### 6.5 Allocate Feature IDs inside Parent Story Documents

Rejected.

Parent Story Documents consume Features and own Epic → Feature placement. They must not create the identifiers they consume.

### 6.6 Allow Generated Stories to allocate their own Feature IDs

Rejected.

This would make identifiers self-authorizing, permit collisions, and violate the Frozen User Story Handbook.

### 6.7 Use temporary ungoverned Feature IDs

Rejected.

Temporary identifiers would leak into filenames, references, reviews, and traceability and become difficult to reverse safely.

---

## 7. Required Follow-Ups

If this ADR is Accepted:

1. create the five Feature Registry Drafts;
2. perform Architecture Review and Final Review for each;
3. obtain explicit Owner approval;
4. obtain separate Owner Freeze;
5. keep `DSC`, `IDN`, `DEC`, `BUS`, and `PLT` Story generation blocked until applicable Freeze;
6. reconcile US-0001 and Offering Generated Stories against F01–F07;
7. rebuild US-0002 through US-0006 under the Frozen Handbook;
8. generate Stories from Frozen registries only;
9. complete Story inventory and traceability;
10. update ADR index and repository status through separate controlled work;
11. delay GitHub upload until the final repository-ready package.

No follow-up changes automatically.

---

## 8. Relationships

### 8.1 Preserves

- `ADR-0007-domain-scope-of-capability-first-rule.md`
- `OFFERING_CAPABILITY_ARCHITECTURE.md`
- `USER_STORY_HANDBOOK.md`
- `REPOSITORY_GOVERNANCE.md`

### 8.2 Supplements

- ADR-0007, by adding a Feature-ID owner without changing Capability scope;
- the Frozen User Story Handbook, by supplying the authoritative Feature-ID source it requires for non-Offering domains.

### 8.3 Does not supersede

This ADR supersedes no existing ADR.

### 8.4 Review Needed after acceptance

After acceptance, the following become Review Needed:

- User Story architecture/index records;
- US-0002 through US-0006;
- Story traceability;
- governance/handbook references where the new registry layer should later be named.

`Review Needed` is a trigger, not a lifecycle state.

---

## 9. Acceptance Record

ADR-0009 was explicitly accepted by the Product Owner / Architecture Owner on 2026-07-22.

The first acceptance produced:

```text
Status: Accepted
Version: 1.0
```

Acceptance makes the decision in this ADR authoritative.

Acceptance does not:

- allocate Feature IDs;
- approve or Freeze Feature Registries;
- generate Stories;
- modify Frozen documents;
- update GitHub automatically.
