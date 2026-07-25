# US-DSC-F06-001 — Discovery Results and Listing Cards

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.2):** Bounded BDD correction after independent Claude audit. Adds Story-internal role-neutral Results and Listing Card coverage. No Story ID, Feature ID, Epic, Capability assignment, Acceptance Criterion, dependency, size, scope, or upstream behaviour changes.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F06`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F06` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F06-001` |
| Story Title | Discovery Results and Listing Cards |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Results and Refinement |
| Feature | `F06` — Discovery Results and Listing Cards |
| Feature ID | `F06` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person inspecting public Discovery Results |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
| Priority | Must |
| Story Size | M |
| Version | 1.0 |
| Last Updated | 2026-07-24 |
| Approval Date | 2026-07-24 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.2 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-24 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `DSC` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F06` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Present each publicly eligible matched Offering as one bounded Listing Card containing the Discovery-owned product minimum.

---

## 4. Business Value

> **As a** person reviewing Discovery Results  
> **I want** each result to identify one Offering clearly and safely  
> **So that** I can choose an Offering to open without protected contact data, external destination data, or Decision behaviour appearing in the result card

---

## 5. Description

Discovery Results contain only Offerings whose final Offering Public Eligibility is Eligible and that satisfy the current Search, Browse, and Filter criteria.

Every result is represented by one Listing Card containing a recognizable title or name, supplied primary visual where available, active leaf Category display name, owning Business display name, and a clear Offering-open affordance.

The Listing Card exposes no protected contact or Affiliate Destination information, makes no purchase, transaction, Completion, or external-success claim, and does not execute complete Offering Presentation, Compare, Decision Chat, Affiliate Handoff, or Direct Contact.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F06` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0002-discovery.md` | Results and bounded Listing Card experience |
| Supporting PRD | `PRD-0001-offering.md` | Final Offering Public Eligibility and Listing Card source information |
| Supporting PRD | `PRD-0005-business.md` | Public Business display name and protected contact boundary |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall include in Discovery Results only Offerings whose final Offering Public Eligibility is Eligible and whose current criteria match.
- **AC-2** — The system shall represent every Discovery Result with exactly one Listing Card for one Offering.
- **AC-3** — The system shall present the Offering title or name, active leaf Category display name, owning Business display name, and clear open affordance on every Listing Card.
- **AC-4** — The system shall present the supplied primary visual where one is available without inventing media when it is absent.
- **AC-5** — The system shall exclude telephone, email, external contact URL, Affiliate Destination, owner-only information, and Admin-only information from Listing Cards.
- **AC-6** — The system shall make no purchase, transaction, Completion, or external-success claim on a Listing Card.
- **AC-7** — The system shall not execute complete Offering Presentation, Compare, Decision Chat, Affiliate Handoff, or Direct Contact through the Listing Card.
- **AC-8** — The system shall apply the same public result and Listing Card behaviour regardless of login or role context.

---

## 8. BDD

### Scenario: Eligible matched Offering receives one card

```gherkin
Given an Offering is publicly eligible and matches the current Discovery criteria
When Discovery Results are presented
Then exactly one Listing Card represents that Offering
And its title, leaf Category, Business display name, and open affordance are available
```

### Scenario: Optional visual is not invented

```gherkin
Given an eligible matched Offering has no supplied primary visual
When its Listing Card is presented
Then the remaining product minimum is available
And no visual is invented
```

### Scenario: Protected and decision information is absent

```gherkin
Given an Offering has contact and Affiliate Destination information
When its Listing Card is presented
Then protected contact and destination information are absent
And no Completion or Decision action is executed
```

### Scenario: Ineligible Offering never becomes a result

```gherkin
Given final Offering Public Eligibility is Ineligible
When Discovery Results are composed
Then no Listing Card is created for that Offering
```


### Scenario: Role context does not change public Results or Listing Cards

```gherkin
Given the same eligible matched Offering set
And the person is a Guest, Enabled User, Business, Admin, or Suspended-account Guest baseline
When Discovery Results and Listing Cards are presented
Then the same public result eligibility and Listing Card minimum apply
And no role-specific field, contact detail, destination information, or ordering advantage appears
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F02-001` or `US-DSC-F03-001` — a valid Search or Browse result context exists.
- `US-DSC-F05-001` — where Filters are applied.
- `PRD-0001-offering.md` — final public eligibility and source information.

### Blocks

- `US-DSC-F09-001` — a person may open one represented Offering.
- `US-DSC-F08-001` — absence of matching cards produces Zero Results.

---

## 10. Story Size

**M**

One result-understanding outcome with eligibility input, bounded minimum information, optional-media treatment, and strict exposure boundaries.

---

## 11. Out of Scope

- Listing Card visual layout, truncation, spacing, responsive design, and component implementation — `UX-0002-discovery.md`.
- Final result ordering — `US-DSC-F07-001`.
- Complete Offering Presentation — `US-OFR-F05-001` / UX-0003.
- Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

This Story is not committed to delivery merely because its document reaches Approved or Frozen.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations will be consumed from `ENGINEERING_CONSTITUTION.md` only after that document becomes authoritative. The current Engineering Constitution Draft is not a Story behaviour owner and does not advance this Story's Delivery Status.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Discovery outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent Story Document, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] No duplicate Story identified in the current Discovery package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Acceptance Criteria begin with “The system shall…”
- [x] Acceptance Criteria have corresponding BDD coverage

---

## 15. Notes

PRD-0002 owns the product minimum; UX-0002 owns the Listing Card experience.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
