# Commerce Decision Platform — V1 Scope

- **Status:** Approved
- **Version:** 1.0

## 1. Purpose

This document defines the exact V1 launch scope for the Commerce Decision Platform. It exists to lock what V1 is, what V1 is not, and how the core flows behave. Any work item that is not covered here is out of V1 by definition. This document is the single source of truth for V1 scope decisions.

## 2. V1 Goal

Launch a working Commerce Decision Platform in **30 days** that helps users complete decisions faster.

The platform is **not** an inventory, logistics, payment, banking, insurance, or delivery company. It is a decision layer that guides users from an open question to a completed decision, then hands them off to complete the transaction elsewhere (affiliate link or direct contact).

The homepage opens with a single prompt:

> **Bugün ne yapmak istiyorsunuz?**

## 3. Included Scope

V1 includes the following capabilities and nothing beyond them:

- User account
- Business profile
- Offering management
- Search / discovery
- Filters
- Listing cards
- Offering detail
- Compare
- Decision Chat
- Affiliate links
- Admin panel
- Basic analytics

AI in V1 is **assistive only, not autonomous**. Decision Chat supports the user in making a decision; it does not act on the user's behalf.

## 4. Excluded Scope

The following are explicitly **out of V1**. They are not partially built, not stubbed, and not planned within the 30-day window:

- AI agents
- Credit application
- Insurance sales
- Payment processing
- Logistics
- Warehouse
- API marketplace
- Enterprise procurement
- Voice / video chat
- Advanced recommendation
- Decision Memory
- Decision Watch

If a request maps to any item above, it is deferred past V1.

## 5. Core User Flow

The user moves through a single, fixed path:

```
Homepage
  → Discovery
    → Listing
      → Offering Detail
        → Compare
          → Decision Chat
            → Affiliate / Contact
              → Completion
```

1. **Homepage** — user is asked "Bugün ne yapmak istiyorsunuz?"
2. **Discovery** — search and browse across available offerings.
3. **Listing** — results shown as listing cards.
4. **Offering Detail** — full detail for a single offering.
5. **Compare** — user compares multiple offerings by attribute.
6. **Decision Chat** — assistive AI helps the user reach a decision.
7. **Affiliate / Contact** — user is handed off to complete the transaction via affiliate link or direct contact.
8. **Completion** — the decision is complete.

## 6. Core Business Flow

A **Business is a profile managed by a User account**, not a separate login identity. There is no separate business login.

1. A User creates and manages a Business profile from their own account.
2. The Business publishes and manages Offerings.
3. Offerings appear in discovery, listing, detail, and compare for users.
4. Interested users reach the Business through affiliate links or direct contact.

An **Offering** is the universal object for listings, products, services, jobs, credit offers, insurance offers, and similar. All business-published items are Offerings.

## 7. Core Admin Flow

The **admin panel must guide actions, not only show reports.** Admin work is action-oriented.

1. Admin reviews the current state of users, businesses, and offerings.
2. The panel surfaces what needs to be done and guides the admin to do it.
3. Admin acts (moderation, corrections, management tasks).
4. Basic analytics provide visibility into platform activity.

The admin panel is a working surface, not a passive dashboard.

## 8. V1 Domains

V1 launches with three domains only:

1. **Mobility**
2. **Real Estate**
3. **Technology**

Technology must support many product categories through the **Attribute Engine**, not through hardcoded category logic. Adding a new Technology category is a matter of attributes and metadata, not new code paths.

## 9. Technical Principles

These principles are locked for V1:

- **Offering is the universal object.** Listings, products, services, jobs, credit offers, and insurance offers are all Offerings.
- **Business is a profile, not a login.** Businesses are managed by User accounts.
- **Categories are metadata.** Attributes power filters and comparison.
- **Attribute Engine over hardcoded logic.** Technology (and any multi-category domain) is driven by attributes, not per-category code.
- **AI is assistive, not autonomous.** Decision Chat helps; it does not act on its own.
- **The platform is a decision layer.** It does not own inventory, logistics, payment, banking, insurance, or delivery.

## 10. Success Criteria

V1 is successful when:

- The platform is **launched within 30 days**.
- A user can complete the full core flow end to end: Homepage → Discovery → Listing → Offering Detail → Compare → Decision Chat → Affiliate / Contact → Completion.
- The homepage opens with "Bugün ne yapmak istiyorsunuz?"
- All three domains (Mobility, Real Estate, Technology) are live.
- Technology supports multiple product categories through the Attribute Engine.
- A User can create a Business profile and manage Offerings.
- Compare and Decision Chat work as assistive tools within the flow.
- Affiliate links and direct contact hand-offs function.
- The admin panel guides actions, and basic analytics are available.

## 11. Risks

Key risks to the V1 launch:

- **30-day timeline pressure.** Any scope creep threatens the launch date. The excluded list must stay excluded.
- **Attribute Engine complexity.** Technology depends on attributes rather than hardcoded logic; underestimating the Attribute Engine risks the domain.
- **Scope drift into excluded areas.** Requests for payment, credit, insurance, logistics, or agents can pull the platform away from being a decision layer.
- **AI overreach.** Decision Chat must remain assistive; making it autonomous breaks the V1 boundary.
- **Universal Offering model discipline.** Treating some item types as special cases instead of Offerings undermines the core data model.
- **Admin panel as passive dashboard.** If the admin panel only reports instead of guiding actions, it fails its V1 requirement.

## Review Notes (final consistency review)

The following cross-document observations are recorded per the final review. They are flagged, not resolved; no scope, terminology, or decision in this document has been changed.

> **Review Note (Decision Chat ownership):** This document lists "Decision Chat" as an included V1 capability (Section 3) and as a step in the core flow (Sections 5 and 10). Among the approved PRDs, no PRD currently owns Decision Chat: `PRD-0004-decision.md` explicitly excludes the Decision Assistant / assistive AI, and `PRD-0003-identity.md` refers to it as the "Decision Assistance capability." A decision-maker should confirm which PRD owns Decision Chat and reconcile it with `PRD-0004`.

> **Review Note (Categories / Attributes phrasing):** This document states "Categories are metadata" and "Attributes power filters and comparison" (Sections 9 and 12), whereas the approved PRDs and other Foundation documents phrase these as "Categories organize content/Offerings" and "Attributes power discovery, filtering, and comparison." These are compatible; the wording is left unchanged pending a source-of-truth harmonization decision.

> **Review Note (implementation-leaning terms):** Section 8 and Section 9 ("Technical Principles") use the terms "Attribute Engine," "code paths," and "per-category code," which are more concrete than the implementation-neutral convention used across the later Foundation documents and PRDs. As these were part of this document's locked V1 principles, they are left unchanged; a decision-maker may wish to note the difference.

## 12. Final Freeze Statement

**V1 scope is frozen.** V1 launches in 30 days, covering Mobility, Real Estate, and Technology, with the included capabilities listed above and none of the excluded ones. The Offering is the universal object, Business is a profile under a User account, categories are metadata, attributes power filters and comparison, and AI is assistive only. No new features are added, no scope is expanded, and no architecture decisions are made beyond those locked in this document.
