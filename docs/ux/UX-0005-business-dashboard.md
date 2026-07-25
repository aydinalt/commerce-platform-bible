# UX-0005 — Business Dashboard

- **UX ID:** UX-0005
- **Title:** Business Dashboard
- **Status:** Frozen
- **Version:** 1.0
- **Supersedes:** Draft v0.1
- **Approved candidate:** In Review v0.3
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0005 — Business Dashboard. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.3 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.3):** Focused independent-audit correction for UX-A01. Declares reachable Business Dashboard entry from UX-0008 using one exact owned Business context and hands Logout execution back to UX-0008. No Business permission, lifecycle, moderation, or authoring behaviour changes.

**Revision Note (0.2):** Controlled revision against Frozen PRD-0001 v3.1, PRD-0003 v3.1, PRD-0005 v1.3, and PRD-0006 v2.1. Removes permanent Offering deletion, Business analytics, Message/Favorites counts, and automatic-publication assumptions. Adds explicit Business context, moderation status, Business and Direct Contact information management, authoritative Offering inventory and actions, Affiliate Destination status visibility, correction notices, Restricted permissions, bounded correction edit, and Platform re-review.

> This document defines experience behaviour only. It does not define product state, visual style, analytics, component technology, APIs, storage, or Offering/Affiliate lifecycle rules.

---

## 1. Purpose

Business Dashboard gives an Enabled authenticated User one clear owned-Business context for managing Business Information, Direct Contact information, owned Offerings, Affiliate Destination configuration, and correction notices within Frozen PRD permissions.

## 2. Business Value

The experience lets Businesses participate as controlled partners without analytics, Messaging, permanent deletion, or authority over Platform validation and moderation.

## 3. Scope

- active Business identity;
- explicit switching among owned Businesses;
- Business Moderation Status;
- Business Information management;
- Direct Contact information management;
- correction notices;
- Offering inventory by Draft, Published, Hidden, and Archived;
- applicable create, edit, publish, retire, and historical-view entries;
- Restricted Business permission effects;
- bounded correction-edit path;
- Affiliate Destination create/edit entry;
- destination status, validation result, and Handoff Eligibility visibility.

## 4. Out of Scope

- Business analytics;
- Message or Favorites counts;
- conversion, revenue, ranking, trend, or audience metrics;
- permanent Offering deletion;
- dedicated public Business page;
- Business team members or ownership transfer;
- complete Business lifecycle;
- self-review, self-validation, self-enable, or self-disable of Affiliate Destination;
- Messaging;
- moderation actions owned by Admin;
- technical authoring forms or storage.

## 5. Entry Points and Conditions

### 5.1 Entry Points

UX-0005 may be entered when UX-0008 sends:

- one Enabled authenticated User context;
- one exact Business selected by the person;
- an authoritative ownership relationship between that User and Business.

UX-0005 may also resume from one of its own Business-management subareas while preserving the same exact active Business context.

Logout requested from UX-0005 is handed to UX-0008 for execution.

### 5.2 Entry Conditions

Business Dashboard opens only when:

```text
User Account access status = Enabled
AND
acting User is authorized for the selected Business
```

UX-0005 reevaluates these conditions on entry and after a Business switch.

Business is a context of the same User Account, not a separate login.

Admin authorization alone does not create an entry path or Business ownership.

## 6. Active Business Context

### 6.1 One owned Business

The experience may enter that Business context directly while clearly identifying the active Business.

### 6.2 Multiple owned Businesses

The active Business is explicit.

Switching:

- requires a person action;
- changes the management context;
- does not change ownership;
- never silently applies an action to another Business.

### 6.3 Context identity

The active Business display name and Business Moderation Status remain identifiable throughout management actions.

## 7. Business Information

The authorized owner may manage:

- required Business display name;
- optional logo;
- optional public description;
- optional telephone;
- optional email;
- optional external website or contact URL.

Business display name cannot be removed or saved empty.

Public Business identity and authenticated-only Direct Contact information remain distinguishable.

Editing Business Information does not automatically change moderation status, exposure input, Offering lifecycle, or Completion.

## 8. Offering Inventory

The inventory is organized by authoritative lifecycle state:

```text
Draft
Published
Hidden
Archived
```

For each owned Offering, the experience may expose only actions currently permitted by PRD-0001 and the Business access gate.

### Draft

Potential entries:

- view;
- edit;
- publish where permitted;
- retire;
- create or edit Affiliate Destination where applicable.

### Published

Potential entries:

- view;
- edit where Business status permits;
- retire;
- create or edit Affiliate Destination where applicable.

Published does not by itself promise public Discovery presence.

### Hidden

Potential entries:

- view;
- edit where Business status permits;
- retire;
- create or edit Affiliate Destination where applicable.

The Business owner cannot Restore Hidden to Published.

### Archived

- historical view only;
- no edit;
- no restore;
- no new Affiliate Destination authoring;
- historical destination information may remain visible.

Permanent deletion is absent.

## 9. Offering Actions

### Create

Available only where Business Moderation Status permits.

New Offering begins as Draft.

### Edit

Edit availability consumes PRD-0001 lifecycle rules and PRD-0005 Business access rules.

### Publish

Available only for an owned Draft where:

- Business is Unrestricted;
- Universal Publication Minimum is satisfied.

The experience presents validation feedback without redefining the minimum.

### Retire

Available for an owned Draft, Published, or Hidden Offering.

Retirement produces Archived under PRD-0001.

### Public eligibility language

The Dashboard distinguishes:

- lifecycle Published;
- final Offering Public Eligibility.

It never states that every Published Offering is public.

## 10. Restricted Business Behaviour

A Restricted Business:

- may manage Business Information;
- may manage existing Draft Offerings;
- may view Published, Hidden, and Archived Offerings;
- cannot create a new Offering;
- cannot publish Draft;
- cannot normally edit Published or Hidden;
- remains publicly ineligible through Business Public Exposure Input;
- may retire an owned Draft, Published, or Hidden Offering;
- may use the bounded correction-edit path where every condition is satisfied.

## 11. Bounded Correction-Edit Path

Available only when:

```text
Business Moderation Status = Restricted
AND
General Moderation Case = Open
AND
Request Correction target = Offering content
AND
target Offering lifecycle = Published or Hidden
AND
acting User = authorized owner
```

The owner may edit only:

- the exact Offering identified by the correction notice;
- the exact targeted content area.

The experience does not grant:

- new Offering creation;
- Draft publication;
- unrelated Published/Hidden edit;
- untargeted edit;
- lifecycle change;
- moderation-status change;
- exposure-input change;
- public eligibility;
- automatic case closure;
- Messaging.

The saved result must preserve the Universal Publication Minimum.

The case remains Open and Platform re-review is required.

## 12. Correction Notices

A correction notice may identify:

- Business Information;
- Offering content;
- Affiliate Destination configuration;
- Direct Contact information.

The notice:

- opens the applicable authorized management area;
- changes no state by itself;
- remains bounded to the target;
- creates no message, conversation, reply, or inbox.

Owner edits do not close the case automatically.

## 13. Affiliate Destination Management

For an applicable owned Draft, Published, or Hidden Offering, and only where the applicable Business access rules permit management, the experience may allow:

- create where none exists;
- edit;
- view status;
- view validation result;
- view Handoff Eligibility.

For a Restricted Business:

- Affiliate Destination editing is available only where the associated Offering remains owner-manageable under the Frozen Business rules;
- an Offering-content bounded correction does not grant unrelated Affiliate Destination configuration authority;
- a correction notice targeting Affiliate Destination configuration does not bypass the ordinary access gate.

The Business cannot:

- Review;
- Validate;
- Enable;
- Disable;
- recalculate Handoff Eligibility.

For Archived Offerings, destination information is view-only.

## 14. Empty and Loading Behaviour

### No Offerings

The experience identifies the active Business and, where permitted, offers Create Offering.

For Restricted Business, it does not present creation as available.

### No correction notices

No message inbox or conversation substitute is shown.

### Loading

The active Business context remains identifiable.

Actions remain unavailable until the authoritative target state is resolved.

## 15. Error Behaviour

- a failed context switch does not change the active Business;
- a failed save preserves the last confirmed information;
- a failed Offering action does not claim a lifecycle transition;
- a failed correction edit leaves the case Open;
- a failed Affiliate Destination save does not claim validation or enablement.

## 16. Permissions

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| Enter owned Business Dashboard | ✗ | Conditional | Conditional | Conditional |
| Switch among owned Businesses | ✗ | Conditional | Conditional | Conditional |
| Manage owned Business Information | ✗ | Conditional | Conditional | Conditional |
| Manage owned Direct Contact information | ✗ | Conditional | Conditional | Conditional |
| Create Offering | ✗ | Conditional | Conditional | Conditional |
| Publish owned Draft | ✗ | Conditional | Conditional | Conditional |
| Retire owned Offering | ✗ | Conditional | Conditional | Conditional |
| Edit exact correction-targeted Published/Hidden Offering while Restricted | ✗ | Conditional | Conditional | Conditional |
| Permanently delete Offering | ✗ | ✗ | ✗ | ✗ |
| Self-validate or self-enable Affiliate Destination | ✗ | ✗ | ✗ | ✗ |
| View Business analytics | ✗ | ✗ | ✗ | ✗ |
| Use Messaging | ✗ | ✗ | ✗ | ✗ |

Admin Context is Conditional only where the same User also has the normal authorized Business ownership relationship. Admin authorization alone grants no Business-management permission.

## 17. Accessibility Requirements

- Active Business context and moderation status are perceivable.
- Switching has a predictable focus result and confirmation.
- Lifecycle state, public-eligibility meaning, and available actions are distinguishable.
- Correction target and exact editable area are clear.
- Restricted and unavailable actions are explained without color alone.
- Form errors are associated with the relevant information.
- Historical view-only content is identifiable.

## 18. Related Documents

- `PRD-0001-offering.md` — lifecycle, publication, eligibility, destination behaviour.
- `PRD-0003-identity.md` — Enabled User and Business context.
- `PRD-0005-business.md` — Dashboard and Business permissions.
- `PRD-0006-platform.md` — correction cases and Affiliate administration.
- `UX-0006-admin-dashboard.md` — Request Correction and re-review.
- `UX-0008-authentication.md` — authenticated-context entry and Logout execution.

## 19. Acceptance Criteria

```gherkin
Scenario: Reach Business Dashboard from Authentication
  Given an Enabled authenticated User owns one or more Businesses
  When the person explicitly selects one Business through UX-0008
  Then UX-0005 receives that exact Business context
  And the Dashboard opens only if ownership remains valid

Scenario: Logout returns to Authentication owner
  Given the Business Dashboard is open
  When the person requests Logout
  Then UX-0008 executes Logout
  And UX-0005 does not retain authenticated Business context

Scenario: Active Business is explicit
  Given a User owns multiple Businesses
  When the Dashboard opens
  Then one active Business is clearly identified
  And no action silently targets another Business

Scenario: Published is not presented as automatically public
  Given an owned Offering is Published
  When it appears in the inventory
  Then lifecycle Published and final public eligibility remain distinguishable

Scenario: Permanent delete is absent
  Given an owned Offering
  When management actions are presented
  Then no permanent Delete Offering action exists

Scenario: Restricted Business cannot normally edit Published
  Given Business Moderation Status is Restricted
  And no qualifying correction case exists
  When the owner opens a Published Offering
  Then normal edit is unavailable

Scenario: Restricted Business uses bounded correction edit
  Given every bounded correction condition is satisfied
  When the owner opens the correction notice
  Then only the exact Offering and targeted content area are editable
  And the Business remains Restricted
  And public eligibility is not restored

Scenario: Correction edit requires re-review
  Given a bounded correction edit is saved
  When the Dashboard reports the result
  Then the case remains Open
  And Platform re-review is required
  And no Messaging flow is created

Scenario: Business sees Affiliate Destination status
  Given an applicable owned Offering has an Affiliate Destination
  When its management area opens
  Then status, validation result, and Handoff Eligibility are visible
  And Review, Validate, Enable, and Disable are unavailable to the Business

Scenario: Dashboard has no Business analytics
  Given the Business Dashboard
  When the management overview appears
  Then no performance, conversion, Message, Favorites, revenue, ranking, trend, or audience metric is shown
```

## 20. Accepted UX Deferrals

The following do not block review:

- exact management layout;
- exact correction-notice copy;
- authoring-form field arrangement;
- technical upload and validation implementation;
- visual treatment of lifecycle and eligibility states.

No deferral may add analytics, permanent deletion, Messaging, Favorites, self-moderation, or Business authority beyond Frozen PRD permissions.
