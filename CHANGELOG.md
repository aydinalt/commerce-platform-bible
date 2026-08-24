# CHANGELOG

All notable changes to the **Commerce Platform Bible** repository are documented in this file.

This project follows the principles of:
- Documentation First Development
- Semantic Versioning
- Single Information Owner
- Reference Never Redefine

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
