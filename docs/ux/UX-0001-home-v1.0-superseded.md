# UX-0001 — Home

- **UX ID:** UX-0001
- **Title:** Home
- **Status:** Frozen
- **Version:** 1.0
- **Supersedes:** Draft v0.1
- **Approved candidate:** In Review v0.2
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0001 — Home. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.2 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.2):** Controlled revision against Frozen PRD-0002 v2.1. Removes featured Offerings, popular-Category ordering, Autocomplete, recommendation behaviour, and unsupported exit paths. Defines the exact homepage prompt, explicit person-submitted Search, active-Category Browse entry, public role-neutral behaviour, and bounded validation, loading, and error handling.

> This document defines experience behaviour only. It does not define visual style, ranking, search-engine implementation, components, APIs, storage, or technical routing.

---

## 1. Purpose

Home provides the public V1 entry into Discovery through one explicit question and two person-controlled routes: Search and Browse.

## 2. Business Value

The experience helps a person begin quickly without forced registration, silent intent inference, featured-content distraction, or recommendation-driven routing.

## 3. Scope

- exact prompt `Bugün ne yapmak istiyorsunuz?`;
- person-entered Search query;
- explicit Search submission;
- active Category Browse entry;
- Discovery Start handoff;
- public and role-neutral access;
- bounded input validation;
- loading and error behaviour for Category entry.

## 4. Out of Scope

- Search Results;
- Browse Results;
- Filters;
- Listing Cards;
- Offering Presentation;
- Compare or Decision Flow;
- featured or newest Offerings;
- popular or manually ranked Categories;
- Autocomplete;
- recommendations;
- Search history;
- saved Search;
- personalized homepage;
- Favorites;
- Messaging;
- authentication gates.

## 5. Entry Points

- first public arrival;
- return from Discovery;
- return from Offering or Decision journeys;
- authenticated User, Business, or Admin context returning to the public homepage.

## 6. Screen Overview

The Home experience provides:

- the exact approved prompt;
- one Search entry;
- active Category Browse entries;
- a short non-interactive value statement where desired.

The value statement must not create another route, ranking, recommendation, or product promise beyond the Frozen PRDs.

## 7. Search Entry

### 7.1 Prompt

The Search entry uses exactly:

```text
Bugün ne yapmak istiyorsunuz?
```

### 7.2 Input

The person controls the query.

The experience does not:

- silently infer a goal;
- submit while the person is still entering text;
- replace the query with a recommendation;
- expose Autocomplete;
- add hidden Category or Filter criteria.

### 7.3 Submission

A Search route begins only when the person explicitly submits a valid non-empty query.

Leading and trailing whitespace may be ignored for validation.

Whitespace-only input does not start Search.

### 7.4 Handoff

On valid submission:

- UX-0002 receives the exact current query;
- Search Discovery Start occurs under PRD-0002;
- no active leaf Category is invented;
- authentication is not required.

## 8. Browse Entry

### 8.1 Category source

Home consumes active root Category definitions.

It does not:

- manually reorder Categories by popularity;
- create a separate featured-Category set;
- show retired Categories as active choices.

### 8.2 Selection

When the person selects an active Category:

- UX-0002 receives that Category as the beginning Browse context;
- Browse Discovery Start occurs;
- the person continues through the active hierarchy;
- no Offering Result appears until an active leaf Category is selected.

### 8.3 No silent route

Home does not automatically open a Category from prior activity, role, inferred location, or popularity.

## 9. Role-Neutral Behaviour

The public Home behaviour is the same for:

- Guest;
- Enabled User;
- Business context;
- Admin context;
- Suspended account using its Guest baseline.

Home does not show role-specific Discovery results or require login.

## 10. User Actions

- enter a Search query;
- submit Search;
- clear or change the query;
- select an active Category;
- leave the page.

## 11. System Responses

- preserves the exact person-entered query until submission or clearing;
- prevents whitespace-only Search;
- starts the applicable Discovery route only after explicit action;
- passes query or Category context to UX-0002;
- does not fabricate recommendations or featured destinations.

## 12. Empty and Loading Behaviour

### No active Categories available

Search remains available.

The Browse area presents a bounded unavailable state and does not invent Categories.

### Category loading

The person may still use Search where Search entry is available.

Category actions remain inactive until active Category data is resolved.

## 13. Error Behaviour

### Search route cannot begin

- the entered query remains;
- no Discovery Start is claimed;
- the person may retry or edit the query.

### Category route cannot begin

- the selected Category is not silently replaced;
- no other Category opens;
- the person may retry or choose another active Category.

## 14. Permissions

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| View Home | ✓ | ✓ | ✓ | ✓ |
| Submit Search | ✓ | ✓ | ✓ | ✓ |
| Begin Browse | ✓ | ✓ | ✓ | ✓ |
| Use Autocomplete | ✗ | ✗ | ✗ | ✗ |
| View featured/recommended Offerings | ✗ | ✗ | ✗ | ✗ |

## 15. Accessibility Requirements

- The exact prompt is associated with the Search entry.
- Search submission has an unambiguous accessible name.
- Whitespace-only validation is perceivable without color alone.
- Category choices have meaningful names and a predictable reading order.
- Loading and error changes are announced without moving focus unexpectedly.
- Keyboard and assistive-technology users can submit Search and begin Browse.

## 16. Related Documents

- `PRD-0002-discovery.md` — homepage ownership, prompt, routing, Discovery Start.
- `PRD-0003-identity.md` — public Guest baseline.
- `UX-0002-discovery.md` — Search and Browse continuation.

## 17. Acceptance Criteria

```gherkin
Scenario: Exact homepage prompt is shown
  Given a person opens Home
  When the Search entry is available
  Then the prompt is exactly Bugün ne yapmak istiyorsunuz?

Scenario: Valid Search begins Discovery
  Given a person enters a non-empty query
  When they explicitly submit it
  Then UX-0002 receives the current query
  And Search Discovery Start occurs
  And authentication is not required

Scenario: Whitespace-only Search does not begin
  Given the Search entry contains only whitespace
  When the person submits
  Then Discovery does not start
  And the person can correct the input

Scenario: Active Category begins Browse
  Given active root Categories are available
  When the person selects one
  Then UX-0002 receives that Category as Browse context
  And Browse Discovery Start occurs

Scenario: Browse does not invent leaf results
  Given the person selected a non-leaf Category
  When UX-0002 opens
  Then no Offering Results are shown until an active leaf Category is selected

Scenario: Home is role neutral
  Given a Guest, User, Business context, or Admin context
  When Home opens
  Then Search and Browse entry behaviour is the same

Scenario: Unsupported homepage behaviour is absent
  Given Home is open
  When available routes are presented
  Then there is no featured Offering section
  And no popular-Category ordering
  And no Autocomplete
  And no recommendation route
```

## 18. Accepted UX Deferrals

The following do not block review:

- exact visual layout;
- value-statement wording;
- responsive arrangement;
- technical navigation implementation;
- Search-input focus treatment.

No deferral may add featured Offerings, popular Category ranking, Autocomplete, personalization, recommendations, history, or authentication gates.
