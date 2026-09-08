<!--
Owner:        Architecture Owner
Status:       Draft — built and tested; the documents it is ahead of are listed
              at the end.
Version:      0.1
Last Updated: 2026-09-03
-->

# I69 — Hata Bildir

## What was missing

The platform had **one** way to say something is wrong with a listing, and it
belonged to Admins: a Moderation Case, opened under `US-PLT-F06-001` by a
person with authority.

The reader who notices that a price is three weeks stale is the only person who
_can_ notice it — the partner does not report their own stale prices, and the
platform cannot see the difference between a cheap listing and an out-of-date
one. That signal was being thrown away.

The Owner's requirement replaces the detail page's **Listeye dön** — a control
that duplicated the browser's own back button — with **Hata Bildir**.

## What was built

| Piece                                     | What it does                                                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `listing_report`                          | one table: the listing, the reason, the words, who if anybody, and whether somebody has looked |
| `POST /offerings/{slug}/reports`          | public, `202`, throttled per caller                                                            |
| `GET /admin/listing-reports`              | the queue, **oldest first**                                                                    |
| `POST /admin/listing-reports/{id}/review` | `ACCEPTED` or `DISMISSED`, once                                                                |
| `ReportForm`                              | the disclosure at the foot of the product page                                                 |
| `/admin/listing-reports`                  | the queue an Admin works through                                                               |

### A report is not a Moderation Case

The separation is the design, and it is why this is a separate table rather
than a fifth `ModerationTargetType`:

|            | Moderation Case                               | Listing report             |
| ---------- | --------------------------------------------- | -------------------------- |
| opened by  | an Admin, with authority                      | anybody, including a Guest |
| is         | a decision to look                            | an unverified claim        |
| can change | target state, through the Stories that own it | nothing                    |

Writing reports into `moderation_case` would have made the queue an Admin
reviews indistinguishable from a queue anybody can fill. Accepting a report
records that an Admin agrees there is something to fix; **what is then done
about it happens through the machinery that already governs doing it.** The
test asserts exactly this: an accepted report leaves the Offering `PUBLISHED`
and publicly readable.

### Open to a Guest

The people best placed to notice a stale price are the least likely to have an
account, and a sign-in wall would collect fewer reports from exactly them. A
signed-in reporter is recorded so a pattern from one account is visible; nobody
is asked to become one, and nobody is asked for an email address the platform
would then hold without a reason to.

**`202`, not `200`.** What the platform has done is accept a claim, not agree
with it. A response that read as agreement would tell somebody their report was
right before anyone had looked.

### Bounded, and the refusal says so

A public write with no account behind it needs a bound or it is a way to fill a
table. Ten per caller per hour — generous, because somebody working through a
category and finding four stale prices is the best thing that can happen to a
comparison platform. The refusal is a plain `429`: a person whose report went
nowhere is entitled to know it did, rather than being thanked for something
that was dropped.

The caller's address is hashed and never stored raw, exactly as the sign-in
limiter treats it. It is a key for counting, and a table of readers' addresses
beside the listings they complained about is not a thing this platform should
hold.

### The queue is oldest first

Every other list on this platform shows the newest first because it is news.
This is work, and a queue arranged by arrival would let the oldest report sit
unread forever behind a page of new ones.

Each row carries `reportsForListing` — the open reports about the same listing.
One person saying a price is wrong is a claim; six people saying it is today's
work, and the pattern is visible in the queue rather than found by opening rows
one at a time. The listing number is on the row because that is what an Admin
will quote to the partner, and a UUID is not something anybody quotes.

Closing is `where status = 'OPEN'`, so two Admins reaching one row is a `409`
for the second rather than a silent overwrite of the first one's decision.

---

## Documents this increment is ahead of

1. **No user story owns a reader report.** `US-PLT-F02-001` owns the Moderation
   Case and is deliberately untouched; nothing governs a public report, its
   retention, or what an Admin owes a reporter.
2. **`PRD-0006`** describes General Moderation's inputs as Admin surfacing. A
   reader-originated queue is a second input and belongs in that section.
3. **Retention.** A report holds a stranger's sentence and, sometimes, an
   account id. Nothing says how long it is kept. The rows are small and the
   evidence value is real — a dismissed report is why the next identical one
   can be answered — but "kept forever" should be a decision rather than a
   default.
4. **Core Analytics counts no reports**, so the Admin panel links the queue
   without a number beside it. Adding the count belongs to the Analytics story
   rather than to a page that would then hold the only definition of it.
