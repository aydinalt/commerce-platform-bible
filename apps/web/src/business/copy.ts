import { TERMS } from "../vocabulary";

/**
 * What UX-0005's five surfaces say, beyond the vocabulary each already owns.
 *
 * Most of this area's copy was already centralised — `inventory.ts`,
 * `destination.ts`, `corrections.ts`, `information.ts` and `action-outcome.ts`
 * each own the words for the thing they model, and those were translated in
 * place. This module holds only what was left inline in the pages: headings,
 * empty states and the sentences that wrap a link.
 *
 * Splitting it that way is deliberate. A refusal message belongs beside the
 * refusal codes it maps from, so that a code added upstream breaks the file
 * that has to answer for it. Only the page furniture belongs here.
 */

/** The Dashboard itself (UX-0005 §6). */
export const DASHBOARD = {
  emptyInventory: `Henüz ${TERMS.offering.toLocaleLowerCase("tr")}ınız yok.`,
  informationLink: `${TERMS.business} bilgileri`,
  informationTitle: `${TERMS.business} bilgileri`,
  offeringsHeading: `${TERMS.offering}larınız`,
  /**
   * The two regions that degrade in place (I24).
   *
   * UX-0006 §15 keeps a failed read from blocking what is available, so these
   * say what could not be read instead of the page saying nothing — the
   * notices region rendering nothing tells a person with a notice waiting that
   * they have none, and a vanished Create control reads as a withdrawn
   * permission rather than a temporary failure.
   */
  categoriesUnreadable: `${TERMS.category}ler şu anda okunamadı, bu yüzden yeni ${TERMS.offering.toLocaleLowerCase("tr")} oluşturma geçici olarak kullanılamıyor.`,
  noticesUnreadable: `${TERMS.correctionNotice}leriniz şu anda okunamadı. Bekleyen bir bildiriminiz olup olmadığını görmek için sayfayı yenileyin.`,
  /**
   * The consequence, which the badge beside it cannot carry.
   *
   * UX-0005 §16 requires a restriction to be explained without colour alone, so
   * the badge holds the word and this holds what it means for the person. And
   * it says *some* actions rather than implying all of them: a Restricted
   * Business still manages its information and still edits the exact Offering a
   * correction names.
   */
  restrictedExplained: `Bu ${TERMS.business.toLocaleLowerCase("tr")} kısıtlı. Bazı yönetim işlemleri şu anda kullanılamıyor.`,
  title: `${TERMS.business} panosu`,
  unrestrictedExplained: `Bu ${TERMS.business.toLocaleLowerCase("tr")} üzerinde kısıtlama yok.`
} as const;

/**
 * Inventory groups and the one thing an empty group says.
 *
 * `Burada bir şey yok.` rather than `Boş`: the group still exists and the
 * person has not done anything wrong, and a one-word label reads like an error
 * state where a sentence reads like an answer.
 */
export const INVENTORY = {
  emptyGroup: "Burada bir şey yok.",
  groups: {
    ARCHIVED: "Arşivlenmiş",
    DRAFT: "Taslak",
    HIDDEN: "Gizli",
    PUBLISHED: "Yayında"
  }
} as const;

/** Creating a Draft (UX-0005 §14). */
export const CREATE = {
  address: "Adres",
  category: TERMS.category,
  heading: `${TERMS.offering} oluştur`,
  submit: "Oluştur",
  title: "Başlık"
} as const;

/** Business information (UX-0005 §7). */
export const INFORMATION = {
  backTo: (business: string) => `${business} panosuna dön`,
  contactHeading: "Doğrudan iletişim",
  identityHeading: "Herkese açık kimlik",
  saved: `${TERMS.business} bilgileriniz kaydedildi.`,
  submit: "Kaydet"
} as const;

/** Editing an Offering's content (UX-0005 §9). */
export const CONTENT = {
  attributesHeading: "Nitelikler",
  heading: `${TERMS.offering} içeriği`,
  noSummary: "Özet yok.",
  saved: "Kaydedildi.",
  submit: "Kaydet"
} as const;

/** The Affiliate Destination screen (UX-0005 §10). */
export const DESTINATION = {
  address: "Adres",
  checked: "Kontrol",
  handoff: "Yönlendirme",
  none: `Bu ${TERMS.offering.toLocaleLowerCase("tr")}ın yönlendirme adresi yok.`,
  saved: "Kaydedildi. Karar yeniden platformundur.",
  status: "Durum",
  submit: "Kaydet"
} as const;

/** Answering a correction notice (UX-0005 §12). */
export const CORRECTION = {
  backToBusiness: `${TERMS.business} panosuna dön`,
  heading: TERMS.correctionNotice,
  noticesHeading: `${TERMS.correctionNotice}leri`,
  saved: "Kaydedildi. Vaka açık kalır ve platform yeniden inceler.",
  submit: "Kaydet"
} as const;
