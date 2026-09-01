# PRD-0005 — Business

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0005
- **Title:** Business
- **Status:** Frozen
- **Version:** 1.3
- **Last Updated:** 2026-07-21
- **Scope level:** Product behaviour (non-technical)
- **Supersedes:** Approved v1.0
- **Approved candidate:** In Review v1.3
- **Approval Date:** 2026-07-21
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-21
- **Frozen By:** Product Owner / Architecture Owner

> This document is the Single Information Owner of Business product behaviour: Business Profile creation and management, Business Information, Business ownership, multiple Businesses per User Account, owned-Business context behaviour, Business Moderation Status, Business Public Exposure Input, the Business Dashboard, Business-side Offering-management entry, Business-side Affiliate Destination-management entry, and owner-facing correction visibility. It consumes authentication and context gates from Identity; Offering and Affiliate Destination outcomes from Offering; Decision gates and handoffs from Decision; and Admin action execution from Platform. It defines no authentication implementation, Offering lifecycle, final Offering Public Eligibility composition, Affiliate Destination state model, Decision behaviour, moderation case handling, Admin action execution, analytics, Messaging, API, database, storage, frontend component, backend service, security mechanism, or infrastructure.

**Freeze Note (1.3):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-21. Frozen v1.3 is the locked V1 PRD baseline for PRD-0005 — Business. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.3):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, Final Review, package-level reconciliation, independent Claude audit, and all bounded audit corrections. Approved v1.3 supersedes Approved v1.0 and is the authoritative PRD baseline for PRD-0005 — Business. This historical Approval Note records that approval and Freeze were separate decisions. The PRD was subsequently Frozen on 2026-07-21. No UX, User Story, traceability, or GitHub file changes automatically.

**Revision Note (1.3):** Controlled focused-delta correction for independent audit finding B-01. Corrects the §13 Permissions Matrix so the bounded correction-edit path is `Conditional` in Admin Context when the acting User also has the normal authorized ownership relationship to the Business. Clarifies that Admin authorization alone grants no Business edit authority. No rule, gate, lifecycle, state, moderation action, Capability, Feature, or Owner Decision changes.

**Revision Note (1.2):** Controlled post-Claude correction applying accepted Owner Decision A-05 Option B. Preserves the normal Restricted Business prohibition on Published/Hidden edits while adding one bounded correction-edit path for an Open Request Correction case targeting exact Offering content. The exception preserves restriction, public ineligibility, lifecycle, Universal Publication Minimum, Platform re-review, and the no-Messaging boundary. No Capability, Feature, lifecycle state, role, or general management permission is added.

**Revision Note (1.1):** Controlled post-approval Freeze-correction candidate applying Owner Decisions P-02 and P-06. Makes Business display name a continuous non-empty invariant, rejects edits that would remove it, aligns Request Correction with the complete Business-owned target set, and consumes the Platform-owned Open/Closed moderation-case boundary without creating Messaging. Status remains In Review v1.1. Approved v1.0 remains authoritative until explicit approval.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER APPROVAL`. Approved v1.0 becomes the authoritative product-behaviour source for Business Profile, Business Information, Business ownership, owned-Business context behaviour, Business Moderation Status, Business Public Exposure Input, Business Dashboard, Business-side Offering-management entry, Business-side Affiliate Destination-management entry, and owner-facing correction visibility. It preserves the public/private information split, final Offering Public Eligibility ownership in PRD-0001, F06/F07 supporting-relationship boundaries, and the exclusion of Business analytics, CRM, Messaging, ownership transfer, team access, and full Business lifecycle from V1. It is not Frozen. Freeze requires a separate Product Owner / Architecture Owner decision.

**Revision Note (0.3):** Controlled decision-reconciled revision of In Review v0.2 after the independent Cross-PRD Architecture Audit and explicit Owner Decisions D-03, D-04, D-15/D-16, D-20, and D-21. Defines the V1 Business Information field inventory and exposure classes; confirms that V1 has no dedicated public Business Profile page; defines Business Moderation Status as `Unrestricted` or `Restricted`; defines the Business Public Exposure Input as `Eligible` or `Ineligible`; applies Restricted and Restore consequences without changing Offering lifecycle; defines the Business Dashboard product minimum; records the authorized Business-management entry to Frozen Handoff Enablement Features F06/F07 without transferring behaviour ownership; defines owner-facing Request Correction visibility without Messaging; closes the prior public-profile, information-exposure, moderation, dashboard, affiliate-management, Business-analytics, ownership-transfer, Business-contact-receipt, and correction-response Open Questions. Approved v1.0 is authoritative from 2026-07-21. No other repository document changes automatically.

---

## 1. Purpose

Business defines how an authenticated User creates, owns, selects, and manages one or more Business Profiles through the same User Account.

It provides the partner-facing management boundary for:

- Business Profile creation;
- Business Information;
- owned-Business context;
- Business Dashboard;
- Business moderation consequences;
- Offering-management entry;
- Affiliate Destination-management entry;
- owner-facing correction visibility.

A Business is never a separate account or login identity.

Business owns the Business-originating public-exposure input consumed by Offering. It does not compose final Offering Public Eligibility.

---

## 2. Business Value

Business allows partners to participate without a second login or a pre-creation Admin approval gate.

It supports the Foundation by:

- treating Businesses as partners;
- allowing one User Account to own multiple Businesses;
- making owner management available immediately after creation;
- separating management access from public exposure;
- allowing post-creation moderation without changing Offering lifecycle;
- providing a bounded management dashboard rather than an analytics, CRM, or Messaging product;
- supporting Offering and Affiliate Destination management through authoritative owners;
- preserving consistent behaviour across Mobility, Real Estate, and Technology.

Business succeeds when an authorized owner can understand the active Business context, maintain approved information, manage owned product records through their owning PRDs, and respond to correction needs without gaining access to another Business.

---

## 3. Scope

V1 Business includes:

- creating a Business Profile through an Enabled authenticated User Account;
- no prior Admin approval for Business creation;
- immediate owner management after creation;
- one User Account owning multiple Businesses;
- explicit selection of an owned-Business context;
- the V1 Business Information field inventory;
- Business Information visibility and authentication classes;
- no dedicated public Business Profile page;
- Business Moderation Status;
- Business Public Exposure Input;
- Restricted and Restore consequences;
- an owned Business Dashboard;
- Business-side entry to Offering creation and management;
- Business-side entry to Affiliate Destination creation and editing;
- visibility of authoritative Offering and Affiliate Destination results for management;
- owner-facing Request Correction visibility;
- consistent behaviour across Mobility, Real Estate, and Technology.

---

## 4. Out of Scope

The following are outside PRD-0005:

- User Account registration, login, logout, password recovery, access status, Admin authorization, and authentication implementation;
- a separate Business account or Business login;
- Business ownership transfer;
- co-owners, team members, delegated access, invitations, and internal Business roles;
- Business closure, archival, deletion, restoration, or a full Business lifecycle;
- permanent deletion of a Business;
- a dedicated public Business Profile page;
- public Business search or browse;
- Offering definition, Attribute values, Category association, lifecycle, publication, retirement, final public eligibility, or Presentation;
- Affiliate Destination definition, cardinality, status, validation meaning, or Handoff Eligibility;
- Affiliate Destination review, validation, enablement, or disablement;
- Direct Contact handoff, Affiliate Handoff, or Completion;
- an in-platform inbox, Messaging, conversation, reply, lead-management, or Business-response workflow;
- Admin moderation cases and Admin action execution;
- Business-facing analytics, performance reports, conversion metrics, revenue reporting, or ranking;
- Admin-facing Basic Analytics;
- billing, subscriptions, payments, commission, settlement, CRM, advertising, promotions, Reviews, logistics, or transactions;
- affiliate-network integration or external conversion tracking;
- technical form validation, URL checking, API, database, storage, frontend, backend, security, logging, monitoring, deployment, or infrastructure;
- any V2 or excluded behaviour in `V1_SCOPE.md`.

---

## 5. Core Concepts and Ownership

### 5.1 User Account

The persistent identity through which Businesses are owned and operated.

Owned by `PRD-0003-identity.md`.

### 5.2 Business Profile

The partner profile created, owned, and managed through one User Account.

It is not a separate login identity.

### 5.3 Business owner

The User Account authorized to operate a specific Business Profile.

V1 has exactly one owner per Business.

### 5.4 Business context

An Enabled authenticated User acting for one owned Business.

Identity owns entry eligibility. PRD-0005 owns behaviour available within the Business context.

### 5.5 Business Information

The product information maintained for a Business Profile.

V1 fields:

| Field | Creation requirement | Owner/Admin visibility | Public Offering identity | Direct Contact |
|---|---|---|---|---|
| Business display name | Required | Yes | Yes when exposure is eligible | May be shown |
| Logo or brand image | Optional | Yes | Yes when supplied and exposure is eligible | May be shown |
| Short description | Optional | Yes | Yes when supplied and exposure is eligible | May be shown |
| Telephone number | Optional | Yes | No | Authenticated-only |
| Email address | Optional | Yes | No | Authenticated-only |
| External website or contact URL | Optional | Yes | No | Authenticated-only |

Business creation requires only the display name.

Business display name remains required and non-empty for the life of the Business.

A Business may exist without a Direct Contact channel.

### 5.6 Public Business identity set

The subset that `PRD-0001-offering.md` may consume for complete Offering Presentation:

- Business display name;
- supplied logo or brand image;
- supplied short description.

It is available only while Business Public Exposure Input is `Eligible`.

### 5.7 Direct Contact information set

The supplied:

- telephone number;
- email address;
- external website or contact URL.

PRD-0005 owns authoring and management.

`PRD-0003-identity.md` owns the authenticated-only gate.

`PRD-0004-decision.md` owns availability, reveal, selection, handoff, and Completion behaviour.

### 5.8 Business Moderation Status

The authoritative Business-level moderation result:

```text
Unrestricted
Restricted
```

These are moderation statuses, not a complete Business lifecycle.

### 5.9 Business Public Exposure Input

The Business-owned input consumed by `PRD-0001-offering.md`:

```text
Eligible
Ineligible
```

PRD-0005 does not calculate final Offering Public Eligibility.

### 5.10 Business Dashboard

The owned-Business management surface.

It is not a Business analytics, CRM, Messaging, or transaction product.

### 5.11 Offering-management entry

The Business Dashboard entry to `PRD-0001`-owned Offering behaviour.

### 5.12 Affiliate Destination-management entry

The `ADR-0007` supporting relationship through which an authorized Business reaches `PRD-0001`-owned F06/F07 behaviour.

PRD-0005 does not become the Handoff Enablement Capability owner.

### 5.13 Correction notice

The owner-facing indication that Platform has recorded Request Correction against applicable Business-owned information or content.

It is not a message, conversation, ticket discussion, or reply workflow.

---

## 6. Business Creation and Ownership

1. An Enabled authenticated User may create a Business Profile.
2. Business creation requires:
   - an owning User Account;
   - a Business display name.
3. Business creation does not require prior Admin approval.
4. A newly created Business begins with:

```text
Business Moderation Status = Unrestricted
Business Public Exposure Input = Eligible
```

5. The Business becomes available immediately to its owner for management.
6. Immediate management does not create a dedicated public Business Profile page.
7. One User Account may own multiple Businesses.
8. Each Business has exactly one owner in V1.
9. Ownership transfer, co-ownership, delegated access, and team roles are outside V1.
10. The same User Account is used for User and Business contexts.

---

## 7. Business Information and Exposure

### 7.1 Management

An authorized Business owner may:

- view every Business Information field;
- edit every Business Information field;
- add, change, or remove optional Direct Contact channels;
- manage only the selected owned Business.

Business display name cannot be removed or saved as empty.

A save that would violate that invariant is rejected.

Changing valid Business Information does not by itself:

- change Business Moderation Status;
- change Business Public Exposure Input;
- change Offering lifecycle;
- change final Offering Public Eligibility;
- create Direct Contact Completion.

### 7.2 Public Offering exposure

V1 has no dedicated public Business Profile page.

When:

```text
Business Public Exposure Input = Eligible
AND
final Offering Public Eligibility = Eligible
```

`PRD-0001` may present the public Business identity set inside complete Offering Presentation.

When Business Public Exposure Input is `Ineligible`, no Business Information is publicly exposed through an owned Offering.

### 7.3 Direct Contact exposure

Direct Contact channels:

- are never included in the public Business identity set;
- are unavailable to Guests;
- may be made available only to an Enabled authenticated User;
- are shown and acted on only through `PRD-0004-decision.md`;
- create no in-platform Business inbox or response requirement.

Supplying zero Direct Contact channels is allowed.

Where no approved channel is available, PRD-0004 cannot offer Direct Contact for that Business.

### 7.4 Owner and Admin visibility

The Business owner may view all supplied fields while the User Account is Enabled and the Business context is authorized.

An authorized Admin may view fields needed for the approved Platform review and moderation behaviour.

Public exposure and owner/Admin management visibility are separate concerns.

---

## 8. Business Moderation and Public Exposure Input

### 8.1 Ownership

PRD-0005 is the Single Information Owner of:

- Business Moderation Status;
- Business Public Exposure Input;
- Business-side consequences of restriction and restoration.

`PRD-0006-platform.md` owns the action surface and applies the outcomes by reference.

### 8.2 Composition

```text
Business Moderation Status = Unrestricted
→ Business Public Exposure Input = Eligible
```

```text
Business Moderation Status = Restricted
→ Business Public Exposure Input = Ineligible
```

### 8.3 Restrict Business

Restrict Business produces:

```text
Unrestricted → Restricted
Business Public Exposure Input → Ineligible
```

A Restricted Business:

- remains accessible to its Enabled owner for management;
- allows Business Information editing;
- allows management of existing Draft Offerings;
- permits viewing of owned Published, Hidden, and Archived Offerings;
- cannot create a new Offering;
- cannot publish a Draft Offering;
- cannot normally edit lifecycle-Published or Hidden Offerings;
- may use only the bounded correction-edit path in §8.3.1 where every condition is satisfied;
- may retire an owned Draft, Published, or Hidden Offering where PRD-0001 permits retirement;
- may view and edit an existing Affiliate Destination only where the associated Offering remains owner-manageable under these rules;
- cannot publicly expose Business Information;
- causes lifecycle-Published Offerings to receive Business Public Exposure Input `Ineligible`.

Restriction does not change:

- Offering lifecycle;
- Affiliate Destination status;
- Affiliate Destination validation result;
- User Account access status;
- Business ownership.

### 8.3.1 Bounded correction-edit path

A Restricted Business owner may edit a lifecycle-Published or Hidden Offering only when:

```text
General Moderation Case = Open
AND
Request Correction target = Offering content
AND
target Offering lifecycle = Published or Hidden
AND
acting User = authorized owner of the owning Business
```

The permission is limited to:

- the exact Offering identified by the correction notice; and
- the exact targeted content area identified by that notice.

The bounded path does not permit:

- creating a new Offering;
- publishing a Draft Offering;
- editing an unrelated Published or Hidden Offering;
- editing an untargeted content area;
- changing Offering lifecycle;
- changing Business Moderation Status;
- changing Business Public Exposure Input;
- regaining public eligibility;
- closing the General Moderation Case automatically;
- creating Messaging, inbox, conversation, ticket discussion, or reply behaviour.

The saved correction must satisfy the PRD-0001-owned Universal Publication Minimum.

The owner edit requires Platform re-review.

### 8.4 Restore Business

Restore Business produces:

```text
Restricted → Unrestricted
Business Public Exposure Input → Eligible
```

Restoration:

- restores normal Business management permissions;
- allows new Offering creation;
- allows Draft → Published when PRD-0001 publication conditions are satisfied;
- does not publish a Draft automatically;
- does not restore Hidden or Archived Offerings;
- does not change Affiliate Destination status or Handoff Eligibility;
- allows only lifecycle-Published Offerings to regain final public eligibility through PRD-0001 composition.

### 8.5 Relationship to User suspension

A Business may remain `Unrestricted` while its owner's User Account is `Suspended`.

In that case:

- Business Moderation Status and Public Exposure Input do not change;
- public eligibility of owned Offerings does not change from suspension alone;
- the owner cannot enter Business context until the User Account is reinstated.

---

## 9. Business Dashboard

### 9.1 Entry

The Business Dashboard is available only to an Enabled authenticated User acting in the selected owned-Business context.

### 9.2 Product minimum

The Dashboard provides:

- the active Business display name and context identity;
- Business Moderation Status;
- Business Information management;
- Direct Contact information management;
- applicable correction notices;
- the owned Offering inventory organized by authoritative lifecycle state;
- entry to create a new Offering when Business status permits;
- entry to applicable edit, publish, retire, and historical-view behaviour owned by PRD-0001;
- entry to Affiliate Destination create and edit behaviour for an applicable owned Offering;
- visibility of authoritative Affiliate Destination status, validation result, and Handoff Eligibility;
- explicit selection or switching among owned Businesses.

### 9.3 Multiple-Business selection

When a User owns more than one Business:

- the active Business must be explicit;
- no management action may silently target another Business;
- switching changes the active management context but not ownership.

When a User owns exactly one Business, the product may enter that context directly through UX without creating a second identity.

### 9.4 No analytics expansion

The Dashboard may organize management records by their authoritative states.

This does not authorize:

- performance metrics;
- conversion metrics;
- revenue reporting;
- ranking;
- trend analysis;
- audience analysis;
- Business-facing Basic Analytics.

---

## 10. Offering Management Boundary

The Business Dashboard may provide entry to:

- create Offering;
- edit Offering;
- publish Offering;
- retire Offering;
- view owned Offering records.

`PRD-0001-offering.md` owns:

- lifecycle states and transitions;
- publication conditions;
- final Offering Public Eligibility;
- editability by state;
- retirement outcomes;
- Presentation.

PRD-0005 does not duplicate those rules.

Business-management permissions may narrow access, including the Restricted rules in §8.3.

Every Offering remains associated with exactly one Business.

Permanent Offering deletion is not available.

---

## 11. Affiliate Destination Management Boundary

### 11.1 Supporting relationship

PRD-0005 provides only the authorized Business-management entry to Frozen:

```text
F06 — Affiliate Destination Configuration
F07 — Affiliate Destination Eligibility Governance
```

Both map to Handoff Enablement.

PRD-0001 remains the sole behaviour owner.

### 11.2 Business-side entry

For an applicable owned Offering, the Dashboard may allow the authorized Business to:

- create its Affiliate Destination where none exists;
- edit its Affiliate Destination;
- view destination status;
- view validation result;
- view Affiliate Destination Handoff Eligibility.

PRD-0005 does not define:

- zero-or-one cardinality;
- destination status;
- validation meaning;
- authoring or editing consequences;
- Affiliate Destination Handoff Eligibility;
- Review, Validate, Enable, or Disable action outcomes.

### 11.3 Platform boundary

`PRD-0006-platform.md` owns the Admin action surface:

```text
Review
Validate
Enable
Disable
```

Business may not self-validate, self-enable, or self-disable an Affiliate Destination.

---

## 12. Request Correction and Owner Response

### 12.1 Approved target set

Request Correction may identify only Business-owned information:

- Business Information;
- Offering content;
- Affiliate Destination configuration;
- Direct Contact information.

User Account correction is outside V1.

### 12.2 Owner notice

When Platform records Request Correction:

- the General Moderation Case remains Open;
- the Business Dashboard may show a correction notice;
- the notice identifies the affected approved target area;
- the owner may open the applicable authorized management area;
- the owner may edit information they are normally authorized to edit;
- where §8.3.1 applies, the owner may use the bounded correction-edit path for the exact Offering and targeted content area;
- the notice changes no status or eligibility result by itself;
- no in-platform message, reply, conversation, ticket discussion, or inbox is created.

### 12.3 Re-review boundary

An owner edit does not close the case automatically.

For a bounded correction edit:

- the case remains Open;
- the Business remains Restricted;
- Business Public Exposure Input remains Ineligible;
- the Offering lifecycle remains Published or Hidden;
- the Offering remains publicly ineligible;
- Platform re-review is required.

Platform may then:

- apply an approved action;
- make a no-action decision;
- close the case.

PRD-0006 owns Open/Closed case status, bounded-path enforcement at the Platform action surface, re-review, and closing behaviour.

PRD-0005 owns the Business-side notice and bounded authorized edit entry.

## 13. Permissions Matrix

Legend:

- `✓` — permitted;
- `✗` — not permitted;
- `Conditional` — requires Enabled User Account, exact Business ownership, Business status, and applicable target rules;
- `—` — owned elsewhere or no Business permission is created here.

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| View public Business identity through eligible Offering Presentation | ✓ | ✓ | ✓ | ✓ |
| View protected Direct Contact information | ✗ | Conditional | Conditional | Conditional |
| Create a Business | ✗ | ✓ | ✓ | ✓ |
| Own multiple Businesses | ✗ | ✓ | ✓ | ✓ |
| Enter an owned-Business context | ✗ | Conditional | ✓ | Conditional |
| Manage owned Business Information | ✗ | Conditional | Conditional | Conditional |
| View owned Business Dashboard | ✗ | Conditional | Conditional | Conditional |
| Create Offering for Unrestricted owned Business | ✗ | Conditional | Conditional | Conditional |
| Manage existing Draft Offering | ✗ | Conditional | Conditional | Conditional |
| Edit exact correction-targeted Published/Hidden Offering while Restricted | ✗ | Conditional | Conditional | Conditional |
| Publish Offering | ✗ | Conditional | Conditional | Conditional |
| Retire owned Offering | ✗ | Conditional | Conditional | Conditional |
| Create or edit Affiliate Destination for applicable owned Offering | ✗ | Conditional | Conditional | Conditional |
| Review / Validate / Enable / Disable Affiliate Destination | ✗ | ✗ | ✗ | — |
| Restrict or Restore Business | ✗ | ✗ | ✗ | — |
| Manage another Business without authorization | ✗ | ✗ | ✗ | ✗ |
| View Business-facing analytics | ✗ | ✗ | ✗ | ✗ |
| Use Business Messaging inbox | ✗ | ✗ | ✗ | ✗ |

Notes:

- Admin authorization does not grant automatic Business ownership.
- An Admin may manage a Business only through the normal ownership relationship.
- For ownership-derived rows, `Conditional` in Admin Context means the authenticated User also satisfies the normal authorized Business-ownership relationship and acts through that owned-Business authority.
- Admin authorization alone does not grant the bounded correction-edit permission.
- Admin moderation actions are owned by PRD-0006 and are represented by `—`.
- Restricted Business permissions follow §8.3.
- Suspended accounts cannot enter User, Business, or Admin contexts under PRD-0003.

---

## 14. Product Flows

### 14.1 Create Business

```text
Enabled authenticated User
→ provide Business display name
→ create Business without prior Admin approval
→ Unrestricted / Exposure Eligible
→ owner management available
→ optional Business-context entry
```

### 14.2 Manage Business Information

```text
Enabled owner
→ select owned Business
→ Business Dashboard
→ edit approved Business Information
→ exposure class remains authoritative
```

### 14.3 Restrict and restore

```text
Unrestricted
→ Platform Restrict Business
→ Restricted
→ Business Public Exposure Input = Ineligible
```

```text
Restricted
→ Platform Restore Business
→ Unrestricted
→ Business Public Exposure Input = Eligible
→ PRD-0001 reevaluates final Offering Public Eligibility
```

### 14.4 Offering-management entry

```text
Owned Business Dashboard
→ select owned Offering action
→ PRD-0001 controls result
```

### 14.5 Affiliate Destination-management entry

```text
Owned Offering
→ open Affiliate Destination management
→ PRD-0001 F06/F07 behaviour
→ Platform performs Review / Validate / Enable / Disable
```

### 14.6 Correction response

```text
Platform Request Correction recorded
→ correction notice visible in Dashboard
→ owner opens applicable management area
→ owner edits authorized information
→ Platform may review again
```

No Messaging flow is created.

---

## 15. Functional Requirements

### Creation and ownership

1. The platform shall allow an Enabled authenticated User to create a Business.
2. Business creation shall require an owning User Account and Business display name.
3. Business creation shall not require prior Admin approval.
4. A new Business shall begin Unrestricted with Public Exposure Input Eligible.
5. A created Business shall be immediately owner-manageable.
6. One User Account may own multiple Businesses.
7. Each Business shall have exactly one owner in V1.
8. A Business shall not be represented as a separate login identity.
9. Unauthorized Business management shall be denied.

### Business Information

10. PRD-0005 shall own the field inventory in §5.5.
11. Business display name shall be required.
12. Logo, short description, telephone, email, and external contact URL shall be optional.
13. Owners shall manage all fields for the selected owned Business.
14. V1 shall provide no dedicated public Business Profile page.
15. Public Offering Presentation shall consume only the public Business identity set.
16. Direct Contact channels shall require authentication and shall be consumed by PRD-0004.
17. Zero Direct Contact channels shall be permitted.

### Moderation and exposure

18. Business Moderation Status values shall be Unrestricted and Restricted.
19. Business Public Exposure Input values shall be Eligible and Ineligible.
20. Unrestricted shall produce Exposure Eligible.
21. Restricted shall produce Exposure Ineligible.
22. Restriction shall not change Offering lifecycle.
23. Restricted shall preserve owner access to Business Information and existing Draft Offerings.
24. Restricted shall block new Offering creation and Draft publication.
25. Restore shall not automatically publish, restore, or change any Offering lifecycle state.
26. User Account suspension shall not change Business Moderation Status or Public Exposure Input.

### Dashboard

27. The platform shall provide the Dashboard product minimum in §9.2.
28. The active Business context shall be explicit when multiple Businesses are owned.
29. The Dashboard shall provide no Business analytics, CRM, or Messaging capability.

### Offering and Affiliate Destination entry

30. Business shall reach Offering behaviour without redefining PRD-0001 outcomes.
31. Business shall provide the F06/F07 management entry without becoming the Handoff Enablement behaviour owner.
32. Business shall not self-review, self-validate, self-enable, or self-disable an Affiliate Destination.
33. Permanent Offering deletion shall not be provided.

### Correction

34. Request Correction targets shall be limited to Business Information, Offering content, Affiliate Destination configuration, and Direct Contact information.
35. User Account correction shall remain outside V1.
36. Request Correction may be surfaced as an owner-facing notice while the case is Open.
37. The notice shall change no state or eligibility result by itself.
38. Owner editing shall not close the case automatically.
39. Correction handling shall create no in-platform Messaging or reply workflow.
40. Business display name shall remain non-empty and an invalid edit shall be rejected.
41. A Restricted Business shall retain no normal edit permission for Published or Hidden Offerings.
42. A bounded correction-edit path shall require an Open case, Offering-content target, Published/Hidden target lifecycle, and exact Business ownership.
43. The bounded path shall permit editing only the exact Offering and targeted content area.
44. The bounded path shall not grant creation, publication, unrelated edit, lifecycle, moderation, exposure, public-eligibility, case-closure, or Messaging authority.
45. A bounded correction edit shall preserve the Universal Publication Minimum.
46. A bounded correction edit shall require Platform re-review and shall not close the case automatically.

---

## 16. Acceptance Criteria

```gherkin
Scenario: Business creation requires only the product minimum
  Given an Enabled authenticated User
  And a Business display name
  When the User creates a Business
  Then one Business is created
  And no prior Admin approval is required
  And Business Moderation Status is Unrestricted
  And Business Public Exposure Input is Eligible
  And the Business is available to the owner for management

Scenario: Business is not a separate login
  Given a User owns a Business
  When the User enters Business context
  Then the same User Account is used
  And no Business login identity is created

Scenario: One User owns multiple Businesses safely
  Given a User owns more than one Business
  When the Business Dashboard is used
  Then the active Business is explicit
  And a management action affects only the selected Business

Scenario: Business display name remains required
  Given a Business exists
  When its owner attempts to remove or save an empty Business display name
  Then the save is rejected
  And the current valid display name remains

Scenario: Public Business identity is bounded
  Given an Offering is publicly eligible
  And its Business Public Exposure Input is Eligible
  When complete Offering Presentation is opened
  Then Business display name is available
  And supplied logo and short description may be available
  And telephone, email, and external contact URL are not part of the public identity set

Scenario: Direct Contact information requires authentication
  Given a Guest opens an eligible Offering
  When protected Business contact information is evaluated
  Then telephone, email, and external contact URL remain unavailable

Scenario: A Business may exist without Direct Contact
  Given a Business supplies no telephone, email, or external contact URL
  When Business creation or management is evaluated
  Then the Business remains valid
  And PRD-0004 cannot offer a Direct Contact channel until one is supplied and otherwise eligible

Scenario: Restrict Business publishes the Business input
  Given a Business is Unrestricted
  When Platform applies Restrict Business
  Then Business Moderation Status becomes Restricted
  And Business Public Exposure Input becomes Ineligible
  And Offering lifecycle states remain unchanged

Scenario: Restricted owner retains bounded management
  Given an Enabled owner acts for a Restricted Business
  When the Dashboard is opened
  Then Business Information may be edited
  And existing Draft Offerings may be managed
  And new Offering creation is unavailable
  And Draft publication is unavailable

Scenario: Restore Business does not cross Offering lifecycle
  Given a Business is Restricted
  When Platform applies Restore Business
  Then Business Moderation Status becomes Unrestricted
  And Business Public Exposure Input becomes Eligible
  And no Draft is automatically published
  And no Hidden or Archived Offering is restored

Scenario: User suspension does not moderate the Business
  Given a Business is Unrestricted
  And its owner User Account becomes Suspended
  When Business state is evaluated
  Then Business Moderation Status remains Unrestricted
  And Business Public Exposure Input remains Eligible
  And the owner cannot enter Business context while Suspended

Scenario: Dashboard is a management surface
  Given an Enabled owner enters an owned-Business context
  When the Dashboard opens
  Then Business Information management is available
  And owned Offering-management entry is available subject to target rules
  And Affiliate Destination-management entry is available subject to target rules
  And Business analytics are not implied

Scenario: Affiliate Destination entry preserves ownership
  Given an authorized Business selects an owned Offering
  When it creates or edits the associated Affiliate Destination
  Then PRD-0001 owns the product outcome
  And PRD-0005 provides only the management entry
  And the Business cannot self-enable the destination

Scenario: Restricted Business uses bounded correction edit
  Given Business Moderation Status is Restricted
  And one General Moderation Case is Open
  And Request Correction targets Offering content
  And the target Offering is Published or Hidden
  And the acting User is the authorized Business owner
  When the owner opens the correction notice
  Then only the exact Offering and targeted content area are editable
  And no unrelated Published or Hidden Offering becomes editable
  And Business Public Exposure Input remains Ineligible
  And Offering lifecycle remains unchanged

Scenario: Bounded correction edit preserves integrity and re-review
  Given a Restricted owner uses the bounded correction-edit path
  When the corrected content is saved
  Then the Universal Publication Minimum remains satisfied
  And the General Moderation Case remains Open
  And Platform re-review is required
  And no Messaging or reply workflow is created

Scenario: Bounded correction edit is unavailable without all gates
  Given at least one bounded-path condition is absent
  When a Restricted owner attempts to edit a Published or Hidden Offering
  Then the edit is denied

Scenario: Request Correction uses the approved target set
  Given Platform records Request Correction
  When the target is evaluated
  Then it identifies Business Information, Offering content, Affiliate Destination configuration, or Direct Contact information
  And User Account correction is not created

Scenario: Owner edit does not close correction automatically
  Given a correction case is Open
  When the owner edits the affected information
  Then the case remains Open
  And Platform re-review is required before closure

Scenario: Request Correction creates no Messaging
  Given Platform records Request Correction
  When the owner opens the Business Dashboard
  Then a correction notice may identify the affected management area
  And no inbox, conversation, or reply workflow is created
  And no status or eligibility result changes by the notice alone

Scenario: No dedicated public Business page exists
  Given a Business Profile exists
  When public navigation is evaluated
  Then no standalone public Business Profile page is required in V1
  And Business Information may appear only through authorized Offering and Direct Contact behaviour
```

---

## 17. Related PRDs

### PRD-0001 — Offering

Owns:

- Offering lifecycle;
- final Offering Public Eligibility composition;
- complete Offering Presentation;
- Affiliate Destination product behaviour;
- F06/F07 product outcomes.

Consumes Business Public Exposure Input and public Business identity by reference.

### PRD-0002 — Discovery

Consumes only final Offering Public Eligibility from PRD-0001.

Does not consume Business Moderation Status directly.

### PRD-0003 — Identity

Owns:

- User Account access status;
- authentication;
- Business-context gate;
- Admin-context gate;
- authenticated-only Direct Contact gate.

### PRD-0004 — Decision

Owns:

- Direct Contact availability, reveal, handoff, and Completion;
- Affiliate Handoff and Completion.

Consumes Business contact information and authoritative eligibility results by reference.

### PRD-0006 — Platform

Owns:

- Request Correction;
- Restrict Business;
- Restore Business;
- Affiliate Destination Administration action surfaces;
- Admin review and action execution.

Consumes PRD-0005 outcomes without redefining them.

---

## 18. Related ADRs, Capability Architecture, and Owner Decisions

### Accepted ADRs

- `ADR-0006 — Affiliate Destination Ownership`
- `ADR-0007 — Domain Scope of the Capability First Rule`
- `ADR-0008 — Handoff Enablement Capability`

### Frozen Capability Architecture

- `OFFERING_CAPABILITY_ARCHITECTURE.md` Frozen v2.0
  - F06 Affiliate Destination Configuration;
  - F07 Affiliate Destination Eligibility Governance;
  - PRD-0005 supporting relationship boundary.

### Applied Owner Decisions

- D-03 — Affiliate Destination ownership;
- D-04 — Direct Contact model and channel set;
- D-15/D-16 — Business moderation status and consequences;
- D-20 — Business Public Exposure Input ownership;
- D-21 — separate Affiliate Destination Administration action family.

---

## 19. Accepted Deferrals

The following are accepted V1 deferrals and do not block Freeze:

1. **Technical field validation**
   - Format checks, URL checks, telephone validation, and storage remain implementation concerns.
   - Business display name must remain non-empty regardless of implementation.

2. **Future public Business presence**
   - A dedicated public Business Profile page requires separate scope and ownership decisions.

3. **Future team access**
   - Ownership transfer, co-owners, team members, invitations, and delegated permissions remain outside V1.

4. **Future Business lifecycle**
   - Closure, archival, deletion, and restoration remain outside V1.
   - Unrestricted and Restricted remain moderation statuses, not a complete lifecycle.

5. **Future Business analytics**
   - Business-facing performance or conversion analytics requires an explicit scope decision.

6. **External contact response**
   - External phone, email, or website outcomes remain outside the platform.
   - No in-platform receipt, response, or success state is created.

No downstream UX or User Story may broaden these deferrals.

