<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-21
-->

# I27 — Turkish consolidation, UX-0008

First of three, following the Owner's sequencing decision of 2026-08-21:
**Turkish consolidation first, the multi-language decision second.**

## The accident

The application was bilingual, and nobody chose it. The root declared
`<html lang="tr">` and the public journey — Home, Discovery, the Offering
Presentation, Compare, Decision — was Turkish. **Eighteen surfaces declared
`lang="en"` and were written in English**: the Business Dashboard, every Admin
screen, and all of authentication.

So a person searched for a listing in Turkish, pressed *Giriş*, and arrived at
**Sign in**. Changing language mid-journey reads as having left the platform.

This increment translates UX-0008's six surfaces: sign in, register, confirm,
recovery, reset, account.

## The vocabulary comes first

`apps/web/src/vocabulary.ts` holds the Frozen domain terms in Turkish, and it
exists **so that three translations do not produce three vocabularies**.
Translating three areas independently is three chances to call an Offering
something different, and a person who reads *ilan* on one screen and *teklif* on
the next has been given two products. Single Information Owner applies to words.

The choices are anchored rather than invented — Discovery and Compare have said
`ilan` and `kategori` since I4, and those are kept.

Three worth defending:

- **`Arşivlenmiş`, not `Silinmiş`.** Nothing here deletes an Offering; retirement
  is a transition to a state an Admin can still read. `Silinmiş` would name a
  capability that does not exist.
- **`Kısıtlı`, not `Yasaklı`.** A Restricted Business keeps its Offerings and
  keeps managing its information. The restriction is bounded and the word has to
  be bounded with it.
- **`Parola`, not `şifre`.** Both are current; picking one and holding it is the
  whole point of the file.

## Strings extracted, not just translated

`apps/web/src/identity/copy.ts` holds every word the six surfaces say, following
the shape `decision/copy.ts` established.

**The extraction is the point, not tidiness.** §9.2 of the design foundation
says real multi-language support needs "every user-visible string extracted,
across 22 routes". Doing the extraction *as* the translation means i18n later
changes what this module returns instead of touching every route a second time.
The Owner's sequencing decision is what makes that possible, and this is where
it pays.

## Two things the translation had to carry across intact

**The sign-in refusal names neither half.** Saying which of the address or the
password was wrong tells an attacker whether an address is registered.
`E-posta adresi ve parola eşleşmedi.` keeps that.

**One message for a spent, expired or forged link.** Three causes, one sentence,
because distinguishing them would confirm that a token once existed.

Both are asserted rather than assumed, because a translation is exactly where a
security property gets lost by being paraphrased.

## The test that passed while it was wrong

The first version of "leaves no English sentence in them" **listed English words
to look for** — `Your`, `Sign`, `Password` — and passed while two English
sentences were still on screen:

> "Check your email. Registration is not finished until you follow the link we
> sent."
> "If that address has an account, a link to set a new password is on its way."

Neither began with a word on the list. **A test that enumerates what to catch
catches what somebody remembered**, and the failure mode is silent: an English
sentence in a Turkish screen looks like a screen, not like a bug.

Rewritten to look for the *shape* instead: rendered text of two or more words
containing **no Turkish-specific letter**. Turkish prose reaches `ç ğ ı İ ö ş ü`
within a sentence or two, and reading only what sits between tags excludes
`lang`, `href` and `className`, which are Latin and are not copy.

It caught both immediately.

## What was proven

`tests/i27-turkish-consolidation.test.ts`, eight cases.

| Mutation | Result |
|---|---|
| One of the two English sentences returns | 2 of 8 failed |
| `lang="en"` put back on a translated route | 1 of 8 failed |
| A second word for Offering enters the vocabulary | 1 of 8 failed |
| The copy module stops composing from the vocabulary | 1 of 8 failed |
| The refusal names which half was wrong | 1 of 8 failed |
| The refusal stops saying what did not change | 1 of 8 failed |
| A link says "buraya tıklayın" | 1 of 8 failed |

Two existing tests were updated rather than weakened. `i10-accessibility`'s
`ENGLISH` pattern **is a record of an accident being cleaned up and only
shrinks**; when the remaining two areas land it becomes empty, and the case
still holds — a route marked English while written in Turkish fails as loudly as
the reverse.

## Verification

Format, lint, module boundaries, type check, **96 test files / 879 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **Twelve surfaces remain English**: the Business Dashboard's five and Admin's
  seven. They are the next two increments in the approved sequence.
- **The Turkish has not been read by a Turkish speaker who is not me.** It is
  consistent and it follows the existing surfaces, and consistency is not the
  same as sounding right.
- **`toLocaleUpperCase("tr")` is not used anywhere yet** because nothing
  upper-cases user text today. When something does, a plain `toUpperCase()`
  turns *ilan* into *ILAN* rather than *İLAN* — recorded so it is found before
  it ships rather than after.
- **§9.1 remains unanswered** — interface-only, content too, or locale-scoped
  catalogue. It does not block the remaining two consolidations; it blocks i18n.
- **No screen reader has heard any of this.** R4.7 is unchanged.
