import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { offeringPresentationSchema } from "@commerce/contracts";

import { AFFILIATE } from "../apps/web/src/decision/copy.js";

/**
 * Increment I96 — the affiliate action on the Offering Presentation.
 *
 * `UX-0003` **Frozen v1.2** §9.4 has required this since 2026-09-07 and the
 * screen did not offer it: the only way to a partner was through the Decision
 * flow, so a person who had already decided had to go through a conversation to
 * leave. This closes that conformance gap and nothing wider.
 *
 * **The risk here is not that the control fails to work — it is that it works
 * too well.** A control that leaves the platform can, built carelessly:
 *
 * - put the partner's address in the page, which `US-DEC-F05-001` AC-5 forbids
 *   and which a link — unlike a form — would do;
 * - record a handoff nobody performed, because a prefetch, a crawler or a
 *   middle-click followed a link;
 * - appear greyed on the listings it cannot serve, which §9.4.1 refuses in as
 *   many words;
 * - acquire a second path to the partner beside the one the Decision flow
 *   already owns, so that a Completion exists for one press and not the other.
 */
describe("Increment I96 the affiliate action on the Offering Presentation", () => {
  const presentation = readFileSync(
    "apps/web/src/app/offerings/[slug]/offering-presentation.tsx",
    "utf8"
  );
  const actions = readFileSync("apps/web/src/app/decision/actions.ts", "utf8");
  const repository = readFileSync(
    "apps/api/src/persistence/pg-presentation.repository.ts",
    "utf8"
  );

  /** Absence assertions read stripped source — the lesson `i94` and `i95` cost. */
  const code = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/.*$/gmu, "");

  describe("the address never reaches the page — AC-5", () => {
    /**
     * The payload carries a boolean and nothing that could be a destination.
     * This is the whole of how a public control coexists with AC-5: the screen
     * learns *whether*, the server decides *where*, and it decides it at the
     * instant of the press.
     */
    it("adds a boolean to the presentation and no address", () => {
      const shape = offeringPresentationSchema.shape;
      expect(Object.keys(shape)).toContain("handoffAvailable");
      for (const field of [
        "destination",
        "destinationUrl",
        "affiliateUrl",
        "reference",
        "outboundUrl"
      ])
        expect(Object.keys(shape), `${field} is exposed`).not.toContain(field);
    });

    it("refuses a presentation that tried to carry one", () => {
      expect(
        offeringPresentationSchema.safeParse({ destinationUrl: "https://x" })
          .success
      ).toBe(false);
    });

    it("puts no partner address in the rendered page", () => {
      expect(code(presentation)).not.toMatch(/https?:\/\//u);
      expect(code(presentation)).not.toMatch(/destination/iu);
    });
  });

  describe("a form, never a link", () => {
    /**
     * `US-DEC-F05-001` AC-5 makes a handoff something a person *chooses*, and
     * only a submitted form is that. A link can be followed by a prefetch, a
     * crawler or a middle-click, and each would record a handoff nobody
     * performed — a Completion invented by a robot.
     */
    it("submits a form rather than following an anchor", () => {
      const block = presentation.slice(
        presentation.indexOf("offering.handoffAvailable"),
        presentation.indexOf("<DecisionEntries")
      );
      expect(block).toContain("<form action={handoffFromCard}");
      expect(block).not.toMatch(/<a\s/u);
      expect(block).not.toContain("target=");
    });
  });

  describe("absent, not disabled — §9.4.1", () => {
    /**
     * An Admin may never enable that destination and a partner may never sign,
     * so a control a person can see and cannot use is a promise this screen
     * cannot keep. The listing is complete without it.
     */
    it("renders nothing at all where no eligible destination exists", () => {
      const block = presentation.slice(
        presentation.indexOf("offering.handoffAvailable"),
        presentation.indexOf("<DecisionEntries")
      );
      expect(block).toContain("? (");
      expect(block.trimEnd().endsWith(") : null}")).toBe(true);
      expect(code(block)).not.toMatch(/disabled|coming soon|yakında/iu);
    });

    /** Absence of the action is never explained as a fault of the listing. */
    it("offers no explanation in place of the missing control", () => {
      expect(code(presentation)).not.toMatch(
        /bu ilan için (şu anda )?yönlendirme/iu
      );
    });
  });

  describe("one path to the partner, not two", () => {
    /**
     * The page gained a place to press, not a private route. §9.4.2 settles
     * what pressing means: the action carries this one Offering into a
     * single-Offering Decision Context and the handoff executes there exactly
     * as it does today — so the Completion `US-DEC-F05-001` requires exists for
     * this press just as it does for one made from the Decision panel.
     */
    it("reuses the action the Listing Card already uses", () => {
      expect(presentation).toContain("handoffFromCard");
      expect(
        readFileSync("apps/web/src/app/discovery/listing-card.tsx", "utf8")
      ).toContain("handoffAction");
    });

    it("adds no second handoff action", () => {
      const exported = [
        ...actions.matchAll(/export async function ([A-Za-z]+)/gu)
      ].map((match) => match[1]);
      expect(exported.filter((name) => /andoff/u.test(name))).toEqual([
        "startAffiliateHandoff",
        "handoffFromCard"
      ]);
    });

    /**
     * The existing three-step path is untouched: enter the flow, select the
     * Offering, initiate the handoff. Each step is the platform re-deciding, so
     * an Offering retired or a destination disabled between the page and the
     * press is refused at the last of them.
     */
    it("keeps the Decision flow as the place a handoff is recorded", () => {
      const fromCard = actions.slice(
        actions.indexOf("export async function handoffFromCard")
      );
      expect(fromCard).toContain("enterDecision(");
      expect(fromCard).toContain("selectOffering(");
      expect(fromCard).toContain("initiateHandoff(");
    });

    /** A refusal is not an error page: the person is taken to the listing. */
    it("falls back to the listing when the handoff is refused", () => {
      const fromCard = actions.slice(
        actions.indexOf("export async function handoffFromCard")
      );
      expect(fromCard).toContain(
        "redirect(destination ?? `/offerings/${slug}`)"
      );
    });
  });

  describe("the disclosure — AC-13", () => {
    /**
     * `PRD-0009` §8 requires the commission relationship to be disclosed on a
     * page carrying a review, and the Owner approved these exact words on
     * 2026-09-16. Reproduced rather than paraphrased.
     */
    it("carries the Owner's approved wording exactly", () => {
      expect(AFFILIATE.disclosure).toBe(
        "Bu sayfadaki bazı bağlantılar iş ortaklarımıza yönlendirir. Bu bağlantılardan alışveriş yapıldığında platformumuz komisyon kazanabilir."
      );
    });

    /**
     * It sits with the control that earns the commission rather than in a
     * footer, because that is where a reader is standing when it matters.
     */
    it("is presented beside the action", () => {
      const block = presentation.slice(
        presentation.indexOf("offering.handoffAvailable"),
        presentation.indexOf("<DecisionEntries")
      );
      expect(block).toContain("AFFILIATE.disclosure");
      expect(block).toContain("AFFILIATE.cta");
    });

    /** One definition for a label that now appears on three surfaces. */
    it("names the partner on the control itself", () => {
      const block = presentation.slice(
        presentation.indexOf("offering.handoffAvailable"),
        presentation.indexOf("<DecisionEntries")
      );
      expect(block).toContain("offering.business.name");
    });
  });

  describe("availability is asked, not assumed", () => {
    /**
     * The same expression the card uses, so the control cannot appear on a
     * listing the handoff would refuse — and the handoff still re-reads the
     * destination at the moment of the press.
     */
    it("composes availability from the destination's own eligibility", () => {
      expect(repository).toContain("HANDOFF_AVAILABLE_SQL");
      expect(
        readFileSync("apps/api/src/persistence/offering-price.sql.ts", "utf8")
      ).toContain("ad.handoff_eligibility = 'ELIGIBLE'");
    });

    it("does not compose it in the web application", () => {
      expect(code(presentation)).not.toMatch(/eligib/iu);
    });
  });
});
