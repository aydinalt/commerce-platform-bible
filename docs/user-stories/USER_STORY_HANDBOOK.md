# User Story Handbook

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-20

> **Approval Note (1.0).** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 following successful Formal Architecture Review and Final Review. This first approval advances the handbook from In Review v0.10 to Approved v1.0. The approval establishes this document as the authoritative source for User Story standards, including Parent Story Document and Generated Story relationships, Epic and Feature structure, Generated Story identifiers and filenames, Story wording, acceptance criteria, Definition of Ready, Definition of Done boundaries, dependencies, sizing, traceability, mandatory semantic content, and Story quality rules. Domain codes and Feature identifiers remain owned by their authoritative governance and Capability Architecture sources. This approval does not freeze the handbook, update the User Story template, change any existing Story file, or modify another repository document automatically.

> **Freeze Note (1.0).** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20. This freeze locks the Approved v1.0 baseline of `USER_STORY_HANDBOOK.md` as the canonical User Story standards reference for the current release state. The Frozen handbook must not be edited in place. Any future change requires a separate superseding revision that begins independently at Draft under a new version, while this Frozen v1.0 baseline remains preserved. The freeze does not update `docs/_templates/US-template.md`, change any existing Parent Story Document or Generated Story file, allocate Domain codes or Feature IDs, create Feature → Capability associations, or modify another repository document automatically.

**Revision Note (0.2):** Controlled revision applying the outcomes of the first Architecture Review. Clarifications only — no new standards, no change to ownership or purpose. Affected sections: Story Numbering, Epic Structure, Story Ownership, Story Lifecycle, Sprint Rules, QA Strategy, Definition of Done, Story Quality Principles, Story Anti-Patterns, and a new Relationship Diagram section.

**Revision Note (0.3):** Editorial revision — added `ENGINEERING_CONSTITUTION.md` to the References section so the two documents reference each other. No standard, ownership, scope, numbering, or section order changed.

**Revision Note (0.4):** Harmonization. Recognized the Capability Architecture layer (immediately above PRD) in the Relationship Diagram and References only. No Story standard, INVEST, BDD, Definition of Ready/Done, Story lifecycle, Story ownership, or Story quality rule was changed.

**Revision Note (0.5):** Controlled, additive revision incorporating the approved Story Generation Strategy. This is not a new methodology and does not redesign the handbook. Two sections were added — "Story Generation Standards" and "Story Validation Checklist" — and the Scope ownership list and References were extended to match; the three tail sections were renumbered only (Relationship Diagram, References, Next Recommended Reading). No existing section was removed. INVEST, the BDD principles, the Story lifecycle, the Story workflow, Story ownership, and the review workflow are unchanged and remain authoritative in their existing sections. The added standards refine Story generation only; they introduce no new repository layer and do not replace this handbook. Where a new standard would otherwise touch an existing owner (Story Numbering §5, Acceptance Criteria §9, BDD §10, Definition of Done §18, Story Traceability §14, and the template's ownership of the document skeleton §3), the relationship is stated explicitly and those sections are referenced, not redefined.

**Revision Note (0.6):** Controlled clarification revision — the final controlled revision before Architecture Review. Two clarifications only; no methodology, no section, and no new standard is added. (1) §5 now distinguishes the **User Story Document ID** (`US-NNNN`, e.g. `US-0001`) from the **Generated User Story ID** (`US-OFR-F01-001`, defined in §21) and states the two are complementary, not competing. The redundant within-document `US-NNNN.n` suffix — never instantiated anywhere in the repository and superseded by the Generated Story ID as the per-Story identifier — is removed so the two do not appear as competing numbering schemes. The Document ID is retained unchanged and no repository identifier in use is replaced; §21's Story ID standard now references this clarification rather than appearing to introduce a second numbering system. (2) §18 is stated as the single authoritative owner of the Story-level Definition of Done; generated Stories reference §18 and never duplicate it. The dependency on `DEFINITION_OF_DONE.md` is removed from the Story Generation Standards (§21) and from the References. No other section changed: INVEST, BDD, Story Lifecycle, Story Ownership, the Story Validation Checklist, the Story workflow, the review workflow, and the remainder of the Story Generation Standards are unchanged.

**Revision Note (0.7):** Editorial clarification only — two wording refinements, with no methodology, architecture, ownership, numbering, standard, or section change. (1) In §21 Rule 2 (Story Anatomy), the mandatory structure is retained exactly; a short, explicitly non-normative example of what the References section typically contains was added after the mandatory list. (2) In §22 (Story Validation Checklist), the item "References complete" was reworded to "References resolve correctly" to state that the gate verifies each referenced artifact resolves to an existing authoritative document, not merely that the section is populated. No other checklist item and no other text changed.

**Revision Note (0.8):** Controlled revision resolving the Architecture Review blocking findings, with two supporting clarifications; no redesign, no new section, and no methodology, workflow, lifecycle, or review change. (1) The leading Story ID segment is renamed from `[CAPABILITY]` to `[DOMAIN]` in §5 and §21.5: it identifies the Story Document domain (for example, `OFR` = Offering domain), not an individual Capability from the Capability Architecture. This is a terminology clarification only; the identifier format is unchanged. (2) Feature IDs are stated to be owned by the corresponding Capability Architecture document (for example, `OFFERING_CAPABILITY_ARCHITECTURE.md` owns the Feature IDs used by the `US-0001` Offering Story document); the handbook consumes Feature IDs and never allocates them (§3, §5, §21.5). (3) The literal Story ID format is now defined once, in §5, which owns the Story identifier architecture; §21.5 references §5 rather than repeating the format. (4) "Decision Journey" is referenced as a `glossary.md`-owned term (§21.1) and is not defined in this handbook. Story Anatomy, Acceptance Criteria, BDD, the Story Validation Checklist, Story Workflow, Story Lifecycle, Story Ownership, INVEST, Definition of Ready, Definition of Done, and the review workflow are unchanged.

**Revision Note (0.9):** Controlled revision resolving Architecture Review blocking findings AF-1 and AF-2 only; no redesign, no new section, no new repository layer, and no change to the Generated Story ID structure. (1) AF-1 — the User Story Document scope is corrected in §5 to match the repository structure: a Story Document is allocated per Story Domain and may contain one or more Epics and one or more Features (one Document → one Domain → one or more Epics → one or more Features → the Stories within them). The prior statements that a document "groups the Stories of one Epic" or "typically one Epic's stories" are removed. Every Story still belongs to exactly one Epic and one Feature; Epic, Feature, and Story ownership and behaviour ownership (PRD) are unchanged; Story Document IDs already in use are unchanged. (2) AF-2 — the `[DOMAIN]` segment now has a Single Information Owner: `REPOSITORY_GOVERNANCE.md` owns the Story Domain Code Registry, referenced from §3, §5, and §21.5; the handbook consumes Domain codes and never allocates or redefines them, and the registry is referenced, not duplicated. Story Anatomy, Acceptance Criteria, BDD, INVEST, the Story Validation Checklist, Definition of Ready, Definition of Done, Story Lifecycle, Story Review, Sprint Rules, Feature ID ownership, and the repository hierarchy are unchanged.

**Revision Note (0.10):** Controlled revision resolving the final handbook review findings against the Frozen governance baseline and the existing Offering Story architecture. It corrects the Epic model from a direct Epic → Story / one-Capability relationship to the repository's actual Parent Story Document → Domain → Epic → Feature → Generated Story structure; keeps Capability definitions, Feature IDs, and Feature → Capability associations with the applicable Capability Architecture owner; distinguishes Parent Story Documents from individual Generated Story files; completes Generated Story sequence and filename rules; aligns Story approval terminology, lifecycle separation, Definition of Ready, and traceability with `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `REPOSITORY_GOVERNANCE.md`, and `ADR_PROCESS.md`; reconciles Story Anatomy with the Golden Story structure; makes Capability and Implementation Blueprint references conditional on authoritative applicability; removes duplicated reference rules; and replaces the noncanonical relationship diagram with the official repository hierarchy plus the internal User Story decomposition. The User Story template and existing Story files are not modified automatically and become separate review targets where they conflict with this handbook.

**Review Entry Note (0.10):** Entered formal review after the controlled corrections above were applied. Reviewer role overlap is disclosed in the review record: ChatGPT drafted and materially corrected this revision and performed separate Architecture Review and Final Review passes under `REVIEW_PROCESS.md`. No Owner approval or freeze is inferred.

**Revision Note (1.0):** First approval. Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after Formal Architecture Review and Final Review completed with no remaining corrections. The handbook advances from In Review v0.10 to Approved v1.0. The authoritative Story decomposition is Parent Story Document → Story Domain → Epic → Feature → Generated Story. Each Generated Story belongs to exactly one Parent Story Document, one Epic, and one Feature. The handbook consumes Domain codes, Feature IDs, and applicable Feature → Capability associations from their owning sources and does not allocate or redefine them. Freeze remains a separate Owner decision. Template conformance and review of materially affected existing Story documents remain separate controlled work.

**Freeze Record (1.0):** Frozen by explicit decision of the Product Owner / Architecture Owner on 2026-07-20 after first approval as v1.0. The lifecycle transition is Approved v1.0 → Frozen v1.0; the version remains 1.0. The handbook baseline is now locked against in-place edits. Future change requires a superseding Draft revision under a new version. User Story template conformance and review of materially affected existing Story documents remain separate controlled work.

> The single source of truth for the standards that govern the User Story layer: how User Stories are structured, numbered, written, sized, reviewed, traced, delivered, and maintained. It defines standards only. It contains no User Stories, no tasks, and no feature-specific acceptance criteria. Concerns owned by other documents — document lifecycle, review process, repository authority, architecture decisions, and terminology — are referenced here, never redefined.

---

## 1. Purpose

This handbook establishes the universal, timeless standards for creating and maintaining User Stories across the platform. Its purpose is to make every User Story consistent, valuable, testable, and traceable, so that the User Story layer conforms to Documentation First Development and integrates cleanly with the upstream Foundation, Capability Architecture, PRD, and UX layers and the downstream Engineering and Development layers.

The handbook governs the User Story layer as a whole. It is not itself a User Story, and it defines no product behaviour.

## 2. Scope

This document is the authoritative owner of the following standards: Parent Story Document organization; Epic and Feature use within the User Story layer; Story numbering and filenames; Story Standard; Story Granularity; INVEST; Acceptance Criteria; BDD format; Definition of Ready; Story Ownership; Story Lifecycle (story-specific aspects only); Story Traceability (story-specific aspects only); Sprint Rules; Story Review (story-specific aspects only); QA Strategy; Definition of Done; Story Quality Principles; Story Anti-Patterns; Story Generation Standards; and the Story Validation Checklist.

It is technology-independent and framework-independent. It contains no implementation details and no project-specific business rules.

## 3. What This Handbook Does Not Own

To preserve Single Information Owner and Reference Never Redefine, this handbook references — and does not restate — the following:

- Document states, transitions, versioning, freezing, deprecation, and archival — owned by `DOCUMENT_LIFECYCLE.md`.
- Review roles, stages, criteria, outputs, records, and the traceability-update rule — owned by `REVIEW_PROCESS.md`.
- Repository scope, authority, and roles — owned by `REPOSITORY_GOVERNANCE.md`.
- Architecture decision rules and their lifecycle — owned by `ADR_PROCESS.md`.
- Defined terms — owned by the glossary.
- The concrete User Story file layout, section order, and placeholders — implemented by the User Story template. The template consumes the mandatory content standards in this handbook and may not redefine them.
- Capability definitions, Feature identifiers, and authoritative Feature → Capability associations — owned by the applicable Capability Architecture document where assigned (for example, `OFFERING_CAPABILITY_ARCHITECTURE.md` for the Offering domain). This handbook consumes them by reference and never allocates or redefines them.
- Story Domain codes (the `[DOMAIN]` segment of a Generated Story ID, e.g. `OFR`) — owned by `REPOSITORY_GOVERNANCE.md` (its Story Domain Code Registry); this handbook consumes them inside Generated Story IDs and never allocates or redefines them.
- Product behaviour and business rules — owned by the PRDs.

## 4. Epic and Feature Structure

A Parent Story Document is allocated to one Story Domain and organizes that domain's work through a bounded Epic → Feature decomposition.

- An **Epic** is an outcome-oriented grouping of one or more related Features. It has one clear goal, a bounded scope, and a finite set of Features.
- An Epic is organizational only. It owns neither product behaviour nor Capability definitions.
- Product behaviour remains owned by the relevant PRD.
- Capability definitions and authoritative Feature → Capability associations remain owned by the applicable Capability Architecture document where assigned.
- A single Epic may contain Features associated with different Capabilities. An Epic therefore does not map automatically or exclusively to one Capability.
- A **Feature** is the structural unit beneath an Epic and above Generated Stories. Feature identifiers and Feature → Capability associations are consumed from their applicable owner; the Parent Story Document records the Feature's placement under an Epic by reference.
- Every Feature belongs to exactly one Epic within its Parent Story Document.
- Every Generated Story belongs to exactly one Feature and, through that Feature, exactly one Epic.
- Epics do not nest within Epics, and Features do not nest within Features.
- An Epic is complete when all of its in-scope Features and their required Stories are complete or explicitly closed.

The internal organization is:

```text
Parent Story Document
→ one Story Domain
→ one or more Epics
→ one or more Features
→ one or more Generated Stories
```

## 5. Story Numbering and Filenames

Two distinct identifier concepts exist and are complementary, not competing:

1. the **Parent Story Document ID**, which identifies the domain-level Story document;
2. the **Generated User Story ID**, which identifies one individual Story file attached to a Feature.

### 5.1 Parent Story Document ID

A Parent Story Document uses:

```text
US-NNNN
```

- `NNNN` is a zero-padded four-digit sequential number, for example `US-0001`, `US-0002`, and `US-0003`.
- One Parent Story Document is allocated per Story Domain.
- The identifier is stable and never reused.
- The canonical filename is:

```text
US-NNNN-kebab-case-domain.md
```

### 5.2 Generated User Story ID

An individual Generated Story uses:

```text
US-[DOMAIN]-[FEATURE_ID]-[ID]
```

Example:

```text
US-OFR-F01-001
```

- `US` is the prefix owned by this handbook.
- `[DOMAIN]` is the Story Domain code owned by the Story Domain Code Registry in `REPOSITORY_GOVERNANCE.md`.
- `[FEATURE_ID]` is an authoritative Feature ID consumed from the applicable Capability Architecture owner.
- `[ID]` is a zero-padded three-digit Story sequence scoped to that Feature, beginning at `001`.
- Story sequence values are assigned in order within the Feature and are never reused, including after a Story is deprecated or superseded.
- A Generated Story ID remains stable for the life of the Story.
- The canonical filename is:

```text
US-[DOMAIN]-[FEATURE_ID]-[ID]-kebab-case-title.md
```

If an authoritative Feature ID does not yet exist, a Generated Story ID cannot be allocated and Story generation remains blocked. The handbook never invents a Feature ID or a Feature → Capability association.

### 5.3 Containment and stability

The Parent Story Document identifies the domain container. The Generated User Story ID identifies the individual Story file within that domain's Epic → Feature organization.

Every Generated Story:

- is contained by exactly one Parent Story Document;
- belongs to exactly one Feature;
- belongs, through that Feature, to exactly one Epic;
- uses a Domain code and Feature ID owned elsewhere;
- retains its identifier even if its title changes.

## 6. Story Standard

Every User Story is written in a single, consistent form:

> **As a** &lt;role&gt;
> **I want** &lt;desired behaviour&gt;
> **So that** &lt;benefit&gt;

- The **role** is a defined actor. Actor definitions are owned by the relevant PRD and the glossary; the story references them.
- The **desired behaviour** is one observable behaviour the actor wants. The word “behaviour” here does not allocate or redefine a Capability Architecture capability.
- The **benefit** states the value the behaviour provides.

One story expresses exactly one behaviour for one actor. A story that requires "and" to join unrelated behaviours is more than one story.

## 7. Story Granularity

A story is sized to be delivered within a single iteration and to be independently testable, while still delivering value on its own.

- Split stories by **workflow step** or by **business rule**, never by technical layer.
- A story that cannot be delivered in one iteration is too large and is an Epic or a set of stories.
- A story that delivers no observable value on its own is too small and is a task, not a story.

## 8. INVEST

Every story is measured against the INVEST criteria:

- **Independent** — deliverable without depending on the internals of another story.
- **Negotiable** — a statement of intent, not a rigid contract; details are refined collaboratively.
- **Valuable** — delivers observable value to an actor.
- **Estimable** — understood well enough to size.
- **Small** — fits within a single iteration.
- **Testable** — has acceptance criteria that can be objectively verified.

A story that fails an INVEST criterion is revised or split before it proceeds.

## 9. Acceptance Criteria

Every story has acceptance criteria (AC) that define, in observable terms, when the story is complete.

- AC are testable, unambiguous, and complete for the behaviour the story expresses.
- AC are derived from the canonical upstream PRD and, where applicable, its UX specification. A Story may be drafted while an upstream source is non-authoritative, but it is not Ready until the behaviour is supported by the authoritative upstream sources required by §11. AC introduce no new product decisions.
- Where upstream documentation intentionally leaves behaviour undecided, the AC records a TODO rather than inventing behaviour.
- AC describe outcomes, not implementation.

## 10. Behaviour-Driven Development (BDD) Format

Acceptance criteria are expressed in Behaviour-Driven Development form:

> **Given** &lt;context&gt;
> **When** &lt;action&gt;
> **Then** &lt;observable outcome&gt;

- One scenario expresses one distinct behaviour.
- Scenarios are declarative (what happens), not imperative (how it is done), and remain technology-independent.
- Additional context or outcomes use "And" within the same scenario; unrelated behaviour uses a separate scenario.

## 11. Definition of Ready

A story is **Ready** — eligible to be committed to delivery — only when all of the following hold:

- It is written in the Story Standard form.
- Its behaviour traces to a canonical PRD in an authoritative lifecycle state (`Approved` or `Frozen`).
- Where the behaviour has a UX surface, it traces to the applicable canonical UX specification, and that UX specification is `Frozen` before the Story is committed to delivery.
- Its Parent Story Document identifies the Epic and Feature to which it belongs.
- Its Domain code and Feature ID resolve to their authoritative owners.
- Any required Feature → Capability association is referenced when assigned; no association is invented where the owner records it as undecided or deferred.
- It has testable acceptance criteria in BDD form.
- It satisfies INVEST.
- It has no unresolved blocking dependency.
- Any upstream-undecided behaviour is recorded as a TODO, not invented.

A story that is not Ready is not committed to delivery.

## 12. Story Ownership

- Each Story is authored by a contributor and reviewed under `REVIEW_PROCESS.md`. Final approval authority for a Story document rests with the Product Owner / Architecture Owner, as defined in `REPOSITORY_GOVERNANCE.md`; this handbook does not redefine that authority.
- Each Generated Story file is the Single Information Owner of its own Story text, Acceptance Criteria, BDD scenarios, dependencies, size, scope exclusions, and delivery metadata.
- Each Generated Story is contained by exactly one Parent Story Document, belongs to exactly one Feature, and belongs through that Feature to exactly one Epic.
- The Parent Story Document owns the domain's Epic → Feature organization and records generated Story files by reference; it does not duplicate their full content.
- The behaviour a Story expresses is owned by the Story's PRD, not by the Story. A Story references PRD behaviour; it never redefines it.
- AI is an advisor only and never becomes the information owner of a Story.

## 13. Story Lifecycle

Each Parent Story Document and each Generated Story file carries its own document lifecycle Status and Version under `DOCUMENT_LIFECYCLE.md`. One file's lifecycle state does not advance another file automatically.

A Generated Story may also carry a **delivery status** used only for planning — for example, Not Started, Ready, In Progress, or Done. Delivery status is operational only: it is a planning signal and never changes document authority or lifecycle Status. This handbook standardizes the Ready and Done gates through §§11 and 18; it does not turn delivery workflow labels into document lifecycle states.

## 14. Story Traceability

- Every Story traces to its Parent Story Document, Epic, Feature, behaviour-owning PRD, and applicable UX specification.
- Every Story references the owner of its Domain code and the applicable owner of its Feature ID.
- A Story references a Capability Architecture document and Feature → Capability association where an authoritative association exists. Where an association is explicitly undecided or deferred, the Story records that state by reference and does not invent a Capability home.
- A Story references an Implementation Blueprint only where an authoritative Blueprint exists and is applicable to the Story. Blueprint absence does not create an implied repository layer or permit invention.
- A Story references an ADR where an Accepted architectural decision constrains it, per `ADR_PROCESS.md`.
- Traceability is recorded and kept current per the traceability-update rule in `REVIEW_PROCESS.md`, and reflected in the traceability record; this handbook defines neither the update rule nor the record structure.
- A Story that cannot be traced to an authoritative PRD is not Ready; the gap is recorded as a TODO.

## 15. Sprint Rules

Delivery cadence is governed by methodology-neutral rules, independent of any tool or framework:

- Only Ready stories are committed to an iteration.
- Stories are committed according to the Sprint Goal rather than priority alone; priority informs selection, but the Sprint Goal determines which Ready stories are committed together.
- A story is delivered whole; partial completion does not count as Done.
- Committed scope is stable within an iteration; new scope becomes a new story rather than an expansion of a committed one.
- Unfinished stories return to the backlog and are re-committed only when still Ready.

## 16. Story Review

Stories are reviewed under `REVIEW_PROCESS.md`. Story-specific review additionally confirms that a story:

- follows the Story Standard form and satisfies INVEST;
- has testable acceptance criteria in BDD form;
- traces correctly to its PRD and UX;
- is contained by exactly one Parent Story Document and belongs to exactly one Feature and one Epic;
- introduces no new product decision and no implementation detail;
- uses terminology consistent with the glossary.

Review outcomes and records follow `REVIEW_PROCESS.md`.

## 17. QA Strategy

Quality is verified against the story's acceptance criteria.

- Every acceptance criterion is objectively verifiable.
- A story is not Done until all of its acceptance criteria are demonstrably met.
- Verification is behaviour-focused — concerned with what the system does, not how it is built — and is technology-independent. This handbook defines the strategy, not the tools, environments, or frameworks used to execute it.
- **Regression.** Previously verified behaviour must remain verified as new stories are delivered; a story is not Done if it invalidates behaviour that other completed stories established. Regression verification is behaviour-focused and technology-independent.

## 18. Definition of Done

This handbook is the single authoritative owner of the Story-level Definition of Done. The standard is defined here, in this section; no separate document owns it. Generated Stories reference this section (§18) and never duplicate the Definition of Done.

A story is **Done** only when all of the following hold:

- Every acceptance criterion is met and verified.
- The story conforms to this handbook.
- Traceability is updated per `REVIEW_PROCESS.md`.
- Review is complete per `REVIEW_PROCESS.md`.
- No upstream-undecided behaviour has been silently implemented; recorded TODOs remain TODOs until their owning document decides them.
- Applicable Engineering, QA, observability, and release obligations owned by `ENGINEERING_CONSTITUTION.md` are satisfied or explicitly recorded as not applicable; this handbook does not redefine those technical gates.

## 19. Story Quality Principles

- **One behaviour per story.**
- **Value-oriented** — every story states a benefit.
- **Testable** — every story is verifiable through its acceptance criteria.
- **Traceable** — every story references its owning PRD and, where applicable, its UX.
- **Implementation-neutral** — no technical or framework detail.
- **Single owner** — one Generated Story file, one Parent Story Document, one Feature, and one Epic per Story.
- **Reference, never redefine** — behaviour and terms are referenced from their owners.
- **No new product decisions** — undecided behaviour is a TODO, not an invention.
- **Deterministic** — a story's behaviour should be deterministic and unambiguous: the same actor performing the same action under the same conditions should always reach the same defined outcome, leaving no room for interpretation.

## 20. Story Anti-Patterns

The following are not permitted:

- **Technical-task stories** — stories written from an implementation viewpoint rather than an actor's need.
- **Benefit-less stories** — stories with no "so that" value.
- **Oversized stories** — Epic-sized work presented as a single story.
- **Undersized stories** — tasks with no standalone value presented as stories.
- **Implementation-bearing stories** — stories that specify how rather than what.
- **Invented behaviour** — stories that assert behaviour no PRD owns.
- **Duplicated ownership** — the same behaviour owned by more than one story.
- **Untestable or restating acceptance criteria** — AC that cannot be verified, or that merely repeat the story.
- **Non-deliverable dependencies** — a story that cannot be completed because of an unresolved blocking dependency.
- **Redefinition** — a story that redefines a term or PRD behaviour instead of referencing it.
- **Stories depending on undocumented assumptions** — a story that relies on behaviour, context, or decisions not recorded in an owning document.

## 21. Story Generation Standards

These standards govern generation of individual Story files from a reviewed Parent Story Document's Epic → Feature organization. Story generation also requires authoritative identifier inputs: the Domain code must resolve to `REPOSITORY_GOVERNANCE.md`, and the Feature ID must resolve to its applicable Capability Architecture owner. Generation does not make the Parent Story Document, PRD, UX, Capability Architecture, or Story authoritative.

**1. Story Granularity.** A Story represents one meaningful step in the user's Decision Journey — a term owned by `glossary.md`, referenced here and not defined in this handbook. Stories describe user value; tasks describe technical work. The sizing rules in §7 remain in force.

**2. Mandatory Story Content.** Every Generated Story contains, at minimum:

- Metadata;
- Story Identification;
- Purpose;
- Business Value, including the canonical As a / I want / So that statement;
- Description;
- References;
- Acceptance Criteria;
- BDD scenarios;
- Dependencies;
- Story Size;
- Out of Scope;
- a reference to Definition of Ready (§11);
- a reference to Definition of Done (§18);
- the Story Validation Checklist (§22).

This handbook owns the mandatory semantic content. The User Story template implements the concrete layout, order, headings, and placeholders and must conform to this list without redefining it.

**3. Acceptance Criteria.** Acceptance Criteria are written as testable system behaviour. Each criterion begins with:

> “The system shall…”

This refines §9. Each criterion's behaviour is also represented through one or more Given / When / Then scenarios under §10.

**4. BDD.** BDD scenarios remain inside the Story file. An external BDD document does not replace the Story's own scenarios.

**5. Story ID.** Generated Story IDs and filenames follow §5. Domain codes and Feature IDs must already exist in their authoritative registries. No Story generator allocates either identifier vocabulary.

**6. Dependency Model.** A Story declares only:

- **Depends On**
- **Blocks**

`Depends On` and `Blocks` are directional inverse views of the same dependency. Additional relationship labels such as Blocked By, Related To, or Duplicate Of are not normative Story dependency types.

**7. Story Size.** Product documentation uses only:

- XS
- S
- M
- L

No Story Points or `XL` size appear in Product documentation. Size expresses product-delivery scope, not implementation effort.

**8. Definition of Done.** A Story references §18 and never duplicates the Story-level Definition of Done.

**9. Story Independence.** A Story should be independently understandable, independently testable, and independently deliverable whenever reasonably possible, consistent with INVEST (§8).

**10. Story References and Traceability.** Every Story explicitly references:

- its Parent Story Document;
- its Epic;
- its Feature and authoritative Feature ID owner;
- its behaviour-owning PRD;
- its applicable UX specification where the behaviour has a UX surface;
- the Story Domain Code Registry owner;
- this handbook.

It additionally references, when applicable:

- the authoritative Capability Architecture document and Feature → Capability association;
- an Implementation Blueprint that actually exists and applies;
- Accepted ADRs that constrain the Story;
- additional PRDs or UX specifications needed for cross-domain behaviour.

A missing optional reference is not replaced with invented architecture. A missing required authoritative input blocks readiness or generation as stated in §§5 and 11.

**11. Duplicate Story Prevention.** A Story does not duplicate another Story. Where overlap exists, the Stories are merged, split, or re-bounded before Owner approval. Duplication is not represented through an additional dependency type.

## 22. Story Validation Checklist

Every Generated Story must satisfy each item before Final Review recommends it for Owner approval:

- ☐ Represents one Decision Journey step
- ☐ Provides user value
- ☐ Uses the canonical Story Standard
- ☐ Is independently understandable
- ☐ Is independently testable
- ☐ Is contained by one Parent Story Document
- ☐ Belongs to one Epic and one Feature
- ☐ Uses an authoritative Domain code and Feature ID
- ☐ Does not invent a Feature → Capability association
- ☐ Traces to an authoritative PRD and applicable UX
- ☐ Required references resolve correctly
- ☐ Conditional Capability, Blueprint, and ADR references are included only where applicable
- ☐ Acceptance Criteria and BDD are consistent
- ☐ Definition of Ready and Definition of Done are referenced, not duplicated
- ☐ Uses only Depends On and Blocks dependency types
- ☐ Uses XS, S, M, or L sizing
- ☐ Contains no duplicate Story or overlapping behaviour
- ☐ Contains no implementation details
- ☐ Contains no silent upstream assumption

## 23. Relationship Diagrams

The official repository documentation hierarchy is owned by `REPOSITORY_GOVERNANCE.md` and is referenced here exactly:

```text
Foundation
→ Capability Architecture
→ PRD
→ UX
→ User Stories
→ Engineering
→ Development
```

Within the User Stories layer, this handbook owns the following internal organization standard:

```text
Parent Story Document
→ Story Domain
→ Epic
→ Feature
→ Generated Story file
```

The internal organization is not an additional repository layer hierarchy. Tasks, code, tests, and releases are downstream delivery artifacts governed by their applicable owners and are not inserted into the official documentation hierarchy by this handbook.

## 24. References

- `DOCUMENT_LIFECYCLE.md` — standard document states, transitions, versioning, freezing, deprecation, and archival.
- `REVIEW_PROCESS.md` — review mechanics, verdicts, propagation, records, and the traceability-update rule.
- `REPOSITORY_GOVERNANCE.md` — repository authority, official documentation hierarchy, roles, and the Story Domain Code Registry.
- `ADR_PROCESS.md` — ADR-specific lifecycle, acceptance, maintenance, and supersession.
- `ADR-0004-capability-architecture-layer-recognition.md` — Accepted recognition of Capability Architecture as an official repository layer.
- `ENGINEERING_CONSTITUTION.md` — engineering, QA, observability, and release gates referenced by Story completion without being redefined here.
- The applicable Capability Architecture document — Capability definitions, Feature IDs, and authoritative Feature → Capability associations where assigned.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — the Offering-domain Capability Architecture and Feature Registry; an Offering-specific example, not the owner of the repository-wide layer.
- An applicable Implementation Blueprint — a capability-wide integration view when one exists; not a universal mandatory reference.
- The User Story template — the concrete Story file layout that must conform to this handbook.
- `glossary.md` — defined terminology, including Decision Journey.

## 25. Next Recommended Reading

- The User Story template — the layout implementation that must be reconciled to and validated against these standards.
- `REVIEW_PROCESS.md` — how stories are reviewed and how changes propagate.
