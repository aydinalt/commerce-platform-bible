<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# Deploying to Vercel and Supabase

The Owner chose **Vercel and Supabase** on 2026-08-26, staged: ship on Vercel
first, move the API to a process host if the measurements demand it.

**Nothing below has been executed.** No Vercel project exists, no Supabase
instance has been created, and no deployment has happened. This is the procedure
as the repository is built to support it, and the first person to run it should
expect to correct it.

## Three Vercel projects, one repository

Vercel serves a project's root `api/` directory as functions itself, and a
Next.js project already owns its own routing. The two conflict, and the
documented answer is **two projects** — which a monorepo supports, each with its
Root Directory pointing at a workspace.

| Project | Root Directory | Config | Serves |
|---|---|---|---|
| web | *(repository root)* | `vercel.json` | the Next.js application |
| api | `apps/api` | `apps/api/vercel.json` | `apps/api/api/index.js` |
| worker | `apps/worker` | `apps/worker/vercel.json` | `api/outbox.js`, `api/sweep.js` on a schedule |

All three need **Include source files outside of the Root Directory** enabled, because
`npm ci` reads the root lockfile and every workspace manifest.

**The worker's frequency is a plan decision, not a code one.** Vercel's Hobby
plan runs a cron **once per day**; Pro runs it every minute. `vercel.json` asks
for every minute, which Hobby will silently reduce — and a registration
confirmation that arrives up to 24 hours later is not a working sign-up. The
worker needs the Pro plan or a process host.

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

| Variable | Value | Why |
|---|---|---|
| `DATABASE_URL` | the **6543** pooled string | Functions multiply; the pooler is what makes that survivable |
| `DATABASE_CONNECTION_MODE` | `transaction` | Stops `options` being sent, which the pooler refuses |
| `DATABASE_POOL_MAX` | `1` | **Each function instance holds its own pool.** The default of 10 is right for a process host and multiplies into the pooler's limit here |
| `API_BASE_URL` | the api project's URL + `/api/v1` | Set on the **web** project; the browser never calls the API directly |
| `ALLOWED_ORIGINS` | the web project's URL | Set on the **api** project. Every session is refused from anywhere else |
| `PUBLIC_WEB_URL` | the web project's URL | Where emailed registration and recovery links point |
| `NODE_ENV` | `production` | Turns on the refusals, including the two transport ones below |
| `EMAIL_TRANSPORT` | `postmark` | `development` **refuses to construct** under `NODE_ENV=production` |
| `CHAT_TRANSPORT` | `anthropic` | Same |

Preview deployments get the same variables unless overridden, which means **a
preview branch will write to production data**. Point previews at a separate
Supabase project or accept that.

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
- **The drain stops before a batch it could not finish**, so a busy minute
  leaves work queued. `drained: false` in the response is the signal that the
  schedule is not keeping up; nothing watches for it yet.
- **`/metrics` counts in memory.** Each function instance has its own counters
  and they reset when it recycles, so the numbers are per-instance and
  short-lived. I19's design assumed a process.
- **There is no rate limiting anywhere in the repository.** Registration, login
  and recovery are unthrottled.
- **The database is empty.** There is no seed, so a fresh deployment has zero
  Categories and zero Attributes; the catalogue has to be built through the
  Admin panel before anything can be published.
- **No legal pages exist** — no privacy notice, terms, or cookie disclosure, and
  no route to put them on.
- **No backup or restore has been rehearsed**, and the recovery point and
  recovery time are therefore unknown.
