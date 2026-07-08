# US-0001 — Offering User Stories

- **Status:** Draft
- **Version:** 0.1

## 1. Purpose

User stories for the Offering capability, derived only from `PRD-0001-offering.md` and the related UX specifications. Offerings are the universal object; they are created and managed by a Business, organized by Categories, and described by Attributes.

## 2. Related PRDs

- `PRD-0001-offering.md`

## 3. Related UX Specifications

- `UX-0003-offering-detail.md`
- `UX-0002-discovery.md`
- `UX-0005-business-dashboard.md`

## 4. User Stories

### US-0001.1 — View an Offering in full

**As a** person (Guest or User)
**I want** to view an Offering's full detail, including its gallery, Attribute groups, and the Business behind it
**So that** I can evaluate it and move toward a decision.

**Acceptance Criteria**
```gherkin
Scenario: View the complete Offering
  Given an Offering exists and is Published
  When a person opens its Offering Detail
  Then they can see its gallery, Attribute groups, and the owning Business
```

- **Priority:** Critical
- **Dependencies:** US-0002 (Discovery to reach the Offering)
- **Related PRDs:** `PRD-0001-offering.md`
- **Related UX:** `UX-0003-offering-detail.md`
- **Business Rules:** Every Offering belongs to exactly one Business; Offerings are described by Attributes and organized by Categories.
- **Out of Scope:** Attribute-based similarity; recommendations; AI.

### US-0001.2 — Create an Offering

**As a** Business
**I want** to create an Offering, which begins as a Draft
**So that** I can prepare it before publishing.

**Acceptance Criteria**
```gherkin
Scenario: Create an Offering as a Draft
  Given a Business
  When it creates an Offering
  Then the Offering begins in the Draft state and belongs to that single Business
```

- **Priority:** Critical
- **Dependencies:** US-0005 (Business exists), US-0003 (logged-in User acting as Business)
- **Related PRDs:** `PRD-0001-offering.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** An Offering begins as Draft; every Offering belongs to exactly one Business; a Business manages only Offerings it owns.
- **Out of Scope:** Technical field/validation definitions (TODO in `PRD-0001`).

### US-0001.3 — Edit an owned Offering

**As a** Business
**I want** to edit an Offering I own
**So that** I can keep it accurate.

**Acceptance Criteria**
```gherkin
Scenario: Edit an owned Offering
  Given a Business that owns an Offering
  When it edits that Offering
  Then the changes are applied to that Offering
```

- **Priority:** High
- **Dependencies:** US-0001.2
- **Related PRDs:** `PRD-0001-offering.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** A Business manages only the Offerings it owns.
- **Out of Scope:** Field-level validation (TODO).

### US-0001.4 — Delete an owned Offering

**As a** Business
**I want** to delete an Offering I own
**So that** I can remove it from the platform.

**Acceptance Criteria**
```gherkin
Scenario: Delete an owned Offering
  Given a Business that owns an Offering
  When it deletes that Offering
  Then the Offering is removed
```

- **Priority:** Medium
- **Dependencies:** US-0001.2
- **Related PRDs:** `PRD-0001-offering.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** A Business manages only the Offerings it owns.
- **Out of Scope:** —

### US-0001.5 — Publish an owned Offering

**As a** Business
**I want** to publish an Offering (Draft → Published)
**So that** people can discover it.

**Acceptance Criteria**
```gherkin
Scenario: Publish an Offering
  Given a Business with a Draft Offering
  When it publishes the Offering
  Then the Offering moves from Draft to Published and becomes available to Discovery
```

- **Priority:** Critical
- **Dependencies:** US-0001.2, US-0002 (Discovery)
- **Related PRDs:** `PRD-0001-offering.md`
- **Related UX:** `UX-0005-business-dashboard.md`, `UX-0002-discovery.md`
- **Business Rules:** Draft → Published is the only approved Offering-state transition.
- **Out of Scope:** Hidden and Archived states/transitions (TODO in `PRD-0001`).

### TODO — Hidden / Archived Offerings

- TODO — Stories for hiding or archiving an Offering cannot be derived, because the Hidden and Archived states and their transitions are undefined in `PRD-0001-offering.md`.
