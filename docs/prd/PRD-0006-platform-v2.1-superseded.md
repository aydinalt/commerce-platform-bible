# PRD-0006 — Platform

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0006
- **Title:** Platform
- **Status:** Frozen
- **Version:** 2.1
- **Last Updated:** 2026-07-21
- **Scope level:** Product behaviour (non-technical)
- **Supersedes:** Approved v1.0
- **Approved candidate:** In Review v2.1
- **Approval Date:** 2026-07-21
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-21
- **Frozen By:** Product Owner / Architecture Owner

> This document is the Single Information Owner of Platform product behaviour: the action-oriented Admin Panel, general moderation cases and action surfaces, Affiliate Destination Administration action surfaces, Category Management, Attribute Management, and Admin-facing Basic Analytics. It consumes User Account, Business, Offering, Affiliate Destination, and Completion outcomes from their owning PRDs. It defines no technical provisioning mechanism, moderation-detection algorithm, analytics instrumentation, metric query, identity-provider mechanism, API, database, storage, security implementation, frontend component, backend service, audit-log implementation, logging system, monitoring system, or infrastructure.

**Freeze Note (2.1):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-21. Frozen v2.1 is the locked V1 PRD baseline for PRD-0006 — Platform. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (2.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, Final Review, package-level reconciliation, independent Claude audit, and all bounded audit corrections. Approved v2.1 supersedes Approved v1.0 and is the authoritative PRD baseline for PRD-0006 — Platform. This historical Approval Note records that approval and Freeze were separate decisions. The PRD was subsequently Frozen on 2026-07-21. No UX, User Story, traceability, or GitHub file changes automatically.

**Revision Note (2.1):** Controlled post-Claude correction applying accepted Owner Decision A-05 Option B. Defines Platform enforcement and re-review for the bounded correction-edit path available to the authorized owner of a Restricted Business when an Open Request Correction case targets exact Published/Hidden Offering content. Preserves the seven-action General Moderation set, target states, restriction, public ineligibility, lifecycle, and no-Messaging boundary.

**Revision Note (2.0):** Controlled post-approval Freeze-correction candidate applying Owner Decisions P-03, P-04, P-05, and P-06. Defines Open/Closed moderation-case status and close behaviour, aligns Request Correction targets, derives Affiliate Destination workload categories, adds V1 Domain management and inheritance rules, corrects Category retirement for Archived history, completes the Attribute definition/value-kind and mutation-safety contract, and consumes Discovery Start Domain, Offering Presentation Open, and immutable publication recency from their owning PRDs. Preserves the seven-action General Moderation set and the separate four-action Affiliate Destination Administration family. Status remains In Review v2.0. Approved v1.0 remains authoritative until explicit approval.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER APPROVAL`. Approved v1.0 becomes the authoritative product-behaviour source for the action-oriented Admin Panel, General Moderation, Affiliate Destination Administration, Category Management, Attribute Management, and Admin-facing Basic Analytics. It preserves target-owned outcomes, Owner-only Admin provisioning and Admin-authorized-account suspension boundaries, Frozen F06/F07 supporting relationships, and the absence of a standalone generic Platform Settings area. It is not Frozen. Freeze requires a separate Product Owner / Architecture Owner decision.

**Revision Note (0.3):** Controlled correction of In Review v0.2 following the independent Cross-PRD Architecture Audit and explicit Owner Decisions D-04, D-05, D-06, D-07, D-15/D-16, D-21, and D-22. Closes the Admin-reachability blocker; consumes Admin baseline inheritance from Identity; replaces unresolved moderation outcomes with the exact seven-action V1 general moderation set and target-owned effects; preserves the Owner-only restriction for suspending Admin-authorized accounts; introduces the separate four-action Affiliate Destination Administration family under Frozen Handoff Enablement Features F06/F07; defines Category and Attribute management actions consistent with Approved PRD-0001 v2.1; defines the minimum Admin Basic Analytics inventory and Completion consumption; removes the standalone generic Platform Configuration deliverable; closes the prior open questions on Admin provisioning, moderation actions, Category and Attribute management, Affiliate Destination administration, Completion analytics, and configuration inventory. Approved v1.0 is authoritative from 2026-07-21. No other repository document changes automatically.

---

## 1. Purpose

Platform defines how authorized Admins operate and protect the product after Users, Businesses, Offerings, and applicable content exist.

Platform provides:

- an action-oriented Admin Panel;
- post-creation general moderation;
- Affiliate Destination Administration;
- Category Management;
- Attribute Management;
- Admin-facing Basic Analytics.

Platform consumes:

- User Account access status, Admin authorization, and Admin-context entry from `PRD-0003-identity.md`;
- Business Moderation Status and Business Public Exposure Input from `PRD-0005-business.md`;
- Offering lifecycle, final Offering Public Eligibility, Category and Attribute concepts, and Affiliate Destination outcomes from `PRD-0001-offering.md`;
- Discovery activity from `PRD-0002-discovery.md`;
- Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion results from `PRD-0004-decision.md`;
- Handoff Enablement structure from Frozen `OFFERING_CAPABILITY_ARCHITECTURE.md`.

Platform does not replace those owners.

---

## 2. Business Value

Platform allows the product to operate safely without turning administration into a pre-participation gate.

It supports the Foundation by:

- allowing Users, Businesses, and Offerings to exist before moderation;
- guiding Admins toward concrete work rather than reports alone;
- applying only approved outcomes owned by the affected product domain;
- managing Categories and Attributes as shared metadata;
- providing bounded operational visibility through Basic Analytics;
- preserving one universal administration model across Mobility, Real Estate, and Technology;
- keeping technical implementation outside the PRD layer.

Platform succeeds when an authorized Admin can:

1. understand the current operational state;
2. identify work requiring attention;
3. select an approved action;
4. apply the target-owned outcome;
5. manage shared metadata without redefining downstream behaviour.

---

## 3. Scope

V1 Platform includes:

- an Admin Panel available only in an authorized Admin context;
- an operational overview combining action guidance and Basic Analytics;
- general moderation cases for Users, Businesses, Offerings, and applicable Business contact information;
- the exact seven-action V1 general moderation action set;
- enforcement of target restrictions for Suspend User and Reinstate User;
- the separate four-action Affiliate Destination Administration family;
- Category definition creation, rename, hierarchy management, and retirement;
- Attribute definition creation and editing;
- Attribute-to-Category applicability management;
- management of the approved Attribute properties:
  - required for publication;
  - filterable;
  - comparable;
- Admin-facing Basic Analytics;
- consistent Platform behaviour across Mobility, Real Estate, and Technology.

The Admin Panel must combine visibility with action.

Basic Analytics supports Admin decisions but does not perform moderation or management automatically.

---

## 4. Out of Scope

The following are outside PRD-0006:

- prior Admin approval for User Account, Business, Offering, or Affiliate Destination authoring;
- redefining User Account access status;
- redefining Admin authorization;
- granting or removing Admin authorization through the Admin Panel;
- a separate Admin identity type;
- self-service or delegated Admin provisioning;
- granular Admin tiers or role management;
- redefining Business Moderation Status;
- redefining Offering lifecycle;
- redefining final Offering Public Eligibility;
- redefining Affiliate Destination status, validation meaning, or Handoff Eligibility;
- Offering Archive or Archived restore by Admin;
- autonomous moderation;
- AI agents;
- recommendation systems;
- advanced analytics;
- predictive analytics;
- Business-facing analytics;
- custom report builders;
- billing, payments, subscriptions, CRM, advertising, or transaction processing;
- affiliate-network integration, attribution, commission, settlement, or external conversion tracking;
- in-platform Messaging or a Business inbox;
- message moderation;
- user impersonation;
- permanent Category deletion;
- Category merge or automated replacement;
- permanent Attribute deletion;
- Attribute merge, replacement, or lifecycle states;
- a standalone generic Platform Configuration or Settings capability;
- technical provisioning;
- identity-provider configuration;
- moderation-detection implementation;
- analytics instrumentation or metric calculation implementation;
- audit-log implementation;
- API, database, storage, frontend, backend, security, logging, monitoring, deployment, or infrastructure;
- any V2 or excluded capability in `V1_SCOPE.md`.

A capability or setting does not enter V1 merely because an Admin interface could theoretically expose it.

---

## 5. Core Concepts

### 5.1 Admin context

An authenticated operating context available only when Identity confirms Admin authorization.

Admin authorization attaches to an existing User Account.

Admin context inherits the Guest and authenticated User baseline defined by Identity but grants no automatic Business ownership.

### 5.2 Admin Panel

The working surface combining:

- operational visibility;
- items requiring attention;
- approved moderation and administration actions;
- Category and Attribute management;
- Basic Analytics.

### 5.3 Moderation case

The Admin-facing representation of an existing approved target requiring review or an approved action.

Authoritative V1 case statuses:

```text
Open
Closed
```

Rules:

- surfacing or opening a case produces Open;
- opening or reviewing changes no target state;
- Request Correction keeps the case Open until re-review;
- an Admin may close after an approved action or a no-action decision;
- closing creates no target state, lifecycle, access, moderation, or eligibility result.

Case status is a Platform workflow result and not a lifecycle or access state of the target.

### 5.4 General Moderation

The exhaustive V1 action family defined by D-15/D-16:

```text
Request Correction
Hide Offering
Restore Offering
Restrict Business
Restore Business
Suspend User
Reinstate User
```

### 5.5 Affiliate Destination Administration

A separate action family defined by D-21:

```text
Review Affiliate Destination
Validate Affiliate Destination
Enable Affiliate Destination
Disable Affiliate Destination
```

These actions are not additions to General Moderation.

### 5.6 Category definition

Shared metadata organizing Offerings and deriving V1 Domain association.

`PRD-0001-offering.md` owns the Category product concept, Offering association, historical association, and Domain derivation meaning.

Platform owns authorized management actions over Category definitions, including root Domain assignment.

V1 Domain values:

```text
Mobility
Real Estate
Technology
```

### 5.7 Attribute definition

Shared metadata describing Offerings.

Every V1 definition includes:

- non-empty display name;
- value kind;
- applicable Categories;
- required-for-publication flag;
- filterable flag;
- comparable flag.

V1 value kinds:

```text
Text
Number
Boolean
Single Select
Multi Select
```

Additional definition properties:

- Number may define one optional governed unit label;
- Single Select and Multi Select require governed allowed values.

`PRD-0001-offering.md` owns the meaning of Offering Attribute values.

Platform owns definition management and mutation-safety enforcement.

### 5.8 Basic Analytics

Bounded Admin-facing product visibility into:

- current platform state;
- operational workload;
- core-flow activity;
- approved Completion results.

Basic Analytics is not instrumentation, advanced analytics, or autonomous action.

---

## 6. Admin Authorization and Context Rules

### 6.1 Authorization attachment

Admin authorization attaches to an existing authenticated User Account.

V1 introduces no separate Admin account or operator identity.

### 6.2 Provisioning authority

Only the Product Owner / Architecture Owner may decide to:

- establish the first Admin;
- grant Admin authorization;
- remove Admin authorization.

The decision is carried out through a controlled operational process outside the PRD layer.

### 6.3 Admin Panel boundary

The V1 Admin Panel does not provide:

- grant Admin;
- remove Admin;
- transfer Admin;
- delegate Admin;
- manage Admin tiers;
- self-service Admin provisioning.

Holding Admin authorization does not grant authority to provision another Admin.

### 6.4 Baseline inheritance

An Admin-authorized account retains ordinary authenticated User behaviour.

Admin-specific Platform behaviour is available only in Admin context.

Admin authorization does not grant:

- ownership of a Business;
- Business-management authority without the normal Business relationship;
- authority to act through an unrelated Business context.

### 6.5 Suspension boundary for Admin-authorized accounts

An ordinary Admin may suspend or reinstate a non-Admin-authorized User Account.

An ordinary Admin may not suspend or reinstate a User Account carrying Admin authorization.

Only the Product Owner / Architecture Owner may suspend or reinstate an Admin-authorized User Account.

Suspension does not remove Admin authorization.

Platform must reject an unauthorized attempt to target an Admin-authorized account.

---

## 7. General Moderation

### 7.1 Moderation principles

1. Moderation occurs only after the target exists.
2. Opening or reviewing a case changes no target state.
3. Platform presents and applies only approved actions.
4. The target-owning PRD owns the resulting state and consequences.
5. Platform invents no User, Business, Offering, or eligibility state.
6. General Moderation is separate from Affiliate Destination Administration.
7. Request Correction must not create Messaging.

### 7.2 Action-to-outcome map

| Platform action | Target | Outcome owner | Approved product result |
|---|---|---|---|
| Request Correction | Business Information, Offering content, Affiliate Destination configuration, or Direct Contact information | PRD-0005 notice; applicable content owner | No lifecycle, moderation-status, access-status, or eligibility change by itself; case remains Open |
| Hide Offering | Published Offering | PRD-0001 | `Published → Hidden` |
| Restore Offering | Hidden Offering | PRD-0001 | `Hidden → Published` |
| Restrict Business | Unrestricted Business | PRD-0005 | `Unrestricted → Restricted`; lifecycle-Published Offerings lose public eligibility |
| Restore Business | Restricted Business | PRD-0005 | `Restricted → Unrestricted`; only lifecycle-Published Offerings may regain public eligibility |
| Suspend User | Enabled non-Admin-authorized User Account | PRD-0003 | `Enabled → Suspended` |
| Reinstate User | Suspended non-Admin-authorized User Account | PRD-0003 | `Suspended → Enabled` |

User Account correction is outside V1.

For an Admin-authorized User Account, Suspend User and Reinstate User are reserved to the Product Owner / Architecture Owner and are unavailable to an ordinary Admin.

Case closure is a separate Platform workflow operation and does not expand the seven-action General Moderation set.

### 7.3 Request Correction, bounded correction edit, and case closure

Request Correction:

- applies only to the approved Business-owned target set;
- records that correction is required through the approved Admin experience;
- keeps the General Moderation Case Open;
- changes no target status by itself;
- changes no eligibility result by itself;
- creates no in-platform conversation, inbox, ticket discussion, or reply workflow.

### 7.3.1 Restricted Business bounded correction-edit path

Where Request Correction targets Offering content owned by a Restricted Business, Platform makes the bounded path available only when:

```text
General Moderation Case = Open
AND
Request Correction target = Offering content
AND
target Offering lifecycle = Published or Hidden
AND
acting User = authorized owner of the owning Business
```

Platform restricts the path to:

- the exact Offering identified by the correction notice; and
- the exact targeted content area.

Platform must deny:

- creation of a new Offering;
- publication of a Draft Offering;
- editing of another Published or Hidden Offering;
- editing of an untargeted content area;
- any Offering lifecycle change through the correction path;
- any Business Moderation Status change through the correction path;
- any Business Public Exposure Input change through the correction path;
- any public-eligibility restoration through the correction path;
- automatic case closure;
- Messaging, inbox, conversation, ticket discussion, or reply behaviour.

The correction save must preserve the PRD-0001-owned Universal Publication Minimum.

The case remains Open after the owner edit.

Platform re-review is required.

### 7.3.2 Re-review and closure

After re-review, an Admin may close the case when:

- an approved action has been applied; or
- the Admin records a no-action decision.

Closing a case changes no target state.

The bounded correction-edit path is not an eighth General Moderation action. It is the constrained owner response to Request Correction.

### 7.4 Offering actions

Platform may:

```text
Published → Hidden
Hidden → Published
```

Platform may not:

- archive an Offering;
- restore an Archived Offering;
- return Hidden to Draft;
- publish a Draft on behalf of the Business.

### 7.5 Business actions

Restrict Business and Restore Business apply the Business-owned moderation status.

Platform does not alter individual Offering lifecycle states when Business restriction changes.

### 7.6 User actions

Suspend User and Reinstate User apply the Identity-owned access status.

Suspending a User does not automatically:

- restrict a Business;
- hide an Offering;
- archive an Offering;
- change public eligibility.

Separate Business or Offering actions are required where public restriction is intended.

### 7.7 Direct Contact oversight

Platform may:

- review Business-owned contact information;
- request correction;
- apply an approved visibility outcome through the applicable Business or Offering moderation action.

Platform does not own:

- telephone, email, or external contact URL authoring;
- Direct Contact handoff;
- external communication;
- Messaging.

---

## 8. Affiliate Destination Administration

### 8.1 Capability relationship

Affiliate Destination Administration supports Frozen Handoff Enablement.

Structural Features:

```text
F06 — Affiliate Destination Configuration
F07 — Affiliate Destination Eligibility Governance
```

`PRD-0001-offering.md` remains the sole Handoff Enablement behaviour owner.

PRD-0006 provides only the supporting Admin action surface.

### 8.2 Action family

```text
Review Affiliate Destination
Validate Affiliate Destination
Enable Affiliate Destination
Disable Affiliate Destination
```

### 8.3 Action effects consumed from PRD-0001

| Action | PRD-0001-owned product result |
|---|---|
| Review Affiliate Destination | No status, validation, or Handoff Eligibility change by itself |
| Validate Affiliate Destination | Produces `Valid` or `Invalid`; status unchanged |
| Enable Affiliate Destination | Requires `Valid`; produces `Enabled` and Handoff Eligibility `Eligible` |
| Disable Affiliate Destination | Produces `Disabled` and Handoff Eligibility `Ineligible`; current validation result preserved |

PRD-0006 does not define or modify:

- Affiliate Destination status values;
- validation meaning;
- Affiliate Destination Handoff Eligibility composition;
- final Offering Public Eligibility.

### 8.4 Separation from General Moderation

Affiliate Destination Administration:

- is not part of the seven-action General Moderation set;
- is not automatically represented as a General Moderation Case;
- uses the derived work queue below;
- may have distinct analytics;
- does not change Offering lifecycle, Business Moderation Status, or User Account access status.

### 8.5 Derived workload

| PRD-0001-owned result | Platform workload category |
|---|---|
| Draft + Not Validated | Needs Validation |
| Draft + Invalid | Business Correction Needed |
| Draft + Valid | Ready to Enable |
| Enabled | No pending item |
| Disabled | No pending item |

`Business Correction Needed` may be surfaced through the PRD-0005 Business Dashboard correction notice.

No Messaging is created.

The workload category is derived and does not create a new Affiliate Destination state.

---

## 9. Category and Domain Management

### 9.1 V1 actions

An authorized Admin may:

- create a root Category and assign exactly one V1 Domain;
- create a child Category;
- rename a Category;
- change a Category's parent where the result remains a valid hierarchy and the same Domain;
- retire a Category when retirement conditions are satisfied.

### 9.2 Hierarchy and Domain rules

- a Category has zero or one parent;
- a Category with no parent is a root Category;
- a Category cannot become its own ancestor;
- every root Category has exactly one Domain;
- child Categories inherit their root Domain;
- an Offering may be assigned only to an active leaf Category;
- an Offering derives its Domain from that leaf Category;
- Category identity remains stable when its display name changes;
- reparenting across Domains is unavailable in V1;
- a root Domain assignment cannot change after any child Category or Offering exists beneath it.

### 9.3 Retirement rules

A Category may be retired only when:

- no Draft, Published, or Hidden Offering remains assigned; and
- no active child Category remains beneath it.

Archived Offerings may retain historical Category association and do not block retirement.

A retired Category:

- cannot receive new Offering assignments;
- does not appear as an active Browse destination;
- remains available as a historical definition for Archived records.

V1 provides no permanent deletion, merge, automated replacement, or cross-Domain migration.

## 10. Attribute Management

### 10.1 V1 actions

An authorized Admin may:

- create an Attribute definition;
- edit its non-empty display name;
- choose one V1 value kind;
- define one optional unit label for Number;
- define allowed values for Single Select or Multi Select;
- associate the Attribute with applicable Categories;
- remove future applicability where mutation-safety conditions permit;
- set whether the Attribute is required for publication;
- set whether the Attribute is filterable;
- set whether the Attribute is comparable.

### 10.2 Value-kind constraints

- Text is not filterable in V1.
- Number may define one unit label.
- Single Select and Multi Select require at least one governed allowed value.
- Definition changes may not silently reinterpret existing Offering values.

### 10.3 Mutation safety

`required for publication = true` may be enabled only when every Published and Hidden Offering in every applicable Category already has an authoritative value.

Removing Category applicability is blocked while any Draft, Published, or Hidden Offering in that Category contains a value for the Attribute.

Changing value kind is blocked while any Draft, Published, or Hidden Offering contains a value.

Removing or changing an allowed Select value is blocked while any Draft, Published, or Hidden Offering uses it.

Archived values remain historical and readable.

Existing Offering values are never silently deleted.

Changing `filterable` or `comparable` affects future Discovery or Compare presentation but does not change Offering lifecycle.

### 10.4 Ownership boundary

Platform manages definition properties and enforces the mutation-safety rules.

Consumers own behaviour:

- PRD-0001 owns Offering Attribute values and publication consequences;
- PRD-0002 owns Filter behaviour;
- PRD-0004 owns Compare behaviour.

### 10.5 V1 lifecycle boundary

V1 defines no permanent Attribute deletion, merge, replacement, deprecation state, or automated value migration.

## 11. Basic Analytics

### 11.1 Ownership and use

PRD-0006 owns the Admin-facing Basic Analytics product view.

Basic Analytics:

- provides operational visibility;
- supports action guidance;
- does not redefine source results;
- does not perform moderation or management automatically.

### 11.2 Minimum V1 inventory

The Admin Panel provides the following product indicators.

#### Current-state indicators

- User Accounts by `Enabled` and `Suspended`;
- Businesses by `Unrestricted` and `Restricted`;
- Offerings by `Draft`, `Published`, `Hidden`, and `Archived`;
- Offerings by final Offering Public Eligibility `Eligible` and `Ineligible`;
- Affiliate Destinations by `Draft`, `Enabled`, and `Disabled`;
- Affiliate Destinations by `Not Validated`, `Valid`, and `Invalid`;
- Affiliate Destinations by Handoff Eligibility `Eligible` and `Ineligible`;
- General Moderation cases by `Open` and `Closed`, including Open cases by approved target type;
- Affiliate Destination Administration workload by `Needs Validation`, `Business Correction Needed`, and `Ready to Enable`.

#### Core-flow activity indicators

- Discovery Starts, with Domain grouping where PRD-0002 supplies a Domain association;
- Offering Presentation Opens as defined by PRD-0001;
- Compare starts;
- Decision Chat starts;
- Affiliate Handoff Completion count;
- Direct Contact Completion count.

### 11.3 Completion consumption

PRD-0004 is the Single Information Owner of Completion.

Platform consumes:

```text
Affiliate Handoff initiated
→ Affiliate Handoff Completion

approved contact information revealed
AND external contact channel made available
→ Direct Contact Completion
```

Basic Analytics does not interpret Completion as purchase, sale, contract, response, or external transaction success.

### 11.4 Time and grouping

Minimum selectable periods:

```text
Today
Last 7 days
Last 30 days
All time
```

Indicators are shown:

- overall;
- by the derived Domain values `Mobility`, `Real Estate`, and `Technology` where the owning PRD supplies a Domain association.

Domain source rules:

- Offering and Offering-derived activity use the Domain derived from the Offering's active leaf Category;
- Browse Discovery Start uses the selected Category Domain;
- Search Discovery Start without a selected leaf Category has no Domain association and appears only in overall counts;
- Platform does not infer Domain from free-text query wording.

### 11.5 Action handoff

Where an indicator represents actionable workload, the Admin may open the relevant:

- moderation queue;
- Affiliate Destination Administration queue;
- Category Management area;
- Attribute Management area.

Informational core-flow indicators need not open an action.

---

## 12. No Standalone Platform Configuration

V1 has no standalone generic Platform Configuration or Settings deliverable.

Platform-owned operational rules are represented only through explicit approved behaviour in:

- General Moderation;
- Affiliate Destination Administration;
- Category Management;
- Attribute Management;
- Basic Analytics periods and groupings.

No Admin setting may introduce a new capability, role, state, action, metric meaning, or ownership boundary.

---

## 13. Permissions Matrix

Legend:

- `✓` — permitted;
- `✗` — not permitted;
- `Conditional` — permitted only when the target and action conditions are satisfied;
- `Owner only` — reserved to Product Owner / Architecture Owner.

| Action | Guest | User | Business | Ordinary Admin | Product Owner / Architecture Owner |
|---|---:|---:|---:|---:|---:|
| Enter Admin Panel | ✗ | ✗ | ✗ | ✓ | ✓ |
| View Admin action guidance | ✗ | ✗ | ✗ | ✓ | ✓ |
| View Basic Analytics | ✗ | ✗ | ✗ | ✓ | ✓ |
| Request Correction | ✗ | ✗ | ✗ | Conditional | Conditional |
| Hide Offering | ✗ | ✗ | ✗ | Conditional | Conditional |
| Restore Offering | ✗ | ✗ | ✗ | Conditional | Conditional |
| Restrict Business | ✗ | ✗ | ✗ | Conditional | Conditional |
| Restore Business | ✗ | ✗ | ✗ | Conditional | Conditional |
| Suspend non-Admin-authorized User | ✗ | ✗ | ✗ | Conditional | Conditional |
| Reinstate non-Admin-authorized User | ✗ | ✗ | ✗ | Conditional | Conditional |
| Suspend Admin-authorized User | ✗ | ✗ | ✗ | ✗ | Owner only |
| Reinstate Admin-authorized User | ✗ | ✗ | ✗ | ✗ | Owner only |
| Review / Validate / Enable / Disable Affiliate Destination | ✗ | ✗ | ✗ | Conditional | Conditional |
| Manage Categories | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage Attributes | ✗ | ✗ | ✗ | ✓ | ✓ |
| Grant or remove Admin authorization | ✗ | ✗ | ✗ | ✗ | Owner only through controlled operational provisioning |
| Use Messaging moderation | ✗ | ✗ | ✗ | ✗ | ✗ |
| Use generic Platform Settings | ✗ | ✗ | ✗ | ✗ | ✗ |

Admin authorization does not grant automatic Business-management authority.

---

## 14. Product Flows

### 14.1 Admin entry

```text
Authenticated User Account
→ Identity confirms Admin authorization
→ Admin context becomes available
→ Admin Panel
```

### 14.2 General moderation

```text
Existing target
→ surfaced or selected for review
→ moderation case opened
→ Admin reviews
→ approved General Moderation action selected
→ target-owning PRD outcome applied
```

Restricted Offering-content correction:

```text
Open case
→ Request Correction targets exact Published/Hidden Offering content
→ authorized Restricted Business owner edits exact targeted area
→ Universal Publication Minimum remains satisfied
→ case remains Open
→ Admin re-reviews
→ approved action or no-action decision
→ optional case closure
```

### 14.3 Affiliate Destination Administration

```text
Affiliate Destination authored or edited by Business
→ Draft / Not Validated / Ineligible
→ Admin Review
→ Validate
→ Valid or Invalid
→ if Valid, Enable
→ Enabled / Eligible
```

### 14.4 Category Management

```text
Admin creates or edits Category
→ hierarchy rule checked
→ active Category available to Offering / Browse
```

Retirement:

```text
no Draft / Published / Hidden Offering
AND no active child
→ Retire Category
→ Archived historical associations remain renderable
```

### 14.5 Attribute Management

```text
Admin creates or edits Attribute definition
→ assigns applicable Categories
→ sets required / filterable / comparable properties
→ consuming PRDs use the definition by reference
```

### 14.6 Basic Analytics

```text
Admin opens operational overview
→ current-state and activity indicators shown
→ actionable workload identified
→ Admin opens applicable work area
```

---

## 15. Functional Requirements

### Admin access

1. Platform shall provide the Admin Panel only in an authorized Admin context.
2. Admin authorization shall attach to an existing User Account.
3. The Admin Panel shall not grant or remove Admin authorization.
4. Ordinary Admins shall not provision another Admin.
5. Admin context shall not grant automatic Business ownership.

### General Moderation

6. Platform shall provide exactly the seven General Moderation actions defined in §7.2.
7. Opening or reviewing a moderation case shall not change target state.
8. Each action shall apply only the target-owned outcome in §7.2.
9. Platform shall not archive an Offering or restore an Archived Offering.
10. Request Correction shall change no status by itself and shall create no Messaging workflow.
11. Ordinary Admins shall not suspend or reinstate Admin-authorized accounts.
12. Platform shall reject unauthorized targeting of an Admin-authorized account.
13. Suspension shall not automatically restrict a Business or hide an Offering.

### Affiliate Destination Administration

14. Platform shall provide the four actions defined in §8.2.
15. Affiliate Destination Administration shall remain separate from General Moderation.
16. Platform shall consume PRD-0001 status, validation, and eligibility outcomes.
17. Platform shall not invent an Affiliate Destination state or eligibility rule.

### Category Management

18. Platform shall support Category create, rename, hierarchy management, and retirement.
19. Platform shall prevent hierarchy cycles.
20. Platform shall allow Offering assignment only to an active leaf Category.
21. Platform shall permit Category retirement only when no Draft, Published, or Hidden Offering and no active child remains; Archived historical associations shall not block retirement.
22. Platform shall not permanently delete, merge, or automatically replace a Category in V1.

### Attribute Management

23. Platform shall support Attribute create and edit.
24. Platform shall manage applicable Categories.
25. Platform shall manage required-for-publication, filterable, and comparable properties.
26. Platform shall not redefine Offering, Filter, or Compare behaviour.
27. Platform shall not permanently delete, merge, or replace an Attribute in V1.

### Basic Analytics

28. Platform shall provide the minimum indicator inventory in §11.2.
29. Platform shall consume Completion from PRD-0004.
30. Platform shall separate Affiliate Handoff Completion and Direct Contact Completion.
31. Platform shall provide Today, Last 7 days, Last 30 days, and All time periods.
32. Platform shall support overall and applicable domain grouping.
33. Analytics shall not perform actions automatically.

### Configuration boundary

34. Platform shall provide no standalone generic Settings area in V1.
35. No configuration shall introduce unapproved product behaviour.
36. General Moderation Case statuses shall be Open and Closed.
37. Request Correction shall keep the case Open until re-review.
38. Admin may close a case after an approved action or no-action decision without changing target state.
39. Request Correction targets shall be limited to Business Information, Offering content, Affiliate Destination configuration, and Direct Contact information.
40. Affiliate Destination workload categories shall be derived as defined in §8.5.
41. Every root Category shall receive exactly one V1 Domain at creation.
42. Child Categories shall inherit root Domain and reparenting shall remain inside the same Domain.
43. Category retirement shall ignore Archived historical assignments while requiring no Draft, Published, or Hidden assignment and no active child.
44. Attribute value kinds shall be Text, Number, Boolean, Single Select, or Multi Select.
45. Text Attributes shall not be filterable.
46. Attribute changes shall enforce §10.3 mutation safety and never silently delete Offering values.
47. Basic Analytics shall consume Offering Presentation Open from PRD-0001.
48. Basic Analytics shall use only owning-PRD-supplied Domain association and shall not infer Domain from query text.
49. Platform shall expose the bounded correction-edit path only when every §7.3.1 condition is satisfied.
50. Platform shall constrain the path to the exact Offering and targeted content area.
51. Platform shall deny creation, Draft publication, unrelated edit, lifecycle change, moderation change, exposure change, eligibility restoration, automatic case closure, and Messaging through the bounded path.
52. Platform shall require the corrected Offering to preserve the Universal Publication Minimum.
53. Platform shall keep the case Open after the owner edit and require re-review.
54. The bounded path shall not expand the seven-action General Moderation set.

---

## 16. Acceptance Criteria

```gherkin
Scenario: Admin context is reachable through an authorized User Account
  Given an authenticated User Account has Admin authorization
  When the account enters Admin context
  Then the Admin Panel is available
  And ordinary User behaviour remains available outside Admin context

Scenario: Ordinary Admin cannot provision another Admin
  Given an ordinary Admin is in the Admin Panel
  When Admin authorization management is evaluated
  Then grant and removal actions are unavailable

Scenario: Admin does not gain Business ownership
  Given an Admin-authorized account owns no Business
  When it enters Admin context
  Then Platform moderation is available
  And unrelated Business-management authority is not granted

Scenario: Opening a moderation case changes nothing
  Given an existing target is opened in a moderation case
  When the Admin takes no approved action
  Then the target state and eligibility remain unchanged

Scenario: Admin hides an Offering
  Given a Published Offering
  When an authorized Admin applies Hide Offering
  Then PRD-0001 outcome Published to Hidden is applied
  And Platform invents no additional state

Scenario: Admin restricts a Business
  Given an Unrestricted Business
  When an authorized Admin applies Restrict Business
  Then PRD-0005 outcome Unrestricted to Restricted is applied
  And Offering lifecycle states remain unchanged

Scenario: Admin suspends a non-Admin-authorized User
  Given an Enabled User Account without Admin authorization
  When an authorized Admin applies Suspend User
  Then PRD-0003 outcome Enabled to Suspended is applied

Scenario: Ordinary Admin cannot suspend an Admin-authorized account
  Given a User Account carries Admin authorization
  When an ordinary Admin attempts Suspend User
  Then the action is rejected
  And User Account access status and Admin authorization remain unchanged

Scenario: Request Correction creates no Messaging
  Given an Admin requests correction
  When the request is recorded
  Then no lifecycle or eligibility result changes by itself
  And no inbox, thread, or reply workflow is created

Scenario: Affiliate administration is a separate action family
  Given an Affiliate Destination requires review
  When the Admin opens Affiliate Destination Administration
  Then Review, Validate, Enable, and Disable are available subject to target conditions
  And the seven-action General Moderation set remains unchanged

Scenario: Enabling consumes the Offering-owned outcome
  Given an Affiliate Destination is Valid
  When Enable Affiliate Destination is applied
  Then PRD-0001 outcome Enabled and Handoff Eligibility Eligible is applied
  And final Offering Public Eligibility remains unchanged

Scenario: Category retirement is safe
  Given a Category has no Draft, Published, or Hidden Offering
  And has no active child
  When an authorized Admin retires it
  Then it cannot receive new Offering assignments
  And it no longer appears as an active Browse destination
  And Archived historical associations remain renderable

Scenario: Category retirement is blocked while actively in use
  Given a Category has a Draft, Published, or Hidden Offering or an active child
  When retirement availability is evaluated
  Then Retire Category is unavailable

Scenario: Attribute properties are managed centrally
  Given an authorized Admin edits an Attribute definition
  When required-for-publication, filterable, or comparable is changed
  Then the property is available to the applicable consuming PRD
  And Platform does not perform publication, Filter, or Compare behaviour

Scenario: Basic Analytics consumes Completion
  Given PRD-0004 produces Affiliate Handoff Completion and Direct Contact Completion
  When Basic Analytics is presented
  Then the two indicators are shown separately
  And neither is described as purchase or external transaction success

Scenario: Analytics guides but does not act
  Given an indicator represents actionable workload
  When the Admin selects it
  Then the relevant work area may open
  And no moderation or administration action occurs automatically

Scenario: Moderation case closes without changing target state
  Given a General Moderation Case is Open
  And an approved action or no-action decision has been recorded
  When the Admin closes the case
  Then case status becomes Closed
  And no target lifecycle, moderation, access, or eligibility result changes because of closure

Scenario: Request Correction remains Open for re-review
  Given an Admin applies Request Correction to an approved Business-owned target
  When the Business owner edits the information
  Then the case remains Open
  And Platform re-review is required

Scenario: Affiliate workload is derived
  Given an Affiliate Destination is Draft and Valid
  When Platform composes the administration queue
  Then the workload category is Ready to Enable
  And no new Destination state is created

Scenario: Category retires with Archived history
  Given a Category has no Draft, Published, or Hidden Offering
  And has no active child
  And an Archived Offering retains a historical association
  When the Admin retires the Category
  Then retirement is allowed
  And the Archived record remains renderable

Scenario: Cross-Domain reparenting is unavailable
  Given two Category branches belong to different V1 Domains
  When an Admin attempts to move a Category between them
  Then the change is rejected

Scenario: Required Attribute activation is safe
  Given an Attribute is applicable to a Category
  And one Published Offering lacks a value
  When an Admin attempts to set required for publication to true
  Then the change is rejected
  And the Published Offering remains unchanged

Scenario: Platform exposes bounded correction edit only for the exact case
  Given Business Moderation Status is Restricted
  And a General Moderation Case is Open
  And Request Correction targets Offering content
  And the target Offering is Published or Hidden
  And the acting User is the authorized owner
  When Platform evaluates the correction path
  Then the exact Offering and targeted content area are editable
  And no unrelated edit authority is granted

Scenario: Platform preserves restriction and public ineligibility
  Given the Restricted owner saves the correction
  When Platform evaluates the result
  Then Offering lifecycle remains unchanged
  And Business Moderation Status remains Restricted
  And Business Public Exposure Input remains Ineligible
  And public eligibility is not restored

Scenario: Platform requires re-review
  Given a bounded correction edit succeeds
  When the edit is recorded
  Then the General Moderation Case remains Open
  And Admin re-review is required
  And the case does not close automatically
  And no Messaging workflow is created

Scenario: Platform rejects incomplete bounded-path conditions
  Given at least one condition in §7.3.1 is absent
  When the Restricted owner attempts to edit Published or Hidden Offering content
  Then Platform denies the correction edit

Scenario: Generic Platform Settings are absent
  Given an Admin enters the Admin Panel
  When Platform management areas are shown
  Then no generic Settings area can introduce unapproved product behaviour
```

---

## 17. Related PRDs

### PRD-0001 — Offering

Owns:

- Offering lifecycle;
- final Offering Public Eligibility;
- Category and Attribute product concepts;
- Affiliate Destination status, validation meaning, and Handoff Eligibility.

Platform applies those outcomes by reference.

### PRD-0002 — Discovery

Consumes:

- active Categories;
- filterable Attribute definitions;
- final Offering Public Eligibility;
- Discovery activity indicators consumed by Basic Analytics.

### PRD-0003 — Identity

Owns:

- User Account access status;
- Admin authorization attachment;
- Admin-context entry;
- baseline inheritance;
- suspension and reinstatement consequences.

Platform consumes those results.

### PRD-0004 — Decision

Owns:

- Compare;
- Decision Chat;
- Affiliate Handoff;
- Direct Contact;
- Completion.

Platform consumes activity and Completion results without redefining them.

### PRD-0005 — Business

Owns:

- Business Profile;
- Business Information;
- Business Moderation Status;
- Business Public Exposure Input.

Platform applies Restrict and Restore outcomes by reference.

---

## 18. Related ADRs and Owner Decisions

### Accepted ADRs

- `ADR-0006 — Affiliate Destination Ownership`
- `ADR-0007 — Domain Scope of the Capability First Rule`
- `ADR-0008 — Handoff Enablement Capability`

### Frozen Capability Architecture

- `OFFERING_CAPABILITY_ARCHITECTURE.md` Frozen v2.0
  - Handoff Enablement;
  - F06 Affiliate Destination Configuration;
  - F07 Affiliate Destination Eligibility Governance;
  - PRD-0006 supporting relationship boundary.

### Applied Owner Decisions

- D-04 — Direct Contact Model;
- D-05 — Completion Evidence;
- D-06 — Admin Baseline Inheritance;
- D-07 — Admin Provisioning;
- D-15/D-16 — Retirement and Moderation Outcomes;
- D-21 — Affiliate Destination Administration Actions;
- D-22 — Admin-Authorized Account Suspension.

---

## 19. Accepted Deferrals

The following are accepted V1 deferrals and do not block Freeze:

1. **Attention-source implementation**
   - Technical signals that surface or prioritize a moderation case remain outside the PRD.
   - Every surfaced case must use the approved Open/Closed model.

2. **Technical analytics measurement**
   - Event schemas, persistence, deduplication, and queries remain outside the PRD.

3. **Technical Admin provisioning**
   - The controlled mechanism attaching or removing Admin authorization remains outside the PRD.

4. **Future Category migration**
   - Merge, automated replacement, cross-Domain movement, and bulk migration remain outside V1.

5. **Future Attribute lifecycle**
   - Deprecation, replacement, permanent deletion, and automated value migration remain outside V1.

No downstream UX or User Story may broaden these deferrals.

