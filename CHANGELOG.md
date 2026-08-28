# CHANGELOG

All notable changes to the **Commerce Platform Bible** repository are documented in this file.

This project follows the principles of:
- Documentation First Development
- Semantic Versioning
- Single Information Owner
- Reference Never Redefine

---

## [3.33.0] - 2026-08-28

### Added

- **The seventeen management surfaces have a visual system.** Measured first:
  **twenty of twenty-two `page.tsx` files carried no `className` at all**, and
  the Business Dashboard, every Admin screen, sign-in, registration and recovery
  were headings, paragraphs, forms and tables on a bare page. The site was never
  unstyled — it was typographically dressed and architecturally undressed.
- A page header with a rule, a panel drawn from `section`, a two-column form at
  the breakpoint that already exists, a row list for unclassed lists, a table
  that runs to the panel's edge, and a card for the identity routes.

### Verified

- **Nothing here is a new direction.** Every rule is built from tokens that
  already existed; no colour, no type size, no new breakpoint. The Owner's
  instruction was to complete the approved "dense listings" direction, and
  `i26-design-foundation` reads the whole stylesheet, so the constraints were
  inherited rather than re-litigated — each of the four mutations fails both
  suites.
- **No page file was touched.** Six one-element segment layouts carry the scope,
  and a case asserts the pages stay bare so a later class has to be argued for.
- `.workspace ul:not([class])` keeps the row treatment away from
  `.listing-cards`, which a bare `ul` selector would have redrawn on the one
  screen where an owner compares their listings with what a visitor sees.
- **Two of the new cases were wrong first.** One matched a comment — finding a
  `480px` breakpoint inside a sentence explaining that it had been removed, the
  eighth time a check here has matched something other than what it meant. The
  other used a pattern that matched the `2.75rem` it existed to permit.

---

## [3.32.0] - 2026-08-28

### Fixed

- **An API that is not there took the whole page down.** Every honest failure
  surface I23, I24, I45 and I46 built is reached by an `ApiRequestError`, and
  only a `5xx` and a timeout produced one — so a refused connection, the
  plainest failure of the three, reached none of them. `/offerings/{slug}`
  answered `500` with a body whose visible text was the page title alone, and
  the crash screen was not in the document at all.
- **The page was already correct.** It has caught `isApiUnavailable` since I24;
  one classification three files away made it unreachable. The repair is in
  `fetchWithBudget`, which all **19** reads pass through.

### Verified

- A system call is the discriminator, not a list of codes: a refused connection
  and a DNS failure carry `cause.syscall`, while an unsupported scheme and a
  malformed URL — the two ways this application can be wrong — do not. A
  malformed `API_BASE_URL` still reaches the crash screen, and a mutation that
  widens the test to any `TypeError` fails.
- **Three smoke checks now run against a second web instance pointed at a closed
  port**, because `app.inject()` has no socket and `renderToStaticMarkup` has no
  status code. Reverting the repair takes smoke from 17/17 to 15/17.
- **One mutation survived, and the claim it falsified was ours.** A case said the
  abort check must precede the transport check; an aborted `fetch` throws an
  `AbortError`, which is not a `TypeError`, so the two are disjoint and the
  order is incidental. The stub was also a shape `fetch` never produces. Both
  corrected.

---

## [3.31.0] - 2026-08-27

### Fixed

- **An outage told a person their Decision flow had expired.** `/decision` read
  `null` from a `503` and said so, then offered to start again — so a person
  who took the offer lost a Decision in progress on the strength of a claim the
  platform had no way to make.
- **An outage told a person their Comparison had ended.** `/compare` reasoned
  about exactly two states, *not openable* and *gone*, told apart by whether
  anything was left to describe. A third state broke that: during an outage
  there is nothing left to describe either, so the page offered to start a set
  the person still had.
- **Five Decision reads joined I25's timeout budget.** The rule is derived from
  the method rather than a list of names — a `GET` reports what is, everything
  else changes something — which is how both modules came to be outside I24's
  and I25's rules at once.

### Verified

- **The eight writes were already honest and are left alone.** Measured rather
  than assumed: the Affiliate Handoff refusal says "nothing was initiated and
  no information was shared", which is as true of an outage as of a refusal
  because the API refuses inside the transaction. A case asserts the sentence so
  a later increment does not "fix" correct copy.
- I45 asserted the set of modules outside the vocabulary precisely so repairing
  them would fail there. Both names are now deleted and the set is empty.
- Seven cases, five mutations, each caught — including the overshoot that would
  report a flow that genuinely expired as an outage.

---

## [3.30.0] - 2026-08-27

### Fixed

- **An outage told a signed-in person they were signed out.** `readSession`
  turned every non-`200` into `null` and `/account` turned `null` into the
  sign-in screen — so during a database outage somebody holding a perfectly
  valid token was told their session was gone and sent to a form that calls the
  same API and would have failed too. `4xx` still means no session, which was
  never the defect.
- **An outage told an owner they own no Businesses.** `readOwnedBusinesses`
  answered `{ businesses: [] }` for any failure. Most people own none, so zero
  is the ordinary answer and an outage wearing it was invisible — an owner of
  three saw none, with UX-0008 §8.1's entries absent and nothing saying why.
- **Both reads were outside I25's timeout budget.** `identity/api.ts` called
  `fetch` directly, so a hung API held `/account` open with no ceiling. The
  eight writes sharing the same function stay off the budget, which is I25's
  decision: aborting a write does not undo it.

### Verified

- I24 gave fourteen readers the vocabulary for this and reached neither of
  these two. The rule was applied everywhere except the module whose false
  answer is about the person rather than the catalogue.
- **Fifteen Decision functions still collapse an outage into a confident
  nothing**, measured by driving them with a `503` and asserted as an exact set
  so repairing them forces an acknowledgement.
- Six cases, five mutations, each caught — including the overshoot that would
  present a refusal as an outage.

---

## [3.29.0] - 2026-08-27

### Added

- **The API is now driven against its own published description.** I41, I42 and
  I43 each compared the document with the contracts — two files, read and
  compared with each other. This calls every documented operation for real and
  checks the response: first that the status is one the document declares, then
  that the body satisfies the contract the document names for it. The map from
  operation to contract is **derived from the document**, because all 379
  declared responses point at a schema by `$ref` and none is inlined.

### Fixed

- **`POST /decision/flows/{id}/direct-contact` answers `403` and never declared
  it.** The reveal carries a session, so `OriginValidator` refuses a request
  without an acceptable origin under ADR-0012 §2 before anything else runs. It
  is the only Decision operation that carries a session, which is why it is the
  only one that should declare `403` — and the only one that did not.
- **`503` was declared on one operation out of eighty-seven.**
  `ErrorEnvelopeFilter` is an `APP_FILTER`, so answering
  `503 DEPENDENCY_UNAVAILABLE` is a property of every operation that reaches the
  database rather than of any one of them. A client generated from the published
  description had no `503` branch anywhere but readiness. It is now added in one
  pass over the finished document, not written into eighty-six literals.

### Verified

- 73 response bodies already satisfied their contracts, with nothing to repair.
- `GET /health/live` is the single operation that does not declare `503`, and
  the exception is **measured**: driven with no database reachable it answered
  `200` while readiness answered `503`.
- Five cases, five mutations, each caught; run both with and without a database.

---

## [3.28.0] - 2026-08-26

### Added

- **The document's declared types are now compared with the contracts.** I42
  closed property names and named this as the remaining gap. 301 properties are
  compared on both sides and **they all agree**, so this locks a good state in
  rather than repairing a bad one.
- Both sides are normalised to a primitive kind and whether null is permitted:
  `$ref` resolved, an `anyOf` with a null branch collapsed to nullable, an enum
  of strings read as a string.

### Changed

- **The measurement was wrong before it was right.** The first comparison
  reported 62 differences out of 301 and every one was the comparison's fault —
  `type: ["string","null"]` against `anyOf: [{string},{null}]`, a `$ref` to a
  shared enum against the enum inlined, `enum: ["ok"]` against `type: "string"`.
  **Trusting that number would have edited sixty-two correct declarations into
  wrong ones**, which is worse than the gap it was meant to close and reached by
  doing exactly what the increment was for.
- A case asserts on the normaliser itself that a nullable and a plain one still
  read as different, because the fix for over-strictness can overshoot into
  over-permissiveness.
- Eight contracts carry a `transform`, which JSON Schema cannot express — all
  eight are input schemas and none describes a response. They are skipped, and
  **the set is asserted rather than a count**: a count is a budget somebody
  spends, and naming them means a ninth fails and has to be acknowledged. The
  first version of that case guessed "fewer than six" and there were eight.

---

## [3.27.0] - 2026-08-26

### Fixed

- **The published contract had been hiding two fields since I30.** That
  increment gave Offerings visuals and updated the Zod contracts, the migration,
  the projection, the repositories, the API and the web application — but not the
  five-thousand-line hand-written OpenAPI generator. `SearchResult` lost
  `primaryVisualUrl` and `EditableOfferingContent` lost `visuals` from the
  published description for **eleven increments**, and a client generated from it
  would have looked correct while quietly dropping both.
- Nothing could tell: I41 compared method and path, and CI's
  `git diff --exit-code` only ever proved the generator matches its own
  committed output.

### Added

- **The document's schemas are now compared with the Zod contracts**, in both
  directions. 81 of 92 document schemas pair with a contract by name; the eleven
  that do not are shapes one side inlines, and are recorded as **unchecked
  rather than as fine**.
- The same guard I41's own comparison needed: a rename on either side would
  silently reduce the pairs to zero and leave both directions comparing nothing.
  The two recovered fields are also asserted by name, because a rule that has
  never been violated is indistinguishable from one that cannot be.

---

## [3.26.0] - 2026-08-26

### Added

- **The published OpenAPI document is now compared against the routes the API
  actually serves**, in both directions. CI's `git diff --exit-code` proves the
  generator's output matches the committed file and nothing else — and the
  generator is 5073 hand-written lines with no introspection, so the description
  could have drifted from the API in every direction with every check green. The
  only assertions on it named six operations out of eighty-seven.
- `createApiApp` accepts an optional `onRoute` observer, because **a Fastify
  instance cannot be asked what it serves afterwards.** Unset in production.

### Fixed

- **A smoke check that had passed for the wrong reason since I35.** It asserted
  `/metrics` answers 404 to an anonymous caller; the real path is
  `/api/v1/metrics`, so it was asking about a path the application has never had
  and 404 was the answer to a wall rather than to a closed door. It now asks the
  right path and asks the second half too — a wrong token is refused **the same
  way** as none, which a check that only ever sees 404 cannot establish.
- **A comment written in this increment was wrong and mutation testing caught
  it.** The route observer does not need to precede `NestFactory.create`; it
  needs to precede `app.init()`, which is where Nest mounts the controllers.

### Changed

- The document was found in good order: 88 operations served, 87 documented, 0
  documented that are not served, `GET /api/v1/metrics` excluded on I19's
  decision and **named rather than filtered silently**. A clean result is the
  point — it is the state a hand-maintained file drifts out of one commit at a
  time.

---

## [3.25.0] - 2026-08-26

### Added

- **`npm run first-run`** — the way to get the first Admin onto a fresh
  deployment. `admin.mjs` refuses anything unconfirmed, and the registration
  token is minted at delivery with only its digest written back, so **no amount
  of database access produces a confirmation link**. That is a good decision and
  this does not weaken it: `first-run` **is** the worker, run once by an operator
  with a dispatcher that prints the message instead of sending it — same
  processor, same minting, same digest. It adds no capability, because anyone who
  can run it already holds `DATABASE_URL`.
- The bootstrap written down as five steps in `DEPLOYING_TO_VERCEL.md`,
  including the one that surprises: **entering the Admin context is a separate
  act**, and a granted account that has not entered gets 403.

### Fixed

- **`verify` ran the type-aware linter before the types existed.** The first
  push of this increment failed CI with nineteen `no-unsafe-*` errors, every one
  "a type that could not be resolved", after passing locally.
  `scripts/first-run.mjs` is the first script to import `@commerce/*`; scripts
  sit outside every tsconfig project, so those imports resolve through
  `node_modules` to each package's `dist`, which does not exist on a clean
  checkout. **In that state every type-aware rule degrades silently to
  "unresolved" rather than to "fine".** `typecheck` is `tsc -b`, which emits, so
  it now runs first — and a case asserts the order.

### Changed

- **The platform was pointed at a brand-new database for the first time.** 39
  tables, three Domains a migration seeds, and nothing else. Home answers 200
  with "Şu anda açık bir kategori yok." rather than looking broken; Discovery
  redirects to Home having no criteria; registration writes its four rows.
- **I38's scheduled endpoint drained a real outbox** —
  `{"batches":2,"delivered":1,"drained":true}`. That increment was proven against
  fabricated processors; this is the first time the cron path has delivered a
  message a registration actually filled.
- ~~The database is empty and there is no seed.~~ A migration seeds the three
  Domains. Every Category and Attribute is still hand-built by the first Admin,
  and what belongs in a starting catalogue is an Owner decision rather than an
  engineering one.

---

## [3.24.0] - 2026-08-26

### Fixed

- **The throttling key was the proxy's address, not the caller's.**
  `identity.controller.ts` uses `request.ip` and calls it "the caller's
  address", and Fastify populates that from `x-forwarded-for` only when told to
  — which it had not been. Behind a proxy every caller would have shared one
  counter, and the platform would have locked itself out after a few dozen
  attempts globally.
- **The obvious fix is the other failure.** `trustProxy: true` takes the
  leftmost `x-forwarded-for` entry, which is the one the caller writes, so the
  throttle could be stepped around by changing a header between requests.
  Measured, both ways, against a forged header.

### Added

- `TRUSTED_PROXY_HOPS`, default `0`. Nothing in a request distinguishes an entry
  a proxy appended from one a caller sent, so the number is stated rather than
  detected — the same shape as `DATABASE_CONNECTION_MODE`. The default fails
  towards refusing rather than towards allowing.
- **Too high is as bad as trust-all**, and a case here was written to assert the
  opposite before the measurement said no: when the chain is shorter than the
  number declared, the resolver returns the leftmost entry — the caller's. There
  is no safe margin, so the number must be verified against a real request.

### Changed

- ~~"There is no rate limiting anywhere in the repository."~~ **That claim, made
  earlier in this session, was false.** `auth_throttle` has counted attempts per
  hashed subject since I13, across registration, recovery and both sign-in
  scopes, in one atomic statement so the count is shared by every instance. The
  survey searched for the names of libraries rather than for the behaviour, and
  this repository writes such things itself. Struck through rather than deleted,
  and a case asserts it stays struck.
- Two checks in this increment matched themselves: one read its own
  struck-through correction as the claim it was asserting gone, and one accepted
  `TRUSTED_PROXY_HOPS_X` as documentation of `TRUSTED_PROXY_HOPS`. Document
  checks now strip `~~…~~` as source checks strip comments, and the name is
  matched as an assignment.

---

## [3.23.0] - 2026-08-26

### Added

- **The worker can be invoked by a scheduler.** Until now **no email was ever
  sent on the platform the Owner chose**: the worker is a `while (running)` loop
  and Vercel has nowhere to loop, so registration confirmations would have sat
  unread in the outbox, nobody could have completed a sign-up, and the
  deployment would have looked entirely healthy.
- `drain.ts` — the draining, separated from what drives it. `main.ts` still
  calls it in a loop and is what the Dockerfile starts; `handler.ts` calls it
  once. **One draining path, two shapes**, so a staged hosting decision stays
  reversible.
- Two endpoints with two schedules. The loop's five-minute sweep timer cannot
  survive a process with no memory between invocations, so the cadence had to
  move into the schedule rather than be guessed at.
- `CRON_SECRET` and `CRON_BUDGET_MS` in `.env.example`.

### Changed

- **The drain stops before a batch it could not finish**, rather than when the
  time is gone. A function is killed mid-statement when it exceeds its duration;
  `processBatch` marks what it delivered before returning, so a kill *between*
  batches loses nothing — but a kill *inside* one is a delivery whose outcome
  nobody recorded, and the outbox then sends it again.
- `drained: false` is returned rather than treated as a failure. **An outbox
  that never reports `true` is one the schedule cannot keep up with**, and that
  is invisible if a partial drain answers the same as a complete one.
- `buildDispatcher` moved out of `main.ts` into its own module. **A second copy
  of "does this deployment send real mail" is the duplicate that matters most**:
  the two could disagree, and one deployment would silently write every
  registration to a log while looking healthy.
- Unauthorised invocations get **404, not 401**, matching I19's decision for
  `/metrics`. An unset or empty `CRON_SECRET` never matches, because the
  endpoint sends real email and deletes real rows.

### Fixed

- **I34's environment detector was half-blind.** It matched `process.env.NAME`
  and not `process.env["NAME"]`, and four bracket-notation reads already
  existed. It failed in the harmless direction — reporting a documented variable
  as invented — but **the same blindness in the other direction is the boot
  failure that test was written about**: a variable read only through a bracket
  would have been invisible, and `.env.example` could have gone on not
  mentioning it. It now matches both notations.

---

## [3.22.0] - 2026-08-26

### Added

- **The API can run as a function.** Vercel runs functions and `main.ts` calls
  `listen` and never returns, so until now the API had **no way at all** to run
  on the platform the Owner chose. `apps/api/src/handler.ts` answers
  `(req, res)`; `apps/api/api/index.js` is what Vercel invokes.
- **`main.ts` stays**, and that is the point rather than an oversight: a staged
  decision is only reversible while both shapes exist. `bootstrap.ts` had
  already separated building the application from listening on a port, so there
  is one request pipeline entered two ways, not two copies.
- `docs/implementation/DEPLOYING_TO_VERCEL.md` — two Vercel projects, the
  Supabase steps including the `alter role` statements, and the environment
  variables that are not obvious. **Nothing in it has been executed.**

### Changed

- The application is built once per function instance, and the **promise** is
  what is cached: two requests arriving during a cold start await the same build
  rather than starting a second one. Building per request would open a new
  database pool on every call, which against Supabase's connection limit is the
  whole project falling over rather than one slow response.
- `fastify.ready()` is awaited before the first request is passed in. Without it
  a request can be served before `helmet` and the cookie parser register, which
  is not a slow response but a wrong one — no security headers, no session.
- I36 predicted "a third entrypoint could forget" the database timeout check.
  This is the third entrypoint, and it is the one that will actually run against
  Supabase's pooled port. It runs the check.

### Fixed

- **A test failure that was the test's fault.** The correlation-echo case sent
  `11111111-2222-3333-4444-555555555555`, which is not a valid UUID — the
  variant nibble must be one of `89ab`. I17 minted a fresh identifier instead,
  exactly as it should. The case was corrected, and the behaviour it accidentally
  found — that a malformed identifier is replaced rather than propagated into the
  audit record — got a case of its own.

---

## [3.21.0] - 2026-08-26

### Added

- **`DATABASE_CONNECTION_MODE`** — `direct` or `transaction`. The Owner chose
  Vercel and Supabase on 2026-08-26, staged: ship on Vercel first and move the
  API to a process host if the measurements demand it.
- **The timeouts are checked against the server at boot.** Both the API and the
  worker ask `pg_settings` what `statement_timeout` and
  `idle_in_transaction_session_timeout` actually are, and refuse to start when
  they are not the configured values. The check does not care how the setting
  arrived — what matters is the value in force, not the route it took.

### Fixed

- **A transaction pooler refuses the parameter the timeouts travel on.** Since
  I18 both have been carried on `pg`'s `options` startup parameter, which is
  correct while the only thing between the process and PostgreSQL is a socket.
  Supabase puts Supavisor in between: port 5432 accepts `options`, **port 6543
  rejects it**, and the code cannot tell the two apart from the URL — same host,
  same database, only the port differs.
- On the pooled port the timeouts must come from the database role instead.
  `.env.example` now carries the `alter role` statements, because a deployment
  that skips them gets a working connection, correct results and **no statement
  timeout at all** — one hung query from holding the entire pool of ten.
- An unrecognised `DATABASE_CONNECTION_MODE` takes `direct` and therefore sends
  `options`, so a typo fails the connection while somebody is deploying rather
  than quietly stripping the timeouts.

### Changed

- **One mutation survived the first attempt.** Deleting
  `verifyDatabaseTimeouts` from the worker left the suite green, because the
  case asserted the entrypoint source contained the *name* and the import line
  still did. A check on a name is satisfied by importing it and never calling
  it. It now matches the call, with imports stripped before the search.

---

## [3.20.0] - 2026-08-26

### Added

- **The first end-to-end run.** `npm run smoke` starts the API and the web
  application as real processes and drives them over `127.0.0.1`. All 942 tests
  before this one called `app.inject()` or `renderToStaticMarkup` — **no socket
  had ever been opened, no page had ever been served, and the web application
  had never called the API over a network.** Five consecutive closure records
  named the gap; naming it five times did not close it.
- Thirteen checks against running processes, including the three values no test
  can see: `API_BASE_URL`, the port, and the `/api/v1` prefix that the web
  application's server-side fetch depends on.

### Fixed

- **A 404 that answered 200.** `/offerings/there-is-no-such-offering` returned
  `200 OK` with `Bu sayfa bulunamadı` in the body. A `loading.tsx` makes Next
  stream the segment, and the HTTP status is committed at the first flush —
  before `page.tsx` calls `notFound()`. The body was right and the status was a
  lie, which is the worst of both: a person sees the correct screen, and every
  crawler, uptime monitor and cache sees a page that exists.
- **Twelve pages were affected**, under `/admin`, `/businesses` and
  `/offerings/[slug]`, and every test in the repository passed the whole time.
  `renderToStaticMarkup` has no status code and `app.inject()` does not stream,
  so the suite would have kept passing forever.

### Changed

- Three of I32's five `loading.tsx` files are removed. `/compare` and
  `/decision` contain no `notFound()`, so streaming costs them nothing and they
  keep their skeleton. **Twelve pages lose a loading state, because a correct
  status code outranks a skeleton.** The reversal is recorded in
  `tests/i32-loading-behaviour.test.ts` with I32's claim struck through rather
  than deleted, and a second case derives the rule from the source so a
  `loading.tsx` beside anything calling `notFound()` now fails the suite.
- `smoke` is a script rather than a test, and deliberately outside `verify`: it
  needs a production build and a migrated database, and a test that skips when
  its preconditions are absent still reports the suite green.

---

## [3.19.0] - 2026-08-25

### Added

- **The repository can describe its own deployment.** `vercel.json` for the web,
  and one Dockerfile for the API and the worker — **Vercel runs functions and
  both of those are processes**, so the Owner's 2026-08-24 choice covers one
  service of three.
- One image rather than two: they share every dependency and differ only in
  which `main.js` they start. `SERVICE` is a build argument, so a host that
  names the wrong one fails at build rather than at 3am.

### Fixed

- **`.env.example` documented fourteen variables and the code reads
  twenty-three.** It is the only instruction sheet a deployment has.
- **Two of the nine missing ones stop production from starting.**
  `EMAIL_TRANSPORT` and `CHAT_TRANSPORT` default to `development` and both
  adapters throw under `NODE_ENV=production` — deliberately, since I13 and I15.
  A deployment following that file exactly would have failed at boot with an
  error naming a variable the file had never heard of.
- **`WEB_PORT` was documented and read by nothing** (Next reads `PORT`). Removed
  rather than implemented: a variable that does nothing is worse than an absent
  one, because absence is visible.
- **Three modules were missing from the Dockerfile's manifest list** —
  `analytics`, `audit`, `catalog` — written from memory. `npm ci` would have
  failed on the first build, after somebody waited for it.
- **The Dockerfile's own comment contradicted its command**: it explained why
  `exec` matters and then omitted it, so a shell would have sat between the host
  and node and swallowed every SIGTERM.

### Decided

- **Migrations are a release step**, not a build step and not a boot step. The
  Vercel build has no reason to hold database credentials and runs again on
  every preview branch; two API instances starting together would race.

### Verified

- 101 test files, 942 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build.
- Six mutations, each caught. The environment contract is compared against every
  `process.env` read **in both directions**, and the Dockerfile's manifest list
  against the workspaces on disk, so neither can drift again.

### Known

- **Nothing here has ever run.** No image built, no `vercel.json` read by
  Vercel, no migration applied to a hosted database. A test that reads a
  Dockerfile is not evidence that it builds.
- **The API's host is unchosen**, so there is no deploy workflow for it. Writing
  one against a platform nobody has picked would be a guess with YAML around it.
- `db:deploy` cannot run in the local environment at all —
  `binaries.prisma.sh` answers 403 there, which is why it has been proven in CI
  and nowhere else since I14.
- Secrets are named, not managed. Where they live is the host's business.

---

## [3.18.0] - 2026-08-24

### Added

- **A site.** Twenty-two routes existed and there was no header, no navigation,
  no footer and no brand mark — `layout.tsx` was `<html><body>{children}`. Every
  page was correct in every rule it enforced and belonged to nothing.
- A wordmark linking home from every page, two navigation entries, a footer, and
  a skip link (WCAG 2.4.1) that is off-screen rather than hidden, because a
  hidden element cannot be focused.

### Changed — an Owner decision reversing an Owner decision

- **I26's approved "calm, content-first" direction is replaced by "dense
  listings"**, which is that document's own escape clause being used: *"Where
  density would serve better than calm, this is the wrong foundation and should
  be replaced rather than eroded."* Four Offerings on a screen instead of twelve
  is three times the scrolling for the same comparison.
- Type scale down, `--measure-wide` to 76rem and lists get it, results grid to
  `auto-fill minmax(15rem, 1fr)` — five across on a wide screen, one on a phone,
  and no media query at all.
- **The reversal is of spaciousness, not of restraint.** Lines not shadows, one
  accent, no animation, the focus ring, the measured contrast and
  `min-height: 2.75rem` on every control are unchanged. Density comes from
  spacing and the grid; trading a 44px control for two more rows is paying in
  the wrong currency.

### Fixed

- **Three checks read files instead of code, in one increment.** `i26` counted a
  `480px` breakpoint out of a comment recording that it had rejected one; the
  query was pointless anyway, because `minmax` already collapses on a phone. And
  `i33` matched `fetch` in `layout.tsx`'s paragraph explaining that it does not
  fetch a webfont.
- After the same shape in I31's struck-through `lang="en"`, this is now a rule:
  **this repository comments heavily and on purpose, so every source-reading
  check must strip comments first.**

### Verified

- 100 test files, 933 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build.
- Six mutations, each caught — including a header that names the Admin context
  and controls shrunk to 24px to buy density.
- The layout is now async and the header inline: a nested async component
  suspends, which `renderToStaticMarkup` cannot resolve, so a shell built that
  way is a shell no test can render.

### Known

- **Still nobody has looked at it.** Every claim is computed from markup and CSS
  text; no browser has rendered the header and no screen has shown five cards
  across.
- The header is not sticky, the footer links to nothing (deliberately — terms
  and privacy would be promises R4 has no owner for), and the brand is the word
  `İlanlar` because the platform has no name.
- **Nothing is deployed.** The Owner chose Vercel with managed Postgres on
  2026-08-24; no `vercel.json`, no Dockerfile and no deploy workflow exists, and
  the web is only one of three services — the NestJS API and the worker need a
  host that runs a process.

---

## [3.17.0] - 2026-08-24

### Added

- **Loading Behaviour.** Eight Frozen sections name it and there were zero
  `loading.tsx` files, so clicking a Listing Card did nothing visible for as
  long as the API took — up to I25's ten-second budget. Five files now cover the
  fourteen routes that wait.
- The Skeleton I26 named and did not build, now that there is a loading state to
  put it in. Words carry the state (`role="status"`, `aria-busy`); the shapes are
  `aria-hidden`, because grey rectangles say nothing a reader can use.

### Known — the interesting half

- **No root `app/loading.tsx`, deliberately.** It applies to every segment
  beneath it with no way to opt one out, so it would reach the two places the
  Frozen documents forbid.
- **Home** — UX-0001 §12 requires Search to stay usable while Categories
  resolve, and a `loading.tsx` replaces the whole segment. The compliant answer
  is a Suspense boundary inside the page.
- **Discovery cannot satisfy UX-0002 §13 either way today.** Without a boundary
  the criteria stay visible but the old result actions stay clickable; with one
  the actions go and so do the criteria. The criteria live in the carrier cookie
  and a `loading.tsx` is a synchronous fallback that cannot read one — the
  compliant answer needs them in the URL, and the cookie was chosen in I4
  precisely so that a prefetch cannot record a Discovery Start. **Two Frozen
  requirements pulling opposite ways through one design decision**, which is an
  Owner question rather than a refactoring.

### Fixed

- **The approved design foundation caught an overreach.** The first version
  pulsed the skeleton behind a `prefers-reduced-motion` guard;
  `i26-design-foundation` failed on "declares no animation", a constraint the
  Owner approved on 2026-08-21 for a stated reason. The pulse is gone — a still
  skeleton says everything a pulsing one does, so the motion was decoration
  bought at the price of somebody else's decision. The constraint is now
  asserted in `i32` too, because a loading screen is the one surface that seems
  to need movement.

### Verified

- 99 test files, 920 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build.
- Five mutations, each caught.
- Nothing has seen a loading state: every claim is computed from rendered
  markup, and no navigation has been slow enough in a browser for anybody to
  watch one appear.

---

## [3.16.0] - 2026-08-24

### Fixed

- **Twenty-two routes had no error boundary and twenty-nine `notFound()` calls
  had no page.** Every uncaught error and every one of those calls produced
  Next.js's built-in screen: English, no route back into the application,
  nothing a person could quote to anybody.
- **The thirteen `notFound()` answers I24 deliberately preserved were being
  given in the wrong language by the increment that made them honest.**

### Added

- `error.tsx`, `global-error.tsx` and `not-found.tsx`, with `failure-copy.ts`
  owning what they say.
- **One message for both `notFound()` situations, on purpose.** They mean either
  "no such address" or "this is not yours", and the second is exactly why the
  first cannot be more specific — a page that told them apart would answer, to
  anybody who asked, whether a given Offering exists.
- `global-error.tsx` declares its own `lang="tr"`: there is nothing to inherit
  from, because the layout that normally declares it is what failed.

### Verified

- 98 test files, 911 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build.
- Seven mutations, each caught. **One passed at first**, and it is the same hole
  as I30's: `failure-copy.ts` is a copy module and sits outside every check that
  walks the route folders. The same conclusion follows — `Ara` and
  `Tekrar dene` are Turkish with none of `ç ğ ı ö ş ü`, so the values are named
  rather than derived.
- **The production build caught the same class of error it caught in I30**: a
  `.js` extension on a relative import, correct for the tests and unresolvable
  by the web bundler, which the type check and all 911 tests passed over in
  silence. Twice now. The web package has none left.
- Widening `i27`'s walk to the application root produced three failures and **all
  three were the check being wrong**, not the code: `layout.tsx`'s struck-through
  historical note read as a live `lang="en"` declaration, and `Ara` and
  `Tekrar dene` were reported as English.

### Known

- **Nothing has seen these screens.** Every claim is computed from rendered
  markup; no browser has thrown a real error into the boundary and `reset` has
  never been pressed.
- `digest` and the platform's correlation ID are two identifiers for two
  different things, and a person holding one cannot be found by the other.
- UX-0004 §14, UX-0008 §14 and UX-0009 §18 remain queued. UX-0003 §16 was
  implemented in I23 and is not claimed here.
- Empty and Loading Behaviour is untouched: eight Frozen sections name it and
  there are still zero `loading.tsx` files.

---

## [3.15.0] - 2026-08-24

### Added

- **Offerings carry visuals.** `offering_visual` holds an address per row with
  `position` as the order and `0` as the primary — the same answer
  `business.logo_url` has given since I1, because object storage would need a
  hosting target and there is none.
- `apps/web/src/image-source.ts`, the single owner of what this application will
  load as an image. `http:` and `https:` only; a refused address is treated
  exactly like an absent one.
- Owner authoring: one address per line, the line order being the visual order.

### Fixed

- **Three Frozen acceptance criteria could only ever half-pass.** Each says to
  present the supplied visual *and* to invent no media when it is absent;
  `listingCardSchema` had no field for a visual at all, and the Presentation
  repository filled `visuals` from a literal `[]`. Only the "absent" half was
  reachable.
- **The Business logo was stored, contracted, and never rendered** — and the
  comment above that section claimed it was one of three fields being shown. The
  sentence was false for as long as the section existed.
- **A missing check became load-bearing.** `logoUrl` has never been validated,
  which was harmless until it became an `src`. The guard is at render, so
  `US-BUS-F02-001` Out of Scope §11 stays true and nothing about what may be
  stored changes.
- **I29's closure record claimed all twenty-two routes speak Turkish. It was
  wrong.** Sixteen English submit labels were on screen — `Save`, `Create`,
  `Define`, `Rename`, `Move`, `Add`, `Send`, `Record` — through all three
  consolidations.

### Verified

- 97 test files, 898 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build.
- Six mutations. **Two passed at first and were the useful ones.** A component
  test cannot prove which visual the API chose, so pointing the Listing Card
  query at `position = 1` passed everything until an integration case inserted
  the rows out of order. And the copy modules sit outside every check that walks
  the routes, so putting `Save` back into `form-copy.ts` passed — the extraction
  that made the copy maintainable moved it out of reach of both detectors.
- **The linter found a real defect**: `String(form.get(...))` turns an uploaded
  `File` into the literal text `[object File]` and would have saved it as an
  address.
- A sixth detector correction was **attempted and abandoned**: applied to the
  copy modules the shape rule produced twenty-five false positives, because most
  Turkish words contain none of `ç ğ ı ö ş ü`. Turkish and English are not
  separable by character class at word level.

### Known

- The Presentation's visual ordering is unproven end to end; flipping
  `order by position` to `desc` still passes.
- **Nothing checks the OpenAPI document against the contracts.**
  `openapi.test.ts` asserts the health operations only, so the published
  description said a Listing Card has six fields while the schema had seven.
- No image is fetched, resized, cached or checked for being an image, and image
  content is unmoderated — `CONTENT_AREA_LABELS` has three values and adding a
  fourth would redefine a Frozen enumeration.
- `alt=""` on every visual, defensible from UX-0003 §8.2 and not verified with a
  screen reader.

---

## [3.14.0] - 2026-08-22

### Fixed

- UX-0006's seven Admin surfaces are Turkish. **All twenty-two routes now speak
  one language**, so `i10`'s `ENGLISH` pattern is deleted rather than emptied —
  an empty pattern would leave a mechanism for declaring exceptions sitting
  ready, describing nothing.
- **The Analytics tables rendered the contract's own identifiers.** An Admin
  read `UNRESTRICTED`, `PUBLISHED`, `NOT_VALIDATED`, `USER_ACCOUNT` and
  `MOBILITY: 3` on the one screen that says how the platform is doing. No
  source-reading test could have found this: the strings are never literals in
  the JSX, they arrive as data, so the English-detector corrected four times
  across I27 and I28 was structurally blind to them.
- **Two comments described an accident as a decision.** `panel.ts` explained the
  English/Turkish division as "not arbitrary"; `layout.tsx` attributed it to
  "the Owner's decision". No Owner made it — it was the order the surfaces
  happened to be written in. Both struck through rather than deleted.

### Added

- `apps/web/src/platform/copy.ts`, and `Alan`, `Moderasyon vakası` and the three
  Domain names in the shared vocabulary. Admin is the first surface to name a
  Domain at all: Home receives the grouping and flattens it.
- The pairwise substring check I28 left open, now that the full label set
  exists. **Its first version reported the design as a bug** — flagging
  `Bu İlanı gizle` for containing `İlan` — so a bare term may be contained and
  nothing else may.

### Verified

- 96 test files, 883 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build.
- Seven mutations, each caught. **One of them passed at first and was the most
  useful.** `tallyLabel` was proven by a unit case, and putting the raw Domain
  key back on screen passed anyway — a function being right says nothing about
  whether the surface calls it. The assertion is now against rendered markup and
  matches the *shape* of a contract identifier, so a value added upstream and
  rendered raw fails without anybody remembering to add it.
- **The production build caught what nothing else did.** The new imports used
  `.js` extensions — correct for the tests, unresolvable by the web bundler —
  and the type check and all 883 tests passed over it in silence.
- Sixteen existing tests updated, none weakened.

### Known

- The Turkish still has not been read by a Turkish speaker other than its
  author, and there is now three times as much of it.
- `Ulaşım` for Mobility rather than `Vasıta`: the familiar word names the
  vehicle where Mobility is the grouping.
- The pairwise check covers labels, not sentences. `i24` asserted on
  `yüklenemedi`, which two messages now share; that was found by breaking.
- §9.1 remains unanswered and now blocks i18n alone.

---

## [3.13.0] - 2026-08-21

### Fixed

- UX-0005's five Business Dashboard surfaces are Turkish. Second of three;
  Admin's seven remain.
- **Three of four eligibility labels contained the fourth as a substring.**
  `Herkese açık değil` contains `Herkese açık`, so an assertion that a withheld
  Offering is *not* shown as public would have passed while the screen said the
  opposite. `INELIGIBLE`, `PENDING` and `WITHDRAWN` are reworded so no label is
  a substring of another.
- **`Arşivle` was a prefix of `Arşivlenmiş`**, the heading an Archived Offering
  sits under — "this screen offers no Retire action" would have been satisfied
  by the heading. The action is `Arşive kaldır`.
- Nine single-word English labels — `Title`, `Address`, `Category`,
  `Attributes`, `Saved.`, `Status`, `Checked`, `Handoff` — that three earlier
  versions of the detector walked past.

### Added

- `apps/web/src/business/copy.ts` for what was left inline in the pages. The
  refusal messages stay beside the refusal codes they map from, so a code added
  upstream breaks the file that has to answer for it.
- `affiliateDestination` and `correctionNotice` in the shared vocabulary.

### Verified

- 96 test files, 880 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build. Five
  mutations run, each caught.
- **The English-detector has now been wrong four times**, and each correction
  found real defects the previous one missed. A mutation restoring
  `<h2>Offerings</h2>` passed against the third version; dropping its two-word
  minimum caught it and nine more.
- Nine existing tests updated, none weakened — each asserted an English string
  for behaviour that has not changed.

### Known

- Admin's seven surfaces remain English.
- The substring hazard is fixed where found, not prevented; a pairwise check
  across all labels is worth adding once the third area lands.
- The Turkish still has not been read by a Turkish speaker other than its
  author, and there is now twice as much of it.

---

## [3.12.0] - 2026-08-21

### Fixed

- **The application was bilingual and nobody chose it.** The root declared
  `<html lang="tr">` and the public journey was Turkish, while eighteen surfaces
  declared `lang="en"` and were written in English. A person searched for a
  listing in Turkish, pressed *Giriş*, and arrived at **Sign in**.
- UX-0008's six surfaces — sign in, register, confirm, recovery, reset, account
  — are Turkish, and their `lang="en"` markers are gone.

### Added

- `apps/web/src/vocabulary.ts`: the Frozen domain terms in Turkish, in one
  place, so three translations cannot produce three words for one concept.
  Anchored to what Discovery and Compare have said since I4.
- `apps/web/src/identity/copy.ts`: every string those six surfaces say,
  **extracted rather than inlined** — which is the shape §9.2 of the design
  foundation says real multi-language support needs.

### Verified

- 96 test files, 879 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build. Seven
  mutations run, each caught.
- Two security properties asserted rather than assumed across the translation:
  a failed sign-in still names neither half, and a spent, expired or forged link
  still gets one message.
- **One test passed while it was wrong**, and is recorded: it listed English
  words to look for and missed two entire English sentences whose first words
  were not on the list. Rewritten to look for rendered text containing no
  Turkish-specific letter, it caught both.

### Known

- Twelve surfaces remain English: the Business Dashboard's five and Admin's
  seven. Next two increments.
- The Turkish has not been read by a Turkish speaker other than its author.
- `toLocaleUpperCase("tr")` is used nowhere yet; a plain `toUpperCase()` would
  turn *ilan* into *ILAN* rather than *İLAN*.
- §9.1 unanswered — interface-only, content too, or locale-scoped catalogue.

---

## [3.11.0] - 2026-08-21

### Added

- A visual design foundation — the first in the repository. No Frozen UX
  document specifies visual design, so it was proposed in
  `docs/design/DESIGN_FOUNDATION_CANDIDATE.md`, approved by the Owner on
  2026-08-21 with the direction **calm, content-first**, and implemented here.
- A token layer in `globals.css` owning every colour, size and spacing value:
  seven colour tokens, a five-step type scale, an eight-step space scale.
- Three breakpoints where there were none, and **both tables become stacked
  labelled rows below 768px** rather than scrolling sideways.
- `tests/i26-design-foundation.test.ts`, which parses the real stylesheet and
  enforces every contrast ratio, plus what the direction forbids: no shadow, no
  animation, no removed focus ring, no fourth colour, no fourth breakpoint.

### Fixed

- **A control border failed WCAG 1.4.11 at roughly 1.6:1** — in the existing
  code *and* in the approved proposal, which published an estimated 3.1:1 for a
  colour that measures 1.63:1. Measuring before writing caught it;
  `--border-strong` is now `#818894` at 3.42:1.
- **The typeface was never loaded.** `Inter` was asked for and nothing fetched
  it, so the application rendered in whatever the visitor's system supplied.
- **There was no responsive design.** Zero media queries application-wide.

### Changed

- The candidate document's colour table is corrected in place with measured
  values and a note saying what it had claimed.
- Body text is 16px rather than 15px — the size at which a phone will not zoom a
  focused input.

### Verified

- 95 test files, 871 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build. Seven
  mutations run, each caught.

### Known

- **A deviation from the approved §5, recorded rather than hidden**: no webfont
  is loaded. `next/font/google` fetches at build time and failed the build here,
  which would make every deployment depend on a third party. `next/font/local`
  with committed files is the way back.
- Nobody has seen this. Every claim is computed; no screenshot, no device, no
  person. R4.7 remains open.
- Dark mode absent, no `loading.tsx` so no Skeleton, and the application is
  still bilingual across fourteen surfaces.

---

## [3.10.0] - 2026-08-19

### Added

- A ten-second budget on every read the web application makes of the API,
  closing the last untimed dependency edge in the repository. Postmark had ten
  seconds, the Chat provider eight, PostgreSQL five and two — and the edge a
  person actually waits on had none, across 27 call sites. Node's `fetch` has no
  default.
- `fetchWithBudget`, `apiTimeoutMs` and `DEFAULT_API_TIMEOUT_MS` in
  `apps/web/src/api-error.ts`, with `API_TIMEOUT_MS` for a deployment to set.

### Changed

- A timed-out read raises `ApiRequestError` with `504`, which
  `isApiUnavailable` already covers — so a hang reaches the bounded surfaces I23
  and I24 built with no new branch anywhere.
- Sixteen reads are budgeted; **the eight writes deliberately are not.**
  Aborting a write does not undo it, so reporting a timeout as a failure would
  claim an outcome this application does not know.

### Verified

- 94 test files, 860 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build. Six
  mutations run, each caught. The central case drives a `fetch` that resolves
  only when its signal aborts, because a rejected promise would prove nothing.

### Known

- Ten seconds is a judgement, not a measurement — the third such number after
  `DATABASE_POOL_MAX` and `statement_timeout`. R3.4 asks for all of them under
  load.
- Nothing counts web timeouts. The web application publishes no metrics at all,
  so a deployment cannot see whether the number is right; §12.2 has never been
  read against it.
- UX-0003 §16, UX-0004 §14, UX-0008 §14 and UX-0009 §18 remain queued.

---

## [3.9.0] - 2026-08-19

### Fixed

- **During a database outage the platform told a Business owner their own
  Business does not exist, and an Admin that the Admin panel does not exist.**
  One line, `if (!response.ok) return null;`, appeared thirteen times across the
  two authenticated api layers and collapsed "not here or not yours" into "the
  API did not answer". Thirteen pages then turned that into `notFound()`.
- The correction-notices region rendered **nothing** on a failed read, under a
  comment explaining that an empty list "would say nothing needs your attention,
  which is not what a failed read means". Rendering nothing says the same thing.
- The Create Offering control vanished when the catalogue could not be read,
  which reads as a permission being withdrawn rather than a temporary failure.

### Added

- `absentUnlessUnavailable`, which throws on `5xx` and keeps `4xx` meaning
  absent — `401`, `403` and `404` refuse without confirming existence, and
  turning them into "unavailable" would leak that there is something there.
- `orUnavailable` and `isUnavailable`, carrying the third answer as a symbol
  rather than another `null`, because the defect was two facts sharing a value.
- A bounded authenticated unavailable surface that lists nothing, counts
  nothing and offers no action — UX-0006 §14's "distinguish zero from
  unavailable" and both documents' "actions remain unavailable until the
  authoritative target state is resolved".

### Verified

- 93 test files, 852 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build. Six
  mutations run. **One passed, and correctly**: three comments claimed the order
  of the two checks was the requirement, and it is not — they are mutually
  exclusive. The comments are corrected rather than deleted.

### Known

- Reads only. UX-0005 §15's failed-save and failed-action lines concern the
  mutation paths and were not re-examined.
- UX-0003 §16, UX-0004 §14, UX-0008 §14 and UX-0009 §18 remain queued.
- Still no `fetch` timeout anywhere in the web application: 27 call sites, 0
  with a signal, so a hanging API reaches none of these surfaces.

---

## [3.8.0] - 2026-08-19

### Added

- The Error Behaviour the Frozen UX documents specify, for the public path.
  **All eight carry an "Error Behaviour" section and the web application
  implemented none of them** — twenty-two routes, zero error boundaries — so any
  failed read threw and Next.js replaced the whole page with its crash screen.
  Nothing in this repository had recorded the gap.
- `apps/web/src/api-error.ts`: `ApiRequestError` keeps the status the API
  answered instead of folding it into a message, and `isApiUnavailable` is `5xx`
  only. A `4xx` is this application's mistake and a `TypeError` is a defect, and
  both keep reaching the crash screen rather than being hidden behind a retry
  that cannot work.
- One bounded surface serving UX-0001 §13 and UX-0002 §14 together, because
  "the route did not begin" and "the results did not arrive" are one moment for
  the person. It fetches nothing, so no Discovery Start and no `Offering
  Presentation Open` can arise from a failure.
- A bounded surface for a Listing Card that could not be opened, keeping the
  Discovery context and offering no Decision or Compare action over a
  Presentation the application could not read.

### Changed

- `SearchEntry` accepts an initial query, so the unavailable surface re-offers
  the same component Home uses, pre-filled. "The entered query remains" and "the
  person may retry or edit the query" are one field, and there is one Search
  entry in this application rather than two.
- `applyFilters` returns without writing the carrier when the offered Filters
  cannot be fetched. All three parts of §14's Filter application error are that
  one absence.
- Every recovery is a submission rather than a link. A prefetched link into
  Discovery would record the Discovery Start that the failure specifically did
  not claim.

### Verified

- 92 test files, 845 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build. Six
  mutations run, each caught.

### Known

- Six of the eight documents are untouched: UX-0003 §16 beyond the Listing Card
  case, UX-0004 §14, UX-0005 §15, UX-0006 §15, UX-0008 §14, UX-0009 §18.
- Empty and Loading Behaviour is a separate gap; there are 0 `loading.tsx`
  files.
- Nothing distinguishes a slow API from an unavailable one — no `fetch` timeout
  in the web application.

---

## [3.7.0] - 2026-08-19

### Added

- Honest degradation when PostgreSQL is unavailable, per R3.6 of the release
  criteria candidate and Engineering Constitution §13. Measured first: a real
  embedded server was stopped underneath a running API.
- `classifyDatabaseFailure()` in `@commerce/database` — one function covering a
  cancelled statement, a connection the pool could not hand out, and a server
  that is not there. The third was missing, so an absent database fell through
  to `INTERNAL_ERROR`.
- `commerce_db_unavailable_total`, separate from the timeout counter, and
  `commerce_db_reachable`, which is the cheapest possible outage alert.

### Changed

- Every route answers `503 DEPENDENCY_UNAVAILABLE` during an outage instead of
  `500 INTERNAL_ERROR`. The platform was reporting a defect it did not have, on
  every request, for the whole duration of somebody else's outage — and telling
  clients not to retry.
- `/metrics` survives an outage. It answered `500` before, losing the pool gauges
  and counters that never needed a database. The database-derived gauges are
  **omitted rather than zeroed**, because `commerce_outbox_pending 0` reads as
  "mail is flowing" and would silence the alert that should be loudest.

### Fixed

- **I20's content-type fix was incomplete and its closure record overstated it.**
  The header was moved past the permission check and still ran before the scrape,
  so any collection failure reproduced the identical serialisation error — which
  is exactly what a database outage caused. It is set after the body now. The bug
  was never "the decorator applies too early"; it was "the header is set before a
  body is known to exist".

### Verified

- 91 test files, 837 tests, plus formatting, linting, module boundaries, type
  checking, no OpenAPI drift, dependency audit and a production build. Six
  mutations run, each caught. One was missed by the first version of its test:
  the content-type bug leaves the status and the code unchanged at `500
  INTERNAL_ERROR`, and only the envelope's message differs — which is how I20
  believed it was finished.

### Known

- This is R3.6's behaviour, not its evidence. Performing a deliberate outage in a
  non-production environment still needs an environment.
- The web application's behaviour on a `503` was not assessed.
- Nothing retries, and nothing alerts on `commerce_db_reachable`.

---

## [3.6.0] - 2026-08-19

### Added

- One correlation identifier across every boundary, per Engineering Constitution
  §12.3. The identifier already existed in the error envelope and in every
  `audit_record`, and reached neither of the two places an incident starts from.
- `apps/api/src/http/correlation.ts`, the single owner of the identifier. It is
  computed once per request by Fastify's `genReqId`, so the framework's request
  id and the application's correlation identifier are the same value.
- `outbox_event.correlation_id`, nullable and indexed
  (`20260819000100_outbox_correlation`). The worker reads it back and stamps it
  on `outbox_delivered` and `outbox_delivery_failed`, so "the confirmation email
  never arrived" can be joined to the request that asked for it.
- An `onSend` hook echoing `x-correlation-id` on every response. A request that
  succeeded previously gave the caller no identifier at all, the envelope
  existing only on failures.

### Changed

- Fastify's automatic request and response lines carry the caller's identifier in
  `reqId` instead of `req-1`, `req-2`. A per-process counter is a different
  request on every replica, which is worse than no identifier because it looks
  like one.
- `createLogger` takes an optional destination, so a test can read what was
  written. Unset means pino's default, which is what a deployment collects.

### Verified

- 90 test files, 829 tests, plus formatting, linting, module boundaries, type
  checking, dependency audit and a production build. Three mutations run, each
  caught: removing `genReqId`, writing `null` to the outbox column, and trusting
  a malformed header.

### Known

- Nothing joins the API's and the worker's logs, because there is no log
  aggregator. The identifier is present on both sides.
- The web application does not send an identifier of its own.
- Only the two identity producers stamp the outbox; a future producer that
  forgets leaves `null`, and nothing enforces otherwise.

---

## [3.5.0] - 2026-08-18

### Added

- Metrics, in the Prometheus text exposition format, on an `/metrics` endpoint
  that takes a bearer token or an entered Admin context. Engineering
  Constitution §12.2 requires every production component to expose them and
  there were none. This is R1.1 of the release criteria candidate.
- The set answers the questions I17, I18 and I19 raised and left unanswerable —
  pool saturation against its ceiling, timeout counts, outbox backlog and dead
  letters, and rows waiting for the retention sweep. Every series carries a
  `HELP` line saying what to do about it.

### Changed

- `IDENTITY_GRACE_MS`, `OUTBOX_RETENTION_MS` and `THROTTLE_RETENTION_MS` moved
  to `@commerce/database`, beside the expired-state SQL. The gauge counts rows
  waiting to be swept using the identical windows the sweeper deletes by.

### Fixed

- `@Header("content-type", "text/plain")` on the metrics route broke every
  failure path: Fastify was asked to send the JSON error envelope as text and
  refused, turning a `404` into a `500` about serialisation. The type is set
  after the permission check instead.

### Verified

- 89 test files, 825 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift — the endpoint is deliberately
  outside the contract — dependency audit and a Next.js production build. Five
  mutations run, each caught. The hardest to notice in production is separate
  `Counters` for the filter and the collector, which reads exactly like "no
  timeouts happened".

### Known

- Nothing alerts on any of this. Metrics nobody is paged on are a dashboard.
- Timeouts are counted for the API only.
- No latency, request volume or error rate in round one.

---

## [3.4.0] - 2026-08-18

### Added

- The database dependency's timeout behaviour, which Engineering Constitution
  §13 has required a definition for and which did not exist: a query that hung
  held its connection until PostgreSQL or TCP gave up. `statement_timeout` at
  five seconds and `connectionTimeoutMillis` at two are Owner decisions of
  2026-08-18; `idle_in_transaction_session_timeout` at ten seconds covers what a
  statement timeout cannot, since `begin` followed by nothing is not a running
  statement. All three sit on the connection, so no statement escapes them, and
  all three are configurable.
- A required error handler on `createDatabasePool`, on both the pool and every
  client. A dead connection emits `error` and an emitter with no listener
  throws, so the idle-transaction timeout without this would have crashed the
  API on exactly the condition it exists to survive.

### Fixed

- A statement PostgreSQL cancelled was reported as `500 INTERNAL_ERROR`, telling
  a client this was a defect and retrying was pointless. It now answers
  `503 DEPENDENCY_UNAVAILABLE` — a code already published for that status, so
  the contract is unchanged — and logs at `warn` rather than `error`.

### Verified

- 88 test files, 817 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift, dependency audit and a Next.js
  production build. The six new cases drive real hangs against a real database:
  a timeout that is configured and does not fire is worse than none, because it
  is believed. Five mutations run, each caught. The first implementation
  listened for errors only on the pool, which covers an idle connection but not
  a checked-out one — caught by the test that holds its client while the server
  kills the session, and recorded rather than smoothed over.

### Known

- Five seconds is a judgement, not a measurement.
- A timeout ends the request and nothing retries. §13 lists retry alongside
  timeout; a database retry policy has not been designed, which is better than
  one that repeats an operation nobody decided was safe to repeat.

---

## [3.3.0] - 2026-08-18

### Fixed

- One API instance could open a hundred and fifty PostgreSQL connections.
  Every repository built its own `Pool` — fifteen of them, ten connections each
  by `pg`'s default — against a database whose own default `max_connections` is
  a hundred. A second instance was arithmetically impossible, one instance could
  exhaust a default-configured database by itself, and the pools could not lend
  each other anything: fourteen sat idle while the fifteenth queued.
- A comment in `chat.service.ts` claimed a saturated pool would stop every
  request in the process. Chat had its own pool when that was written, so it
  starved only Chat. The sentence is true now.

### Changed

- `createDatabasePool()` in `@commerce/database` is the only place a pool is
  built. The API registers it as its `Pool` provider and closes it once through
  `DatabaseLifecycle`; the worker holds it in `main` and shares it between the
  outbox and the retention sweep. Repositories take it as a dependency.
- `DATABASE_POOL_MAX` sets the ceiling, defaulting to ten. The right number is a
  property of the deployment: instances times max must stay under
  `max_connections`.

### Verified

- 87 test files, 811 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift, dependency audit and a Next.js
  production build. The budget is asserted against `pg_stat_activity`, not by
  counting `new Pool(` in the source. Three mutations run, each caught. The new
  test was wrong twice — it drove a single route, which cannot reveal a second
  pool, and its ceiling assertion would have been satisfied by zero — and both
  corrections are recorded rather than quietly applied.

### Known

- Ten is a default, not a measurement. Nothing here has been load-tested.
- Nothing bounds how long one request may hold a connection.

---

## [3.2.0] - 2026-08-18

### Added

- A retention sweep in the worker, on a five-minute interval, implementing the
  "session cleanup" ADR-0012 §3 has named as a mandatory control since it was
  accepted. Six tables carried an `expires_at`, five indexed it, and nothing had
  ever used that index to delete a row.
- Retention windows as an Owner decision of 2026-08-18, recorded in
  `docs/implementation/I17_RETENTION_SWEEP.md`: expired registrations and
  password resets at expiry with no grace, processed outbox events after thirty
  days, dead letters never.

### Fixed

- A Decision Flow built on a Comparison Set could be destroyed mid-decision.
  Both records lived sixty minutes from their own creation and a flow is always
  built on a set that already exists, so the flow always claimed to outlive the
  set whose `ON DELETE CASCADE` was going to take it.
  `enterWithComparisonSet` now caps the flow at its set's expiry.

### Changed

- The two expired-Decision-state statements moved to `@commerce/database`, so
  the four callers that sweep it cannot drift apart. That is the only reason
  `apps/api` and `apps/worker` now depend on that package.

### Verified

- 86 test files, 808 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift, dependency audit and a Next.js
  production build. Four mutations run, each failing exactly one case. Two of
  the eight new cases were wrong on the first attempt — one seeded a dead letter
  too fresh for its own mutation to bite, one reproduced the statement it was
  checking — and both corrections are recorded rather than quietly applied.

### Known

- The sweep has never run against a table with a real backlog.
- Occurrence tables are deliberately untouched. A retention policy for evidence
  is a different decision and has not been asked.

---

## [3.1.0] - 2026-08-18

### Removed

- `TestPrincipalAdapter`, its fallback branch in `PrincipalResolver.resolve`,
  the `ENABLE_TEST_PRINCIPAL` environment variable and the two contract tests
  that described the adapter. It built a principal from `x-test-user-id`
  headers because M11 had an authenticated HTTP surface and identity was two
  increments away; it refused to construct in production, so it was never a way
  in, but it was a second code path to who a request is. `I1` recorded that it
  should go once nothing depended on it — one suite still did.

### Changed

- `tests/m11-http.integration.test.ts` authenticates through a real session:
  register, process the outbox, follow the emailed confirmation link, keep the
  cookie. Its malformed-principal case presents a malformed session token.
- `Principal.businessId` is required (`string | null`). It was optional, and
  every caller read absence as *skip the Business context check* — a bypass
  living in the type as a legitimate state. `null` is the authenticated User
  baseline and is refused like any other Business.

### Verified

- 85 test files, 800 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift, dependency audit and a Next.js
  production build. Three mutations run: removing the Business context check
  and admitting an unresolvable session each fail exactly one test; removing the
  early missing-cookie guard fails nothing, which is recorded in the closure
  rather than papered over. The migration and drift gates remain CI-only.

### Known

- The adapter's production refusal was never exercised in production. It is
  deleted for having no remaining caller, not for evidence it was ever reached.

---

## [3.0.0] - 2026-08-17

### Note on the gap

**This file stopped being maintained at `[2.8.0]` on 2026-07-25, before the
first increment closed.** Everything between — fifteen increments, all 50
Generated Stories delivered, two vendors chosen — was recorded contemporaneously
in `CURRENT_STATUS.md`'s Revision History and in one closure record per
increment, and nowhere here.

This entry does not reconstruct those months as dated releases. Writing
retrospective entries from a record written elsewhere would produce a second
account to keep in step with the first, and this repository's own principle is
Reference Never Redefine. What follows is the milestone-level change and a
pointer to where the detail actually lives.

### Added

- Fifteen delivery increments, I0 through I14. Each through I13 was proven green
  on the target runner before the next opened; I14 has passed the full chain
  locally and its CI result is not recorded here. Per-increment detail is in
  `docs/implementation/I*_*_CLOSURE.md` and in `CURRENT_STATUS.md` §Revision
  History, versions 2.9 through 2.36.
- An executable platform against the Frozen baseline: identity and sessions,
  the catalog and write model, publication and Discovery, the public web
  journey, Compare and the Decision flow, Business management, Admin
  operations, and every Frozen UX document's surface.
- Outbound email through Postmark and Decision Chat through Anthropic, both
  chosen by the Owner on 2026-08-17 and both reached through a port that was
  written and tested before either was named.

### Changed

- All 50 Generated Stories moved `Not Started` → `Done`, each against
  per-criterion evidence recorded in
  `docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`. 526 Acceptance Criteria
  are matched to the tests that verify them.

### Verified

- 84 test files, 790 tests, module boundaries, type checking, formatting,
  linting, dependency audit, reproducible OpenAPI and a Next.js production
  build. The migration and schema-drift gates run only in CI and are the one
  part of the chain no local run has ever executed.

### Known

- `docs/traceability.md` remains Frozen v1.0; its superseding revision is
  written as a Draft candidate and awaits Owner review.
- Neither vendor has received a real request.

---

## [2.8.0] - 2026-07-25

### Added

- Prisma 7 PostgreSQL schema and controlled initial migration for the first
  vertical-slice data boundary.
- Database-owned typed-value, lifecycle, version, outbox, full-text, and
  trigram invariants.
- Reproducible OpenAPI 3.1 contract generation and contract test.
- Enforced module dependency rules and CI PostgreSQL migration application.
- First safe vertical-slice readiness record and negative authorization matrix.

### Verified

- Prisma validation, formatting, lint, boundary checks, strict TypeScript,
  contract tests, non-Web builds, and dependency audit pass locally.
- No Critical or High dependency vulnerability is reported.
- PostgreSQL migration application and Next.js production build remain target
  CI evidence; I0 is not yet closed.
- All Frozen Generated Stories remain `Delivery Status: Not Started`.

## [2.7.0] - 2026-07-25

### Added

- Living implementation backlog covering all 50 Frozen Generated Stories.
- Governed delivery sequence and first vertical-slice definition.
- TypeScript npm-workspace skeleton for Next.js Web, NestJS API, Worker,
  technical packages, and nine domain-module boundaries.
- Strict TypeScript, ESLint, Prettier, Vitest, structured redacted logging,
  runtime configuration validation, API health endpoints, and local PostgreSQL.

### Verified

- Formatting, lint, strict TypeScript, two contract tests, API build, Worker
  build, shared-package builds, and domain-module builds pass.
- The restricted verification environment lacks the process-memory interface
  required by Next.js production build; target CI must rerun that build before
  I0 closes.
- All 50 Frozen Generated Stories remain `Delivery Status: Not Started`.

## [2.6.0] - 2026-07-25

### Approved

- The Product Owner approved the exact V1 Software Architecture Final Review v0.2 candidate.

### Frozen

- V1 Software Architecture v1.0, covering backend, frontend, data, security, infrastructure and system architecture.

### Confirmed

- The lifecycle transition introduced no technical-behavior or product-scope change.
- ADR-0010 through ADR-0014 remain Accepted v1.0.
- M8 Software Architecture is complete; development remains Not Started.

## [2.5.0] - 2026-07-25

### Accepted

- ADR-0010 — V1 System Shape and Module Boundaries.
- ADR-0011 — Persistence, Projection and Search Architecture.
- ADR-0012 — Identity, Session and Authorization Architecture.
- ADR-0013 — Deployment and Infrastructure Architecture.
- ADR-0014 — Decision Chat Provider Boundary and Data Handling.

### Reviewed

- V1 Software Architecture Final Review passed with zero blocker and zero major finding.
- The exact architecture package advanced to In Review v0.2 and is ready for Owner Approval; it is not yet Frozen.

## [2.4.0] - 2026-07-25

### Frozen

- Marketplace Bible v1.0 documentation baseline.
- Five Foundation documents after lifecycle reconciliation.

### Added

- Marketplace Bible v1.0 baseline manifest.
- Marketplace Bible v1.0 Final Freeze Gate review evidence.

### Clarified

- Closed the obsolete V1 Scope Decision Chat ownership observation through ADR-0001, Frozen PRD-0004, Frozen UX-0009, and Frozen traceability.
- Opened M8 Software Architecture; all Generated Story Delivery Status values remain Not Started.

## [Unreleased]

### Corrected

- Added the missing 2026-07-25 Owner Freeze evidence to the Frozen Platform Parent Story and ten Platform Generated Stories; aligned each Generated Story's `Freeze State`, date, and owner without changing behaviour or Delivery Status.
- Corrected the Draft Offering Implementation Blueprint metadata path to
  `docs/blueprints/OFFERING_IMPLEMENTATION_BLUEPRINT.md` and fixed the direction
  stated in its existing v0.4 revision note.
- Clarified in the living traceability record that Generated Story candidate
  states embedded in Frozen Parent Story Documents are historical review
  snapshots; the current lifecycle authority remains the 50 Generated Story
  files, all `Frozen v1.0` with Delivery Status `Not Started`.
- Preserved all six Frozen Parent Story baselines without editing them in place.

### Planned

- Marketplace Bible v1.0 freeze gate
- Software Architecture
- Development Phase

### Validated

- Completed Feature-level validation for all 50 authoritative Feature IDs across Offering, Discovery, Identity, Decision, Business, and Platform.
- Confirmed one Parent placement and one first Generated Story for every Feature.
- Confirmed all 50 Generated Stories remain Frozen with Delivery Status `Not Started`.
- Resolved `UX-0007 Messaging` treatment for V1: retained as historical Draft v0.2 outside the Frozen V1 baseline and not used by any validated V1 Feature chain.

### Traceability Lifecycle

- Approved the exact reviewed traceability v0.8 candidate as v1.0 after Architecture Review and Final Review passed.
- Separately froze traceability v1.0 as the authoritative current V1 cross-tier baseline.
- Changed no product, UX, Feature, Story, Capability, Delivery Status, or implementation behaviour.

### Engineering Constitution Lifecycle

- Recovered the clean Engineering Constitution Draft v0.1 candidate and validated it against the current Frozen governance, Accepted ADR, Story-standard, and traceability baselines.
- Preserved the historical Draft v1.3 as non-authoritative source history rather than treating its noncanonical pre-approval version as an authoritative baseline.
- Recorded that the recovered Claude package contained an audit prompt but no completed Claude verdict; no independent-audit result was inferred.
- Closed Architecture Review and Final Review with no Blocker, Major, or required correction.
- Approved the exact reviewed candidate as v1.0 and separately froze it as the authoritative universal engineering-governance baseline.
- Changed no product behaviour, Story behaviour, Story Delivery Status, implementation, infrastructure, or ADR.

---

## [2.0.0] - 2026-07-25

### Capability Architecture

- Approved and separately froze the exact reviewed Offering Capability Architecture v2.0 candidate.
- Added Handoff Enablement as the authoritative capability home for F06 and F07 under Accepted ADR-0008.
- Preserved PRD-0001 as sole behaviour owner and PRD-0005/PRD-0006 as supporting relationships.
- Preserved F01–F05 and left F02 Deferred / Not Yet Decided.
- Superseded Frozen v1.0 without editing its historical baseline.

### Repository Reconciliation

- Updated traceability, repository index, current status, roadmap, and changelog records.
- Changed no PRD, UX, Story behaviour, Delivery Status, or implementation decision.

---

## [1.9.0] - 2026-07-25

### Restored

- Recovered and installed the authoritative Frozen PRD-0001 through PRD-0006 sources from the completed audit packages.
- Recovered the current Frozen V1 UX baseline: UX-0001 through UX-0006, UX-0008, and UX-0009.
- Added Accepted ADR-0006 through ADR-0009 and reconciled the ADR index.
- Added Frozen Discovery, Identity, Decision, Business, and Platform Feature Registries. Offering Feature-ID ownership remains with `OFFERING_CAPABILITY_ARCHITECTURE.md`.

### User Story Layer

- Restored 6 Frozen Parent Story Documents.
- Restored 50 Frozen Generated Stories:
  - Offering: 7
  - Discovery: 10
  - Identity: 9
  - Decision: 7
  - Business: 7
  - Platform: 10
- Preserved all Story Delivery Status values as `Not Started`.
- Reconciled the exact Approved Platform Story package to the explicit 2026-07-25 Owner Freeze decision by changing only lifecycle status metadata to `Frozen`; versions and dates remain unchanged.

### Repository Reconciliation

- Reconciled `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, `docs/repository/REPOSITORY_INDEX.md`, `docs/README.md`, and `docs/traceability.md` to the recovered canonical source state.
- Renamed the ADR-0003 file to its canonical path without changing its content.
- Preserved `UX-0007 Messaging` as Draft v0.2 because no explicit retirement, deletion, approval, or freeze decision was recovered.
- Did not apply non-blocking audit observations to Frozen Story baselines.
- Created no new Feature, Capability, PRD behaviour, UX behaviour, Story behaviour, Delivery Status, or implementation decision.

### Next Gate

- Upload and verify the reconciled repository on GitHub.
- Complete Feature-level traceability validation before the Marketplace Bible v1.0 freeze gate.

---

## [1.8.0] - 2026-07-20

### Added or recorded

#### ADR and Governance
- ADR-0004 — Capability Architecture Layer Recognition — **Accepted v1.0** on 2026-07-19.
- `REPOSITORY_GOVERNANCE.md` completed Formal Architecture Review, Final Review, explicit Owner Approval, and separate Owner Freeze — **Frozen v1.0**.
- Repository management-document reconciliation recorded as the immediate follow-up required by Frozen `REPOSITORY_GOVERNANCE.md` §12.

#### Canonical Source-State Inventory
- Governance process documents: `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `ADR_PROCESS.md` — **Draft v0.1**.
- `USER_STORY_HANDBOOK.md` — **Draft v0.9**.
- PRDs: PRD-0001 **Approved v1.1**; PRD-0003 **Approved v1.0**; PRD-0002 **Draft v0.1**; PRD-0004 **Draft v0.4**; PRD-0005 and PRD-0006 **Draft v0.1**.
- UX: UX-0001 through UX-0008 remain **Draft** (v0.1 or v0.2 according to each canonical header).
- `ENGINEERING_CONSTITUTION.md` — **Draft v1.3**.

### Changed

- `CURRENT_STATUS.md` updated to v1.8 and reconciled to canonical source headers.
- `PROJECT_ROADMAP.md` updated to v2.9 with a source-recovery sequence and explicit readiness gates.
- Completion percentages were suspended during recovery because previous values counted unsupported Baseline/Frozen claims as complete.
- New `US-0002 Discovery` Story Architecture production is blocked until `PRD-0002`, `UX-0001`, `UX-0002`, and `USER_STORY_HANDBOOK.md` complete their lawful lifecycle.

### Corrected

- Corrected the unsupported claim that `USER_STORY_HANDBOOK.md` was Baseline v1.0; its canonical source remains Draft v0.9.
- Corrected the unsupported claim that the complete PRD layer was Frozen; the current PRD sources are mixed Approved/Draft.
- Corrected the unsupported claim that the UX layer was Frozen; all current UX sources remain Draft.
- Corrected the unsupported claim that the governance layer was fully complete; three governance process documents remain Draft v0.1.
- Preserved repository history by annotating earlier entries rather than pretending the unsupported lifecycle events occurred.

### Preserved

- Existing Offering Capability Architecture and F03/F04 reconciliation outcomes remain unchanged.
- ADR-0001 through ADR-0004 remain Accepted.
- F02 remains Deferred / Not Yet Decided and is not recorded as a Feature → Capability association.
- No product behaviour, UX behaviour, Story behaviour, Capability, Feature, Feature ID, Feature → Capability association, implementation decision, or historical source file was changed by this reconciliation.

### Milestone

- Repository source-state recovery opened.
- Next sequence: governance process documents → User Story Handbook → PRDs → UX → `US-0002 Discovery` readiness reassessment.

---

## [1.7.0] - 2026-07-18

### Added or recorded

#### ADR-0003 — Offering Authoring & Publication Feature → Capability Associations (F01–F04) — Accepted v1.0
- F01 → Creation
- F03 → Lifecycle
- F04 → Lifecycle

### Changed through controlled revision

- OFFERING_CAPABILITY_ARCHITECTURE.md reached **Frozen v1.0** and is the authoritative Offering Capability Architecture baseline.
- US-OFR-F03-001 — Offering Retirement reached **Frozen v1.0** and became the current authoritative Golden Baseline.
- US-OFR-F04-001 — Offering Publication reached **Frozen v1.0** and became the current authoritative Golden Baseline.

### Preserved

- The F03 and F04 v0.1 Frozen Golden Baselines remain preserved as historical superseded baselines.
- Story behaviour and all behavioural sections — Purpose, Business Value, Description, Acceptance Criteria, BDD, Dependencies, Out of Scope, Story Size, Delivery Status, and TODOs — remained unchanged.
- F02 — Offering Editing remains **Deferred**; its capability home remains **Not Yet Decided** and is not recorded as an association. Deferred is not a Capability.
- F05 → Presentation remains accepted and recorded under ADR-0002.

### Clarified

- No normative Epic–Capability conflict exists; the Epic–Capability assessment concluded **NO NORMATIVE CONFLICT**.
- Feature → Capability is the authoritative architectural relationship, owned by OFFERING_CAPABILITY_ARCHITECTURE.md.
- No traceability.md change was required.
- Corrected the historical version labels for the preserved F03 and F04 Frozen baselines from v1.0 to v0.1 in the [1.4.0] and [1.5.0] entries.

### Milestone

- Offering Capability and F03/F04 Story reconciliation complete and closed. Approval and freeze were recorded as separate Owner decisions for each document.
- Optional USER_STORY_HANDBOOK.md terminology clarification recorded as non-blocking future maintenance.

---

## [1.6.0] - 2026-07-16

### Added

#### Golden Baseline Story
- US-OFR-F05-001 — Full Offering Detail Presentation — Version 1.0, Status: Golden Baseline

### Story Generation Progress

- Offering Presentation (US-0001 Offering) — **Epic complete**:
  - F05 — Full Offering Detail Presentation (US-OFR-F05-001) — Golden Baseline

### Milestone

- US-OFR-F05-001 review pipeline completed: Architecture Review → ADR-0002 Accepted → Coordinated Controlled Revisions → Final Story Validation → Parent Story Document Reconciliation → Golden Freeze Review → Product Owner / Architecture Owner Approval → Golden Baseline.
- Offering Presentation Epic complete.

---

## [1.5.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F04-001 — Offering Publication — Version 0.1, Status: Frozen Golden Baseline

### Story Generation Progress

- Offering Publication (US-0001 Offering) — **Epic complete**:
  - F04 — Offering Publication (US-OFR-F04-001) — Golden Baseline (Draft → Published)

### Milestone

- US-OFR-F04-001 review pipeline completed: Architecture Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.
- Offering Publication Epic complete.

---

## [1.4.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F03-001 — Offering Retirement — Version 0.1, Status: Frozen Golden Baseline

### Story Generation Progress

- Offering Authoring (US-0001 Offering) — **Epic complete**:
  - F01 — Offering Creation (US-OFR-F01-001) — Golden Baseline
  - F02 — Offering Editing (US-OFR-F02-001) — Golden Baseline
  - F03 — Offering Retirement (US-OFR-F03-001) — Golden Baseline

### Milestone

- US-OFR-F03-001 review pipeline completed: Architecture Review → Architecture Re-Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.
- Offering Authoring Epic complete: F01, F02, and F03 are all Golden Baseline.

---

## [1.3.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F02-001 — Offering Editing — Version 1.0, Status: Golden Baseline

### Story Generation Progress

- Offering Authoring (US-0001 Offering):
  - F01 — Offering Creation (US-OFR-F01-001) — Golden Baseline
  - F02 — Offering Editing (US-OFR-F02-001) — Golden Baseline
  - F03 — Offering Retirement — Next Active Feature

### Milestone

- US-OFR-F02-001 review pipeline completed: Architecture Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.

---

## [1.2.0] - 2026-07-11

> **Correction notice — 2026-07-20:** The Baseline claims recorded in this entry were not supported by the canonical source headers. `REPOSITORY_GOVERNANCE.md` later completed a lawful lifecycle and became Frozen v1.0 on 2026-07-19. `USER_STORY_HANDBOOK.md` remains Draft v0.9. See [1.8.0].

### Added

#### Story Governance Baseline
- USER_STORY_HANDBOOK.md — Version 1.0, Status: Baseline
- REPOSITORY_GOVERNANCE.md — Version 1.0, Status: Baseline
- Story Domain Code Registry (owned by REPOSITORY_GOVERNANCE.md)

### Changed

#### USER_STORY_HANDBOOK.md → Baseline (v1.0)
- Story Governance completed
- Story ID architecture finalized (Generated Story ID: `US-[DOMAIN]-[FEATURE_ID]-[ID]`)
- Story Domain ownership finalized (Domain codes consumed by reference from REPOSITORY_GOVERNANCE.md)
- Feature ID ownership finalized (Feature IDs consumed by reference from OFFERING_CAPABILITY_ARCHITECTURE.md)
- Story Generation Standards finalized

#### REPOSITORY_GOVERNANCE.md → Baseline (v1.0)
- Repository Governance finalized
- Story Domain Registry introduced
- Domain Code ownership finalized
- Repository hierarchy finalized
- Governance ownership model finalized

### Milestone

- USER_STORY_HANDBOOK.md review pipeline completed: Architecture Review → Controlled Revision → Architecture Verification → Validation Review → Freeze Review → Baseline.
- REPOSITORY_GOVERNANCE.md review pipeline completed: Architecture Review → Controlled Revision → Validation Review → Freeze Review → Baseline.
- Story Governance Baseline established; repository Governance phase complete.

---

## [1.1.0] - 2026-07-11

### Added

#### Capability Architecture Layer (Baseline)
- OFFERING_CAPABILITY_ARCHITECTURE.md
- CAPABILITY_COVERAGE_MATRIX.md
- TRACEABILITY_GUIDELINES.md
- Governance recognition of the Capability Architecture layer (Foundation → Capability Architecture → PRD)

### Changed

- Repository Harmonization completed: unified repository layer hierarchy, single owner of the hierarchy established (REPOSITORY_GOVERNANCE.md), Engineering layer recognized in the Layer Authority table, and the traceability status vocabulary single-owned by TRACEABILITY_GUIDELINES.md.
- ENGINEERING_CONSTITUTION.md refactored so detailed User Story standards are governed by USER_STORY_HANDBOOK.md.

### Milestone

- Freeze Review completed.
- Capability Architecture Baseline established.

---

## [1.0.0] - 2026-07-10

> **Correction notice — 2026-07-20:** The layer-wide PRD Frozen and UX Frozen labels below were not supported by the canonical source headers. Current PRD sources are mixed Approved/Draft, and all current UX sources remain Draft. See [1.8.0].

### Added

#### Repository
- Initial repository structure
- Documentation architecture
- Templates
- Repository governance

#### Governance
- REPOSITORY_GOVERNANCE.md
- DOCUMENT_LIFECYCLE.md
- REVIEW_PROCESS.md
- ADR_PROCESS.md
- ADR README

#### Foundation (Frozen)
- VISION.md
- MISSION.md
- PRODUCT_MANIFESTO.md
- PRODUCT_PRINCIPLES.md
- V1_SCOPE.md

#### Architecture Decisions
- ADR-0001 — Decision Chat Ownership (Accepted)

#### PRD Layer (Frozen)
- PRD-0001 Offering
- PRD-0002 Discovery
- PRD-0003 Identity
- PRD-0004 Decision
- PRD-0005 Business
- PRD-0006 Platform

#### UX Layer (Frozen)
- UX-0001 Home
- UX-0002 Discovery
- UX-0003 Offering Detail
- UX-0004 Compare
- UX-0005 Business Dashboard
- UX-0006 Admin Dashboard
- UX-0007 Messaging
- UX-0008 Authentication

#### Repository Management
- CURRENT_STATUS.md
- PROJECT_ROADMAP.md

### Changed

- Decision Chat ownership moved under PRD-0004 through ADR-0001.
- UX layer aligned with Frozen PRDs.
- Compare limit ownership moved to PRD-0004.
- Repository roadmap and status management introduced.

### Fixed

- Cross-layer ownership inconsistencies.
- UX / PRD traceability issues.
- Decision Chat documentation ownership.

---

## Changelog Policy

- Every architectural decision must be reflected here.
- Frozen documents are never edited in place; superseding versions are recorded.
- This file records repository history only and does not replace ADRs or Revision History sections inside documents.
