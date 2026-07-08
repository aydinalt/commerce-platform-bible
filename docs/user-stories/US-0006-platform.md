# US-0006 — Platform User Stories

- **Status:** Draft
- **Version:** 0.1

## 1. Purpose

User stories for the Platform capability, derived only from `PRD-0006-platform.md` and the related UX specification. Platform covers administration, moderation, Category and Attribute management, Platform configuration, and roles.

## 2. Related PRDs

- `PRD-0006-platform.md`

## 3. Related UX Specifications

- `UX-0006-admin-dashboard.md`

## 4. User Stories

### US-0006.1 — Moderate content after it exists

**As an** Admin
**I want** to moderate Businesses, Offerings, and their content after they exist
**So that** the platform stays trustworthy without gating participation.

**Acceptance Criteria**
```gherkin
Scenario: Moderation happens afterwards
  Given a Business or Offering created without prior approval
  When it appears for moderation
  Then the Admin can moderate it after it exists rather than as a pre-creation approval
```

- **Priority:** Critical
- **Dependencies:** US-0005 (Businesses/Offerings exist)
- **Related PRDs:** `PRD-0006-platform.md`
- **Related UX:** `UX-0006-admin-dashboard.md`
- **Business Rules:** Moderation happens afterwards; creation is not gated by admin approval.
- **Out of Scope:** Specific moderation outcomes/actions and their effect on visibility/state (TODO in `PRD-0006` and `PRD-0001`).

### US-0006.2 — Operate through actionable guidance

**As an** Admin
**I want** the administration surface to guide me to actions
**So that** I can act rather than only read reports.

**Acceptance Criteria**
```gherkin
Scenario: Administration guides actions
  Given an Admin using the administration surface
  When they view what needs attention
  Then it guides them to actions rather than only showing reports
```

- **Priority:** Medium
- **Dependencies:** US-0006.1
- **Related PRDs:** `PRD-0006-platform.md`
- **Related UX:** `UX-0006-admin-dashboard.md`
- **Business Rules:** The administration surface guides actions, not only reports.
- **Out of Scope:** —

### US-0006.3 — Manage Categories

**As an** Admin
**I want** to manage the Categories that organize Offerings
**So that** Offerings stay well organized.

**Acceptance Criteria**
```gherkin
Scenario: Manage Categories
  Given an Admin
  When they manage Categories
  Then those Categories organize Offerings
```

- **Priority:** High
- **Dependencies:** —
- **Related PRDs:** `PRD-0006-platform.md`, `PRD-0001-offering.md`
- **Related UX:** `UX-0006-admin-dashboard.md`
- **Business Rules:** Categories are metadata that organize Offerings.
- **Out of Scope:** Specific Category management actions (TODO in `PRD-0006`).

### US-0006.4 — Manage Attributes

**As an** Admin
**I want** to manage the Attributes that describe Offerings
**So that** discovery, filtering, and comparison work across many categories.

**Acceptance Criteria**
```gherkin
Scenario: Manage Attributes
  Given an Admin
  When they manage Attributes
  Then those Attributes describe Offerings and power discovery, filtering, and comparison
```

- **Priority:** High
- **Dependencies:** —
- **Related PRDs:** `PRD-0006-platform.md`, `PRD-0001-offering.md`
- **Related UX:** `UX-0006-admin-dashboard.md`
- **Business Rules:** Many categories are supported through Attributes rather than hardcoded category logic.
- **Out of Scope:** Specific Attribute management actions (TODO in `PRD-0006`).

### US-0006.5 — Manage approved Platform configuration

**As an** Admin
**I want** to manage the Platform configuration that is already approved
**So that** I can operate the platform within approved bounds.

**Acceptance Criteria**
```gherkin
Scenario: Manage approved configuration
  Given an Admin
  When they adjust Platform configuration
  Then only already-approved configuration is available
```

- **Priority:** Medium
- **Dependencies:** —
- **Related PRDs:** `PRD-0006-platform.md`
- **Related UX:** `UX-0006-admin-dashboard.md`
- **Business Rules:** Platform configuration is available only where already approved.
- **Out of Scope:** Which configuration is approved for V1 (TODO in `PRD-0006`).

### US-0006.6 — Restrict administration to Admin

**As a** platform operator
**I want** only the Admin role to have administration abilities
**So that** Guests, Users, and Businesses cannot administer the platform.

**Acceptance Criteria**
```gherkin
Scenario: Only Admin can administer
  Given a Guest, User, or Business
  When they attempt a platform-administration action
  Then it is not available to them
```

- **Priority:** High
- **Dependencies:** US-0003 (roles)
- **Related PRDs:** `PRD-0006-platform.md`, `PRD-0003-identity.md`
- **Related UX:** `UX-0006-admin-dashboard.md`
- **Business Rules:** Only the Admin role has platform-administration abilities.
- **Out of Scope:** How an Admin is provisioned (TODO in `PRD-0006`).

### TODO — Specific moderation actions and Admin provisioning

- TODO — Firm stories for specific moderation actions (Approve/Reject/Hide/Archive) and their statuses (Pending/Approved/Rejected) cannot be traced to a PRD, because `PRD-0006-platform.md` leaves moderation outcomes as TODO and `PRD-0001-offering.md` leaves Hidden/Archived as TODO. These appear in `UX-0006` as the approved UX brief and must be reconciled into the PRDs.
- TODO — A story for provisioning an Admin cannot be traced, because Admin provisioning is undefined in `PRD-0006-platform.md`.
- TODO — Ownership of "Basic analytics" is unresolved across `V1_SCOPE.md`, `PRD-0005`, and `PRD-0006`; no analytics story is written until it is settled.
