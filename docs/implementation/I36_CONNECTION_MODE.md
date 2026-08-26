<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I36 — Reaching Supabase through its pooler

The Owner chose **Vercel and Supabase** on 2026-08-26, and chose the staged
route: ship on Vercel first, move the API to a process host later if the
measurements demand it.

Supabase answers the database question. It also introduces one that every test
in this repository was structurally blind to.

## A transaction pooler refuses the parameter the timeouts travel on

Since I18, `statement_timeout` and `idle_in_transaction_session_timeout` have
been carried on `pg`'s `options` startup parameter, and the reason was written
down at the time:

> Set on the connection rather than per query, so a statement cannot escape it
> by being written somewhere nobody thought to look.

That reasoning holds while the only thing between the process and PostgreSQL is
a socket. Supabase puts Supavisor in between. **Supavisor and PgBouncer in
transaction mode reject `options` as an unsupported startup parameter** unless
the pooler's own `ignore_startup_parameters` lists it — and on a managed pooler
that configuration is not ours to edit.

Supabase exposes both:

| Port | What it is | `options` |
|---|---|---|
| 5432 | direct / session mode | accepted |
| 6543 | Supavisor, transaction mode | **refused** |

**The code cannot tell which one it is talking to.** Same host, same database
name, same credentials; only the port differs. So the mode is stated rather than
guessed, in `DATABASE_CONNECTION_MODE`.

An unrecognised value takes `direct` and therefore sends `options`. That is the
right way round: a typo fails the connection while somebody is deploying, rather
than quietly stripping the timeouts and looking healthy.

## The timeouts are now checked rather than assumed

Omitting `options` does not mean going without the timeouts — it means they come
from the database role instead, set once with `alter role`. But a deployment
that forgets that step gets a working connection, correct query results, and **no
statement timeout at all**, which is a slow outage waiting for its first hung
query. Ten connections is the whole pool.

So both entrypoints now ask the server what the settings actually are, and
refuse to start when they are not the configured values:

```
DATABASE_TIMEOUTS_UNVERIFIED: statement_timeout is 999ms on the server, not 5000ms
```

The check does not care *how* the setting arrived. In `direct` mode it proves
`options` landed; in `transaction` mode it proves the `alter role` was run. One
check covers both, because **what matters is the value in force, not the route it
took**.

`pg_settings` rather than `show`, because it reports the unit alongside the
value — `show statement_timeout` answers `5s` or `5000ms` depending on the
number, so comparing against it is comparing against PostgreSQL's formatting
preferences.

It is wired at the two entrypoints rather than inside `createDatabasePool`, so
that building a pool stays synchronous: `m11-health` proves readiness fails by
handing a repository a pool it has closed, which is only possible while the pool
is a plain value a test can substitute. The cost is that a third entrypoint
could forget, and a case exists to notice.

## `.env.example` carries the step most likely to be skipped

I34 established that `.env.example` is the only instruction sheet a deployment
has. This adds the `alter role` statements to it, because setting
`DATABASE_CONNECTION_MODE=transaction` without them produces an API that refuses
to boot — and an operator who does not know the statements exist cannot fix that
without reading the source.

## The mutation that survived

Deleting `await verifyDatabaseTimeouts(pool)` from the worker **left the suite
green.**

The case asserted the entrypoint source contained `"verifyDatabaseTimeouts"`,
and the import line still did. **A check on a name is satisfied by importing the
name and never calling it.** It now matches the call, and import statements are
stripped before the search so that stays true.

This is the fifth check in this repository to match something other than what it
meant — four matched their own explanatory comments, and this one matched an
import.

## What was proven

`tests/i36-connection-mode.test.ts`, eleven cases, five of them against a real
PostgreSQL server rather than against the code that configures it.

| Mutation | Result |
|---|---|
| `options` is sent regardless of mode | 1 failed |
| An unknown mode means `transaction` | 3 failed |
| The verification trusts the configuration instead of asking | 3 failed |
| Only `statement_timeout` is checked | 1 failed |
| The API verifies after it listens | 1 failed |
| The worker skips the check | 1 failed |
| The check is imported but never called | 1 failed |
| `.env.example` loses the `alter role` instruction | 1 failed |

## Verification

Format, lint, module boundaries, type check, **103 test files / 962 tests**, no
OpenAPI drift, 0 vulnerabilities, production build, and **13/13 smoke checks
against two running processes** — which is what proves the new boot check does
not break the process path it was added to.

## Known boundaries

- **No Supabase instance has been touched.** Every claim about port 6543 comes
  from Supavisor's and PgBouncer's documented behaviour, not from a connection
  this repository has made. What *is* proven locally is the thing that follows
  from it: the application refuses to run with timeouts it has not confirmed.
- **`transaction` mode has never been exercised end to end.** The suite proves
  `options` is omitted in that mode; it does not prove the application behaves
  correctly against a real pooler, because there is no pooler here.
- **The pool size is unchanged.** `DATABASE_POOL_MAX` still defaults to 10 per
  process, which is right for a process host and wrong for serverless functions,
  where each instance gets its own pool and instances multiply. That belongs
  with the serverless entrypoint rather than here.
- **The API still has no serverless entrypoint** and the worker is still a
  2-second poll loop. Neither runs on Vercel yet; this increment is the database
  edge only.
- **`verifyDatabaseTimeouts` opens its own connection in the API**, because it
  runs before the Nest container exists. One connection for one query, closed
  immediately — cheaper than reaching into the module graph from outside it.
