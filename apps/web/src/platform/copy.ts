import { CONTEXTS, LIFECYCLE, MODERATION, TERMS } from "../vocabulary";

/**
 * What the Admin surfaces say (UX-0006).
 *
 * Third and last of the Turkish consolidation. The words that describe a
 * *thing* already live beside it — `moderation.ts` owns what the seven actions
 * are called, `catalog.ts` what a refused change means, `destinations.ts` what
 * a workload category is, `panel.ts` what a Panel function is. Those were
 * translated in place. This file holds only what was left inline in the pages:
 * headings, empty states, field labels and the sentences that wrap a figure.
 *
 * **Everything composes from `vocabulary.ts` rather than repeating a term.**
 * The Admin surfaces name more Frozen concepts than any other area — Offering,
 * Business, Category, Attribute, Domain, moderation case, Affiliate
 * Destination, and both lifecycle and moderation status — so this is where a
 * second vocabulary would be easiest to start by accident.
 */

/** The Panel itself (§5, §6). */
export const PANEL = {
  actions: "Burada yapabilecekleriniz",
  analyticsPeriod: "Analitik dönemi",
  /**
   * A count and a noun, composed rather than written twice.
   *
   * The queue links used to read `{n} moderation cases need action`, which is
   * a sentence with a number wedged into it — the shape that makes a message
   * catalogue hard later, because the count and the plural rule travel
   * together. Turkish helps here: the noun does not inflect after a numeral,
   * so `3 moderasyon vakası` is correct where English needs two forms.
   */
  casesWaiting: (count: number) =>
    `${count} ${TERMS.moderationCase.toLocaleLowerCase("tr")} eylem bekliyor`,
  destinationsWaiting: (count: number) =>
    `${count} ${TERMS.affiliateDestination.toLocaleLowerCase("tr")} bekliyor`,
  signOut: "Oturumu kapat",
  title: "Platform yönetimi"
} as const;

/** Core Analytics (§12). */
export const ANALYTICS = {
  byDomain: `${TERMS.domain}a göre`,
  businesses: `${TERMS.business}ler`,
  cases: `${TERMS.moderationCase}ları, duruma göre`,
  destinationStatus: `${TERMS.affiliateDestination}leri, duruma göre`,
  destinationValidation: `${TERMS.affiliateDestination}leri, denetim sonucuna göre`,
  eligibility: `${TERMS.offering}lar, devir uygunluğuna göre`,
  heading: "İnsanlar ne yaptı",
  indicator: "Gösterge",
  lifecycle: `${TERMS.offering}lar, yaşam döngüsüne göre`,
  /** §12.4 forbids calling a Completion a sale, a lead or a conversion. */
  nothingRecorded: "Kayda geçen bir şey yok.",
  openByTarget: "Açık vakalar, hedefe göre",
  overall: "Genel",
  publicEligibility: `${TERMS.offering}lar, kamusal görünürlüğe göre`,
  userAccounts: `${TERMS.user} hesapları`
} as const;

/**
 * What a tally key is called on screen.
 *
 * **The Analytics tables rendered the raw contract keys.** An Admin looking at
 * the platform's own numbers read `UNRESTRICTED`, `PUBLISHED`,
 * `NOT_VALIDATED` and `USER_ACCOUNT` — English enum identifiers, in a
 * screaming case no interface uses, on the one screen that is supposed to say
 * how the platform is doing. Three earlier increments walked past it because
 * the strings are not literals in the JSX: they arrive as data, so no reading
 * of the source shows them.
 *
 * **The fallback is the raw key, deliberately.** These tallies are
 * `Record<string, number>` on the wire rather than a union, so a total mapping
 * cannot be type-checked into existence and a value added upstream would
 * otherwise render as nothing at all. An untranslated key is visibly wrong and
 * gets fixed; a blank row is invisible and does not.
 */
const TALLY_LABELS: Record<string, string> = {
  ...LIFECYCLE,
  ...MODERATION,
  /*
   * **The three Domain names used to be spread in here**, and they are gone with
   * the closed set — PRD-0001 v4.0 §E, `DOMAIN_SET_OPEN_DECISION.md`.
   *
   * `tallyLabel` falls back to the key, and for analytics that is not a
   * degradation but the right answer: these tallies group historical
   * occurrences by `stable_key`, which is stable precisely so a Domain renamed
   * last month does not split its own history. Everywhere a person reads a
   * Domain as a thing rather than as a bucket, the name travels from the record.
   */
  BUSINESS: TERMS.business,
  CLOSED: "Kapalı",
  DISABLED: "Kapalı durumda",
  ELIGIBLE: "Uygun",
  ENABLED: "Etkin",
  INELIGIBLE: "Uygun değil",
  INVALID: "Geçersiz",
  NOT_VALIDATED: "Denetlenmedi",
  OFFERING: TERMS.offering,
  OPEN: "Açık",
  PENDING: "Henüz belirlenmedi",
  SUSPENDED: "Askıda",
  USER_ACCOUNT: `${TERMS.user} hesabı`,
  VALID: "Geçerli",
  WITHDRAWN: "Görünümden çıkarıldı"
};

export function tallyLabel(key: string): string {
  return TALLY_LABELS[key] ?? key;
}

/** The moderation case queue and one case (§7). */
export const CASES = {
  caseTitle: TERMS.moderationCase,
  closed: "Kapalı",
  closedAt: (at: string) => `${at} tarihinde kapatıldı`,
  closeThis: "Bu vakayı kapat",
  closing: "Kapatılıyor…",
  decisionsRecorded: (count: number) => `${count} karar kaydedildi.`,
  noAction:
    "Bu hedefe şu anda uygulanabilecek bir Genel Moderasyon eylemi yok.",
  noActionRecorded: (reason: string) => `İşlem yapılmadı: ${reason}`,
  nothingRecorded: "Henüz bir şey yok.",
  nothingRecordedYet: "Henüz bir şey kaydedilmedi.",
  open: "Açık",
  opened: "Açılış",
  openedAt: "açılış",
  recorded: "Kaydedilenler",
  statusFilter: "Vaka durumu",
  title: `${TERMS.moderationCase}ları`,
  unreadable: "Vakalar yüklenemedi.",
  what: "Yapabilecekleriniz",
  working: "İşleniyor…"
} as const;

/** The forms attached to a case (§7.2, §7.3, §8). */
export const CASE_FORMS = {
  correctionArea: `${TERMS.offering}in hangi bölümü`,
  correctionNotSpecific: "Belirli bir bölüm değil",
  correctionTarget: "Ne düzeltilmeli",
  correctionText: "Onlara ne söylenecek",
  noActionReason: "Neden",
  noActionTitle: "Yapılacak bir şey olmadığına karar ver",
  note: "Not (isteğe bağlı)",
  reReview: "Yeniden inceleme kaydet"
} as const;

/** Affiliate Destination administration (§9). */
export const DESTINATIONS = {
  business: TERMS.business,
  invalidReason: "Adreste ne yanlış",
  note: "Not (isteğe bağlı)",
  title: `${TERMS.affiliateDestination}leri`,
  unreadable: "İş yükü yüklenemedi.",
  working: "İşleniyor…"
} as const;

/**
 * Category management (§10).
 *
 * `Adres` for the public address and `Kalıcı anahtar` for the stable key. Two
 * different identifiers that an Admin sets on the same form, and calling both
 * *anahtar* would make the one that can change indistinguishable from the one
 * that cannot.
 */
export const CATEGORIES = {
  address: "Adres",
  create: `${TERMS.category} oluştur`,
  domain: `${TERMS.domain} (yalnızca kökler)`,
  move: "Taşı",
  name: "Ad",
  newName: "Yeni ad",
  newParent: "Yeni üst kayıt",
  noParent: "Hiçbiri — bu bir kök",
  noParentMove: "Hiçbiri — kök yap",
  parent: "Şunun altında",
  rename: "Yeniden adlandır",
  retire: "Kaldır",
  retiring: "Kaldırılıyor…",
  stableKey: "Kalıcı anahtar",
  title: `${TERMS.category}ler`,
  unreadable: "Katalog yüklenemedi."
} as const;

/** Attribute management (§11). */
export const ATTRIBUTES = {
  addOption: "İzinli değer ekle",
  appliesTo: "Şunlara uygulanır",
  comparable: "Karşılaştırmada görünür",
  define: `${TERMS.attribute} tanımla`,
  filterable: "Üzerinden filtrelenebilir",
  label: "Etiket",
  name: "Ad",
  options: "İzinli değerler (yalnızca listeden seçmeli türler)",
  properties: "Özellikler",
  required: "Yayın için zorunlu",
  requiredExplained: `Yayına alınabilmesi için bir ${TERMS.offering}in burada değeri olmalı`,
  retire: (label: string) => `${label} niteliğini kaldır`,
  retiring: "Kaldırılıyor…",
  stableKey: "Kalıcı anahtar",
  title: `${TERMS.attribute} tanımları`,
  unit: "Birim",
  unitOnlyNumber: "Birim (yalnızca sayı)",
  unreadable: "Katalog yüklenemedi.",
  value: "Değer",
  valueKind: "Değerin türü"
} as const;

/**
 * The two statuses an Admin reads on a target, borrowed rather than restated.
 *
 * Exported from here so an Admin page never reaches past the copy layer into
 * `vocabulary.ts` for a word the Business Dashboard is already showing — one
 * import, one spelling, and a rename in one place.
 */
export const STATUS = { ...LIFECYCLE, ...MODERATION } as const;

export { CONTEXTS };
