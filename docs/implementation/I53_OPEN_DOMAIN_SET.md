# I53 — The Domain set opened in code

**Status:** Closed
**Governs:** Frozen PRD-0001 v4.0 §E, Business Rule 39; `DOMAIN_SET_OPEN_DECISION.md`

## What this increment did

Frozen PRD-0001 v4.0 says a Domain is a governed record and that _"the set is
open… Mobility, Real Estate and Technology were the first three, not the whole
set"_. The code said the opposite in five places at once, and every one of them
agreed with the others only because nobody had ever added a fourth Domain.

The Owner decision recorded in `DOMAIN_SET_OPEN_DECISION.md` settles which
document governs. This increment carries that decision into the code.

## What was closed, and where

| Place                              | Was                                                            | Is                                        |
| ---------------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| `modules/catalog`                  | `type DomainKey = "MOBILITY" \| "REAL_ESTATE" \| "TECHNOLOGY"` | `type DomainKey = string`                 |
| `packages/contracts`               | `V1_DOMAINS` + `z.enum(V1_DOMAINS)`                            | `domainKeySchema` — shape, not membership |
| `apps/web/src/vocabulary.ts`       | `DOMAINS` name map                                             | deleted                                   |
| `apps/web/src/platform/catalog.ts` | `DOMAIN_LABELS`                                                | deleted                                   |
| `apps/api/src/openapi`             | six inline enums                                               | `DOMAIN_KEY` / `DOMAIN_NAME`, one each    |

**Membership moved to the only place that ever held it.** A schema holds no
records, so it cannot answer whether a key names a Domain that exists; the
database can, and already did. What the contract still refuses is a malformed
key — upper snake case, bounded to the `stable_key` column's 80 characters.

## The name now travels with the key

Deleting the label maps left every screen showing a raw `MOBILITY`. The fix was
not a bigger map but a different source: **`domainName` is carried beside
`domain` through every read that mentions a Domain** — the Category rows, the
assignable list, Browse roots, the Browse and Search views, and the three
Analytics tallies.

Grouping stays on the **stable key**, never the name. Two Domains may share a
name, and a renamed Domain must not split its own history.

## Two errors this increment made and corrected

**An unknown Domain returned 500.** `z.enum` used to refuse it at the contract,
so the write path had never seen one. With the set open, a typo reached the
insert and came back as a generic `Error` — the platform reporting a fault for
something the Admin did. It is now `CategoryDomainUnknownError` → **400
`CATEGORY_DOMAIN_UNKNOWN`**, evaluated _inside_ the insert so a Domain retired
between a lookup and a write cannot slip through.

**`domainKeySchema` carried `.toUpperCase()`.** Written as a courtesy, it made
the regex beneath it decorative: `lower` and `Mixed_Case` both passed a rule
whose only purpose was to refuse them. It was also the only coercion of its
kind — nothing that _reads_ a key passes through this schema — so it applied to
one side of a comparison and not the other. Removed; `.trim()` stays.

## Evidence

`tests/i53-open-domain-set.integration.test.ts` — six cases against a Domain
whose key, slug and name appear in no source file, no contract and no
migration. It is created by SQL in `beforeAll`, because **no endpoint creates a
Domain**: none is specified, and inventing one is not this increment's decision
to make. Domains arrive by migration today. What the suite proves is the half
that is in scope — that a Domain the code has never heard of works everywhere
once it exists.

1. A root Category is accepted under it (201), carrying key _and_ name back.
2. An unknown Domain is refused 400 `CATEGORY_DOMAIN_UNKNOWN`, not 500.
3. `GET /admin/categories` offers it in `domains`, so the create-root form has
   no list of its own.
4. `GET /discovery/browse` groups its roots under its own name.
5. A Search narrowed into its leaf reports both key and name.
6. Admin Analytics tallies it by name rather than by identifier.

**Mutation results — 6 of 6 killed:**

| Mutant                                                        | Killed by            |
| ------------------------------------------------------------- | -------------------- |
| `domainName: narrowedTo?.domainName ?? null` → always `null`  | I53 §5               |
| `CategoryDomainUnknownError` → generic `Error`                | I53 §2               |
| `domainKeySchema` regex removed                               | I2 Domain key        |
| `domains()` removed from the catalogue read                   | I53 §3               |
| Browse group name ← key instead of record                     | I53 §4               |
| Analytics cell ← `entry.domain` instead of `entry.domainName` | I8 dashboard         |
| `DOMAIN_LABELS` reintroduced in `apps/web`                    | I27 Admin vocabulary |

## Tests rewritten, and why each one had to be

Seven assertions were true only of a closed set. None was rewritten to keep it
passing; each was replaced by the claim it was actually trying to make.

- **I2** — two closed-set assertions became three `domainKeySchema` _shape_
  assertions. `HAS SPACE`, `Mixed_Case` and a leading digit are still refused.
- **I8 catalog** — `expect(DOMAINS).toHaveLength(3)` was arguing that a child
  cannot name its own Domain by fixing the whole set. It now asserts
  inheritance directly: the child carries the parent's _name_ as well as its
  key, and neither arrived from a request that named no Domain at all.
- **I9 identity** — reads the active Domains from the database instead of
  mapping a constant.
- **I27** — the vocabulary case was asserting Admin's Domain labels came from
  the shared vocabulary. Inverted: the vocabulary still owns the **concept**
  (`TERMS.domain`), and no file in `apps/web` may own the **members**. A
  reintroduced map fails, whatever it is called.
- **I3 / I4 / I42** — fixtures and the published `Categories` schema gained
  `domainName` and `domains`.
- **I2 category management** — `seeds exactly the three V1 Domains` asserted the
  whole set with `toEqual`. **I missed it in the sweep, and I53 found it by
  failing**: creating a fourth Domain broke an assertion in a file I53 never
  touched. The case now asserts what the migration actually did — those three
  are present — rather than that they are alone.

**I53's cleanup retires its Domain rather than deleting it.** A Discovery Start
references the Domain it began in and `discovery_start_domain_id_fkey` is
`RESTRICT`, deliberately: deleting a Domain would take a Discovery path's own
history with it. The suite records Starts, so it does what an Admin would do and
marks the Domain inactive.

## What is still open

**No administrative path creates a Domain.** No endpoint, service method,
contract or Admin surface exists; `20260810000200_category_management` seeds
three and its comment — _"no Story gives anyone authority to invent a fourth V1
Domain"_ — is superseded by PRD-0001 v4.0 §E. The migration is left as written
because its checksum is part of the applied history; this record is where the
correction lives. Creating a Domain from the Admin panel is a separate
increment and needs its own Story.
