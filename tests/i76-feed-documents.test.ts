import { describe, expect, it } from "vitest";

import {
  FeedFormatError,
  XmlParseError,
  expandEntities,
  flattenElement,
  isRejection,
  mapRecord,
  parseXml,
  readAmount,
  readCurrency,
  readFeed,
  readStockState,
  readUrl,
  type FeedCandidate,
  type FeedMapping
} from "../packages/feed/src/index.js";

/**
 * `I76` — reading a partner's catalogue.
 *
 * The Owner's requirement names the method as well as the outcome: _"Ürün
 * verilerinin partner sitelerinden ham çekimi (scraping) yerine, Affiliate
 * XML/JSON feed'leri üzerinden alınması."_ A feed is a document a partner
 * publishes for this purpose; a scrape is a reading of a page they published for
 * people, and it breaks silently every time they redesign it.
 *
 * **Everything risky about a feed is in this file**, because everything risky
 * about a feed happens before a database is involved: the document is written by
 * somebody else, it changes without notice, and it is trusted with prices.
 *
 * The cases below are the ones where an intake looks like it works and is
 * quietly wrong:
 *
 * - `1.299` read as one and a bit, which turns a laptop into a cable and puts
 *   it at the wrong end of every price ordering — silently, because both are
 *   plausible prices;
 * - `stokta yok` read as in stock, because the rule looked for the positive
 *   word first and the negative phrase contains it;
 * - a `<![CDATA[…]]>` title read with its markup, or an `&amp;` left in a
 *   product name;
 * - a malformed document partially imported, so a partner's catalogue silently
 *   loses the half that came after the broken tag;
 * - and a record with no stable identifier, which makes every sync a fresh
 *   import and doubles the catalogue every hour.
 */
describe("Increment I76 reading XML a partner wrote", () => {
  it("reads a flat product list", () => {
    const items = readFeed({
      body: `<?xml version="1.0" encoding="UTF-8"?>
        <products>
          <product id="A-1">
            <name>Kablo</name>
            <price>129,90</price>
          </product>
          <product id="A-2">
            <name>Adaptör</name>
            <price>1.299,90</price>
          </product>
        </products>`,
      format: "XML"
    });
    expect(items).toEqual([
      { "@id": "A-1", name: "Kablo", price: "129,90" },
      { "@id": "A-2", name: "Adaptör", price: "1.299,90" }
    ]);
  });

  it("finds the products inside an RSS envelope, and not the channel's title", () => {
    /*
     * The heuristic's real test. A group of same-named siblings exists at every
     * level of this document, and only one of them is the products — the one
     * whose members have children of their own. A rule that took the largest
     * group without that filter would return the two `<title>` elements.
     */
    const items = readFeed({
      body: `<rss><channel>
          <title>Mağaza</title>
          <link>https://ornek.test</link>
          <item><title>Bir</title><g:price>10 TL</g:price></item>
          <item><title>İki</title><g:price>20 TL</g:price></item>
        </channel></rss>`,
      format: "XML"
    });
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ "g:price": "10 TL", title: "Bir" });
  });

  it("takes an explicit item path over its own guess", () => {
    const body = `<feed><group><row><a>1</a></row></group>
      <other><row><a>2</a></row><row><a>3</a></row></other></feed>`;
    // The guess would take `other/row`, which has two members.
    expect(readFeed({ body, format: "XML" })).toHaveLength(2);
    expect(readFeed({ body, format: "XML", itemPath: "group/row" })).toEqual([
      { a: "1" }
    ]);
  });

  it("says so when the item path names nothing", () => {
    expect(() =>
      readFeed({
        body: `<products><product><a>1</a></product></products>`,
        format: "XML",
        itemPath: "urunler/urun"
      })
    ).toThrow(FeedFormatError);
  });

  it("keeps a CDATA title exactly as written, markup and all", () => {
    const root = parseXml(`<p><t><![CDATA[Kablo & <b>Adaptör</b>]]></t></p>`);
    expect(flattenElement(root)).toEqual({ t: "Kablo & <b>Adaptör</b>" });
  });

  it("expands the entities a feed actually contains", () => {
    expect(expandEntities("Kablo &amp; Adapt&#246;r")).toBe("Kablo & Adaptör");
    expect(expandEntities("&lt;b&gt;")).toBe("<b>");
    expect(expandEntities("&#x41;")).toBe("A");
    // An undeclared entity is left as written. A partner sending `&nbsp;` has
    // produced invalid XML, and deleting characters out of a product name is a
    // worse answer than showing what they wrote.
    expect(expandEntities("30&nbsp;cm")).toBe("30&nbsp;cm");
  });

  it("refuses a document rather than importing the part that parsed", () => {
    /*
     * **The failure this rule exists for.** A parser that returned what it had
     * read before the broken tag would import half a partner's catalogue, and
     * the missing half is indistinguishable from products that were withdrawn —
     * so the platform would quietly stop showing them and nobody would know.
     */
    expect(() => parseXml(`<a><b>1</a>`)).toThrow(XmlParseError);
    expect(() => parseXml(`<a><b>1</b>`)).toThrow(XmlParseError);
    expect(() => parseXml(`   `)).toThrow(XmlParseError);
    expect(() => parseXml(`<a><![CDATA[x</a>`)).toThrow(XmlParseError);
  });

  it("skips a DOCTYPE without resolving anything it declares", () => {
    /*
     * The billion-laughs and external-entity attacks both work by having the
     * parser resolve what a document declares. Nothing here resolves an entity
     * a document defines, so the declaration is skipped and its references are
     * left as literal text.
     */
    const root = parseXml(`<!DOCTYPE p [<!ENTITY x "boom">]><p><t>&x;</t></p>`);
    expect(flattenElement(root)).toEqual({ t: "&x;" });
  });

  it("reads an emptied catalogue as empty rather than as broken", () => {
    /*
     * **The one case where a partner deliberately clears their listings.** A
     * well-formed document with no products in it is a true statement about
     * their catalogue. Reading it as a parse failure would make it the one case
     * the platform never acts on: a failed run is forbidden from recording
     * absence (`PRD-0001` v4.1 §5.11.1a), so those products would stay
     * published for ever.
     */
    expect(readFeed({ body: `<products></products>`, format: "XML" })).toEqual(
      []
    );
    expect(readFeed({ body: `<products/>`, format: "XML" })).toEqual([]);
    expect(readFeed({ body: `[]`, format: "JSON" })).toEqual([]);
  });

  it("reads a root with no elements as empty, whatever text it holds", () => {
    /*
     * **The boundary, stated rather than assumed.** "No element children" is
     * the whole of the empty rule, so a root holding only text is empty too.
     *
     * That is deliberate and it is where the protection moves rather than
     * disappears: a document that restructured produces records the *mapping*
     * refuses — every row missing its identifier or its title — and each
     * refusal carries a reason onto the dashboard. A run reporting "4,000
     * rejected: no value at sku" tells an operator what changed; a whole-run
     * failure saying "unreadable" does not.
     */
    expect(
      readFeed({ body: `<products>bare text</products>`, format: "XML" })
    ).toEqual([]);
  });

  it("keeps the first of a repeated element and still offers the rest", () => {
    const root = parseXml(
      `<i><image>a.jpg</image><image>b.jpg</image><image>c.jpg</image></i>`
    );
    expect(flattenElement(root)).toEqual({
      image: "a.jpg",
      "image[1]": "b.jpg",
      "image[2]": "c.jpg"
    });
  });
});

describe("Increment I76 reading JSON a partner wrote", () => {
  it("takes the root array", () => {
    expect(
      readFeed({ body: `[{"sku":"A","name":"Kablo"}]`, format: "JSON" })
    ).toEqual([{ name: "Kablo", sku: "A" }]);
  });

  it("finds the payload inside an envelope, past its metadata", () => {
    const items = readFeed({
      body: JSON.stringify({
        generatedAt: "2026-09-03",
        data: { total: 2, items: [{ sku: "A" }, { sku: "B" }] }
      }),
      format: "JSON"
    });
    expect(items).toEqual([{ sku: "A" }, { sku: "B" }]);
  });

  it("addresses nested values by a dotted path", () => {
    expect(
      readFeed({
        body: `[{"sku":"A","offer":{"price":10.5,"stock":true},"tags":["x","y"]}]`,
        format: "JSON"
      })
    ).toEqual([
      {
        "offer.price": "10.5",
        "offer.stock": "true",
        sku: "A",
        "tags.0": "x",
        "tags.1": "y"
      }
    ]);
  });

  it("says what is wrong with a document that is not JSON", () => {
    expect(() => readFeed({ body: `<products/>`, format: "JSON" })).toThrow(
      FeedFormatError
    );
    expect(() => readFeed({ body: `{"a":1}`, format: "JSON" })).toThrow(
      FeedFormatError
    );
  });
});

describe("Increment I76 normalising what a partner wrote", () => {
  it("reads a price under either convention", () => {
    /*
     * **The most expensive silent bug available in this increment.** `1.299`
     * is one thousand two hundred and ninety-nine in Turkish and one and a bit
     * in English, and a feed says which only by convention. Both readings are
     * plausible prices, so nothing downstream would notice — the product would
     * simply sit at the wrong end of every ordering the platform offers.
     */
    expect(readAmount("1.299,90")).toBe("1299.90");
    expect(readAmount("1,299.90")).toBe("1299.90");
    expect(readAmount("1.299")).toBe("1299.00");
    expect(readAmount("1,299")).toBe("1299.00");
    expect(readAmount("129,9")).toBe("129.90");
    expect(readAmount("129.9")).toBe("129.90");
    expect(readAmount("1299")).toBe("1299.00");
    expect(readAmount("1.299.900,50")).toBe("1299900.50");
    expect(readAmount(" 42.990,00 TL ")).toBe("42990.00");
    expect(readAmount("₺129,90")).toBe("129.90");
  });

  it("refuses what it cannot read rather than guessing", () => {
    expect(readAmount("")).toBeNull();
    expect(readAmount("sorunuz")).toBeNull();
    expect(readAmount("-10")).toBeNull();
    // Four digits after a separator is neither a fraction nor a thousands
    // group, and a parser that picked one would be inventing a price.
    expect(readAmount("1.2999")).toBeNull();
  });

  it("takes a currency only where one was written", () => {
    expect(readCurrency("TRY")).toBe("TRY");
    expect(readCurrency("tl")).toBe("TRY");
    expect(readCurrency("₺")).toBe("TRY");
    expect(readCurrency("129,90 TL")).toBe("TRY");
    expect(readCurrency("USD")).toBe("USD");
    expect(readCurrency("")).toBeNull();
    expect(readCurrency("129,90")).toBeNull();
  });

  it("does not read a sold-out product as available", () => {
    /*
     * `"stokta yok"` contains `"stokta"`. A rule that looked for the positive
     * word first reports a sold-out product as available — the one direction of
     * this mistake that costs a person a journey to a shop.
     */
    expect(readStockState("stokta yok")).toBe("OUT_OF_STOCK");
    expect(readStockState("Stokta Yok")).toBe("OUT_OF_STOCK");
    expect(readStockState("tükendi")).toBe("OUT_OF_STOCK");
    expect(readStockState("out of stock")).toBe("OUT_OF_STOCK");
    expect(readStockState("0")).toBe("OUT_OF_STOCK");

    expect(readStockState("stokta")).toBe("IN_STOCK");
    expect(readStockState("in stock")).toBe("IN_STOCK");
    expect(readStockState("true")).toBe("IN_STOCK");
    expect(readStockState("12")).toBe("IN_STOCK");

    // Silence is silence. PRD-0001 treats an unstated stock state as unstated,
    // and a feed that says nothing must not be read as saying yes.
    expect(readStockState("")).toBe("UNKNOWN");
    expect(readStockState("belki")).toBe("UNKNOWN");
  });

  it("admits only an ordinary web address", () => {
    expect(readUrl("https://partner.test/p/1")).toBe(
      "https://partner.test/p/1"
    );
    expect(readUrl("javascript:alert(1)")).toBeNull();
    expect(readUrl("data:text/html,x")).toBeNull();
    expect(readUrl("//partner.test/p/1")).toBeNull();
    expect(readUrl("/p/1")).toBeNull();
    expect(readUrl("")).toBeNull();
  });

  it("stores the address a person will actually reach", () => {
    /*
     * **`https:/\evil.test` is a valid `https` address**, not a malformed one:
     * every browser resolves it to `https://evil.test/`. Keeping the partner's
     * spelling would put two strings for one address in the database, and a
     * check written against one of them would miss the other.
     */
    expect(readUrl("https:/\\evil.test")).toBe("https://evil.test/");
    expect(readUrl("http://partner.test")).toBe("http://partner.test/");
    expect(readUrl("https://Partner.TEST/p/1?a=1")).toBe(
      "https://partner.test/p/1?a=1"
    );
  });
});

describe("Increment I76 mapping a record to a candidate", () => {
  const mapping: FeedMapping = {
    currency: "currency",
    externalId: "sku",
    imageUrl: "image",
    price: "price",
    priorPrice: "oldPrice",
    productKey: "gtin",
    stock: "stock",
    summary: "description",
    title: "name",
    url: "link"
  };

  const candidate = (record: Record<string, string>): FeedCandidate => {
    const result = mapRecord(record, mapping);
    if (isRejection(result)) throw new Error(`REJECTED_${result.reason}`);
    return result;
  };

  it("carries every field a partner supplied", () => {
    expect(
      candidate({
        currency: "TL",
        gtin: "8690000000001",
        image: "https://partner.test/1.jpg",
        link: "https://partner.test/p/1",
        name: "Kablo",
        oldPrice: "199,90",
        price: "129,90",
        sku: "A-1",
        stock: "stokta"
      })
    ).toEqual({
      amount: "129.90",
      categoryKey: null,
      currency: "TRY",
      deliveryCost: null,
      externalId: "A-1",
      imageUrl: "https://partner.test/1.jpg",
      priorAmount: "199.90",
      productKey: "8690000000001",
      stockState: "IN_STOCK",
      summary: null,
      title: "Kablo",
      url: "https://partner.test/p/1"
    });
  });

  it("refuses a record with no identifier that survives the next sync", () => {
    /*
     * Without one, every sync is a fresh import: the same products arrive as
     * new rows, the catalogue doubles every hour, and the platform shows a
     * partner's shop several times over. This is the one rejection that
     * protects the database rather than the reader.
     */
    const result = mapRecord({ name: "Kablo" }, mapping);
    expect(isRejection(result)).toBe(true);
    expect((result as { reason: string }).reason).toContain("sku");
  });

  it("refuses a record with no name, and says which field was empty", () => {
    const result = mapRecord({ sku: "A-1" }, mapping);
    expect(isRejection(result)).toBe(true);
    expect((result as { externalId: string | null }).externalId).toBe("A-1");
    expect((result as { reason: string }).reason).toContain("name");
  });

  it("keeps a record whose price it cannot read out of the catalogue", () => {
    // A price that does not parse is not a listing with no price — it is a
    // listing whose price nobody can trust, and the two must not look alike.
    const result = mapRecord(
      { name: "Kablo", price: "arayınız", sku: "A-1" },
      mapping
    );
    expect(isRejection(result)).toBe(true);
  });

  it("keeps a record with no price at all", () => {
    /*
     * Absent is not wrong. PRD-0001's publication minimum decides whether a
     * priceless Offering may be published; rejecting it here would hide a
     * partner's whole catalogue because one optional field was named wrongly.
     */
    const only = candidate({ name: "Kablo", sku: "A-1" });
    expect(only.amount).toBeNull();
    expect(only.stockState).toBe("UNKNOWN");
  });

  it("drops a prior amount that is not a reduction", () => {
    /*
     * The database refuses a prior amount that is not higher
     * (`offering_prior_amount_is_a_reduction`). A partner sending last week's
     * lower price would otherwise fail the whole row rather than lose one field
     * nobody needs.
     */
    expect(
      candidate({ name: "K", oldPrice: "99,90", price: "129,90", sku: "A-1" })
        .priorAmount
    ).toBeNull();
  });

  it("never invents a currency from an amount", () => {
    // A price with no currency is a price nobody can compare, and defaulting to
    // `TRY` would make it look comparable when it is not.
    expect(
      candidate({ name: "K", price: "129,90", sku: "A-1" }).currency
    ).toBeNull();
  });

  it("drops an address that is not an ordinary web address, and keeps the product", () => {
    const mapped = candidate({
      link: "javascript:alert(1)",
      name: "Kablo",
      sku: "A-1"
    });
    expect(mapped.url).toBeNull();
    expect(mapped.title).toBe("Kablo");
  });
});
