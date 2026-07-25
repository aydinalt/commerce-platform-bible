# UX-0004 — Compare

- **UX ID:** UX-0004
- **Title:** Compare
- **Status:** Frozen
- **Version:** 1.0
- **Supersedes:** Draft v0.2
- **Approved candidate:** In Review v0.4
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0004 — Compare. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.4 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.4):** Focused independent-audit correction for UX-A02. Defines the one-Offering Compare-preparation context as transient current-flow state, specifies the UX-0004 → UX-0002 return contract, and defines resumption through UX-0003. No saved Comparison Set, persistent criteria, Compare Start, or product-rule change is introduced.

**Revision Note (0.3):** Controlled revision against Frozen PRD-0004 v1.2 and the accepted UX ownership decision. Keeps Compare optional and bounded to two–five eligible same-leaf Offerings. Removes Decision Chat, Contact, authentication TODOs, Favorites, Messaging, and Completion ownership. Adds explicit remove-or-replace at five, authoritative value/`Not provided` presentation, invalid-member handling, and transfer of the current Comparison Set to UX-0009.

> This document defines experience behaviour only. It does not define product state, visual style, component technology, APIs, persistence, or implementation architecture.

---

## 1. Purpose

Compare lets a person evaluate two to five eligible Offerings from the same active leaf Category and then continue with the exact current Comparison Set into UX-0009 Decision Flow.

## 2. Business Value

The experience makes meaningful differences understandable without forcing Compare into every Decision journey.

## 3. Scope

- optional Compare;
- valid Comparison Set of two to five Offerings;
- same active leaf Category;
- comparable Attribute rows;
- authoritative formatted values;
- `Not provided`;
- add, remove, and explicit replace;
- selected-member invalidation awareness;
- transfer to Decision Flow;
- bounded loading, empty, and error behaviour.

## 4. Out of Scope

- single-Offering Decision route;
- Offering Presentation;
- Search, Browse, Filter, or Listing Cards;
- Decision Chat;
- explicit Selected Offering for handoff;
- Affiliate Handoff;
- Direct Contact;
- Completion;
- authentication;
- Favorites;
- Messaging;
- saved Comparison Sets;
- cross-Category comparison;
- `Not applicable`.

## 5. Entry Points

- an eligible Offering sent from UX-0003;
- an eligible Offering sent from UX-0003 together with one transient comparison-preparation context;
- an existing comparison-preparation context that receives another eligible same-leaf Offering;
- return from UX-0009 before Completion with the current Comparison Set unchanged.

## 6. Valid Compare Entry

Compare opens only when the current set contains:

```text
2–5 eligible Offerings
AND
all Offerings share one active leaf Category
```

A one-Offering preparation state:

- contains exactly one eligible Offering;
- carries its active leaf Category;
- belongs only to the current Compare preparation flow;
- is not a valid Comparison Set;
- is not saved or restored after the flow ends;
- is not persistent or shareable URL state;
- does not produce Compare Start.

The person may return to UX-0002 with that exact preparation context and leaf Category.

UX-0002 may pass another eligible Offering and the unchanged context through UX-0003 back to UX-0004.

UX-0004 then validates and adds the second Offering.

`Compare Start` occurs only when a valid two-to-five-member Comparison Set successfully opens.

## 7. Comparison Set Behaviour

### 7.1 Add

An Offering may be added only when:

- it is publicly eligible;
- it shares the active leaf Category;
- the resulting set contains no more than five Offerings.

Duplicate membership is not added.

### 7.2 Remove

The person may explicitly remove a member.

If removal leaves fewer than two Offerings:

- the valid Compare surface ends;
- no comparison rows remain presented as a valid Comparison Set;
- the person may return to Offering Detail or add another eligible same-leaf Offering.

### 7.3 Five-Offering limit

When five members already exist, a sixth is never added silently.

The person must explicitly:

- remove one member and then add the new Offering; or
- select which current member to replace.

No automatic or oldest-member eviction occurs.

### 7.4 Different Category

An Offering from another leaf Category is not added.

The current valid set remains unchanged.

### 7.5 Ineligible member

An ineligible Offering cannot be added.

If an existing member is no longer eligible before the set is used:

- that member is identified as unavailable;
- it cannot be transferred as a valid member into UX-0009;
- the person must remove or replace it;
- no automatic replacement occurs.

## 8. Attribute Comparison

Compare presents only Attributes that are:

```text
applicable to the shared leaf Category
AND
comparable = true
```

For each member and Attribute:

- show the authoritative formatted value where supplied;
- show `Not provided` where the Attribute applies and no value is supplied.

UX-0004 does not:

- produce `Not applicable`;
- invent values;
- infer defaults;
- normalize unrelated Attributes;
- redefine units or allowed values;
- hide missing values to make one Offering appear stronger.

## 9. Continue to Decision Flow

The person may continue to UX-0009 only with a valid Comparison Set.

UX-0009 receives:

- the exact current two-to-five-member set;
- the shared active leaf Category context;
- current authoritative comparison information.

UX-0004 does not choose a Selected Offering.

## 10. User Actions

- inspect comparable Attribute rows;
- add an eligible same-leaf Offering;
- remove a member;
- explicitly replace a member when five are present;
- open an Offering in UX-0003;
- return to UX-0002 with the exact transient preparation context and current leaf Category to find another Offering;
- continue to UX-0009;
- leave Compare.

## 11. System Responses

- validates eligibility and same-leaf compatibility;
- preserves the set when an add attempt is rejected;
- updates comparison rows after an explicit set change;
- requires explicit replacement at five;
- transfers only a valid set to UX-0009;
- produces Compare Start only when valid Compare successfully opens.

## 12. Empty and Invalid States

### Fewer than two members

The person is informed that Compare requires two eligible same-leaf Offerings.

The experience offers return paths without inventing a second member.

### No comparable Attributes

The valid set may still remain visible through Offering identity and available public information.

The experience explains that no Attribute is currently marked comparable and does not fabricate comparison rows.

### Unavailable member

The member cannot continue into Decision Flow until removed or replaced.

## 13. Loading Behaviour

While member eligibility or comparison information is being resolved:

- the set is not silently changed;
- continue-to-Decision is unavailable;
- existing visible context remains identifiable.

## 14. Error Behaviour

If an add, remove, or replace operation cannot be completed:

- the last confirmed valid set remains;
- no silent eviction occurs;
- the person may retry or leave;
- UX-0009 does not receive an unconfirmed set.

## 15. Permissions

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| Open valid Compare | Conditional | Conditional | Conditional | Conditional |
| Add eligible same-leaf Offering | Conditional | Conditional | Conditional | Conditional |
| Remove or replace member | ✓ | ✓ | ✓ | ✓ |
| Continue valid set to UX-0009 | Conditional | Conditional | Conditional | Conditional |
| Save Compare history | ✗ | ✗ | ✗ | ✗ |
| Use Favorites | ✗ | ✗ | ✗ | ✗ |
| Use Messaging | ✗ | ✗ | ✗ | ✗ |

No context gains extra Compare authority.

## 16. Accessibility Requirements

- Offering identity remains associated with each value column or comparison group.
- Comparable Attribute names and values have a meaningful reading order.
- `Not provided` is announced as text, not only visual absence.
- Add, remove, replace, and continue actions are keyboard operable.
- The person receives perceivable confirmation after explicit set changes.
- An unavailable member is identified without relying only on color.
- Focus remains predictable after remove or replace.

## 17. Related Documents

- `PRD-0001-offering.md` — eligibility and authoritative Attribute values.
- `PRD-0004-decision.md` — Compare rules, Comparison Set, Compare Start.
- `PRD-0006-platform.md` — comparable Attribute definition.
- `UX-0002-discovery.md` — current-flow return path using the exact preparation context and leaf Category.
- `UX-0003-offering-detail.md` — Offering inspection and unchanged preparation-context forwarding.
- `UX-0009-decision-flow.md` — Decision Chat, selection, handoffs, Completion.

## 18. Acceptance Criteria

```gherkin
Scenario: One-Offering preparation returns without creating Compare Start
  Given UX-0004 contains one eligible preparation Offering
  When the person returns to UX-0002
  Then UX-0002 receives the exact Offering and active leaf Category as transient current-flow context
  And Compare Start does not occur
  And no saved Comparison Set is created

Scenario: Preparation resumes with a second Offering
  Given UX-0003 returns the existing preparation context and another eligible same-leaf Offering
  When UX-0004 validates the input
  Then the second Offering is added
  And the resulting valid Comparison Set may open
  And Compare Start occurs only when that valid set opens

Scenario: Open valid Compare
  Given two eligible Offerings share one active leaf Category
  When the Comparison Set opens
  Then Compare presents both Offerings
  And Compare Start occurs

Scenario: Reject a different-leaf Offering
  Given a valid Comparison Set
  When the person tries to add an Offering from another leaf Category
  Then the Offering is not added
  And the current set remains unchanged

Scenario: Compare shows value and missing value
  Given a comparable Attribute applies to the shared Category
  When an Offering has a value
  Then its authoritative formatted value is shown
  When another Offering has no value
  Then Not provided is shown
  And Not applicable is not produced

Scenario: Sixth Offering requires explicit replacement
  Given five Offerings are in the Comparison Set
  When the person attempts to add a sixth
  Then no member is removed automatically
  And the person must explicitly remove or choose a member to replace

Scenario: Removal ends invalid Compare
  Given a two-member Comparison Set
  When the person removes one member
  Then the valid Compare surface ends
  And the remaining Offering is not presented as a valid Comparison Set

Scenario: Continue to Decision Flow
  Given a valid Comparison Set
  When the person continues
  Then UX-0009 receives the exact current set
  And UX-0004 does not select an Offering

Scenario: Ineligible member blocks continuation
  Given one current member becomes publicly ineligible
  When the person tries to continue
  Then continuation is unavailable
  And the person must explicitly remove or replace that member

Scenario: Compare is optional
  Given an eligible Offering
  When the person prefers a single-Offering Decision route
  Then they may enter UX-0009 without opening UX-0004
```

## 19. Accepted UX Deferrals

The following do not block review:

- exact comparison layout and responsive treatment;
- visual treatment for wide Attribute sets;
- copywriting for invalid-set guidance;
- technical state transfer between UX-0004 and UX-0009.

No deferral may add cross-Category Compare, saved comparisons, `Not applicable`, Favorites, Messaging, Decision Chat, handoff, or Completion to UX-0004.
