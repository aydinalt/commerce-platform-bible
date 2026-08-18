# I18 Connection Budget — Closure Record

- **Owner:** Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-18
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves.

## The arithmetic

Every repository built its own `Pool`:

```ts
private readonly pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

There were **fifteen** of them in the API. `pg` defaults `max` to ten. So one API
instance could open **a hundred and fifty connections** against a PostgreSQL
whose own default `max_connections` is **a hundred**.

Three consequences, in order of how badly they would have bitten:

1. **A second API instance was arithmetically impossible.** Horizontal scaling —
   the ordinary answer to load — would have exhausted the database instead of
   serving it.
2. **One instance could exhaust a default-configured database on its own**,
   given enough concurrency across enough repositories.
3. **The pools could not lend each other anything.** Fourteen sat idle while the
   fifteenth queued, so the system had both too many connections in total and too
   few where they were needed.

The worker had the same shape at smaller scale: two components, two pools, which
never ran at the same time.

## What changed

`createDatabasePool()` in `@commerce/database` is the only place a pool is now
built. The API registers the result as its `Pool` provider and the worker holds
it in `main`. Every repository takes it as a constructor dependency.

`DATABASE_POOL_MAX` exists because the right ceiling is a property of the
deployment: instance count times this must stay under `max_connections`, less the
superuser reserve and whatever the migration job needs. The default is ten — the
same number `pg` would have picked, now meaning what it says.

## Two decisions worth the words

**A factory, not a module-level singleton.** A singleton would have been an
ambient global that nothing declares and no test can substitute — and
`m11-health` proves readiness fails against an unreachable database by handing a
repository a pool it has closed. That case is only possible while the pool is
something a caller passes in. The refactor made that test clearer rather than
harder.

**Shutdown moved to one owner.** Each repository ended its own pool in
`onModuleDestroy`, which was right while each owned one. With a shared pool the
first repository destroyed would have closed it under the other fourteen, so
`DatabaseLifecycle` now closes it once, when the module does.

## A comment that was wrong when it was written

`chat.service.ts` explains why the vendor call was moved out of the transaction,
and said a saturated pool "would have stopped every other request in the process,
including the ones that never go near Chat."

That was false at the time. `PgChatRepository` had its own pool, so a slow
assistant starved Chat and nothing else. The reasoning overstated the blast
radius while missing the real problem, which was the fifteen pools. The comment
now says what was true then and what is true now — and the I12 fix matters *more*
after this increment, not less, because the sentence has finally become correct.

## The test, which was wrong twice

`i18-connection-budget.integration.test.ts` — three cases, asserted against
`pg_stat_activity`. Counting `new Pool(` in the source would prove the code says
ten, not that the process opens ten.

**First attempt: it measured nothing that could fail.** It drove forty concurrent
requests at a single route and asserted the count stayed at or under ten. Under
the mutation that gives one repository its own pool again, it still passed —
because a single route only saturates the pools that route uses. It now drives
three routes served by different repositories, and the same mutation reports
twenty against a ceiling of ten.

**Second attempt: the ceiling assertion could pass against zero.** If
`application_name` stopped reaching the server, or the route stopped touching the
database, the case would have gone on passing while measuring nothing. It asserts
a lower bound first, for that reason.

Both are recorded rather than quietly repaired, because a test that measures
nothing is the specific failure a test like this one is most likely to have.

| Mutation | Failing case |
|---|---|
| One repository builds its own pool again | "holds no more connections than one pool allows" (20 > 10) |
| `createDatabasePool` omits `max` | "builds a pool that carries the stated ceiling" |
| `poolMax` ignores the deployment setting | two cases |

The third case sets `DATABASE_POOL_MAX=7` before building, because `pg` applies
ten on its own — an assertion made against the default would have been satisfied
by a factory that forgot the option entirely.

## One mistake worth naming

The first conversion used `import type { Pool }` in the repositories. TypeScript
erased it, `design:paramtypes` recorded `Object`, and Nest could not resolve the
dependency — sixty-four suites failed to boot at once. Nest's own error names the
cause exactly. Repositories use a value import; the worker, which has no
container, does not need one.

## Verification

`format:check`, `lint`, `boundaries`, `typecheck`, `openapi:generate` (no drift),
`test` (**811 passing, 87 files**), `security:audit` (0 vulnerabilities) and
`build` all pass. `db:validate`, `db:deploy` and `db:drift` remain CI-only.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`.

## Known boundaries

- Ten is a default, not a measurement. Nothing here has been load-tested; the
  number that is right for a real deployment comes from watching one.
- The budget is proven for the API. The worker's single pool is asserted only by
  construction — it has no equivalent `pg_stat_activity` case, because it has no
  HTTP surface to drive.
- Sixty-seven test files still build a pool each. That is correct for a test
  harness and is why the suite holds far more connections than any one process
  would; it is not what this increment is about.
- ~~Nothing bounds how long one request may hold a connection. The I12 fix
  removed the worst offender — a vendor call inside a transaction — but no
  timeout enforces the general rule.~~ **Closed in I19**, which supplies the
  timeout definition Engineering Constitution §13 requires: five seconds per
  statement, ten for an idle transaction, two to acquire a connection. Retry is
  still undefined and is recorded there.
