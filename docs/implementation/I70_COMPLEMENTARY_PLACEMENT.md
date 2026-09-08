<!--
Owner:        Architecture Owner
Status:       Draft — built and tested. The superseding PRD revision it needs is
              written and waits on the Owner; it is named below.
Version:      0.1
Last Updated: 2026-09-03
-->

# I70 — What a listing suggests beside itself

## What was missing

The Owner's requirement is one example and a rule:

> otomotiv ile ilgili ilan incelendiğinde belirttiğim yerde lastik affilte link
> yönlendirmesi olması gerekiyor. **Tüm ilan bölümlerinde ilgili bölüme uygun
> tamamlayıcı ürünler önermesi gerekiyor.**

A car needs tyres, a laptop needs a bag, a policy needs roadside assistance —
and every one of those is a partner link the platform can carry without touching
what the listing says. **This is the revenue model, and nothing existed.**

## The document this runs ahead of, stated first

`PRD-0006 §20` permits advertising in three named regions and was written for an
**external network**: a publisher identifier, unit identifiers, and a network
that sells, moderates and reports. A complementary-product link is none of
those. It is a row somebody here wrote — a label, a partner, an address — served
by the platform from its own arrangement.

So the superseding revision was written, approved and **Frozen on 2026-09-03**
as `PRD-0006-platform.md` v2.3. It adds a fourth region, names it as the
platform's own, and bounds it exactly as the other three are bounded.

The one genuinely new thing in it is the _position_: §20.1 puts Presentation
advertising below the seller list, and the Owner's placement is directly under
the actions. That is not a loosening — it is the only region whose position is
set by what it says rather than by keeping it out of the way, because "you will
also need tyres" is useful to somebody who has just decided what to do about the
car and is an interruption to somebody still reading the price.

## What was built

| Piece                                 | What it does                                                 |
| ------------------------------------- | ------------------------------------------------------------ |
| `complementary_placement`             | Category, label, partner, note, address, order, active       |
| `GET /offerings/{slug}/complementary` | what this listing suggests, inherited down the Category tree |
| `/admin/complementary-placements`     | where an Admin writes them and switches them off             |
| `ComplementaryBlock`                  | the block under the actions, labelled **Reklam**             |

### Curated rows, not derived listings

The platform could compute "what goes with this" from the catalogue, and it
would be guessing: a heading's neighbours are not its complements, and a wrong
suggestion beside a real product reads as the platform not knowing what it
sells. A row here is somebody's judgement written down, and the surface carries
exactly what was written.

### Written against a Category, inherited downwards

The Owner's rule is about **sections**. A placement written against Otomotiv
applies to every heading under it; a placement written against one heading
replaces the sector's under that heading rather than appearing beside it. A
per-listing table would ask somebody to repeat "cars need tyres" for every car
on the site, which is how a rule stops being true somewhere.

### Advertising is kept out of what a listing _is_

`complementary` is **not** a field of the Presentation payload. §20.3 forbids
advertising from changing what is publicly eligible, what matches a query or
what a Listing Card contains — and the way to keep a promise like that is to
make it structurally true rather than to remember it. The Presentation contract
is `.strict()` and has no field a placement could arrive in; the block is
fetched beside it by a route that reads nothing about the person, and a failure
of that route leaves the page complete without it.

### Nothing is counted, and that is a decision

The platform could count a press and does not. §20.5 excludes impression, click
and revenue reporting, and here the reason is worth stating: a count makes the
placement a thing to optimise, and the next question after _which one is pressed
most_ is _which one should be shown first_ — which is advertising deciding an
order, one region away from the Results where §20.3 forbids it outright.

So the links are plain anchors with `sponsored nofollow noopener`, and the
platform learns nothing from a press.

### Absent by default

§20.4 makes advertising absent unless configured, so a heading nobody has
written a placement for renders **no region at all** — not an empty frame. The
first test in the file is exactly that.

---

## Documents this increment is ahead of

1. ~~**`PRD-0006 §20`**~~ — **resolved 2026-09-03**: `PRD-0006-platform.md`
   v2.3 §20 owns the region, `PLATFORM_FEATURE_REGISTRY.md` v1.1 allocates
   `F11` for it, and `UX-0003-offering-detail.md` v1.1 §8.7 describes it.
2. **No user story owns a placement.** `PLT F11` is allocated and a Story may
   now be written. Nothing governs who may write one, what
   is owed to a partner whose placement is switched off, or how a placement
   relates to that partner's Affiliate Destination — which today it does not:
   the address is typed, not drawn from the Destination the partner already has
   configured. Connecting the two is a real question and a later increment.
3. **`UX-0003`** describes the Presentation and names no advertising region.
