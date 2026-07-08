# PRD-0006 — Platform

- **PRD ID:** PRD-0006
- **Title:** Platform
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** Product behaviour (non-technical)

> This document describes product behaviour only. It does not describe APIs, databases, infrastructure, frameworks, admin implementation, security implementation, logging, or monitoring.

---

## 1. Purpose

Define the Platform capability of the platform. Platform governs administration and moderation. It covers what the Admin role does, how moderation works after content exists, how Categories and Attributes are managed, how the platform is configured, and which roles the platform recognizes.

Platform builds on the roles defined in `PRD-0003-identity.md` and the Category and Attribute concepts defined in `PRD-0001-offering.md`.

## 2. Business Value

Platform lets the platform operate and stay trustworthy without slowing down participation. Consistent with the Foundation, moderation happens after content exists rather than as a gate, so Businesses can participate immediately as partners; the administration surface guides actions rather than only showing reports; and managing Categories and Attributes (rather than hardcoded category logic) lets the platform stay simple while scaling across many industries.

## 3. Scope

Platform includes only:

- Administration
- Moderation
- Category Management
- Attribute Management
- Platform Configuration
- Platform Roles

All of the above are performed by the Admin role and operate on the platform's shared concepts (Businesses, Offerings, Categories, Attributes) defined in other PRDs.

## 4. Out of Scope

Platform does not include:

- Billing
- Payments
- CRM
- AI
- Marketing
- Analytics implementation
- Recommendation systems
- Notifications
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

Platform also does not describe any technical implementation.

> **Review Note (basic analytics):** `V1_SCOPE.md` includes "Basic analytics" as a V1 item, while this Platform capability excludes analytics implementation. This document therefore does not define analytics behaviour. TODO — confirm which capability/PRD owns "Basic analytics" and how it is surfaced to Admin, since prior PRDs deferred dashboard analytics content to Platform. No decision has been made here.

## 5. Core Concepts

These concepts use Foundation terminology and are referenced, not redefined.

- **Platform** — the capability that governs administration and moderation across the platform.
- **Admin** — the operator role responsible for moderation and platform operation. Per the Foundation, Admin provides actionable guidance rather than only reports, and moderation happens after content exists.
- **Moderation** — reviewing and acting on Businesses, Offerings, and their content after they exist. No prior approval gates creation.
- **Category** — metadata that organizes Offerings (see `PRD-0001-offering.md`). Platform manages Categories.
- **Attributes** — describe Offerings and power discovery, filtering, and comparison (see `PRD-0001-offering.md`). Platform manages Attributes.

## 6. Business Rules

Only approved behaviour is included.

1. Admin moderation happens afterwards; Businesses and Offerings are created without prior admin approval.
2. The administration surface guides actions, not only shows reports (per `V1_SCOPE.md`).
3. Categories are metadata that organize Offerings.
4. Attributes describe Offerings and power discovery, filtering, and comparison.
5. Many product categories are supported through Attributes rather than hardcoded category logic (per `V1_SCOPE.md`).
6. The platform recognizes the roles defined in `PRD-0003-identity.md`: Guest, User, Business, and Admin.

## 7. User Behaviour

Permissions are referenced from approved decisions (`V1_SCOPE.md`, `PRD-0003-identity.md`, `PRD-0001-offering.md`); none are invented.

- **Guest** — has no platform-administration abilities.
- **User** — has no platform-administration abilities.
- **Business** — a User acting in an owned-Business context has no platform-administration abilities; a Business is not an Admin.
- **Admin** — moderates Businesses, Offerings, and their content after they exist; manages Categories; manages Attributes; manages Platform Configuration; and operates through actionable guidance rather than only reports. TODO — how an Admin is provisioned, and whether an Admin can grant the Admin role to others, are not defined by approved decisions.

## 8. Permissions Matrix

Legend: ✓ = allowed, ✗ = not allowed, TODO = not defined by approved decisions.

| Action | Guest | User | Business | Admin |
|---|---|---|---|---|
| Moderate Businesses / Offerings / content | ✗ | ✗ | ✗ | ✓ |
| Manage Categories | ✗ | ✗ | ✗ | ✓ |
| Manage Attributes | ✗ | ✗ | ✗ | ✓ |
| Manage Platform Configuration | ✗ | ✗ | ✗ | ✓ |
| Provision Admin / manage Platform Roles | ✗ | ✗ | ✗ | TODO |

Notes:

- Only the **Admin** role has platform-administration abilities; Guest, User, and Business have none.
- Moderation, Category Management, Attribute Management, and Platform Configuration are Admin abilities.
- "Provision Admin / manage Platform Roles" is **TODO** because the mechanism by which an Admin comes to exist, and whether Admins can assign the role, are undefined in the approved decisions.

## 9. State Transitions

Only sequencing supported by approved decisions is shown.

### 9.1 Creation-then-moderation

```
Business / Offering / content created   (no prior admin approval)
  ▼
Admin moderation   (happens afterwards)
  ▼
Moderation outcome   (TODO)
```

- **Created → Admin moderation** — supported by the approved decisions that creation requires no prior approval and that moderation happens afterwards.
- TODO — the specific moderation outcomes (for example the resulting states or actions of moderation) are not defined by approved decisions.

### 9.2 Category and Attribute management (referenced)

- Categories and Attributes are managed by Admin and are then available to organize and describe Offerings (see `PRD-0001-offering.md`).
- TODO — any formal lifecycle/states for Categories and Attributes are not defined by approved decisions.

## 10. User Flows

Product flows using only approved, in-scope behaviour.

### 10.1 Admin Moderation

1. A Business, Offering, or its content exists, having been created without prior approval.
2. The administration surface guides the Admin to what needs attention (actionable guidance rather than only reports).
3. The Admin reviews the item and takes a moderation action afterwards.
4. TODO — the specific moderation actions and their outcomes are not defined by approved decisions.

### 10.2 Category Management

1. The Admin manages the Categories that organize Offerings.
2. TODO — the specific Category Management actions (for example creating, editing, or organizing Categories) are not defined by approved decisions.

### 10.3 Attribute Management

1. The Admin manages the Attributes that describe Offerings and power discovery, filtering, and comparison.
2. Many product categories are supported through Attributes rather than hardcoded category logic.
3. TODO — the specific Attribute Management actions (for example defining or editing Attributes) are not defined by approved decisions.

### 10.4 Platform Configuration

1. The Admin manages platform-wide configuration.
2. TODO — the specific Platform Configuration settings are not defined by approved decisions.

## 11. Functional Requirements

Product behaviour only.

1. Businesses and Offerings are created without prior admin approval.
2. Admin can moderate Businesses, Offerings, and their content after they exist.
3. The administration surface guides actions, not only shows reports.
4. Admin can manage the Categories that organize Offerings.
5. Admin can manage the Attributes that describe Offerings and power discovery, filtering, and comparison.
6. Many product categories are supported through Attributes rather than hardcoded category logic.
7. Admin can manage Platform Configuration.
8. The platform recognizes the roles defined in `PRD-0003-identity.md`: Guest, User, Business, and Admin.
9. Only the Admin role has platform-administration abilities.
10. The specific moderation actions/outcomes, Category and Attribute management actions, Platform Configuration settings, and Admin provisioning are TODO (see Sections 7–10).

## 12. Non-functional Requirements

Stated as qualitative expectations derived only from Foundation principles. These are not technical metrics.

- **Actionable administration.** The administration surface guides actions rather than only displaying reports.
- **Trust over growth.** Moderation happens after content exists, preserving immediate participation while keeping the platform trustworthy.
- **Businesses are partners.** Creation is not gated by admin approval; partners participate immediately.
- **Simplicity and scale across industries.** Managing Attributes rather than hardcoded category logic keeps the model simple and lets it scale across many domains.
- **Respects the user's time.** Governance operates without slowing people down.

## 13. Acceptance Criteria

Written in Gherkin (Given / When / Then).

```gherkin
Scenario: Creation is not gated by admin approval
  Given a person creates a Business or an Offering
  When it is created
  Then no prior admin approval is required

Scenario: Admin moderates after content exists
  Given a Business, Offering, or its content already exists
  When an Admin performs moderation
  Then moderation is applied afterwards rather than as a pre-creation approval

Scenario: The administration surface guides actions
  Given an Admin is operating the platform
  When they use the administration surface
  Then it guides them to actions rather than only showing reports

Scenario: Only Admin has administration abilities
  Given a person who is a Guest, User, or Business
  When they attempt a platform-administration action
  Then the action is not available to them

Scenario: Attributes rather than hardcoded categories support many categories
  Given the platform supports many product categories
  When categories are supported
  Then they are supported through Attributes rather than hardcoded category logic

Scenario: Admin manages Categories and Attributes
  Given an Admin operating the platform
  When they manage Categories and Attributes
  Then those Categories organize Offerings and those Attributes describe Offerings and power discovery, filtering, and comparison
```

TODO — Additional acceptance criteria for specific moderation outcomes, Category/Attribute management actions, Platform Configuration settings, and Admin provisioning depend on the items marked TODO in Sections 7–10.

## 14. Related PRDs

- **PRD-0001 — Offering** — defines the Offering, and the Categories and Attributes that Platform manages.
- **PRD-0002 — Discovery** — uses the Categories and Attributes that Platform manages.
- **PRD-0003 — Identity** — defines the roles (Guest, User, Business, Admin) that Platform recognizes.
- **PRD-0004 — Decision** — produces content (for example messages) that may be subject to moderation.
- **PRD-0005 — Business** — produces Businesses and Offerings that are moderated after they exist.

## 15. Related ADRs

TODO — No Architecture Decision Records are referenced yet.

## 16. Open Questions

- TODO — Define how an Admin is provisioned, and whether an Admin can grant the Admin role to others. (Sections 7, 8)
- TODO — Define the specific moderation actions and their outcomes. (Sections 9, 10.1)
- TODO — Define the specific Category Management actions. (Section 10.2)
- TODO — Define the specific Attribute Management actions. (Section 10.3)
- TODO — Define the specific Platform Configuration settings. (Section 10.4)
- TODO — Confirm which capability/PRD owns "Basic analytics" and how it is surfaced to Admin. (Section 4)
