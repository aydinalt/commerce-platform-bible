import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { CASES } from "../apps/web/src/platform/copy.js";

/**
 * `I82` — the PII rule, opening a case, and the reference template.
 *
 * Three Owner decisions of 2026-09-04, and the first two are rules that a
 * plausible-looking implementation would satisfy in appearance and break in
 * fact. That is what these cases are for.
 *
 * **The PII rule.** *"Operasyonel ekranlarda e-posta adreslerini kesinlikle
 * açıkça göstermiyoruz… sadece 'E-postayı Göster' butonu arkasında… ileride
 * denetim izine bağlanacak bir aksiyon olmalı."*
 *
 * The failure mode is a button that hides an address the page already holds. It
 * looks identical to an Admin, and it is the opposite of what was asked: the
 * address would travel with every case anybody opened, and pressing the button
 * would produce no record because nothing would happen. **The rule is only real
 * if the reveal is a request**, so that is what is asserted — the address is
 * absent from the case contract, and reaching it costs a round trip.
 *
 * **Opening a case.** *"hedefin hemen yanına bir eylem butonu ekle… Modal hedef
 * kimliğini otomatik olarak içine alsın."* The failure mode is a form that asks
 * an Admin to paste a UUID.
 */
describe("Increment I82 the PII rule and case opening", () => {
  const read = (path: string): string => readFileSync(path, "utf8");
  const strip = (source: string): string =>
    source
      .replaceAll(/\/\*[\s\S]*?\*\//gu, " ")
      .replaceAll(/^\s*\/\/.*$/gmu, " ");

  const contracts = read("packages/contracts/src/index.ts");
  const ADMIN = "apps/web/src/app/admin";

  describe("the PII rule", () => {
    it("keeps the address out of the case itself", () => {
      /*
       * **The load-bearing assertion.** `moderationCaseSchema` must carry no
       * email field: if it did, every case read would ship the address to the
       * browser and the reveal would be decoration over data already sent.
       */
      const schema =
        /export const moderationCaseSchema = z[\s\S]*?\.strict\(\);/u.exec(
          contracts
        )?.[0];
      expect(schema, "moderationCaseSchema not found").toBeDefined();
      expect(strip(schema ?? "")).not.toMatch(/email/iu);
    });

    it("makes revealing an address a request, not an unhiding", () => {
      const component = strip(
        read(`${ADMIN}/moderation-cases/reveal-email.tsx`)
      );
      /*
       * **The address must not be a prop**, and the check has to be that
       * precise. A first version forbade the word `email` near a brace, which
       * also matched `state.email` in the rendered output — the revealed value
       * itself, which is the entire point of the component. Forbidding that
       * would have demanded a reveal that reveals nothing.
       *
       * So it reads the destructured props instead: whatever this component is
       * handed, an address is not among it.
       */
      const props = /\}: \{([\s\S]*?)\}\)/u.exec(component)?.[1] ?? "";
      expect(props, "reveal-email props not found").not.toBe("");
      expect(props).not.toMatch(/email/iu);
      expect(component).toContain("useActionState");

      // And the action must actually go to the API.
      const actions = read(`${ADMIN}/moderation-cases/actions.ts`);
      expect(actions).toContain("revealCaseTargetEmail");
    });

    it("reveals against a case, so the record carries a reason", () => {
      /*
       * Scoped to a case rather than to a user id. "Somebody looked up an
       * address" is a far worse audit line than "this address was revealed
       * while working case X", and an endpoint keyed by user id could not
       * produce the second.
       */
      const controller = read("apps/api/src/platform/moderation.controller.ts");
      expect(controller).toContain('@Post(":caseId/target-email")');

      const repository = read(
        "apps/api/src/persistence/pg-moderation.repository.ts"
      );
      // Bound to a User Account case, so an Offering case is not a route to
      // somebody's address.
      expect(repository).toContain("c.target_type = 'USER_ACCOUNT'");
    });

    it("names a user target by account id in a queue, never by address", () => {
      const target = strip(read(`${ADMIN}/moderation-cases/case-target.tsx`));
      expect(target).toContain("entry.userId");
      expect(target).not.toMatch(/email/iu);
    });
  });

  describe("opening a case", () => {
    it("carries the target's identity rather than asking for it", () => {
      const dialog = strip(read(`${ADMIN}/open-case.tsx`));
      /*
       * No text input anywhere in the dialog. The target comes from what the
       * Admin was already looking at, bound into the action — a field would be
       * a UUID somebody can mistype, and a case opened against the wrong
       * listing is worse than no case.
       */
      expect(dialog).not.toMatch(/<input/u);
      expect(dialog).toContain("<dialog");
    });

    it("offers the control where a target is shown", () => {
      // The two surfaces that name a target an Admin may need to act on.
      for (const path of [
        `${ADMIN}/listing-reports/page.tsx`,
        `${ADMIN}/destinations/page.tsx`
      ])
        expect(read(path), `${path} should offer OpenCase`).toContain(
          "<OpenCase"
        );
    });

    it("says that opening a case changes nothing about the target", () => {
      /*
       * `US-PLT-F02-001` AC-3: a case is opened and then worked; opening one
       * applies no action. An Admin pressing an unfamiliar button deserves to
       * know that before they press it, not after.
       */
      expect(CASES.openNote).toMatch(/değiştirmez/u);
    });
  });

  it('exports nothing but async functions from a "use server" module', () => {
    /*
     * **The defect that has now happened twice, made impossible to ship
     * quietly.**
     *
     * A `"use server"` file may export async functions and nothing else. Every
     * other export becomes a server-action reference the client cannot
     * dereference, and the build fails while *collecting page data* — naming
     * the page, not the export, so the message points away from the cause.
     *
     * `I69` shipped a string constant in one of these files and it reached the
     * Owner's machine; `I82` put `REVEAL_HIDDEN` in another and `next build`
     * caught it. Both times typecheck, lint and the entire suite passed,
     * because none of them runs `next build` — which is exactly why this
     * belongs in the suite rather than in somebody's memory.
     */
    const walk = (directory: string): string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory()) return walk(path);
        return /\.tsx?$/u.test(entry.name) ? [path] : [];
      });

    const offenders: string[] = [];
    for (const path of walk("apps/web/src")) {
      const source = readFileSync(path, "utf8");
      if (!/^\s*"use server";/mu.test(source)) continue;
      /*
       * `type` and `interface` are both excluded, and the difference matters:
       * they are erased at compile time, so they never become an export the
       * client has to dereference. The first version of this pattern excluded
       * only `type` and reported `offerings/[slug]/actions.ts` — which exports
       * two interfaces and is completely correct. A guard that flags what is
       * fine teaches people to ignore it.
       */
      for (const [, kind] of strip(source).matchAll(
        /^export\s+(?!(?:type|interface)\b)(?:(async\s+function)|(\w+))/gmu
      ))
        // `export async function` is the only permitted form.
        if (kind === undefined) offenders.push(path);
    }
    expect(offenders).toEqual([]);
  });

  describe("the reference template", () => {
    it("takes the template's card grammar and not its palette", () => {
      /*
       * **Comments stripped, for the third time this session.** The CSS block
       * that adopts this template *names* the template's orange in order to say
       * it is not being used — and read raw, that sentence fails the assertion
       * about not using it. `i48` and `i81` hit the same shape: a guard that
       * cannot tell code from prose about code pays authors to delete the
       * prose, which is the documentation the guard exists to force.
       */
      const css = strip(read("apps/web/src/app/globals.css"));
      // Measured from the reference: 5px radius, 20px padding, no shadow.
      expect(css).toMatch(/\.metric-card \{[^}]*border-radius: 5px/u);
      expect(css).toMatch(/\.metric-card \{[^}]*var\(--space-5\)/u);
      /*
       * **Not the template's orange.** Its accent is `#ff6f28`; ours is the
       * ScorBurn red the Owner supplied. A reference gives layout and rhythm;
       * adopting its brand colour would put a second brand on the page.
       */
      expect(css).not.toMatch(/ff6f28/iu);
      // And not its eight categorical badge colours: one accent, two states.
      const mark = /\.metric-card-mark \{[^}]*\}/u.exec(css)?.[0] ?? "";
      expect(mark).toContain("var(--accent");
    });

    it("links a card to a queue only where one is actionable", () => {
      /*
       * The template gives every card a "View All". Copying that would invent
       * destinations that do not exist — and AC-16 makes core-flow indicators
       * deliberately not actionable, so a link on one would be wrong rather
       * than merely missing.
       */
      const page = strip(read(`${ADMIN}/overview/page.tsx`));
      const links = page.match(/linkLabel=/gu) ?? [];
      expect(links).toHaveLength(2);
      expect(page).toContain("actionable.OPEN_MODERATION_CASES");
      expect(page).toContain("actionable.DESTINATION_WORKLOAD");
    });
  });
});
