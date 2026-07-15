# UX-0006 — Admin Dashboard

- **UX ID:** UX-0006
- **Title:** Admin Dashboard
- **Status:** Draft
- **Version:** 0.2
- **Scope level:** UX behaviour (non-visual, non-technical)

**Revision Note (0.2):** Controlled revision applying Product Owner decisions. The moderation status concepts Pending / Approved / Rejected are replaced with the approved Product Owner baseline — Active, Hidden, Archived. Where moderation actions, transitions, or effects depend on `PRD-0001` (Hidden/Archived states/transitions currently TODO) or `PRD-0006` (moderation outcomes currently TODO), explicit TODOs are preserved instead of defining UX behaviour.

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

The Admin Dashboard is where the Admin operates the platform: working a moderation queue, and managing Categories, Attributes, and Platform Configuration, as defined in `PRD-0006-platform.md`. Consistent with the Foundation, it guides the Admin to actions rather than only showing reports.

## 2. Business Value

The Admin Dashboard keeps the platform trustworthy without gating participation: moderation happens after content exists, and the administration surface guides the Admin toward what needs attention.

## 3. Scope

- A moderation queue.
- Moderation states (Product Owner baseline): Active, Hidden, Archived.
- Category management.
- Attribute management.
- Platform configuration, only where already approved.

TODO — the moderation actions that move an item between Active, Hidden, and Archived, and their effects, depend on the Offering states and transitions owned by `PRD-0001-offering.md` (Hidden and Archived currently TODO) and the moderation outcomes owned by `PRD-0006-platform.md` (currently TODO). They are not defined here.

## 4. Out of Scope

- Analytics implementation, billing, payments, CRM, AI, marketing, recommendation systems, notifications (per `PRD-0006-platform.md`).
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

> **Review Note (moderation states vs PRDs):** The moderation states used here — Active, Hidden, Archived — are the approved Product Owner baseline. Their mapping to the Offering lifecycle states owned by `PRD-0001-offering.md` (which defines Draft and Published and leaves Hidden and Archived and their transitions as TODO) and to the moderation outcomes owned by `PRD-0006-platform.md` (currently TODO) is not defined here and is preserved as a TODO. This UX does not define moderation transitions or their effects where the owning PRDs leave them undecided, and it does not redefine Offering states owned by `PRD-0001`.

## 5. Entry Points

- An Admin opens the Admin Dashboard.

## 6. Exit Points

- Opening a queued item for moderation.
- Moving between the moderation queue, Category management, Attribute management, and Platform configuration.

## 7. Screen Overview

The Admin Dashboard presents a moderation queue filterable by moderation state (Active, Hidden, Archived), and areas for Category management, Attribute management, and approved Platform configuration. TODO — the moderation actions and their transitions depend on `PRD-0001` and `PRD-0006` (currently TODO) and are not presented here.

## 8. Screen Behaviour

- The moderation queue lists items that need attention and guides the Admin to act (actionable guidance, not only reports).
- Filters narrow the queue by moderation state (Active, Hidden, Archived).
- Category management manages the Categories that organize Offerings.
- Attribute management manages the Attributes that describe Offerings and power discovery, filtering, and comparison.
- Platform configuration is available only where already approved.
- TODO — the actions that change an item's moderation state, and their transitions and effects, depend on `PRD-0001` and `PRD-0006` (currently TODO); they are not defined here.

## 9. User Actions

- Filter the moderation queue by moderation state (Active / Hidden / Archived).
- Manage Categories.
- Manage Attributes.
- Adjust approved Platform configuration.
- TODO — set an item's moderation state; the available actions and their transitions are not defined here (depend on `PRD-0001` and `PRD-0006`).

## 10. System Responses

- Filtering narrows the queue to items in the selected moderation state.
- Category and Attribute changes affect how Offerings are organized and described.
- TODO — the effect of a moderation action on an item's state or visibility is not defined here (depends on `PRD-0001` and `PRD-0006`).

## 11. Validation Behaviour (Product level)

- Only the Admin role can perform these actions (per `PRD-0006-platform.md`).
- TODO — the specific rules governing moderation actions, Category/Attribute management, and Platform configuration are not defined by approved decisions.

## 12. Empty States

- When the moderation queue has no items for the selected moderation state, an empty state is shown. TODO — the exact empty-state content is not defined by approved decisions.

## 13. Loading States

- While the queue, Categories, or Attributes are being retrieved, a loading state is shown. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when a moderation action, or Category/Attribute change, fails is not defined by approved decisions.

## 15. Permissions

- The Admin Dashboard and all its actions are available only to the Admin role (per `PRD-0006-platform.md`).
- Guests, Users, and Businesses have no access.
- TODO — how an Admin is provisioned is undefined (`PRD-0006` Open Questions).

## 16. Accessibility Notes

- At the product level, the moderation queue, moderation-state filters, and Category/Attribute/Configuration management must be operable without a mouse and perceivable by assistive technology.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0006-platform.md` — Administration, Moderation, Category/Attribute management, Platform configuration, roles.
- `PRD-0001-offering.md` — the Offering states referenced by Hidden and Archived (currently TODO there).
- `PRD-0005-business.md` — Businesses and Offerings subject to moderation.
- `PRD-0003-identity.md` — the Admin role.

## 18. Acceptance Criteria

```gherkin
Scenario: Moderation happens after content exists
  Given a Business or Offering created without prior approval
  When it appears in the moderation queue
  Then the Admin can moderate it after it exists

Scenario: Filter the moderation queue by moderation state
  Given the moderation queue
  When the Admin filters by Active, Hidden, or Archived
  Then the queue shows only items in the selected moderation state

Scenario: Manage Categories and Attributes
  Given an Admin
  When they manage Categories and Attributes
  Then those Categories organize Offerings and those Attributes describe Offerings and power discovery, filtering, and comparison

Scenario: Only Admin can access the Admin Dashboard
  Given a Guest, User, or Business
  When they attempt to open the Admin Dashboard
  Then it is not available to them

Scenario: Administration guides actions
  Given an Admin using the Admin Dashboard
  When they view the moderation queue
  Then it guides them to actions rather than only showing reports
```

## 19. Open Questions (TODO only)

- TODO — Define the moderation actions and the transitions between Active, Hidden, and Archived, and their effects, per `PRD-0001` (Hidden/Archived states and transitions) and `PRD-0006` (moderation outcomes). (Sections 3, 8–10)
- TODO — Define which Platform configuration is approved for V1. (Section 3)
- TODO — Define how an Admin is provisioned. (Section 15)
- TODO — Define empty, loading, and error behaviour. (Sections 12–14)
