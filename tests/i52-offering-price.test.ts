import { readFileSync } from "node:fs";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  editOfferingSchema,
  offeringPriceSchema,
  OFFERING_SOURCES,
  PRICING_KINDS,
  STOCK_STATES,
  type EditableOfferingContent
} from "../packages/contracts/src/index.js";
import { ContentForm } from "../apps/web/src/app/businesses/[businessId]/offerings/[offeringId]/content-form.js";
import { PRICING } from "../apps/web/src/business/copy.js";

const CATEGORY = "11111111-1111-4111-8111-111111111111";

/**
 * `I52` — an Offering states what it costs, where its record came from, and
 * which product it is an instance of (PRD-0001 v4.0 §5.10, §5.11, §5.12).
 *
 * **The distinction this increment exists for is that there are two different
 * absences of price**, and the Owner named the one the platform was about to
 * lose: *"ilan fiyatı olmayan ürünlerde olabilir, örnek hizmet veriliyordur ama
 * bir fiyatı yok — yönlendirme sonrası istenen hizmete göre belirlenen fiyat
 * olabilir."* A consultancy has no amount by its nature; a feed that carried
 * nothing has an amount the platform has not read. One nullable column would
 * have made those the same row and every surface would then have had to guess.
 *
 * So the cases below are mostly about what is **refused**. A price model is
 * judged by the rows it cannot hold, not by the ones it can.
 */
describe("Increment I52 Offering price, source and product key", () => {
  const parse = (input: Record<string, unknown>) =>
    editOfferingSchema.safeParse({
      categoryId: CATEGORY,
      title: "İlan",
      ...input
    });

  const accepted = (input: Record<string, unknown>) => {
    const result = parse(input);
    if (!result.success)
      throw new Error(
        `REFUSED: ${result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.code}`).join(", ")}`
      );
    return result.data;
  };

  const refusal = (input: Record<string, unknown>) => {
    const result = parse(input);
    expect(result.success).toBe(false);
    if (result.success) throw new Error("ACCEPTED");
    return result.error.issues.map((issue) => issue.path.join("."));
  };

  describe("the three answers a price can be", () => {
    it("names exactly three Pricing Kinds and no fourth", () => {
      /*
       * Asserted as the exact set rather than by membership. A test that only
       * checks `FIXED` is present would pass just as happily against a fourth
       * Kind nobody decided to add — and the whole design here is that these
       * three are different answers, which stops being true the moment a
       * fourth appears without the surfaces learning what it means.
       */
      expect([...PRICING_KINDS]).toEqual(["FIXED", "ON_REQUEST", "UNKNOWN"]);
      expect([...STOCK_STATES]).toEqual([
        "IN_STOCK",
        "OUT_OF_STOCK",
        "UNKNOWN"
      ]);
      expect([...OFFERING_SOURCES]).toEqual(["MANUAL", "FEED", "BUSINESS"]);
    });

    it("accepts an Offering priced on request, carrying no amount", () => {
      // §5.10.1. The Owner's case: the service exists, it is publishable, and
      // what it costs is settled after the Handoff.
      expect(accepted({ pricing: { kind: "ON_REQUEST" } }).pricing).toEqual({
        kind: "ON_REQUEST",
        stockState: "UNKNOWN"
      });
    });

    it("keeps On Request and Unknown apart in the shape itself", () => {
      const onRequest = accepted({ pricing: { kind: "ON_REQUEST" } }).pricing;
      const unknown = accepted({ pricing: { kind: "UNKNOWN" } }).pricing;
      expect(onRequest.kind).not.toBe(unknown.kind);
    });

    it("treats an omitted price as Unknown, not as an unchanged one", () => {
      /*
       * The write shape is a replacement — an Attribute left out is one the
       * Offering no longer holds — and price obeys the same rule rather than a
       * private one. §5.10.2 makes it safe: no Kind blocks publication, so a
       * cleared price never withdraws a Published Offering.
       */
      expect(accepted({}).pricing).toEqual({
        kind: "UNKNOWN",
        stockState: "UNKNOWN"
      });
    });
  });

  describe("what a Fixed price must carry", () => {
    it("accepts an amount with its currency", () => {
      expect(
        accepted({
          pricing: { amount: "42990.00", currency: "TRY", kind: "FIXED" }
        }).pricing
      ).toEqual({
        amount: "42990.00",
        currency: "TRY",
        deliveryCost: null,
        kind: "FIXED",
        priorAmount: null,
        stockState: "UNKNOWN"
      });
    });

    it("refuses a Fixed price with no amount and no currency", () => {
      expect(refusal({ pricing: { kind: "FIXED" } })).toContain(
        "pricing.amount"
      );
      expect(refusal({ pricing: { amount: "1", kind: "FIXED" } })).toContain(
        "pricing.currency"
      );
    });

    it("refuses a caller that tries to state when the amount was established", () => {
      /*
       * §5.10.3 makes the instant part of the price. A caller able to name it
       * could present a year-old amount as established a minute ago, which is
       * the one lie a comparison site cannot survive telling. It is stamped
       * where the amount is written, the way the registration token is minted
       * at delivery rather than accepted from a body.
       */
      expect(
        refusal({
          pricing: {
            amount: "1",
            amountSetAt: "2026-01-01T00:00:00.000Z",
            currency: "TRY",
            kind: "FIXED"
          }
        })
      ).toContain("pricing");
    });

    it("refuses money that is not money", () => {
      for (const amount of ["-1", "1.234", "1,50", "abc", "1e3", " "])
        expect(
          refusal({ pricing: { amount, currency: "TRY", kind: "FIXED" } })
        ).toContain("pricing.amount");
    });

    it("keeps the amount as text, never as a number", () => {
      /*
       * `NUMERIC(12,2)` is exact and IEEE-754 is not. §5.10.5 makes the
       * ordering of these amounts the product, and an ordering computed from
       * approximations is one that is occasionally, silently wrong.
       */
      const price = accepted({
        pricing: { amount: "0.10", currency: "TRY", kind: "FIXED" }
      }).pricing;
      expect(price.kind === "FIXED" && typeof price.amount).toBe("string");
      expect(price.kind === "FIXED" && price.amount).toBe("0.10");
    });
  });

  describe("an amount that is not shown is an amount shown by accident", () => {
    it("refuses an unpriced Offering that carries money anyway", () => {
      for (const kind of ["ON_REQUEST", "UNKNOWN"])
        expect(
          refusal({ pricing: { amount: "5", currency: "TRY", kind } })
        ).toContain("pricing");
    });
  });

  describe("a reduction is derived from two amounts", () => {
    it("accepts a prior amount above the current one", () => {
      const price = accepted({
        pricing: {
          amount: "100.00",
          currency: "TRY",
          kind: "FIXED",
          priorAmount: "140.00"
        }
      }).pricing;
      expect(price.kind === "FIXED" && price.priorAmount).toBe("140.00");
    });

    it("refuses a prior amount that describes no reduction", () => {
      /*
       * §5.10.4. Equal renders as `−%0`; lower renders an increase as a
       * saving. Both are worse than showing nothing, so neither is storable.
       */
      for (const priorAmount of ["100.00", "80.00"])
        expect(
          refusal({
            pricing: {
              amount: "100.00",
              currency: "TRY",
              kind: "FIXED",
              priorAmount
            }
          })
        ).toContain("pricing.priorAmount");
    });
  });

  describe("delivery cost distinguishes free from unstated", () => {
    it("keeps zero and absent apart", () => {
      const free = accepted({
        pricing: {
          amount: "100",
          currency: "TRY",
          deliveryCost: "0",
          kind: "FIXED"
        }
      }).pricing;
      const unstated = accepted({
        pricing: { amount: "100", currency: "TRY", kind: "FIXED" }
      }).pricing;
      expect(free.kind === "FIXED" && free.deliveryCost).toBe("0");
      expect(unstated.kind === "FIXED" && unstated.deliveryCost).toBeNull();
    });

    it("reads an empty field as unstated rather than as free", () => {
      // A form submits `""` for a box nobody typed in. Turning that into `0`
      // would answer "delivery is free" on the person's behalf.
      const price = accepted({
        pricing: {
          amount: "100",
          currency: "TRY",
          deliveryCost: "",
          kind: "FIXED"
        }
      }).pricing;
      expect(price.kind === "FIXED" && price.deliveryCost).toBeNull();
    });
  });

  describe("Source is provenance, not a claim", () => {
    it("gives a submission no way to declare where the record came from", () => {
      /*
       * §5.11.1 protects a Feed Offering from being overwritten by the intake
       * that did not create it. That protection is worth nothing if an owner
       * can label their own Offering `FEED` — so the write shape has no field
       * for it at all, and the refusal is `unrecognized_keys` rather than a
       * rule someone has to remember to check.
       */
      expect(refusal({ source: "FEED" })).toContain("");
      expect(Object.keys(editOfferingSchema.shape)).not.toContain("source");
    });
  });

  describe("the Product Key is a matching hint", () => {
    it("carries the key as supplied, trimmed only", () => {
      /*
       * §5.12.3: the platform does not guess. Case-folding would be the
       * platform deciding `ean123` and `EAN123` name one product, and an MPN's
       * case is the manufacturer's to choose.
       */
      expect(accepted({ productKey: "  EAN123  " }).productKey).toBe("EAN123");
      expect(accepted({ productKey: "ean123" }).productKey).toBe("ean123");
    });

    it("treats absence and an empty field as no key", () => {
      // §5.12.2. Most Offerings in most Domains will never have one, and an
      // Offering without a key is complete rather than defective.
      expect(accepted({}).productKey).toBeNull();
      expect(accepted({ productKey: "" }).productKey).toBeNull();
    });

    it("refuses a key longer than the column holds", () => {
      expect(refusal({ productKey: "x".repeat(65) })).toContain("productKey");
    });
  });

  describe("what the read shape guarantees", () => {
    it("requires the instant on every Fixed price it accepts", () => {
      const complete = {
        amount: "10.00",
        amountSetAt: "2026-08-30T00:00:00.000Z",
        currency: "TRY",
        deliveryCost: null,
        kind: "FIXED",
        priorAmount: null,
        stockState: "UNKNOWN"
      };
      expect(offeringPriceSchema.safeParse(complete).success).toBe(true);
      const { amountSetAt: _dropped, ...withoutInstant } = complete;
      expect(offeringPriceSchema.safeParse(withoutInstant).success).toBe(false);
    });
  });

  describe("the published surface (the I42 lesson)", () => {
    /*
     * A field stored, carried and returned but absent from the OpenAPI
     * document is a field no client knows exists. I42 measured that gap across
     * 87 operations; these cases stop this increment from reopening it.
     */
    const document = JSON.parse(
      readFileSync(
        new URL("../generated/openapi.json", import.meta.url),
        "utf8"
      )
    ) as {
      components: {
        schemas: Record<
          string,
          {
            oneOf?: {
              properties?: Record<string, unknown>;
              required?: string[];
            }[];
            properties?: Record<string, unknown>;
            required?: string[];
          }
        >;
      };
    };
    const schema = (name: string) => document.components.schemas[name];

    it("publishes price, product key and source on both read shapes", () => {
      for (const name of ["OfferingContent", "EditableOfferingContent"]) {
        const read = schema(name);
        expect(Object.keys(read?.properties ?? {})).toEqual(
          expect.arrayContaining(["pricing", "productKey", "source"])
        );
        expect(read?.required).toEqual(
          expect.arrayContaining(["pricing", "productKey", "source"])
        );
      }
    });

    it("publishes price and product key on the write shape, and not Source", () => {
      const write = schema("EditOffering");
      expect(Object.keys(write?.properties ?? {})).toContain("pricing");
      expect(Object.keys(write?.properties ?? {})).toContain("productKey");
      expect(Object.keys(write?.properties ?? {})).not.toContain("source");
    });

    it("publishes the three Kinds as three branches, not one loose object", () => {
      for (const name of ["OfferingPrice", "OfferingPriceInput"]) {
        const branches = schema(name)?.oneOf ?? [];
        expect(
          branches.map(
            (branch) =>
              (branch.properties?.kind as { enum?: string[] } | undefined)
                ?.enum?.[0]
          )
        ).toEqual(["FIXED", "ON_REQUEST", "UNKNOWN"]);
      }
    });

    it("publishes the instant as required to read and impossible to write", () => {
      const read = schema("OfferingPrice")?.oneOf?.[0];
      const write = schema("OfferingPriceInput")?.oneOf?.[0];
      expect(read?.required).toContain("amountSetAt");
      expect(Object.keys(write?.properties ?? {})).not.toContain("amountSetAt");
    });
  });

  describe("the owner's screen", () => {
    const content = (
      pricing: EditableOfferingContent["pricing"],
      productKey: string | null = null
    ): EditableOfferingContent => ({
      applicableAttributes: [],
      attributes: [],
      businessId: CATEGORY,
      categoryId: CATEGORY,
      id: CATEGORY,
      pricing,
      productKey,
      publishedAt: null,
      slug: "ilan",
      source: "BUSINESS",
      status: "DRAFT",
      summary: null,
      title: "İlan",
      version: 1,
      visuals: []
    });

    const markup = (
      pricing: EditableOfferingContent["pricing"],
      productKey: string | null = null
    ) =>
      renderToStaticMarkup(
        createElement(ContentForm, {
          action: () => Promise.resolve({ kind: "IDLE" as const }),
          content: content(pricing, productKey)
        })
      );

    it("offers the three Kinds in the person's language", () => {
      const html = markup({ kind: "UNKNOWN", stockState: "UNKNOWN" });
      for (const label of Object.values(PRICING.kinds))
        expect(html).toContain(label);
      // "Sorulduğunda belirlenir" is a price, not a gap. Naming it the same
      // way as "Bilinmiyor" would erase the distinction the model exists for.
      expect(PRICING.kinds.ON_REQUEST).not.toBe(PRICING.kinds.UNKNOWN);
    });

    it("shows the amount fields only where an amount can be saved", () => {
      /*
       * A box beside "sorulduğunda belirlenir" collects a value the contract
       * refuses as `unrecognized_keys` and the column refuses as
       * `offering_unpriced_carries_no_amount`. A form that gathers what cannot
       * be saved is a form that misdescribes itself.
       */
      expect(
        markup({ kind: "ON_REQUEST", stockState: "UNKNOWN" })
      ).not.toContain('name="amount"');
      expect(
        markup({
          amount: "100.00",
          amountSetAt: "2026-08-30T00:00:00.000Z",
          currency: "TRY",
          deliveryCost: null,
          kind: "FIXED",
          priorAmount: null,
          stockState: "IN_STOCK"
        })
      ).toContain('name="amount"');
    });

    it("marks no price field required", () => {
      /*
       * §5.10.2 and §6.1.1: the Universal Publication Minimum is not extended
       * by price. A required marker here would tell the person the opposite of
       * what the platform will do.
       */
      const html = markup({
        amount: "100.00",
        amountSetAt: "2026-08-30T00:00:00.000Z",
        currency: "TRY",
        deliveryCost: null,
        kind: "FIXED",
        priorAmount: null,
        stockState: "UNKNOWN"
      });
      for (const field of [
        "amount",
        "currency",
        "priorAmount",
        "deliveryCost",
        "productKey"
      ])
        expect(html).not.toMatch(
          new RegExp(`name="${field}"[^>]*\\brequired\\b`, "u")
        );
    });

    it("gives every price control a label a screen reader can reach", () => {
      const html = markup({
        amount: "100.00",
        amountSetAt: "2026-08-30T00:00:00.000Z",
        currency: "TRY",
        deliveryCost: null,
        kind: "FIXED",
        priorAmount: null,
        stockState: "UNKNOWN"
      });
      for (const id of [
        "pricingKind",
        "amount",
        "currency",
        "priorAmount",
        "deliveryCost",
        "stockState",
        "productKey"
      ]) {
        expect(html).toContain(`for="${id}"`);
        expect(html).toContain(`id="${id}"`);
      }
    });

    it("reads the held values back into the form", () => {
      const html = markup(
        {
          amount: "42990.00",
          amountSetAt: "2026-08-30T00:00:00.000Z",
          currency: "TRY",
          deliveryCost: "0",
          kind: "FIXED",
          priorAmount: "49990.00",
          stockState: "OUT_OF_STOCK"
        },
        "EAN123"
      );
      expect(html).toContain('value="42990.00"');
      expect(html).toContain('value="49990.00"');
      expect(html).toContain('value="EAN123"');
    });
  });
});
