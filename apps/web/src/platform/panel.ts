import type { AdminPanel, Analytics } from "@commerce/contracts";

import { TERMS } from "../vocabulary";

type PanelFunction = AdminPanel["functions"][number];
type Period = Analytics["period"];

/**
 * ~~English, like the other surfaces a person reaches by entering a context.~~
 *
 * ~~The Business Dashboard and the authentication screens are English;
 * Discovery, the Offering Presentation, Compare and Decision are Turkish. The
 * division is not arbitrary: one is the public journey and the other is the
 * room you sign in to work in.~~
 *
 * **Struck through rather than deleted, because it was a justification and not
 * a note.** It described a language division as deliberate — public journey in
 * Turkish, working rooms in English — and that division was never decided by
 * anyone. It was the residue of the order the surfaces happened to be written
 * in, and this comment is how it acquired the appearance of a rule.
 *
 * I27 translated authentication and I28 the Business Dashboard, so both halves
 * of the claim were already false before this file was reached. It is left
 * visible because a reader who saw it disappear would not learn that the
 * platform once had an unowned design decision hiding in a comment.
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
  ADMINISTER_AFFILIATE_DESTINATIONS: `${TERMS.affiliateDestination}leri`,
  MANAGE_ATTRIBUTE_DEFINITIONS: `${TERMS.attribute} tanımları`,
  MANAGE_CATEGORIES: `${TERMS.category}ler`,
  MANAGE_MODERATION_CASES: `${TERMS.moderationCase}ları`,
  MODERATE_BUSINESSES: `${TERMS.business} moderasyonu`,
  MODERATE_OFFERINGS: `${TERMS.offering} moderasyonu`,
  MODERATE_USER_ACCESS: "Hesap erişimi",
  READ_OFFERING_HISTORY: `${TERMS.offering} geçmişi`,
  REQUEST_CORRECTION: "Düzeltme iste"
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
  ALL_TIME: "Tüm zamanlar",
  LAST_7_DAYS: "Son 7 gün",
  LAST_30_DAYS: "Son 30 gün",
  TODAY: "Bugün"
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
  AFFILIATE_HANDOFF_COMPLETIONS: "Adrese yapılan devir",
  COMPARE_STARTS: "Karşılaştırma başlatıldı",
  DECISION_CHAT_STARTS: "Karar Sohbeti başlatıldı",
  DIRECT_CONTACT_COMPLETIONS: "İletişim bilgisi gösterildi",
  DISCOVERY_STARTS: "Keşif başlatıldı",
  OFFERING_PRESENTATION_OPENS: `${TERMS.offering} açıldı`
};

/**
 * Why a Domain breakdown may not sum to the overall figure (§12.2).
 *
 * A Search that named no leaf Category has no Domain, and the platform infers
 * none from what somebody typed. Left unexplained, the gap reads as a bug and
 * somebody eventually "fixes" it by guessing — which is the thing §12.2 rules
 * out.
 */
export const DOMAIN_GAP = `${TERMS.domain}ı olmayan bir sayı yalnızca genel toplama girer. Platform, birinin yazdığı metinden ${TERMS.domain.toLocaleLowerCase("tr")} çıkarmaz.`;

/// §14. Zero and unavailable are different answers, and only one of them is
/// something to act on.
export const ANALYTICS_UNAVAILABLE =
  "Bu sayılar yüklenemedi. Bu, sıfır demek değildir.";

/// §6. Actionable queues and informational indicators are separated, so that
/// what is waiting for an Admin is never mixed into what merely describes the
/// platform.
export const ACTIONABLE_HEADING = "Sizi bekleyenler";
export const INFORMATIONAL_HEADING = "Durum nasıl";

/// §14. No Open cases is a state worth naming, not an empty list.
export const NO_OPEN_CASES = `Şu anda eylem bekleyen ${TERMS.moderationCase.toLocaleLowerCase("tr")} yok.`;
export const NO_DESTINATION_WORKLOAD = `Platformu bekleyen ${TERMS.affiliateDestination.toLocaleLowerCase("tr")} yok.`;
