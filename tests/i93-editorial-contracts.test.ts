import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  EDITORIAL_REVIEW_STATUSES,
  editorialCreateInputSchema,
  editorialDraftInputSchema,
  editorialReviewAdminSchema,
  editorialReviewSchema,
  editorialReviewViewSchema,
  editorialScoreSchema
} from "@commerce/contracts";
import {
  EDITORIAL_REVIEW_STATUSES as DOMAIN_STATUSES,
  isValidEditorialScore
} from "@commerce/editorial";

/**
 * Increment I93 — the editorial contracts.
 *
 * Two of these assertions exist because a rule is written in two places that
 * are forbidden to import one another, which is the arrangement that let the
 * Admin audit action list drift three ways before I93 reduced it to two.
 */

const publishedReview = {
  byline: "Editör ekibi",
  cons: ["pahalı"],
  lastCheckedAt: null,
  productKey: "XZ200",
  pros: ["sessiz"],
  publishedAt: "2026-03-01T00:00:00.000Z",
  score: 8.4,
  sections: [{ body: "gövde", heading: "Başlık" }],
  verdict: "İyi bir cihaz"
};

describe("Increment I93 the editorial contracts", () => {
  describe("the score rule, written twice and held together here", () => {
    /**
     * `packages/contracts` may not import `modules/editorial` — a shared
     * package owning product domain is an error-severity dependency-cruiser
     * rule — so the one-decimal rule exists in both. This walks the whole scale
     * rather than sampling it, because the failure this guards against is the
     * two copies disagreeing about a handful of values.
     */
    it("agrees with the domain across every tenth of the scale", () => {
      for (let tenths = -20; tenths <= 120; tenths += 1) {
        const score = tenths / 10;
        expect(editorialScoreSchema.safeParse(score).success).toBe(
          isValidEditorialScore(score)
        );
      }
    });

    it("agrees with the domain on values carrying more than one decimal", () => {
      for (const score of [0.01, 1.25, 8.45, 9.999, 10.0001, -0.5]) {
        expect(editorialScoreSchema.safeParse(score).success).toBe(
          isValidEditorialScore(score)
        );
      }
    });

    it("names the same three states as the domain", () => {
      expect([...EDITORIAL_REVIEW_STATUSES]).toEqual([...DOMAIN_STATUSES]);
    });
  });

  describe("the public shape — EDT F01", () => {
    it("accepts a complete published review", () => {
      expect(editorialReviewSchema.parse(publishedReview)).toEqual(
        publishedReview
      );
    });

    /** §5: "A review with no cons is an advertisement, and readers know it." */
    it("refuses a review presented with no cons", () => {
      expect(
        editorialReviewSchema.safeParse({ ...publishedReview, cons: [] })
          .success
      ).toBe(false);
    });

    it("refuses a review presented with no pros or no sections", () => {
      expect(
        editorialReviewSchema.safeParse({ ...publishedReview, pros: [] })
          .success
      ).toBe(false);
      expect(
        editorialReviewSchema.safeParse({ ...publishedReview, sections: [] })
          .success
      ).toBe(false);
    });

    /**
     * AC-4. A review nobody has re-checked says so; it does not borrow the
     * publication date to look current.
     */
    it("carries a re-check date that may be absent and a publication date that may not", () => {
      expect(
        editorialReviewSchema.safeParse({
          ...publishedReview,
          lastCheckedAt: null
        }).success
      ).toBe(true);
      expect(
        editorialReviewSchema.safeParse({
          ...publishedReview,
          publishedAt: null
        }).success
      ).toBe(false);
    });

    /** AC-3: the account that wrote it is never presented. */
    it("has nowhere to put the acting account", () => {
      const parsed = editorialReviewSchema.safeParse({
        ...publishedReview,
        actorId: "8f4c4b9a-0000-4000-8000-000000000000"
      });
      expect(parsed.success).toBe(false);
    });

    /**
     * AC-16, at the contract. The strictness is the mechanism: a field a caller
     * invents is refused rather than dropped, so a sponsorship cannot ride
     * along unnoticed.
     */
    it("refuses every shape a commercial relationship could take", () => {
      for (const field of [
        "sponsored",
        "sponsorId",
        "partner",
        "commissionRate",
        "promoted",
        "placement",
        "reasonCode"
      ]) {
        expect(
          editorialReviewSchema.safeParse({ ...publishedReview, [field]: true })
            .success
        ).toBe(false);
      }
    });

    it("tells absence apart from an outage by wrapping the answer", () => {
      expect(editorialReviewViewSchema.parse({ review: null })).toEqual({
        review: null
      });
      expect(
        editorialReviewViewSchema.parse({ review: publishedReview }).review
      ).not.toBeNull();
    });
  });

  describe("the writing shape — EDT F02", () => {
    const draft = {
      byline: "Editör ekibi",
      cons: ["pahalı"],
      pros: ["sessiz"],
      score: 8.4,
      sections: [{ body: "gövde", heading: "Başlık" }],
      verdict: "İyi bir cihaz"
    };

    it("accepts a draft that is not yet complete", () => {
      expect(
        editorialDraftInputSchema.safeParse({
          byline: null,
          cons: [],
          pros: [],
          score: null,
          sections: [],
          verdict: null
        }).success
      ).toBe(true);
    });

    /**
     * AC-9's structural guarantee. A save cannot carry the re-check date under
     * any spelling, so no amount of client code can make saving look like
     * re-checking.
     */
    it("gives a save nowhere to put either date or the state", () => {
      for (const field of [
        "lastCheckedAt",
        "publishedAt",
        "status",
        "checked",
        "recheck"
      ]) {
        expect(
          editorialDraftInputSchema.safeParse({ ...draft, [field]: true })
            .success
        ).toBe(false);
      }
    });

    it("gives a save nowhere to put a commercial relationship", () => {
      for (const field of ["sponsored", "partnerId", "commissionRate"]) {
        expect(
          editorialDraftInputSchema.safeParse({ ...draft, [field]: "x" })
            .success
        ).toBe(false);
      }
    });

    it("requires a Product Key when a review is created", () => {
      expect(editorialCreateInputSchema.safeParse(draft).success).toBe(false);
      expect(
        editorialCreateInputSchema.safeParse({ ...draft, productKey: "XZ200" })
          .success
      ).toBe(true);
    });

    it("refuses a score outside the scale on the way in", () => {
      expect(
        editorialDraftInputSchema.safeParse({ ...draft, score: 11 }).success
      ).toBe(false);
      expect(
        editorialDraftInputSchema.safeParse({ ...draft, score: 8.45 }).success
      ).toBe(false);
    });
  });

  /**
   * The five acts, and which route writes which entry.
   *
   * `PRD-0009` §13.8 names five — "Creating, publishing, revising, re-checking
   * and withdrawing" — and `PRD-0006` **v2.8** restores "Creating" to the §22.2
   * row that v2.7 left out. This asserts the mapping the controller actually
   * implements, so that the document and the code cannot drift apart quietly.
   *
   * It reads the source rather than driving HTTP, in the manner of
   * `tests/i87-destination-audit.test.ts`'s label check. What it guards is
   * one-to-one-ness: an act recorded twice, or a route that records the wrong
   * act, fails here rather than in a trail somebody reads a year later.
   */
  describe("the five editorial acts, one route each", () => {
    const controller = (): string =>
      readFileSync("apps/api/src/platform/editorial.controller.ts", "utf8");

    const EXPECTED: readonly [string, string][] = [
      ["CREATE_EDITORIAL_REVIEW", "@Post()"],
      ["REVISE_EDITORIAL_REVIEW", '@Put(":id")'],
      ["PUBLISH_EDITORIAL_REVIEW", '@Post(":id/publication")'],
      ["RECHECK_EDITORIAL_REVIEW", '@Post(":id/recheck")'],
      ["WITHDRAW_EDITORIAL_REVIEW", '@Post(":id/withdrawal")']
    ];

    it("records each act exactly once", () => {
      const source = controller();
      for (const [action] of EXPECTED) {
        const written = source.split(`action: "${action}"`).length - 1;
        expect(written, `${action} is recorded ${written} times`).toBe(1);
      }
    });

    it("pairs each act with the route that performs it", () => {
      const source = controller();
      for (const [action, route] of EXPECTED) {
        const at = source.indexOf(route);
        const records = source.indexOf(`action: "${action}"`, at);
        expect(at, `${route} is missing`).toBeGreaterThan(-1);
        expect(records, `${route} does not record ${action}`).toBeGreaterThan(
          at
        );
        // No other route decorator may sit between the route and its entry, or
        // the entry belongs to a different act than the one it is named for.
        const between = source.slice(at + route.length, records);
        expect(between).not.toMatch(/@(Post|Put|Get|Patch|Delete)\(/u);
      }
    });

    /**
     * A draft edited twice is revised twice and created once. The only route
     * that can write a creation is the one that creates, and `AC-15` refuses a
     * second review for a key in every state — so a second creation entry for
     * one review is unreachable rather than merely unlikely.
     */
    it("gives ordinary draft editing no way to record a creation", () => {
      const source = controller();
      const save = source.slice(
        source.indexOf('@Put(":id")'),
        source.indexOf('@Post(":id/publication")')
      );
      expect(save).toContain('action: "REVISE_EDITORIAL_REVIEW"');
      expect(save).not.toContain("CREATE_EDITORIAL_REVIEW");
      expect(save).not.toContain("editorial.create");
    });

    /**
     * An entry follows the act it describes. Every route awaits the work and
     * records afterwards, so a refused create — an unknown Product Key, a key
     * that already carries a review — writes nothing. A trail of attempts is a
     * different document from a trail of acts.
     */
    it("records only after the act succeeded", () => {
      const source = controller();
      for (const [action] of EXPECTED) {
        const records = source.indexOf(`action: "${action}"`);
        const acts = source.lastIndexOf("this.act(", records);
        expect(
          acts,
          `${action} is recorded without awaiting the act`
        ).toBeGreaterThan(-1);
        expect(records).toBeGreaterThan(acts);
      }
    });

    /** Reading a review records nothing (`PRD-0009` §13.8). */
    it("records nothing on either reading route", () => {
      const source = controller();
      const reads = source.slice(
        source.indexOf("@Get()"),
        source.indexOf("@Post()")
      );
      expect(reads).not.toContain("audit.record");
      expect(
        readFileSync(
          "apps/api/src/offering/editorial-review.controller.ts",
          "utf8"
        )
      ).not.toContain("audit");
    });
  });

  describe("the writer's view", () => {
    it("carries the state and the parts a draft may still lack", () => {
      const parsed = editorialReviewAdminSchema.parse({
        byline: null,
        cons: [],
        createdAt: "2026-09-09T00:00:00.000Z",
        id: "8f4c4b9a-0000-4000-8000-000000000000",
        lastCheckedAt: null,
        productKey: "XZ200",
        pros: [],
        publishedAt: null,
        score: null,
        sections: [],
        status: "DRAFT",
        verdict: null
      });
      expect(parsed.status).toBe("DRAFT");
    });

    it("has nowhere to put the account that acted", () => {
      expect(
        editorialReviewAdminSchema.safeParse({
          byline: null,
          cons: [],
          createdAt: "2026-09-09T00:00:00.000Z",
          id: "8f4c4b9a-0000-4000-8000-000000000000",
          lastCheckedAt: null,
          productKey: "XZ200",
          pros: [],
          publishedAt: null,
          score: null,
          sections: [],
          status: "DRAFT",
          verdict: null,
          writtenBy: "8f4c4b9a-0000-4000-8000-000000000001"
        }).success
      ).toBe(false);
    });
  });
});
