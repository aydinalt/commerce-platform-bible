import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  ACTIVE_LIFECYCLE_STATES,
  AttributeKeyConflictError,
  AttributeMutationBlockedError,
  AttributeOptionsExhaustedError,
  AttributeShapeError,
  SELECT_VALUE_KINDS,
  type AttributeDefinitionRecord,
  type AttributeValueKind
} from "@commerce/catalog";

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

const TEXT_FILTERABLE_CONSTRAINT = "attribute_definition_text_not_filterable";
const UNIT_CONSTRAINT = "attribute_definition_unit_belongs_to_number";
const LAST_OPTION_CONSTRAINT = "attribute_option_at_least_one_active";
const STABLE_KEY_CONSTRAINT = "attribute_definition_stable_key_key";
const OPTION_KEY_CONSTRAINT =
  "attribute_option_attribute_definition_id_stable_key_key";

function violates(error: unknown, code: string, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return candidate.code === code && candidate.constraint === constraint;
}

/**
 * One definition with its applicability and its allowed values, assembled in a
 * single statement. AC-1 treats those as one property set, so reading them
 * separately would let a caller see a definition that was briefly missing half
 * of itself.
 */
const DEFINITION_QUERY = `
  select d.id, d.stable_key as "stableKey", d.name,
    d.value_kind as "valueKind", d.unit, d.filterable, d.comparable,
    d.required_for_publication as "requiredForPublication", d.active,
    coalesce(
      (select array_agg(ca.category_id order by ca.category_id)
       from category_attribute ca where ca.attribute_definition_id = d.id),
      '{}'
    ) as "categoryIds",
    coalesce(
      (select json_agg(json_build_object(
         'active', o.active, 'id', o.id, 'label', o.label,
         'stableKey', o.stable_key) order by o.sort_order, o.stable_key)
       from attribute_option o where o.attribute_definition_id = d.id),
      '[]'
    ) as options
  from attribute_definition d`;

@Injectable()
export class PgAttributeRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  list(): Promise<AttributeDefinitionRecord[]> {
    return this.pool
      .query<AttributeDefinitionRecord>(`${DEFINITION_QUERY} order by d.name`)
      .then((result) => result.rows);
  }

  /**
   * Creates the whole definition at once: properties, applicability and, for a
   * Select kind, its allowed values (AC-1, AC-4). A Select that arrived with no
   * allowed value is refused before anything is written, so no definition ever
   * exists in a state AC-4 forbids — not even briefly.
   */
  async create(input: {
    categoryIds: string[];
    comparable: boolean;
    correlationId: string;
    filterable: boolean;
    name: string;
    options: { label: string; stableKey: string }[];
    stableKey: string;
    unit: string | null;
    userId: string;
    valueKind: AttributeValueKind;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      if (
        SELECT_VALUE_KINDS.includes(input.valueKind) &&
        input.options.length === 0
      )
        throw new AttributeOptionsExhaustedError();

      const created = await client.query<{ id: string }>(
        `insert into attribute_definition
           (stable_key, name, value_kind, unit, filterable, comparable)
         values ($1,$2,$3,$4,$5,$6) returning id`,
        [
          input.stableKey,
          input.name,
          input.valueKind,
          input.unit,
          input.filterable,
          input.comparable
        ]
      );
      const id = created.rows[0]?.id;
      if (id === undefined) throw new Error("ATTRIBUTE_INSERT_FAILED");

      for (const [index, option] of input.options.entries())
        await client.query(
          `insert into attribute_option
             (attribute_definition_id, stable_key, label, sort_order)
           values ($1,$2,$3,$4)`,
          [id, option.stableKey, option.label, index]
        );

      const applied = await this.applyCategories(client, id, input.categoryIds);
      if (!applied) return null;

      await this.audit(client, {
        action: "attribute.create",
        attributeId: id,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, id);
    });
  }

  /**
   * The properties an edit may change freely (AC-13). Filterable and comparable
   * affect future Discovery and Compare presentation only, and no Offering
   * lifecycle moves because of them — which is why this statement touches
   * neither the value kind nor the applicability.
   */
  async updateProperties(input: {
    attributeId: string;
    comparable: boolean;
    correlationId: string;
    filterable: boolean;
    name: string;
    unit: string | null;
    userId: string;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      const updated = await client.query<{ id: string }>(
        `update attribute_definition
           set name = $2, unit = $3, filterable = $4, comparable = $5
         where id = $1 returning id`,
        [
          input.attributeId,
          input.name,
          input.unit,
          input.filterable,
          input.comparable
        ]
      );
      if (!updated.rows[0]) return null;
      await this.audit(client, {
        action: "attribute.properties.update",
        attributeId: input.attributeId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.attributeId);
    });
  }

  /**
   * AC-9. A value kind may change only while nothing depends on the old
   * meaning: reinterpreting a stored Text as a Number is exactly the silent
   * reinterpretation AC-12 forbids.
   */
  async changeValueKind(input: {
    attributeId: string;
    correlationId: string;
    userId: string;
    valueKind: AttributeValueKind;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      const locked = await client.query<{ id: string }>(
        `select id from attribute_definition where id = $1 for update`,
        [input.attributeId]
      );
      if (!locked.rows[0]) return null;

      if (await this.hasActiveValues(client, input.attributeId))
        throw new AttributeMutationBlockedError("VALUE_KIND_IN_USE");

      await client.query(
        `update attribute_definition set value_kind = $2 where id = $1`,
        [input.attributeId, input.valueKind]
      );
      await this.audit(client, {
        action: "attribute.value-kind.change",
        attributeId: input.attributeId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.attributeId);
    });
  }

  /**
   * Replaces the applicable Category set. Additions are free (AC-6); a removal
   * is refused while any active-lifecycle Offering in that Category holds a
   * value for this definition (AC-8).
   */
  async setCategories(input: {
    attributeId: string;
    categoryIds: string[];
    correlationId: string;
    userId: string;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      const locked = await client.query<{ id: string }>(
        `select id from attribute_definition where id = $1 for update`,
        [input.attributeId]
      );
      if (!locked.rows[0]) return null;

      const used = await client.query(
        `select 1
         from category_attribute ca
         join offering o
           on o.category_id = ca.category_id
          and o.status = any($3::"OfferingStatus"[])
         join offering_attribute_value v
           on v.offering_id = o.id
          and v.attribute_definition_id = ca.attribute_definition_id
         where ca.attribute_definition_id = $1
           and ca.category_id <> all($2::uuid[])
         limit 1`,
        [input.attributeId, input.categoryIds, ACTIVE_LIFECYCLE_STATES]
      );
      if (used.rowCount === 1)
        throw new AttributeMutationBlockedError("APPLICABILITY_IN_USE");

      await client.query(
        `delete from category_attribute
         where attribute_definition_id = $1 and category_id <> all($2::uuid[])`,
        [input.attributeId, input.categoryIds]
      );
      const applied = await this.applyCategories(
        client,
        input.attributeId,
        input.categoryIds
      );
      if (!applied) return null;

      await this.audit(client, {
        action: "attribute.applicability.set",
        attributeId: input.attributeId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.attributeId);
    });
  }

  /**
   * AC-7. Turning the flag on is a promise about Offerings that already exist,
   * so it is refused unless every Published and Hidden Offering in every
   * applicable Category already holds a value. Turning it off promises nothing
   * and is therefore never blocked.
   */
  async setRequiredForPublication(input: {
    attributeId: string;
    correlationId: string;
    required: boolean;
    userId: string;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      const locked = await client.query<{ id: string }>(
        `select id from attribute_definition where id = $1 for update`,
        [input.attributeId]
      );
      if (!locked.rows[0]) return null;

      if (input.required) {
        const missing = await client.query(
          `select 1
           from category_attribute ca
           join offering o
             on o.category_id = ca.category_id
            and o.status in ('PUBLISHED','HIDDEN')
           where ca.attribute_definition_id = $1
             and not exists (
               select 1 from offering_attribute_value v
               where v.offering_id = o.id
                 and v.attribute_definition_id = $1
             )
           limit 1`,
          [input.attributeId]
        );
        if (missing.rowCount === 1)
          throw new AttributeMutationBlockedError("MISSING_REQUIRED_VALUES");
      }

      await client.query(
        `update attribute_definition
           set required_for_publication = $2 where id = $1`,
        [input.attributeId, input.required]
      );
      await this.audit(client, {
        action: "attribute.required.set",
        attributeId: input.attributeId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.attributeId);
    });
  }

  /// Adding an allowed value takes nothing away, so it needs no guard (AC-6).
  async addOption(input: {
    attributeId: string;
    correlationId: string;
    label: string;
    stableKey: string;
    userId: string;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      const definition = await client.query<{ valueKind: string }>(
        `select value_kind as "valueKind" from attribute_definition
         where id = $1 for update`,
        [input.attributeId]
      );
      const found = definition.rows[0];
      if (!found) return null;
      // Only a Select kind has allowed values at all (AC-2, AC-4).
      if (!SELECT_VALUE_KINDS.includes(found.valueKind as AttributeValueKind))
        throw new AttributeShapeError("OPTIONS_NOT_SELECT");

      await client.query(
        `insert into attribute_option
           (attribute_definition_id, stable_key, label, sort_order)
         values ($1,$2,$3,
           coalesce((select max(sort_order) + 1 from attribute_option
                     where attribute_definition_id = $1), 0))`,
        [input.attributeId, input.stableKey, input.label]
      );
      await this.audit(client, {
        action: "attribute.option.add",
        attributeId: input.attributeId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.attributeId);
    });
  }

  /**
   * AC-10. Relabelling a value in use changes what an existing Offering appears
   * to say, which is the same harm as removing it — so both are refused on the
   * same condition rather than only the obvious one.
   */
  async relabelOption(input: {
    attributeId: string;
    correlationId: string;
    label: string;
    optionId: string;
    userId: string;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      const locked = await client.query<{ id: string }>(
        `select id from attribute_option
         where id = $1 and attribute_definition_id = $2 for update`,
        [input.optionId, input.attributeId]
      );
      if (!locked.rows[0]) return null;

      if (await this.optionInUse(client, input.optionId))
        throw new AttributeMutationBlockedError("OPTION_IN_USE");

      await client.query(
        `update attribute_option set label = $2 where id = $1`,
        [input.optionId, input.label]
      );
      await this.audit(client, {
        action: "attribute.option.relabel",
        attributeId: input.attributeId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.attributeId);
    });
  }

  /**
   * Retirement, not deletion (AC-15). The row survives so that an Archived
   * Offering pointing at it stays readable (AC-11) and no stored value is
   * discarded (AC-12).
   */
  async retireOption(input: {
    attributeId: string;
    correlationId: string;
    optionId: string;
    userId: string;
  }): Promise<AttributeDefinitionRecord | null> {
    return this.write(async (client) => {
      const locked = await client.query<{ id: string }>(
        `select id from attribute_option
         where id = $1 and attribute_definition_id = $2 for update`,
        [input.optionId, input.attributeId]
      );
      if (!locked.rows[0]) return null;

      if (await this.optionInUse(client, input.optionId))
        throw new AttributeMutationBlockedError("OPTION_IN_USE");

      await client.query(
        `update attribute_option set active = false where id = $1`,
        [input.optionId]
      );
      await this.audit(client, {
        action: "attribute.option.retire",
        attributeId: input.attributeId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.attributeId);
    });
  }

  private async hasActiveValues(
    client: PoolClient,
    attributeId: string
  ): Promise<boolean> {
    const used = await client.query(
      `select 1 from offering_attribute_value v
       join offering o on o.id = v.offering_id
       where v.attribute_definition_id = $1
         and o.status = any($2::"OfferingStatus"[])
       limit 1`,
      [attributeId, ACTIVE_LIFECYCLE_STATES]
    );
    return used.rowCount === 1;
  }

  private async optionInUse(
    client: PoolClient,
    optionId: string
  ): Promise<boolean> {
    const used = await client.query(
      `select 1 from offering_attribute_value v
       join offering o on o.id = v.offering_id
       where v.option_id = $1 and o.status = any($2::"OfferingStatus"[])
       limit 1`,
      [optionId, ACTIVE_LIFECYCLE_STATES]
    );
    return used.rowCount === 1;
  }

  /**
   * Applicability points at Categories, so an unknown one must not become a
   * silently missing link. The insert selects from `category`, and a count that
   * falls short means at least one identifier named nothing.
   */
  private async applyCategories(
    client: PoolClient,
    attributeId: string,
    categoryIds: string[]
  ): Promise<boolean> {
    if (categoryIds.length === 0) return true;
    await client.query(
      `insert into category_attribute (category_id, attribute_definition_id)
       select c.id, $1 from category c where c.id = any($2::uuid[])
       on conflict do nothing`,
      [attributeId, categoryIds]
    );
    const present = await client.query<{ total: number }>(
      `select count(*)::int as total from category_attribute
       where attribute_definition_id = $1 and category_id = any($2::uuid[])`,
      [attributeId, categoryIds]
    );
    return present.rows[0]?.total === categoryIds.length;
  }

  private async readWithin(
    client: PoolClient,
    attributeId: string
  ): Promise<AttributeDefinitionRecord> {
    const result = await client.query<AttributeDefinitionRecord>(
      `${DEFINITION_QUERY} where d.id = $1`,
      [attributeId]
    );
    const definition = result.rows[0];
    if (!definition) throw new Error("ATTRIBUTE_DISAPPEARED");
    return definition;
  }

  private async audit(
    client: PoolClient,
    entry: {
      action: string;
      attributeId: string;
      correlationId: string;
      userId: string;
    }
  ): Promise<void> {
    await client.query(
      `insert into audit_record
        (actor_user_id, action, target_type, target_id, result, correlation_id)
       values ($1,$2,'AttributeDefinition',$3,'ALLOWED',$4)`,
      [entry.userId, entry.action, entry.attributeId, entry.correlationId]
    );
  }

  /**
   * AC-16: a failed save claims no definition change. The rollback is what
   * makes that true; translating the constraint failures here is what lets the
   * caller say which rule refused.
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

function translate(error: unknown): unknown {
  if (violates(error, CHECK_VIOLATION, TEXT_FILTERABLE_CONSTRAINT))
    return new AttributeShapeError("TEXT_FILTERABLE");
  if (violates(error, CHECK_VIOLATION, UNIT_CONSTRAINT))
    return new AttributeShapeError("UNIT_NOT_NUMBER");
  if (violates(error, CHECK_VIOLATION, LAST_OPTION_CONSTRAINT))
    return new AttributeOptionsExhaustedError();
  if (violates(error, UNIQUE_VIOLATION, STABLE_KEY_CONSTRAINT))
    return new AttributeKeyConflictError("STABLE_KEY");
  if (violates(error, UNIQUE_VIOLATION, OPTION_KEY_CONSTRAINT))
    return new AttributeKeyConflictError("OPTION_KEY");
  return error;
}
