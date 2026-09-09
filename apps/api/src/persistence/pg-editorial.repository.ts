import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type {
  EditorialReview,
  EditorialReviewAdmin,
  EditorialSection,
  WriteEditorialDraft
} from "@commerce/contracts";
import {
  IncompleteReviewError,
  InvalidReviewTransitionError,
  ReviewAlreadyExistsError,
  UnknownProductKeyError,
  canTransition,
  missingForPublication,
  type EditorialReviewStatus
} from "@commerce/editorial";

const UNIQUE_VIOLATION = "23505";
const PRODUCT_KEY_CONSTRAINT = "editorial_review_product_key_key";

function violates(error: unknown, code: string, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return candidate.code === code && candidate.constraint === constraint;
}

interface ReviewRow {
  byline: string | null;
  createdAt: Date;
  id: string;
  lastCheckedAt: Date | null;
  productKey: string;
  publishedAt: Date | null;
  /**
   * `numeric` arrives as a string from `pg` and is cast `::text` in the query
   * so that it does so deliberately rather than by driver default. It becomes a
   * number at this boundary and nowhere else, which is the one place worth
   * saying: a score is presented, never summed or multiplied, so the binary
   * representation has no arithmetic to accumulate error through. Money is
   * carried as a decimal string end to end for the opposite reason.
   */
  score: string | null;
  status: EditorialReviewStatus;
  verdict: string | null;
}

interface SectionRow {
  body: string;
  heading: string;
  reviewId: string;
}

interface PointRow {
  kind: "CON" | "PRO";
  reviewId: string;
  text: string;
}

/**
 * The editorial review, read and written (I93).
 *
 * **One repository for both Features, which is the shape the Owner asked for.**
 * `EDT F01` reads and `EDT F02` writes, and they are here together because a
 * read model built without knowing what writing constrains gets refactored the
 * day writing arrives — his second reason for commissioning them as one sealed
 * architecture. The public read and the writer's read run the same query with
 * one predicate different, so the two surfaces cannot come to disagree about
 * what a review is.
 *
 * **Nothing in this file can move `last_checked_at` except `recheck`.** That is
 * `US-EDT-F02-001` AC-9 held at the last layer that could break it: the column
 * is not named `updated_at`, the save statement does not list it, and the
 * contract that reaches `save` has no field for it. Three defences, because the
 * failure is silent — a review would keep presenting a fresh re-check date that
 * nobody had earned.
 */
@Injectable()
export class PgEditorialRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * The review a reader sees, or `null` where the product has none.
   *
   * `null` means **absent**. An outage is a thrown error and must stay one:
   * `UX-0003` **Frozen v1.2** §8.9.2 is explicit that _"an outage is not
   * entitled to make the claim 'there is no review'"_, so nothing here catches
   * a database failure and answers it with the empty case.
   */
  async published(productKey: string): Promise<EditorialReview | null> {
    const review = await this.load(productKey, "PUBLISHED");
    if (review === null) return null;
    // A published row cannot lack these — the database's
    // `editorial_review_published_is_complete` constraint and the publish
    // transaction both refuse it — so their absence here would mean the row was
    // written by something other than this code.
    if (
      review.byline === null ||
      review.publishedAt === null ||
      review.score === null ||
      review.verdict === null
    )
      return null;
    return {
      byline: review.byline,
      cons: review.cons,
      lastCheckedAt: review.lastCheckedAt,
      productKey: review.productKey,
      pros: review.pros,
      publishedAt: review.publishedAt,
      score: review.score,
      sections: review.sections,
      verdict: review.verdict
    };
  }

  /** The review as its writer sees it, in whatever state it is in. */
  async forWriter(productKey: string): Promise<EditorialReviewAdmin | null> {
    return this.load(productKey, null);
  }

  /**
   * Every review, newest first, for the Admin list.
   *
   * Carries `lastCheckedAt` so that a surface can show a review's age
   * (`PRD-0009` §13.7, AC-17). The age is not computed here and no screen
   * presents it yet: no UX document describes the Admin authoring surface, and
   * `US-EDT-F02-001`'s Freeze Note forbids building one until it is drawn in
   * the prototype's language and approved.
   */
  async list(): Promise<EditorialReviewAdmin[]> {
    const rows = await this.pool.query<ReviewRow>(
      `select ${REVIEW_COLUMNS} from editorial_review r order by r.created_at desc`
    );
    if (rows.rows.length === 0) return [];
    const ids = rows.rows.map((row) => row.id);
    const [sections, points] = await Promise.all([
      this.sectionsOf(ids),
      this.pointsOf(ids)
    ]);
    return rows.rows.map((row) => shape(row, sections, points));
  }

  /**
   * Create a review for a Product Key, as a Draft.
   *
   * **The key's existence is checked inside the transaction and there is no
   * foreign key**, which is one decision serving two Acceptance Criteria that
   * pull apart. AC-14 wants the key to be one the catalogue carries at the
   * moment of writing; AC-9 wants the review to outlive every Offering that
   * carried it. A foreign key would honour the first by breaking the second.
   * Checking before the transaction rather than inside it would leave a window
   * in which the last listing is withdrawn between the check and the insert.
   */
  async create(input: {
    draft: WriteEditorialDraft;
    productKey: string;
  }): Promise<EditorialReviewAdmin> {
    const id = await this.write(async (client) => {
      await assertKeyExists(client, input.productKey);
      // Checked explicitly as well as by the unique index, because this is the
      // only place that knows the key and can therefore name it in the refusal.
      // The index remains the guarantee: two concurrent creates would race past
      // this check and one of them would still be refused.
      const existing = await client.query(
        `select 1 from editorial_review where product_key = $1`,
        [input.productKey]
      );
      if ((existing.rowCount ?? 0) > 0)
        throw new ReviewAlreadyExistsError(input.productKey);
      const inserted = await client.query<{ id: string }>(
        `insert into editorial_review (product_key, verdict, score, byline)
         values ($1, $2, $3, $4)
         returning id`,
        [
          input.productKey,
          input.draft.verdict ?? null,
          input.draft.score ?? null,
          input.draft.byline ?? null
        ]
      );
      const newId = inserted.rows[0]?.id;
      if (newId === undefined)
        throw new Error("editorial_review insert returned nothing");
      await replaceParts(client, newId, input.draft);
      return newId;
    });
    return this.byIdOrThrow(id);
  }

  /**
   * Save a Draft, or revise a review that is already published.
   *
   * **This is the method AC-9 is about.** It writes the parts and
   * `row_revised_at` and touches neither date a reader is shown. There is no
   * parameter by which it could: `WriteEditorialDraft` has no `lastCheckedAt`,
   * no `publishedAt` and no `status`, and it is a strict object, so a caller
   * that sends one is refused rather than quietly ignored. A writer who fixes a
   * comma leaves the re-check date alone and the page keeps telling the truth
   * about its own age.
   */
  async save(input: {
    draft: WriteEditorialDraft;
    id: string;
  }): Promise<EditorialReviewAdmin> {
    await this.write(async (client) => {
      const current = await lockRow(client, input.id);
      await client.query(
        `update editorial_review
            set verdict = $2,
                score = $3,
                byline = $4,
                row_revised_at = now()
          where id = $1`,
        [
          input.id,
          input.draft.verdict ?? null,
          input.draft.score ?? null,
          input.draft.byline ?? null
        ]
      );
      await replaceParts(client, input.id, input.draft);
      // A published review must stay complete while it is being revised. The
      // row constraint catches the three fields it can see; the parts are
      // counted here because a constraint cannot count across tables.
      if (current.status === "PUBLISHED")
        await assertPublishable(client, input.id);
    });
    return this.byIdOrThrow(input.id);
  }

  /**
   * Publish a Draft, or publish a withdrawn review again.
   *
   * `published_at` is set **only when it is null**, which is what makes it "set
   * once and never again" (AC-8) across a withdrawal and a return: the coalesce
   * keeps the original date rather than restamping it.
   */
  async publish(id: string): Promise<EditorialReviewAdmin> {
    await this.transition(id, "PUBLISHED", async (client) => {
      await assertPublishable(client, id);
      await client.query(
        `update editorial_review
            set status = 'PUBLISHED',
                published_at = coalesce(published_at, now()),
                row_revised_at = now()
          where id = $1`,
        [id]
      );
    });
    return this.byIdOrThrow(id);
  }

  /**
   * Record that a published review has been re-checked.
   *
   * **The only method in this file that moves `last_checked_at`**, and it is a
   * separate act rather than a flag on `save`, because `PRD-0009` §13.4 makes
   * it one: _"It is a separate act from saving and the surface asks for it
   * separately."_ It carries no payload at all — there is nothing to state
   * except that the check happened.
   */
  async recheck(id: string): Promise<EditorialReviewAdmin> {
    await this.write(async (client) => {
      const current = await lockRow(client, id);
      if (current.status !== "PUBLISHED")
        throw new InvalidReviewTransitionError(current.status, "PUBLISHED");
      await client.query(
        `update editorial_review
            set last_checked_at = now(),
                row_revised_at = now()
          where id = $1`,
        [id]
      );
    });
    return this.byIdOrThrow(id);
  }

  /**
   * Withdraw a published review.
   *
   * **Not a deletion, and there is no method here that is one** (AC-7). The row
   * stays, `published_at` stays, and the audit trail keeps who withdrew it. A
   * judgement the platform published and then made vanish without trace is the
   * one shape `PRD-0009` §8's integrity cannot survive.
   */
  async withdraw(id: string): Promise<EditorialReviewAdmin> {
    await this.transition(id, "WITHDRAWN", async (client) => {
      await client.query(
        `update editorial_review
            set status = 'WITHDRAWN',
                row_revised_at = now()
          where id = $1`,
        [id]
      );
    });
    return this.byIdOrThrow(id);
  }

  private async transition(
    id: string,
    to: EditorialReviewStatus,
    work: (client: PoolClient) => Promise<void>
  ): Promise<void> {
    await this.write(async (client) => {
      const current = await lockRow(client, id);
      if (!canTransition(current.status, to))
        throw new InvalidReviewTransitionError(current.status, to);
      await work(client);
    });
  }

  private async byIdOrThrow(id: string): Promise<EditorialReviewAdmin> {
    const rows = await this.pool.query<ReviewRow>(
      `select ${REVIEW_COLUMNS} from editorial_review r where r.id = $1`,
      [id]
    );
    const row = rows.rows[0];
    if (row === undefined) throw new Error(`editorial review ${id} vanished`);
    const [sections, points] = await Promise.all([
      this.sectionsOf([id]),
      this.pointsOf([id])
    ]);
    return shape(row, sections, points);
  }

  private async load(
    productKey: string,
    status: EditorialReviewStatus | null
  ): Promise<EditorialReviewAdmin | null> {
    const rows = await this.pool.query<ReviewRow>(
      `select ${REVIEW_COLUMNS}
         from editorial_review r
        where r.product_key = $1
          and ($2::text is null or r.status::text = $2)`,
      [productKey, status]
    );
    const row = rows.rows[0];
    if (row === undefined) return null;
    const [sections, points] = await Promise.all([
      this.sectionsOf([row.id]),
      this.pointsOf([row.id])
    ]);
    return shape(row, sections, points);
  }

  private async sectionsOf(ids: string[]): Promise<SectionRow[]> {
    const rows = await this.pool.query<SectionRow>(
      `select review_id as "reviewId", heading, body
         from editorial_review_section
        where review_id = any($1::uuid[])
        order by review_id, position`,
      [ids]
    );
    return rows.rows;
  }

  private async pointsOf(ids: string[]): Promise<PointRow[]> {
    const rows = await this.pool.query<PointRow>(
      `select review_id as "reviewId", kind::text as kind, text
         from editorial_review_point
        where review_id = any($1::uuid[])
        order by review_id, kind, position`,
      [ids]
    );
    return rows.rows;
  }

  /**
   * One transaction per act, and one place where a driver-level constraint
   * failure becomes a named domain error.
   */
  private async write<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw translate(error);
    } finally {
      client.release();
    }
  }
}

const REVIEW_COLUMNS = `
  r.id,
  r.product_key     as "productKey",
  r.status::text    as status,
  r.verdict,
  r.score::text     as score,
  r.byline,
  r.published_at    as "publishedAt",
  r.last_checked_at as "lastCheckedAt",
  r.created_at      as "createdAt"`;

function shape(
  row: ReviewRow,
  sections: SectionRow[],
  points: PointRow[]
): EditorialReviewAdmin {
  const mine = (kind: "CON" | "PRO"): string[] =>
    points
      .filter((p) => p.reviewId === row.id && p.kind === kind)
      .map((p) => p.text);
  const ownSections: EditorialSection[] = sections
    .filter((s) => s.reviewId === row.id)
    .map((s) => ({ body: s.body, heading: s.heading }));
  return {
    byline: row.byline,
    cons: mine("CON"),
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    lastCheckedAt: row.lastCheckedAt?.toISOString() ?? null,
    productKey: row.productKey,
    pros: mine("PRO"),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    score: row.score === null ? null : Number(row.score),
    sections: ownSections,
    status: row.status,
    verdict: row.verdict
  };
}

/**
 * Is this a Product Key the catalogue carries? (AC-14)
 *
 * **A published Offering, and the real `product_key` rather than the
 * `coalesce` group.** A key that only ever named a listing with no key of its
 * own is not a product the platform can be said to have; writing a judgement
 * about it would attach the review to an Offering under another name, which is
 * what AC-1 forbids and what AC-9 would then lose.
 */
async function assertKeyExists(
  client: PoolClient,
  productKey: string
): Promise<void> {
  const found = await client.query(
    `select 1
       from offering
      where product_key = $1
        and status = 'PUBLISHED'
      limit 1`,
    [productKey]
  );
  if ((found.rowCount ?? 0) === 0) throw new UnknownProductKeyError(productKey);
}

async function lockRow(
  client: PoolClient,
  id: string
): Promise<{ status: EditorialReviewStatus }> {
  const rows = await client.query<{ status: EditorialReviewStatus }>(
    `select status::text as status from editorial_review where id = $1 for update`,
    [id]
  );
  const row = rows.rows[0];
  if (row === undefined) throw new Error(`editorial review ${id} not found`);
  return row;
}

/**
 * The half of `PRD-0009` §13.5 a row constraint cannot express.
 *
 * `editorial_review_published_is_complete` guarantees the verdict, the score
 * and the byline, because those live on the row. "At least one section, one pro
 * and one con" is a count across two other tables, so it is counted here —
 * inside the same transaction as the publish, where the counts cannot change
 * underneath the check.
 */
async function assertPublishable(
  client: PoolClient,
  id: string
): Promise<void> {
  const rows = await client.query<{
    byline: string | null;
    cons: string;
    pros: string;
    score: string | null;
    sections: string;
    verdict: string | null;
  }>(
    `select r.verdict,
            r.score::text as score,
            r.byline,
            (select count(*) from editorial_review_section s where s.review_id = r.id)::text as sections,
            (select count(*) from editorial_review_point p where p.review_id = r.id and p.kind = 'PRO')::text as pros,
            (select count(*) from editorial_review_point p where p.review_id = r.id and p.kind = 'CON')::text as cons
       from editorial_review r
      where r.id = $1`,
    [id]
  );
  const row = rows.rows[0];
  if (row === undefined) throw new Error(`editorial review ${id} not found`);
  const missing = missingForPublication({
    byline: row.byline,
    cons: Number(row.cons) > 0 ? [{ kind: "CON", position: 0, text: "" }] : [],
    pros: Number(row.pros) > 0 ? [{ kind: "PRO", position: 0, text: "" }] : [],
    score: row.score === null ? null : Number(row.score),
    sections:
      Number(row.sections) > 0 ? [{ body: "", heading: "", position: 0 }] : [],
    verdict: row.verdict
  });
  if (missing.length > 0) throw new IncompleteReviewError(missing);
}

/**
 * Replace the sections and the points wholesale.
 *
 * The parts of a review are an ordered whole rather than a set of rows with
 * lives of their own: reordering two sections is one edit, and a merge that
 * tried to preserve identities would have to invent one for a paragraph. The
 * delete and the insert are in the caller's transaction, so a reader never sees
 * a review with half its prose.
 */
async function replaceParts(
  client: PoolClient,
  id: string,
  draft: WriteEditorialDraft
): Promise<void> {
  await client.query(
    `delete from editorial_review_section where review_id = $1`,
    [id]
  );
  await client.query(
    `delete from editorial_review_point where review_id = $1`,
    [id]
  );
  for (const [position, section] of draft.sections.entries())
    await client.query(
      `insert into editorial_review_section (review_id, position, heading, body)
       values ($1, $2, $3, $4)`,
      [id, position, section.heading, section.body]
    );
  for (const [position, text] of draft.pros.entries())
    await client.query(
      `insert into editorial_review_point (review_id, kind, position, text)
       values ($1, 'PRO', $2, $3)`,
      [id, position, text]
    );
  for (const [position, text] of draft.cons.entries())
    await client.query(
      `insert into editorial_review_point (review_id, kind, position, text)
       values ($1, 'CON', $2, $3)`,
      [id, position, text]
    );
}

/**
 * The backstop for the one failure two concurrent creates can still produce.
 *
 * `create` checks for an existing review by key and can therefore name it in
 * the refusal; this catches the race that check cannot close, where both
 * transactions look before either writes. The key is not available here, so the
 * error carries an empty one — which is why it is a backstop and not the path
 * a caller is expected to meet.
 */
function translate(error: unknown): unknown {
  if (violates(error, UNIQUE_VIOLATION, PRODUCT_KEY_CONSTRAINT))
    return new ReviewAlreadyExistsError("");
  return error;
}
