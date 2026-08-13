import type { AdminPanel, Analytics } from "@commerce/contracts";

type PanelFunction = AdminPanel["functions"][number];
type Period = Analytics["period"];

/**
 * English, like the other surfaces a person reaches by entering a context.
 *
 * The Business Dashboard and the authentication screens are English; Discovery,
 * the Offering Presentation, Compare and Decision are Turkish. The division is
 * not arbitrary: one is the public journey and the other is the room you sign
 * in to work in.
 */

/**
 * What each Panel function is called, and where it lives.
 *
 * A total mapping of the vocabulary `US-PLT-F01-001` publishes, so a function
 * added upstream breaks this file rather than appearing unlabelled or
 * unreachable. There is no provisioning verb here for the same reason there is
 * none there: granting, removing, transferring and delegating Admin
 * authorization are Product Owner acts taken outside this application (§13),
 * so none is a value this type can hold.
 */
export const FUNCTION_LABELS: Record<PanelFunction, string> = {
  ADMINISTER_AFFILIATE_DESTINATIONS: "Affiliate Destinations",
  MANAGE_ATTRIBUTE_DEFINITIONS: "Attributes",
  MANAGE_CATEGORIES: "Categories",
  MANAGE_MODERATION_CASES: "Moderation cases",
  MODERATE_BUSINESSES: "Business moderation",
  MODERATE_OFFERINGS: "Offering moderation",
  MODERATE_USER_ACCESS: "Account access",
  READ_OFFERING_HISTORY: "Offering history",
  REQUEST_CORRECTION: "Request a correction"
};

/**
 * The four periods, in the order §12.1 writes them.
 *
 * A closed list and no custom range. A date picker would be the first step
 * towards the report builder this Story deliberately excludes, and the four
 * answer the question an Admin actually has: is this happening now, this week,
 * this month, or at all.
 */
/**
 * Where a Panel function is worked, where one exists.
 *
 * `null` for the functions that are performed inside a case or a Business
 * rather than at an address of their own — moderating an Offering is something
 * you do to a target you arrived at, not a place you go. A link to a page that
 * would have to ask "which one?" would be a worse answer than none.
 */
export const FUNCTION_HREFS: Record<PanelFunction, string | null> = {
  ADMINISTER_AFFILIATE_DESTINATIONS: "/admin/destinations",
  MANAGE_ATTRIBUTE_DEFINITIONS: "/admin/attributes",
  MANAGE_CATEGORIES: "/admin/categories",
  MANAGE_MODERATION_CASES: "/admin/moderation-cases",
  MODERATE_BUSINESSES: null,
  MODERATE_OFFERINGS: null,
  MODERATE_USER_ACCESS: null,
  READ_OFFERING_HISTORY: null,
  REQUEST_CORRECTION: null
};

export const PERIODS: readonly Period[] = [
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "ALL_TIME"
];

export const PERIOD_LABELS: Record<Period, string> = {
  ALL_TIME: "All time",
  LAST_7_DAYS: "Last 7 days",
  LAST_30_DAYS: "Last 30 days",
  TODAY: "Today"
};

export function readPeriod(raw: string | undefined): Period {
  return PERIODS.includes(raw as Period) ? (raw as Period) : "LAST_7_DAYS";
}

/**
 * What each core-flow indicator is called (§12.4).
 *
 * The two Completions are named for what the platform did — it sent somebody
 * somewhere, or it showed them something. Neither is called a sale, a lead, a
 * conversion or a response: §12.4 forbids presenting a Completion as an
 * external success, and a column header is exactly where that would happen
 * first and be repeated most.
 */
export const CORE_FLOW_LABELS: Record<keyof Analytics["coreFlow"], string> = {
  AFFILIATE_HANDOFF_COMPLETIONS: "Handoffs to a destination",
  COMPARE_STARTS: "Compare started",
  DECISION_CHAT_STARTS: "Decision Chat started",
  DIRECT_CONTACT_COMPLETIONS: "Contact details shown",
  DISCOVERY_STARTS: "Discovery started",
  OFFERING_PRESENTATION_OPENS: "Offerings opened"
};

/**
 * Why a Domain breakdown may not sum to the overall figure (§12.2).
 *
 * A Search that named no leaf Category has no Domain, and the platform infers
 * none from what somebody typed. Left unexplained, the gap reads as a bug and
 * somebody eventually "fixes" it by guessing — which is the thing §12.2 rules
 * out.
 */
export const DOMAIN_GAP =
  "A figure with no Domain is counted only in the overall total. Platform does not infer a Domain from what someone typed.";

/// §14. Zero and unavailable are different answers, and only one of them is
/// something to act on.
export const ANALYTICS_UNAVAILABLE =
  "These figures could not be loaded. This is not the same as zero.";

/// §6. Actionable queues and informational indicators are separated, so that
/// what is waiting for an Admin is never mixed into what merely describes the
/// platform.
export const ACTIONABLE_HEADING = "Waiting for you";
export const INFORMATIONAL_HEADING = "How things stand";

/// §14. No Open cases is a state worth naming, not an empty list.
export const NO_OPEN_CASES = "No moderation case needs action right now.";
export const NO_DESTINATION_WORKLOAD =
  "No Affiliate Destination is waiting on the platform.";
