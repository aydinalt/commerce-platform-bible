import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";

import {
  IncompleteReviewError,
  InvalidReviewTransitionError,
  ReviewAlreadyExistsError,
  UnknownProductKeyError
} from "@commerce/editorial";

import { PgEditorialRepository } from "../apps/api/src/persistence/pg-editorial.repository.js";

/**
 * Increment I93 — the editorial review against a real database.
 *
 * These exercise `US-EDT-F02-001` **Frozen v0.1**'s Acceptance Criteria at the
 * layer where they can actually fail. The domain and contract suites fix the
 * rules; this one asks whether the schema and the write transactions keep them
 * when a real Postgres is underneath.
 */

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const editorial = new PgEditorialRepository(pool);

const key = (): string => `XZ-${randomUUID().slice(0, 12)}`;

/**
 * Everything this suite inserted, so that it can put the database back.
 *
 * **The other suites here create their fixtures through the HTTP API and never
 * clean up**, relying on `randomUUID` for isolation. This one writes catalogue
 * rows directly, because what it needs is a published Offering carrying a
 * Product Key and nothing about the review depends on how that Offering came to
 * exist. Direct writes skip whatever the application maintains alongside a
 * Category, so the rows are removed again rather than left for another suite to
 * meet — `i44` reads the whole catalogue back through the API and is entitled
 * to find it as it was.
 */
const made = {
  businesses: [] as string[],
  categories: [] as string[],
  domains: [] as string[],
  keys: [] as string[],
  offerings: [] as string[]
};

const draft = {
  byline: "Editör ekibi",
  cons: ["pahalı"],
  pros: ["sessiz", "hafif"],
  score: 8.4,
  sections: [
    { body: "İlk gövde", heading: "Tasarım" },
    { body: "İkinci gövde", heading: "Performans" }
  ],
  verdict: "İyi bir cihaz"
};

/** A published Offering carrying `productKey`, so that AC-14 is satisfiable. */
async function publishedOffering(productKey: string): Promise<string> {
  const domain = await pool.query<{ id: string }>(
    `insert into domain (stable_key, slug, name) values ($1,$1,$1) returning id`,
    [`d-${randomUUID().slice(0, 8)}`]
  );
  const category = await pool.query<{ id: string }>(
    `insert into category (domain_id, stable_key, slug, name)
     values ($1,$2,$2,$2) returning id`,
    [domain.rows[0]?.id, `c-${randomUUID().slice(0, 8)}`]
  );
  const business = await pool.query<{ id: string }>(
    `insert into business (slug, name) values ($1,$1) returning id`,
    [`b-${randomUUID().slice(0, 8)}`]
  );
  const offering = await pool.query<{ id: string }>(
    `insert into offering (business_id, category_id, slug, title, status, published_at, product_key)
     values ($1,$2,$3,$3,'PUBLISHED',now(),$4) returning id`,
    [
      business.rows[0]?.id,
      category.rows[0]?.id,
      `o-${randomUUID().slice(0, 8)}`,
      productKey
    ]
  );
  made.domains.push(domain.rows[0]?.id ?? "");
  made.categories.push(category.rows[0]?.id ?? "");
  made.businesses.push(business.rows[0]?.id ?? "");
  made.offerings.push(offering.rows[0]?.id ?? "");
  made.keys.push(productKey);
  return offering.rows[0]?.id ?? "";
}

suite("Increment I93 the editorial review", () => {
  afterAll(async () => {
    // Children first, and the reviews before the listings even though no
    // foreign key ties them — the absence of that key is the point of the
    // schema, not a licence to leave rows behind.
    await pool.query(
      `delete from editorial_review where product_key = any($1::text[])`,
      [made.keys]
    );
    await pool.query(`delete from offering where id = any($1::uuid[])`, [
      made.offerings
    ]);
    await pool.query(`delete from category where id = any($1::uuid[])`, [
      made.categories
    ]);
    await pool.query(`delete from business where id = any($1::uuid[])`, [
      made.businesses
    ]);
    await pool.query(`delete from domain where id = any($1::uuid[])`, [
      made.domains
    ]);
    await pool.end();
  });

  describe("AC-14, AC-15 — which keys may carry a review", () => {
    it("refuses a Product Key the catalogue does not carry", async () => {
      await expect(
        editorial.create({ draft, productKey: key() })
      ).rejects.toBeInstanceOf(UnknownProductKeyError);
    });

    /**
     * The `coalesce` group of `product_review` and `favourite` makes a keyless
     * listing its own group, named after the listing. This asserts editorial
     * does **not** follow it: an Offering with no key is not a product a review
     * can be written about, and the id of one is not a Product Key.
     */
    it("refuses a listing's own id standing in for a Product Key", async () => {
      const productKey = key();
      const offeringId = await publishedOffering(productKey);
      await pool.query(`update offering set product_key = null where id = $1`, [
        offeringId
      ]);
      await expect(
        editorial.create({ draft, productKey: offeringId })
      ).rejects.toBeInstanceOf(UnknownProductKeyError);
    });

    it("refuses a key carried only by a listing that is not published", async () => {
      const productKey = key();
      const offeringId = await publishedOffering(productKey);
      await pool.query(
        `update offering set status = 'DRAFT', published_at = null where id = $1`,
        [offeringId]
      );
      await expect(
        editorial.create({ draft, productKey })
      ).rejects.toBeInstanceOf(UnknownProductKeyError);
    });

    it("refuses a second review for a key that already has one", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      await editorial.create({ draft, productKey });
      await expect(
        editorial.create({ draft, productKey })
      ).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
    });

    /** AC-15 says "in any state", and withdrawn is a state. */
    it("refuses a second review even where the first was withdrawn", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);
      await editorial.withdraw(created.id);
      await expect(
        editorial.create({ draft, productKey })
      ).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
    });
  });

  describe("AC-4, AC-5, AC-6, AC-7 — the three states", () => {
    it("creates as a draft, presented nowhere", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      expect(created.status).toBe("DRAFT");
      expect(created.publishedAt).toBeNull();
      expect(await editorial.published(productKey)).toBeNull();
    });

    it("presents a published review and stops on withdrawal", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);
      expect(await editorial.published(productKey)).not.toBeNull();
      await editorial.withdraw(created.id);
      expect(await editorial.published(productKey)).toBeNull();
    });

    /** Withdrawal is not deletion: the row and its history stay. */
    it("keeps a withdrawn review readable by its writer", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);
      await editorial.withdraw(created.id);
      const held = await editorial.forWriter(productKey);
      expect(held?.status).toBe("WITHDRAWN");
      expect(held?.publishedAt).not.toBeNull();
    });

    it("never returns a review to draft", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);
      await expect(editorial.publish(created.id)).rejects.toBeInstanceOf(
        InvalidReviewTransitionError
      );
    });

    it("refuses to withdraw something never published", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await expect(editorial.withdraw(created.id)).rejects.toBeInstanceOf(
        InvalidReviewTransitionError
      );
    });
  });

  describe("AC-8, AC-9, AC-10, AC-11 — the two dates", () => {
    /**
     * **The criterion the reading surface depends on.** A save must not move
     * the re-check date, or "last re-checked" comes to mean "last touched" and
     * a corrected comma presents as a fresh verification.
     */
    it("does not move the re-check date when a review is saved", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);
      const checked = await editorial.recheck(created.id);
      expect(checked.lastCheckedAt).not.toBeNull();

      const saved = await editorial.save({
        draft: { ...draft, verdict: "İyi bir cihaz." },
        id: created.id
      });
      expect(saved.lastCheckedAt).toBe(checked.lastCheckedAt);
      expect(saved.verdict).toBe("İyi bir cihaz.");
    });

    it("does not move either date when a draft is edited", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      const saved = await editorial.save({
        draft: { ...draft, verdict: "Başka bir yargı" },
        id: created.id
      });
      expect(saved.publishedAt).toBeNull();
      expect(saved.lastCheckedAt).toBeNull();
    });

    it("moves the re-check date only by the act that means it", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      const published = await editorial.publish(created.id);
      expect(published.lastCheckedAt).toBeNull();
      const checked = await editorial.recheck(created.id);
      expect(checked.lastCheckedAt).not.toBeNull();
    });

    it("refuses to record a re-check of something not published", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await expect(editorial.recheck(created.id)).rejects.toBeInstanceOf(
        InvalidReviewTransitionError
      );
    });

    /** AC-8: set once, across a withdrawal and a return. */
    it("keeps the first publication date when a review is published again", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      const first = await editorial.publish(created.id);
      await editorial.withdraw(created.id);
      const again = await editorial.publish(created.id);
      expect(again.publishedAt).toBe(first.publishedAt);
    });
  });

  describe("AC-12, AC-13 — what publication requires", () => {
    const incomplete = { ...draft, cons: [] };

    it("refuses to publish a review with no cons", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({
        draft: incomplete,
        productKey
      });
      await expect(editorial.publish(created.id)).rejects.toBeInstanceOf(
        IncompleteReviewError
      );
    });

    it("names every missing part in one refusal", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({
        draft: {
          byline: null,
          cons: [],
          pros: [],
          score: null,
          sections: [],
          verdict: null
        },
        productKey
      });
      await editorial.publish(created.id).then(
        () => expect.unreachable("publication should have been refused"),
        (error: unknown) => {
          expect(error).toBeInstanceOf(IncompleteReviewError);
          expect((error as IncompleteReviewError).missing).toEqual([
            "verdict",
            "score",
            "sections",
            "pros",
            "cons",
            "byline"
          ]);
        }
      );
    });

    /**
     * The database's own guarantee, reached around the service. A row written
     * by anything at all — a script, a console, a future refactor — cannot be
     * PUBLISHED while it lacks the three parts that live on it.
     */
    it("refuses an incomplete published row at the database, not only in the service", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      await expect(
        pool.query(
          `insert into editorial_review (product_key, status, published_at)
           values ($1, 'PUBLISHED', now())`,
          [productKey]
        )
      ).rejects.toThrow(/editorial_review_published_is_complete/u);
    });

    it("refuses a score outside the scale at the database", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      await expect(
        pool.query(
          `insert into editorial_review (product_key, score) values ($1, 11.0)`,
          [productKey]
        )
      ).rejects.toThrow(/editorial_review_score_range/u);
    });
  });

  describe("AC-1, AC-2, AC-3 — the byline and the account", () => {
    it("stores the byline as written and derives it from nothing", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({
        draft: { ...draft, byline: "Konuk yazar" },
        productKey
      });
      await editorial.publish(created.id);
      const presented = await editorial.published(productKey);
      expect(presented?.byline).toBe("Konuk yazar");
    });

    /**
     * AC-3 at the storage layer: there is no column in which the acting account
     * could be kept, so nothing on the reading path can leak it. Who acted is
     * in `admin_audit_event` and nowhere else.
     */
    it("has no column for the account that wrote it", async () => {
      const columns = await pool.query<{ column_name: string }>(
        `select column_name from information_schema.columns
          where table_name = 'editorial_review'`
      );
      const names = columns.rows.map((row) => row.column_name);
      for (const forbidden of [
        "actor_id",
        "author_id",
        "written_by",
        "user_id",
        "created_by"
      ])
        expect(names).not.toContain(forbidden);
    });
  });

  describe("AC-9 the survival criterion — a seller leaving takes nothing", () => {
    /**
     * `US-EDT-F01-001` §11 calls this the criterion that justifies the whole
     * architecture, and it is the one a foreign key would have broken.
     */
    it("keeps a review when every listing carrying its key is withdrawn", async () => {
      const productKey = key();
      const offeringId = await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);

      await pool.query(
        `update offering set status = 'ARCHIVED', archived_at = now() where id = $1`,
        [offeringId]
      );
      const survived = await editorial.published(productKey);
      expect(survived?.verdict).toBe(draft.verdict);
    });

    it("presents the same review to a second seller of the same product", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);
      await publishedOffering(productKey);

      const rows = await pool.query<{ count: string }>(
        `select count(*)::text as count from editorial_review where product_key = $1`,
        [productKey]
      );
      expect(rows.rows[0]?.count).toBe("1");
      expect((await editorial.published(productKey))?.verdict).toBe(
        draft.verdict
      );
    });
  });

  describe("AC-16 — the shape has nowhere to put a sponsorship", () => {
    /**
     * The structural half. A test that asserts a field is absent from a type
     * passes trivially and is the first thing to rot; a test that asks the
     * database for its actual column list does not. The day somebody adds
     * `sponsored`, this fails.
     */
    it("keeps the review's column set closed and free of commerce", async () => {
      const columns = await pool.query<{ column_name: string }>(
        `select column_name from information_schema.columns
          where table_name = 'editorial_review' order by column_name`
      );
      expect(columns.rows.map((row) => row.column_name)).toEqual([
        "byline",
        "created_at",
        "id",
        "last_checked_at",
        "product_key",
        "published_at",
        "row_revised_at",
        "score",
        "status",
        "verdict"
      ]);
    });

    it("keeps the child tables closed too", async () => {
      const sections = await pool.query<{ column_name: string }>(
        `select column_name from information_schema.columns
          where table_name = 'editorial_review_section' order by column_name`
      );
      expect(sections.rows.map((row) => row.column_name)).toEqual([
        "body",
        "heading",
        "id",
        "position",
        "review_id"
      ]);
      const points = await pool.query<{ column_name: string }>(
        `select column_name from information_schema.columns
          where table_name = 'editorial_review_point' order by column_name`
      );
      expect(points.rows.map((row) => row.column_name)).toEqual([
        "id",
        "kind",
        "position",
        "review_id",
        "text"
      ]);
    });

    /**
     * The isolation boundary, asserted as an absence. Editorial material is
     * platform-owned; no seller may reach the judgement written about the
     * product they sell, and the reason they cannot is that no column expresses
     * the relationship.
     */
    it("carries no owner, so no Business can be scoped to it", async () => {
      const columns = await pool.query<{ column_name: string }>(
        `select column_name from information_schema.columns
          where table_name = 'editorial_review'`
      );
      const names = columns.rows.map((row) => row.column_name);
      expect(names).not.toContain("business_id");
      expect(names).not.toContain("tenant_id");
    });

    /**
     * There must be no foreign key from a review to an Offering — the one that
     * would tie the platform's judgement to a seller's decision to stay.
     */
    it("holds no foreign key to any listing", async () => {
      const keys = await pool.query<{ definition: string }>(
        `select pg_get_constraintdef(oid) as definition
           from pg_constraint
          where conrelid = 'editorial_review'::regclass and contype = 'f'`
      );
      expect(keys.rows).toHaveLength(0);
    });
  });

  describe("the parts", () => {
    it("keeps the author's order for sections and for each list", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.publish(created.id);
      const presented = await editorial.published(productKey);
      expect(presented?.sections.map((s) => s.heading)).toEqual([
        "Tasarım",
        "Performans"
      ]);
      expect(presented?.pros).toEqual(["sessiz", "hafif"]);
      expect(presented?.cons).toEqual(["pahalı"]);
    });

    it("replaces the parts wholesale rather than accumulating them", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({ draft, productKey });
      await editorial.save({
        draft: { ...draft, sections: [{ body: "Tek", heading: "Yalnız" }] },
        id: created.id
      });
      const held = await editorial.forWriter(productKey);
      expect(held?.sections).toEqual([{ body: "Tek", heading: "Yalnız" }]);
    });

    it("reads the score back as the number that was written", async () => {
      const productKey = key();
      await publishedOffering(productKey);
      const created = await editorial.create({
        draft: { ...draft, score: 8.4 },
        productKey
      });
      await editorial.publish(created.id);
      expect((await editorial.published(productKey))?.score).toBe(8.4);
    });
  });
});
