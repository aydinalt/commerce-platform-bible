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
  /**
   * One address per line.
   *
   * A textarea rather than a repeating row of inputs, because the order is the
   * thing being edited and reordering lines is something every person already
   * knows how to do. The first line is the primary visual, and the hint says so
   * — a rule a person cannot see is a rule they will break.
   */
  visualsHint: `Her satıra bir adres. İlk satır, ${TERMS.offering.toLocaleLowerCase("tr")}ın kapak görselidir.`,
  visualsLabel: "Görsel adresleri",
  heading: `${TERMS.offering} içeriği`,
  noSummary: "Özet yok.",
  saved: "Kaydedildi.",
  submit: "Kaydet"
} as const;

/**
 * Price, stock and product key (PRD-0001 v4.0 §5.10, §5.12).
 *
 * The three Kinds are named as three answers rather than as one answer and two
 * failures. **"Sorulduğunda belirlenir" is not a missing price** — it is what a
 * service costs before anyone has said what they want — and putting it beside
 * "Bilinmiyor" in the same list is how a person is told they are different.
 *
 * §5.10.2: no Kind blocks publication, so none of these fields is marked
 * required and the form says nothing about a price being needed.
 */
export const PRICING = {
  amountLabel: "Tutar",
  currencyLabel: "Para birimi",
  /**
   * What the currency box starts at when the Offering has no price yet.
   *
   * **A convenience of this form, not a rule of the platform.** PRD-0001 v4.0
   * §5.10.3 names a currency and deliberately names no set of them, so the
   * contract checks the shape and nothing anywhere decides that this site is
   * a one-currency site. A person may type over it.
   *
   * Named here rather than written inline because a three-letter code sitting
   * in a JSX expression reads as untranslated English to `i27`'s detector —
   * and the detector is right to be suspicious. Widening it a seventh time to
   * admit an exception would cost more than naming the value.
   */
  defaultCurrency: "TRY",
  deliveryCostHint:
    "Boş bırakılırsa belirtilmemiş sayılır; 0 ücretsiz demektir.",
  deliveryCostLabel: "Teslimat ücreti",
  heading: "Fiyat",
  kindLabel: "Fiyat türü",
  kinds: {
    FIXED: "Belirli bir tutar",
    ON_REQUEST: "Sorulduğunda belirlenir",
    UNKNOWN: "Bilinmiyor"
  },
  priorAmountHint:
    "Yalnızca güncel tutardan yüksekse indirim olarak gösterilir.",
  priorAmountLabel: "Önceki tutar",
  productKeyHint: `Aynı anahtarı taşıyan ${TERMS.offering.toLocaleLowerCase("tr")}lar tek ürün olarak birlikte gösterilir.`,
  productKeyLabel: "Ürün anahtarı",
  stockLabel: "Stok durumu",
  stocks: {
    IN_STOCK: "Stokta var",
    OUT_OF_STOCK: "Stokta yok",
    UNKNOWN: "Bilinmiyor"
  }
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
