import { readFileSync } from "node:fs";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EditorialReviewPresentation } from "../apps/web/src/editorial/review-presentation.js";
import { SUBMIT } from "../apps/web/src/form-copy.js";
import { EDITORIAL } from "../apps/web/src/platform/copy.js";
import {
  editorialCreateInputSchema,
  editorialDraftInputSchema
} from "@commerce/contracts";

import {
  actsAvailable,
  draftFromForm,
  editorialRefusal,
  linesToItems,
  missingParts,
  sinceLastChecked
} from "../apps/web/src/platform/editorial.js";

/**
 * Increment I94 — the editorial authoring screen (`EDT F02`).
 *
 * The behaviour was built in `I93` and is tested there: the states, the two
 * dates, the refusals and the five audit entries all live below this layer and
 * are enforced by the domain, the contract and four CHECK constraints. **This
 * file is about the screen**, and specifically about the handful of ways a
 * correct API can still be given a surface that lies about it.
 *
 * Each case names the criterion of `US-EDT-F02-001` **Frozen v0.1** it answers,
 * as `UX-0006` **Frozen v1.2** §19B's scenarios do, so that a criterion which
 * loses its test is visible rather than merely absent.
 *
 * **Several of these assert an absence**, which is the hardest kind of test to
 * keep honest: it passes on the day it is written and is the first thing to
 * rot. They are written against the source text rather than against a rendered
 * tree for exactly that reason — a field added to the form fails here, where a
 * test that rendered the form and looked for what it expected would not.
 */
describe("Increment I94 the editorial authoring screen", () => {
  const forms = readFileSync(
    "apps/web/src/app/admin/editorial-reviews/editorial-forms.tsx",
    "utf8"
  );
  const actions = readFileSync(
    "apps/web/src/app/admin/editorial-reviews/actions.ts",
    "utf8"
  );
  const list = readFileSync(
    "apps/web/src/app/admin/editorial-reviews/page.tsx",
    "utf8"
  );
  const detail = readFileSync(
    "apps/web/src/app/admin/editorial-reviews/[productKey]/page.tsx",
    "utf8"
  );
  const parser = readFileSync("apps/web/src/platform/editorial.ts", "utf8");
  const surface = forms + actions + list + detail + parser;

  /**
   * The source with its comments removed.
   *
   * **Every assertion about an absence uses this.** The first draft of this
   * file failed on its own explanation: a comment in the list page saying
   * "nothing here marks a review expired" contains the word `expired`, so a
   * test looking for that word in the surface found the sentence promising it
   * was not there. A prose mention is not a behaviour, and a check that cannot
   * tell them apart fails for the wrong reason today and passes for the wrong
   * reason tomorrow.
   */
  const code = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/.*$/gmu, "");

  describe("the line against commerce — AC-16", () => {
    /**
     * The form's fields are the six parts and nothing else.
     *
     * A general-purpose notes box is the field `PRD-0009` §13.6 forbids wearing
     * a different name, which is why this looks for the shapes a commercial
     * relationship could take **and** for the innocent-sounding ones that would
     * carry it.
     */
    it("offers no field in which a commercial relationship could be recorded", () => {
      for (const field of [
        "sponsored",
        "sponsor",
        "partner",
        "commission",
        "payment",
        "promoted",
        "placement",
        "note",
        "memo",
        "comment",
        "tag",
        "label"
      ])
        expect(
          new RegExp(`name="${field}`, "iu").test(surface),
          `a field named ${field} exists on the authoring surface`
        ).toBe(false);
    });

    it("reads exactly the six parts off the form and no seventh", () => {
      /*
       * Two spellings reach a field: directly, and through the `text` helper
       * that trims an empty box to `null`. Both are collected, because a
       * seventh field added through either one is the thing this guards.
       */
      const read = actions + parser;
      const direct = [...read.matchAll(/form\.get\("([a-zA-Z]+)"\)/gu)].map(
        (match) => match[1]
      );
      const viaHelper = [...read.matchAll(/\btext\("([a-zA-Z]+)"\)/gu)].map(
        (match) => match[1]
      );
      expect(new Set([...direct, ...viaHelper])).toEqual(
        new Set(["byline", "cons", "productKey", "pros", "score", "verdict"])
      );
    });

    /** The sections, and no other indexed field, arrive as numbered pairs. */
    it("reads no indexed field but the section pairs", () => {
      const templated = [
        ...parser.matchAll(/form\.get\(`([a-zA-Z]+)\$\{/gu)
      ].map((match) => match[1]);
      expect(new Set(templated)).toEqual(
        new Set(["sectionBody", "sectionHeading"])
      );
    });
  });

  describe("no deletion exists — AC-7", () => {
    it("offers no control that removes a review", () => {
      expect(code(surface)).not.toMatch(/\bDELETE\b/u);
      expect(code(surface)).not.toMatch(/method: "DELETE"/u);
      expect(code(surface).toLowerCase()).not.toContain("sil</");
      expect(actions).not.toMatch(/adminDelete|deleteEditorial/u);
    });

    /** Withdrawal is the act that exists in its place, and it is not a delete. */
    it("offers withdrawal, and says what survives it", () => {
      expect(actions).toContain("withdrawEditorialReview");
      expect(EDITORIAL.withdrawHelp).toContain("Silinmez");
    });
  });

  describe("the re-check is a separate act — AC-9, AC-10", () => {
    /**
     * The save form has nowhere to state a re-check, under any spelling. This
     * is AC-10's "shall not default it to true" held one layer above the
     * contract that already refuses the field.
     */
    it("gives the save form no control that states a re-check", () => {
      for (const spelling of [
        "recheck",
        "checked",
        "lastCheckedAt",
        "publishedAt",
        "status"
      ])
        expect(
          new RegExp(`name="${spelling}"`, "u").test(forms),
          `the form carries a field named ${spelling}`
        ).toBe(false);
    });

    it("sends no date and no state when saving", () => {
      const save = actions.slice(
        actions.indexOf("export async function saveEditorialReview"),
        actions.indexOf("export async function publishEditorialReview")
      );
      expect(save).toContain("draftFromForm(form)");
      expect(save).not.toContain("lastCheckedAt");
      expect(save).not.toContain("publishedAt");
      expect(save).not.toContain("status");
    });

    /** The act carries nothing but the decision (§12C.9). */
    it("sends no body with the re-check", () => {
      const recheck = actions.slice(
        actions.indexOf("export async function recheckEditorialReview"),
        actions.indexOf("export async function withdrawEditorialReview")
      );
      expect(recheck).toContain("/recheck");
      expect(recheck).not.toContain("draftFromForm");
      expect(recheck).not.toMatch(/adminPost\([^)]*,\s*\{/u);
    });

    /**
     * Offered on a Published review and on no other. A Draft has never been
     * presented and a Withdrawn review is presented nowhere, so re-checking
     * either would claim currency for something nobody can read — and the
     * domain refuses both, so offering it would only produce a refusal.
     */
    it("offers the re-check only where it would mean something", () => {
      expect(actsAvailable("PUBLISHED").recheck).toBe(true);
      expect(actsAvailable("DRAFT").recheck).toBe(false);
      expect(actsAvailable("WITHDRAWN").recheck).toBe(false);
    });

    it("offers the moves §12C.1 draws and no others", () => {
      expect(actsAvailable("DRAFT")).toEqual({
        publish: true,
        recheck: false,
        withdraw: false
      });
      expect(actsAvailable("PUBLISHED")).toEqual({
        publish: false,
        recheck: true,
        withdraw: true
      });
      expect(actsAvailable("WITHDRAWN")).toEqual({
        publish: true,
        recheck: false,
        withdraw: false
      });
    });
  });

  describe("the age the list shows — AC-17, AC-18", () => {
    /**
     * **The one thing this column must not do.** "Published eight months ago"
     * and "checked eight months ago" are different claims, and a review that
     * has never been re-checked is not given the age of its publication to fill
     * the space.
     */
    it("returns nothing for a review never re-checked", () => {
      expect(sinceLastChecked(null)).toBeNull();
    });

    it("never reaches for the publication date", () => {
      expect(list).toContain("sinceLastChecked(review.lastCheckedAt)");
      expect(list).not.toContain("sinceLastChecked(review.publishedAt)");
      expect(list).toContain("EDITORIAL.neverChecked");
    });

    it("says so in words rather than leaving the column empty", () => {
      expect(EDITORIAL.neverChecked).not.toBe("");
      expect(EDITORIAL.neverChecked).toContain("Hiç");
    });

    it("is coarse, and grows with the distance it describes", () => {
      const now = new Date("2026-09-16T12:00:00.000Z");
      const ago = (days: number): string | null =>
        sinceLastChecked(
          new Date(now.getTime() - days * 86_400_000).toISOString(),
          now
        );
      expect(ago(0)).toBe("bugün");
      expect(ago(1)).toBe("1 gün");
      expect(ago(9)).toBe("9 gün");
      expect(ago(45)).toBe("1 ay");
      expect(ago(400)).toBe("1 yıl");
    });

    /**
     * AC-18. The column informs a decision a person takes; it does not take it.
     * Nothing sorts by it, filters on it, or refuses an act because of it.
     */
    it("neither blocks nor reorders anything on account of age", () => {
      expect(code(list)).not.toMatch(/\.sort\(/u);
      expect(code(list)).not.toMatch(/\.filter\(/u);
      expect(code(surface)).not.toMatch(/expired|stale|overdue/iu);
      expect(detail).not.toContain("sinceLastChecked(read.publishedAt)");
    });
  });

  describe("publication names everything that is missing — AC-12", () => {
    it("translates every part the domain can name", () => {
      expect(
        missingParts(["verdict", "score", "sections", "pros", "cons", "byline"])
      ).toEqual([
        EDITORIAL.verdict,
        EDITORIAL.score,
        EDITORIAL.sections,
        EDITORIAL.pros,
        EDITORIAL.cons,
        EDITORIAL.byline
      ]);
    });

    /**
     * A part the domain names that this map does not know falls through to its
     * own key rather than disappearing. An untranslated word is visibly wrong
     * and gets fixed; a silently dropped one leaves a writer publishing again
     * to learn what is still missing.
     */
    it("keeps a part it cannot translate rather than dropping it", () => {
      expect(missingParts(["video"])).toEqual(["video"]);
    });

    it("joins them into the refusal rather than reporting the first", () => {
      const outcome = actions.slice(
        actions.indexOf("function outcome"),
        actions.indexOf("function draftFrom")
      );
      expect(outcome).toContain("EDITORIAL_REVIEW_INCOMPLETE");
      expect(outcome).toContain("missingParts");
      expect(outcome).toContain(".join(");
    });
  });

  describe("what a refusal says", () => {
    it("names what survived, for every refusal the platform can send", () => {
      for (const code of [
        "EDITORIAL_REVIEW_EXISTS",
        "EDITORIAL_REVIEW_TRANSITION",
        "UNKNOWN_PRODUCT_KEY",
        "VALIDATION_FAILED"
      ])
        expect(editorialRefusal(code).length).toBeGreaterThan(20);
    });

    it("answers a code it has never seen without claiming a change", () => {
      expect(editorialRefusal("SOMETHING_NEW")).toContain("olduğu gibi");
    });

    /** AC-15. The refusal leads to the review that already exists (§12C.4). */
    it("tells a writer to edit the review a key already carries", () => {
      expect(editorialRefusal("EDITORIAL_REVIEW_EXISTS")).toContain(
        "düzenleyin"
      );
    });
  });

  describe("the preview — §12C.7, AC-5", () => {
    /**
     * **No reader-facing address for an unpublished review**, with or without a
     * token. A preview URL that could be sent to a reader is a reader-facing
     * surface with an apology attached, and AC-5 does not admit one.
     */
    it("builds no public address and no token for a draft", () => {
      expect(code(surface)).not.toMatch(/\/products\//u);
      expect(code(surface)).not.toMatch(/previewToken|shareToken|secret/iu);
    });

    it("renders the reader's presentation rather than a second design", () => {
      expect(detail).toContain("EditorialReviewPresentation");
      expect(detail).toContain("EDITORIAL.previewNote");
    });

    /**
     * §12C.7: a preview of a review with no cons shows no cons rather than a
     * placeholder, because the point of looking is to see what is missing
     * before publication refuses it.
     */
    it("shows a draft's absences as absences", () => {
      const markup = renderToStaticMarkup(
        createElement(EditorialReviewPresentation, {
          review: {
            byline: null,
            cons: [],
            lastCheckedAt: null,
            productKey: "XZ200",
            pros: [],
            publishedAt: null,
            score: null,
            sections: [],
            verdict: null
          }
        })
      );
      expect(markup).not.toContain(EDITORIAL.pros);
      expect(markup).not.toContain(EDITORIAL.cons);
      expect(markup).toContain(EDITORIAL.neverChecked);
    });

    it("presents both dates and lets neither stand for the other", () => {
      const markup = renderToStaticMarkup(
        createElement(EditorialReviewPresentation, {
          review: {
            byline: "Editör ekibi",
            cons: ["pahalı"],
            lastCheckedAt: null,
            productKey: "XZ200",
            pros: ["sessiz"],
            publishedAt: "2026-03-01T00:00:00.000Z",
            score: 8.4,
            sections: [{ body: "gövde", heading: "Başlık" }],
            verdict: "İyi bir cihaz"
          }
        })
      );
      expect(markup).toContain("2026");
      expect(markup).toContain(EDITORIAL.neverChecked);
      expect(markup).toContain("8,4");
    });

    /** AC-3. There is nowhere in the presented shape to put the acting account. */
    it("has nowhere to present the account that wrote it", () => {
      const presentation = readFileSync(
        "apps/web/src/editorial/review-presentation.tsx",
        "utf8"
      );
      expect(presentation).not.toMatch(/actorId|writtenBy|author[A-Z]/u);
      expect(list).not.toMatch(/actorId|writtenBy/u);
    });
  });

  describe("an unreadable list is not an empty one — §12C.11", () => {
    it("says the reading failed rather than presenting no reviews", () => {
      expect(list).toContain("EDITORIAL.listUnreadable");
      expect(EDITORIAL.listUnreadable).toContain("okunamadı");
      /*
       * The two cases reach the screen differently: an outage is an alert, an
       * empty catalogue is a plain statement of fact. Collapsing them would
       * make an outage claim there are no reviews.
       */
      expect(list).toMatch(/role="alert">\{EDITORIAL\.listUnreadable\}/u);
      expect(list).toMatch(/<p>\{EDITORIAL\.none\}<\/p>/u);
    });
  });

  describe("the five acts, one route each — AC-19", () => {
    const ROUTES: readonly [string, string][] = [
      ["createEditorialReview", '"/admin/editorial-reviews"'],
      ["saveEditorialReview", "/admin/editorial-reviews/${reviewId}`"],
      ["publishEditorialReview", "/publication`"],
      ["recheckEditorialReview", "/recheck`"],
      ["withdrawEditorialReview", "/withdrawal`"]
    ];

    it("reaches a different route for each act", () => {
      for (const [act, route] of ROUTES) {
        const at = actions.indexOf(`export async function ${act}`);
        expect(at, `${act} is missing`).toBeGreaterThan(-1);
        expect(
          actions.slice(at, at + 900),
          `${act} does not reach ${route}`
        ).toContain(route);
      }
    });

    /**
     * Creating and saving are one control to the writer and two acts in the
     * trail (§12C.2). The save route is the one that records a revision, and
     * nothing in this file can make an edit record a creation.
     */
    it("gives ordinary draft editing no way to reach the creation route", () => {
      const save = actions.slice(
        actions.indexOf("export async function saveEditorialReview"),
        actions.indexOf("export async function publishEditorialReview")
      );
      expect(save).toContain("adminPut");
      expect(save).not.toContain("adminPost");
    });
  });

  describe("the words the writer reads", () => {
    it("pairs each act's idle label with its own working label", () => {
      for (const entry of [SUBMIT.publish, SUBMIT.recheck, SUBMIT.withdraw]) {
        expect(entry.idle).not.toBe("");
        expect(entry.working).not.toBe("");
        expect(entry.working).not.toBe(entry.idle);
      }
    });

    /** Every state the review can be in has a word (§12C.1). */
    it("names all three states", () => {
      expect(Object.keys(EDITORIAL.statuses).sort()).toEqual([
        "DRAFT",
        "PUBLISHED",
        "WITHDRAWN"
      ]);
    });

    it("says beside the control that a save does not move the re-check date", () => {
      expect(EDITORIAL.recheckHelp).toContain("kaydetmek bu tarihi taşımaz");
    });

    it("says beside the con field why a review needs one", () => {
      expect(EDITORIAL.consHelp).toContain("reklam");
    });
  });

  /**
   * **The seam with the most to lose and the least visibility.** Everything
   * else here is either a pure helper or an absence in the source; this is the
   * one place where what the screen builds has to be something the platform
   * will accept, and the two are written in different files by different rules.
   *
   * A mismatch would not fail a type check — the body leaves as `unknown` over
   * HTTP — and would not fail any test that mocked the API. It would fail in
   * front of a writer, as a validation refusal with no field named.
   */
  describe("the body the form builds is one the contract accepts", () => {
    const formWith = (entries: Record<string, string>): FormData => {
      const form = new FormData();
      for (const [name, value] of Object.entries(entries))
        form.set(name, value);
      return form;
    };

    const complete = {
      byline: "Editör ekibi",
      cons: "pahalı\nağır",
      pros: "sessiz\nucuz",
      score: "8.4",
      sectionBody0: "gövde",
      sectionHeading0: "Başlık",
      sectionBody1: "",
      sectionHeading1: "",
      verdict: "İyi bir cihaz"
    };

    it("builds a draft the contract accepts", () => {
      const parsed = editorialDraftInputSchema.safeParse(
        draftFromForm(formWith(complete))
      );
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    });

    /** A creation is the draft plus the key, and nothing else (§12C.4). */
    it("builds a creation the contract accepts", () => {
      const parsed = editorialCreateInputSchema.safeParse({
        ...draftFromForm(formWith(complete)),
        productKey: "XZ200"
      });
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    });

    /**
     * An empty form is a Draft that has been started and nothing more, which
     * `editorialDraftInputSchema` accepts on purpose — a writer may save before
     * they have written. Publication is where the parts become required.
     */
    it("builds an empty draft the contract still accepts", () => {
      const parsed = editorialDraftInputSchema.safeParse(
        draftFromForm(
          formWith({
            byline: "",
            cons: "",
            pros: "",
            score: "",
            sectionBody0: "",
            sectionHeading0: "",
            verdict: ""
          })
        )
      );
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
      expect(draftFromForm(formWith({ score: "" })).score).toBeNull();
    });

    /**
     * The blank slot the form always renders must not become an empty section.
     * The contract holds a heading and a body to at least one character each,
     * so a slot sent as `{ heading: "", body: "" }` would turn every save into
     * a refusal.
     */
    it("drops the empty section slot rather than sending it", () => {
      expect(draftFromForm(formWith(complete)).sections).toEqual([
        { body: "gövde", heading: "Başlık" }
      ]);
    });

    /**
     * A half-filled slot is kept and refused by the contract, not silently
     * dropped. A writer who typed a heading and no body has started something;
     * discarding it without a word would lose their work and report success.
     */
    it("keeps a half-written section so the contract can refuse it", () => {
      const half = draftFromForm(
        formWith({ sectionBody0: "", sectionHeading0: "Başlık" })
      );
      expect(half.sections).toEqual([{ body: "", heading: "Başlık" }]);
      expect(editorialDraftInputSchema.safeParse(half).success).toBe(false);
    });

    /** AC-16, at the seam: a field nobody named cannot ride along. */
    it("carries no field the contract would refuse", () => {
      const built = draftFromForm(
        formWith({ ...complete, sponsored: "true", partnerId: "acme" })
      );
      expect(built).not.toHaveProperty("sponsored");
      expect(built).not.toHaveProperty("partnerId");
      expect(editorialDraftInputSchema.safeParse(built).success).toBe(true);
    });

    /**
     * AC-9, AC-11 at the same seam. The body has no field for either date and
     * no field for the state, so a save cannot move one however the form is
     * filled in.
     */
    it("carries neither date and no state, whatever the form contains", () => {
      const built = draftFromForm(
        formWith({
          ...complete,
          lastCheckedAt: "2026-09-16T00:00:00.000Z",
          publishedAt: "2026-03-01T00:00:00.000Z",
          status: "PUBLISHED"
        })
      );
      expect(Object.keys(built).sort()).toEqual([
        "byline",
        "cons",
        "pros",
        "score",
        "sections",
        "verdict"
      ]);
    });

    /**
     * A score that is not a number is sent as it stands so the contract refuses
     * it. Quietly parsing it to `null` would discard what the writer typed and
     * report success — the review would save with no score and nobody would be
     * told why.
     */
    it("does not quietly discard a score it cannot read", () => {
      const built = draftFromForm(formWith({ ...complete, score: "sekiz" }));
      expect(built.score).toBeNaN();
      expect(editorialDraftInputSchema.safeParse(built).success).toBe(false);
    });

    /** AC-13. The scale is the contract's, not the input element's. */
    it("lets the contract refuse a score outside the scale", () => {
      for (const score of ["11", "-1", "8.45"])
        expect(
          editorialDraftInputSchema.safeParse(
            draftFromForm(formWith({ ...complete, score }))
          ).success,
          `a score of ${score} was accepted`
        ).toBe(false);
    });
  });

  describe("a list written one item per line", () => {
    it("drops the blank lines a finished list ends with", () => {
      expect(linesToItems("sessiz\n\nucuz\n")).toEqual(["sessiz", "ucuz"]);
    });

    it("treats an absent field as an empty list rather than as a failure", () => {
      expect(linesToItems(null)).toEqual([]);
      expect(linesToItems("   ")).toEqual([]);
    });
  });
});
