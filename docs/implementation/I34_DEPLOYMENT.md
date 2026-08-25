<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-24
-->

# I34 — Making it deployable

The Owner chose **Vercel with managed Postgres** on 2026-08-24. That decision
covers one of three services, and the other two are the reason this increment
exists.

## Vercel runs functions; two of these are processes

| Service | What it is | Where it can go |
|---|---|---|
| `@commerce/web` | Next.js | Vercel |
| `@commerce/api` | NestJS — a long-running HTTP process | **Not Vercel** |
| `@commerce/worker` | An outbox loop with a sweeper | **Not Vercel** |

So there is a `vercel.json` for the web and **one Dockerfile for the other
two** — one rather than two, because they share every dependency and differ only
in which `main.js` they start. Two images would be the same bytes twice and one
more thing to keep in step. `SERVICE` is a build argument, so the image says
what it is and a host that names the wrong one fails at build rather than at
3am.

**The API's host is still unnamed.** Fly, Railway and a VPS all run this image;
the Owner has not chosen, and nothing here assumes one.

## The environment contract was incomplete in the way that matters

`.env.example` is the only instruction sheet a deployment has. It documented
fourteen variables. **The code reads twenty-three.**

The nine it never mentioned:

`API_TIMEOUT_MS` · `CHAT_API_KEY` · `CHAT_MODEL` · `CHAT_TIMEOUT_MS` ·
`CHAT_TRANSPORT` · `EMAIL_API_KEY` · `EMAIL_SENDER` · `EMAIL_TIMEOUT_MS` ·
`EMAIL_TRANSPORT`

**Two of them stop production from starting.** `EMAIL_TRANSPORT` and
`CHAT_TRANSPORT` default to `development`, and both adapters throw when
`NODE_ENV=production` — deliberately, and I13 and I15 were right to make them.
So a deployment that followed this file *exactly* would have failed at boot with
`EMAIL_TRANSPORT_DEVELOPMENT_IN_PRODUCTION`, naming a variable the file had
never heard of.

The file now documents all twenty-three and marks which a production deployment
must set. `tests/i34-deployment.test.ts` compares it against every `process.env`
read in the repository, **in both directions**, so it cannot drift again.

`WEB_PORT` was documented and read by nothing — Next reads `PORT`. Removed
rather than implemented: a variable that does nothing is worse than an absent
one, because somebody sets it and believes it worked.

## Three modules were missing from the Dockerfile

The manifest-copy list was written from memory and left out `analytics`, `audit`
and `catalog`. `npm ci` would have failed on the first build — after somebody
waited for it.

**A hand-maintained list of the workspaces is a list that goes stale**, so the
same test compares it against the directories on disk. Adding a module without
adding it to the Dockerfile now fails in seconds.

## Migrations run as a release step, not at build and not at boot

- **Not in the Vercel build.** It builds the web, has no reason to hold the
  database's credentials, and runs again on every preview deployment — thirty
  preview branches would each migrate production.
- **Not at API boot.** Two instances starting together would race, and an
  instance that cannot migrate would refuse to serve traffic it could have
  served.
- **A release step**, run once against the target database before the new
  images start. `npm run db:deploy` already exists and is what it calls.

**This is written and has never run.** `prisma migrate deploy` cannot execute in
the local verification environment — `binaries.prisma.sh` answers 403 there,
which is why `db:validate`, `db:deploy` and `db:drift` have been proven in CI
and nowhere else since I14.

## What was proven

`tests/i34-deployment.test.ts`.

| Mutation | Result |
|---|---|
| A variable is dropped from `.env.example` | 1 failed |
| A variable nothing reads is added to it | 1 failed |
| A workspace is removed from the Dockerfile's copy list | 1 failed |
| The Dockerfile runs as root | 1 failed |
| `CMD` loses its `exec` | 1 failed |
| `vercel.json` builds the wrong workspace | 1 failed |

## Verification

Format, lint, module boundaries, type check, **101 test files / 941 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **Nothing here has ever run.** No image has been built, no `vercel.json` has
  been read by Vercel, no migration has been applied to a hosted database. Every
  claim in this increment is about the *content* of files that describe a
  deployment, and a deployment that has not happened is not a deployment.
- **The API's host is unchosen**, so there is no deploy workflow for it. Writing
  one against a platform nobody has picked would be a guess with a YAML file
  around it.
- **`docker build` was not run**, because the sandbox has no Docker daemon. The
  Dockerfile is checked by reading rather than by building, and the manifest
  list — the part most likely to be wrong — is the part now covered by a test.
- **`Dockerfile` uses `npm ci` with the root lockfile**, which installs every
  workspace's dependencies including the web's. It is correct and it is bigger
  than it needs to be; `--omit=dev` and a workspace-scoped install are the
  obvious next reductions and neither is needed to ship.
- **Secrets are named, not managed.** `EMAIL_API_KEY`, `CHAT_API_KEY`,
  `METRICS_TOKEN` and `DATABASE_URL` are environment variables in a file that
  says what they are for. Where they actually live is the host's business and
  the Owner has not chosen a host.
