# US-0002 — Discovery User Stories

- **Status:** Draft
- **Version:** 0.1

## 1. Purpose

User stories for the Discovery capability, derived only from `PRD-0002-discovery.md` and the related UX specifications. Discovery lets a person find Offerings through Search and Browse, narrow with Categories and Filters (Attributes), order with Sorting, and move through with Pagination.

## 2. Related PRDs

- `PRD-0002-discovery.md`

## 3. Related UX Specifications

- `UX-0001-home.md`
- `UX-0002-discovery.md`

## 4. User Stories

### US-0002.1 — Search for Offerings

**As a** person (Guest or User)
**I want** to search for Offerings by entering a query
**So that** I can find relevant Offerings quickly.

**Acceptance Criteria**
```gherkin
Scenario: Search returns matching Offerings
  Given Offerings match a query
  When a person searches with that query
  Then Discovery returns those Offerings as Offering Results
```

- **Priority:** Critical
- **Dependencies:** US-0001 (Offerings exist and are Published)
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0001-home.md`, `UX-0002-discovery.md`
- **Business Rules:** Discovery operates on Offerings; available without login.
- **Out of Scope:** AI search; recommendation engine; map.

### US-0002.2 — Browse by Category

**As a** person
**I want** to browse Offerings by navigating Categories
**So that** I can explore without entering a query.

**Acceptance Criteria**
```gherkin
Scenario: Browse a Category
  Given a Category organizes Offerings
  When a person browses that Category
  Then Discovery returns the Offerings organized under it
```

- **Priority:** High
- **Dependencies:** US-0001
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0001-home.md`, `UX-0002-discovery.md`
- **Business Rules:** Categories organize Offerings.
- **Out of Scope:** Category navigation structure/nesting (TODO in `PRD-0002`).

### US-0002.3 — Filter by Attributes

**As a** person
**I want** to narrow Offering Results using Filters
**So that** I can focus on Offerings matching my criteria.

**Acceptance Criteria**
```gherkin
Scenario: Filters narrow by Attributes
  Given a set of Offering Results
  When a person applies a Filter
  Then results are narrowed according to the Attributes the Filter acts on
```

- **Priority:** High
- **Dependencies:** US-0002.1 or US-0002.2
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0002-discovery.md`
- **Business Rules:** Attributes power filtering.
- **Out of Scope:** Filter set and combination rules (TODO in `PRD-0002`).

### US-0002.4 — Sort results

**As a** person
**I want** to sort Offering Results
**So that** I can order them usefully.

**Acceptance Criteria**
```gherkin
Scenario: Sorting orders results
  Given Offering Results
  When a person changes the Sort
  Then the results are ordered accordingly
```

- **Priority:** Medium
- **Dependencies:** US-0002.1 or US-0002.2
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0002-discovery.md`
- **Business Rules:** Sorting is available.
- **Out of Scope:** Sort options and default order / ranking (TODO in `PRD-0002`).

### US-0002.5 — Move through results with Pagination

**As a** person
**I want** to move through Offering Results with Pagination
**So that** I can reach more than the first set of results.

**Acceptance Criteria**
```gherkin
Scenario: Pagination reaches further results
  Given more Offering Results than are shown at once
  When a person moves through the results
  Then Pagination lets them reach further results
```

- **Priority:** Medium
- **Dependencies:** US-0002.1 or US-0002.2
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0002-discovery.md`
- **Business Rules:** Pagination is available.
- **Out of Scope:** Pagination style/page size (TODO in `PRD-0002`).

### US-0002.6 — See a Zero Results state

**As a** person
**I want** a clear Zero Results state when nothing matches
**So that** I understand there are no matching Offerings.

**Acceptance Criteria**
```gherkin
Scenario: Zero Results
  Given a query or Filter combination that matches no Offering
  When a person performs it
  Then Discovery shows the Zero Results state
```

- **Priority:** Medium
- **Dependencies:** US-0002.1, US-0002.3
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0002-discovery.md`
- **Business Rules:** A Zero Results state is shown when nothing matches.
- **Out of Scope:** Zero Results content/next steps (TODO); Recommendations.

### US-0002.7 — Use Autocomplete while searching

**As a** person
**I want** Autocomplete while entering a query
**So that** I can search more easily.

**Acceptance Criteria**
```gherkin
Scenario: Autocomplete appears while typing
  Given a person entering a Search query
  When Autocomplete is available
  Then suggestions may appear as they type
```

- **Priority:** Low
- **Dependencies:** US-0002.1
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0002-discovery.md`
- **Business Rules:** Autocomplete is part of Discovery.
- **Out of Scope:** What Autocomplete suggests (TODO); History.

### US-0002.8 — Discovery state reflected in the URL

**As a** person
**I want** the URL to reflect my current discovery state
**So that** my current view is represented consistently.

**Acceptance Criteria**
```gherkin
Scenario: URL reflects discovery state
  Given a person has searched, filtered, sorted, and paginated
  When the discovery state changes
  Then the URL reflects the current discovery state
```

- **Priority:** Low
- **Dependencies:** US-0002.1–US-0002.5
- **Related PRDs:** `PRD-0002-discovery.md`
- **Related UX:** `UX-0002-discovery.md`
- **Business Rules:** Discovery has URL behaviour.
- **Out of Scope:** Exact parameters and shareability (TODO in `PRD-0002`).

### US-0002.9 — Discover without logging in

**As a** Guest
**I want** to use all Discovery actions without logging in
**So that** I can experience the platform before authenticating.

**Acceptance Criteria**
```gherkin
Scenario: Guest uses Discovery without login
  Given a Guest
  When they Search, Browse, Filter, Sort, and paginate
  Then all actions succeed without login
```

- **Priority:** High
- **Dependencies:** —
- **Related PRDs:** `PRD-0002-discovery.md`, `PRD-0003-identity.md`
- **Related UX:** `UX-0001-home.md`, `UX-0002-discovery.md`
- **Business Rules:** Discovery is available to Guests without login.
- **Out of Scope:** Login-gated actions (Favorites, Contact, Messaging).
