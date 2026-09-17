# V1 pre-launch security review

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.6
- **Date:** 2026-09-17
- **Changed in 0.6:** **Both `high` advisories are closed, and no `--force` was
  used.** Upstream published what §2.3 was waiting for, so §2.1 and §2.2 stop
  being accepted risks and become fixed. §2.5 is new and is the reason the
  version is not simply "audit green": the release that fixes `fastify` also
  **removes the mechanism this platform throttles with**, and taking it is a
  deployment decision rather than a version bump. The threshold is unchanged.
- **Changed in 0.5:** §2.4 is new and §2.3 gained one paragraph. Two advisories
  arrived against `next` and `sharp` — one of them **critical** — and unlike
  §2.1 and §2.2 they were **fixed rather than accepted**. The threshold is
  unchanged, the two accepted risks are unchanged, and no reading in §2.1 or
  §2.2 was revisited.
- **Changed in 0.4:** §2.3 only. The audit moved from a second job inside
  `ci.yml` to a workflow of its own, and gained a weekly schedule — which is
  what discharges the obligation §2.3 itself names ("somebody has to look").
  No finding, no threshold and no decision changed.
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

`npm run security:audit` runs `npm audit --audit-level=high`. **It now exits
zero.** From 2026-09-07 to 2026-09-17 it did not, and recording that was the
point; recording what closed it is the same point continued.

Not every finding in this section has the same standing, and the difference
matters more than the count. §2.1 and §2.2 were **accepted risks** and are now
**fixed** — `I98`, 2026-09-17, by overrides alone. §2.4 was fixed on 2026-09-16.
§2.5 is the one thing in this section that is **open**, and it is open for a
reason no version number expresses: the release that would close it takes
something away.

### 2.1 `fast-uri` — high — **fixed 2026-09-17 (`I98`)**

Advisories `GHSA-5jgf-p345-68v8`, `GHSA-f65p-4m7j-42xc`, `GHSA-fph4-wmhf-6fwf`,
`GHSA-jqff-g426-hqxp`: host confusion and SSRF through malformed URI parsing.

**What was stuck, and why it came unstuck.** v0.5 recorded that one override
pinned `fast-uri@^3.1.7` while **two nested copies resisted it** —
`fast-json-stringify`'s own `4.1.2` and the `ajv` beneath it at `3.1.5` — and
that forcing them looked like it needed a breaking `@nestjs/platform-fastify`
major. That reading was right about the state and wrong about the cause. A
single `fast-uri` override cannot serve two consumers on **different major
ranges**: the `^3.1.7` it names is unsatisfiable for a dependant asking for
`^4`, so npm recorded the override and installed the old version anyway. Nothing
about `fastify` was in the way; the override was.

**The fix is one path-scoped override**, now that a patched `4.x` exists
(`fast-uri@4.1.3`, published after v0.5 was written):

```json
"fast-uri": "^3.1.7",
"fast-json-stringify": { "fast-uri": "^4.1.5" }
```

Resolved: `3.1.8` on the `3.x` path, `4.1.5` on the `4.x` path, **no vulnerable
copy anywhere in the tree**, and `@nestjs/platform-fastify` untouched at
`11.1.28`.

**The §2.1 reading is retired rather than revised.** It argued the parsers were
not reachable because request bodies are validated with Zod rather than ajv.
That argument was always a reading and not a proof, and the obligation §2.3
attached to it — re-check it if ajv, JSON-schema validation of request data, or
`$ref` resolution over caller-influenced input is ever introduced — is now moot
for this advisory, because the parsers are patched. The obligation itself stays
worth keeping for the next one.

### 2.2 `mysql2` — high, through `prisma` — **fixed 2026-09-17 (`I98`)**

`prisma` is a **devDependency** and a build-time tool: this platform's every
runtime read and write is hand-written SQL over `pg`. `mysql2` is a driver
Prisma ships for a database this project does not use, and nothing loads it.

**npm's offered fix was to downgrade Prisma to `6.19.3`**, which it marks
breaking — and which is the wrong instrument: the fault is in `mysql2`, not in
Prisma. `mysql2@3.24.4` is published and patched, so an override names it
directly and Prisma stays at `7.9.0`:

```json
"mysql2": "^3.24.4"
```

**This was never the dangerous one and it is still worth closing.** An
unreachable driver with a credential-leak advisory is unreachable until somebody
adds a MySQL datasource, and nothing would go red on the day they did.

### 2.3 What to do about the red gate — **decided: option 1**

> **Owner decision, 2026-09-07:** _"Kapıyı `critical` seviyesine indirip
> (Seçenek C) kendimizi kandırmıyoruz; Seçenek A'da kalarak Zod bariyerlerimize
> güveniyor ve üst akış (upstream) kütüphane güncellemelerini bekliyoruz. Bu
> kırmızı uyarı teknik borç listemizde bilinçli bir 'kabul edilmiş risk' olarak
> kalacak."_

**The gate stays at `--audit-level=high`. It went green on 2026-09-17.** The
decision above was never "live with it": it was to hold the threshold, trust the
Zod barrier in the meantime, and wait for upstream. Upstream arrived, and §2.1
and §2.2 were taken the same day, with overrides and **without `--force`**.

**What was actually waiting, corrected.** §2.3 named the thing to watch as
_"`fastify` / `@nestjs/platform-fastify` for the `fast-uri` chain, and `prisma`
for `mysql2`"_. Neither turned out to be the lever. `fast-uri` was blocked by
this repository's own override, which named a `3.x` range that a `4.x` dependant
could not satisfy — a `4.1.3` publication and a path-scoped override cleared it
with `fastify` and Nest untouched. `mysql2` was closed by naming `mysql2`, not
by moving Prisma. **The weekly run was still what made the day findable**; what
it found was smaller than the upgrade that had been imagined.

**The gate is green and §2.5 is open.** They are not in tension: §2.5 is a pair
of `moderate` advisories, below this threshold by the Owner's own decision to
hold it at `high`, and it is recorded rather than hidden.

**How the gate is arranged in CI, decided 2026-09-07 and completed 2026-09-08.**
The audit was inside `verify:ci`, the single command the CI job runs. Keeping it
there would have honoured the decision above and defeated it at the same time:
one known-red step makes every other check invisible from outside, because a
genuine test failure and this advisory produce the same single red cross, and a
run that is always red is a run nobody reads.

It was first moved into a **second job** inside `ci.yml`. Run #166 showed that
this solved half the problem and left the other half standing: the two results
were distinguishable on the run page, but a workflow's badge is the worst of its
jobs, so `main` still carried a single red cross in the runs list and on the
branch. "Did anything break?" was still unanswerable without opening the run.

`npm audit --audit-level=high` therefore now runs as **its own workflow**,
`.github/workflows/audit.yml`. `CI` answers "does the code work"; `Dependency
audit` answers "is the dependency debt still outstanding". Each has its own row,
its own badge and its own history, and neither stands in front of the other.

The threshold is unchanged and the workflow still fails. This is not option 3 in
another costume — nothing was lowered, no advisory that would have failed before
passes now, and `npm run verify` locally still runs the audit inside the chain.

Two details of that workflow are decisions rather than defaults:

- **It runs weekly**, on top of pushes, and can be run on demand. The reason is
  the second obligation below.
- **It does not run `npm ci`.** `npm audit` resolves the tree from
  `package-lock.json` alone; this was verified to produce the identical advisory
  set with no `node_modules` present. A job whose only question is what the
  lockfile contains should not first perform an install that can fail for a
  dozen unrelated reasons. `ci.yml` installs, so the lockfile and `package.json`
  are still proven to agree.

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
- **A red gate that nobody is waiting on becomes wallpaper.** Separating the
  workflow makes the red legible; it does not make anybody read it. The decision
  is to wait for upstream releases, so somebody has to look: `fastify` /
  `@nestjs/platform-fastify` for the `fast-uri` chain, and `prisma` for
  `mysql2`.

  **This is the part now automated, and it is the only part that could be.**
  Triggered by pushes alone, the workflow would never announce the good news —
  the day upstream publishes, nothing changes colour until somebody happens to
  commit, so the fix gets found by accident or by a person remembering to run a
  command. It therefore also runs **every Monday**, and every run writes the
  outstanding advisories into the run summary. The Monday it goes green is the
  Monday the debt cleared; that is the day to come back to this document and
  record it, and to decide whether the workflow should fold back into `CI`.

  **It has since earned its keep, in the direction nobody planned for.** The
  argument above is about the Monday the debt _clears_. On 2026-09-16 the weekly
  run instead announced a **critical** advisory against `next` that no push had
  introduced and that would otherwise have sat unnoticed until somebody happened
  to commit. That finding is §2.4, and it is fixed. The workflow's value is not
  only that it will one day go green; it is that it looks at all.

  Two limits of that automation, so neither is a surprise later. GitHub stops
  scheduled workflows after 60 days without repository activity, silently — a
  push or a manual run re-arms it. And a weekly failure notification is the sort
  of thing that becomes wallpaper in its own right: if it does, the answer is to
  turn the notification off, never to make the workflow green.

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

### 2.4 `next` and `sharp` — critical and high, **fixed 2026-09-16**

The weekly workflow §2.3 argued for did the thing §2.3 said it was for. Run #5
of `Dependency audit`, on a repository nobody had pushed to that morning,
carried a **critical** that had not been there the week before.

Two advisories, both against direct or first-level dependencies rather than the
transitive chains of §2.1 and §2.2:

| Advisory                                                                   | Package | Severity     | Vulnerable range                                   |
| -------------------------------------------------------------------------- | ------- | ------------ | -------------------------------------------------- |
| [`GHSA-2xp9-vwfh-vxw4`](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) | `next`  | **critical** | `9.3.4-canary.0` – `16.3.2` (installed: `16.2.11`) |
| [`GHSA-p293-qw3h-jr36`](https://github.com/advisories/GHSA-p293-qw3h-jr36) | `next`  | **critical** | as above                                           |
| [`GHSA-rgj7-g3m4-5g8c`](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) | `sharp` | high         | `< 0.35.4` (installed: `0.35.3`)                   |

The first is unauthenticated remote code execution in the **Image Optimization
API when AVIF files are used**; the second is unauthenticated remote code
execution on **Windows-hosted** servers; the third is `sharp`'s bundled
`libheif`, which is the decoder the first one reaches.

**Why the §2.1/§2.2 reasoning was not reused, in the Owner's words**
(2026-09-16): _"Burada önceki kabul edilmiş risk kararını aynen uygulamak doğru
olmaz; bu yeni bulgu farklı nitelikte… next uygulamanın doğrudan çalışma zamanı
bileşeni olduğu için önceki prisma gerekçesi uygulanmıyor."_ §2.2's argument is
that `mysql2` is a driver nothing loads inside a build-time tool. `next` is the
web application. The two are not comparable, and the difference is the whole
reason this one is closed rather than recorded.

**What was applied.** `next` moved `^16.2.11` → `^16.3.3` in
`apps/web/package.json`, resolving to `16.3.5`; `sharp` moved `0.35.3` →
`0.35.4`. **`16.3.3` is the first fixed version there is** — the vulnerable
range ends at `16.3.2`, and `16.2.12` exists but is inside it, so there was no
patch on the `16.2` line to take instead. The minor bump is the minimum fix, not
a convenience.

**A third manifest change, which is not a dependency bump and is the one to
read twice.** `next` is now also declared in the **root** `devDependencies`.
`prototype/` is deliberately not a workspace, and its `tsconfig` resolves
`next/link` by walking up to the hoisted root `node_modules/next` — a
dependency it has always had on a hoisting outcome it never declared. Updating
the lockfile makes npm recompute that outcome, and it placed `next` under
`apps/web/node_modules` instead, which takes `prototype:typecheck` from passing
to `Cannot find module 'next/link'`. The root declaration states the thing
`prototype/` was silently relying on, and restores hoisting. **The fragility is
older than this advisory and was merely uncovered by it**; the alternative —
making `prototype/` a workspace — changes what the repository installs and
belongs in a change of its own, not in a security fix.

**The pin that was in the way, and this is the part worth remembering.**
`sharp` could not move, and `npm audit` reported its fix as requiring `--force`,
because the root `overrides` block pinned `sharp` to **exactly `0.35.3`** — one
of the transitive pins added for an earlier advisory. A pin taken to fix last
month's finding was holding this month's fix out. The whole `overrides.next`
block was removed rather than re-pinned: `next@16.3.5` already requires
`postcss@8.5.23` and `sharp@^0.35.4` itself, so both entries had become no-ops
that could only do harm. **`--force` was not used**, at the Owner's instruction
and because it was not needed once the stale pin was gone.

**What the upgrade was checked against**, because an audit turning green is not
by itself evidence that nothing else moved:

- **Lockfile scope.** Ten version changes, **no package removed**, and every
  one of them accounted for: `next`, `sharp`, `@next/env`, two `@next/swc-*`,
  two `@img/sharp-*`, two `@img/sharp-libvips-*`, and `@swc/helpers`
  `0.5.15 → 0.5.23`, which is `next@16.3.5`'s own dependency. Twenty-nine
  entries were **added**, all of them `sharp` and `@next/swc` binaries for
  platforms the old `sharp` pin had narrowed away — Windows, macOS, arm64, musl,
  wasm. That is a restoration of cross-platform coverage, and it is the reason
  the lockfile grew rather than a sign that something unrelated moved.

- **How the lockfile was updated, because the obvious way is wrong here.** It
  was updated in place with `npm install --package-lock-only` from the committed
  file. Deleting it and regenerating from scratch — which is what this
  environment first did — silently **removed 72 entries**: every
  `@esbuild/win32-*`, `@rolldown/binding-win32-*`, `@tailwindcss/oxide-win32-*`,
  darwin, freebsd and android optional binary. The repository declares
  `npm@11.9.0`, the machine that produced the committed lockfile runs it, and
  this environment has npm 10, which prunes those entries when it rewrites the
  file. The result installs and passes on CI's Ubuntu runner and would fail
  `npm ci` on the Owner's Windows machine — a break that CI is structurally
  incapable of catching. **Never regenerate this lockfile from scratch on a
  machine whose npm major differs from `packageManager`.** The file shipped here
  was verified by running `npm ci` against it and confirming it came back
  byte-identical.
- **The exposure here was already narrow, and this is offered as context rather
  than as the reason it was fixed.** The application does not use `next/image`
  at all — `apps/web/src/app/layout.tsx` says so in a comment written long
  before this advisory, the one image on the site is a plain `<img>`, and
  `next.config.ts` carries **no `images` configuration**, so there is no AVIF or
  WebP behaviour to have changed and no optimizer endpoint being served.
  Nothing in the repository imports `sharp`; it arrives only as `next`'s
  optional dependency. Deployment is Linux, so the Windows advisory does not
  apply either. The Owner declined to treat any of this as a durable reason:
  _"Mevcut Linux/AVIF yapılandırması riski azaltıyor olsa da bunu kalıcı
  güvenlik gerekçesi olarak kabul etmiyoruz."_ Configuration is a thing that
  changes; a patched dependency is not.
- **Authentication.** The web application has no `middleware.ts` and no route
  handlers; its auth surface is server actions plus `next/headers`. Fifty-two
  test files exercise `apps/web`, and `tests/i8-authentication.integration.test.ts`
  renders the real login and registration server components against a live API
  and database. All pass.
- **Production build.** Green, all 21 routes generated.
- **The rest of the chain.** Full suite 1518/1518, `format:check`, `typecheck`,
  `prototype:typecheck`, `lint`, `boundaries`, and `generated/openapi.json`
  unchanged (`5f980c0f183bbd44f1c739d238a00505`).

**Result: 9 advisories → 7. Critical 1 → 0, high 3 → 2.** What remains is
exactly §2.1 and §2.2, unchanged. The gate still exits non-zero for the reasons
recorded there and `Dependency audit` stays red; that is the same accepted risk,
not a new one.

**One caution for whoever reads the next weekly run.** `npm audit fix` cannot be
run in this workspace — it aborts with
`Cannot read properties of null (reading 'edgesOut')`, an npm defect in this
tree that `--package-lock-only` and `--dry-run` hit identically. The manifests
were therefore edited by hand to the versions `npm audit` named, and the tree
regenerated with `npm install`. Anyone expecting the command to work will
conclude the repository is broken; it is npm.

### 2.5 `fastify` — moderate — **open, and the fix is the problem**

Advisories `GHSA-w2qp-rph6-63g4` (schema validation bypass via root primitive
coercion) and **`GHSA-3m5p-2c4r-xxw2` (X-Forwarded-\* spoofing under trustProxy
hop-count)**. Both are fixed in `fastify@5.12.1`; `5.12.5` is current. The
platform stays at **`5.10.0`, now pinned exactly** rather than by a `^` range.

**Why a `moderate` gets its own section.** The second advisory is not a
transitive parser nobody reaches. It is about the exact configuration this
platform's throttling key is built on, and `I39` exists because getting that key
wrong throttles either everybody or nobody.

**What `5.12.1` changed, in its own words.** `lib/request.js`:

```js
if (typeof tp === "number") {
  // Hop-count-only trust cannot validate the immediate peer. Fail closed so
  // direct clients cannot spoof X-Forwarded-* values by supplying enough hops.
  return function () {
    return false;
  };
}
```

**`trustProxy: <number>` is no longer a trust setting. It is a no-op that fails
closed.** The reasoning is correct: a hop count says how far to walk the header
and says nothing about whether the machine that connected is entitled to have
written it, so a direct caller can supply enough hops to land wherever they
like.

**Taking the fix would break the throttle, and the tests said so before any
reasoning did.** `I39` drives a real socket and asserts what `request.ip`
becomes. On `5.12.5`, with one proxy declared and `x-forwarded-for:
9.9.9.9, 8.8.8.8`, it returns `127.0.0.1` instead of `8.8.8.8`. That is the
first row of `trusted-proxy.ts`'s own table: _"the proxy's address for every
caller — the whole internet shares one counter, and the first few dozen attempts
globally lock everybody out."_ The upgrade would not have failed loudly in
production. It would have answered `200` to every request and locked out every
account behind the proxy.

**`TRUSTED_PROXY_HOPS` is therefore a dead mechanism upstream**, and that is the
real finding here — larger than the advisory. The replacement fastify now
expects is a **trusted-proxy address or CIDR list** (`proxy-addr` compiles a
string, an array, or the presets `loopback`, `linklocal`, `uniquelocal`), which
validates the peer rather than counting hops.

**Why it is not done in `I98`.** It is not a version bump. It replaces a
deployment setting with a different kind of setting, and the value it needs is a
fact about where this API runs and what sits in front of it — which is an Owner
decision, exactly as `DEFAULT_TRUSTED_PROXY_HOPS` was. Doing it needs
`trusted-proxy.ts`, `.env.example`, the `I39` tests and the deployment
documentation to move together.

**What holds until then, stated plainly.** `5.10.0` still honours the hop count,
so the throttle key is correct for the declared deployment and `I39`'s twelve
assertions pass. The spoofing the advisory describes is available to a caller who
reaches the API **without passing through the declared proxy** — which is the
same exposure the hop-count mechanism always had and which `trusted-proxy.ts`
already names: over-declaring hops _"is the same failure as trusting the whole
chain"_. The advisory does not make this newly true; it makes it named upstream.

**The pin is deliberate and will not drift.** `apps/api/package.json` carries
`"fastify": "5.10.0"` exactly. Left at `^5.10.0`, the next lockfile refresh would
have taken `5.12.5` silently, and the only thing that would have gone red is
`I39` — in a repository where somebody could plausibly read two failing proxy
tests as flakes.

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
