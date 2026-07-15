# UX-0005 — Business Dashboard

- **UX ID:** UX-0005
- **Title:** Business Dashboard
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** UX behaviour (non-visual, non-technical)

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

The Business Dashboard is where a Business (a User acting in the context of an owned Business) manages its Business Profile and its Offerings, and sees a limited set of dashboard metrics, as defined in `PRD-0005-business.md`.

## 2. Business Value

The Business Dashboard lets Businesses participate as partners: they can manage Offerings simply, switch between multiple Businesses they own, and see a small, relevant set of counts, without advanced analytics.

## 3. Scope

- Business switching (a User may own multiple Businesses).
- Business Profile management.
- Offering management (create, edit, delete, publish owned Offerings).
- Dashboard metrics limited to: Total Offerings, Published Offerings, Draft Offerings, Message count, and Favorites count (if available).
- Draft Offerings are visible.

## 4. Out of Scope

- Advanced analytics.
- Billing, payments, subscription, CRM, marketing, advertising, promotions, reviews (per `PRD-0005-business.md`).
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

> **Terminology note:** The UX brief uses "Favourite"; this document uses "Favorites" to match the approved PRD terminology. No behaviour is changed.

## 5. Entry Points

- A logged-in User who owns a Business opens the Business Dashboard.
- Returning to the Dashboard from Offering management.

## 6. Exit Points

- Opening an Offering for management.
- Switching to another owned Business.
- Leaving the Dashboard for the public platform.

## 7. Screen Overview

The Business Dashboard shows the currently selected Business, a control to switch Businesses, Business Profile management, Offering management (including visible Draft Offerings), and the limited dashboard metrics.

## 8. Screen Behaviour

- The Dashboard reflects the currently selected Business; switching changes the Business in context.
- Business Profile management edits the selected Business's Profile and Information.
- Offering management lists the Business's Offerings, including Drafts, and supports create, edit, delete, and publish (Draft → Published).
- The metrics show Total Offerings, Published Offerings, Draft Offerings, Message count, and Favorites count (if available).

## 9. User Actions

- Switch between owned Businesses.
- Manage the Business Profile and Business Information.
- Create an Offering (begins as Draft).
- Edit an Offering.
- Delete an Offering.
- Publish an Offering (Draft → Published).

## 10. System Responses

- Switching Businesses updates the Dashboard to the selected Business.
- Creating, editing, deleting, or publishing an Offering updates the Offering list and the relevant metrics.
- Publishing moves an Offering from Draft to Published, making it available to Discovery.

## 11. Validation Behaviour (Product level)

- A Business can manage only the Offerings it owns (per `PRD-0005-business.md`).
- TODO — the required Business Information and Offering fields are not defined by approved decisions (`PRD-0005`, `PRD-0001` mark these TODO).

## 12. Empty States

- When the Business has no Offerings, the Offering management area shows an empty state. TODO — the exact empty-state content is not defined by approved decisions.

## 13. Loading States

- While the Business, its Offerings, and metrics are being retrieved, a loading state is shown. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when the Dashboard, Offerings, or metrics fail to load is not defined by approved decisions.

## 15. Permissions

Per `PRD-0003-identity.md` and `PRD-0005-business.md`:

- The Business Dashboard and its actions are available only to a User acting in the context of an owned Business.
- Guests and Users who own no Business cannot access it.
- A Business manages only its own Businesses and Offerings.

## 16. Accessibility Notes

- At the product level, Business switching, Profile management, and Offering management actions must be operable without a mouse and perceivable by assistive technology.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0005-business.md` — Business Profile and Offering management, multiple Businesses, Dashboard.
- `PRD-0001-offering.md` — Offering lifecycle (Draft → Published) and management.
- `PRD-0003-identity.md` — the Business role and permissions.
- `PRD-0004-decision.md` — Message and Favorites counts originate from Decision behaviour.

## 18. Acceptance Criteria

```gherkin
Scenario: Switch between owned Businesses
  Given a User who owns more than one Business
  When they switch Business in the Dashboard
  Then the Dashboard reflects the selected Business

Scenario: Draft Offerings are visible
  Given a Business with Draft Offerings
  When it opens Offering management
  Then Draft Offerings are visible

Scenario: Publish an Offering
  Given a Business with a Draft Offering
  When it publishes the Offering
  Then the Offering moves from Draft to Published and becomes available to Discovery

Scenario: Metrics are limited
  Given a Business Dashboard
  When the metrics are shown
  Then they are limited to Total Offerings, Published Offerings, Draft Offerings, Message count, and Favorites count (if available)

Scenario: A Business manages only its own Offerings
  Given a Business
  When it manages Offerings
  Then it can manage only the Offerings it owns

Scenario: Dashboard is not available to Guests
  Given a Guest or a User who owns no Business
  When they attempt to open the Business Dashboard
  Then it is not available to them
```

## 19. Open Questions (TODO only)

- TODO — Confirm availability of the Favorites count metric. (Section 3)
- TODO — Define the Business Information and Offering fields managed here. (Section 11)
- TODO — Define empty, loading, and error behaviour. (Sections 12–14)
- TODO — Confirm behaviour of Hide/Archive for Offerings, pending the states undefined in `PRD-0001-offering.md`.
