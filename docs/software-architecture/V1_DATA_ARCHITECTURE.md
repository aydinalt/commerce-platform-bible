# V1 Data Architecture

- **Owner:** Architecture Owner
- **Status:** Draft
- **Version:** 0.1
- **Last Updated:** 2026-07-25

## 1. Persistence Strategy

PostgreSQL is the only authoritative transactional datastore in V1. Schema ownership follows backend module boundaries. Search and analytics projections are derived and rebuildable.

## 2. Logical Data Model

| Module | Principal records |
|---|---|
| Identity | `user_account`, `identity_credential`, `session`, `email_verification`, `password_recovery` |
| Business | `business`, `business_owner`, `business_contact`, `business_moderation_state` |
| Catalog | `domain`, `category`, `attribute_definition`, `attribute_option`, `category_attribute` |
| Offering | `offering`, `offering_attribute_value`, `offering_publication`, `affiliate_destination` |
| Discovery | `offering_search_projection` |
| Decision | `comparison_set`, `comparison_item`, `decision_context`, `decision_chat_session`, `decision_chat_message`, `decision_completion` |
| Moderation | `moderation_case`, `moderation_action`, `correction_request` |
| Analytics | `activity_fact`, `metric_rollup` |
| Audit/Jobs | `audit_record`, `outbox_event`, `job_attempt` |

Names are logical; physical naming may change during schema review without changing ownership.

## 3. Universal Offering and Attributes

- `offering` contains universal fields and lifecycle state.
- Category-specific values are stored through typed attribute-value rows, not per-category tables.
- Exactly one typed value representation is valid for each Attribute Definition value kind.
- Attribute options use stable identifiers; display labels may change.
- publication eligibility is computed from authoritative Offering, Business and Affiliate Destination inputs.
- a denormalized public projection contains only publicly exposeable fields.

## 4. Search Projection

`offering_search_projection` contains:

- Offering identity and presentation minimum;
- active Domain/Category ancestry;
- approved searchable text;
- normalized filter values;
- authoritative publication timestamp;
- public eligibility version.

PostgreSQL full-text search and trigram indexes support V1 query matching. GIN/B-tree indexes support filter combinations and ordering. Projection changes are transactional where cheap and outbox-driven where denormalization crosses module boundaries.

## 5. Integrity

- UUID primary keys;
- foreign keys within the database;
- unique constraints for ownership and stable slugs where applicable;
- check constraints for typed values and state invariants;
- partial indexes for active/public records;
- optimistic concurrency version on governed mutable aggregates;
- soft retirement only where history or references require it; not a universal delete policy.

## 6. Privacy Classification

| Class | Examples | Rule |
|---|---|---|
| Public | eligible Offering presentation, public Business identity | may enter public projection |
| Internal | moderation state, analytics aggregates | authorized staff only |
| Personal | email, account and contact data | minimized, access logged where material |
| Secret | password hashes, provider credentials, reset tokens | encrypted/hashed, never logged |
| AI-context | current Offering/compare context and chat text | minimized, purpose-bound, retention-defined |

## 7. Migration Rules

- every schema change is versioned;
- expand/migrate/contract is used for incompatible production changes;
- destructive migrations require backup, impact evidence and rollback/forward-fix plan;
- migrations run once per release through a controlled job, not concurrently in every application instance;
- seed data is deterministic and excludes production credentials or personal data.

## 8. Retention and Deletion

Exact retention periods require legal/product approval before production. The implementation must support account-data export/deletion handling, expired-token cleanup, bounded chat retention, audit retention, and deletion/anonymization without corrupting financial or security evidence that must lawfully remain.

## 9. Backup and Recovery

- managed encrypted daily backup at minimum;
- point-in-time recovery when supported by the production tier;
- quarterly restore rehearsal after launch, with one successful rehearsal before first production release;
- object-storage versioning or equivalent recovery for uploaded media;
- RPO/RTO values explicitly accepted before production gate.

