/**
 * The exact V1 Basic Analytics periods (`US-PLT-F10-001` AC-2).
 *
 * Four values and no custom range. A date picker would be the first step
 * towards the report builder AC-18 excludes, and the Story is deliberate about
 * this being operational visibility rather than analytics.
 */
export const ANALYTICS_PERIODS = [
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "ALL_TIME"
] as const;

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

/**
 * Where a period begins, or `null` for all time.
 *
 * `TODAY` means since midnight rather than the last twenty-four hours: an
 * Admin asking what happened today means the day, and a rolling window would
 * quietly answer a different question.
 */
export function periodStart(period: AnalyticsPeriod, now: Date): Date | null {
  if (period === "ALL_TIME") return null;
  if (period === "TODAY") {
    const midnight = new Date(now);
    midnight.setUTCHours(0, 0, 0, 0);
    return midnight;
  }
  const days = period === "LAST_7_DAYS" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * The six core-flow indicators (AC-12).
 *
 * The two Completions are separate members and stay that way: AC-13 consumes
 * PRD-0004's meaning rather than restating it, and a person handed off to an
 * affiliate and a person shown a telephone number reached different ends. A
 * combined "conversions" figure would lose which — and would be the first step
 * towards presenting either as a sale, which AC-14 forbids.
 */
export const CORE_FLOW_INDICATORS = [
  "DISCOVERY_STARTS",
  "OFFERING_PRESENTATION_OPENS",
  "COMPARE_STARTS",
  "DECISION_CHAT_STARTS",
  "AFFILIATE_HANDOFF_COMPLETIONS",
  "DIRECT_CONTACT_COMPLETIONS"
] as const;

export type CoreFlowIndicator = (typeof CORE_FLOW_INDICATORS)[number];

/**
 * Which core-flow indicators their owning source associates with a Domain
 * (AC-3, AC-4, AC-5).
 *
 * Three of the six do, because the occurrence records the Domain it happened
 * in. The other three do not, and the honest answer is to show them in the
 * overall count only rather than to reach for the Domain some related record
 * happens to have now.
 *
 * A Search Discovery Start without a selected leaf Category is the case the
 * Story names outright: it has no Domain, and Platform never infers one from
 * what somebody typed. So the Discovery Start breakdown is deliberately
 * incomplete — its Domain counts do not sum to its overall count, and that gap
 * is the truth rather than a defect.
 */
export const DOMAIN_ASSOCIATED_INDICATORS: readonly CoreFlowIndicator[] = [
  "DISCOVERY_STARTS",
  "OFFERING_PRESENTATION_OPENS",
  "COMPARE_STARTS"
];

export function associatesDomain(indicator: CoreFlowIndicator): boolean {
  return DOMAIN_ASSOCIATED_INDICATORS.includes(indicator);
}

/**
 * Where an actionable indicator leads (AC-15, AC-16).
 *
 * Only workload indicators are actionable, and each opens the queue it counts.
 * Every core-flow indicator is absent, which is AC-16: they are things that
 * happened, and there is nowhere to go and nothing to do about them.
 *
 * What none of these is, is an action. Opening a queue is navigation; AC-17
 * holds because no entry here performs anything and there is no field for one
 * that would.
 */
export const ACTIONABLE_QUEUES = {
  DESTINATION_WORKLOAD: "/admin/offerings/affiliate-destinations/workload",
  OPEN_MODERATION_CASES: "/admin/moderation-cases?status=OPEN"
} as const;

export type ActionableQueue = keyof typeof ACTIONABLE_QUEUES;

export const analyticsModule = { name: "analytics" } as const;
