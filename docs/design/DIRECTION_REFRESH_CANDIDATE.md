<!--
Owner:        Architecture Owner
Status:       Draft — awaiting Owner approval
Maintenance Mode: Living
Version:      0.1
Last Updated: 2026-08-30
-->

# The refreshed direction — a candidate

The Owner asked on 2026-08-30 for a more modern and more user-friendly design,
and chose **"yönü tazele"**: a measured modernisation rather than a new
direction built from nothing. This records what that means, what it costs, and
what it does not touch.

Nothing here has shipped. `apps/web/src/app/globals.css` is unchanged and every
test passes. The proposal lives in `docs/design/direction-refresh.css` as a
layer scoped under one class, so `prototype.html` can show both directions and
the choice can be made by looking rather than by reading.

## What actually changes

| | Before | After |
|---|---|---|
| Card edge | 1px line, 4px radius | 1px line, **12px** radius, two-layer shadow |
| Listing card | Title and two facts | **Visual first**, 4:3 ratio box, title, facts |
| Grid column | 18rem minimum | **15rem** — cards carry a visual and can be narrower |
| Primary action | Same as every button | **Filled, warm** — one per screen |
| Filters | Scroll away | **Sticky** under the header |
| Header | Static | **Sticky**, translucent |
| Page heading | 1.5rem | **1.75rem** |
| Motion | None | **140ms** on hover and focus |
| Ink | `#16202e`, 13.4:1 | `#111827`, **16.69:1** |

## The three constraints this asks the Owner to give up

Each was written for a reason, and a reason has to be answered rather than
waved past.

### 1. "Lines rather than shadows"

The original argument: *elevation signals depth, and a list of listings has no
depth.*

The answer: these shadows are not depth, they are **separation**. Two layers at
4% and 6% alpha, offset 1–2px at rest — closer to a hairline that fades than to
a raised panel. A card still reads as flat. It reads as flat and detached from
the page rather than flat and drawn onto it, and that is what makes a grid of
twelve scannable.

**This is the weakest of the three answers** and worth saying so. The honest
version is that the 2020s idiom for a card is a soft shadow, and a product that
refuses it reads as older than it is. That is a market argument, not a
principled one.

### 2. "No animation"

The original argument: *motion needs a `prefers-reduced-motion` story, and the
alternative to writing one is not writing motion.*

The answer: **the story is written.** The block at the end of
`direction-refresh.css` removes every transition and the hover lift for anybody
whose system asks for reduced motion — it removes rather than shortens, because
a person who asked for less motion should get none, not a faster version.

### 3. "One accent and two states"

The original argument: *a fourth colour invites a fifth.*

The answer: `--cta` is **not a fourth state**. The state vocabulary is still
exactly two — `--notice` and `--critical`, no success green. `--cta` is the
colour of the one control the screen wants pressed, and it is warm precisely
because the accent is cool: the primary action becomes the only warm thing in
view.

The risk is real and named: the moment a second control on one screen takes
`--cta`, this argument is gone and the palette has four colours for no reason.
If this lands, that should be a test.

## What is not given up

- **The focus ring.** Untouched, plus a soft `box-shadow` ring on inputs.
- **`min-height: 2.75rem`** on every control. Density still comes from spacing
  and the grid, not from smaller tap targets.
- **Three breakpoints.** No fourth width is introduced.
- **Measured contrast.** Every colour below was computed, not chosen by eye.

| Pairing | Measured |
|---|---|
| `--text` `#111827` on page | **16.69:1** |
| `--text-muted` `#5b6472` on page | **5.63:1** |
| `--accent` `#1f5f9e` on page | **6.20:1** |
| `--cta` `#a8480a` as ink | **5.50:1** |
| White on `--cta` | **5.84:1** |
| `--critical` `#a12b2b` on its surface | **6.41:1** |
| `--border-strong` `#7e8593` on page | **3.49:1** (1.4.11 needs 3) |

`#b4530f` was the first CTA candidate and measured **5.02:1** behind white.
It passes and leaves no margin; `#a8480a` leaves some, and was chosen for that
rather than for looking better.

## What this does not solve

- **No dark mode.** `prefers-color-scheme` is genuinely modern and genuinely
  user-friendly, and it doubles the palette and every contrast measurement. It
  is a separate decision, not a line in this one.
- **The visuals are placeholders.** The image-forward card is the largest
  usability change here and the platform has **no seed content and no uploaded
  images**. If this lands before there is content, every card shows an empty
  ratio box, which is worse than today. **Landing this depends on the visual
  upload path, not on the CSS.**
- **Nothing was tested on a real device.** Sticky headers and `backdrop-filter`
  behave differently on iOS Safari than in a desktop browser, and no phone has
  loaded this.
- **Only nine screens are drawn.** The inventory has twenty-two routes; the
  thirteen not shown would inherit these rules without anybody having looked at
  the result.
- **`.badge` is still used on exactly one screen.** I49 and I50 both named this
  and it is still undecided; the refresh makes badges look better without
  answering whether states should be badges.

## If the Owner approves

Landing it is its own increment: move the layer into `globals.css`, relax the
three constraints in `tests/i26-design-foundation.test.ts` **with the reason
recorded in each case rather than deleted**, add the new contrast pairings to
the measured list, and add a case pinning `--cta` to one control per screen so
the argument in §3 stays true.
