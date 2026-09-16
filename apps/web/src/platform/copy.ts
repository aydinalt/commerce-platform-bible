import { CONTEXTS, LIFECYCLE, MODERATION, TERMS } from "../vocabulary";
import { WORKLOAD_HEADINGS } from "./destinations";

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
  /**
   * §12.3's Affiliate workload indicator (I81).
   *
   * It was computed and never shown. `/admin` summed the three categories into
   * one number for the queue link, so the split an Admin actually works by —
   * what is ready, what is unchecked, what is waiting on somebody else — was
   * the one part of the tally nobody could see.
   */
  destinationWorkload: `${TERMS.affiliateDestination}leri, iş yüküne göre`,
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
  /*
   * The workload categories keep their words in `destinations.ts`, which owns
   * what a workload category *is*. Copying them here would be the second
   * definition, and the two would drift the first time one was reworded.
   */
  if (key in WORKLOAD_HEADINGS)
    return WORKLOAD_HEADINGS[key as keyof typeof WORKLOAD_HEADINGS];
  return TALLY_LABELS[key] ?? key;
}

/** The moderation case queue and one case (§7). */
export const CASES = {
  caseTitle: TERMS.moderationCase,
  closed: "Kapalı",
  /**
   * The words after a formatted date, rather than a sentence built around a raw
   * one (I81). This used to take the ISO string and interpolate it, so the
   * page read `2026-09-03T14:22:11.000Z tarihinde kapatıldı`. Splitting the
   * suffix off lets the date go through `<When>` like every other date.
   */
  closedSuffix: "tarihinde kapatıldı",
  closeThis: "Bu vakayı kapat",
  /** Opening a case from beside its target (I82). */
  openAgainst: (target: string) => `Hedef: ${target}`,
  openCancel: "Vazgeç",
  openConfirm: "Vakayı aç",
  openFor: (kind: string) =>
    `${kind} için ${TERMS.moderationCase.toLocaleLowerCase("tr")} aç`,
  openNote:
    "Vaka açmak hedefin durumunu değiştirmez. Ne yapılacağına vakanın içinde karar verirsiniz. Bu hedefin zaten açık bir vakası varsa yenisi açılmaz, o vakaya gidersiniz.",
  openRefused:
    "Vaka açılamadı. Hedef kaldırılmış ya da yetkiniz değişmiş olabilir.",
  /** The PII reveal (I82). */
  emailReveal: "E-postayı göster",
  emailRevealing: "Gösteriliyor…",
  emailUnavailable: "Bu vaka için bir e-posta adresi yok ya da okunamadı.",
  emailNote:
    "Bu adres yalnızca sizin isteğinizle getirildi; kuyruklarda ve listelerde gösterilmez.",
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
/**
 * A retired Category, Attribute or Select value (I81).
 *
 * **Three surfaces were printing `(retired)`** — the only English left in an
 * otherwise wholly Turkish panel, and invisible to the I27 consolidation
 * detectors because it lives inside a JSX expression rather than between tags.
 * One word, in one place, so a fourth surface cannot invent a fifth spelling.
 */
export const RETIRED = "(emekli)";

export const STATUS = { ...LIFECYCLE, ...MODERATION } as const;

export { CONTEXTS };

/**
 * The queue of reader reports (I69).
 *
 * The labels are the reader's own words as the product page offered them, not a
 * translation of the enum: an Admin reading the queue and a person filling the
 * form must be looking at the same five sentences, or the queue is a summary of
 * something nobody said.
 */
export const REPORTS = {
  accept: "Haklı — işlem gerekiyor",
  accepted: "İşlem gerekiyor",
  alreadyReviewed: "Bu bildirimi başka biri bu arada kapatmış.",
  dismiss: "Bir sorun yok",
  dismissed: "Kapatıldı",
  listing: "İlan",
  listingNumber: "İlan no",
  none: "Bekleyen bildirim yok.",
  open: "Bekleyen",
  reasons: {
    LINK_BROKEN: "Bağlantı çalışmıyor",
    MISLEADING_INFORMATION: "Ürün bilgileri yanıltıcı",
    PRICE_WRONG: "Fiyat yanlış",
    STOCK_WRONG: "Stok bilgisi yanlış",
    WRONG_CATEGORY: "Yanlış kategoride"
  },
  sameListing: (count: number) => `Bu ilan için ${count} açık bildirim var`,
  statusFilter: "Duruma göre",
  submitted: "Bildirim",
  title: "İlan bildirimleri",
  unreadable: "Bildirimler şu anda okunamadı.",
  /**
   * Said when the API's page does not hold the whole queue (I81).
   *
   * "Oldest" rather than "first", because that is what the list actually is and
   * it is the fact that makes the truncation harmless: work these and the next
   * ones take their place.
   */
  showingOldest: (count: number) => `en eski ${count} tanesi gösteriliyor`,
  waiting: (count: number) => `${count} ilan bildirimi bekliyor`
} as const;

/**
 * The complementary-product placements an Admin manages (I70).
 *
 * "Reklam" in the labels, because that is what the public block is labelled and
 * an Admin surface that called it something softer would be describing a
 * different thing from the one people see.
 */
export const PLACEMENTS = {
  add: "Yerleşim ekle",
  address: "Yönlendirme adresi",
  category: "Bölüm",
  categoryHint: "Bu bölümdeki tüm ilanlarda görünür",
  deactivate: "Yayından kaldır",
  inactive: "Yayında değil",
  label: "Ürün adı",
  none: "Henüz tamamlayıcı ürün yerleşimi yok.",
  note: "Açıklama (isteğe bağlı)",
  partner: "Partner",
  position: "Sıra",
  refused: "Yerleşim kaydedilemedi. Bölüm kimliğini ve adresi kontrol edin.",
  /**
   * Said when the master switch is off (I81).
   *
   * §20.4's switch covers this region too and defaults to off, so placements
   * can be configured here and serve nothing. Without this line the page gives
   * an Admin no way to find that out — the switch is on another screen, behind
   * a feature flag.
   */
  masterSwitchOff:
    "Reklam ana anahtarı kapalı. Buradaki yerleşimler kaydedilir ama ana anahtar açılana kadar hiçbiri yayınlanmaz.",
  title: "Tamamlayıcı ürün reklamları",
  unreadable: "Yerleşimler şu anda okunamadı."
} as const;

/**
 * The advertising placement settings an Admin works in (I75).
 *
 * Said plainly, because a master switch is read in an emergency by somebody who
 * has not seen the screen before. "Reklamlar açık" is a state, not a setting
 * name, and the sentence beside it says what turning it off actually does —
 * including that it stops the platform's own complementary block, which is the
 * part nobody would guess.
 *
 * Nothing here names an impression, a click or a revenue figure, because
 * PRD-0006 §20.5 excludes all four and the platform records none of them. A
 * label promising a number that does not exist would be the first step towards
 * somebody building it.
 */
export const ADVERTISING = {
  category: "Bölüm",
  categoryHint: "Bu bölüm ve altındaki tüm bölümler reklamsız kalır",
  enabled: "Reklamlar açık",
  enabledHint:
    "Kapatıldığında dış reklam birimleri ve sitenin kendi tamamlayıcı ürün blokları dahil hiçbir reklam görünmez.",
  exclude: "Bölümü reklamsız yap",
  exclusionsNone: "Reklamsız bırakılan bölüm yok.",
  exclusionsTitle: "Reklamsız bölümler",
  include: "Reklamları geri aç",
  publisher: "Yayıncı kimliği",
  publisherHint: "Boş bırakılırsa hiçbir yerde dış reklam gösterilmez.",
  refused: "Ayarlar kaydedilemedi. Alanları kontrol edin.",
  save: "Ayarları kaydet",
  title: "Reklam yerleşim ayarları",
  unitCategory: "Bölüm sayfası birim kimliği",
  unitPresentation: "İlan sayfası birim kimliği",
  unitResults: "Arama sonuçları birim kimliği",
  unitsHint:
    "Birim kimliği girilmeyen bölge boş kalır; bu bir hata değil, bir tercihtir.",
  unitsTitle: "Bölgeler",
  unreadable: "Reklam ayarları şu anda okunamadı.",
  /** The label; the moment itself goes through `<When>` beside it. */
  updated: "Son değişiklik:"
} as const;

/**
 * The partner catalogues an Admin manages (I76).
 *
 * The failure sentences are written for somebody who did not build this. "Feed
 * okunamadı" says nothing anybody can act on; the message the run recorded says
 * whether the partner's server refused, the document is malformed, or the
 * mapping names a field that is not there — and those are three different jobs
 * for three different people.
 */
export const FEEDS = {
  active: "Çalışıyor",
  add: "Feed ekle",
  address: "Feed adresi",
  business: "Partner (işletme kimliği)",
  category: "Bölüm kimliği",
  categoryHint: "Bu feed'in tüm ürünleri bu bölüme yazılır",
  /**
   * What one run did, in the vocabulary the feed now has (I88).
   *
   * "Yeni" is gone because the intake no longer creates listings; "atlandı"
   * takes its place, and it is the number an Admin reads first on a feed that
   * looks idle — a run that skips everything is a feed whose products are not
   * in the catalogue, which is a matching problem and not a fault.
   */
  counts: (input: {
    read: number;
    rejected: number;
    skipped: number;
    updated: number;
  }) =>
    `${input.read} kayıt okundu · ${input.updated} fiyat/stok güncellendi · ${input.skipped} atlandı · ${input.rejected} alınamadı`,
  deactivate: "Duraklat",
  /**
   * What kind of failure it was (I91).
   *
   * The message says what happened, in the words the run recorded — often the
   * partner's server's own. This says whose job it is, which is the thing an
   * Admin decides in the first two seconds: their engineer, their publisher, or
   * my mapping.
   */
  failureKind: {
    DOCUMENT_UNREADABLE: "Belge okunamadı (biçim hatası)",
    MAPPING_INCOMPLETE: "Alan eşlemesi bu belgeye uymuyor",
    SOURCE_UNREACHABLE: "Partnerin sunucusuna ulaşılamadı",
    /* Named rather than hidden: an unexplained failure that says nothing is
       worse than one that says it does not know. */
    UNCLASSIFIED: "Sınıflandırılamayan hata"
  } as Record<string, string>,
  failed: "Başarısız",
  format: "Biçim",
  inactive: "Duraklatıldı",
  itemPath: "Ürün yolu (isteğe bağlı)",
  itemPathHint: "Boş bırakılırsa belgedeki ürün listesi kendiliğinden bulunur",
  listings: (count: number) => `${count} ilan`,
  mapping: "Alan eşlemesi",
  mappingHint:
    "Partnerin belgesindeki alan adları. Kimlik ve başlık zorunlu, diğerleri isteğe bağlı.",
  missing: (count: number) =>
    `${count} ürün artık belgede yok — hiçbir şey yapılmadı`,
  name: "Feed adı",
  never: "Henüz çalışmadı",
  none: "Henüz partner feed'i yok.",
  paused: "Duraklatılmış feed okunmaz. İlanları olduğu gibi kalır.",
  refused: "Feed kaydedilemedi. İşletme, bölüm ve adresi kontrol edin.",
  rejectionsTitle: "Alınamayan kayıtlar",
  runsTitle: "Senkronizasyon geçmişi",
  succeeded: "Başarılı",
  title: "Partner feed'leri",
  unreadable: "Feed'ler şu anda okunamadı.",
  /**
   * The dashboard line. A count rather than a link when nothing is wrong,
   * because "0 feed hatası" is a sentence somebody can stop reading — and a
   * link that always looks the same stops being read at all.
   */
  failuresWaiting: (count: number) => `${count} feed senkronizasyonu başarısız`,
  noFailures: "Feed senkronizasyonlarında hata yok.",
  /** I78. What the Owner's 72-hour rule did on the last run. */
  restored: (count: number) => `${count} ürün feed'e geri döndü, yayına alındı`,
  withdrawn: (count: number) =>
    `${count} ürün 72 saattir feed'de yok, yayından çekildi`
} as const;

/**
 * The Affiliate Handoff Rate (I78, `PRD-0006-platform.md` v2.5 §11.6).
 *
 * **"Oran yok" is not "%0", and the copy has to carry that.** An ilan nobody
 * has opened has no rate; showing `%0` would say "nobody chose this" where the
 * truth is "nobody has looked". The two are opposite conclusions from the same
 * figure, and a dashboard that blurs them misleads for years.
 */
export const HANDOFF_RATE = {
  handoffs: "Yönlendirme",
  noRate: "Oran yok — henüz görüntülenmedi",
  opens: "Görüntülenme",
  overall: (input: { handoffs: number; opens: number }) =>
    `${input.handoffs} yönlendirme / ${input.opens} görüntülenme`,
  rate: (value: number) =>
    `%${(value * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`,
  title: "Affiliate yönlendirme oranı",
  topTitle: "En çok görüntülenen ilanlar"
} as const;

/**
 * The overview dashboard (I79).
 *
 * The Owner asked for a SmartHR-styled panel whose metric cards and CTR report
 * are read at a glance. **Every string here labels a figure that already
 * exists** — `/admin/analytics` computed all of them before this surface was
 * written, and nothing on this page fetches anything the old panel did not.
 * That is the constraint that keeps a dashboard from becoming a second, quieter
 * definition of what the platform counts.
 *
 * The words for a *thing* still come from `vocabulary.ts`. A card that said
 * "Ürünler" while every other surface said "İlan" would be a second vocabulary
 * begun in the one place people look first.
 */
export const OVERVIEW = {
  /** Said instead of a figure, never as a figure. UX-0006 §14. */
  cardUnavailable: "Okunamadı",
  cases: TERMS.moderationCase,
  casesOpen: "Açık vaka",
  /**
   * A card's secondary line: what the number is *of*, when the heading alone
   * would be ambiguous.
   */
  ofTotal: (total: number) => `Toplam ${total}`,
  destinations: TERMS.affiliateDestination,
  eligible: "Yayında",
  /**
   * The empty state for the CTR bars.
   *
   * Deliberately not "0 görüntülenme": no listing having been opened yet and
   * the figure being unavailable are different facts, and §11.6.3 turns on
   * keeping them apart.
   */
  noEngagement: "Henüz görüntülenme kaydedilmedi",
  businesses: TERMS.business,
  listings: `${TERMS.offering} sayısı`,
  /** The bar chart beside the handoff table. */
  engagementTitle: "Görüntülenme ve yönlendirme",
  engagementNote:
    "Çubuklar görüntülenmeye göre sıralanır, orana göre değil: iki kez görüntülenip bir kez yönlendirilen bir ilan %50 oranındadır ve bu kimseye bir şey anlatmaz.",
  metricsTitle: "Özet göstergeler",
  queuesTitle: "Bekleyen işler",
  title: "Genel bakış",
  /** The link back to the surface this one does not replace. */
  fullPanel: "Ayrıntılı yönetim paneli",
  /** The template's per-card footer link (I82). */
  viewAll: "Tümünü gör",
  viewQueue: "Kuyruğu aç",
  breadcrumbRoot: "Yönetim"
} as const;

/**
 * The register of User Accounts (I83).
 *
 * **There is no column for an email address and no string here that names one.**
 * The Owner's PII rule of 2026-09-04 keeps addresses out of operational lists;
 * this surface is the largest such list on the platform, so it is where the
 * rule matters most and where a later "just show the email, it's easier"
 * would do the most damage.
 */
export const ACCOUNTS = {
  admin: "Yönetici",
  /** Said in place of an alias, because the platform holds none. */
  aliasAbsent: "—",
  aliasColumn: "Rumuz",
  businesses: `${TERMS.business} sayısı`,
  none: "Bu filtreye uyan hesap yok.",
  /**
   * The reason an Admin-authorized account carries no Suspend control, said
   * where the control would have been rather than left as an absence somebody
   * has to infer.
   */
  protectedNote:
    "Yönetici yetkisi olan hesabın erişimi bu ekrandan değiştirilemez.",
  registered: "Kayıt",
  reviews: "Yorum sayısı",
  showingNewest: (count: number) => `en yeni ${count} tanesi gösteriliyor`,
  statusColumn: "Durum",
  statusFilter: "Hesap durumu",
  statuses: {
    ENABLED: "Aktif",
    PENDING_VERIFICATION: "Doğrulama bekliyor",
    SUSPENDED: "Askıda"
  },
  title: "Kullanıcı hesapları",
  total: (count: number) => `${count} hesap`,
  unreadable: "Hesaplar okunamadı.",
  userColumn: "Hesap"
} as const;

/**
 * The Admin audit trail, read (I84).
 *
 * The action names are the platform's own vocabulary translated once, here.
 * They are the same nine values the database enum holds, so a row cannot be
 * described by a word the trail does not record.
 */
export const AUDIT = {
  actions: {
    CASE_OPEN: `${TERMS.moderationCase} açıldı`,
    CREATE_EDITORIAL_REVIEW: "Editöryel inceleme oluşturuldu",
    DISABLE_DESTINATION: "Yönlendirme kapatıldı",
    ENABLE_DESTINATION: "Yönlendirme açıldı",
    PUBLISH_EDITORIAL_REVIEW: "Editöryel inceleme yayımlandı",
    RECHECK_EDITORIAL_REVIEW: "Editöryel inceleme yeniden denetlendi",
    REVISE_EDITORIAL_REVIEW: "Editöryel inceleme revize edildi",
    WITHDRAW_EDITORIAL_REVIEW: "Editöryel inceleme geri çekildi",
    HIDE_OFFERING: `${TERMS.offering} gizlendi`,
    PII_VIEW: "E-posta adresi görüntülendi",
    REINSTATE_USER: "Hesap geri alındı",
    REQUEST_CORRECTION: "Düzeltme istendi",
    RESTORE_BUSINESS: `${TERMS.business} kısıtlaması kaldırıldı`,
    RESTORE_OFFERING: `${TERMS.offering} yeniden yayınlandı`,
    RESTRICT_BUSINESS: `${TERMS.business} kısıtlandı`,
    REVIEW_DESTINATION: "Yönlendirme incelendi",
    SUSPEND_USER: "Hesap askıya alındı",
    /*
     * Read as outcomes rather than as one act, because that is what they are:
     * the second is the line that explains a handoff which never went live.
     */
    VALIDATE_DESTINATION_INVALID: "Yönlendirme geçersiz bulundu",
    VALIDATE_DESTINATION_VALID: "Yönlendirme geçerli bulundu"
  },
  actionColumn: "İşlem",
  actorColumn: "Yapan",
  actorFilter: "Yapan hesap kimliği",
  allActions: "Tüm işlemler",
  apply: "Uygula",
  caseColumn: TERMS.moderationCase,
  /** The default window, said so a reader knows what they are looking at. */
  defaultWindow: "Son 30 gün gösteriliyor.",
  exportCsv: "CSV olarak indir",
  /**
   * Said beside the export when the file would be truncated. An export that
   * silently stops is worse than no export: it looks complete.
   */
  exportPartial: (limit: number) =>
    `Dışa aktarma en fazla ${limit.toLocaleString("tr-TR")} satır içerir. Daha dar bir tarih aralığı seçin.`,
  from: "Başlangıç",
  next: "Sonraki",
  none: "Bu filtreye uyan kayıt yok.",
  previous: "Önceki",
  /**
   * The retention note. Deliberately explicit, because the trail is the one
   * table on this platform that is never swept.
   */
  retention:
    "Denetim kayıtları silinmez; veritabanı düzeyinde değiştirilemez ve kaldırılamaz.",
  showing: (from: number, to: number, total: number) =>
    `${total.toLocaleString("tr-TR")} kayıttan ${from.toLocaleString("tr-TR")}–${to.toLocaleString("tr-TR")} arası`,
  targetColumn: "Hedef",
  title: "Denetim izi",
  to: "Bitiş",
  unreadable: "Denetim kayıtları okunamadı.",
  whenColumn: "Zaman"
} as const;

/**
 * Writing an editorial review (I94, `EDT F02`, `UX-0006` **Frozen v1.2** §12C).
 *
 * **The words a writer reads are the words the criteria use**, and in two
 * places that costs a longer label than a designer would choose. "Yeniden
 * kontrol edildi" is a sentence rather than a verb because AC-10 makes the
 * re-check a statement the writer makes, not a state the system infers — and a
 * button reading "Güncelle" beside a save button reading "Kaydet" would invite
 * exactly the confusion §13.4 separates the two acts to prevent.
 *
 * There is no word here for deleting, and none for sponsorship, because there
 * is no control for either (§12C.12).
 */
export const EDITORIAL = {
  /** §12C.5. Whose judgement this is offered as — typed, never inferred. */
  byline: "İmza",
  bylineHelp:
    "İncelemenin altında görünecek ad. Oturum açan hesaptan alınmaz; ne yazarsanız o görünür.",
  cons: "Eksileri",
  /**
   * The rule stated where it is met, not only where it is enforced. A writer
   * who learns at publication that a review needs a con has already written
   * the whole thing.
   */
  consHelp:
    "Her satıra bir madde. Yayımlamak için en az bir tane gerekir: eksisi olmayan bir inceleme reklamdır.",
  create: "Yeni inceleme yaz",
  created: "Oluşturuldu",
  /** §12C.3. The column AC-17 requires. */
  lastChecked: "Son kontrol",
  listUnreadable:
    "Editöryel incelemeler okunamadı. Bu, inceleme olmadığı anlamına gelmez — okuma başarısız oldu.",
  /** §12C.3, and the claim it refuses to make. */
  neverChecked: "Hiç yeniden kontrol edilmedi",
  none: "Henüz editöryel inceleme yazılmadı.",
  notFound: "Bu ürün anahtarı için editöryel inceleme yok.",
  /**
   * The scale, in words, in the phrasing the crowd's score already uses
   * (I95). `ProductRatingSummary` reads "5 üzerinden 4,3"; this reads "10
   * üzerinden 8,4".
   *
   * **It exists so that `US-EDT-F01-001` AC-6 does not rest on a slash.** The
   * two scores appear on one screen and answer different questions, and a
   * reader who sees `8,4 / 10` beside `★★★★☆ 4,3` has to work out that the
   * denominators differ. Spelled out, there is nothing to work out.
   */
  outOfTen: (score: string) => `10 üzerinden ${score}`,
  preview: "Önizleme",
  /**
   * §12C.7. Said plainly because the alternative reading — that this is a
   * public link — is the one that would break AC-5.
   */
  previewNote:
    "Okuyucunun göreceği hâli. Kayıtlı taslaktan üretilir ve yalnızca bu ekranda görünür; yayımlanmamış bir incelemenin okunabileceği bir adres yoktur.",
  pros: "Artıları",
  prosHelp: "Her satıra bir madde. Yayımlamak için en az bir tane gerekir.",
  productKey: "Ürün anahtarı",
  productKeyHelp:
    "İncelemenin hakkında olduğu ürünün anahtarı. Kataloğun taşıdığı bir anahtar olmalıdır.",
  publish: "Yayımla",
  /**
   * AC-12 and AC-8 in one sentence. The first tells a writer what publication
   * requires before they meet the refusal; the second says what re-publishing a
   * withdrawn review does *not* do, which is the part nobody expects.
   */
  publishHelp:
    "Hüküm, puan, en az bir bölüm, en az bir artı, en az bir eksi ve imza gerekir. İlk yayım tarihi bir kez konur: geri çekilmiş bir incelemeyi yeniden yayımlamak o tarihi değiştirmez.",
  published: "Yayımlandı",
  recheck: "Yeniden kontrol edildi olarak işaretle",
  /**
   * AC-9 and AC-10 in one sentence, placed beside the control rather than in a
   * help page, because this is the moment the distinction matters.
   */
  recheckHelp:
    "Yalnızca son kontrol tarihini bugüne taşır. Metni değiştirmez; kaydetmek bu tarihi taşımaz.",
  score: "Puan",
  scoreHelp: "0 ile 10 arasında, tek ondalık.",
  sectionBody: "Bölüm metni",
  sectionHeading: "Bölüm başlığı",
  sections: "Bölümler",
  /**
   * Why one empty slot rather than a control that adds them. A page that
   * re-reads after every save hands back a fresh slot, so the simplest thing
   * that works needs no client state to survive a refused save.
   */
  sectionsHelp:
    "Başlığı ve metni boş bırakılan bölüm kaydedilmez. Her kayıttan sonra yeni bir boş bölüm açılır.",
  since: (age: string) => `${age} önce`,
  status: "Durum",
  statuses: {
    DRAFT: "Taslak",
    PUBLISHED: "Yayımda",
    WITHDRAWN: "Geri çekildi"
  },
  title: "Editöryel incelemeler",
  unreadable: "Bu editöryel inceleme okunamadı.",
  verdict: "Hüküm",
  verdictHelp: "İncelemenin tek cümlelik sonucu.",
  withdraw: "Geri çek",
  /**
   * §12C.10. Withdrawal is the act that stops presentation, and the sentence
   * says what survives — because "geri çek" is a word a person can reasonably
   * read as "sil", and the two would be very different acts.
   */
  withdrawHelp:
    "İnceleme hiçbir ilanda gösterilmez. Silinmez: var olduğu ve kimin geri çektiği kayıtlı kalır, ve yeniden yayımlanabilir.",
  edit: "İncelemeyi düzenle"
} as const;
