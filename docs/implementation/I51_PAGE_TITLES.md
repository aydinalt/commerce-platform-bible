<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-29
-->

# I51 — The title, which no check reads

I27, I28 and I29 consolidated this application onto Turkish, one Frozen document
at a time, and each proved it with a detector. **All of those detectors read
markup** — first the text between tags, then, after five separate corrections,
the strings inside a JSX expression.

`export const metadata` is neither.

So nothing in this repository had ever looked at a page title, and measured:

| | |
|---|---|
| Routes | 22 |
| Declaring their own title | 21 |
| Titles that were **English** | 2 — `Your account`, `Offering` |
| The site's own title | `Commerce Platform` |
| The site's own description | `Decision-completion marketplace` |

The header on every one of those routes says **`İlanlar`**. Every browser tab
said `Commerce Platform`.

## The clearest single line of evidence

`apps/web/src/app/account/page.tsx` renders

```tsx
<h1>{TITLES.account}</h1>   // Hesabınız
```

sixty lines below

```tsx
export const metadata: Metadata = { title: "Your account" };
```

**The same fact, in two languages, in one file.** I27 translated the one it
could see and left the one nothing reads. `TITLES.account` had been sitting in
the copy module, already Turkish, since I27.

A title is not decoration: it is the tab, the bookmark, the history entry, the
search result, and the first thing a screen reader announces on arrival.

## What it says now

- The root layout takes `default` and `template` from **`BRAND.name`**, so the
  product's name is declared once and the tab cannot drift from the header. The
  template is `%s — İlanlar`, page first, because a tab is truncated from the
  right and the part identifying *which* page is the part worth keeping.
- `/account` and both Offering routes name their subject from the vocabulary —
  `TITLES.account`, `TERMS.offering` — rather than restating it.
- The description is a **translation of the Frozen phrase**, not a new
  positioning claim. Deciding here that the product promises something more
  appealing than *decision-completion marketplace* would be a copy file deciding
  what the product is.
- Home is the one route with no title of its own, deliberately: on the front
  page the page and the site are the same thing, and `İlanlar — İlanlar` is not
  an improvement.

## The second position no check reads, and it was on screen

```tsx
{required ? " (required)" : null}
```

Beside `Görünen ad`, on Business Information, since I28.

`i27`'s expression scan exists to catch exactly this, and **it was defeated
twice over by one string**: its pattern required the character after the opening
quote to be a letter — this one begins with a space — and parentheses were
outside the permitted set. The `prose` test that follows also asked for a
capital letter or sentence punctuation, and `(zorunlu)` has neither.

That is the **twelfth** time something in this repository has matched other than
what it meant, and the sixth correction to this one detector.

**The hole was proven rather than asserted.** Reverting the detector to its
pre-I51 pattern with `" (required)"` back on screen leaves all fourteen of
`i27`'s cases passing.

## What was proven

`tests/i51-page-titles.test.ts`, seven cases.

| Mutation | Result |
|---|---|
| The site names itself twice again | 1 failed |
| The account tab returns to English | 2 failed |
| The owner's Offering tab returns to English | 2 failed |
| A new route ships with no title | 1 failed |
| A route grows a description of its own | 1 failed |
| A fourth literal title arrives | 1 failed |
| The required marker returns to English | 1 failed **in `i51` and 1 in `i27`** |

The last one failing in `i27` is the point: before this increment it did not.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: no OpenAPI drift, format, type check, lint, module boundaries,
**118 test files / 1073 tests**, 0 vulnerabilities, production build, 17/17
smoke checks. The suite ran in four parts for the reason I46 recorded.

`db:validate` could not run: `prisma validate` fetches an engine checksum and
this environment has no route to `binaries.prisma.sh`. That is the local
limitation `CURRENT_STATUS.md` already records, not a result.

### And this one was looked at

Four increments have ended with *nobody has looked at it*. This one served the
built application and read the tab:

| Route | `<title>` |
|---|---|
| `/` | `İlanlar` |
| `/login` | `Giriş yapın — İlanlar` |
| `/register` | `Hesap oluşturun — İlanlar` |
| `/decision` | `Karar — İlanlar` |
| `/compare` | `Karşılaştırma — İlanlar` |
| `/discovery` | `Sonuçlar — İlanlar` |

Home alone, the rest templated. It is six routes and a `curl`, not a browser —
but it is output rather than source.

## An exact set rather than a language heuristic, and why

Every earlier language case treats ASCII-only text as English. Applied to
titles, that reports the Decision flow's own Turkish title — **`Karar`** — as a
defect: Turkish reaches `ç ğ ı ö ş ü` within a sentence, not within one
five-letter word.

So the case asserts the **exact set of literal titles** instead, which is the
pattern that has not failed here. `Karşılaştırma`, `Karar` and `Sonuçlar` remain
literals and are acknowledged rather than repaired — the public routes never had
their copy extracted into a module, which I31 recorded as a boundary and this
increment did not widen into. A fourth literal, in any language, now fails.

## Known boundaries

- **Six titles were read from a served response; sixteen were not**, and no
  browser rendered any of them. The templating is confirmed, the rest is
  asserted source.
- **Three public titles are still literals**, and `Karşılaştırma` is spelled
  four times across three files — the title and three `h1`s. Extracting the
  public copy is a job of its own and is now pinned by an exact-set case so it
  cannot grow quietly.
- **`generateMetadata` is not used anywhere**, so no title carries the name of
  the thing being looked at: every Offering tab says `İlan — İlanlar` rather
  than the Offering's own title. That is a real improvement and a separate
  decision, because it makes the title a second read against the API.
- **The description is one sentence for twenty-two routes.** A search engine
  shows the same line for Home and for the Admin queue; only the first of those
  should be indexed at all, and nothing here says so — there is no `robots`
  directive anywhere in the application.
- **`" (required)"` was the only string of its shape found**, by a sweep with
  the leading-character and bracket restrictions removed. That sweep covered
  quoted strings in braced expressions; a string built by concatenation or
  returned from a helper would still be invisible.
