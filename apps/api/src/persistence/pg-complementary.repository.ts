import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import type {
  AdminComplementaryPlacementResponse,
  ComplementaryPlacementResponse
} from "@commerce/contracts";

/**
 * What a listing suggests beside itself (I70).
 *
 * The Owner's rule is about *sections*: every listing under Otomotiv suggests
 * tyres, every laptop suggests a bag. So the rows are keyed on the Category and
 * the public read walks **up** the tree from the listing's own heading — a
 * placement written against a sector applies to every heading under it, and a
 * placement written against one heading beats it. That is the same inheritance
 * the catalogue already uses for Attributes, and it is what keeps a hundred and
 * twenty-seven headings from each needing their own list.
 *
 * **Nothing here counts anything.** PRD-0006 §20.5 excludes impression, click
 * and revenue reporting: the platform decides where advertising may appear and
 * whether it appears, and measuring it is the network's business, not this
 * one's. There is no click route and no counter column, and their absence is
 * the boundary rather than an omission.
 *
 * **I75 put two gates in front of the public read.** The master switch and the
 * ad-free Category list are settings rather than placements, and they are
 * applied here rather than by the surface: a rule enforced where the rows are
 * chosen cannot be forgotten by a region added later.
 */
@Injectable()
export class PgComplementaryRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * The placements for one publicly eligible listing.
   *
   * The projection is the gate, exactly as it is for the Presentation this sits
   * beside: a listing nobody can open suggests nothing. An unknown address
   * answers with an empty list rather than a refusal — there is no listing to
   * be told about, and a surface asking "what goes with this" is not asking
   * whether the thing exists.
   *
   * `distinct on (label)` with the deepest Category first: a heading's own
   * "Kış lastiği" replaces the sector's rather than appearing beside it.
   */
  async forListing(slug: string): Promise<ComplementaryPlacementResponse[]> {
    const found = await this.pool.query<
      ComplementaryPlacementResponse & { depth: number; position: number }
    >(
      `with recursive listing as (
         select o.category_id
         from offering_search_projection p
         join offering o on o.id = p.offering_id
         where o.slug = $1
       ),
       lineage as (
         select c.id, c.parent_id, 0 as depth
         from category c join listing on listing.category_id = c.id
         union all
         select parent.id, parent.parent_id, lineage.depth + 1
         from category parent join lineage on lineage.parent_id = parent.id
       )
       select distinct on (lower(pl.label))
         pl.label, pl.partner_name as "partnerName", pl.note,
         pl.destination_url as "destinationUrl", pl.position, lineage.depth
       from complementary_placement pl
       join lineage on lineage.id = pl.category_id
       where pl.active = true
         /*
          * I75. The kill switch, applied to the platform's own region as well
          * as to the network's. A master switch that covered only the external
          * scripts would need somebody to remember what it does not cover,
          * which is the one thing an emergency control may not require.
          */
         and (select s.enabled from advertising_setting s where s.id)
         /*
          * §20.4's ad-free Categories. Written against a heading and inherited
          * downwards, like the placements themselves: a sector marked clean
          * stays clean in every heading under it, and the lineage this query
          * already walks is where "under it" is decided.
          */
         and not exists (
           select 1 from advertising_category_exclusion x
           join lineage clean on clean.id = x.category_id
         )
       order by lower(pl.label), lineage.depth, pl.position, pl.label`,
      [slug]
    );

    /*
     * Re-sorted after the grouping, because `distinct on` fixes the order it
     * deduplicates with and that order is by label. What a person reads is the
     * order somebody arranged, and the nearest Category's arrangement wins.
     */
    return [...found.rows]
      .sort(
        (left, right) =>
          left.depth - right.depth ||
          left.position - right.position ||
          left.label.localeCompare(right.label, "tr")
      )
      .map(({ destinationUrl, label, note, partnerName }) => ({
        destinationUrl,
        label,
        note,
        partnerName
      }));
  }

  /** Every placement an Admin manages, active or not. */
  async list(): Promise<AdminComplementaryPlacementResponse[]> {
    const found = await this.pool.query<AdminComplementaryPlacementResponse>(
      `select pl.id as "placementId", pl.category_id as "categoryId",
         c.name as "categoryName", pl.label,
         pl.partner_name as "partnerName", pl.note,
         pl.destination_url as "destinationUrl", pl.position, pl.active
       from complementary_placement pl
       join category c on c.id = pl.category_id
       order by c.name, pl.position, pl.label`
    );
    return found.rows;
  }

  /**
   * Writing one placement.
   *
   * `on conflict do update` on the Category and label, because an Admin fixing
   * a wrong address is correcting the same suggestion rather than making a
   * second one. Re-adding a placement somebody deactivated brings it back,
   * which is what typing it again means.
   */
  async create(input: {
    categoryId: string;
    destinationUrl: string;
    label: string;
    note: string | null;
    partnerName: string;
    position: number;
  }): Promise<boolean> {
    // The Category has to exist and be active: a suggestion under a retired
    // heading is a row nothing will ever read.
    const category = await this.pool.query(
      `select 1 from category where id = $1 and active = true`,
      [input.categoryId]
    );
    if (category.rowCount !== 1) return false;

    await this.pool.query(
      `insert into complementary_placement
         (category_id, label, partner_name, note, destination_url, position)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (category_id, label) do update
         set partner_name = excluded.partner_name,
             note = excluded.note,
             destination_url = excluded.destination_url,
             position = excluded.position,
             active = true,
             updated_at = now()`,
      [
        input.categoryId,
        input.label,
        input.partnerName,
        input.note,
        input.destinationUrl,
        input.position
      ]
    );
    return true;
  }

  /**
   * Taking one off the surfaces, without deleting it.
   *
   * Deactivated rather than removed: a placement is a partner relationship
   * somebody agreed to, and a row that can be switched back on is how "we
   * paused this" is said. It also keeps the label from being retyped slightly
   * differently when it returns.
   */
  async deactivate(placementId: string): Promise<boolean> {
    const done = await this.pool.query(
      `update complementary_placement
       set active = false, updated_at = now()
       where id = $1 and active = true`,
      [placementId]
    );
    return done.rowCount === 1;
  }
}
