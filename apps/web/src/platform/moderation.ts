import type { ModerationCase } from "@commerce/contracts";

import { LIFECYCLE, MODERATION, TERMS } from "../vocabulary";

type Action = ModerationCase["availableActions"][number];
type TargetType = ModerationCase["targetType"];

/**
 * What each of the seven General Moderation actions is called.
 *
 * A total mapping of the vocabulary `US-PLT-F02-001` publishes, so an eighth
 * appearing upstream breaks this file. There is no eighth today and the
 * bounded owner response is not one: UX-0006 §8 says so explicitly, and it is
 * true here because it is a Business act performed in UX-0005, not a value
 * this type can hold.
 */
export const ACTION_LABELS: Record<Action, string> = {
  HIDE_OFFERING: "Bu İlanı gizle",
  REINSTATE_USER: "Bu hesabı geri getir",
  REQUEST_CORRECTION: "Düzeltme iste",
  RESTORE_BUSINESS: "Bu İşletmenin kısıtlamasını kaldır",
  RESTORE_OFFERING: "Bu İlanı yeniden yayına al",
  RESTRICT_BUSINESS: "Bu İşletmeyi kısıtla",
  SUSPEND_USER: "Bu hesabı askıya al"
};

/**
 * What each action produces, in the words of the PRD that owns the result.
 *
 * §7.4 lets the Dashboard explain the result and then consume it, but never
 * redefine it — so each sentence is a transition PRD-0001 or PRD-0005 already
 * states, and none adds a consequence of its own. `REQUEST_CORRECTION` is the
 * one that produces no transition at all, and saying so is the point: an Admin
 * who expected it to take something down would otherwise assume it had.
 */
export const ACTION_RESULTS: Record<Action, string> = {
  HIDE_OFFERING: `${LIFECYCLE.PUBLISHED} durumu ${LIFECYCLE.HIDDEN} olur.`,
  REINSTATE_USER: "Askıya alınmış hesap yeniden etkinleşir.",
  REQUEST_CORRECTION:
    "Hiçbir durum değişmez. İşletmeden bir şeyi düzeltmesi istenir ve vaka açık kalır.",
  RESTORE_BUSINESS: `${MODERATION.RESTRICTED} durumu "${MODERATION.UNRESTRICTED}" olur.`,
  RESTORE_OFFERING: `${LIFECYCLE.HIDDEN} durumu ${LIFECYCLE.PUBLISHED} olur.`,
  RESTRICT_BUSINESS: `"${MODERATION.UNRESTRICTED}" durumu ${MODERATION.RESTRICTED} olur.`,
  SUSPEND_USER: "Etkin hesap askıya alınır."
};

/**
 * Where each action is performed.
 *
 * Seven actions on seven routes, each owned by the Story that defines its
 * consequence — so this file addresses them and defines none. The Dashboard is
 * where they are *asked for*; what they mean happens elsewhere, which is the
 * whole of §7.4.
 */
export function actionPath(
  action: Action,
  target: {
    businessId: string | null;
    offeringId: string | null;
    userId: string | null;
  }
): string | null {
  if (action === "HIDE_OFFERING" && target.offeringId !== null)
    return `/admin/offerings/${target.offeringId}/concealment`;
  if (action === "RESTORE_OFFERING" && target.offeringId !== null)
    return `/admin/offerings/${target.offeringId}/restoration`;
  if (action === "RESTRICT_BUSINESS" && target.businessId !== null)
    return `/admin/businesses/${target.businessId}/restriction`;
  if (action === "RESTORE_BUSINESS" && target.businessId !== null)
    return `/admin/businesses/${target.businessId}/restoration`;
  if (action === "SUSPEND_USER" && target.userId !== null)
    return `/admin/user-accounts/${target.userId}/suspension`;
  if (action === "REINSTATE_USER" && target.userId !== null)
    return `/admin/user-accounts/${target.userId}/reinstatement`;
  if (action === "REQUEST_CORRECTION" && target.businessId !== null)
    return `/admin/businesses/${target.businessId}/correction-requests`;
  return null;
}

export const TARGET_LABELS: Record<TargetType, string> = {
  BUSINESS: TERMS.business,
  OFFERING: TERMS.offering,
  USER_ACCOUNT: `${TERMS.user} hesabı`
};

/**
 * The four things a correction may target (§7.2).
 *
 * User Account correction is absent, and not because it is filtered out: the
 * contract has no such value, so a correction aimed at an account is not a
 * request this application can make.
 */
export const CORRECTION_TARGET_LABELS = {
  AFFILIATE_DESTINATION_CONFIGURATION: `${TERMS.affiliateDestination} ayarları`,
  BUSINESS_INFORMATION: `${TERMS.business} bilgileri`,
  DIRECT_CONTACT_INFORMATION: "Doğrudan iletişim bilgileri",
  OFFERING_CONTENT: `${TERMS.offering} içeriği`
} as const;

export const CONTENT_AREA_LABELS = {
  ATTRIBUTES: `${TERMS.attribute}ler`,
  SUMMARY: "Özet",
  TITLE: "Başlık"
} as const;

/**
 * What closure requires, said before it is attempted.
 *
 * `US-PLT-F02-001` AC-7 makes closure conditional on evidence, and
 * `US-PLT-F06-001` AC-10 adds a re-review where the owner has answered. Both
 * are enforced in the database, so this sentence changes nothing — it just
 * stops the refusal being the first time an Admin hears about the rule.
 */
export const CLOSURE_NEEDS_EVIDENCE =
  "Bir vaka yalnızca uygulanmış bir eylemden ya da kayda geçmiş bir işlem-yapılmadı kararından sonra kapanır.";
export const CLOSURE_NEEDS_RE_REVIEW = `${TERMS.business} bu düzeltmeye yanıt verdi. Kapatmadan önce yeniden inceleme kaydedin.`;

/// §7.5. Closing creates no target state — worth saying, because an Admin who
/// believed otherwise would close cases expecting something to happen.
export const CLOSURE_CHANGES_NOTHING = `Kapatmak ${TERMS.offering}, ${TERMS.business} ya da hesap hakkında hiçbir şeyi değiştirmez.`;

/// §8. The owner's bounded response keeps the case open and requires an Admin
/// to look again. It is not an eighth action.
export const RE_REVIEW_REQUIRED_NOTICE = `${TERMS.business} sınırlı düzeltme yolunu kullandı. Vaka hâlâ açık ve yeniden inceleme gerekiyor.`;

export const MODERATION_REFUSALS: Record<string, string> = {
  ADMIN_TARGET_FORBIDDEN: `Bu hesap ${TERMS.admin} yetkisi taşıyor. Askıya almak ya da geri getirmek, bu uygulamanın dışında alınan bir Ürün Sahibi kararıdır.`,
  BUSINESS_MODERATION_UNAVAILABLE: `O ${TERMS.business}, bu eylemin başlayabileceği bir durumda değil. Hiçbir şey değişmedi.`,
  CASE_NOT_RESOLVED:
    "Bu vakada uygulanmış bir eylem ve kayda geçmiş bir işlem-yapılmadı kararı yok, bu yüzden açık kalıyor.",
  CASE_NOT_RE_REVIEWED: `${TERMS.business} son incelemeden sonra yanıt verdi. Kapatmadan önce yeniden inceleme kaydedin.`,
  OFFERING_MODERATION_UNAVAILABLE: `O ${TERMS.offering}, bu eylemin başlayabileceği bir durumda değil. Hiçbir şey değişmedi.`,
  ACCESS_MODERATION_UNAVAILABLE:
    "O hesap, bu eylemin başlayabileceği bir durumda değil. Hiçbir şey değişmedi.",
  MODERATION_CASE_NOT_FOUND: "O vaka artık mevcut değil.",
  USER_ACCOUNT_NOT_FOUND: "Bu tanımlayıcıya uyan bir hesap yok."
};

/**
 * What a refused action says.
 *
 * Every sentence ends by saying nothing changed, because §15 requires a failed
 * action not to claim a transition — and the most convincing way to not claim
 * one is to say plainly that none happened.
 */
export function moderationRefusal(code: string): string {
  return (
    MODERATION_REFUSALS[code] ??
    "Bu yapılamadı. Bu hedefle ilgili hiçbir şey değişmedi."
  );
}

/// §14. An empty queue is a state worth naming.
export const NO_CASES = "Bu filtreye uyan vaka yok.";
