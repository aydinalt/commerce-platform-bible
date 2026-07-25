# ADR-0011 — Persistence, Projection and Search Architecture

- **Owner:** Product Owner / Architecture Owner
- **Status:** Proposed
- **Version:** 0.1
- **Date:** 2026-07-25
- **Deciders:** Product Owner / Architecture Owner
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `V1_DATA_ARCHITECTURE.md`, `V1_BACKEND_ARCHITECTURE.md`, `V1_SOFTWARE_ARCHITECTURE.md`

> **Proposal note.** This candidate is non-authoritative until explicitly accepted by the Product Owner / Architecture Owner.

---

## 1. Context

V1 needs transactional integrity, metadata-driven Offering attributes, rebuildable public projections, filtering and search. Introducing separate authoritative databases, a search cluster or a message broker before measured need would increase cost and failure modes.

## 2. Decision

Use PostgreSQL as the only authoritative transactional datastore for V1.

Schema and repository ownership follow the backend modules defined by ADR-0010. Modules may read published contracts or projections but must not directly write another module's records.

Store Universal Offering fields in the Offering aggregate and category-specific values through typed Attribute Definition/value records. Do not create category-specific Offering tables for Mobility, Real Estate or Technology.

Use PostgreSQL-backed derived projections for Discovery and approved analytics reads. V1 query matching uses PostgreSQL full-text search and trigram support with appropriate GIN, B-tree and partial indexes.

Record cross-boundary post-commit work in a transactional outbox written in the same database transaction as the authoritative state change. A worker processes outbox work idempotently. Derived projections must be rebuildable from authoritative data and recorded events.

Redis, a dedicated queue and a dedicated search engine are deferred until measured latency, throughput, availability or operational evidence justifies a new decision.

## 3. Consequences

- Transactions and operational recovery remain simple in V1.
- Search freshness and public eligibility can be reasoned about from one system of record.
- Projection lag must be observable and recoverable.
- PostgreSQL capacity and query plans must be tested with representative data.
- A future dedicated search engine or queue requires migration planning and a new ADR.
- The typed Attribute Engine needs database constraints and application validation to prevent invalid mixed value representations.

## 4. Alternatives Considered

- **Dedicated search engine from day one:** rejected because V1 scale does not yet justify another stateful system.
- **Redis-backed job queue as mandatory infrastructure:** rejected because the transactional outbox meets initial durability needs with fewer moving parts.
- **Category-specific tables:** rejected because they contradict Universal Offering and metadata-driven category behavior.
- **Event streaming platform:** rejected because V1 has no demonstrated streaming requirement.

## 5. Related PRDs

PRD-0001, PRD-0002, PRD-0004 and PRD-0006.

## 6. Related ADRs

ADR-0002, ADR-0003, ADR-0004, ADR-0006, ADR-0007, ADR-0008 and proposed ADR-0010.

## 7. Notes

The ORM and migration tool may be selected during implementation if it preserves constraints, transactions, migration safety and module ownership.

