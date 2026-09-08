# Open decision — how a feed finds an imported listing

- **Raised by:** Implementation, during `I88`
- **Status:** **Answered — Option B**, by the Product Owner / Architecture Owner
  on 2026-09-05: _"b seçeneği ile ilerle gerekli güncellemeleri yap."_
- **Date:** 2026-09-05 (raised and answered the same day)
- **Implemented by:** `I89`, in `apps/worker/src/feed.sync.ts` (`link`), proved
  in `tests/i89-feed-matching.test.ts`
- **Rests on:** `PRD-0001` **v4.2**, approved and Frozen by the Owner on
  2026-09-05 and now the authoritative document. v4.1 is preserved at
  `PRD-0001-offering-v4.1-superseded.md`. Nothing here is outstanding.

---

## 1. What was decided, and what it ran into

The Owner, 2026-09-05:

> *"Feed'in görevi yalnızca eşleşen ve yayında olan ilanların fiyat ve stok
> durumunu (price & stock updates) güncellemektir."*

`I88` implemented all of it: the intake creates nothing, publishes nothing, and
writes price and stock only.

**"Eşleşen" is the word with a problem in it.** The intake finds a listing
through `offering_feed_item`, a link row that until `I88` was written by the
intake itself when it created the listing. Nothing else writes one. So:

- listings **earlier feed runs created** are still maintained — the decision is
  fully in force for them;
- listings **the file import created** have no link, and there is no way to give
  them one.

A feed pointed at a partner whose catalogue arrived by file therefore updates
nothing and reports every product as `skipped`. That is not a bug in the
restriction; it is the missing half of it.

## 2. Why implementation stopped here instead of solving it

`PRD-0001-offering.md` **v4.1 §5.11.1**, Frozen on 2026-09-03:

> An automated intake **may create and update Offerings whose Source is Feed,
> and may not modify any other.**

An imported listing's Source is not Feed. Matching a feed to one is exactly the
thing that sentence forbids, and §5.11.1a repeats the boundary for the
availability input: *"only to an Offering whose Source is Feed, and only through
the intake that created that Offering"*.

Writing the matching anyway would have been a Frozen rule broken quietly in a
worker, which is the one place nobody would look for it. `DOCUMENT_LIFECYCLE.md`
§7–§8 says what to do instead: a superseding revision, begun at Draft, approved
explicitly. This note is the request for that decision.

The rule is also **not merely bureaucratic**. It is what has kept the intake off
an Admin's typed correction and a Business owner's authoring for the whole life
of the system, and it is enforced structurally — the intake cannot name an
Offering it has no link to. Whatever replaces it has to keep that property.

## 3. The options

### Option A — leave it. The feed maintains only what it created.

Nothing changes. Feeds are useful for partners who publish a catalogue the
platform imports **through the feed**, which `I88` has just stopped it doing —
so in practice this means the feed is dormant at V1.

- *For:* no PRD change, no new mechanism, no risk.
- *Against:* the price and stock updates the Owner asked for do not happen for
  the launch catalogue, which is the whole catalogue.

### Option B — match on Product Key within the Business. **(Chosen)**

`productKey` is already in both worlds: a column on `offering`, a mapped field
in a feed, and a column in `offerings.csv`. The intake would, for each document
row, look for the Business's **published** listing with that Product Key; on a
single match it writes the `offering_feed_item` link once, and from then on the
link is the match. Two listings with the same key in one Business is ambiguous
and is skipped with a reason rather than guessed at.

- *For:* no schema change; the operator already fills the column; the link is
  written once and is then as strong as today's; the "single match only" rule
  keeps it honest.
- *Against:* it needs the PRD revision below, and it makes `productKey` carry a
  second job — grouping partners' offers **and** identifying a partner's own
  product. Those coincide today and might not always.

### Option C — a partner reference column of its own.

Add `external_ref` to `offering`, fill it from a new `externalId` column in
`offerings.csv`, and match on `(business, external_ref)`.

- *For:* the exact thing, named as itself; no overloading.
- *Against:* a migration, a contract change, an Admin surface that shows and
  edits it, and an operator who has to obtain each partner's SKU before the
  import — which the file may not carry at launch.

## 4. What a revision would have to say

If B or C is chosen, `PRD-0001` v4.2 replaces §5.11.1 with something of this
shape — offered as drafting, not as a decision:

> An automated intake may **update the price and stock state** of an Offering it
> is linked to, whatever that Offering's Source, and may **create no Offering
> and change no other field**. The link is established once, by an explicit
> match rule, and only to an Offering that is **Published**. An intake may not
> create, publish, hide, retire or edit the content of any Offering.

That is narrower than today's rule in every respect except the one the Owner
asked to widen, and it keeps §5.11.1a's availability boundary intact by resting
it on the link rather than on the Source.

## 5. What was built

`I89`, exactly as option B describes, and every part of it is a refusal except
the one certain case:

| Case | What happens |
| --- | --- |
| One published listing of this Business carries the key, unlinked | The link is written once, and is the match from then on. Recorded as its own `offering.feed.link` audit action. |
| Two or more carry it | **Rejected with a reason.** A guess would attach a partner's price to the wrong listing, which is the one failure on a comparison site that nobody would ever notice. |
| The document row carries no Product Key | Nothing linked, counted as skipped. A feed that does not map the field never links anything. |
| The match is a Draft, Hidden or Archived listing | Nothing linked. An automated price feed does not acquire a listing somebody is still writing or has taken down. |
| The listing already has an intake link | Nothing linked; `offering_feed_item.offering_id` is unique, so the database enforces it too. Two feeds bidding on one price would leave whichever ran last in charge, silently. |

The link is keyed on the **partner's own identifier** from then on, so a partner
who re-keys their catalogue keeps their price updates.

## 6. Closed

`PRD-0001` **v4.2** was approved and Frozen on 2026-09-05, in the Owner's own
words: _"PRD-0001 v4.2-candidate taslağını resmi olarak onaylıyorum. Bu belgeyi
dondurup (Freeze) platformun yetkili belgesi kılabilir ve v4.1 sürümünü
`-superseded` olarak arşive kaldırabilirsin."_

`PRD-0001-offering.md` now carries v4.2; v4.1 is preserved unchanged at
`PRD-0001-offering-v4.1-superseded.md`. The code and the authoritative document
agree again, and the window in which they did not is described above rather than
tidied away — it lasted one increment, was declared before the code was written,
and closed with a decision rather than with a rewrite of what happened.

**Nothing here is open.** A later change to how an intake is matched to a
listing is a new decision and a new superseding revision, not an edit to this
note.
