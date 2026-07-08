# PRD-0005 — Business

- **PRD ID:** PRD-0005
- **Title:** Business
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** Product behaviour (non-technical)

> This document describes product behaviour only. It does not describe APIs, databases, frameworks, backend, frontend, validation, security, or storage.

---

## 1. Purpose

Define the Business capability of the platform. Businesses publish and manage Offerings through Business Profiles. This document covers how a Business is created and managed, how a single User can own multiple Businesses, the Business Dashboard, Offering management, Business Information, and Business Visibility.

A Business is a profile managed by a User account (see `PRD-0003-identity.md`) and publishes Offerings (see `PRD-0001-offering.md`).

## 2. Business Value

Businesses are partners on the platform. The Business capability lets them participate immediately and publish their Offerings so people can discover, compare, and decide. Consistent with the Foundation, Businesses can be created without heavyweight onboarding, keeping participation simple and treating Businesses as partners rather than gatekept customers.

## 3. Scope

Business includes only:

- Business Profile
- Multiple Businesses per User
- Business Dashboard
- Offering Management
- Business Information
- Business Visibility

All of the above are managed by a User account and follow the roles and rules in `PRD-0003-identity.md` and `PRD-0001-offering.md`.

## 4. Out of Scope

Business does not include:

- Subscription
- Billing
- Payments
- Analytics implementation
- CRM
- Marketing
- Advertising
- Reviews
- Promotions
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

Business also does not describe any technical implementation.

> **Review Note (dashboard analytics):** `V1_SCOPE.md` includes "Basic analytics" in V1, while this capability excludes analytics implementation. The Business Dashboard is treated here only as a management surface; any analytics content it may show is not defined in this document. TODO — confirm which PRD owns analytics content surfaced in the Business Dashboard (possibly PRD-0006 Platform).

## 5. Core Concepts

These concepts use Foundation terminology and are referenced, not redefined.

- **Business** — a profile managed by a User account; not a separate account (per `PRD-0003-identity.md`). A Business publishes and manages Offerings. One User may own multiple Businesses.
- **User** — the account that owns and operates a Business. A User acting in the context of an owned Business is the Business role.
- **Offering** — the universal object a Business publishes (see `PRD-0001-offering.md`). Every Offering belongs to exactly one Business; a Business may own multiple Offerings.
- **Dashboard** — the surface where a Business manages its profile and its Offerings. TODO — the specific contents of the Dashboard beyond management of the profile and Offerings are not defined by approved decisions.

## 6. Business Rules

Only approved behaviour is included.

1. A Business is a profile managed by a User account, not a separate account.
2. One User may own multiple Businesses.
3. Businesses can be created immediately, with no admin approval required beforehand.
4. Admin moderation happens afterwards.
5. Businesses publish Offerings.
6. Every Offering belongs to exactly one Business.
7. A Business may own multiple Offerings.
8. A Business manages the Offerings it owns (create, edit, delete, publish), per `PRD-0001-offering.md`.
9. A Business's Offerings become discoverable when Published (per `PRD-0001-offering.md`).

## 7. User Behaviour

Permissions are referenced from approved decisions (`V1_SCOPE.md`, `PRD-0003-identity.md`, `PRD-0001-offering.md`); none are invented.

- **Guest** — may view Offerings and the Business information surfaced on them, but cannot see Business phone numbers, and cannot create or manage any Business. TODO — whether a Guest can view a dedicated Business profile page is not defined by approved decisions.
- **User** — may create a Business immediately. A plain User who owns no Business cannot manage a Business. By creating or owning a Business, the User acts in the Business role for that Business.
- **Business** — a User acting in the context of an owned Business may manage that Business's profile and Business Information, view that Business's Dashboard, and manage that Business's Offerings (create, edit, delete, publish). A Business can only manage the Businesses and Offerings it owns.
- **Admin** — moderates Businesses and their Offerings after they exist (moderation happens afterwards). Admin's abilities beyond moderation are owned by PRD-0006 Platform, not by Business.

## 8. Permissions Matrix

Legend: ✓ = allowed, ✗ = not allowed, TODO = owned by PRD-0006 Platform (not defined in the approved decisions for this document).

| Action | Guest | User | Business | Admin |
|---|---|---|---|---|
| View Offering (public) | ✓ | ✓ | ✓ | TODO |
| View Business phone number | ✗ | ✓ | ✓ | TODO |
| Create a Business | ✗ | ✓ | ✓ | TODO |
| Manage owned Business profile / Business Information | ✗ | ✗ | ✓ | TODO |
| View own Dashboard | ✗ | ✗ | ✓ | TODO |
| Create Offering (owned Business) | ✗ | ✗ | ✓ | TODO |
| Edit Offering (owned Business) | ✗ | ✗ | ✓ | TODO |
| Delete Offering (owned Business) | ✗ | ✗ | ✓ | TODO |
| Publish Offering (owned Business) | ✗ | ✗ | ✓ | TODO |
| Moderate Businesses / Offerings | ✗ | ✗ | ✗ | ✓ |

Notes:

- The **Business** column represents a User acting in the context of an owned Business profile; it inherits all User permissions and adds management of the owned Business and its Offerings. This is consistent with `PRD-0003-identity.md` and `PRD-0001-offering.md`.
- Management and Offering actions are ✓ only for the **owned** Business context; they are ✗ for a plain User and for a Guest, and they never apply to Businesses the User does not own.
- "View Business phone number" matches the corresponding row in `PRD-0003-identity.md`.
- Every **Admin** cell marked TODO is owned by PRD-0006 Platform. Admin moderation of Businesses and Offerings is ✓.

## 9. State Transitions

Only transitions supported by approved decisions are shown.

```
User with no Business
  │  Create Business (immediate, no admin approval required)
  ▼
Active Business  ── the User may repeat to own multiple Businesses
```

- **User with no Business → Active Business** — supported by the approved decisions that Businesses can be created immediately, with no admin approval beforehand. The Business is usable right away.
- **Active Business → Active Business (multiple)** — supported by "one User may own multiple Businesses." Each additional Business is created the same way and owned through the same User account.

TODO — Any further Business states (for example states resulting from moderation, Business Visibility changes, or archival) are not defined by approved decisions and must be specified by a decision-maker. Offering states are defined separately in `PRD-0001-offering.md`.

## 10. User Flows

Complete product flows using only approved, in-scope behaviour.

### 10.1 Business Creation

1. A Registered User chooses to create a Business.
2. The Business is created immediately; no admin approval is required beforehand.
3. The Business becomes active and usable right away, and the User is now acting as a Business for it.
4. Admin moderation may occur afterwards.
5. The User may repeat this to own multiple Businesses, all through the same User account.

### 10.2 Business Management

1. A Business opens its Dashboard.
2. The Business manages its profile and Business Information.
3. TODO — the specific Business Information fields, and the specific behaviour of Business Visibility, are not defined by approved decisions.
4. Changes apply to the owned Business only.

### 10.3 Offering Management

1. From its Dashboard, a Business creates an Offering, which begins as a Draft (per `PRD-0001-offering.md`).
2. The Business edits the Offering.
3. The Business publishes the Offering, moving it from Draft to Published; it then becomes discoverable.
4. The Business may delete an Offering it owns.
5. TODO — flows involving the Hidden or Archived Offering states depend on the transitions marked TODO in `PRD-0001-offering.md`.

## 11. Functional Requirements

Product behaviour only.

1. A User can create a Business immediately, without prior admin approval, and the Business is usable immediately.
2. A User can own multiple Businesses, all operated through the same single User account.
3. A Business is never a separate account; every Business action is performed through the owning User account.
4. A Business can manage its own profile and Business Information from its Dashboard.
5. A Business can view its own Dashboard.
6. A Business can create, edit, delete, and publish the Offerings it owns.
7. Every Offering a Business publishes belongs to exactly one Business.
8. A Business's Offerings become discoverable when Published.
9. A Business can only manage the Businesses and Offerings it owns.
10. Admin can moderate Businesses and their Offerings after they exist.

## 12. Non-functional Requirements

Stated as qualitative expectations derived only from Foundation principles. These are not technical metrics.

- **Businesses are partners.** Businesses participate immediately, without heavyweight onboarding or pre-approval.
- **Simplicity over complexity.** A single User account carries all of a person's Businesses rather than fragmenting into multiple logins.
- **Respects the user's time.** Creating and managing a Business is immediate and low-friction.
- **Trust over growth.** Moderation happens afterwards to protect trust, rather than gating participation beforehand.

## 13. Acceptance Criteria

Written in Gherkin (Given / When / Then).

```gherkin
Scenario: A User creates a Business without approval
  Given a Registered User
  When they create a Business
  Then the Business is created immediately with no admin approval step and is usable right away

Scenario: One User owns multiple Businesses
  Given a User who already owns a Business
  When they create additional Businesses
  Then all Businesses are owned and operated through the same single User account

Scenario: A Business is not a separate account
  Given a Business on the platform
  When any Business action is performed
  Then it is performed through the owning User account and never through a separate Business login

Scenario: A Business manages its own Offerings
  Given a Business viewing its Dashboard
  When it creates, edits, publishes, or deletes an Offering it owns
  Then the action applies to that owned Offering

Scenario: A published Offering becomes discoverable
  Given a Business that publishes an Offering
  When the Offering becomes Published
  Then the Offering becomes discoverable

Scenario: A Business cannot manage what it does not own
  Given a Business
  When it attempts to manage a Business or Offering it does not own
  Then the action does not apply

Scenario: Admin moderates a Business after it exists
  Given a Business and its Offerings already exist
  When an Admin performs moderation
  Then moderation is applied after creation rather than as a pre-creation approval
```

TODO — Additional acceptance criteria for Business Information fields, Business Visibility, and Dashboard contents depend on the items marked TODO in Sections 5, 7, 9, and 10.

## 14. Related PRDs

- **PRD-0001 — Offering** — defines the Offering that a Business publishes and manages.
- **PRD-0002 — Discovery** — defines how a Business's Published Offerings are discovered.
- **PRD-0003 — Identity** — defines the roles and that a Business is a profile managed by a User account.
- **PRD-0004 — Decision** — defines how people Contact and message a Business about its Offerings.
- **PRD-0006 — Platform** — owns Admin abilities beyond moderation and, pending confirmation, Dashboard analytics content.

## 15. Related ADRs

TODO — No Architecture Decision Records are referenced yet.

## 16. Open Questions

- TODO — Define the Business Information fields a Business can manage. (Sections 5, 10.2)
- TODO — Define Business Visibility behaviour, and whether a Business has visibility states. (Sections 3, 9, 10.2)
- TODO — Define the contents of the Business Dashboard beyond profile and Offering management. (Section 5)
- TODO — Confirm which PRD owns analytics content surfaced in the Business Dashboard. (Section 4)
- TODO — Define whether a Guest can view a dedicated Business profile page. (Section 7)
- TODO — Define any further Business states resulting from moderation, visibility, or archival. (Section 9)
