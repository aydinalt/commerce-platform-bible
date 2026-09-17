import { LISTING_NUMBER_SQL, PRIMARY_VISUAL_SQL } from "./listing-card.sql.js";
import {
  HANDOFF_AVAILABLE_SQL,
  LISTING_ORDER,
  OFFERING_PRICE_SQL,
  PRODUCT_GROUP_KEY,
  PRODUCT_GROUP_PICK,
  PRODUCT_KEY_SQL,
  SELLER_COUNT_SQL,
  TOTAL_COST_SQL,
  type PricedRow,
  withPrice
} from "./offering-price.sql.js";
import {
  arrangementOrder,
  attentionColumns,
  withoutAttention,
  type AttentionColumns
} from "./result-arrangement.sql.js";
import {
  PRODUCT_RATING_SQL,
  ratingPredicate,
  stockPredicate,
  withRating,
  type RatedRow
} from "./product-rating.sql.js";

import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

/*
 * The row shapes come from the contract rather than from the Discovery module.
 *
 * The module's `ListingCard` is the domain's idea of a card and has drifted
 * behind the wire shape before — it still does not name `primaryVisualUrl`,
 * which I30 added to the contract and to this query. Selecting into the
 * contract's own type means a field added there is a compile error here until
 * the query supplies it, which is the only version of this that cannot go
 * quietly out of date.
 */
import type {
  ListingCardResponse,
  PriceConstraintInput,
  RatingConstraintInput,
  SearchResultResponse
} from "@commerce/contracts";

import {
  FILTERABLE_VALUE_KINDS,
  FilterContextMissingError,
  FilterNotAvailableError,
  listingReference,
  SEARCH_MATCH_LEVELS,
  zeroResultRecovery,
  type AppliedFilter,
  type AvailableFilter,
  type BrowseCategory,
  type BrowseView,
  type ListingCard,
  type ResultArrangement,
  type SearchView,
  type ZeroResults
} from "@commerce/discovery";

/**
 * A Category as Browse sees it. `leaf` is derived rather than stored: a
 * Category becomes a branch the moment an active child appears under it, and
 * stops being one when that child retires.
 */
/**
 * How many products one page of Results carries (I63).
 *
 * Twenty-five, which is the Owner's own number — *sayfa başına 25 kart
 * gösterilsin* — and it is published in every response rather than assumed by
 * the surface, so a client cannot mis-paginate by guessing a boundary.
 *
 * A constant rather than a request parameter: PRD-0002 §12.5 refuses
 * user-controlled ordering for V1, and a caller-chosen page size is the same
 * kind of control by another name — one request could ask for the whole
 * catalogue and undo the reason the page exists.
 */
export const PAGE_SIZE = 25;

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
 * The Price Constraint as SQL (`US-DSC-F11-001`, PRD-0002 v2.5 §10.6).
 *
 * Three conditions, and each is an acceptance criterion rather than a
 * convenience:
 *
 * - **`pricing_kind = 'FIXED'` (AC-5).** An Offering quoted on request has no
 *   amount, and §10.4's rule — no value for an applied criterion means the
 *   criterion is not satisfied — applies unchanged. Admitting it "because it
 *   might be cheap" would be Discovery inventing the one number it is least
 *   entitled to invent.
 * - **`currency = $n` (AC-7).** §10.6.2 refuses conversion. A converted amount
 *   is a figure no partner quoted, and a budget compared against one is a
 *   comparison against a number the platform made up.
 * - **`TOTAL_COST_SQL` between the bounds (AC-3, AC-4).** The same expression
 *   the card and the seller list order by, so "what a person would pay" means
 *   one thing across the whole platform. `coalesce(delivery_cost, 0)` inside it
 *   is not "unstated means free": it is the least the Offering could cost,
 *   which is the only honest thing to compare when nothing was stated.
 *
 * Reversed bounds produce no rows and are not corrected (AC-8). The clause is
 * simply unsatisfiable, which is exactly what §10.6.3 asks for — an answer of
 * "nothing", beside the two figures the person typed.
 */
function pricePredicate(
  price: PriceConstraintInput | null,
  firstParameter: number
): { parameters: unknown[]; sql: string } {
  if (price === null) return { parameters: [], sql: "" };

  const parameters: unknown[] = [price.currency];
  const clauses = [
    `o.pricing_kind = 'FIXED'`,
    `o.currency = $${firstParameter}`
  ];

  if (price.maxAmount !== null) {
    parameters.push(price.maxAmount);
    clauses.push(
      `${TOTAL_COST_SQL} <= $${firstParameter + parameters.length - 1}::numeric`
    );
  }
  if (price.minAmount !== null) {
    parameters.push(price.minAmount);
    clauses.push(
      `${TOTAL_COST_SQL} >= $${firstParameter + parameters.length - 1}::numeric`
    );
  }

  // AC-9. Conjoined with the query, the Category and every Attribute Filter,
  // like every other criterion in §5.6.
  return { parameters, sql: clauses.map((c) => `and (${c})`).join(" ") };
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
  /**
   * Every address a crawler should know about (I97).
   *
   * **Read from the Discovery projection**, which is the same table Search and
   * Browse read and which holds a row only while an Offering's final Public
   * Eligibility is Eligible. That is what makes this list correct rather than
   * merely current: nothing here decides what may be indexed, because the table
   * has already decided what may be found.
   *
   * Ordered newest first and bounded at the sitemap protocol's 50,000 URLs, so
   * that the file stays valid as the catalogue grows and the most recently
   * published listings are the ones that survive the cut.
   */
  async sitemap(): Promise<{ lastModified: string; slug: string }[]> {
    const result = await this.pool.query<{
      publishedAt: Date;
      slug: string;
    }>(
      `select o.slug, p.published_at as "publishedAt"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       order by p.published_at desc
       limit 50000`
    );
    return result.rows.map((row) => ({
      lastModified: row.publishedAt.toISOString(),
      slug: row.slug
    }));
  }

  /**
   * The Category addresses worth advertising (`UX-0002` **Frozen v1.4** §8A.5).
   *
   * **Active Categories only**, which is §8.1 and not a filter chosen here: a
   * retired Category is not an active destination, and its address presents
   * nothing.
   *
   * **A Category with nothing published anywhere beneath it is left out.** It
   * is a real address and it presents an honest empty statement, but asking a
   * crawler to spend budget on a page that says "nothing here" is asking it to
   * learn that this site's sitemap is not worth reading. The recursive walk is
   * what makes a non-leaf qualify on its descendants' listings rather than on
   * its own, which it has none of by definition.
   *
   * `lastModified` is the newest publication in the subtree, for the reason the
   * Offering sitemap uses the real publication moment rather than "now": a
   * sitemap where everything changed today teaches a crawler to ignore the date.
   */
  async categorySitemap(): Promise<{ lastModified: string; slug: string }[]> {
    const result = await this.pool.query<{
      publishedAt: Date;
      slug: string;
    }>(
      `with recursive subtree as (
         select c.id as root_id, c.id as node_id
         from category c where c.active = true
         union all
         select subtree.root_id, child.id
         from category child
         join subtree on child.parent_id = subtree.node_id
         where child.active = true
       )
       select c.slug, max(p.published_at) as "publishedAt"
       from subtree
       join category c on c.id = subtree.root_id
       join offering o on o.category_id = subtree.node_id
       join offering_search_projection p on p.offering_id = o.id
       group by c.id, c.slug
       order by max(p.published_at) desc
       limit 50000`
    );
    return result.rows.map((row) => ({
      lastModified: row.publishedAt.toISOString(),
      slug: row.slug
    }));
  }

  /**
   * A Category at its own address (`UX-0002` **Frozen v1.4** §8A).
   *
   * **Nothing is written here, and that is the whole difference from
   * `browse()`.** §8A.4 makes arrival record no Discovery Start, because this
   * is the first surface in the platform a crawler reaches by design and an
   * arrival that produced an occurrence would put a machine's traversal into
   * the platform's own account of what people did — at whatever rate the
   * crawler chose. `browse()` inserts into `discovery_start`; this does not,
   * and it takes no `pathId` to insert with.
   *
   * **By slug, which is why `category.slug` is globally unique** as of the
   * migration that accompanies this method. The schema previously constrained
   * only `(domain_id, slug)`, so two Domains could hold the same slug and this
   * lookup would have had to choose between them silently. An address that can
   * mean two things is not an address, and §8A.5 calls this the canonical one.
   *
   * **Retired reads as absent** (§8A.2, §8.1), the same answer `browse()` gives
   * and for the same reason: a not-found says nothing about why, which leaks
   * neither a retirement nor a moderation decision.
   */
  async categoryAddress(slug: string): Promise<{
    ancestors: BrowseCategory[];
    category: BrowseCategory;
    children: BrowseCategory[];
    domain: string;
    domainName: string;
    results: ListingCard[] | null;
  } | null> {
    const client = await this.pool.connect();
    try {
      /*
       * A transaction for the snapshot rather than for any write: the four
       * reads below compose one answer, and a Category retired between the
       * first and the last would produce a page describing two different
       * catalogues.
       */
      await client.query("begin");

      const found = await client.query<
        BrowseCategory & { domain: string; domainName: string }
      >(
        `select ${BROWSE_CATEGORY}, d.stable_key as domain, d.name as "domainName"
         from category c
         join domain d on d.id = c.domain_id
         where c.slug = $1 and c.active = true`,
        [slug]
      );
      const current = found.rows[0];
      if (!current) {
        await client.query("rollback");
        return null;
      }

      const { domain, domainName, ...category } = current;

      /*
       * §8A.2, which is §8.2 applied at an address rather than an exception to
       * it. A non-leaf presents its children and **no** Offering Results: not
       * an empty list, not a combined count, and nothing that aggregates what
       * is beneath it. `null` is what says "withheld"; `[]` would say "none".
       */
      const children = category.leaf
        ? []
        : await this.categories(
            client,
            `c.parent_id = $1 and c.active = true`,
            [category.id]
          );

      /*
       * §8A.3's order, and it is `§8.3`'s: later `Initial Published At` first,
       * ties stable. `NEWEST` is named because it is the arrangement whose
       * `order by` is exactly that — **not** because the address offers the
       * arrangements. It offers no Sort control at all, so exactly one order is
       * fixed and this is the one the Frozen section names.
       *
       * Worth knowing while reading §8.3: the arrangement Discovery *defaults*
       * to is `DEFAULT`, which orders by total cost rather than by publication.
       * §8A.3 cites §8.3 rather than "whatever Discovery does", so the address
       * follows §8.3 literally.
       */
      const listed = category.leaf
        ? await this.results(
            client,
            "NEWEST",
            category.id,
            [],
            null,
            null,
            1,
            false
          )
        : null;

      const ancestors = await this.ancestors(client, category.id);

      await client.query("commit");
      return {
        ancestors,
        category,
        children,
        domain,
        domainName,
        results: listed === null ? null : listed.cards
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

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
    /// I68. Which of the Owner's four tabs the Results are arranged by.
    arrangement: ResultArrangement;
    categoryId: string;
    filters: AppliedFilter[];
    inStockOnly: boolean;
    pathId: string;
    page: number;
    price: PriceConstraintInput | null;
    rating: RatingConstraintInput | null;
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
      const listed = category.leaf
        ? await this.results(
            client,
            input.arrangement,
            input.categoryId,
            input.filters,
            input.price,
            input.rating,
            input.page,
            input.inStockOnly
          )
        : null;
      const results = listed === null ? null : listed.cards;

      await client.query("commit");
      return {
        // I68. The arrangement the Results are actually in.
        arrangement: input.arrangement,
        ancestors,
        category,
        children,
        discoveryPathId: input.pathId,
        domain,
        domainName,
        filters,
        // I63. `null` exactly where the Results are: a branch withheld them, so
        // there is no list for the person to be anywhere in.
        paging:
          listed === null
            ? null
            : {
                page: input.page,
                pageSize: PAGE_SIZE,
                total: listed.total
              },
        results,
        siblings,
        /*
         * AC-1. A branch has withheld Results rather than found none, so it is
         * not a Zero Results state — there was no question to answer.
         *
         * I63: an empty *page* is not Zero Results either. Somebody on page
         * nine of three has overshot a list that exists, and telling them their
         * criteria matched nothing would be a false statement about the
         * catalogue rather than about their position in it.
         */
        zeroResults:
          listed !== null && listed.total === 0
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
    /// I68. Arranged within a match level, never across them.
    arrangement: ResultArrangement;
    categoryId: string | null;
    filters: AppliedFilter[];
    inStockOnly: boolean;
    pathId: string;
    page: number;
    price: PriceConstraintInput | null;
    query: string;
    rating: RatingConstraintInput | null;
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

      /*
       * I67. A query that names a listing is answered by that listing.
       *
       * The Owner's requirement — *"İlan numarasını arama kutusuna yazınca
       * listelensin"* — is a lookup wearing a search box, and it is written
       * here as one substituted predicate rather than as a second route:
       * everything around it is the same Search. The Category narrowing, the
       * Filters, the price and rating floors, the stock switch, the paging and
       * the Zero Results state all still apply, because a person who typed a
       * number into a filtered page has not stopped being on it.
       *
       * `matchLevel` is left to fall to `DESCRIPTION_OR_ATTRIBUTE`. It is the
       * least fitting of the four names and the only honest option: PRD-0002
       * §12.2 fixes the list, a fifth level would be product behaviour invented
       * from a repository, and with one row the ordering the level feeds has
       * nothing to arrange.
       */
      const reference = listingReference(input.query);
      const all = reference ?? input.terms.join(" & ");
      const any = reference ?? input.terms.join(" | ");
      const matched =
        reference === null
          ? `to_tsvector('simple', p.searchable_text)
             @@ to_tsquery('simple', $1)`
          : `o.listing_number = $1::bigint`;
      // `US-DSC-F05-001` AC-8. The Search match, the Category and every Filter
      // are conjoined in one `where`; PRD-0002 §12.4 keeps Best Match ordering
      // across them, which is why the `order by` below does not consult them.
      const applied = filterPredicate(input.filters, 5);
      // Numbered after the Filters' own parameters, because both predicates are
      // spliced into one statement.
      const priced = pricePredicate(input.price, 5 + applied.parameters.length);
      // I62. Numbered after both, because all three predicates are spliced
      // into the same statement.
      const rated = ratingPredicate(
        input.rating === null ? null : input.rating.minimum,
        5 + applied.parameters.length + priced.parameters.length
      );
      const stocked = stockPredicate(input.inStockOnly);
      const after =
        5 +
        applied.parameters.length +
        priced.parameters.length +
        rated.parameters.length;
      const found = await client.query<
        AttentionColumns &
          RatedRow<PricedRow<SearchResultResponse>> & { total: number }
      >(
        // The match level is computed in an inner query so the ordering can
        // name it. PostgreSQL only accepts an output column in `order by` as a
        // bare name, not inside an expression, and the level is the input to
        // one.
        `select "offeringId", title, "businessName", "categoryName", slug,
           "publishedAt", "primaryVisualUrl", "matchLevel", "listingNumber",
           "openCount", "trendScore",
           "productKey", "sellerCount", "handoffAvailable",
           "ratingAverage", "ratingCount",
           "pricingKind", amount, currency, "amountSetAt", "priorAmount",
           "deliveryCost", "stockState",
           count(*) over ()::int as total
         from (
           -- §5.12.1. One row per product, drawn from its cheapest seller.
           select distinct on (${PRODUCT_GROUP_KEY})
             p.offering_id as "offeringId", p.title,
             p.business_name as "businessName", c.name as "categoryName",
             o.slug, p.published_at as "publishedAt",
             ${PRIMARY_VISUAL_SQL},
             ${LISTING_NUMBER_SQL},
             ${attentionColumns(input.arrangement)},
             ${OFFERING_PRICE_SQL},
             ${PRODUCT_KEY_SQL},
             ${SELLER_COUNT_SQL},
             ${HANDOFF_AVAILABLE_SQL},
             ${PRODUCT_RATING_SQL},
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
           where ${matched}
             and ($3::uuid is null or p.category_id = $3)
             ${applied.sql}
             ${priced.sql}
             ${rated.sql}
             ${stocked}
           order by ${PRODUCT_GROUP_PICK}
         ) matched
         -- US-DSC-F07-001 AC-1 to AC-3, in that order. The priority is not
         -- written out again here: array_position reads it from the module's
         -- list, so PRD-0002 12.2 is stated once and consulted twice.
         --
         -- I63: what changes underneath it is the tie-break. Relevance still
         -- decides which tier a result is in -- a query that names a title is
         -- answered by that title first, which is 12.2 and stays -- and inside
         -- one tier the arrangement is now the Owner's: cheapest delivered
         -- first, out of stock last. "Most recently listed" was what 12.2's
         -- second key said, and it was decided when no Offering carried an
         -- amount at all.
         order by array_position($4::text[], "matchLevel"),
           ${arrangementOrder(input.arrangement)}${LISTING_ORDER}
         limit $${after} offset $${after + 1}`,
        [
          all,
          any,
          input.categoryId,
          SEARCH_MATCH_LEVELS,
          ...applied.parameters,
          ...priced.parameters,
          ...rated.parameters,
          PAGE_SIZE,
          (input.page - 1) * PAGE_SIZE
        ]
      );

      // AC-1. Computed from the *unnarrowed* set, so choosing one leaf never
      // hides the others a person might have meant.
      const reachable = await client.query<BrowseCategory>(
        `select c.id, c.name, c.slug, true as leaf
         from offering_search_projection p
         join offering o on o.id = p.offering_id
         join category c on c.id = p.category_id
         where ${matched}
         group by c.id, c.name, c.slug
         order by c.name`,
        [all]
      );

      /*
       * I63. The window counted the whole ordered list before the page was cut
       * from it. A page past the end carries no row to report from, so the
       * count is taken separately there — an overshooting pager can then find
       * its way back rather than being told the query matched nothing.
       */
      const total =
        found.rows[0]?.total ??
        (await this.matchCount(client, {
          all,
          matched,
          categoryId: input.categoryId,
          filters: input.filters,
          inStockOnly: input.inStockOnly,
          price: input.price,
          rating: input.rating
        }));

      await client.query("commit");
      return {
        // I68. The arrangement the list is actually in, sent back beside it.
        arrangement: input.arrangement,
        categoryId: input.categoryId,
        discoveryPathId: input.pathId,
        domain: narrowedTo?.domain ?? null,
        domainName: narrowedTo?.domainName ?? null,
        filters,
        // `US-DSC-F04-001` AC-6's gate, now with something behind it.
        filtersAvailable: narrowedTo !== null,
        narrowing: reachable.rows.length > 1 ? reachable.rows : [],
        paging: { page: input.page, pageSize: PAGE_SIZE, total },
        query: input.query,
        // The window's count rides along on every row and is not part of a
        // result; the schema is `.strict()` and would refuse it.
        results: found.rows.map(({ total: _total, ...row }) =>
          withPrice<SearchResultResponse>(
            withRating<PricedRow<SearchResultResponse>>(withoutAttention(row))
          )
        ),
        /*
         * AC-1. The query stays visible beside the emptiness it produced.
         *
         * I63: an empty page is not the same thing. Somebody on page nine of
         * three has overshot a list that exists, and the recovery actions §13
         * offers — change the query, clear the filters — would be answering a
         * question they did not ask. `paging.total` is what distinguishes them,
         * so it is what this consults.
         */
        zeroResults:
          total === 0
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
   * How many products a Search matches, where the page it asked for held none
   * (I63).
   *
   * Only reached past the end of the list: the ordinary path takes the count
   * from the window in the same statement that drew the page, which is one
   * query and one snapshot. This exists so that overshooting a pager reports a
   * position rather than an empty catalogue.
   */
  private async matchCount(
    client: PoolClient,
    input: {
      all: string;
      categoryId: string | null;
      filters: AppliedFilter[];
      inStockOnly: boolean;
      /**
       * The match, already written by the caller (I67): either the text index
       * or one listing number. Passed rather than rebuilt because the two
       * statements must ask the same question — a count taken by other means
       * than the page it explains is a position computed from a different list.
       */
      matched: string;
      price: PriceConstraintInput | null;
      rating: RatingConstraintInput | null;
    }
  ): Promise<number> {
    /*
     * The predicates are rebuilt rather than reused, because a predicate
     * carries its own parameter numbers and this statement has two leading
     * parameters where the paged one has four. Rebuilding states the numbering
     * once per statement; renumbering a built string would state it twice.
     */
    const applied = filterPredicate(input.filters, 3);
    const priced = pricePredicate(input.price, 3 + applied.parameters.length);
    const rated = ratingPredicate(
      input.rating === null ? null : input.rating.minimum,
      3 + applied.parameters.length + priced.parameters.length
    );
    const stocked = stockPredicate(input.inStockOnly);
    const counted = await client.query<{ total: number }>(
      `select count(distinct ${PRODUCT_GROUP_KEY})::int as total
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       where ${input.matched}
         and ($2::uuid is null or p.category_id = $2)
         ${applied.sql} ${priced.sql} ${rated.sql} ${stocked}`,
      [
        input.all,
        input.categoryId,
        ...applied.parameters,
        ...priced.parameters,
        ...rated.parameters
      ]
    );
    return counted.rows[0]?.total ?? 0;
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
    arrangement: ResultArrangement,
    categoryId: string,
    filters: AppliedFilter[],
    price: PriceConstraintInput | null,
    rating: RatingConstraintInput | null,
    page: number,
    inStockOnly: boolean
  ): Promise<{ cards: ListingCard[]; total: number }> {
    // PRD-0002 §12.4 and §10.6.6: a narrowed Browse keeps Browse's ordering.
    // Criteria narrow the set; they do not change how it is arranged.
    const applied = filterPredicate(filters, 2);
    const priced = pricePredicate(price, 2 + applied.parameters.length);
    const rated = ratingPredicate(
      rating === null ? null : rating.minimum,
      2 + applied.parameters.length + priced.parameters.length
    );
    const stocked = stockPredicate(inStockOnly);
    const after =
      2 +
      applied.parameters.length +
      priced.parameters.length +
      rated.parameters.length;
    const result = await client.query<
      AttentionColumns &
        RatedRow<PricedRow<ListingCardResponse>> & { total: number }
    >(
      /*
       * Two levels, because `distinct on` fixes the sort order it deduplicates
       * with and Browse's own order is a different one. The inner query picks
       * one row per product; the outer restores PRD-0002 §12.4's ordering.
       */
      /*
       * I63. `count(*) over ()` rather than a second query: a window is
       * computed before `limit`, so the total is the length of the whole
       * ordered list and the rows are one page of it — one statement, one
       * snapshot, and no chance of a total that disagrees with the page it
       * describes because something was published between two queries.
       */
      `select *, count(*) over ()::int as total from (
         select distinct on (${PRODUCT_GROUP_KEY})
           p.offering_id as "offeringId", p.title,
           p.business_name as "businessName",
           c.name as "categoryName", o.slug, p.published_at as "publishedAt",
           ${PRIMARY_VISUAL_SQL},
           ${LISTING_NUMBER_SQL},
           ${attentionColumns(arrangement)},
           ${OFFERING_PRICE_SQL},
           ${PRODUCT_KEY_SQL},
           ${SELLER_COUNT_SQL},
           ${HANDOFF_AVAILABLE_SQL},
           ${PRODUCT_RATING_SQL}
         from offering_search_projection p
         join offering o on o.id = p.offering_id
         join category c on c.id = p.category_id
         where p.category_id = $1 ${applied.sql} ${priced.sql} ${rated.sql} ${stocked}
         order by ${PRODUCT_GROUP_PICK}
       ) grouped
       order by ${arrangementOrder(arrangement)}${LISTING_ORDER}
       limit $${after} offset $${after + 1}`,
      [
        categoryId,
        ...applied.parameters,
        ...priced.parameters,
        ...rated.parameters,
        PAGE_SIZE,
        (page - 1) * PAGE_SIZE
      ]
    );
    const first = result.rows[0];
    if (first !== undefined)
      return {
        /*
         * The window's count rides along on every row and is not part of a
         * card, so it is taken off before the row becomes one. The card schema
         * is `.strict()` and would refuse it — which is the guard working, and
         * the reason it is stripped here rather than tolerated there.
         */
        cards: result.rows.map(({ total: _total, ...card }) =>
          withPrice<ListingCardResponse>(
            withRating<PricedRow<ListingCardResponse>>(withoutAttention(card))
          )
        ),
        total: first.total
      };

    /*
     * An empty page carries no row, so the window has nothing to report from —
     * and "no rows" is not "no results" when the person asked for page nine of
     * three. The count is taken separately in exactly that case, so a pager
     * that overshot can still show where the list actually ends rather than
     * telling somebody their Category emptied.
     *
     * `count(distinct …)` rather than a second grouping pass: the number wanted
     * is how many products the criteria admit, and that is what the expression
     * the grouping deduplicates on counts.
     */
    const counted = await client.query<{ total: number }>(
      `select count(distinct ${PRODUCT_GROUP_KEY})::int as total
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       where p.category_id = $1 ${applied.sql} ${priced.sql} ${rated.sql} ${stocked}`,
      [
        categoryId,
        ...applied.parameters,
        ...priced.parameters,
        ...rated.parameters
      ]
    );
    return { cards: [], total: counted.rows[0]?.total ?? 0 };
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
