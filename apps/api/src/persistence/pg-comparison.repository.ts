import { PRIMARY_VISUAL_SQL } from "./listing-card.sql.js";

import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import { EXPIRED_COMPARISON_SETS_SQL } from "@commerce/database";

import type {
  ComparisonRow,
  ComparisonSetResponse,
  ComparisonViewResponse,
  ListingCardResponse
} from "@commerce/contracts";
import {
  COMPARISON_SET_TTL_MINUTES,
  ComparisonMemberRefusedError,
  ComparisonSetNotFoundError,
  openableInCompare,
  type ComparisonRefusal
} from "@commerce/decision";

/**
 * Comparison Sets (`US-DEC-F01-001`).
 *
 * Everything that decides whether a member may join is a database rule, so
 * this file is mostly about translating a refusal into a name and reading a
 * set back. That division is deliberate: a check written here could be
 * forgotten by the next caller, and a trigger cannot be.
 */

/// The trigger raises these; nothing else in the system does.
const REFUSALS: Record<string, ComparisonRefusal> = {
  COMPARISON_MEMBER_INELIGIBLE: "MEMBER_INELIGIBLE",
  COMPARISON_MEMBER_OTHER_CATEGORY: "MEMBER_OTHER_CATEGORY",
  COMPARISON_SET_FULL: "SET_FULL"
};

function translate(error: unknown): never {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "";
  for (const [raised, refusal] of Object.entries(REFUSALS))
    if (message.includes(raised))
      throw new ComparisonMemberRefusedError(refusal);
  throw error;
}

interface ValueRow {
  attributeId: string;
  booleanValue: boolean | null;
  name: string;
  numberValue: string | null;
  offeringId: string;
  optionLabels: string[];
  textValue: string | null;
  unit: string | null;
  valueKind: ComparisonRow["kind"];
}

@Injectable()
export class PgComparisonRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Begins a Comparison Set from one eligible Offering.
   *
   * The Category comes from the Offering rather than from the request, so the
   * shared leaf of AC-3 is decided by the first thing the person chose and not
   * by anything they could state incorrectly.
   */
  async begin(offeringId: string): Promise<ComparisonSetResponse> {
    return this.transact(async (client) => {
      const found = await client.query<{ categoryId: string }>(
        `select category_id as "categoryId"
         from offering_search_projection where offering_id = $1`,
        [offeringId]
      );
      const categoryId = found.rows[0]?.categoryId;
      // AC-4. An ineligible Offering cannot even open a set, and says so in the
      // same words a refused addition uses.
      if (!categoryId)
        throw new ComparisonMemberRefusedError("MEMBER_INELIGIBLE");

      const created = await client.query<{ id: string }>(
        `insert into comparison_set (category_id, expires_at)
         values ($1, now() + ($2 || ' minutes')::interval)
         returning id`,
        [categoryId, String(COMPARISON_SET_TTL_MINUTES)]
      );
      const comparisonSetId = created.rows[0]?.id;
      if (!comparisonSetId) throw new Error("COMPARISON_SET_NOT_CREATED");

      await this.insertMember(client, comparisonSetId, offeringId);
      return this.read(client, comparisonSetId);
    });
  }

  /**
   * Adds a member, replacing a named one first where the set is full.
   *
   * The removal and the addition share the transaction, so AC-6's "explicit
   * replacement" is one act: a person never ends up having lost a member
   * because the Offering they wanted turned out to be ineligible.
   */
  async add(input: {
    comparisonSetId: string;
    offeringId: string;
    replaces?: string | undefined;
  }): Promise<ComparisonSetResponse> {
    return this.transact(async (client) => {
      await this.require(client, input.comparisonSetId);
      if (input.replaces !== undefined)
        await client.query(
          `delete from comparison_set_member
           where comparison_set_id = $1 and offering_id = $2`,
          [input.comparisonSetId, input.replaces]
        );
      await this.insertMember(client, input.comparisonSetId, input.offeringId);
      return this.read(client, input.comparisonSetId);
    });
  }

  /**
   * Removes a member (AC-5).
   *
   * A set may fall to one member or to none. Neither is invalid; both are
   * simply not openable in Compare, which the read reports rather than
   * enforces.
   */
  async remove(
    comparisonSetId: string,
    offeringId: string
  ): Promise<ComparisonSetResponse> {
    return this.transact(async (client) => {
      await this.require(client, comparisonSetId);
      await client.query(
        `delete from comparison_set_member
         where comparison_set_id = $1 and offering_id = $2`,
        [comparisonSetId, offeringId]
      );
      return this.read(client, comparisonSetId);
    });
  }

  async current(comparisonSetId: string): Promise<ComparisonSetResponse> {
    return this.transact(async (client) => {
      await this.require(client, comparisonSetId);
      return this.read(client, comparisonSetId);
    });
  }

  /**
   * Opens a valid set in Compare (AC-11).
   *
   * The occurrence and the view share the transaction for the same reason
   * `Offering Presentation Open` does: a Compare Start that outlived a failed
   * composition would say somebody compared something they never saw.
   *
   * `on conflict do nothing` is the once-per-set rule. Reopening is the same
   * person still comparing the same things.
   */
  async open(comparisonSetId: string): Promise<ComparisonViewResponse | null> {
    return this.transact(async (client) => {
      await this.require(client, comparisonSetId);
      const set = await this.read(client, comparisonSetId);
      if (!set.openable) return null;

      await client.query(
        `insert into compare_start (comparison_set_id, domain_id)
         select $1, c.domain_id from category c where c.id = $2
         on conflict (comparison_set_id) do nothing`,
        [comparisonSetId, set.categoryId]
      );
      return { ...set, rows: await this.rows(client, set) };
    });
  }

  private async transact<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      // Expired sets are swept opportunistically here and on a schedule by the
      // worker. Outside the transaction, because a refused member must not roll
      // back the removal of somebody else's expired set.
      //
      // The statement is shared rather than written here, so the four callers
      // that sweep this state cannot drift apart.
      await client.query(EXPIRED_COMPARISON_SETS_SQL);
      await client.query("begin");
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      return translate(error);
    } finally {
      client.release();
    }
  }

  private async insertMember(
    client: PoolClient,
    comparisonSetId: string,
    offeringId: string
  ): Promise<void> {
    // `on conflict do nothing` keeps adding an Offering already in the set a
    // no-op rather than an error: the person asked for a state that is already
    // true.
    await client.query(
      `insert into comparison_set_member (comparison_set_id, offering_id)
       values ($1, $2) on conflict do nothing`,
      [comparisonSetId, offeringId]
    );
  }

  private async require(
    client: PoolClient,
    comparisonSetId: string
  ): Promise<void> {
    const found = await client.query(
      `select 1 from comparison_set where id = $1 for update`,
      [comparisonSetId]
    );
    if (found.rowCount === 0) throw new ComparisonSetNotFoundError();
  }

  /**
   * The set as it stands.
   *
   * Members are read through the projection, so one that stopped being
   * eligible while the person was elsewhere simply stops appearing — AC-2 is
   * about a set that *contains* eligible Offerings, which is a statement about
   * now rather than about when they were added.
   */
  private async read(
    client: PoolClient,
    comparisonSetId: string
  ): Promise<ComparisonSetResponse> {
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
    if (!header) throw new ComparisonSetNotFoundError();

    const members = await client.query<
      Omit<ListingCardResponse, "publishedAt"> & { publishedAt: Date }
    >(
      `select p.offering_id as "offeringId", p.title,
         p.business_name as "businessName", c.name as "categoryName",
         o.slug, p.published_at as "publishedAt",
         ${PRIMARY_VISUAL_SQL}
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

  /**
   * The comparable Attributes of the shared leaf, one row each (AC-7).
   *
   * Only definitions marked `comparable` appear, and the set is decided by the
   * Category rather than by what the members happen to hold — otherwise an
   * Attribute nobody answered would vanish and the absence AC-8 wants stated
   * would go with it.
   */
  private async rows(
    client: PoolClient,
    set: ComparisonSetResponse
  ): Promise<ComparisonRow[]> {
    const order = set.members.map((member) => member.offeringId);
    const values = await client.query<ValueRow>(
      `select d.id as "attributeId", d.name, d.unit,
         d.value_kind::text as "valueKind", m.offering_id as "offeringId",
         v.text_value as "textValue", v.number_value::text as "numberValue",
         v.boolean_value as "booleanValue",
         coalesce(
           (select array_agg(o.label order by o.sort_order, o.label)
            from offering_attribute_value ov
            join attribute_option o on o.id = ov.option_id
            where ov.offering_id = m.offering_id
              and ov.attribute_definition_id = d.id),
           '{}'
         ) as "optionLabels"
       from category_attribute ca
       join attribute_definition d on d.id = ca.attribute_definition_id
       cross join comparison_set_member m
       left join offering_attribute_value v
         on v.offering_id = m.offering_id
         and v.attribute_definition_id = d.id and v.option_id is null
       where ca.category_id = $1 and d.active = true and d.comparable = true
         and m.comparison_set_id = $2
       group by d.id, d.name, d.unit, d.value_kind, m.offering_id,
         v.text_value, v.number_value, v.boolean_value
       -- A definition name is not unique; only its stable key is. Without the
       -- tie-break, rows of a comparison table could swap places between two
       -- reads of the same Set, which is the one thing a comparison must not do.
       order by d.name, d.id`,
      [set.categoryId, set.comparisonSetId]
    );

    const rows = new Map<string, ComparisonRow>();
    for (const row of values.rows) {
      const existing = rows.get(row.attributeId) ?? {
        attributeId: row.attributeId,
        kind: row.valueKind,
        name: row.name,
        unit: row.unit,
        values: order.map(() => null)
      };
      const number = row.numberValue === null ? null : Number(row.numberValue);
      // AC-8. A value is present or it is not; nothing is substituted for the
      // absence, and the phrase a person reads is decided where it is read.
      const supplied =
        row.valueKind === "TEXT"
          ? row.textValue !== null
          : row.valueKind === "NUMBER"
            ? number !== null
            : row.valueKind === "BOOLEAN"
              ? row.booleanValue !== null
              : row.optionLabels.length > 0;
      const at = order.indexOf(row.offeringId);
      if (at >= 0 && supplied)
        existing.values[at] = {
          boolean: row.booleanValue,
          number,
          offeringId: row.offeringId,
          optionLabels: row.optionLabels,
          text: row.textValue
        };
      rows.set(row.attributeId, existing);
    }
    return [...rows.values()];
  }
}
