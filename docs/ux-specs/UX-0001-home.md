# UX-0001 — Home

- **UX ID:** UX-0001
- **Title:** Home
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** UX behaviour (non-visual, non-technical)

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

The Home screen is the primary entry point into Discovery. It presents a hero search, the main Categories, a short value proposition, and a featured section of the newest Offerings, so a person can begin finding Offerings immediately.

## 2. Business Value

Home respects the user's time and helps people reach a decision faster by leading directly into Discovery. It stays simple, and Guest and logged-in people follow the same discovery flow, so a Guest can experience the platform before any login is required.

## 3. Scope

- A large hero search section, opening with the approved prompt "Bugün ne yapmak istiyorsunuz?" (per `V1_SCOPE.md`).
- Main Categories immediately visible.
- A short value proposition.
- A featured section showing the newest Offerings.
- Popular categories manually ordered by Admin.

## 4. Out of Scope

- Promotional carousel.
- Personalized recommendations.
- Recently viewed section.
- AI.
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

## 5. Entry Points

- Opening the platform at its root.
- Returning to Home from any screen via primary navigation.

## 6. Exit Points

- Submitting a search → Discovery (see `UX-0002`).
- Selecting a Category → Discovery filtered by that Category.
- Selecting a featured Offering → Offering Detail (see `UX-0003`).
- Entering Authentication where a person chooses to log in (see `UX-0008`).

## 7. Screen Overview

Home contains a hero search, a short value proposition, the main Categories, and a featured section of the newest Offerings. Popular categories shown here are ordered by Admin.

## 8. Screen Behaviour

- The hero search begins a Discovery query.
- The main Categories lead into Discovery for the selected Category.
- The featured section lists the newest Offerings (per `PRD-0001-offering.md` / `PRD-0002-discovery.md`); it is not personalized.
- Popular categories are shown in an order manually set by Admin (Category Management, `PRD-0006-platform.md`).
- The Home experience is identical for Guests and logged-in Users.

## 9. User Actions

- Enter a search query in the hero search.
- Use search Autocomplete (behaviour defined in `UX-0002`).
- Select a main or popular Category.
- Select a featured Offering.

## 10. System Responses

- A submitted search opens Discovery with matching Offerings.
- A selected Category opens Discovery filtered by that Category.
- A selected featured Offering opens its Offering Detail.

## 11. Validation Behaviour (Product level)

- TODO — behaviour of submitting an empty hero search (for example whether it opens Browse) is not defined by approved decisions.

## 12. Empty States

- TODO — behaviour when there are no newest Offerings to feature is not defined by approved decisions.
- TODO — behaviour when no Categories are available is not defined by approved decisions.

## 13. Loading States

- While the featured Offerings and Categories are being retrieved, Home shows a loading state. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when the featured Offerings or Categories fail to load is not defined by approved decisions.

## 15. Permissions

- Home is fully available to Guests and Users without login (per `PRD-0003-identity.md`).
- No administration actions occur on Home; ordering of popular categories is performed by Admin elsewhere (`UX-0006`).

## 16. Accessibility Notes

- At the product level, all Home actions (search, Category selection, featured Offering selection) must be operable without a mouse and perceivable by assistive technology.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0002-discovery.md` — Discovery entered from Home.
- `PRD-0001-offering.md` — the newest Offerings featured.
- `PRD-0003-identity.md` — same flow for Guest and User.
- `PRD-0006-platform.md` — Admin-managed Category ordering.

## 18. Acceptance Criteria

```gherkin
Scenario: Search from Home enters Discovery
  Given a person is on Home
  When they submit a search query
  Then Discovery opens with matching Offerings

Scenario: Selecting a Category enters Discovery
  Given a person is on Home
  When they select a main or popular Category
  Then Discovery opens filtered by that Category

Scenario: Featured section shows newest Offerings
  Given Offerings exist
  When a person views the featured section on Home
  Then it shows the newest Offerings and is not personalized

Scenario: Guest and User see the same Home flow
  Given two people, one a Guest and one a logged-in User
  When each opens Home
  Then both follow the same discovery flow

Scenario: Home has no carousel, recommendations, or recently viewed
  Given a person on Home
  When they view the screen
  Then there is no promotional carousel, no personalized recommendations, and no recently viewed section
```

## 19. Open Questions (TODO only)

- TODO — Define behaviour of submitting an empty hero search. (Section 11)
- TODO — Define empty, loading, and error behaviour for featured Offerings and Categories. (Sections 12–14)
- TODO — Define how many Categories and featured Offerings are shown. (Section 7)
