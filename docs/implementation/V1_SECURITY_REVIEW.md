# V1 pre-launch security review

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.3
- **Date:** 2026-09-06
- **Scope:** what a reader can check in this repository before the first real
  catalogue goes live. It is not a penetration test and does not claim to be
  one: nobody has attacked the deployed system, and this document says what the
  code does rather than what an attacker could not do.

---

## 1. What is already enforced, and where

Each of these is a mechanism in the code with a test behind it, not an
intention. The point of listing them is that a launch checklist should be
readable by somebody who was not here when they were built.

| Area                                | Where it lives                                            | What it does                                                                                                                                                                              |
| ----------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session cookie                      | `apps/api/src/identity/session.cookie.ts`                 | `httpOnly`, `sameSite: strict`, and `secure` in production. A session token is never readable by script and never travels cross-site.                                                     |
| Response headers                    | `apps/api/src/bootstrap.ts` (`@fastify/helmet`)           | The standard header set, applied to every response.                                                                                                                                       |
| Origin checking                     | `apps/api/src/security/origin.guard.ts`                   | Every state-changing Admin and Business route asserts an acceptable `Origin` before it acts.                                                                                              |
| Authorization                       | `apps/api/src/security/principal-resolver.ts`             | One resolver per tier, and the audit routes deliberately name a **different** one (`resolveSuperAdmin`) so that a later Sub-Admin tier cannot inherit the log that watches Admins.        |
| Registration and sign-in throttling | `auth_throttle`, exercised by every integration suite     | Repeated attempts against one address are refused rather than answered.                                                                                                                   |
| Personal data on Admin surfaces     | `pg-moderation.repository.ts`, `moderation.controller.ts` | Queues and lists carry ids, never email addresses. An address is fetched **only** by an explicit act on one case, and that act writes an audit row before the address reaches the screen. |
| Audit trail                         | migration `20260905000100`, `20260905000200`              | Append-only, enforced by triggers on `UPDATE`, `DELETE` **and** `TRUNCATE`. Since `I87` it covers moderation, case opening, PII reveals and the four affiliate-destination acts.          |
| Money                               | `MONEY_AMOUNT` in `packages/contracts`                    | A decimal string end to end; nothing rounds a price on the way through a float.                                                                                                           |
| Image ingest                        | `packages/feed/src/images.ts`                             | Refuses anything but the five raster formats, judged on the file's own bytes; refuses SVG outright, because an SVG is a document with scripting.                                          |
| Secrets                             | `.env`, deployment configuration                          | `IMPORT_PASSWORD` is a deployment secret and, by the Owner's decision of 2026-09-05, is never given to a partner. No credential is committed.                                             |

## 2. What the dependency audit says, and what it means here

`npm run security:audit` runs `npm audit --audit-level=high`. **It currently
exits non-zero**, which means `npm run verify` is red on that step. It was red
before this review as well; recording it is the point.

### 2.1 `fast-uri` — high

Advisories `GHSA-5jgf-p345-68v8`, `GHSA-f65p-4m7j-42xc`, `GHSA-fph4-wmhf-6fwf`,
`GHSA-jqff-g426-hqxp`: host confusion and SSRF through malformed URI parsing.

- **Partly fixed here.** An override pins `fast-uri@^3.1.7` and the copy Fastify
  actually validates with is now patched.
- **Two nested copies resist it**: `fast-json-stringify`'s own `4.1.2` and the
  `ajv` beneath it at `3.1.5`. npm records the override and installs the old
  version anyway. Forcing them needs a `fastify` / `@nestjs/platform-fastify`
  major, which npm marks as breaking and which is not a thing to do in the week
  of a launch.
- **The reading of the exposure, offered as a reading and not as a
  reassurance:** `fast-uri` is reached through JSON-schema URI handling —
  `$ref` resolution and `format: "uri"` validation. This platform validates
  every request body with **Zod**, not with ajv, so no user-supplied string is
  known to reach these parsers; what they process is the application's own
  schema documents at startup. That is an argument for it not being exploitable
  _here_, not a proof, and it should be re-checked when the upstream release
  lands.

### 2.2 `mysql2` — high, through `prisma`

`prisma` is a **devDependency** and a build-time tool: this platform's every
runtime read and write is hand-written SQL over `pg`. `mysql2` is a driver
Prisma ships for a database this project does not use, and nothing loads it.
The offered fix downgrades Prisma to `6.19.3`, which npm marks breaking.

### 2.3 What to do about the red gate — **decided: option 1**

> **Owner decision, 2026-09-07:** _"Kapıyı `critical` seviyesine indirip
> (Seçenek C) kendimizi kandırmıyoruz; Seçenek A'da kalarak Zod bariyerlerimize
> güveniyor ve üst akış (upstream) kütüphane güncellemelerini bekliyoruz. Bu
> kırmızı uyarı teknik borç listemizde bilinçli bir 'kabul edilmiş risk' olarak
> kalacak."_

**The gate stays at `--audit-level=high` and stays red.** It is an accepted
risk, recorded, not a resolved one.

**How the gate is arranged in CI, decided 2026-09-07 in the same round.** The
audit was inside `verify:ci`, the single command the CI job runs. Keeping it
there would have honoured the decision above and defeated it at the same time:
one known-red step makes every other check invisible from outside, because a
genuine test failure and this advisory produce the same single red cross, and a
run that is always red is a run nobody reads.

`npm audit --audit-level=high` therefore runs as **its own CI job**. The
threshold is unchanged, the job still fails, and it fails where it can be seen
instead of standing in front of checks it is not about. This is not option 3 in
another costume — nothing was lowered, and no advisory that would have failed
before passes now.

The local command is unchanged: `npm run verify` is `verify:core` **plus** the
audit, so anyone verifying before handing work over still runs it. CI's verify
job runs `verify:core` and the OpenAPI diff. The subset relation that
`ci.yml`'s own comment was written to protect still holds in the safe direction
— a green local run predicts a green verify job — and what no longer holds is
that a single command names everything CI runs. CI runs two, both defined in
`package.json`.

Two things this decision obliges, and they are the price of taking it:

- **The reading in §2.1 is a reading, not a proof.** It says no user-supplied
  string is _known_ to reach the vulnerable parsers because request bodies are
  validated with Zod rather than ajv. That argument holds only while it stays
  true. Any future use of ajv, of JSON-schema validation on request data, or of
  `$ref` resolution over anything a caller can influence, invalidates it — and
  would do so silently, because nothing in the build would change colour.
- **A red gate that nobody is waiting on becomes wallpaper.** Separating the job
  makes the red legible; it does not make anybody read it. The decision is to
  wait for upstream releases, so somebody has to look: `fastify` /
  `@nestjs/platform-fastify` for the `fast-uri` chain, and `prisma` for
  `mysql2`. Re-run `npm run security:audit` when either publishes, and record
  the result here rather than in a conversation.

The options as they were put, kept for the record:

1. **Launch with it red**, recorded here, and revisit when Fastify and Prisma
   publish releases that clear it. This is what the analysis above supports, and
   it is the option the Owner took.
2. **Take the breaking upgrades now** — a Fastify major and a Prisma downgrade,
   each of which touches the request pipeline or the build, days before real
   data arrives.
3. **Lower the gate** to `--audit-level=critical`. Named for completeness and
   argued against: a gate that is lowered to go green stops being a gate, and
   the next high advisory arrives unannounced. **Rejected by the Owner in the
   same decision**, in those terms.

## 3. What this review did **not** cover

Saying so is the useful part of a security document.

- **No penetration testing.** Nothing has been attacked. Authorization is
  asserted by tests that call the routes; nobody has tried to defeat them.
- **No load or denial-of-service testing.** The throttle is exercised for
  correctness, never for capacity.
- **No review of the deployed environment**: TLS configuration, database network
  exposure, Vercel project settings, secret rotation and who holds the
  production credentials are all outside this repository and none of them has
  been inspected.
- **No third-party review.** One person and one assistant wrote and read this
  code; that is not an independent audit, and a platform that will hold partner
  agreements and personal data deserves one eventually.

## 4. Before the first real import — the short list

1. `IMPORT_PASSWORD` set to a value kept with the deployment secrets, and never
   sent to a partner (`V1_LAUNCH_RUNBOOK.md` §5.1).
2. `NODE_ENV=production` in the deployed environment, without which the session
   cookie is not `secure`.
3. `PUBLIC_WEB_URL` set to the real origin, because the Origin guard and every
   confirmation link are built from it.
4. The first Admin created through `npm run first-run` and granted through
   `npm run admin:grant` — and that account's password held by one person.
5. The catalogue imported with `--dry-run` first, and the affiliate links
   **clicked**, not merely counted: criterion 3 of §5.3 is the one no query can
   check.
