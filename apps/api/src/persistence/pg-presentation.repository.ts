import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type {
  OfferingPresentationResponse,
  PresentedAttribute
} from "@commerce/contracts";
import { publicBusinessIdentity } from "@commerce/business";

import {
  OFFERING_PRICE_SQL,
  TOTAL_COST_SQL,
  composePrice,
  type OfferingPriceColumns
} from "./offering-price.sql.js";
import {
  PRODUCT_RATING_SQL,
  type ProductRatingColumns
} from "./product-rating.sql.js";

import type { SellerOffer } from "@commerce/contracts";

/**
 * Complete public Offering Presentation (`US-OFR-F05-001`, PRD-0001 §8.2).
 *
 * It is a separate repository from Discovery on purpose. Discovery decides
 * which Offerings a person may find; Presentation decides what one Offering
 * is. They read some of the same rows, and folding them together would make it
 * easy to answer a Presentation question with a Discovery rule.
 */

interface SellerRow extends OfferingPriceColumns {
  businessName: string;
  offeringId: string;
  slug: string;
}

interface PresentationRow extends OfferingPriceColumns, ProductRatingColumns {
  businessLogoUrl: string | null;
  businessName: string;
  productKey: string | null;
  businessShortDescription: string | null;
  categoryId: string;
  domainId: string;
  /// I67. `bigint` in the database, read back as digits: the driver hands a
  /// `bigint` over as a string rather than rounding it into a `number`.
  listingNumber: string;
  offeringId: string;
  publicExposure: string;
  publishedAt: Date;
  slug: string;
  summary: string | null;
  title: string;
}

interface AttributeRow {
  attributeId: string;
  booleanValue: boolean | null;
  name: string;
  numberValue: string | null;
  optionLabels: string[];
  textValue: string | null;
  unit: string | null;
  valueKind: PresentedAttribute["kind"];
}

/**
 * One Attribute, as a person reads it.
 *
 * `supplied` is decided per kind rather than by asking whether any column is
 * non-null, because a `false` Boolean and an absent Boolean are different
 * statements and the second must not be reported as the first.
 */
function present(row: AttributeRow): PresentedAttribute {
  const number = row.numberValue === null ? null : Number(row.numberValue);
  const supplied =
    row.valueKind === "TEXT"
      ? row.textValue !== null
      : row.valueKind === "NUMBER"
        ? number !== null
        : row.valueKind === "BOOLEAN"
          ? row.booleanValue !== null
          : row.optionLabels.length > 0;

  return {
    attributeId: row.attributeId,
    boolean: row.booleanValue,
    kind: row.valueKind,
    name: row.name,
    number,
    optionLabels: row.optionLabels,
    supplied,
    text: row.textValue,
    // Carried verbatim from the definition (`US-PLT-F09-001` owns it). A unit
    // restated by the presenter is a unit that can drift from the governed one.
    unit: row.unit
  };
}

@Injectable()
export class PgPresentationRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Begins complete public Presentation, or refuses to begin one.
   *
   * The read and the occurrence share one transaction. AC-8 makes the
   * occurrence conditional on Presentation successfully beginning, and AC-9
   * withholds everything when it cannot — so an occurrence that outlived a
   * failed composition would be a lie about a person who never saw anything.
   *
   * Eligibility is the projection's existence, exactly as it is for a Listing
   * Card: the row is there only while final Offering Public Eligibility is
   * `Eligible`. AC-1 therefore needs no second opinion here, and PRD-0001 §7.1
   * forbids one.
   */
  async present(slug: string): Promise<OfferingPresentationResponse | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const found = await client.query<PresentationRow>(
        `select p.offering_id as "offeringId", p.domain_id as "domainId",
           p.title, p.published_at as "publishedAt", o.slug, o.summary,
           o.category_id as "categoryId", b.name as "businessName",
           o.listing_number::text as "listingNumber",
           b.logo_url as "businessLogoUrl",
           b.short_description as "businessShortDescription",
           b.public_exposure::text as "publicExposure",
           o.product_key as "productKey",
           ${OFFERING_PRICE_SQL},
           ${PRODUCT_RATING_SQL}
         from offering_search_projection p
         join offering o on o.id = p.offering_id
         join business b on b.id = p.business_id
         where o.slug = $1`,
        [slug]
      );
      const row = found.rows[0];
      if (!row) {
        await client.query("rollback");
        return null;
      }

      // PRD-0005 owns the public Business identity set and refuses to compose
      // one while exposure is Ineligible. An eligible Offering cannot have an
      // ineligible Business — `composePublicEligibility` already required it —
      // so this asks the owner rather than assuming the answer.
      const business = publicBusinessIdentity({
        logoUrl: row.businessLogoUrl,
        name: row.businessName,
        publicExposure: row.publicExposure as "ELIGIBLE" | "INELIGIBLE",
        shortDescription: row.businessShortDescription
      });
      if (!business) {
        await client.query("rollback");
        return null;
      }

      const presentation: OfferingPresentationResponse = {
        attributes: (await this.attributes(client, row)).map(present),
        business,
        categoryPath: await this.categoryPath(client, row.categoryId),
        description: row.summary,
        // I67. The number the card carried, on the page the card opened.
        listingNumber: row.listingNumber,
        offeringId: row.offeringId,
        /*
         * The same composer Discovery uses, so the amount on the card and the
         * amount on the page it opened cannot disagree.
         */
        pricing: composePrice(row),
        productKey: row.productKey,
        publishedAt: row.publishedAt.toISOString(),
        /*
         * I62. The same grouping the seller list below is drawn from, so the
         * score above the page and the shops beneath it are two readings of
         * one product rather than of two.
         */
        rating: { average: row.ratingAverage, count: row.ratingCount },
        /*
         * §5.12.1 on screen. The other partners selling the same thing, which
         * is the one question a price comparison page exists to answer and the
         * one this page could not answer at all.
         */
        sellers: await this.sellers(client, row),
        slug: row.slug,
        title: row.title,
        /*
         * The supplied set, in the order it is inspected in (UX-0003 §8.2).
         *
         * ~~No Offering can hold media yet.~~ It can, as of I30. Empty still
         * means the Offering supplied none, which is the half of AC-4 that was
         * always true — the other half was unreachable because there was
         * nowhere for a visual to be supplied.
         */
        visuals: await this.visuals(client, row.offeringId)
      };

      // AC-8. Written here, at the one point where an eligible complete
      // Presentation is known to have been composed.
      await client.query(
        `insert into offering_presentation_open (offering_id, domain_id)
         values ($1, $2)`,
        [row.offeringId, row.domainId]
      );
      await client.query("commit");
      return presentation;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Every publicly eligible Offering carrying the same Product Key.
   *
   * `or so.id = $2` is not a special case for the keyless Offering, it is the
   * rule: an Offering is always a seller of itself. Without it a page for
   * something no partner has matched would show an empty price list, which
   * reads as "nobody sells this" beside a price that says otherwise.
   *
   * Eligibility is the projection's existence, the same test Discovery uses, so
   * a sibling hidden by moderation stops being a seller here at the same
   * moment.
   */
  private async sellers(
    client: PoolClient,
    row: PresentationRow
  ): Promise<SellerOffer[]> {
    const result = await client.query<SellerRow>(
      `select o.id as "offeringId", o.slug, b.name as "businessName",
         ${OFFERING_PRICE_SQL}
       from offering_search_projection sp
       join offering o on o.id = sp.offering_id
       join business b on b.id = sp.business_id
       where (o.product_key is not null and o.product_key = $1) or o.id = $2
       -- Three keys, in the prototype's own order (its sortedOffers).
       --
       -- Out of stock goes last however cheap it is, and that is the Owner's
       -- rule rather than an optimisation: a price a person cannot buy at is
       -- not a better offer than one they can, and putting it at the top makes
       -- the cheapest row the one row that cannot be acted on. UNKNOWN is not
       -- OUT_OF_STOCK -- an unstated stock level is not a claim that there is
       -- none -- so it stays with the buyable rows.
       --
       -- Then 5.10.5: priced rows order among themselves by what they cost
       -- delivered rather than by the amount alone; unpriced ones follow.
       --
       -- The card above this list is deliberately not sorted this way. It is
       -- drawn from the cheapest seller full stop, which is what the
       -- prototype's card does. The card answers "what does this cost at
       -- best"; the list answers "who can I buy it from now".
       order by (o.stock_state = 'OUT_OF_STOCK'),
         (o.pricing_kind = 'FIXED') desc, ${TOTAL_COST_SQL} asc nulls last,
         b.name, o.id`,
      [row.productKey, row.offeringId]
    );
    return result.rows.map((seller) => ({
      businessName: seller.businessName,
      offeringId: seller.offeringId,
      pricing: composePrice(seller),
      slug: seller.slug
    }));
  }

  /**
   * The Category context, root first.
   *
   * The whole path rather than the leaf, because "Araçlar / Otomobil / Klasik"
   * tells a person where they are and "Klasik" alone does not.
   */
  private async categoryPath(
    client: PoolClient,
    categoryId: string
  ): Promise<string[]> {
    const result = await client.query<{ name: string }>(
      `with recursive walk as (
         select id, parent_id, name, 0 as depth
         from category where id = $1
         union all
         select c.id, c.parent_id, c.name, walk.depth + 1
         from category c join walk on walk.parent_id = c.id
       )
       select name from walk order by depth desc`,
      [categoryId]
    );
    return result.rows.map((row) => row.name);
  }

  /**
   * The supplied visuals, in the order the set is inspected in.
   *
   * Ordered by `position` rather than by insertion or by id, because the order
   * is a decision the owner made and `0` is the primary visual. The Listing
   * Card takes the same first element from the same ordering, so Discovery and
   * Presentation cannot disagree about which visual is the primary one.
   */
  private async visuals(
    client: PoolClient,
    offeringId: string
  ): Promise<string[]> {
    const result = await client.query<{ url: string }>(
      `select url from offering_visual
       where offering_id = $1 order by position asc`,
      [offeringId]
    );
    return result.rows.map((row) => row.url);
  }

  /**
   * Every Attribute applicable to the Offering's Category, whether or not the
   * Offering supplied a value.
   *
   * The applicability link decides the set, so an Attribute that does not
   * belong to this Category cannot appear (UX-0003 §8.4), and one that does
   * appears even when unanswered — which is how a missing optional value gets
   * distinguished instead of silently vanishing.
   *
   * **One ordered set, by the governed name.** `US-OFR-F05-001` AC-3 asks for
   * "understandable groups", and PRD-0006 gives an Attribute definition no
   * group, section or ordering property — so a grouping composed here would be
   * a classification nobody governs, shown to the public as though somebody
   * did. The Owner's recorded reading is that one ordered set is what can be
   * said truthfully, which is what this is.
   *
   * `d.id` breaks the tie because `attribute_definition.name` is not unique —
   * only `stable_key` is. Ordering by name alone leaves two same-named
   * Attributes in whatever order the plan produced, and "one ordered set" has
   * to mean the same set in the same order on every read to be worth saying.
   */
  private async attributes(
    client: PoolClient,
    row: PresentationRow
  ): Promise<AttributeRow[]> {
    const result = await client.query<AttributeRow>(
      `select d.id as "attributeId", d.name, d.unit,
         d.value_kind::text as "valueKind",
         v.text_value as "textValue", v.number_value::text as "numberValue",
         v.boolean_value as "booleanValue",
         coalesce(
           (select array_agg(o.label order by o.sort_order, o.label)
            from offering_attribute_value ov
            join attribute_option o on o.id = ov.option_id
            where ov.offering_id = $1
              and ov.attribute_definition_id = d.id),
           '{}'
         ) as "optionLabels"
       from category_attribute ca
       join attribute_definition d on d.id = ca.attribute_definition_id
       left join offering_attribute_value v
         on v.offering_id = $1 and v.attribute_definition_id = d.id
         and v.option_id is null
       where ca.category_id = $2 and d.active = true
       group by d.id, d.name, d.unit, d.value_kind,
         v.text_value, v.number_value, v.boolean_value
       order by d.name, d.id`,
      [row.offeringId, row.categoryId]
    );
    return result.rows;
  }
}
