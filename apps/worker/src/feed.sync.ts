import { randomUUID } from "node:crypto";

import { PROJECT_OFFERING } from "@commerce/database";
import {
  composePublicEligibility,
  type OfferingLifecycle
} from "@commerce/offering";
import {
  FeedFormatError,
  isRejection,
  mapRecord,
  readFeed,
  type FeedCandidate,
  type FeedFormat,
  type FeedMapping,
  type FeedRejection
} from "@commerce/feed";
import type { Pool, PoolClient } from "pg";

/**
 * The feed intake (I76).
 *
 * The Owner asked for partner catalogues to arrive **as an affiliate feed
 * rather than as scraping**, on a schedule, with the failures visible on the
 * dashboard. `PRD-0001-offering.md` §5.11 already governs what an intake may
 * do — create and update Offerings whose Source is Feed, **and modify no
 * other** — and §135 leaves the mechanism to its own documents, of which this
 * is one.
 *
 * ## Three rules, and each one is a way this goes wrong
 *
 * **A run is all or nothing at the document.** A document that does not parse
 * imports nothing. Importing the part that read would lose the half after the
 * broken tag, and a missing product is indistinguishable from a withdrawn one —
 * so the platform would quietly stop showing it and nobody could tell which.
 *
 * **A run is per-product from there on.** One row with an unreadable price is
 * that row's problem; refusing the other four thousand because of it would let
 * a partner's typo take their catalogue down. Every refusal is recorded with a
 * reason, because a run reporting "412 rejected" and not why is a run nobody
 * can fix.
 *
 * **The intake can only reach what it created.** Not by checking `source`
 * before each write — a check like that is forgotten at one call site
 * eventually — but because it finds the Offering to update *through*
 * `offering_feed_item`, and an Offering a Business owner authored has no row
 * there. §5.11.1 is true by construction.
 *
 * ## What it may do, since I88: price and stock, and nothing else
 *
 * The Owner, 2026-09-05: _"feed entegrasyonu bizim titizlikle içeri aktardığımız
 * (import) ve zenginleştirdiğimiz katalogda kafasına göre yeni ilan
 * oluşturmamalı veya bizim kapattığımız ilanları diriltmemeli. Feed'in görevi
 * yalnızca eşleşen ve yayında olan ilanların fiyat ve stok durumunu (price &
 * stock updates) güncellemektir."_
 *
 * So three capabilities were removed rather than configured off:
 *
 * - **it creates nothing.** A product in the document that matches no listing
 *   is counted and skipped. The catalogue is built by the file import, which is
 *   where the Category, the field values, the affiliate address and the
 *   pictures come from — none of which a feed carries.
 * - **it publishes nothing.** The Draft-to-Published transition is gone, so a
 *   listing that is not live cannot become live because a partner's document
 *   mentioned it.
 * - **it writes price and stock only.** Title, summary, Category and Product
 *   Key are curated content; a sync that rewrote them would undo an editor's
 *   work every hour, silently, and the editor would be the last to know.
 *
 * The removals are in the code rather than behind a flag, because a flag is a
 * thing somebody turns on at two in the morning to make a partner's catalogue
 * appear.
 *
 * ## What it deliberately does not do
 *
 * A product that has vanished from the document is **counted and left alone**.
 * Retiring a listing is a lifecycle change, and one truncated response from a
 * partner would otherwise delete a catalogue. `missing_since` records when it
 * was last seen; what to do about it is the Owner's decision, and this file is
 * not the place to take it.
 */

/** How long one document may take to arrive. */
export const FEED_TIMEOUT_MS = 30_000;

/**
 * How large a document may be, in bytes.
 *
 * A limit rather than a prediction. Nothing here streams — the parser wants the
 * whole document, because a partial parse is the failure this intake exists to
 * avoid — so the ceiling is what stops a partner's mistake from being this
 * platform's outage.
 */
export const FEED_MAX_BYTES = 32 * 1024 * 1024;

/**
 * How many refusals one run records.
 *
 * A feed that rejects forty thousand rows has **one** problem, not forty
 * thousand. Storing every one of them would make the run that reports the
 * problem the run that fills the disk, and the fortieth identical reason tells
 * nobody anything the first did not.
 */
export const FEED_REJECTION_SAMPLE = 50;

/**
 * How long a product may be absent from a partner's document before the
 * platform stops publishing it (I77).
 *
 * **Seventy-two hours, decided by the Owner on 2026-09-03.** Three consecutive
 * days, and the reasoning is his: a single API outage or one bad partner sync
 * must not delete a catalogue. Inside the window the listing is marked out of
 * stock, which is true, reversible and costs nobody a journey.
 *
 * The withdrawal at the end of it is drafted and not built — `markMissing`
 * says why, and `PRD-0001` v4.1 is the revision it waits on.
 */
export const FEED_MISSING_TOLERANCE_MS = 72 * 60 * 60 * 1000;

/**
 * Why a run failed, as a value (I91).
 *
 * `US-PLT-F13-001` AC-9 and `PRD-0006` v2.6 §24.2. The message already said
 * what happened; this says what **kind** of thing happened, and the three kinds
 * are three different jobs: the partner's engineer, the partner's publisher,
 * and the Admin who wrote the mapping.
 *
 * `UNCLASSIFIED` is deliberate. An unexpected error filed under one of the
 * three would be a category that lies the first time something new breaks.
 */
export type FeedFailureKind =
  | "DOCUMENT_UNREADABLE"
  | "MAPPING_INCOMPLETE"
  | "SOURCE_UNREACHABLE"
  | "UNCLASSIFIED";

/**
 * Thrown for everything that goes wrong **getting** the document: a refusal, a
 * timeout, a body over the limit, a socket that died.
 *
 * A class rather than a message test, because classifying by reading the words
 * of an error is how a classification silently stops working when somebody
 * rewords one.
 */
export class FeedSourceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "FeedSourceError";
  }
}

/**
 * Thrown for everything that goes wrong **reading** a document that arrived.
 *
 * The parser raises more than one class — a malformed document and a shape the
 * reader cannot find items in are different errors — and classifying by listing
 * them would be a list that goes stale the first time one is added. Everything
 * thrown while reading is re-thrown as this, so the classification depends on
 * *where* it happened rather than on which class the parser chose.
 */
export class FeedDocumentError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "FeedDocumentError";
  }
}

export interface FeedRow {
  businessId: string;
  categoryId: string;
  documentUrl: string;
  format: FeedFormat;
  id: string;
  itemPath: string | null;
  mapping: FeedMapping;
  name: string;
}

export interface FeedRunResult {
  /**
   * Listings created by this run.
   *
   * **Always zero since I88**, and kept because the column and the runs before
   * it are real: a history that dropped the number would make it look as though
   * the intake had never created anything.
   */
  created: number;
  feedId: string;
  message: string | null;
  missing: number;
  outcome: "FAILED" | "SUCCEEDED";
  read: number;
  /**
   * Why it failed, where it failed (I91). `null` on a run that succeeded — the
   * two are one fact and must not be able to disagree.
   */
  failureKind: FeedFailureKind | null;
  /** Products that came back and were published again (I78). */
  restored: number;
  rejected: number;
  /**
   * Products the document offered that this run did not act on (I88).
   *
   * Not a failure and not a rejection: a partner's document lists their whole
   * catalogue and the platform carries a curated part of it, so a healthy run
   * skips most of what it reads. Counted separately for exactly that reason —
   * folded into `rejected` it would make every run look broken, and the row
   * with the unreadable price would be lost in four thousand ordinary ones.
   */
  skipped: number;
  updated: number;
  /** Products withdrawn at the end of the Owner's 72-hour tolerance (I78). */
  withdrawn: number;
}

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

interface Logger {
  error: (fields: Record<string, unknown>, message: string) => void;
  info: (fields: Record<string, unknown>, message: string) => void;
}

/** The columns a feed row is read from, in one place so the two readers agree. */
const FEED_COLUMNS = `f.id, f.business_id as "businessId", f.category_id as "categoryId",
   f.name, f.document_url as "documentUrl", f.format::text as format,
   f.item_path as "itemPath",
   f.map_external_id as "mapExternalId", f.map_title as "mapTitle",
   f.map_summary as "mapSummary", f.map_price as "mapPrice",
   f.map_prior_price as "mapPriorPrice", f.map_delivery_cost as "mapDeliveryCost",
   f.map_currency as "mapCurrency", f.map_stock as "mapStock",
   f.map_url as "mapUrl", f.map_image_url as "mapImageUrl",
   f.map_product_key as "mapProductKey", f.map_category_key as "mapCategoryKey"`;

interface FeedColumns {
  businessId: string;
  categoryId: string;
  documentUrl: string;
  format: string;
  id: string;
  itemPath: string | null;
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
}

/** Only the mapped fields that were actually named; the rest stay absent. */
const named = (row: FeedColumns): FeedMapping => {
  const mapping: Record<string, string> = {
    externalId: row.mapExternalId,
    title: row.mapTitle
  };
  const optional: [string, string | null][] = [
    ["categoryKey", row.mapCategoryKey],
    ["currency", row.mapCurrency],
    ["deliveryCost", row.mapDeliveryCost],
    ["imageUrl", row.mapImageUrl],
    ["price", row.mapPrice],
    ["priorPrice", row.mapPriorPrice],
    ["productKey", row.mapProductKey],
    ["stock", row.mapStock],
    ["summary", row.mapSummary],
    ["url", row.mapUrl]
  ];
  for (const [key, value] of optional)
    if (value !== null && value !== "") mapping[key] = value;
  return mapping as unknown as FeedMapping;
};

const toRow = (row: FeedColumns): FeedRow => ({
  businessId: row.businessId,
  categoryId: row.categoryId,
  documentUrl: row.documentUrl,
  format: row.format === "JSON" ? "JSON" : "XML",
  id: row.id,
  itemPath: row.itemPath,
  mapping: named(row),
  name: row.name
});

/**
 * A slug for an Offering nobody will type.
 *
 * Derived from the feed and the partner's own identifier, so it is **stable
 * across syncs**: the address a person bookmarked survives a title correction
 * at the partner's end, which is the whole promise the address makes. The
 * listing number (I67) is the name a person actually uses.
 */
export function feedSlug(feedId: string, externalId: string): string {
  const cleaned = externalId
    .toLocaleLowerCase("tr")
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "")
    .slice(0, 80);
  return `f${feedId.slice(0, 8)}-${cleaned === "" ? "x" : cleaned}`;
}

export class FeedSyncer {
  private readonly fetcher: Fetcher;
  private readonly logger: Logger | undefined;
  private readonly pool: Pool;

  constructor(input: { fetch?: Fetcher; logger?: Logger; pool: Pool }) {
    this.fetcher = input.fetch ?? ((url, init) => fetch(url, init));
    this.logger = input.logger;
    this.pool = input.pool;
  }

  /** Every active feed, oldest run first so nothing starves. */
  async due(): Promise<FeedRow[]> {
    const found = await this.pool.query<FeedColumns>(
      `select ${FEED_COLUMNS}
       from offering_feed f
       where f.active = true
       order by (
         select max(r.started_at) from offering_feed_run r where r.feed_id = f.id
       ) asc nulls first, f.created_at asc`
    );
    return found.rows.map(toRow);
  }

  async read(feedId: string): Promise<FeedRow | null> {
    const found = await this.pool.query<FeedColumns>(
      `select ${FEED_COLUMNS} from offering_feed f where f.id = $1`,
      [feedId]
    );
    const row = found.rows[0];
    return row === undefined ? null : toRow(row);
  }

  /** Syncs every active feed. One feed's failure never stops the next. */
  async syncAll(): Promise<FeedRunResult[]> {
    const results: FeedRunResult[] = [];
    for (const feed of await this.due()) {
      try {
        results.push(await this.sync(feed));
      } catch (error) {
        // A feed that failed outside its own error handling — a database
        // failure, most likely. Logged and stepped over: one partner's problem
        // is not every partner's.
        this.logger?.error(
          { err: error, feedId: feed.id },
          "feed_sync_crashed"
        );
      }
    }
    return results;
  }

  /**
   * Fetches one document.
   *
   * Separate from the import so the failure it produces is named as a fetch
   * failure. "The partner's server answered 503" and "the mapping is wrong" are
   * two different jobs for two different people, and a log that blurred them
   * would send both to the wrong one.
   */
  private async fetchDocument(feed: FeedRow): Promise<string> {
    const abort = new AbortController();
    const expiry = setTimeout(() => abort.abort(), FEED_TIMEOUT_MS);
    try {
      const response = await this.fetcher(feed.documentUrl, {
        headers: { accept: "application/xml, application/json, text/xml, */*" },
        signal: abort.signal
      });
      if (!response.ok)
        throw new FeedSourceError(
          `The partner's server answered ${response.status} for ${feed.documentUrl}`
        );

      const declared = Number(response.headers.get("content-length") ?? "0");
      if (Number.isFinite(declared) && declared > FEED_MAX_BYTES)
        throw new FeedSourceError(
          `The document is ${declared} bytes, over the ${FEED_MAX_BYTES}-byte limit`
        );

      const body = await response.text();
      if (body.length > FEED_MAX_BYTES)
        throw new FeedSourceError(
          `The document is ${body.length} bytes, over the ${FEED_MAX_BYTES}-byte limit`
        );
      return body;
    } catch (error) {
      if (abort.signal.aborted)
        throw new FeedSourceError(
          `The partner's server did not answer within ${FEED_TIMEOUT_MS}ms`,
          // The abort is the symptom; what the runtime threw is the cause, and
          // a log that kept only the sentence would lose the reason.
          { cause: error }
        );
      /*
       * Everything reaching here failed while **getting** the document — a
       * refused connection, a socket that died, a DNS failure — so it is the
       * source's kind whatever the runtime called it. Re-thrown as one class so
       * that the classification in `sync` reads a type rather than a sentence.
       */
      throw error instanceof FeedSourceError
        ? error
        : new FeedSourceError(
            error instanceof Error
              ? error.message
              : "The document could not be fetched",
            { cause: error }
          );
    } finally {
      clearTimeout(expiry);
    }
  }

  /**
   * One feed, end to end.
   *
   * Every failure lands in the run row rather than propagating, because the run
   * row is what the Owner asked to see. A sync that threw would leave the
   * dashboard showing the last successful run for ever, which is the shape of
   * outage that goes unnoticed longest.
   */
  async sync(feed: FeedRow): Promise<FeedRunResult> {
    const started = new Date();
    const rejections: FeedRejection[] = [];
    let read = 0;
    let updated = 0;
    let restored = 0;
    let skipped = 0;

    try {
      const body = await this.fetchDocument(feed);
      let records;
      try {
        records = readFeed({
          body,
          format: feed.format,
          ...(feed.itemPath === null || feed.itemPath === ""
            ? {}
            : { itemPath: feed.itemPath })
        });
      } catch (error) {
        throw new FeedDocumentError(
          error instanceof Error
            ? error.message
            : "The document could not be read",
          { cause: error }
        );
      }
      read = records.length;

      const seen = new Set<string>();
      for (const record of records) {
        const mapped = mapRecord(record, feed.mapping);
        if (isRejection(mapped)) {
          rejections.push(mapped);
          continue;
        }
        // A document that lists one product twice is a partner's mistake, and
        // taking the first is the reading that does not overwrite a price with
        // an older copy of itself.
        if (seen.has(mapped.externalId)) {
          rejections.push({
            externalId: mapped.externalId,
            reason: "The document lists this identifier more than once"
          });
          continue;
        }
        seen.add(mapped.externalId);

        /*
         * A price with no currency is a price nobody can compare, and the
         * database refuses one — `offering_fixed_price_is_complete`. Caught
         * here so the Admin reads "the currency field is not mapped" rather
         * than a constraint name, which is the difference between a fix and a
         * support request.
         */
        if (mapped.amount !== null && mapped.currency === null) {
          rejections.push({
            externalId: mapped.externalId,
            reason:
              "A price was read but no currency was — map the currency field, or the price cannot be compared"
          });
          continue;
        }

        try {
          const outcome = await this.write(feed, mapped);
          if (outcome === "UPDATED") updated += 1;
          else skipped += 1;
          /*
           * Only a listing this run actually maintained comes back from a
           * withdrawal. A skipped product has told the platform nothing it may
           * act on — and putting a listing back into Search on the strength of
           * a document that matches nothing is the "resurrection" the Owner
           * ruled out.
           */
          if (
            outcome === "UPDATED" &&
            (await this.restore(feed.id, mapped.externalId))
          )
            restored += 1;
        } catch (error) {
          rejections.push({
            externalId: mapped.externalId,
            reason:
              error instanceof Error
                ? error.message.slice(0, 400)
                : "Could not be written"
          });
        }
      }

      const missing = await this.markMissing(feed.id, [...seen]);
      // Only after a run that read the whole document. A failed run learns
      // nothing about availability, and PRD-0001 §5.11.1a forbids recording
      // absence on the strength of a reading that did not complete — this is
      // inside the success branch for exactly that reason.
      const withdrawn = await this.withdrawPastTolerance(feed.id);

      /*
       * **A document that yielded nothing usable is a failed run** (I91).
       *
       * The document arrived and parsed, so neither of the other two kinds
       * fits, and the platform read every row and could use none of them:
       * that is a mapping naming fields this document does not carry. Before
       * this, such a run was recorded as SUCCEEDED with N rejections — true in
       * the letter, and it left an Admin reading a green run beside a feed that
       * had never updated anything.
       *
       * Guarded on `read > 0`: an empty document says nothing about the
       * mapping, and calling that a mapping failure would blame the Admin for a
       * partner's empty catalogue.
       */
      const unusable = read > 0 && rejections.length === read;
      const result: FeedRunResult = {
        created: 0,
        failureKind: unusable ? "MAPPING_INCOMPLETE" : null,
        feedId: feed.id,
        message: unusable
          ? `Every one of the ${String(read)} products was refused. The mapping names fields this document does not carry — check the identifier and title fields against the document.`
          : null,
        missing,
        outcome: unusable ? "FAILED" : "SUCCEEDED",
        read,
        rejected: rejections.length,
        restored,
        skipped,
        updated,
        withdrawn
      };
      await this.recordRun(result, started, rejections);
      this.logger?.info({ ...result }, "feed_synced");
      return result;
    } catch (error) {
      /*
       * The whole document failed. Nothing was imported, nothing is marked
       * missing, and the message says why in words somebody can act on — a
       * parse error names what is malformed, a fetch failure names the server's
       * answer.
       */
      const message =
        error instanceof Error
          ? error.message.slice(0, 2000)
          : "The document could not be read";
      /*
       * Classified by **type** rather than by reading the words of the message
       * (I91). A classification that matched on prose stops working the first
       * time somebody rewords an error, and it would do so silently.
       */
      const failureKind: FeedFailureKind =
        error instanceof FeedSourceError
          ? "SOURCE_UNREACHABLE"
          : error instanceof FeedDocumentError ||
              error instanceof FeedFormatError
            ? "DOCUMENT_UNREADABLE"
            : "UNCLASSIFIED";
      const result: FeedRunResult = {
        created: 0,
        failureKind,
        feedId: feed.id,
        message,
        missing: 0,
        outcome: "FAILED",
        read,
        rejected: 0,
        restored: 0,
        skipped: 0,
        updated: 0,
        withdrawn: 0
      };
      await this.recordRun(result, started, []);
      this.logger?.error({ feedId: feed.id, message }, "feed_sync_failed");
      return result;
    }
  }

  /**
   * One product, in one transaction (I88: an update, or nothing at all).
   *
   * The Offering is found **through `offering_feed_item`**, and the link is the
   * whole boundary: an Offering with no row there cannot be named from here, so
   * a Business owner's authoring and an Admin's typed correction are out of
   * reach structurally rather than by a check somebody has to remember.
   *
   * **I89 lets the link be made against a listing the intake did not create**,
   * matched on Product Key within the feed's own Business — the Owner's
   * decision of 2026-09-05, option B of `FEED_MATCHING_OPEN_DECISION.md`. Until
   * then the link could only be written by the creation this increment removed,
   * so a feed pointed at an imported catalogue updated nothing at all. See
   * `link()` for what makes that safe, and `PRD-0001` v4.2 §5.11.1 for the
   * revision that permits it.
   *
   * Two answers other than `UPDATED`, and they mean different things to whoever
   * reads the run:
   *
   * - `UNMATCHED` — the document offers a product this platform does not carry.
   *   Ordinary, and the commonest outcome: a partner's document is their whole
   *   catalogue and the platform carries a curated part of it. **Nothing is
   *   created**, because everything that makes a listing worth having — the
   *   Category, the field values, the affiliate address, the pictures — is
   *   supplied by the file import and absent from a feed.
   * - `NOT_LIVE` — the listing exists and is not Published. Its price is not
   *   touched and it is certainly not published: the Owner's rule names
   *   "eşleşen ve **yayında olan** ilanların" price and stock, and a listing
   *   that an Admin hid or an owner retired must not come back because a
   *   partner's document still lists it.
   *
   * Both still mark the product as seen, because it *was* seen: a matched
   * listing that is not live must not drift into the missing-product tolerance
   * and be withdrawn for an absence that never happened.
   */
  private async write(
    feed: FeedRow,
    candidate: FeedCandidate
  ): Promise<"NOT_LIVE" | "UNMATCHED" | "UPDATED"> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      /*
       * The Source filter is gone with I89, and the link takes its place. It
       * was never the real boundary — the link was — and keeping it would have
       * meant the intake could maintain only listings created by the intake,
       * which is exactly the capability the previous increment removed.
       */
      const existing = await client.query<{
        offeringId: string;
        status: string;
      }>(
        `select i.offering_id as "offeringId", o.status::text as status
         from offering_feed_item i
         join offering o on o.id = i.offering_id
         where i.feed_id = $1 and i.external_id = $2
         for update of i`,
        [feed.id, candidate.externalId]
      );
      let found = existing.rows[0];
      if (found === undefined) {
        found = await this.link(client, feed, candidate);
        if (found === undefined) {
          await client.query("commit");
          return "UNMATCHED";
        }
      }

      await client.query(
        `update offering_feed_item
         set last_seen_at = now(), missing_since = null
         where feed_id = $1 and external_id = $2`,
        [feed.id, candidate.externalId]
      );

      if (found.status !== "PUBLISHED") {
        await client.query("commit");
        return "NOT_LIVE";
      }

      await this.update(client, found.offeringId, candidate);
      await this.reproject(client, found.offeringId);

      await client.query(
        `insert into audit_record
           (actor_user_id, effective_business_id, action, target_type, target_id,
            result, correlation_id, safe_metadata)
         values (null,$1,'offering.feed.update','Offering',$2,'ALLOWED',$3,$4::jsonb)`,
        [
          feed.businessId,
          found.offeringId,
          randomUUID(),
          JSON.stringify({ externalId: candidate.externalId, feedId: feed.id })
        ]
      );

      await client.query("commit");
      return "UPDATED";
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Matching a document row to a listing the platform already carries (I89).
   *
   * The Owner chose this on 2026-09-05, from the three options in
   * `FEED_MATCHING_OPEN_DECISION.md`: **the Product Key, within the feed's own
   * Business.** It is already in both worlds — a column on `offering`, a mapped
   * field in a feed, a column in `offerings.csv` — so an operator who filled it
   * in for comparison has already done the work, and no schema changed.
   *
   * Everything here is a refusal except the one case that is certain:
   *
   * - **no Product Key on the row** — nothing to match on. A feed may map the
   *   field or not; where it does not, the intake simply never links anything.
   * - **more than one listing with that key in this Business** — ambiguous, and
   *   a guess would attach a partner's price to the wrong listing, which is the
   *   one failure here nobody would notice. Reported as a rejection rather than
   *   a skip, because it is a data problem somebody can fix.
   * - **the listing is not Published** — a link is made against a live listing
   *   only. A Draft somebody is still writing, or something an Admin hid, is
   *   not matched into an automated price feed by a coincidence of keys.
   * - **the listing is already linked** — `offering_feed_item.offering_id` is
   *   unique, so this is enforced by the database as well as asked here. One
   *   listing, one intake: two feeds bidding on one price would leave whichever
   *   ran last in charge, silently.
   *
   * The link is written **once** and is the match from then on. That matters
   * more than it looks: a partner who renames a product or re-keys their
   * catalogue keeps their price updates, because the identifier the intake uses
   * afterwards is its own.
   */
  private async link(
    client: PoolClient,
    feed: FeedRow,
    candidate: FeedCandidate
  ): Promise<{ offeringId: string; status: string } | undefined> {
    const key = (candidate.productKey ?? "").trim();
    if (key === "") return undefined;

    const matches = await client.query<{ id: string; status: string }>(
      `select o.id, o.status::text as status
       from offering o
       where o.business_id = $1 and o.product_key = $2
         and o.status = 'PUBLISHED'
         and not exists (
           select 1 from offering_feed_item i where i.offering_id = o.id
         )
       limit 2`,
      [feed.businessId, key]
    );
    if (matches.rows.length !== 1) {
      if (matches.rows.length > 1)
        throw new Error(
          `Product Key "${key}" matches more than one published listing of this partner — ` +
            `the intake will not guess which one the price belongs to`
        );
      return undefined;
    }

    const match = matches.rows[0];
    if (match === undefined) return undefined;
    await client.query(
      `insert into offering_feed_item (feed_id, external_id, offering_id)
       values ($1,$2,$3)`,
      [feed.id, candidate.externalId, match.id]
    );
    /*
     * Recorded as its own action rather than folded into the update: a link is
     * the moment a partner's document gained the ability to change a price on
     * this listing, and that is worth being able to find later.
     */
    await client.query(
      `insert into audit_record
         (actor_user_id, effective_business_id, action, target_type, target_id,
          result, correlation_id, safe_metadata)
       values (null,$1,'offering.feed.link','Offering',$2,'ALLOWED',$3,$4::jsonb)`,
      [
        feed.businessId,
        match.id,
        randomUUID(),
        JSON.stringify({
          externalId: candidate.externalId,
          feedId: feed.id,
          productKey: key
        })
      ]
    );
    return { offeringId: match.id, status: match.status };
  }

  /**
   * An Offering the intake already owns: its price and its stock (I88).
   *
   * **The column list is the rule.** Title, summary, Category and Product Key
   * used to be written here and are not any more — the Owner scoped the feed to
   * _"fiyat ve stok durumunu (price & stock updates)"_, and a sync that rewrote
   * curated content would undo an editor's work every hour with nobody to
   * notice. The slug and the listing number were never written for the same
   * reason in a different form: both are names a person may have written down.
   *
   * Expressed as a narrower `set` clause rather than as a check before the
   * write, because a check is a thing somebody removes while fixing something
   * else, and a column that is not in the statement cannot be written by
   * accident.
   *
   * **An absent field is not an empty one.** A document that states no price
   * leaves the price alone, where before I88 it made the listing's pricing
   * `UNKNOWN`. The reason is the new shape of the catalogue: the price came
   * from the file import and is real, and a partner's feed that simply does not
   * carry a price field must not erase it. The cost is named: a discount the
   * partner has ended cannot be cleared by omitting it, and needs the file or
   * an editor.
   */
  private async update(
    client: PoolClient,
    offeringId: string,
    candidate: FeedCandidate
  ): Promise<void> {
    await client.query(
      `update offering
       set pricing_kind = case when $2::numeric is null
             then pricing_kind else 'FIXED'::"PricingKind" end,
           amount = coalesce($2::numeric, amount),
           currency = case when $2::numeric is null then currency else $3 end,
           /*
            * Amount Set At moves only when the amount does. PRD-0001 makes it
            * the moment the price was stated, and an hourly sync that touched it
            * every hour would make every price look freshly confirmed while
            * nothing had changed.
            */
           amount_set_at = case
             when $2::numeric is null then amount_set_at
             when amount is distinct from $2::numeric then now()
             else amount_set_at end,
           prior_amount = coalesce($4::numeric, prior_amount),
           delivery_cost = coalesce($5::numeric, delivery_cost),
           /*
            * UNKNOWN (no backticks: this comment is inside a SQL template
            * literal) is what an unmapped or unreadable stock field becomes,
            * so it is treated as **no statement** rather than as a claim: an
            * imported listing that is in stock must not be marked unknown every
            * hour because a partner's document has no stock field.
            */
           stock_state = case when $6::"StockState" = 'UNKNOWN'
             then stock_state else $6::"StockState" end,
           version = version + 1,
           updated_at = now()
       where id = $1`,
      [
        offeringId,
        candidate.amount,
        candidate.amount === null ? null : candidate.currency,
        candidate.priorAmount,
        candidate.deliveryCost,
        candidate.stockState
      ]
    );
  }

  /**
   * Keeps the public copy in step with the price that just changed (I88).
   *
   * **It no longer publishes anything.** Until I88 this method carried the
   * Draft-to-Published transition, and that is the capability the Owner
   * removed: a listing goes live through the file import and an editor, never
   * because a partner's document mentioned it.
   *
   * What remains is necessary and is not a lifecycle change: the projection is
   * the public gate, it holds a copy of the price, and a price updated in
   * `offering` without one updated here is a listing that shows yesterday's
   * figure on every surface a visitor uses. Eligibility is composed rather than
   * assumed, so a Restricted Business or a withdrawn intake keeps the listing
   * out of Search exactly as it did before.
   */
  private async reproject(
    client: PoolClient,
    offeringId: string
  ): Promise<void> {
    /*
     * Two facts and no more. The publication minimum and the Category's shape
     * used to be read here to decide whether to publish; nothing publishes now,
     * so reading them would be asking questions whose answers are not used —
     * which is how a query grows a condition somebody later believes in.
     */
    const state = await client.query<{
      intakeAvailable: boolean;
      publicExposure: string;
      status: string;
    }>(
      `select o.status::text as status, o.intake_available as "intakeAvailable",
         b.public_exposure::text as "publicExposure"
       from offering o
       join business b on b.id = o.business_id
       where o.id = $1`,
      [offeringId]
    );
    const current = state.rows[0];
    if (current === undefined) return;

    /*
     * Published or nothing. A Draft is not made live here any more, and Hidden
     * and Archived were never reachable from an intake: those are decisions,
     * and §5.11.2 is explicit that Source confers no authority. The caller has
     * already refused a listing that is not live, so this is the second lock on
     * the same door — deliberately, because it is the door the Owner named.
     */
    if (current.status !== "PUBLISHED") return;

    /*
     * The third input counts here too (I78 §7.2). A withdrawn listing whose
     * price the document still carries must not be put back into Search by a
     * price update: `restore` is the one thing that reverses a withdrawal, and
     * it runs on its own evidence.
     */
    const eligible =
      current.publicExposure === "ELIGIBLE" && current.intakeAvailable;
    const version = await client.query<{ version: number }>(
      `insert into offering_publication
         (offering_id, status, eligibility_version, reason_code)
       values ($1, $2::"PublicationStatus",
         coalesce((select max(eligibility_version) + 1
                   from offering_publication where offering_id = $1), 1), $3)
       returning eligibility_version as version`,
      [
        offeringId,
        eligible ? "ELIGIBLE" : "INELIGIBLE",
        eligible
          ? null
          : current.intakeAvailable
            ? "BUSINESS_NOT_PUBLICLY_ELIGIBLE"
            : "INTAKE_UNAVAILABLE"
      ]
    );

    if (eligible)
      await client.query(PROJECT_OFFERING, [
        offeringId,
        version.rows[0]?.version ?? 1
      ]);
    else
      await client.query(
        `delete from offering_search_projection where offering_id = $1`,
        [offeringId]
      );
  }

  /**
   * What the document no longer offers, and what happens to it (I77).
   *
   * **The Owner's rule, decided on 2026-09-03:** _"Ürün feed'den düştüğünde
   * derhal emekliye ayrılmasın. Bunun yerine 3 ardışık gün (72 saat) boyunca
   * 'stokta yok' durumuna çekilsin. Bu tolerans süresinin sonunda hala feed'de
   * yoksa, sistem ürünü otomatik olarak yayından kaldırsın."_
   *
   * His reason is the one that shapes this: a single API outage or one bad
   * partner sync must not delete a catalogue.
   *
   * ## The first half is implemented here. The second half is not, yet.
   *
   * **Out of stock, immediately.** A partner who stopped listing a product has
   * told the platform something true about availability, and saying it is a
   * plain update — §5.11.1 already permits it, it is reversible, and it stops a
   * person being sent to a shop for something that is gone. It is applied to
   * the *listing*, and only to a listing this intake created.
   *
   * **Withdrawal after 72 hours** is `withdrawPastTolerance`, and it reaches
   * neither lifecycle state, because neither could carry it:
   *
   * | | why not |
   * | --- | --- |
   * | `Archived` | PRD-0001 §6.5: no transition exists out of it. A three-day partner outage would permanently destroy their catalogue — the exact outcome the tolerance exists to prevent. |
   * | `Hidden` | §7.2 makes it the outcome of an Admin's Hide action, and FR-15 lets only an Admin restore it. An intake hiding four thousand listings would leave an Admin restoring them by hand. |
   *
   * PRD-0001 **v4.1 §7.2** added a third final-eligibility input for it, on the
   * model §7.3 already used for a Business restriction: publicly ineligible
   * without touching the lifecycle, and reversible by the intake that set it.
   */
  private async markMissing(feedId: string, seen: string[]): Promise<number> {
    await this.pool.query(
      `update offering_feed_item
       set missing_since = coalesce(missing_since, now())
       where feed_id = $1 and not (external_id = any($2::text[]))`,
      [feedId, seen]
    );

    /*
     * Every listing this feed holds that the document no longer offers is out
     * of stock. Written every run rather than once on the transition, because
     * a partner's own feed may have said `IN_STOCK` in the run before it
     * vanished and the two facts arrive in that order.
     *
     * The `source = 'FEED'` guard that used to sit beside the join is gone with
     * I89: under the Owner's decision the listings an intake maintains are
     * imported ones, whose Source is not Feed. The join is the boundary and
     * always was — a listing with no link cannot be reached from here — and
     * `offering_feed_item.offering_id` is unique, so it can be reached by one
     * intake only.
     */
    await this.pool.query(
      `update offering o
       set stock_state = 'OUT_OF_STOCK', updated_at = now()
       from offering_feed_item i
       where i.offering_id = o.id
         and i.feed_id = $1
         and i.missing_since is not null
         and o.stock_state <> 'OUT_OF_STOCK'`,
      [feedId]
    );

    const total = await this.pool.query<{ count: string }>(
      `select count(*) as count from offering_feed_item
       where feed_id = $1 and missing_since is not null`,
      [feedId]
    );
    return Number(total.rows[0]?.count ?? "0");
  }

  /**
   * Withdraws what has been absent longer than the Owner's tolerance (I78).
   *
   * **The rule, in his words:** _"Bu tolerans süresinin sonunda hala feed'de
   * yoksa, sistem ürünü otomatik olarak yayından kaldırsın."_ Seventy-two
   * hours, and the reason for the wait is his too: one API outage or one bad
   * sync must not delete a catalogue.
   *
   * Three things happen and none of them is a lifecycle change:
   *
   * - `intake_available` becomes false, which is PRD-0001 v4.1 §7.2's third
   *   input and makes final eligibility `Ineligible`;
   * - an `offering_publication` row records the new result with its reason, so
   *   the eligibility history says *why* rather than only *that*;
   * - the Discovery projection is removed, which is what actually takes the
   *   listing out of Search, Compare and every other public surface — the
   *   projection's existence **is** the public gate.
   *
   * The lifecycle state is untouched: the listing is still Published, and the
   * moment the partner offers it again `restore` puts it back with no Admin
   * involved.
   */
  private async withdrawPastTolerance(feedId: string): Promise<number> {
    const due = await this.pool.query<{ offeringId: string }>(
      `select i.offering_id as "offeringId"
       from offering_feed_item i
       join offering o on o.id = i.offering_id
       where i.feed_id = $1
         and i.missing_since is not null
         and i.missing_since <= now() - ($2::double precision * interval '1 millisecond')
         and i.withdrawn_at is null
         and o.intake_available = true`,
      [feedId, FEED_MISSING_TOLERANCE_MS]
    );

    for (const row of due.rows)
      await this.setAvailability(row.offeringId, false);

    if (due.rows.length > 0)
      await this.pool.query(
        `update offering_feed_item set withdrawn_at = now()
         where feed_id = $1 and offering_id = any($2::uuid[])`,
        [feedId, due.rows.map((row) => row.offeringId)]
      );

    return due.rows.length;
  }

  /**
   * Puts back a product the source offers again (I78).
   *
   * Called for every product the document holds, and answers `false` for the
   * overwhelming majority: a listing that was never withdrawn has nothing to
   * restore. **Reversible without an Admin** is the property that made a third
   * eligibility input the right mechanism rather than `Hidden`, and this is
   * where that property is spent.
   */
  private async restore(feedId: string, externalId: string): Promise<boolean> {
    const withdrawn = await this.pool.query<{ offeringId: string }>(
      `update offering_feed_item
       set withdrawn_at = null
       where feed_id = $1 and external_id = $2 and withdrawn_at is not null
       returning offering_id as "offeringId"`,
      [feedId, externalId]
    );
    const offeringId = withdrawn.rows[0]?.offeringId;
    if (offeringId === undefined) return false;

    await this.setAvailability(offeringId, true);
    return true;
  }

  /**
   * Sets the third eligibility input and re-evaluates what follows from it.
   *
   * One transaction, because the three writes are one fact: a projection that
   * survived a failed publication row would keep a withdrawn listing in Search,
   * and that is the failure this whole increment exists to prevent.
   *
   * The result is **composed rather than assumed** — `composePublicEligibility`
   * is the single owner of the answer (§7.1), and a listing whose Business is
   * restricted stays ineligible for that reason when its intake makes it
   * available again.
   */
  private async setAvailability(
    offeringId: string,
    available: boolean
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      /*
       * No Source filter (I89). The caller reached this Offering through an
       * intake link, which is the boundary `PRD-0001` v4.2 §5.11.1a rests on;
       * filtering on Source as well would silently do nothing for exactly the
       * imported listings this now exists to maintain.
       */
      await client.query(
        `update offering set intake_available = $2, updated_at = now()
         where id = $1`,
        [offeringId, available]
      );

      const state = await client.query<{
        intakeAvailable: boolean;
        publicExposure: string;
        status: OfferingLifecycle;
      }>(
        `select o.status::text as status, o.intake_available as "intakeAvailable",
           b.public_exposure::text as "publicExposure"
         from offering o join business b on b.id = o.business_id
         where o.id = $1`,
        [offeringId]
      );
      const current = state.rows[0];
      if (current === undefined) {
        await client.query("rollback");
        return;
      }

      const eligibility = composePublicEligibility({
        businessExposure:
          current.publicExposure === "ELIGIBLE" ? "ELIGIBLE" : "INELIGIBLE",
        intakeAvailability: current.intakeAvailable
          ? "AVAILABLE"
          : "UNAVAILABLE",
        lifecycle: current.status
      });

      const version = await client.query<{ version: number }>(
        `insert into offering_publication
           (offering_id, status, eligibility_version, reason_code)
         values ($1, $2::"PublicationStatus",
           coalesce((select max(eligibility_version) + 1
                     from offering_publication where offering_id = $1), 1), $3)
         returning eligibility_version as version`,
        [offeringId, eligibility.status, eligibility.reason]
      );

      if (eligibility.status === "ELIGIBLE")
        await client.query(PROJECT_OFFERING, [
          offeringId,
          version.rows[0]?.version ?? 1
        ]);
      else
        await client.query(
          `delete from offering_search_projection where offering_id = $1`,
          [offeringId]
        );

      await client.query(
        `insert into audit_record
           (actor_user_id, effective_business_id, action, target_type, target_id,
            result, correlation_id)
         select null, o.business_id, $2, 'Offering', o.id, 'ALLOWED', $3
         from offering o where o.id = $1`,
        [
          offeringId,
          available ? "offering.feed.restore" : "offering.feed.withdraw",
          randomUUID()
        ]
      );

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * How many listings are past the tolerance and still published.
   *
   * Zero in a healthy platform, because `withdrawPastTolerance` runs on every
   * successful sync. A non-zero answer means a feed has stopped running — the
   * listings are stale *and* nothing is withdrawing them — which is a different
   * fault from a feed that is failing loudly.
   */
  async pastTolerance(feedId?: string): Promise<number> {
    const found = await this.pool.query<{ count: string }>(
      `select count(*) as count
       from offering_feed_item i
       join offering o on o.id = i.offering_id
       where i.missing_since is not null
         and i.missing_since <= now() - ($1::double precision * interval '1 millisecond')
         and o.intake_available = true
         and o.status = 'PUBLISHED'
         and ($2::uuid is null or i.feed_id = $2::uuid)`,
      [FEED_MISSING_TOLERANCE_MS, feedId ?? null]
    );
    return Number(found.rows[0]?.count ?? "0");
  }

  /** The run, and a bounded sample of what it refused. */
  private async recordRun(
    result: FeedRunResult,
    started: Date,
    rejections: FeedRejection[]
  ): Promise<void> {
    const run = await this.pool.query<{ id: string }>(
      `insert into offering_feed_run
         (feed_id, outcome, started_at, finished_at, read_count, created_count,
          updated_count, rejected_count, missing_count, withdrawn_count,
          restored_count, skipped_count, message, failure_kind)
       values ($1,$2::"OfferingFeedRunOutcome",$3,now(),$4,$5,$6,$7,$8,$9,$10,$11,$12,
         $13::"OfferingFeedFailureKind")
       returning id`,
      [
        result.feedId,
        result.outcome,
        started,
        result.read,
        result.created,
        result.updated,
        result.rejected,
        result.missing,
        result.withdrawn,
        result.restored,
        result.skipped,
        result.message,
        result.failureKind
      ]
    );
    const runId = run.rows[0]?.id;
    if (runId === undefined || rejections.length === 0) return;

    for (const rejection of rejections.slice(0, FEED_REJECTION_SAMPLE))
      await this.pool.query(
        `insert into offering_feed_rejection (run_id, external_id, reason)
         values ($1,$2,$3)`,
        [runId, rejection.externalId, rejection.reason.slice(0, 400)]
      );
  }
}
