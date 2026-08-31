import { PRIMARY_VISUAL_SQL } from "./listing-card.sql.js";

import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  FILTERABLE_VALUE_KINDS,
  FilterContextMissingError,
  FilterNotAvailableError,
  SEARCH_MATCH_LEVELS,
  zeroResultRecovery,
  type AppliedFilter,
  type AvailableFilter,
  type BrowseCategory,
  type BrowseView,
  type ListingCard,
  type SearchResult,
  type SearchView,
  type ZeroResults
} from "@commerce/discovery";

/**
 * A Category as Browse sees it. `leaf` is derived rather than stored: a
 * Category becomes a branch the moment an active child appears under it, and
 * stops being one when that child retires.
 */
const BROWSE_CATEGORY = `c.id, c.name, c.slug,
   not exists (
     select 1 from category child
     where child.parent_id = c.id and child.active = true
   ) as leaf`;

/**
 * Turns applied Filters into one SQL predicate and its parameters.
 *
 * PRD-0002 §10.3 gives two combination rules and they are both here: values
 * within one Select Filter are OR'd by `?|`, and different Filters are AND'd by
 * the join below. Nothing about that is per-call policy — it is the same
 * sentence written in SQL.
 *
 * Every predicate begins by requiring the key to be present, because AC-9 makes
 * an Offering with no value for an applied Filter fail it. Without that, a
 * missing value would compare as unknown and quietly disappear from the
 * question.
 */
function filterPredicate(
  filters: AppliedFilter[],
  firstParameter: number
): { parameters: unknown[]; sql: string } {
  const parameters: unknown[] = [];
  const clauses: string[] = [];
  let next = firstParameter;

  for (const filter of filters) {
    const key = `$${next++}`;
    parameters.push(filter.attributeId);

    if (filter.kind === "NUMBER") {
      const bounds: string[] = [];
      if (filter.min !== null) {
        bounds.push(`(p.filter_values->>${key})::numeric >= $${next++}`);
        parameters.push(filter.min);
      }
      if (filter.max !== null) {
        bounds.push(`(p.filter_values->>${key})::numeric <= $${next++}`);
        parameters.push(filter.max);
      }
      // Inclusive bounds (AC-3). A Filter with neither bound still requires a
      // value: it asks for Offerings that have this Attribute at all.
      clauses.push([`p.filter_values ? ${key}`, ...bounds].join(" and "));
      continue;
    }

    if (filter.kind === "BOOLEAN") {
      // The exact selected value, never a coercion (AC-4).
      clauses.push(
        `p.filter_values ? ${key} and p.filter_values->${key} = to_jsonb($${next++}::boolean)`
      );
      parameters.push(filter.value);
      continue;
    }

    // AC-5 and AC-6 are one operator: `?|` is true when the Offering's stored
    // option set contains any of the selected values. A Single Select stores
    // one, a Multi Select several, and "intersects at least one" covers both.
    clauses.push(
      `p.filter_values ? ${key} and p.filter_values->${key} ?| $${next++}::text[]`
    );
    parameters.push(filter.optionIds);
  }

  return {
    parameters,
    // AC-7 and AC-8: different Filters, the Category and the Search match are
    // all conjoined.
    sql: clauses.map((clause) => `and (${clause})`).join(" ")
  };
}

/**
 * Zero Results, assembled from criteria that are already in hand.
 *
 * Nothing here is recomputed and nothing is dropped: `US-DSC-F08-001` AC-2
 * requires the query, Category and Filters to survive, and AC-7 forbids
 * removing any of them silently. Handing back what was asked is what lets a
 * person decide which part to change.
 */
function zeroResults(input: {
  applied: AppliedFilter[];
  available: AvailableFilter[];
  categoryName: string | null;
  hasParentCategory: boolean;
  query: string | null;
}): ZeroResults {
  const offered = new Map(input.available.map((f) => [f.attributeId, f]));
  return {
    criteria: {
      categoryName: input.categoryName,
      filters: input.applied.map((filter) => {
        const definition = offered.get(filter.attributeId);
        const labels =
          filter.kind === "SELECT"
            ? filter.optionIds.map(
                (id) =>
                  definition?.options.find((o) => o.id === id)?.label ?? id
              )
            : [];
        return {
          attributeId: filter.attributeId,
          kind: definition?.valueKind ?? "NUMBER",
          max: filter.kind === "NUMBER" ? filter.max : null,
          min: filter.kind === "NUMBER" ? filter.min : null,
          name: definition?.name ?? "",
          optionLabels: labels,
          value: filter.kind === "BOOLEAN" ? filter.value : null
        };
      }),
      query: input.query
    },
    recovery: zeroResultRecovery({
      filterCount: input.applied.length,
      hasParentCategory: input.hasParentCategory,
      hasQuery: input.query !== null
    })
  };
}

@Injectable()
export class PgDiscoveryRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * The active root Categories, grouped by Domain.
   *
   * Choosing from this list is what begins a Browse path, so nothing here
   * records a Discovery Start: no Category has been selected yet.
   */
  async browseRoots(): Promise<
    { categories: BrowseCategory[]; domain: string; domainName: string }[]
  > {
    const result = await this.pool.query<
      BrowseCategory & { domain: string; domainName: string }
    >(
      `select ${BROWSE_CATEGORY}, d.stable_key as domain, d.name as "domainName"
       from category c
       join domain d on d.id = c.domain_id
       where c.parent_id is null and c.active = true and d.active = true
       order by d.stable_key, c.name`
    );
    /*
     * Keyed by the stable key and carrying the name beside it. Grouping by the
     * name instead would merge two Domains that happened to share one, which a
     * unique `stable_key` and a non-unique `name` make possible.
     */
    const byDomain = new Map<
      string,
      { categories: BrowseCategory[]; name: string }
    >();
    for (const row of result.rows) {
      const { domain, domainName, ...category } = row;
      const held = byDomain.get(domain) ?? { categories: [], name: domainName };
      held.categories.push(category);
      byDomain.set(domain, held);
    }
    return [...byDomain].map(([domain, held]) => ({
      categories: held.categories,
      domain,
      domainName: held.name
    }));
  }

  /**
   * One point in a Browse path.
   *
   * The Discovery Start is written in the same transaction that reads the view,
   * because AC-1 ties the occurrence to the selection rather than to a separate
   * call a client might forget to make.
   */
  async browse(input: {
    categoryId: string;
    filters: AppliedFilter[];
    pathId: string;
  }): Promise<BrowseView | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const found = await client.query<
        BrowseCategory & {
          domain: string;
          domainId: string;
          domainName: string;
          parentId: string | null;
        }
      >(
        `select ${BROWSE_CATEGORY}, c.parent_id as "parentId",
           c.domain_id as "domainId", d.stable_key as domain,
           d.name as "domainName"
         from category c
         join domain d on d.id = c.domain_id
         where c.id = $1 and c.active = true`,
        [input.categoryId]
      );
      const current = found.rows[0];
      // AC-4. A retired Category is not a Browse destination, so it reads the
      // same way as one that never existed.
      if (!current) {
        await client.query("rollback");
        return null;
      }

      // AC-1 and AC-8. The insert is the whole rule: a path that already has a
      // Start keeps it, and a descendant selection adds none.
      await client.query(
        `insert into discovery_start (path_id, kind, domain_id)
         values ($1, 'BROWSE', $2)
         on conflict (path_id) do nothing`,
        [input.pathId, current.domainId]
      );

      const { domain, domainId, domainName, parentId, ...category } = current;
      void domainId;

      const children = await this.categories(
        client,
        `c.parent_id = $1 and c.active = true`,
        [input.categoryId]
      );
      const siblings =
        parentId === null
          ? await this.categories(
              client,
              `c.parent_id is null and c.domain_id = $1 and c.active = true
               and c.id <> $2`,
              [current.domainId, input.categoryId]
            )
          : await this.categories(
              client,
              `c.parent_id = $1 and c.active = true and c.id <> $2`,
              [parentId, input.categoryId]
            );
      const ancestors = await this.ancestors(client, input.categoryId);

      // `US-DSC-F05-001` AC-1. A branch is not a leaf, so it offers no Filters
      // for the same reason it withholds Results.
      const filters = category.leaf
        ? await this.availableFilters(client, input.categoryId)
        : [];
      if (input.filters.length > 0) {
        if (!category.leaf) throw new FilterContextMissingError();
        this.assertApplicable(filters, input.filters);
      }

      // AC-5, AC-6 and AC-7 of `US-DSC-F03-001`. A branch withholds Results
      // rather than showing an empty set or gathering its descendants' —
      // `null` says "not shown", and an empty array would say "none here".
      const results = category.leaf
        ? await this.results(client, input.categoryId, input.filters)
        : null;

      await client.query("commit");
      return {
        ancestors,
        category,
        children,
        discoveryPathId: input.pathId,
        domain,
        domainName,
        filters,
        results,
        siblings,
        // AC-1. A branch has withheld Results rather than found none, so it is
        // not a Zero Results state — there was no question to answer.
        zeroResults:
          results !== null && results.length === 0
            ? zeroResults({
                applied: input.filters,
                available: filters,
                categoryName: category.name,
                hasParentCategory: parentId !== null,
                query: null
              })
            : null
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Search (`US-DSC-F02-001`).
   *
   * Membership and level are two different questions asked of the same terms.
   * An Offering is a candidate when every term appears somewhere in the
   * approved searchable set — that is what makes the relationship meaningful
   * rather than incidental. Its level is then the best field that relates to
   * *any* term, because a query spanning a title word and a Business word
   * still has a title relationship.
   *
   * Nothing outside the projection is consulted, which is how AC-4 holds: the
   * telephone, the email, the contact URL, the Affiliate Destination, the
   * Draft and the Archived record are not excluded from matching — they were
   * never in the set being matched.
   */
  async search(input: {
    categoryId: string | null;
    filters: AppliedFilter[];
    pathId: string;
    query: string;
    terms: string[];
  }): Promise<SearchView | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      // `US-DSC-F04-001` AC-3 narrows to an *active leaf*. A branch or a
      // retired Category is not a narrowing target, so it reads as absent.
      let narrowedTo: {
        categoryName: string;
        domain: string;
        domainId: string;
        domainName: string;
        hasParent: boolean;
      } | null = null;
      if (input.categoryId !== null) {
        const leaf = await client.query<{
          categoryName: string;
          domain: string;
          domainId: string;
          domainName: string;
          hasParent: boolean;
        }>(
          `select d.stable_key as domain, c.domain_id as "domainId",
             d.name as "domainName",
             c.name as "categoryName", c.parent_id is not null as "hasParent"
           from category c join domain d on d.id = c.domain_id
           where c.id = $1 and c.active = true and not exists (
             select 1 from category child
             where child.parent_id = c.id and child.active = true
           )`,
          [input.categoryId]
        );
        narrowedTo = leaf.rows[0] ?? null;
        if (!narrowedTo) {
          await client.query("rollback");
          return null;
        }
      }

      // AC-1 of `US-DSC-F02-001`, and AC-4 of this Story: the path is Search
      // and stays Search. No Browse Start is created here or anywhere on this
      // route.
      await client.query(
        `insert into discovery_start (path_id, kind, domain_id)
         values ($1, 'SEARCH', null)
         on conflict (path_id) do nothing`,
        [input.pathId]
      );

      // AC-5. The Start it already has gains the Domain, rather than a second
      // Start being created to carry it. `domain_id is null` keeps the first
      // association: the Start records where the looking began.
      if (narrowedTo !== null)
        await client.query(
          `update discovery_start set domain_id = $2
           where path_id = $1 and kind = 'SEARCH' and domain_id is null`,
          [input.pathId, narrowedTo.domainId]
        );

      // `US-DSC-F05-001` AC-1: Filters exist only inside one active leaf
      // Category. A Search that still spans several has nothing to filter on.
      const filters =
        input.categoryId === null
          ? []
          : await this.availableFilters(client, input.categoryId);
      if (input.filters.length > 0) {
        if (input.categoryId === null) throw new FilterContextMissingError();
        this.assertApplicable(filters, input.filters);
      }

      const all = input.terms.join(" & ");
      const any = input.terms.join(" | ");
      // `US-DSC-F05-001` AC-8. The Search match, the Category and every Filter
      // are conjoined in one `where`; PRD-0002 §12.4 keeps Best Match ordering
      // across them, which is why the `order by` below does not consult them.
      const applied = filterPredicate(input.filters, 5);
      const found = await client.query<
        Omit<SearchResult, "publishedAt"> & { publishedAt: Date }
      >(
        // The match level is computed in an inner query so the ordering can
        // name it. PostgreSQL only accepts an output column in `order by` as a
        // bare name, not inside an expression, and the level is the input to
        // one.
        `select "offeringId", title, "businessName", "categoryName", slug,
           "publishedAt", "primaryVisualUrl", "matchLevel"
         from (
           select p.offering_id as "offeringId", p.title,
             p.business_name as "businessName", c.name as "categoryName",
             o.slug, p.published_at as "publishedAt",
             ${PRIMARY_VISUAL_SQL},
             case
               when to_tsvector('simple', p.title) @@ to_tsquery('simple', $2)
                 then 'TITLE'
               when to_tsvector('simple', p.category_path) @@ to_tsquery('simple', $2)
                 then 'CATEGORY_PATH'
               when to_tsvector('simple', p.business_name) @@ to_tsquery('simple', $2)
                 then 'BUSINESS_NAME'
               else 'DESCRIPTION_OR_ATTRIBUTE'
             end as "matchLevel"
           from offering_search_projection p
           join offering o on o.id = p.offering_id
           join category c on c.id = p.category_id
           where to_tsvector('simple', p.searchable_text)
             @@ to_tsquery('simple', $1)
             and ($3::uuid is null or p.category_id = $3)
             ${applied.sql}
         ) matched
         -- US-DSC-F07-001 AC-1 to AC-3, in that order. The priority is not
         -- written out again here: array_position reads it from the module's
         -- list, so PRD-0002 12.2 is stated once and consulted twice.
         order by array_position($4::text[], "matchLevel"),
           "publishedAt" desc, "offeringId"`,
        [all, any, input.categoryId, SEARCH_MATCH_LEVELS, ...applied.parameters]
      );

      // AC-1. Computed from the *unnarrowed* set, so choosing one leaf never
      // hides the others a person might have meant.
      const reachable = await client.query<BrowseCategory>(
        `select c.id, c.name, c.slug, true as leaf
         from offering_search_projection p
         join category c on c.id = p.category_id
         where to_tsvector('simple', p.searchable_text)
           @@ to_tsquery('simple', $1)
         group by c.id, c.name, c.slug
         order by c.name`,
        [all]
      );

      await client.query("commit");
      return {
        categoryId: input.categoryId,
        discoveryPathId: input.pathId,
        domain: narrowedTo?.domain ?? null,
        domainName: narrowedTo?.domainName ?? null,
        filters,
        // `US-DSC-F04-001` AC-6's gate, now with something behind it.
        filtersAvailable: narrowedTo !== null,
        narrowing: reachable.rows.length > 1 ? reachable.rows : [],
        query: input.query,
        results: found.rows.map((row) => ({
          ...row,
          publishedAt: row.publishedAt.toISOString()
        })),
        // AC-1. The query stays visible beside the emptiness it produced.
        zeroResults:
          found.rows.length === 0
            ? zeroResults({
                applied: input.filters,
                available: filters,
                categoryName: narrowedTo?.categoryName ?? null,
                hasParentCategory: narrowedTo?.hasParent ?? false,
                query: input.query
              })
            : null
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The Listing Cards for one active leaf Category.
   *
   * The projection is the only eligibility input: a row is there because
   * publication evaluated the Offering as Eligible, and retirement removes it.
   * PRD-0002 §12 orders Browse by later Initial Published At first.
   *
   * The Category display name is joined rather than projected, so a rename
   * shows immediately — `US-PLT-F08-001` AC-3 keeps identity stable across one.
   */
  private async results(
    client: PoolClient,
    categoryId: string,
    filters: AppliedFilter[]
  ): Promise<ListingCard[]> {
    // PRD-0002 §12.4: a filtered Browse keeps Browse's ordering. Filters narrow
    // the set; they do not change how it is arranged.
    const applied = filterPredicate(filters, 2);
    const result = await client.query<
      Omit<ListingCard, "publishedAt"> & { publishedAt: Date }
    >(
      `select p.offering_id as "offeringId", p.title, p.business_name as "businessName",
         c.name as "categoryName", o.slug, p.published_at as "publishedAt",
         ${PRIMARY_VISUAL_SQL}
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       join category c on c.id = p.category_id
       where p.category_id = $1 ${applied.sql}
       order by p.published_at desc, p.offering_id`,
      [categoryId, ...applied.parameters]
    );
    return result.rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt.toISOString()
    }));
  }

  /**
   * The Filters offered for one active leaf Category (AC-1).
   *
   * Three conditions, all in the `where`: the Attribute applies to this
   * Category, it is filterable, and its kind is one that can be filtered. Text
   * cannot satisfy the third even in principle — `US-PLT-F09-001` refuses to
   * mark a Text definition filterable — so AC-2 holds twice over.
   */
  private async availableFilters(
    client: PoolClient,
    categoryId: string
  ): Promise<AvailableFilter[]> {
    const result = await client.query<AvailableFilter>(
      `select d.id as "attributeId", d.name, d.unit,
         d.value_kind::text as "valueKind",
         coalesce(
           (select json_agg(json_build_object('id', o.id, 'label', o.label)
                            order by o.sort_order, o.label)
            from attribute_option o
            where o.attribute_definition_id = d.id and o.active = true),
           '[]'
         ) as options
       from category_attribute ca
       join attribute_definition d on d.id = ca.attribute_definition_id
       where ca.category_id = $1 and d.active = true and d.filterable = true
         and d.value_kind::text = any($2::text[])
       order by d.name`,
      [categoryId, FILTERABLE_VALUE_KINDS]
    );
    return result.rows;
  }

  /**
   * Checks each applied Filter against what is actually offered here.
   *
   * A Filter that is not available is refused rather than dropped: PRD-0002
   * forbids Discovery from silently removing or changing criteria, and a
   * quietly ignored Filter would answer a different question from the one that
   * was asked.
   */
  private assertApplicable(
    available: AvailableFilter[],
    applied: AppliedFilter[]
  ): void {
    const offered = new Map(available.map((f) => [f.attributeId, f]));
    for (const filter of applied) {
      const definition = offered.get(filter.attributeId);
      if (!definition) throw new FilterNotAvailableError(filter.attributeId);
      const matches =
        filter.kind === "NUMBER"
          ? definition.valueKind === "NUMBER"
          : filter.kind === "BOOLEAN"
            ? definition.valueKind === "BOOLEAN"
            : definition.valueKind === "SINGLE_SELECT" ||
              definition.valueKind === "MULTI_SELECT";
      if (!matches) throw new FilterNotAvailableError(filter.attributeId);
    }
  }

  private async categories(
    client: PoolClient,
    where: string,
    parameters: unknown[]
  ): Promise<BrowseCategory[]> {
    const result = await client.query<BrowseCategory>(
      `select ${BROWSE_CATEGORY} from category c where ${where} order by c.name`,
      parameters
    );
    return result.rows;
  }

  /// The active path back to the root, so a person can return to a parent or
  /// step out to another branch (AC-3).
  private async ancestors(
    client: PoolClient,
    categoryId: string
  ): Promise<BrowseCategory[]> {
    const result = await client.query<BrowseCategory>(
      `with recursive walk as (
         select c.id, c.parent_id, 0 as depth
         from category c where c.id = $1
         union all
         select parent.id, parent.parent_id, walk.depth + 1
         from category parent
         join walk on walk.parent_id = parent.id
       )
       select ${BROWSE_CATEGORY}
       from walk join category c on c.id = walk.id
       where walk.depth > 0 and c.active = true
       order by walk.depth desc`,
      [categoryId]
    );
    return result.rows;
  }
}
