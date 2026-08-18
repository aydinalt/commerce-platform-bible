import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  EXPIRED_COMPARISON_SETS_SQL,
  EXPIRED_DECISION_FLOWS_SQL
} from "@commerce/database";

import type { DecisionChatResponse } from "@commerce/contracts";
import {
  DecisionContextInvalidError,
  DecisionFlowNotFoundError,
  type BriefedOffering,
  type DecisionBrief
} from "@commerce/decision";

/**
 * Decision Chat's state and its brief (`US-DEC-F03-001`).
 *
 * Two jobs, and the first one matters most: assembling the brief. Everything
 * the assistant may say comes from here, so this is the boundary AC-4 lives
 * on — the query below reads the Decision Context and stops. It cannot reach a
 * Business's contact channels, an Affiliate Destination or another Offering,
 * because it never asks for them.
 */

interface BriefRow {
  attributeName: string | null;
  booleanValue: boolean | null;
  businessName: string;
  categoryName: string;
  numberValue: string | null;
  offeringId: string;
  optionLabels: string[];
  textValue: string | null;
  title: string;
  unit: string | null;
  valueKind: string | null;
}

/**
 * One Attribute value as a sentence fragment, or the absence of one.
 *
 * The unit is not appended here; the brief carries it separately so that the
 * assistant repeats the governed unit rather than a copy of it.
 */
function stated(row: BriefRow): string | null {
  if (row.valueKind === "BOOLEAN")
    return row.booleanValue === null ? null : row.booleanValue ? "Var" : "Yok";
  if (row.valueKind === "NUMBER") return row.numberValue;
  if (row.valueKind === "TEXT") return row.textValue;
  return row.optionLabels.length > 0 ? row.optionLabels.join(", ") : null;
}

@Injectable()
export class PgChatRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * The brief for one Decision flow.
   *
   * Reads through the Discovery projection, so an Offering that stopped being
   * eligible is simply not in the brief — AC-4 and the Decision Context's own
   * AC-8 land on the same query. A flow whose context has become empty raises
   * rather than briefing the assistant on nothing.
   */
  async brief(
    client: PoolClient,
    decisionFlowId: string,
    priorities: readonly string[]
  ): Promise<DecisionBrief> {
    const rows = await client.query<BriefRow>(
      `select p.offering_id as "offeringId", p.title,
         p.business_name as "businessName", c.name as "categoryName",
         d.name as "attributeName", d.unit, d.value_kind::text as "valueKind",
         v.text_value as "textValue", v.number_value::text as "numberValue",
         v.boolean_value as "booleanValue",
         coalesce(
           (select array_agg(o.label order by o.sort_order, o.label)
            from offering_attribute_value ov
            join attribute_option o on o.id = ov.option_id
            where ov.offering_id = p.offering_id
              and ov.attribute_definition_id = d.id),
           '{}'
         ) as "optionLabels"
       from decision_flow f
       join offering_search_projection p
         on p.offering_id = f.offering_id
         or p.offering_id in (
           select m.offering_id from comparison_set_member m
           where m.comparison_set_id = f.comparison_set_id
         )
       join category c on c.id = p.category_id
       -- Only comparable Attributes: the same set Compare shows, so Chat and
       -- the table a person is reading cannot disagree about what is at issue.
       left join category_attribute ca on ca.category_id = p.category_id
       left join attribute_definition d
         on d.id = ca.attribute_definition_id
         and d.active = true and d.comparable = true
       left join offering_attribute_value v
         on v.offering_id = p.offering_id
         and v.attribute_definition_id = d.id and v.option_id is null
       where f.id = $1
       group by p.offering_id, p.title, p.business_name, c.name, d.id, d.name,
         d.unit, d.value_kind, v.text_value, v.number_value, v.boolean_value
       -- Same tie-break as Compare, for the same reason and so the two cannot
       -- disagree about the order of the set they are both describing.
       order by p.offering_id, d.name, d.id`,
      [decisionFlowId]
    );

    const offerings = new Map<string, BriefedOffering>();
    for (const row of rows.rows) {
      const existing = offerings.get(row.offeringId) ?? {
        attributes: [],
        businessName: row.businessName,
        categoryName: row.categoryName,
        offeringId: row.offeringId,
        title: row.title
      };
      if (row.attributeName !== null)
        offerings.set(row.offeringId, {
          ...existing,
          attributes: [
            ...existing.attributes,
            { name: row.attributeName, unit: row.unit, value: stated(row) }
          ]
        });
      else offerings.set(row.offeringId, existing);
    }

    // AC-3 read strictly: Chat begins on a *valid* current Decision Context.
    // An empty brief means what the context named is no longer eligible.
    if (offerings.size === 0) throw new DecisionContextInvalidError();
    return { offerings: [...offerings.values()], priorities };
  }

  /**
   * Records the question, the reply and — the first time — that Chat began.
   *
   * `on conflict do nothing` on the occurrence is the once-per-flow rule: a
   * second question is not a second conversation.
   */
  async record(
    client: PoolClient,
    input: { decisionFlowId: string; question: string; reply: string }
  ): Promise<void> {
    await client.query(
      `insert into decision_chat_start (decision_flow_id) values ($1)
       on conflict (decision_flow_id) do nothing`,
      [input.decisionFlowId]
    );
    await client.query(
      `insert into decision_chat_turn
         (decision_flow_id, position, question, reply)
       select $1,
         coalesce(max(position), 0) + 1, $2, $3
       from decision_chat_turn where decision_flow_id = $1`,
      [input.decisionFlowId, input.question, input.reply]
    );
  }

  async turns(
    client: PoolClient,
    decisionFlowId: string
  ): Promise<DecisionChatResponse> {
    const found = await client.query(
      `select 1 from decision_flow where id = $1`,
      [decisionFlowId]
    );
    if (found.rowCount === 0) throw new DecisionFlowNotFoundError();

    const rows = await client.query<{
      askedAt: Date;
      question: string;
      reply: string;
    }>(
      `select asked_at as "askedAt", question, reply
       from decision_chat_turn where decision_flow_id = $1
       order by position`,
      [decisionFlowId]
    );
    return {
      decisionFlowId,
      turns: rows.rows.map((row) => ({
        askedAt: row.askedAt.toISOString(),
        question: row.question,
        reply: row.reply
      }))
    };
  }

  /**
   * One transaction per act, with the expiry sweep first — and outside it.
   *
   * The sweep is what makes AC-9 true over time rather than at one moment: a
   * flow past its expiry takes its turns with it, and no request can read a
   * conversation that should already be gone. Inside the transaction it would
   * be undone by the very refusal that follows reading an expired flow.
   */
  async transact<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      // The sweep runs before the transaction rather than inside it. Expiry is
      // not part of the caller's act, and a refusal that rolled it back would
      // resurrect state that should already be gone.
      await client.query(EXPIRED_DECISION_FLOWS_SQL);
      await client.query(EXPIRED_COMPARISON_SETS_SQL);
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
}
