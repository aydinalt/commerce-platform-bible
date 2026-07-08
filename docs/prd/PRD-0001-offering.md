# PRD-0001 — Offering

- **PRD ID:** PRD-0001
- **Title:** Offering
- **Status:** Approved
- **Version:** 1.0
- **Scope level:** Product behaviour (non-technical)

> This is the first Product Requirements Document of the project and the authoritative definition of the universal Offering model. It describes product behaviour only. It does not describe APIs, database tables, frameworks, backend architecture, frontend implementation, validation rules, storage, or security implementation.

---

# 1. Purpose

Define the universal Offering model used across the entire platform. Every discoverable item on the platform is an **Offering**. Regardless of domain, everything discoverable is represented by the same Offering model: Categories organize Offerings, Attributes describe Offerings, Discovery operates on Offerings, Comparison operates on Offerings, and Businesses publish Offerings.

This document is the authoritative reference for what an Offering is and how it behaves as a product concept. Other capabilities — Identity, Discovery, Comparison, Contact, and Offering management — build on the definition established here.

# 2. Business Value

The Offering model exists so that a single, consistent object can represent every discoverable item across every domain. This directly serves the Foundation:

- It lets the platform **scale across many industries** without a different model per domain.
- It keeps the product **simple**: one object, organized by Categories and described by Attributes, rather than many special cases.
- It lets **Discovery and Comparison** work uniformly, helping people complete decisions faster.
- It lets **Businesses**, as partners, publish what they offer in one consistent way.

Because every discoverable item is the same kind of object, people learn the platform once and apply it everywhere, and the platform can grow into new domains without redesigning its core.

# 3. Scope

This document covers, at the product-behaviour level:

- The definition of the universal Offering and its role as the single discoverable object.
- The core concepts that relate to Offerings: Category, Attributes, Business, Discovery.
- The Offering lifecycle states named in this document's approved inputs: Draft, Published, Hidden, Archived.
- The approved business rules that govern Offerings.
- What each role (Guest, User, Business, Admin) can do with Offerings, referencing already-approved permissions.
- The lifecycle transitions that are already supported by approved decisions.

The Offering model is domain-agnostic. Per `V1_SCOPE.md`, V1 launches with the approved domains **Mobility, Real Estate, and Technology**. The broader set of domains used as examples in the inputs (for example Vehicle, Real Estate, Electronics, Education, Healthcare, Services) illustrates the model's universality and does not change V1's launch domains.

# 4. Out of Scope

- Any technical implementation (APIs, data models, frameworks, storage, validation, security).
- Frontend or backend design of how Offerings are managed or displayed.
- The internal behaviour of capabilities that merely **operate on** Offerings (Discovery, Comparison, Contact, Offering management) beyond what this document defines about the Offering itself; those are defined in their own PRDs (see Section 14).
- Transactional handling of specific Offering types that `V1_SCOPE.md` excludes from V1 — for example credit application and insurance sales. The Offering model may conceptually represent such offer types (per the `V1_SCOPE.md` definition of Offering), but the excluded transactional capabilities are not in scope.
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

# 5. Core Concepts

These concepts use Foundation terminology and are referenced, not redefined.

- **Offering** — the universal object of the platform. Per `V1_SCOPE.md`, the Offering is the universal object for listings, products, services, jobs, credit offers, insurance offers, and similar. Every discoverable item on the platform is an Offering, regardless of domain.
- **Category** — organizes Offerings. Per `V1_SCOPE.md`, categories are metadata that organize Offerings.
- **Attributes** — describe Offerings. Attributes power discovery, filtering, and comparison.
- **Business** — a profile managed by a User account (not a separate account), per the Foundation. Businesses publish Offerings.
- **Discovery** — the capability that operates on Offerings through search, browse, and filter. Discovery works on Offerings.

> **Review Note:** Foundation wording varies slightly — `V1_SCOPE.md` says "Categories are metadata" while later Foundation documents say "Categories organize content." These are compatible (metadata that organizes), and this document uses the combined phrasing consistently. As this PRD is now the authoritative Offering definition, a decision-maker may wish to settle on a single phrasing in the source of truth. No terminology has been changed.

# 6. Offering Lifecycle

The Offering lifecycle is described only as product states. No implementation is described. The state set below is the one named in this document's approved inputs.

- **Draft** — an Offering being prepared that has not yet been Published. A Draft is not discoverable.
- **Published** — an Offering that is discoverable and can appear in Discovery and Comparison.
- **Hidden** — an Offering that is not currently discoverable. TODO — the precise product behaviour of Hidden (for example whether it can return to Published, and what remains accessible) is not defined by approved decisions.
- **Archived** — an Offering retired from active use. TODO — the precise product behaviour of Archived (for example whether it is permanent) is not defined by approved decisions.

The behavioural meaning of Draft and Published is grounded in the approved user flow (Create Offering → Draft → Publish → Discovery). The meanings of Hidden and Archived beyond their names are undefined and marked TODO above. Transitions are covered in Section 9.

# 7. Business Rules

Only approved behaviour is included.

1. Every Offering belongs to exactly one Business.
2. A Business may own multiple Offerings.
3. Categories organize Offerings.
4. Attributes describe Offerings.
5. Discovery works on Offerings.
6. Comparison works on Offerings.
7. Businesses publish Offerings.

# 8. User Behaviour

What each role can do with Offerings. Permissions are referenced from already-approved decisions (`V1_SCOPE.md` and PRD-0003 Identity); none are invented.

- **Guest** — may search, browse, filter, compare, and view Offering details. A Guest cannot perform login-gated actions such as Contact or Favorites, per PRD-0003.
- **User** — may do everything a Guest can, and may additionally perform login-gated actions on Offerings, such as favouriting an Offering or contacting the Business behind an Offering, per PRD-0003.
- **Business** — a User acting in the context of an owned Business may create, edit, and delete Offerings it owns, publish Offerings, and view its dashboard, per the PRD-0003 permissions matrix. Every Offering a Business publishes belongs to exactly one Business.
- **Admin** — moderates Offerings and their content after they exist (moderation happens afterwards). TODO — Admin abilities over Offerings beyond post-hoc moderation (for example whether Admin may Hide or Archive an Offering) are not defined by approved decisions and must not be assumed.

# 9. State Transitions

Only transitions already supported by approved decisions are shown.

```
Draft
  │  Publish
  ▼
Published
```

- **Draft → Published** — supported by the approved user flow (Create Offering → Draft → Publish → Discovery).
- **All other transitions** among Draft, Published, Hidden, and Archived — TODO. No approved decision defines them. This includes, without assuming any of them exist:
  - TODO — Published → Hidden and Hidden → Published.
  - TODO — Published → Archived, and any path into Archived.
  - TODO — any transition out of Archived.
  - TODO — whether an Offering may return to Draft.

# 10. User Flows

Complete product flows using only approved behaviour.

### 10.1 Publish-to-completion flow

```
Business
  ↓  Create Offering
Draft
  ↓  Publish
Published
  ↓
Discovery
  ↓  User opens Offering
Offering Detail
  ↓
Compare
  ↓
Contact
  ↓
Completion
```

1. A Business creates an Offering, which begins as a Draft.
2. The Business publishes the Offering; it becomes Published.
3. The Published Offering becomes available in Discovery.
4. A User discovers the Offering and opens its Offering detail.
5. The User compares the Offering with other Offerings.
6. The User contacts the Business (a login-gated action per PRD-0003).
7. The decision reaches Completion.

### 10.2 Business manages its Offerings

1. A Business creates one or more Offerings, each beginning as a Draft.
2. The Business edits Offerings it owns.
3. The Business publishes Offerings it owns (Draft → Published).
4. The Business may delete Offerings it owns.
5. TODO — flows involving Hidden or Archived states depend on the transitions marked TODO in Section 9.

# 11. Functional Requirements

Product behaviour only.

1. Every discoverable item on the platform is represented as an Offering.
2. An Offering is described by Attributes.
3. An Offering is organized by Categories.
4. Every Offering belongs to exactly one Business.
5. A Business may own multiple Offerings.
6. A Business can create an Offering, which begins as a Draft.
7. A Business can edit an Offering it owns.
8. A Business can delete an Offering it owns.
9. A Business can publish an Offering, moving it from Draft to Published.
10. A Published Offering is available to Discovery.
11. Discovery operates on Offerings through search, browse, and filter by Attributes.
12. Comparison operates on Offerings by Attributes.
13. Guests and Users can discover, filter, compare, and view Offering details.
14. Hidden and Archived are defined states of an Offering; their behaviour and transitions beyond Draft → Published are TODO (see Sections 6 and 9).

# 12. Non-functional Requirements

Stated as qualitative expectations derived only from Foundation principles. These are not technical metrics.

- **One universal model.** A single Offering object represents every discoverable item, keeping the product simple and consistent across domains.
- **Scales across many industries.** The Offering model is domain-agnostic, so the platform can grow into new domains without a new model.
- **Respects the user's time.** Because Discovery and Comparison operate uniformly on Offerings, people can find and compare items and complete decisions faster.
- **Attributes power discovery, filtering, and comparison.** Description lives in Attributes, so the same mechanisms work everywhere.
- **Businesses are partners.** Businesses publish Offerings directly as partners in the platform.

# 13. Acceptance Criteria

Written in Gherkin (Given / When / Then).

```gherkin
Scenario: Every discoverable item is an Offering
  Given any item that can be discovered on the platform
  When it is represented in the product
  Then it is represented as an Offering, regardless of its domain

Scenario: An Offering belongs to exactly one Business
  Given a published Offering
  When its ownership is examined
  Then it belongs to exactly one Business

Scenario: A Business owns multiple Offerings
  Given a Business
  When it publishes more than one Offering
  Then all of those Offerings are owned by that single Business

Scenario: Categories organize Offerings
  Given a set of Offerings
  When they are organized
  Then they are organized by Categories

Scenario: Attributes describe Offerings
  Given an Offering
  When its description is examined
  Then it is described by Attributes

Scenario: Discovery operates on Offerings
  Given published Offerings
  When a person searches, browses, or filters
  Then Discovery operates on those Offerings

Scenario: Comparison operates on Offerings
  Given two or more Offerings
  When a person compares them
  Then the comparison operates on those Offerings

Scenario: A Business creates and publishes an Offering
  Given a Business
  When it creates an Offering and then publishes it
  Then the Offering begins as a Draft and becomes Published

Scenario: A Published Offering becomes discoverable
  Given an Offering that has been Published
  When a person uses Discovery
  Then the Published Offering is available to Discovery

Scenario: A Guest can view Offerings but cannot use login-gated actions
  Given a person using the platform as a Guest
  When they search, browse, filter, compare, and view Offering details
  Then those actions succeed, while login-gated actions such as Contact are unavailable until they log in

Scenario: Admin moderates Offerings after they exist
  Given a published Offering and its content
  When an Admin performs moderation
  Then moderation is applied after the Offering exists rather than before publication
```

TODO — Additional acceptance criteria for Hidden and Archived depend on the state behaviour and transitions marked TODO (Sections 6 and 9).

# 14. Related PRDs

- **PRD-0002 — Discovery**
- **PRD-0003 — Identity** — governs the roles (Guest, User, Business, Admin) and permissions referenced in Sections 8 and 10.
- **PRD-0004 — Decision**
- **PRD-0005 — Business**
- **PRD-0006 — Platform**

# 15. Related ADRs

No Architecture Decision Records are linked from this product document. ADR references belong to the Architecture workstream and will be recorded there.

# 16. Open Questions

- TODO — Define the product behaviour of the Hidden state. (Section 6)
- TODO — Define the product behaviour of the Archived state. (Section 6)
- TODO — Define all lifecycle transitions other than Draft → Published. (Section 9)
- TODO — Define whether Admin may Hide or Archive an Offering, and any other Admin abilities over Offerings beyond post-hoc moderation. (Section 8)
- TODO — Confirm domain naming alignment: the inputs reference "Vehicle" and "Electronics" while `V1_SCOPE.md` names the V1 domains "Mobility" and "Technology." (Section 3)
- TODO — Settle a single phrasing for Categories ("metadata" vs "organize content") in the source of truth. (Section 5)
