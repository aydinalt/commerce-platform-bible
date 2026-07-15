# UX-0002 — Discovery

- **UX ID:** UX-0002
- **Title:** Discovery
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** UX behaviour (non-visual, non-technical)

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

Discovery lets a person find Offerings through Search and Browse, narrow them with Categories and Filters (Attributes), order them with Sorting, and move through them with Pagination, as defined in `PRD-0002-discovery.md`.

## 2. Business Value

Discovery respects the user's time and helps people complete decisions faster by making Offerings easy to find and narrow. It behaves the same across domains because it operates on the universal Offering model.

## 3. Scope

- Search and Browse.
- Categories and Attributes (as Filters).
- Sorting and Pagination.
- Autocomplete.
- Zero Results.
- The URL reflects the current discovery state.
- On desktop, the filter panel appears on the left.
- On mobile, filters use a bottom sheet.

## 4. Out of Scope

- Map (no map in V1).
- Recommendation engine.
- AI search.
- Compare, Favorites, Contact, and Messaging (defined in other UX docs).
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

## 5. Entry Points

- From Home via search, Category selection, or the hero (see `UX-0001`).
- From any screen offering Search or Browse.
- From a Discovery URL that reflects a prior discovery state.

## 6. Exit Points

- Selecting an Offering result → Offering Detail (see `UX-0003`).
- Refining the query (remaining within Discovery).

## 7. Screen Overview

Discovery presents a search entry, a filter panel (left on desktop; a bottom sheet on mobile), Offering Results, Sorting, and Pagination. When nothing matches, a Zero Results state is shown.

## 8. Screen Behaviour

- Search returns matching Offerings as Offering Results.
- Browse returns Offerings organized under the selected Category.
- Filters act on Attributes to narrow results; Categories also narrow results.
- Sorting orders results. TODO — the available Sort options and default order are not defined by approved decisions (`PRD-0002-discovery.md`); no ordering is decided here.
- Pagination moves through results. TODO — Pagination style and page size are not defined by approved decisions.
- Autocomplete may appear while entering a query. TODO — what Autocomplete suggests is not defined by approved decisions.
- The URL reflects the current discovery state (query, Category, Filters, Sorting, Pagination position). TODO — the exact state represented and whether it is shareable/restorable are not defined by approved decisions.

## 9. User Actions

- Enter and submit a search query.
- Browse by selecting a Category.
- Apply and remove Filters.
- Change Sorting.
- Move through pages (Pagination).
- Open an Offering result.
- On mobile, open and close the filter bottom sheet.

## 10. System Responses

- A query or Filter change updates the Offering Results.
- Selecting an Offering opens its Offering Detail.
- When nothing matches, the Zero Results state is shown.
- The URL updates to reflect the current discovery state.

## 11. Validation Behaviour (Product level)

- TODO — behaviour of an empty query and of invalid/conflicting Filter combinations is not defined by approved decisions.

## 12. Empty States

- **Zero Results** — when no Offering matches, Discovery shows the Zero Results state. TODO — the exact Zero Results content and any in-scope next steps are not defined (`PRD-0002-discovery.md`); it must not introduce out-of-scope capabilities such as Recommendations.

## 13. Loading States

- While results are being retrieved, Discovery shows a loading state. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when results fail to load is not defined by approved decisions.

## 15. Permissions

- All Discovery actions (Search, Browse, Filter, Sort, paginate, view results) are available to Guests without login (per `PRD-0003-identity.md`).

## 16. Accessibility Notes

- At the product level, Search, Filters (including the mobile bottom sheet), Sorting, Pagination, and result selection must be operable without a mouse and perceivable by assistive technology.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0002-discovery.md` — the Discovery capability.
- `PRD-0001-offering.md` — the Offerings and Attributes discovered.
- `PRD-0003-identity.md` — Discovery available to Guests.

## 18. Acceptance Criteria

```gherkin
Scenario: Search returns Offering Results
  Given Offerings match a query
  When a person searches
  Then Discovery returns those Offerings as Offering Results

Scenario: Browse by Category
  Given a Category organizes Offerings
  When a person browses that Category
  Then Discovery returns the Offerings organized under it

Scenario: Filters narrow by Attributes
  Given Offering Results
  When a person applies a Filter
  Then results are narrowed according to the Attributes the Filter acts on

Scenario: Zero Results state
  Given a query or Filter combination that matches no Offering
  When the person performs it
  Then Discovery shows the Zero Results state

Scenario: URL reflects discovery state
  Given a person has searched, filtered, sorted, and paginated
  When the discovery state changes
  Then the URL reflects the current discovery state

Scenario: Guest can use Discovery without login
  Given a Guest
  When they Search, Browse, Filter, Sort, and paginate
  Then all actions succeed without login

Scenario: No map, recommendation engine, or AI search
  Given a person using Discovery
  When they view the screen
  Then there is no map, no recommendation engine, and no AI search
```

## 19. Open Questions (TODO only)

- TODO — Define Sort options and default order. (Section 8)
- TODO — Define Pagination style and page size. (Section 8)
- TODO — Define Autocomplete contents. (Section 8)
- TODO — Define the Zero Results content and any in-scope next steps. (Section 12)
- TODO — Define empty-query and invalid-Filter behaviour. (Section 11)
- TODO — Define the discovery state represented in the URL and its shareability. (Section 8)
- TODO — Define loading and error behaviour. (Sections 13–14)
