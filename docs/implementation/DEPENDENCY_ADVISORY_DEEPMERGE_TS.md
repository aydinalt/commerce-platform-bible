# `deepmerge-ts` Advisory — Response Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-17
- **Scope:** One dependency override. No product behaviour, no Story, no
  Acceptance Criterion and no Delivery Status is affected.

## What happened

`npm run security:audit` passed at 14:5x today during the I12 verification run
and failed on the next run, an hour or so later, on the same dependency tree.
Nothing in the repository changed between the two.

```
deepmerge-ts  <8.0.0   Severity: high
DeepmergeTS has stack exhaustion when merging recursive object graphs
  node_modules/deepmerge-ts
  @prisma/config  →  prisma
3 high severity vulnerabilities
```

`npm audit` asks the registry, so a newly published advisory fails a build that
passed on identical inputs. **This would have failed CI on the previous commit
too**, and it is not a consequence of any change in this repository.

## Why the obvious fixes were not taken

`npm audit fix --force` proposes `prisma@6.12.0` — a **downgrade** across a major
version, from the 7.x line the repository is built on, to make an advisory go
away. That trades a theoretical stack-exhaustion bug for a real migration.

Upgrading is not available: `prisma@7.9.1` is the newest release on the `latest`
tag, and it still depends on `deepmerge-ts@7.1.5`. There is no fixed 7.x.

## What was done

An override pinning `deepmerge-ts` to `^8.0.0`, which is what the repository
already does for six other transitive pins — `nanoid`, `js-yaml`,
`find-my-way`, `postcss`, `sharp` and `valibot`. Resolution moves from 7.1.5 to
8.0.1 and the audit reports zero.

## What was verified, and what could not be

| | |
|---|---|
| The override resolves | `npm ls` reports `deepmerge-ts@8.0.1 overridden`; `npm audit --audit-level=high` finds nothing |
| `@prisma/config` still loads | The Prisma CLI prints `Loaded Prisma config from prisma.config.ts.` under the override. That load is the only thing `@prisma/config` uses `deepmerge-ts` for — three references in its bundle, all in the config merge |
| Nothing else depends on it | `deepmerge-ts` appears once in the tree, under `@prisma/config` |
| The suite | 82 files, 776 tests, plus format, lint, boundaries, typecheck, OpenAPI and build |

**`db:validate`, `db:deploy` and `db:drift` could not be exercised.** The
sandbox cannot reach `binaries.prisma.sh`, which answers 403, so the schema
engine never downloads. This was checked rather than assumed: the same three
commands fail identically on the tree **without** the override, with the same
403 and the same message, and in both cases the config line prints first. The
engine is a downloaded binary and does not involve `deepmerge-ts` at all.

CI runs all three with network access, so they are covered there — but they are
covered by CI rather than by me, and that is the honest description.

## Why this is in the same commit as a traceability document

It is not related to it. They are together because the audit gate is part of
`npm run verify`, so **no commit can be green until this one lands**, and
holding it back to keep the commit single-purpose would have meant knowingly
handing over a red build.

## What the Owner may want to revisit

- The override is a pin against a transitive dependency of a tool, not a
  dependency the product imports. When Prisma ships a release depending on
  `deepmerge-ts@8`, the override becomes redundant and should be removed rather
  than left to rot.
- The exposure was low in practice: `@prisma/config` merges this repository's own
  `prisma.config.ts` at CLI time. The input is not attacker-controlled, so the
  stack-exhaustion path is not reachable from anything a person can send. The
  override was taken because the gate is set at `high` and should stay there —
  not because the risk was material.
