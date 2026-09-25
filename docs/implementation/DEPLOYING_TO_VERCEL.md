<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.1
Last Updated: 2026-09-25
-->

# Deploying to Vercel and Supabase

The Owner chose **Vercel and Supabase** on 2026-08-26, staged: ship on Vercel
first, move the API to a process host if the measurements demand it.

~~**Nothing below has been executed.** No Vercel project exists, no Supabase
instance has been created, and no deployment has happened.~~ **No longer true
as of 2026-09-25.** A Supabase project exists and is the production database,
and a `commerce-web` project exists whose build has run on Vercel — failing at
`bbaba04` because no workspace package had been compiled, fixed in `15d396c`;
the API and worker builds were fixed before their first run, in `387e41e`. The
API and worker projects and the migration step below have not been confirmed
yet. This is still the procedure as the repository is built to support it, and
the first person to run it should expect to correct it — which is what the
corrections in this revision are.

## Three Vercel projects, one repository

Vercel serves a project's root `api/` directory as functions itself, and a
Next.js project already owns its own routing. The two conflict, and the
documented answer is **two projects** — which a monorepo supports, each with its
Root Directory pointing at a workspace.

| Project | Root Directory      | Config                    | Serves                                                        |
| ------- | ------------------- | ------------------------- | ------------------------------------------------------------- |
| web     | _(repository root)_ | `vercel.json`             | the Next.js application                                       |
| api     | `apps/api`          | `apps/api/vercel.json`    | `apps/api/api/index.js`                                       |
| worker  | `apps/worker`       | `apps/worker/vercel.json` | `api/outbox.js`, `api/sweep.js`, `api/feeds.js` on a schedule |

All three need **Include source files outside of the Root Directory** enabled, because
`npm ci` reads the root lockfile and every workspace manifest.

**The worker's frequency is a plan decision, not a code one.** ~~Vercel's Hobby
plan runs a cron **once per day**; Pro runs it every minute. `vercel.json` asks
for every minute, which Hobby will silently reduce — and a registration
confirmation that arrives up to 24 hours later is not a working sign-up. The
worker needs the Pro plan or a process host.~~

**Corrected 2026-09-25: Hobby does not reduce a frequent schedule, it refuses
the deployment.** Vercel's cron limits page, read that day: "Cron expressions
that would run more frequently will fail during deployment", with the error
_"Hobby accounts are limited to daily cron jobs. This cron expression would run
more than once per day."_ Precision is per-hour as well: `0 1 * * *` runs
anywhere between 01:00 and 01:59. **Under the old `vercel.json` the worker
project could not have been deployed at all** — which is a different failure
from a slow one, and the one this paragraph had promised would not happen.

**The Owner chose Hobby on 2026-09-25 and ruled out paid upgrades.** So
`apps/worker/vercel.json` asks for each job once a day, staggered (UTC): sweep
`0 2 * * *`, feeds `0 3 * * *`, outbox `0 4 * * *`.
`tests/i38-scheduled-worker.test.ts` holds every entry to a fixed minute and a
fixed hour, so a frequent schedule cannot return without a red test before it
becomes a failed deployment.

**Those three are a floor, not the platform's cadence.** The outbox carries
registration confirmations and password recovery; drained once a day, a new
account waits up to about twenty-five hours for its link, and that is not a
working sign-up. The cadences the platform needs have not changed — outbox every
minute, sweep every five, feeds hourly — and on Hobby they have to come from a
scheduler outside Vercel calling the same three endpoints with
`Authorization: Bearer $CRON_SECRET`. The endpoints already accept any caller
holding the secret; nothing in the worker has to change for that. **Which
scheduler is an open decision** — see Known gaps.

`CRON_BUDGET_MS`'s default of 45 000 ms fits the plan: with Fluid compute, on
by default, a Hobby function's default and maximum duration are both 300 s.

## Supabase

1. Create the project. Note **both** connection strings: port `5432` is direct,
   port `6543` is the Supavisor pooler in transaction mode.
2. Apply the migrations once, from a machine holding the **direct** string:
   ```
   DATABASE_URL='…:5432/postgres' npm run db:deploy
   ```
   Migrations are a release step, not a build step and not a boot step (I34).
3. **Set the timeouts on the role**, because the pooler refuses the `options`
   startup parameter that otherwise carries them (I36):
   ```sql
   alter role authenticator set statement_timeout = '5s';
   alter role authenticator set idle_in_transaction_session_timeout = '10s';
   ```
   Use whichever role the connection string authenticates as. Both the API and
   the worker ask the server what these are at boot and **refuse to start** if
   they are not the configured values, so a forgotten step here is a failed
   deploy with a message naming the setting.

## Environment variables

`.env.example` is the complete list and marks with `# R` what production must
set. For a Vercel deployment against Supabase, the ones that are not obvious:

| Variable                   | Value                             | Why                                                                                                                                                                                                                                                                                      |
| -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | the **6543** pooled string        | Functions multiply; the pooler is what makes that survivable                                                                                                                                                                                                                             |
| `DATABASE_CONNECTION_MODE` | `transaction`                     | Stops `options` being sent, which the pooler refuses                                                                                                                                                                                                                                     |
| `DATABASE_POOL_MAX`        | `1`                               | **Each function instance holds its own pool.** The default of 10 is right for a process host and multiplies into the pooler's limit here                                                                                                                                                 |
| `API_BASE_URL`             | the api project's URL + `/api/v1` | Set on the **web** project; the browser never calls the API directly                                                                                                                                                                                                                     |
| `ALLOWED_ORIGINS`          | the web project's URL             | Set on the **api** project. Every session is refused from anywhere else                                                                                                                                                                                                                  |
| `PUBLIC_WEB_URL`           | the web project's URL             | Where emailed registration and recovery links point                                                                                                                                                                                                                                      |
| `NODE_ENV`                 | `production`                      | Turns on the refusals, including the two transport ones below                                                                                                                                                                                                                            |
| `EMAIL_TRANSPORT`          | `postmark`                        | `development` **refuses to construct** under `NODE_ENV=production`                                                                                                                                                                                                                       |
| `CHAT_TRANSPORT`           | `anthropic`                       | Same                                                                                                                                                                                                                                                                                     |
| `TRUSTED_PROXY_HOPS`       | `1`                               | Set on the **api** project. How far `x-forwarded-for` may be believed. Left at `0` the throttle counts the proxy and puts every caller in one bucket; set to trust the whole chain it counts a value the caller wrote. **Verify the number against a real request before relying on it** |

Preview deployments get the same variables unless overridden, which means **a
preview branch will write to production data**. Point previews at a separate
Supabase project or accept that.

**Decided 2026-09-25: previews do not reach the production database.** In each
of the three projects, scope `DATABASE_URL` — and every other secret — to the
**Production** environment only. A preview that has no `DATABASE_URL` fails to
start rather than writing anywhere, which is the safe way for it to fail. If
previews need a working database, that is a **separate Supabase Free project**:
the Free plan allows two active free projects, and paused ones do not count
towards that. Never the production project, and never a paid plan or branching.

## The first Admin

**A fresh deployment is unusable until an Admin exists**, and the steps are not
guessable. Measured against a database holding nothing but the migrations (I40).

1. **Register through the real sign-up screen.** There is no other way in;
   `admin.mjs` answers "No account found" for anything unconfirmed.
2. **Get the confirmation link.**
   ```
   DATABASE_URL='…' PUBLIC_WEB_URL='https://<web>' npm run first-run
   ```
   The link cannot be looked up. `outbox.processor.ts` mints the registration
   token at delivery and stores only its digest, so it exists in memory and in
   the message and never at rest — a good decision, and the reason this step
   exists. `first-run` **is** the worker, run once with a dispatcher that prints
   instead of sends.
3. **Open the link**, then grant:
   ```
   npm run admin:grant -- --email <address> --by <owner>
   ```
4. **Enter the Admin context.** This is a separate act and the one that
   surprises: a granted account that has not entered gets
   `403 ADMIN_CONTEXT_REQUIRED`, which is UX-0008 §5 working rather than a
   failure. Use the explicit entry on the site.
5. **Seed the taxonomy and the field sets** — not by hand:
   ```
   npm run seed:taxonomy     # 11 sectors, 127 headings
   npm run seed:attributes   # their field sets — after the taxonomy, always
   ```
   Nothing can be published until an active leaf Category exists.

> **This step used to read "create the first Categories and Attributes through
> the Admin panel", and it was stale (corrected 2026-09-05).** It predated the
> seed scripts and the eleven-sector migration, and it asked an operator to
> hand-build 127 headings and 404 attribute definitions through a form. It also
> said a fresh database seeds "the three Domains"; a migration has seeded
> **eleven** since `20260901000100_sector_domains`.
>
> The order matters and only fails loudly in one direction: `seed:attributes`
> resolves headings by the stable keys `seed:taxonomy` writes, so running it
> first exits non-zero naming what it could not find. Importing a catalogue
> before either one does **not** fail — it produces listings with no attribute
> values, so filters return nothing and comparison tables are empty. That is the
> expensive mistake, because it looks like success.

Home says _"Şu anda açık bir kategori yok."_ until step 5 is done, which is the
honest empty state rather than a broken page.

6. **Load the catalogue.** See `V1_LAUNCH_RUNBOOK.md` for the CSV columns and
   the dry-run-first working loop:
   ```
   IMPORT_PASSWORD='…' npm run import:catalogue -- businesses.csv offerings.csv --dry-run
   ```

## After the first deploy

Run the smoke checks against the deployed origins rather than trusting the
build to be green:

```
curl -i https://<api>/api/v1/health/ready     # 200, {"status":"ok"}
curl -i https://<api>/metrics                 # 404, not 401
curl -i https://<web>/                        # 200, lang="tr", header, footer
curl -i https://<web>/offerings/nothing-here  # 404, not 200
```

The last one is I35's finding: a page that does not exist answering `200` is the
failure that looks fine in a browser.

## Known gaps this procedure does not cover

- **Outbox delivery moves from ~2 seconds to the cron cadence** — up to 60
  seconds on Pro, and **up to 24 hours on Hobby**, where a cron may run only
  once a day. On Hobby nobody can practically complete a sign-up.
  **Open since 2026-09-25, and the one gap that blocks launch on Hobby:** which
  free scheduler outside Vercel calls `/api/outbox` every minute (and
  `/api/sweep`, `/api/feeds` at their cadences). Without one, the daily floor
  above is all there is and a new account waits up to about twenty-five hours.
- **The drain stops before a batch it could not finish**, so a busy minute
  leaves work queued. `drained: false` in the response is the signal that the
  schedule is not keeping up; nothing watches for it yet.
- **`/metrics` counts in memory.** Each function instance has its own counters
  and they reset when it recycles, so the numbers are per-instance and
  short-lived. I19's design assumed a process.
- ~~There is no rate limiting anywhere in the repository.~~ **That was false when
  written.** `auth_throttle` has counted attempts per hashed subject since I13,
  across registration, recovery and both sign-in scopes, in one atomic statement
  so the count is shared by every instance. The survey that produced this line
  searched for the names of libraries rather than for the behaviour.
- **`TRUSTED_PROXY_HOPS` must be set to `1` on Vercel** (I39). The throttling key
  is `request.ip`, and behind a proxy that is the proxy's address unless the hop
  count is declared — every caller in one bucket, and the platform locking
  itself out after a few dozen attempts globally.
- **The catalogue starts empty**, and is filled by script rather than by hand.
  Migrations seed **eleven** Domains; `seed:taxonomy` writes 11 sector roots and
  127 headings, `seed:attributes` their 404 field definitions, and
  `import:catalogue` the partners and listings. Home says the catalogue is empty
  plainly rather than looking broken — see The first Admin above and
  `V1_LAUNCH_RUNBOOK.md`. (This entry said "three Domains" and "by hand" until
  2026-09-05; both were stale.)
- **No legal pages exist** — no privacy notice, terms, or cookie disclosure, and
  no route to put them on.
- **No backup or restore has been rehearsed**, and the recovery point and
  recovery time are therefore unknown.
