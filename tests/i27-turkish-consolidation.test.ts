import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCOUNT,
  ACTIONS,
  FIELDS,
  LINKS,
  REFUSALS,
  TITLES
} from "../apps/web/src/identity/copy.js";
import { REFUSAL_COPY } from "../apps/web/src/identity/outcome.js";
import { CORRECTION, DASHBOARD } from "../apps/web/src/business/copy.js";
import { ENTRY_LABELS } from "../apps/web/src/business/inventory.js";
import {
  ANALYTICS,
  CASES,
  PANEL,
  tallyLabel
} from "../apps/web/src/platform/copy.js";
import { ACTION_LABELS } from "../apps/web/src/platform/moderation.js";
import { DOMAIN_LABELS } from "../apps/web/src/platform/catalog.js";
import {
  FUNCTION_LABELS,
  PERIOD_LABELS
} from "../apps/web/src/platform/panel.js";
import {
  CONTEXTS,
  CREDENTIALS,
  DOMAINS,
  LIFECYCLE,
  MODERATION,
  TERMS
} from "../apps/web/src/vocabulary.js";

/**
 * The areas consolidated so far, in the order the Owner sequenced them.
 *
 * ~~**This list only grows, and `i10-accessibility`'s `ENGLISH` pattern only
 * shrinks.** The two meet when Admin lands: every route is Turkish, no route
 * claims otherwise, and both checks still hold.~~
 *
 * **They have met.** Admin landed in I29, so this list is now every route
 * folder in the application and `i10`'s `ENGLISH` pattern is gone rather than
 * smaller. What was a moving boundary between two languages is a property of
 * the whole thing.
 */
const AUTH = ["login", "register", "recover", "account"];
const BUSINESS = ["businesses"];
const ADMIN = ["admin"];
const CONSOLIDATED = [...AUTH, ...BUSINESS, ...ADMIN];
const APP = "apps/web/src/app";

/** Every `.tsx` under a route folder, including its child components. */
function surfaces(folders: string[]): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (entry.endsWith(".tsx")) found.push(path);
    }
  };
  for (const folder of folders) walk(join(APP, folder));
  return found;
}

/**
 * The Turkish consolidation, UX-0008's six surfaces.
 *
 * **The application was bilingual by accident.** The root declared
 * `<html lang="tr">`, Home and Discovery were Turkish, and eighteen surfaces
 * declared `lang="en"` and were written in English — so a person who searched
 * for a listing in Turkish and then signed in changed language mid-journey,
 * which reads as having left the platform.
 *
 * The Owner's sequencing decision of 2026-08-21 was Turkish first, the
 * multi-language decision after. This is the first of three: authentication,
 * then the Business Dashboard, then Admin.
 *
 * These cases exist because "did I catch every string" is exactly the question
 * a person cannot answer by looking, and the failure is silent — an English
 * word left in a Turkish screen looks like a screen, not like a bug.
 */
describe("Increment I27 Turkish consolidation", () => {
  it("leaves no English marker on any consolidated surface", () => {
    const marked = surfaces(CONSOLIDATED).filter((file) =>
      readFileSync(file, "utf8").includes('lang="en"')
    );

    /*
     * WCAG 3.1.2 requires a part in another language to say so. These surfaces
     * said so truthfully while they were English; now that they are Turkish the
     * marker would be the lie, and a screen reader given `en` would pronounce
     * Turkish words with English rules.
     */
    expect(marked).toEqual([]);
  });

  it("leaves no English sentence in them either", () => {
    /*
     * Removing the marker without translating the copy is the worse outcome of
     * the two, so the marker is not taken as evidence.
     *
     * **The first version of this case listed English words to look for and
     * passed while two English sentences were still on screen** — "Check your
     * email…" and "If that address has an account…" — because neither started
     * with a word on the list. A test that enumerates what to catch catches
     * what somebody remembered.
     *
     * This looks for the shape instead: rendered text of two or more words that
     * contains **no Turkish-specific letter**. Turkish prose reaches
     * `ç ğ ı İ ö ş ü` within a sentence or two, and a `lang` attribute, an
     * `href` and a `className` are excluded by only reading what sits between
     * tags.
     */
    /*
     * `(?<!=)` is load-bearing: without it the arrow in `=>` reads as a closing
     * tag and the case reports JavaScript as copy. **This detector has been
     * wrong twice** — first too narrow to catch two English sentences, then
     * wide enough to catch code — so what it excludes is as deliberate as what
     * it matches.
     */
    const rendered = /(?<!=)>\s*([A-Za-zÇĞİÖŞÜçğıöşü][^<>{}]{3,})/gu;
    const turkish = /[çğıİöşüÇĞÖŞÜ]/u;

    const offenders: string[] = [];
    for (const file of surfaces(CONSOLIDATED))
      for (const [, text] of readFileSync(file, "utf8").matchAll(rendered)) {
        const words = (text ?? "").trim();
        /*
         * **No two-word minimum**, and that is the fourth correction this
         * detector has needed. With one, `<h2>Offerings</h2>` slipped through —
         * a mutation put it back and this case passed. Single English words are
         * most of what a heading is.
         *
         * A literal here is copy by construction: anything from the data is an
         * `{expression}` and never reaches this match. So in an application
         * that speaks one language, rendered ASCII-only prose is always
         * suspicious, and a brand name would be the exception to add when one
         * exists rather than a hole to leave open now.
         */
        if (/^[A-Za-z][A-Za-z ,.'’-]*$/u.test(words) && !turkish.test(words))
          offenders.push(`${file}: ${words.slice(0, 40)}`);
      }

    expect(offenders).toEqual([]);
  });

  it("says every word from the copy module rather than inline", () => {
    /*
     * The extraction is the point, not a tidiness preference. §9.2 of the
     * design foundation says real multi-language support needs "every
     * user-visible string extracted, across 22 routes" — so doing the
     * extraction *as* the translation means i18n later changes what this module
     * returns instead of touching every route a second time.
     *
     * A surface that hard-codes a Turkish sentence has undone that without
     * looking like it has.
     */
    const inlineSentence = /(?<!=)>\s*[A-ZĞÜŞİÖÇ][a-zğüşıöç]+\s+[a-zğüşıöç]+/u;
    const offenders = surfaces(CONSOLIDATED).filter((file) => {
      const source = readFileSync(file, "utf8");
      /*
       * Two files compose a sentence around a link, which cannot be a single
       * constant without the constant also owning the link. Both halves still
       * live in a copy module; only the join is in the page.
       */
      const composes =
        file.endsWith("confirm/page.tsx") || file.endsWith("account/page.tsx");
      return inlineSentence.test(source) && !composes;
    });
    expect(offenders).toEqual([]);
  });

  it("keeps one word per concept across the whole application", () => {
    /*
     * The reason `vocabulary.ts` exists. Translating three areas independently
     * is three chances to call an Offering something different, and a person who
     * reads *ilan* on one screen and *teklif* on the next has been given two
     * products.
     *
     * Anchored to what the already-Turkish surfaces have said since I4 rather
     * than to a fresh choice.
     */
    expect(TERMS.offering).toBe("İlan");
    expect(TERMS.category).toBe("Kategori");
    expect(TERMS.business).toBe("İşletme");

    // The copy module composes from the vocabulary rather than repeating it,
    // so a term cannot be changed in one place and stay in another.
    expect(ACCOUNT.businessesHeading).toContain(TERMS.business);
    expect(ACCOUNT.noBusiness).toContain(TERMS.business);
    expect(ACCOUNT.inAdminContext).toContain(CONTEXTS.admin);
    expect(FIELDS).toBe(CREDENTIALS);
  });

  it("keeps the Business area speaking the same vocabulary", () => {
    /*
     * The second area translated, and the first chance for the vocabulary to
     * have been ignored. Each of these composes from `TERMS` rather than
     * repeating a word, so a term changed there changes here too.
     */
    expect(DASHBOARD.title).toContain(TERMS.business);
    expect(DASHBOARD.offeringsHeading).toContain(TERMS.offering);
    expect(CORRECTION.heading).toBe(TERMS.correctionNotice);

    // Retirement moves an Offering to Archived, so the verb is the lifecycle's
    // rather than "remove from publication" — which is Hiding, a different act
    // performed by a different party.
    /*
     * `Arşive kaldır`, not `Arşivle` — and this line is the reason.
     *
     * `Arşivle` is a prefix of `Arşivlenmiş`, the heading an Archived Offering
     * sits under, so "this screen offers no Retire action" would have been
     * satisfied by the heading. Caught by a test that passed on English and
     * failed the moment the words became Turkish.
     */
    expect(ENTRY_LABELS.RETIRE).toBe("Arşive kaldır");
    expect("Arşivlenmiş").not.toContain(ENTRY_LABELS.RETIRE);
    expect(ENTRY_LABELS.MANAGE_AFFILIATE_DESTINATION).toBe(
      TERMS.affiliateDestination
    );
  });

  it("keeps the Admin area speaking the same vocabulary", () => {
    /*
     * The last area, and the one that names the most Frozen concepts: Offering,
     * Business, Category, Attribute, Domain, moderation case and Affiliate
     * Destination all appear on the same screens. Each composes rather than
     * repeats, so the vocabulary cannot drift here without the Business
     * Dashboard drifting with it.
     */
    expect(PANEL.title).toBe("Platform yönetimi");
    expect(CASES.title).toContain(TERMS.moderationCase);
    expect(FUNCTION_LABELS.MANAGE_CATEGORIES).toContain(TERMS.category);
    expect(FUNCTION_LABELS.MODERATE_OFFERINGS).toContain(TERMS.offering);
    expect(ANALYTICS.byDomain).toContain(TERMS.domain);

    /*
     * `Alan` is Admin's word and nowhere else's, because Home receives the
     * Domain grouping and flattens it. This is the first and only place the
     * concept is named on screen, which is exactly why it belongs in the shared
     * vocabulary rather than in this area's copy.
     */
    expect(DOMAIN_LABELS.MOBILITY).toBe(DOMAINS.MOBILITY);
  });

  it("says the tally keys rather than showing the contract's identifiers", () => {
    /*
     * **The Analytics tables rendered raw enum keys and three increments walked
     * past it.** An Admin read `UNRESTRICTED`, `PUBLISHED`, `NOT_VALIDATED` and
     * `USER_ACCOUNT` on the one screen that describes the platform.
     *
     * The English-detector could not have caught it and still cannot: these
     * strings are never literals in the source, they arrive as data. A test
     * that reads the source finds copy; only a test that knows what the
     * contract can send finds this.
     */
    for (const key of [
      "ENABLED",
      "SUSPENDED",
      "PUBLISHED",
      "NOT_VALIDATED",
      "USER_ACCOUNT",
      "OPEN"
    ])
      expect(tallyLabel(key)).not.toBe(key);

    // The fallback is the key itself, deliberately: an untranslated label is
    // visibly wrong and gets fixed, where a blank row would not be noticed.
    expect(tallyLabel("SOMETHING_ADDED_UPSTREAM")).toBe(
      "SOMETHING_ADDED_UPSTREAM"
    );
  });

  it("gives no label another label as a substring", () => {
    /*
     * **I28 left this open and it is the reason it was left open.** The
     * translation there produced `Herkese açık değil` containing `Herkese
     * açık`, so `expect(markup).not.toContain(ELIGIBLE)` would have passed on a
     * screen saying the opposite. It was fixed where found; nothing prevented
     * the next one.
     *
     * A pairwise check needs the full set, which only exists now that the third
     * area has landed. Every `toContain` and `not.toContain` in this suite is
     * only as trustworthy as this case.
     */
    const labels = [
      ...Object.values(TERMS),
      ...Object.values(LIFECYCLE),
      ...Object.values(MODERATION),
      ...Object.values(ENTRY_LABELS),
      ...Object.values(ACTION_LABELS),
      ...Object.values(DOMAIN_LABELS),
      ...Object.values(PERIOD_LABELS)
    ];

    /*
     * **A bare term is allowed to be contained, and nothing else is.**
     *
     * The first version of this case flagged `Bu İlanı gizle` for containing
     * `İlan`, which is not a defect but the point: the vocabulary exists so
     * that labels compose from it rather than repeat it. Every composed label
     * contains its term by construction, so a rule without this exception
     * reports the design as a bug and gets deleted by the next person.
     *
     * Excluding the terms keeps both defects I28 found. `Herkese açık değil`
     * containing `Herkese açık` is two eligibility labels, neither a term.
     * `Arşivlenmiş` containing `Arşivle` is a lifecycle heading and an action —
     * different sets, which is why a within-set rule would have missed it, and
     * neither is a term either.
     */
    const composable = new Set<string>(Object.values(TERMS));

    const collisions: string[] = [];
    for (const outer of labels)
      for (const inner of labels)
        if (outer !== inner && !composable.has(inner) && outer.includes(inner))
          collisions.push(`"${outer}" contains "${inner}"`);

    expect(collisions).toEqual([]);
  });

  it("names a destination in every link rather than saying 'click here'", () => {
    // A link whose text is its destination is the one a screen reader can read
    // out of context, which is how people using one navigate a page.
    for (const text of Object.values(LINKS)) {
      expect(text).not.toMatch(/buray[ıa]|tıklay/iu);
      expect(text.length).toBeGreaterThan(3);
    }
  });

  it("tells a person what did not change when something is refused", () => {
    /*
     * UX-0008 §14: a failed context entry does not change the active context.
     * Saying only "that failed" leaves the person to guess whether their
     * account moved, and the guess a worried person makes is the pessimistic
     * one.
     */
    expect(REFUSALS.contextRefused).toContain("Hiçbir şey değişmedi");
  });

  it("names neither half of a failed sign-in", () => {
    /*
     * The security property the translation had to carry across intact: saying
     * which of the address or the password was wrong tells an attacker whether
     * an address is registered.
     */
    expect(REFUSAL_COPY.CREDENTIALS).not.toMatch(
      /parola\s+yanlış|hatalı parola/iu
    );
    expect(REFUSAL_COPY.CREDENTIALS).toContain("eşleşmedi");
  });

  it("says the same thing for a spent, expired or forged link", () => {
    // Three different causes, one message, because all three mean the same
    // thing to the person holding the link — and distinguishing them would
    // confirm that a token once existed.
    expect(REFUSAL_COPY.TOKEN).toContain("artık geçerli değil");
    expect(TITLES.reset).toBe("Yeni parola belirleyin");
    expect(ACTIONS.pending).toBe("Gönderiliyor…");
  });
});
