# US-DSC-F06-001 — Discovery Results and Listing Cards

> **Freeze Note (1.2):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-26, **together with `PRD-0002-discovery.md` v3.1**, because
> that PRD's §22.3 points at this Story for the depth bound and AC-13 here would
> otherwise state a number no Frozen PRD sends it. Frozen v1.2 is the
> authoritative Story baseline; Frozen v1.1 is preserved at
> `US-DSC-F06-001-discovery-results-and-listing-cards-v1.1-superseded.md`. This
> exact version must not be edited in place; a further change requires a
> controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (1.2):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-26, in these terms: *"onaylıyorum"*, given to a
> proposition that named both documents and both acts. Approval and Freeze were
> taken as one decision on the same day.
>
> **Delivery Status is not advanced by this Freeze.** AC-12 records what the
> platform has done since I63 and is satisfied today; **AC-11 and AC-13 are not**
> — there is no direct answer and no depth bound in the code. A Story whose
> Delivery Status said `Done` on the strength of this Freeze would be claiming
> two behaviours that do not exist.
>
> **Revision Note (1.2):** Adds **AC-11, AC-12 and AC-13** and nothing else. No
> existing Acceptance Criterion, BDD scenario, dependency, size or scope is
> changed; AC-1 to AC-10 are byte-identical to Frozen v1.1.
>
> **What was missing, and how it stayed missing.** PRD-0002 §22.4 says page size
> and the depth bound "are product decisions recorded in the Story". **No Story
> recorded either.** The page size has been twenty-five since I63 on 2026-09-02,
> on the Owner's own instruction — *"Sayfa başına 25 kart gösterilsin… aşağıda
> sayfa ilerleme butonları olsun"* — and the only place that number exists is
> `PAGE_SIZE` in `apps/api/src/persistence/pg-discovery.repository.ts`. A product
> decision living in one repository constant is a decision nobody can review, and
> §22.4's sentence pointed at a document that did not contain it. The depth bound
> was never decided at all.
>
> **The two numbers, and where they come from.** Page size is **25**, recorded
> here for the first time and unchanged from what the platform has done since
> I63 — this Story is catching up to the code, not altering it. The depth bound
> is **40 pages**, decided by the Owner on 2026-09-26: 25 × 40 is 1000, the full
> size the Owner's own catalogue analysis plans for, so every Result a person
> could reach stays reachable and what lies beyond the bound is crawler traffic
> rather than readers.
>
> **AC-11 is the one that describes behaviour the platform does not yet have.**
> There is no `hasNext` in the repository: every pager must compute
> `page × pageSize < total` for itself, and two of them computing it differently
> is a disagreement about whether a last page is last that no single screen
> reveals.

> **Freeze Note (1.1):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-09-02. Frozen v1.1 is the authoritative Story baseline and Frozen v1.0 is preserved at `US-DSC-F06-001-discovery-results-and-listing-cards-v1.0-superseded.md`. This exact version must not be edited in place; a further change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8. No upstream document is Frozen alongside it, because none states the revised rule — the check is recorded in §15 and was made before this Freeze. Delivery Status, traceability and repository indexes are unchanged by the Freeze itself.
>
> **Approval Note (1.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-09-02. The Owner's recorded reasoning, in their own words: the revision was requested as *"kuralı revize edip partnere bağla"* and approved, after reviewing the built behaviour, as *"böyle kalsın"*. Approval and Freeze were taken as one decision on the same day, after the Owner had seen the revised behaviour working against real data rather than from the document alone.
>
> **Revision Note (1.1):** Revises **AC-7** and the §5 sentence that restates it, so that a Listing Card may initiate an Affiliate Handoff. Requested by the Owner on 2026-09-02: *"kuralı revize edip partnere bağla."*
>
> **What changed, and what deliberately did not.** v1.0 forbade five things through the card — complete Presentation, Compare, Decision Chat, Affiliate Handoff and Direct Contact — for one reason stated once: a card is a *bounded* representation, and a control that performs a downstream behaviour would let the card become the surface that behaviour is owned by. Four of the five keep that reasoning intact and are unchanged. The fifth turned out to be the platform's business model: the Offerings are affiliate listings, and the price on the card is the partner's price. A card that could show that price and not act on it made the person open a page whose only purpose was to offer the button the card had just withheld.
>
> **The prohibition's substance is preserved by three constraints written into the revision, not by dropping it.** AC-5 is unchanged, so the Affiliate Destination is still absent from the card — the new AC-9 requires the address to be resolved server-side at the moment of the choice, never carried in the page. `US-DEC-F05-001` still owns the Affiliate Handoff, so a card click passes through a Decision Flow and records the Completion that Story requires; the card gains a shortcut through the existing behaviour, not a private route to a partner. And AC-10 keeps the control off cards where no eligible destination exists, so the revision never offers something the platform cannot perform.
>
> **Not revised:** AC-5 (protected and destination information), AC-6 (no purchase, transaction or external-success claim), and the AC-7 prohibitions on complete Presentation, Compare, Decision Chat and Direct Contact. `US-DEC-F05-001` is not amended by this candidate and continues to own the Affiliate Handoff itself.

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
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
| Version | 1.1 |
| Last Updated | 2026-09-02 |
| Supersedes | Frozen v1.0 (preserved at `US-DSC-F06-001-discovery-results-and-listing-cards-v1.0-superseded.md`) |
| Revision Requested By | Product Owner / Architecture Owner, 2026-09-02 |
| Approval Date (1.1) | 2026-09-02 |
| Freeze Date (1.1) | 2026-09-02 |
| Frozen By (1.1) | Product Owner / Architecture Owner |
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

The Listing Card exposes no protected contact or Affiliate Destination information, makes no purchase, transaction, or external-success claim, and does not execute complete Offering Presentation, Compare, Decision Chat, or Direct Contact.

A Listing Card may offer one explicitly chosen Affiliate Handoff to the owning Business's destination. The card carries no destination address: the address is resolved when the person chooses, by the Affiliate Handoff `US-DEC-F05-001` owns, and the Completion that Story requires is recorded there. Where no Eligible Affiliate Destination exists, the card offers no such affordance.

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
- **AC-6** — The system shall make no purchase, transaction, or external-success claim on a Listing Card.
- **AC-7** — The system shall not execute complete Offering Presentation, Compare, Decision Chat, or Direct Contact through the Listing Card.
- **AC-8** — The system shall apply the same public result and Listing Card behaviour regardless of login or role context.
- **AC-9** — The system shall permit one explicitly chosen Affiliate Handoff from a Listing Card, shall resolve the Affiliate Destination only at the moment of that choice, and shall record it as the Affiliate Handoff `US-DEC-F05-001` owns.
- **AC-10** — The system shall offer no Affiliate Handoff affordance on a Listing Card whose Offering has no Eligible Affiliate Destination, and shall take the person to complete Offering Presentation where a handoff is refused at the moment of choice.
- **AC-11** — The system shall state directly, with every page of Discovery Results, whether a further page exists, and shall not require a surface to derive that answer from the total, the page number and the page size.
- **AC-12** — The system shall carry at most **25** Discovery Results on one page, as one decision applied to every page rather than a value a caller may set per request.
- **AC-13** — The system shall bound Result depth at **40** pages, shall state Zero Results with the criteria intact for any page beyond the bound, and shall offer narrowing there rather than a further page.

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
And no complete Offering Presentation, Compare, Decision Chat, or Direct Contact is executed
And no Affiliate Handoff is executed until the person chooses one
```

### Scenario: A person chooses the partner from the card

```gherkin
Given an eligible matched Offering has an Eligible Affiliate Destination
And its Listing Card offers an Affiliate Handoff affordance
When the person explicitly chooses it
Then an Affiliate Handoff is initiated as `US-DEC-F05-001` defines it
And the Completion that Story requires is recorded
And the destination address was never present in the Listing Card
```

### Scenario: No eligible destination, no affordance

```gherkin
Given an eligible matched Offering has no Eligible Affiliate Destination
When its Listing Card is presented
Then no Affiliate Handoff affordance is offered
And the Offering remains openable through complete Offering Presentation
```

### Scenario: A destination withdrawn between the result and the choice

```gherkin
Given a Listing Card offered an Affiliate Handoff affordance
And the Affiliate Destination stopped being Eligible before the person chose it
When the person chooses the affordance
Then no Affiliate Handoff is performed
And the person is taken to complete Offering Presentation for that Offering
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

### Scenario: Whether another page exists is answered, not inferred

```gherkin
Given more Results match than one page carries
When a page of Discovery Results is presented
Then the presence of a further page is stated with that page
And no surface computes it from the total, the page number and the page size
```

---

### Scenario: A page carries at most twenty-five Results

```gherkin
Given more than twenty-five Results match
When a page of Discovery Results is presented
Then at most twenty-five Results are presented
And a request naming a different page size does not change how many are presented
```

---

### Scenario: Depth is bounded at forty pages

```gherkin
Given a person asks for a page beyond the fortieth
When Results are presented
Then Zero Results is stated with the criteria intact
And narrowing is offered rather than a further page
And the database is not asked to scan for the page that was refused
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
- Compare, Decision Chat, Direct Contact, and Completion.
- The Affiliate Handoff itself — its eligibility, its recording and its refusals remain owned by `US-DEC-F05-001`. This Story owns only whether a Listing Card may offer the choice.

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

Frozen v1.0 is preserved at `US-DSC-F06-001-discovery-results-and-listing-cards-v1.0-superseded.md` and this document holds the baseline filename, following the precedent set by `US-DSC-F01-001` v1.1. This Frozen baseline must not be edited in place and does not update GitHub automatically.

**No upstream document needs revising with this one, and that was checked rather than assumed.** The `US-DSC-F01-001` v1.1 note warns that a rule Frozen in one document and not its neighbours is how drift begins, so every upstream sentence about the card and the handoff was read against this candidate:

| Where | What it says | Why the candidate does not disturb it |
|---|---|---|
| `PRD-0002` §4 and §21 | Affiliate Handoff is outside Discovery's ownership | Unchanged. `US-DEC-F05-001` still owns the Handoff; the card offers the choice and performs none of the behaviour. |
| `PRD-0002` §11 | The card "must not expose Affiliate Destination information" and "does not own Compare, Decision Chat, Affiliate Handoff, or Direct Contact" | Unchanged, and AC-9 is what keeps the first true: the address is resolved server-side at the moment of the choice and is never in the card. |
| `PRD-0002` §14 | Opening an Offering "does not initiate Affiliate Handoff or Direct Contact" | Unchanged. Opening is still only opening; the handoff is a separate control a person presses deliberately. |
| `PRD-0002` §17 BDD, `UX-0002` §11 and §16 | Compare, Chat, handoff, Contact and Completion "do not begin **automatically**" | Unchanged, and this candidate depends on it: AC-9 admits only an explicitly chosen handoff, which is why the affordance is a submitted control rather than a link something could follow on the person's behalf. |

Only `US-DSC-F06-001` AC-7 forbade the card from offering the choice at all, which is why this is the only document being revised.
