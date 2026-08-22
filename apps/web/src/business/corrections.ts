import type { CorrectionNotice } from "@commerce/contracts";

type Target = CorrectionNotice["target"];
type ManagementArea = NonNullable<CorrectionNotice["managementArea"]>;
type ContentArea = NonNullable<CorrectionNotice["contentArea"]>;

/**
 * What each notice is about, in the words of the thing it names.
 *
 * A total mapping of the contract's own vocabulary, so a target added upstream
 * breaks this file rather than appearing on screen unlabelled. The sentences
 * describe the subject and never the consequence — a notice changes no state
 * by itself (§12), and copy that said "your listing has been taken down" would
 * be describing a restriction this notice did not perform.
 */
export const TARGET_COPY: Record<Target, string> = {
  AFFILIATE_DESTINATION_CONFIGURATION:
    "Bir yönlendirme adresiyle ilgili dikkatinizi gerektiren bir şey var.",
  BUSINESS_INFORMATION:
    "İşletme bilgilerinizle ilgili dikkatinizi gerektiren bir şey var.",
  DIRECT_CONTACT_INFORMATION:
    "Doğrudan iletişim bilgilerinizle ilgili dikkatinizi gerektiren bir şey var.",
  OFFERING_CONTENT: "Bir ilanla ilgili dikkatinizi gerektiren bir şey var."
};

/// What the targeted part of an Offering is called, matching the edit form's
/// own labels so the notice and the field it points at read the same.
export const CONTENT_AREA_COPY: Record<ContentArea, string> = {
  ATTRIBUTES: "Nitelikler",
  SUMMARY: "Özet",
  TITLE: "Başlık"
};

/// What the link into a management area says.
export const AREA_COPY: Record<ManagementArea, string> = {
  AFFILIATE_DESTINATION: "Yönlendirme adresini aç",
  BUSINESS_INFORMATION: "İşletme bilgilerini aç",
  OFFERING_CONTENT: "İlanı aç"
};

/**
 * Where a notice opens.
 *
 * `null` where the API said `managementArea` is `null`, which is `US-BUS-F07-
 * 001` AC-4 answering a live question: the owner is not authorized for that
 * area right now. The notice still says what it is about — it simply has
 * nowhere to send them, and offering a link that would refuse them on arrival
 * would be worse than offering none.
 *
 * The bounded correction-edit path gets its own address, because it is not the
 * ordinary Offering screen with fewer fields — it is a different permission,
 * conferred by the correction, and naming the correction is the only way to
 * ask for it (§11).
 */
export function noticeEntry(
  businessId: string,
  notice: CorrectionNotice
): { href: string; label: string } | null {
  const area = notice.managementArea;
  if (area === null) return null;
  const label = AREA_COPY[area];
  if (notice.boundedEditAvailable)
    return {
      href: `/businesses/${businessId}/corrections/${notice.id}`,
      label
    };
  if (area === "BUSINESS_INFORMATION")
    return { href: `/businesses/${businessId}/information`, label };
  // An Offering-shaped area with no Offering names nothing to open. The
  // database refuses that combination, so this is a shape the notice cannot
  // have — and an entry is still not invented for it.
  if (notice.offeringId === null) return null;
  if (area === "AFFILIATE_DESTINATION")
    return {
      href: `/businesses/${businessId}/offerings/${notice.offeringId}/destination`,
      label
    };
  return {
    href: `/businesses/${businessId}/offerings/${notice.offeringId}`,
    label
  };
}

/**
 * What the notice says about where the case stands.
 *
 * `reReviewRequired` is stated plainly because §11 is explicit that an owner
 * edit closes nothing: someone who fixed what was asked and heard nothing back
 * would reasonably assume it was over. Saying so is not a promise about when —
 * the notice has no such fact to offer, and inventing one would be worse than
 * the silence it replaces.
 */
export const RE_REVIEW_COPY =
  "Bu değişikliği yapmak vakayı kapatmaz. Platform yeniden inceler.";

/// UX-0005 §14. There is no inbox, no conversation and no substitute for one,
/// so an absence of notices is said in one sentence and nothing is offered.
export const NO_NOTICES = "Düzeltme bildiriminiz yok.";

/**
 * What a refused correction save says.
 *
 * A third map, for the same reason there was a second: these refusals arrive
 * inside a path that exists only because a notice granted it, and every one of
 * them is really the same sentence — the permission this screen is standing on
 * is narrower than the request that just arrived, or is gone.
 *
 * `BOUNDED_CORRECTION_UNAVAILABLE` deliberately does not list PRD-0005
 * §8.3.1's five conditions. The person did not choose to enter this path
 * through a rule they can recite; they followed a notice, and if the path has
 * closed the useful thing to tell them is to go back and look at the notice
 * again.
 */
export const CORRECTION_REFUSALS: Record<string, string> = {
  ATTRIBUTE_VALUE_MISMATCH:
    "Değerlerden biri ait olduğu niteliğe uymuyor. Hiçbir şey kaydedilmedi.",
  BOUNDED_CORRECTION_UNAVAILABLE:
    "Bu düzeltme artık buradan yanıtlanamıyor. Geri dönüp bildirimi yeniden açın.",
  CORRECTION_AREA_NOT_TARGETED:
    "Bu bildirim ilanın tek bir bölümünü soruyor ve burada yalnızca o bölüm değiştirilebilir.",
  CORRECTION_NOT_FOUND:
    "Bu düzeltme artık kullanılamıyor. Geri dönüp bildirimi yeniden açın.",
  PUBLICATION_MINIMUM_NOT_SATISFIED:
    "Bu değişiklik kaydedilmedi: ilanı yayında kalmak için gerekenlerin altında bırakırdı."
};

export function correctionRefusalMessage(code: string): string {
  return (
    CORRECTION_REFUSALS[code] ??
    "Bu kaydedilemedi. İlan hâlâ önceki içeriğini taşıyor."
  );
}
