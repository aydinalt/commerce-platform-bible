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
import { CONTEXTS, CREDENTIALS, TERMS } from "../apps/web/src/vocabulary.js";

const AUTH = ["login", "register", "recover", "account"];
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
  it("leaves no English marker on the six authentication surfaces", () => {
    const marked = surfaces(AUTH).filter((file) =>
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
    const rendered = />\s*([A-Za-zÇĞİÖŞÜçğıöşü][^<>{}]{6,})/gu;
    const turkish = /[çğıİöşüÇĞÖŞÜ]/u;

    const offenders: string[] = [];
    for (const file of surfaces(AUTH))
      for (const [, text] of readFileSync(file, "utf8").matchAll(rendered)) {
        const words = (text ?? "").trim();
        if (words.split(/\s+/u).length >= 2 && !turkish.test(words))
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
    const inlineSentence = />\s*[A-ZĞÜŞİÖÇ][a-zğüşıöç]+\s+[a-zğüşıöç]+/u;
    const offenders = surfaces(AUTH).filter((file) => {
      const source = readFileSync(file, "utf8");
      // The confirm page composes one sentence around a link, which cannot be
      // a single constant without also owning the link.
      return inlineSentence.test(source) && !file.endsWith("confirm/page.tsx");
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
