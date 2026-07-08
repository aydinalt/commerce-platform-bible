# UX-0006 — Admin Dashboard

- **UX ID:** UX-0006
- **Title:** Admin Dashboard
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** UX behaviour (non-visual, non-technical)

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

The Admin Dashboard is where the Admin operates the platform: working a moderation queue, and managing Categories, Attributes, and Platform Configuration, as defined in `PRD-0006-platform.md`. Consistent with the Foundation, it guides the Admin to actions rather than only showing reports.

## 2. Business Value

The Admin Dashboard keeps the platform trustworthy without gating participation: moderation happens after content exists, and the administration surface guides the Admin toward what needs attention.

## 3. Scope

- A moderation queue.
- Status filters: Pending, Approved, Rejected.
- Moderation actions: Approve, Reject, Hide, Archive.
- Category management.
- Attribute management.
- Platform configuration, only where already approved.

## 4. Out of Scope

- Analytics implementation, billing, payments, CRM, AI, marketing, recommendation systems, notifications (per `PRD-0006-platform.md`).
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

> **Review Note (moderation states/actions vs PRDs):** `PRD-0006-platform.md` states that moderation happens after content exists but leaves the specific moderation outcomes as TODO, and `PRD-0001-offering.md` marks the Hidden and Archived states and their transitions as TODO. This UX brief introduces the statuses Pending/Approved/Rejected and the actions Approve/Reject/Hide/Archive. These are documented here as the approved UX brief, but they define moderation outcomes and use the Hidden/Archived states that the PRDs left open. A decision-maker should reconcile these into `PRD-0006` and `PRD-0001`. In particular, since Businesses and Offerings are created without prior admin approval, the meaning of a "Pending" status relative to an Offering's visibility is undefined. No decision has been made here.

## 5. Entry Points

- An Admin opens the Admin Dashboard.

## 6. Exit Points

- Opening a queued item for moderation.
- Moving between the moderation queue, Category management, Attribute management, and Platform configuration.

## 7. Screen Overview

The Admin Dashboard presents a moderation queue with status filters (Pending, Approved, Rejected), moderation actions (Approve, Reject, Hide, Archive), and areas for Category management, Attribute management, and approved Platform configuration.

## 8. Screen Behaviour

- The moderation queue lists items that need attention and guides the Admin to act (actionable guidance, not only reports).
- Status filters narrow the queue to Pending, Approved, or Rejected items.
- Moderation actions (Approve, Reject, Hide, Archive) are applied to queued items after they exist.
- Category management manages the Categories that organize Offerings.
- Attribute management manages the Attributes that describe Offerings and power discovery, filtering, and comparison.
- Platform configuration is available only where already approved.

## 9. User Actions

- Filter the moderation queue by status (Pending / Approved / Rejected).
- Approve, Reject, Hide, or Archive a queued item.
- Manage Categories.
- Manage Attributes.
- Adjust approved Platform configuration.

## 10. System Responses

- Applying a moderation action updates the item's moderation status. TODO — the resulting effect on the item's visibility/state is not defined by approved decisions (see Review Note).
- Category and Attribute changes affect how Offerings are organized and described.

## 11. Validation Behaviour (Product level)

- Only the Admin role can perform these actions (per `PRD-0006-platform.md`).
- TODO — the specific rules governing moderation actions, Category/Attribute management, and Platform configuration are not defined by approved decisions.

## 12. Empty States

- When the moderation queue has no items for the selected status, an empty state is shown. TODO — the exact empty-state content is not defined by approved decisions.

## 13. Loading States

- While the queue, Categories, or Attributes are being retrieved, a loading state is shown. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when a moderation action, or Category/Attribute change, fails is not defined by approved decisions.

## 15. Permissions

- The Admin Dashboard and all its actions are available only to the Admin role (per `PRD-0006-platform.md`).
- Guests, Users, and Businesses have no access.
- TODO — how an Admin is provisioned is undefined (`PRD-0006` Open Questions).

## 16. Accessibility Notes

- At the product level, the moderation queue, status filters, moderation actions, and Category/Attribute/Configuration management must be operable without a mouse and perceivable by assistive technology.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0006-platform.md` — Administration, Moderation, Category/Attribute management, Platform configuration, roles.
- `PRD-0001-offering.md` — the Offering states referenced by Hide/Archive (currently TODO there).
- `PRD-0005-business.md` — Businesses and Offerings subject to moderation.
- `PRD-0003-identity.md` — the Admin role.

## 18. Acceptance Criteria

```gherkin
Scenario: Moderation happens after content exists
  Given a Business or Offering created without prior approval
  When it appears in the moderation queue
  Then the Admin can moderate it after it exists

Scenario: Filter the moderation queue by status
  Given the moderation queue
  When the Admin filters by Pending, Approved, or Rejected
  Then the queue shows only items with the selected status

Scenario: Apply a moderation action
  Given a queued item
  When the Admin applies Approve, Reject, Hide, or Archive
  Then the item's moderation status is updated

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

- TODO — Reconcile moderation statuses (Pending/Approved/Rejected) and actions (Approve/Reject/Hide/Archive) into `PRD-0006` and `PRD-0001`, including their effect on visibility/state. (Section 4)
- TODO — Define the meaning of "Pending" given that creation is not gated by admin approval. (Section 4)
- TODO — Define which Platform configuration is approved for V1. (Section 3)
- TODO — Define how an Admin is provisioned. (Section 15)
- TODO — Define empty, loading, and error behaviour. (Sections 12–14)
