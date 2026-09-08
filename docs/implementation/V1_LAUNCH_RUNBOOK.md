# V1 Launch Runbook

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 0.3
- **Date:** 2026-09-07
- **Changed in 0.3:** `productKey` became a required import column and §2.3
  records why. Two entries in §6 were describing gaps that have since been
  closed — the traceability baseline and the destination audit trail — and a
  known-gaps list that names fixed things is one nobody rereads.
- **Supersedes:** Nothing. **This is the first launch document this repository
  has had.** `PROJECT_ROADMAP.md` item 5 says so in as many words — _"Decide
  what M10 Release requires. Nothing in the repository states its criteria"_ —
  and `DEPLOYING_TO_VERCEL.md` §"The first Admin" described a bootstrap that
  predates the seed scripts and told an operator to build the taxonomy by hand.

> **This document does not decide anything.** It records the order the existing
> pieces have to run in, and names what only the Owner can supply. Where a step
> was a decision rather than a command, v0.1 marked it **[DECISION]** and left
> it open; the Owner answered all three on 2026-09-05 and §5 now records the
> answers as given.

---

## 0. What this is not

It is not a go-live checklist in the sense of "the platform is ready when these
boxes are ticked". Nothing in the repository states release criteria, and this
document does not invent them. It answers a narrower question the Owner did
ask: _given a deployed environment, in what order does real data get in, and
what has to exist before each step?_

---

## 1. The order, and why it is this order

Each step depends on the one before it, and skipping one produces a failure
that surfaces somewhere else and reads like a different problem.

| #   | Step         | Command                                         | Depends on                                                              |
| --- | ------------ | ----------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Schema       | `npm run db:deploy`                             | A reachable `DATABASE_URL`                                              |
| 2   | Build        | `npm run build`                                 | —                                                                       |
| 3   | Taxonomy     | `npm run seed:taxonomy`                         | Step 1 (Domains arrive by migration)                                    |
| 4   | Field sets   | `npm run seed:attributes`                       | **Step 3** — it resolves headings by the stable keys the taxonomy wrote |
| 5   | First Admin  | `npm run first-run`, then `npm run admin:grant` | Step 2; a registered account                                            |
| 6   | Catalogue    | `npm run import:catalogue`                      | Steps 2–4                                                               |
| 7   | Verification | `npm run smoke`                                 | Step 6                                                                  |

**Step 4 after step 3 is the one that bites.** `seed-attributes` looks headings
up by stable key and exits non-zero naming the ones it could not find; run out
of order it fails cleanly, which is the good case. Running step 6 before step 4
does _not_ fail — it imports listings with no attribute values, so the catalogue
appears, filters return nothing, and comparison tables are empty columns. That
is the expensive mistake, because it looks like success.

### 1.1 Starting from a development database that has been used

Months of increments leave a development database full of test partners, test
listings and accounts named after the increment that made them. Before a real
import, empty it:

```bash
npm run dev:reset -- --yes    # drops the schema, migrates, seeds 3 and 4 again
```

It refuses any connection that is not `localhost`, and there is no flag to
override that: it destroys everything including the Admin audit trail, which is
append-only precisely so that nothing can erase it selectively. A remote
database that needs rebuilding is rebuilt by somebody typing the commands with
the connection string in front of them.

**A production environment never needs this.** It starts empty; steps 1–4 are
the whole of its preparation.

---

## 2. What the Owner must supply

Everything above is in the repository. These are not, and nothing can proceed
past step 6 without them.

### 2.1 The partner list — `businesses.csv`

| Column             | Required | Notes                                                                                                                                             |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`             | yes      | `a-z0-9-`, the natural key. **Changing it later creates a second Business**, so it is worth getting right once.                                   |
| `name`             | yes      | The public display name. A Business with an empty display name **cannot publish any listing** — this is a publication gate, not a cosmetic field. |
| `shortDescription` | no       | Shown on the listing page. Absent means a thin page rather than a broken one.                                                                     |
| `ownerEmail`       | no       | Defaults to `partner-<slug>@$IMPORT_EMAIL_DOMAIN`.                                                                                                |

### 2.2 The listings — `offerings.csv`

| Column              | Required   | Notes                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `businessSlug`      | yes        | Must match `businesses.csv` or an existing Business.                                                                                                                                                                                                                                                                                                                                           |
| `slug`              | yes        | Unique **within** the Business.                                                                                                                                                                                                                                                                                                                                                                |
| `title`             | yes        |                                                                                                                                                                                                                                                                                                                                                                                                |
| `summary`           | no         |                                                                                                                                                                                                                                                                                                                                                                                                |
| `categoryStableKey` | yes        | e.g. `TECHNOLOGY__KULAKLIK`. Must be an **active leaf** — a sector root is not assignable.                                                                                                                                                                                                                                                                                                     |
| `productKey`        | **yes**    | **The only thing that groups two partners' offers of one product**, and since `I89` also **the key a partner's feed is matched on**. Without it the same headphone from three sellers is three unrelated listings, the comparison the platform exists for does not happen, and no feed can ever update that listing's price. Optional in the platform and required by the importer — see §2.3. |
| `priceKind`         | yes        | `FIXED` or `ON_REQUEST`                                                                                                                                                                                                                                                                                                                                                                        |
| `amount`            | if `FIXED` | `1299.90` or `1.299,90` — both read. Never a negative.                                                                                                                                                                                                                                                                                                                                         |
| `currency`          | no         | Defaults `TRY`                                                                                                                                                                                                                                                                                                                                                                                 |
| `priorAmount`       | no         | Must be **higher** than `amount`; the database refuses a "reduction" that is not one.                                                                                                                                                                                                                                                                                                          |
| `deliveryCost`      | no         | `0` means free; empty means _not stated_. They are different claims.                                                                                                                                                                                                                                                                                                                           |
| `stockState`        | no         | Defaults `IN_STOCK`                                                                                                                                                                                                                                                                                                                                                                            |
| `destinationUrl`    | no         | The affiliate address. Empty is legitimate — the listing appears and compares, it simply cannot be handed off.                                                                                                                                                                                                                                                                                 |
| `imageUrls`         | no         | One or more picture addresses separated by `\|` (not a comma — this is a CSV). **The first is the main photograph**, because the order in the cell becomes the order on the page. Each one is downloaded and checked before the listing is written; see §3.1.                                                                                                                                  |
| `attributes`        | no         | JSON keyed on the **display name** shown in the Admin panel: `{"Bağlantı":"Bluetooth","Kullanım süresi":30}`                                                                                                                                                                                                                                                                                   |

Templates: `data/businesses.example.csv`, `data/offerings.example.csv`.

### 2.3 Why `productKey` is required here and optional in the platform

This is the one place the importer is stricter than the API it drives, and the
difference is deliberate.

A listing with no product key is a legitimate thing for the platform to hold.
It appears in Discovery, it can carry a price and an affiliate button, it
simply stands alone. `PRD-0001` does not require the key and this document does
not ask for that to change.

What such a listing cannot do is either of the two things a _launch_ catalogue
exists to do. `I89` matches a feed row to a listing by `product_key` within the
Business, so a key-less listing is one no partner feed will ever reprice — its
launch-day figure is its figure for ever, and it will be wrong within a week.
Comparison groups listings by the same key, so a key-less listing never appears
beside the competitor it was imported to be compared against.

Until `I92` the column was silent about this. An empty value was dropped from
the request body rather than refused, so the row imported cleanly and looked
correct in the database. The failure surfaced much later and in a form that
does not name its cause — _"why does this price never change"_.

The refusal is therefore in the importer, where an operator is looking at these
rows and can fix them, rather than in the platform, where it would forbid a
listing the product is happy to have.

**`ON_REQUEST` rows are not exempt.** They carry no price for a feed to update,
but they are still one seller's offer of a product somebody else also sells,
and that is the comparison. Left exempt, the exemption would be the obvious
place to put a row somebody could not be bothered to key.

### 2.4 The decisions, as the Owner made them

Recorded in §5. They were the three open items in v0.1.

---

## 3. Running the import

```bash
export IMPORT_PASSWORD='…'          # required; the same value every run
export IMPORT_EMAIL_DOMAIN='partners.example.com'

npm run import:catalogue -- data/businesses.csv data/offerings.csv --dry-run
npm run import:catalogue -- data/businesses.csv data/offerings.csv
```

### 3.1 The pictures

The Owner's reason for asking, and the standard the step is held to: _"İlanların
resimsiz gelmesi, bir karşılaştırma platformunun dönüşüm oranını sıfıra
indirir."_

Every address in `imageUrls` is **downloaded and judged before the listing is
written**. The check is on the file's first bytes rather than on the response's
headers, because the failure that matters is not a misspelt address — that one
is loud — but an address that answers `200` with an HTML "not found" page, an
access-denied notice or a one-pixel placeholder. Those have a correct status and
a plausible `content-type`, and they become a grey box on a live listing that
somebody finds months later.

Refused: anything that is not `http`/`https`, a repeat of an address already in
the same cell, an SVG (a document with scripting, not a photograph — and no
retailer publishes product shots as vector), a file under 1 KB, a file over
12 MB, an address that times out or does not answer, and anything whose bytes
are not JPEG, PNG, GIF, WebP or AVIF.

- **Some refused, some kept** → the listing imports with what survived, and each
  refusal is printed as a warning naming the row and the address.
- **All refused, where the row asked for pictures** → the row **fails** and is
  not published. Fix the address and run again; the importer resumes.
- **An empty `imageUrls`** → silent, exactly like an empty `destinationUrl`. A
  listing with no picture declared is a decision somebody made, not an accident.

`--skip-image-check` accepts the addresses without downloading anything, for an
import host with no route to partner CDNs. Nothing is verified in that mode and
the report says so on every run.

**What is stored is the address, not the picture.** `offering_visual.url` points
at the partner's own server and the platform holds no copy, which is the normal
arrangement for affiliate comparison and is not free: if a partner moves a file,
the picture disappears from a listing that imported cleanly. Holding copies would
need object storage, a serving path, and a decision about somebody else's
copyright — none of which exists today. The check above is what makes the
arrangement survivable, and a periodic re-check of live listings' pictures is
the obvious follow-on when there is an operator to act on it.

**Always dry-run first.** It resolves every category, parses every price and
checks every attribute name against the field set of the category it is filed
under, and writes nothing. The difference is finding a typo now versus finding
it halfway through a partial import.

### What it does per listing

Create draft → read applicable attributes → write content and price → publish →
author destination → Admin **review**, **validate**, **enable**.

The last three stay three separate acts. Collapsing them into one batch call
would have been less code and would have removed a deliberate three-step
judgement from the platform for ever, to save an operator some minutes once.

### Re-running

Safe, and designed for it. A published listing is left alone; a **draft** — what
a listing that failed halfway leaves behind — is picked up and carried the rest
of the way. So the working loop is: run, read the failures, fix those rows,
run again.

Exit code is non-zero when any row failed, _with the successful rows already
written_. That is deliberate: the run did partly succeed, and reporting total
failure would push an operator to start over.

---

## 4. Verifying a launch

`npm run smoke` checks the HTTP surface. It does not check that the catalogue
is _coherent_, and these are the queries that do:

```sql
-- Nothing is discoverable without a projection row.
select count(*) from offering where status = 'PUBLISHED'
  and id not in (select offering_id from offering_search_projection);
-- Expect 0. Anything else is a published listing nobody can find.

-- Listings whose handoff button is dead.
select count(*) from offering o
  join offering_search_projection p on p.offering_id = o.id
  left join affiliate_destination d on d.offering_id = o.id
 where d.id is null or d.handoff_eligibility <> 'ELIGIBLE';
-- Not necessarily wrong — a listing may legitimately have no destination —
-- but it should match the number of blank `destinationUrl` cells in the file.

-- Products that group, and products that do not.
select count(*) filter (where product_key is not null) as grouped,
       count(*) filter (where product_key is null)     as ungrouped
  from offering where status = 'PUBLISHED';
-- A catalogue where almost everything is ungrouped is a catalogue that cannot
-- compare anything, which is the one failure that looks fine on every page.

-- Listings with no attribute values at all.
select count(*) from offering o where o.status = 'PUBLISHED'
  and not exists (select 1 from offering_attribute_value v
                  where v.offering_id = o.id);
-- A high number usually means step 4 was skipped or the `attributes` column
-- was left empty: filters and comparison tables will be empty.
```

---

## 5. The Owner's decisions, 2026-09-05

Quoted rather than summarised, because a decision paraphrased is a decision
half-recorded.

### 5.1 Partner accounts stay with the platform

> _"V1 lansmanı için tüm partner hesapları platform yönetiminde kalacak. İlk
> aşamada satıcı devri (handover) operasyonlarına girmiyoruz."_

So the importer's behaviour is the intended one, not a temporary shortcut:
`IMPORT_PASSWORD` is a deployment secret held by the platform, and no partner
receives it. **When a handover does come, it is an invitation and a password the
partner chooses** — this constant must never become the way a seller gets in.

### 5.2 Files first; the feed is for price and stock only

> _"Kesinlikle dosya aktarımı ile başlıyoruz. … Feed mekanizmasını şimdilik
> yalnızca canlıdaki ilanların fiyat ve stok güncellemeleri için arka planda
> çalışacak şekilde kısıtlıyoruz."_

This narrowed what `I76` built, and **`I88` implemented it**:
`apps/worker/src/feed.sync.ts` creates nothing, publishes nothing and writes
only price and stock — the columns are the rule, expressed as a narrower `set`
clause rather than as a check somebody can remove. A product the document offers
that the platform does not carry, or carries and has not published, is counted
as `skipped` and passed over.

**How a feed finds an imported listing — decided, and implemented in `I89`.**
The Owner chose option B of `FEED_MATCHING_OPEN_DECISION.md` on the same day:
the intake matches a document row to **the Business's own published listing with
that `productKey`**, and writes the link once. From then on the partner's own
identifier is the match, so a re-key at their end costs nothing. Anything less
than certain links nothing: no key, two listings with the key (rejected with a
reason), a listing that is not Published, or one another feed already maintains.

**So `productKey` now has two jobs**, and the second one is operational: it is
what groups two partners' offers of one product _and_ what lets a feed find the
listing to reprice. A blank `productKey` in `offerings.csv` means no comparison
**and** no automated price updates.

The revision this rests on — `PRD-0001` **v4.2** — was approved and Frozen by
the Owner on 2026-09-05 and is now the authoritative document.

### 5.3 The minimum for going live

> _"En az 3 farklı Domain (alan) altında aktif ilan içeren kategoriler.
> Karşılaştırma işlevini kanıtlamak için aynı `productKey` altında gruplanmış, en
> az 2 farklı partnerden teklif içeren temel ürün seti. Sistemdeki tüm ilanlarda
> test edilmiş ve çalışan affiliate (yönlendirme) bağlantıları."_

These are the release criteria `PROJECT_ROADMAP.md` item 5 said the repository
did not have. Each one is checkable, and here is the check:

```sql
-- 1. At least three Domains carry a published listing.
select count(distinct d.id) as domains
  from offering o
  join category c on c.id = o.category_id
  join domain d on d.id = c.domain_id
 where o.status = 'PUBLISHED';
-- Expect >= 3.

-- 2. A core set that actually compares: one productKey, two partners.
select product_key, count(distinct business_id) as partners
  from offering
 where status = 'PUBLISHED' and product_key is not null
 group by product_key having count(distinct business_id) >= 2;
-- Expect at least one row. Zero rows means the comparison the platform exists
-- for does not happen anywhere in the catalogue.

-- 3. Every handoff is live. (Working is proven by clicking; this proves
--    nothing is dead in the database before anybody starts clicking.)
select count(*) from offering o
  join offering_search_projection p on p.offering_id = o.id
  left join affiliate_destination a on a.offering_id = o.id
 where a.id is null or a.handoff_eligibility <> 'ELIGIBLE';
-- Expect 0 once every listing carries a destination.
```

Criterion 3 says _tested_, and no query can test it: somebody follows each link
and confirms it reaches the product, not the partner's home page or a dead
campaign. The query narrows that work to the listings that could possibly work.

---

## 6. Known gaps at V1

- ~~**Traceability is behind.**~~ **Closed 2026-09-07.** `traceability.md` is
  Frozen at **v2.2** and traces `I76`–`I90`; §5C.2's three unowned behaviours
  now have owners — `PRD-0006` §22 (audit trail), §23 (personal data on Admin
  surfaces, as a Security Requirement) and §24 (feed management), with Features
  `F13` and `F14` allocated in the Platform registry v1.3.
- **No stored copies of pictures.** The address is the partner's; if they move
  the file the picture disappears from a listing that imported cleanly (§3.1).
  Nothing re-checks live listings' pictures on a schedule.
- **The feed writes no pictures.** `I86`'s ingest is shared code in
  `@commerce/feed`, so wiring it into feed intake is small — but it is not wired.
- **No bulk Admin enablement endpoint**, by choice (§3).
- ~~**Affiliate-destination Admin acts are outside the audit trail.**~~
  **Closed 2026-09-05 in `I87`.** The Owner's answer was that these are the
  platform's most commercially critical acts and their absence from
  `admin_audit_event` was unacceptable. Review, validation, enablement and
  disablement now write to the central trail as well as to the destination's
  own rows, and `I87`'s suite asserts the database enum and the code's action
  list are the same set — so an act that is added later cannot quietly stay
  outside the trail. The note above this one still stands: `admin_audit_event`
  cannot be deleted, and neither can these records.
- **No rollback.** The importer adds and never deletes. Removing a mistaken
  import is a manual database operation, and `admin_audit_event` cannot be
  deleted at all.
- **The catalogue's field sets have no PRD.** `I66_ATTRIBUTE_CATALOGUE.md` says
  it plainly: 404 definitions of product judgement with no Story behind them.
  Not a launch blocker; the largest undocumented product decision in the
  repository.
