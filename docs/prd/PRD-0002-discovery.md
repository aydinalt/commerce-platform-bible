# PRD-0002 — Discovery

- **PRD ID:** PRD-0002
- **Title:** Discovery
- **Status:** Draft
- **Version:** 0.1 (pending review)
- **Scope level:** Product behaviour (non-technical)

> This document describes product behaviour only. It does not describe APIs, search engines, databases, ranking implementation, indexes, or infrastructure.

---

# 1. Purpose

Define the Discovery capability of the platform. Discovery is responsible for helping people discover Offerings. It covers how people search and browse Offerings, narrow them with Categories and Filters, order them with Sorting, move through them with Pagination, and how the platform behaves when there are results, no results, or a search in progress (Autocomplete), including the platform's URL behaviour during Discovery.

Discovery operates on Offerings as defined in `PRD-0001-offering.md`.

# 2. Business Value

Discovery exists so people can find the Offerings relevant to their decision quickly. This directly serves the Foundation: it respects the user's time and helps people complete decisions faster by making Offerings easy to find, narrow, and move through. Because Discovery works uniformly on the universal Offering model, the same discovery experience applies across every domain and can scale across many industries.

# 3. Scope

Discovery includes only:

- Search
- Browse
- Categories
- Filters
- Sorting
- Pagination
- Offering Results
- Zero Results
- Autocomplete
- URL behaviour

All of the above operate on Offerings, are organized by Categories, and are narrowed by Attributes, consistent with the Foundation and `PRD-0001-offering.md`.

# 4. Out of Scope

Discovery does not include:

- Compare
- Favorites
- Messaging
- Contact
- AI
- Recommendations
- History
- Saved Search
- Notifications
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

Discovery also does not define result ranking, search-engine behaviour, or any technical implementation; those are outside this product document.

# 5. Core Concepts

These concepts use Foundation terminology and are referenced, not redefined.

- **Offering** — the universal object of the platform; every discoverable item is an Offering (see `PRD-0001-offering.md`). Discovery operates on Offerings.
- **Category** — organizes Offerings. Per `V1_SCOPE.md`, categories are metadata that organize Offerings. Browse and Filters use Categories to narrow Offerings.
- **Attributes** — describe Offerings. Attributes power discovery, filtering, and comparison; within Discovery, Attributes are what Filters act on.
- **Discovery** — the capability that helps people find Offerings through Search and Browse.
- **Search** — finding Offerings by a person's entered query.
- **Browse** — finding Offerings by navigating Categories rather than entering a query.

# 6. Discovery Behaviour

- Discovery helps a person move from an open need to a set of relevant Offerings.
- A person can discover Offerings by Search (entering a query) or by Browse (navigating Categories).
- Discovered Offerings are returned as **Offering Results** — the result cards referred to as "Listing cards" in `V1_SCOPE.md`.
- Results can be narrowed with Filters (acting on Attributes) and Categories, ordered with Sorting, and moved through with Pagination.
- When nothing matches, Discovery presents a **Zero Results** state (Section 13).
- While a person is entering a Search query, the platform may offer **Autocomplete** (Section 14).
- The Discovery experience is the same across all domains, because it operates on the universal Offering model.

# 7. User Behaviour

Discovery is available without login. Permissions are referenced from approved decisions (`V1_SCOPE.md`, PRD-0003 Identity); none are invented.

- **Guest** — may Search, Browse, apply Filters and Categories, Sort, and move through results with Pagination, and view Offering Results, all without logging in.
- **User** — may do everything a Guest can within Discovery. Login does not add Discovery-specific abilities, because login-gated features such as Favorites and Saved Search are out of scope for Discovery.
- **Business** — a User acting in the context of an owned Business discovers Offerings with the same Discovery abilities as any User. Managing the Business's own Offerings is defined in `PRD-0001-offering.md` and the Business capability, not in Discovery.
- **Admin** — TODO — no Admin-specific Discovery behaviour is defined by approved decisions. Admin moderation is defined elsewhere and is out of scope here.

# 8. Search Behaviour

- A person can enter a query to Search for Offerings.
- Search returns matching Offerings as Offering Results.
- Search operates on Offerings, which are described by Attributes.
- If no Offering matches, Search leads to the Zero Results state (Section 13).
- TODO — the precise matching behaviour of Search (for example which parts of an Offering a query matches against) is not defined by approved decisions.
- TODO — result **ordering/ranking** for Search is intentionally not decided in this document. No ranking decision is made here.

# 9. Browse Behaviour

- A person can Browse Offerings by navigating Categories rather than entering a query.
- Browsing within a Category returns the Offerings organized under that Category as Offering Results.
- Browsed results can be further narrowed with Filters and ordered with Sorting, and moved through with Pagination.
- TODO — the structure of Category navigation (for example whether Categories are nested and how deep) is not defined by approved decisions.

# 10. Filters

- A person can narrow Offering Results with Filters.
- Filters act on Attributes, since Attributes power filtering.
- Filters may be combined with Search and with Browse/Categories to narrow results further.
- TODO — the specific set of Filters, the Attributes exposed as Filters, and how multiple Filters combine are not defined by approved decisions.

# 11. Sorting

- A person can Sort Offering Results.
- TODO — the available Sort options and the default order are not defined by approved decisions. No ranking or ordering decision is made in this document.

# 12. Pagination

- Offering Results are presented with Pagination so a person can move through them.
- TODO — the Pagination style (for example paged navigation versus continuous loading) and the number of results shown at a time are not defined by approved decisions.

# 13. Zero Results

- When no Offering matches a Search or a Browse/Filter combination, Discovery presents a Zero Results state.
- TODO — the exact Zero Results experience (for example messaging and any suggested next steps) is not defined by approved decisions. Any next steps must remain within Discovery scope and must not introduce out-of-scope capabilities such as Recommendations or Saved Search.

# 14. Autocomplete

- While a person is entering a Search query, the platform may present Autocomplete suggestions.
- TODO — what Autocomplete suggests (for example Offerings, Categories, Attributes, or query terms) and how it behaves are not defined by approved decisions. Autocomplete must remain within Discovery scope and must not introduce out-of-scope capabilities such as History or Recommendations.

# 15. URL Behaviour

- Discovery has defined URL behaviour as part of its scope.
- TODO — the specific Discovery state represented in the URL (for example query, selected Category, applied Filters, Sorting, and Pagination position), and whether a Discovery URL can be shared, bookmarked, or restored, are not defined by approved decisions. (Kept implementation-neutral: no URL format, parameter names, or routing mechanism is specified here.)

# 16. User Flows

Product flows using only approved, in-scope behaviour.

### 16.1 Search flow

1. A person enters a Search query.
2. Discovery returns matching Offerings as Offering Results.
3. The person narrows results with Filters and Categories, orders them with Sorting, and moves through them with Pagination.
4. The person opens an Offering to view its detail.
5. From the Offering detail, the person continues along the core flow beyond Discovery (for example to Compare), which is defined in other PRDs and is out of scope here.

### 16.2 Browse flow

1. A person Browses by navigating a Category.
2. Discovery returns the Offerings organized under that Category as Offering Results.
3. The person narrows, sorts, and paginates the results.
4. The person opens an Offering to view its detail.

### 16.3 Zero Results flow

1. A person performs a Search or applies Filters/Categories that match no Offering.
2. Discovery presents the Zero Results state.
3. TODO — the next steps offered from Zero Results are undefined (Section 13).

# 17. Functional Requirements

Product behaviour only.

1. A person can Search for Offerings by entering a query.
2. A person can Browse Offerings by navigating Categories.
3. Discovery returns matching Offerings as Offering Results.
4. A person can narrow Offering Results using Filters, which act on Attributes.
5. A person can narrow Offering Results using Categories.
6. A person can Sort Offering Results. (Available options and default order: TODO — Section 11.)
7. A person can move through Offering Results using Pagination. (Style and page size: TODO — Section 12.)
8. When no Offering matches, Discovery presents a Zero Results state. (Details: TODO — Section 13.)
9. While entering a Search query, a person may be offered Autocomplete. (Behaviour: TODO — Section 14.)
10. Discovery has URL behaviour. (Details: TODO — Section 15.)
11. All Discovery actions are available to Guests without login.

# 18. Non-functional Requirements

Stated as qualitative expectations derived only from Foundation principles. These are not technical metrics.

- **Respects the user's time.** Discovery helps people find relevant Offerings quickly and move through them without friction.
- **Helps complete decisions faster.** Discovery is a step toward a completed decision, not an end in itself.
- **Simplicity over complexity.** Discovery keeps finding Offerings simple and consistent.
- **One universal model, many industries.** Because Discovery operates on the universal Offering model, the same experience scales across domains.

# 19. Acceptance Criteria

Written in Gherkin (Given / When / Then).

```gherkin
Scenario: Search returns matching Offerings
  Given Offerings exist that match a person's query
  When the person searches with that query
  Then Discovery returns those Offerings as Offering Results

Scenario: Browse by Category returns Offerings under it
  Given a Category organizes a set of Offerings
  When a person browses that Category
  Then Discovery returns the Offerings organized under that Category

Scenario: Filters narrow results by Attributes
  Given a set of Offering Results
  When a person applies a Filter
  Then the results are narrowed according to the Attributes the Filter acts on

Scenario: Zero Results when nothing matches
  Given a Search or Filter combination that matches no Offering
  When the person performs it
  Then Discovery presents the Zero Results state

Scenario: Pagination lets a person move through results
  Given more Offering Results than are shown at once
  When a person moves through the results
  Then Pagination allows them to reach further results

Scenario: A Guest can use Discovery without logging in
  Given a person using the platform as a Guest
  When they Search, Browse, Filter, Sort, and paginate
  Then all of these Discovery actions succeed without requiring login
```

TODO — Additional acceptance criteria for Sorting options and default order, Pagination style, Zero Results details, Autocomplete behaviour, and URL behaviour depend on the decisions marked TODO in Sections 11–15.

# 20. Related PRDs

- **PRD-0001 — Offering** — defines the Offering that Discovery operates on.
- **PRD-0003 — Identity** — defines the roles (Guest, User, Business, Admin) referenced in Section 7.
- **PRD-0004 — Decision** — defines steps of the core flow after Discovery (for example Compare and the path to Completion), which are out of scope here. TODO — confirm which downstream PRD owns Compare and Contact.
- **PRD-0006 — Platform** — TODO — confirm any platform-level Discovery concerns owned here.

# 21. Related ADRs

No Architecture Decision Records are linked from this product document. ADR references belong to the Architecture workstream and will be recorded there.

# 22. Open Questions

- TODO — Define Search matching behaviour (which parts of an Offering a query matches). (Section 8)
- TODO — Result ordering/ranking is intentionally undecided; it must be settled outside this document without embedding a ranking decision here. (Sections 8, 11)
- TODO — Define Category navigation structure (for example nesting). (Section 9)
- TODO — Define the Filter set and how Filters combine. (Section 10)
- TODO — Define Sort options and default order. (Section 11)
- TODO — Define Pagination style and page size. (Section 12)
- TODO — Define the Zero Results experience and any in-scope next steps. (Section 13)
- TODO — Define Autocomplete behaviour and what it suggests. (Section 14)
- TODO — Define Discovery URL behaviour (state represented, shareability). (Section 15)
- TODO — Define any Admin-specific Discovery behaviour, if any. (Section 7)
- TODO — Confirm which downstream PRD owns Compare and Contact. (Section 20)
