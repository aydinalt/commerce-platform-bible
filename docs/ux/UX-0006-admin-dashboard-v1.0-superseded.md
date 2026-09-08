# UX-0006 — Admin Dashboard

- **UX ID:** UX-0006
- **Title:** Admin Dashboard
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

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0006 — Admin Dashboard. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.4 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.4):** Focused independent-audit correction for UX-A01. Declares reachable Admin Dashboard entry from UX-0008 using an Enabled User Account with existing Admin authorization and hands Logout execution back to UX-0008. No Admin action, authorization, moderation, or analytics behaviour changes.

**Revision Note (0.3):** Controlled revision against Frozen PRD-0001 v3.1, PRD-0003 v3.1, PRD-0005 v1.3, and PRD-0006 v2.1. Removes obsolete Active/Hidden/Archived case states, generic Platform Configuration, and unresolved provisioning TODOs. Defines Open/Closed General Moderation cases, the exact seven actions, bounded correction re-review, separate Affiliate Destination Administration, Category/Domain and Attribute management, Basic Analytics, Owner-only authorization boundaries, and target-state-safe errors.

> This document defines experience behaviour only. It does not define target states, product transitions, visual style, analytics implementation, components, APIs, storage, or Admin provisioning technology.

---

## 1. Purpose

Admin Dashboard gives an authorized Admin an actionable operational view for General Moderation, Affiliate Destination Administration, Category and Attribute management, and Basic Analytics without inventing states or a generic settings surface.

## 2. Business Value

The experience supports trust and operational clarity by guiding the Admin from authoritative workload to an approved action and visible result.

## 3. Scope

- Admin-context entry;
- action guidance;
- General Moderation cases;
- Open and Closed case status;
- exact seven General Moderation actions;
- Request Correction and re-review;
- separate Affiliate Destination Administration;
- Category and Domain management;
- Attribute-definition management and mutation-safety feedback;
- Admin-facing Basic Analytics;
- approved time periods and Domain grouping;
- ordinary Admin and Owner-only boundaries;
- loading, empty, validation, and error behaviour.

## 4. Out of Scope

- Admin authorization grant/removal UI;
- separate Admin account;
- Admin tiers or delegation;
- generic Platform Settings or Configuration;
- Offering archive by Admin;
- Draft publication by Admin;
- Business or Offering state invention;
- Messaging moderation;
- payment, billing, CRM, marketing, or recommendations;
- automated moderation;
- analytics implementation or external-success inference.

## 5. Entry Points and Conditions

### 5.1 Entry Points

UX-0006 may be entered when UX-0008 sends:

- one Enabled authenticated User context;
- an existing Admin authorization relationship;
- an explicit person choice to enter Admin context.

UX-0006 may resume from one of its own Admin subareas while preserving the same authorized Admin context.

Logout requested from UX-0006 is handed to UX-0008 for execution.

### 5.2 Entry Conditions

Admin Dashboard opens only when:

```text
User Account access status = Enabled
AND
Admin authorization is present
AND
Admin context is explicitly entered
```

UX-0006 reevaluates these conditions on entry.

Admin authorization attaches to the existing User Account.

It does not create Business ownership.

## 6. Admin Overview

The overview provides:

- actionable General Moderation workload;
- Affiliate Destination Administration workload;
- Category and Attribute management entry;
- Basic Analytics;
- clear separation between informational indicators and action queues.

No generic configuration area is shown.

## 7. General Moderation Cases

### 7.1 Case status

Authoritative case statuses:

```text
Open
Closed
```

Opening or reviewing a case changes no target state.

### 7.2 Approved targets

Request Correction may target:

- Business Information;
- Offering content;
- Affiliate Destination configuration;
- Direct Contact information.

User Account correction is absent.

### 7.3 Exact action set

The seven General Moderation actions are:

1. Request Correction;
2. Hide Offering;
3. Restore Offering;
4. Restrict Business;
5. Restore Business;
6. Suspend User;
7. Reinstate User.

The experience presents only actions currently valid for the target state and authority.

### 7.4 Action consequences

The Dashboard explains and then consumes the result owned by the target PRD.

It does not redefine the result.

Examples:

- Hide Offering: Published → Hidden;
- Restore Offering: Hidden → Published;
- Restrict Business: Unrestricted → Restricted;
- Restore Business: Restricted → Unrestricted;
- Suspend User: Enabled → Suspended;
- Reinstate User: Suspended → Enabled.

### 7.5 Case closure

An Admin may close an Open case after:

- an approved action; or
- a no-action decision.

Closing a case creates no target state.

## 8. Request Correction and Re-Review

Request Correction:

- keeps the case Open;
- changes no lifecycle, moderation, access, or eligibility state by itself;
- creates a correction notice in UX-0005;
- creates no Messaging.

For a Restricted Business bounded Offering correction:

- the exact target and content area are visible;
- the Business owner may use the bounded path through UX-0005;
- the case remains Open after owner edit;
- Admin re-review is required;
- closure remains an explicit Admin action after re-review.

The bounded owner response is not an eighth General Moderation action.

## 9. Affiliate Destination Administration

This is separate from General Moderation.

Approved actions:

- Review;
- Validate;
- Enable;
- Disable.

### Workload

```text
Draft + Not Validated → Needs Validation
Draft + Invalid → Business Correction Needed
Draft + Valid → Ready to Enable
Enabled or Disabled → no pending item
```

### Results

- Review changes no state by itself.
- Validate produces Valid or Invalid.
- Enable requires Valid and produces Enabled/Handoff Eligible.
- Disable produces Disabled/Handoff Ineligible and preserves validation result.

The experience does not recalculate destination states or Handoff Eligibility.

## 10. Category and Domain Management

The Admin may:

- create a root Category with exactly one V1 Domain;
- create a child Category;
- rename a Category;
- reparent within the same Domain;
- retire a Category where permitted.

V1 Domains:

```text
Mobility
Real Estate
Technology
```

The experience prevents:

- self-ancestor hierarchy;
- cross-Domain reparenting;
- root Domain change after child or Offering use;
- retirement while Draft, Published, or Hidden Offering remains assigned;
- retirement while an active child remains.

Archived historical association does not block retirement.

## 11. Attribute Management

The Admin may manage:

- non-empty display name;
- value kind;
- optional Number unit;
- allowed Single/Multi Select values;
- applicable Categories;
- required-for-publication;
- filterable;
- comparable.

Value kinds:

```text
Text
Number
Boolean
Single Select
Multi Select
```

The experience prevents or explains mutation-safety violations, including:

- making an Attribute required while a Published/Hidden Offering lacks a value;
- removing applicability while active lifecycle Offerings contain values;
- changing value kind while active lifecycle Offerings contain values;
- changing/removing used Select values;
- silently deleting existing values;
- making Text filterable.

## 12. Basic Analytics

### 12.1 Periods

- Today;
- Last 7 days;
- Last 30 days;
- All time.

### 12.2 Grouping

Indicators appear:

- overall;
- by Mobility, Real Estate, and Technology where the source provides Domain association.

Free-text Search wording is not used to infer Domain.

### 12.3 Current-state indicators

- User Accounts by Enabled/Suspended;
- Businesses by Unrestricted/Restricted;
- Offerings by Draft/Published/Hidden/Archived;
- Offerings by final public eligibility;
- Affiliate Destinations by status, validation, and Handoff Eligibility;
- General Moderation cases by Open/Closed and Open target type;
- Affiliate workload categories.

### 12.4 Core-flow indicators

- Discovery Starts;
- Offering Presentation Opens;
- Compare Starts;
- Decision Chat Starts;
- Affiliate Handoff Completion count;
- Direct Contact Completion count.

Completion is not presented as purchase, sale, contract, response, or external success.

### 12.5 Action handoff

Actionable indicators may open the relevant queue or management area.

Informational indicators need not be interactive.

## 13. User and Owner Authority Boundaries

Ordinary Admin may suspend or reinstate only non-Admin-authorized User Accounts.

Ordinary Admin may not suspend or reinstate an Admin-authorized account.

Only Product Owner / Architecture Owner may:

- establish first Admin;
- grant/remove Admin authorization;
- suspend/reinstate an Admin-authorized account.

These Owner actions occur outside the V1 Admin UI.

## 14. Empty and Loading Behaviour

- no Open cases: identify that no current General Moderation case needs action;
- no Affiliate workload: do not create a General Moderation substitute;
- no analytics data: distinguish zero from unavailable;
- loading: preserve selected period, queue, and target context;
- actions remain unavailable until authoritative target state is resolved.

## 15. Error Behaviour

- failed action does not claim a target transition;
- failed close leaves the case Open;
- failed Category/Attribute change preserves the last confirmed definition;
- failed validation does not claim Valid/Invalid;
- unauthorized Admin-authorized account suspension is rejected;
- analytics failure does not block unrelated moderation actions where their data is available.

## 16. Permissions

| Action | Guest | User | Business | Ordinary Admin | Product Owner / Architecture Owner |
|---|---:|---:|---:|---:|---:|
| Enter Admin Dashboard | ✗ | ✗ | ✗ | ✓ | ✓ |
| View Basic Analytics | ✗ | ✗ | ✗ | ✓ | ✓ |
| Use seven General Moderation actions | ✗ | ✗ | ✗ | Conditional | Conditional |
| Suspend/Reinstate Admin-authorized User | ✗ | ✗ | ✗ | ✗ | Owner only |
| Review/Validate/Enable/Disable Affiliate Destination | ✗ | ✗ | ✗ | Conditional | Conditional |
| Manage Categories | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage Attributes | ✗ | ✗ | ✗ | ✓ | ✓ |
| Grant/remove Admin authorization in UI | ✗ | ✗ | ✗ | ✗ | ✗ |
| Use generic Platform Settings | ✗ | ✗ | ✗ | ✗ | ✗ |
| Use Messaging moderation | ✗ | ✗ | ✗ | ✗ | ✗ |

## 17. Accessibility Requirements

- Current Admin context, selected queue, case status, target identity, and selected period are perceivable.
- Action names and their expected target effect are explicit.
- Confirmation for consequential actions is understandable and keyboard operable.
- Validation and mutation-safety errors identify the blocked rule.
- Tables and indicator groups have meaningful headers and reading order.
- State changes and failed actions are announced.
- Focus returns to a predictable location after action or case closure.

## 18. Related Documents

- `PRD-0001-offering.md` — Offering and Affiliate Destination results.
- `PRD-0003-identity.md` — Admin authorization and suspension boundaries.
- `PRD-0005-business.md` — Business status and correction response.
- `PRD-0006-platform.md` — Admin action surface, queues, management, analytics.
- `UX-0005-business-dashboard.md` — Business correction notice and bounded response.
- `UX-0008-authentication.md` — authenticated Admin-context entry and Logout execution.

## 19. Acceptance Criteria

```gherkin
Scenario: Reach Admin Dashboard from Authentication
  Given an Enabled User Account has Admin authorization
  When the person explicitly chooses Admin context through UX-0008
  Then UX-0006 receives that authorized context
  And the Admin Dashboard may open

Scenario: Logout returns to Authentication owner
  Given the Admin Dashboard is open
  When the person requests Logout
  Then UX-0008 executes Logout
  And UX-0006 does not retain Admin context

Scenario: Admin Panel requires authorized Enabled account
  Given an account lacks Admin authorization or is Suspended
  When Admin Dashboard entry is attempted
  Then the Admin experience is unavailable

Scenario: General Moderation uses Open and Closed
  Given a moderation case exists
  When its status is presented
  Then the value is Open or Closed
  And no Active, Hidden, or Archived case status is used

Scenario: Exact seven actions are available conditionally
  Given an Open case
  When valid actions are presented
  Then only Request Correction, Hide Offering, Restore Offering, Restrict Business, Restore Business, Suspend User, or Reinstate User may appear
  And target-state conditions determine availability

Scenario: Request Correction requires re-review
  Given Request Correction is applied
  When the Business owner submits a correction
  Then the case remains Open
  And Admin re-review is required
  And no Messaging flow exists

Scenario: Affiliate administration is separate
  Given an Affiliate Destination workload item
  When the Admin opens it
  Then Review, Validate, Enable, and Disable belong to the separate administration family
  And no eighth General Moderation action is created

Scenario: Category cannot cross Domains
  Given a Category belongs to Mobility
  When the Admin attempts to reparent it under Technology
  Then the change is rejected

Scenario: Required Attribute activation is blocked safely
  Given a Published Offering lacks a value
  When the Admin attempts to make the Attribute required
  Then the change is rejected
  And the Offering remains unchanged

Scenario: Basic Analytics uses approved periods
  Given Basic Analytics
  When the period control is available
  Then Today, Last 7 days, Last 30 days, and All time are the available product periods

Scenario: Ordinary Admin cannot suspend Admin-authorized account
  Given a target User Account carries Admin authorization
  When an ordinary Admin attempts Suspend User
  Then the action is unavailable or rejected
  And Admin authorization remains unchanged

Scenario: Generic Platform Configuration is absent
  Given the Admin Dashboard
  When primary areas are presented
  Then no generic Settings or Platform Configuration area exists
```

## 20. Accepted UX Deferrals

The following do not block review:

- exact dashboard layout;
- technical analytics instrumentation;
- technical Admin provisioning;
- exact confirmation copy;
- bulk administration;
- visual chart form;
- technical queue retrieval.

No deferral may add generic settings, automated moderation, unapproved actions, Messaging, Admin tiers, or authority beyond Frozen PRDs.
