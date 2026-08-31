import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import { periodStart, type AnalyticsPeriod } from "@commerce/analytics";
import { destinationWorkload } from "@commerce/offering";

export interface DomainCount {
  domain: string;
  count: number;
}

export interface CoreFlowCount {
  byDomain: DomainCount[];
  overall: number;
}

export interface AnalyticsSnapshot {
  affiliateDestinations: {
    handoffEligibility: Record<string, number>;
    status: Record<string, number>;
    validationResult: Record<string, number>;
  };
  businesses: Record<string, number>;
  coreFlow: Record<string, CoreFlowCount>;
  destinationWorkload: Record<string, number>;
  moderationCases: {
    openByTarget: Record<string, number>;
    status: Record<string, number>;
  };
  offerings: {
    lifecycle: Record<string, number>;
    publicEligibility: Record<string, number>;
  };
  userAccounts: Record<string, number>;
}

/**
 * Basic Analytics (`US-PLT-F10-001`).
 *
 * Every figure is counted from the table that owns the result, at the moment
 * it is asked for. There is no rollup, no snapshot table and no scheduled job:
 * AC-18 excludes advanced analytics, and a materialised figure would be a
 * second place a result lived — one that could disagree with the authority it
 * came from.
 *
 * The whole file is `select`. Nothing here writes anything, which is AC-17
 * made structural rather than promised.
 */
@Injectable()
export class PgAnalyticsRepository {
  constructor(private readonly pool: Pool) {}

  async snapshot(period: AnalyticsPeriod): Promise<AnalyticsSnapshot> {
    const since = periodStart(period, new Date());

    // Current-state indicators are counted as they stand now. A period bounds
    // *occurrences*, and "how many Businesses are Restricted today" is not an
    // occurrence — asking it of a window would answer a different question.
    const [accounts, businesses, offerings, publications, destinations, cases] =
      await Promise.all([
        this.tally(`select status::text as key, count(*)::int as count
                    from user_account group by status`),
        this.tally(`select coalesce(m.status::text,'UNRESTRICTED') as key,
                      count(*)::int as count
                    from business b
                    left join business_moderation_state m
                      on m.business_id = b.id
                    group by 1`),
        this.tally(`select status::text as key, count(*)::int as count
                    from offering group by status`),
        this.tally(`select p.status::text as key, count(*)::int as count
                    from offering o
                    join lateral (
                      select status from offering_publication
                      where offering_id = o.id
                      order by eligibility_version desc limit 1
                    ) p on true
                    group by 1`),
        this.destinations(),
        this.cases()
      ]);

    return {
      affiliateDestinations: destinations.byResult,
      businesses,
      coreFlow: await this.coreFlow(since),
      destinationWorkload: destinations.workload,
      moderationCases: cases,
      offerings: { lifecycle: offerings, publicEligibility: publications },
      userAccounts: accounts
    };
  }

  /**
   * The six core-flow indicators, each from its own occurrence table.
   *
   * Three carry the Domain they happened in and three do not, and the query
   * shapes say so: a source with no Domain column produces an empty breakdown
   * rather than a Domain inferred from something related. A Search Discovery
   * Start with no selected leaf Category has a null Domain, so it is counted
   * overall and appears in no Domain — which is why the Discovery Start
   * breakdown does not sum to its total.
   */
  private async coreFlow(
    since: Date | null
  ): Promise<Record<string, CoreFlowCount>> {
    const window = since === null ? "" : " where {column} >= $1";
    const values = since === null ? [] : [since];
    const scoped = (sql: string, column: string) =>
      sql.replace("{window}", window.replace("{column}", column));

    const [discovery, presentation, compare, chat, handoff, contact] =
      await Promise.all([
        this.withDomain(
          scoped(
            `select d.stable_key as domain, d.name as "domainName",
             count(*)::int as count
           from discovery_start s
           left join domain d on d.id = s.domain_id{window}
           group by d.stable_key, d.name`,
            "s.started_at"
          ),
          scoped(
            `select count(*)::int as count from discovery_start s{window}`,
            "s.started_at"
          ),
          values
        ),
        this.withDomain(
          scoped(
            `select d.stable_key as domain, d.name as "domainName",
             count(*)::int as count
           from offering_presentation_open o
           join domain d on d.id = o.domain_id{window}
           group by d.stable_key, d.name`,
            "o.opened_at"
          ),
          scoped(
            `select count(*)::int as count from offering_presentation_open o{window}`,
            "o.opened_at"
          ),
          values
        ),
        this.withDomain(
          scoped(
            `select d.stable_key as domain, d.name as "domainName",
             count(*)::int as count
           from compare_start c
           join domain d on d.id = c.domain_id{window}
           group by d.stable_key, d.name`,
            "c.started_at"
          ),
          scoped(
            `select count(*)::int as count from compare_start c{window}`,
            "c.started_at"
          ),
          values
        ),
        this.overall(
          scoped(
            `select count(*)::int as count from decision_chat_start c{window}`,
            "c.started_at"
          ),
          values
        ),
        this.overall(
          scoped(
            `select count(*)::int as count from affiliate_handoff h{window}`,
            "h.initiated_at"
          ),
          values
        ),
        this.overall(
          scoped(
            `select count(*)::int as count from direct_contact_reveal r{window}`,
            "r.revealed_at"
          ),
          values
        )
      ]);

    return {
      // AC-13. The two Completions are counted from the two records that
      // *are* them, and neither is renamed on the way out.
      AFFILIATE_HANDOFF_COMPLETIONS: handoff,
      COMPARE_STARTS: compare,
      DECISION_CHAT_STARTS: chat,
      DIRECT_CONTACT_COMPLETIONS: contact,
      DISCOVERY_STARTS: discovery,
      OFFERING_PRESENTATION_OPENS: presentation
    };
  }

  private async withDomain(
    breakdown: string,
    total: string,
    values: unknown[]
  ): Promise<CoreFlowCount> {
    const [byDomain, overall] = await Promise.all([
      this.pool.query<{
        count: number;
        domain: string | null;
        domainName: string | null;
      }>(breakdown, values),
      this.pool.query<{ count: number }>(total, values)
    ]);
    return {
      // A null Domain is dropped rather than shown as a group: it is the
      // absence of an association, not a Domain called "none".
      byDomain: byDomain.rows
        .filter(
          (row): row is { count: number; domain: string; domainName: string } =>
            Boolean(row.domain)
        )
        /*
         * The key groups and the name is displayed. Grouping by the name would
         * merge two Domains that shared one and would split a Domain's own
         * history the moment it was renamed — which is what a `stable_key` is
         * stable for. The name rides along so no screen has to translate a key.
         */
        .map((row) => ({
          count: Number(row.count),
          domain: row.domain,
          domainName: row.domainName
        }))
        .sort((a, b) => a.domain.localeCompare(b.domain)),
      overall: Number(overall.rows[0]?.count ?? 0)
    };
  }

  private async overall(
    total: string,
    values: unknown[]
  ): Promise<CoreFlowCount> {
    const result = await this.pool.query<{ count: number }>(total, values);
    // AC-3. The source supplies no Domain, so there is no breakdown to give.
    return { byDomain: [], overall: Number(result.rows[0]?.count ?? 0) };
  }

  private async destinations(): Promise<{
    byResult: AnalyticsSnapshot["affiliateDestinations"];
    workload: Record<string, number>;
  }> {
    const rows = await this.pool.query<{
      handoffEligibility: string;
      status: "DISABLED" | "DRAFT" | "ENABLED";
      validationResult: "INVALID" | "NOT_VALIDATED" | "VALID";
    }>(
      `select status::text as status,
         validation_result::text as "validationResult",
         handoff_eligibility::text as "handoffEligibility"
       from affiliate_destination`
    );

    const byResult = {
      handoffEligibility: {} as Record<string, number>,
      status: {} as Record<string, number>,
      validationResult: {} as Record<string, number>
    };
    const workload: Record<string, number> = {};
    for (const row of rows.rows) {
      byResult.status[row.status] = (byResult.status[row.status] ?? 0) + 1;
      byResult.validationResult[row.validationResult] =
        (byResult.validationResult[row.validationResult] ?? 0) + 1;
      byResult.handoffEligibility[row.handoffEligibility] =
        (byResult.handoffEligibility[row.handoffEligibility] ?? 0) + 1;
      // AC-11. The same derivation `US-PLT-F07-001` uses, asked of the same
      // function — a second definition of "Ready to Enable" would eventually
      // give the queue and the count different answers.
      const category = destinationWorkload({
        status: row.status,
        validationResult: row.validationResult
      });
      if (category !== null) workload[category] = (workload[category] ?? 0) + 1;
    }
    return { byResult, workload };
  }

  private async cases(): Promise<AnalyticsSnapshot["moderationCases"]> {
    const [status, openByTarget] = await Promise.all([
      this.tally(`select status::text as key, count(*)::int as count
                  from moderation_case group by status`),
      this.tally(`select target_type::text as key, count(*)::int as count
                  from moderation_case where status = 'OPEN'
                  group by target_type`)
    ]);
    return { openByTarget, status };
  }

  private async tally(sql: string): Promise<Record<string, number>> {
    const result = await this.pool.query<{ count: number; key: string }>(sql);
    return Object.fromEntries(
      result.rows.map((row) => [row.key, Number(row.count)])
    );
  }
}
