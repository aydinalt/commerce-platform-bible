import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  BoundedCorrectionUnavailableError,
  boundedCorrectionAvailable,
  CorrectionAreaNotTargetedError,
  type OfferingContentArea
} from "@commerce/business";
import type { OfferingAttributeValueInput } from "@commerce/contracts";
import {
  AttributeValueMismatchError,
  BusinessRestrictedError,
  composePublicEligibility,
  evaluatePublicationMinimum,
  OfferingAlreadyArchivedError,
  OFFERING_MODERATION_RESULT,
  offeringModerationPermitted,
  OfferingModerationUnavailableError,
  OfferingNotEditableError,
  OfferingNotPublishableError,
  OfferingSlugConflictError,
  PublicationMinimumError,
  RETIREABLE_LIFECYCLES,
  type OfferingLifecycle,
  type OfferingModerationAction
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
  visuals: string[];
}

interface DefinitionShape {
  optionIds: string[];
  valueKind: string;
}

export interface ApplicableAttributeRecord {
  id: string;
  name: string;
  options: { id: string; label: string }[];
  requiredForPublication: boolean;
  unit: string | null;
  valueKind: string;
}

/**
 * The Discovery projection, written from an Offering.
 *
 * Exported because it has a second caller: `US-BUS-F03-001` restores a
 * Business and every lifecycle-Published Offering has to reappear. A copy of
 * this query in a second file would be a copy that drifts.
 *
 * `$1` is the Offering, `$2` the eligibility version.
 */
export const PROJECT_OFFERING = `with path as (
         -- The active Category path, root first. A person recognises an
         -- Offering by where it sits, not only by its leaf.
         with recursive walk as (
           select c.id, c.parent_id, c.name, 0 as depth
           from category c
           join offering o on o.category_id = c.id
           where o.id = $1
           union all
           select parent.id, parent.parent_id, parent.name, walk.depth + 1
           from category parent join walk on walk.parent_id = parent.id
         )
         select string_agg(name, ' ' order by depth desc) as names from walk
       ),
       attributes as (
         -- Display values, not identifiers: the option label a person would
         -- read, and the scalar as it would be shown.
         select string_agg(
           coalesce(opt.label, v.text_value, v.number_value::text,
             case when v.boolean_value then 'true' else 'false' end),
           ' '
         ) as values
         from offering_attribute_value v
         left join attribute_option opt on opt.id = v.option_id
         where v.offering_id = $1
       )
       insert into offering_search_projection
         (offering_id, business_id, domain_id, category_id, title, summary,
          business_name, category_path, attribute_text, searchable_text,
          filter_values, published_at, eligibility_version, projected_at)
       select o.id, o.business_id, c.domain_id, o.category_id, o.title,
         o.summary, b.name,
         coalesce(path.names, c.name),
         coalesce(attributes.values, ''),
         concat_ws(' ', o.title, o.summary, b.name, coalesce(path.names, c.name),
           coalesce(attributes.values, '')),
         coalesce(
           (select jsonb_object_agg(v."attributeId", v.value)
            from (
              select av.attribute_definition_id::text as "attributeId",
                case
                  when count(av.option_id) > 0
                    then to_jsonb(array_remove(
                      array_agg(av.option_id::text order by av.option_id), null))
                  else coalesce(
                    to_jsonb(max(av.text_value)),
                    to_jsonb(max(av.number_value)),
                    to_jsonb(bool_or(av.boolean_value))
                  )
                end as value
              from offering_attribute_value av
              where av.offering_id = o.id
              group by av.attribute_definition_id
            ) v),
           '{}'::jsonb
         ),
         o.published_at, $2, now()
       from offering o
       join business b on b.id = o.business_id
       join category c on c.id = o.category_id
       cross join path
       cross join attributes
       where o.id = $1
       on conflict (offering_id) do update set
         business_id = excluded.business_id,
         domain_id = excluded.domain_id,
         category_id = excluded.category_id,
         title = excluded.title,
         summary = excluded.summary,
         business_name = excluded.business_name,
         category_path = excluded.category_path,
         attribute_text = excluded.attribute_text,
         searchable_text = excluded.searchable_text,
         filter_values = excluded.filter_values,
         published_at = excluded.published_at,
         eligibility_version = excluded.eligibility_version,
         projected_at = excluded.projected_at`;

@Injectable()
export class PgOfferingContentRepository {
  constructor(private readonly pool: Pool) {}

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
   * The Attributes the Offering's Category makes applicable.
   *
   * Read from the Offering rather than from a Category identifier the caller
   * supplies, so the definitions returned are the ones that govern *this*
   * Offering — the same join `assertPublishable` walks when it counts missing
   * required values, and the same one `edit` validates submitted values
   * against. A caller passing its own Category could be told about Attributes
   * the write path would then reject.
   *
   * Inactive definitions and retired options are excluded: `US-PLT-F09-001`
   * AC-11 and AC-12 stop new values being taken for either, so listing them
   * would offer something the write path refuses.
   */
  async applicableAttributes(
    offeringId: string
  ): Promise<ApplicableAttributeRecord[]> {
    const result = await this.pool.query<ApplicableAttributeRecord>(
      `select d.id, d.name, d.unit,
         d.required_for_publication as "requiredForPublication",
         d.value_kind::text as "valueKind",
         coalesce(
           (select json_agg(o order by o.label)
            from (
              select opt.id, opt.label
              from attribute_option opt
              where opt.attribute_definition_id = d.id and opt.active = true
            ) o),
           '[]'
         ) as options
       from offering off
       join category_attribute ca on ca.category_id = off.category_id
       join attribute_definition d on d.id = ca.attribute_definition_id
       where off.id = $1 and d.active = true
       order by ca.sort_order, d.name`,
      [offeringId]
    );
    return result.rows;
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
    visuals: string[];
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
      await this.replaceVisuals(client, input.offeringId, input.visuals);

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
   * Hide and Restore Offering (`US-PLT-F03-001`).
   *
   * One method for two actions, because they are one shape: check that the
   * lifecycle admits the action, apply the transition PRD-0001 owns, and let
   * the composition decide what that means for public eligibility.
   *
   * The interesting half is Restore. AC-8 forbids claiming eligibility just
   * because the lifecycle came back to Published, and the way to not claim it
   * is to ask: the Business's current exposure input is read here and fed to
   * `composePublicEligibility`, which may well answer `INELIGIBLE`. A Restored
   * Offering belonging to a Restricted Business stays out of Discovery, and
   * nothing in this method could have decided otherwise.
   *
   * AC-7 is the absence. Nothing here writes a Business moderation status, an
   * account status, an Affiliate Destination status, a validation result or a
   * Handoff Eligibility — and AC-9 is the same kind of absence: no case status
   * is touched, so a case stays Open until somebody closes it on purpose.
   */
  async moderate(input: {
    action: OfferingModerationAction;
    correlationId: string;
    offeringId: string;
    userId: string;
  }): Promise<OfferingContentRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const locked = await client.query<{
        businessId: string;
        publicExposure: string;
        status: OfferingLifecycle;
      }>(
        `select o.status::text as status, o.business_id as "businessId",
           b.public_exposure::text as "publicExposure"
         from offering o
         join business b on b.id = o.business_id
         where o.id = $1 for update of o`,
        [input.offeringId]
      );
      const current = locked.rows[0];
      if (!current) {
        await client.query("rollback");
        return null;
      }

      // AC-1 and AC-3. The one gate, asked of the authority that owns it.
      if (
        !offeringModerationPermitted({
          action: input.action,
          lifecycle: current.status
        })
      )
        throw new OfferingModerationUnavailableError(
          input.action,
          current.status
        );

      // AC-2 and AC-4. `published_at` is untouched by either transition: it
      // records when the Offering first became public, and being hidden and
      // shown again does not make that a different moment.
      const lifecycle = OFFERING_MODERATION_RESULT[input.action];
      await client.query(
        `update offering set status = $2::"OfferingStatus" where id = $1`,
        [input.offeringId, lifecycle]
      );

      // AC-5 and AC-8. A new evaluation appended to the sequence, never an
      // amendment: the earlier result was true of the state it was recorded
      // against.
      const eligibility = composePublicEligibility({
        businessExposure:
          current.publicExposure === "ELIGIBLE" ? "ELIGIBLE" : "INELIGIBLE",
        lifecycle
      });
      const version = await client.query<{ version: number }>(
        `insert into offering_publication
           (offering_id, status, eligibility_version, reason_code)
         values ($1, $2::"PublicationStatus",
           coalesce((select max(eligibility_version) + 1
                     from offering_publication where offering_id = $1), 1),
           $3)
         returning eligibility_version as version`,
        [input.offeringId, eligibility.status, eligibility.reason]
      );

      // Discovery follows the composed result rather than the lifecycle, which
      // is the same rule read from the other side: a Restore that composed
      // `INELIGIBLE` puts nothing back in front of anybody.
      if (eligibility.status === "ELIGIBLE")
        await this.project(
          client,
          input.offeringId,
          version.rows[0]?.version ?? 1
        );
      else
        await client.query(
          `delete from offering_search_projection where offering_id = $1`,
          [input.offeringId]
        );

      await client.query(
        `insert into audit_record
          (actor_user_id, effective_business_id, action, target_type, target_id,
           result, correlation_id)
         values ($1,$2,$5,'Offering',$3,'ALLOWED',$4)`,
        [
          input.userId,
          current.businessId,
          input.offeringId,
          input.correlationId,
          input.action === "HIDE_OFFERING"
            ? "offering.moderation.hide"
            : "offering.moderation.restore"
        ]
      );

      const moderated = await this.read(
        client,
        current.businessId,
        input.offeringId
      );
      await client.query("commit");
      return moderated;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The bounded correction edit (`US-BUS-F07-001` §8.3.1).
   *
   * It lives beside `edit` rather than in a correction-specific repository
   * because it writes Offering content, and Offering content is written in one
   * place. What makes it bounded is not where it lives but what it does: one
   * area, one Offering, and the same publication-minimum gate the ordinary edit
   * applies.
   *
   * Every gate is re-read inside the transaction that would perform the change.
   * A correction whose case closed between the owner opening the notice and
   * saving it must be refused, and the only way to be sure is to look while
   * holding the row.
   *
   * The absences are the Story. Nothing here writes an Offering status, a
   * `published_at`, a Business moderation status, an exposure input, an
   * `offering_publication` row or a Discovery projection — so AC-10 and AC-13
   * hold because there is no statement that could break them, and the case
   * stays Open (AC-12) for the same reason.
   */
  async saveCorrection(input: {
    area: OfferingContentArea;
    attributes: OfferingAttributeValueInput[] | null;
    businessId: string;
    correctionRequestId: string;
    correlationId: string;
    summary: string | null;
    title: string | null;
    userId: string;
  }): Promise<OfferingContentRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const targeted = await client.query<{
        caseStatus: "CLOSED" | "OPEN";
        contentArea: OfferingContentArea;
        lifecycle: OfferingLifecycle;
        offeringId: string;
      }>(
        `select r.offering_id as "offeringId",
           r.content_area::text as "contentArea",
           c.status::text as "caseStatus",
           o.status::text as lifecycle
         from correction_request r
         join moderation_case c on c.id = r.case_id
         join offering o on o.id = r.offering_id
         where r.id = $1 and r.business_id = $2
           and r.target = 'OFFERING_CONTENT'
         for update of o`,
        [input.correctionRequestId, input.businessId]
      );
      const target = targeted.rows[0];
      if (!target) {
        await client.query("rollback");
        return null;
      }

      // AC-8. The conjunction, asked once, of the authority that owns it.
      if (
        !boundedCorrectionAvailable({
          caseOpen: target.caseStatus === "OPEN",
          lifecycle: target.lifecycle,
          target: "OFFERING_CONTENT"
        })
      )
        throw new BoundedCorrectionUnavailableError(
          target.caseStatus === "OPEN"
            ? "OFFERING_NOT_TARGETABLE"
            : "CASE_CLOSED"
        );

      // AC-9. The area the owner sent must be the area the notice named.
      if (target.contentArea !== input.area)
        throw new CorrectionAreaNotTargetedError(input.area);

      if (input.area === "TITLE")
        await client.query(`update offering set title = $2 where id = $1`, [
          target.offeringId,
          input.title
        ]);
      else if (input.area === "SUMMARY")
        await client.query(`update offering set summary = $2 where id = $1`, [
          target.offeringId,
          input.summary
        ]);
      else
        await this.replaceAttributes(
          client,
          target.offeringId,
          input.attributes ?? []
        );

      // AC-11. Unconditional, because the bounded path only ever reaches a
      // Published or Hidden Offering — one that is already publicly promised.
      await this.assertPublicationMinimum(client, target.offeringId);

      // AC-14. The record of the response *is* the re-review requirement. The
      // trigger on this table re-checks the Open case and the exact target, so
      // even a future caller that skipped the checks above cannot write one.
      await client.query(
        `insert into correction_edit
           (correction_request_id, offering_id, content_area, edited_by)
         values ($1,$2,$3::"OfferingContentArea",$4)`,
        [input.correctionRequestId, target.offeringId, input.area, input.userId]
      );

      await client.query(
        `insert into audit_record
          (actor_user_id, effective_business_id, action, target_type, target_id,
           result, correlation_id, safe_metadata)
         values ($1,$2,'business.correction.save','Offering',$3,'ALLOWED',$4,$5)`,
        [
          input.userId,
          input.businessId,
          target.offeringId,
          input.correlationId,
          JSON.stringify({ area: input.area })
        ]
      );

      const saved = await this.read(
        client,
        input.businessId,
        target.offeringId
      );
      await client.query("commit");
      return saved;
    } catch (error) {
      await client.query("rollback");
      if (isCheckViolation(error, SINGLE_SELECT_ARITY_CONSTRAINT))
        throw new AttributeValueMismatchError("");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Draft → Published (`US-OFR-F04-001`).
   *
   * Every gate is checked inside the transaction that would perform the
   * transition, in the order the Story lists them: an owned Draft (AC-1), an
   * Unrestricted Business (AC-2), and the Universal Publication Minimum (AC-3).
   * Any of them failing leaves the Offering exactly where it was (AC-7), which
   * the rollback guarantees rather than the code remembering to undo.
   */
  async publish(input: {
    businessId: string;
    correlationId: string;
    offeringId: string;
    userId: string;
  }): Promise<OfferingContentRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const locked = await client.query<{
        moderation: string;
        publicExposure: string;
        status: OfferingLifecycle;
      }>(
        `select o.status::text as status,
           b.public_exposure::text as "publicExposure",
           coalesce(m.status::text, 'UNRESTRICTED') as moderation
         from offering o
         join business b on b.id = o.business_id
         left join business_moderation_state m on m.business_id = b.id
         where o.id = $1 and o.business_id = $2 for update of o`,
        [input.offeringId, input.businessId]
      );
      const current = locked.rows[0];
      if (!current) {
        await client.query("rollback");
        return null;
      }
      // AC-1. Publication acts on a Draft; anything else is not a publication
      // target, whatever else is true of it.
      if (current.status !== "DRAFT")
        throw new OfferingNotPublishableError(current.status);
      // AC-2, which PRD-0001 §6.1.1 keeps outside the publication minimum
      // precisely so it can be reported as its own refusal.
      if (current.moderation !== "UNRESTRICTED")
        throw new BusinessRestrictedError();

      // AC-3, evaluated before the transition rather than after: publication is
      // the moment the minimum starts to matter.
      await this.assertPublicationMinimum(client, input.offeringId);

      // AC-4 and AC-5. `coalesce` makes Initial Published At write-once: a
      // value that is already there survives, so no later transition can move
      // it.
      await client.query(
        `update offering
           set status = 'PUBLISHED', published_at = coalesce(published_at, now())
         where id = $1 and business_id = $2`,
        [input.offeringId, input.businessId]
      );

      // AC-6. The result is evaluated, not assumed: Published is one of two
      // inputs, and the composition is what decides.
      const eligibility = composePublicEligibility({
        businessExposure:
          current.publicExposure === "ELIGIBLE" ? "ELIGIBLE" : "INELIGIBLE",
        lifecycle: "PUBLISHED"
      });
      const version = await client.query<{ version: number }>(
        `insert into offering_publication
           (offering_id, status, eligibility_version, reason_code)
         values ($1, $2::"PublicationStatus",
           coalesce((select max(eligibility_version) + 1
                     from offering_publication where offering_id = $1), 1),
           $3)
         returning eligibility_version as version`,
        [input.offeringId, eligibility.status, eligibility.reason]
      );

      if (eligibility.status === "ELIGIBLE")
        await this.project(
          client,
          input.offeringId,
          version.rows[0]?.version ?? 1
        );

      await client.query(
        `insert into audit_record
          (actor_user_id, effective_business_id, action, target_type, target_id,
           result, correlation_id)
         values ($1,$2,'offering.publish','Offering',$3,'ALLOWED',$4)`,
        [input.userId, input.businessId, input.offeringId, input.correlationId]
      );

      const published = await this.read(
        client,
        input.businessId,
        input.offeringId
      );
      await client.query("commit");
      return published;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The Discovery read model, written only for an Offering whose evaluated
   * eligibility is `ELIGIBLE`.
   *
   * It is a denormalisation of rows that already exist — the derived Domain,
   * the Business display name, the Attribute values — assembled here so that
   * Discovery reads one table instead of joining six. `US-OFR-F03-001` already
   * deletes this row on retirement, so the pair is complete: this writes it,
   * that removes it, and nothing else touches it.
   *
   * `filter_values` maps each Attribute to what an Offering holds for it —
   * a scalar, or the list of chosen options. Building half of it now would
   * guarantee rewriting it when `US-DSC-F05-001` arrives.
   */
  private async project(
    client: PoolClient,
    offeringId: string,
    eligibilityVersion: number
  ): Promise<void> {
    await client.query(PROJECT_OFFERING, [offeringId, eligibilityVersion]);
  }

  /**
   * Owner retirement (`US-OFR-F03-001`).
   *
   * Everything that makes the Offering non-public happens in the transaction
   * that archives it: the lifecycle moves, a fresh evaluation records the new
   * Ineligible result (AC-3), and any Discovery projection is removed (AC-4).
   * Nothing that constitutes the record itself is touched — the Category,
   * Attribute values and their history survive intact (AC-5), which is what
   * separates retirement from deletion.
   */
  async retire(input: {
    businessId: string;
    correlationId: string;
    offeringId: string;
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
      if (!RETIREABLE_LIFECYCLES.includes(current.status))
        throw new OfferingAlreadyArchivedError();

      await client.query(
        `update offering set status = 'ARCHIVED', archived_at = now()
         where id = $1 and business_id = $2`,
        [input.offeringId, input.businessId]
      );

      // AC-3. A new evaluation rather than an amended one: the earlier result
      // was true of the state it was recorded against, and PRD-0001 keeps the
      // sequence rather than overwriting it.
      const eligibility = composePublicEligibility({
        businessExposure: "ELIGIBLE",
        lifecycle: "ARCHIVED"
      });
      await client.query(
        `insert into offering_publication
           (offering_id, status, eligibility_version, reason_code)
         values ($1, $2::"PublicationStatus",
           coalesce((select max(eligibility_version) + 1
                     from offering_publication where offering_id = $1), 1),
           $3)`,
        [input.offeringId, eligibility.status, eligibility.reason]
      );

      // AC-4. Nothing writes this projection yet — `US-OFR-F04-001` will — but
      // removing it here is what keeps the promise once something does, rather
      // than leaving a future Story to remember it.
      await client.query(
        `delete from offering_search_projection where offering_id = $1`,
        [input.offeringId]
      );

      await client.query(
        `insert into audit_record
          (actor_user_id, effective_business_id, action, target_type, target_id,
           result, correlation_id)
         values ($1,$2,'offering.retire','Offering',$3,'ALLOWED',$4)`,
        [input.userId, input.businessId, input.offeringId, input.correlationId]
      );

      const retired = await this.read(
        client,
        input.businessId,
        input.offeringId
      );
      await client.query("commit");
      return retired;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /// The historical record as an authorized Admin sees it (AC-6). Ownership is
  /// not part of the lookup: an Admin is not the owner and still must be able
  /// to read it.
  async findForAdmin(
    offeringId: string
  ): Promise<OfferingContentRecord | null> {
    const client = await this.pool.connect();
    try {
      return await this.read(client, null, offeringId);
    } finally {
      client.release();
    }
  }

  /**
   * The submitted addresses replace the stored ones, in the order they arrive.
   *
   * **The array's index is the `position` column**, so the owner expresses
   * "this is the primary visual" by putting it first rather than by setting a
   * flag that could contradict the ordering. Delete-then-insert rather than a
   * diff: an ordering is not a set of independent rows, and computing the
   * minimal set of moves would be a second place where the arrangement is
   * decided.
   *
   * Nothing here validates the address. `US-BUS-F02-001` Out of Scope §11
   * excludes technical URL validation and the contract bounds the length; what
   * the application is willing to render is decided at render, in
   * `apps/web/src/image-source.ts`.
   */
  private async replaceVisuals(
    client: PoolClient,
    offeringId: string,
    visuals: string[]
  ): Promise<void> {
    await client.query(`delete from offering_visual where offering_id = $1`, [
      offeringId
    ]);
    if (visuals.length === 0) return;
    await client.query(
      `insert into offering_visual (offering_id, position, url)
       select $1, ordinality - 1, url
       from unnest($2::text[]) with ordinality as t(url, ordinality)`,
      [offeringId, visuals]
    );
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

  /// `businessId` is `null` for the Admin read, where ownership is not the
  /// question being asked.
  private async read(
    client: PoolClient,
    businessId: string | null,
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
         ) as attributes,
         -- In position order, so the owner reads back the arrangement they
         -- saved rather than whatever order the rows happen to come out in.
         coalesce(
           (select array_agg(v.url order by v.position)
            from offering_visual v where v.offering_id = o.id),
           '{}'
         ) as visuals
       from offering o
       where o.id = $1 and ($2::uuid is null or o.business_id = $2)`,
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
