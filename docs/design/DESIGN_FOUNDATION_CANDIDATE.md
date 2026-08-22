<!--
Owner:        Architecture Owner / Product Owner
Status:       Draft — candidate, awaiting Owner review and approval
Maintenance Mode: Living until approved
Version:      0.1
Last Updated: 2026-08-21
-->

# Visual Design Foundation — Candidate

> **No Approval Note and no Freeze Note.** This proposes and does not govern.
> Nothing may cite it as a specification until the Owner approves it.

## 1. Why this document exists

**No Frozen UX document specifies visual design.** UX-0001 through UX-0009
specify *behaviour* — what may happen, what must not, what a person must be able
to perceive. The single colour reference in the baseline is UX-0001 §16's
"perceivable without color alone", which is an accessibility constraint rather
than a palette.

So the 22 routes are built, proven and accessible, and dressed in **263 lines of
CSS with 13 class names** that were written to make pages legible rather than to
be a design.

This document proposes the missing layer. It is written to be argued with: every
number below is a decision that can be changed once, in one place, rather than
found later in forty files.

**Owner decisions already taken (2026-08-21):**

| Decision | Answer |
|---|---|
| Visual character | **Calm, content-first** |
| Existing brand | **None — propose from scratch** |
| Interface language | **Real multi-language infrastructure** |

The language decision is the largest of the three and is **not a design
decision**. It is treated separately in §9, because approving a palette should
not accidentally approve a scope change.

---

## 2. Three defects this replaces

Measured, not assumed.

**The typeface is never loaded.** `globals.css` asks for `Inter` and nothing
fetches it — no `next/font`, no `@font-face`, no stylesheet link. Every visitor
without Inter already installed silently falls back to the system UI font. The
design has been rendering in a typeface nobody chose.

**There is no responsive design.** Zero media queries across the whole
application. `main` is a centred grid with a `46rem` cap, which survives a phone
by accident rather than by intent.

**The application is bilingual by accident.** The root is `<html lang="tr">`,
Home and Discovery are Turkish, and **fourteen route surfaces declare `lang="en"`
and are written in English** — the Business Dashboard, every Admin screen, login,
register and password recovery. A Turkish marketplace whose owners manage their
listings in English.

---

## 3. What "calm, content-first" commits us to

A direction is only useful if it forbids things. This one says:

- **Lines, not shadows.** Elevation is a device for signalling depth; a list of
  listings has no depth. Borders and spacing carry the structure.
- **One accent, used sparingly.** Colour marks what is interactive or what
  demands attention. A screen where four things are coloured has told the person
  nothing.
- **Type does the hierarchy.** Size and weight before boxes and rules.
- **Whitespace is a component.** Density is a choice against this direction, and
  where more listings per screen matters more than calm, this is the wrong
  direction and should be rejected now rather than eroded later.

---

## 4. Colour

A nine-step neutral ramp and one accent. Every pairing below states its **measured**
contrast ratio, because I9 established that a state a person cannot perceive is a
state they do not have.

> **Corrected 2026-08-21.** Version 0.1 of this table carried *estimated* ratios
> and one of them was wrong in a way that mattered: `--border-strong` was given
> as `#C3C7CE` at "3.1:1" and measures **1.63:1**. That colour is used on input
> borders, which WCAG 1.4.11 holds to 3:1 as a non-text UI component — so the
> palette would have shipped a control boundary a person with low vision could
> not find. It is now `#818894`. Five other ratios were off by up to 0.8 without
> changing a verdict, and are corrected below.
>
> This is why §11 item 5 exists. The values are now enforced by a test rather
> than asserted in a document.

| Token | Value | Use | Measured |
|---|---|---|---|
| `--surface` | `#FAFAFA` | page background | — |
| `--surface-raised` | `#FFFFFF` | cards, form fields | — |
| `--border` | `#E3E5E9` | hairlines, card edges — decorative | 1.3:1, not a control |
| `--border-strong` | `#818894` | input borders, control boundaries | **3.42:1** ✅ 1.4.11 |
| `--text` | `#16202E` | body and headings | **15.72:1** ✅ AAA |
| `--text-muted` | `#5A6577` | secondary facts, captions | **5.65:1** ✅ AA |
| `--accent` | `#2C5F8A` | links, focus, primary action | **6.47:1** ✅ AA |
| `--accent-strong` | `#1F4767` | hover, pressed | **9.33:1** ✅ AAA |
| `--accent-surface` | `#EEF3F8` | selected row, active filter | accent on it: **6.05:1** ✅ |
| `--critical` | `#9B2C2C` | destructive confirmation, refusal | **7.21:1** ✅ AAA |
| `--critical-surface` | `#FBEEEE` | refusal background | critical on it: **6.65:1** ✅ |
| `--notice` | `#7A5A1E` | correction notice, restriction | **6.08:1** ✅ AA |
| `--notice-surface` | `#FCF6E9` | notice background | notice on it: **5.89:1** ✅ |

**There is no success green and no warning amber**, deliberately. This
application has exactly three things to say about a state — it worked, it was
refused, it needs your attention — and the third is `--notice`. Adding a fourth
colour invites a fifth.

**Colour is never the only carrier.** Every state above pairs with a word and,
where it is live, a `role="status"` or `role="alert"` — which the error surfaces
built in I23 and I24 already do.

---

## 5. Typography

**Inter, actually loaded**, via `next/font/local` or `next/font/google` with
`display: swap` and a system fallback stack. Inter carries the full Turkish set —
`ğ ı İ ş ç ö ü` — including the dotted and dotless *i* distinction, which a
careless fallback breaks.

Loading it is not cosmetic: it is the difference between a chosen typeface and
whatever the visitor's operating system supplies.

| Token | Size | Line | Weight | Use |
|---|---|---|---|---|
| `--text-display` | 30px | 1.2 | 600 | one per page, page title |
| `--text-heading` | 21px | 1.3 | 600 | section headings |
| `--text-subheading` | 17px | 1.4 | 600 | card titles, group labels |
| `--text-body` | 16px | 1.6 | 400 | body, form values |
| `--text-small` | 14px | 1.5 | 400 | facts, captions, metadata |
| `--text-mono` | 14px | 1.5 | 400 | identifiers, correlation ids |

**16px body, not 15px.** The current stylesheet uses 15px; 16px is the browser
default and the size at which a phone will not zoom a focused input.

**A monospace step is included** because the error surfaces show correlation
identifiers a person may need to quote, and a UUID in a proportional face is
unreadable.

---

## 6. Spacing, radius, and lines

- **Space scale**, 4px base: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`.
  Nothing between steps. The scale exists to stop 13px and 27px appearing.
- **Radius:** `--radius: 4px` for cards and inputs, `--radius-sm: 2px` for
  badges. One value each; no per-component exceptions.
- **Border width:** `1px` everywhere.
- **Elevation:** none. See §3.
- **Focus ring:** `2px solid var(--accent)` with `2px` offset, on **every**
  interactive element, never removed. I9 established focus visibility across 22
  routes and this must not quietly undo it.

---

## 7. Layout and responsive behaviour

Three breakpoints, mobile-first:

| Name | From | Content width | Notes |
|---|---|---|---|
| base | 0 | fluid, 16px gutters | single column throughout |
| `--bp-md` | 768px | 46rem | two-column Listing Cards; filters beside results |
| `--bp-lg` | 1120px | 60rem | Admin tables gain their full width |

**The Admin Dashboard is the constraint that sets `--bp-lg`.** Moderation
queues and Attribute definitions are genuinely tabular and compress badly; every
other surface reads fine at `46rem`.

**Tables become definition lists below `--bp-md`** rather than scrolling
horizontally. A moderation queue a person cannot read on a phone is a queue that
does not get worked.

---

## 8. Components

Derived from what the 22 routes already render, not invented. The current 13
class names become these:

| Component | Where it is used | New? |
|---|---|---|
| Listing Card | Discovery results, Compare | existing |
| Search entry | Home, Results-unavailable surface | existing |
| Category choices | Home, Browse, narrowing | existing |
| Category path | Browse, Results | existing |
| Attribute list | Offering detail, Compare | existing |
| Comparison table | Compare | existing |
| Decision entries | Offering detail, Decision flow | existing |
| Zero results | Discovery | existing |
| Notice | correction notices, preparation notice | existing |
| **Button** — primary, secondary, destructive | everywhere | **new** |
| **Field** — label, input, hint, error | 8 forms | **new** |
| **Badge** — lifecycle, moderation status | Dashboard, Admin | **new** |
| **Inventory group** | Business Dashboard | existing |
| **Data table** | Admin, with the §7 phone behaviour | **new** |
| **Unavailable surface** | I23/I24, both variants | existing |
| **Skeleton** | for `loading.tsx`, once that increment runs | **new** |

Six new components, nine existing ones formalised. **No component library is
proposed** — see §10.

---

## 9. Interface language — a separate decision

The Owner chose **real multi-language infrastructure**. This section states what
that actually costs, because it is scope rather than styling and should be
approved separately.

### 9.1 The question that comes first

**Listings are written by people, and i18n does not translate them.** `title`,
`summary`, Business `name`, Category `name`, Attribute names and correction
notes are all user- or Admin-authored free text in the database.

A language selector that switches the *chrome* to English while every listing
stays in Turkish is a promise the platform cannot keep — and it is worse than
having no selector, because the person chose English and got Turkish.

So one of these has to be decided before any i18n work:

| Option | What it means |
|---|---|
| **Interface-only** | The selector changes labels and messages; content stays as authored. Must be *stated on screen*, not discovered. |
| **Content too** | Businesses author in multiple languages, or the platform translates. New Stories, new schema, new moderation surface — this is a product, not a feature. |
| **Locale-scoped catalogue** | Categories and Attributes are translated (they are platform-authored and finite); Offerings are not. A middle path, and the only one that is small. |

**Recommendation: locale-scoped catalogue**, because Category and Attribute
names are the only text the platform itself owns.

### 9.2 What it costs regardless

- A message catalogue and a `next-intl`-shaped layer — the first UI dependency
  this application would take.
- **Every user-visible string extracted**, across 22 routes. Some are currently
  inline Turkish, some inline English.
- Locale in the URL or in a cookie — and UX-0002 §4 puts persistent URL state
  outside V1, so the cookie is the consistent choice.
- `lang` set correctly per document rather than the current per-`<main>` mixture.
- Turkish casing: `toLocaleUpperCase("tr")` for the dotted/dotless *i*. A plain
  `toUpperCase()` turns *ilan* into *ILAN* rather than *İLAN*.

### 9.3 Governance

By Documentation First Development this is not something to start from a chat
message. **It needs at minimum an ADR** naming the languages, the content
decision from §9.1, and the locale carrier — and if content translation is
chosen, a PRD and Story chain before any code.

### 9.4 Sequencing recommendation

**Do the Turkish consolidation first, i18n second.** The fourteen English
surfaces have to be translated either way; doing that as part of string
extraction makes it one job instead of two, but doing it *first* means the
application is coherent in one language while the i18n decision is still being
taken. Nothing is wasted either way, and the first order is honest sooner.

---

## 10. Decisions worth arguing with

**No CSS framework and no component library.** The application has **zero**
styling dependencies today and 22 routes with a settled markup structure. Plain
CSS with custom properties keeps that at zero, keeps the tokens in one file, and
avoids a class vocabulary in the markup that a future redesign would have to
unpick.

*The case against:* Tailwind or shadcn/ui would be faster to build the six new
components with and are what most teams reach for. If the Owner expects the
surface to grow substantially past 22 routes, that trade reverses. Recorded so
reversing it is a decision rather than a drift.

**No dark mode in round one.** `color-scheme: light` stays. Dark mode doubles
every contrast check in §4 and this direction has not been seen by anyone yet.
Proposed for after the palette survives contact with real screens.

**No animation.** Calm and content-first does not need motion, and motion needs a
`prefers-reduced-motion` story that would otherwise be discovered by someone it
harms.

**Tokens go in `globals.css` as custom properties**, not in a TypeScript theme
object. They are consumed by CSS, they change rarely, and a runtime theme object
would put styling decisions where the type checker cannot see them and the
browser cannot cache them.

---

## 11. What approving this authorises

One increment, scoped as:

1. Load Inter properly and apply the type scale
2. Introduce the token layer in `globals.css`
3. Build the six new components and formalise the nine existing ones
4. Add the three breakpoints and the table-to-list behaviour
5. Re-run the I9 accessibility checks against the new surface — **the contrast
   ratios in §4 are claims until they are measured in place**

It does **not** authorise §9. That is a separate approval with a separate
decision inside it.

## 12. Owner decisions this document needs

1. Accept, amend or reject the direction, palette and scale in §3–§8.
2. Answer §9.1 — interface-only, content too, or locale-scoped catalogue.
3. Confirm §10's no-framework choice, or overturn it.
4. Confirm the §9.4 sequencing — Turkish consolidation first, or i18n directly.
