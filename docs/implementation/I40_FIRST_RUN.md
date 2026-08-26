<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I40 — The first run against an empty database

Everything I35 through I39 built assumed a database with rows in it. **Nobody
had ever pointed the platform at a brand-new one**, so the questions only a
fresh database asks were unanswered: what does the first visitor see, and how
does the first Admin come to exist?

Walked, against 31 migrations and nothing else.

## What was measured

| Step | Result |
|---|---|
| tables and seeded rows | **39 tables, 3 Domains** from a migration, nothing else |
| Home | `200`, *"Şu anda açık bir kategori yok."* |
| Discovery | `307` to Home, having no criteria to work from |
| registration | `202`, writing `outbox_event`, `pending_registration`, `auth_throttle`, `audit_record` |
| the scheduled drain (I38) | `{"batches":2,"delivered":1,"drained":true}` |
| confirmation → grant → sign in | `201` · granted · `201` |
| the Admin panel | **`403 ADMIN_CONTEXT_REQUIRED`** |

Two of these are worth saying out loud.

**I38's scheduled endpoint delivered a real message on a real database.** That
increment was written and proven against fabricated processors; this is the
first time the cron path has drained an outbox that a registration actually
filled.

**The `403` is correct.** UX-0008 §5 keeps Admin behind an explicit entry, and
authorization alone does not imply an entered context. The API says so rather
than letting a granted account walk in — which is the behaviour, not a
bootstrap failure, and the closure record says so because it is exactly the
result somebody would "fix".

## The one thing missing

`scripts/admin.mjs` answers "No account found" for anything unconfirmed, so the
first Admin needs a confirmed account, which needs the emailed link. And the
link cannot be recovered:

> The registration token is minted **here**, at delivery, and only its digest is
> written back. The token therefore exists in memory and in the message, never
> at rest.
> — `apps/worker/src/outbox.processor.ts`

**That is a good decision and this increment does not weaken it.** No amount of
database access produces a confirmation link, by design.

So a fresh deployment could not be bootstrapped without working email — and on
Vercel's Hobby plan, where I38 found a cron runs once a day, that is a wait of
up to twenty-four hours before anybody can become an Admin, before any Category
exists, before anything can be published.

## `npm run first-run`

**It is the worker**, run once by an operator with a dispatcher that prints the
message instead of sending it. Same `OutboxProcessor`, same minting, same digest
written back; the only difference is where the message goes.

It therefore adds no capability. Anyone who can run it already holds
`DATABASE_URL`, and anyone holding that can read and write every row directly.
The gate is that credential and nothing else, which is why it refuses to start
without one rather than connecting to whatever `localhost` happens to be.

It drains to empty rather than one batch: there is no function timeout to
respect here, and an operator wants every pending link rather than the first
twenty. When nothing is waiting it says what to do instead, because the likeliest
way to run it is too early.

`tests/i40-first-run.test.ts` asserts it uses the real processor rather than a
copy — a second place where the token is handled is always the one that gets it
wrong — and that **no fourth serverless entry has appeared beside the three I37
and I38 declared**. Everything this script does would be a serious hole as an
HTTP endpoint, and only its location stops somebody adding one.

## What was proven

Ten cases, seven mutations, each caught.

| Mutation | Result |
|---|---|
| The token is stored instead of only its digest | 1 failed |
| The script reimplements the processor instead of using it | 1 failed |
| It connects to whatever `localhost` happens to be | 1 failed |
| It drains one batch only | 1 failed |
| The timeout check is dropped | 1 failed |
| A fourth serverless entry appears | 1 failed |
| The procedure loses the Admin-context step | 1 failed |

## Verification

Format, lint, module boundaries, type check, **107 test files / 1010 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **The walk stopped at the entered Admin context.** Entering it is a product
  action through the web application, and this increment drove the API rather
  than a browser — so creating the first Category has been proven possible up to
  the point where a person clicks, and not past it.
- **`first-run` has never run against a hosted database.** It ran against local
  PostgreSQL, through the same code path a deployment would use, which is
  evidence about the code and not about Supabase.
- **The bootstrap is documented, not automated.** Five manual steps, and step 1
  requires the web application to be up before the API is known good — which is
  the ordering a first deploy has anyway.
- **Nothing seeds a starting catalogue.** The three Domains arrive with a
  migration; every Category and Attribute is hand-built by the first Admin. A
  seed was not written because what belongs in it is an Owner decision about the
  product, not an engineering one.
- **The empty-state copy was read once, in Turkish, from markup.** It says the
  honest thing; whether it is the *right* honest thing for a marketplace with
  nothing in it is a question for the Owner rather than a measurement.
