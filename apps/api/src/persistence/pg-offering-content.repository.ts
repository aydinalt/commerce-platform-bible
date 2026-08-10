import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type { OfferingAttributeValueInput } from "@commerce/contracts";
import {
  AttributeValueMismatchError,
  evaluatePublicationMinimum,
  OfferingNotEditableError,
  OfferingSlugConflictError,
  PublicationMinimumError,
  type OfferingLifecycle
} from "@commerce/offering";

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";
const OFFERING_SLUG_CONSTRAINT = "offering_business_id_slug_key";
const SINGLE_SELECT_ARITY_CONSTRAINT =
  "offering_attribute_value_single_select_arity";

/// The lifecycle states whose edits must keep the publication minimum
/// satisfied (`US-OFR-F02-001` AC-3, AC-4, AC-5).
const PUBLICATION_GATED: readonly OfferingLifecycle[] = ["PUBLISHED", "HIDDEN"];

export interface OfferingContentRecord {
  attributes: {
    attributeId: string;
    booleanValue: boolean | null;
    numberValue: number | null;
    optionIds: string[];
    textValue: string | null;
  }[];
  businessId: string;
  categoryId: string;
  id: string;
  publishedAt: string | null;
  slug: string;
  status: OfferingLifecycle;
  summary: string | null;
  title: string;
  version: number;
}

interface DefinitionShape {
  optionIds: string[];
  valueKind: string;
}

@Injectable()
export class PgOfferingContentRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findOwned(
    businessId: string,
    offeringId: string
  ): Promise<OfferingContentRecord | null> {
    const client = await this.pool.connect();
    try {
      return await this.read(client, businessId, offeringId);
    } finally {
      client.release();
    }
  }

  /**
   * Replaces the Offering's content.
   *
   * Everything the Story guards happens inside one transaction, in the order
   * the Story states it: the Offering is located and locked, an Archived one is
   * refused (AC-7), the content is written, and only then — for a Published or
   * Hidden Offering — is the Universal Publication Minimum re-evaluated against
   * the *result* (AC-5). Checking before the write would answer a question
   * about the old content.
   *
   * The update names `title`, `summary` and `category_id`. It cannot name
   * `status`, `published_at` or `archived_at`, which is what makes AC-6 and
   * AC-10 true rather than remembered.
   */
  async edit(input: {
    attributes: OfferingAttributeValueInput[];
    businessId: string;
    categoryId: string;
    correlationId: string;
    offeringId: string;
    summary: string | null;
    title: string;
    userId: string;
  }): Promise<OfferingContentRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const locked = await client.query<{ status: OfferingLifecycle }>(
        `select o.status::text as status from offering o
         where o.id = $1 and o.business_id = $2 for update`,
        [input.offeringId, input.businessId]
      );
      const current = locked.rows[0];
      if (!current) {
        await client.query("rollback");
        return null;
      }
      if (current.status === "ARCHIVED")
        throw new OfferingNotEditableError("ARCHIVED");

      await client.query(
        `update offering set title = $3, summary = $4, category_id = $5
         where id = $1 and business_id = $2`,
        [
          input.offeringId,
          input.businessId,
          input.title,
          input.summary,
          input.categoryId
        ]
      );

      await this.replaceAttributes(client, input.offeringId, input.attributes);

      if (PUBLICATION_GATED.includes(current.status))
        await this.assertPublicationMinimum(client, input.offeringId);

      await client.query(
        `insert into audit_record
          (actor_user_id, effective_business_id, action, target_type, target_id,
           result, correlation_id)
         values ($1,$2,'offering.content.edit','Offering',$3,'ALLOWED',$4)`,
        [input.userId, input.businessId, input.offeringId, input.correlationId]
      );

      const edited = await this.read(
        client,
        input.businessId,
        input.offeringId
      );
      await client.query("commit");
      return edited;
    } catch (error) {
      await client.query("rollback");
      if (isUniqueViolation(error, OFFERING_SLUG_CONSTRAINT))
        throw new OfferingSlugConflictError("");
      // The arity trigger is a backstop rather than the first line of defence,
      // but if it ever fires it must still arrive as a named refusal.
      if (isCheckViolation(error, SINGLE_SELECT_ARITY_CONSTRAINT))
        throw new AttributeValueMismatchError("");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The submitted set replaces the stored one, so what is absent is removed.
   * Each value is checked against the kind its definition declares: a request
   * that says `TEXT` for a Number definition is a mistake worth naming, not a
   * value to coerce.
   */
  private async replaceAttributes(
    client: PoolClient,
    offeringId: string,
    attributes: OfferingAttributeValueInput[]
  ): Promise<void> {
    await client.query(
      `delete from offering_attribute_value where offering_id = $1`,
      [offeringId]
    );
    if (attributes.length === 0) return;

    const definitions = await client.query<DefinitionShape & { id: string }>(
      `select d.id, d.value_kind::text as "valueKind",
         coalesce(
           (select array_agg(o.id) from attribute_option o
            where o.attribute_definition_id = d.id and o.active = true),
           '{}'
         ) as "optionIds"
       from attribute_definition d
       where d.id = any($1::uuid[])`,
      [attributes.map((value) => value.attributeId)]
    );
    const shapes = new Map(
      definitions.rows.map((row) => [row.id, row as DefinitionShape])
    );

    for (const value of attributes) {
      const shape = shapes.get(value.attributeId);
      if (!shape) throw new AttributeValueMismatchError(value.attributeId);

      if (value.kind === "SELECT") {
        if (
          shape.valueKind !== "SINGLE_SELECT" &&
          shape.valueKind !== "MULTI_SELECT"
        )
          throw new AttributeValueMismatchError(value.attributeId);
        // A retired allowed value may stay on an Offering that already had it
        // (`US-PLT-F09-001` AC-11), but it is not something a new edit may
        // choose.
        if (!value.optionIds.every((id) => shape.optionIds.includes(id)))
          throw new AttributeValueMismatchError(value.attributeId);
        // A Single Select holds one. The trigger enforces this too, but a
        // caller deserves to be told which value was wrong rather than being
        // handed a constraint failure.
        if (shape.valueKind === "SINGLE_SELECT" && value.optionIds.length > 1)
          throw new AttributeValueMismatchError(value.attributeId);
        for (const optionId of value.optionIds)
          await client.query(
            `insert into offering_attribute_value
               (offering_id, attribute_definition_id, option_id)
             values ($1,$2,$3)`,
            [offeringId, value.attributeId, optionId]
          );
        continue;
      }

      if (shape.valueKind !== value.kind)
        throw new AttributeValueMismatchError(value.attributeId);

      const column =
        value.kind === "TEXT"
          ? "text_value"
          : value.kind === "NUMBER"
            ? "number_value"
            : "boolean_value";
      const stored =
        value.kind === "TEXT"
          ? value.text
          : value.kind === "NUMBER"
            ? value.number
            : value.boolean;
      await client.query(
        `insert into offering_attribute_value
           (offering_id, attribute_definition_id, ${column})
         values ($1,$2,$3)`,
        [offeringId, value.attributeId, stored]
      );
    }
  }

  /**
   * PRD-0001 §6.1.1, evaluated against the state the edit just produced. The
   * counts come from the database because three of the four conditions are
   * questions about other rows; the verdict is composed in the domain because
   * that is where the rule is written down.
   */
  private async assertPublicationMinimum(
    client: PoolClient,
    offeringId: string
  ): Promise<void> {
    const state = await client.query<{
      businessDisplayName: string;
      categoryActiveLeaf: boolean;
      missingRequiredAttributes: string;
      title: string;
    }>(
      `select o.title, b.name as "businessDisplayName",
         (c.active and not exists (
            select 1 from category child
            where child.parent_id = c.id and child.active = true
          )) as "categoryActiveLeaf",
         (select count(*) from category_attribute ca
          join attribute_definition d on d.id = ca.attribute_definition_id
          where ca.category_id = o.category_id
            and d.required_for_publication = true
            and not exists (
              select 1 from offering_attribute_value v
              where v.offering_id = o.id
                and v.attribute_definition_id = d.id
            )) as "missingRequiredAttributes"
       from offering o
       join business b on b.id = o.business_id
       join category c on c.id = o.category_id
       where o.id = $1`,
      [offeringId]
    );
    const row = state.rows[0];
    if (!row) throw new Error("OFFERING_DISAPPEARED");

    const minimum = evaluatePublicationMinimum({
      businessDisplayName: row.businessDisplayName,
      categoryActiveLeaf: row.categoryActiveLeaf,
      missingRequiredAttributes: Number(row.missingRequiredAttributes),
      title: row.title
    });
    if (!minimum.satisfied)
      throw new PublicationMinimumError(minimum.shortfalls);
  }

  private async read(
    client: PoolClient,
    businessId: string,
    offeringId: string
  ): Promise<OfferingContentRecord | null> {
    const result = await client.query<
      Omit<OfferingContentRecord, "publishedAt"> & { publishedAt: Date | null }
    >(
      `select o.id, o.business_id as "businessId", o.category_id as "categoryId",
         o.slug, o.title, o.summary, o.status::text as status, o.version,
         o.published_at as "publishedAt",
         coalesce(
           (select json_agg(a order by a."attributeId")
            from (
              select v.attribute_definition_id as "attributeId",
                max(v.text_value) as "textValue",
                max(v.number_value)::float8 as "numberValue",
                bool_or(v.boolean_value) as "booleanValue",
                coalesce(
                  array_remove(array_agg(v.option_id order by v.option_id), null),
                  '{}'
                ) as "optionIds"
              from offering_attribute_value v
              where v.offering_id = o.id
              group by v.attribute_definition_id
            ) a),
           '[]'
         ) as attributes
       from offering o
       where o.id = $1 and o.business_id = $2`,
      [offeringId, businessId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      ...row,
      publishedAt: row.publishedAt?.toISOString() ?? null
    };
  }
}

function violates(error: unknown, code: string, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return candidate.code === code && candidate.constraint === constraint;
}

function isUniqueViolation(error: unknown, constraint: string): boolean {
  return violates(error, UNIQUE_VIOLATION, constraint);
}

function isCheckViolation(error: unknown, constraint: string): boolean {
  return violates(error, CHECK_VIOLATION, constraint);
}
