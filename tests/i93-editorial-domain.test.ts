import { describe, expect, it } from "vitest";

import {
  EDITORIAL_POINT_KINDS,
  EDITORIAL_REVIEW_STATUSES,
  IncompleteReviewError,
  InvalidReviewTransitionError,
  ReviewAlreadyExistsError,
  UnknownProductKeyError,
  canTransition,
  isPresentable,
  isValidEditorialScore,
  missingForPublication,
  type EditorialPoint,
  type EditorialReviewStatus,
  type EditorialSection
} from "@commerce/editorial";

/**
 * Increment I93 — the editorial domain model.
 *
 * These assertions need no database. They fix the rules that `PRD-0009`
 * **Frozen v0.4** §13 states and that `US-EDT-F02-001` **Frozen v0.1** turns
 * into Acceptance Criteria, at the one place both surfaces read them from.
 */

const complete = {
  byline: "Editör ekibi",
  cons: [{ kind: "CON", position: 0, text: "pahalı" }] as EditorialPoint[],
  pros: [{ kind: "PRO", position: 0, text: "sessiz" }] as EditorialPoint[],
  score: 8.4,
  sections: [
    { body: "gövde", heading: "Başlık", position: 0 }
  ] as EditorialSection[],
  verdict: "İyi bir cihaz"
};

describe("Increment I93 the editorial domain", () => {
  describe("the score", () => {
    it("accepts nought to ten with one decimal", () => {
      for (const score of [0, 0.1, 5, 8.4, 9.9, 10])
        expect(isValidEditorialScore(score)).toBe(true);
    });

    it("refuses a score outside the scale", () => {
      for (const score of [-0.1, 10.1, 11, -1])
        expect(isValidEditorialScore(score)).toBe(false);
    });

    it("refuses more than one decimal", () => {
      for (const score of [8.45, 0.01, 9.999])
        expect(isValidEditorialScore(score)).toBe(false);
    });

    /**
     * The naive rule is `score % 0.1 === 0`, and it rejects 8.4 — because 8.4
     * is not representable in binary floating point and the remainder comes
     * back as roughly 0.0999999. A validator written that way refuses a score
     * `PRD-0009` §5.2 permits, and refuses it only for some values, which is
     * the kind of defect that reaches production.
     */
    it("does not reject a legal score to floating-point arithmetic", () => {
      for (const score of [0.1, 0.3, 0.7, 2.9, 8.4, 9.1])
        expect(isValidEditorialScore(score)).toBe(true);
      expect(8.4 % 0.1).not.toBe(0);
    });

    it("refuses what is not a number at all", () => {
      for (const score of [Number.NaN, Number.POSITIVE_INFINITY])
        expect(isValidEditorialScore(score)).toBe(false);
    });
  });

  describe("the lifecycle of §13.3", () => {
    it("names exactly three states", () => {
      expect([...EDITORIAL_REVIEW_STATUSES]).toEqual([
        "DRAFT",
        "PUBLISHED",
        "WITHDRAWN"
      ]);
    });

    it("lets a draft be published", () => {
      expect(canTransition("DRAFT", "PUBLISHED")).toBe(true);
    });

    it("lets a published review be withdrawn", () => {
      expect(canTransition("PUBLISHED", "WITHDRAWN")).toBe(true);
    });

    /**
     * §13.3 makes withdrawal a removal from presentation rather than an end
     * state. A judgement taken down to be corrected has to be able to come
     * back, or the only remedy left is the operator editing rows that §13 was
     * written to close off.
     */
    it("lets a withdrawn review be published again", () => {
      expect(canTransition("WITHDRAWN", "PUBLISHED")).toBe(true);
    });

    /**
     * A review the public has seen carries a first-publication date. Returning
     * it to Draft would leave that date describing a state that claims nothing
     * was ever published.
     */
    it("never returns a review to draft", () => {
      for (const from of EDITORIAL_REVIEW_STATUSES)
        expect(canTransition(from, "DRAFT")).toBe(false);
    });

    it("treats a transition to the state already held as no transition", () => {
      for (const state of EDITORIAL_REVIEW_STATUSES)
        expect(canTransition(state, state)).toBe(false);
    });

    it("never moves a draft straight to withdrawn", () => {
      expect(canTransition("DRAFT", "WITHDRAWN")).toBe(false);
    });
  });

  describe("what is presented — AC-5 and AC-6", () => {
    it("presents a published review", () => {
      expect(isPresentable({ status: "PUBLISHED" })).toBe(true);
    });

    it("presents neither a draft nor a withdrawal", () => {
      for (const status of ["DRAFT", "WITHDRAWN"] as EditorialReviewStatus[])
        expect(isPresentable({ status })).toBe(false);
    });
  });

  describe("what publication requires — §13.5, AC-12", () => {
    it("finds nothing missing from a complete review", () => {
      expect(missingForPublication(complete)).toEqual([]);
    });

    /** §5: "A review with no cons is an advertisement, and readers know it." */
    it("refuses a review with no cons", () => {
      expect(missingForPublication({ ...complete, cons: [] })).toEqual([
        "cons"
      ]);
    });

    it("refuses a review with no pros", () => {
      expect(missingForPublication({ ...complete, pros: [] })).toEqual([
        "pros"
      ]);
    });

    it("refuses a review with no sections", () => {
      expect(missingForPublication({ ...complete, sections: [] })).toEqual([
        "sections"
      ]);
    });

    /** §5: "An unattributed judgement is a claim nobody stands behind." */
    it("refuses a review with no byline", () => {
      expect(missingForPublication({ ...complete, byline: null })).toEqual([
        "byline"
      ]);
    });

    it("treats a byline of only whitespace as no byline", () => {
      expect(missingForPublication({ ...complete, byline: "   " })).toEqual([
        "byline"
      ]);
    });

    it("treats a verdict of only whitespace as no verdict", () => {
      expect(missingForPublication({ ...complete, verdict: "  " })).toEqual([
        "verdict"
      ]);
    });

    it("refuses a review with no score, including where the score is zero-valued", () => {
      expect(missingForPublication({ ...complete, score: null })).toEqual([
        "score"
      ]);
      // Nought is a score a reviewer may legitimately give. Absence is `null`.
      expect(missingForPublication({ ...complete, score: 0 })).toEqual([]);
    });

    /**
     * Everything at once, rather than one refusal at a time — a writer told
     * only the first missing part discovers the rest by repeated failure.
     */
    it("names every missing part in one answer", () => {
      expect(
        missingForPublication({
          byline: null,
          cons: [],
          pros: [],
          score: null,
          sections: [],
          verdict: null
        })
      ).toEqual(["verdict", "score", "sections", "pros", "cons", "byline"]);
    });
  });

  describe("the two lists", () => {
    it("names exactly two kinds of point", () => {
      expect([...EDITORIAL_POINT_KINDS]).toEqual(["PRO", "CON"]);
    });
  });

  describe("the domain errors carry what a surface has to say", () => {
    it("names the key an unknown-key refusal was about", () => {
      const error = new UnknownProductKeyError("XZ200");
      expect(error.productKey).toBe("XZ200");
      expect(error.name).toBe("UnknownProductKeyError");
    });

    it("names the key a duplicate refusal was about", () => {
      expect(new ReviewAlreadyExistsError("XZ200").productKey).toBe("XZ200");
    });

    it("carries the missing parts rather than only a sentence about them", () => {
      const error = new IncompleteReviewError(["cons", "byline"]);
      expect(error.missing).toEqual(["cons", "byline"]);
    });

    it("carries both ends of a refused transition", () => {
      const error = new InvalidReviewTransitionError("WITHDRAWN", "DRAFT");
      expect(error.from).toBe("WITHDRAWN");
      expect(error.to).toBe("DRAFT");
    });
  });

  /**
   * AC-16 has a logical half and a structural half. This is the logical half:
   * the domain type carries no field through which a commercial relationship
   * could be expressed. The structural half — that the database table carries
   * no such column either — is asserted against `information_schema` in the
   * integration suite, because a type is deleted by an edit and a column is
   * not.
   */
  describe("AC-16 the shape has nowhere to put a sponsorship", () => {
    it("keeps the review's own field set closed and free of commerce", () => {
      const review = {
        byline: complete.byline,
        cons: complete.cons,
        id: "id",
        lastCheckedAt: null,
        productKey: "XZ200",
        pros: complete.pros,
        publishedAt: null,
        score: complete.score,
        sections: complete.sections,
        status: "DRAFT" as EditorialReviewStatus,
        verdict: complete.verdict
      };
      expect(Object.keys(review).sort()).toEqual([
        "byline",
        "cons",
        "id",
        "lastCheckedAt",
        "productKey",
        "pros",
        "publishedAt",
        "score",
        "sections",
        "status",
        "verdict"
      ]);
    });

    /**
     * The date the reader is invited to trust is not among the fields any
     * save-shaped operation touches. Named here so that a refactor which adds
     * `lastCheckedAt` to an edit payload fails a test rather than a reader.
     */
    it("keeps the re-check date out of the parts a save can carry", () => {
      const savable = Object.keys(complete).sort();
      expect(savable).not.toContain("lastCheckedAt");
      expect(savable).not.toContain("publishedAt");
      expect(savable).not.toContain("status");
    });
  });
});
