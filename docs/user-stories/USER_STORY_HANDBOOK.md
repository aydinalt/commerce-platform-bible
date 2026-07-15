# User Story Handbook

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.9
- **Last Updated:** 2026-07-11

**Revision Note (0.2):** Controlled revision applying the outcomes of the first Architecture Review. Clarifications only — no new standards, no change to ownership or purpose. Affected sections: Story Numbering, Epic Structure, Story Ownership, Story Lifecycle, Sprint Rules, QA Strategy, Definition of Done, Story Quality Principles, Story Anti-Patterns, and a new Relationship Diagram section.

**Revision Note (0.3):** Editorial revision — added `ENGINEERING_CONSTITUTION.md` to the References section so the two documents reference each other. No standard, ownership, scope, numbering, or section order changed.

**Revision Note (0.4):** Harmonization. Recognized the Capability Architecture layer (immediately above PRD) in the Relationship Diagram and References only. No Story standard, INVEST, BDD, Definition of Ready/Done, Story lifecycle, Story ownership, or Story quality rule was changed.

**Revision Note (0.5):** Controlled, additive revision incorporating the approved Story Generation Strategy. This is not a new methodology and does not redesign the handbook. Two sections were added — "Story Generation Standards" and "Story Validation Checklist" — and the Scope ownership list and References were extended to match; the three tail sections were renumbered only (Relationship Diagram, References, Next Recommended Reading). No existing section was removed. INVEST, the BDD principles, the Story lifecycle, the Story workflow, Story ownership, and the review workflow are unchanged and remain authoritative in their existing sections. The added standards refine Story generation only; they introduce no new repository layer and do not replace this handbook. Where a new standard would otherwise touch an existing owner (Story Numbering §5, Acceptance Criteria §9, BDD §10, Definition of Done §18, Story Traceability §14, and the template's ownership of the document skeleton §3), the relationship is stated explicitly and those sections are referenced, not redefined.

**Revision Note (0.6):** Controlled clarification revision — the final controlled revision before Architecture Review. Two clarifications only; no methodology, no section, and no new standard is added. (1) §5 now distinguishes the **User Story Document ID** (`US-NNNN`, e.g. `US-0001`) from the **Generated User Story ID** (`US-OFR-F01-001`, defined in §21) and states the two are complementary, not competing. The redundant within-document `US-NNNN.n` suffix — never instantiated anywhere in the repository and superseded by the Generated Story ID as the per-Story identifier — is removed so the two do not appear as competing numbering schemes. The Document ID is retained unchanged and no repository identifier in use is replaced; §21's Story ID standard now references this clarification rather than appearing to introduce a second numbering system. (2) §18 is stated as the single authoritative owner of the Story-level Definition of Done; generated Stories reference §18 and never duplicate it. The dependency on `DEFINITION_OF_DONE.md` is removed from the Story Generation Standards (§21) and from the References. No other section changed: INVEST, BDD, Story Lifecycle, Story Ownership, the Story Validation Checklist, the Story workflow, the review workflow, and the remainder of the Story Generation Standards are unchanged.

**Revision Note (0.7):** Editorial clarification only — two wording refinements, with no methodology, architecture, ownership, numbering, standard, or section change. (1) In §21 Rule 2 (Story Anatomy), the mandatory structure is retained exactly; a short, explicitly non-normative example of what the References section typically contains was added after the mandatory list. (2) In §22 (Story Validation Checklist), the item "References complete" was reworded to "References resolve correctly" to state that the gate verifies each referenced artifact resolves to an existing authoritative document, not merely that the section is populated. No other checklist item and no other text changed.

**Revision Note (0.8):** Controlled revision resolving the Architecture Review blocking findings, with two supporting clarifications; no redesign, no new section, and no methodology, workflow, lifecycle, or review change. (1) The leading Story ID segment is renamed from `[CAPABILITY]` to `[DOMAIN]` in §5 and §21.5: it identifies the Story Document domain (for example, `OFR` = Offering domain), not an individual Capability from the Capability Architecture. This is a terminology clarification only; the identifier format is unchanged. (2) Feature IDs are stated to be owned by the corresponding Capability Architecture document (for example, `OFFERING_CAPABILITY_ARCHITECTURE.md` owns the Feature IDs used by the `US-0001` Offering Story document); the handbook consumes Feature IDs and never allocates them (§3, §5, §21.5). (3) The literal Story ID format is now defined once, in §5, which owns the Story identifier architecture; §21.5 references §5 rather than repeating the format. (4) "Decision Journey" is referenced as a `glossary.md`-owned term (§21.1) and is not defined in this handbook. Story Anatomy, Acceptance Criteria, BDD, the Story Validation Checklist, Story Workflow, Story Lifecycle, Story Ownership, INVEST, Definition of Ready, Definition of Done, and the review workflow are unchanged.

**Revision Note (0.9):** Controlled revision resolving Architecture Review blocking findings AF-1 and AF-2 only; no redesign, no new section, no new repository layer, and no change to the Generated Story ID structure. (1) AF-1 — the User Story Document scope is corrected in §5 to match the repository structure: a Story Document is allocated per Story Domain and may contain one or more Epics and one or more Features (one Document → one Domain → one or more Epics → one or more Features → the Stories within them). The prior statements that a document "groups the Stories of one Epic" or "typically one Epic's stories" are removed. Every Story still belongs to exactly one Epic and one Feature; Epic, Feature, and Story ownership and behaviour ownership (PRD) are unchanged; Story Document IDs already in use are unchanged. (2) AF-2 — the `[DOMAIN]` segment now has a Single Information Owner: `REPOSITORY_GOVERNANCE.md` owns the Story Domain Code Registry, referenced from §3, §5, and §21.5; the handbook consumes Domain codes and never allocates or redefines them, and the registry is referenced, not duplicated. Story Anatomy, Acceptance Criteria, BDD, INVEST, the Story Validation Checklist, Definition of Ready, Definition of Done, Story Lifecycle, Story Review, Sprint Rules, Feature ID ownership, and the repository hierarchy are unchanged.

> The single source of truth for the standards that govern the User Story layer: how User Stories are structured, numbered, written, sized, reviewed, traced, delivered, and maintained. It defines standards only. It contains no User Stories, no tasks, and no feature-specific acceptance criteria. Concerns owned by other documents — document lifecycle, review process, repository authority, architecture decisions, and terminology — are referenced here, never redefined.

---

## 1. Purpose

This handbook establishes the universal, timeless standards for creating and maintaining User Stories across the platform. Its purpose is to make every User Story consistent, valuable, testable, and traceable, so that the User Story layer conforms to Documentation First Development and integrates cleanly with the Foundation, PRD, and UX layers.

The handbook governs the User Story layer as a whole. It is not itself a User Story, and it defines no product behaviour.

## 2. Scope

This document is the authoritative owner of the following standards: Epic Structure, Story Numbering, Story Standard, Story Granularity, INVEST, Acceptance Criteria, BDD format, Definition of Ready, Story Ownership, Story Lifecycle (story-specific aspects only), Story Traceability (story-specific aspects only), Sprint Rules, Story Review (story-specific aspects only), QA Strategy, Definition of Done, Story Quality Principles, Story Anti-Patterns, the Story Generation Standards, and the Story Validation Checklist.

It is technology-independent and framework-independent. It contains no implementation details and no project-specific business rules.

## 3. What This Handbook Does Not Own

To preserve Single Information Owner and Reference Never Redefine, this handbook references — and does not restate — the following:

- Document states, transitions, versioning, freezing, deprecation, and archival — owned by `DOCUMENT_LIFECYCLE.md`.
- Review roles, stages, criteria, outputs, records, and the traceability-update rule — owned by `REVIEW_PROCESS.md`.
- Repository scope, authority, and roles — owned by `REPOSITORY_GOVERNANCE.md`.
- Architecture decision rules and their lifecycle — owned by `ADR_PROCESS.md`.
- Defined terms — owned by the glossary.
- The User Story document structure/skeleton — owned by the User Story template.
- Feature identifiers (Feature IDs, e.g. `F01`, `F02`) — owned by the Capability Architecture layer (for example, `OFFERING_CAPABILITY_ARCHITECTURE.md`); this handbook consumes them inside Generated Story IDs and never allocates them.
- Story Domain codes (the `[DOMAIN]` segment of a Generated Story ID, e.g. `OFR`) — owned by `REPOSITORY_GOVERNANCE.md` (its Story Domain Code Registry); this handbook consumes them inside Generated Story IDs and never allocates or redefines them.
- Product behaviour and business rules — owned by the PRDs.

## 4. Epic Structure

An Epic is a named grouping of related User Stories that together deliver a single capability.

- An Epic is only an organizational grouping of Stories. An Epic never owns business behaviour.
- Business behaviour always remains owned by the corresponding PRD. An Epic maps to exactly one capability owned by a PRD; it groups and organizes that capability's stories without defining any of its behaviour.
- An Epic has one clear goal, a bounded scope, and a finite set of stories.
- The hierarchy is intentionally shallow: Epic → Story. Epics do not nest within Epics.
- An Epic is complete when its stories are complete; an Epic introduces no behaviour of its own beyond what its stories, tracing to the PRD, deliver.

## 5. Story Numbering

Story numbering follows the repository identifier convention and does not introduce a new or project-specific scheme. Two distinct identifier concepts exist and are **complementary, not competing**: the **User Story Document ID**, which identifies a Story document, and the **Generated User Story ID**, which identifies an individual Story inside that document. They operate at different levels and never form competing numbering schemes. No existing repository identifier is replaced.

- **User Story Document ID.** A User Story document is identified as `US-NNNN`, using a zero-padded four-digit number — for example `US-0001`, `US-0002`, `US-0003`. A User Story Document is allocated per Story Domain (for example, `US-0001` is the Offering domain's Story Document); this is the stable identifier for the whole document. A Story Document ID identifies the document, and it never changes.
- **Generated User Story ID.** An individual Story inside a document is identified by the **Generated Story ID**, whose format is owned and defined here: `US-[DOMAIN]-[FEATURE_ID]-[ID]` — for example `US-OFR-F01-001`, `US-OFR-F01-002`, `US-OFR-F01-003`. The leading `[DOMAIN]` segment identifies the Story Document domain (for example, `OFR` for the Offering domain), not an individual Capability defined in the Capability Architecture. Story Domain codes such as `OFR` are a controlled vocabulary owned by `REPOSITORY_GOVERNANCE.md` (its Story Domain Code Registry); this handbook consumes them and never allocates or redefines them. A Generated Story ID identifies a single Story. Its `[FEATURE_ID]` segment consumes a Feature ID owned by the corresponding Capability Architecture document (for example, `OFFERING_CAPABILITY_ARCHITECTURE.md` owns the Feature IDs used by the `US-0001` Offering Story document); this handbook consumes Feature IDs and never allocates them. A Generated Story ID remains stable because Feature IDs remain stable even if Feature names change.
- **Complementary, not competing.** The Document ID identifies documents; the Generated Story ID identifies Stories within a document. Together they locate any Story unambiguously — the Document ID for the containing document, the Generated Story ID for the Story itself — so the repository uses both without either replacing or competing with the other.
- **Scalability.** The four-digit document number and the open-ended Generated Story ID allow the layer to grow to many documents and many Stories per document without renumbering, so numbering scales over the long term.
- **Document scope.** A User Story Document is allocated per Story Domain and may contain one or more Epics and one or more Features. The model is: one User Story Document → one Story Domain → one or more Epics → one or more Features → the Generated User Stories within them. For example, `US-0001` (the Offering domain) contains multiple Offering-domain Epics such as Offering Authoring, Offering Publication, and Offering Presentation. Every Story still belongs to exactly one Epic and exactly one Feature, and Epics remain bounded and outcome-oriented. This document-scoping model changes neither Epic ownership, Feature ownership, nor Story ownership; behaviour ownership remains with the relevant PRD, not the number. The Generated Story ID carries the domain and Feature segments, whose vocabularies are owned elsewhere — Domain codes by `REPOSITORY_GOVERNANCE.md` and Feature IDs by the Capability Architecture layer (see §3) — and are consumed here by reference.
- **Stability.** Identifiers are assigned in order and are never reused or recycled. A Story Document ID never changes; a Generated Story ID is stable for the life of the Story and is not reused when a Story is superseded.

## 6. Story Standard

Every User Story is written in a single, consistent form:

> **As a** &lt;role&gt;
> **I want** &lt;capability&gt;
> **So that** &lt;benefit&gt;

- The **role** is a defined actor. Actor definitions are owned by the relevant PRD and the glossary; the story references them.
- The **capability** is a single behaviour the actor wants.
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
- AC are derived only from approved documentation (the story's PRD and, where applicable, its UX specification). AC introduce no new product decisions.
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
- It traces to an approved PRD, and to a UX specification where the behaviour has a UX surface.
- It has testable acceptance criteria in BDD form.
- It satisfies INVEST.
- It has no unresolved blocking dependency.
- Any upstream-undecided behaviour is recorded as a TODO, not invented.

A story that is not Ready is not committed to delivery.

## 12. Story Ownership

- Each story is authored by a contributor and reviewed under `REVIEW_PROCESS.md`. Final acceptance authority rests with the Product Owner / Architecture Owner, as defined in `REPOSITORY_GOVERNANCE.md`; this handbook does not redefine that authority.
- Each story is owned by exactly one User Story document and one Epic (Single Information Owner).
- The behaviour a story expresses is owned by the story's PRD, not by the story. A story references PRD behaviour; it never redefines it.
- AI is an advisor only and never becomes the information owner of a Story.

## 13. Story Lifecycle

A User Story document moves through the document lifecycle defined in `DOCUMENT_LIFECYCLE.md` (its states, transitions, versioning, freezing, deprecation, and archival). This handbook does not redefine those states.

In addition, a story carries a **delivery status** used only for planning — for example, Ready, In Progress, or Done. Delivery status is operational only: it is a planning signal for delivery, and it never changes document authority or the document lifecycle state. It is distinct from, and does not replace, the document lifecycle status. Definition of Ready governs entry to delivery; Definition of Done governs completion of delivery.

## 14. Story Traceability

- Every story traces upward to the PRD that owns its behaviour, and to the UX specification(s) that present it where applicable.
- A story may reference an ADR where an accepted architecture decision constrains it, per `ADR_PROCESS.md`.
- Traceability is recorded and kept current per the traceability-update rule in `REVIEW_PROCESS.md`, and reflected in the traceability record; this handbook defines neither the update rule nor the record structure.
- A story that cannot be traced to an approved PRD is not Ready; the gap is recorded as a TODO.

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
- is owned by exactly one document and Epic;
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
- Monitoring / telemetry is updated where applicable.
- Feature flags are configured where applicable.

## 19. Story Quality Principles

- **One behaviour per story.**
- **Value-oriented** — every story states a benefit.
- **Testable** — every story is verifiable through its acceptance criteria.
- **Traceable** — every story references its owning PRD and, where applicable, its UX.
- **Implementation-neutral** — no technical or framework detail.
- **Single owner** — one document and one Epic per story.
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

These standards refine Story generation only. They record the approved method for generating User Stories against an approved Epic → Feature decomposition. They introduce no new repository layer, they do not replace this handbook, and they leave every existing standard in force. In particular, INVEST (§8), the BDD principles (§10), the Story lifecycle (§13), the Story workflow (Sprint Rules, §15), Story ownership (§12), and the review workflow (§16) are unchanged and remain authoritative in their existing sections. Where a standard below would otherwise touch a concern already owned elsewhere, it references that owner and does not redefine it.

**1. Story Granularity.** A Story represents one meaningful step in the user's Decision Journey — a term owned by `glossary.md`, referenced here and not defined in this handbook. Stories describe user value; tasks describe technical work. This is consistent with — and does not replace — the Story Granularity standard in §7; the sizing rules there remain in force.

**2. Story Anatomy.** Every Story shall contain exactly the following elements:

- Title
- Purpose
- Business Value
- Description
- References
- Acceptance Criteria
- BDD
- Dependencies
- Out of Scope

This enumerates the required content of a Story as a standard. The concrete document skeleton and layout remain owned by the User Story template (see §3), which this standard references and does not redefine.

By way of illustration only, the References element of a Story typically contains repository references such as:

> References
> - Capability
> - Implementation Blueprint
> - PRD
> - UX Specification
> - Epic
> - Feature

These are examples of the repository references a Story usually names; they are informative only and add no required standard beyond the mandatory structure above.

**3. Acceptance Criteria.** Acceptance Criteria shall be written as testable system behaviour. Each Acceptance Criterion begins with:

> "The system shall…"

This refines the Acceptance Criteria standard (§9) with a required phrasing. It does not change the BDD form (§10): each Acceptance Criterion's scenario remains expressed as Given / When / Then.

**4. BDD.** BDD scenarios remain inside the Story. No external BDD documents. This is consistent with §10, which is unchanged.

**5. Story ID.** Generated Story IDs follow the **Generated User Story ID** format that is owned and defined in §5; this standard references that format and does not repeat it. As §5 states, the Generated Story ID is distinct from the **User Story Document ID** (`US-NNNN`), the two are complementary, not competing, and this standard introduces no second numbering system. The leading `[DOMAIN]` segment is the Story Document domain code — for example, `OFR` is the governed code for the Offering Story Domain, not an individual Capability — and its controlled vocabulary is owned by `REPOSITORY_GOVERNANCE.md` (its Story Domain Code Registry, per §5). The `[FEATURE_ID]` segment consumes a Feature ID owned by the corresponding Capability Architecture document (per §5). This handbook consumes Domain codes and Feature IDs and allocates or redefines neither; Feature IDs remain stable even if Feature names change, which keeps the Generated Story ID stable. §5 and `REPOSITORY_GOVERNANCE.md` are referenced, not redefined.

**6. Dependency Model.** A Story declares only the following dependency types:

- Depends On
- Blocks

No additional dependency types are permitted.

**7. Story Size.** Product documentation carries product estimates only:

- XS
- S
- M
- L

No Story Points appear inside Product documentation. This does not modify INVEST (§8); it constrains only how size is expressed in Product documentation.

**8. Definition of Done.** A Story never duplicates the Definition of Done; it references §18 of this handbook, which is the single authoritative owner of the Story-level Definition of Done. A Story references that standard rather than restating it.

**9. Story Independence.** A Story should be independently understandable, independently testable, and independently deliverable whenever reasonably possible. This is consistent with INVEST (§8), which is unchanged.

**10. Story Traceability.** Every Story shall reference each of the following, without redefining any owner:

- Capability
- Implementation Blueprint
- PRD
- UX Specification
- Epic
- Feature

This complements the Story Traceability standard in §14, which remains in force; it adds the Capability, Implementation Blueprint, Epic, and Feature references that make the vertical chain legible from the Story.

**11. Duplicate Story Prevention.** A Story shall not duplicate another Story. Where overlap exists, the Stories are merged or redefined before approval. This is consistent with the Duplicated-ownership anti-pattern (§20).

**12. Story Reference Structure.** The References section of each Story shall explicitly identify:

- Capability
- Blueprint
- PRD
- UX
- Epic
- Feature

## 22. Story Validation Checklist

Every Story must satisfy each of the following before approval:

- ☐ Represents one Decision Journey step
- ☐ Provides user value
- ☐ Independently understandable
- ☐ Independently testable
- ☐ Traceable
- ☐ References resolve correctly
- ☐ No duplicate Story
- ☐ No implementation details
- ☐ No Story overlap

## 23. Relationship Diagram

This diagram shows the documentation flow only — the order in which each layer derives from the one above it. It defines no behaviour and introduces no standard. The **Capability Architecture** layer sits immediately above PRD and is defined by `OFFERING_CAPABILITY_ARCHITECTURE.md`; the official repository layer hierarchy is owned by `REPOSITORY_GOVERNANCE.md`.

```
Vision
  ↓
Foundation
  ↓
Capability Architecture
  ↓
PRD
  ↓
UX
  ↓
Epic
  ↓
Story
  ↓
Task
  ↓
Code
  ↓
Tests
  ↓
Release
```

## 24. References

- `DOCUMENT_LIFECYCLE.md` — document states and versioning.
- `REVIEW_PROCESS.md` — review and the traceability-update rule.
- `REPOSITORY_GOVERNANCE.md` — repository authority and roles, and the Story Domain Code Registry (owner of the `[DOMAIN]` codes consumed by Generated Story IDs).
- `ADR_PROCESS.md` — architecture decision records.
- `ENGINEERING_CONSTITUTION.md` — engineering philosophy and governance; it references this handbook for detailed User Story standards, and this handbook references it for engineering governance.
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — the Capability Architecture layer immediately above PRD, which owns the capability model that Epics map to.
- `OFFERING_IMPLEMENTATION_BLUEPRINT.md` — the capability-wide integration view that a generated Story references in its traceability; referenced, not redefined.
- The User Story template — the User Story document structure.
- The glossary — defined terms.

## 25. Next Recommended Reading

- The User Story template — the document structure to apply these standards within.
- `REVIEW_PROCESS.md` — how stories are reviewed and how changes propagate.
