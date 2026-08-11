import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type {
  ComparisonSetResponse,
  DecisionContextResponse,
  ListingCardResponse
} from "@commerce/contracts";
import {
  contextRepairs,
  DECISION_FLOW_TTL_MINUTES,
  DecisionFlowNotFoundError,
  openableInCompare,
  SelectionNotInContextError
} from "@commerce/decision";

/**
 * The Decision Context (`US-DEC-F02-001`).
 *
 * The context is one Offering or one Comparison Set — a CHECK constraint, so
 * nothing here has to keep the two straight. What this file does is answer the
 * harder question the Story actually turns on: whether the context is still
 * *valid*, which is a statement about now rather than about when the person
 * entered.
 */

interface FlowRow {
  comparisonSetId: string | null;
  offeringId: string | null;
  selectedOfferingId: string | null;
}

@Injectable()
export class PgDecisionRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Enters Decision with one eligible Offering (AC-2).
   *
   * No Compare is required and none is created. A person who has read one
   * Offering and wants to act on it has a complete Decision Context.
   */
  async enterWithOffering(
    offeringId: string
  ): Promise<DecisionContextResponse> {
    return this.transact(async (client) => {
      const created = await client.query<{ id: string }>(
        `insert into decision_flow (offering_id, expires_at)
         values ($1, now() + ($2 || ' minutes')::interval)
         returning id`,
        [offeringId, String(DECISION_FLOW_TTL_MINUTES)]
      );
      return this.read(client, this.identifier(created));
    });
  }

  /**
   * Enters Decision with the Comparison Set F01 built (AC-3).
   *
   * The set is referenced, not copied. "Unchanged" is then not a promise this
   * code keeps but a fact about the data: there is only one set, and Decision
   * has no writer for it.
   */
  async enterWithComparisonSet(
    comparisonSetId: string
  ): Promise<DecisionContextResponse> {
    return this.transact(async (client) => {
      const created = await client.query<{ id: string }>(
        `insert into decision_flow (comparison_set_id, expires_at)
         select $1, now() + ($2 || ' minutes')::interval
         from comparison_set where id = $1
         returning id`,
        [comparisonSetId, String(DECISION_FLOW_TTL_MINUTES)]
      );
      // A set that expired between Compare and Decision is simply gone; there
      // is no flow to enter and nothing to reconstruct it from.
      if (created.rowCount === 0) throw new DecisionFlowNotFoundError();
      return this.read(client, this.identifier(created));
    });
  }

  async context(decisionFlowId: string): Promise<DecisionContextResponse> {
    return this.transact(async (client) => this.read(client, decisionFlowId));
  }

  /**
   * Selecting, changing or clearing (`US-DEC-F04-001` AC-2, AC-3, AC-5).
   *
   * One statement for all three, because they are one act: the person says
   * which Offering this flow is about, and `null` says none of them yet.
   * Whether the named Offering belongs to the context is the trigger's
   * question, not this one's.
   *
   * Non-selected members are untouched (AC-4) — nothing here writes to the
   * Comparison Set, and selecting is not a kind of removal.
   */
  async select(
    decisionFlowId: string,
    offeringId: string | null
  ): Promise<DecisionContextResponse> {
    return this.transact(async (client) => {
      try {
        const updated = await client.query(
          `update decision_flow set selected_offering_id = $2 where id = $1`,
          [decisionFlowId, offeringId]
        );
        if (updated.rowCount === 0) throw new DecisionFlowNotFoundError();
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          String(error.message).includes("SELECTION_NOT_IN_CONTEXT")
        )
          throw new SelectionNotInContextError();
        throw error;
      }
      return this.read(client, decisionFlowId);
    });
  }

  private identifier(created: { rows: { id: string }[] }): string {
    const id = created.rows[0]?.id;
    if (!id) throw new Error("DECISION_FLOW_NOT_CREATED");
    return id;
  }

  private async transact<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      // Expired flows and sets are swept together, so a flow can never be read
      // while the set it points at has already gone. Outside the transaction:
      // the refusal that follows reading an expired flow would otherwise roll
      // the sweep back.
      await client.query(`delete from decision_flow where expires_at <= now()`);
      await client.query(
        `delete from comparison_set where expires_at <= now()`
      );
      await client.query("begin");
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The context, with its validity decided now.
   *
   * Both halves are read through the Discovery projection, which is the single
   * eligibility answer the rest of the system uses. An Offering retired since
   * the person entered therefore reports itself invalid rather than quietly
   * continuing to look fine — AC-8's point is that Chat must not go on to
   * describe it.
   */
  private async read(
    client: PoolClient,
    decisionFlowId: string
  ): Promise<DecisionContextResponse> {
    const found = await client.query<FlowRow>(
      `select offering_id as "offeringId",
         comparison_set_id as "comparisonSetId",
         selected_offering_id as "selectedOfferingId"
       from decision_flow where id = $1`,
      [decisionFlowId]
    );
    const flow = found.rows[0];
    if (!flow) throw new DecisionFlowNotFoundError();

    const offering =
      flow.offeringId === null
        ? null
        : await this.offering(client, flow.offeringId);
    const comparison =
      flow.comparisonSetId === null
        ? null
        : await this.comparison(client, flow.comparisonSetId);

    // AC-7. One statement of validity for two shapes of context, because the
    // things it gates — Chat, and every handoff action — do not care which
    // kind of context they were denied.
    const valid =
      flow.offeringId === null
        ? comparison !== null && comparison.openable
        : offering !== null;

    // AC-6's other half, read rather than written: a selection whose Offering
    // stopped being eligible resolves to nothing here, so it cannot be acted
    // on even though the column still holds an identifier. The removal case is
    // cleared by the database; this one cannot be, because nobody touched the
    // set — the world changed underneath it.
    const selected =
      flow.selectedOfferingId === null
        ? null
        : await this.offering(client, flow.selectedOfferingId);

    return {
      comparison,
      decisionFlowId,
      // AC-7. One answer for both handoffs, and it needs a valid context *and*
      // a current eligible selection — a valid context with nothing chosen
      // offers nothing.
      handoffAvailable: valid && selected !== null,
      invalidity: valid
        ? null
        : flow.offeringId === null
          ? "SET_NOT_VALID"
          : "OFFERING_INELIGIBLE",
      offering,
      repairs: valid
        ? []
        : contextRepairs({ hasComparisonSet: flow.comparisonSetId !== null }),
      selected,
      valid
    };
  }

  /**
   * The single Offering, or nothing.
   *
   * `null` is the whole of AC-8 for this shape: an ineligible Offering is not
   * returned in a diminished form that Chat could still quote, it is not
   * returned at all.
   */
  private async offering(
    client: PoolClient,
    offeringId: string
  ): Promise<ListingCardResponse | null> {
    const result = await client.query<
      Omit<ListingCardResponse, "publishedAt"> & { publishedAt: Date }
    >(
      `select p.offering_id as "offeringId", p.title,
         p.business_name as "businessName", c.name as "categoryName",
         o.slug, p.published_at as "publishedAt"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       join category c on c.id = p.category_id
       where p.offering_id = $1`,
      [offeringId]
    );
    const row = result.rows[0];
    return row ? { ...row, publishedAt: row.publishedAt.toISOString() } : null;
  }

  /**
   * The Comparison Set as it stands, read rather than copied.
   *
   * Members come through the projection, so one retired since Compare stops
   * being a member here too — which is how a set can fall below two while
   * nobody touched it.
   */
  private async comparison(
    client: PoolClient,
    comparisonSetId: string
  ): Promise<ComparisonSetResponse | null> {
    const set = await client.query<{
      categoryId: string;
      categoryName: string;
    }>(
      `select s.category_id as "categoryId", c.name as "categoryName"
       from comparison_set s join category c on c.id = s.category_id
       where s.id = $1`,
      [comparisonSetId]
    );
    const header = set.rows[0];
    if (!header) return null;

    const members = await client.query<
      Omit<ListingCardResponse, "publishedAt"> & { publishedAt: Date }
    >(
      `select p.offering_id as "offeringId", p.title,
         p.business_name as "businessName", c.name as "categoryName",
         o.slug, p.published_at as "publishedAt"
       from comparison_set_member m
       join offering_search_projection p on p.offering_id = m.offering_id
       join offering o on o.id = m.offering_id
       join category c on c.id = p.category_id
       where m.comparison_set_id = $1
       order by m.added_at, m.offering_id`,
      [comparisonSetId]
    );

    return {
      categoryId: header.categoryId,
      categoryName: header.categoryName,
      comparisonSetId,
      full: members.rows.length >= 5,
      members: members.rows.map((row) => ({
        ...row,
        publishedAt: row.publishedAt.toISOString()
      })),
      openable: openableInCompare(members.rows.length)
    };
  }
}
