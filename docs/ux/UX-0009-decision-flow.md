# UX-0009 — Decision Flow

- **UX ID:** UX-0009
- **Title:** Decision Flow
- **Status:** Frozen
- **Version:** 1.0
- **Creation authority:** Owner Decision — UX Decision Flow and Messaging Treatment, 2026-07-21
- **Approved candidate:** In Review v0.1
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0009 — Decision Flow. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.1 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Creation Note (0.1):** New controlled UX document authorized to provide one experience owner for Frozen PRD-0004 v1.2 Decision behaviour. Owns one-Offering or Comparison-Set Decision Context, public Decision Chat, explicit Selected Offering, public Affiliate Handoff, authenticated-only Direct Contact, and separate Completion outcomes. Creates no product behaviour, Capability, Feature, state, persistent Decision history, Favorites, or Messaging.

> This document defines experience behaviour only. It does not define product state, AI implementation, visual style, component technology, APIs, storage, affiliate transport, external contact technology, or analytics implementation.

---

## 1. Purpose

Decision Flow helps a person understand the current eligible Offering context, use public assistive Decision Chat, explicitly select one Offering, and complete the platform's decision-support journey through Affiliate Handoff or authenticated Direct Contact.

## 2. Business Value

The experience provides one coherent path from understanding to an explicit person-controlled selection and an approved external handoff, without forced registration, autonomous AI choice, or in-platform Messaging.

## 3. Scope

- Decision Context with one eligible Offering or one valid Comparison Set;
- single-Offering route;
- multi-Offering route received from UX-0004;
- public Decision Chat;
- Decision Chat Start;
- explicit Selected Offering;
- selection clearing and invalidation;
- public Affiliate Handoff;
- authenticated-only Direct Contact;
- exact return from UX-0008;
- Affiliate Handoff Completion;
- Direct Contact Completion;
- current-flow-only context;
- bounded unavailable and error behaviour.

## 4. Out of Scope

- Offering Presentation;
- Compare mechanics;
- Search, Browse, Filter, or Listing Card;
- Affiliate Destination authoring, validation, enablement, or administration;
- Business contact-information authoring;
- Favorites;
- Messaging;
- Business inbox or reply;
- saved Decision history;
- saved Chat history as a product capability;
- cross-decision memory;
- autonomous selection;
- purchase, payment, contract, or external transaction tracking;
- proof that an external call, email, form, purchase, or reply occurred.

## 5. Entry Points

### 5.1 Single-Offering route

UX-0003 sends one eligible Offering.

Compare is not required.

### 5.2 Multi-Offering route

UX-0004 sends one valid Comparison Set containing two to five eligible same-leaf Offerings.

### 5.3 Authentication return

UX-0008 returns an authenticated person to the exact interrupted Direct Contact action.

## 6. Decision Context

Exactly one current Decision Context exists:

```text
one eligible Offering
or
one valid Comparison Set
```

The context remains limited to the current Decision flow.

UX-0009 does not merge unrelated Offering sets or preserve cross-decision personal memory.

If the context becomes invalid:

- Decision Chat does not claim invalid Offering information;
- handoff actions are unavailable;
- the person may repair the set in UX-0004, choose another eligible Offering, or leave.

## 7. Decision Chat

### 7.1 Public access

Decision Chat is available to:

- Guest;
- Enabled authenticated User;
- Business context;
- Admin context;
- a Suspended account only through its public Guest baseline.

No account is required before, during, or after Guest Decision Chat.

### 7.2 Start

`Decision Chat Start` occurs when assistive Chat successfully begins with the current valid Decision Context.

### 7.3 Assistive behaviour

Decision Chat may:

- explain authoritative Offering information;
- help interpret comparable Attribute differences;
- help the person express priorities;
- explain authoritative values and `Not provided`;
- help the person prepare to select.

Decision Chat may not:

- invent an Attribute value;
- choose or mark the final Offering;
- initiate a handoff;
- select a contact channel;
- reveal protected contact information to a Guest;
- act outside the current Decision Context;
- claim purchase, sale, or external success.

### 7.4 Current-flow memory

The experience may retain the current flow context while the Decision journey continues.

It does not present:

- saved Chat history;
- a personal Decision profile;
- cross-decision memory;
- Decision Watch;
- forced account creation.

## 8. Explicit Selected Offering

Before any handoff is available, the person explicitly selects one eligible Offering.

### 8.1 Single-Offering context

The person still performs an explicit selection or confirmation of the one Offering.

### 8.2 Comparison Set

Selection must be a current member of the set.

Selecting one member does not remove the other members.

### 8.3 Clearing selection

Selection clears when:

- the selected member is removed;
- the selected member becomes ineligible;
- the Decision Context is replaced;
- the person explicitly changes or clears selection.

Handoff actions remain unavailable until a current eligible Offering is selected.

## 9. Handoff Choice

After explicit selection, the experience presents only the handoff paths currently available for the Selected Offering.

UX-0009 does not prefer or silently choose a path.

## 10. Affiliate Handoff

### 10.1 Availability

Affiliate Handoff is public and available only when:

```text
Selected Offering final Offering Public Eligibility = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
```

### 10.2 Initiation

The person explicitly chooses the approved Affiliate action.

The platform makes the eligible external Affiliate Destination the active destination of the journey.

### 10.3 Completion

Affiliate Handoff Completion occurs when:

```text
eligible Affiliate Destination selected
→ external handoff initiated
```

No additional confirmation is requested.

Registration is not required before or after Guest Affiliate Handoff.

## 11. Direct Contact

### 11.1 Availability

Direct Contact requires:

```text
User Account access status = Enabled
AND
authenticated User context
AND
Selected Offering final Offering Public Eligibility = Eligible
AND
at least one approved contact channel supplied and available
```

### 11.2 Guest attempt

A Guest who explicitly chooses Direct Contact:

- does not see protected contact information;
- is sent to UX-0008 with exact return context;
- may register or log in;
- returns to this exact Selected Offering and action after successful authentication.

### 11.3 Channels

Approved V1 channels:

- telephone number;
- email address;
- external website or contact URL.

Where multiple channels are available, the person explicitly selects one.

### 11.4 Person-facing handoff

For the selected channel, UX-0009:

- presents the approved contact information;
- makes the external channel available;
- hands the person out of the platform's in-scope contact journey.

It creates no message, inbox, conversation, reply, delivery, answer, or Business-response state.

### 11.5 Completion

Direct Contact Completion occurs when:

```text
approved contact information revealed
AND
external contact channel made available
```

No confirmation of external action or response is required.

## 12. Completion Behaviour

Completion means the platform's in-scope decision-support journey has ended through the selected approved handoff.

The completion experience:

- distinguishes Affiliate Handoff Completion from Direct Contact Completion;
- does not claim purchase, sale, booking, contract, application, delivery, answer, or reply;
- does not force registration after Affiliate Handoff;
- does not create persistent personal history.

## 13. Valid Paths

### 13.1 Single Offering

```text
eligible Offering from UX-0003
→ public Decision Chat
→ explicit Selected Offering
→ Affiliate Handoff or authenticated Direct Contact
→ corresponding Completion
```

### 13.2 Multi Offering

```text
valid Comparison Set from UX-0004
→ public Decision Chat
→ explicit Selected Offering from the set
→ Affiliate Handoff or authenticated Direct Contact
→ corresponding Completion
```

## 14. User Actions

- begin Decision Chat;
- inspect assistive explanations;
- explicitly select or change an Offering;
- choose Affiliate Handoff;
- choose Direct Contact;
- choose one available Direct Contact channel;
- authenticate through UX-0008 where required;
- return to UX-0003 or UX-0004;
- leave the flow.

## 15. System Responses

- validates the current Decision Context;
- begins Chat only with authoritative context;
- preserves human control of selection and path;
- clears invalid selection;
- presents only eligible handoff actions;
- protects Direct Contact from Guests;
- records the correct Completion occurrence;
- avoids external-success claims.

## 16. Empty and Unavailable States

### No eligible context

Decision Chat and handoff actions do not begin.

The person may return to UX-0003 or UX-0004.

### No Selected Offering

The experience prompts explicit selection and presents no handoff as active.

### No Affiliate Handoff

The path is omitted or identified as unavailable without exposing the destination.

### No Direct Contact channel

Direct Contact is unavailable.

The experience does not invent Messaging or another contact route.

### Selection becomes ineligible

Selection clears.

No Completion occurs.

The person may select another eligible member or leave.

## 17. Loading Behaviour

While current eligibility or handoff availability is being resolved:

- no protected contact information is revealed;
- no handoff is initiated;
- current Decision Context remains identifiable;
- duplicate handoff initiation is prevented at the experience level.

## 18. Error Behaviour

### Decision Chat unavailable

The person may retry, continue reviewing authoritative context, change selection, or leave.

The experience does not auto-select.

### Affiliate Handoff initiation failure

No Completion occurs.

The Selected Offering remains identifiable.

The person may retry or choose another available path.

### Direct Contact reveal or channel failure

Protected information is not partially exposed.

No Completion occurs unless the approved information is revealed and the channel is made available.

### Authentication return invalid

Where eligibility or channel availability changed during authentication:

- Direct Contact does not continue;
- protected information remains unavailable;
- the person may reevaluate the current Decision Context.

## 19. Permissions

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| Use Decision Chat | ✓ | ✓ | ✓ | ✓ |
| Explicitly select eligible Offering | ✓ | ✓ | ✓ | ✓ |
| Initiate eligible Affiliate Handoff | Conditional | Conditional | Conditional | Conditional |
| Reach Affiliate Handoff Completion | Conditional | Conditional | Conditional | Conditional |
| View protected Direct Contact information | ✗ | Conditional | Conditional | Conditional |
| Initiate Direct Contact | ✗ | Conditional | Conditional | Conditional |
| Reach Direct Contact Completion | ✗ | Conditional | Conditional | Conditional |
| Use Favorites | ✗ | ✗ | ✗ | ✗ |
| Use Messaging | ✗ | ✗ | ✗ | ✗ |
| Save Decision history | ✗ | ✗ | ✗ | ✗ |

Business and Admin contexts gain no extra Decision authority beyond the applicable person baseline.

## 20. Accessibility Requirements

- Decision Context and Selected Offering are explicitly perceivable.
- Chat responses have a meaningful reading and focus order.
- The difference between assistive explanation and person-controlled selection is clear.
- Selection changes are announced.
- Handoff path names describe their external effect.
- Authentication interruption and return preserve context.
- Protected contact information is not exposed through inaccessible hidden content.
- Error and Completion states do not rely only on color, motion, or position.

## 21. Related Documents

- `PRD-0001-offering.md` — eligibility and Affiliate Destination Handoff Eligibility.
- `PRD-0003-identity.md` — public baseline, Enabled/Suspended, authentication gate.
- `PRD-0004-decision.md` — Decision, Chat, selection, handoffs, Completion.
- `PRD-0005-business.md` — Direct Contact information set.
- `UX-0003-offering-detail.md` — single-Offering entry.
- `UX-0004-compare.md` — multi-Offering entry.
- `UX-0008-authentication.md` — Direct Contact authentication and return.

## 22. Acceptance Criteria

```gherkin
Scenario: Guest uses single-Offering Decision Chat
  Given UX-0009 receives one eligible Offering
  When a Guest begins Decision Chat
  Then Decision Chat Start occurs
  And authentication is not required

Scenario: Comparison Set enters Decision Flow
  Given UX-0009 receives a valid Comparison Set
  When Decision Chat begins
  Then Chat consumes exactly that set
  And no Offering is selected automatically

Scenario: Explicit selection is required
  Given a valid Decision Context
  When no Offering is selected
  Then Affiliate Handoff and Direct Contact are unavailable
  When the person explicitly selects an eligible Offering
  Then available handoff paths may be presented

Scenario: Selected member removal clears selection
  Given the Selected Offering is a current Comparison Set member
  When that member is removed
  Then selection clears
  And no handoff remains active

Scenario: Guest completes Affiliate Handoff
  Given a Guest selected an Offering with eligible Affiliate Handoff
  When the Guest initiates the Affiliate action
  Then the external handoff is initiated
  And Affiliate Handoff Completion occurs
  And registration is not required

Scenario: Guest Direct Contact requires Authentication
  Given a Guest selected an Offering with an available Direct Contact channel
  When the Guest chooses Direct Contact
  Then protected information is not revealed
  And UX-0008 receives exact return-to-action context

Scenario: Authenticated Direct Contact completes
  Given an Enabled authenticated User selected an eligible Offering
  And one approved contact channel is available
  When the contact information is revealed and the channel is made available
  Then Direct Contact Completion occurs
  And no external response confirmation is required

Scenario: Multiple contact channels require explicit choice
  Given telephone, email, and external URL are available
  When Direct Contact begins
  Then the person explicitly selects one channel
  And UX-0009 does not choose automatically

Scenario: Decision Chat never chooses
  Given Decision Chat explains the current Decision Context
  When it produces an assistive response
  Then it does not mark a Selected Offering
  And it does not initiate a handoff

Scenario: Messaging is absent
  Given Direct Contact is available
  When contact paths are presented
  Then no in-platform message, inbox, conversation, or reply path exists

Scenario: Completion does not claim external success
  Given Affiliate Handoff Completion or Direct Contact Completion occurs
  When the completion state is presented
  Then it does not claim a purchase, sale, call, email, form submission, answer, or Business reply
```

## 23. Accepted UX Deferrals

The following do not block review:

- exact Decision Chat conversational presentation;
- exact wording for selection and Completion;
- external redirect, telephone, email, and URL implementation;
- technical session continuity;
- analytics instrumentation;
- responsive visual layout.

No deferral may add autonomous selection, forced registration, Favorites, Messaging, saved Decision history, external-success tracking, or handoff behaviour outside Frozen PRD-0004.
