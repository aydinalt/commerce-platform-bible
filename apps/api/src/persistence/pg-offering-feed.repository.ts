import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import type {
  AdminOfferingFeedResponse,
  CreateOfferingFeedInput,
  OfferingFeedRunResponse
} from "@commerce/contracts";

/**
 * The partner catalogues an Admin manages, and how they last went (I76).
 *
 * **This repository configures and reports. It does not import.** The intake
 * runs in the worker, on a schedule, because reading a partner's document is
 * minutes of work against somebody else's server and an Admin request is not
 * the place for it. What an Admin does here is say which document to read and
 * how to read it, and then look at what happened.
 *
 * The run log is the surface the Owner asked for — _"Feed senkronizasyon
 * hataları"_ on the dashboard — and a failed run is the point of it rather than
 * an exception to it: a log that recorded only successes would answer "when did
 * this last work" and never "why did it stop".
 */
@Injectable()
export class PgOfferingFeedRepository {
  constructor(private readonly pool: Pool) {}

  /*
   * One run, shaped for the two readers that want it: the feed list wants the
   * newest per feed, the dashboard wants the newest failures across all of
   * them. Written once so the two cannot disagree about what a run is.
   */
  private static readonly RUN_COLUMNS = `r.id as "runId", r.feed_id as "feedId",
     f.name as "feedName", r.outcome::text as outcome,
     r.started_at as "startedAt", r.finished_at as "finishedAt",
     r.read_count as read, r.created_count as created,
     r.updated_count as updated, r.rejected_count as rejected,
     r.missing_count as missing, r.withdrawn_count as withdrawn,
     r.restored_count as restored, r.skipped_count as skipped, r.message,
     r.failure_kind::text as "failureKind"`;

  private async withRejections(
    rows: (Omit<
      OfferingFeedRunResponse,
      "finishedAt" | "rejections" | "startedAt"
    > & { finishedAt: Date; startedAt: Date })[]
  ): Promise<OfferingFeedRunResponse[]> {
    if (rows.length === 0) return [];
    const found = await this.pool.query<{
      externalId: string | null;
      reason: string;
      runId: string;
    }>(
      `select run_id as "runId", external_id as "externalId", reason
       from offering_feed_rejection
       where run_id = any($1::uuid[])
       order by run_id, id`,
      [rows.map((row) => row.runId)]
    );
    const byRun = new Map<
      string,
      { externalId: string | null; reason: string }[]
    >();
    for (const entry of found.rows) {
      const list = byRun.get(entry.runId);
      const value = { externalId: entry.externalId, reason: entry.reason };
      if (list === undefined) byRun.set(entry.runId, [value]);
      else list.push(value);
    }
    return rows.map((row) => ({
      ...row,
      finishedAt: row.finishedAt.toISOString(),
      rejections: byRun.get(row.runId) ?? [],
      startedAt: row.startedAt.toISOString()
    }));
  }

  /** Every feed, with its most recent run and how many listings it holds. */
  async list(): Promise<AdminOfferingFeedResponse[]> {
    const feeds = await this.pool.query<{
      active: boolean;
      businessId: string;
      businessName: string;
      categoryId: string;
      categoryName: string;
      documentUrl: string;
      feedId: string;
      format: "JSON" | "XML";
      itemPath: string | null;
      listingCount: string;
      mapCategoryKey: string | null;
      mapCurrency: string | null;
      mapDeliveryCost: string | null;
      mapExternalId: string;
      mapImageUrl: string | null;
      mapPrice: string | null;
      mapPriorPrice: string | null;
      mapProductKey: string | null;
      mapStock: string | null;
      mapSummary: string | null;
      mapTitle: string;
      mapUrl: string | null;
      name: string;
    }>(
      `select f.id as "feedId", f.business_id as "businessId", b.name as "businessName",
         f.category_id as "categoryId", c.name as "categoryName",
         f.name, f.document_url as "documentUrl", f.format::text as format,
         f.item_path as "itemPath", f.active,
         f.map_external_id as "mapExternalId", f.map_title as "mapTitle",
         f.map_summary as "mapSummary", f.map_price as "mapPrice",
         f.map_prior_price as "mapPriorPrice",
         f.map_delivery_cost as "mapDeliveryCost",
         f.map_currency as "mapCurrency", f.map_stock as "mapStock",
         f.map_url as "mapUrl", f.map_image_url as "mapImageUrl",
         f.map_product_key as "mapProductKey",
         f.map_category_key as "mapCategoryKey",
         (select count(*) from offering_feed_item i where i.feed_id = f.id)::text
           as "listingCount"
       from offering_feed f
       join business b on b.id = f.business_id
       join category c on c.id = f.category_id
       order by f.active desc, f.name`
    );
    if (feeds.rows.length === 0) return [];

    // The newest run per feed, in one statement rather than one per feed: a
    // list of forty partners must not be forty round trips.
    const latest = await this.pool.query<
      Omit<
        OfferingFeedRunResponse,
        "finishedAt" | "rejections" | "startedAt"
      > & {
        finishedAt: Date;
        startedAt: Date;
      }
    >(
      `select distinct on (r.feed_id) ${PgOfferingFeedRepository.RUN_COLUMNS}
       from offering_feed_run r
       join offering_feed f on f.id = r.feed_id
       order by r.feed_id, r.started_at desc`
    );
    const runs = new Map(
      (await this.withRejections(latest.rows)).map((run) => [run.feedId, run])
    );

    return feeds.rows.map((row) => ({
      active: row.active,
      businessId: row.businessId,
      businessName: row.businessName,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      documentUrl: row.documentUrl,
      feedId: row.feedId,
      format: row.format,
      itemPath: row.itemPath,
      lastRun: runs.get(row.feedId) ?? null,
      listingCount: Number(row.listingCount),
      mapping: {
        categoryKey: row.mapCategoryKey,
        currency: row.mapCurrency,
        deliveryCost: row.mapDeliveryCost,
        externalId: row.mapExternalId,
        imageUrl: row.mapImageUrl,
        price: row.mapPrice,
        priorPrice: row.mapPriorPrice,
        productKey: row.mapProductKey,
        stock: row.mapStock,
        summary: row.mapSummary,
        title: row.mapTitle,
        url: row.mapUrl
      },
      name: row.name
    }));
  }

  /**
   * The most recent runs, newest first, optionally only the failures.
   *
   * Newest first here and **oldest first in the report queue**, and the
   * difference is deliberate: a report queue is work to get through, while this
   * is news — what is broken *now* is the only thing an operator can act on,
   * and a failure from three days ago that has since recovered is not.
   */
  async runs(input: {
    failuresOnly: boolean;
    limit: number;
  }): Promise<OfferingFeedRunResponse[]> {
    const found = await this.pool.query<
      Omit<
        OfferingFeedRunResponse,
        "finishedAt" | "rejections" | "startedAt"
      > & {
        finishedAt: Date;
        startedAt: Date;
      }
    >(
      `select ${PgOfferingFeedRepository.RUN_COLUMNS}
       from offering_feed_run r
       join offering_feed f on f.id = r.feed_id
       where ($1::boolean = false or r.outcome = 'FAILED')
       order by r.started_at desc
       limit $2`,
      [input.failuresOnly, input.limit]
    );
    return this.withRejections(found.rows);
  }

  /**
   * Writing one feed, or correcting the one already under that name.
   *
   * `on conflict` on the Business and the name, because an Admin fixing a wrong
   * address or a mistyped field name is correcting the same arrangement rather
   * than making a second one — and two feeds pointing at one document would
   * import every product twice.
   *
   * **`active = true` on conflict** brings back a feed somebody paused, which is
   * what typing it again means. The `offering_feed_item` rows survive a pause,
   * so resuming updates the listings it already holds rather than creating a
   * second copy of the catalogue.
   */
  async create(
    input: CreateOfferingFeedInput,
    adminUserId: string
  ): Promise<"CATEGORY_NOT_FOUND" | "BUSINESS_NOT_FOUND" | "WRITTEN"> {
    const business = await this.pool.query(
      `select 1 from business where id = $1`,
      [input.businessId]
    );
    if (business.rowCount !== 1) return "BUSINESS_NOT_FOUND";

    // Active, for the same reason a complementary placement's must be: a feed
    // filing products under a retired heading writes rows nothing will read.
    const category = await this.pool.query(
      `select 1 from category where id = $1 and active = true`,
      [input.categoryId]
    );
    if (category.rowCount !== 1) return "CATEGORY_NOT_FOUND";

    const blank = (value: string | null | undefined) =>
      value === undefined || value === null || value === "" ? null : value;

    await this.pool.query(
      `insert into offering_feed
         (business_id, category_id, name, document_url, format, item_path,
          map_external_id, map_title, map_summary, map_price, map_prior_price,
          map_delivery_cost, map_currency, map_stock, map_url, map_image_url,
          map_product_key, map_category_key, created_by)
       values ($1,$2,$3,$4,$5::"OfferingFeedFormat",$6,$7,$8,$9,$10,$11,$12,
               $13,$14,$15,$16,$17,$18,$19)
       on conflict (business_id, name) do update set
         category_id = excluded.category_id,
         document_url = excluded.document_url,
         format = excluded.format,
         item_path = excluded.item_path,
         map_external_id = excluded.map_external_id,
         map_title = excluded.map_title,
         map_summary = excluded.map_summary,
         map_price = excluded.map_price,
         map_prior_price = excluded.map_prior_price,
         map_delivery_cost = excluded.map_delivery_cost,
         map_currency = excluded.map_currency,
         map_stock = excluded.map_stock,
         map_url = excluded.map_url,
         map_image_url = excluded.map_image_url,
         map_product_key = excluded.map_product_key,
         map_category_key = excluded.map_category_key,
         active = true,
         updated_at = now()`,
      [
        input.businessId,
        input.categoryId,
        input.name,
        input.documentUrl,
        input.format,
        input.itemPath,
        input.mapping.externalId,
        input.mapping.title,
        blank(input.mapping.summary),
        blank(input.mapping.price),
        blank(input.mapping.priorPrice),
        blank(input.mapping.deliveryCost),
        blank(input.mapping.currency),
        blank(input.mapping.stock),
        blank(input.mapping.url),
        blank(input.mapping.imageUrl),
        blank(input.mapping.productKey),
        blank(input.mapping.categoryKey),
        adminUserId
      ]
    );
    return "WRITTEN";
  }

  /**
   * Pausing one feed.
   *
   * Deactivated rather than deleted, and the listings it created **stay
   * exactly as they are**. A feed is an arrangement with a partner, and pausing
   * one is a statement about reading their document — not about withdrawing
   * four thousand listings, which would be a moderation decision nobody took.
   */
  async deactivate(feedId: string): Promise<boolean> {
    const done = await this.pool.query(
      `update offering_feed set active = false, updated_at = now()
       where id = $1 and active = true`,
      [feedId]
    );
    return done.rowCount === 1;
  }
}
