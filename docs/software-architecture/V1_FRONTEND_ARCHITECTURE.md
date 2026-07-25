# V1 Frontend Architecture

- **Owner:** Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-25

**Freeze Note (1.0):** Owner Approved and separately Frozen on 2026-07-25 from the exact Final Review v0.2 candidate; no technical behavior changed.

## 1. Stack and Applications

One Next.js application serves four route groups:

- public experience;
- authenticated account experience;
- Business dashboard;
- Admin dashboard.

React, TypeScript strict mode, server components by default, client components only for interaction, a small accessible component system, generated API types and Playwright are used.

## 2. Route Model

| Group | Representative routes |
|---|---|
| Public | `/`, `/discover`, `/category/[slug]`, `/offering/[id]`, `/compare`, `/decision` |
| Identity | `/login`, `/register`, `/verify`, `/recover`, `/account` |
| Business | `/business`, `/business/[id]`, `/business/[id]/offerings/*` |
| Admin | `/admin`, `/admin/moderation/*`, `/admin/catalog/*`, `/admin/analytics` |

Route authorization improves navigation but never replaces API authorization.

## 3. Rendering and Caching

- public category and Offering presentation pages may use server rendering and bounded revalidation;
- personalized, Business and Admin pages are dynamic and private;
- authorization-sensitive responses use `no-store`;
- mutation success invalidates the narrow affected cache tags;
- public eligibility changes purge affected public and Discovery projections;
- no sensitive response is written to browser-persistent cache.

## 4. State Ownership

| State | Owner |
|---|---|
| URL/query/filter/pagination | URL |
| server data | query cache/server rendering |
| form draft | form component |
| authentication/session | server session plus minimal client snapshot |
| compare selection | Decision client state synchronized with server when required |
| global UI theme/toast | UI provider |

A general global state store is not introduced unless a concrete cross-route need remains after URL and server-state modelling.

## 5. Forms and Attribute Engine

Offering and filter forms render from Attribute Definition metadata. Supported value kinds are number, boolean, single select and multi select. Components share validation metadata with API contracts but the server remains authoritative.

No category-specific React page or form is created for Mobility, Real Estate or Technology unless an approved UX requirement cannot be expressed through metadata.

## 6. Design System Baseline

- semantic tokens for color, spacing, typography and elevation;
- accessible primitives for input, select, dialog, table, tabs, status and alert;
- consistent empty, loading, error, permission-denied and stale-state patterns;
- keyboard-complete critical flows;
- visible focus and reduced-motion support;
- responsive layouts from mobile width upward;
- Turkish-first content architecture with internationalization-ready keys.

## 7. Error and Recovery

The UI maps stable API error codes to actionable states. Correlation IDs are shown on unexpected failures. Optimistic updates are limited to low-risk reversible actions; moderation, publication and authorization changes wait for authoritative server response.

## 8. Frontend Tests

- component tests for metadata-driven fields and state variants;
- accessibility checks for critical pages and primitives;
- contract tests against generated API types;
- Playwright journeys for Home → Discovery → Offering → Compare → Decision → Handoff;
- Business publication and Admin correction/moderation journeys;
- visual regression for the component system and high-risk screens.
