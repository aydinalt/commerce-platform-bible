<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.18
Last Updated: 2026-09-07
-->

# REPOSITORY INDEX

## Root Documents

| Document             | Purpose                                 |
| -------------------- | --------------------------------------- |
| `README.md`          | Repository entry point                  |
| `CURRENT_STATUS.md`  | Current operational source-state report |
| `PROJECT_ROADMAP.md` | Milestones and execution gates          |
| `CHANGELOG.md`       | Repository change history               |

## Repository Management

| Document                                                                       | Purpose                                                                                                                                |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/repository/REPOSITORY_INDEX.md`                                          | Canonical document inventory                                                                                                           |
| `docs/repository/DOCUMENT_DEPENDENCY_MAP.md`                                   | Documentation dependency direction                                                                                                     |
| `docs/traceability.md`                                                         | Frozen v2.3 cross-tier traceability baseline                                                                                           |
| `docs/glossary.md`                                                             | Canonical terminology reference; records terms, resolves none                                                                          |
| `docs/traceability-v1.0-superseded.md`, `-v1.1-`, `-v2.0-`, `-v2.1-`, `-v2.2-` | Five superseded baselines, preserved unchanged. Each is kept because a superseded baseline is the evidence that the correction was one |

## Governance and Standards

| Path                                           | State       |
| ---------------------------------------------- | ----------- |
| `docs/governance/REPOSITORY_GOVERNANCE.md`     | Frozen v1.0 |
| `docs/governance/DOCUMENT_LIFECYCLE.md`        | Frozen v1.0 |
| `docs/governance/REVIEW_PROCESS.md`            | Frozen v1.0 |
| `docs/governance/ADR_PROCESS.md`               | Frozen v1.0 |
| `docs/user-stories/USER_STORY_HANDBOOK.md`     | Frozen v1.0 |
| `docs/engineering/ENGINEERING_CONSTITUTION.md` | Frozen v1.0 |

## Review Evidence

| Path                                                                            | Purpose                                                                               |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `docs/reviews/TRACEABILITY_ARCHITECTURE_AND_FINAL_REVIEW_2026-07-25.md`         | Repository-wide Feature-level traceability validation                                 |
| `docs/reviews/ENGINEERING_CONSTITUTION_REVIEW_CLOSURE_2026-07-25.md`            | Engineering Constitution repository-current closure validation and lifecycle evidence |
| `docs/reviews/MARKETPLACE_BIBLE_V1_FINAL_FREEZE_GATE_2026-07-25.md`             | Repository-wide Final Freeze Gate evidence                                            |
| `docs/reviews/V1_SOFTWARE_ARCHITECTURE_REVIEW_2026-07-25.md`                    | V1 Software Architecture formal Architecture Review evidence                          |
| `docs/reviews/V1_SOFTWARE_ARCHITECTURE_FINAL_REVIEW_2026-07-25.md`              | V1 Software Architecture Final Review and ADR acceptance evidence                     |
| `docs/reviews/V1_SOFTWARE_ARCHITECTURE_OWNER_APPROVAL_AND_FREEZE_2026-07-25.md` | Exact v0.2 Owner Approval and separate V1 Software Architecture v1.0 Freeze evidence  |

## Release Baseline

| Path                                             | State       |
| ------------------------------------------------ | ----------- |
| `docs/releases/MARKETPLACE_BIBLE_V1_BASELINE.md` | Frozen v1.0 |

## Foundation

`docs/foundation/` contains five Frozen documents: Vision, Mission, Product Manifesto, Product Principles, and V1 Scope.

## Architecture Decisions

`docs/adr/` contains Accepted ADR-0001 through ADR-0014. `docs/adr/README.md` is the authoritative ADR index.

## V1 Software Architecture

`docs/software-architecture/` contains the Owner Approved and Frozen V1
Software Architecture v1.0 baseline.

## Implementation

| Path                                                 | Purpose                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `docs/implementation/IMPLEMENTATION_BACKLOG.md`      | Orders all 50 Frozen Generated Stories into delivery increments                                         |
| `docs/implementation/DELIVERY_SEQUENCE.md`           | Defines increment gates and the first vertical slice                                                    |
| `docs/implementation/V1_LAUNCH_RUNBOOK.md`           | The order of the launch: reset, import, verify, open                                                    |
| `docs/implementation/V1_SECURITY_REVIEW.md`          | V1 security posture, including the dependency-audit gate that is still red and the three options for it |
| `docs/implementation/FEED_MATCHING_OPEN_DECISION.md` | Closed. Kept as the record of a decision the Owner took rather than one the code took quietly           |
| `apps/`                                              | Independently deployable Web, API, and Worker processes                                                 |
| `packages/`                                          | Shared technical contracts, configuration, observability, and test utilities                            |
| `modules/`                                           | Reserved product-domain ownership boundaries                                                            |

## PRD Layer

| Document                  | State                                                  |
| ------------------------- | ------------------------------------------------------ |
| PRD-0001 Offering         | Frozen v4.3                                            |
| PRD-0002 Discovery        | Frozen v3.0                                            |
| PRD-0003 Identity         | Frozen v3.1                                            |
| PRD-0004 Decision         | Frozen v1.2                                            |
| PRD-0005 Business         | Frozen v1.4                                            |
| PRD-0006 Platform         | Frozen v2.6                                            |
| PRD-0007 Member Area      | Frozen v1.0                                            |
| PRD-0008 Sub-Admin Tier   | **Draft v0.2 — V1.1, outside the Frozen V1 baseline**  |
| PRD-0009 Editorial Review | **Frozen v0.3 — V1.1, outside the Frozen V1 baseline** |

## UX Layer

| Document                   | State                                              |
| -------------------------- | -------------------------------------------------- |
| UX-0001 Home               | Frozen v1.1                                        |
| UX-0002 Discovery          | Frozen v1.3                                        |
| UX-0003 Offering Detail    | Frozen v1.2                                        |
| UX-0004 Compare            | Frozen v1.0                                        |
| UX-0005 Business Dashboard | Frozen v1.0                                        |
| UX-0006 Admin Dashboard    | Frozen v1.1                                        |
| UX-0007 Messaging          | Draft v0.2; outside the current Frozen V1 baseline |
| UX-0008 Authentication     | Frozen v1.0                                        |
| UX-0009 Decision Flow      | Frozen v1.0                                        |

## Capability and Feature-ID Ownership

| Path                                                           | Scope                                                                 | State                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| `docs/capabilities/OFFERING_CAPABILITY_ARCHITECTURE.md`        | Offering Feature IDs and applicable Feature → Capability associations | Frozen v2.0            |
| `docs/user-stories/architecture/DISCOVERY_FEATURE_REGISTRY.md` | Discovery Feature IDs                                                 | Frozen v1.0            |
| `docs/user-stories/architecture/IDENTITY_FEATURE_REGISTRY.md`  | Identity Feature IDs                                                  | Frozen v1.0            |
| `docs/user-stories/architecture/DECISION_FEATURE_REGISTRY.md`  | Decision Feature IDs                                                  | Frozen v1.0            |
| `docs/user-stories/architecture/BUSINESS_FEATURE_REGISTRY.md`  | Business Feature IDs                                                  | Frozen v1.0            |
| `docs/user-stories/architecture/EDITORIAL_FEATURE_REGISTRY.md` | Editorial Feature IDs (`EDT`)                                         | **Frozen v1.0 — V1.1** |
| `docs/user-stories/architecture/PLATFORM_FEATURE_REGISTRY.md`  | Platform Feature IDs `F01`–`F14`                                      | Frozen v1.4            |

## User Story Layer

| Domain    | Parent path                                           | Generated Story path           | Count | State                                             |
| --------- | ----------------------------------------------------- | ------------------------------ | ----: | ------------------------------------------------- |
| Offering  | `docs/user-stories/architecture/US-0001-offering.md`  | `docs/user-stories/offering/`  |     7 | Frozen                                            |
| Discovery | `docs/user-stories/architecture/US-0002-discovery.md` | `docs/user-stories/discovery/` |    16 | Frozen                                            |
| Identity  | `docs/user-stories/architecture/US-0003-identity.md`  | `docs/user-stories/identity/`  |     9 | Frozen                                            |
| Decision  | `docs/user-stories/architecture/US-0004-decision.md`  | `docs/user-stories/decision/`  |     7 | Frozen                                            |
| Business  | `docs/user-stories/architecture/US-0005-business.md`  | `docs/user-stories/business/`  |     7 | Frozen                                            |
| Platform  | `docs/user-stories/architecture/US-0006-platform.md`  | `docs/user-stories/platform/`  |    14 | Frozen                                            |
| Editorial | — (`EDT` has one Feature; no parent Story document)   | `docs/user-stories/editorial/` |     1 | Frozen — **V1.1, outside the Frozen V1 baseline** |

`US-PLT-F13-001` is Frozen at v0.2; its Frozen v0.1 is preserved at
`US-PLT-F13-001-feed-management-v0.1-superseded.md` **including the sentence
that was wrong**, which is why it is kept rather than corrected in place.

## Repository Health

| Check                                 | Result                                                                                                                                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Parent Story Documents                | 6 present                                                                                                                                                                                                                                                                                                          |
| Generated Stories                     | 60 present                                                                                                                                                                                                                                                                                                         |
| Current Frozen Story total            | 66                                                                                                                                                                                                                                                                                                                 |
| Feature Registries                    | 5 present; Offering uses Capability Architecture                                                                                                                                                                                                                                                                   |
| ADR sequence                          | ADR-0001–ADR-0014 present and Accepted                                                                                                                                                                                                                                                                             |
| Development                           | Increment I91 closed; every Generated Story `Done`, none `In Progress`, none `Not Started`                                                                                                                                                                                                                         |
| Open, and recorded rather than hidden | `npm audit --audit-level=high` is red on transitive dependencies. **Accepted risk by Owner decision of 2026-09-07** (`V1_SECURITY_REVIEW.md` §2.3): the gate is not lowered, and the wait is on upstream `fastify` and `prisma` releases. Somebody has to look — a red gate nobody is waiting on becomes wallpaper |

## Revision History

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1     | 2026-07-25 | Reconciled the index to recovered Frozen PRD, UX, registry, ADR, and six-domain Story baselines.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1.2     | 2026-07-25 | Recorded Offering Capability Architecture Frozen v2.0 and authoritative F06/F07 → Handoff Enablement mappings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 1.3     | 2026-07-25 | Recorded traceability as Frozen v1.0 after completed validation, Owner Approval, and separate Freeze.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 1.4     | 2026-07-25 | Recorded Engineering Constitution as Frozen v1.0 and added its review-closure evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 1.5     | 2026-07-25 | Added the Frozen Marketplace Bible v1.0 baseline manifest and Final Freeze Gate evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 1.6     | 2026-07-25 | Registered Accepted ADR-0010–ADR-0014 and the V1 Software Architecture Final Review evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 1.7     | 2026-07-25 | Registered Owner Approval and the separate V1 Software Architecture v1.0 Freeze.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1.8     | 2026-07-25 | Registered the implementation backlog, delivery sequence, and TypeScript monorepo foundation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 1.9     | 2026-08-17 | Brought the Repository Health row up to date across three corrections that had been applied without a version bump, and registered the Draft traceability v1.1 candidate. The Development row named M9 while the repository was at M12, and claimed 49 Stories `Done` with one `In Progress`; all 50 are now `Done`. The candidate is listed as carrying no authority, because it has none until the Owner approves it.                                                                                                                                                                                                                                                                                                                                                                        |
| 1.10    | 2026-08-17 | Registered `docs/glossary.md` and moved the Development row from I13 to I14.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 1.11    | 2026-08-17 | Moved the Development row to I15. The 1.10 entry sat above 1.9 in a table that is otherwise ascending; the order is repaired here.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.12    | 2026-09-05 | **No entry was written for this version.** The header was moved to 1.12 and the table was not, so the index recorded a change it does not describe. The gap is left visible rather than backfilled from memory, because a reconstructed entry would look like evidence and be a guess.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 1.13    | 2026-09-07 | Reconciled the index to the documents frozen since. It was stale in six places at once, each of which would have sent a reader to a superseded baseline: traceability read v1.0 and is v2.2, PRD-0006 read v2.5 and is v2.6, the Platform registry read v1.0 and is v1.3 with `F13` and `F14` allocated, Discovery listed 10 Generated Stories and has 16, Platform listed 10 and has 14, and the Development row named I15 while the repository is at I91. Registered `V1_LAUNCH_RUNBOOK.md`, `V1_SECURITY_REVIEW.md` and the closed feed-matching decision, recorded the `F13` v0.1 archive and its preserved error, and added a Health row for the two items that are open — the red dependency audit and the missing `UX-0006` sections — so that neither is carried only in conversation. |
| 1.14    | 2026-09-07 | Recorded the closure of the V1 governance cycle: `traceability` Frozen **v2.3**, `UX-0006` Frozen **v1.1** (§12A Feed Management, §12B Audit Trail Reading), `PLATFORM_FEATURE_REGISTRY` Frozen **v1.4** — every Platform Feature now has a Frozen behaviour owner, Story and UX section. Registered `PRD-0007`, which the PRD table had never listed, and the two V1.1 Drafts `PRD-0008` and `PRD-0009` as outside the Frozen V1 baseline. The dependency-audit row now records the Owner's decision rather than an open question: the gate stays where it is and the risk is accepted, which is a different state from unresolved and must not be read as one.                                                                                                                               |
| 1.15    | 2026-09-07 | `PRD-0001` Frozen **v4.3**: §5.12.4 names the editorial review as the one thing a Product Key may carry, and §4's restated exclusion was amended to match. §4.1 of that document records a defect it deliberately does not fix — the crowd review surface built in `I71` is in use and no document owns its behaviour — which the Owner deferred to a separate V1.1 discussion so it would not block the editorial chain. Recorded here because a deferred defect that lives only in one PRD's §4.1 is one a reader of this index would not know to look for.                                                                                                                                                                                                                                  |
| 1.16    | 2026-09-07 | `PRD-0009` Frozen **v0.3** and the editorial chain commissioned. Opened `EDITORIAL_FEATURE_REGISTRY.md` as a new domain registry (`EDT`) rather than allocating an `OFR` identifier, because the review's behaviour is owned by `PRD-0009` and the Offering registry would have recorded `PRD-0001` as deciding what a review is. Registered `US-EDT-F01-001` as a Draft. The registry records that **no Feature is allocated for authoring**: `PRD-0009` §9.3 is open, and an identifier whose behaviour owner does not exist is the §5C.2 defect in its hardest-to-spot form.                                                                                                                                                                                                                |
| 1.17    | 2026-09-07 | Three more UX rows were stale and would each have sent a reader to a superseded baseline: `UX-0001` read v1.0 and is v1.1, `UX-0002` read v1.0 and is **v1.3**, `UX-0003` read v1.0 and is v1.1. Found while opening the `UX-0003` **v1.2** candidate, which adds §8.9 the editorial review and §9.4 the affiliate action. The candidate also carries a correction: an assessment written earlier the same day said `PRD-0004` §7.3 blocked a handoff button, and §7.3 constrains Decision _Chat_ rather than the person.                                                                                                                                                                                                                                                                      |
| 1.18    | 2026-09-07 | The editorial chain is complete and every link in it is Frozen: `PRD-0009` v0.3, `PRD-0001` v4.3, `EDITORIAL_FEATURE_REGISTRY` **v1.0**, `UX-0003` **v1.2** (§8.9 the review, §9.4 the affiliate action), and `US-EDT-F01-001` v0.1 with no open dependency. `US-EDT-F01-001` carries Delivery Status `Not Started`, which is the only Story in the repository that does — the implementation phase begins there.                                                                                                                                                                                                                                                                                                                                                                              |
