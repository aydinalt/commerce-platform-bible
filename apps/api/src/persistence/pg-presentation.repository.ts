import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type {
  OfferingPresentationResponse,
  PresentedAttribute
} from "@commerce/contracts";
import { publicBusinessIdentity } from "@commerce/business";

/**
 * Complete public Offering Presentation (`US-OFR-F05-001`, PRD-0001 §8.2).
 *
 * It is a separate repository from Discovery on purpose. Discovery decides
 * which Offerings a person may find; Presentation decides what one Offering
 * is. They read some of the same rows, and folding them together would make it
 * easy to answer a Presentation question with a Discovery rule.
 */

interface PresentationRow {
  businessLogoUrl: string | null;
  businessName: string;
  businessShortDescription: string | null;
  categoryId: string;
  domainId: string;
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
export class PgPresentationRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

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
           b.logo_url as "businessLogoUrl",
           b.short_description as "businessShortDescription",
           b.public_exposure::text as "publicExposure"
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
        offeringId: row.offeringId,
        publishedAt: row.publishedAt.toISOString(),
        slug: row.slug,
        title: row.title,
        // No Offering can hold media yet. Empty rather than absent: the field
        // says the Offering supplied none, which is what AC-4 asks it to say.
        visuals: []
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
