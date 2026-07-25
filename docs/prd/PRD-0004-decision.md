# PRD-0004 — Decision

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0004
- **Title:** Decision
- **Status:** Frozen
- **Version:** 1.2
- **Last Updated:** 2026-07-21
- **Scope level:** Product behaviour (non-technical)
- **Supersedes:** Approved v1.0
- **Approved candidate:** In Review v1.2
- **Approval Date:** 2026-07-21
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-21
- **Frozen By:** Product Owner / Architecture Owner

> This document is the Single Information Owner of Decision product behaviour: Compare, assistive Decision Chat, explicit Offering selection, Affiliate Handoff, Direct Contact, and Completion. It consumes the universal Offering model, final Offering Public Eligibility, Attribute values, and Affiliate Destination Handoff Eligibility from `PRD-0001-offering.md`; public and authenticated gates from `PRD-0003-identity.md`; Business contact information from `PRD-0005-business.md`; and supplies bounded activity and Completion results to `PRD-0006-platform.md`. It defines no Offering or Affiliate Destination management, Business contact-information authoring, Admin action execution, AI model, recommendation algorithm, affiliate-network integration, contact-delivery implementation, analytics instrumentation, persistent personal history, API, database, storage, frontend component, backend service, security mechanism, or infrastructure.

**Freeze Note (1.2):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-21. Frozen v1.2 is the locked V1 PRD baseline for PRD-0004 — Decision. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.2):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, Final Review, package-level reconciliation, independent Claude audit, and all bounded audit corrections. Approved v1.2 supersedes Approved v1.0 and is the authoritative PRD baseline for PRD-0004 — Decision. This historical Approval Note records that approval and Freeze were separate decisions. The PRD was subsequently Frozen on 2026-07-21. No UX, User Story, traceability, or GitHub file changes automatically.

**Revision Note (1.2):** Controlled Claude-audit correction for findings A-01 and A-02. Corrects Attribute definition/value ownership and removes residual V1 `Not applicable` references outside the accepted cross-category deferral. No Compare limit, compatibility, Decision Chat, handoff, Completion, Capability, or Feature change.

**Revision Note (1.1):** Controlled post-approval Freeze-correction candidate applying Owner Decisions P-03 and P-07. Removes the unreachable `Not applicable` state from same-leaf-Category V1 Compare, retains authoritative value and `Not provided`, and records consumption of the V1 Attribute value-kind contract without inventing normalization. Status remains In Review v1.1. Approved v1.0 remains authoritative until explicit approval.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER APPROVAL`. Approved v1.0 becomes the authoritative product-behaviour source for optional Compare, assistive Decision Chat, explicit Offering selection, public Affiliate Handoff, authenticated Direct Contact, Completion meaning and evidence, and the bounded Decision activity meanings consumed by Platform. It preserves human control, the same-leaf-Category V1 Comparison Set rule, the two-to-five limit, the historical v1.0 `Not provided` and `Not applicable` treatment, Guest Affiliate Handoff without forced registration, authenticated-only Direct Contact, and the exclusion of Favorites, Messaging, persistent Decision history, autonomous AI, payment, transaction, and external-outcome tracking. It is not Frozen. Freeze requires a separate Product Owner / Architecture Owner decision.

**Revision Note (0.6):** Controlled decision-reconciled revision of In Review v0.5 after the independent Cross-PRD Architecture Audit and explicit Owner Decisions D-01/D-02, D-03, D-04, D-05, and D-17. Records Guest Decision Chat and Guest Affiliate Handoff as public; preserves Direct Contact as authenticated-only; replaces the unresolved affiliate ownership reference with Accepted ADR-0006 and ADR-0008 boundaries; makes Compare optional while preserving the two-to-five eligible Offering limit; defines valid single-Offering and multi-Offering decision paths; defines comparison eligibility, same-leaf-Category compatibility, missing and non-applicable Attribute treatment, and explicit replacement at the five-Offering limit; defines current-flow Decision Chat context without cross-decision memory; defines selected-Offering requirements; defines telephone, email, and external website/contact URL as the complete V1 Direct Contact channel set; defines Affiliate and Direct Contact Completion evidence; publishes bounded Compare Start, Decision Chat Start, Affiliate Handoff Completion, and Direct Contact Completion meanings for Platform consumption; closes the corresponding package-level Open Questions. Approved v1.0 is authoritative from 2026-07-21. No other repository document changes automatically.

---

## 1. Purpose

Decision helps a person move from evaluation to a clear next step while preserving human control.

Decision owns the person-facing journey after a publicly eligible Offering has been opened:

```text
one eligible Offering
or
a Comparison Set of 2–5 eligible Offerings
        ↓
Decision Chat
        ↓
explicit selected Offering
        ↓
Affiliate Handoff or Direct Contact
        ↓
Completion
```

Compare is an optional decision aid.

Decision Chat remains assistive and non-autonomous under Accepted `ADR-0001-decision-chat-ownership.md`.

---

## 2. Business Value

Decision supports the platform mission by:

- reducing the effort required to interpret multiple Offerings;
- allowing a person with one suitable Offering to proceed without forced comparison;
- giving assistive help without replacing human judgment;
- supporting a public Affiliate Handoff path;
- supporting an authenticated Direct Contact path;
- ending platform responsibility at an explicit, bounded Completion point;
- avoiding forced registration, Messaging, payment, transaction, or external-outcome ownership;
- using the same Decision behaviour across Mobility, Real Estate, and Technology.

The product succeeds when the person understands the current decision context, explicitly selects an eligible Offering, chooses an available handoff path, and leaves the platform without ambiguity about what Completion means.

---

## 3. Scope

V1 Decision includes:

- optional Compare for two to five eligible Offerings;
- a same-active-leaf-Category Comparison Set in V1;
- comparison through authoritative Attributes marked comparable;
- explicit representation of authoritative formatted values and missing values;
- explicit removal or replacement when the Comparison Set already contains five Offerings;
- public Compare;
- public assistive Decision Chat;
- Decision Chat context based on one eligible Offering or the current Comparison Set;
- no cross-decision memory;
- explicit selection of one eligible Offering;
- public Affiliate Handoff where both authoritative eligibility results permit it;
- authenticated Direct Contact using telephone, email, or external website/contact URL;
- separate Affiliate Handoff Completion and Direct Contact Completion;
- bounded activity meanings consumed by Admin-facing Basic Analytics;
- consistent behaviour across Mobility, Real Estate, and Technology.

---

## 4. Out of Scope

The following are outside PRD-0004:

- Favorites;
- Messaging or an in-platform inbox;
- saved comparisons;
- shared comparisons;
- comparison history;
- persistent Decision history;
- Decision Memory;
- Decision Watch;
- Reviews and Ratings;
- price history;
- autonomous recommendations;
- autonomous AI or AI agents;
- Chat selecting, contacting, purchasing, or committing for the person;
- payment, checkout, transaction confirmation, credit, insurance, logistics, or delivery;
- Offering, Category, or Attribute-definition management;
- Affiliate Destination definition, association, authoring, editing, status, validation, or eligibility composition;
- Business contact-information authoring or management;
- Admin moderation or Affiliate Destination Administration;
- Business response, inbox, receipt, or reply workflow;
- external transaction, call, email, website-form, appointment, contract, or purchase tracking;
- personal post-handoff follow-up;
- AI model, prompt, ranking, normalization algorithm, provider, or inference design;
- affiliate-network integration or attribution;
- telephony, email, URL, redirect, or contact-delivery implementation;
- analytics instrumentation, event schemas, persistence, deduplication, or queries;
- API, database, storage, frontend, backend, security, logging, monitoring, deployment, or infrastructure;
- any V2 or excluded behaviour in `V1_SCOPE.md`.

---

## 5. Core Concepts and Ownership

### 5.1 Eligible Offering

An Offering whose authoritative:

```text
final Offering Public Eligibility = Eligible
```

Only eligible Offerings may enter Decision behaviour.

### 5.2 Compare

The optional side-by-side evaluation of two to five eligible Offerings.

Compare is not a prerequisite for Decision Chat, Affiliate Handoff, Direct Contact, or Completion.

### 5.3 Comparison Set

The current set of Offerings being compared.

V1 rules:

- minimum two;
- maximum five;
- every member is eligible;
- every member is assigned to the same active leaf Category.

### 5.4 Comparable Attribute

An Attribute definition whose authoritative `comparable` property is enabled by `PRD-0006-platform.md`.

PRD-0004 owns how comparable Attributes are presented in Compare.

Compare consumes the PRD-0006-owned Attribute value kind and definition properties, and the PRD-0001-owned authoritative Offering value and its product meaning.

It does not redefine units, allowed values, applicability, or normalization.

### 5.5 Decision Context

The current bounded input to Decision Chat:

- one eligible Offering; or
- one current Comparison Set.

It may include the applicable authoritative Offering Presentation information, comparable Attribute values, and the person's current Chat inputs.

It does not include another decision journey or persistent personal history.

### 5.6 Decision Chat

Assistive product behaviour that helps a person interpret the current Decision Context.

It does not:

- make the decision;
- select an Offering;
- initiate a handoff;
- contact a Business;
- commit, purchase, or act for the person.

### 5.7 Selected Offering

The one eligible Offering explicitly chosen by the person for the handoff stage.

Where the Decision Context is a Comparison Set, the Selected Offering must be a current member of that set.

Where the Decision Context is one Offering, that Offering is the only selectable Offering until the person changes the Decision Context.

### 5.8 Affiliate Handoff

The public person-facing transition to the Affiliate Destination associated with the Selected Offering.

It is available only when:

```text
final Offering Public Eligibility = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
```

The eligibility results are owned by `PRD-0001-offering.md`.

### 5.9 Direct Contact

The authenticated person-facing transition to the Business behind the Selected Offering through one approved channel:

- telephone number;
- email address;
- external website or contact URL.

Business contact-information authoring is owned by `PRD-0005-business.md`.

The authentication gate is owned by `PRD-0003-identity.md`.

### 5.10 Completion

The terminal platform-level result after approved handoff initiation.

Completion means the platform's V1 decision-support responsibility has ended.

Completion does not mean an external outcome succeeded.

### 5.11 Compare Start

The product occurrence when a valid Comparison Set is opened in Compare.

### 5.12 Decision Chat Start

The product occurrence when Decision Chat is entered with one valid Decision Context.

PRD-0006 may consume Compare Start, Decision Chat Start, and the two Completion results for Basic Analytics without redefining them.

---

## 6. Compare Behaviour

### 6.1 Entry conditions

Compare is available when the current Comparison Set contains:

```text
2–5 eligible Offerings
```

All members must share the same active leaf Category.

An ineligible Offering cannot be added.

An Offering from a different leaf Category cannot be added to the current set.

### 6.2 Attribute alignment

Every member of a V1 Comparison Set shares the same active leaf Category.

Compare uses the comparable Attributes applicable to that Category.

For each Offering and Attribute:

- show the authoritative formatted value when one exists;
- show `Not provided` when the Attribute applies but no value is supplied.

`Not applicable` is not a V1 Compare result because Category applicability is shared by every member of the same-leaf Comparison Set.

Compare must not:

- invent a value;
- infer a default value;
- hide a missing value to create a misleading comparison;
- redefine Attribute applicability, value kind, unit, allowed value, or comparability;
- invent cross-Attribute normalization.

### 6.3 Five-Offering limit and replacement

When the Comparison Set contains five Offerings:

- a sixth Offering is not added automatically;
- no existing member is removed silently;
- the person must explicitly remove one member or explicitly choose which member to replace;
- the resulting set must still contain no more than five Offerings.

### 6.4 Optionality

A person may leave Compare and continue to Decision Chat with the current Comparison Set.

A person may also begin Decision Chat from one eligible Offering without ever creating a Comparison Set.

---

## 7. Decision Chat Behaviour

### 7.1 Public access

Decision Chat is available to Guests and authenticated Users.

No account creation is required before, during, or after Guest Decision Chat.

### 7.2 Context

Decision Chat consumes exactly one current Decision Context:

```text
one eligible Offering
or
one valid Comparison Set
```

Where a Comparison Set exists, Chat may help interpret its comparable Attribute rows and available Offering information.

Where one Offering exists, Chat may help interpret that Offering without requiring Compare.

### 7.3 Human-control boundary

Decision Chat may:

- explain available authoritative information;
- help identify differences;
- help the person express priorities;
- help the person understand authoritative values and missing information;
- help the person prepare to select an Offering.

Decision Chat may not:

- claim an unavailable Attribute value;
- choose the final Offering;
- select a handoff path;
- reveal protected Direct Contact information to a Guest;
- initiate Affiliate Handoff or Direct Contact;
- create a Business contact;
- act outside the current Decision Context.

### 7.4 Memory boundary

V1 Decision Chat retains context only within the current decision flow.

It creates no:

- cross-decision memory;
- saved Chat history as a product capability;
- persistent personal Decision profile;
- Decision Watch;
- forced account.

Technical session handling is outside this PRD.

---

## 8. Offering Selection

Before a handoff can be offered, the person must explicitly select one eligible Offering.

For a Comparison Set:

- selection must be a current member;
- changing or removing the selected member clears selection until the person selects again;
- selecting one member does not remove the others.

For a single-Offering Decision Context:

- that Offering may be selected directly;
- Compare is not required.

If the Selected Offering becomes publicly ineligible before handoff initiation:

- the handoff is unavailable;
- Completion is not produced;
- the person must choose another eligible Offering or leave the flow.

---

## 9. Affiliate Handoff

### 9.1 Access and availability

Affiliate Handoff is public.

A Guest or authenticated User may use it.

It is available only when the Selected Offering satisfies:

```text
final Offering Public Eligibility = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
```

Decision consumes both results and does not recalculate either.

### 9.2 Handoff initiation

Affiliate Handoff is initiated when the person selects the approved affiliate action and the platform makes the eligible external Affiliate Destination the active destination of the person's journey.

The exact redirect, tab, application, transport, tracking, or network implementation is outside this PRD.

### 9.3 Affiliate Handoff Completion

Completion is produced when:

```text
eligible Affiliate Destination selected
→ external handoff initiated
→ Affiliate Handoff Completion
```

No additional person confirmation is required.

The platform does not require registration before or after Guest Affiliate Handoff.

---

## 10. Direct Contact

### 10.1 Access and availability

Direct Contact requires:

```text
User Account access status = Enabled
AND
authenticated User context
AND
Selected Offering final Offering Public Eligibility = Eligible
AND
at least one approved Business contact channel is supplied and available
```

Guests cannot access protected contact information.

### 10.2 Approved V1 channels

The complete V1 Direct Contact channel set is:

```text
telephone number
email address
external website or contact URL
```

If more than one channel is available, the person explicitly selects a channel.

### 10.3 Person-facing handoff

For the selected channel, Decision:

- presents the approved contact information;
- makes the corresponding external contact channel available;
- hands the person out of the platform's in-scope contact journey.

Decision does not create:

- Messaging;
- a Business inbox;
- a conversation;
- a reply state;
- a Business response state;
- a delivery or answer state.

### 10.4 Direct Contact Completion

Completion is produced when:

```text
authenticated User
→ approved contact information revealed
→ external contact channel made available
→ Direct Contact Completion
```

No confirmation that a call was made, email was sent, site form was submitted, or Business replied is required.

---

## 11. Completion Meaning and Consumption

### 11.1 Single Information Owner

PRD-0004 is the Single Information Owner of:

- Completion meaning;
- Affiliate Handoff Completion evidence;
- Direct Contact Completion evidence;
- the boundary where platform decision-support responsibility ends.

### 11.2 Meaning

Completion means:

- an approved handoff has been initiated;
- the person has reached the end of the platform's V1 decision-support journey.

Completion does not mean or prove:

- purchase;
- sale;
- contract;
- appointment;
- call connection;
- email send, delivery, open, or reply;
- website-form submission;
- Business receipt or response;
- external transaction success;
- external service completion.

### 11.3 Platform analytics consumption

`PRD-0006-platform.md` may consume separate product results:

```text
Affiliate Handoff Completion
Direct Contact Completion
```

Platform may also consume:

```text
Compare Start
Decision Chat Start
```

PRD-0006 must not define a conflicting meaning.

Decision defines no technical analytics event, storage, persistence, or query.

---

## 12. Valid Decision Paths

### 12.1 Single-Offering path

```text
eligible Offering
→ Decision Chat
→ explicit Selected Offering
→ Affiliate Handoff or authenticated Direct Contact
→ Completion
```

### 12.2 Multi-Offering path

```text
2–5 eligible same-leaf-Category Offerings
→ Compare
→ Decision Chat
→ explicit Selected Offering from the Comparison Set
→ Affiliate Handoff or authenticated Direct Contact
→ Completion
```

### 12.3 Compare optionality

The Frozen V1 path is the canonical maximal sequence.

A person does not need to complete Compare to enter Decision Chat or reach Completion.

Decision Chat remains part of both valid V1 Decision paths.

---

## 13. Permissions Matrix

Legend:

- `✓` — permitted;
- `✗` — not permitted;
- `Conditional` — permitted only when the Decision and authoritative eligibility conditions are satisfied.

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| Use Compare | Conditional | Conditional | Conditional | Conditional |
| Use Decision Chat | ✓ | ✓ | ✓ | ✓ |
| Select an eligible Offering | ✓ | ✓ | ✓ | ✓ |
| Initiate Affiliate Handoff | Conditional | Conditional | Conditional | Conditional |
| Reach Affiliate Handoff Completion | Conditional | Conditional | Conditional | Conditional |
| View protected Direct Contact information | ✗ | Conditional | Conditional | Conditional |
| Initiate Direct Contact | ✗ | Conditional | Conditional | Conditional |
| Reach Direct Contact Completion | ✗ | Conditional | Conditional | Conditional |
| Use Favorites | ✗ | ✗ | ✗ | ✗ |
| Use Messaging | ✗ | ✗ | ✗ | ✗ |
| Use persistent Decision history | ✗ | ✗ | ✗ | ✗ |
| Perform Decision-specific Admin moderation | ✗ | ✗ | ✗ | ✗ |

Business and Admin contexts receive only the applicable person baseline. They gain no additional Decision authority.

---

## 14. Functional Requirements

### Compare

1. Decision shall make Compare optional.
2. Compare shall require two to five eligible Offerings.
3. Every Comparison Set member shall share the same active leaf Category in V1.
4. Compare shall use only authoritative Attributes marked comparable.
5. Compare shall represent an authoritative formatted value or `Not provided` according to §6.2.
6. Compare shall not invent or silently suppress missing information.
7. A sixth Offering shall require explicit removal or explicit replacement of a current member.
8. Compare Start shall occur when a valid Comparison Set is opened.

### Decision Chat and selection

9. Decision Chat shall be public.
10. Decision Chat shall accept one eligible Offering or one valid Comparison Set as context.
11. Decision Chat shall remain assistive and non-autonomous.
12. Decision Chat shall use only the current Decision Context.
13. Decision Chat shall create no cross-decision memory.
14. The person shall explicitly select one eligible Offering before handoff.
15. A selected Offering from a Comparison Set shall be a current member of that set.
16. Decision Chat Start shall occur when Chat is entered with a valid current context.

### Affiliate Handoff

17. Affiliate Handoff shall be public.
18. Affiliate Handoff shall require final Offering Public Eligibility Eligible and Affiliate Destination Handoff Eligibility Eligible.
19. Decision shall consume both eligibility results without recalculating them.
20. Affiliate Handoff Completion shall occur when the eligible external handoff is initiated.
21. Guest Affiliate Handoff shall require no forced registration.

### Direct Contact

22. Direct Contact shall require an Enabled authenticated User context.
23. Direct Contact shall require a publicly eligible Selected Offering.
24. Direct Contact shall require at least one approved supplied Business contact channel.
25. Approved channels shall be telephone, email, and external website/contact URL.
26. Guests shall not access protected contact information.
27. Direct Contact Completion shall occur when approved contact information is revealed and the external channel is made available.
28. Direct Contact shall create no Messaging or Business-response workflow.

### Completion and scope

29. No additional person-confirmed completion signal shall be required.
30. Completion shall not assert an external outcome.
31. PRD-0006 may consume the bounded product occurrences without redefining them.
32. Decision shall provide no Favorites, Messaging, persistent Decision history, payment, transaction, or autonomous-agent behaviour.
33. The same Decision rules shall apply across Mobility, Real Estate, and Technology.

---

## 15. Acceptance Criteria

```gherkin
Scenario: Single-Offering path does not require Compare
  Given one Offering has final Offering Public Eligibility Eligible
  When the person begins Decision Chat from that Offering
  Then no Comparison Set is required
  And the Offering becomes the current Decision Context
  And the person may later select it for an available handoff

Scenario: Compare accepts two to five compatible Offerings
  Given two to five eligible Offerings share the same active leaf Category
  When the person opens Compare
  Then one valid Comparison Set is presented
  And Compare Start occurs

Scenario: Ineligible Offering cannot enter Compare
  Given an Offering has final Offering Public Eligibility Ineligible
  When the person attempts to add it
  Then it is not added to the Comparison Set

Scenario: Different leaf Category cannot enter the same Comparison Set
  Given a Comparison Set contains Offerings from one active leaf Category
  When the person attempts to add an Offering from another leaf Category
  Then it is not added to that Comparison Set

Scenario: Compare distinguishes value and missing value
  Given every Comparison Set member shares one active leaf Category
  And a comparable Attribute applies to that Category
  When an Offering has an authoritative value
  Then the authoritative formatted value is shown
  When an Offering has no value
  Then Not provided is shown
  And Not applicable is not produced in the V1 same-leaf Comparison Set

Scenario: Sixth Offering requires explicit replacement
  Given a Comparison Set contains five Offerings
  When the person attempts to add a sixth
  Then no member is removed silently
  And the person must remove one or select one to replace
  And the set never exceeds five

Scenario: Decision Chat is public and bounded
  Given a Guest has one valid Decision Context
  When the Guest enters Decision Chat
  Then authentication is not required
  And Decision Chat Start occurs
  And Chat does not use another decision journey

Scenario: Decision Chat does not decide
  Given Decision Chat assists with the current context
  When a final selection is required
  Then the person must explicitly select the Offering
  And Chat does not initiate a handoff

Scenario: Comparison selection stays inside the set
  Given the current Decision Context is a Comparison Set
  When the person selects an Offering for handoff
  Then the Offering is a current member of that set

Scenario: Guest reaches Affiliate Handoff Completion
  Given a Guest selects an Offering
  And final Offering Public Eligibility is Eligible
  And Affiliate Destination Handoff Eligibility is Eligible
  When the Guest initiates Affiliate Handoff
  Then the external handoff is initiated
  And Affiliate Handoff Completion occurs
  And registration is not required

Scenario: Affiliate Handoff is unavailable when either result is ineligible
  Given a Selected Offering has one or both required eligibility results Ineligible
  When Affiliate Handoff availability is evaluated
  Then Affiliate Handoff is unavailable
  And Completion does not occur

Scenario: Guest cannot use Direct Contact
  Given a Guest selects an eligible Offering
  When Direct Contact is requested
  Then protected contact information remains unavailable
  And authentication is required

Scenario: Authenticated User selects a Direct Contact channel
  Given an Enabled authenticated User selects a publicly eligible Offering
  And the owning Business supplies more than one approved channel
  When Direct Contact is opened
  Then telephone, email, and external website/contact URL may be offered according to availability
  And the person selects one channel

Scenario: Direct Contact Completion uses reveal and availability
  Given an Enabled authenticated User selects an available approved channel
  When the approved contact information is revealed
  And the external channel is made available
  Then Direct Contact Completion occurs
  And no Business response is required

Scenario: Completion does not assert external success
  Given Affiliate Handoff Completion or Direct Contact Completion occurs
  When the result is presented or consumed
  Then it means platform decision-support responsibility ended
  And no purchase, call, email, response, contract, or transaction success is asserted

Scenario: Excluded persistence remains absent
  Given a Guest or User uses Compare, Decision Chat, or handoff
  When the Decision journey ends
  Then no Favorites, Messaging, cross-decision memory, or persistent personal Decision history is created
```

---

## 16. Related PRDs

### PRD-0001 — Offering

Owns:

- final Offering Public Eligibility;
- Attribute values and Category association;
- Affiliate Destination;
- Affiliate Destination Handoff Eligibility.

Decision consumes those results.

### PRD-0002 — Discovery

Owns the journey to eligible Offering Presentation and entry to Decision.

It must reference PRD-0004 without naming Favorites or Messaging.

### PRD-0003 — Identity

Owns:

- Decision Chat and Affiliate Handoff as public gates;
- Direct Contact as authenticated-only;
- protection of Direct Contact information;
- Enabled and Suspended context entry.

### PRD-0005 — Business

Owns:

- Business contact-information fields;
- authoring and management of telephone, email, and external URL;
- Business identity and ownership.

Decision consumes available approved contact information.

### PRD-0006 — Platform

Owns Admin-facing Basic Analytics.

It consumes:

- Compare Start;
- Decision Chat Start;
- Affiliate Handoff Completion;
- Direct Contact Completion.

It does not redefine their meaning.

---

## 17. Related ADRs, Capability Architecture, and Owner Decisions

### Accepted ADRs

- `ADR-0001 — Decision Chat Ownership`
- `ADR-0006 — Affiliate Destination Ownership`
- `ADR-0007 — Domain Scope of the Capability First Rule`
- `ADR-0008 — Handoff Enablement Capability`

### Frozen Capability Architecture

- `OFFERING_CAPABILITY_ARCHITECTURE.md` Frozen v2.0
  - Decision Analysis owns Compare;
  - Decision Support owns Decision Chat;
  - Contact & Action owns person-facing Affiliate Handoff, Direct Contact, and Completion;
  - Handoff Enablement supplies Affiliate Destination Handoff Eligibility.

### Applied Owner Decisions

- D-01 / D-02 — Guest Decision Chat and Affiliate Handoff;
- D-03 — Affiliate Destination Cross-PRD ownership;
- D-04 — Direct Contact channels and boundary;
- D-05 — Completion evidence;
- D-17 — Compare optionality and valid paths.

---

## 18. Accepted Deferrals

The following are accepted V1 deferrals and do not block Freeze:

1. **Decision Chat conversational design**
   - Tone, turn structure, explanation style, and visible context treatment remain UX-owned.
   - Model and prompt implementation remain outside the PRD.

2. **Technical comparison formatting**
   - Exact display formatting remains UX/implementation-owned.
   - The authoritative value, governed unit, and `Not provided` meaning may not be changed.

3. **Cross-category comparison**
   - A cross-category Comparison Set is outside V1.
   - `Not applicable` may be reconsidered only if cross-category comparison is explicitly approved.

4. **External handoff implementation**
   - Redirect, application launch, browser behaviour, telephone integration, email integration, and URL handling remain outside the PRD.

5. **Technical analytics implementation**
   - Event schemas, persistence, anonymous identifiers, deduplication, and queries remain outside the PRD.

6. **Future Decision persistence**
   - Saved comparisons, Chat history, Decision Memory, Decision Watch, and personal follow-up require future scope and architecture decisions.

No downstream UX or User Story may broaden these deferrals.

