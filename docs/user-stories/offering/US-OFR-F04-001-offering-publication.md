# US-OFR-F04-001 — Offering Publication

> **Freeze Note (2.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v2.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not update GitHub automatically.

> **Approval Note (2.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v2.0 candidate becomes the authoritative Approved v2.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, or architecture, and does not update GitHub automatically.

> **Review Entry Note (2.0):** Exact Draft candidate entered formal review after internal architecture and handbook validation. No Story ID, Feature ID, Feature name, Capability state, PRD/UX behaviour, Acceptance Criterion, BDD scenario, dependency, size, or scope changed during lifecycle entry.

> **Controlled Revision Note (2.0):** Substantive superseding revision of Frozen v1.0. Removes resolved publication TODOs and the obsolete claim that Published automatically means discoverable. Records the Frozen PRD-0001 v3.1 authorization, Unrestricted Business, Universal Publication Minimum, Draft → Published, immutable Initial Published At, final-eligibility evaluation, invalid-attempt denial, and no-return-to-Draft rules.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-OFR-F04-001` |
| Story Title | Offering Publication |
| Parent Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Offering Lifecycle Control |
| Feature | `F04` — Offering Publication |
| Feature ID | `F04` — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Capability | Lifecycle — authoritative `F04 → Lifecycle` association |
| Perspective | Business Owner authorized to manage one owned Draft Offering |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0005-business-dashboard.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
| Version | 2.0 |
| Last Updated | 2026-07-22 |
| Approval Date | 2026-07-22 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v2.0 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-22 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | Frozen v1.0 — preserved historical baseline |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F04` | `OFFERING_CAPABILITY_ARCHITECTURE.md` — authoritative Offering Feature Registry |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Enable an authorized owner of an eligible Draft to complete the sole Business-owned Draft → Published transition.

---

## 4. Business Value

> **As a** Business Owner authorized to manage one owned Draft Offering  
> **I want** to publish the Draft when every publication gate is satisfied  
> **So that** the Offering can become eligible for public product experiences

---

## 5. Description

Publication is available only for an exact owned Draft when the acting Business is authorized, Business Moderation Status is Unrestricted, and the Universal Publication Minimum is satisfied.

A successful first publication creates immutable `Initial Published At` and transitions the lifecycle to Published. Final Offering Public Eligibility is then evaluated separately. Published does not itself guarantee public availability.

A failed or unavailable publication attempt leaves the Offering Draft. No V1 transition returns Published to Draft.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0001-offering.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `OFR` code |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | `F04` identity and authoritative Capability state |
| PRD | `PRD-0001-offering.md` | Offering behaviour and product rules |
| Supporting PRD | `PRD-0005-business.md`; `PRD-0006-platform.md` | Business access and Platform action surfaces where applicable |
| UX | `UX-0005-business-dashboard.md` | Experience behaviour |
| ADR | `ADR-0003-offering-feature-capability-associations.md` | Architectural constraint |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md` | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make publication available only for an exact owned Draft managed by an authorized Business owner.
- **AC-2** — The system shall require Business Moderation Status Unrestricted before Draft → Published is available.
- **AC-3** — The system shall require the Universal Publication Minimum before Draft → Published is available.
- **AC-4** — The system shall transition a valid publication target from Draft to Published.
- **AC-5** — The system shall create immutable Initial Published At on the first successful Draft → Published transition.
- **AC-6** — The system shall evaluate final Offering Public Eligibility after publication without asserting that every Published Offering is public.
- **AC-7** — The system shall leave the Offering in Draft when any publication gate is not satisfied.
- **AC-8** — The system shall deny Business-owned Published → Draft and Hidden → Draft transitions.

---

## 8. BDD

### Scenario: Valid Draft is published

```gherkin
Given an authorized Business owner manages an owned Draft
And Business Moderation Status is Unrestricted
And the Universal Publication Minimum is satisfied
When the owner publishes the Offering
Then the lifecycle state becomes Published
And Initial Published At is created
And final Offering Public Eligibility is evaluated
```

### Scenario: Incomplete Draft cannot be published

```gherkin
Given an owned Draft does not satisfy the Universal Publication Minimum
When the owner attempts publication
Then publication is unavailable or rejected
And the Offering remains Draft
```

### Scenario: Restricted Business cannot publish

```gherkin
Given Business Moderation Status is Restricted
And the Business owns a Draft Offering
When the owner attempts publication
Then Draft to Published is denied
And the Offering remains Draft
```

### Scenario: Published does not promise public eligibility

```gherkin
Given a Draft has successfully become Published
When final Offering Public Eligibility is composed
Then the eligibility result is determined independently from lifecycle publication
```

---

## 9. Dependencies

### Depends On

- `US-OFR-F01-001` — an owned Draft Offering exists.
- `US-OFR-F02-001` — the Draft can be maintained until the publication minimum is satisfied.

### Blocks

- `US-OFR-F05-001` — public Presentation requires final Offering Public Eligibility Eligible.

---

## 10. Story Size

**M**

One lifecycle transition with three entry gates, an immutable timestamp, and a separate eligibility result.

---

## 11. Out of Scope

- Final Offering Public Eligibility composition beyond its publication-triggered evaluation — owned by PRD-0001.
- Admin Hide/Restore — Platform domain.
- Owner retirement — `US-OFR-F03-001`.
- Discovery ranking or result inclusion — `PRD-0002-discovery.md`.
- Published → Draft or Hidden → Draft — no V1 transition exists.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

This Story is not committed to delivery merely because its document reaches Approved or Frozen.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations are consumed by reference from `ENGINEERING_CONSTITUTION.md`.

---

## 14. Story Validation Checklist

- [x] Represents one bounded actor outcome
- [x] Provides observable user or business value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent Story Document, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] No duplicate Story identified in the current Offering package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Acceptance Criteria begin with “The system shall…”
- [x] Acceptance Criteria have corresponding BDD coverage

---

## 15. Notes

No additional product, UX, architecture, lifecycle, or implementation decision is recorded here.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
