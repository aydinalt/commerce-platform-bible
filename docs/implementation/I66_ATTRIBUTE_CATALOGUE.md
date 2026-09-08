<!--
Owner:        Architecture Owner
Status:       Draft — built and tested; the operator step and the documents it
              is ahead of are listed at the end.
Version:      0.1
Last Updated: 2026-09-02
-->

# I66 — The catalogue had a shape and no fields

## What was actually missing

`seed-taxonomy.mjs` (I57) gave the platform eleven sectors and **127
headings**. The Attribute machinery — `attribute_definition`,
`attribute_option`, `category_attribute`, `offering_attribute_value` — has
existed since I2 with a complete Admin API in front of it.

**Outside the test suite, nothing had ever written a row into it.**
`seed-demo.mjs` published its Offerings with `attributes: []`.

Six things were therefore missing at once, and between them they are most of
the product:

1. the Owner's _"her başlık kendi alan setini kullanır"_ — the grouped
   specification his prototype shows on every product page;
2. **Attribute Filters** (`US-DSC-F05-001`), offered only where a Category has
   filterable Attributes — that is, nowhere;
3. the **comparison table's rows**, which come from `comparable` definitions;
4. the search that answers **"16 gb ram laptop"**;
5. **listing entry itself** — a seller opening the form was shown a title, a
   price and nothing that distinguishes one laptop from another;
6. and, downstream of all of it, any reason for a buyer to trust the comparison.

## What was built

| Piece                                   | What it does                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `scripts/seed-attributes.mjs`           | 404 Attribute definitions, 1.161 options, **657 heading links** across all 127 headings. `npm run seed:attributes` |
| `scripts/seed-demo.mjs`                 | now fills real values on all six demo products, resolved from the draft's own applicable set                       |
| `pg-offering-content.repository.ts`     | the projection's `attribute_text` now carries **the field's name and unit** beside its value                       |
| `tests/i66-attribute-catalogue.test.ts` | six drift guards, read from the two scripts as text                                                                |

### Four to ten fields per heading, and the reason

A heading with twenty fields is a form nobody finishes and a filter panel
nobody reads; one with two is a Category that cannot be narrowed. §5.5 makes
every one of these a potential Filter, so the list answers _"what would you
narrow by"_ rather than _"what could be recorded"_ — and the bound is asserted
so the next hundred headings are argued about rather than accumulated.

### Definitions are global; headings point at them

`stable_key` is unique on `attribute_definition`, so "Garanti süresi" is **one**
definition used by thirty headings rather than thirty with one name. That is
what makes a filter mean the same thing in two Categories. The file is written
per heading and de-duplicated by the script, and a key written twice with
different options is **refused** — which already caught one: `PANEL` meant a
television's screen technology in one sector and a hosting control panel in
another.

### `requiredForPublication` is set on nothing

It is a real gate: an Offering missing a required value cannot be published.
Turning it on for a catalogue that already holds other people's drafts would
retire their work by running a seed script. The flag belongs to the Admin
screens, one heading at a time, once there are sellers to tell.

---

## The search fix, which is the Owner's own example

The projection's `attribute_text` held **values only**. So the laptop's row read

```
1.24000000 2560×1600 512 GB 14.00000000 Dahili 24 ay Apple M serisi macOS 16 GB
```

and _"16 gb ram laptop"_ matched nothing: three of those four words are the
**names** of things, and no name was in the text. The name and the unit now join
the value — `RAM 16 GB`, `Ekran boyutu 14 inç` — because a person types what
they would say out loud.

Measured against the seeded demo catalogue afterwards:

| Query                | Result                       |
| -------------------- | ---------------------------- |
| `16 gb ram`          | Aurora Book Air 14 M3 512 GB |
| `16 gb ram laptop`   | Aurora Book Air 14 M3 512 GB |
| `amoled 120 hz`      | Nova X7 Pro 5G 256 GB        |
| `her şey dâhil otel` | Kapadokya 2 Gece Butik Otel  |
| `muafiyetsiz kasko`  | Tam Kasko Poliçesi           |

A definition marked non-searchable is still withheld: the flag decides, not the
presence of a value.

---

## The operator step

A deployment now needs three seeds in order, and the second is new:

```
npm run seed:taxonomy     # 11 sectors, 127 headings
npm run seed:attributes   # the field sets                     ← new
npm run seed:demo         # optional: seven partners, six products
```

Each is idempotent. Running `seed:attributes` after adding a heading writes
only that heading's links.

---

## Documents this increment is ahead of

1. **No document names the field sets.** The catalogue is 404 definitions of
   product judgement with no PRD or user story behind it — the largest piece of
   undocumented product decision in the repository. `US-PLT-F09-001` governs how
   an Attribute _behaves_; nothing governs which ones exist.
2. **`FIRST_VERTICAL_SLICE_READINESS.md`** and `first-run.mjs` describe the
   bootstrap as taxonomy-then-listings; both need the middle step.
3. The search change touches `PRD-0002 §11.2`'s list of what Search matches —
   "Offering description and applicable Attribute **value**". It now matches the
   Attribute's name as well, which is a widening the section should state.
