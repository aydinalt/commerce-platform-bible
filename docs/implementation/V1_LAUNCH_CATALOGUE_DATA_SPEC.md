# V1 Launch Catalogue Data Specification

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Date:** 2026-09-18
- **Purpose:** The **primary data-preparation reference** for the real V1 launch
  catalogue. It answers one question — _what exactly must a Business and an
  Offering contain to go live?_ — from the code rather than from intent.
- **Status note, deliberate:** this stays **Draft** and is **not Frozen**. It is
  an implementation/launch working document, meant to be corrected as the real
  catalogue is prepared and the data teaches us something the code did not. A
  Frozen data specification would have to be superseded to record what a spreadsheet
  revealed on a Tuesday, which is the wrong ceremony for this kind of record.
- **Scope:** Analysis and specification only. No code, no migration, no CSV, no
  catalogue data was produced or changed to write this. `data/*.example.csv`
  were read and left untouched.
- **Method:** Every rule below was read out of the running code or measured
  against the database, and the source is named. Where a Frozen document and the
  code disagree, both are reported and the difference is §16.
- **Baseline:** `main` at `60dfc9e` (`fix(catalogue): clean up import operator
  and resolve existing businesses`), traceability Frozen v2.5 at `9aeb718`.
- **Supersedes:** Nothing. It is the first data specification this repository has
  had. It **complements** `V1_LAUNCH_RUNBOOK.md` rather than replacing it: the
  runbook is the procedure, this is the data.
- **Opens no Frozen record.** `UX-0002` Frozen v1.4, traceability Frozen v2.5 and
  the PRD set are untouched and unaffected by every rule below.

---

## 1. Executive Summary

**The question this answers:** what exactly must a row contain for a Business
and an Offering to be live, comparable and handoff-ready on the public site?

Eight findings decide the shape of the launch catalogue.

1. **Publication has exactly four conditions**, and they are fewer than the
   runbook's column list suggests: a non-empty `title`, an **active leaf**
   Category, a non-empty **Business display name**, and no missing *required*
   Attribute (`modules/offering/src/index.ts:154`). Everything else — price,
   pictures, summary, affiliate address, product key — is optional to the
   *platform*.
2. **No seeded Attribute is required for publication.** `seed-attributes.mjs`
   writes `required_for_publication` as a hard-coded `false` for all 404
   definitions (line 3290). Measured: 0 of 404. So the third publication
   condition is satisfied by construction at V1, and **attributes never block a
   launch import**. They decide filters, comparison rows and search text, not
   visibility.
3. **Discovery counts products, not listings.** Every result query is
   `select distinct on (coalesce(o.product_key, o.id::text))` and every total is
   `count(distinct …)` (`pg-discovery.repository.ts:809, 989, 1057, 1115`). Two
   partners' rows for one `productKey` are **one** card carrying
   `sellerCount = 2`. A thousand listings under a hundred product keys is a
   hundred-result catalogue.
4. **`/offerings/{slug}` resolves globally and the database only enforces
   `(business_id, slug)`.** Seven public read paths do
   `where o.slug = $1` with no business scope, no `limit` and no tie-break —
   `pg-presentation.repository.ts:147` and six others. Two partners using the
   same listing slug therefore produce two published rows at one address, and
   which one answers is not defined. **The CSV author is the only thing
   enforcing global listing-slug uniqueness.** `V1_LAUNCH_RUNBOOK` §2.2 says
   "unique **within** the Business", which is what the database enforces and not
   what correct behaviour needs. This is the single most important rule in this
   document (§3, §16.1).
5. **The affiliate address is not validated anywhere.** `destinationUrl` reaches
   the platform through `authorAffiliateDestinationSchema`, which is
   `z.string().trim().min(1).max(2048)` and nothing else (`contracts/index.ts`).
   No scheme check, no host check, no database `CHECK`. The three Admin acts
   record human judgement; they verify nothing technical.
6. **`priorAmount > amount` is enforced twice** — by the contract
   (`PRIOR_AMOUNT_IS_NOT_A_REDUCTION`) and by the database
   (`offering_prior_amount_is_a_reduction`). B4 is therefore not an enforcement
   gap. What it lacks is a readable failure message (§14).
7. **Two attribute value kinds fail silently, and one of them is the real
   defect.** `BOOLEAN` accepts only `true` or the string `"true"`; every other
   value — `"Evet"`, `"yes"`, `1`, `"TRUE"` — becomes `false` with no error
   (`import-catalogue.mjs:1087`). `NUMBER` turns an empty cell into `0` because
   `Number("") === 0`, while a non-numeric value is rejected loudly. `SELECT`
   and `TEXT` are safe (§6, §14).
8. **The technical minimum launch catalogue is one Business and one Offering.**
   The *useful* minimum — the one where the platform does the thing it exists to
   do — is **two Businesses whose listings share a `productKey`**, because
   without a shared key there is no comparison, no seller list and no product
   rating group (§9).

**The catalogue's shape is already decided by the seed**: 11 sector Domains,
11 branch roots and **127 active leaf headings** are the entire set of Category
keys an Offering may name, with **404 Attribute definitions** across
**659 heading↔field links**, 4 to 10 fields per heading. Nothing in a launch CSV
may invent a Category or an Attribute.

---

## 2. `businesses.csv` Data Specification

Header, exactly (order is irrelevant — the reader is keyed on names, trimmed):

```text
slug,name,shortDescription,ownerEmail
```

| Field | Required? | Type | Example | Rule | Source |
| --- | --- | --- | --- | --- | --- |
| `slug` | **yes** | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, ≤120 chars | `kuzey-elektronik` | Lower-case words joined by single hyphens. No leading/trailing/double hyphen, no underscore, no Turkish letter, no dot. **Globally unique** — `business.slug` is `@unique`. It is the natural key the importer resolves on, so changing it later creates a *second* Business rather than renaming one. Input is lower-cased and trimmed by the contract before the regex runs. | `createBusinessSchema`, `packages/contracts/src/index.ts:115`; `schema.prisma:328`; `import-catalogue.mjs` businesses loop |
| `name` | **yes** | 1–200 chars after trim, any script | `Kuzey Elektronik` | The public display name. **A Business with an empty display name cannot publish any listing** — `BUSINESS_DISPLAY_NAME_MISSING` is one of the four publication shortfalls. The importer refuses an empty cell before the API sees it; a missing column reaches the API and is refused there. Written twice: once on create, once through `PUT /businesses/{id}/information`, because the second call is the one that sets the name the publication gate reads. | `evaluatePublicationMinimum`, `modules/offering/src/index.ts:165`; `createBusinessSchema`; `updateBusinessInformationSchema` |
| `shortDescription` | no | ≤500 chars after trim | `2011'den beri beyaz eşya.` | Public. Part of the public Business identity set (display name + logo + short description) and nothing else. Empty, absent and blank are the same thing: not supplied. Absence produces a thinner listing page, never a failure. | `publicBusinessIdentitySchema`; `optionalInformation(500)`, `contracts/index.ts:169` |
| `ownerEmail` | no | e-mail address | *(leave blank)* | The address of the account that will own the Business. **Leave it blank for every launch partner.** Blank derives `partner-<slug>@$IMPORT_EMAIL_DOMAIN` deterministically, which is what lets a second run find the same account instead of registering a new one. Supplying a real partner address creates an account at that address with `IMPORT_PASSWORD` as its password — see §15.2. | `emailFor()`, `import-catalogue.mjs:417`; `V1_LAUNCH_RUNBOOK` §5.1 |

### 2.1 What the importer does with a row

- **Present already** (a Business with that slug exists): name and description
  are **not** updated. The run signs in as the owner, enters the Business
  context, counts the row as `zaten vardı`, and moves on. An import never
  overwrites an Admin's correction with a stale spreadsheet.
- **New**: registers the owner account → confirms it through the outbox →
  `POST /businesses` → `PUT /auth/me/business-context` →
  `PUT /businesses/{id}/information`. The row is created `status = 'ACTIVE'`,
  `public_exposure = 'ELIGIBLE'`, moderation `UNRESTRICTED`
  (`pg-business.repository.ts:254`), so **no extra step is needed to make a new
  partner publicly eligible**.
- **One owner per Business**, written into `business_owner` in the same
  transaction as the Business itself.

### 2.2 Second-batch behaviour (as of `60dfc9e`)

A partner that already exists **need not be relisted** in a later
`businesses.csv`. Naming its slug in `offerings.csv` alone is enough: the
importer resolves it through
`business ⋈ business_owner ⋈ user_account`, reads the owner's **stored**
address rather than deriving it, signs in and enters the Business context
(`existingPartner()`, `import-catalogue.mjs:634`). Resolution order is
**this run's CSV first, then the database**, so idempotency is unchanged and no
second Business is ever created for a slug that has one.

The one case it cannot serve: a Business created **by hand** through the UI,
whose owner's password is not `IMPORT_PASSWORD`. Sign-in returns `null`, and the
row fails with a message that names that as the thing to check.

---

## 3. `offerings.csv` Data Specification

Header, exactly:

```text
businessSlug,slug,title,summary,categoryStableKey,productKey,priceKind,amount,currency,priorAmount,deliveryCost,stockState,destinationUrl,imageUrls,attributes
```

| Field | Required? | Type | Example | Valid values | Rule | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `businessSlug` | **yes** | business slug | `kuzey-elektronik` | any slug in this run's `businesses.csv` **or** any existing Business | Resolved in that order. An unknown slug fails the row with a message naming both possibilities. Creates nothing. | `import-catalogue.mjs:991`; §2.2 |
| `slug` | **yes** | 1–160 chars, free text (no format check) | `kulaklik-xz200-kuzey` | — | **Must be unique across the entire catalogue, not just within the Business.** The database only enforces `(business_id, slug)`; the public address does not. See §16.1. Use `a-z0-9-` and suffix the partner: `<product>-<partner>`. | `createDraftOfferingSchema`; `schema.prisma:@@unique([businessId, slug])`; `pg-presentation.repository.ts:147` |
| `title` | **yes** | 1–240 chars after trim | `Kablosuz Kulaklık XZ-200` | — | A publication condition. Empty (or whitespace) is `TITLE_MISSING`. | `evaluatePublicationMinimum`; `editOfferingSchema` |
| `summary` | no | ≤1000 chars after trim | `ANC, 30 saat pil.` | — | Empty and absent are the same: `null`. | `editOfferingSchema` |
| `categoryStableKey` | **yes** | `DOMAIN__HEADING` upper case | `TECHNOLOGY__KULAKLIK` | one of the **127 seeded leaf keys** | Must exist, be `active`, and be a **leaf** (no active children). A sector root (`TECHNOLOGY__ROOT`) is refused at draft creation with `CategoryNotAssignableError` — the row fails and leaves nothing behind. The importer itself checks only existence + active; leaf-ness is enforced by the API. | `assertAssignable()`, `pg-commerce.repository.ts:71`; `seed-taxonomy.mjs:222` |
| `productKey` | **yes** *(importer)* | ≤64 chars, stored verbatim | `XZ200` | — | Optional in the platform, **required by the importer**. It is the only thing that groups two partners' offers of one product, and since `I89` it is the key a partner feed is matched on. Case is preserved: `ean123` and `EAN123` are two products. | `productKeySchema`, `contracts/index.ts:426`; `import-catalogue.mjs:874`; runbook §2.3 |
| `priceKind` | in practice **yes** | literal | `FIXED` | `FIXED`, `ON_REQUEST` | **Only the exact string `ON_REQUEST` is honoured; every other value — including a typo, a lower-case `fixed`, or an empty cell — becomes `FIXED`.** The platform's third kind, `UNKNOWN`, is unreachable through the importer. See §14.3. | `import-catalogue.mjs:826`; `PRICING_KINDS`, `contracts/index.ts` |
| `amount` | **yes when `FIXED`** | decimal text | `2499.90` or `2.499,90` | ≤10 integer digits, ≤2 decimals, never negative | Both separators read: a cell containing `,` is treated as Turkish (`.` thousands, `,` decimal); otherwise as English. Normalised to canonical `2499.90` and sent as a **string**, never a number. `0` is accepted by regex, contract and `CHECK` — see the §13 price checklist. | `amount()`, `import-catalogue.mjs:245`; `MONEY_AMOUNT`, `contracts/index.ts` |
| `currency` | no | 3 upper-case letters | `TRY` | `^[A-Z]{3}$` | Defaults to `TRY` when empty. Not checked against a list — shape only. Lower-case `try` is **refused** by the contract, loudly. | `currencySchema`; `import-catalogue.mjs:832` |
| `priorAmount` | no | decimal text | `2999.00` | must be **strictly greater** than `amount` | Enforced by the contract *and* by `offering_prior_amount_is_a_reduction`. Only meaningful beside a `FIXED` price; on `ON_REQUEST` the database refuses any amount at all. | `offeringPriceInputSchema` `.refine(...)`; migration `20260830000100` |
| `deliveryCost` | no | decimal text | `0` or *(blank)* | ≥0 | **`0` and blank are different claims.** `0` = delivery is free; blank = not stated. Both sort at the same place (`coalesce(delivery_cost, 0)` in the total-cost ordering) but the page says "Teslimat ücreti belirtilmemiş" for blank. Writing `0` where the partner never promised free delivery is a false claim that also wins comparisons. | `optionalMoneyAmountSchema`; `TOTAL_COST_SQL`, `offering-price.sql.ts:145` |
| `stockState` | no | literal | `IN_STOCK` | `IN_STOCK`, `OUT_OF_STOCK`, `UNKNOWN` | **The importer defaults an empty cell to `IN_STOCK`; the platform's own default is `UNKNOWN`.** An unknown value is passed through and refused by the contract. `OUT_OF_STOCK` sinks a listing to the bottom of every ordering; `UNKNOWN` does not. | `import-catalogue.mjs:841`; `STOCK_STATES`; `LISTING_ORDER`, `offering-price.sql.ts` |
| `destinationUrl` | no | ≤2048 chars | `https://partner.example/p/xz200` | **anything non-empty** | **Not validated.** No scheme check, no host check, nothing. Blank is legitimate: the listing appears and compares, it simply cannot be handed off. Non-blank triggers the three Admin acts — see §7. | `authorAffiliateDestinationSchema`, `contracts/index.ts` |
| `imageUrls` | no | addresses separated by `\|` | `https://…/1.jpg\|https://…/2.jpg` | http/https only, each ≤2048 chars, ≤24 addresses | **The first address is the main photograph.** Each one is downloaded and judged before the listing is written. A row that declares pictures and gets **none** fails; a row that declares none is silent. See §8. | `readImageAddresses()`, `packages/feed/src/images.ts:98` |
| `attributes` | no | JSON object, CSV-quoted | `"{""Bağlantı"":""Bluetooth""}"` | keys = Attribute **display names** of that Category | An unknown name fails the row. Values are coerced per kind — and two kinds coerce silently. See §6. | `import-catalogue.mjs:1077`; `offeringAttributeValueSchema` |

### 3.1 What the importer does with a row

1. Column presence → price parse → `productKey` presence → partner resolution →
   pictures resolved → then the five write calls.
2. **Skip is keyed on lifecycle, not on existence.** A **published** listing with
   that `(business, slug)` is finished and left alone. A **draft** is picked up
   and carried the rest of the way — which is what makes a re-run after a partial
   failure finish the job instead of reporting a false green.
3. Write sequence: `POST …/offerings` (draft) → `GET …/content` (to learn the
   applicable Attributes and their ids) → `PUT …/content` (price, attributes,
   visuals, productKey, summary) → `POST …/publication` → then, if
   `destinationUrl` is non-empty, `POST …/affiliate-destination` and the three
   Admin acts.
4. **Per-row failures do not stop the import.** They are collected and printed at
   the end with `offerings.csv:<line> (<slug>)` and the reason, and the process
   exits non-zero.

---

## 4. Price Rules

### 4.1 The three kinds

| Kind | Reachable from CSV? | Carries `amount`/`currency` | Carries `priorAmount`/`deliveryCost` | Meaning |
| --- | --- | --- | --- | --- |
| `FIXED` | yes (and by default) | **required** | optional | A stated price. |
| `ON_REQUEST` | yes — exact string only | forbidden by `CHECK` | forbidden | Priced on request *by its nature*: a consultancy, an installation, a bespoke order. |
| `UNKNOWN` | **no** | forbidden | forbidden | The platform's "price not established". The importer cannot produce it. |

`ON_REQUEST` and `UNKNOWN` are deliberately two different absences — telling a
person a price is unknown reports a failure where none occurred
(`contracts/index.ts:280`).

### 4.2 The rules, exactly

- **`amount` is required when the kind is `FIXED`** — refused by the importer
  (`"FIXED fiyat için amount zorunlu"`), by the contract, and by
  `offering_fixed_price_is_complete`.
- **`priorAmount` must be strictly greater than `amount`.** Enforced by the
  contract's `.refine` (`PRIOR_AMOUNT_IS_NOT_A_REDUCTION`) *and* by
  `offering_prior_amount_is_a_reduction`. A prior amount equal to or below the
  current one would render as `−%0` or as an increase dressed as a saving.
- **`priorAmount` may not accompany `ON_REQUEST`** —
  `offering_unpriced_carries_no_amount`.
- **`deliveryCost`: blank ≠ `0`.** §5.10.5 separates "not stated" from "free".
  The ordering uses `amount + coalesce(delivery_cost, 0)`, so an unstated cost
  sorts the row at the *lowest* it could possibly cost, and the surface says so.
- **Currency** defaults to `TRY`, is shape-checked (`^[A-Z]{3}$`) and is never
  checked against a list of real currencies.
- **Negative is unreachable.** The importer's regex has no sign, the contract's
  regex has no sign, and `offering_amounts_are_not_negative` refuses one anyway.
- **Zero is reachable and is not refused.** `0` passes the importer regex, the
  contract and the `CHECK`. A `0.00 TRY` listing sorts first in every price
  ordering and wins every comparison. Nothing in the platform will question it.

### 4.3 What the importer normalises silently

| Input | Becomes | Loud or silent? |
| --- | --- | --- |
| `2.499,90` | `2499.90` | silent, intended |
| `2499.90` | `2499.90` | silent, intended |
| `2.499` (Turkish thousands, no decimal) | **`2499`** | silent — the cell contains no `,` so it is read as English and the dot is a decimal point → `2.499` would then fail the 2-decimal regex. Measured: `2.499` **fails**; `2.499,00` becomes `2499.00`. Write decimals explicitly. |
| empty `currency` | `TRY` | silent, documented |
| empty `stockState` | `IN_STOCK` | silent — and it is a *claim*, see §3 |
| empty / misspelt `priceKind` | `FIXED` | **silent, and this is B5** |
| `-10` | row fails | loud |
| `abc` | row fails | loud |

---

## 5. Category Rules

### 5.1 The shape that exists

Measured against the seeded taxonomy (`stable_key` prefixed with one of the
eleven sector Domains):

| | Count |
| --- | --- |
| Sector Domains | 11 |
| Root Categories (branches, one per Domain) | 11 |
| **Leaf headings (assignable)** | **127** |
| Total Categories | 138 |
| Active | 138 (all) |
| Heading↔Attribute links | 659 |
| Distinct Attribute definitions in use | 404 |
| Fields per heading | 4 min / 10 max / 5.43 avg |

### 5.2 `categoryStableKey`

- **Format:** `DOMAIN__SLUG`, where the slug's hyphens become underscores and
  the whole thing is upper-cased — `stableKey()`, `seed-taxonomy.mjs:222`.
  `kulaklik` under `TECHNOLOGY` is `TECHNOLOGY__KULAKLIK`.
- **Roots are `DOMAIN__ROOT`** and are **not** assignable.
- The key is `@unique` on `category`.

### 5.3 What a Category must be for an Offering to publish

Two conditions, both evaluated as one expression:

```sql
c.active and not exists (
  select 1 from category child
  where child.parent_id = c.id and child.active = true
)
```

— `assertAssignable()`, `pg-commerce.repository.ts:75`. So:

- **Active: yes, required.** A retired Category cannot receive an Offering.
- **Leaf: yes, required** — and "leaf" means *no active children*, not "has no
  children at all". A heading that later gains a child stops being assignable.
- Enforced at **draft creation**, so a root key fails the first write call and
  leaves no draft behind. It is also the second of the four publication
  shortfalls (`CATEGORY_NOT_ACTIVE_LEAF`), which catches the case where a
  Category is retired between the draft and the publish.

### 5.4 Retirement

`US-PLT-F08-001` AC-12 refuses to retire a Category that still has assigned
active Offerings, and retirement takes an exclusive lock on the row that
`assertAssignable` share-locks — so the two cannot interleave. Consequence for a
launch catalogue: **a retired Category holding published listings cannot exist**,
which is why the "retired category with live listings" case needs no CSV rule.

### 5.5 Where a Category shows up

| Surface | Condition |
| --- | --- |
| Home | active **root** Categories, listed flat. All 11 always appear, empty or not. |
| `/kategori/{slug}` | Category `active`. Retired → 404 (says nothing about why). **Non-leaf → children and `results: null`** (withheld, not empty). **Leaf → results in `NEWEST` order**, no sort control. Records no Discovery Start. |
| Category sitemap | `active` **and** something published anywhere in its subtree (recursive walk). A branch qualifies on its descendants' listings. Capped at 50 000, newest-published first. |

`category.slug` is **globally unique** as of `I99`, including retired ones, so an
address never starts answering about a different Category. This is `UX-0002`
Frozen v1.4 §8A and is not changed by anything in this document.

---

## 6. Attribute Rules

### 6.1 The model

- **Definitions are global**; Categories point at them. `Garanti süresi` is one
  definition used by many headings — which is what makes a filter mean the same
  thing in two Categories.
- **Keyed on the display name in the CSV**, because that is what an operator can
  see in the Admin panel. The importer reads the applicable definitions back from
  `GET …/content` and matches `name` exactly, then sends the definition's **id**.
- **`stableKey` is never written in a CSV.** It exists on the definition and on
  each option, and the importer never touches either.

### 6.2 Coverage, measured

| Value kind | Definitions | Filterable | Comparable | Searchable | Required for publication |
| --- | --- | --- | --- | --- | --- |
| `SINGLE_SELECT` | 218 | 218 | 218 | 218 | **0** |
| `NUMBER` | 78 | 70 | 78 | 78 | **0** |
| `MULTI_SELECT` | 52 | 52 | 52 | 52 | **0** |
| `BOOLEAN` | 49 | 47 | 49 | 49 | **0** |
| `TEXT` | 7 | 0 (refused by rule) | 0 | 7 | **0** |
| **Total** | **404** | 387 | 397 | 404 | **0** |

**Nothing is required for publication**, and that is deliberate:
`seed-attributes.mjs` writes `false` unconditionally (line 3290) because turning
the gate on for a catalogue that already holds drafts "would retire other
people's work by seeding a script".

### 6.3 A worked field set — `TECHNOLOGY__KULAKLIK`

| Attribute (display name) | Kind | Unit | Filterable | Comparable | Allowed values |
| --- | --- | --- | --- | --- | --- |
| Kulaklık tipi | `SINGLE_SELECT` | — | yes | yes | `Kulak içi` / `Kulak üstü` / `Kulak çevreleyen` / `Kemik iletimli` |
| Gürültü engelleme | `SINGLE_SELECT` | — | yes | yes | `Aktif (ANC)` / `Pasif` / `Yok` |
| Bağlantı | `SINGLE_SELECT` | — | yes | yes | `Kablolu` / `Kablosuz 2,4 GHz` / `Bluetooth` |
| Kullanım süresi | `NUMBER` | saat | yes | yes | any finite number |
| Suya dayanıklılık | `SINGLE_SELECT` | — | yes | yes | `IPX4` / `IPX5` / `IP67` / `IP68` / `5 ATM` / `Yok` |
| Mikrofon | `BOOLEAN` | — | yes | yes | `true` / `false` |
| Garanti süresi | `SINGLE_SELECT` | — | yes | yes | `12 ay` / `24 ay` / `36 ay` |

The full 127-heading table is not reproduced here; it is **queryable** and should
be generated per heading when the real CSV is prepared:

```sql
select d.name, d.value_kind, d.unit,
       (select string_agg(o.label, ' / ' order by o.sort_order)
          from attribute_option o where o.attribute_definition_id = d.id) as options
from category c
join category_attribute l on l.category_id = c.id
join attribute_definition d on d.id = l.attribute_definition_id
where c.stable_key = 'TECHNOLOGY__KULAKLIK'
order by l.sort_order;
```

### 6.4 What is validated, and what is not

| Kind | CSV value | Result | Loud or silent |
| --- | --- | --- | --- |
| any | name not applicable to the Category | row fails: `"<name>" bu kategoride tanımlı değil` | **loud** |
| `SINGLE_SELECT` / `MULTI_SELECT` | label not in the option list | row fails: `"<name>" için geçersiz seçenek: <label>` | **loud** |
| `MULTI_SELECT` | JSON array of labels | each label resolved to an option id | — |
| `NUMBER` | `30`, `"30"`, `1.5` | the number | — |
| `NUMBER` | `"16 GB"`, `"abc"` | `NaN` → refused by `z.number().finite()` | **loud** |
| `NUMBER` | `""`, `null`, `false`, `[]` | **`0`** — `Number("") === 0` | **silent** |
| `BOOLEAN` | `true` or `"true"` | `true` | — |
| `BOOLEAN` | **anything else** — `"Evet"`, `"yes"`, `"TRUE"`, `1` | **`false`** | **silent — this is the defect** |
| `TEXT` | string / number / boolean | `String(value)` | — |
| `TEXT` | object / array | `JSON.stringify(value)` | silent, but deliberate (avoids `[object Object]`) |
| `TEXT` | `""` | refused by `z.string().trim().min(1)` | **loud** |

**The earlier finding "attribute value doğrulanmıyor" is confirmed but narrower
than stated.** Names are validated, `SELECT` labels are validated, non-numeric
`NUMBER` is validated. What is **not** validated is `BOOLEAN` (anything but
`true` silently becomes `false`) and the empty-string `NUMBER` case (silently
`0`). Those two are the whole of it (§14.1).

### 6.5 CSV JSON format

The cell is a JSON **object**, so inside a CSV it must be quoted and every inner
`"` doubled:

```text
"{""Bağlantı"":""Bluetooth"",""Kullanım süresi"":30,""Mikrofon"":true}"
```

- Multiple values are supported only for `MULTI_SELECT`, as a JSON array:
  `"{""Platform"":[""PC"",""PlayStation""]}"`.
- A non-object (`"[]"`, `"5"`, `"null"`) fails the row:
  `attributes bir JSON nesnesi olmalı`.
- Malformed JSON fails the row and prints the raw cell.
- Turkish characters need no escaping; the file is read as UTF-8 and a leading
  BOM is stripped.

---

## 7. Affiliate / Handoff Rules

### 7.1 When `destinationUrl` is needed

**Never, for publication.** A listing with no affiliate address publishes,
appears in Discovery, compares and carries a price; it simply has no handoff
button. `V1_LAUNCH_RUNBOOK` §2.2 has always said so and the code agrees — the
destination block is skipped entirely when the cell is empty.

### 7.2 Format

There is **no format rule**. `authorAffiliateDestinationSchema` is
`z.string().trim().min(1).max(2048)`; there is no scheme check, no host check and
no database constraint. `"hello"` would be accepted as an affiliate destination.
Whatever correctness this field has comes from the human Admin acts below and
from the CSV author.

### 7.3 The three Admin acts

The importer performs all three, per listing, as the temporary import operator:

| Act | Endpoint | What it changes | Precondition |
| --- | --- | --- | --- |
| Review | `POST /admin/offerings/{id}/affiliate-destination/review` | writes a review row; **no** status, result or eligibility | none technical |
| Validation | `…/validation` with `{"result":"VALID"}` | sets `validation_result`, leaves `status` untouched | none technical |
| Enablement | `…/enablement` | sets `status = 'ENABLED'` | **`validation_result` must be `VALID`** — otherwise `AffiliateNotValidatedError` / HTTP 4xx |

Review is a *product* precondition of a Valid result (PRD-0001 §9.4), not a
technical one — the code will let you validate without a review row. The
importer does them in order anyway, and each act writes its own record plus a
central `admin_audit_event` row (`I87`).

### 7.4 What makes the CTA live

```ts
status === "ENABLED" && validationResult === "VALID"
```

— `composeHandoffEligibility()`, `modules/offering/src/index.ts:313`. A
biconditional, not a flag: re-validating an already-Enabled destination as
`INVALID` drops its eligibility even though its status stays `ENABLED`.

**Editing the destination resets everything.** Authoring — create *or* edit —
lands on `{status: DRAFT, validationResult: NOT_VALIDATED, handoffEligibility:
INELIGIBLE}` (`AUTHORED_DESTINATION_STATE`). So changing a launch URL after the
import requires the three acts again.

### 7.5 Published vs handoff-ready

| | Conditions |
| --- | --- |
| **Published** (visible) | `title` + active-leaf Category + Business display name + no missing required Attribute, then `status = PUBLISHED`, Business `public_exposure = ELIGIBLE`, intake `AVAILABLE` |
| **Handoff-ready** (button live) | all of the above **plus** a destination that is `ENABLED` **and** `VALID` |

They are separate results by design (`US-OFR-F07-001` AC-11): nothing in
`composeHandoffEligibility` consults an Offering.

### 7.6 Boundary

Attribution, referral tracking, affiliate-network conversion tracking and `?ref=`
parameters are **out of scope and unchanged**. Nothing in this document proposes
or requires any of them. P0-1 (attribution) remains open and unowned.

---

## 8. Image Rules

| Rule | Value | Source |
| --- | --- | --- |
| Separator | `\|`, newline or carriage return — **never a comma** (this is a CSV) | `SEPARATOR`, `packages/feed/src/images.ts:84` |
| Scheme | `http:` or `https:` only | `canonical()`, line 134 |
| Address length | ≤2048 chars, before and after URL canonicalisation | line 135 |
| Maximum per listing | **24** | `IMAGE_ADDRESS_LIMIT`; the contract bounds visuals at 24 too |
| Minimum per listing | 0 — an empty cell is legitimate | `import-catalogue.mjs:985` |
| Minimum file size | **1024 bytes** (a tracking pixel is 43) | `MINIMUM_IMAGE_BYTES` |
| Maximum file size | **12 MB** | `DEFAULTS.maximumBytes` |
| Timeout | **15 s** per address | `DEFAULTS.timeoutMs` |
| Accepted formats | JPEG, PNG, GIF, WebP, AVIF — judged on the **first bytes**, not on `content-type` | `image.ingest.ts` |
| Refused | SVG (`VECTOR_IMAGE`), duplicates within the same cell (`DUPLICATE`), non-URL (`NOT_A_URL`), 25th onward (`OVER_LIMIT`), HTTP≠200 (`HTTP_ERROR`), non-image bytes (`NOT_AN_IMAGE`), timeouts, unreachable | `images.ts:47` |
| **Order** | **The array index becomes `offering_visual.position`, and position 0 is what the Listing Card shows.** First in the cell = main photograph. | `editOfferingSchema.visuals` |
| Storage | **The partner's URL is stored. No file is ever copied, cached or re-hosted.** | runbook §6 "No stored copies of pictures" |

### 8.1 The rule for preparing real data

- **Some refused, some kept** → the listing imports with the survivors and each
  refusal is printed as a warning naming the row and the reason.
- **Declared pictures, all refused** → **the row fails.** A comparison listing
  with no photograph does not convert; fixing the address and re-running finishes
  the listing (it will be a draft, and drafts are picked up).
- **Empty cell** → silent. A listing with no picture declared is a decision, not
  an accident.
- `--dry-run` **does** download and check every address. Run it first: this is
  the single most common thing wrong with a partner's spreadsheet, and it is
  free to find out now.
- `--skip-image-check` accepts addresses unverified, for an import host that
  cannot reach partner CDNs. The report says so every time. **Do not use it for
  the launch import.**
- Because nothing is copied, a partner who moves a file removes the photograph
  from a listing that imported cleanly, and **nothing re-checks live listings on
  a schedule** (runbook §6). Prefer stable CDN addresses over campaign URLs.

---

## 9. Minimum Technical Launch Catalogue

Derived from the code, not from commercial judgement.

### 9.1 Hard technical minimums

| Question | Answer | Why |
| --- | --- | --- |
| Minimum Businesses | **1** | Nothing requires two. |
| Minimum Offerings | **1** | Nothing requires two. |
| Offering per Business required? | **No** | A Business with no listing is legal; it simply appears nowhere public. |
| Active **leaf** Category per Offering | **Yes, mandatory** | `assertAssignable` + `CATEGORY_NOT_ACTIVE_LEAF`. |
| Business display name | **Yes, mandatory** | `BUSINESS_DISPLAY_NAME_MISSING`. |
| Price required to publish? | **No** | No Pricing Kind blocks publication (§5.10.2). |
| Picture required to publish? | **No** | Not a publication condition. |
| Affiliate destination required? | **No** | The catalogue works without one; only the handoff button is absent. |
| Attribute values required? | **No** | 0 of 404 definitions are `required_for_publication`. |

**So the technically minimum working catalogue is: 1 Business (with a display
name) + 1 Offering (with a title, under 1 of the 127 active leaf headings).**
That catalogue is live, indexable and useless.

### 9.2 What each surface actually needs

| Surface | Minimum data to be non-empty | Note |
| --- | --- | --- |
| Home | nothing — 11 root Categories always list | An empty catalogue shows 11 headings leading to empty pages. |
| `/kategori/{slug}` for a **leaf** | ≥1 published Offering in that exact Category | A branch never shows results at all (`results: null`), so a branch page is never "empty" in the failing sense. |
| Category **sitemap** entry | ≥1 published Offering anywhere in that Category's subtree | So one listing makes both its leaf **and** its sector root appear in the sitemap. |
| Offering **sitemap** entry | the listing is in the projection (published + Business eligible + intake available) | Capped at 50 000, newest first. |
| Discovery results (Search/Browse) | ≥1 published Offering; **result count = number of distinct `productKey` values**, not listings | `distinct on (coalesce(product_key, id::text))`. |
| A **comparison** (the product's point) | **≥2 published listings sharing one `productKey`** in the same Category | Gives `sellerCount = 2`, a seller list, and a price comparison. |
| Product **rating** group | ≥1 published listing; ratings are keyed on the product group, not the seller | A review written against one partner's listing belongs to the product. |
| Attribute **filters** in a Category | ≥1 published listing carrying a value for a `filterable` Attribute | Filters are offered only where a Category has filterable Attributes and values exist. |
| **Handoff** button | a destination that is `ENABLED` **and** `VALID` | §7.4. |

### 9.3 The minimum that makes the platform do its job

Not a commercial recommendation — the smallest data set in which every mechanism
above is exercised at least once:

- **Businesses: 2** (so a product has two sellers)
- **Offerings: 4** (two products × two sellers)
- **Distinct `productKey`s: 2**
- **Categories used: 1 active leaf** (comparison sets are Category-scoped)
- **Affiliate-ready Offerings: ≥1** (to prove the three Admin acts and the
  biconditional)
- **Attribute coverage:** every `filterable` Attribute of that one heading
  carrying a value on at least one listing (4–10 fields)
- **Images: ≥1 per listing**

That is 4 rows. It yields: 2 Discovery results, one of them showing
`sellerCount = 2`, a working comparison table, working filters, a live sitemap
with 1 leaf + 1 root Category address, and one live handoff.

---

## 10. Recommended Pilot Catalogue

**Not technical requirements. None of the numbers below are enforced by any code
path.** They are what would exercise the platform under realistic conditions.

| Dimension | Suggestion | Reason |
| --- | --- | --- |
| Businesses | 5–8 | Enough that a seller list is a list, few enough that §15's 9-partner throttle needs no batching. |
| Categories | 6–10 leaf headings across **3–4 different sector Domains** | Proves Home, the Domain grouping, and the recursive category sitemap on more than one branch. |
| Offerings | 120–200 | — |
| Distinct `productKey`s | 40–70 | So the average product has 2–4 sellers and Discovery returns 40–70 results rather than 200. |
| Products with ≥3 sellers | ≥10 | The case where the comparison is actually worth reading. |
| `ON_REQUEST` listings | 3–5 | Exercises the kind that carries no money and still groups. |
| `OUT_OF_STOCK` listings | 3–5 | Proves the ordering rule that sinks them however cheap. |
| Listings with `priorAmount` | 10–20 | Proves the reduction rendering. |
| Listings with blank `deliveryCost` | ~20% | Proves "belirtilmemiş" beside the price, and the total-cost ordering. |
| Affiliate-ready | ≥80% of listings | The remainder proves that a listing without a destination is a legitimate listing. |
| Images per listing | 2–4 | Proves gallery order and the position-0 rule. |
| Attribute coverage | every `filterable` Attribute of each used heading valued on ≥60% of that heading's listings | A filter that returns nothing reads as a broken filter. |

---

## 11. CSV Templates / Synthetic Examples

`data/businesses.example.csv` and `data/offerings.example.csv` are **unchanged**.
The rows below are synthetic — invented partners, invented products, invented
addresses on RFC 2606 reserved domains, no real firm, no real affiliate link, no
real person.

### 11.1 `businesses.csv`

```text
slug,name,shortDescription,ownerEmail
kuzey-elektronik,Kuzey Elektronik,"Ses ve görüntü ürünlerinde uzman.",
```

### 11.2 `offerings.csv`

```text
businessSlug,slug,title,summary,categoryStableKey,productKey,priceKind,amount,currency,priorAmount,deliveryCost,stockState,destinationUrl,imageUrls,attributes
kuzey-elektronik,ornek-kulaklik-zz900-kuzey,Örnek Kulaklık ZZ-900,"Aktif gürültü engelleme, 40 saat pil.",TECHNOLOGY__KULAKLIK,ZZ900,FIXED,"3.199,90",TRY,"3.799,00","0",IN_STOCK,https://kuzey-elektronik.example/urun/zz900,https://kuzey-elektronik.example/gorsel/zz900-1.jpg|https://kuzey-elektronik.example/gorsel/zz900-2.jpg,"{""Kulaklık tipi"":""Kulak çevreleyen"",""Gürültü engelleme"":""Aktif (ANC)"",""Bağlantı"":""Bluetooth"",""Kullanım süresi"":40,""Mikrofon"":true,""Garanti süresi"":""24 ay""}"
```

### 11.3 CSV delimiter and escaping rules

The reader is RFC 4180 and is hand-written in `readCsv()`
(`import-catalogue.mjs:147`) — not `split(",")`, because a product title with a
comma in it is not an edge case.

- **Field separator: `,`**. Record separator: `\n` (a bare `\r` is discarded).
- **A field containing `,`, `"` or a newline must be quoted** with `"`.
- **Inside a quoted field, a literal `"` is written `""`.** This is why the
  `attributes` cell looks the way it does.
- A newline inside quotes is **data**, not a new row.
- A leading UTF-8 **BOM is stripped** (it would otherwise become part of the
  first column's name and make every lookup of it fail).
- **Header names are trimmed; every value is trimmed.**
- A row whose every cell is blank is **skipped**.
- The file is read as **UTF-8**. Turkish characters need no escaping anywhere.
- **The `|` in `imageUrls` is not a CSV feature** — it is a separator *inside*
  one field, chosen because a URL may contain a comma.
- Failure messages count lines as `offerings.csv:<n>` where `n = row index + 2`
  (1 for the header, 1 for 1-based counting), so the number matches what a
  spreadsheet shows.

---

## 12. Import Sequence

Verified against `V1_LAUNCH_RUNBOOK` §1 and the scripts themselves.

| # | Step | Command | Needed for the catalogue because… |
| --- | --- | --- | --- |
| 1 | Schema | `npm run db:deploy` | 39 tables and the 11 sector Domains arrive by migration. Nothing exists before it. |
| 2 | Build | `npm run build` | **The importer imports from `dist/`** — `apps/api/dist/bootstrap.js` and `apps/worker/dist/*`. Without it the script cannot start. |
| 3 | Taxonomy | `npm run seed:taxonomy` | Creates the 11 roots + 127 headings. Every `categoryStableKey` in the CSV must already exist here. |
| 4 | Field sets | `npm run seed:attributes` | Creates the 404 definitions and 659 links. Resolves headings **by the stable keys step 3 wrote**. |
| 5 | First Admin | `npm run first-run`, then `npm run admin:grant` | For the **human** Admin. **Not a precondition of the import** — see below. |
| 6 | Catalogue | `npm run import:catalogue` | Depends on 2–4. |
| 7 | Verification | `npm run smoke` | Boots both processes for real over `127.0.0.1` — the only check that the web app's server-side fetch reaches the API over a socket. |

### 12.1 Which step, skipped, fails loudly

- **1 skipped** → nothing connects. Loud.
- **2 skipped** → the importer cannot resolve `../apps/api/dist/bootstrap.js`.
  Loud, immediate.
- **3 skipped** → the importer stops before writing anything:
  `Bu kategoriler yok ya da pasif: …`, naming every missing key. Loud, and the
  best kind — it names the fix.
- **4 run before 3** → `seed-attributes` exits non-zero naming the headings it
  could not find. Loud.

### 12.2 Which step, skipped, looks like success

- **Step 4 skipped, then step 6 run.** This is the expensive one and the runbook
  already names it: the import succeeds, the listings appear, and every
  `attributes` cell is silently dropped, because `GET …/content` returns an empty
  `applicableAttributes` list for a Category with no field set — so
  `byName.get(name)` finds nothing.

  **Correction to the folklore:** it does **not** silently import "with no
  attribute values". As of the current code, an attribute name that resolves to
  no definition **fails the row** (`"<name>" bu kategoride tanımlı değil`). So a
  CSV that carries `attributes` fails loudly row by row; a CSV whose `attributes`
  cells are all empty imports silently and leaves the catalogue with empty
  filters and empty comparison columns. The expensive mistake is therefore
  narrower than described, and it is still real.

- **Step 5 skipped entirely.** The import **succeeds** — the importer mints and
  authorises its own temporary operator (`I100`) and needs no standing Admin. The
  catalogue goes live correctly. What is missing is a human Admin: nobody can
  open the Admin panel, moderate, or re-validate a destination. `npm run
  admin:list` shows **nobody**, and `V1_SECURITY_REVIEW` §4 item 6 — "after the
  import, `admin:list` shows the first Admin and nobody else" — reads as passing
  when it is failing in the other direction.

- **Step 7 skipped.** Everything in the database is right and the site may still
  be unreachable: `API_BASE_URL`, the port and the path prefix are invisible to
  every test in the repository.

### 12.3 Before a real import on a used database

`npm run dev:reset -- --yes` drops and re-seeds (steps 1, 3, 4). It refuses any
connection that is not `localhost` and has no override, because it destroys the
append-only Admin audit trail. **A production environment never needs it**: it
starts empty, and steps 1–4 are the whole of its preparation.

---

## 13. Launch Data Quality Checklist

Usable as-is while preparing the real CSVs.

### Business

- [ ] Every `slug` matches `^[a-z0-9]+(?:-[a-z0-9]+)*$` — no Turkish letters, no
      underscores, no double hyphens, no trailing hyphen.
- [ ] Every `slug` is unique in the file **and** absent from the live database
      (or intentionally the same, for a second batch).
- [ ] Every `name` is non-empty — this is a publication gate, not a cosmetic
      field.
- [ ] `ownerEmail` is **blank** for every launch partner (§2, §15.2).
- [ ] `shortDescription` ≤500 characters.
- [ ] The partner count in one batch is **≤9** (§15.1).

### Offering

- [ ] Every `slug` is unique **across the whole file and the whole catalogue**,
      not merely within its Business (§16.1). Suffix with the partner.
- [ ] Every `businessSlug` appears in `businesses.csv` **or** already exists.
- [ ] Every `title` is non-empty and ≤240 characters.
- [ ] `summary` ≤1000 characters.
- [ ] Every row has a `productKey` — including `ON_REQUEST` rows.
- [ ] `productKey` values are **consistent in case** across partners
      (`XZ200` ≠ `xz200` ≠ `Xz200`; they would be three products).
- [ ] Rows meant to be compared share one `productKey` **and** one
      `categoryStableKey`.

### Category

- [ ] Every `categoryStableKey` is one of the **127 leaf headings**, never a
      `*__ROOT`.
- [ ] Every key exists and is `active` — verify with a query, not from memory.
- [ ] Every key is spelled `DOMAIN__SLUG_IN_CAPS_WITH_UNDERSCORES`.

### Attributes

- [ ] Every key is a **display name** of an Attribute applicable to that row's
      Category (query §6.3 per heading).
- [ ] Every `SINGLE_SELECT` / `MULTI_SELECT` value matches an option **label**
      character for character, including spaces, parentheses and Turkish letters
      (`Aktif (ANC)`, `Kablosuz 2,4 GHz`).
- [ ] `MULTI_SELECT` values are JSON **arrays**.
- [ ] **No `BOOLEAN` cell contains anything but `true` or `false`** — `"Evet"`,
      `"yes"`, `1` and `"TRUE"` all become `false` in silence.
- [ ] **No `NUMBER` cell is an empty string** — it becomes `0` in silence. Omit
      the key instead.
- [ ] `NUMBER` values carry no unit text (`30`, not `"30 saat"`).
- [ ] Every inner `"` in the JSON cell is doubled, and the whole cell is quoted.

### Price

- [ ] Every `FIXED` row has an `amount`.
- [ ] Every `priorAmount` is **strictly greater** than its `amount` (the run will
      refuse it otherwise, row by row).
- [ ] No `ON_REQUEST` row carries `amount`, `priorAmount`, `currency` or
      `deliveryCost`.
- [ ] `priceKind` is exactly `FIXED` or exactly `ON_REQUEST` — **a typo silently
      becomes `FIXED`**.
- [ ] No amount is `0` unless it is genuinely free — a zero price wins every
      comparison and nothing questions it.
- [ ] Decimals are written explicitly (`2499.00` or `2.499,00`, not `2.499`).
- [ ] `currency` is upper case.
- [ ] `deliveryCost` is `0` **only** where the partner really offers free
      delivery; otherwise blank.
- [ ] `stockState` is stated deliberately — blank becomes `IN_STOCK`, which is a
      claim.

### Affiliate

- [ ] Every `destinationUrl` is an `https://` address that resolves — **nothing
      in the platform checks this**.
- [ ] Every address points at the **product page**, not a homepage or a search
      result.
- [ ] Rows deliberately without a destination are deliberate, not forgotten.
- [ ] No `?ref=`, no tracking parameter, no attribution token — out of scope and
      unchanged.

### Images

- [ ] Addresses are separated by `|`, never a comma.
- [ ] Every address is `http`/`https` and ≤2048 characters.
- [ ] ≤24 addresses per row.
- [ ] **The first address is the intended main photograph.**
- [ ] No SVG; no duplicate address within one cell.
- [ ] Addresses are stable CDN URLs, not campaign or session URLs — nothing is
      copied and nothing re-checks them later.

### Import

- [ ] `npm run build` has been run since the last code change.
- [ ] `seed:taxonomy` and `seed:attributes` have both run, in that order.
- [ ] `IMPORT_PASSWORD` is set, is the **same value as every previous run**, and
      lives with the deployment secrets.
- [ ] `IMPORT_EMAIL_DOMAIN` is set to a domain that is not a real mailbox domain.
- [ ] `PUBLIC_WEB_URL` is the real origin.
- [ ] `NODE_ENV=production` in the deployed environment.
- [ ] **`--dry-run` first**, and its output read line by line — especially the
      `kargo=null (belirtilmemiş)` / `kargo=0` distinction it prints per row.
- [ ] `--skip-image-check` is **not** used.
- [ ] New partners per batch ≤9, with 15 minutes between batches (§15.1).

### Post-import

- [ ] The run printed `operatör: yetki geri alındı …`.
- [ ] `npm run admin:list` shows **the first Admin and nobody else**.
- [ ] The failure list at the end of the run is empty, or every entry has been
      fixed and the import re-run.
- [ ] The warning list has been read (refused pictures do not fail a row).
- [ ] Spot-check: a product with two sellers shows **one** card with
      `sellerCount = 2`, and the cheapest-delivered row is the one on the card.
- [ ] Spot-check: a leaf Category page lists its listings; its sector root page
      shows children and **no** results.
- [ ] Spot-check: filters in a used Category offer options and return results.
- [ ] **The affiliate links are clicked**, not merely counted — `V1_SECURITY_REVIEW`
      §4 item 5 says it is the one criterion no query can check.
- [ ] `/sitemap.xml` contains real listing and Category addresses.
- [ ] `npm run smoke` passes.
- [ ] No two published listings share a `slug`:
      `select slug from offering o join offering_search_projection p on p.offering_id = o.id group by slug having count(*) > 1;` returns **0 rows**.

---

## 14. B3–B5 Assessment

Each assessed against the code, with no change made.

### 14.1 B3 — attribute value validation

**What is actually true** (§6.4): names validated, `SELECT` labels validated,
non-numeric `NUMBER` rejected, empty `TEXT` rejected. **Two silent paths
remain:** `BOOLEAN` coerces anything but `true`/`"true"` to `false`
(`import-catalogue.mjs:1087`), and `NUMBER` turns `""` into `0`.

| Question | Answer |
| --- | --- |
| Blocks preparing the V1 catalogue? | **No.** |
| Only a data-quality risk? | **It is a silent-corruption risk**, which is worse than an ordinary data-quality risk: a wrong `false` on "Mikrofon" is indistinguishable from a deliberate one, on the page and in the filter. |
| Must be fixed before go-live? | **No — if the checklist is followed.** The checklist items "no `BOOLEAN` cell but `true`/`false`" and "no empty `NUMBER` cell" close it at the data layer. |
| Separate technical work? | **Yes — recommended.** A three-line change (refuse anything that is not `true`/`false`; refuse an empty `NUMBER` cell) with a regression test. Small, but it is importer behaviour and therefore a decision, not a tidy-up. |

### 14.2 B4 — `priorAmount > amount`

**Already enforced, twice**: contract `.refine` (`PRIOR_AMOUNT_IS_NOT_A_REDUCTION`)
and `CHECK offering_prior_amount_is_a_reduction`. A bad row fails with
`content <slug> → 400 …` carrying the Zod issue.

| Question | Answer |
| --- | --- |
| Blocks preparing the V1 catalogue? | **No.** |
| Only a data-quality risk? | **Not even that** — bad data cannot be written. |
| Must be fixed before go-live? | **No.** |
| Separate technical work? | **Optional, low value.** The only improvement available is a friendlier importer-side message. The failure is already loud and names the row. |

**Correction:** the earlier framing of B4 as an "açık" (gap) was wrong. There is
no gap; there is a machine-readable error message.

### 14.3 B5 — `priceKind` validation

`row["priceKind"] === "ON_REQUEST" ? … : FIXED` (`import-catalogue.mjs:826`).
Consequences: (a) an empty or misspelt cell becomes `FIXED`; (b) the platform's
`UNKNOWN` kind is unreachable; (c) the runbook calls the column "required" while
the code treats it as optional.

| Question | Answer |
| --- | --- |
| Blocks preparing the V1 catalogue? | **No** — if `amount` is present, a `FIXED` misread still produces the intended price. |
| Only a data-quality risk? | **Partly.** The sharp case is a row meant to be `ON_REQUEST` (say `on_request`, lower case) that also carries an `amount`: it publishes as a fixed price the partner never quoted. Where no `amount` is present the run fails loudly (`FIXED fiyat için amount zorunlu`). |
| Must be fixed before go-live? | **No**, but the checklist item is mandatory: `priceKind` exactly `FIXED` or exactly `ON_REQUEST`. |
| Separate technical work? | **Yes — recommended, and the cheapest of the three.** Refuse any value that is not one of the accepted kinds. |

### 14.4 `.env.example` — `IMPORT_PASSWORD` / `IMPORT_EMAIL_DOMAIN`

**Confirmed absent.** `.env.example` documents `NODE_ENV`, `DATABASE_URL`,
`PUBLIC_WEB_URL` and the mail adapter, and mentions neither import variable.

| Question | Answer |
| --- | --- |
| Blocks preparing the V1 catalogue? | **No** — the importer exits with a full explanation when `IMPORT_PASSWORD` is unset, and `IMPORT_EMAIL_DOMAIN` has a sane default (`partners.invalid`). |
| Only a data-quality risk? | **No — a process risk.** `IMPORT_PASSWORD` must be *the same value on every run*, for ever; a variable that appears in no example file is one nobody records. A changed value makes every re-run fail on every existing partner. |
| Must be fixed before go-live? | **It should be**, and it is documentation rather than code: two commented lines in `.env.example` with the warning that the value is permanent and must never become a partner handover secret. |
| Separate technical work? | **Yes, trivially.** Group it with 14.1 and 14.3 into one small increment. |

### 14.5 Suggested grouping

One increment, three small changes and one documentation line, all inside the
importer's own boundary: refuse non-boolean `BOOLEAN`, refuse empty `NUMBER`,
refuse unknown `priceKind`, document both import variables. **None of them is
required to prepare or run the launch catalogue**, and the checklist in §13
covers every one of them in the meantime.

**Left open by decision**, and recorded as such in §17.B — including the
correction that **B4 does not belong on that list**, because `priorAmount >
amount` is already enforced by the contract *and* by a database `CHECK`.

---

## 15. Known Launch Constraints

### 15.1 Registration throttle — 9 new partners per quarter hour

`POST /auth/registrations` is throttled at **10 attempts per 15 minutes per
caller** (`ATTEMPT_LIMIT = 10`, `ATTEMPT_WINDOW_MS = 15 * 60 * 1000`,
`identity.service.ts:30`), keyed on `request.ip`. Every request the importer
makes arrives through `app.inject()` as the **same caller**, and the temporary
import operator's own registration is one of the ten.

**Effect:** an import creating more than **nine** new partner accounts fails
partway.

**And it reports itself badly.** `signUp` does not wrap the begin-registration
call in `ok(...)`, so the `429` is silent; the run dies further down with
`NO_CONFIRMATION_FOR_<address>`, which reads like a broken mail service and
sends an operator to look at delivery.

**Temporary workaround — the standing instruction until this is decided:**

> Import new partners in batches of **at most nine**, with **fifteen minutes**
> between batches.

This costs nothing but time: as of `60dfc9e`, `offerings.csv` may name partners
that already exist, so a later batch need not relist them (§2.2).

**This is not being worked around in code.** No rate-limit bypass, no exemption,
no importer-specific identity path has been designed here. The remedies —
exempting the importer's caller, raising the limit, or registering partner
accounts outside the API — are **auth/identity decisions and belong to the
Owner**, not to the import script. Recorded in `V1_LAUNCH_RUNBOOK` §6.

### 15.2 `IMPORT_PASSWORD` is one password for every partner account

Every partner account the importer creates carries the same password. Those
accounts exist so the platform has an owner to write under; nobody signs in as
them at launch. **If a partner is ever given access to their own listings, that
is a handover — a real invitation and a password they choose — not this constant
becoming a shared secret** (`V1_LAUNCH_RUNBOOK` §5.1). It also means
`ownerEmail` should stay blank: a real partner address plus this password is a
live account at an address the partner controls.

### 15.3 No rollback

The importer adds and never deletes. Removing a mistaken import is a manual
database operation, and `admin_audit_event` cannot be deleted at all. **The
`--dry-run` is the rollback.**

### 15.4 No stored copies of pictures

Addresses are the partner's. A moved file becomes a missing photograph on a
listing that imported cleanly, and nothing re-checks live listings on a schedule.

### 15.5 The importer is stricter than the platform in exactly one place

`productKey` is required by the importer and optional in the platform, and §2.3
of the runbook records why. Nothing else in the importer is stricter.

---

## 16. Code ↔ Documentation Discrepancies

Reported, not resolved. **No Frozen document was opened, and no Draft was
changed to write this section.**

### 16.1 Listing slug uniqueness — **the significant one**

| | |
| --- | --- |
| **Document** | `V1_LAUNCH_RUNBOOK` §2.2: `slug` — "Unique **within** the Business." |
| **Code — the constraint** | `@@unique([businessId, slug])` (`schema.prisma`). The document is accurate about this. |
| **Code — the behaviour** | The public address resolves globally: `where o.slug = $1`, no business scope, no `limit`, no tie-break, in **seven** places — `pg-presentation.repository.ts:147`, `pg-review.repository.ts:70` and `:156`, `pg-favourite.repository.ts:54` and `:73`, `pg-listing-report.repository.ts:39`, `pg-complementary.repository.ts:55`. The offering sitemap emits the bare `o.slug` too. |
| **Consequence** | Two partners using one listing slug produce two published rows at one URL. `found.rows[0]` picks one arbitrarily; the other listing is unreachable at its own address, its reviews and favourites attach to whichever row won, and the sitemap advertises the URL twice. |
| **Status** | **Not a defect being fixed here, and explicitly _not_ classified as blocking catalogue preparation** — see §17.A, which also lists what is deliberately not being done (no schema change, no migration, no route change, no slug-format change). It is a real constraint on the launch data, and the CSV author is the only thing enforcing it. §13 carries both the authoring rule and a post-import query that proves it. Whether the platform should enforce it (a global unique index, as `I99` did for `category.slug`) is an Owner decision and a separate increment. |

### 16.2 `priceKind` "required"

Runbook §2.2 marks `priceKind` **yes / required** with values `FIXED` or
`ON_REQUEST`. The code treats the column as optional and maps everything that is
not the exact string `ON_REQUEST` to `FIXED`. **Document = product intent; code =
actual behaviour.** See §14.3.

### 16.3 `priorAmount` — "the database refuses"

Runbook §2.2: "the database refuses a 'reduction' that is not one." **True**, and
incomplete: the **contract** refuses it first, so the error an operator sees is a
`400` from the content write rather than a database error. Immaterial to data
preparation; noted because it changes what the failure text looks like.

### 16.4 `stockState` default

Runbook §2.2: "Defaults `IN_STOCK`." **True of the importer.** The platform's own
contract default is `UNKNOWN` (`STOCK_STATES` / `.default("UNKNOWN")`). The
difference is a claim: the importer states "in stock" where the platform would
have said nothing. Worth an Owner decision only if launch partners cannot vouch
for stock.

### 16.5 The "attributes silently dropped" folklore

Runbook §1 says running the import before `seed:attributes` "imports listings
with no attribute values". As of the current code a name that resolves to no
definition **fails the row loudly**. The silent case is narrower: it is a CSV
whose `attributes` cells are *empty*. See §12.2.

### 16.6 Step 5 is not a precondition of step 6

Runbook §1's dependency column already says the import depends on steps 2–4, not
5, and that is correct. Stated here because `V1_SECURITY_REVIEW` §4 item 6 —
"after the import, `admin:list` shows the first Admin and nobody else" — reads
as passing on an environment where step 5 was skipped and **nobody** is Admin.

---

## 17. Open Decisions

Owner decisions this analysis surfaced. None was taken here.

| # | Decision | Bearing on launch |
| --- | --- | --- |
| 1 | **Should `offering.slug` be globally unique in the database**, as `category.slug` became in `I99`? | Not required to launch — the CSV can satisfy it. Required if the catalogue will ever be written by anything other than a carefully prepared CSV (a partner feed, a Business owner through the UI). |
| 2 | **The registration throttle** (§15.1): exempt the importer's caller, raise the limit, or provision partner accounts outside the API? | Determines whether a launch of more than nine partners is one run or a sequence of batches. |
| 3 | **B3 / B5 importer strictness** (§14.1, §14.3): refuse non-boolean `BOOLEAN`, empty `NUMBER` and unknown `priceKind`? | Not a blocker. Removes two silent-corruption paths. |
| 4 | **`.env.example`** (§14.4): document `IMPORT_PASSWORD` and `IMPORT_EMAIL_DOMAIN`? | Process safety. `IMPORT_PASSWORD` must never change. |
| 5 | **`stockState` default** (§16.4): should a blank cell claim `IN_STOCK` or state `UNKNOWN`? | A truthfulness question, not a technical one. |
| 6 | **Should an affiliate address be format-checked** at all (§7.2)? | Today a non-URL can be Enabled by a human act. |
| 7 | **`ownerEmail` policy** (§15.2): confirm that launch partners get derived addresses and no real mailbox. | Already the runbook §5.1 decision; restated because the column invites the opposite. |

**Still open from earlier work and untouched here:** attribution (P0-1); the
three externally-served advertising regions' UX sections; the Category address's
Feature/Story/PRD ownership; the `fastify` hop-count pin / `TRUSTED_PROXY_HOPS`;
`PLT F13`/`F14` UX sections; and the launch catalogue data itself.

### 17.A Global Offering Slug — recorded, not blocking

**Classification, decided by the Owner when this document entered the
repository: this is _not_ a blocker for catalogue preparation.** It is an open
item requiring a separate technical decision, and it is recorded here so that
decision is taken deliberately rather than discovered.

**The state of affairs, in three lines.**

| | |
| --- | --- |
| Database uniqueness | `@@unique([businessId, slug])` — scoped to the Business |
| Public read paths | resolve on the **bare** `slug`, globally, in seven places (§16.1) |
| Risk | where two published listings share a slug, the public resolution is **non-deterministic** — `found.rows[0]` with no `order by` and no `limit` |

**What this means for the launch catalogue:** nothing that the CSV cannot
satisfy. Global uniqueness is an authoring rule (§3, §13) and a post-import
query proves it held. It costs a naming convention — `<product>-<partner>` — and
no code.

**Explicitly not done, now or as part of this document:**

- **No schema change.** `offering` keeps `@@unique([businessId, slug])`.
- **No migration.** Nothing resembling `I99`'s `category_slug_key` is proposed
  for `offering.slug` here.
- **No route change.** The seven read paths are untouched, as is
  `/offerings/{slug}`.
- **No slug-format change.** `createDraftOfferingSchema` still accepts any
  1–160 character string; the convention lives in the CSV, not in a regex.

**What a future decision would weigh:** whether the catalogue will ever be
written by something other than a carefully prepared CSV. A partner feed
(`I76`–`I89`) or a Business owner creating a listing through the UI can both
pick a slug another Business already uses, and neither reads this document.

### 17.B B3 / B5 / `.env.example` — a separate technical increment

**Not resolved in the commit that added this document, by decision.** All three
stay open and are grouped as one small future increment (§14.5):

| Item | What it is | Why it can wait |
| --- | --- | --- |
| **B3** attribute value validation | `BOOLEAN` coerces anything but `true`/`"true"` to `false`; `NUMBER` turns `""` into `0` — both silently (§14.1) | §13's two checklist items close it at the data layer |
| **B5** `priceKind` validation | anything that is not the exact string `ON_REQUEST` becomes `FIXED` (§14.3) | §13's checklist item closes it; a missing `amount` still fails loudly |
| **`.env.example`** | `IMPORT_PASSWORD` and `IMPORT_EMAIL_DOMAIN` are documented nowhere (§14.4) | documentation, not code; the importer already explains `IMPORT_PASSWORD` when it is unset |

**B4 is not among them, and must not be re-listed as one.** `priorAmount >
amount` is enforced **twice** — by the contract's
`PRIOR_AMOUNT_IS_NOT_A_REDUCTION` refinement and by the database's
`offering_prior_amount_is_a_reduction` `CHECK`. A row that violates it **cannot
be written**. The earlier framing of B4 as an enforcement gap was wrong; the
only thing available to improve is the readability of a failure message that is
already loud and already names the row. Recorded here so the correction survives
the next reading of the B-list.

---

## 18. Final Recommendation

1. **Prepare the CSVs against §2, §3 and §13, in that order.** The checklist is
   the deliverable; the tables are its justification.
2. **Treat one rule as inviolable: every `offering.slug` is unique across the
   whole catalogue** (§16.1). It is the only rule in this document whose
   violation produces silently wrong behaviour instead of a failed row.
3. **Decide `productKey` before writing a single row.** The number of things a
   visitor sees is the number of distinct product keys, not the number of
   listings, and two partners' rows only become a comparison if their keys match
   character for character.
4. **Start with a pilot in one sector Domain** — one heading, two partners, four
   listings, one of them affiliate-ready (§9.3). Run it end to end, click the
   affiliate link, read the category page and the sitemap. It costs an afternoon
   and it proves every mechanism in this document.
5. **Batch the real import at nine new partners per quarter hour** (§15.1) until
   decision 2 is taken.
6. **Run `--dry-run` first, every time**, and read its per-row price line. It is
   the only rollback the importer has.
7. **Take decisions 3 and 4 as one small increment** before the real import, if
   there is appetite. Neither is a blocker; both remove a way to be quietly
   wrong.
8. **Nothing in this document requires reopening a Frozen record.** UX-0002 v1.4,
   traceability v2.5 and the PRD set are untouched and unaffected by every rule
   above.

---

### Appendix — queries used to measure this document

```sql
-- The seeded taxonomy, isolated from test data by its stable-key prefix.
with seeded as (
  select c.* from category c
  where c.stable_key ~ '^(YAZILIM_YAPAY_ZEKA|FINANS_KRIPTO|SIGORTA|REAL_ESTATE|TECHNOLOGY|EGITIM|SAGLIK_KOZMETIK|OYUN_ESPOR|EV_BAHCE|MOBILITY|SEYAHAT)__'
)
select count(*) as categories,
       count(*) filter (where parent_id is null) as roots,
       count(*) filter (where parent_id is not null) as headings,
       count(*) filter (where active) as active
from seeded;

-- Field-set coverage over the 127 headings.
with seeded as (
  select c.id from category c
  where c.stable_key ~ '^(YAZILIM_YAPAY_ZEKA|FINANS_KRIPTO|SIGORTA|REAL_ESTATE|TECHNOLOGY|EGITIM|SAGLIK_KOZMETIK|OYUN_ESPOR|EV_BAHCE|MOBILITY|SEYAHAT)__'
    and c.parent_id is not null
)
select count(distinct l.attribute_definition_id) as definitions, count(*) as links
from category_attribute l join seeded s on s.id = l.category_id;

-- The publication gate that is satisfied by construction at V1.
select count(*) filter (where required_for_publication) as required_definitions
from attribute_definition;
```
